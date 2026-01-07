import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Star } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface RatingProps {
  value: number;
  totalReviews?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

const SIZES = {
  small: { star: 12, text: 10 },
  medium: { star: 16, text: 13 },
  large: { star: 20, text: 16 },
} as const;

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';

export function Rating({
  value,
  totalReviews,
  size = 'medium',
  showCount = true,
}: RatingProps): React.JSX.Element {
  const sizeConfig = SIZES[size];
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSequence(
      withDelay(100, withSpring(1.2, { damping: 8 })),
      withSpring(1, { damping: 10 })
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Star 
          size={sizeConfig.star} 
          color={GOLD}
          fill={GOLD}
          strokeWidth={1.5}
        />
      </Animated.View>
      <Text style={[styles.value, { fontSize: sizeConfig.text }]}>
        {value.toFixed(1)}
      </Text>
      {showCount && totalReviews !== undefined && (
        <Text style={[styles.count, { fontSize: sizeConfig.text }]}>
          ({totalReviews})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  value: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  count: {
    color: '#6B7280',
    fontWeight: '500',
  },
});
