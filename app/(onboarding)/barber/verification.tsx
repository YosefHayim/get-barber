import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import {
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Scissors,
  Briefcase,
  SprayCan,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const EQUIPMENT_CHECKLIST = [
  { id: 'clippers', label: 'Professional clippers & trimmers', icon: Scissors },
  { id: 'chair', label: 'Portable chair or cape', icon: Briefcase },
  { id: 'sanitization', label: 'Sanitization supplies', icon: SprayCan },
];

export default function BarberVerificationScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const barberData = useOnboardingStore((s) => s.barberData);
  const setBarberIdImage = useOnboardingStore((s) => s.setBarberIdImage);
  const setBarberEquipmentConfirmed = useOnboardingStore((s) => s.setBarberEquipmentConfirmed);
  const setBarberTermsAccepted = useOnboardingStore((s) => s.setBarberTermsAccepted);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const isValid =
    barberData.idImageUri !== null &&
    barberData.equipmentConfirmed &&
    barberData.termsAccepted;

  const handleUploadId = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBarberIdImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/barber/complete');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <OnboardingLayout
      title="Verification"
      subtitle="Complete your profile verification"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
      nextLabel="Complete Setup"
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.infoCard}>
          <Shield size={24} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why verification?</Text>
            <Text style={styles.infoText}>
              Verified barbers get a badge on their profile, building trust with customers and
              increasing booking rates by up to 40%.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Government ID *</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Upload a photo of your ID for verification
          </Text>

          <TouchableOpacity
            style={[
              styles.uploadBox,
              barberData.idImageUri && styles.uploadBoxSuccess,
            ]}
            onPress={handleUploadId}
            activeOpacity={0.7}
          >
            {barberData.idImageUri ? (
              <>
                <View style={styles.uploadedContent}>
                  <Image
                    source={{ uri: barberData.idImageUri }}
                    style={styles.idPreview}
                  />
                  <View style={styles.uploadedInfo}>
                    <CheckCircle2 size={20} color={COLORS.success} />
                    <Text style={styles.uploadedText}>ID uploaded</Text>
                  </View>
                </View>
                <Text style={styles.tapToChange}>Tap to change</Text>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Upload size={28} color={COLORS.gold} />
                </View>
                <Text style={styles.uploadText}>Tap to upload ID</Text>
                <Text style={styles.uploadHint}>
                  Accepted: Israeli ID, Passport, Driver's License
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <AlertCircle size={14} color={COLORS.textMuted} />
            <Text style={styles.privacyText}>
              Your ID is encrypted and only used for verification
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Checklist *</Text>
          <Text style={styles.sectionSubtitle}>
            Confirm you have the required equipment
          </Text>

          <View style={styles.checklistContainer}>
            {EQUIPMENT_CHECKLIST.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <View key={item.id} style={styles.checklistItem}>
                  <View style={styles.checklistIcon}>
                    <IconComponent size={18} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.checklistText}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.confirmRow}
            onPress={() => setBarberEquipmentConfirmed(!barberData.equipmentConfirmed)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={barberData.equipmentConfirmed ? 'checked' : 'unchecked'}
              color={COLORS.gold}
            />
            <Text style={styles.confirmText}>
              I confirm I have all the required equipment
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setBarberTermsAccepted(!barberData.termsAccepted)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={barberData.termsAccepted ? 'checked' : 'unchecked'}
              color={COLORS.gold}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
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
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.info,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginTop: SPACING.sm,
  },
  uploadBoxSuccess: {
    borderColor: COLORS.success,
    borderStyle: 'solid',
    backgroundColor: COLORS.successLight,
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uploadText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  uploadHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  uploadedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  idPreview: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
  },
  uploadedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  uploadedText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  tapToChange: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  checklistContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checklistIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  termsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
