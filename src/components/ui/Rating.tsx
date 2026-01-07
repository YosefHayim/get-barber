import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Star } from 'lucide-react-native';

interface RatingProps {
  value: number;
  totalReviews?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

const SIZES = {
  small: { star: 12, text: 10 },
  medium: { star: 14, text: 12 },
  large: { star: 18, text: 14 },
} as const;

export function Rating({
  value,
  totalReviews,
  size = 'medium',
  showCount = true,
}: RatingProps): React.JSX.Element {
  const sizeConfig = SIZES[size];

  return (
    <View style={styles.container}>
      <Star 
        size={sizeConfig.star} 
        color="#FCD34D" 
        fill="#FCD34D" 
      />
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
    gap: 4,
  },
  value: {
    fontWeight: '600',
    color: '#374151',
  },
  count: {
    color: '#6B7280',
  },
});
