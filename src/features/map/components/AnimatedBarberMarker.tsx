import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

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

interface AnimatedBarberMarkerProps {
  barber: NearbyBarber;
  latitude: number;
  longitude: number;
  isSelected: boolean;
  onPress: (barber: NearbyBarber) => void;
}

export function AnimatedBarberMarker({
  barber,
  isSelected,
  onPress,
}: AnimatedBarberMarkerProps): React.JSX.Element {
  return (
    <Pressable onPress={() => onPress(barber)}>
      <View style={[styles.marker, isSelected && styles.selectedMarker]}>
        <Text style={styles.markerText}>✂️</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  selectedMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    borderColor: '#1D4ED8',
    borderWidth: 3,
  },
  markerText: {
    fontSize: 20,
  },
});
