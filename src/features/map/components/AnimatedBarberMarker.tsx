import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Scissors } from 'lucide-react-native';

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

const SPRING_CONFIG = {
  damping: 12,
  stiffness: 180,
  mass: 1,
};

export function AnimatedBarberMarker({
  barber,
  latitude,
  longitude,
  isSelected,
  onPress,
}: AnimatedBarberMarkerProps): React.JSX.Element {
  const scale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      Math.random() * 300,
      withSpring(1, SPRING_CONFIG)
    );
  }, [scale]);

  useEffect(() => {
    if (isSelected) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 200 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1, SPRING_CONFIG);
    }
  }, [isSelected, pulseScale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
    ],
  }));

  const handlePress = () => {
    onPress(barber);
  };

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={handlePress}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Animated.View style={containerStyle}>
        <View style={[
          styles.markerContainer,
          isSelected && styles.selectedMarker,
          barber.is_verified && styles.verifiedMarker,
        ]}>
          <Scissors
            size={isSelected ? 20 : 16}
            color={isSelected ? '#FFFFFF' : '#3B82F6'}
            style={styles.icon}
          />
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator} />
        )}
      </Animated.View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  verifiedMarker: {
    borderColor: '#10B981',
  },
  icon: {
    transform: [{ rotate: '-45deg' }],
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#3B82F6',
    transform: [{ rotate: '45deg' }],
  },
});
