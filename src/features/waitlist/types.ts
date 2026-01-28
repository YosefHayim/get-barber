// Waitlist Types

export type WaitlistStatus =
  | 'waiting'
  | 'notified'
  | 'booked'
  | 'expired'
  | 'cancelled';

export type WaitlistPriority = 'normal' | 'high' | 'vip';

export interface WaitlistEntry {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  serviceId?: string;
  serviceName?: string;
  preferredDate: string; // ISO date
  preferredTimeStart?: string; // HH:mm
  preferredTimeEnd?: string; // HH:mm
  flexibleDate: boolean;
  flexibleTime: boolean;
  status: WaitlistStatus;
  priority: WaitlistPriority;
  position: number;
  estimatedWait?: string; // e.g., "2-3 days"
  notes?: string;
  notifiedAt?: string;
  expiresAt?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JoinWaitlistInput {
  barberId: string;
  serviceId?: string;
  preferredDate: string;
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
  flexibleDate?: boolean;
  flexibleTime?: boolean;
  notes?: string;
}

export interface WaitlistSlotAvailability {
  date: string;
  slots: {
    time: string;
    availableIn?: string; // When it might become available
    waitlistCount: number;
  }[];
}

export interface WaitlistStats {
  totalWaiting: number;
  averageWaitTime: string;
  conversionRate: number; // Percentage of waitlist that booked
  activeWaitlists: number;
}

export interface WaitlistNotification {
  id: string;
  waitlistId: string;
  type: 'slot_available' | 'position_update' | 'expiring_soon' | 'expired';
  message: string;
  slotDetails?: {
    date: string;
    time: string;
    expiresAt: string;
  };
  read: boolean;
  createdAt: string;
}
