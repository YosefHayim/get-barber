import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const variantColors = {
  primary: { bg: COLORS.goldDark, text: COLORS.textInverse, border: COLORS.goldDark },
  secondary: { bg: COLORS.burgundy, text: COLORS.textInverse, border: COLORS.burgundy },
  outline: { bg: 'transparent', text: COLORS.gold, border: COLORS.gold },
  ghost: { bg: 'transparent', text: COLORS.gold, border: 'transparent' },
  danger: { bg: COLORS.error, text: COLORS.textInverse, border: COLORS.error },
};

const sizeConfig = {
  sm: { height: 40, paddingHorizontal: 16, fontSize: TYPOGRAPHY.sm },
  md: { height: 48, paddingHorizontal: 20, fontSize: TYPOGRAPHY.base },
  lg: { height: 56, paddingHorizontal: 24, fontSize: TYPOGRAPHY.md },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  onPress,
  style,
}: ButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const colors = variantColors[variant];
  const sizeStyles = sizeConfig[size];
  const isDisabled = disabled || loading;
  const isOutlineOrGhost = variant === 'outline' || variant === 'ghost';
  const spinnerColor = isOutlineOrGhost ? COLORS.gold : COLORS.textInverse;

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        fullWidth ? styles.fullWidth : undefined,
        isDisabled ? styles.disabled : undefined,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { fontSize: sizeStyles.fontSize, color: colors.text },
              isDisabled ? styles.disabledText : undefined,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOWS.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.semibold,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
