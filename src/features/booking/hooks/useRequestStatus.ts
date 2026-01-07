import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/services/supabase/client';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { Tables } from '@/services/supabase/database.types';

type ServiceRequest = Tables<'service_requests'>;
type BarberResponse = Tables<'barber_responses'>;

interface RequestWithResponses extends ServiceRequest {
  barber_responses: BarberResponse[];
}

const POLLING_INTERVAL = 3000;

export function useRequestStatus(requestId: string | null, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.REQUEST_STATUS, requestId],
    queryFn: async (): Promise<RequestWithResponses | null> => {
      if (!requestId) return null;
      
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          barber_responses (*)
        `)
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: enabled && requestId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const shouldPoll = status === 'pending' || status === 'matching';
      return shouldPoll ? POLLING_INTERVAL : false;
    },
    refetchIntervalInBackground: false,
  });

  const stopPolling = useCallback(() => {
    queryClient.setQueryDefaults([QUERY_KEYS.REQUEST_STATUS, requestId], {
      refetchInterval: false,
    });
  }, [queryClient, requestId]);

  const startPolling = useCallback(() => {
    queryClient.setQueryDefaults([QUERY_KEYS.REQUEST_STATUS, requestId], {
      refetchInterval: POLLING_INTERVAL,
    });
    queryClient.refetchQueries({
      queryKey: [QUERY_KEYS.REQUEST_STATUS, requestId],
    });
  }, [queryClient, requestId]);

  return {
    ...query,
    respondingBarbersCount: query.data?.barber_responses?.length ?? 0,
    stopPolling,
    startPolling,
  };
}
