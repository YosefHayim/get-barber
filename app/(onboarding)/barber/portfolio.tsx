import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { Camera, Instagram, Plus, X, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const MIN_PORTFOLIO_IMAGES = 3;
const MAX_PORTFOLIO_IMAGES = 10;

export default function BarberPortfolioScreen(): React.JSX.Element {
  const progress = useOnboardingStore((s) => s.progress);
  const barberData = useOnboardingStore((s) => s.barberData);
  const addBarberPortfolioImage = useOnboardingStore((s) => s.addBarberPortfolioImage);
  const removeBarberPortfolioImage = useOnboardingStore((s) => s.removeBarberPortfolioImage);
  const setBarberInstagram = useOnboardingStore((s) => s.setBarberInstagram);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const isValid = barberData.portfolioImages.length >= MIN_PORTFOLIO_IMAGES;
  const canAddMore = barberData.portfolioImages.length < MAX_PORTFOLIO_IMAGES;

  const handlePickImage = async () => {
    if (!canAddMore) {
      Alert.alert('Maximum Reached', `You can upload up to ${MAX_PORTFOLIO_IMAGES} photos.`);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addBarberPortfolioImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    if (!canAddMore) {
      Alert.alert('Maximum Reached', `You can upload up to ${MAX_PORTFOLIO_IMAGES} photos.`);
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addBarberPortfolioImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    markStepComplete(progress.currentStep);
    nextStep();
    router.push('/(onboarding)/barber/verification');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <OnboardingLayout
      title="Your Portfolio"
      subtitle="Showcase your best work"
      currentStep={progress.currentStep}
      totalSteps={progress.totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tipsCard}>
          <Sparkles size={20} color={COLORS.gold} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Tips for great photos</Text>
            <Text style={styles.tipsText}>
              • Good lighting shows your work best{'\n'}
              • Include before/after shots{'\n'}
              • Showcase different styles you excel at
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Photos *</Text>
            <Text style={styles.counterText}>
              {barberData.portfolioImages.length}/{MAX_PORTFOLIO_IMAGES}
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Minimum {MIN_PORTFOLIO_IMAGES} photos required
          </Text>

          <View style={styles.portfolioGrid}>
            {barberData.portfolioImages.map((uri, index) => (
              <Animated.View
                key={uri}
                entering={ZoomIn.delay(index * 50).duration(300)}
                style={styles.imageContainer}
              >
                <Image source={{ uri }} style={styles.portfolioImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeBarberPortfolioImage(uri)}
                  activeOpacity={0.7}
                >
                  <X size={14} color={COLORS.textInverse} />
                </TouchableOpacity>
              </Animated.View>
            ))}

            {canAddMore && (
              <Animated.View entering={FadeIn.duration(300)} style={styles.addContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={24} color={COLORS.gold} />
                  <Text style={styles.addButtonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <Camera size={24} color={COLORS.gold} />
                  <Text style={styles.addButtonText}>Camera</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {barberData.portfolioImages.length < MIN_PORTFOLIO_IMAGES && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Add {MIN_PORTFOLIO_IMAGES - barberData.portfolioImages.length} more photo
                {MIN_PORTFOLIO_IMAGES - barberData.portfolioImages.length > 1 ? 's' : ''} to continue
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Instagram size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Instagram (Optional)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Connect your profile to show more work
          </Text>
          <TextInput
            mode="outlined"
            placeholder="@your_username"
            value={barberData.instagramHandle}
            onChangeText={setBarberInstagram}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.gold}
            style={styles.input}
            autoCapitalize="none"
            left={
              <TextInput.Icon
                icon={() => <Instagram size={20} color={COLORS.textMuted} />}
              />
            }
          />
          {barberData.instagramHandle && (
            <Text style={styles.instagramHint}>
              Your Instagram will be visible on your profile
            </Text>
          )}
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.xl,
  },
  tipsCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.goldDark,
    marginBottom: SPACING.xs,
  },
  tipsText: {
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
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  counterText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  addContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.warning,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.xs,
  },
  instagramHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
