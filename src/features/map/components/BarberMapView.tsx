import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
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

interface BarberMapViewProps {
  userLocation: GeoLocation | null;
  barbers: NearbyBarber[];
  selectedBarberId: string | null;
  onBarberSelect: (barber: NearbyBarber) => void;
  onRegionChange?: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
}

export function BarberMapView({
  userLocation,
  barbers,
  selectedBarberId,
  onBarberSelect,
}: BarberMapViewProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.subtitle}>
          Maps are only available on iOS and Android devices
        </Text>
        {userLocation && (
          <Text style={styles.locationText}>
            Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
        <Text style={styles.barberCount}>
          {barbers.length} barber{barbers.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>
      
      <View style={styles.barberList}>
        {barbers.map((barber) => (
          <Pressable
            key={barber.id}
            style={[
              styles.barberItem,
              selectedBarberId === barber.id && styles.selectedBarberItem,
            ]}
            onPress={() => onBarberSelect(barber)}
          >
            <View style={styles.barberInfo}>
              <Text style={styles.barberName}>{barber.display_name}</Text>
              <Text style={styles.barberRating}>
                {barber.rating.toFixed(1)} ({barber.total_reviews} reviews)
              </Text>
              <Text style={styles.barberDistance}>
                {(barber.distance_meters / 1000).toFixed(1)} km away
              </Text>
            </View>
            {barber.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  barberCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  barberList: {
    flex: 1,
    padding: 16,
  },
  barberItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  } as const,
  selectedBarberItem: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  barberRating: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  barberDistance: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
