import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Share } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getLoyaltyProfile,
  getPointTransactions,
  getAvailableRewards,
  redeemReward,
  getRedeemedRewards,
  getReferralInvite,
  getReferrals,
  getLoyaltyStats,
} from './loyaltyService';
import type {
  LoyaltyProfile,
  PointTransaction,
  Reward,
  RedeemedReward,
  Referral,
  ReferralInvite,
  LoyaltyStats,
} from './types';

// Main loyalty profile hook
export function useLoyaltyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<LoyaltyProfile>({
    queryKey: ['loyalty-profile', user?.id],
    queryFn: () => getLoyaltyProfile(user!.id),
    enabled: !!user?.id,
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    // Computed values
    currentPoints: profile?.currentPoints || 0,
    tier: profile?.tier || 'bronze',
    tierProgress: profile?.tierProgress || 0,
    pointsToNextTier: profile?.pointsToNextTier || 500,
  };
}

// Points history hook
export function usePointsHistory(limit: number = 20) {
  const { user } = useAuth();

  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useQuery<PointTransaction[]>({
    queryKey: ['point-transactions', user?.id, limit],
    queryFn: () => getPointTransactions(user!.id, limit),
    enabled: !!user?.id,
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    refetch,
  };
}

// Available rewards hook
export function useAvailableRewards() {
  const { profile } = useLoyaltyProfile();

  const {
    data: rewards,
    isLoading,
    error,
    refetch,
  } = useQuery<Reward[]>({
    queryKey: ['available-rewards', profile?.tier],
    queryFn: () => getAvailableRewards(profile?.tier),
    enabled: !!profile,
  });

  // Filter by affordability
  const affordableRewards = (rewards || []).filter(
    (r) => r.pointsCost <= (profile?.currentPoints || 0)
  );

  return {
    rewards: rewards || [],
    affordableRewards,
    isLoading,
    error,
    refetch,
  };
}

// Redeem reward hook
export function useRedeemReward() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => redeemReward(user!.id, rewardId),
    onSuccess: (redeemedReward) => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['point-transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['redeemed-rewards', user?.id] });
      Alert.alert(
        'Reward Redeemed!',
        `Your code is: ${redeemedReward.code}\n\nUse it on your next booking.`
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to redeem reward');
    },
  });

  return {
    redeemReward: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
    redeemedReward: redeemMutation.data,
  };
}

// Redeemed rewards hook
export function useRedeemedRewards() {
  const { user } = useAuth();

  const {
    data: rewards,
    isLoading,
    error,
    refetch,
  } = useQuery<RedeemedReward[]>({
    queryKey: ['redeemed-rewards', user?.id],
    queryFn: () => getRedeemedRewards(user!.id),
    enabled: !!user?.id,
  });

  // Separate by status
  const activeRewards = (rewards || []).filter((r) => r.status === 'active');
  const usedRewards = (rewards || []).filter((r) => r.status === 'used');
  const expiredRewards = (rewards || []).filter((r) => r.status === 'expired');

  return {
    rewards: rewards || [],
    activeRewards,
    usedRewards,
    expiredRewards,
    isLoading,
    error,
    refetch,
  };
}

// Referral hook
export function useReferral() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: invite,
    isLoading: isLoadingInvite,
    refetch: refetchInvite,
  } = useQuery<ReferralInvite>({
    queryKey: ['referral-invite', user?.id],
    queryFn: () => getReferralInvite(user!.id),
    enabled: !!user?.id,
  });

  const {
    data: referrals,
    isLoading: isLoadingReferrals,
    refetch: refetchReferrals,
  } = useQuery<Referral[]>({
    queryKey: ['referrals', user?.id],
    queryFn: () => getReferrals(user!.id),
    enabled: !!user?.id,
  });

  const shareReferral = useCallback(async () => {
    if (!invite) return;

    try {
      await Share.share({
        message: invite.message,
        title: 'Join me on GetBarber!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [invite]);

  // Stats
  const pendingReferrals = (referrals || []).filter((r) => r.status === 'pending').length;
  const completedReferrals = (referrals || []).filter((r) => r.status === 'completed').length;
  const totalEarned = (referrals || []).reduce((sum, r) => sum + (r.pointsEarned || 0), 0);

  return {
    invite,
    referrals: referrals || [],
    isLoading: isLoadingInvite || isLoadingReferrals,
    shareReferral,
    refetch: () => {
      refetchInvite();
      refetchReferrals();
    },
    pendingReferrals,
    completedReferrals,
    totalEarned,
  };
}

// Loyalty stats hook
export function useLoyaltyStats() {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<LoyaltyStats>({
    queryKey: ['loyalty-stats', user?.id],
    queryFn: () => getLoyaltyStats(user!.id),
    enabled: !!user?.id,
  });

  return {
    stats: stats || {
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      rewardsRedeemed: 0,
      referralsMade: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
    isLoading,
    error,
    refetch,
  };
}

// Combined loyalty hook
export function useLoyalty() {
  const profile = useLoyaltyProfile();
  const rewards = useAvailableRewards();
  const referral = useReferral();
  const stats = useLoyaltyStats();

  return {
    ...profile,
    rewards: rewards.rewards,
    affordableRewards: rewards.affordableRewards,
    referralCode: referral.invite?.code,
    shareReferral: referral.shareReferral,
    stats: stats.stats,
    isLoading:
      profile.isLoading || rewards.isLoading || referral.isLoading || stats.isLoading,
  };
}

export default {
  useLoyaltyProfile,
  usePointsHistory,
  useAvailableRewards,
  useRedeemReward,
  useRedeemedRewards,
  useReferral,
  useLoyaltyStats,
  useLoyalty,
};
