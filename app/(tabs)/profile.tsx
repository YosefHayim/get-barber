import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Lock,
  FileText,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

// Light theme colors
const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceDark: '#1C2333',
  primary: '#135bec',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
};

interface MenuItemProps {
  icon: React.ReactNode;
  iconBgColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  rightElement?: React.ReactNode;
}

function MenuItem({
  icon,
  iconBgColor,
  label,
  subtitle,
  onPress,
  showChevron = true,
  isLast = false,
  rightElement,
}: MenuItemProps): React.JSX.Element {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.menuItem, !isLast && styles.menuItemBorder]}>
        <View style={[styles.menuIcon, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuLabel}>{label}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement}
        {showChevron && !rightElement && (
          <ChevronRight size={20} color={LIGHT_COLORS.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, signOut, isLoading } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleEditProfile = () => {
    router.push('/(modals)/settings/edit-profile');
  };

  // Colors for icon backgrounds based on the light design
  const iconColors = {
    blue: '#dbeafe', // Account items - light blue
    purple: '#ede9fe', // App settings items - light purple
    orange: '#ffedd5', // Support items - light orange
  };

  const iconTextColors = {
    blue: '#135bec',
    purple: '#7c3aed',
    orange: '#ea580c',
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loginPrompt}>
          <View style={styles.loginIconContainer}>
            <User size={48} color={LIGHT_COLORS.primary} />
          </View>
          <Text style={styles.loginTitle}>Sign in to continue</Text>
          <Text style={styles.loginText}>
            Create an account to book barbers and track your appointments
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonLabel}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={handleEditProfile} style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={null}
              name={user.email ?? 'User'}
              size={112}
            />
            <Pressable style={styles.cameraButton}>
              <Camera size={18} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user.email?.split('@')[0] ?? 'User'}
            </Text>
            <View style={styles.membershipRow}>
              <View style={styles.goldDot} />
              <Text style={styles.membershipText}>Gold Member - Since 2023</Text>
            </View>
          </View>
        </View>

        {/* Account Settings Group */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Surface style={styles.menuCard} elevation={0}>
            <MenuItem
              icon={<User size={22} color={iconTextColors.blue} />}
              iconBgColor={iconColors.blue}
              label="Personal Information"
              onPress={() => router.push('/(modals)/settings/edit-profile')}
            />
            <MenuItem
              icon={<MapPin size={22} color={iconTextColors.blue} />}
              iconBgColor={iconColors.blue}
              label="Saved Addresses"
              onPress={() => router.push('/(modals)/settings/saved-addresses')}
            />
            <MenuItem
              icon={<CreditCard size={22} color={iconTextColors.blue} />}
              iconBgColor={iconColors.blue}
              label="Payment Methods"
              subtitle="Visa ending in 4242"
              onPress={() => router.push('/(modals)/settings/payment-methods')}
              isLast
            />
          </Surface>
        </View>

        {/* App Settings Group */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <Surface style={styles.menuCard} elevation={0}>
            <MenuItem
              icon={<Bell size={22} color={iconTextColors.purple} />}
              iconBgColor={iconColors.purple}
              label="Notifications"
              onPress={() => {}}
              showChevron={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{
                    false: LIGHT_COLORS.textMuted,
                    true: LIGHT_COLORS.primary,
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={LIGHT_COLORS.textMuted}
                />
              }
            />
            <MenuItem
              icon={<Lock size={22} color={iconTextColors.purple} />}
              iconBgColor={iconColors.purple}
              label="Privacy & Security"
              onPress={() => router.push('/(modals)/settings/privacy')}
              isLast
            />
          </Surface>
        </View>

        {/* Support Group */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Surface style={styles.menuCard} elevation={0}>
            <MenuItem
              icon={<HelpCircle size={22} color={iconTextColors.orange} />}
              iconBgColor={iconColors.orange}
              label="Help Center"
              onPress={() => router.push('/(modals)/settings/help-support')}
            />
            <MenuItem
              icon={<FileText size={22} color={iconTextColors.orange} />}
              iconBgColor={iconColors.orange}
              label="Terms of Service"
              onPress={() => router.push('/(modals)/settings/terms')}
              isLast
            />
          </Surface>
        </View>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <LogOut size={20} color={LIGHT_COLORS.error} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.2.4</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: LIGHT_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  editButton: {
    width: 48,
    alignItems: 'flex-end',
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  loginIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  loginTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: LIGHT_COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING['3xl'],
    paddingVertical: SPACING.md,
  },
  loginButtonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIGHT_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  profileName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eab308',
  },
  membershipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textMuted,
  },
  menuSection: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: LIGHT_COLORS.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING['2xl'],
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    gap: SPACING.sm,
  },
  logoutButtonText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});
