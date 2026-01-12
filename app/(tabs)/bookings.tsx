import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { format, isToday, isTomorrow, isPast, differenceInHours } from 'date-fns';
import {
  Calendar,
  Clock,
  MessageCircle,
  ChevronLeft,
  Navigation,
  CalendarDays,
  History,
  Check,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';

import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import {
  MOCK_BOOKINGS_CUSTOMER,
  MOCK_BOOKINGS_BARBER,
  type MockBooking,
} from '@/constants/mockData';

const DESIGN_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#e5e7eb',
  textPrimary: '#111618',
  textSecondary: '#6b7280',
  primary: '#135bec',
  border: '#e5e7eb',
  confirmedBg: '#dcfce7',
  confirmedText: '#15803d',
  upcomingBg: '#dbeafe',
  upcomingText: '#1d4ed8',
  pendingBg: '#fef3c7',
  pendingText: '#a16207',
};

type TabType = 'confirmed' | 'pending';

function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
}

function formatBookingTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'HH:mm');
}

function getTimeUntil(dateString: string): string | null {
  const date = new Date(dateString);
  const now = new Date();
  const hours = differenceInHours(date, now);
  if (hours > 0 && hours <= 24) {
    return `in ${hours} hrs`;
  }
  return null;
}

function getStatusConfig(status: string, isImmediate: boolean) {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        bgColor: DESIGN_COLORS.confirmedBg,
        textColor: DESIGN_COLORS.confirmedText,
      };
    case 'pending':
      return {
        label: 'Pending',
        bgColor: DESIGN_COLORS.pendingBg,
        textColor: DESIGN_COLORS.pendingText,
      };
    case 'completed':
      return {
        label: 'Completed',
        bgColor: DESIGN_COLORS.upcomingBg,
        textColor: DESIGN_COLORS.upcomingText,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bgColor: '#fee2e2',
        textColor: '#b91c1c',
      };
    case 'upcoming':
      return {
        label: 'Upcoming',
        bgColor: DESIGN_COLORS.upcomingBg,
        textColor: DESIGN_COLORS.upcomingText,
      };
    default:
      return {
        label: 'Upcoming',
        bgColor: DESIGN_COLORS.upcomingBg,
        textColor: DESIGN_COLORS.upcomingText,
      };
  }
}

interface BookingCardProps {
  booking: MockBooking;
  userMode: 'customer' | 'barber';
  onPress: () => void;
  isPending?: boolean;
}

function BookingCard({ booking, userMode, onPress, isPending }: BookingCardProps): React.JSX.Element {
  const isUpcoming = !isPast(new Date(booking.scheduledAt)) && booking.status !== 'cancelled' && booking.status !== 'completed';
  const personName = userMode === 'barber' ? booking.customerName : booking.barberName;
  const personAvatar = userMode === 'barber' ? booking.customerAvatar : booking.barberAvatar;
  const isImmediate = isToday(new Date(booking.scheduledAt)) && isUpcoming;
  const statusConfig = getStatusConfig(
    isPending ? 'pending' : booking.status,
    isImmediate
  );
  // For confirmed but not immediate bookings, show "Upcoming" status
  const displayStatusConfig = booking.status === 'confirmed' && !isImmediate && !isPending
    ? getStatusConfig('upcoming', false)
    : statusConfig;
  const timeUntil = getTimeUntil(booking.scheduledAt);

  return (
    <Animated.View entering={webSafeFadeInDown(0, 300)}>
      <Pressable onPress={onPress}>
        <View style={[
          styles.bookingCard,
          isPending && styles.bookingCardPending,
        ]}>
          {/* Urgency Indicator Stripe - only for confirmed immediate bookings */}
          {isImmediate && !isPending && <View style={styles.urgencyStripe} />}

          <View style={styles.cardContent}>
            {/* Barber/Customer Image */}
            <View style={styles.avatarSection}>
              <Image
                source={{
                  uri: personAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                }}
                style={[styles.avatar, isPending && styles.avatarPending]}
              />
              {/* Confirmed checkmark badge */}
              {booking.status === 'confirmed' && !isPending && (
                <View style={styles.confirmedBadge}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </View>
              )}
              {/* Pending pulsing dot */}
              {isPending && (
                <View style={styles.pendingDot}>
                  <View style={styles.pendingDotCore} />
                </View>
              )}
            </View>

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.headerRow}>
                <Text style={styles.personName} numberOfLines={1}>{personName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: displayStatusConfig.bgColor }]}>
                  <Text style={[styles.statusText, { color: displayStatusConfig.textColor }]}>
                    {displayStatusConfig.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.servicesText} numberOfLines={1}>
                {booking.services.join(' + ')}
              </Text>

              <View style={styles.timeRow}>
                {isPending ? (
                  <Clock size={16} color="#eab308" />
                ) : isImmediate ? (
                  <Clock size={16} color={DESIGN_COLORS.primary} />
                ) : (
                  <CalendarDays size={16} color={DESIGN_COLORS.textSecondary} />
                )}
                <Text style={styles.timeText}>
                  {isPending ? 'Req: ' : ''}{formatBookingDate(booking.scheduledAt)}, {formatBookingTime(booking.scheduledAt)}
                </Text>
                {timeUntil && !isPending && (
                  <>
                    <Text style={styles.timeSeparator}>•</Text>
                    <Text style={styles.timeUntilText}>{timeUntil}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Actions for immediate confirmed bookings */}
          {isUpcoming && !isPending && isImmediate && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={() => router.push(`/(modals)/booking-tracker/${booking.id}`)}
              >
                <Navigation size={16} color="#fff" />
                <Text style={styles.primaryActionText}>Track Arrival</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => router.push(`/(modals)/chat/${booking.id}`)}
              >
                <MessageCircle size={18} color={DESIGN_COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Footer for non-immediate confirmed bookings */}
          {isUpcoming && !isPending && !isImmediate && (
            <View style={styles.footerRow}>
              <TouchableOpacity>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel button for pending bookings */}
          {isPending && (
            <View style={styles.pendingActions}>
              <TouchableOpacity style={styles.cancelRequestButton}>
                <Text style={styles.cancelRequestText}>Cancel Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function BookingsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const userMode = useAppStore((s) => s.userMode);
  const [activeTab, setActiveTab] = useState<TabType>('confirmed');

  const bookings = userMode === 'barber' ? MOCK_BOOKINGS_BARBER : MOCK_BOOKINGS_CUSTOMER;

  const confirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed' && !isPast(new Date(b.scheduledAt))
  );
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  const displayedBookings = activeTab === 'confirmed' ? confirmedBookings : pendingBookings;

  const handleBookingPress = useCallback((bookingId: string) => {
    router.push(`/(modals)/chat/${bookingId}`);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <ChevronLeft size={24} color={DESIGN_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.headerButton}>
          <History size={22} color={DESIGN_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'confirmed' && styles.tabActive]}
            onPress={() => setActiveTab('confirmed')}
          >
            <Text style={[styles.tabText, activeTab === 'confirmed' && styles.tabTextActive]}>
              Confirmed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'confirmed' ? 'Upcoming Appointments' : 'Pending Requests'}
          </Text>
          {activeTab === 'confirmed' && (
            <TouchableOpacity>
              <Text style={styles.seeCalendarText}>See Calendar</Text>
            </TouchableOpacity>
          )}
          {activeTab === 'pending' && pendingBookings.length > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{pendingBookings.length} New</Text>
            </View>
          )}
        </View>

        {/* Bookings List or Empty State */}
        {displayedBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color={DESIGN_COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'confirmed' ? 'No upcoming bookings' : 'No pending requests'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'confirmed'
                ? 'Book a barber to get started'
                : 'Your pending requests will appear here'}
            </Text>
            {activeTab === 'confirmed' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.emptyButtonText}>Find a Barber</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {displayedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userMode={userMode}
                onPress={() => handleBookingPress(booking.id)}
                isPending={activeTab === 'pending'}
              />
            ))}
          </View>
        )}

        {/* Pending Requests Section (shown when on Confirmed tab and there are pending) */}
        {activeTab === 'confirmed' && pendingBookings.length > 0 && (
          <>
            <View style={[styles.sectionHeader, styles.pendingSection]}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{pendingBookings.length} New</Text>
              </View>
            </View>
            <View style={styles.bookingsList}>
              {pendingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  userMode={userMode}
                  onPress={() => handleBookingPress(booking.id)}
                  isPending
                />
              ))}
            </View>
          </>
        )}

        {/* Bottom padding for scroll */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: DESIGN_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  tabsWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: DESIGN_COLORS.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: DESIGN_COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: 4,
    height: 48,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  tabActive: {
    backgroundColor: DESIGN_COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
  },
  tabTextActive: {
    color: DESIGN_COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  pendingSection: {
    marginTop: SPACING.xl,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_COLORS.textPrimary,
  },
  seeCalendarText: {
    fontSize: 12,
    fontWeight: '500',
    color: DESIGN_COLORS.primary,
  },
  newBadge: {
    backgroundColor: DESIGN_COLORS.pendingBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: DESIGN_COLORS.pendingText,
  },
  bookingsList: {
    gap: SPACING.lg,
  },
  bookingCard: {
    backgroundColor: DESIGN_COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingCardPending: {
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    opacity: 0.9,
  },
  urgencyStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: DESIGN_COLORS.primary,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  avatarSection: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: DESIGN_COLORS.surfaceHighlight,
  },
  avatarPending: {
    opacity: 0.8,
  },
  confirmedBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: DESIGN_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
  },
  pendingDotCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#eab308',
  },
  detailsSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  personName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesText: {
    fontSize: 14,
    color: DESIGN_COLORS.textSecondary,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_COLORS.textPrimary,
  },
  timeSeparator: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
  },
  timeUntilText: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: DESIGN_COLORS.primary,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryAction: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: DESIGN_COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: DESIGN_COLORS.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  viewDetailsButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: DESIGN_COLORS.surfaceHighlight,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_COLORS.textPrimary,
  },
  pendingActions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    marginTop: 4,
  },
  cancelRequestButton: {
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRequestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(19, 91, 236, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: DESIGN_COLORS.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
