import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback types
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

// Haptic feedback wrapper with platform check
async function triggerHaptic(
  style: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType
): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    if (typeof style === 'string' && style.startsWith('notification')) {
      await Haptics.notificationAsync(style as Haptics.NotificationFeedbackType);
    } else {
      await Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle);
    }
  } catch (error) {
    // Silently fail if haptics not available
    if (__DEV__) {
      console.warn('Haptics error:', error);
    }
  }
}

// Pre-defined haptic patterns
export const haptic = {
  // Light feedback - subtle interactions
  light: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Light),

  // Medium feedback - standard interactions
  medium: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Medium),

  // Heavy feedback - important actions
  heavy: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy),

  // Success feedback - completion, confirmation
  success: () => triggerHaptic(Haptics.NotificationFeedbackType.Success),

  // Warning feedback - caution needed
  warning: () => triggerHaptic(Haptics.NotificationFeedbackType.Warning),

  // Error feedback - something went wrong
  error: () => triggerHaptic(Haptics.NotificationFeedbackType.Error),

  // Selection feedback - picker, segmented control
  selection: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      if (__DEV__) {
        console.warn('Haptics selection error:', error);
      }
    }
  },
};

// Semantic haptic functions for specific actions
export const hapticFeedback = {
  // Button press
  buttonPress: () => haptic.light(),

  // Tab change
  tabChange: () => haptic.selection(),

  // Pull to refresh
  pullToRefresh: () => haptic.medium(),

  // Item selection (checkbox, radio)
  select: () => haptic.selection(),

  // Toggle switch
  toggle: () => haptic.light(),

  // Swipe action
  swipe: () => haptic.medium(),

  // Delete action
  delete: () => haptic.warning(),

  // Booking confirmed
  bookingConfirmed: () => haptic.success(),

  // Payment successful
  paymentSuccess: () => haptic.success(),

  // Payment failed
  paymentError: () => haptic.error(),

  // Form validation error
  validationError: () => haptic.error(),

  // Action completed
  actionComplete: () => haptic.success(),

  // Long press detected
  longPress: () => haptic.heavy(),

  // Modal opened
  modalOpen: () => haptic.medium(),

  // Modal closed
  modalClose: () => haptic.light(),

  // Navigation
  navigate: () => haptic.light(),

  // Notification received
  notification: () => haptic.success(),

  // Rating submitted
  ratingSubmit: () => haptic.success(),

  // Message sent
  messageSent: () => haptic.light(),

  // Timer complete
  timerComplete: () => haptic.success(),

  // Error occurred
  error: () => haptic.error(),

  // Warning
  warn: () => haptic.warning(),
};

// Custom pattern function
export async function playHapticPattern(
  pattern: HapticType[],
  delayMs: number = 100
): Promise<void> {
  for (const type of pattern) {
    await haptic[type]();
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

// Haptic hook for components
import { useCallback, useRef } from 'react';

export function useHaptics() {
  const lastHapticTime = useRef(0);
  const minInterval = 50; // Minimum ms between haptics to prevent spam

  const triggerWithThrottle = useCallback(
    async (type: HapticType = 'light') => {
      const now = Date.now();
      if (now - lastHapticTime.current < minInterval) return;
      lastHapticTime.current = now;
      await haptic[type]();
    },
    []
  );

  return {
    trigger: triggerWithThrottle,
    ...hapticFeedback,
    pattern: playHapticPattern,
  };
}

export default {
  haptic,
  hapticFeedback,
  playHapticPattern,
  useHaptics,
};
