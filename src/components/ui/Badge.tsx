import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'gold';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: COLORS.backgroundSecondary, text: COLORS.textSecondary },
  success: { bg: COLORS.successLight, text: COLORS.success },
  warning: { bg: COLORS.warningLight, text: COLORS.warning },
  error: { bg: COLORS.errorLight, text: COLORS.error },
  gold: { bg: COLORS.goldMuted, text: COLORS.goldDark },
};

const sizeConfig: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: 8, paddingV: 2, fontSize: TYPOGRAPHY.xs },
  md: { paddingH: 12, paddingV: 4, fontSize: TYPOGRAPHY.sm },
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  style,
}: BadgeProps): React.JSX.Element {
  const colors = variantColors[variant];
  const sizeStyles = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text, fontSize: sizeStyles.fontSize }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: TYPOGRAPHY.semibold,
  },
});
