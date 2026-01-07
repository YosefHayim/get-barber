import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; color: string; bgColor: string }> = {
  success: { icon: CheckCircle, color: COLORS.success, bgColor: COLORS.successLight },
  error: { icon: XCircle, color: COLORS.error, bgColor: COLORS.errorLight },
  warning: { icon: AlertTriangle, color: COLORS.warning, bgColor: COLORS.warningLight },
  info: { icon: Info, color: COLORS.info, bgColor: COLORS.infoLight },
};

export function Toast({ id, type, message, onDismiss }: ToastProps): React.JSX.Element {
  const config = toastConfig[type];
  const IconComponent = config.icon;

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15).stiffness(150)}
      exiting={SlideOutUp.springify().damping(15).stiffness(150)}
      style={styles.container}
    >
      <View style={[styles.accentBar, { backgroundColor: config.color }]} />
      <View style={styles.content}>
        <IconComponent size={20} color={config.color} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Pressable onPress={() => onDismiss(id)} hitSlop={8} style={styles.closeButton}>
          <X size={16} color={COLORS.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.md,
    gap: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
  },
  closeButton: {
    padding: SPACING.xs,
  },
});
