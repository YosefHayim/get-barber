import { supabase } from '@/lib/supabase';
import type {
  TimeRange,
  DashboardSummary,
  BookingAnalytics,
  RevenueAnalytics,
  CustomerAnalytics,
  PerformanceAnalytics,
  ScheduleAnalytics,
  GoalProgress,
  InsightItem,
} from './types';

// Helper to get date range
function getDateRange(range: TimeRange): { start: Date; end: Date; prevStart: Date } {
  const end = new Date();
  const start = new Date();
  const prevStart = new Date();

  switch (range) {
    case '7d':
      start.setDate(start.getDate() - 7);
      prevStart.setDate(prevStart.getDate() - 14);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      prevStart.setDate(prevStart.getDate() - 60);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      prevStart.setDate(prevStart.getDate() - 180);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      prevStart.setFullYear(prevStart.getFullYear() - 2);
      break;
    default:
      start.setFullYear(2020); // All time
      prevStart.setFullYear(2019);
  }

  return { start, end, prevStart };
}

// Calculate percentage change
function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Get dashboard summary
export async function getDashboardSummary(
  barberId: string,
  timeRange: TimeRange = '30d'
): Promise<DashboardSummary> {
  const { start, end, prevStart } = getDateRange(timeRange);

  // Current period bookings
  const { data: currentBookings } = await supabase
    .from('bookings')
    .select('id, total_price, status')
    .eq('barber_id', barberId)
    .gte('date', start.toISOString())
    .lte('date', end.toISOString());

  // Previous period bookings
  const { data: prevBookings } = await supabase
    .from('bookings')
    .select('id, total_price, status')
    .eq('barber_id', barberId)
    .gte('date', prevStart.toISOString())
    .lt('date', start.toISOString());

  const current = currentBookings || [];
  const previous = prevBookings || [];

  // Calculate metrics
  const totalBookings = current.length;
  const prevTotalBookings = previous.length;

  const totalRevenue = current
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  const prevTotalRevenue = previous
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // Unique customers
  const { count: customerCount } = await supabase
    .from('bookings')
    .select('customer_id', { count: 'exact', head: true })
    .eq('barber_id', barberId)
    .gte('date', start.toISOString());

  const { count: prevCustomerCount } = await supabase
    .from('bookings')
    .select('customer_id', { count: 'exact', head: true })
    .eq('barber_id', barberId)
    .gte('date', prevStart.toISOString())
    .lt('date', start.toISOString());

  // Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('barber_id', barberId)
    .gte('created_at', start.toISOString());

  const { data: prevReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('barber_id', barberId)
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', start.toISOString());

  const avgRating =
    (reviews || []).length > 0
      ? (reviews || []).reduce((sum, r) => sum + r.rating, 0) / reviews!.length
      : 0;
  const prevAvgRating =
    (prevReviews || []).length > 0
      ? (prevReviews || []).reduce((sum, r) => sum + r.rating, 0) / prevReviews!.length
      : 0;

  // Completion rate
  const completed = current.filter((b) => b.status === 'completed').length;
  const completionRate = totalBookings > 0 ? (completed / totalBookings) * 100 : 0;

  // Repeat customer rate
  const { data: repeatData } = await supabase.rpc('get_repeat_customer_rate', {
    barber_id: barberId,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  });

  return {
    totalBookings,
    bookingsChange: calcChange(totalBookings, prevTotalBookings),
    totalRevenue,
    revenueChange: calcChange(totalRevenue, prevTotalRevenue),
    totalCustomers: customerCount || 0,
    customersChange: calcChange(customerCount || 0, prevCustomerCount || 0),
    averageRating: Math.round(avgRating * 10) / 10,
    ratingChange: calcChange(avgRating, prevAvgRating),
    completionRate: Math.round(completionRate),
    repeatCustomerRate: repeatData?.[0]?.rate || 0,
  };
}

// Get booking analytics
export async function getBookingAnalytics(
  barberId: string,
  timeRange: TimeRange = '30d'
): Promise<BookingAnalytics> {
  const { start, end } = getDateRange(timeRange);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, service:services(id, name, price)')
    .eq('barber_id', barberId)
    .gte('date', start.toISOString())
    .lte('date', end.toISOString());

  const all = bookings || [];

  // Status counts
  const completed = all.filter((b) => b.status === 'completed');
  const cancelled = all.filter((b) => b.status === 'cancelled');
  const noShow = all.filter((b) => b.status === 'no_show');

  // Average booking value
  const avgValue =
    completed.length > 0
      ? completed.reduce((sum, b) => sum + (b.total_price || 0), 0) / completed.length
      : 0;

  // Bookings by day
  const byDay = new Map<string, number>();
  all.forEach((b) => {
    const day = b.date.split('T')[0];
    byDay.set(day, (byDay.get(day) || 0) + 1);
  });

  // Bookings by hour
  const byHour = new Array(24).fill(0);
  all.forEach((b) => {
    const hour = parseInt(b.time.split(':')[0]);
    byHour[hour]++;
  });

  // Popular services
  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();
  all.forEach((b) => {
    const serviceId = b.service_id;
    const serviceName = b.service?.name || 'Unknown';
    const existing = serviceMap.get(serviceId) || { name: serviceName, count: 0, revenue: 0 };
    existing.count++;
    existing.revenue += b.total_price || 0;
    serviceMap.set(serviceId, existing);
  });

  const popularServices = Array.from(serviceMap.entries())
    .map(([id, data]) => ({
      serviceId: id,
      serviceName: data.name,
      count: data.count,
      revenue: data.revenue,
      percentage: (data.count / all.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalBookings: all.length,
    completedBookings: completed.length,
    cancelledBookings: cancelled.length,
    noShowBookings: noShow.length,
    averageBookingValue: Math.round(avgValue * 100) / 100,
    bookingsByDay: Array.from(byDay.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    bookingsByHour: byHour.map((count, hour) => ({ hour, count })),
    popularServices,
    bookingTrends: Array.from(byDay.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// Get revenue analytics
export async function getRevenueAnalytics(
  barberId: string,
  timeRange: TimeRange = '30d'
): Promise<RevenueAnalytics> {
  const { start, end } = getDateRange(timeRange);

  const { data: payments } = await supabase
    .from('payments')
    .select('*, booking:bookings(service:services(id, name))')
    .eq('barber_id', barberId)
    .eq('status', 'completed')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  const all = payments || [];

  const totalRevenue = all.reduce((sum, p) => sum + (p.amount || 0), 0);
  const tips = all.reduce((sum, p) => sum + (p.tip_amount || 0), 0);
  const platformFees = all.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
  const netRevenue = totalRevenue - platformFees;

  // By day
  const byDay = new Map<string, number>();
  all.forEach((p) => {
    const day = p.created_at.split('T')[0];
    byDay.set(day, (byDay.get(day) || 0) + p.amount);
  });

  // By service
  const byService = new Map<string, { name: string; revenue: number }>();
  all.forEach((p) => {
    const serviceId = p.booking?.service?.id || 'unknown';
    const serviceName = p.booking?.service?.name || 'Unknown';
    const existing = byService.get(serviceId) || { name: serviceName, revenue: 0 };
    existing.revenue += p.amount;
    byService.set(serviceId, existing);
  });

  // By payment method
  const byMethod = new Map<string, number>();
  all.forEach((p) => {
    const method = p.payment_method || 'card';
    byMethod.set(method, (byMethod.get(method) || 0) + p.amount);
  });

  // Projected revenue (simple linear projection)
  const daysElapsed = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const dailyAvg = totalRevenue / daysElapsed;
  const projectedRevenue = dailyAvg * 30;

  return {
    totalRevenue,
    netRevenue,
    tips,
    averageTicket: all.length > 0 ? totalRevenue / all.length : 0,
    revenueByDay: Array.from(byDay.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    revenueByService: Array.from(byService.entries())
      .map(([id, data]) => ({
        serviceId: id,
        serviceName: data.name,
        revenue: data.revenue,
        percentage: (data.revenue / totalRevenue) * 100,
      }))
      .sort((a, b) => b.revenue - a.revenue),
    revenueByPaymentMethod: Array.from(byMethod.entries())
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: (amount / totalRevenue) * 100,
      })),
    projectedRevenue,
  };
}

// Get customer analytics
export async function getCustomerAnalytics(
  barberId: string,
  timeRange: TimeRange = '30d'
): Promise<CustomerAnalytics> {
  const { start, end } = getDateRange(timeRange);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('customer_id, date, total_price, customer:profiles!customer_id(id, display_name, avatar_url)')
    .eq('barber_id', barberId)
    .eq('status', 'completed')
    .gte('date', start.toISOString())
    .lte('date', end.toISOString());

  const all = bookings || [];

  // Unique customers
  const customerMap = new Map<string, {
    name: string;
    avatar?: string;
    bookings: number;
    spent: number;
    lastVisit: string;
    firstVisit: string;
  }>();

  all.forEach((b) => {
    const existing = customerMap.get(b.customer_id);
    if (existing) {
      existing.bookings++;
      existing.spent += b.total_price || 0;
      if (b.date > existing.lastVisit) existing.lastVisit = b.date;
    } else {
      customerMap.set(b.customer_id, {
        name: (b.customer as any)?.display_name || 'Unknown',
        avatar: (b.customer as any)?.avatar_url,
        bookings: 1,
        spent: b.total_price || 0,
        lastVisit: b.date,
        firstVisit: b.date,
      });
    }
  });

  const customers = Array.from(customerMap.entries());
  const totalCustomers = customers.length;
  const newCustomers = customers.filter((c) => c[1].bookings === 1).length;
  const returningCustomers = totalCustomers - newCustomers;

  // Average visits
  const totalVisits = customers.reduce((sum, c) => sum + c[1].bookings, 0);
  const avgVisits = totalCustomers > 0 ? totalVisits / totalCustomers : 0;

  // Customer lifetime value
  const totalSpent = customers.reduce((sum, c) => sum + c[1].spent, 0);
  const clv = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  // Top customers
  const topCustomers = customers
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, 10)
    .map(([id, data]) => ({
      customerId: id,
      customerName: data.name,
      customerAvatar: data.avatar,
      totalBookings: data.bookings,
      totalSpent: data.spent,
      lastVisit: data.lastVisit,
    }));

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    repeatRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
    averageVisitsPerCustomer: Math.round(avgVisits * 10) / 10,
    customerLifetimeValue: Math.round(clv * 100) / 100,
    customersByDay: [],
    topCustomers,
    customerRetention: [],
  };
}

// Get performance analytics
export async function getPerformanceAnalytics(
  barberId: string,
  timeRange: TimeRange = '30d'
): Promise<PerformanceAnalytics> {
  const { start, end } = getDateRange(timeRange);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reply:review_replies(id, created_at)')
    .eq('barber_id', barberId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  const all = reviews || [];

  // Rating distribution
  const distribution = [0, 0, 0, 0, 0];
  all.forEach((r) => {
    distribution[r.rating - 1]++;
  });

  const avgRating =
    all.length > 0 ? all.reduce((sum, r) => sum + r.rating, 0) / all.length : 0;

  // Response rate
  const withReply = all.filter((r) => r.reply && r.reply.length > 0).length;
  const responseRate = all.length > 0 ? (withReply / all.length) * 100 : 0;

  // Average response time
  let totalResponseTime = 0;
  let responseCount = 0;
  all.forEach((r) => {
    if (r.reply && r.reply.length > 0) {
      const reviewTime = new Date(r.created_at).getTime();
      const replyTime = new Date(r.reply[0].created_at).getTime();
      totalResponseTime += (replyTime - reviewTime) / (60 * 60 * 1000); // Hours
      responseCount++;
    }
  });

  const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

  // Sentiment (simple based on rating)
  const positive = all.filter((r) => r.rating >= 4).length;
  const neutral = all.filter((r) => r.rating === 3).length;
  const negative = all.filter((r) => r.rating <= 2).length;

  return {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: all.length,
    newReviews: all.length,
    ratingsByStars: distribution.map((count, i) => ({
      stars: i + 1,
      count,
      percentage: all.length > 0 ? (count / all.length) * 100 : 0,
    })),
    ratingTrend: [],
    responseRate: Math.round(responseRate),
    averageResponseTime: Math.round(avgResponseTime * 10) / 10,
    sentimentBreakdown: {
      positive: all.length > 0 ? (positive / all.length) * 100 : 0,
      neutral: all.length > 0 ? (neutral / all.length) * 100 : 0,
      negative: all.length > 0 ? (negative / all.length) * 100 : 0,
    },
  };
}

// Get insights
export async function getInsights(barberId: string): Promise<InsightItem[]> {
  const insights: InsightItem[] = [];

  // Get recent data
  const summary = await getDashboardSummary(barberId, '7d');

  // Generate insights based on data
  if (summary.bookingsChange > 20) {
    insights.push({
      id: '1',
      type: 'achievement',
      title: 'Booking Growth!',
      description: `Your bookings increased by ${summary.bookingsChange}% this week.`,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  }

  if (summary.bookingsChange < -10) {
    insights.push({
      id: '2',
      type: 'alert',
      title: 'Booking Decline',
      description: `Your bookings decreased by ${Math.abs(summary.bookingsChange)}%. Consider running a promotion.`,
      action: {
        label: 'Create Promotion',
        route: '/promotions/new',
      },
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  }

  if (summary.completionRate < 80) {
    insights.push({
      id: '3',
      type: 'tip',
      title: 'Reduce No-Shows',
      description: 'Enable booking reminders to improve your completion rate.',
      action: {
        label: 'Enable Reminders',
        route: '/settings/notifications',
      },
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  }

  if (summary.averageRating >= 4.8) {
    insights.push({
      id: '4',
      type: 'achievement',
      title: 'Top Rated!',
      description: "You're maintaining an excellent rating. Keep up the great work!",
      priority: 'low',
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// Get goals
export async function getGoals(barberId: string): Promise<GoalProgress[]> {
  const { data: goals } = await supabase
    .from('barber_goals')
    .select('*')
    .eq('barber_id', barberId)
    .eq('is_active', true);

  return (goals || []).map((g) => ({
    id: g.id,
    name: g.name,
    target: g.target,
    current: g.current,
    unit: g.unit,
    percentage: Math.min((g.current / g.target) * 100, 100),
    dueDate: g.due_date,
    status:
      g.current >= g.target
        ? 'completed'
        : g.percentage > 75
          ? 'on_track'
          : g.percentage > 50
            ? 'at_risk'
            : 'behind',
  }));
}

export default {
  getDashboardSummary,
  getBookingAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getPerformanceAnalytics,
  getInsights,
  getGoals,
};
