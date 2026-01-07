import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { Navigation } from 'lucide-react-native';
import { BarberMapView } from '@/features/map/components';
import { BookingBottomSheet } from '@/features/booking/components';
import { ActionFloatingButton } from '@/components/ui/ActionFloatingButton';
import { useNearbyBarbers } from '@/features/booking/hooks/useNearbyBarbers';
import { useServices } from '@/features/booking/hooks/useServices';
import { useCreateRequest } from '@/features/booking/hooks/useCreateRequest';
import { useBookingStore } from '@/stores/useBookingStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAuth } from '@/features/auth/context/AuthContext';
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

export default function MapScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  
  const setLocation = useUserStore((s) => s.setLocation);
  const selectedBarber = useBookingStore((s) => s.selectedBarber);
  const setSelectedBarber = useBookingStore((s) => s.setSelectedBarber);
  const selectedServices = useBookingStore((s) => s.selectedServices);
  
  const { data: barbers = [], isLoading: isLoadingBarbers } = useNearbyBarbers({
    location: userLocation,
    enabled: !!userLocation,
  });
  
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  
  const createRequest = useCreateRequest();

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

  const handleBarberSelect = useCallback((barber: NearbyBarber) => {
    setSelectedBarber(barber);
    bottomSheetRef.current?.snapToIndex(2);
  }, [setSelectedBarber]);

  const handleRequestBarber = useCallback(async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services.');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service.');
      return;
    }

    try {
      const requestId = await createRequest.mutateAsync({
        serviceIds: selectedServices.map((s) => s.id),
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        address: userAddress || 'Current Location',
      });

      if (requestId) {
        router.push(`/(modals)/chat/${requestId}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create request. Please try again.');
    }
  }, [user, userLocation, userAddress, selectedServices, createRequest]);

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

  return (
    <View style={styles.container}>
      <BarberMapView
        userLocation={userLocation}
        barbers={barbers}
        selectedBarberId={selectedBarber?.id ?? null}
        onBarberSelect={handleBarberSelect}
      />

      <View style={[styles.fabContainer, { top: insets.top + 16 }]}>
        <ActionFloatingButton
          icon={Navigation}
          onPress={handleMyLocation}
          size="small"
        />
      </View>

      <BookingBottomSheet
        ref={bottomSheetRef}
        barbers={barbers}
        services={services}
        isLoadingBarbers={isLoadingBarbers}
        isLoadingServices={isLoadingServices}
        onBarberSelect={handleBarberSelect}
        onRequestBarber={handleRequestBarber}
        isRequesting={createRequest.isPending}
        userAddress={userAddress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
  },
});
