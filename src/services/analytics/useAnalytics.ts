import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getDashboardSummary,
  getBookingAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getPerformanceAnalytics,
  getInsights,
  getGoals,
} from './analyticsService';
import type {
  TimeRange,
  DashboardSummary,
  BookingAnalytics,
  RevenueAnalytics,
  CustomerAnalytics,
  PerformanceAnalytics,
  InsightItem,
  GoalProgress,
} from './types';

// Main dashboard hook
export function useDashboardAnalytics(initialTimeRange: TimeRange = '30d') {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  const {
    data: summary,
    isLoading: loadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary', user?.id, timeRange],
    queryFn: () => getDashboardSummary(user!.id, timeRange),
    enabled: !!user?.id,
  });

  const {
    data: insights,
    isLoading: loadingInsights,
  } = useQuery<InsightItem[]>({
    queryKey: ['insights', user?.id],
    queryFn: () => getInsights(user!.id),
    enabled: !!user?.id,
  });

  const {
    data: goals,
    isLoading: loadingGoals,
  } = useQuery<GoalProgress[]>({
    queryKey: ['goals', user?.id],
    queryFn: () => getGoals(user!.id),
    enabled: !!user?.id,
  });

  return {
    summary: summary || {
      totalBookings: 0,
      bookingsChange: 0,
      totalRevenue: 0,
      revenueChange: 0,
      totalCustomers: 0,
      customersChange: 0,
      averageRating: 0,
      ratingChange: 0,
      completionRate: 0,
      repeatCustomerRate: 0,
    },
    insights: insights || [],
    goals: goals || [],
    timeRange,
    setTimeRange,
    isLoading: loadingSummary || loadingInsights || loadingGoals,
    error: summaryError,
    refetch: refetchSummary,
  };
}

// Booking analytics hook
export function useBookingAnalytics(timeRange: TimeRange = '30d') {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery<BookingAnalytics>({
    queryKey: ['booking-analytics', user?.id, timeRange],
    queryFn: () => getBookingAnalytics(user!.id, timeRange),
    enabled: !!user?.id,
  });

  return {
    analytics: analytics || {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      averageBookingValue: 0,
      bookingsByDay: [],
      bookingsByHour: [],
      popularServices: [],
      bookingTrends: [],
    },
    isLoading,
    error,
    refetch,
  };
}

// Revenue analytics hook
export function useRevenueAnalytics(timeRange: TimeRange = '30d') {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery<RevenueAnalytics>({
    queryKey: ['revenue-analytics', user?.id, timeRange],
    queryFn: () => getRevenueAnalytics(user!.id, timeRange),
    enabled: !!user?.id,
  });

  return {
    analytics: analytics || {
      totalRevenue: 0,
      netRevenue: 0,
      tips: 0,
      averageTicket: 0,
      revenueByDay: [],
      revenueByService: [],
      revenueByPaymentMethod: [],
      projectedRevenue: 0,
    },
    isLoading,
    error,
    refetch,
  };
}

// Customer analytics hook
export function useCustomerAnalytics(timeRange: TimeRange = '30d') {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery<CustomerAnalytics>({
    queryKey: ['customer-analytics', user?.id, timeRange],
    queryFn: () => getCustomerAnalytics(user!.id, timeRange),
    enabled: !!user?.id,
  });

  return {
    analytics: analytics || {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      repeatRate: 0,
      averageVisitsPerCustomer: 0,
      customerLifetimeValue: 0,
      customersByDay: [],
      topCustomers: [],
      customerRetention: [],
    },
    isLoading,
    error,
    refetch,
  };
}

// Performance analytics hook
export function usePerformanceAnalytics(timeRange: TimeRange = '30d') {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery<PerformanceAnalytics>({
    queryKey: ['performance-analytics', user?.id, timeRange],
    queryFn: () => getPerformanceAnalytics(user!.id, timeRange),
    enabled: !!user?.id,
  });

  return {
    analytics: analytics || {
      averageRating: 0,
      totalReviews: 0,
      newReviews: 0,
      ratingsByStars: [],
      ratingTrend: [],
      responseRate: 0,
      averageResponseTime: 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    },
    isLoading,
    error,
    refetch,
  };
}

// Combined analytics hook for full dashboard
export function useFullAnalytics(timeRange: TimeRange = '30d') {
  const dashboard = useDashboardAnalytics(timeRange);
  const bookings = useBookingAnalytics(timeRange);
  const revenue = useRevenueAnalytics(timeRange);
  const customers = useCustomerAnalytics(timeRange);
  const performance = usePerformanceAnalytics(timeRange);

  const isLoading =
    dashboard.isLoading ||
    bookings.isLoading ||
    revenue.isLoading ||
    customers.isLoading ||
    performance.isLoading;

  return {
    dashboard,
    bookings,
    revenue,
    customers,
    performance,
    timeRange: dashboard.timeRange,
    setTimeRange: dashboard.setTimeRange,
    isLoading,
    refetchAll: () => {
      dashboard.refetch();
      bookings.refetch();
      revenue.refetch();
      customers.refetch();
      performance.refetch();
    },
  };
}

// Time range options
export const TIME_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
] as const;

export default {
  useDashboardAnalytics,
  useBookingAnalytics,
  useRevenueAnalytics,
  useCustomerAnalytics,
  usePerformanceAnalytics,
  useFullAnalytics,
  TIME_RANGE_OPTIONS,
};
