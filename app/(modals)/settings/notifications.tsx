import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Linking,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  BellOff,
  ChevronRight,
  ExternalLink,
  BellMinus,
} from 'lucide-react-native';

const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  primary: '#11a4d4',
  primaryDark: '#0e8ab3',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#9aaeb5',
  border: '#dbe3e6',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  warningIcon: '#d97706',
};

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface NotificationSection {
  title: string;
  settings: NotificationSetting[];
}

export default function NotificationsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(false);
  const [pauseAllNotifications, setPauseAllNotifications] = useState(false);

  const [activeBookingsSettings, setActiveBookingsSettings] = useState<NotificationSetting[]>([
    {
      id: 'reminders',
      label: 'Appointment Reminders',
      description: 'Get alerted 1 hour before your cut',
      enabled: true,
    },
    {
      id: 'arrival',
      label: 'Barber Arrival',
      description: 'Know when your barber is en route',
      enabled: true,
    },
    {
      id: 'status',
      label: 'Booking Status',
      description: 'Confirmations and schedule changes',
      enabled: true,
    },
  ]);

  const [discoverySettings, setDiscoverySettings] = useState<NotificationSetting[]>([
    {
      id: 'availability',
      label: 'New Barber Availability',
      description: 'Notify me when top-rated barbers open slots',
      enabled: false,
    },
    {
      id: 'promotions',
      label: 'Promotions & Deals',
      description: 'Exclusive discounts on haircuts',
      enabled: true,
    },
  ]);

  const handleToggleActiveBookings = (id: string) => {
    setActiveBookingsSettings(
      activeBookingsSettings.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const handleToggleDiscovery = (id: string) => {
    setDiscoverySettings(
      discoverySettings.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notifications',
          headerStyle: { backgroundColor: LIGHT_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={LIGHT_COLORS.textPrimary} />
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
        {/* System Status Banner */}
        {!systemNotificationsEnabled && (
          <Surface style={styles.systemBanner} elevation={0}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                <BellOff size={20} color={LIGHT_COLORS.warningIcon} />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>System Notifications Disabled</Text>
                <Text style={styles.bannerDescription}>
                  Enable push notifications in iOS settings to receive alerts from your barber when they arrive.
                </Text>
              </View>
            </View>
            <Pressable style={styles.bannerButton} onPress={handleOpenSettings}>
              <Text style={styles.bannerButtonText}>Open Settings</Text>
              <ExternalLink size={14} color="#FFFFFF" />
            </Pressable>
          </Surface>
        )}

        {/* Global Controls */}
        <Surface style={styles.globalControlCard} elevation={0}>
          <View style={styles.controlRow}>
            <View style={styles.controlIcon}>
              <BellMinus size={18} color={LIGHT_COLORS.textSecondary} />
            </View>
            <Text style={styles.controlLabel}>Pause All Notifications</Text>
            <Switch
              value={pauseAllNotifications}
              onValueChange={setPauseAllNotifications}
              trackColor={{ false: '#cbd5e1', true: LIGHT_COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Surface>

        {/* Active Bookings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE BOOKINGS</Text>
          <Surface style={styles.settingsCard} elevation={0}>
            {activeBookingsSettings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  index !== activeBookingsSettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggleActiveBookings(setting.id)}
                  trackColor={{ false: '#cbd5e1', true: LIGHT_COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </Surface>
        </View>

        {/* Discovery & Offers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISCOVERY & OFFERS</Text>
          <Surface style={styles.settingsCard} elevation={0}>
            {discoverySettings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  index !== discoverySettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggleDiscovery(setting.id)}
                  trackColor={{ false: '#cbd5e1', true: LIGHT_COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </Surface>
        </View>

        {/* System Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM</Text>
          <Surface style={styles.settingsCard} elevation={0}>
            <Pressable style={styles.linkItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Advanced Settings</Text>
                <Text style={styles.settingDescription}>
                  Manage system-level permissions
                </Text>
              </View>
              <ChevronRight size={20} color={LIGHT_COLORS.textSecondary} />
            </Pressable>
          </Surface>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  // System Banner
  systemBanner: {
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    gap: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_COLORS.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
  },
  bannerDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 20,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LIGHT_COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Global Controls
  globalControlCard: {
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  controlIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  controlLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  // Section
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: LIGHT_COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  settingsCard: {
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: LIGHT_COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 14,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 2,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
});
