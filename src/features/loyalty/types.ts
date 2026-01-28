// Loyalty & Referral Program Types

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type PointTransactionType =
  | 'earned_booking'
  | 'earned_referral'
  | 'earned_review'
  | 'earned_bonus'
  | 'redeemed'
  | 'expired'
  | 'adjusted';

export type RewardType =
  | 'discount_percentage'
  | 'discount_fixed'
  | 'free_service'
  | 'free_addon'
  | 'priority_booking'
  | 'exclusive_access';

export interface LoyaltyProfile {
  id: string;
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  tierProgress: number; // Percentage to next tier
  pointsToNextTier: number;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  referralEarnings: number;
  streakDays: number;
  lastBookingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: PointTransactionType;
  points: number; // Positive for earned, negative for redeemed/expired
  balance: number; // Balance after transaction
  description: string;
  referenceId?: string; // Booking ID, referral ID, etc.
  expiresAt?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  value: number; // Percentage or fixed amount
  pointsCost: number;
  minTier?: LoyaltyTier;
  imageUrl?: string;
  isAvailable: boolean;
  stock?: number; // Limited rewards
  expiresAt?: string;
  termsAndConditions?: string;
}

export interface RedeemedReward {
  id: string;
  userId: string;
  rewardId: string;
  reward: Reward;
  code: string;
  status: 'active' | 'used' | 'expired';
  usedAt?: string;
  usedOnBookingId?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserAvatar?: string;
  status: 'pending' | 'completed' | 'expired';
  pointsEarned: number;
  bonusEarned?: number;
  completedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface TierBenefits {
  tier: LoyaltyTier;
  name: string;
  minPoints: number;
  benefits: string[];
  pointsMultiplier: number;
  referralBonus: number;
  exclusiveRewards: boolean;
  prioritySupport: boolean;
  freeServicesPerMonth?: number;
}

export const TIER_CONFIG: TierBenefits[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points'],
    pointsMultiplier: 1,
    referralBonus: 100,
    exclusiveRewards: false,
    prioritySupport: false,
  },
  {
    tier: 'silver',
    name: 'Silver',
    minPoints: 500,
    benefits: [
      'Earn 1.25 points per $1 spent',
      'Birthday bonus points',
      '5% off all services',
    ],
    pointsMultiplier: 1.25,
    referralBonus: 150,
    exclusiveRewards: false,
    prioritySupport: false,
  },
  {
    tier: 'gold',
    name: 'Gold',
    minPoints: 1500,
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Birthday bonus points',
      '10% off all services',
      'Free beard trim monthly',
    ],
    pointsMultiplier: 1.5,
    referralBonus: 200,
    exclusiveRewards: true,
    prioritySupport: false,
    freeServicesPerMonth: 1,
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    minPoints: 3500,
    benefits: [
      'Earn 2 points per $1 spent',
      'Double birthday bonus',
      '15% off all services',
      'Free beard trim monthly',
      'Priority booking',
    ],
    pointsMultiplier: 2,
    referralBonus: 300,
    exclusiveRewards: true,
    prioritySupport: true,
    freeServicesPerMonth: 1,
  },
  {
    tier: 'diamond',
    name: 'Diamond',
    minPoints: 7500,
    benefits: [
      'Earn 2.5 points per $1 spent',
      'Triple birthday bonus',
      '20% off all services',
      'Free premium service monthly',
      'Priority booking',
      'Exclusive events access',
    ],
    pointsMultiplier: 2.5,
    referralBonus: 500,
    exclusiveRewards: true,
    prioritySupport: true,
    freeServicesPerMonth: 2,
  },
];

export interface ReferralInvite {
  code: string;
  link: string;
  message: string;
  bonusForReferrer: number;
  bonusForReferred: number;
}

export interface LoyaltyStats {
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  rewardsRedeemed: number;
  referralsMade: number;
  currentStreak: number;
  longestStreak: number;
}
