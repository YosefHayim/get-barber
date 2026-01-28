// Recurring Booking Types

export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'custom';

export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface RecurringBooking {
  id: string;
  customerId: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  frequency: RecurrenceFrequency;
  dayOfWeek: DayOfWeek;
  preferredTime: string; // HH:mm format
  startDate: string; // ISO date
  endDate?: string; // ISO date (optional - can be indefinite)
  customIntervalDays?: number; // For custom frequency
  isActive: boolean;
  isPaused: boolean;
  pausedUntil?: string; // ISO date
  lastBookingDate?: string;
  nextBookingDate: string;
  totalBookingsCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringBookingInstance {
  id: string;
  recurringBookingId: string;
  scheduledDate: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'skipped';
  bookingId?: string; // Link to actual booking when created
  skippedReason?: string;
  createdAt: string;
}

export interface CreateRecurringBookingInput {
  barberId: string;
  serviceId: string;
  frequency: RecurrenceFrequency;
  dayOfWeek: DayOfWeek;
  preferredTime: string;
  startDate: string;
  endDate?: string;
  customIntervalDays?: number;
}

export interface UpdateRecurringBookingInput {
  frequency?: RecurrenceFrequency;
  dayOfWeek?: DayOfWeek;
  preferredTime?: string;
  endDate?: string;
  customIntervalDays?: number;
}

export interface RecurringBookingStats {
  activeRecurringBookings: number;
  totalBookingsCompleted: number;
  upcomingInstances: number;
  savedAmount: number; // If there's a recurring discount
}

// Discount for recurring customers
export interface RecurringDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  minBookings: number; // Minimum bookings to qualify
}

// Schedule preferences
export interface SchedulePreference {
  preferredDays: DayOfWeek[];
  preferredTimeRange: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  flexibleScheduling: boolean; // If true, can reschedule if preferred time unavailable
}
