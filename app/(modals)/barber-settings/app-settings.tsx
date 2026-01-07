import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, Switch, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Settings,
  Globe,
  Moon,
  MapPin,
  Shield,
  Smartphone,
  ChevronRight,
  Trash2,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

export default function AppSettingsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const [language, setLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleLanguageChange = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => setLanguage('English') },
        { text: 'Hebrew', onPress: () => setLanguage('Hebrew') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data and may improve app performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Cache cleared successfully!'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'App Settings',
          headerStyle: { backgroundColor: COLORS.charcoal },
          headerTitleStyle: { fontWeight: '700', color: COLORS.textInverse },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={COLORS.gold} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Settings size={28} color={COLORS.gold} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>BarberConnect Business</Text>
            <Text style={styles.summaryText}>Version 1.0.0</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingsCard}>
          <Pressable style={styles.settingItem} onPress={handleLanguageChange}>
            <View style={styles.settingIconContainer}>
              <Globe size={20} color={COLORS.gold} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingDescription}>
                App interface language
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{language}</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </View>
          </Pressable>

          <View style={[styles.settingItem, styles.settingItemBorder]}>
            <View style={styles.settingIconContainer}>
              <Moon size={20} color={COLORS.gold} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme throughout the app
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              color={COLORS.gold}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Privacy & Security</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MapPin size={20} color={COLORS.gold} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Location Services</Text>
              <Text style={styles.settingDescription}>
                Enable for accurate distance calculations
              </Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              color={COLORS.gold}
            />
          </View>

          <View style={[styles.settingItem, styles.settingItemBorder]}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={COLORS.gold} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Use Face ID / Touch ID to login
              </Text>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              color={COLORS.gold}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Data & Storage</Text>

        <View style={styles.settingsCard}>
          <Pressable style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingIconContainer}>
              <Smartphone size={20} color={COLORS.gold} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDescription}>
                Free up storage space
              </Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <View style={styles.dangerCard}>
          <Pressable style={styles.dangerItem} onPress={handleDeleteAccount}>
            <View style={styles.dangerIconContainer}>
              <Trash2 size={20} color={COLORS.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.dangerLabel}>Delete Account</Text>
              <Text style={styles.dangerDescription}>
                Permanently delete your account and all data
              </Text>
            </View>
            <ChevronRight size={18} color={COLORS.error} />
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Need Help?</Text>
          <Text style={styles.infoText}>
            If you're experiencing issues with the app, try clearing the cache
            first. For persistent problems, contact our support team.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginBottom: SPACING.xxs,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  settingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
    marginBottom: SPACING.xxs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  settingValueText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.medium,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dangerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  dangerLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.error,
    marginBottom: SPACING.xxs,
  },
  dangerDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
