export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused';

export type TransactionType = 'payment' | 'refund' | 'tip' | 'earning' | 'payout' | 'bonus' | 'referral';

export interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  barberId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  checkoutId?: string;
  checkoutUrl?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: string;
  planName: string;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  relatedId?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  barberId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankDetails: BankDetails;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  branchNumber: string;
  accountHolderName: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  platformFeeRate: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
  expiresAt: string;
  amount: number;
  currency: string;
  status: 'open' | 'complete' | 'expired';
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface TipPayment {
  bookingId: string;
  barberId: string;
  customerId: string;
  amount: number;
  message?: string;
}
