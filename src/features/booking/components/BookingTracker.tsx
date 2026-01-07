import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MapPin, Clock, Phone, MessageCircle, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, formatDuration } from '@/constants/theme';
import type { BookingStatus } from '@/constants/theme';

interface BookingTrackerProps {
  status: BookingStatus;
  barberName: string;
  estimatedArrival?: number;
  currentStep: number;
}

const TRACKING_STEPS = [
  { id: 1, label: 'Booking Confirmed', icon: CheckCircle2 },
  { id: 2, label: 'Barber on the Way', icon: MapPin },
  { id: 3, label: 'Barber Arrived', icon: Clock },
  { id: 4, label: 'Service Complete', icon: CheckCircle2 },
];

export function BookingTracker({
  status,
  barberName,
  estimatedArrival,
  currentStep,
}: BookingTrackerProps): React.JSX.Element {
  const getStatusMessage = () => {
    switch (status) {
      case 'confirmed':
        return `${barberName} has accepted your booking`;
      case 'barber_en_route':
        return `${barberName} is on the way`;
      case 'arrived':
        return `${barberName} has arrived`;
      case 'in_progress':
        return 'Service in progress';
      case 'completed':
        return 'Service completed';
      default:
        return 'Waiting for confirmation';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
        {estimatedArrival && status === 'barber_en_route' && (
          <View style={styles.etaContainer}>
            <Clock size={16} color={COLORS.copper} />
            <Text style={styles.etaText}>
              ETA: {formatDuration(estimatedArrival)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stepsContainer}>
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const IconComponent = step.icon;

          return (
            <View key={step.id} style={styles.stepWrapper}>
              <View style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    isCompleted && styles.stepIconCompleted,
                    isCurrent && styles.stepIconCurrent,
                  ]}
                >
                  <IconComponent
                    size={18}
                    color={
                      isCompleted || isCurrent
                        ? COLORS.textInverse
                        : COLORS.textMuted
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (isCompleted || isCurrent) && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {index < TRACKING_STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionButton}>
          <Phone size={20} color={COLORS.copper} />
          <Text style={styles.actionLabel}>Call</Text>
        </View>
        <View style={styles.actionDivider} />
        <View style={styles.actionButton}>
          <MessageCircle size={20} color={COLORS.copper} />
          <Text style={styles.actionLabel}>Message</Text>
        </View>
      </View>
    </View>
  );
}

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps): React.JSX.Element {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: COLORS.warning, bg: COLORS.warningLight };
      case 'confirmed':
        return { label: 'Confirmed', color: COLORS.success, bg: COLORS.successLight };
      case 'barber_en_route':
        return { label: 'On the Way', color: COLORS.info, bg: COLORS.infoLight };
      case 'arrived':
        return { label: 'Arrived', color: COLORS.copper, bg: COLORS.copperMuted };
      case 'in_progress':
        return { label: 'In Progress', color: COLORS.navy, bg: COLORS.navyMuted };
      case 'completed':
        return { label: 'Completed', color: COLORS.success, bg: COLORS.successLight };
      case 'cancelled':
        return { label: 'Cancelled', color: COLORS.error, bg: COLORS.errorLight };
      default:
        return { label: 'Unknown', color: COLORS.textMuted, bg: COLORS.backgroundSecondary };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: config.color }]} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  statusMessage: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  etaText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.copper,
    fontWeight: TYPOGRAPHY.semibold,
  },
  stepsContainer: {
    marginBottom: SPACING.lg,
  },
  stepWrapper: {
    position: 'relative',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCompleted: {
    backgroundColor: COLORS.success,
  },
  stepIconCurrent: {
    backgroundColor: COLORS.copper,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
  },
  connector: {
    position: 'absolute',
    left: 17,
    top: 44,
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
  },
  connectorCompleted: {
    backgroundColor: COLORS.success,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.copper,
    fontWeight: TYPOGRAPHY.medium,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
