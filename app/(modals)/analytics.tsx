import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Star,
  Clock,
  Scissors,
  BarChart3,
  PieChart,
} from 'lucide-react-native';
import { COLORS, SHADOWS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { MOCK_BARBER_STATS, MOCK_CLIENTS, MOCK_SERVICES } from '@/constants/mockData';

type TimeRange = '7d' | '30d' | '90d' | 'year';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

const SimpleBarChart = ({ data, maxValue }: { data: ChartData[]; maxValue: number }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>
    {data.map((item, index) => {
      const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
      return (
        <View key={index} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginBottom: 4 }}>
            {item.value > 0 ? `₪${item.value}` : ''}
          </Text>
          <View
            style={{
              width: '80%',
              height: Math.max(height, 4),
              backgroundColor: item.color || COLORS.gold,
              borderRadius: RADIUS.xs,
            }}
          />
          <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginTop: 4 }}>
            {item.label}
          </Text>
        </View>
      );
    })}
  </View>
);

const ServicePieChart = ({ data }: { data: ChartData[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <View>
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: item.color,
                marginRight: SPACING.sm,
              }}
            />
            <Text style={{ flex: 1, fontSize: TYPOGRAPHY.sm, color: COLORS.textLight }}>
              {item.label}
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textInverse, fontWeight: TYPOGRAPHY.medium }}>
              {percentage.toFixed(0)}%
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted, marginLeft: SPACING.sm, width: 40 }}>
              ({item.value})
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default function AnalyticsScreen(): React.JSX.Element {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const stats = MOCK_BARBER_STATS;

  const revenueData = useMemo((): ChartData[] => {
    const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12;
    const baseWeekly = stats.weeklyEarnings;
    
    if (timeRange === '7d') {
      return [
        { label: 'Mon', value: Math.round(baseWeekly * 0.12) },
        { label: 'Tue', value: Math.round(baseWeekly * 0.15) },
        { label: 'Wed', value: Math.round(baseWeekly * 0.18) },
        { label: 'Thu', value: Math.round(baseWeekly * 0.14) },
        { label: 'Fri', value: Math.round(baseWeekly * 0.22) },
        { label: 'Sat', value: Math.round(baseWeekly * 0.19) },
        { label: 'Sun', value: 0 },
      ];
    }
    
    return [
      { label: 'W1', value: Math.round(baseWeekly * 0.9 * multiplier / 4) },
      { label: 'W2', value: Math.round(baseWeekly * 1.1 * multiplier / 4) },
      { label: 'W3', value: Math.round(baseWeekly * 0.95 * multiplier / 4) },
      { label: 'W4', value: Math.round(baseWeekly * 1.05 * multiplier / 4) },
    ];
  }, [timeRange, stats.weeklyEarnings]);

  const servicePopularity = useMemo((): ChartData[] => {
    const colors = [COLORS.gold, COLORS.info, COLORS.success, COLORS.warning, COLORS.burgundy];
    return [
      { label: 'Haircut', value: 42, color: colors[0] },
      { label: 'Beard Trim', value: 28, color: colors[1] },
      { label: 'Fade', value: 18, color: colors[2] },
      { label: 'Hot Shave', value: 8, color: colors[3] },
      { label: 'Other', value: 4, color: colors[4] },
    ];
  }, []);

  const bookingsByTime = useMemo((): ChartData[] => [
    { label: '8-10', value: 12, color: COLORS.goldMuted },
    { label: '10-12', value: 28, color: COLORS.gold },
    { label: '12-14', value: 18, color: COLORS.goldMuted },
    { label: '14-16', value: 22, color: COLORS.gold },
    { label: '16-18', value: 35, color: COLORS.gold },
    { label: '18-20', value: 25, color: COLORS.goldMuted },
  ], []);

  const totalRevenue = useMemo(() => {
    const multiplier = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : 52;
    return stats.weeklyEarnings * multiplier;
  }, [timeRange, stats.weeklyEarnings]);

  const totalBookings = useMemo(() => {
    const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12;
    return Math.round(stats.totalBookings * multiplier / 4);
  }, [timeRange, stats.totalBookings]);

  const avgBookingValue = useMemo(() => {
    return totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  }, [totalRevenue, totalBookings]);

  const repeatClientRate = 68;
  const avgServiceTime = 35;

  const formatCurrency = useCallback((value: number) => {
    if (value >= 10000) {
      return `₪${(value / 1000).toFixed(1)}k`;
    }
    return `₪${value.toLocaleString()}`;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.charcoal }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.darkGray,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.md }}>
          <ArrowLeft size={24} color={COLORS.textInverse} />
        </TouchableOpacity>
        <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textInverse, flex: 1 }}>
          Analytics
        </Text>
        <BarChart3 size={24} color={COLORS.gold} />
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: SPACING.sm }}>
        {(['7d', '30d', '90d', 'year'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            onPress={() => setTimeRange(range)}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              borderRadius: RADIUS.md,
              backgroundColor: timeRange === range ? COLORS.gold : COLORS.darkGray,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.sm,
                fontWeight: TYPOGRAPHY.medium,
                color: timeRange === range ? COLORS.charcoal : COLORS.textLight,
              }}
            >
              {range === 'year' ? '1Y' : range.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: SPACING.xl }}>
          <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl }}>
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.darkGray,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <DollarSign size={18} color={COLORS.success} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginLeft: SPACING.xs }}>
                  Revenue
                </Text>
              </View>
              <Text style={{ fontSize: TYPOGRAPHY['2xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse }}>
                {formatCurrency(totalRevenue)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                <TrendingUp size={14} color={COLORS.success} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.success, marginLeft: 4 }}>
                  +12% vs prev
                </Text>
              </View>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.darkGray,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Calendar size={18} color={COLORS.info} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginLeft: SPACING.xs }}>
                  Bookings
                </Text>
              </View>
              <Text style={{ fontSize: TYPOGRAPHY['2xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse }}>
                {totalBookings}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                <TrendingUp size={14} color={COLORS.success} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.success, marginLeft: 4 }}>
                  +8% vs prev
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl }}>
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.darkGray,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Scissors size={18} color={COLORS.gold} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginLeft: SPACING.xs }}>
                  Avg Booking
                </Text>
              </View>
              <Text style={{ fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse }}>
                ₪{avgBookingValue}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.darkGray,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Users size={18} color={COLORS.warning} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginLeft: SPACING.xs }}>
                  Repeat Rate
                </Text>
              </View>
              <Text style={{ fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse }}>
                {repeatClientRate}%
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.darkGray,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Clock size={18} color={COLORS.burgundy} />
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginLeft: SPACING.xs }}>
                  Avg Time
                </Text>
              </View>
              <Text style={{ fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.textInverse }}>
                {avgServiceTime}m
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: COLORS.darkGray,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <TrendingUp size={20} color={COLORS.gold} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.md,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: COLORS.textInverse,
                  marginLeft: SPACING.sm,
                }}
              >
                Revenue Trend
              </Text>
            </View>
            <SimpleBarChart
              data={revenueData}
              maxValue={Math.max(...revenueData.map((d) => d.value))}
            />
          </View>

          <View
            style={{
              backgroundColor: COLORS.darkGray,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <PieChart size={20} color={COLORS.gold} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.md,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: COLORS.textInverse,
                  marginLeft: SPACING.sm,
                }}
              >
                Service Popularity
              </Text>
            </View>
            <ServicePieChart data={servicePopularity} />
          </View>

          <View
            style={{
              backgroundColor: COLORS.darkGray,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Clock size={20} color={COLORS.gold} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.md,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: COLORS.textInverse,
                  marginLeft: SPACING.sm,
                }}
              >
                Peak Hours
              </Text>
            </View>
            <SimpleBarChart
              data={bookingsByTime}
              maxValue={Math.max(...bookingsByTime.map((d) => d.value))}
            />
          </View>

          <View
            style={{
              backgroundColor: COLORS.darkGray,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Star size={20} color={COLORS.gold} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.md,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: COLORS.textInverse,
                  marginLeft: SPACING.sm,
                }}
              >
                Customer Satisfaction
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY['4xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.gold }}>
                {stats.averageRating}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    color={COLORS.gold}
                    fill={star <= Math.round(stats.averageRating) ? COLORS.gold : 'transparent'}
                  />
                ))}
              </View>
              <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted, marginTop: SPACING.sm }}>
                Based on {stats.totalReviews} reviews
              </Text>
            </View>

            <View style={{ gap: SPACING.sm }}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = rating === 5 ? 72 : rating === 4 ? 18 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                return (
                  <View key={rating} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textLight, width: 20 }}>
                      {rating}
                    </Text>
                    <Star size={12} color={COLORS.gold} fill={COLORS.gold} style={{ marginRight: SPACING.sm }} />
                    <View
                      style={{
                        flex: 1,
                        height: 8,
                        backgroundColor: COLORS.mediumGray,
                        borderRadius: RADIUS.full,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: COLORS.gold,
                          borderRadius: RADIUS.full,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginLeft: SPACING.sm, width: 35 }}>
                      {percentage}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View
            style={{
              backgroundColor: COLORS.darkGray,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Users size={20} color={COLORS.gold} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.md,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: COLORS.textInverse,
                  marginLeft: SPACING.sm,
                }}
              >
                Client Insights
              </Text>
            </View>

            <View style={{ gap: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted }}>Total Clients</Text>
                <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textInverse }}>
                  {MOCK_CLIENTS.length}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted }}>VIP Clients</Text>
                <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.gold }}>
                  {MOCK_CLIENTS.filter((c) => c.isVip).length}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted }}>New This Month</Text>
                <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.success }}>
                  +{MOCK_CLIENTS.filter((c) => c.tags.includes('new')).length}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted }}>Avg Client Value</Text>
                <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textInverse }}>
                  ₪{Math.round(MOCK_CLIENTS.reduce((sum, c) => sum + c.totalSpent, 0) / MOCK_CLIENTS.length)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
