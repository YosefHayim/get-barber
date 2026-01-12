import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { DollarSign } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';
import Slider from '@react-native-community/slider';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { SelectableChip } from '@/components/onboarding/SelectableChip';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { MOCK_SERVICES } from '@/constants/mockData';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

export default function BarberServicesScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const barberData = useOnboardingStore((s) => s.barberData);
  const updateBarberData = useOnboardingStore((s) => s.updateBarberData);
  const setBarberPriceRange = useOnboardingStore((s) => s.setBarberPriceRange);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const isValid = barberData.servicesOffered.length > 0;

  const handleToggleService = (serviceName: string) => {
    const current = barberData.servicesOffered;
    const updated = current.includes(serviceName)
      ? current.filter((s) => s !== serviceName)
      : [...current, serviceName];
    updateBarberData({ servicesOffered: updated });
  };

  const handleNext = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/barber/schedule');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <OnboardingLayout
      title="Services & Pricing"
      subtitle="What services do you offer?"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.content}>
        <Animated.View entering={webSafeFadeInDown(100, 400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Select your services *</Text>
          <Text style={styles.sectionSubtitle}>Choose all services you offer</Text>
          <View style={styles.chipGrid}>
            {MOCK_SERVICES.map((service) => (
              <SelectableChip
                key={service.id}
                label={`${service.name} (₪${service.price})`}
                selected={barberData.servicesOffered.includes(service.name)}
                onPress={() => handleToggleService(service.name)}
                size="medium"
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.section}>
          <View style={styles.priceHeader}>
            <DollarSign size={18} color={LIGHT_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Your price range</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Set your typical pricing</Text>
          
          <View style={styles.priceDisplay}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Min</Text>
              <Text style={styles.priceValue}>₪{barberData.priceMin}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Max</Text>
              <Text style={styles.priceValue}>₪{barberData.priceMax}</Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Minimum price</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderValue}>₪30</Text>
              <View style={styles.slider}>
                <Slider
                  minimumValue={30}
                  maximumValue={200}
                  step={5}
                  value={barberData.priceMin}
                  onValueChange={(value) => setBarberPriceRange(value, barberData.priceMax)}
                  minimumTrackTintColor={COLORS.gold}
                  maximumTrackTintColor={COLORS.borderLight}
                  thumbTintColor={COLORS.goldDark}
                />
              </View>
              <Text style={styles.sliderValue}>₪200</Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Maximum price</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderValue}>₪50</Text>
              <View style={styles.slider}>
                <Slider
                  minimumValue={50}
                  maximumValue={500}
                  step={10}
                  value={barberData.priceMax}
                  onValueChange={(value) => setBarberPriceRange(barberData.priceMin, value)}
                  minimumTrackTintColor={COLORS.gold}
                  maximumTrackTintColor={COLORS.borderLight}
                  thumbTintColor={COLORS.goldDark}
                />
              </View>
              <Text style={styles.sliderValue}>₪500</Text>
            </View>
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
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  priceBox: {
    alignItems: 'center',
    backgroundColor: COLORS.goldMuted,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    minWidth: 100,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textSecondary,
    marginBottom: SPACING.xxs,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  priceDivider: {
    width: 20,
    height: 2,
    backgroundColor: LIGHT_COLORS.border,
  },
  sliderContainer: {
    marginTop: SPACING.md,
  },
  sliderLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  slider: {
    flex: 1,
  },
  sliderValue: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
    width: 40,
    textAlign: 'center',
  },
});
