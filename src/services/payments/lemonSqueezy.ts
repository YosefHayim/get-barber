import { lemonSqueezySetup, createCheckout, getCustomer, listSubscriptions, type Checkout } from '@lemonsqueezy/lemonsqueezy.js';
import { supabase } from '@/services/supabase/client';
import * as Linking from 'expo-linking';

// Initialize Lemon Squeezy
const LEMON_SQUEEZY_API_KEY = process.env.EXPO_PUBLIC_LEMON_SQUEEZY_API_KEY || '';
const STORE_ID = process.env.EXPO_PUBLIC_LEMON_SQUEEZY_STORE_ID || '';

// Product/Variant IDs for different services
export const PRODUCTS = {
  // One-time payments
  BOOKING_DEPOSIT: process.env.EXPO_PUBLIC_LS_PRODUCT_DEPOSIT || '',
  SERVICE_PAYMENT: process.env.EXPO_PUBLIC_LS_PRODUCT_SERVICE || '',
  TIP: process.env.EXPO_PUBLIC_LS_PRODUCT_TIP || '',

  // Subscriptions
  CUSTOMER_PREMIUM: process.env.EXPO_PUBLIC_LS_PRODUCT_CUSTOMER_PREMIUM || '',
  BARBER_PRO: process.env.EXPO_PUBLIC_LS_PRODUCT_BARBER_PRO || '',
  BARBER_BUSINESS: process.env.EXPO_PUBLIC_LS_PRODUCT_BARBER_BUSINESS || '',
} as const;

// Subscription plan details
export const SUBSCRIPTION_PLANS = {
  CUSTOMER_PREMIUM: {
    id: PRODUCTS.CUSTOMER_PREMIUM,
    name: 'Premium Customer',
    price: 29.99,
    currency: 'ILS',
    interval: 'month',
    features: [
      'Unlimited bookings',
      'Priority matching',
      'No booking fees',
      'Exclusive discounts',
      'Early access to top barbers',
    ],
  },
  BARBER_PRO: {
    id: PRODUCTS.BARBER_PRO,
    name: 'Barber Pro',
    price: 49.99,
    currency: 'ILS',
    interval: 'month',
    features: [
      'Reduced platform fees (10%)',
      'Priority in search results',
      'Advanced analytics',
      'Custom booking page',
      'Up to 100 bookings/month',
    ],
  },
  BARBER_BUSINESS: {
    id: PRODUCTS.BARBER_BUSINESS,
    name: 'Barber Business',
    price: 99.99,
    currency: 'ILS',
    interval: 'month',
    features: [
      'Lowest platform fees (5%)',
      'Top search placement',
      'Team management (up to 5)',
      'White-label booking page',
      'Unlimited bookings',
      'Dedicated support',
    ],
  },
} as const;

// Initialize the SDK
export function initLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: LEMON_SQUEEZY_API_KEY,
    onError: (error) => {
      console.error('Lemon Squeezy Error:', error);
    },
  });
}

// Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  checkoutUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface PayoutInfo {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// Create a checkout session for one-time payment
export async function createPaymentCheckout(params: {
  userId: string;
  email: string;
  productId: string;
  amount: number;
  bookingId?: string;
  barberId?: string;
  description?: string;
}): Promise<PaymentIntent> {
  const { userId, email, productId, amount, bookingId, barberId, description } = params;

  const redirectUrl = Linking.createURL('payment-success');

  const { data, error } = await createCheckout(STORE_ID, productId, {
    checkoutData: {
      email,
      custom: {
        user_id: userId,
        booking_id: bookingId || '',
        barber_id: barberId || '',
      },
    },
    checkoutOptions: {
      dark: true,
      embed: false,
      media: false,
      logo: true,
    },
    productOptions: {
      name: description || 'BarberConnect Payment',
      redirectUrl,
    },
  });

  if (error) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }

  const checkout = data?.data;

  // Store payment intent in database
  const { data: paymentRecord, error: dbError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      booking_id: bookingId,
      barber_id: barberId,
      amount,
      currency: 'ILS',
      status: 'pending',
      checkout_id: checkout?.id,
      checkout_url: checkout?.attributes?.url,
      metadata: { product_id: productId, description },
    })
    .select()
    .single();

  if (dbError) {
    console.error('Failed to store payment record:', dbError);
  }

  return {
    id: checkout?.id || '',
    amount,
    currency: 'ILS',
    status: 'pending',
    checkoutUrl: checkout?.attributes?.url || '',
    customerId: userId,
    metadata: { bookingId, barberId },
  };
}

// Create subscription checkout
export async function createSubscriptionCheckout(params: {
  userId: string;
  email: string;
  planId: string;
  planType: keyof typeof SUBSCRIPTION_PLANS;
}): Promise<PaymentIntent> {
  const { userId, email, planId, planType } = params;
  const plan = SUBSCRIPTION_PLANS[planType];

  const redirectUrl = Linking.createURL('subscription-success');

  const { data, error } = await createCheckout(STORE_ID, planId, {
    checkoutData: {
      email,
      custom: {
        user_id: userId,
        plan_type: planType,
      },
    },
    checkoutOptions: {
      dark: true,
      subscriptionPreview: true,
    },
    productOptions: {
      name: plan.name,
      description: plan.features.join(', '),
      redirectUrl,
    },
  });

  if (error) {
    throw new Error(`Failed to create subscription checkout: ${error.message}`);
  }

  const checkout = data?.data;

  // Store subscription intent
  await supabase.from('subscription_intents').insert({
    user_id: userId,
    plan_type: planType,
    checkout_id: checkout?.id,
    status: 'pending',
  });

  return {
    id: checkout?.id || '',
    amount: plan.price,
    currency: plan.currency,
    status: 'pending',
    checkoutUrl: checkout?.attributes?.url || '',
    customerId: userId,
    metadata: { planType },
  };
}

// Get user's wallet balance
export async function getWalletBalance(userId: string): Promise<WalletBalance> {
  const { data, error } = await supabase
    .from('wallets')
    .select('available_balance, pending_balance, currency')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Create wallet if doesn't exist
    const { data: newWallet } = await supabase
      .from('wallets')
      .insert({ user_id: userId, available_balance: 0, pending_balance: 0, currency: 'ILS' })
      .select()
      .single();

    return {
      available: newWallet?.available_balance || 0,
      pending: newWallet?.pending_balance || 0,
      currency: 'ILS',
    };
  }

  return {
    available: data.available_balance,
    pending: data.pending_balance,
    currency: data.currency,
  };
}

// Add funds to wallet (for tips, refunds, etc.)
export async function addToWallet(params: {
  userId: string;
  amount: number;
  type: 'tip' | 'refund' | 'bonus' | 'referral' | 'earning';
  description?: string;
  relatedId?: string;
}): Promise<void> {
  const { userId, amount, type, description, relatedId } = params;

  // Add transaction record
  await supabase.from('wallet_transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
    related_id: relatedId,
    status: 'completed',
  });

  // Update wallet balance
  await supabase.rpc('increment_wallet_balance', {
    p_user_id: userId,
    p_amount: amount,
  });
}

// Withdraw from wallet (barber payouts)
export async function requestPayout(params: {
  barberId: string;
  amount: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchNumber: string;
    accountHolderName: string;
  };
}): Promise<PayoutInfo> {
  const { barberId, amount, bankDetails } = params;

  // Check balance
  const balance = await getWalletBalance(barberId);
  if (balance.available < amount) {
    throw new Error('Insufficient balance');
  }

  // Create payout request
  const { data, error } = await supabase
    .from('payouts')
    .insert({
      barber_id: barberId,
      amount,
      status: 'pending',
      bank_details: bankDetails,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create payout request');
  }

  // Deduct from available balance, add to pending
  await supabase.rpc('process_payout_request', {
    p_user_id: barberId,
    p_amount: amount,
  });

  return {
    id: data.id,
    amount: data.amount,
    status: 'pending',
    createdAt: data.created_at,
  };
}

// Get payout history
export async function getPayoutHistory(barberId: string): Promise<PayoutInfo[]> {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch payout history');
  }

  return data.map((payout) => ({
    id: payout.id,
    amount: payout.amount,
    status: payout.status,
    createdAt: payout.created_at,
    completedAt: payout.completed_at,
  }));
}

// Get user's subscription status
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    planType: data.plan_type,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
  };
}

// Cancel subscription
export async function cancelSubscription(userId: string): Promise<void> {
  await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('user_id', userId)
    .eq('status', 'active');
}

// Calculate platform fee based on subscription
export function calculatePlatformFee(amount: number, subscriptionPlan?: string): number {
  const feeRates: Record<string, number> = {
    BARBER_BUSINESS: 0.05, // 5%
    BARBER_PRO: 0.10, // 10%
    default: 0.15, // 15% for free tier
  };

  const rate = feeRates[subscriptionPlan || 'default'] || feeRates.default;
  return Math.round(amount * rate * 100) / 100;
}

// Process booking payment
export async function processBookingPayment(params: {
  bookingId: string;
  customerId: string;
  barberId: string;
  totalAmount: number;
  depositAmount?: number;
  tipAmount?: number;
}): Promise<{ depositCheckout?: PaymentIntent; fullPaymentCheckout?: PaymentIntent }> {
  const { bookingId, customerId, barberId, totalAmount, depositAmount, tipAmount } = params;

  // Get customer email
  const { data: customer } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', customerId)
    .single();

  if (!customer?.email) {
    throw new Error('Customer email not found');
  }

  const result: { depositCheckout?: PaymentIntent; fullPaymentCheckout?: PaymentIntent } = {};

  // Create deposit checkout if deposit is required
  if (depositAmount && depositAmount > 0) {
    result.depositCheckout = await createPaymentCheckout({
      userId: customerId,
      email: customer.email,
      productId: PRODUCTS.BOOKING_DEPOSIT,
      amount: depositAmount,
      bookingId,
      barberId,
      description: `Deposit for booking #${bookingId}`,
    });
  } else {
    // Full payment upfront
    result.fullPaymentCheckout = await createPaymentCheckout({
      userId: customerId,
      email: customer.email,
      productId: PRODUCTS.SERVICE_PAYMENT,
      amount: totalAmount + (tipAmount || 0),
      bookingId,
      barberId,
      description: `Payment for booking #${bookingId}`,
    });
  }

  return result;
}

export default {
  initLemonSqueezy,
  createPaymentCheckout,
  createSubscriptionCheckout,
  getWalletBalance,
  addToWallet,
  requestPayout,
  getPayoutHistory,
  getUserSubscription,
  cancelSubscription,
  calculatePlatformFee,
  processBookingPayment,
  PRODUCTS,
  SUBSCRIPTION_PLANS,
};
