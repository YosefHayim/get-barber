import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, Surface, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Calendar,
  Star,
  Gift,
  Megaphone,
} from 'lucide-react-native';
import { DARK_COLORS } from '@/constants/theme';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function NotificationsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'push',
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: <Bell size={20} color={DARK_COLORS.primary} />,
      enabled: true,
    },
    {
      id: 'messages',
      label: 'New Messages',
      description: 'Get notified when barbers message you',
      icon: <MessageSquare size={20} color={DARK_COLORS.primary} />,
      enabled: true,
    },
    {
      id: 'bookings',
      label: 'Booking Updates',
      description: 'Updates about your upcoming and past bookings',
      icon: <Calendar size={20} color={DARK_COLORS.primary} />,
      enabled: true,
    },
    {
      id: 'reviews',
      label: 'Review Reminders',
      description: 'Reminders to rate your barber after service',
      icon: <Star size={20} color={DARK_COLORS.accent} />,
      enabled: false,
    },
    {
      id: 'promotions',
      label: 'Promotions & Offers',
      description: 'Special deals and discounts from barbers',
      icon: <Gift size={20} color={DARK_COLORS.accent} />,
      enabled: false,
    },
    {
      id: 'news',
      label: 'App Updates & News',
      description: 'New features and important announcements',
      icon: <Megaphone size={20} color={DARK_COLORS.primary} />,
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings(
      settings.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const enabledCount = settings.filter((s) => s.enabled).length;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notifications',
          headerStyle: { backgroundColor: DARK_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: DARK_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={DARK_COLORS.textPrimary} />
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
        <Surface style={styles.summaryCard} elevation={0}>
          <View style={styles.summaryIcon}>
            <Bell size={28} color={DARK_COLORS.primary} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Notification Status</Text>
            <Text style={styles.summaryText}>
              {enabledCount} of {settings.length} notifications enabled
            </Text>
          </View>
        </Surface>

        <Text style={styles.sectionTitle}>Notification Preferences</Text>

        <Surface style={styles.settingsCard} elevation={0}>
          {settings.map((setting, index) => (
            <View
              key={setting.id}
              style={[
                styles.settingItem,
                index !== settings.length - 1 && styles.settingItemBorder,
              ]}
            >
              <View style={styles.settingIconContainer}>{setting.icon}</View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Text style={styles.settingDescription}>
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => handleToggle(setting.id)}
                color={DARK_COLORS.primary}
              />
            </View>
          ))}
        </Surface>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            You can customize which notifications you receive. Important
            notifications about your active bookings will always be sent.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Quiet Hours</Text>
          <Text style={styles.infoText}>
            During Shabbat (Friday sunset to Saturday sunset), we pause
            non-urgent notifications to respect your time.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: DARK_COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textMuted,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: DARK_COLORS.textMuted,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.primary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: DARK_COLORS.textSecondary,
    lineHeight: 20,
  },
});
