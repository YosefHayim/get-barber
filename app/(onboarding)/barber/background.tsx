import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { Award } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { SelectableChip } from '@/components/onboarding/SelectableChip';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import {
  BARBER_SPECIALTIES,
  YEARS_EXPERIENCE_OPTIONS,
  type BarberSpecialty,
} from '@/types/onboarding.types';

export default function BarberBackgroundScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const barberData = useOnboardingStore((s) => s.barberData);
  const setBarberExperience = useOnboardingStore((s) => s.setBarberExperience);
  const toggleBarberSpecialty = useOnboardingStore((s) => s.toggleBarberSpecialty);
  const setBarberCertifications = useOnboardingStore((s) => s.setBarberCertifications);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [certifications, setCertifications] = useState(barberData.certifications);

  const isValid = barberData.yearsExperience !== null && barberData.specialties.length > 0;

  const handleNext = () => {
    setBarberCertifications(certifications);
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/barber/services');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const isSpecialtySelected = (specialty: BarberSpecialty) =>
    barberData.specialties.includes(specialty);

  return (
    <OnboardingLayout
      title="Professional background"
      subtitle="Tell us about your experience"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Years of experience *</Text>
          <View style={styles.optionsList}>
            {YEARS_EXPERIENCE_OPTIONS.map((exp) => (
              <OptionCard
                key={exp.id}
                title={exp.label}
                selected={barberData.yearsExperience === exp.id}
                onPress={() => setBarberExperience(exp.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Your specialties *</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.chipGrid}>
            {BARBER_SPECIALTIES.map((specialty) => (
              <SelectableChip
                key={specialty.id}
                label={specialty.label}
                selected={isSpecialtySelected(specialty.id)}
                onPress={() => toggleBarberSpecialty(specialty.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <View style={styles.labelRow}>
            <Award size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Certifications (optional)</Text>
          </View>
          <TextInput
            mode="outlined"
            placeholder="e.g., Licensed barber, Wahl Academy certified"
            value={certifications}
            onChangeText={setCertifications}
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineStyle={styles.inputOutline}
          />
          <Text style={styles.hint}>Certifications help build trust with customers</Text>
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
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  optionsList: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  inputOutline: {
    borderRadius: RADIUS.md,
    borderColor: COLORS.border,
  },
  hint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
});
