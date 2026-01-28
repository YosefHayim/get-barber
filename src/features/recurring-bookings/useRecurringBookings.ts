import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getCustomerRecurringBookings,
  getBarberRecurringBookings,
  createRecurringBooking,
  updateRecurringBooking,
  pauseRecurringBooking,
  resumeRecurringBooking,
  cancelRecurringBooking,
  skipNextOccurrence,
  getRecurringBookingInstances,
  getRecurringBookingStats,
} from './recurringBookingService';
import type {
  RecurringBooking,
  RecurringBookingInstance,
  CreateRecurringBookingInput,
  UpdateRecurringBookingInput,
  RecurringBookingStats,
} from './types';

// Hook for customer's recurring bookings
export function useCustomerRecurringBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: recurringBookings,
    isLoading,
    error,
    refetch,
  } = useQuery<RecurringBooking[]>({
    queryKey: ['recurring-bookings', 'customer', user?.id],
    queryFn: () => getCustomerRecurringBookings(user!.id),
    enabled: !!user?.id,
  });

  // Create recurring booking
  const createMutation = useMutation({
    mutationFn: (input: CreateRecurringBookingInput) =>
      createRecurringBooking(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bookings', 'customer', user?.id] });
      Alert.alert('Success', 'Recurring booking created successfully!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create recurring booking');
    },
  });

  // Update recurring booking
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateRecurringBookingInput;
    }) => updateRecurringBooking(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bookings', 'customer', user?.id] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update recurring booking');
    },
  });

  // Pause recurring booking
  const pauseMutation = useMutation({
    mutationFn: ({ id, until }: { id: string; until?: string }) =>
      pauseRecurringBooking(id, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bookings', 'customer', user?.id] });
      Alert.alert('Paused', 'Recurring booking has been paused');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to pause recurring booking');
    },
  });

  // Resume recurring booking
  const resumeMutation = useMutation({
    mutationFn: (id: string) => resumeRecurringBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bookings', 'customer', user?.id] });
      Alert.alert('Resumed', 'Recurring booking has been resumed');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to resume recurring booking');
    },
  });

  // Cancel recurring booking
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelRecurringBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bookings', 'customer', user?.id] });
      Alert.alert('Cancelled', 'Recurring booking has been cancelled');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to cancel recurring booking');
    },
  });

  // Skip next occurrence
  const skipMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      skipNextOccurrence(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-bookings', 'customer', user?.id] });
      Alert.alert('Skipped', 'Next appointment has been skipped');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to skip next occurrence');
    },
  });

  return {
    recurringBookings: recurringBookings || [],
    isLoading,
    error,
    refetch,
    createRecurringBooking: createMutation.mutate,
    updateRecurringBooking: updateMutation.mutate,
    pauseRecurringBooking: pauseMutation.mutate,
    resumeRecurringBooking: resumeMutation.mutate,
    cancelRecurringBooking: cancelMutation.mutate,
    skipNextOccurrence: skipMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

// Hook for barber's recurring bookings
export function useBarberRecurringBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: recurringBookings,
    isLoading,
    error,
    refetch,
  } = useQuery<RecurringBooking[]>({
    queryKey: ['recurring-bookings', 'barber', user?.id],
    queryFn: () => getBarberRecurringBookings(user!.id),
    enabled: !!user?.id,
  });

  return {
    recurringBookings: recurringBookings || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook for recurring booking instances/history
export function useRecurringBookingHistory(recurringBookingId: string) {
  const {
    data: instances,
    isLoading,
    error,
    refetch,
  } = useQuery<RecurringBookingInstance[]>({
    queryKey: ['recurring-booking-instances', recurringBookingId],
    queryFn: () => getRecurringBookingInstances(recurringBookingId),
    enabled: !!recurringBookingId,
  });

  return {
    instances: instances || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook for recurring booking stats
export function useRecurringBookingStats() {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<RecurringBookingStats>({
    queryKey: ['recurring-booking-stats', user?.id],
    queryFn: () => getRecurringBookingStats(user!.id),
    enabled: !!user?.id,
  });

  return {
    stats: stats || {
      activeRecurringBookings: 0,
      totalBookingsCompleted: 0,
      upcomingInstances: 0,
      savedAmount: 0,
    },
    isLoading,
    error,
    refetch,
  };
}

// Helper hook for frequency label
export function useFrequencyLabel() {
  const getLabel = useCallback((frequency: string, customDays?: number): string => {
    switch (frequency) {
      case 'weekly':
        return 'Every week';
      case 'biweekly':
        return 'Every 2 weeks';
      case 'monthly':
        return 'Monthly';
      case 'custom':
        return `Every ${customDays} days`;
      default:
        return frequency;
    }
  }, []);

  return { getLabel };
}

export default {
  useCustomerRecurringBookings,
  useBarberRecurringBookings,
  useRecurringBookingHistory,
  useRecurringBookingStats,
  useFrequencyLabel,
};
