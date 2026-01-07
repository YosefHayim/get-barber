import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  CheckCheck,
  Clock,
  XCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import {
  MOCK_CONVERSATIONS_CUSTOMER,
  MOCK_CONVERSATIONS_BARBER,
  type MockConversation,
} from '@/constants/mockData';

function getStatusIcon(status: MockConversation['status']) {
  switch (status) {
    case 'negotiating':
      return <Clock size={14} color={COLORS.warning} />;
    case 'confirmed':
      return <CheckCircle2 size={14} color={COLORS.success} />;
    case 'completed':
      return <CheckCheck size={14} color={COLORS.textMuted} />;
    case 'cancelled':
      return <XCircle size={14} color={COLORS.error} />;
    default:
      return null;
  }
}

function getStatusLabel(status: MockConversation['status']): string {
  switch (status) {
    case 'negotiating':
      return 'Negotiating';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return '';
  }
}

function getStatusColor(status: MockConversation['status']): string {
  switch (status) {
    case 'negotiating':
      return COLORS.warning;
    case 'confirmed':
      return COLORS.success;
    case 'completed':
      return COLORS.textMuted;
    case 'cancelled':
      return COLORS.error;
    default:
      return COLORS.textMuted;
  }
}

interface ConversationCardProps {
  conversation: MockConversation;
  onPress: () => void;
}

function ConversationCard({ conversation, onPress }: ConversationCardProps): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.conversationCard}>
      <View style={styles.avatarContainer}>
        <Avatar
          uri={conversation.participantAvatar}
          name={conversation.participantName}
          size={56}
        />
        {conversation.status === 'confirmed' && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {conversation.participantName}
          </Text>
          <Text style={styles.timeText}>
            {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: false })}
          </Text>
        </View>

        <View style={styles.servicesRow}>
          {conversation.serviceNames.slice(0, 2).map((service, index) => (
            <View key={service} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
          {conversation.serviceNames.length > 2 && (
            <Text style={styles.moreServices}>
              +{conversation.serviceNames.length - 2}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
        </View>

        <View style={styles.statusRow}>
          {getStatusIcon(conversation.status)}
          <Text style={[styles.statusText, { color: getStatusColor(conversation.status) }]}>
            {getStatusLabel(conversation.status)}
          </Text>
          {conversation.offeredPrice && (
            <>
              <View style={styles.priceDot} />
              <Sparkles size={12} color={COLORS.gold} />
              <Text style={styles.priceText}>₪{conversation.offeredPrice}</Text>
            </>
          )}
        </View>
      </View>

      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function MessagesScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const userMode = useAppStore((s) => s.userMode);

  const conversations = userMode === 'barber'
    ? MOCK_CONVERSATIONS_BARBER
    : MOCK_CONVERSATIONS_CUSTOMER;

  const handleConversationPress = useCallback((conversationId: string) => {
    router.push(`/(modals)/chat/${conversationId}`);
  }, []);

  const renderConversation = useCallback(
    ({ item }: { item: MockConversation }) => (
      <ConversationCard
        conversation={item}
        onPress={() => handleConversationPress(item.id)}
      />
    ),
    [handleConversationPress]
  );

  const keyExtractor = useCallback((item: MockConversation) => item.id, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnread} new</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          {userMode === 'barber' ? 'Customer conversations' : 'Chat with barbers'}
        </Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MessageCircle size={48} color={COLORS.gold} />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            {userMode === 'barber'
              ? 'Accept requests to start chatting with customers'
              : 'Start a booking to chat with barbers about pricing'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={keyExtractor}
          estimatedItemSize={140}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  headerBadge: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.full,
  },
  headerBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.goldDark,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  listContent: {
    padding: SPACING.lg,
  },
  separator: {
    height: SPACING.md,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  conversationContent: {
    flex: 1,
    marginLeft: SPACING.md,
    gap: SPACING.xs,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  timeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  servicesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  serviceTagText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.goldDark,
  },
  moreServices: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
  },
  priceDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.xxs,
  },
  priceText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.goldDark,
  },
  unreadBadge: {
    backgroundColor: COLORS.gold,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    alignSelf: 'center',
  },
  unreadText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.charcoal,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
