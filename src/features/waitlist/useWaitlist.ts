import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getCustomerWaitlist,
  getBarberWaitlist,
  joinWaitlist,
  leaveWaitlist,
  notifyWaitlistCustomer,
  acceptWaitlistOffer,
  declineWaitlistOffer,
  getWaitlistPosition,
  getWaitlistNotifications,
  markNotificationRead,
  getWaitlistStats,
} from './waitlistService';
import type {
  WaitlistEntry,
  JoinWaitlistInput,
  WaitlistNotification,
  WaitlistStats,
} from './types';

// Hook for customer's waitlist
export function useCustomerWaitlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: waitlist,
    isLoading,
    error,
    refetch,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist', 'customer', user?.id],
    queryFn: () => getCustomerWaitlist(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for updates
  });

  // Join waitlist
  const joinMutation = useMutation({
    mutationFn: (input: JoinWaitlistInput) => joinWaitlist(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', 'customer', user?.id] });
      Alert.alert(
        'Added to Waitlist',
        "We'll notify you when a slot becomes available!"
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to join waitlist');
    },
  });

  // Leave waitlist
  const leaveMutation = useMutation({
    mutationFn: (waitlistId: string) => leaveWaitlist(waitlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', 'customer', user?.id] });
      Alert.alert('Removed', 'You have been removed from the waitlist');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to leave waitlist');
    },
  });

  // Accept offer
  const acceptMutation = useMutation({
    mutationFn: ({ waitlistId, bookingId }: { waitlistId: string; bookingId: string }) =>
      acceptWaitlistOffer(waitlistId, bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', 'customer', user?.id] });
      Alert.alert('Booked!', 'Your appointment has been confirmed');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to accept offer');
    },
  });

  // Decline offer
  const declineMutation = useMutation({
    mutationFn: (waitlistId: string) => declineWaitlistOffer(waitlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', 'customer', user?.id] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to decline offer');
    },
  });

  // Get active (notified) entries
  const activeOffers = (waitlist || []).filter((w) => w.status === 'notified');
  const waitingEntries = (waitlist || []).filter((w) => w.status === 'waiting');

  return {
    waitlist: waitlist || [],
    activeOffers,
    waitingEntries,
    isLoading,
    error,
    refetch,
    joinWaitlist: joinMutation.mutate,
    leaveWaitlist: leaveMutation.mutate,
    acceptOffer: acceptMutation.mutate,
    declineOffer: declineMutation.mutate,
    isJoining: joinMutation.isPending,
    isAccepting: acceptMutation.isPending,
  };
}

// Hook for barber's waitlist management
export function useBarberWaitlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: waitlist,
    isLoading,
    error,
    refetch,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist', 'barber', user?.id],
    queryFn: () => getBarberWaitlist(user!.id),
    enabled: !!user?.id,
  });

  // Notify customer
  const notifyMutation = useMutation({
    mutationFn: ({
      waitlistId,
      date,
      time,
      expiresIn,
    }: {
      waitlistId: string;
      date: string;
      time: string;
      expiresIn?: number;
    }) => notifyWaitlistCustomer(waitlistId, date, time, expiresIn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', 'barber', user?.id] });
      Alert.alert('Notified', 'Customer has been notified of the available slot');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to notify customer');
    },
  });

  return {
    waitlist: waitlist || [],
    isLoading,
    error,
    refetch,
    notifyCustomer: notifyMutation.mutate,
    isNotifying: notifyMutation.isPending,
  };
}

// Hook for waitlist position
export function useWaitlistPosition(waitlistId: string) {
  const {
    data: position,
    isLoading,
    refetch,
  } = useQuery<number>({
    queryKey: ['waitlist-position', waitlistId],
    queryFn: () => getWaitlistPosition(waitlistId),
    enabled: !!waitlistId,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    position: position || 0,
    isLoading,
    refetch,
  };
}

// Hook for waitlist notifications
export function useWaitlistNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery<WaitlistNotification[]>({
    queryKey: ['waitlist-notifications', user?.id],
    queryFn: () => getWaitlistNotifications(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-notifications', user?.id] });
    },
  });

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: markReadMutation.mutate,
  };
}

// Hook for waitlist stats (barber)
export function useWaitlistStats() {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<WaitlistStats>({
    queryKey: ['waitlist-stats', user?.id],
    queryFn: () => getWaitlistStats(user!.id),
    enabled: !!user?.id,
  });

  return {
    stats: stats || {
      totalWaiting: 0,
      averageWaitTime: 'N/A',
      conversionRate: 0,
      activeWaitlists: 0,
    },
    isLoading,
    error,
    refetch,
  };
}

export default {
  useCustomerWaitlist,
  useBarberWaitlist,
  useWaitlistPosition,
  useWaitlistNotifications,
  useWaitlistStats,
};
