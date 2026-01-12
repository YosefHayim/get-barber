import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { Scissors, Sunrise, Sun, Sunset, Clock } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { SelectableChip } from '@/components/onboarding/SelectableChip';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import {
  SERVICE_PREFERENCES,
  HAIRCUT_FREQUENCIES,
  TIME_OF_DAY_OPTIONS,
  type ServicePreference,
  type HaircutFrequency,
  type PreferredTimeOfDay,
} from '@/types/onboarding.types';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

const TimeIcon = ({ id }: { id: PreferredTimeOfDay }) => {
  const icons = {
    morning: <Sunrise size={20} color={COLORS.gold} />,
    afternoon: <Sun size={20} color={COLORS.gold} />,
    evening: <Sunset size={20} color={COLORS.gold} />,
    flexible: <Clock size={20} color={COLORS.gold} />,
  };
  return icons[id];
};

export default function CustomerPreferencesScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const customerData = useOnboardingStore((s) => s.customerData);
  const toggleCustomerService = useOnboardingStore((s) => s.toggleCustomerService);
  const setCustomerFrequency = useOnboardingStore((s) => s.setCustomerFrequency);
  const setCustomerPreferredTime = useOnboardingStore((s) => s.setCustomerPreferredTime);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleNext = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/customer/notifications');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const isServiceSelected = (service: ServicePreference) =>
    customerData.preferredServices.includes(service);

  return (
    <OnboardingLayout
      title="Your preferences"
      subtitle="Help us personalize your experience"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
    >
      <View style={styles.content}>
        <Animated.View entering={webSafeFadeInDown(100, 400)} style={styles.section}>
          <Text style={styles.sectionTitle}>What services interest you?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.chipGrid}>
            {SERVICE_PREFERENCES.map((service) => (
              <SelectableChip
                key={service.id}
                label={service.label}
                selected={isServiceSelected(service.id)}
                onPress={() => toggleCustomerService(service.id)}
                icon={<Scissors size={14} color={isServiceSelected(service.id) ? COLORS.goldDark : LIGHT_COLORS.textMuted} />}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.section}>
          <Text style={styles.sectionTitle}>How often do you get a haircut?</Text>
          <View style={styles.optionsList}>
            {HAIRCUT_FREQUENCIES.map((freq) => (
              <OptionCard
                key={freq.id}
                title={freq.label}
                selected={customerData.haircutFrequency === freq.id}
                onPress={() => setCustomerFrequency(freq.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(300, 400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred time of day</Text>
          <View style={styles.timeGrid}>
            {TIME_OF_DAY_OPTIONS.map((time) => (
              <View key={time.id} style={styles.timeOption}>
                <OptionCard
                  title={time.label}
                  selected={customerData.preferredTimeOfDay === time.id}
                  onPress={() => setCustomerPreferredTime(time.id)}
                  icon={<TimeIcon id={time.id} />}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  optionsList: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  timeOption: {
    width: '48%',
  },
});
