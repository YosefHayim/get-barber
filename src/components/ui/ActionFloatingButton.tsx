import React, { useCallback } from 'react';
import { StyleSheet, Pressable, View, type ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Navigation, type LucideIcon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ActionFloatingButtonProps {
  icon: LucideIcon | string;
  onPress: () => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'surface';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  style?: ViewStyle;
  testID?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  navigation: Navigation,
};

const SIZES = {
  small: 40,
  medium: 56,
  large: 72,
} as const;

const ICON_SIZES = {
  small: 20,
  medium: 24,
  large: 32,
} as const;

const COLORS = {
  primary: { bg: '#B8860B', fg: '#ffffff' },
  secondary: { bg: '#722F37', fg: '#ffffff' },
  surface: { bg: '#ffffff', fg: '#1A1A1A' },
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionFloatingButton({
  icon,
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  position = 'bottom-right',
  style,
  testID,
}: ActionFloatingButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const colors = COLORS[variant];
  const positionStyles = getPositionStyles(position);

  const IconComponent = typeof icon === 'string' ? ICON_MAP[icon] ?? Navigation : icon;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.fab,
        positionStyles,
        animatedStyle,
        { 
          backgroundColor: disabled ? '#e5e7eb' : colors.bg,
          width: SIZES[size],
          height: SIZES[size],
          borderRadius: SIZES[size] / 2,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.fg} />
      ) : (
        <IconComponent 
          size={ICON_SIZES[size]} 
          color={disabled ? '#9ca3af' : colors.fg} 
        />
      )}
    </AnimatedPressable>
  );
}

function getPositionStyles(position: ActionFloatingButtonProps['position']): ViewStyle {
  const base: ViewStyle = {
    position: 'absolute',
    bottom: 24,
  };

  switch (position) {
    case 'bottom-right':
      return { ...base, right: 24 };
    case 'bottom-center':
      return { ...base, alignSelf: 'center', left: '50%', marginLeft: -28 };
    case 'bottom-left':
      return { ...base, left: 24 };
    default:
      return { ...base, right: 24 };
  }
}

const styles = StyleSheet.create({
  fab: {
    elevation: 12,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
