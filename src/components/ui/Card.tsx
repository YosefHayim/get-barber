import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  variant = 'default',
  children,
  onPress,
  style,
}: CardProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (variant === 'interactive' || onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const variantStyles = getVariantStyles(variant);
  const isInteractive = variant === 'interactive' || onPress;

  if (isInteractive) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, variantStyles, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.container, variantStyles, style]}>{children}</View>;
}

function getVariantStyles(variant: CardVariant): ViewStyle {
  switch (variant) {
    case 'elevated':
      return {
        ...SHADOWS.lg,
        padding: SPACING.xl,
      };
    case 'outlined':
      return {
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowOpacity: 0,
        elevation: 0,
      };
    case 'interactive':
      return {
        ...SHADOWS.md,
      };
    default:
      return {
        ...SHADOWS.md,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
});
