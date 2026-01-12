import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { Bell, Calendar, Tag, MapPin, Clock } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

interface NotificationOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  recommended?: boolean;
}

function NotificationOption({
  icon,
  title,
  description,
  value,
  onValueChange,
  recommended,
}: NotificationOptionProps): React.JSX.Element {
  return (
    <Surface style={styles.optionCard} elevation={1}>
      <View style={styles.optionIcon}>{icon}</View>
      <View style={styles.optionContent}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{title}</Text>
          {recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: LIGHT_COLORS.border, true: COLORS.goldMuted }}
        thumbColor={value ? COLORS.gold : LIGHT_COLORS.surface}
      />
    </Surface>
  );
}

export default function CustomerNotificationsScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const customerData = useOnboardingStore((s) => s.customerData);
  const setCustomerNotifications = useOnboardingStore((s) => s.setCustomerNotifications);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleNext = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/customer/complete');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <OnboardingLayout
      title="Stay in the loop"
      subtitle="Choose which notifications you'd like to receive"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
    >
      <View style={styles.content}>
        <Animated.View entering={webSafeFadeInDown(100, 400)} style={styles.infoCard}>
          <Bell size={20} color={COLORS.gold} />
          <Text style={styles.infoText}>
            You can always change these settings later in your profile
          </Text>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.options}>
          <NotificationOption
            icon={<Calendar size={24} color={COLORS.goldDark} />}
            title="Booking updates"
            description="Get notified about your appointments"
            value={customerData.notifyBookingUpdates}
            onValueChange={(v) => setCustomerNotifications('notifyBookingUpdates', v)}
            recommended
          />

          <NotificationOption
            icon={<Clock size={24} color={COLORS.goldDark} />}
            title="Haircut reminders"
            description="Reminders when it's time for your next haircut"
            value={customerData.notifyReminders}
            onValueChange={(v) => setCustomerNotifications('notifyReminders', v)}
          />

          <NotificationOption
            icon={<Tag size={24} color={COLORS.goldDark} />}
            title="Promotions & deals"
            description="Special offers and discounts from barbers"
            value={customerData.notifyPromotions}
            onValueChange={(v) => setCustomerNotifications('notifyPromotions', v)}
          />

          <NotificationOption
            icon={<MapPin size={24} color={COLORS.goldDark} />}
            title="New barbers nearby"
            description="When new top-rated barbers join in your area"
            value={customerData.notifyNewBarbers}
            onValueChange={(v) => setCustomerNotifications('notifyNewBarbers', v)}
          />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.md,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 20,
  },
  options: {
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: LIGHT_COLORS.surface,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    gap: SPACING.xxs,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  recommendedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    lineHeight: 18,
  },
});
