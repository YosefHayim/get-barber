import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Briefcase, Scissors, MapPin, DollarSign, BarChart3, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function UserTypeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setUserType = useOnboardingStore((s) => s.setUserType);
  const nextStep = useOnboardingStore((s) => s.nextStep);

  const handleSelectCustomer = () => {
    setUserType('customer');
    nextStep();
    router.push('/(onboarding)/customer/profile');
  };

  const handleSelectBarber = () => {
    setUserType('barber');
    nextStep();
    router.push('/(onboarding)/barber/profile');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom }]}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>How will you use BarberConnect?</Text>
        <Text style={styles.subtitle}>Choose the option that best describes you</Text>
      </Animated.View>

      <View style={styles.options}>
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable onPress={handleSelectCustomer}>
            <Surface style={styles.optionCard} elevation={2}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.goldMuted }]}>
                <User size={32} color={COLORS.goldDark} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>I need a barber</Text>
                <Text style={styles.optionDescription}>
                  Find professional barbers who come to your location
                </Text>
                <View style={styles.benefits}>
                  <View style={styles.benefitItem}>
                    <MapPin size={14} color={COLORS.textMuted} />
                    <Text style={styles.benefitText}>Service at your doorstep</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <DollarSign size={14} color={COLORS.textMuted} />
                    <Text style={styles.benefitText}>Negotiate prices</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color={COLORS.gold} />
              </View>
            </Surface>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Pressable onPress={handleSelectBarber}>
            <Surface style={styles.optionCard} elevation={2}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.burgundy + '20' }]}>
                <Scissors size={32} color={COLORS.burgundy} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>I'm a barber</Text>
                <Text style={styles.optionDescription}>
                  Grow your business with on-demand mobile services
                </Text>
                <View style={styles.benefits}>
                  <View style={styles.benefitItem}>
                    <Briefcase size={14} color={COLORS.textMuted} />
                    <Text style={styles.benefitText}>Flexible schedule</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <BarChart3 size={14} color={COLORS.textMuted} />
                    <Text style={styles.benefitText}>Business analytics</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color={COLORS.burgundy} />
              </View>
            </Surface>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.footer}>
        <Text style={styles.footerText}>
          You can switch between modes later in settings
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  header: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
  options: {
    gap: SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  benefits: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  arrowContainer: {
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: SPACING['3xl'],
    left: SPACING.xl,
    right: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
