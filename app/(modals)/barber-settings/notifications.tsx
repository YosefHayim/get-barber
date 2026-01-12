import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function BarberNotificationsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new_requests',
      label: 'New Service Requests',
      description: 'Get notified when customers request your services',
      icon: <Bell size={20} color={COLORS.gold} />,
      enabled: true,
    },
    {
      id: 'messages',
      label: 'New Messages',
      description: 'Notifications for customer messages',
      icon: <MessageSquare size={20} color={COLORS.gold} />,
      enabled: true,
    },
    {
      id: 'bookings',
      label: 'Booking Updates',
      description: 'Confirmations, cancellations, and reminders',
      icon: <Calendar size={20} color={COLORS.gold} />,
      enabled: true,
    },
    {
      id: 'earnings',
      label: 'Earnings Updates',
      description: 'Daily earnings summary and payout notifications',
      icon: <DollarSign size={20} color={COLORS.gold} />,
      enabled: true,
    },
    {
      id: 'reviews',
      label: 'New Reviews',
      description: 'Get notified when customers leave reviews',
      icon: <TrendingUp size={20} color={COLORS.gold} />,
      enabled: true,
    },
    {
      id: 'clients',
      label: 'Client Updates',
      description: 'New client registrations and returning customers',
      icon: <Users size={20} color={COLORS.gold} />,
      enabled: false,
    },
    {
      id: 'urgent',
      label: 'Urgent Alerts',
      description: 'Critical updates about your account or bookings',
      icon: <AlertCircle size={20} color={COLORS.gold} />,
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
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
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
            <Bell size={28} color={COLORS.gold} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Notification Status</Text>
            <Text style={styles.summaryText}>
              {enabledCount} of {settings.length} notifications enabled
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notification Preferences</Text>

        <View style={styles.settingsCard}>
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
                color={COLORS.gold}
              />
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            Stay on top of your business with timely notifications. Urgent alerts
            about active bookings are always sent regardless of settings.
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
    backgroundColor: LIGHT_COLORS.background,
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
    backgroundColor: LIGHT_COLORS.surface,
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
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: LIGHT_COLORS.surface,
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
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
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
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 20,
  },
});
