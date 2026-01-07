import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MapPin } from 'lucide-react-native';

interface DistanceIndicatorProps {
  meters: number;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { icon: 12, text: 10 },
  medium: { icon: 14, text: 12 },
  large: { icon: 16, text: 14 },
} as const;

export function DistanceIndicator({
  meters,
  showIcon = true,
  size = 'medium',
}: DistanceIndicatorProps): React.JSX.Element {
  const sizeConfig = SIZES[size];
  
  const formatDistance = (m: number): string => {
    if (m < 1000) {
      return `${Math.round(m)}m`;
    }
    return `${(m / 1000).toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      {showIcon && <MapPin size={sizeConfig.icon} color="#6B7280" />}
      <Text style={[styles.text, { fontSize: sizeConfig.text }]}>
        {formatDistance(meters)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    color: '#6B7280',
  },
});
