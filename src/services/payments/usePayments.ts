import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Linking, Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  createPaymentCheckout,
  createSubscriptionCheckout,
  getWalletBalance,
  addToWallet,
  requestPayout,
  getPayoutHistory,
  getUserSubscription,
  cancelSubscription,
  processBookingPayment,
  SUBSCRIPTION_PLANS,
} from './lemonSqueezy';
import type { WalletBalance, PaymentIntent, PayoutInfo } from './lemonSqueezy';

// Hook for wallet operations
export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useQuery<WalletBalance>({
    queryKey: ['wallet', user?.id],
    queryFn: () => getWalletBalance(user!.id),
    enabled: !!user?.id,
  });

  const addFundsMutation = useMutation({
    mutationFn: (params: { amount: number; type: 'tip' | 'refund' | 'bonus' | 'referral' | 'earning'; description?: string }) =>
      addToWallet({ userId: user!.id, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
    },
  });

  return {
    balance,
    isLoading,
    error,
    refetch,
    addFunds: addFundsMutation.mutate,
    isAddingFunds: addFundsMutation.isPending,
  };
}

// Hook for subscription management
export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => getUserSubscription(user!.id),
    enabled: !!user?.id,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planType: keyof typeof SUBSCRIPTION_PLANS) => {
      const plan = SUBSCRIPTION_PLANS[planType];
      const checkout = await createSubscriptionCheckout({
        userId: user!.id,
        email: user!.email || '',
        planId: plan.id,
        planType,
      });
      return checkout;
    },
    onSuccess: async (checkout) => {
      if (checkout.checkoutUrl) {
        const supported = await Linking.canOpenURL(checkout.checkoutUrl);
        if (supported) {
          await Linking.openURL(checkout.checkoutUrl);
        }
      }
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to start subscription process. Please try again.');
      console.error('Subscription error:', error);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelSubscription(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      Alert.alert('Subscription Cancelled', 'Your subscription will remain active until the end of the current billing period.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    },
  });

  const isSubscribed = !!subscription && subscription.status === 'active';
  const isPremium = isSubscribed && subscription?.planType === 'CUSTOMER_PREMIUM';
  const isBarberPro = isSubscribed && subscription?.planType === 'BARBER_PRO';
  const isBarberBusiness = isSubscribed && subscription?.planType === 'BARBER_BUSINESS';

  return {
    subscription,
    isLoading,
    error,
    refetch,
    subscribe: subscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    cancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    isSubscribed,
    isPremium,
    isBarberPro,
    isBarberBusiness,
    plans: SUBSCRIPTION_PLANS,
  };
}

// Hook for booking payments
export function useBookingPayment() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = useCallback(
    async (params: {
      bookingId: string;
      barberId: string;
      totalAmount: number;
      depositAmount?: number;
      tipAmount?: number;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      setIsProcessing(true);
      try {
        const result = await processBookingPayment({
          ...params,
          customerId: user.id,
        });

        const checkoutUrl = result.depositCheckout?.checkoutUrl || result.fullPaymentCheckout?.checkoutUrl;

        if (checkoutUrl) {
          const supported = await Linking.canOpenURL(checkoutUrl);
          if (supported) {
            await Linking.openURL(checkoutUrl);
          }
        }

        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [user?.id]
  );

  return {
    processPayment,
    isProcessing,
  };
}

// Hook for barber payouts
export function usePayouts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: payouts,
    isLoading,
    error,
    refetch,
  } = useQuery<PayoutInfo[]>({
    queryKey: ['payouts', user?.id],
    queryFn: () => getPayoutHistory(user!.id),
    enabled: !!user?.id,
  });

  const requestPayoutMutation = useMutation({
    mutationFn: (params: {
      amount: number;
      bankDetails: {
        bankName: string;
        accountNumber: string;
        branchNumber: string;
        accountHolderName: string;
      };
    }) =>
      requestPayout({
        barberId: user!.id,
        ...params,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
      Alert.alert('Payout Requested', 'Your payout request has been submitted. It will be processed within 2-3 business days.');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to request payout. Please try again.');
    },
  });

  return {
    payouts,
    isLoading,
    error,
    refetch,
    requestPayout: requestPayoutMutation.mutate,
    isRequesting: requestPayoutMutation.isPending,
  };
}

// Hook for one-time payments (tips, etc.)
export function useOneTimePayment() {
  const { user } = useAuth();

  const createTipPayment = useCallback(
    async (params: { barberId: string; bookingId: string; amount: number; message?: string }) => {
      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }

      const checkout = await createPaymentCheckout({
        userId: user.id,
        email: user.email,
        productId: '', // Will be filled from env
        amount: params.amount,
        bookingId: params.bookingId,
        barberId: params.barberId,
        description: params.message ? `Tip: ${params.message}` : 'Tip for great service',
      });

      if (checkout.checkoutUrl) {
        const supported = await Linking.canOpenURL(checkout.checkoutUrl);
        if (supported) {
          await Linking.openURL(checkout.checkoutUrl);
        }
      }

      return checkout;
    },
    [user]
  );

  return {
    createTipPayment,
  };
}

export default {
  useWallet,
  useSubscription,
  useBookingPayment,
  usePayouts,
  useOneTimePayment,
};
