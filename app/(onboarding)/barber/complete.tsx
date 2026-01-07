import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const TIPS = [
  {
    icon: Star,
    title: 'Complete your profile',
    description: 'Add more portfolio photos to attract clients',
  },
  {
    icon: TrendingUp,
    title: 'Set competitive prices',
    description: 'Research local rates to stay competitive',
  },
  {
    icon: Users,
    title: 'Respond quickly',
    description: 'Fast responses increase booking rates',
  },
];

export default function BarberCompleteScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const barberData = useOnboardingStore((s) => s.barberData);

  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    checkScale.value = withDelay(
      300,
      withSequence(withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 }))
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleGoToDashboard = () => {
    completeOnboarding();
    router.replace('/(barber-tabs)/dashboard');
  };

  const handleViewProfile = () => {
    completeOnboarding();
    router.replace('/(barber-tabs)/barber-profile');
  };

  const needsReview = barberData.idImageUri !== null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.successCircle, circleStyle]}>
          <Animated.View style={checkStyle}>
            {needsReview ? (
              <Clock size={80} color={COLORS.warning} />
            ) : (
              <CheckCircle2 size={80} color={COLORS.success} fill={COLORS.successLight} />
            )}
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.textContent}>
          <Text style={styles.title}>
            {needsReview ? 'Almost there!' : "You're ready!"}
          </Text>
          <Text style={styles.subtitle}>
            {needsReview
              ? `Welcome, ${barberData.businessName}! Your profile is under review.`
              : `Welcome aboard, ${barberData.businessName}!`}
          </Text>
        </Animated.View>

        {needsReview ? (
          <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.reviewCard}>
            <Clock size={24} color={COLORS.warning} />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewTitle}>Profile Under Review</Text>
              <Text style={styles.reviewText}>
                We're verifying your ID. This usually takes 1-2 business days. You'll receive a
                notification once approved.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.successCard}>
            <CheckCircle2 size={24} color={COLORS.success} />
            <View style={styles.successCardContent}>
              <Text style={styles.successTitle}>Profile Approved!</Text>
              <Text style={styles.successText}>
                You can start receiving booking requests immediately.
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for success</Text>
          {TIPS.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <Animated.View
                key={tip.title}
                entering={FadeInDown.delay(900 + index * 100).duration(400)}
                style={styles.tipItem}
              >
                <View style={styles.tipIcon}>
                  <IconComponent size={18} color={COLORS.gold} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipItemTitle}>{tip.title}</Text>
                  <Text style={styles.tipItemText}>{tip.description}</Text>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeIn.delay(1200).duration(500)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING.xl }]}
      >
        <Button
          mode="contained"
          onPress={handleGoToDashboard}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon={({ size, color }) => <ArrowRight size={size} color={color} />}
        >
          Go to Dashboard
        </Button>
        <Button
          mode="text"
          onPress={handleViewProfile}
          labelStyle={styles.secondaryButtonLabel}
        >
          View my profile
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  reviewCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    alignSelf: 'stretch',
  },
  reviewContent: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  reviewText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  successCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    alignSelf: 'stretch',
  },
  successCardContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  successText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tipsSection: {
    alignSelf: 'stretch',
    gap: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipItemTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textInverse,
    marginBottom: SPACING.xxs,
  },
  tipItemText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textLight,
  },
  bottomSection: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButton: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gold,
  },
  buttonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  secondaryButtonLabel: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.md,
  },
});
