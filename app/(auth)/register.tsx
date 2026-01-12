import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Text,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import { useGoogleAuth, useAppleAuth } from '@/features/auth/hooks';
import { useToast } from '@/hooks/useToast';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  primary: '#135bec',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

export default function RegisterScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const { signInWithApple, isLoading: appleLoading } = useAppleAuth();
  const toast = useToast();

  const isLoading = googleLoading || appleLoading;

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      router.replace('/(onboarding)/user-type');
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      router.replace('/(onboarding)/user-type');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us to find the best barbers{'\n'}in your area
          </Text>
        </View>

        {/* Auth Grid */}
        <View style={styles.authGrid}>
          <Pressable
            style={styles.authCard}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <View style={[styles.authIconContainer, styles.appleBg]}>
              <Text style={styles.appleIcon}></Text>
            </View>
            <Text style={styles.authCardText}>Apple</Text>
          </Pressable>

          <Pressable
            style={styles.authCard}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={[styles.authIconContainer, styles.googleBg]}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.authCardText}>Google</Text>
          </Pressable>

          <Pressable style={styles.authCard} disabled={isLoading}>
            <View style={[styles.authIconContainer, styles.facebookBg]}>
              <Text style={styles.facebookF}>f</Text>
            </View>
            <Text style={styles.authCardText}>Facebook</Text>
          </Pressable>

          <Link href="/(auth)/phone-login" asChild>
            <Pressable style={[styles.authCard, styles.phoneCard]} disabled={isLoading}>
              <View style={[styles.authIconContainer, styles.phoneBg]}>
                <Phone size={24} color={COLORS.primary} />
              </View>
              <Text style={[styles.authCardText, styles.phoneCardText]}>Phone</Text>
            </Pressable>
          </Link>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.loginLink}>Log in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  heroSection: {
    height: 180,
    width: '100%',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    maxWidth: Dimensions.get('window').width - 32,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  authGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  authCard: {
    width: '47%',
    aspectRatio: 1.5,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  phoneCard: {
    borderColor: 'rgba(19, 91, 236, 0.2)',
    backgroundColor: 'rgba(19, 91, 236, 0.02)',
  },
  authIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleBg: {
    backgroundColor: '#000000',
  },
  googleBg: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facebookBg: {
    backgroundColor: '#1877F2',
  },
  phoneBg: {
    backgroundColor: 'rgba(19, 91, 236, 0.1)',
  },
  appleIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  googleG: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  facebookF: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  phoneCardText: {
    color: COLORS.primary,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  termsLink: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
