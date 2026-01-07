import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Navigation } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';

interface CurrentLocationButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  isActive?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CurrentLocationButton({
  onPress,
  isLoading,
  isActive,
}: CurrentLocationButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
      style={[
        styles.button,
        isActive && styles.buttonActive,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isActive ? COLORS.textInverse : COLORS.gold} />
      ) : (
        <Navigation
          size={20}
          color={isActive ? COLORS.textInverse : COLORS.gold}
          fill={isActive ? COLORS.textInverse : 'transparent'}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  buttonActive: {
    backgroundColor: COLORS.gold,
  },
});
