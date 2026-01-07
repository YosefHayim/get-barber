import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Scissors,
  Mail,
  Lock,
  Phone,
  ChevronLeft,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGoogleAuth, useAppleAuth } from '@/features/auth/hooks';
import { useToast } from '@/hooks/useToast';
import { DARK_COLORS } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { signIn, isLoading: authLoading } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const { signInWithApple, isLoading: appleLoading } = useAppleAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isLoading = authLoading || googleLoading || appleLoading;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const result = await signInWithGoogle();

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      router.replace('/(tabs)');
    }
  };

  const handleAppleSignIn = async () => {
    setError('');
    const result = await signInWithApple();

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent']}
              style={styles.heroGradientTop}
            />
            <LinearGradient
              colors={['transparent', DARK_COLORS.background]}
              style={styles.heroGradientBottom}
            />

            <Animated.View
              entering={FadeIn.duration(400)}
              style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color="#FFFFFF" />
              </Pressable>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>GET STARTED</Text>
              </View>
              <View style={styles.headerSpacer} />
            </Animated.View>
          </ImageBackground>

          <View style={styles.content}>
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              style={styles.titleSection}
            >
              <Text style={styles.title}>Look sharp, in a tap.</Text>
              <Text style={styles.subtitle}>
                Quick access to the best barber services.
              </Text>
            </Animated.View>

            {error ? (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.errorContainer}
              >
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.form}
            >
              <View style={styles.inputContainer}>
                <Mail size={20} color={DARK_COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={DARK_COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={DARK_COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={DARK_COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={DARK_COLORS.textMuted} />
                  ) : (
                    <Eye size={20} color={DARK_COLORS.textMuted} />
                  )}
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              style={styles.dividerContainer}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              style={styles.socialButtons}
            >
              <Pressable
                style={styles.socialButton}
                onPress={() => router.push('/(auth)/phone-login')}
                disabled={isLoading}
              >
                <Phone size={22} color={DARK_COLORS.textPrimary} />
                <Text style={styles.socialButtonText}>Phone</Text>
              </Pressable>

              <Pressable
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon />
                <Text style={styles.socialButtonText}>Google</Text>
              </Pressable>

              <Pressable
                style={styles.socialButton}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <AppleIcon />
                <Text style={styles.socialButtonText}>Apple</Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(500).duration(500)}
              style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.appleIcon}>
      <Text style={styles.appleA}>⌘</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroImage: {
    height: 220,
    width: '100%',
  },
  heroGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DARK_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: DARK_COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: DARK_COLORS.errorMuted,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: DARK_COLORS.errorLight,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: DARK_COLORS.textPrimary,
  },
  primaryButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DARK_COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: DARK_COLORS.textMuted,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: DARK_COLORS.surface,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4285F4',
  },
  appleIcon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleA: {
    fontSize: 18,
    color: DARK_COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: DARK_COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_COLORS.primary,
  },
});
