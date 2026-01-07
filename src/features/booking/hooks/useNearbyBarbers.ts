import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { GeoLocation } from '@/types/common.types';

interface NearbyBarber {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  distance_meters: number;
  price_min: number | null;
  price_max: number | null;
}

interface UseNearbyBarbersParams {
  location: GeoLocation | null;
  radiusMeters?: number;
  enabled?: boolean;
}

const DEFAULT_RADIUS = 5000;
const REFETCH_INTERVAL = 30000;

export function useNearbyBarbers({
  location,
  radiusMeters = DEFAULT_RADIUS,
  enabled = true,
}: UseNearbyBarbersParams) {
  return useQuery({
    queryKey: [
      QUERY_KEYS.NEARBY_BARBERS,
      location?.latitude,
      location?.longitude,
      radiusMeters,
    ],
    queryFn: async (): Promise<NearbyBarber[]> => {
      if (!location) {
        throw new Error('Location is required');
      }
      
      const { data, error } = await supabase.rpc('get_nearby_barbers', {
        p_latitude: location.latitude,
        p_longitude: location.longitude,
        p_radius_meters: radiusMeters,
      });
      
      if (error) throw error;
      return data ?? [];
    },
    enabled: enabled && location !== null,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 10000,
    gcTime: 60000,
  });
}
