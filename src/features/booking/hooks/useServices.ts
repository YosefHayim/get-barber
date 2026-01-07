import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { Tables } from '@/services/supabase/database.types';

type Service = Tables<'services'>;

export function useServices() {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 300000,
    gcTime: 600000,
  });
}
