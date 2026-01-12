import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { Camera, Briefcase } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
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

export default function BarberProfileScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const barberData = useOnboardingStore((s) => s.barberData);
  const setBarberBusinessName = useOnboardingStore((s) => s.setBarberBusinessName);
  const setBarberPhone = useOnboardingStore((s) => s.setBarberPhone);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [localName, setLocalName] = useState(barberData.businessName);
  const [localPhone, setLocalPhone] = useState(barberData.phone);

  const isValid = localName.trim().length >= 2 && localPhone.length >= 9;

  const handleNext = () => {
    setBarberBusinessName(localName.trim());
    setBarberPhone(localPhone);
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/barber/background');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <OnboardingLayout
      title="Create your business profile"
      subtitle="This is how customers will see you"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.content}>
        <Animated.View entering={webSafeFadeInDown(100, 400)} style={styles.avatarSection}>
          <Pressable style={styles.avatarContainer}>
            {barberData.avatarUri ? (
              <Image source={{ uri: barberData.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Briefcase size={40} color={LIGHT_COLORS.textMuted} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color={COLORS.textInverse} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Add a professional photo (required)</Text>
          <Text style={styles.avatarSubhint}>A good photo increases bookings by 40%</Text>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business / Display Name *</Text>
            <TextInput
              mode="outlined"
              placeholder="e.g., Yossi's Barbershop"
              value={localName}
              onChangeText={setLocalName}
              autoCapitalize="words"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
            <Text style={styles.hint}>This is how customers will find you</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              mode="outlined"
              placeholder="50-123-4567"
              value={localPhone}
              onChangeText={setLocalPhone}
              keyboardType="phone-pad"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Affix text="+972" />}
            />
            <Text style={styles.hint}>Customers may contact you directly</Text>
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
  avatarSection: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: LIGHT_COLORS.border,
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.burgundy,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: LIGHT_COLORS.surface,
  },
  avatarHint: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textPrimary,
    fontWeight: '500',
  },
  avatarSubhint: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
  },
  form: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  input: {
    backgroundColor: LIGHT_COLORS.surface,
  },
  inputOutline: {
    borderRadius: RADIUS.md,
    borderColor: LIGHT_COLORS.border,
  },
  hint: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
});
