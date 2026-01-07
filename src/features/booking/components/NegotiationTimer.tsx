import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@/constants/theme';

const TIMER_SIZE = 120;
const STROKE_WIDTH = 8;
const RADIUS_VALUE = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS_VALUE;
const NEGOTIATION_DURATION_SECONDS = 15 * 60;

interface NegotiationTimerProps {
  expiresAt: Date;
  onExpire?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function NegotiationTimer({
  expiresAt,
  onExpire,
  size = 'medium',
}: NegotiationTimerProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const diff = expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now();
      const newRemaining = Math.max(0, Math.floor(diff / 1000));
      setRemainingSeconds(newRemaining);

      if (newRemaining === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = useCallback((seconds: number): string => {
    if (seconds > 600) return COLORS.success;
    if (seconds > 300) return COLORS.warning;
    return COLORS.error;
  }, []);

  const timerColor = getTimerColor(remainingSeconds);
  const isUrgent = remainingSeconds <= 60;
  const progress = remainingSeconds / NEGOTIATION_DURATION_SECONDS;

  const sizeMultiplier = size === 'small' ? 0.7 : size === 'large' ? 1.3 : 1;
  const actualSize = TIMER_SIZE * sizeMultiplier;
  const actualRadius = RADIUS_VALUE * sizeMultiplier;
  const actualStroke = STROKE_WIDTH * sizeMultiplier;
  const actualCircumference = 2 * Math.PI * actualRadius;
  const strokeDashoffset = actualCircumference * (1 - progress);

  return (
    <View style={[styles.container, { width: actualSize, height: actualSize }]}>
      <Svg width={actualSize} height={actualSize} style={styles.svg}>
        <Circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={actualRadius}
          stroke={COLORS.borderLight}
          strokeWidth={actualStroke}
          fill="transparent"
        />
        <Circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={actualRadius}
          stroke={timerColor}
          strokeWidth={actualStroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${actualCircumference} ${actualCircumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${actualSize / 2} ${actualSize / 2})`}
        />
      </Svg>

      <View style={styles.timeContainer}>
        <Text
          style={[
            styles.timeText,
            { color: timerColor },
            isUrgent && styles.timeTextUrgent,
            { fontSize: TYPOGRAPHY['2xl'] * sizeMultiplier },
          ]}
        >
          {formatTime(remainingSeconds)}
        </Text>
        <Text style={[styles.label, { fontSize: TYPOGRAPHY.xs * sizeMultiplier }]}>
          {remainingSeconds > 0 ? 'Time Left' : 'Expired'}
        </Text>
      </View>
    </View>
  );
}

interface NegotiationTimerCompactProps {
  expiresAt: Date;
  onExpire?: () => void;
}

export function NegotiationTimerCompact({
  expiresAt,
  onExpire,
}: NegotiationTimerCompactProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const diff = expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now();
      const newRemaining = Math.max(0, Math.floor(diff / 1000));
      setRemainingSeconds(newRemaining);

      if (newRemaining === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number): string => {
    if (seconds > 600) return COLORS.success;
    if (seconds > 300) return COLORS.warning;
    return COLORS.error;
  };

  const timerColor = getTimerColor(remainingSeconds);

  return (
    <View style={[styles.compactContainer, { backgroundColor: `${timerColor}15` }]}>
      <View style={[styles.compactDot, { backgroundColor: timerColor }]} />
      <Text style={[styles.compactText, { color: timerColor }]}>
        {formatTime(remainingSeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontWeight: TYPOGRAPHY.bold,
    fontVariant: ['tabular-nums'],
  },
  timeTextUrgent: {
    fontWeight: TYPOGRAPHY.extrabold,
  },
  label: {
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    fontVariant: ['tabular-nums'],
  },
});
