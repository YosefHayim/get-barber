import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import type { BarberStatus } from '@/constants/theme';

interface BarberMarkerProps {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
  status: BarberStatus;
  isSelected: boolean;
  onPress: () => void;
}

export function BarberMarker({
  displayName,
  avatarUrl,
  rating,
  status,
  isSelected,
  onPress,
}: BarberMarkerProps): React.JSX.Element {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for available barbers
  useEffect(() => {
    if (status === 'available') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  // Scale animation on selection
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.15 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isSelected, scaleAnim]);

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return COLORS.online;
      case 'busy':
        return COLORS.busy;
      case 'offline':
      default:
        return COLORS.offline;
    }
  };

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Pulse ring for available barbers */}
        {status === 'available' && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />
        )}

        {/* Main marker */}
        <View style={[styles.marker, isSelected && styles.markerSelected]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          {/* Status indicator */}
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        </View>

        {/* Rating badge */}
        <View style={styles.ratingBadge}>
          <Star size={10} color={COLORS.brass} fill={COLORS.brass} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>

        {/* Pointer triangle */}
        <View style={[styles.pointer, isSelected && styles.pointerSelected]} />
      </Animated.View>
    </Pressable>
  );
}

const MARKER_SIZE = 52;
const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: MARKER_SIZE + 16,
    height: MARKER_SIZE + 16,
    borderRadius: (MARKER_SIZE + 16) / 2,
    backgroundColor: COLORS.online,
    top: -8,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  markerSelected: {
    borderColor: COLORS.copper,
    borderWidth: 3,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  ratingBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 2,
    ...SHADOWS.sm,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.surface,
    marginTop: -2,
  },
  pointerSelected: {
    borderTopColor: COLORS.copper,
  },
});
