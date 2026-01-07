import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ChevronRight, Clock } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import { PriceTag } from '@/components/ui/PriceTag';
import { DistanceIndicator } from '@/components/ui/DistanceIndicator';

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

interface BarberCardProps {
  barber: NearbyBarber;
  onPress: (barber: NearbyBarber) => void;
  isSelected?: boolean;
  estimatedArrival?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BarberCard({
  barber,
  onPress,
  isSelected = false,
  estimatedArrival,
}: BarberCardProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress(barber);
  }, [barber, onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Surface
        style={[
          styles.container,
          isSelected && styles.selected,
        ]}
        elevation={isSelected ? 4 : 2}
      >
        <View style={styles.header}>
          <Avatar
            uri={barber.avatar_url}
            name={barber.display_name}
            size={56}
            showOnlineIndicator
            isOnline={true}
          />

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {barber.display_name}
            </Text>
            <Rating
              value={barber.rating}
              totalReviews={barber.total_reviews}
              size="small"
            />
          </View>

          <ChevronRight size={20} color="#9CA3AF" />
        </View>

        <View style={styles.footer}>
          <DistanceIndicator meters={barber.distance_meters} size="small" />

          {estimatedArrival && (
            <View style={styles.eta}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.etaText}>{estimatedArrival} min</Text>
            </View>
          )}

          {barber.price_min && (
            <PriceTag
              amount={barber.price_min}
              variant="highlight"
              size="small"
            />
          )}
        </View>
      </Surface>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    width: 280,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
