import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGoogleAuth, useAppleAuth } from '@/features/auth/hooks';
import { useToast } from '@/hooks/useToast';
import { COLORS, SHADOWS } from '@/constants/theme';

const BORDER_COLOR = '#dbe3e6';

export default function LoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { signIn, isLoading: authLoading } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const { signInWithApple, isLoading: appleLoading } = useAppleAuth();
  const toast = useToast();

  const isLoading = authLoading || googleLoading || appleLoading;

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      router.replace('/(tabs)');
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Get Started</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYLudwiUQaA6L7a24JClgkG1ifxKnSdfXiNO5OR1Qs-qe5fgnygDask4qM6TshDNluChkMpKWtcSO38T6APcGZuwDiwUfXi7gV0cF6cYObiSU8sR4YjyKQxYVuDQfRYbkgsybW0ior_N3_H1qzlYSbwhgOJY6oQKa8sDn0SGCedXK0LWItL980bGndBYSEn-h0wQsGEWkaF1D4n-Ls0afJR66E4bctDkpFouCksaKlG4LD9VaXOo9Y7PgmDUTluQzhx1OXJH2S-fW1',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.heroGradient}
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Look sharp, in a tap.</Text>
          <Text style={styles.subtitle}>
            Quick access to the best barber services.
          </Text>
        </View>

        <View style={styles.authButtons}>
          <Link href="/(auth)/phone-login" asChild>
            <Pressable style={styles.authButton} disabled={isLoading}>
              <Phone size={24} color={COLORS.textPrimary} />
              <Text style={styles.authButtonText}>Continue with Phone</Text>
            </Pressable>
          </Link>

          <Pressable
            style={styles.authButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon />
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            style={styles.authButton}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <AppleIcon />
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </Pressable>

          <Pressable style={styles.authButton} disabled={isLoading}>
            <FacebookIcon />
            <Text style={styles.authButtonText}>Continue with Facebook</Text>
          </Pressable>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Image
        source={{
          uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1QzIyLjU2IDExLjQ3IDIyLjQ5IDEwLjcyIDIyLjM2IDEwSDEyVjE0LjI2SDE3LjkyQzE3LjY2IDE1LjYzIDE2Ljg4IDE2Ljc5IDE1LjcxIDE3LjU3VjIwLjM0SDE5LjI4QzIxLjM2IDE4LjQyIDIyLjU2IDE1LjYgMjIuNTYgMTIuMjVaIiBmaWxsPSIjNDI4NUY0Ii8+CjxwYXRoIGQ9Ik0xMiAyM0MxNC45NyAyMyAxNy40NiAyMi4wMiAxOS4yOCAyMC4zNEwxNS43MSAxNy41N0MxNC43MyAxOC4yMyAxMy40OCAxOC42MyAxMiAxOC42M0M5LjE0IDE4LjYzIDYuNzEgMTYuNyA1Ljg0IDE0LjFIMi4xOFYxNi45NEM0IDE5LjQ3IDcuNyAyMiAxMiAyMloiIGZpbGw9IiMzNEE4NTMiLz4KPHBhdGggZD0iTTUuODQgMTQuMDlDNS42MiAxMy40MyA1LjUgMTIuNzMgNS41IDEyQzUuNSAxMS4yNyA1LjYzIDEwLjU3IDUuODQgOS45MVY3LjA3SDIuMThDMS40MyA4LjU1IDEgMTAuMjIgMSAxMkMxIDEzLjc4IDEuNDMgMTUuNDUgMi4xOCAxNi45M0w1Ljg0IDE0LjA5WiIgZmlsbD0iI0ZCQkMwNSIvPgo8cGF0aCBkPSJNMTIgNS4zOEMxMy42MiA1LjM4IDE1LjA2IDUuOTQgMTYuMjEgNy4wMkwxOS4zNiAzLjg3QzE3LjQ1IDIuMDkgMTQuOTcgMSAxMiAxQzcuNyAxIDQgMy40NyAyLjE4IDcuMDdMNS44NCA5Ljg0QzYuNzEgNy4yNCA5LjE0IDUuMzggMTIgNS4zOFoiIGZpbGw9IiNFQTQzMzUiLz4KPC9zdmc+',
        }}
        style={styles.iconImage}
      />
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Text style={styles.appleIconText}></Text>
    </View>
  );
}

function FacebookIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Image
        source={{
          uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyIDEyQzIyIDYuNDc3IDE3LjUyMyAyIDEyIDJTMiA2LjQ3NyAyIDEyQzIgMTYuOTkxIDUuNjU3IDIxLjEyOCAxMC40MzggMjEuODc4VjE0Ljg5MUg3Ljg5OFYxMkgxMC40MzhWOS43OTdDMTAuNDM4IDcuMjkxIDExLjkzIDUuODkgMTQuMjE1IDUuODlDMTUuMzA5IDUuODkgMTYuNDUzIDYuMDg1IDE2LjQ1MyA2LjA4NVY4LjU0NUgxNS4xOTNDMTMuOTUgOC41NDUgMTMuNTYzIDkuMzE3IDEzLjU2MyAxMC4xMDlWMTJIMTYuMzM2TDE1Ljg5MyAxNC44OTFIMTMuNTYzVjIxLjg3OEMxOC4zNDMgMjEuMTI4IDIyIDE2Ljk5MSAyMiAxMloiIGZpbGw9IiMxODc3RjIiLz4KPC9zdmc+',
        }}
        style={styles.iconImage}
      />
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
    paddingVertical: 16,
    backgroundColor: COLORS.background,
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
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroContainer: {
    width: '100%',
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  authButtons: {
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...SHADOWS.sm,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  appleIconText: {
    fontSize: 20,
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
});
