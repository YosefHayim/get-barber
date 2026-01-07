import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Scissors,
  Shield,
  Camera,
  Edit3,
  RefreshCw,
  Calendar,
  ImageIcon,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import { MOCK_BARBER_STATS } from '@/constants/mockData';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  value?: string;
  showBadge?: boolean;
  isDestructive?: boolean;
}

function MenuItem({
  icon,
  label,
  onPress,
  value,
  showBadge,
  isDestructive,
}: MenuItemProps): React.JSX.Element {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.menuItem}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={[styles.menuLabel, isDestructive && styles.menuLabelDestructive]}>
          {label}
        </Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        {showBadge && <View style={styles.badge} />}
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>
    </Pressable>
  );
}

export default function BarberProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isOnline = useAppStore((s) => s.isBarberOnline);
  const toggleOnline = useAppStore((s) => s.toggleBarberOnline);
  const toggleUserMode = useAppStore((s) => s.toggleUserMode);
  const stats = MOCK_BARBER_STATS;

  const handleSignOut = () => {
    router.replace('/(auth)/login');
  };

  const handleSwitchToCustomer = () => {
    toggleUserMode();
    router.replace('/(tabs)');
  };

  const handleEditProfile = () => {
    router.push('/(modals)/barber-settings/personal-info');
  };

  const handleServicesAndPricing = () => {
    router.push('/(modals)/barber-settings/services-pricing');
  };

  const handleWorkingHours = () => {
    router.push('/(modals)/barber-settings/working-hours');
  };

  const handlePersonalInfo = () => {
    router.push('/(modals)/barber-settings/personal-info');
  };

  const handlePayoutMethods = () => {
    router.push('/(modals)/barber-settings/payout-methods');
  };

  const handleNotifications = () => {
    router.push('/(modals)/barber-settings/notifications');
  };

  const handleAppSettings = () => {
    router.push('/(modals)/barber-settings/app-settings');
  };

  const handleHelpSupport = () => {
    router.push('/(modals)/barber-settings/help-support');
  };

  const handleBookingsHistory = () => {
    router.push('/(modals)/barber-settings/bookings-history');
  };

  const handlePortfolioGallery = () => {
    router.push('/(modals)/barber-settings/portfolio-gallery');
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar uri={null} name="Yossi Cohen" size={90} />
            <Pressable style={styles.cameraButton}>
              <Camera size={18} color={COLORS.textInverse} />
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Yossi Cohen</Text>
              <View style={styles.verifiedBadge}>
                <Shield size={12} color={COLORS.success} />
              </View>
            </View>
            <Text style={styles.businessName}>Yossi's Barbershop</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.ratingText}>
                {stats.averageRating} ({stats.totalReviews} reviews)
              </Text>
            </View>
          </View>
          <Pressable style={styles.editButton} onPress={handleEditProfile}>
            <Edit3 size={18} color={COLORS.gold} />
          </Pressable>
        </View>

        <Surface style={styles.statusCard} elevation={2}>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? COLORS.success : COLORS.textMuted },
                ]}
              />
              <Text style={styles.statusText}>
                {isOnline ? 'Available for bookings' : 'Currently offline'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: COLORS.mediumGray, true: COLORS.goldMuted }}
              thumbColor={isOnline ? COLORS.gold : COLORS.textMuted}
            />
          </View>
        </Surface>
      </Animated.View>

      <View style={styles.statsGrid}>
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.statItem}>
          <Surface style={styles.statCard} elevation={1}>
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </Surface>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150).duration(300)} style={styles.statItem}>
          <Surface style={styles.statCard} elevation={1}>
            <Text style={styles.statValue}>{stats.responseRate}%</Text>
            <Text style={styles.statLabel}>Response</Text>
          </Surface>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.statItem}>
          <Surface style={styles.statCard} elevation={1}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Years Exp.</Text>
          </Surface>
        </Animated.View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Business Settings</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<Scissors size={20} color={COLORS.gold} />}
            label="Services & Pricing"
            value="10 services"
            onPress={handleServicesAndPricing}
          />
          <MenuItem
            icon={<ImageIcon size={20} color={COLORS.gold} />}
            label="Portfolio & Social"
            value="Gallery & Links"
            onPress={handlePortfolioGallery}
          />
          <MenuItem
            icon={<Clock size={20} color={COLORS.gold} />}
            label="Working Hours"
            value="Sun-Fri"
            onPress={handleWorkingHours}
          />
          <MenuItem
            icon={<MapPin size={20} color={COLORS.gold} />}
            label="Service Area"
            value="10 km"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Calendar size={20} color={COLORS.gold} />}
            label="Bookings History"
            onPress={handleBookingsHistory}
          />
        </Surface>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<User size={20} color={COLORS.textMuted} />}
            label="Personal Info"
            onPress={handlePersonalInfo}
          />
          <MenuItem
            icon={<CreditCard size={20} color={COLORS.textMuted} />}
            label="Payout Methods"
            onPress={handlePayoutMethods}
          />
          <MenuItem
            icon={<Bell size={20} color={COLORS.textMuted} />}
            label="Notifications"
            onPress={handleNotifications}
            showBadge
          />
          <MenuItem
            icon={<Settings size={20} color={COLORS.textMuted} />}
            label="App Settings"
            onPress={handleAppSettings}
          />
        </Surface>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<HelpCircle size={20} color={COLORS.textMuted} />}
            label="Help & Support"
            onPress={handleHelpSupport}
          />
        </Surface>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon={() => <RefreshCw size={18} color={COLORS.gold} />}
          onPress={handleSwitchToCustomer}
          style={styles.switchButton}
          labelStyle={styles.switchButtonLabel}
        >
          Switch to Customer Mode
        </Button>

        <Button
          mode="text"
          icon={() => <LogOut size={18} color={COLORS.error} />}
          onPress={handleSignOut}
          textColor={COLORS.error}
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </View>

      <Text style={styles.versionText}>BarberConnect Business v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },
  header: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.charcoal,
  },
  profileInfo: {
    flex: 1,
    gap: SPACING.xxs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.medium,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xxs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
  },
  statCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  menuSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.darkGray,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textInverse,
  },
  menuLabelDestructive: {
    color: COLORS.error,
  },
  menuValue: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  actions: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  switchButton: {
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
  },
  switchButtonLabel: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
  signOutButton: {
    borderRadius: RADIUS.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
  },
});
