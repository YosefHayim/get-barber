import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { Camera, User } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function CustomerProfileScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const customerData = useOnboardingStore((s) => s.customerData);
  const setCustomerFullName = useOnboardingStore((s) => s.setCustomerFullName);
  const setCustomerPhone = useOnboardingStore((s) => s.setCustomerPhone);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [localName, setLocalName] = useState(customerData.fullName);
  const [localPhone, setLocalPhone] = useState(customerData.phone);

  const isValid = localName.trim().length >= 2 && localPhone.length >= 9;

  const handleNext = () => {
    setCustomerFullName(localName.trim());
    setCustomerPhone(localPhone);
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/customer/location');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const handlePickImage = () => {
    
  };

  return (
    <OnboardingLayout
      title="Create your profile"
      subtitle="Tell us a bit about yourself"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.avatarSection}>
          <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
            {customerData.avatarUri ? (
              <Image source={{ uri: customerData.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={COLORS.textMuted} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color={COLORS.textInverse} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Add a profile photo (optional)</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter your full name"
              value={localName}
              onChangeText={setLocalName}
              autoCapitalize="words"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              mode="outlined"
              placeholder="+972-50-123-4567"
              value={localPhone}
              onChangeText={setLocalPhone}
              keyboardType="phone-pad"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Affix text="+972" />}
            />
            <Text style={styles.hint}>We'll use this to send you booking updates</Text>
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
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarHint: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
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
    color: COLORS.textPrimary,
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
    marginTop: SPACING.xxs,
  },
});
