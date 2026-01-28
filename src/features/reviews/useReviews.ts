import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getBarberReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  unmarkReviewHelpful,
  replyToReview,
  getReviewSummary,
  getPendingReviews,
  getCustomerReviews,
  reportReview,
} from './reviewService';
import type {
  Review,
  CreateReviewInput,
  ReviewSummary,
  ReviewSortOption,
  ReviewFilters,
  PendingReview,
} from './types';

// Hook for barber's reviews
export function useBarberReviews(
  barberId: string,
  options: {
    sort?: ReviewSortOption;
    filters?: ReviewFilters;
  } = {}
) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const {
    data: reviews,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<Review[]>({
    queryKey: ['barber-reviews', barberId, options.sort, options.filters, page],
    queryFn: () => getBarberReviews(barberId, { ...options, page }),
    enabled: !!barberId,
  });

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    reviews: reviews || [],
    isLoading: isLoading && page === 0,
    isLoadingMore: isFetching && page > 0,
    error,
    refetch,
    loadMore,
    resetPage,
    currentPage: page,
  };
}

// Hook for review summary
export function useReviewSummary(barberId: string) {
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery<ReviewSummary>({
    queryKey: ['review-summary', barberId],
    queryFn: () => getReviewSummary(barberId),
    enabled: !!barberId,
  });

  return {
    summary: summary || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      topTags: [],
      photosCount: 0,
      verifiedCount: 0,
    },
    isLoading,
    error,
    refetch,
  };
}

// Hook for creating a review
export function useCreateReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(user!.id, input),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['barber-reviews', review.barberId] });
      queryClient.invalidateQueries({ queryKey: ['review-summary', review.barberId] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews', user?.id] });
      Alert.alert('Thank You!', 'Your review has been submitted.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    },
  });

  return {
    createReview: mutation.mutate,
    isCreating: mutation.isPending,
    createdReview: mutation.data,
    error: mutation.error,
  };
}

// Hook for pending reviews (reviews customer needs to write)
export function usePendingReviews() {
  const { user } = useAuth();

  const {
    data: pendingReviews,
    isLoading,
    error,
    refetch,
  } = useQuery<PendingReview[]>({
    queryKey: ['pending-reviews', user?.id],
    queryFn: () => getPendingReviews(user!.id),
    enabled: !!user?.id,
  });

  return {
    pendingReviews: pendingReviews || [],
    hasPending: (pendingReviews || []).length > 0,
    isLoading,
    error,
    refetch,
  };
}

// Hook for customer's own reviews
export function useCustomerReviews() {
  const { user } = useAuth();

  const {
    data: reviews,
    isLoading,
    error,
    refetch,
  } = useQuery<Review[]>({
    queryKey: ['customer-reviews', user?.id],
    queryFn: () => getCustomerReviews(user!.id),
    enabled: !!user?.id,
  });

  return {
    reviews: reviews || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook for helpful marking
export function useReviewHelpful() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const markMutation = useMutation({
    mutationFn: (reviewId: string) => markReviewHelpful(user!.id, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-reviews'] });
    },
  });

  const unmarkMutation = useMutation({
    mutationFn: (reviewId: string) => unmarkReviewHelpful(user!.id, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-reviews'] });
    },
  });

  const toggleHelpful = useCallback(
    (reviewId: string, isCurrentlyHelpful: boolean) => {
      if (isCurrentlyHelpful) {
        unmarkMutation.mutate(reviewId);
      } else {
        markMutation.mutate(reviewId);
      }
    },
    [markMutation, unmarkMutation]
  );

  return {
    markHelpful: markMutation.mutate,
    unmarkHelpful: unmarkMutation.mutate,
    toggleHelpful,
    isLoading: markMutation.isPending || unmarkMutation.isPending,
  };
}

// Hook for barber replying to reviews
export function useReviewReply() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
      replyToReview(user!.id, reviewId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-reviews'] });
      Alert.alert('Replied', 'Your response has been posted.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to post reply.');
    },
  });

  return {
    reply: mutation.mutate,
    isReplying: mutation.isPending,
    error: mutation.error,
  };
}

// Hook for reporting reviews
export function useReportReview() {
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      reportReview(user!.id, reviewId, reason),
    onSuccess: () => {
      Alert.alert('Reported', "Thank you for your report. We'll review it shortly.");
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit report.');
    },
  });

  return {
    report: mutation.mutate,
    isReporting: mutation.isPending,
  };
}

// Hook for updating/deleting own review
export function useManageReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      reviewId,
      updates,
    }: {
      reviewId: string;
      updates: Parameters<typeof updateReview>[1];
    }) => updateReview(reviewId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews', user?.id] });
      Alert.alert('Updated', 'Your review has been updated.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update review.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews', user?.id] });
      Alert.alert('Deleted', 'Your review has been deleted.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete review.');
    },
  });

  return {
    updateReview: updateMutation.mutate,
    deleteReview: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export default {
  useBarberReviews,
  useReviewSummary,
  useCreateReview,
  usePendingReviews,
  useCustomerReviews,
  useReviewHelpful,
  useReviewReply,
  useReportReview,
  useManageReview,
};
