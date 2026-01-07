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
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Scissors } from 'lucide-react-native';

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';
const BURGUNDY = '#722F37';

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
        {isSelected && (
          <View style={styles.pulseRing} />
        )}
        <View style={[
          styles.markerContainer,
          isSelected && styles.selectedMarker,
          barber.is_verified && styles.verifiedMarker,
        ]}>
          <View style={[
            styles.innerCircle,
            isSelected && styles.innerCircleSelected,
          ]}>
            <Scissors
              size={isSelected ? 22 : 18}
              color={isSelected ? '#FFFFFF' : DARK_GOLD}
              style={styles.icon}
            />
          </View>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: GOLD,
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircleSelected: {
    backgroundColor: BURGUNDY,
  },
  selectedMarker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    borderColor: DARK_GOLD,
    borderWidth: 4,
    shadowColor: GOLD,
    shadowOpacity: 0.5,
  },
  verifiedMarker: {
    borderColor: GOLD,
  },
  icon: {
    transform: [{ rotate: '-45deg' }],
  },
  pulseRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    top: -7,
    left: -7,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
    borderBottomRightRadius: 4,
  },
});
