import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Scissors,
  Home,
  Store,
  ChevronRight,
  LogIn,
  UserPlus,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const DARK_COLORS = {
  background: '#101622',
  surface: '#181b21',
  surfaceLight: '#1C2333',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  accent: '#f59e0b',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pingStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: 1 + (1 - opacity.value) * 0.5 }],
  }));

  return (
    <View style={styles.pingContainer}>
      <Animated.View style={[styles.pingOuter, pingStyle]} />
      <View style={styles.pingInner} />
    </View>
  );
}

export default function WelcomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleBookHome = () => {
    router.push('/(onboarding)/user-type');
  };

  const handleFindBarbers = () => {
    router.push('/(tabs)/home');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent']}
          style={styles.gradientTop}
        />
        <LinearGradient
          colors={['transparent', DARK_COLORS.background, DARK_COLORS.background]}
          locations={[0, 0.4, 1]}
          style={styles.gradientBottom}
        />

        <Animated.View
          entering={FadeIn.duration(600)}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <Animated.View style={[styles.logoRow, logoAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <Scissors size={20} color="#FFFFFF" style={styles.scissorsIcon} />
            </View>
            <Text style={styles.brandName}>
              Barber<Text style={styles.brandAccent}>Hub</Text>
            </Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.mainContent}>
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.badge}
          >
            <PingDot />
            <Text style={styles.badgeText}>PREMIUM SERVICE</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Text style={styles.headline}>
              Style that{'\n'}
              <Text style={styles.headlineGradient}>comes to you.</Text>
            </Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.subtext}
          >
            Experience the luxury of a personal barber at home, or find the
            finest chairs in your city instantly.
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={[styles.bottomSection, { paddingBottom: insets.bottom + 16 }]}
        >
          <AnimatedPressable
            entering={FadeInDown.delay(600).duration(500)}
            onPress={handleBookHome}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <Home size={22} color="#FFFFFF" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Book at Home</Text>
                <Text style={styles.buttonSubtitle}>Barber comes to your door</Text>
              </View>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
          </AnimatedPressable>

          <AnimatedPressable
            entering={FadeInDown.delay(700).duration(500)}
            onPress={handleFindBarbers}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.buttonContent}>
              <View style={styles.secondaryIconContainer}>
                <Store size={22} color="#FFFFFF" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Find a Shop</Text>
                <Text style={styles.secondarySubtitle}>Book a chair nearby</Text>
              </View>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
          </AnimatedPressable>

          <Animated.View
            entering={FadeInDown.delay(800).duration(500)}
            style={styles.authRow}
          >
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.authButton,
                pressed && styles.authButtonPressed,
              ]}
            >
              <LogIn size={18} color="#FFFFFF" />
              <Text style={styles.authButtonText}>Log In</Text>
            </Pressable>
            <Pressable
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.authButton,
                pressed && styles.authButtonPressed,
              ]}
            >
              <UserPlus size={18} color="#FFFFFF" />
              <Text style={styles.authButtonText}>Sign Up</Text>
            </Pressable>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(900).duration(500)}
            style={styles.termsText}
          >
            By continuing, you agree to our Terms & Privacy Policy
          </Animated.Text>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scissorsIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: DARK_COLORS.primary,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 16,
  },
  pingContainer: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pingOuter: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DARK_COLORS.primary,
  },
  pingInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK_COLORS.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 50,
    marginBottom: 16,
  },
  headlineGradient: {
    color: '#60A5FA',
  },
  subtext: {
    fontSize: 17,
    color: DARK_COLORS.textSecondary,
    lineHeight: 26,
    maxWidth: '95%',
  },
  bottomSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DARK_COLORS.primary,
    borderRadius: 24,
    padding: 6,
    paddingRight: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 24,
    padding: 6,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  buttonIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: DARK_COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    gap: 2,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSubtitle: {
    fontSize: 13,
    color: 'rgba(147, 197, 253, 0.9)',
  },
  secondarySubtitle: {
    fontSize: 13,
    color: DARK_COLORS.textMuted,
  },
  authRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  authButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    borderWidth: 1,
    borderColor: DARK_COLORS.borderLight,
  },
  authButtonPressed: {
    backgroundColor: DARK_COLORS.surfaceLight,
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 11,
    color: DARK_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
