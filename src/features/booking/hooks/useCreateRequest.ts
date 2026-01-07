import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useBookingStore } from '@/stores/useBookingStore';
import type { GeoLocation } from '@/types/common.types';

interface CreateRequestPayload {
  serviceIds: string[];
  location: GeoLocation;
  address: string;
  notes?: string;
  scheduledTime?: string;
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const setActiveRequestId = useBookingStore((state) => state.setActiveRequestId);

  return useMutation({
    mutationFn: async (payload: CreateRequestPayload): Promise<string> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_service_request', {
        p_customer_id: user.id,
        p_service_ids: payload.serviceIds,
        p_latitude: payload.location.latitude,
        p_longitude: payload.location.longitude,
        p_address: payload.address,
        p_notes: payload.notes,
        p_scheduled_time: payload.scheduledTime,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (requestId) => {
      setActiveRequestId(requestId);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACTIVE_REQUESTS],
      });
    },
  });
}
