import { supabase } from '@/lib/supabase';
import type {
  RecurringBooking,
  RecurringBookingInstance,
  CreateRecurringBookingInput,
  UpdateRecurringBookingInput,
  RecurringBookingStats,
  DayOfWeek,
} from './types';

const DAY_MAP: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// Calculate next occurrence based on frequency
function calculateNextOccurrence(
  lastDate: Date,
  frequency: string,
  dayOfWeek: DayOfWeek,
  customIntervalDays?: number
): Date {
  const targetDay = DAY_MAP[dayOfWeek];
  const next = new Date(lastDate);

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      // Adjust to correct day of week in the new month
      while (next.getDay() !== targetDay) {
        next.setDate(next.getDate() + 1);
      }
      break;
    case 'custom':
      next.setDate(next.getDate() + (customIntervalDays || 7));
      break;
    default:
      next.setDate(next.getDate() + 7);
  }

  return next;
}

// Find the first occurrence date from start date
function findFirstOccurrence(startDate: Date, dayOfWeek: DayOfWeek): Date {
  const targetDay = DAY_MAP[dayOfWeek];
  const result = new Date(startDate);

  while (result.getDay() !== targetDay) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

// Get all recurring bookings for a customer
export async function getCustomerRecurringBookings(
  customerId: string
): Promise<RecurringBooking[]> {
  const { data, error } = await supabase
    .from('recurring_bookings')
    .select(
      `
      *,
      barber:profiles!barber_id(display_name, avatar_url),
      service:services(name, price, duration)
    `
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    customerId: item.customer_id,
    barberId: item.barber_id,
    barberName: item.barber?.display_name || 'Unknown',
    barberAvatar: item.barber?.avatar_url,
    serviceId: item.service_id,
    serviceName: item.service?.name || 'Unknown',
    servicePrice: item.service?.price || 0,
    serviceDuration: item.service?.duration || 30,
    frequency: item.frequency,
    dayOfWeek: item.day_of_week,
    preferredTime: item.preferred_time,
    startDate: item.start_date,
    endDate: item.end_date,
    customIntervalDays: item.custom_interval_days,
    isActive: item.is_active,
    isPaused: item.is_paused,
    pausedUntil: item.paused_until,
    lastBookingDate: item.last_booking_date,
    nextBookingDate: item.next_booking_date,
    totalBookingsCompleted: item.total_bookings_completed,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// Get recurring bookings for a barber
export async function getBarberRecurringBookings(
  barberId: string
): Promise<RecurringBooking[]> {
  const { data, error } = await supabase
    .from('recurring_bookings')
    .select(
      `
      *,
      customer:profiles!customer_id(display_name, avatar_url),
      service:services(name, price, duration)
    `
    )
    .eq('barber_id', barberId)
    .eq('is_active', true)
    .order('next_booking_date', { ascending: true });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    customerId: item.customer_id,
    barberId: item.barber_id,
    barberName: item.customer?.display_name || 'Unknown',
    barberAvatar: item.customer?.avatar_url,
    serviceId: item.service_id,
    serviceName: item.service?.name || 'Unknown',
    servicePrice: item.service?.price || 0,
    serviceDuration: item.service?.duration || 30,
    frequency: item.frequency,
    dayOfWeek: item.day_of_week,
    preferredTime: item.preferred_time,
    startDate: item.start_date,
    endDate: item.end_date,
    customIntervalDays: item.custom_interval_days,
    isActive: item.is_active,
    isPaused: item.is_paused,
    pausedUntil: item.paused_until,
    lastBookingDate: item.last_booking_date,
    nextBookingDate: item.next_booking_date,
    totalBookingsCompleted: item.total_bookings_completed,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// Create a new recurring booking
export async function createRecurringBooking(
  customerId: string,
  input: CreateRecurringBookingInput
): Promise<RecurringBooking> {
  // Get barber and service details
  const [barberResult, serviceResult] = await Promise.all([
    supabase.from('profiles').select('display_name, avatar_url').eq('id', input.barberId).single(),
    supabase.from('services').select('name, price, duration').eq('id', input.serviceId).single(),
  ]);

  if (barberResult.error) throw barberResult.error;
  if (serviceResult.error) throw serviceResult.error;

  const startDate = new Date(input.startDate);
  const firstOccurrence = findFirstOccurrence(startDate, input.dayOfWeek);

  const { data, error } = await supabase
    .from('recurring_bookings')
    .insert({
      customer_id: customerId,
      barber_id: input.barberId,
      service_id: input.serviceId,
      frequency: input.frequency,
      day_of_week: input.dayOfWeek,
      preferred_time: input.preferredTime,
      start_date: input.startDate,
      end_date: input.endDate,
      custom_interval_days: input.customIntervalDays,
      next_booking_date: firstOccurrence.toISOString().split('T')[0],
      is_active: true,
      is_paused: false,
      total_bookings_completed: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    customerId: data.customer_id,
    barberId: data.barber_id,
    barberName: barberResult.data.display_name,
    barberAvatar: barberResult.data.avatar_url,
    serviceId: data.service_id,
    serviceName: serviceResult.data.name,
    servicePrice: serviceResult.data.price,
    serviceDuration: serviceResult.data.duration,
    frequency: data.frequency,
    dayOfWeek: data.day_of_week,
    preferredTime: data.preferred_time,
    startDate: data.start_date,
    endDate: data.end_date,
    customIntervalDays: data.custom_interval_days,
    isActive: data.is_active,
    isPaused: data.is_paused,
    nextBookingDate: data.next_booking_date,
    totalBookingsCompleted: data.total_bookings_completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Update a recurring booking
export async function updateRecurringBooking(
  recurringBookingId: string,
  input: UpdateRecurringBookingInput
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.frequency) updateData.frequency = input.frequency;
  if (input.dayOfWeek) updateData.day_of_week = input.dayOfWeek;
  if (input.preferredTime) updateData.preferred_time = input.preferredTime;
  if (input.endDate !== undefined) updateData.end_date = input.endDate;
  if (input.customIntervalDays !== undefined)
    updateData.custom_interval_days = input.customIntervalDays;

  const { error } = await supabase
    .from('recurring_bookings')
    .update(updateData)
    .eq('id', recurringBookingId);

  if (error) throw error;
}

// Pause a recurring booking
export async function pauseRecurringBooking(
  recurringBookingId: string,
  pauseUntil?: string
): Promise<void> {
  const { error } = await supabase
    .from('recurring_bookings')
    .update({
      is_paused: true,
      paused_until: pauseUntil,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recurringBookingId);

  if (error) throw error;
}

// Resume a paused recurring booking
export async function resumeRecurringBooking(recurringBookingId: string): Promise<void> {
  // Get current booking to calculate next date
  const { data: booking, error: fetchError } = await supabase
    .from('recurring_bookings')
    .select('*')
    .eq('id', recurringBookingId)
    .single();

  if (fetchError) throw fetchError;

  const today = new Date();
  const nextOccurrence = findFirstOccurrence(today, booking.day_of_week);

  // If next occurrence is today, move to next week
  if (nextOccurrence.toDateString() === today.toDateString()) {
    nextOccurrence.setDate(nextOccurrence.getDate() + 7);
  }

  const { error } = await supabase
    .from('recurring_bookings')
    .update({
      is_paused: false,
      paused_until: null,
      next_booking_date: nextOccurrence.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', recurringBookingId);

  if (error) throw error;
}

// Cancel a recurring booking
export async function cancelRecurringBooking(recurringBookingId: string): Promise<void> {
  const { error } = await supabase
    .from('recurring_bookings')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recurringBookingId);

  if (error) throw error;
}

// Skip next occurrence
export async function skipNextOccurrence(
  recurringBookingId: string,
  reason?: string
): Promise<void> {
  const { data: booking, error: fetchError } = await supabase
    .from('recurring_bookings')
    .select('*')
    .eq('id', recurringBookingId)
    .single();

  if (fetchError) throw fetchError;

  // Record the skipped instance
  const { error: instanceError } = await supabase.from('recurring_booking_instances').insert({
    recurring_booking_id: recurringBookingId,
    scheduled_date: booking.next_booking_date,
    status: 'skipped',
    skipped_reason: reason,
  });

  if (instanceError) throw instanceError;

  // Calculate next occurrence
  const currentDate = new Date(booking.next_booking_date);
  const nextDate = calculateNextOccurrence(
    currentDate,
    booking.frequency,
    booking.day_of_week,
    booking.custom_interval_days
  );

  const { error } = await supabase
    .from('recurring_bookings')
    .update({
      next_booking_date: nextDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', recurringBookingId);

  if (error) throw error;
}

// Get recurring booking instances (history)
export async function getRecurringBookingInstances(
  recurringBookingId: string
): Promise<RecurringBookingInstance[]> {
  const { data, error } = await supabase
    .from('recurring_booking_instances')
    .select('*')
    .eq('recurring_booking_id', recurringBookingId)
    .order('scheduled_date', { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    recurringBookingId: item.recurring_booking_id,
    scheduledDate: item.scheduled_date,
    status: item.status,
    bookingId: item.booking_id,
    skippedReason: item.skipped_reason,
    createdAt: item.created_at,
  }));
}

// Get stats for recurring bookings
export async function getRecurringBookingStats(
  customerId: string
): Promise<RecurringBookingStats> {
  const { data, error } = await supabase
    .from('recurring_bookings')
    .select('id, is_active, total_bookings_completed, next_booking_date')
    .eq('customer_id', customerId);

  if (error) throw error;

  const active = (data || []).filter((b) => b.is_active);
  const totalCompleted = (data || []).reduce(
    (sum, b) => sum + (b.total_bookings_completed || 0),
    0
  );
  const upcoming = active.filter((b) => new Date(b.next_booking_date) >= new Date()).length;

  // Calculate savings (example: 10% discount for recurring customers)
  const avgBookingPrice = 100; // Placeholder
  const discountRate = 0.1;
  const savedAmount = totalCompleted * avgBookingPrice * discountRate;

  return {
    activeRecurringBookings: active.length,
    totalBookingsCompleted: totalCompleted,
    upcomingInstances: upcoming,
    savedAmount,
  };
}

// Process recurring bookings (called by cron job/edge function)
export async function processRecurringBookings(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Get all active, non-paused recurring bookings due today
  const { data: dueBookings, error } = await supabase
    .from('recurring_bookings')
    .select('*')
    .eq('is_active', true)
    .eq('is_paused', false)
    .lte('next_booking_date', today);

  if (error) throw error;

  for (const booking of dueBookings || []) {
    try {
      // Create actual booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: booking.customer_id,
          barber_id: booking.barber_id,
          service_id: booking.service_id,
          date: booking.next_booking_date,
          time: booking.preferred_time,
          status: 'confirmed',
          is_recurring: true,
          recurring_booking_id: booking.id,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Record instance
      await supabase.from('recurring_booking_instances').insert({
        recurring_booking_id: booking.id,
        scheduled_date: booking.next_booking_date,
        status: 'confirmed',
        booking_id: newBooking.id,
      });

      // Calculate next occurrence
      const nextDate = calculateNextOccurrence(
        new Date(booking.next_booking_date),
        booking.frequency,
        booking.day_of_week,
        booking.custom_interval_days
      );

      // Check if we've reached the end date
      const hasEnded = booking.end_date && new Date(nextDate) > new Date(booking.end_date);

      // Update recurring booking
      await supabase
        .from('recurring_bookings')
        .update({
          last_booking_date: booking.next_booking_date,
          next_booking_date: hasEnded ? null : nextDate.toISOString().split('T')[0],
          total_bookings_completed: booking.total_bookings_completed + 1,
          is_active: !hasEnded,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);
    } catch (err) {
      console.error(`Failed to process recurring booking ${booking.id}:`, err);
    }
  }
}

export default {
  getCustomerRecurringBookings,
  getBarberRecurringBookings,
  createRecurringBooking,
  updateRecurringBooking,
  pauseRecurringBooking,
  resumeRecurringBooking,
  cancelRecurringBooking,
  skipNextOccurrence,
  getRecurringBookingInstances,
  getRecurringBookingStats,
  processRecurringBookings,
};
