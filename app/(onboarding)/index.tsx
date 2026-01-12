import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import {
  Scissors,
  MapPin,
  Store,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const COLORS = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  accent: '#f59e0b',
  backgroundDark: '#0f1115',
  surfaceDark: '#181b21',
};

export default function WelcomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB37DVbg6xJaNXUCu1hghXfOAQ3s02D-MlKsO0KuaHGyXTYXGHjBBC74p8SZEYxH3e_WkMAFMCRPCZJkCS33qOQBG_SgBeSKCFbCwedgkTKuQ7LrGnBXU1pD4IiLyWlZHnQAs0CUOrdRG2lTFYtZHav54qJQ5Wq8NhqmgeS7R8ljGCVzs-2wBxIrvBRdfdsJsdqofrmF8mL48ygQRGYBU0BNJ2422g1tmOt35VjbmNW6Fz-Yqkh2VNJ_HuVJWNECWvwzJeQBSy6YXvi',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent']}
          locations={[0, 0.5, 1]}
          style={styles.gradientTop}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(15,17,21,0.95)', COLORS.backgroundDark]}
          locations={[0, 0.4, 1]}
          style={styles.gradientBottom}
          pointerEvents="none"
        />

        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIconWrapper}>
              <Scissors size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>
              Barber<Text style={styles.brandNameAccent}>Hub</Text>
            </Text>
          </View>
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.premiumBadge}>
            <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.premiumBadgeText}>PREMIUM CUTS</Text>
          </View>

          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Your personal barber,</Text>
            <MaskedView
              maskElement={
                <Text style={[styles.headline, styles.headlineGradientMask]}>
                  delivered.
                </Text>
              }
            >
              <LinearGradient
                colors={['#60a5fa', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientTextBackground}
              >
                <Text style={[styles.headline, styles.headlineGradientMask, { opacity: 0 }]}>
                  delivered.
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>

          <Text style={styles.subtitle}>
            Choose your experience. We bring the style to you, or find you the nearest chair instantly.
          </Text>

          <View style={styles.buttonContainer}>
            <Link href="/(onboarding)/user-type" asChild>
              <Pressable style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed
              ]}>
                {({ pressed }) => (
                  <>
                    <LinearGradient
                      colors={pressed ? ['rgba(59,130,246,0.2)', 'transparent'] : ['rgba(59,130,246,0.1)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradientOverlay}
                    />
                    <View style={styles.buttonContent}>
                      <View style={styles.primaryIconWrapper}>
                        <MapPin size={22} color="#FFFFFF" />
                      </View>
                      <View style={styles.buttonTextContainer}>
                        <Text style={styles.primaryButtonTitle}>Book a Barber to my Home</Text>
                        <Text style={styles.primaryButtonSubtitle}>We come to your door</Text>
                      </View>
                      <ChevronRight 
                        size={20} 
                        color={pressed ? '#FFFFFF' : 'rgba(255,255,255,0.2)'} 
                        style={styles.buttonArrow} 
                      />
                    </View>
                  </>
                )}
              </Pressable>
            </Link>

            <Link href="/(tabs)/home" asChild>
              <Pressable style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed
              ]}>
                {({ pressed }) => (
                  <>
                    <LinearGradient
                      colors={pressed ? ['rgba(245,158,11,0.2)', 'transparent'] : ['rgba(245,158,11,0.1)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.buttonGradientOverlay, { opacity: pressed ? 1 : 0 }]}
                    />
                    <View style={styles.buttonContent}>
                      <View style={styles.secondaryIconWrapper}>
                        <Store size={22} color={COLORS.accent} />
                      </View>
                      <View style={styles.buttonTextContainer}>
                        <Text style={styles.secondaryButtonTitle}>Find Available Barbers Now</Text>
                        <Text style={styles.secondaryButtonSubtitle}>Book a chair nearby</Text>
                      </View>
                      <ChevronRight 
                        size={20} 
                        color={pressed ? '#FFFFFF' : 'rgba(255,255,255,0.2)'} 
                        style={styles.buttonArrow} 
                      />
                    </View>
                  </>
                )}
              </Pressable>
            </Link>

            <View style={styles.authButtonsRow}>
              <Link href="/(auth)/login" asChild>
                <Pressable style={({ pressed }) => [
                  styles.authButton,
                  pressed && styles.authButtonPressed
                ]}>
                  <Text style={styles.authButtonText}>Log In</Text>
                </Pressable>
              </Link>
              <Link href="/(auth)/register" asChild>
                <Pressable style={({ pressed }) => [
                  styles.authButton,
                  pressed && styles.authButtonPressed
                ]}>
                  <Text style={styles.authButtonText}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
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
    height: '35%',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandNameAccent: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e5e7eb',
    letterSpacing: 1,
  },
  headlineContainer: {
    marginBottom: 12,
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 42,
  },
  headlineGradientMask: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  gradientTextBackground: {
    height: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(24,27,33,0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 4,
  },
  primaryButtonPressed: {
    borderColor: 'rgba(59,130,246,0.5)',
  },
  secondaryButton: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(24,27,33,0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 4,
  },
  secondaryButtonPressed: {
    borderColor: 'rgba(245,158,11,0.5)',
  },
  buttonGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  primaryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    gap: 2,
  },
  primaryButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButtonSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(191,219,254,0.7)',
  },
  secondaryButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButtonSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  buttonArrow: {
    marginLeft: 'auto',
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  authButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  authButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#4b5563',
    marginTop: 24,
    marginBottom: 8,
  },
});
