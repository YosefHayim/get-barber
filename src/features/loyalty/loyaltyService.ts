import { supabase } from '@/lib/supabase';
import type {
  LoyaltyProfile,
  PointTransaction,
  Reward,
  RedeemedReward,
  Referral,
  ReferralInvite,
  LoyaltyStats,
  LoyaltyTier,
  TIER_CONFIG,
} from './types';

// Generate a unique referral code
function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return `REF${random}`;
}

// Determine tier based on lifetime points
function determineTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 7500) return 'diamond';
  if (lifetimePoints >= 3500) return 'platinum';
  if (lifetimePoints >= 1500) return 'gold';
  if (lifetimePoints >= 500) return 'silver';
  return 'bronze';
}

// Calculate tier progress
function calculateTierProgress(
  lifetimePoints: number
): { progress: number; pointsToNext: number } {
  const tiers = [
    { tier: 'bronze', min: 0 },
    { tier: 'silver', min: 500 },
    { tier: 'gold', min: 1500 },
    { tier: 'platinum', min: 3500 },
    { tier: 'diamond', min: 7500 },
  ];

  for (let i = 0; i < tiers.length - 1; i++) {
    const current = tiers[i];
    const next = tiers[i + 1];
    if (lifetimePoints >= current.min && lifetimePoints < next.min) {
      const range = next.min - current.min;
      const progress = lifetimePoints - current.min;
      return {
        progress: Math.round((progress / range) * 100),
        pointsToNext: next.min - lifetimePoints,
      };
    }
  }

  // Already at max tier
  return { progress: 100, pointsToNext: 0 };
}

// Get or create loyalty profile
export async function getLoyaltyProfile(userId: string): Promise<LoyaltyProfile> {
  const { data, error } = await supabase
    .from('loyalty_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create one
    const referralCode = generateReferralCode(userId);
    const { data: newProfile, error: createError } = await supabase
      .from('loyalty_profiles')
      .insert({
        user_id: userId,
        current_points: 0,
        lifetime_points: 0,
        tier: 'bronze',
        referral_code: referralCode,
        total_referrals: 0,
        successful_referrals: 0,
        referral_earnings: 0,
        streak_days: 0,
      })
      .select()
      .single();

    if (createError) throw createError;
    return mapProfileFromDb(newProfile);
  }

  if (error) throw error;
  return mapProfileFromDb(data);
}

function mapProfileFromDb(data: any): LoyaltyProfile {
  const { progress, pointsToNext } = calculateTierProgress(data.lifetime_points);
  return {
    id: data.id,
    userId: data.user_id,
    currentPoints: data.current_points,
    lifetimePoints: data.lifetime_points,
    tier: data.tier,
    tierProgress: progress,
    pointsToNextTier: pointsToNext,
    referralCode: data.referral_code,
    totalReferrals: data.total_referrals,
    successfulReferrals: data.successful_referrals,
    referralEarnings: data.referral_earnings,
    streakDays: data.streak_days,
    lastBookingDate: data.last_booking_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Add points
export async function addPoints(
  userId: string,
  points: number,
  type: string,
  description: string,
  referenceId?: string
): Promise<PointTransaction> {
  // Get current profile
  const profile = await getLoyaltyProfile(userId);

  // Calculate new balances
  const newCurrentPoints = profile.currentPoints + points;
  const newLifetimePoints = profile.lifetimePoints + points;
  const newTier = determineTier(newLifetimePoints);

  // Create transaction
  const { data: transaction, error: txError } = await supabase
    .from('point_transactions')
    .insert({
      user_id: userId,
      type,
      points,
      balance: newCurrentPoints,
      description,
      reference_id: referenceId,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    })
    .select()
    .single();

  if (txError) throw txError;

  // Update profile
  const { error: updateError } = await supabase
    .from('loyalty_profiles')
    .update({
      current_points: newCurrentPoints,
      lifetime_points: newLifetimePoints,
      tier: newTier,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return {
    id: transaction.id,
    userId: transaction.user_id,
    type: transaction.type,
    points: transaction.points,
    balance: transaction.balance,
    description: transaction.description,
    referenceId: transaction.reference_id,
    expiresAt: transaction.expires_at,
    createdAt: transaction.created_at,
  };
}

// Deduct points
export async function deductPoints(
  userId: string,
  points: number,
  description: string,
  referenceId?: string
): Promise<PointTransaction> {
  const profile = await getLoyaltyProfile(userId);

  if (profile.currentPoints < points) {
    throw new Error('Insufficient points');
  }

  const newBalance = profile.currentPoints - points;

  const { data: transaction, error: txError } = await supabase
    .from('point_transactions')
    .insert({
      user_id: userId,
      type: 'redeemed',
      points: -points,
      balance: newBalance,
      description,
      reference_id: referenceId,
    })
    .select()
    .single();

  if (txError) throw txError;

  const { error: updateError } = await supabase
    .from('loyalty_profiles')
    .update({
      current_points: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return {
    id: transaction.id,
    userId: transaction.user_id,
    type: transaction.type,
    points: transaction.points,
    balance: transaction.balance,
    description: transaction.description,
    referenceId: transaction.reference_id,
    createdAt: transaction.created_at,
  };
}

// Get point transactions
export async function getPointTransactions(
  userId: string,
  limit: number = 20
): Promise<PointTransaction[]> {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    type: t.type,
    points: t.points,
    balance: t.balance,
    description: t.description,
    referenceId: t.reference_id,
    expiresAt: t.expires_at,
    createdAt: t.created_at,
  }));
}

// Get available rewards
export async function getAvailableRewards(tier?: LoyaltyTier): Promise<Reward[]> {
  let query = supabase
    .from('rewards')
    .select('*')
    .eq('is_available', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  const { data, error } = await query.order('points_cost', { ascending: true });

  if (error) throw error;

  return (data || [])
    .filter((r) => {
      if (!tier || !r.min_tier) return true;
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      return tierOrder.indexOf(tier) >= tierOrder.indexOf(r.min_tier);
    })
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      type: r.type,
      value: r.value,
      pointsCost: r.points_cost,
      minTier: r.min_tier,
      imageUrl: r.image_url,
      isAvailable: r.is_available,
      stock: r.stock,
      expiresAt: r.expires_at,
      termsAndConditions: r.terms_and_conditions,
    }));
}

// Redeem reward
export async function redeemReward(
  userId: string,
  rewardId: string
): Promise<RedeemedReward> {
  // Get reward
  const { data: reward, error: rewardError } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .single();

  if (rewardError) throw rewardError;

  // Check availability
  if (!reward.is_available) {
    throw new Error('Reward is not available');
  }

  if (reward.stock !== null && reward.stock <= 0) {
    throw new Error('Reward is out of stock');
  }

  // Get profile and check points
  const profile = await getLoyaltyProfile(userId);
  if (profile.currentPoints < reward.points_cost) {
    throw new Error('Insufficient points');
  }

  // Check tier requirement
  if (reward.min_tier) {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    if (tierOrder.indexOf(profile.tier) < tierOrder.indexOf(reward.min_tier)) {
      throw new Error(`This reward requires ${reward.min_tier} tier or higher`);
    }
  }

  // Generate redemption code
  const code = `RWD${Date.now().toString(36).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  // Create redeemed reward
  const { data: redeemed, error: redeemError } = await supabase
    .from('redeemed_rewards')
    .insert({
      user_id: userId,
      reward_id: rewardId,
      code,
      status: 'active',
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (redeemError) throw redeemError;

  // Deduct points
  await deductPoints(userId, reward.points_cost, `Redeemed: ${reward.name}`, redeemed.id);

  // Update stock if applicable
  if (reward.stock !== null) {
    await supabase
      .from('rewards')
      .update({ stock: reward.stock - 1 })
      .eq('id', rewardId);
  }

  return {
    id: redeemed.id,
    userId: redeemed.user_id,
    rewardId: redeemed.reward_id,
    reward: {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      value: reward.value,
      pointsCost: reward.points_cost,
      minTier: reward.min_tier,
      imageUrl: reward.image_url,
      isAvailable: reward.is_available,
    },
    code: redeemed.code,
    status: redeemed.status,
    expiresAt: redeemed.expires_at,
    createdAt: redeemed.created_at,
  };
}

// Get user's redeemed rewards
export async function getRedeemedRewards(userId: string): Promise<RedeemedReward[]> {
  const { data, error } = await supabase
    .from('redeemed_rewards')
    .select('*, reward:rewards(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    rewardId: r.reward_id,
    reward: {
      id: r.reward.id,
      name: r.reward.name,
      description: r.reward.description,
      type: r.reward.type,
      value: r.reward.value,
      pointsCost: r.reward.points_cost,
      minTier: r.reward.min_tier,
      imageUrl: r.reward.image_url,
      isAvailable: r.reward.is_available,
    },
    code: r.code,
    status: r.status,
    usedAt: r.used_at,
    usedOnBookingId: r.used_on_booking_id,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}

// Apply redeemed reward to booking
export async function useRewardOnBooking(
  redeemedRewardId: string,
  bookingId: string
): Promise<void> {
  const { error } = await supabase
    .from('redeemed_rewards')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
      used_on_booking_id: bookingId,
    })
    .eq('id', redeemedRewardId)
    .eq('status', 'active');

  if (error) throw error;
}

// Get referral invite details
export async function getReferralInvite(userId: string): Promise<ReferralInvite> {
  const profile = await getLoyaltyProfile(userId);
  const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://getbarber.app';

  return {
    code: profile.referralCode,
    link: `${baseUrl}/invite/${profile.referralCode}`,
    message: `Join me on GetBarber! Use my code ${profile.referralCode} to get 100 bonus points on your first booking. ${baseUrl}/invite/${profile.referralCode}`,
    bonusForReferrer: 200,
    bonusForReferred: 100,
  };
}

// Process referral
export async function processReferral(
  referralCode: string,
  newUserId: string
): Promise<Referral | null> {
  // Find referrer by code
  const { data: referrer, error: findError } = await supabase
    .from('loyalty_profiles')
    .select('user_id')
    .eq('referral_code', referralCode)
    .single();

  if (findError || !referrer) {
    return null; // Invalid code
  }

  if (referrer.user_id === newUserId) {
    return null; // Can't refer yourself
  }

  // Check if already referred
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('referred_user_id', newUserId)
    .single();

  if (existing) {
    return null; // Already referred
  }

  // Create referral (pending until first booking)
  const { data: referral, error: createError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.user_id,
      referred_user_id: newUserId,
      status: 'pending',
      points_earned: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })
    .select()
    .single();

  if (createError) throw createError;

  // Give referred user welcome bonus
  await addPoints(
    newUserId,
    100,
    'earned_referral',
    'Welcome bonus from referral',
    referral.id
  );

  return {
    id: referral.id,
    referrerId: referral.referrer_id,
    referredUserId: referral.referred_user_id,
    referredUserName: '',
    status: referral.status,
    pointsEarned: referral.points_earned,
    expiresAt: referral.expires_at,
    createdAt: referral.created_at,
  };
}

// Complete referral (called after first booking)
export async function completeReferral(referredUserId: string): Promise<void> {
  // Find pending referral
  const { data: referral, error: findError } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_user_id', referredUserId)
    .eq('status', 'pending')
    .single();

  if (findError || !referral) return;

  // Get referrer's profile for bonus calculation
  const referrerProfile = await getLoyaltyProfile(referral.referrer_id);
  const tierConfig = getTierConfig(referrerProfile.tier);
  const referralBonus = tierConfig?.referralBonus || 200;

  // Give referrer bonus
  await addPoints(
    referral.referrer_id,
    referralBonus,
    'earned_referral',
    'Referral bonus - friend made first booking',
    referral.id
  );

  // Update referral status
  const { error: updateError } = await supabase
    .from('referrals')
    .update({
      status: 'completed',
      points_earned: referralBonus,
      completed_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  if (updateError) throw updateError;

  // Update referrer's stats
  await supabase
    .from('loyalty_profiles')
    .update({
      successful_referrals: referrerProfile.successfulReferrals + 1,
      referral_earnings: referrerProfile.referralEarnings + referralBonus,
    })
    .eq('user_id', referral.referrer_id);
}

// Get user's referrals
export async function getReferrals(userId: string): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*, referred:profiles!referred_user_id(display_name, avatar_url)')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.id,
    referrerId: r.referrer_id,
    referredUserId: r.referred_user_id,
    referredUserName: r.referred?.display_name || 'Unknown',
    referredUserAvatar: r.referred?.avatar_url,
    status: r.status,
    pointsEarned: r.points_earned,
    bonusEarned: r.bonus_earned,
    completedAt: r.completed_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}

// Get loyalty stats
export async function getLoyaltyStats(userId: string): Promise<LoyaltyStats> {
  const { data: transactions, error } = await supabase
    .from('point_transactions')
    .select('type, points')
    .eq('user_id', userId);

  if (error) throw error;

  const profile = await getLoyaltyProfile(userId);
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id', { count: 'exact' })
    .eq('referrer_id', userId);

  const earned = (transactions || [])
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);

  const redeemed = (transactions || [])
    .filter((t) => t.type === 'redeemed')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const { count: rewardsCount } = await supabase
    .from('redeemed_rewards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    totalPointsEarned: earned,
    totalPointsRedeemed: redeemed,
    rewardsRedeemed: rewardsCount || 0,
    referralsMade: referrals?.length || 0,
    currentStreak: profile.streakDays,
    longestStreak: profile.streakDays, // Would need separate tracking for longest
  };
}

// Helper to get tier config
function getTierConfig(tier: LoyaltyTier) {
  const tiers = [
    { tier: 'bronze', referralBonus: 100 },
    { tier: 'silver', referralBonus: 150 },
    { tier: 'gold', referralBonus: 200 },
    { tier: 'platinum', referralBonus: 300 },
    { tier: 'diamond', referralBonus: 500 },
  ];
  return tiers.find((t) => t.tier === tier);
}

// Award points for booking
export async function awardBookingPoints(
  userId: string,
  bookingAmount: number,
  bookingId: string
): Promise<PointTransaction> {
  const profile = await getLoyaltyProfile(userId);
  const tierConfig = getTierConfig(profile.tier);
  const multiplier = tierConfig ? (tierConfig.tier === 'diamond' ? 2.5 : tierConfig.tier === 'platinum' ? 2 : tierConfig.tier === 'gold' ? 1.5 : tierConfig.tier === 'silver' ? 1.25 : 1) : 1;

  const points = Math.round(bookingAmount * multiplier);

  return addPoints(
    userId,
    points,
    'earned_booking',
    `Earned from booking (${multiplier}x multiplier)`,
    bookingId
  );
}

export default {
  getLoyaltyProfile,
  addPoints,
  deductPoints,
  getPointTransactions,
  getAvailableRewards,
  redeemReward,
  getRedeemedRewards,
  useRewardOnBooking,
  getReferralInvite,
  processReferral,
  completeReferral,
  getReferrals,
  getLoyaltyStats,
  awardBookingPoints,
};
