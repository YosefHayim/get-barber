import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Scissors,
  Sparkles,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, getStatusColor, getStatusLabel, type BookingStatus } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import {
  MOCK_BOOKINGS_CUSTOMER,
  MOCK_BOOKINGS_BARBER,
  type MockBooking,
} from '@/constants/mockData';

type TabType = 'upcoming' | 'past';

function getStatusIcon(status: BookingStatus) {
  switch (status) {
    case 'pending':
      return <AlertCircle size={14} color={getStatusColor('pending')} />;
    case 'confirmed':
      return <CheckCircle2 size={14} color={getStatusColor('confirmed')} />;
    case 'in_progress':
      return <Scissors size={14} color={getStatusColor('in_progress')} />;
    case 'completed':
      return <CheckCircle2 size={14} color={getStatusColor('completed')} />;
    case 'cancelled':
      return <XCircle size={14} color={getStatusColor('cancelled')} />;
    default:
      return null;
  }
}

function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
}

function formatBookingTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
}

interface BookingCardProps {
  booking: MockBooking;
  userMode: 'customer' | 'barber';
  onPress: () => void;
}

function BookingCard({ booking, userMode, onPress }: BookingCardProps): React.JSX.Element {
  const isUpcoming = !isPast(new Date(booking.scheduledAt)) && booking.status !== 'cancelled' && booking.status !== 'completed';
  const personName = userMode === 'barber' ? booking.customerName : booking.barberName;
  const personAvatar = userMode === 'barber' ? booking.customerAvatar : booking.barberAvatar;

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Pressable onPress={onPress}>
        <Surface style={styles.bookingCard} elevation={2}>
          <View style={styles.bookingHeader}>
            <Avatar uri={personAvatar} name={personName} size={48} />
            <View style={styles.bookingHeaderInfo}>
              <Text style={styles.personName}>{personName}</Text>
              <View style={styles.statusRow}>
                {getStatusIcon(booking.status)}
                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                  {getStatusLabel(booking.status)}
                </Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total</Text>
              <Text style={styles.priceAmount}>₪{booking.totalPrice}</Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Calendar size={14} color={COLORS.gold} />
              <Text style={styles.detailText}>{formatBookingDate(booking.scheduledAt)}</Text>
              <Clock size={14} color={COLORS.textMuted} style={{ marginLeft: SPACING.md }} />
              <Text style={styles.detailText}>{formatBookingTime(booking.scheduledAt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText} numberOfLines={1}>{booking.address}</Text>
            </View>
          </View>

          <View style={styles.servicesRow}>
            {booking.services.map((service, index) => (
              <View key={service} style={styles.serviceChip}>
                <Text style={styles.serviceChipText}>{service}</Text>
              </View>
            ))}
          </View>

          {booking.rating && (
            <View style={styles.ratingRow}>
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.ratingText}>{booking.rating}.0</Text>
              {booking.review && (
                <Text style={styles.reviewText} numberOfLines={1}>
                  "{booking.review}"
                </Text>
              )}
            </View>
          )}

          {isUpcoming && (
            <View style={styles.bookingActions}>
              <Button
                mode="contained"
                icon={() => <MessageCircle size={16} color={COLORS.textInverse} />}
                onPress={() => router.push(`/(modals)/chat/${booking.id}`)}
                compact
                style={[styles.actionButton, { backgroundColor: COLORS.goldDark }]}
                labelStyle={styles.actionButtonLabel}
              >
                Chat
              </Button>
              <Button
                mode="outlined"
                icon={() => <Phone size={16} color={COLORS.goldDark} />}
                onPress={() => {}}
                compact
                style={styles.actionButton}
                labelStyle={[styles.actionButtonLabel, { color: COLORS.goldDark }]}
              >
                Call
              </Button>
              <Pressable style={styles.moreButton}>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </Pressable>
            </View>
          )}
        </Surface>
      </Pressable>
    </Animated.View>
  );
}

function TabButton({
  label,
  count,
  isActive,
  onPress,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
          <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function BookingsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const userMode = useAppStore((s) => s.userMode);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const bookings = userMode === 'barber' ? MOCK_BOOKINGS_BARBER : MOCK_BOOKINGS_CUSTOMER;

  const upcomingBookings = bookings.filter(
    (b) => !isPast(new Date(b.scheduledAt)) && b.status !== 'cancelled' && b.status !== 'completed'
  );
  const pastBookings = bookings.filter(
    (b) => isPast(new Date(b.scheduledAt)) || b.status === 'cancelled' || b.status === 'completed'
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleBookingPress = useCallback((bookingId: string) => {
    router.push(`/(modals)/chat/${bookingId}`);
  }, []);

  const renderBooking = useCallback(
    ({ item }: { item: MockBooking }) => (
      <BookingCard
        booking={item}
        userMode={userMode}
        onPress={() => handleBookingPress(item.id)}
      />
    ),
    [userMode, handleBookingPress]
  );

  const keyExtractor = useCallback((item: MockBooking) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Bookings</Text>
          <View style={styles.headerIcon}>
            <Sparkles size={20} color={COLORS.gold} />
          </View>
        </View>
        <Text style={styles.subtitle}>
          {userMode === 'barber' ? 'Your scheduled appointments' : 'Your barber appointments'}
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        <TabButton
          label="Upcoming"
          count={upcomingBookings.length}
          isActive={activeTab === 'upcoming'}
          onPress={() => setActiveTab('upcoming')}
        />
        <TabButton
          label="Past"
          count={pastBookings.length}
          isActive={activeTab === 'past'}
          onPress={() => setActiveTab('past')}
        />
      </View>

      {displayedBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Calendar size={48} color={COLORS.gold} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming'
              ? userMode === 'barber'
                ? 'Accept requests to get started'
                : 'Book a barber to get started'
              : 'Your completed bookings will appear here'}
          </Text>
          {activeTab === 'upcoming' && userMode === 'customer' && (
            <Button
              mode="contained"
              onPress={() => router.push('/')}
              style={styles.emptyButton}
              labelStyle={styles.emptyButtonLabel}
            >
              Find a Barber
            </Button>
          )}
        </View>
      ) : (
        <FlashList
          data={displayedBookings}
          renderItem={renderBooking}
          keyExtractor={keyExtractor}
          estimatedItemSize={220}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.borderLight,
  },
  tabButtonActive: {
    backgroundColor: COLORS.goldDark,
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.textInverse,
  },
  tabBadge: {
    backgroundColor: COLORS.textMuted,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.surface,
  },
  tabBadgeTextActive: {
    color: COLORS.textInverse,
  },
  listContent: {
    padding: SPACING.lg,
  },
  separator: {
    height: SPACING.md,
  },
  bookingCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bookingHeaderInfo: {
    flex: 1,
  },
  personName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  priceAmount: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.goldDark,
  },
  bookingDetails: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  serviceChip: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  serviceChipText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.goldDark,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  reviewText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  bookingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.sm,
  },
  actionButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.goldDark,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
  },
  emptyButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
