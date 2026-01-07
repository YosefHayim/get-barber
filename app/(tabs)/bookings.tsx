import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { format, isToday, isTomorrow, isPast, differenceInHours } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  ChevronRight,
  Navigation,
  CalendarDays,
  History,
  X,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import {
  MOCK_BOOKINGS_CUSTOMER,
  MOCK_BOOKINGS_BARBER,
  type MockBooking,
} from '@/constants/mockData';

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

function getStatusConfig(status: string) {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        textColor: '#4ade80',
      };
    case 'pending':
      return {
        label: 'Pending',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        textColor: '#fbbf24',
      };
    case 'completed':
      return {
        label: 'Completed',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        textColor: '#60a5fa',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        textColor: '#f87171',
      };
    default:
      return {
        label: 'Upcoming',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        textColor: '#60a5fa',
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
  const statusConfig = getStatusConfig(booking.status);
  const timeUntil = getTimeUntil(booking.scheduledAt);
  const isImmediate = isToday(new Date(booking.scheduledAt)) && isUpcoming;

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Pressable onPress={onPress}>
        <View style={[styles.bookingCard, isPending && styles.bookingCardPending]}>
          {isImmediate && <View style={styles.urgencyStripe} />}
          
          <View style={styles.cardContent}>
            <View style={styles.avatarSection}>
              <Image
                source={{
                  uri: personAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                }}
                style={[styles.avatar, isPending && styles.avatarPending]}
              />
              {booking.status === 'confirmed' && (
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedBadgeIcon}>✓</Text>
                </View>
              )}
              {isPending && (
                <View style={styles.pendingDot}>
                  <Animated.View style={styles.pendingDotPing} />
                  <View style={styles.pendingDotCore} />
                </View>
              )}
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.headerRow}>
                <Text style={styles.personName} numberOfLines={1}>{personName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.servicesText} numberOfLines={1}>
                {booking.services.join(' + ')}
              </Text>

              <View style={styles.timeRow}>
                {isPending ? (
                  <Clock size={16} color="#fbbf24" />
                ) : isImmediate ? (
                  <Clock size={16} color={DARK_COLORS.primary} />
                ) : (
                  <CalendarDays size={16} color={DARK_COLORS.textMuted} />
                )}
                <Text style={styles.timeText}>
                  {isPending ? 'Req: ' : ''}{formatBookingDate(booking.scheduledAt)}, {formatBookingTime(booking.scheduledAt)}
                </Text>
                {timeUntil && (
                  <>
                    <Text style={styles.timeSeparator}>•</Text>
                    <Text style={styles.timeUntilText}>{timeUntil}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {isUpcoming && !isPending && (
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
                <MessageCircle size={18} color={DARK_COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <ChevronRight size={24} color={DARK_COLORS.textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.headerButton}>
          <History size={22} color={DARK_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

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
            {pendingBookings.length > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingBookings.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {displayedBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color={DARK_COLORS.primary} />
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
            {displayedBookings.map((booking, index) => (
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
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
    color: DARK_COLORS.textPrimary,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: DARK_COLORS.background,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textMuted,
  },
  tabTextActive: {
    color: DARK_COLORS.primary,
  },
  pendingBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  seeCalendarText: {
    fontSize: 13,
    fontWeight: '500',
    color: DARK_COLORS.primary,
  },
  newBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  bookingCardPending: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.95,
  },
  urgencyStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: DARK_COLORS.primary,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.surfaceLight,
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
    borderColor: DARK_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedBadgeIcon: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  pendingDot: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  pendingDotPing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.75)',
  },
  pendingDotCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fbbf24',
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
    color: DARK_COLORS.textPrimary,
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
    color: DARK_COLORS.textSecondary,
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
    color: DARK_COLORS.textPrimary,
  },
  timeSeparator: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
  timeUntilText: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.primary,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryAction: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.textMuted,
  },
  viewDetailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.surfaceLight,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  pendingActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 4,
  },
  cancelRequestButton: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRequestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f87171',
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
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: DARK_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
