import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
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
  Star,
  Scissors,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
}

function MenuItem({ icon, label, onPress, showBadge }: MenuItemProps): React.JSX.Element {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.menuItem}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
        {showBadge && <View style={styles.badge} />}
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, signOut, isLoading } = useAuth();
  const toggleUserMode = useAppStore((s) => s.toggleUserMode);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleSwitchToBarber = () => {
    toggleUserMode();
    router.replace('/(barber-tabs)/dashboard');
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loginPrompt}>
          <View style={styles.loginIconContainer}>
            <User size={48} color={COLORS.gold} />
          </View>
          <Text style={styles.loginTitle}>Sign in to continue</Text>
          <Text style={styles.loginText}>
            Create an account to book barbers and track your appointments
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
            labelStyle={styles.loginButtonLabel}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.profileCard} elevation={2}>
        <Avatar
          uri={null}
          name={user.email ?? 'User'}
          size={80}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user.email?.split('@')[0] ?? 'User'}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.ratingRow}>
            <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.ratingText}>5.0 rating</Text>
            <View style={styles.customerBadge}>
              <Sparkles size={10} color={COLORS.goldDark} />
              <Text style={styles.customerBadgeText}>Gold Member</Text>
            </View>
          </View>
        </View>
      </Surface>

      <Surface style={styles.switchModeCard} elevation={2}>
        <View style={styles.switchModeContent}>
          <View style={styles.switchModeIcon}>
            <Scissors size={24} color={COLORS.gold} />
          </View>
          <View style={styles.switchModeInfo}>
            <Text style={styles.switchModeTitle}>Are you a barber?</Text>
            <Text style={styles.switchModeText}>
              Switch to business mode to manage requests
            </Text>
          </View>
        </View>
        <Button
          mode="contained"
          icon={() => <RefreshCw size={16} color={COLORS.charcoal} />}
          onPress={handleSwitchToBarber}
          style={styles.switchModeButton}
          labelStyle={styles.switchModeButtonLabel}
          compact
        >
          Switch
        </Button>
      </Surface>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<User size={20} color={COLORS.goldDark} />}
            label="Edit Profile"
            onPress={() => router.push('/(modals)/settings/edit-profile')}
          />
          <MenuItem
            icon={<MapPin size={20} color={COLORS.goldDark} />}
            label="Saved Addresses"
            onPress={() => router.push('/(modals)/settings/saved-addresses')}
          />
          <MenuItem
            icon={<CreditCard size={20} color={COLORS.goldDark} />}
            label="Payment Methods"
            onPress={() => router.push('/(modals)/settings/payment-methods')}
          />
        </Surface>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<Bell size={20} color={COLORS.textMuted} />}
            label="Notifications"
            onPress={() => router.push('/(modals)/settings/notifications')}
            showBadge
          />
          <MenuItem
            icon={<HelpCircle size={20} color={COLORS.textMuted} />}
            label="Help & Support"
            onPress={() => router.push('/(modals)/settings/help-support')}
          />
        </Surface>
      </View>

      <Button
        mode="outlined"
        onPress={handleSignOut}
        loading={isLoading}
        icon={() => <LogOut size={18} color={COLORS.error} />}
        textColor={COLORS.error}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>

      <Text style={styles.versionText}>BarberConnect v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
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
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  loginTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  loginButton: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING['3xl'],
    backgroundColor: COLORS.goldDark,
  },
  loginButtonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  customerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  customerBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.goldDark,
  },
  switchModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.charcoal,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  switchModeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  switchModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchModeInfo: {
    flex: 1,
  },
  switchModeTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
  },
  switchModeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  switchModeButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
  },
  switchModeButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.charcoal,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  signOutButton: {
    borderColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
  },
});
