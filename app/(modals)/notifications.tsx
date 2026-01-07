import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  CalendarCheck,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star,
  Gift,
  Award,
  Info,
  Clock,
  Settings,
  Trash2,
  Check,
} from 'lucide-react-native';
import { DARK_COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_TYPE_CONFIG,
  type AppNotification,
  type NotificationType,
} from '@/constants/mockData';

type FilterType = 'all' | 'unread';

const ICON_MAP: Record<string, typeof Bell> = {
  'calendar-check': CalendarCheck,
  'clock': Clock,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'message-circle': MessageCircle,
  'star': Star,
  'gift': Gift,
  'award': Award,
  'info': Info,
};

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const config = NOTIFICATION_TYPE_CONFIG[type];
  const IconComponent = ICON_MAP[config.icon] || Bell;

  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: config.bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconComponent size={22} color={config.color} />
    </View>
  );
};

const NotificationItem = ({
  notification,
  onPress,
  onMarkRead,
}: {
  notification: AppNotification;
  onPress: () => void;
  onMarkRead: () => void;
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IL', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        padding: SPACING.lg,
        backgroundColor: notification.isRead ? DARK_COLORS.surface : DARK_COLORS.primaryMuted,
        borderBottomWidth: 1,
        borderBottomColor: DARK_COLORS.border,
      }}
    >
      <NotificationIcon type={notification.type} />
      <View style={{ flex: 1, marginLeft: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xxs }}>
          <Text
            style={{
              flex: 1,
              fontSize: TYPOGRAPHY.sm,
              fontWeight: notification.isRead ? TYPOGRAPHY.medium : TYPOGRAPHY.semibold,
              color: DARK_COLORS.textPrimary,
            }}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.xs, color: DARK_COLORS.textMuted }}>
            {formatTime(notification.createdAt)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: TYPOGRAPHY.sm,
            color: DARK_COLORS.textSecondary,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
        {notification.metadata?.barberAvatar && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }}>
            <Image
              source={{ uri: notification.metadata.barberAvatar }}
              style={{ width: 20, height: 20, borderRadius: 10, marginRight: SPACING.xs }}
            />
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: DARK_COLORS.textMuted }}>
              {notification.metadata.barberName}
            </Text>
          </View>
        )}
      </View>
      {!notification.isRead && (
        <TouchableOpacity
          onPress={onMarkRead}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: DARK_COLORS.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: SPACING.sm,
            alignSelf: 'center',
          }}
        >
          <Check size={16} color={DARK_COLORS.success} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen(): React.JSX.Element {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(
    () =>
      filter === 'all'
        ? notifications
        : notifications.filter((n) => !n.isRead),
    [notifications, filter]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleNotificationPress = useCallback((notification: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    if (notification.actionUrl) {
      router.back();
      setTimeout(() => {
        if (notification.actionUrl === '/loyalty') {
          router.push('/(modals)/loyalty');
        } else if (notification.actionUrl === '/bookings') {
          router.push('/(tabs)/bookings');
        } else if (notification.actionUrl === '/messages') {
          router.push('/(tabs)/messages');
        }
      }, 100);
    }
  }, []);

  const handleMarkRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DARK_COLORS.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg,
          borderBottomWidth: 1,
          borderBottomColor: DARK_COLORS.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.md }}>
          <ArrowLeft size={24} color={DARK_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: DARK_COLORS.textPrimary, flex: 1 }}>
          Notifications
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(modals)/settings/notifications')}
          style={{ padding: SPACING.xs }}
        >
          <Settings size={22} color={DARK_COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.md,
          gap: SPACING.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={{
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.full,
            backgroundColor: filter === 'all' ? DARK_COLORS.primary : DARK_COLORS.surface,
          }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.sm,
              fontWeight: TYPOGRAPHY.medium,
              color: filter === 'all' ? DARK_COLORS.background : DARK_COLORS.textSecondary,
            }}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('unread')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.full,
            backgroundColor: filter === 'unread' ? DARK_COLORS.primary : DARK_COLORS.surface,
          }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.sm,
              fontWeight: TYPOGRAPHY.medium,
              color: filter === 'unread' ? DARK_COLORS.background : DARK_COLORS.textSecondary,
            }}
          >
            Unread
          </Text>
          {unreadCount > 0 && (
            <View
              style={{
                marginLeft: SPACING.xs,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: filter === 'unread' ? DARK_COLORS.background : DARK_COLORS.error,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: TYPOGRAPHY.bold,
                  color: filter === 'unread' ? DARK_COLORS.primary : DARK_COLORS.textPrimary,
                }}
              >
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={{ padding: SPACING.xs }}>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: DARK_COLORS.primary, fontWeight: TYPOGRAPHY.medium }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING['3xl'] }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: DARK_COLORS.primaryMuted,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: SPACING.xl,
            }}
          >
            <BellOff size={36} color={DARK_COLORS.primary} />
          </View>
          <Text
            style={{
              fontSize: TYPOGRAPHY.lg,
              fontWeight: TYPOGRAPHY.semibold,
              color: DARK_COLORS.textPrimary,
              marginBottom: SPACING.sm,
            }}
          >
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </Text>
          <Text
            style={{
              fontSize: TYPOGRAPHY.sm,
              color: DARK_COLORS.textMuted,
              textAlign: 'center',
            }}
          >
            {filter === 'unread'
              ? "You've read all your notifications"
              : "When you have notifications, they'll appear here"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={DARK_COLORS.primary} />
          }
        >
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
              onMarkRead={() => handleMarkRead(notification.id)}
            />
          ))}

          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: SPACING.xl,
                gap: SPACING.sm,
              }}
            >
              <Trash2 size={16} color={DARK_COLORS.error} />
              <Text style={{ fontSize: TYPOGRAPHY.sm, color: DARK_COLORS.error }}>Clear all notifications</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
