import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DARK_COLORS, RADIUS } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  variant = 'text',
}: SkeletonProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, [shimmerPosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerPosition.value,
          [0, 1],
          [-200, 200]
        ),
      },
    ],
  }));

  // Determine border radius based on variant
  let computedRadius = borderRadius;
  if (computedRadius === undefined) {
    switch (variant) {
      case 'circular':
        computedRadius = typeof height === 'number' ? height / 2 : 50;
        break;
      case 'rounded':
        computedRadius = RADIUS.lg;
        break;
      case 'text':
        computedRadius = RADIUS.sm;
        break;
      default:
        computedRadius = 0;
    }
  }

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: computedRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.08)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// Pre-built skeleton components for common patterns
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: number | string;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          variant="text"
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({
  size = 48,
}: {
  size?: number;
}) {
  return <Skeleton width={size} height={size} variant="circular" />;
}

export function SkeletonButton({
  width = '100%',
  height = 48,
}: {
  width?: number | string;
  height?: number;
}) {
  return <Skeleton width={width} height={height} variant="rounded" />;
}

export function SkeletonCard({
  height = 200,
}: {
  height?: number;
}) {
  return <Skeleton width="100%" height={height} variant="rounded" />;
}

export function SkeletonImage({
  width = '100%',
  height = 200,
  borderRadius = RADIUS.lg,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}) {
  return <Skeleton width={width} height={height} borderRadius={borderRadius} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: DARK_COLORS.surfaceLight,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
  },
  gradient: {
    flex: 1,
  },
});

export default Skeleton;
