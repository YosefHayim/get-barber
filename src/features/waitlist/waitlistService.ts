import { supabase } from '@/lib/supabase';
import type {
  WaitlistEntry,
  JoinWaitlistInput,
  WaitlistSlotAvailability,
  WaitlistStats,
  WaitlistNotification,
} from './types';

// Get customer's waitlist entries
export async function getCustomerWaitlist(
  customerId: string
): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from('waitlist')
    .select(
      `
      *,
      barber:profiles!barber_id(display_name, avatar_url),
      service:services(name)
    `
    )
    .eq('customer_id', customerId)
    .in('status', ['waiting', 'notified'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    customerId: item.customer_id,
    customerName: '',
    barberId: item.barber_id,
    barberName: item.barber?.display_name || 'Unknown',
    barberAvatar: item.barber?.avatar_url,
    serviceId: item.service_id,
    serviceName: item.service?.name,
    preferredDate: item.preferred_date,
    preferredTimeStart: item.preferred_time_start,
    preferredTimeEnd: item.preferred_time_end,
    flexibleDate: item.flexible_date,
    flexibleTime: item.flexible_time,
    status: item.status,
    priority: item.priority || 'normal',
    position: item.position || 1,
    estimatedWait: item.estimated_wait,
    notes: item.notes,
    notifiedAt: item.notified_at,
    expiresAt: item.expires_at,
    bookingId: item.booking_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// Get barber's waitlist
export async function getBarberWaitlist(barberId: string): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from('waitlist')
    .select(
      `
      *,
      customer:profiles!customer_id(display_name, avatar_url, phone),
      service:services(name)
    `
    )
    .eq('barber_id', barberId)
    .in('status', ['waiting', 'notified'])
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((item, index) => ({
    id: item.id,
    customerId: item.customer_id,
    customerName: item.customer?.display_name || 'Unknown',
    customerAvatar: item.customer?.avatar_url,
    customerPhone: item.customer?.phone,
    barberId: item.barber_id,
    barberName: '',
    serviceId: item.service_id,
    serviceName: item.service?.name,
    preferredDate: item.preferred_date,
    preferredTimeStart: item.preferred_time_start,
    preferredTimeEnd: item.preferred_time_end,
    flexibleDate: item.flexible_date,
    flexibleTime: item.flexible_time,
    status: item.status,
    priority: item.priority || 'normal',
    position: index + 1,
    estimatedWait: item.estimated_wait,
    notes: item.notes,
    notifiedAt: item.notified_at,
    expiresAt: item.expires_at,
    bookingId: item.booking_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// Join waitlist
export async function joinWaitlist(
  customerId: string,
  input: JoinWaitlistInput
): Promise<WaitlistEntry> {
  // Check if already on waitlist for this barber
  const { data: existing } = await supabase
    .from('waitlist')
    .select('id')
    .eq('customer_id', customerId)
    .eq('barber_id', input.barberId)
    .eq('status', 'waiting')
    .single();

  if (existing) {
    throw new Error('Already on waitlist for this barber');
  }

  // Get current position
  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('barber_id', input.barberId)
    .eq('status', 'waiting');

  const position = (count || 0) + 1;

  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      customer_id: customerId,
      barber_id: input.barberId,
      service_id: input.serviceId,
      preferred_date: input.preferredDate,
      preferred_time_start: input.preferredTimeStart,
      preferred_time_end: input.preferredTimeEnd,
      flexible_date: input.flexibleDate ?? true,
      flexible_time: input.flexibleTime ?? true,
      notes: input.notes,
      status: 'waiting',
      priority: 'normal',
      position,
    })
    .select(
      `
      *,
      barber:profiles!barber_id(display_name, avatar_url),
      service:services(name)
    `
    )
    .single();

  if (error) throw error;

  return {
    id: data.id,
    customerId: data.customer_id,
    customerName: '',
    barberId: data.barber_id,
    barberName: data.barber?.display_name || 'Unknown',
    barberAvatar: data.barber?.avatar_url,
    serviceId: data.service_id,
    serviceName: data.service?.name,
    preferredDate: data.preferred_date,
    preferredTimeStart: data.preferred_time_start,
    preferredTimeEnd: data.preferred_time_end,
    flexibleDate: data.flexible_date,
    flexibleTime: data.flexible_time,
    status: data.status,
    priority: data.priority,
    position,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Leave waitlist
export async function leaveWaitlist(waitlistId: string): Promise<void> {
  const { error } = await supabase
    .from('waitlist')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', waitlistId);

  if (error) throw error;
}

// Notify customer of available slot (barber action)
export async function notifyWaitlistCustomer(
  waitlistId: string,
  slotDate: string,
  slotTime: string,
  expiresInMinutes: number = 30
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('waitlist')
    .update({
      status: 'notified',
      notified_at: new Date().toISOString(),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', waitlistId);

  if (error) throw error;

  // Create notification record
  await supabase.from('waitlist_notifications').insert({
    waitlist_id: waitlistId,
    type: 'slot_available',
    message: `A slot is available on ${slotDate} at ${slotTime}!`,
    slot_details: JSON.stringify({
      date: slotDate,
      time: slotTime,
      expiresAt,
    }),
    read: false,
  });
}

// Accept waitlist offer and book
export async function acceptWaitlistOffer(
  waitlistId: string,
  bookingId: string
): Promise<void> {
  const { error } = await supabase
    .from('waitlist')
    .update({
      status: 'booked',
      booking_id: bookingId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', waitlistId);

  if (error) throw error;
}

// Decline waitlist offer (stay on waitlist)
export async function declineWaitlistOffer(waitlistId: string): Promise<void> {
  const { error } = await supabase
    .from('waitlist')
    .update({
      status: 'waiting',
      notified_at: null,
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', waitlistId);

  if (error) throw error;
}

// Get waitlist position
export async function getWaitlistPosition(waitlistId: string): Promise<number> {
  const { data: entry } = await supabase
    .from('waitlist')
    .select('barber_id, created_at')
    .eq('id', waitlistId)
    .single();

  if (!entry) return 0;

  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('barber_id', entry.barber_id)
    .eq('status', 'waiting')
    .lt('created_at', entry.created_at);

  return (count || 0) + 1;
}

// Get waitlist notifications
export async function getWaitlistNotifications(
  customerId: string
): Promise<WaitlistNotification[]> {
  const { data, error } = await supabase
    .from('waitlist_notifications')
    .select(
      `
      *,
      waitlist!inner(customer_id)
    `
    )
    .eq('waitlist.customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    waitlistId: item.waitlist_id,
    type: item.type,
    message: item.message,
    slotDetails: item.slot_details ? JSON.parse(item.slot_details) : undefined,
    read: item.read,
    createdAt: item.created_at,
  }));
}

// Mark notification as read
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('waitlist_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

// Get waitlist stats for barber
export async function getWaitlistStats(barberId: string): Promise<WaitlistStats> {
  const { data, error } = await supabase
    .from('waitlist')
    .select('status, created_at, updated_at')
    .eq('barber_id', barberId);

  if (error) throw error;

  const entries = data || [];
  const waiting = entries.filter((e) => e.status === 'waiting').length;
  const booked = entries.filter((e) => e.status === 'booked').length;
  const total = entries.length;

  // Calculate average wait time for booked entries
  const bookedEntries = entries.filter((e) => e.status === 'booked');
  let avgWaitMs = 0;
  if (bookedEntries.length > 0) {
    avgWaitMs =
      bookedEntries.reduce((sum, e) => {
        const wait = new Date(e.updated_at).getTime() - new Date(e.created_at).getTime();
        return sum + wait;
      }, 0) / bookedEntries.length;
  }

  const avgWaitDays = Math.round(avgWaitMs / (1000 * 60 * 60 * 24));
  const averageWaitTime =
    avgWaitDays === 0
      ? 'Less than a day'
      : avgWaitDays === 1
        ? '1 day'
        : `${avgWaitDays} days`;

  return {
    totalWaiting: waiting,
    averageWaitTime,
    conversionRate: total > 0 ? (booked / total) * 100 : 0,
    activeWaitlists: waiting,
  };
}

// Check for slot availability and auto-notify
export async function checkAndNotifyWaitlist(
  barberId: string,
  availableDate: string,
  availableTime: string
): Promise<number> {
  // Find matching waitlist entries
  const { data: matches, error } = await supabase
    .from('waitlist')
    .select('*')
    .eq('barber_id', barberId)
    .eq('status', 'waiting')
    .or(`preferred_date.eq.${availableDate},flexible_date.eq.true`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;

  let notifiedCount = 0;

  for (const entry of matches || []) {
    // Check time preference
    const timeMatches =
      entry.flexible_time ||
      !entry.preferred_time_start ||
      (availableTime >= entry.preferred_time_start &&
        (!entry.preferred_time_end || availableTime <= entry.preferred_time_end));

    if (timeMatches) {
      await notifyWaitlistCustomer(entry.id, availableDate, availableTime);
      notifiedCount++;
      // Only notify one person per slot
      break;
    }
  }

  return notifiedCount;
}

// Expire old notifications
export async function expireOldNotifications(): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('waitlist')
    .update({
      status: 'waiting',
      notified_at: null,
      expires_at: null,
      updated_at: now,
    })
    .eq('status', 'notified')
    .lt('expires_at', now);

  if (error) throw error;
}

export default {
  getCustomerWaitlist,
  getBarberWaitlist,
  joinWaitlist,
  leaveWaitlist,
  notifyWaitlistCustomer,
  acceptWaitlistOffer,
  declineWaitlistOffer,
  getWaitlistPosition,
  getWaitlistNotifications,
  markNotificationRead,
  getWaitlistStats,
  checkAndNotifyWaitlist,
  expireOldNotifications,
};
