import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { DollarSign, Clock, Check, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import type { OfferStatus } from '../types/chat.types';

interface OfferBubbleProps {
  amount: number;
  status: OfferStatus;
  expiresAt: string | null;
  isOwn: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
}

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: '#D97706', bgColor: '#FEF3C7' },
  accepted: { label: 'Accepted', color: '#059669', bgColor: '#D1FAE5' },
  rejected: { label: 'Rejected', color: '#DC2626', bgColor: '#FEE2E2' },
  countered: { label: 'Countered', color: '#7C3AED', bgColor: '#EDE9FE' },
  expired: { label: 'Expired', color: '#6B7280', bgColor: '#F3F4F6' },
};

export function OfferBubble({
  amount,
  status,
  expiresAt,
  isOwn,
  onAccept,
  onReject,
  onCounter,
}: OfferBubbleProps): React.JSX.Element {
  const pulseScale = useSharedValue(1);

  const statusConfig = STATUS_CONFIG[status];
  const isPending = status === 'pending';
  const canRespond = isPending && !isOwn;

  React.useEffect(() => {
    if (isPending) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 10 }),
          withSpring(1, { damping: 10 })
        ),
        -1,
        true
      );
    }
  }, [isPending, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const timeRemaining = useMemo(() => {
    if (!expiresAt || status !== 'pending') return null;
    
    const expires = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffMs = expires - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [expiresAt, status]);

  return (
    <Animated.View style={[animatedStyle, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <Surface
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
        elevation={2}
      >
        <View style={styles.header}>
          <DollarSign size={16} color="#3B82F6" />
          <Text style={styles.offerLabel}>Price Offer</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>ILS</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>

        {timeRemaining && isPending && (
          <View style={styles.timerRow}>
            <Clock size={12} color="#9CA3AF" />
            <Text style={styles.timerText}>Expires in {timeRemaining}</Text>
          </View>
        )}

        {canRespond && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={onAccept}
              icon={() => <Check size={16} color="#FFFFFF" />}
              compact
              style={[styles.actionButton, styles.acceptButton]}
              labelStyle={styles.buttonLabel}
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={onCounter}
              compact
              style={styles.actionButton}
              labelStyle={styles.counterLabel}
            >
              Counter
            </Button>
            <Pressable onPress={onReject} style={styles.rejectButton}>
              <X size={18} color="#DC2626" />
            </Pressable>
          </View>
        )}

        {status === 'accepted' && (
          <View style={styles.acceptedBanner}>
            <Check size={14} color="#059669" />
            <Text style={styles.acceptedText}>Offer accepted! Booking confirmed.</Text>
          </View>
        )}
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ownContainer: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  bubble: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  offerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  currency: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
  },
  timerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  buttonLabel: {
    fontSize: 13,
  },
  counterLabel: {
    fontSize: 13,
    color: '#3B82F6',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  acceptedText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
});
