import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  showProgress?: boolean;
  keyboardAvoiding?: boolean;
}

export function OnboardingLayout({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Continue',
  nextDisabled = false,
  nextLoading = false,
  showBack = true,
  showSkip = false,
  showProgress = true,
  keyboardAvoiding = true,
}: OnboardingLayoutProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 100 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>
      
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        {showBack && currentStep > 1 ? (
          <Button
            mode="text"
            onPress={onBack}
            icon={() => <ArrowLeft size={20} color={COLORS.textSecondary} />}
            contentStyle={styles.backButtonContent}
            labelStyle={styles.backButtonLabel}
          >
            Back
          </Button>
        ) : (
          <View style={styles.placeholder} />
        )}

        {showProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentStep} of {totalSteps}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / totalSteps) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {showSkip ? (
          <Button
            mode="text"
            onPress={onSkip}
            labelStyle={styles.skipButtonLabel}
          >
            Skip
          </Button>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          mode="contained"
          onPress={onNext}
          disabled={nextDisabled}
          loading={nextLoading}
          style={styles.nextButton}
          contentStyle={styles.nextButtonContent}
          labelStyle={styles.nextButtonLabel}
          icon={() => !nextLoading && <ArrowRight size={20} color={COLORS.textInverse} />}
          contentStyleRightIcon
        >
          {nextLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 56,
  },
  placeholder: {
    width: 80,
  },
  backButtonContent: {
    flexDirection: 'row-reverse',
  },
  backButtonLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
  },
  skipButtonLabel: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sm,
  },
  progressContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  nextButton: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.goldDark,
  },
  nextButtonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  nextButtonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
  },
});
