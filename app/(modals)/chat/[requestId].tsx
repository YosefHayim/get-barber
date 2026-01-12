import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TextInput, Keyboard, FlatList } from 'react-native';
import { Text, Surface, IconButton, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  Phone,
  MoreVertical,
  Send,
  DollarSign,
  Camera,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeOut,
} from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown } from '@/utils/animations';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

// Light theme colors for the chat screen
const LIGHT_THEME = {
  background: '#f6f6f8',
  surface: '#ffffff',
  primary: '#135bec',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  // Chat bubble colors
  bubbleOwn: '#135bec',
  bubbleOther: '#ffffff',
  // Status colors from COLORS
  success: COLORS.success,
  successLight: COLORS.successLight,
  warning: COLORS.warning,
  warningLight: COLORS.warningLight,
  error: COLORS.error,
  errorLight: COLORS.errorLight,
  // Accent colors
  accent: '#135bec',
  accentDark: '#0d4abf',
  primaryMuted: 'rgba(19, 91, 236, 0.1)',
  borderLight: '#f1f5f9',
};
import { useAppStore } from '@/stores/useAppStore';
import {
  MOCK_CONVERSATIONS_CUSTOMER,
  MOCK_CONVERSATIONS_BARBER,
  MOCK_MESSAGES,
  type MockMessage,
  type MockConversation,
} from '@/constants/mockData';

type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

function TextBubble({
  content,
  isOwn,
  timestamp,
  senderName,
  senderAvatar,
}: {
  content: string;
  isOwn: boolean;
  timestamp: string;
  senderName: string;
  senderAvatar: string | null;
}): React.JSX.Element {
  return (
    <Animated.View
      entering={webSafeFadeInDown(0, 200)}
      style={[styles.messageRow, isOwn && styles.ownMessageRow]}
    >
      {!isOwn && (
        <Avatar uri={senderAvatar} name={senderName} size={32} />
      )}
      <View style={[styles.bubbleContainer, isOwn && styles.ownBubbleContainer]}>
        <Surface
          style={[styles.textBubble, isOwn ? styles.ownBubble : styles.otherBubble]}
          elevation={1}
        >
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {content}
          </Text>
        </Surface>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </Text>
          {isOwn && <CheckCheck size={12} color={LIGHT_THEME.textMuted} />}
        </View>
      </View>
    </Animated.View>
  );
}

function OfferBubble({
  amount,
  status,
  isOwn,
  timestamp,
  onAccept,
  onReject,
  onCounter,
}: {
  amount: number;
  status: OfferStatus;
  isOwn: boolean;
  timestamp: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
}): React.JSX.Element {
  const statusConfig = {
    pending: { label: 'Pending', color: LIGHT_THEME.warning, bgColor: LIGHT_THEME.warningLight },
    accepted: { label: 'Accepted', color: LIGHT_THEME.success, bgColor: LIGHT_THEME.successLight },
    rejected: { label: 'Rejected', color: LIGHT_THEME.error, bgColor: LIGHT_THEME.errorLight },
    expired: { label: 'Expired', color: LIGHT_THEME.textMuted, bgColor: LIGHT_THEME.borderLight },
  };

  const config = statusConfig[status];
  const canRespond = status === 'pending' && !isOwn;

  return (
    <Animated.View
      entering={webSafeFadeInDown(0, 200)}
      style={[styles.offerRow, isOwn && styles.ownOfferRow]}
    >
      <Surface style={styles.offerBubble} elevation={2}>
        <View style={styles.offerHeader}>
          <Sparkles size={16} color={LIGHT_THEME.accent} />
          <Text style={styles.offerLabel}>Price Offer</Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.offerAmountContainer}>
          <Text style={styles.offerCurrency}>₪</Text>
          <Text style={styles.offerAmount}>{amount}</Text>
        </View>

        {canRespond && (
          <View style={styles.offerActions}>
            <Button
              mode="contained"
              onPress={onAccept}
              icon={() => <Check size={16} color="#ffffff" />}
              compact
              style={[styles.offerButton, { backgroundColor: LIGHT_THEME.success }]}
              labelStyle={styles.offerButtonLabel}
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={onCounter}
              compact
              style={styles.offerButton}
              labelStyle={styles.counterButtonLabel}
            >
              Counter
            </Button>
            <Pressable onPress={onReject} style={styles.rejectButton}>
              <X size={18} color={LIGHT_THEME.error} />
            </Pressable>
          </View>
        )}

        {status === 'accepted' && (
          <View style={styles.acceptedBanner}>
            <Check size={14} color={LIGHT_THEME.success} />
            <Text style={styles.acceptedText}>Booking confirmed!</Text>
          </View>
        )}

        <Text style={styles.offerTimestamp}>
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </Text>
      </Surface>
    </Animated.View>
  );
}

function SystemMessage({ content }: { content: string }): React.JSX.Element {
  return (
    <Animated.View entering={webSafeFadeIn(200)} style={styles.systemContainer}>
      <Text style={styles.systemText}>{content}</Text>
    </Animated.View>
  );
}

function ChatInputComponent({
  onSendMessage,
  onSendOffer,
  isDisabled,
}: {
  onSendMessage: (content: string) => void;
  onSendOffer: (amount: number) => void;
  isDisabled: boolean;
}): React.JSX.Element {
  const [message, setMessage] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const sendButtonScale = useSharedValue(1);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    sendButtonScale.value = withSpring(0.9, {}, () => {
      sendButtonScale.value = withSpring(1);
    });

    onSendMessage(trimmedMessage);
    setMessage('');
    Keyboard.dismiss();
  }, [message, onSendMessage, sendButtonScale]);

  const handleSendOffer = useCallback(() => {
    const amount = parseInt(offerAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    sendButtonScale.value = withSpring(0.9, {}, () => {
      sendButtonScale.value = withSpring(1);
    });

    onSendOffer(amount);
    setOfferAmount('');
    setShowOfferInput(false);
    Keyboard.dismiss();
  }, [offerAmount, onSendOffer, sendButtonScale]);

  const toggleOfferInput = useCallback(() => {
    setShowOfferInput((prev) => !prev);
    setOfferAmount('');
  }, []);

  const canSend = showOfferInput
    ? offerAmount.trim().length > 0 && !isNaN(parseInt(offerAmount, 10))
    : message.trim().length > 0;

  return (
    <View style={styles.inputContainer}>
      {showOfferInput && (
        <Animated.View
          entering={webSafeFadeIn(200)}
          exiting={FadeOut.duration(200)}
          style={styles.offerInputContainer}
        >
          <View style={styles.offerInputHeader}>
            <Sparkles size={16} color={LIGHT_THEME.accent} />
            <Text style={styles.offerInputLabel}>Send Price Offer</Text>
            <Pressable onPress={toggleOfferInput}>
              <X size={18} color={LIGHT_THEME.textMuted} />
            </Pressable>
          </View>
          <View style={styles.offerInputRow}>
            <Text style={styles.offerInputCurrency}>₪</Text>
            <TextInput
              style={styles.offerInputField}
              value={offerAmount}
              onChangeText={setOfferAmount}
              placeholder="0"
              placeholderTextColor={LIGHT_THEME.textMuted}
              keyboardType="numeric"
              maxLength={6}
              editable={!isDisabled}
              autoFocus
            />
          </View>
        </Animated.View>
      )}

      <View style={styles.inputRow}>
        <View style={styles.inputActions}>
          <IconButton
            icon={() => <Camera size={22} color={LIGHT_THEME.textMuted} />}
            onPress={() => {}}
            disabled={isDisabled}
            size={22}
          />
          <IconButton
            icon={() => (
              <DollarSign
                size={22}
                color={showOfferInput ? LIGHT_THEME.accent : LIGHT_THEME.textMuted}
              />
            )}
            onPress={toggleOfferInput}
            disabled={isDisabled}
            size={22}
          />
        </View>

        {!showOfferInput && (
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={LIGHT_THEME.textMuted}
            multiline
            maxLength={1000}
            editable={!isDisabled}
          />
        )}

        <Animated.View style={sendButtonStyle}>
          <Pressable
            onPress={showOfferInput ? handleSendOffer : handleSend}
            disabled={!canSend || isDisabled}
            style={[
              styles.sendButton,
              canSend && !isDisabled && styles.sendButtonActive,
            ]}
          >
            <Send
              size={20}
              color={canSend && !isDisabled ? '#ffffff' : LIGHT_THEME.textMuted}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

export default function ChatScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const userMode = useAppStore((s) => s.userMode);
  const [messages, setMessages] = useState<MockMessage[]>([]);

  const conversations = userMode === 'barber'
    ? MOCK_CONVERSATIONS_BARBER
    : MOCK_CONVERSATIONS_CUSTOMER;

  const conversation = useMemo(
    () => conversations.find((c) => c.id === requestId),
    [conversations, requestId]
  );

  useEffect(() => {
    const mockMessages = MOCK_MESSAGES[requestId ?? ''] ?? [];
    setMessages([...mockMessages].reverse());
  }, [requestId]);

  const handleSendMessage = useCallback((content: string) => {
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      conversationId: requestId ?? '',
      senderId: 'current-user',
      senderType: userMode === 'barber' ? 'barber' : 'customer',
      content,
      messageType: 'text',
      offerAmount: null,
      offerStatus: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMessage, ...prev]);
  }, [requestId, userMode]);

  const handleSendOffer = useCallback((amount: number) => {
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      conversationId: requestId ?? '',
      senderId: 'current-user',
      senderType: userMode === 'barber' ? 'barber' : 'customer',
      content: null,
      messageType: 'offer',
      offerAmount: amount,
      offerStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMessage, ...prev]);
  }, [requestId, userMode]);

  const handleAcceptOffer = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, offerStatus: 'accepted' as const } : msg
      )
    );
  }, []);

  const handleRejectOffer = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, offerStatus: 'rejected' as const } : msg
      )
    );
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: MockMessage }) => {
      const isOwn = item.senderId === 'current-user';

      switch (item.messageType) {
        case 'text':
          return (
            <TextBubble
              content={item.content ?? ''}
              isOwn={isOwn}
              timestamp={item.createdAt}
              senderName={conversation?.participantName ?? 'Unknown'}
              senderAvatar={conversation?.participantAvatar ?? null}
            />
          );

        case 'offer':
        case 'counter_offer':
          return (
            <OfferBubble
              amount={item.offerAmount ?? 0}
              status={item.offerStatus ?? 'pending'}
              isOwn={isOwn}
              timestamp={item.createdAt}
              onAccept={() => handleAcceptOffer(item.id)}
              onReject={() => handleRejectOffer(item.id)}
              onCounter={() => {}}
            />
          );

        case 'system':
          return <SystemMessage content={item.content ?? ''} />;

        default:
          return null;
      }
    },
    [conversation, handleAcceptOffer, handleRejectOffer]
  );

  const keyExtractor = useCallback((item: MockMessage) => item.id, []);

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={LIGHT_THEME.textPrimary} />
          </Pressable>
          <Text style={styles.headerName}>Conversation not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={LIGHT_THEME.textPrimary} />
        </Pressable>

        <Pressable style={styles.headerProfile}>
          <Avatar
            uri={conversation.participantAvatar}
            name={conversation.participantName}
            size={44}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{conversation.participantName}</Text>
            <View style={styles.headerStatusRow}>
              {conversation.status === 'negotiating' && (
                <>
                  <Clock size={12} color={LIGHT_THEME.warning} />
                  <Text style={[styles.headerStatus, { color: LIGHT_THEME.warning }]}>
                    Negotiating price
                  </Text>
                </>
              )}
              {conversation.status === 'confirmed' && (
                <>
                  <Check size={12} color={LIGHT_THEME.success} />
                  <Text style={[styles.headerStatus, { color: LIGHT_THEME.success }]}>
                    Booking confirmed
                  </Text>
                </>
              )}
              {conversation.status === 'completed' && (
                <Text style={[styles.headerStatus, { color: LIGHT_THEME.textMuted }]}>
                  Completed
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Phone size={20} color={LIGHT_THEME.textSecondary} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MoreVertical size={20} color={LIGHT_THEME.textSecondary} />
          </Pressable>
        </View>
      </View>

      {conversation.offeredPrice && (
        <View style={styles.priceBar}>
          <Sparkles size={14} color={LIGHT_THEME.accent} />
          <Text style={styles.priceBarText}>
            Agreed price: <Text style={styles.priceBarAmount}>₪{conversation.offeredPrice}</Text>
          </Text>
          <Text style={styles.priceBarServices}>
            {conversation.serviceNames.join(' + ')}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.listContainer}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <ChatInputComponent
          onSendMessage={handleSendMessage}
          onSendOffer={handleSendOffer}
          isDisabled={false}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginLeft: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_THEME.textPrimary,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: 2,
  },
  headerStatus: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xxs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: LIGHT_THEME.primaryMuted,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  priceBarText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textSecondary,
  },
  priceBarAmount: {
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_THEME.accent,
  },
  priceBarServices: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textMuted,
    marginLeft: 'auto',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  ownMessageRow: {
    flexDirection: 'row-reverse',
  },
  bubbleContainer: {
    maxWidth: '75%',
  },
  ownBubbleContainer: {
    alignItems: 'flex-end',
  },
  textBubble: {
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  ownBubble: {
    backgroundColor: LIGHT_THEME.bubbleOwn,
    borderBottomRightRadius: SPACING.xxs,
  },
  otherBubble: {
    backgroundColor: LIGHT_THEME.bubbleOther,
    borderBottomLeftRadius: SPACING.xxs,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  messageText: {
    fontSize: TYPOGRAPHY.base,
    lineHeight: 22,
    color: LIGHT_THEME.textPrimary,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
    marginHorizontal: SPACING.xxs,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textMuted,
  },
  offerRow: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    marginVertical: SPACING.sm,
  },
  ownOfferRow: {
    alignSelf: 'flex-end',
  },
  offerBubble: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: LIGHT_THEME.surface,
    borderWidth: 1,
    borderColor: LIGHT_THEME.primaryMuted,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  offerLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_THEME.textSecondary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
  offerAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: SPACING.xxs,
    marginBottom: SPACING.sm,
  },
  offerCurrency: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_THEME.textMuted,
  },
  offerAmount: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_THEME.textPrimary,
  },
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  offerButton: {
    flex: 1,
    borderRadius: RADIUS.sm,
  },
  offerButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
  },
  counterButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.accent,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: LIGHT_THEME.errorLight,
    backgroundColor: LIGHT_THEME.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: LIGHT_THEME.successLight,
  },
  acceptedText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.success,
    fontWeight: TYPOGRAPHY.medium,
  },
  offerTimestamp: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  systemText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textMuted,
    textAlign: 'center',
    backgroundColor: LIGHT_THEME.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  inputContainer: {
    backgroundColor: LIGHT_THEME.surface,
    borderTopWidth: 1,
    borderTopColor: LIGHT_THEME.border,
    paddingBottom: 34,
  },
  offerInputContainer: {
    padding: SPACING.lg,
    backgroundColor: LIGHT_THEME.primaryMuted,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  offerInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  offerInputLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_THEME.textSecondary,
  },
  offerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  offerInputCurrency: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_THEME.textMuted,
  },
  offerInputField: {
    fontSize: 44,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_THEME.textPrimary,
    minWidth: 120,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.xxs,
  },
  inputActions: {
    flexDirection: 'row',
  },
  textInput: {
    flex: 1,
    backgroundColor: LIGHT_THEME.borderLight,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: LIGHT_THEME.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_THEME.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: LIGHT_THEME.primary,
  },
});
