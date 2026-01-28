import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import {
  type NotificationData,
  type PushNotificationPayload,
  type ScheduledNotification,
  type NotificationPreferences,
  NOTIFICATION_CHANNELS,
} from './types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Register for push notifications and get token
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Set up Android notification channels
  if (Platform.OS === 'android') {
    for (const channel of NOTIFICATION_CHANNELS) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: channel.importance as Notifications.AndroidImportance,
        vibrationPattern: channel.vibrationPattern,
        enableVibrate: channel.enableVibrate,
        enableLights: channel.enableLights,
        lightColor: channel.lightColor,
        sound: channel.sound,
      });
    }
  }

  // Get Expo push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });

  return token.data;
}

// Save push token to user profile in Supabase
export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      push_token: token,
      push_token_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to save push token:', error);
    throw error;
  }
}

// Remove push token on logout
export async function removePushToken(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ push_token: null })
    .eq('id', userId);

  if (error) {
    console.error('Failed to remove push token:', error);
  }
}

// Send local notification immediately
export async function sendLocalNotification(
  payload: PushNotificationPayload
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data as Record<string, unknown>,
      badge: payload.badge,
      sound: payload.sound ?? 'default',
      priority: payload.priority ?? 'high',
      categoryIdentifier: payload.categoryId,
    },
    trigger: null, // Immediate
  });

  return notificationId;
}

// Schedule a notification for later
export async function scheduleNotification(
  notification: ScheduledNotification
): Promise<string> {
  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: notification.triggerDate,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data as Record<string, unknown>,
    },
    trigger,
  });

  return notificationId;
}

// Schedule booking reminder
export async function scheduleBookingReminder(
  bookingId: string,
  bookingDate: Date,
  barberName: string,
  reminderMinutes: number = 60
): Promise<string> {
  const reminderDate = new Date(bookingDate.getTime() - reminderMinutes * 60 * 1000);

  // Don't schedule if reminder time has passed
  if (reminderDate <= new Date()) {
    return '';
  }

  return scheduleNotification({
    id: `reminder_${bookingId}`,
    title: 'Appointment Reminder',
    body: `Your appointment with ${barberName} is in ${reminderMinutes} minutes`,
    data: {
      type: 'booking_reminder',
      bookingId,
    },
    triggerDate: reminderDate,
  });
}

// Cancel a scheduled notification
export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Dismiss all displayed notifications
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

// Set badge count (iOS)
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// Handle notification response (when user taps notification)
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  navigationCallback: (data: NotificationData) => void
): void {
  const data = response.notification.request.content.data as NotificationData;

  if (data) {
    navigationCallback(data);
  }
}

// Get notification preferences from Supabase
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Return defaults if no preferences set
    return {
      bookingUpdates: true,
      promotions: true,
      reminders: true,
      messages: true,
      reviews: true,
      payments: true,
      loyaltyRewards: true,
    };
  }

  return data;
}

// Update notification preferences
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: userId,
    ...preferences,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
}

// Send push notification via backend (Supabase Edge Function)
export async function sendPushNotification(
  recipientUserId: string,
  payload: PushNotificationPayload
): Promise<void> {
  const { error } = await supabase.functions.invoke('send-push-notification', {
    body: {
      recipientUserId,
      ...payload,
    },
  });

  if (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}

// Notification Templates
export const NotificationTemplates = {
  bookingConfirmed: (barberName: string, date: string, time: string) => ({
    title: 'Booking Confirmed!',
    body: `Your appointment with ${barberName} on ${date} at ${time} is confirmed.`,
    categoryId: 'bookings',
  }),

  bookingCancelled: (barberName: string) => ({
    title: 'Booking Cancelled',
    body: `Your appointment with ${barberName} has been cancelled.`,
    categoryId: 'bookings',
  }),

  barberOnWay: (barberName: string, eta: string) => ({
    title: `${barberName} is on the way!`,
    body: `Your barber will arrive in approximately ${eta}.`,
    categoryId: 'tracking',
  }),

  barberArrived: (barberName: string) => ({
    title: `${barberName} has arrived!`,
    body: 'Your barber is at your location.',
    categoryId: 'tracking',
  }),

  newMessage: (senderName: string) => ({
    title: 'New Message',
    body: `${senderName} sent you a message.`,
    categoryId: 'messages',
  }),

  newReview: (customerName: string, rating: number) => ({
    title: 'New Review',
    body: `${customerName} left you a ${rating}-star review!`,
    categoryId: 'reviews',
  }),

  paymentReceived: (amount: string) => ({
    title: 'Payment Received',
    body: `You've received a payment of ${amount}.`,
    categoryId: 'payments',
  }),

  newBookingRequest: (customerName: string, serviceName: string) => ({
    title: 'New Booking Request',
    body: `${customerName} requested a ${serviceName} appointment.`,
    categoryId: 'bookings',
  }),

  loyaltyReward: (rewardName: string) => ({
    title: 'Reward Unlocked!',
    body: `You've earned a new reward: ${rewardName}`,
    categoryId: 'promotions',
  }),
};

export default {
  registerForPushNotifications,
  savePushToken,
  removePushToken,
  sendLocalNotification,
  scheduleNotification,
  scheduleBookingReminder,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
  getScheduledNotifications,
  dismissAllNotifications,
  setBadgeCount,
  getBadgeCount,
  handleNotificationResponse,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendPushNotification,
  NotificationTemplates,
};
