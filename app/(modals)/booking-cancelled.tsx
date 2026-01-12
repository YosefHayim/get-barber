import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Easing,
} from 'react-native-reanimated';
import {
  X,
  CalendarX,
  CheckCircle,
  Search,
  CalendarDays,
  Clock,
  RefreshCcw,
  MapPin,
  User,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/theme';

// Light theme colors matching the design
const LIGHT = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e5e7eb',
  primary: '#11a4d4',
  primaryMuted: 'rgba(17, 164, 212, 0.1)',
  success: '#22c55e',
  successMuted: 'rgba(34, 197, 94, 0.15)',
};

const CANCELLATION_REASONS = [
  { id: 'plans', label: 'Changed plans' },
  { id: 'another', label: 'Found another barber' },
  { id: 'reschedule', label: 'Rescheduled' },
  { id: 'other', label: 'Other' },
];

interface CancelledBookingDetails {
  barberName?: string;
  date?: string;
  time?: string;
  serviceName?: string;
  price?: number;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'none';
}

export default function BookingCancelledScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{
    barberName?: string;
    date?: string;
    time?: string;
    serviceName?: string;
    price?: string;
    refundAmount?: string;
  }>();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Animation values
  const iconPulse = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);

  // Parse booking details from params
  const bookingDetails: CancelledBookingDetails = {
    barberName: params.barberName || 'Barber John',
    date: params.date || 'Oct 24',
    time: params.time,
    serviceName: params.serviceName,
    price: params.price ? parseFloat(params.price) : undefined,
    refundAmount: params.refundAmount ? parseFloat(params.refundAmount) : undefined,
    refundStatus: params.refundAmount ? 'processed' : 'none',
  };

  useEffect(() => {
    // Gentle pulse animation for the icon
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Checkmark entrance animation
    checkmarkScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const handleReasonSelect = useCallback((reasonId: string) => {
    setSelectedReason(reasonId);
    // In a real app, this would submit feedback to the backend
    setTimeout(() => {
      setFeedbackSubmitted(true);
    }, 300);
  }, []);

  const handleFindAnotherBarber = useCallback(() => {
    router.dismissAll();
    setTimeout(() => {
      router.push('/(modals)/search');
    }, 100);
  }, []);

  const handleViewBookings = useCallback(() => {
    router.dismissAll();
    setTimeout(() => {
      router.push('/(tabs)/bookings');
    }, 100);
  }, []);

  const handleClose = useCallback(() => {
    router.dismissAll();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={24} color={LIGHT.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.heroSection}
        >
          {/* Animated Icon */}
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconCircle, iconAnimatedStyle]}>
              <CalendarX size={64} color={LIGHT.primary} strokeWidth={1.5} />
            </Animated.View>

            {/* Success Checkmark */}
            <Animated.View style={[styles.checkmarkBadge, checkmarkAnimatedStyle]}>
              <CheckCircle size={32} color={LIGHT.success} fill={LIGHT.successMuted} />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Appointment Cancelled</Text>

          {/* Description */}
          <Text style={styles.description}>
            Your appointment with {bookingDetails.barberName} for {bookingDetails.date} has been successfully cancelled.
            {bookingDetails.refundStatus === 'none' && ' You will not be charged.'}
          </Text>
        </Animated.View>

        {/* Refund Information (if applicable) */}
        {bookingDetails.refundAmount && bookingDetails.refundAmount > 0 && (
          <Animated.View
            entering={SlideInUp.delay(200).duration(400)}
            style={styles.refundCard}
          >
            <View style={styles.refundIcon}>
              <RefreshCcw size={20} color={LIGHT.success} />
            </View>
            <View style={styles.refundContent}>
              <Text style={styles.refundTitle}>Refund Initiated</Text>
              <Text style={styles.refundAmount}>₪{bookingDetails.refundAmount.toFixed(0)}</Text>
              <Text style={styles.refundNote}>
                Will be credited to your original payment method within 5-7 business days
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Cancelled Booking Details */}
        {(bookingDetails.serviceName || bookingDetails.time) && (
          <Animated.View
            entering={SlideInUp.delay(300).duration(400)}
            style={styles.detailsCard}
          >
            <Text style={styles.detailsTitle}>Cancelled Booking</Text>
            
            <View style={styles.detailsGrid}>
              {bookingDetails.barberName && (
                <View style={styles.detailRow}>
                  <User size={16} color={LIGHT.textMuted} />
                  <Text style={styles.detailText}>{bookingDetails.barberName}</Text>
                </View>
              )}
              
              {bookingDetails.date && (
                <View style={styles.detailRow}>
                  <CalendarDays size={16} color={LIGHT.textMuted} />
                  <Text style={styles.detailText}>{bookingDetails.date}</Text>
                </View>
              )}
              
              {bookingDetails.time && (
                <View style={styles.detailRow}>
                  <Clock size={16} color={LIGHT.textMuted} />
                  <Text style={styles.detailText}>{bookingDetails.time}</Text>
                </View>
              )}
              
              {bookingDetails.serviceName && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={LIGHT.textMuted} />
                  <Text style={styles.detailText}>{bookingDetails.serviceName}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Feedback Module */}
        <Animated.View
          entering={SlideInUp.delay(400).duration(400)}
          style={styles.feedbackSection}
        >
          <Text style={styles.feedbackTitle}>
            {feedbackSubmitted ? 'Thanks for your feedback!' : 'Reason for cancellation?'}
          </Text>

          {!feedbackSubmitted && (
            <View style={styles.reasonsContainer}>
              {CANCELLATION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  onPress={() => handleReasonSelect(reason.id)}
                  style={[
                    styles.reasonChip,
                    selectedReason === reason.id && styles.reasonChipSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason.id && styles.reasonTextSelected,
                    ]}
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {feedbackSubmitted && (
            <View style={styles.feedbackSuccess}>
              <CheckCircle size={20} color={LIGHT.success} />
              <Text style={styles.feedbackSuccessText}>
                Your feedback helps us improve
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: SPACING['3xl'] }} />
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View
        entering={SlideInUp.delay(500).duration(400)}
        style={styles.bottomActions}
      >
        {/* Primary Action */}
        <TouchableOpacity
          onPress={handleFindAnotherBarber}
          style={styles.primaryButton}
          activeOpacity={0.85}
        >
          <Search size={20} color={LIGHT.surface} strokeWidth={2.5} />
          <Text style={styles.primaryButtonText}>Find Another Barber</Text>
        </TouchableOpacity>

        {/* Secondary Action */}
        <TouchableOpacity
          onPress={handleViewBookings}
          style={styles.secondaryButton}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    flexGrow: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: LIGHT.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBadge: {
    position: 'absolute',
    right: -4,
    top: 0,
    backgroundColor: LIGHT.surface,
    borderRadius: 16,
    padding: 2,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.extrabold,
    color: LIGHT.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    color: LIGHT.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  refundCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT.successMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  refundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refundContent: {
    flex: 1,
  },
  refundTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT.success,
    marginBottom: SPACING.xxs,
  },
  refundAmount: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT.textPrimary,
    marginBottom: SPACING.xs,
  },
  refundNote: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT.textSecondary,
    lineHeight: 16,
  },
  detailsCard: {
    backgroundColor: LIGHT.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: LIGHT.border,
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT.textPrimary,
  },
  feedbackSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  feedbackTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    maxWidth: 340,
  },
  reasonChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: LIGHT.surface,
    borderWidth: 1,
    borderColor: LIGHT.border,
  },
  reasonChipSelected: {
    backgroundColor: LIGHT.primaryMuted,
    borderColor: LIGHT.primary,
  },
  reasonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT.textPrimary,
  },
  reasonTextSelected: {
    color: LIGHT.primary,
  },
  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  feedbackSuccessText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT.success,
    fontWeight: TYPOGRAPHY.medium,
  },
  bottomActions: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    backgroundColor: LIGHT.background,
    gap: SPACING.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT.primary,
    height: 52,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT.surface,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.md,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT.textPrimary,
  },
});
