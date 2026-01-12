import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { MapPin, Clock, Navigation } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';
import Slider from '@react-native-community/slider';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { SelectableChip } from '@/components/onboarding/SelectableChip';
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

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', labelHe: 'א' },
  { id: 1, label: 'Mon', labelHe: 'ב' },
  { id: 2, label: 'Tue', labelHe: 'ג' },
  { id: 3, label: 'Wed', labelHe: 'ד' },
  { id: 4, label: 'Thu', labelHe: 'ה' },
  { id: 5, label: 'Fri', labelHe: 'ו' },
  { id: 6, label: 'Sat', labelHe: 'ש' },
];

const TIME_PERIODS = [
  { id: 'morning' as const, label: 'Morning', labelHe: 'בוקר', time: '8:00 - 12:00' },
  { id: 'afternoon' as const, label: 'Afternoon', labelHe: 'צהריים', time: '12:00 - 17:00' },
  { id: 'evening' as const, label: 'Evening', labelHe: 'ערב', time: '17:00 - 21:00' },
];

export default function BarberScheduleScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const barberData = useOnboardingStore((s) => s.barberData);
  const toggleBarberWorkingDay = useOnboardingStore((s) => s.toggleBarberWorkingDay);
  const setBarberTimeAvailability = useOnboardingStore((s) => s.setBarberTimeAvailability);
  const setBarberBaseLocation = useOnboardingStore((s) => s.setBarberBaseLocation);
  const setBarberTravelDistance = useOnboardingStore((s) => s.setBarberTravelDistance);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const isValid =
    barberData.workingDays.length > 0 &&
    (barberData.morningAvailable || barberData.afternoonAvailable || barberData.eveningAvailable) &&
    barberData.baseAddress.trim().length > 0;

  const handleNext = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/barber/portfolio');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const getTimeAvailability = (period: 'morning' | 'afternoon' | 'evening'): boolean => {
    if (period === 'morning') return barberData.morningAvailable;
    if (period === 'afternoon') return barberData.afternoonAvailable;
    return barberData.eveningAvailable;
  };

  return (
    <OnboardingLayout
      title="Work Preferences"
      subtitle="Set your availability & service area"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.content}>
        <Animated.View entering={webSafeFadeInDown(100, 400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={LIGHT_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Working Days *</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select the days you're available</Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  barberData.workingDays.includes(day.id) && styles.dayButtonSelected,
                ]}
                onPress={() => toggleBarberWorkingDay(day.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    barberData.workingDays.includes(day.id) && styles.dayLabelSelected,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Available Times *</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred time slots</Text>
          <View style={styles.timeSlotsGrid}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.timeSlotCard,
                  getTimeAvailability(period.id) && styles.timeSlotCardSelected,
                ]}
                onPress={() => setBarberTimeAvailability(period.id, !getTimeAvailability(period.id))}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotLabel,
                    getTimeAvailability(period.id) && styles.timeSlotLabelSelected,
                  ]}
                >
                  {period.label}
                </Text>
                <Text
                  style={[
                    styles.timeSlotTime,
                    getTimeAvailability(period.id) && styles.timeSlotTimeSelected,
                  ]}
                >
                  {period.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(300, 400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={LIGHT_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Base Location *</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Where you start your day</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter your base address"
            value={barberData.baseAddress}
            onChangeText={(text) => setBarberBaseLocation(text, null)}
            outlineColor={LIGHT_COLORS.border}
            activeOutlineColor={COLORS.gold}
            style={styles.input}
            left={<TextInput.Icon icon={() => <MapPin size={20} color={LIGHT_COLORS.textMuted} />} />}
          />
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(400, 400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Navigation size={18} color={LIGHT_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Travel Distance</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Maximum distance you'll travel: <Text style={styles.distanceValue}>{barberData.maxTravelDistanceKm} km</Text>
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>5 km</Text>
            <View style={styles.slider}>
              <Slider
                minimumValue={5}
                maximumValue={50}
                step={5}
                value={barberData.maxTravelDistanceKm}
                onValueChange={setBarberTravelDistance}
                minimumTrackTintColor={COLORS.gold}
                maximumTrackTintColor={LIGHT_COLORS.border}
                thumbTintColor={COLORS.goldDark}
              />
            </View>
            <Text style={styles.sliderLabel}>50 km</Text>
          </View>
          <View style={styles.distanceHint}>
            <Text style={styles.hintText}>
              A wider range means more potential clients
            </Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 1.5,
    borderColor: LIGHT_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold,
  },
  dayLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: LIGHT_COLORS.textSecondary,
  },
  dayLabelSelected: {
    color: COLORS.goldDark,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  timeSlotCard: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 1.5,
    borderColor: LIGHT_COLORS.border,
    alignItems: 'center',
  },
  timeSlotCardSelected: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold,
  },
  timeSlotLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: LIGHT_COLORS.textSecondary,
    marginBottom: SPACING.xxs,
  },
  timeSlotLabelSelected: {
    color: COLORS.goldDark,
  },
  timeSlotTime: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
  },
  timeSlotTimeSelected: {
    color: LIGHT_COLORS.textSecondary,
  },
  input: {
    backgroundColor: LIGHT_COLORS.surface,
    marginTop: SPACING.xs,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  slider: {
    flex: 1,
  },
  sliderLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
    width: 40,
    textAlign: 'center',
  },
  distanceValue: {
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  distanceHint: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  hintText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    textAlign: 'center',
  },
});
