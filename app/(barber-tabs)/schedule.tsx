import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import Animated from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown } from '@/utils/animations';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { MOCK_BOOKINGS_BARBER, type MockBooking } from '@/constants/mockData';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

function DayButton({
  date,
  isSelected,
  hasBookings,
  onPress,
}: {
  date: Date;
  isSelected: boolean;
  hasBookings: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const dayName = format(date, 'EEE');
  const dayNumber = format(date, 'd');
  const isToday = isSameDay(date, new Date());

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dayButton,
        isSelected && styles.dayButtonSelected,
        isToday && !isSelected && styles.dayButtonToday,
      ]}
    >
      <Text
        style={[
          styles.dayName,
          isSelected && styles.dayNameSelected,
          isToday && !isSelected && styles.dayNameToday,
        ]}
      >
        {dayName}
      </Text>
      <Text
        style={[
          styles.dayNumber,
          isSelected && styles.dayNumberSelected,
          isToday && !isSelected && styles.dayNumberToday,
        ]}
      >
        {dayNumber}
      </Text>
      {hasBookings && (
        <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />
      )}
    </Pressable>
  );
}

function BookingTimelineCard({
  booking,
  onPress,
}: {
  booking: MockBooking;
  onPress: () => void;
}): React.JSX.Element {
  const time = format(new Date(booking.scheduledAt), 'h:mm a');
  const isCompleted = booking.status === 'completed';
  const isInProgress = booking.status === 'in_progress';

  return (
    <Animated.View entering={webSafeFadeInDown(0, 300)}>
      <Pressable onPress={onPress} style={styles.timelineContainer}>
        <View style={styles.timelineLine}>
          <View
            style={[
              styles.timelineNode,
              isCompleted && styles.timelineNodeCompleted,
              isInProgress && styles.timelineNodeActive,
            ]}
          >
            {isCompleted ? (
              <CheckCircle2 size={16} color={COLORS.success} />
            ) : isInProgress ? (
              <View style={styles.timelineNodeInner} />
            ) : (
              <Circle size={12} color={COLORS.textMuted} />
            )}
          </View>
          <View style={[styles.timelineConnector, isCompleted && styles.timelineConnectorCompleted]} />
        </View>

        <Surface style={[styles.bookingCard, isInProgress && styles.bookingCardActive]} elevation={2}>
          <View style={styles.bookingTime}>
            <Clock size={14} color={COLORS.gold} />
            <Text style={styles.bookingTimeText}>{time}</Text>
          </View>

          <View style={styles.bookingContent}>
            <View style={styles.bookingHeader}>
              <Avatar uri={booking.customerAvatar} name={booking.customerName} size={44} />
              <View style={styles.bookingInfo}>
                <Text style={styles.customerName}>{booking.customerName}</Text>
                <Text style={styles.servicesText}>{booking.services.join(' + ')}</Text>
              </View>
              <Text style={styles.bookingPrice}>₪{booking.totalPrice}</Text>
            </View>

            <View style={styles.bookingLocation}>
              <MapPin size={14} color={COLORS.textMuted} />
              <Text style={styles.locationText} numberOfLines={1}>
                {booking.address}
              </Text>
            </View>

            <View style={styles.bookingActions}>
              <Pressable style={styles.bookingActionButton}>
                <MessageCircle size={18} color={COLORS.goldDark} />
              </Pressable>
              <Pressable style={styles.bookingActionButton}>
                <Phone size={18} color={COLORS.goldDark} />
              </Pressable>
            </View>
          </View>
        </Surface>
      </Pressable>
    </Animated.View>
  );
}

export default function BarberScheduleScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfDay(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const bookings = MOCK_BOOKINGS_BARBER;
  const selectedDayBookings = bookings.filter((b) =>
    isSameDay(new Date(b.scheduledAt), selectedDate)
  );

  const hasBookingsOnDay = (date: Date) =>
    bookings.some((b) => isSameDay(new Date(b.scheduledAt), date));

  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  const handleBookingPress = useCallback((bookingId: string) => {
    router.push(`/(modals)/chat/${bookingId}`);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={webSafeFadeIn(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Schedule</Text>
          <View style={styles.headerIcon}>
            <Calendar size={20} color={COLORS.gold} />
          </View>
        </View>
        <Text style={styles.subtitle}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Text>
      </Animated.View>

      <View style={styles.weekPicker}>
        <Pressable onPress={goToPrevWeek} style={styles.weekNavButton}>
          <ChevronLeft size={24} color={COLORS.textMuted} />
        </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekDays}
        >
          {weekDays.map((day) => (
            <DayButton
              key={day.toISOString()}
              date={day}
              isSelected={isSameDay(day, selectedDate)}
              hasBookings={hasBookingsOnDay(day)}
              onPress={() => setSelectedDate(day)}
            />
          ))}
        </ScrollView>
        <Pressable onPress={goToNextWeek} style={styles.weekNavButton}>
          <ChevronRight size={24} color={COLORS.textMuted} />
        </Pressable>
      </View>

      <View style={styles.monthLabel}>
        <Text style={styles.monthLabelText}>{format(weekStart, 'MMMM yyyy')}</Text>
      </View>

      <ScrollView
        style={styles.scheduleList}
        contentContainerStyle={styles.scheduleContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedDayBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Calendar size={48} color={COLORS.gold} />
            </View>
            <Text style={styles.emptyTitle}>No appointments</Text>
            <Text style={styles.emptyText}>
              You have no scheduled appointments for this day
            </Text>
          </View>
        ) : (
          selectedDayBookings.map((booking) => (
            <BookingTimelineCard
              key={booking.id}
              booking={booking}
              onPress={() => handleBookingPress(booking.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
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
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  weekPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    backgroundColor: LIGHT_COLORS.surface,
    paddingVertical: SPACING.md,
  },
  weekNavButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  dayButton: {
    width: 48,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.gold,
  },
  dayButtonToday: {
    backgroundColor: LIGHT_COLORS.border,
  },
  dayName: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
  dayNameSelected: {
    color: LIGHT_COLORS.background,
  },
  dayNameToday: {
    color: LIGHT_COLORS.textPrimary,
  },
  dayNumber: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginTop: SPACING.xxs,
  },
  dayNumberSelected: {
    color: LIGHT_COLORS.background,
  },
  dayNumberToday: {
    color: LIGHT_COLORS.textPrimary,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    marginTop: SPACING.xs,
  },
  dayDotSelected: {
    backgroundColor: LIGHT_COLORS.background,
  },
  monthLabel: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: LIGHT_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  monthLabelText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
  scheduleList: {
    flex: 1,
  },
  scheduleContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  timelineContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineNodeCompleted: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  timelineNodeActive: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold,
  },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: LIGHT_COLORS.border,
    marginTop: SPACING.xxs,
  },
  timelineConnectorCompleted: {
    backgroundColor: COLORS.success,
  },
  bookingCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: LIGHT_COLORS.surface,
  },
  bookingCardActive: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  bookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  bookingTimeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
  },
  bookingContent: {
    gap: SPACING.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
  servicesText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  bookingPrice: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  bookingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: LIGHT_COLORS.border,
  },
  bookingActionButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
    marginTop: SPACING['4xl'],
  },
  emptyIcon: {
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
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
