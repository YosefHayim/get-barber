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
  Mail,
  Lock,
  User,
  ChevronLeft,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGoogleAuth, useAppleAuth } from '@/features/auth/hooks';
import { useToast } from '@/hooks/useToast';
import { DARK_COLORS } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RegisterScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { signUp, isLoading: authLoading } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const { signInWithApple, isLoading: appleLoading } = useAppleAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isLoading = authLoading || googleLoading || appleLoading;

  const handleRegister = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    const { error: signUpError } = await signUp(email, password, displayName);

    if (signUpError) {
      setError(signUpError.message);
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
              uri: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent']}
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
                <Text style={styles.headerBadgeText}>SIGN UP</Text>
              </View>
              <View style={styles.headerSpacer} />
            </Animated.View>
          </ImageBackground>

          <View style={styles.content}>
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              style={styles.titleSection}
            >
              <Text style={styles.title}>Join the Hub</Text>
              <Text style={styles.subtitle}>
                Connect with top-rated barbers.{'\n'}Choose your preferred way
                to start.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.socialGrid}
            >
              <Pressable
                style={styles.socialGridButton}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={styles.appleIcon}>⌘</Text>
                </View>
                <Text style={styles.socialGridText}>Apple</Text>
              </Pressable>

              <Pressable
                style={styles.socialGridButton}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.socialGridText}>Google</Text>
              </Pressable>

              <Pressable
                style={styles.socialGridButton}
                onPress={() => router.push('/(auth)/phone-login')}
                disabled={isLoading}
              >
                <View style={styles.phoneIconContainer}>
                  <Phone size={20} color={DARK_COLORS.primary} />
                </View>
                <Text style={styles.socialGridText}>Phone</Text>
              </Pressable>

              <Pressable
                style={[styles.socialGridButton, styles.emailButton]}
                onPress={() => {}}
                disabled={isLoading}
              >
                <View style={styles.emailIconContainer}>
                  <Mail size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.socialGridText, styles.emailText]}>
                  Email
                </Text>
              </Pressable>
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
              entering={FadeInDown.delay(300).duration(500)}
              style={styles.dividerContainer}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with email</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              style={styles.form}
            >
              <View style={styles.inputContainer}>
                <User size={20} color={DARK_COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={DARK_COLORS.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>

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

              <View style={styles.inputContainer}>
                <Lock size={20} color={DARK_COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={DARK_COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(500).duration(500)}
              style={styles.termsContainer}
            >
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(600).duration(500)}
              style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Log in</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: 280,
    width: '100%',
  },
  heroGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
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
    marginTop: -40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: DARK_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: DARK_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  socialGridButton: {
    width: '47%',
    aspectRatio: 1.6,
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emailButton: {
    backgroundColor: DARK_COLORS.primary,
    borderColor: DARK_COLORS.primary,
  },
  socialIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleIcon: {
    fontSize: 22,
    color: DARK_COLORS.textPrimary,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  socialGridText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  emailText: {
    color: '#FFFFFF',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DARK_COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: DARK_COLORS.textMuted,
    fontWeight: '500',
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: DARK_COLORS.textPrimary,
  },
  primaryButton: {
    height: 52,
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
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 11,
    color: DARK_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: DARK_COLORS.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
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
