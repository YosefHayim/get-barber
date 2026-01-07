import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { Tables } from '@/services/supabase/database.types';

type ChatMessage = Tables<'chat_messages'>;

export function useChatMessages(requestId: string | null, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.CHAT_MESSAGES, requestId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data ?? [];
    },
    enabled: enabled && requestId !== null,
  });

  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`chat:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          queryClient.setQueryData<ChatMessage[]>(
            [QUERY_KEYS.CHAT_MESSAGES, requestId],
            (old) => [...(old ?? []), payload.new as ChatMessage]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, queryClient]);

  return query;
}
