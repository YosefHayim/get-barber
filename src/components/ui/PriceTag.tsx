import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface PriceTagProps {
  amount: number;
  currency?: string;
  variant?: 'default' | 'highlight' | 'muted';
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { padding: 4, fontSize: 12 },
  medium: { padding: 8, fontSize: 14 },
  large: { padding: 12, fontSize: 16 },
} as const;

const VARIANTS = {
  default: { bg: '#F3F4F6', text: '#374151' },
  highlight: { bg: '#DBEAFE', text: '#1D4ED8' },
  muted: { bg: '#F9FAFB', text: '#6B7280' },
} as const;

export function PriceTag({
  amount,
  currency = '₪',
  variant = 'default',
  size = 'medium',
}: PriceTagProps): React.JSX.Element {
  const sizeConfig = SIZES[size];
  const variantConfig = VARIANTS[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantConfig.bg,
          paddingHorizontal: sizeConfig.padding * 1.5,
          paddingVertical: sizeConfig.padding,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantConfig.text, fontSize: sizeConfig.fontSize },
        ]}
      >
        {currency}{amount.toFixed(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
