import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckCircle2, Sparkles, Gift, ArrowRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown } from '@/utils/animations';
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

export default function CustomerCompleteScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const customerData = useOnboardingStore((s) => s.customerData);

  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    checkScale.value = withDelay(300, withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    ));
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleExplore = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleBrowseBarbers = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.successCircle, circleStyle]}>
          <Animated.View style={checkStyle}>
            <CheckCircle2 size={80} color={COLORS.success} fill={COLORS.successLight} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(400, 500)} style={styles.textContent}>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to BarberConnect, {customerData.fullName.split(' ')[0]}!
          </Text>
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(600, 500)} style={styles.promoCard}>
          <View style={styles.promoIcon}>
            <Gift size={24} color={COLORS.gold} />
          </View>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>First booking bonus!</Text>
            <Text style={styles.promoDescription}>
              Use code <Text style={styles.promoCode}>WELCOME15</Text> for 15% off your first booking
            </Text>
          </View>
          <Sparkles size={20} color={COLORS.gold} />
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(800, 500)} style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Browse top-rated barbers near you</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Book services at your preferred time</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Negotiate prices directly with barbers</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={webSafeFadeIn(500)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING.xl }]}
      >
        <Button
          mode="contained"
          onPress={handleBrowseBarbers}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Find a Barber
        </Button>
        <Button
          mode="text"
          onPress={handleExplore}
          labelStyle={styles.secondaryButtonLabel}
        >
          Explore the app first
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
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
    backgroundColor: COLORS.successLight,
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
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.lg,
    color: LIGHT_COLORS.textSecondary,
    textAlign: 'center',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: LIGHT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  promoDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  promoCode: {
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  features: {
    gap: SPACING.md,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  featureText: {
    fontSize: TYPOGRAPHY.md,
    color: LIGHT_COLORS.textPrimary,
  },
  bottomSection: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButton: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.goldDark,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    color: LIGHT_COLORS.textSecondary,
    fontSize: TYPOGRAPHY.md,
  },
});
