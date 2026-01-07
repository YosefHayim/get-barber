import type { Enums } from '@/services/supabase/database.types';

export type MessageType = Enums<'message_type'>;
export type OfferStatus = Enums<'offer_status'>;
export type UserType = Enums<'user_type'>;

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_type: UserType;
  message_type: MessageType;
  content: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  offer_amount: number | null;
  offer_status: OfferStatus | null;
  offer_expires_at: string | null;
  is_read: boolean | null;
  read_at: string | null;
  created_at: string;
}

export interface ChatParticipant {
  id: string;
  display_name: string;
  avatar_url: string | null;
  user_type: UserType;
}

export interface OfferDetails {
  amount: number;
  status: OfferStatus;
  expiresAt: string | null;
}
