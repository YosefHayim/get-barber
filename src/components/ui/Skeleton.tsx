import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Platform, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

type SkeletonVariant = 'rounded' | 'sharp' | 'circular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
  startColor?: string;
  isLoaded?: boolean;
  speed?: number;
  children?: React.ReactNode;
}

interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  _lines?: number;
  gap?: number;
}

const variantBorderRadius: Record<SkeletonVariant, number> = {
  rounded: RADIUS.md,
  sharp: 0,
  circular: 9999,
};

export function Skeleton({
  variant = 'rounded',
  style,
  startColor,
  isLoaded = false,
  speed = 2,
  children,
}: SkeletonProps): React.JSX.Element {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoaded) return;

    const fadeDuration = 0.6;
    const animationDuration = (fadeDuration * 10000) / speed;
    const customTimingFunction = Easing.bezier(0.4, 0, 0.6, 1);

    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: animationDuration / 2,
        easing: customTimingFunction,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.5,
        duration: animationDuration / 2,
        easing: customTimingFunction,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: animationDuration / 2,
        easing: customTimingFunction,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);

    const animation = Animated.loop(pulse);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [isLoaded, speed, pulseAnim]);

  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { 
          opacity: pulseAnim,
          borderRadius: variantBorderRadius[variant],
          backgroundColor: startColor || COLORS.backgroundSecondary,
        },
        style,
      ]}
    />
  );
}

export function SkeletonText({
  _lines = 1,
  gap = 2,
  style,
  startColor,
  isLoaded = false,
  speed = 2,
  children,
}: SkeletonTextProps): React.JSX.Element {
  if (isLoaded) {
    return <>{children}</>;
  }

  const gapValue = gap * 4;

  if (_lines === 1) {
    return (
      <Skeleton
        variant="rounded"
        style={[styles.textLine, style]}
        startColor={startColor}
        speed={speed}
      />
    );
  }

  return (
    <View style={{ gap: gapValue }}>
      {Array.from({ length: _lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          style={[
            styles.textLine,
            index === _lines - 1 ? styles.lastLine : undefined,
            style,
          ]}
          startColor={startColor}
          speed={speed}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    width: '100%',
    height: '100%',
  },
  textLine: {
    height: 16,
    width: '100%',
    borderRadius: RADIUS.xs,
  },
  lastLine: {
    width: '60%',
  },
});
