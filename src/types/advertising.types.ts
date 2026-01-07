export type AdCampaignType = 'featured_placement' | 'search_boost' | 'area_dominance' | 'push_notification';

export type AdCampaignStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled';

export type PromotionType = 'first_time' | 'referral' | 'happy_hour' | 'bundle' | 'flash_sale' | 'custom';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface AdCampaign {
  id: string;
  barberId: string;
  campaignType: AdCampaignType;
  status: AdCampaignStatus;
  dailyBudgetCents: number | null;
  totalBudgetCents: number | null;
  spentCents: number;
  targetAreaCenter: { latitude: number; longitude: number } | null;
  targetAreaRadiusKm: number | null;
  targetNeighborhoods: string[];
  startDate: string | null;
  endDate: string | null;
  slotPosition: number | null;
  pricePadDayCents: number | null;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdImpression {
  id: string;
  campaignId: string;
  viewerId: string | null;
  impressionType: 'view' | 'click' | 'booking';
  costCents: number;
  createdAt: string;
}

export interface BarberPromotion {
  id: string;
  barberId: string;
  title: string;
  description: string | null;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minBookingValueCents: number | null;
  applicableServices: string[] | null;
  promoCode: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedSlot {
  id: string;
  slotPosition: number;
  barberId: string | null;
  campaignId: string | null;
  areaCode: string | null;
  startTime: string;
  endTime: string;
  pricePaidCents: number;
  createdAt: string;
}

export interface BarberWallet {
  id: string;
  barberId: string;
  balanceCents: number;
  totalDepositedCents: number;
  totalSpentCents: number;
  autoReplenish: boolean;
  autoReplenishAmountCents: number | null;
  autoReplenishThresholdCents: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  transactionType: 'deposit' | 'ad_spend' | 'refund' | 'bonus';
  amountCents: number;
  balanceAfterCents: number;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface CampaignStats {
  impressions: number;
  clicks: number;
  bookings: number;
  spent: number;
  ctr: number;
  conversionRate: number;
  costPerBooking: number;
}

export const AD_CAMPAIGN_TYPE_INFO: Record<AdCampaignType, { 
  label: string; 
  labelHe: string; 
  description: string;
  icon: string;
  basePrice: number;
}> = {
  featured_placement: {
    label: 'Featured Placement',
    labelHe: 'מיקום מומלץ',
    description: 'Appear in the top carousel on the home screen',
    icon: 'star',
    basePrice: 5000,
  },
  search_boost: {
    label: 'Search Boost',
    labelHe: 'חיזוק בחיפוש',
    description: 'Appear higher in search results',
    icon: 'trending-up',
    basePrice: 2000,
  },
  area_dominance: {
    label: 'Area Dominance',
    labelHe: 'שליטה באזור',
    description: 'Be the exclusive featured barber in your neighborhood',
    icon: 'map-pin',
    basePrice: 15000,
  },
  push_notification: {
    label: 'Push Notifications',
    labelHe: 'התראות פוש',
    description: 'Send promotional notifications to nearby customers',
    icon: 'bell',
    basePrice: 1000,
  },
};

export const PROMOTION_TYPE_INFO: Record<PromotionType, { label: string; labelHe: string; icon: string }> = {
  first_time: { label: 'First Time Customer', labelHe: 'לקוח חדש', icon: 'user-plus' },
  referral: { label: 'Referral Bonus', labelHe: 'בונוס הפניה', icon: 'users' },
  happy_hour: { label: 'Happy Hour', labelHe: 'שעה שמחה', icon: 'clock' },
  bundle: { label: 'Bundle Deal', labelHe: 'חבילה', icon: 'package' },
  flash_sale: { label: 'Flash Sale', labelHe: 'מבצע בזק', icon: 'zap' },
  custom: { label: 'Custom', labelHe: 'מותאם אישית', icon: 'edit' },
};
