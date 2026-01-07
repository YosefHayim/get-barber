import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Zap,
  TrendingUp,
  Calendar,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  DollarSign,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import {
  MOCK_BARBER_STATS,
  MOCK_SERVICE_REQUESTS,
  MOCK_BOOKINGS_BARBER,
  type MockServiceRequest,
} from '@/constants/mockData';

function StatCard({
  icon,
  label,
  value,
  subValue,
  color,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  delay?: number;
}): React.JSX.Element {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)} style={styles.statCard}>
      <Surface style={styles.statCardInner} elevation={2}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
      </Surface>
    </Animated.View>
  );
}

function RequestPreviewCard({
  request,
  onPress,
}: {
  request: MockServiceRequest;
  onPress: () => void;
}): React.JSX.Element {
  const isNew = request.status === 'new';
  const expiresIn = Math.max(
    0,
    Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 60000)
  );

  return (
    <Pressable onPress={onPress}>
      <Surface style={[styles.requestCard, isNew && styles.requestCardNew]} elevation={2}>
        <View style={styles.requestHeader}>
          <Avatar uri={request.customerAvatar} name={request.customerName} size={44} />
          <View style={styles.requestInfo}>
            <View style={styles.requestNameRow}>
              <Text style={styles.requestName}>{request.customerName}</Text>
              {isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <View style={styles.requestRatingRow}>
              <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.requestRating}>{request.customerRating}</Text>
              <Text style={styles.requestDivider}>•</Text>
              <MapPin size={12} color={COLORS.textMuted} />
              <Text style={styles.requestDistance}>
                {(request.distanceMeters / 1000).toFixed(1)} km
              </Text>
            </View>
          </View>
          <View style={styles.requestTime}>
            <Clock size={14} color={expiresIn < 10 ? COLORS.error : COLORS.warning} />
            <Text
              style={[
                styles.requestTimeText,
                { color: expiresIn < 10 ? COLORS.error : COLORS.warning },
              ]}
            >
              {expiresIn}m
            </Text>
          </View>
        </View>

        <View style={styles.requestServices}>
          {request.services.map((service) => (
            <View key={service} style={styles.requestServiceChip}>
              <Text style={styles.requestServiceText}>{service}</Text>
            </View>
          ))}
        </View>

        <View style={styles.requestFooter}>
          <Text style={styles.requestAddress} numberOfLines={1}>
            {request.address}
          </Text>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </View>
      </Surface>
    </Pressable>
  );
}

export default function BarberDashboardScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isOnline = useAppStore((s) => s.isBarberOnline);
  const toggleOnline = useAppStore((s) => s.toggleBarberOnline);

  const stats = MOCK_BARBER_STATS;
  const newRequests = MOCK_SERVICE_REQUESTS.filter((r) => r.status === 'new');
  const upcomingBookings = MOCK_BOOKINGS_BARBER.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress'
  );

  const handleRequestPress = useCallback((requestId: string) => {
    router.push(`/(modals)/chat/${requestId}`);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.businessName}>Yossi's Barbershop</Text>
          </View>
          <Avatar uri={null} name="Yossi Cohen" size={52} />
        </View>

        <Surface style={styles.statusCard} elevation={3}>
          <View style={styles.statusContent}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isOnline ? COLORS.success : COLORS.textMuted },
                ]}
              />
              <View>
                <Text style={styles.statusLabel}>
                  {isOnline ? 'You are online' : 'You are offline'}
                </Text>
                <Text style={styles.statusSubtext}>
                  {isOnline
                    ? 'Accepting new requests'
                    : 'Not visible to customers'}
                </Text>
              </View>
            </View>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: COLORS.borderLight, true: COLORS.goldMuted }}
              thumbColor={isOnline ? COLORS.gold : COLORS.textMuted}
            />
          </View>
        </Surface>
      </Animated.View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={<DollarSign size={20} color={COLORS.success} />}
          label="Today"
          value={`₪${stats.todayEarnings}`}
          color={COLORS.success}
          delay={100}
        />
        <StatCard
          icon={<TrendingUp size={20} color={COLORS.gold} />}
          label="This Week"
          value={`₪${stats.weeklyEarnings}`}
          color={COLORS.gold}
          delay={150}
        />
        <StatCard
          icon={<CheckCircle2 size={20} color={COLORS.info} />}
          label="Completed"
          value={stats.completedToday.toString()}
          subValue="Today"
          color={COLORS.info}
          delay={200}
        />
        <StatCard
          icon={<Star size={20} color={COLORS.warning} />}
          label="Rating"
          value={stats.averageRating.toString()}
          subValue={`${stats.totalReviews} reviews`}
          color={COLORS.warning}
          delay={250}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Zap size={18} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>New Requests</Text>
          </View>
          {newRequests.length > 0 && (
            <Pressable onPress={() => router.push('/(barber-tabs)/requests')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          )}
        </View>

        {newRequests.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <AlertCircle size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No new requests</Text>
            <Text style={styles.emptySubtext}>
              {isOnline
                ? 'Stay tuned for incoming requests'
                : 'Go online to receive requests'}
            </Text>
          </Surface>
        ) : (
          <View style={styles.requestsList}>
            {newRequests.slice(0, 2).map((request) => (
              <RequestPreviewCard
                key={request.id}
                request={request}
                onPress={() => handleRequestPress(request.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
          </View>
          <Pressable onPress={() => router.push('/(barber-tabs)/schedule')}>
            <Text style={styles.seeAllText}>View All</Text>
          </Pressable>
        </View>

        {upcomingBookings.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Calendar size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No appointments today</Text>
            <Text style={styles.emptySubtext}>Accept requests to fill your schedule</Text>
          </Surface>
        ) : (
          <View style={styles.scheduleList}>
            {upcomingBookings.map((booking) => (
              <Surface key={booking.id} style={styles.scheduleCard} elevation={2}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.scheduleTimeText}>
                    {new Date(booking.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleCustomer}>{booking.customerName}</Text>
                  <Text style={styles.scheduleServices}>
                    {booking.services.join(' + ')}
                  </Text>
                  <View style={styles.scheduleAddressRow}>
                    <MapPin size={12} color={COLORS.textMuted} />
                    <Text style={styles.scheduleAddress} numberOfLines={1}>
                      {booking.address}
                    </Text>
                  </View>
                </View>
                <Text style={styles.schedulePrice}>₪{booking.totalPrice}</Text>
              </Surface>
            ))}
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <Pressable style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.goldMuted }]}>
              <Users size={20} color={COLORS.goldDark} />
            </View>
            <Text style={styles.quickActionLabel}>My Clients</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.infoLight }]}>
              <TrendingUp size={20} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionLabel}>Analytics</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.successLight }]}>
              <Sparkles size={20} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionLabel}>Promotions</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },
  header: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  businessName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginTop: SPACING.xxs,
  },
  statusCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
  },
  statusSubtext: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    width: '47%',
  },
  statCardInner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  statSubValue: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gold,
    marginTop: SPACING.xxs,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.medium,
  },
  emptyCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.darkGray,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textInverse,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  requestsList: {
    gap: SPACING.md,
  },
  requestCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
  },
  requestCardNew: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  requestInfo: {
    flex: 1,
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  requestName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
  },
  newBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.xs,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.charcoal,
  },
  requestRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
  },
  requestRating: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textInverse,
  },
  requestDivider: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xxs,
  },
  requestDistance: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  requestTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  requestTimeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
  requestServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  requestServiceChip: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  requestServiceText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.gold,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  requestAddress: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  scheduleList: {
    gap: SPACING.md,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
    gap: SPACING.md,
  },
  scheduleTime: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  scheduleTimeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  scheduleInfo: {
    flex: 1,
    gap: SPACING.xxs,
  },
  scheduleCustomer: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
  },
  scheduleServices: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  scheduleAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  scheduleAddress: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  schedulePrice: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  quickActions: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  quickActionsTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
});
