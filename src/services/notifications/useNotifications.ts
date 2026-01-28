import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  registerForPushNotifications,
  savePushToken,
  removePushToken,
  sendLocalNotification,
  scheduleBookingReminder,
  cancelScheduledNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  setBadgeCount,
  getBadgeCount,
  handleNotificationResponse,
  type NotificationData,
  type NotificationPreferences,
  type PushNotificationPayload,
} from './notificationService';

// Main hook for managing push notifications
export function usePushNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Navigate based on notification data
  const handleNotificationNavigation = useCallback(
    (data: NotificationData) => {
      switch (data.type) {
        case 'booking_confirmed':
        case 'booking_reminder':
        case 'booking_cancelled':
        case 'booking_completed':
          if (data.bookingId) {
            router.push(`/booking-tracker/${data.bookingId}`);
          }
          break;
        case 'barber_on_way':
        case 'barber_arrived':
          if (data.bookingId) {
            router.push(`/booking-tracker/${data.bookingId}`);
          }
          break;
        case 'new_message':
          if (data.chatId) {
            router.push(`/chat/${data.chatId}`);
          }
          break;
        case 'new_review':
          router.push('/(barber-tabs)/dashboard');
          break;
        case 'payment_received':
        case 'payment_failed':
          router.push('/(barber-tabs)/earnings');
          break;
        case 'new_booking_request':
          router.push('/(barber-tabs)/requests');
          break;
        case 'request_accepted':
        case 'request_declined':
          router.push('/(tabs)/bookings');
          break;
        case 'loyalty_reward':
        case 'promotion':
          // Navigate to promotions/rewards page
          break;
        default:
          if (data.actionUrl) {
            router.push(data.actionUrl as any);
          }
      }
    },
    [router]
  );

  // Register for push notifications
  const register = useCallback(async () => {
    if (!user?.id) return null;

    setIsRegistering(true);
    try {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(user.id, token);
        setPushToken(token);
      }
      return token;
    } finally {
      setIsRegistering(false);
    }
  }, [user?.id]);

  // Unregister push notifications
  const unregister = useCallback(async () => {
    if (!user?.id) return;
    await removePushToken(user.id);
    setPushToken(null);
  }, [user?.id]);

  // Check permission status
  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  // Set up listeners
  useEffect(() => {
    // Check initial permission
    checkPermission();

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Notification received in foreground
        console.log('Notification received:', notification);
      }
    );

    // Listener for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response, handleNotificationNavigation);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [checkPermission, handleNotificationNavigation]);

  // Auto-register when user is authenticated
  useEffect(() => {
    if (user?.id && !pushToken) {
      register();
    }
  }, [user?.id, pushToken, register]);

  return {
    pushToken,
    isRegistering,
    permissionStatus,
    register,
    unregister,
    checkPermission,
  };
}

// Hook for notification preferences
export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationPreferences | null>({
    queryKey: ['notification-preferences', user?.id],
    queryFn: () => getNotificationPreferences(user!.id),
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (newPreferences: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(user!.id, newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
  });

  const updatePreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      updateMutation.mutate({ [key]: value });
    },
    [updateMutation]
  );

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}

// Hook for scheduling and managing booking reminders
export function useBookingReminders() {
  const scheduleReminder = useCallback(
    async (
      bookingId: string,
      bookingDate: Date,
      barberName: string,
      reminderMinutes?: number
    ) => {
      return scheduleBookingReminder(bookingId, bookingDate, barberName, reminderMinutes);
    },
    []
  );

  const cancelReminder = useCallback(async (notificationId: string) => {
    await cancelScheduledNotification(notificationId);
  }, []);

  return {
    scheduleReminder,
    cancelReminder,
  };
}

// Hook for local notifications
export function useLocalNotifications() {
  const sendNotification = useCallback(async (payload: PushNotificationPayload) => {
    return sendLocalNotification(payload);
  }, []);

  return {
    sendNotification,
  };
}

// Hook for managing badge count
export function useBadgeCount() {
  const [badgeCount, setBadge] = useState(0);

  useEffect(() => {
    getBadgeCount().then(setBadge);
  }, []);

  const updateBadgeCount = useCallback(async (count: number) => {
    await setBadgeCount(count);
    setBadge(count);
  }, []);

  const incrementBadge = useCallback(async () => {
    const newCount = badgeCount + 1;
    await setBadgeCount(newCount);
    setBadge(newCount);
  }, [badgeCount]);

  const clearBadge = useCallback(async () => {
    await setBadgeCount(0);
    setBadge(0);
  }, []);

  // Clear badge when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // Optionally clear badge when app opens
          // clearBadge();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    badgeCount,
    updateBadgeCount,
    incrementBadge,
    clearBadge,
  };
}

// Combined hook with all notification features
export function useNotifications() {
  const push = usePushNotifications();
  const preferences = useNotificationPreferences();
  const reminders = useBookingReminders();
  const local = useLocalNotifications();
  const badge = useBadgeCount();

  return {
    ...push,
    preferences: preferences.preferences,
    preferencesLoading: preferences.isLoading,
    updatePreference: preferences.updatePreference,
    scheduleReminder: reminders.scheduleReminder,
    cancelReminder: reminders.cancelReminder,
    sendLocalNotification: local.sendNotification,
    badgeCount: badge.badgeCount,
    updateBadgeCount: badge.updateBadgeCount,
    clearBadge: badge.clearBadge,
  };
}

export default {
  usePushNotifications,
  useNotificationPreferences,
  useBookingReminders,
  useLocalNotifications,
  useBadgeCount,
  useNotifications,
};
