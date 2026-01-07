import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Scissors, Sparkles, MapPin, MessageCircle, Star } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

const { width } = Dimensions.get('window');

function FloatingIcon({ 
  icon: Icon, 
  color, 
  size, 
  top, 
  left, 
  delay 
}: { 
  icon: typeof Sparkles; 
  color: string; 
  size: number; 
  top: number; 
  left: number; 
  delay: number; 
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1500 }),
          withTiming(10, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingIcon, { top, left }, animatedStyle]}>
      <Icon size={size} color={color} />
    </Animated.View>
  );
}

export default function WelcomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleGetStarted = () => {
    router.push('/(onboarding)/user-type');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <FloatingIcon icon={Sparkles} color={COLORS.gold} size={24} top={100} left={40} delay={0} />
      <FloatingIcon icon={Star} color={COLORS.goldDark} size={20} top={150} left={width - 80} delay={200} />
      <FloatingIcon icon={MapPin} color={COLORS.burgundy} size={22} top={250} left={60} delay={400} />
      <FloatingIcon icon={MessageCircle} color={COLORS.gold} size={18} top={220} left={width - 100} delay={600} />

      <View style={styles.content}>
        <Animated.View
          entering={FadeIn.duration(800)}
          style={[styles.logoContainer, logoAnimatedStyle]}
        >
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Scissors size={48} color={COLORS.textInverse} style={styles.scissorsIcon} />
            </View>
          </View>
          <View style={styles.sparklePosition}>
            <Sparkles size={20} color={COLORS.gold} fill={COLORS.gold} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={styles.title}>BarberConnect</Text>
          <Text style={styles.tagline}>Premium barbers at your doorstep</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MapPin size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.featureText}>On-demand service at your location</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Star size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.featureText}>Top-rated professional barbers</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MessageCircle size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.featureText}>Negotiate prices directly</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(700).duration(600)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING.xl }]}
      >
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Get Started
        </Button>
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING['2xl'],
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: COLORS.burgundy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.burgundy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scissorsIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  sparklePosition: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  features: {
    marginTop: SPACING['3xl'],
    gap: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  button: {
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
  termsText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
