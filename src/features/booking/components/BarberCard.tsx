import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ChevronRight, Clock, BadgeCheck } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import { PriceTag } from '@/components/ui/PriceTag';
import { DistanceIndicator } from '@/components/ui/DistanceIndicator';

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';

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
    <Animated.View entering={FadeInRight.duration(300)}>
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
          elevation={isSelected ? 5 : 2}
        >
          <View style={styles.header}>
            <Avatar
              uri={barber.avatar_url}
              name={barber.display_name}
              size={60}
              showOnlineIndicator
              isOnline={true}
              verified={barber.is_verified}
            />

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {barber.display_name}
                </Text>
                {barber.is_verified && (
                  <BadgeCheck size={18} color={GOLD} fill={GOLD} />
                )}
              </View>
              <Rating
                value={barber.rating}
                totalReviews={barber.total_reviews}
                size="small"
              />
            </View>

            <View style={styles.chevronContainer}>
              <ChevronRight size={22} color={DARK_GOLD} />
            </View>
          </View>

          <View style={styles.footer}>
            <DistanceIndicator meters={barber.distance_meters} size="small" />

            {estimatedArrival && (
              <View style={styles.eta}>
                <Clock size={14} color={DARK_GOLD} />
                <Text style={styles.etaText}>{estimatedArrival} min</Text>
              </View>
            )}

            {barber.price_min && (
              <PriceTag
                amount={barber.price_min}
                variant="premium"
                size="small"
              />
            )}
          </View>
        </Surface>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
    width: 290,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.1)',
  },
  selected: {
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(218, 165, 32, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 13,
    color: DARK_GOLD,
    fontWeight: '600',
  },
});
