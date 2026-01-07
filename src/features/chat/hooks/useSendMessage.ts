import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { Database } from '@/services/supabase/database.types';

type MessageType = Database['public']['Enums']['message_type'];
type UserType = Database['public']['Enums']['user_type'];

interface SendTextMessagePayload {
  requestId: string;
  content: string;
}

interface SendMessagePayload {
  requestId: string;
  senderId: string;
  senderType: UserType;
  content: string;
}

interface SendOfferPayload {
  requestId: string;
  amount: number;
  expiresInMinutes?: number;
}

interface SendOfferWithSenderPayload {
  requestId: string;
  senderId: string;
  senderType: UserType;
  amount: number;
  expiresInMinutes?: number;
}

export function useSendTextMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendTextMessagePayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          request_id: payload.requestId,
          sender_id: user.id,
          sender_type: profile?.user_type ?? 'customer',
          message_type: 'text' as MessageType,
          content: payload.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHAT_MESSAGES, variables.requestId],
      });
    },
  });
}

export function useSendOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendOfferPayload | SendOfferWithSenderPayload) => {
      let senderId: string;
      let senderType: UserType;

      if ('senderId' in payload) {
        senderId = payload.senderId;
        senderType = payload.senderType;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        senderId = user.id;
        senderType = profile?.user_type ?? 'barber';
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (payload.expiresInMinutes ?? 30));

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          request_id: payload.requestId,
          sender_id: senderId,
          sender_type: senderType,
          message_type: 'offer' as MessageType,
          offer_amount: payload.amount,
          offer_status: 'pending',
          offer_expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHAT_MESSAGES, variables.requestId],
      });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          request_id: payload.requestId,
          sender_id: payload.senderId,
          sender_type: payload.senderType,
          message_type: 'text' as MessageType,
          content: payload.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHAT_MESSAGES, variables.requestId],
      });
    },
  });
}
