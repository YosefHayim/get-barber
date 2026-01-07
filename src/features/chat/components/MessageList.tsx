import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { OfferBubble } from './OfferBubble';
import type { ChatMessage, ChatParticipant, MessageType } from '../types/chat.types';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  participants: Record<string, ChatParticipant>;
  onAcceptOffer?: (messageId: string) => void;
  onRejectOffer?: (messageId: string) => void;
  onCounterOffer?: (messageId: string) => void;
  isLoading?: boolean;
}

type MessageItem = ChatMessage & { itemType: 'message' };

const ITEM_TYPES = {
  text: 'text',
  offer: 'offer',
  counter_offer: 'counter_offer',
  system: 'system',
  image: 'image',
} as const;

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
    <View style={[styles.messageRow, isOwn && styles.ownMessageRow]}>
      {!isOwn && (
        <Avatar
          uri={senderAvatar}
          name={senderName}
          size={32}
        />
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
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}

function SystemMessage({ content }: { content: string }): React.JSX.Element {
  return (
    <View style={styles.systemMessageContainer}>
      <Text style={styles.systemText}>{content}</Text>
    </View>
  );
}

function ImageBubble({
  imageUrl,
  isOwn,
  timestamp,
}: {
  imageUrl: string;
  isOwn: boolean;
  timestamp: string;
}): React.JSX.Element {
  return (
    <View style={[styles.messageRow, isOwn && styles.ownMessageRow]}>
      <View style={[styles.bubbleContainer, isOwn && styles.ownBubbleContainer]}>
        <Surface
          style={[styles.imageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}
          elevation={1}
        >
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Image</Text>
          </View>
        </Surface>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}

export function MessageList({
  messages,
  currentUserId,
  participants,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  isLoading = false,
}: MessageListProps): React.JSX.Element {
  const getItemType = useCallback((item: MessageItem): string => {
    return ITEM_TYPES[item.message_type] ?? ITEM_TYPES.text;
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MessageItem>) => {
      const isOwn = item.sender_id === currentUserId;
      const sender = participants[item.sender_id];
      const senderName = sender?.display_name ?? 'Unknown';
      const senderAvatar = sender?.avatar_url ?? null;

      switch (item.message_type) {
        case 'text':
          return (
            <TextBubble
              content={item.content ?? ''}
              isOwn={isOwn}
              timestamp={item.created_at}
              senderName={senderName}
              senderAvatar={senderAvatar}
            />
          );

        case 'offer':
        case 'counter_offer':
          return (
            <View style={styles.offerContainer}>
              <OfferBubble
                amount={item.offer_amount ?? 0}
                status={item.offer_status ?? 'pending'}
                expiresAt={item.offer_expires_at}
                isOwn={isOwn}
                onAccept={() => onAcceptOffer?.(item.id)}
                onReject={() => onRejectOffer?.(item.id)}
                onCounter={() => onCounterOffer?.(item.id)}
              />
              <Text style={[styles.timestamp, styles.offerTimestamp]}>
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </Text>
            </View>
          );

        case 'system':
          return <SystemMessage content={item.content ?? ''} />;

        case 'image':
          return (
            <ImageBubble
              imageUrl={item.image_url ?? ''}
              isOwn={isOwn}
              timestamp={item.created_at}
            />
          );

        default:
          return null;
      }
    },
    [currentUserId, participants, onAcceptOffer, onRejectOffer, onCounterOffer]
  );

  const keyExtractor = useCallback((item: MessageItem) => item.id, []);

  const data = useMemo(
    () => messages.map((msg) => ({ ...msg, itemType: 'message' as const })),
    [messages]
  );

  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        estimatedItemSize={80}
        inverted
        contentContainerStyle={styles.listContent}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 8,
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#111827',
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 4,
  },
  offerContainer: {
    marginVertical: 8,
  },
  offerTimestamp: {
    textAlign: 'center',
    marginTop: 8,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 24,
  },
  systemText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageBubble: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
