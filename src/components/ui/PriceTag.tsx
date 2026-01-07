import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

interface PriceTagProps {
  amount: number;
  currency?: string;
  variant?: 'default' | 'highlight' | 'muted' | 'premium';
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { padding: 4, fontSize: 12 },
  medium: { padding: 8, fontSize: 15 },
  large: { padding: 12, fontSize: 18 },
} as const;

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';

const VARIANTS = {
  default: { bg: '#F5F5F5', text: '#1A1A1A', border: '#E0E0E0' },
  highlight: { bg: 'rgba(218, 165, 32, 0.15)', text: DARK_GOLD, border: GOLD },
  muted: { bg: '#FAFAFA', text: '#757575', border: '#EEEEEE' },
  premium: { bg: GOLD, text: '#FFFFFF', border: DARK_GOLD },
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
          paddingHorizontal: sizeConfig.padding * 2,
          paddingVertical: sizeConfig.padding,
          borderColor: variantConfig.border,
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
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
