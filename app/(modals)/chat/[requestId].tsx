import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Phone, MoreVertical } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { MessageList } from '@/features/chat/components/MessageList';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { useChatMessages } from '@/features/chat/hooks/useChatMessages';
import { useSendMessage, useSendOffer } from '@/features/chat/hooks/useSendMessage';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { ChatParticipant } from '@/features/chat/types/chat.types';

export default function ChatScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { user } = useAuth();

  const { data: messages = [], isLoading } = useChatMessages(requestId ?? '');
  const sendMessage = useSendMessage();
  const sendOffer = useSendOffer();

  const participants = useMemo<Record<string, ChatParticipant>>(() => {
    return {
      [user?.id ?? '']: {
        id: user?.id ?? '',
        display_name: user?.email?.split('@')[0] ?? 'You',
        avatar_url: null,
        user_type: 'customer',
      },
      'barber-demo': {
        id: 'barber-demo',
        display_name: 'Demo Barber',
        avatar_url: null,
        user_type: 'barber',
      },
    };
  }, [user]);

  const handleSendMessage = useCallback((content: string) => {
    if (!requestId || !user) return;
    
    sendMessage.mutate({
      requestId,
      senderId: user.id,
      senderType: 'customer',
      content,
    });
  }, [requestId, user, sendMessage]);

  const handleSendOffer = useCallback((amount: number) => {
    if (!requestId || !user) return;
    
    sendOffer.mutate({
      requestId,
      senderId: user.id,
      senderType: 'customer',
      amount,
    });
  }, [requestId, user, sendOffer]);

  const handleAcceptOffer = useCallback((messageId: string) => {
    console.log('Accept offer:', messageId);
  }, []);

  const handleRejectOffer = useCallback((messageId: string) => {
    console.log('Reject offer:', messageId);
  }, []);

  const handleCounterOffer = useCallback((messageId: string) => {
    console.log('Counter offer:', messageId);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color="#111827" />
        </Pressable>
        
        <Pressable style={styles.headerProfile}>
          <Avatar uri={null} name="Demo Barber" size={40} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Demo Barber</Text>
            <Text style={styles.headerStatus}>Negotiating price</Text>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Phone size={20} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MoreVertical size={20} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <MessageList
          messages={messages}
          currentUserId={user?.id ?? ''}
          participants={participants}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={handleRejectOffer}
          onCounterOffer={handleCounterOffer}
          isLoading={isLoading}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          onSendOffer={handleSendOffer}
          isDisabled={sendMessage.isPending || sendOffer.isPending}
          placeholder="Negotiate the price..."
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    gap: 12,
    marginLeft: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
});
