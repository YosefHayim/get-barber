export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'referral';

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  currentTier: LoyaltyTier;
  totalPoints: number;
  availablePoints: number;
  lifetimeBookings: number;
  lifetimeSpendCents: number;
  tierUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  accountId: string;
  transactionType: LoyaltyTransactionType;
  points: number;
  balanceAfter: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  referrerRewardPoints: number | null;
  refereeRewardPoints: number | null;
  referrerRewardedAt: string | null;
  refereeRewardedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  usesCount: number;
  maxUses: number | null;
  isActive: boolean;
  createdAt: string;
}

export const LOYALTY_TIER_INFO: Record<LoyaltyTier, {
  label: string;
  labelHe: string;
  color: string;
  icon: string;
  minBookings: number;
  minSpendCents: number;
  pointsMultiplier: number;
  benefits: string[];
}> = {
  bronze: {
    label: 'Bronze',
    labelHe: 'ארד',
    color: '#CD7F32',
    icon: 'award',
    minBookings: 0,
    minSpendCents: 0,
    pointsMultiplier: 1,
    benefits: ['Earn 1 point per ₪10 spent', 'Access to member promotions'],
  },
  silver: {
    label: 'Silver',
    labelHe: 'כסף',
    color: '#C0C0C0',
    icon: 'award',
    minBookings: 10,
    minSpendCents: 200000,
    pointsMultiplier: 1.25,
    benefits: ['Earn 1.25x points', '5% off all bookings', 'Priority support'],
  },
  gold: {
    label: 'Gold',
    labelHe: 'זהב',
    color: '#DAA520',
    icon: 'award',
    minBookings: 25,
    minSpendCents: 500000,
    pointsMultiplier: 1.5,
    benefits: ['Earn 1.5x points', '10% off all bookings', 'Priority booking', 'Free cancellation'],
  },
  platinum: {
    label: 'Platinum',
    labelHe: 'פלטינה',
    color: '#E5E4E2',
    icon: 'crown',
    minBookings: 50,
    minSpendCents: 1000000,
    pointsMultiplier: 2,
    benefits: ['Earn 2x points', '15% off all bookings', 'VIP support', 'Exclusive offers', 'Free premium services'],
  },
};

export const POINTS_CONFIG = {
  pointsPerShekel: 1,
  pointsPerReview: 50,
  pointsPerReferral: 200,
  refereeBonus: 100,
  redemptionRate: 10,
};
