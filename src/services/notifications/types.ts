// Notification Types

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'barber_on_way'
  | 'barber_arrived'
  | 'new_message'
  | 'new_review'
  | 'payment_received'
  | 'payment_failed'
  | 'promotion'
  | 'loyalty_reward'
  | 'new_booking_request'
  | 'request_accepted'
  | 'request_declined';

export interface NotificationData {
  type: NotificationType;
  bookingId?: string;
  barberId?: string;
  customerId?: string;
  chatId?: string;
  reviewId?: string;
  paymentId?: string;
  promotionId?: string;
  actionUrl?: string;
  [key: string]: unknown;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: NotificationData;
  badge?: number;
  sound?: string;
  priority?: 'default' | 'high' | 'max';
  categoryId?: string;
}

export interface NotificationPreferences {
  bookingUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
  messages: boolean;
  reviews: boolean;
  payments: boolean;
  loyaltyRewards: boolean;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: NotificationData;
  triggerDate: Date;
  repeat?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: 1 | 2 | 3 | 4 | 5;
  sound?: string;
  vibrationPattern?: number[];
  enableVibrate?: boolean;
  enableLights?: boolean;
  lightColor?: string;
}

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'Booking confirmations, reminders, and updates',
    importance: 4,
    enableVibrate: true,
  },
  {
    id: 'messages',
    name: 'Messages',
    description: 'New messages from barbers or customers',
    importance: 4,
    enableVibrate: true,
  },
  {
    id: 'tracking',
    name: 'Live Tracking',
    description: 'Barber arrival updates',
    importance: 5,
    enableVibrate: true,
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Payment confirmations and receipts',
    importance: 3,
    enableVibrate: false,
  },
  {
    id: 'promotions',
    name: 'Promotions',
    description: 'Special offers and discounts',
    importance: 2,
    enableVibrate: false,
  },
  {
    id: 'reviews',
    name: 'Reviews',
    description: 'New reviews and ratings',
    importance: 2,
    enableVibrate: false,
  },
];
