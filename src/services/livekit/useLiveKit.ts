import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  createCallSession,
  joinCall,
  endCall,
  createAIConversation,
  sendAIMessage,
  getAIConversations,
  getStyleRecommendation,
  startAIVoiceChat,
  type CallSession,
  type RoomToken,
  type AIConversation,
  type AIMessage,
} from './index';

// Hook for video/voice calls
export function useCall() {
  const { user, profile } = useAuth();
  const [activeSession, setActiveSession] = useState<CallSession | null>(null);
  const [roomToken, setRoomToken] = useState<RoomToken | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startCall = useCallback(
    async (recipientId: string, type: 'video' | 'voice', bookingId?: string) => {
      if (!user?.id) {
        Alert.alert('Error', 'You must be logged in to make calls');
        return;
      }

      setIsConnecting(true);
      try {
        const session = await createCallSession({
          initiatorId: user.id,
          recipientId,
          type,
          bookingId,
        });

        setActiveSession(session);

        // Get token for initiator
        const { token } = await joinCall({
          sessionId: session.id,
          participantId: user.id,
        });

        setRoomToken(token);
        return session;
      } catch (error) {
        console.error('Failed to start call:', error);
        Alert.alert('Error', 'Failed to start call. Please try again.');
        throw error;
      } finally {
        setIsConnecting(false);
      }
    },
    [user?.id]
  );

  const answerCall = useCallback(
    async (sessionId: string) => {
      if (!user?.id) {
        Alert.alert('Error', 'You must be logged in to answer calls');
        return;
      }

      setIsConnecting(true);
      try {
        const { session, token } = await joinCall({
          sessionId,
          participantId: user.id,
        });

        setActiveSession(session);
        setRoomToken(token);
        return session;
      } catch (error) {
        console.error('Failed to answer call:', error);
        Alert.alert('Error', 'Failed to answer call. Please try again.');
        throw error;
      } finally {
        setIsConnecting(false);
      }
    },
    [user?.id]
  );

  const hangUp = useCallback(async () => {
    if (activeSession) {
      try {
        await endCall(activeSession.id);
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }
    setActiveSession(null);
    setRoomToken(null);
  }, [activeSession]);

  return {
    activeSession,
    roomToken,
    isConnecting,
    isInCall: !!activeSession && !!roomToken,
    startCall,
    answerCall,
    hangUp,
  };
}

// Hook for AI chat
export function useAIChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch all conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useQuery<AIConversation[]>({
    queryKey: ['ai-conversations', user?.id],
    queryFn: () => getAIConversations(user!.id),
    enabled: !!user?.id,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: (context?: string) => createAIConversation(user!.id, context),
    onSuccess: (conversation) => {
      setActiveConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ['ai-conversations', user?.id] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create conversation');
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: (params: { message: string; model?: 'claude' | 'gpt4' | 'gemini' }) => {
      if (!activeConversation) throw new Error('No active conversation');
      return sendAIMessage({
        conversationId: activeConversation.id,
        ...params,
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (response) => {
      if (activeConversation) {
        setActiveConversation({
          ...activeConversation,
          messages: [
            ...activeConversation.messages,
            {
              id: `user_${Date.now()}`,
              role: 'user',
              content: '', // Will be updated
              timestamp: new Date().toISOString(),
            },
            response,
          ],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['ai-conversations', user?.id] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to send message');
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const startNewConversation = useCallback(
    (context?: string) => {
      createConversationMutation.mutate(context);
    },
    [createConversationMutation]
  );

  const sendMessage = useCallback(
    (message: string, model?: 'claude' | 'gpt4' | 'gemini') => {
      // Add user message to local state immediately
      if (activeConversation) {
        const userMessage: AIMessage = {
          id: `user_${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        };
        setActiveConversation({
          ...activeConversation,
          messages: [...activeConversation.messages, userMessage],
        });
      }
      sendMessageMutation.mutate({ message, model });
    },
    [activeConversation, sendMessageMutation]
  );

  const selectConversation = useCallback((conversation: AIConversation) => {
    setActiveConversation(conversation);
  }, []);

  return {
    conversations,
    activeConversation,
    isLoadingConversations,
    isTyping,
    isSending: sendMessageMutation.isPending,
    startNewConversation,
    sendMessage,
    selectConversation,
    refetchConversations,
  };
}

// Hook for AI style recommendations
export function useStyleRecommendation() {
  const { user } = useAuth();

  const recommendationMutation = useMutation({
    mutationFn: (params: { imageUri?: string; preferences?: string[]; faceShape?: string }) =>
      getStyleRecommendation({
        userId: user!.id,
        ...params,
      }),
    onError: () => {
      Alert.alert('Error', 'Failed to get style recommendations');
    },
  });

  return {
    getRecommendation: recommendationMutation.mutate,
    recommendations: recommendationMutation.data,
    isLoading: recommendationMutation.isPending,
    error: recommendationMutation.error,
  };
}

// Hook for AI voice chat
export function useAIVoiceChat() {
  const { user } = useAuth();
  const [roomToken, setRoomToken] = useState<RoomToken | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const startVoiceChat = useCallback(async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setIsConnecting(true);
    try {
      const token = await startAIVoiceChat(user.id);
      setRoomToken(token);
      setIsActive(true);
      return token;
    } catch (error) {
      console.error('Failed to start AI voice chat:', error);
      Alert.alert('Error', 'Failed to start voice chat');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [user?.id]);

  const endVoiceChat = useCallback(() => {
    setRoomToken(null);
    setIsActive(false);
  }, []);

  return {
    roomToken,
    isConnecting,
    isActive,
    startVoiceChat,
    endVoiceChat,
  };
}

export default {
  useCall,
  useAIChat,
  useStyleRecommendation,
  useAIVoiceChat,
};
