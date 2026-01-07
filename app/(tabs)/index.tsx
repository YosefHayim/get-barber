import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Alert, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { Navigation, Search, X } from 'lucide-react-native';
import { Text } from 'react-native-paper';
import {
  BarberMapView,
  FilterChips,
  MapBottomSheet,
} from '@/features/map/components';
import type { FilterType } from '@/features/map/components';
import type { MapBarber } from '@/features/map/components';
import { ActionFloatingButton } from '@/components/ui/ActionFloatingButton';
import { useNearbyBarbers } from '@/features/booking/hooks/useNearbyBarbers';
import { useBookingStore } from '@/stores/useBookingStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAuth } from '@/features/auth/context/AuthContext';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import type { GeoLocation } from '@/types/common.types';
import type { BarberStatus } from '@/constants/theme';

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

export default function MapScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>(['available_now']);
  
  const setLocation = useUserStore((s) => s.setLocation);
  const selectedBarber = useBookingStore((s) => s.selectedBarber);
  const setSelectedBarber = useBookingStore((s) => s.setSelectedBarber);
  
  const { data: rawBarbers = [], isLoading: isLoadingBarbers } = useNearbyBarbers({
    location: userLocation,
    enabled: !!userLocation,
  });

  const barbers: MapBarber[] = useMemo(() => {
    return rawBarbers.map((barber: NearbyBarber) => ({
      id: barber.id,
      userId: barber.user_id,
      displayName: barber.display_name,
      avatarUrl: barber.avatar_url,
      bio: barber.bio,
      rating: barber.rating,
      totalReviews: barber.total_reviews,
      isVerified: barber.is_verified,
      distanceMeters: barber.distance_meters,
      priceMin: barber.price_min,
      priceMax: barber.price_max,
      status: 'available' as BarberStatus,
      homeServiceAvailable: false,
    }));
  }, [rawBarbers]);

  const filteredBarbers = useMemo(() => {
    let result = barbers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((b) =>
        b.displayName.toLowerCase().includes(query)
      );
    }

    if (selectedFilters.includes('available_now')) {
      result = result.filter((b) => b.status === 'available');
    }
    if (selectedFilters.includes('top_rated')) {
      result = result.filter((b) => b.rating >= 4.5);
    }
    if (selectedFilters.includes('nearby')) {
      result = result.filter((b) => b.distanceMeters <= 2000);
    }
    if (selectedFilters.includes('home_service')) {
      result = result.filter((b) => b.homeServiceAvailable);
    }

    return result;
  }, [barbers, searchQuery, selectedFilters]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission',
            'Please enable location services to find nearby barbers.',
            [{ text: 'OK' }]
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newLocation: GeoLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(newLocation);
        setLocation(newLocation);

        const [address] = await Location.reverseGeocodeAsync(newLocation);
        if (address) {
          const formattedAddress = [
            address.street,
            address.city,
          ].filter(Boolean).join(', ');
          setUserAddress(formattedAddress);
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getLocation();
  }, [setLocation]);

  const handleBarberSelect = useCallback((barber: MapBarber) => {
    const originalBarber: NearbyBarber = {
      id: barber.id,
      user_id: barber.userId,
      display_name: barber.displayName,
      avatar_url: barber.avatarUrl,
      bio: barber.bio,
      rating: barber.rating,
      total_reviews: barber.totalReviews,
      is_verified: barber.isVerified,
      distance_meters: barber.distanceMeters,
      price_min: barber.priceMin,
      price_max: barber.priceMax,
    };
    setSelectedBarber(originalBarber);
    bottomSheetRef.current?.snapToIndex(1);
  }, [setSelectedBarber]);

  const handleBarberPress = useCallback((barber: MapBarber) => {
    router.push(`/(modals)/barber-detail/${barber.id}`);
  }, []);

  const handleMyLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation: GeoLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);
      setLocation(newLocation);
    } catch (error) {
      console.error('Error refreshing location:', error);
    }
  }, [setLocation]);

  const handleFilterChange = useCallback((filters: FilterType[]) => {
    setSelectedFilters(filters);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const legacyBarbers = useMemo(() => {
    return filteredBarbers.map((b) => ({
      id: b.id,
      user_id: b.userId,
      display_name: b.displayName,
      avatar_url: b.avatarUrl,
      bio: b.bio,
      rating: b.rating,
      total_reviews: b.totalReviews,
      is_verified: b.isVerified,
      distance_meters: b.distanceMeters,
      price_min: b.priceMin,
      price_max: b.priceMax,
    }));
  }, [filteredBarbers]);

  const handleLegacyBarberSelect = useCallback((barber: NearbyBarber) => {
    setSelectedBarber(barber);
    bottomSheetRef.current?.snapToIndex(1);
  }, [setSelectedBarber]);

  return (
    <View style={styles.container}>
      <BarberMapView
        userLocation={userLocation}
        barbers={legacyBarbers}
        selectedBarberId={selectedBarber?.id ?? null}
        onBarberSelect={handleLegacyBarberSelect}
      />

      <View style={[styles.searchContainer, { top: insets.top + SPACING.md }]}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search barbers..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <X size={18} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>
        
        {userAddress && (
          <View style={styles.locationBadge}>
            <Text style={styles.locationText} numberOfLines={1}>
              {userAddress}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.filterContainer, { top: insets.top + SPACING.md + 56 + SPACING.sm }]}>
        <FilterChips
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
      </View>

      <View style={[styles.fabContainer, { bottom: 180 }]}>
        <ActionFloatingButton
          icon={Navigation}
          onPress={handleMyLocation}
          size="small"
        />
      </View>

      <MapBottomSheet
        ref={bottomSheetRef}
        barbers={filteredBarbers}
        isLoading={isLoadingBarbers}
        selectedBarberId={selectedBarber?.id ?? null}
        onBarberSelect={handleBarberSelect}
        onBarberPress={handleBarberPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  locationBadge: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.copperMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.copper,
    fontWeight: TYPOGRAPHY.medium,
  },
  filterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9,
  },
  fabContainer: {
    position: 'absolute',
    right: SPACING.lg,
    zIndex: 10,
  },
});
