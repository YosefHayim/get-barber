import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { MapPin, Home, Briefcase, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
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

export default function CustomerLocationScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const customerData = useOnboardingStore((s) => s.customerData);
  const setCustomerHomeAddress = useOnboardingStore((s) => s.setCustomerHomeAddress);
  const setCustomerWorkAddress = useOnboardingStore((s) => s.setCustomerWorkAddress);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [homeAddress, setHomeAddress] = useState(customerData.homeAddress || '');
  const [workAddress, setWorkAddress] = useState(customerData.workAddress || '');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleRequestLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access helps us find barbers near you faster. You can always add addresses manually.',
          [{ text: 'OK' }]
        );
        return;
      }
      setLocationPermissionGranted(true);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const formattedAddress = [address.street, address.city].filter(Boolean).join(', ');
        setHomeAddress(formattedAddress);
        setCustomerHomeAddress(formattedAddress, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enter it manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleNext = () => {
    if (homeAddress) {
      setCustomerHomeAddress(homeAddress, customerData.homeLocation);
    }
    if (workAddress) {
      setCustomerWorkAddress(workAddress, customerData.workLocation);
    }
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/customer/preferences');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const handleSkip = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/customer/preferences');
  };

  return (
    <OnboardingLayout
      title="Set up your locations"
      subtitle="Help us find barbers near you faster"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
      showSkip
      nextLabel="Continue"
    >
      <View style={styles.content}>
        {!locationPermissionGranted && (
          <Animated.View entering={webSafeFadeInDown(100, 400)}>
            <Pressable onPress={handleRequestLocation} style={styles.locationCard}>
              <View style={styles.locationIconContainer}>
                <Navigation size={24} color={COLORS.gold} />
              </View>
              <View style={styles.locationCardContent}>
                <Text style={styles.locationCardTitle}>
                  {isLoadingLocation ? 'Getting location...' : 'Use my current location'}
                </Text>
                <Text style={styles.locationCardSubtitle}>
                  Automatically detect your address
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.addressSection}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Home size={18} color={LIGHT_COLORS.textSecondary} />
              <Text style={styles.label}>Home Address</Text>
            </View>
            <TextInput
              mode="outlined"
              placeholder="Enter your home address"
              value={homeAddress}
              onChangeText={setHomeAddress}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Briefcase size={18} color={LIGHT_COLORS.textSecondary} />
              <Text style={styles.label}>Work Address (optional)</Text>
            </View>
            <TextInput
              mode="outlined"
              placeholder="Enter your work address"
              value={workAddress}
              onChangeText={setWorkAddress}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(300, 400)} style={styles.note}>
          <MapPin size={16} color={LIGHT_COLORS.textMuted} />
          <Text style={styles.noteText}>
            You can always add or change addresses later in your profile
          </Text>
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.xl,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: LIGHT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCardContent: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.goldDark,
  },
  locationCardSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  addressSection: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
  },
  noteText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    lineHeight: 20,
  },
});
