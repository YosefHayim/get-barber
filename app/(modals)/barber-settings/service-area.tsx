import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { X, Check, MapPin, Navigation } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

export default function ServiceAreaScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [serviceRadius, setServiceRadius] = useState(10);
  const [baseAddress, setBaseAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save service area settings
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Service Area',
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={LIGHT_COLORS.textPrimary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
              <Check size={24} color={isSaving ? LIGHT_COLORS.textMuted : COLORS.gold} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Location</Text>
          <Text style={styles.sectionDescription}>
            Set your primary location. This is where you'll receive service requests from.
          </Text>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={LIGHT_COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              value={baseAddress}
              onChangeText={setBaseAddress}
              placeholder="Enter your base address"
              placeholderTextColor={LIGHT_COLORS.textMuted}
              mode="flat"
              style={styles.input}
              textColor={LIGHT_COLORS.textPrimary}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>

          <Pressable style={styles.currentLocationButton}>
            <Navigation size={18} color={COLORS.gold} />
            <Text style={styles.currentLocationText}>Use current location</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Radius</Text>
          <Text style={styles.sectionDescription}>
            Set how far you're willing to travel for appointments.
          </Text>

          <View style={styles.radiusDisplay}>
            <Text style={styles.radiusValue}>{serviceRadius} km</Text>
            <Text style={styles.radiusLabel}>Maximum distance</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={serviceRadius}
              onValueChange={setServiceRadius}
              minimumTrackTintColor={COLORS.gold}
              maximumTrackTintColor={LIGHT_COLORS.border}
              thumbTintColor={COLORS.gold}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <Text style={styles.sliderLabel}>50 km</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            Customers within your service area will see you in their search results.
            You can adjust this at any time based on your availability.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: TYPOGRAPHY.base,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  currentLocationText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gold,
  },
  radiusDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  radiusValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.gold,
  },
  radiusLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  sliderContainer: {
    paddingHorizontal: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  sliderLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
  },
  infoCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    lineHeight: 20,
  },
});
