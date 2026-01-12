import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Zap,
  Target,
  Award,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown } from '@/utils/animations';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { MOCK_BARBER_STATS } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

type PeriodType = 'day' | 'week' | 'month';

function PeriodButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.periodButton, isActive && styles.periodButtonActive]}
    >
      <Text style={[styles.periodButtonText, isActive && styles.periodButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EarningsChart(): React.JSX.Element {
  const bars = [65, 45, 80, 55, 90, 75, 100];
  const maxHeight = 120;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {bars.map((value, index) => (
          <View key={index} style={styles.chartBarContainer}>
            <View
              style={[
                styles.chartBar,
                {
                  height: (value / 100) * maxHeight,
                  backgroundColor: index === bars.length - 1 ? COLORS.gold : LIGHT_COLORS.border,
                },
              ]}
            />
            <Text style={styles.chartLabel}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  change,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
  delay?: number;
}): React.JSX.Element {
  return (
    <Animated.View entering={webSafeFadeInDown(delay, 300)}>
      <Surface style={styles.statRow} elevation={2}>
        <View style={styles.statRowIcon}>{icon}</View>
        <View style={styles.statRowContent}>
          <Text style={styles.statRowLabel}>{label}</Text>
          <Text style={styles.statRowValue}>{value}</Text>
        </View>
        {change && (
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: change.positive ? COLORS.successLight : COLORS.errorLight },
            ]}
          >
            {change.positive ? (
              <TrendingUp size={12} color={COLORS.success} />
            ) : (
              <TrendingDown size={12} color={COLORS.error} />
            )}
            <Text
              style={[
                styles.changeText,
                { color: change.positive ? COLORS.success : COLORS.error },
              ]}
            >
              {change.value}
            </Text>
          </View>
        )}
        <ChevronRight size={18} color={COLORS.textMuted} />
      </Surface>
    </Animated.View>
  );
}

export default function BarberEarningsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodType>('week');
  const stats = MOCK_BARBER_STATS;

  const getPeriodEarnings = () => {
    switch (period) {
      case 'day':
        return stats.todayEarnings;
      case 'week':
        return stats.weeklyEarnings;
      case 'month':
        return stats.monthlyEarnings;
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={webSafeFadeIn(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Earnings</Text>
          <View style={styles.headerIcon}>
            <TrendingUp size={20} color={COLORS.gold} />
          </View>
        </View>
      </Animated.View>

      <View style={styles.periodPicker}>
        <PeriodButton
          label="Today"
          isActive={period === 'day'}
          onPress={() => setPeriod('day')}
        />
        <PeriodButton
          label="This Week"
          isActive={period === 'week'}
          onPress={() => setPeriod('week')}
        />
        <PeriodButton
          label="This Month"
          isActive={period === 'month'}
          onPress={() => setPeriod('month')}
        />
      </View>

      <Animated.View entering={webSafeFadeInDown(100, 300)}>
        <Surface style={styles.earningsCard} elevation={3}>
          <Text style={styles.earningsLabel}>{getPeriodLabel()} Earnings</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsAmount}>₪{getPeriodEarnings().toLocaleString()}</Text>
            <View style={styles.earningsChange}>
              <TrendingUp size={16} color={COLORS.success} />
              <Text style={styles.earningsChangeText}>+12%</Text>
            </View>
          </View>
          <Text style={styles.earningsSubtext}>
            Compared to last {period === 'day' ? 'day' : period === 'week' ? 'week' : 'month'}
          </Text>

          <EarningsChart />
        </Surface>
      </Animated.View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Performance</Text>

        <StatRow
          icon={<Calendar size={20} color={COLORS.info} />}
          label="Total Bookings"
          value={stats.totalBookings.toString()}
          change={{ value: '+8', positive: true }}
          delay={150}
        />
        <StatRow
          icon={<Clock size={20} color={COLORS.warning} />}
          label="Response Rate"
          value={`${stats.responseRate}%`}
          change={{ value: '+2%', positive: true }}
          delay={200}
        />
        <StatRow
          icon={<Target size={20} color={COLORS.success} />}
          label="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          delay={250}
        />
        <StatRow
          icon={<Star size={20} color={COLORS.gold} />}
          label="Average Rating"
          value={stats.averageRating.toString()}
          change={{ value: '+0.1', positive: true }}
          delay={300}
        />
      </View>

      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>Goals</Text>

        <Animated.View entering={webSafeFadeInDown(350, 300)}>
          <Surface style={styles.goalCard} elevation={2}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Award size={24} color={COLORS.gold} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Weekly Target</Text>
                <Text style={styles.goalSubtext}>₪2,450 of ₪3,000</Text>
              </View>
              <Text style={styles.goalPercentage}>82%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '82%' }]} />
            </View>
            <View style={styles.goalFooter}>
              <Zap size={14} color={COLORS.gold} />
              <Text style={styles.goalFooterText}>₪550 to go! You're doing great!</Text>
            </View>
          </Surface>
        </Animated.View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Tips to Earn More</Text>
        
        <Animated.View entering={webSafeFadeInDown(400, 300)}>
          <Surface style={styles.tipCard} elevation={1}>
            <View style={styles.tipIcon}>
              <Clock size={18} color={COLORS.goldDark} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay online during peak hours</Text>
              <Text style={styles.tipText}>5-8 PM on weekdays has the most requests</Text>
            </View>
          </Surface>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(450, 300)}>
          <Surface style={styles.tipCard} elevation={1}>
            <View style={styles.tipIcon}>
              <Star size={18} color={COLORS.goldDark} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Maintain high ratings</Text>
              <Text style={styles.tipText}>Barbers with 4.8+ ratings get 40% more requests</Text>
            </View>
          </Surface>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodPicker: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: LIGHT_COLORS.surface,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.gold,
  },
  periodButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textMuted,
  },
  periodButtonTextActive: {
    color: COLORS.charcoal,
    fontWeight: TYPOGRAPHY.semibold,
  },
  earningsCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    backgroundColor: LIGHT_COLORS.surface,
  },
  earningsLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },
  earningsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  earningsChangeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.success,
  },
  earningsSubtext: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  chartContainer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: LIGHT_COLORS.border,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: SPACING.sm,
  },
  chartBarContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chartBar: {
    width: 28,
    borderRadius: RADIUS.xs,
  },
  chartLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
  statsSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  statRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statRowContent: {
    flex: 1,
  },
  statRowLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  statRowValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginTop: SPACING.xxs,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  changeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
  goalsSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  goalCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
  goalSubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  goalPercentage: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: LIGHT_COLORS.border,
    borderRadius: 4,
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  goalFooterText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.medium,
  },
  tipsSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
  tipText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
});
