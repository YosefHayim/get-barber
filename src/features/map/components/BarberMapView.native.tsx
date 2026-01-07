import React, { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { AnimatedBarberMarker } from './AnimatedBarberMarker';
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
  onRegionChange?: (region: Region) => void;
}

const DEFAULT_DELTA = 0.015;

const INITIAL_REGION = {
  latitude: 32.0853,
  longitude: 34.7818,
  latitudeDelta: DEFAULT_DELTA,
  longitudeDelta: DEFAULT_DELTA,
};

export function BarberMapView({
  userLocation,
  barbers,
  selectedBarberId,
  onBarberSelect,
  onRegionChange,
}: BarberMapViewProps): React.JSX.Element {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: DEFAULT_DELTA,
        longitudeDelta: DEFAULT_DELTA,
      }, 500);
    }
  }, [userLocation]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onRegionChange?.(region);
  }, [onRegionChange]);

  const generateBarberCoordinates = useCallback((barber: NearbyBarber, userLoc: GeoLocation) => {
    const seed = barber.id.charCodeAt(0) + barber.id.charCodeAt(barber.id.length - 1);
    const angle = (seed % 360) * (Math.PI / 180);
    const distanceKm = barber.distance_meters / 1000;
    const latOffset = distanceKm * Math.cos(angle) / 111;
    const lngOffset = distanceKm * Math.sin(angle) / (111 * Math.cos(userLoc.latitude * Math.PI / 180));
    
    return {
      latitude: userLoc.latitude + latOffset,
      longitude: userLoc.longitude + lngOffset,
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapPadding={{ top: 0, right: 0, bottom: 200, left: 0 }}
      >
        {userLocation && barbers.map((barber) => {
          const coords = generateBarberCoordinates(barber, userLocation);
          return (
            <AnimatedBarberMarker
              key={barber.id}
              barber={barber}
              latitude={coords.latitude}
              longitude={coords.longitude}
              isSelected={barber.id === selectedBarberId}
              onPress={onBarberSelect}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
