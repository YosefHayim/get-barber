import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { Camera, User } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
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

export default function CustomerProfileScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const customerData = useOnboardingStore((s) => s.customerData);
  const setCustomerFullName = useOnboardingStore((s) => s.setCustomerFullName);
  const setCustomerPhone = useOnboardingStore((s) => s.setCustomerPhone);
  const setCustomerAvatar = useOnboardingStore((s) => s.setCustomerAvatar);
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

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCustomerAvatar(result.assets[0].uri);
    }
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
        <Animated.View entering={webSafeFadeInDown(100, 400)} style={styles.avatarSection}>
          <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
            {customerData.avatarUri ? (
              <Image source={{ uri: customerData.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={LIGHT_COLORS.textMuted} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color={LIGHT_COLORS.surface} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Add a profile photo (optional)</Text>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.form}>
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
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
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
    borderColor: LIGHT_COLORS.surface,
  },
  avatarHint: {
    fontSize: TYPOGRAPHY.sm,
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
