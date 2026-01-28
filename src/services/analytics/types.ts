// Analytics Dashboard Types

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
export type MetricType = 'bookings' | 'revenue' | 'customers' | 'reviews';

export interface DashboardSummary {
  totalBookings: number;
  bookingsChange: number; // Percentage change from previous period
  totalRevenue: number;
  revenueChange: number;
  totalCustomers: number;
  customersChange: number;
  averageRating: number;
  ratingChange: number;
  completionRate: number;
  repeatCustomerRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  averageBookingValue: number;
  bookingsByDay: TimeSeriesData[];
  bookingsByHour: { hour: number; count: number }[];
  popularServices: {
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
    percentage: number;
  }[];
  bookingTrends: TimeSeriesData[];
}

export interface RevenueAnalytics {
  totalRevenue: number;
  netRevenue: number; // After platform fees
  tips: number;
  averageTicket: number;
  revenueByDay: TimeSeriesData[];
  revenueByService: {
    serviceId: string;
    serviceName: string;
    revenue: number;
    percentage: number;
  }[];
  revenueByPaymentMethod: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  projectedRevenue: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatRate: number;
  averageVisitsPerCustomer: number;
  customerLifetimeValue: number;
  customersByDay: TimeSeriesData[];
  topCustomers: {
    customerId: string;
    customerName: string;
    customerAvatar?: string;
    totalBookings: number;
    totalSpent: number;
    lastVisit: string;
  }[];
  customerRetention: {
    month: string;
    retained: number;
    churned: number;
  }[];
}

export interface PerformanceAnalytics {
  averageRating: number;
  totalReviews: number;
  newReviews: number;
  ratingsByStars: {
    stars: number;
    count: number;
    percentage: number;
  }[];
  ratingTrend: TimeSeriesData[];
  responseRate: number; // Reviews responded to
  averageResponseTime: number; // Hours
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface ScheduleAnalytics {
  utilizationRate: number;
  peakHours: { hour: number; utilization: number }[];
  peakDays: { day: string; utilization: number }[];
  averageBookingDuration: number;
  openSlots: number;
  bookedSlots: number;
}

export interface GoalProgress {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  percentage: number;
  dueDate?: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
}

export interface InsightItem {
  id: string;
  type: 'tip' | 'alert' | 'achievement';
  title: string;
  description: string;
  action?: {
    label: string;
    route: string;
  };
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AnalyticsExport {
  format: 'csv' | 'pdf' | 'excel';
  dateRange: {
    start: string;
    end: string;
  };
  sections: MetricType[];
}
