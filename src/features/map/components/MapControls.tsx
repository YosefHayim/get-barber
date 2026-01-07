import React, { useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { Plus, Minus, Layers } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapType?: () => void;
  showMapTypeToggle?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ControlButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

function ControlButton({ onPress, children, isFirst, isLast }: ControlButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
      style={[
        styles.controlButton,
        isFirst && styles.controlButtonFirst,
        isLast && styles.controlButtonLast,
        !isFirst && !isLast && styles.controlButtonMiddle,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onToggleMapType,
  showMapTypeToggle = true,
}: MapControlsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.zoomControls}>
        <ControlButton onPress={onZoomIn} isFirst>
          <Plus size={20} color={COLORS.textPrimary} />
        </ControlButton>
        <View style={styles.separator} />
        <ControlButton onPress={onZoomOut} isLast>
          <Minus size={20} color={COLORS.textPrimary} />
        </ControlButton>
      </View>

      {showMapTypeToggle && onToggleMapType && (
        <View style={styles.mapTypeControl}>
          <ControlButton onPress={onToggleMapType} isFirst isLast>
            <Layers size={20} color={COLORS.textPrimary} />
          </ControlButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  zoomControls: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  controlButtonFirst: {
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
  },
  controlButtonLast: {
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  controlButtonMiddle: {
    borderRadius: 0,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  mapTypeControl: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
});
