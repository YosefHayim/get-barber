import { supabase } from '@/services/supabase/client';

// LiveKit Configuration
const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.EXPO_PUBLIC_LIVEKIT_API_KEY || '';

// Types
export interface RoomToken {
  token: string;
  roomName: string;
  participantName: string;
  expiresAt: number;
}

export interface CallSession {
  id: string;
  roomName: string;
  type: 'video' | 'voice' | 'ai_chat';
  participants: string[];
  status: 'waiting' | 'active' | 'ended';
  startedAt?: string;
  endedAt?: string;
  duration?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context?: string;
  createdAt: string;
  updatedAt: string;
}

// Get room token from backend
export async function getRoomToken(params: {
  roomName: string;
  participantId: string;
  participantName: string;
  type: 'video' | 'voice' | 'ai';
}): Promise<RoomToken> {
  const { roomName, participantId, participantName, type } = params;

  // Call Supabase Edge Function to generate token
  const { data, error } = await supabase.functions.invoke('livekit-token', {
    body: {
      roomName,
      participantId,
      participantName,
      type,
    },
  });

  if (error) {
    throw new Error(`Failed to get room token: ${error.message}`);
  }

  return data as RoomToken;
}

// Create a new call session
export async function createCallSession(params: {
  initiatorId: string;
  recipientId: string;
  type: 'video' | 'voice';
  bookingId?: string;
}): Promise<CallSession> {
  const { initiatorId, recipientId, type, bookingId } = params;

  const roomName = `call_${initiatorId}_${recipientId}_${Date.now()}`;

  const { data, error } = await supabase
    .from('call_sessions')
    .insert({
      room_name: roomName,
      type,
      initiator_id: initiatorId,
      recipient_id: recipientId,
      booking_id: bookingId,
      status: 'waiting',
      participants: [initiatorId],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create call session: ${error.message}`);
  }

  // Send push notification to recipient
  await supabase.functions.invoke('send-call-notification', {
    body: {
      recipientId,
      initiatorId,
      roomName,
      type,
    },
  });

  return {
    id: data.id,
    roomName: data.room_name,
    type: data.type,
    participants: data.participants,
    status: data.status,
  };
}

// Join an existing call
export async function joinCall(params: {
  sessionId: string;
  participantId: string;
}): Promise<{ session: CallSession; token: RoomToken }> {
  const { sessionId, participantId } = params;

  // Get session info
  const { data: session, error: sessionError } = await supabase
    .from('call_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Call session not found');
  }

  // Update participants
  const participants = [...(session.participants || []), participantId];

  await supabase
    .from('call_sessions')
    .update({
      participants,
      status: 'active',
      started_at: session.started_at || new Date().toISOString(),
    })
    .eq('id', sessionId);

  // Get participant name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', participantId)
    .single();

  // Get token
  const token = await getRoomToken({
    roomName: session.room_name,
    participantId,
    participantName: profile?.display_name || 'User',
    type: session.type === 'video' ? 'video' : 'voice',
  });

  return {
    session: {
      id: session.id,
      roomName: session.room_name,
      type: session.type,
      participants,
      status: 'active',
      startedAt: session.started_at,
    },
    token,
  };
}

// End a call
export async function endCall(sessionId: string): Promise<void> {
  const { data: session } = await supabase
    .from('call_sessions')
    .select('started_at')
    .eq('id', sessionId)
    .single();

  const duration = session?.started_at
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
    : 0;

  await supabase
    .from('call_sessions')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
      duration,
    })
    .eq('id', sessionId);
}

// AI Chat Functions
export async function createAIConversation(userId: string, context?: string): Promise<AIConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId,
      context,
      messages: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create AI conversation: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    messages: data.messages || [],
    context: data.context,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function sendAIMessage(params: {
  conversationId: string;
  message: string;
  model?: 'claude' | 'gpt4' | 'gemini';
}): Promise<AIMessage> {
  const { conversationId, message, model = 'claude' } = params;

  // Get conversation
  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Add user message
  const userMessage: AIMessage = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };

  const messages = [...(conversation.messages || []), userMessage];

  // Call AI through Edge Function
  const { data: aiResponse, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      conversationId,
      messages,
      model,
      context: conversation.context,
    },
  });

  if (error) {
    throw new Error(`AI request failed: ${error.message}`);
  }

  const assistantMessage: AIMessage = {
    id: `msg_${Date.now()}_ai`,
    role: 'assistant',
    content: aiResponse.content,
    timestamp: new Date().toISOString(),
    model,
  };

  // Update conversation
  await supabase
    .from('ai_conversations')
    .update({
      messages: [...messages, assistantMessage],
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return assistantMessage;
}

export async function getAIConversations(userId: string): Promise<AIConversation[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return data.map((conv) => ({
    id: conv.id,
    userId: conv.user_id,
    messages: conv.messages || [],
    context: conv.context,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
  }));
}

// AI Style Recommendations
export async function getStyleRecommendation(params: {
  userId: string;
  imageUri?: string;
  preferences?: string[];
  faceShape?: string;
}): Promise<{
  recommendations: string[];
  explanation: string;
  suggestedBarbers: string[];
}> {
  const { data, error } = await supabase.functions.invoke('ai-style-recommendation', {
    body: params,
  });

  if (error) {
    throw new Error(`Style recommendation failed: ${error.message}`);
  }

  return data;
}

// Real-time AI Voice Chat (using LiveKit)
export async function startAIVoiceChat(userId: string): Promise<RoomToken> {
  const roomName = `ai_voice_${userId}_${Date.now()}`;

  // Create AI voice session
  await supabase.from('ai_voice_sessions').insert({
    user_id: userId,
    room_name: roomName,
    status: 'active',
  });

  // Get participant name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single();

  return getRoomToken({
    roomName,
    participantId: userId,
    participantName: profile?.display_name || 'User',
    type: 'ai',
  });
}

export default {
  getRoomToken,
  createCallSession,
  joinCall,
  endCall,
  createAIConversation,
  sendAIMessage,
  getAIConversations,
  getStyleRecommendation,
  startAIVoiceChat,
  LIVEKIT_URL,
};
