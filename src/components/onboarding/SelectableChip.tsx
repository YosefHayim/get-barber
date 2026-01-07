import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SelectableChip({
  label,
  selected,
  onPress,
  icon,
  size = 'medium',
}: SelectableChipProps): React.JSX.Element {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.02 : 1) }],
    backgroundColor: withSpring(selected ? COLORS.goldMuted : COLORS.surface),
    borderColor: withSpring(selected ? COLORS.gold : COLORS.border),
  }));

  const sizeStyles = {
    small: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm },
    medium: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
    large: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.container, sizeStyles[size], animatedStyle]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.label,
          size === 'small' && styles.labelSmall,
          size === 'large' && styles.labelLarge,
          selected && styles.labelSelected,
        ]}
      >
        {label}
      </Text>
      {selected && (
        <View style={styles.checkContainer}>
          <Check size={14} color={COLORS.goldDark} strokeWidth={3} />
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 2,
    gap: SPACING.xs,
  },
  iconContainer: {
    marginRight: SPACING.xxs,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: TYPOGRAPHY.xs,
  },
  labelLarge: {
    fontSize: TYPOGRAPHY.md,
  },
  labelSelected: {
    color: COLORS.goldDark,
    fontWeight: '600',
  },
  checkContainer: {
    marginLeft: SPACING.xxs,
  },
});
