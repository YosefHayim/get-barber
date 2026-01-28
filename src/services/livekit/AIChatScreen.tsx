import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Mic, Sparkles, Bot, User, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useAIChat, useAIVoiceChat } from './useLiveKit';
import type { AIMessage } from './index';

interface AIChatScreenProps {
  context?: string;
  onClose?: () => void;
}

const MODEL_OPTIONS = [
  { id: 'claude', name: 'Claude', icon: '🧠' },
  { id: 'gpt4', name: 'GPT-4', icon: '🤖' },
  { id: 'gemini', name: 'Gemini', icon: '✨' },
] as const;

export function AIChatScreen({ context, onClose }: AIChatScreenProps) {
  const {
    activeConversation,
    isTyping,
    isSending,
    startNewConversation,
    sendMessage,
  } = useAIChat();

  const { startVoiceChat, isConnecting: isVoiceConnecting, isActive: isVoiceActive } = useAIVoiceChat();

  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<'claude' | 'gpt4' | 'gemini'>('claude');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Start new conversation if none exists
  useEffect(() => {
    if (!activeConversation) {
      startNewConversation(context);
    }
  }, [activeConversation, context, startNewConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeConversation?.messages.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeConversation?.messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim(), selectedModel);
    setInputText('');
  };

  const handleVoiceChat = async () => {
    await startVoiceChat();
  };

  const renderMessage = ({ item, index }: { item: AIMessage; index: number }) => {
    const isUser = item.role === 'user';
    const isSystem = item.role === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(300)}
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}
      >
        <View style={[styles.messageAvatar, isUser ? styles.userAvatar : styles.aiAvatar]}>
          {isUser ? (
            <User size={16} color="#FFFFFF" />
          ) : (
            <Bot size={16} color="#FFFFFF" />
          )}
        </View>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>
          {item.model && (
            <Text style={styles.modelTag}>{item.model}</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={[styles.messageAvatar, styles.aiAvatar]}>
          <Bot size={16} color="#FFFFFF" />
        </View>
        <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <Sparkles size={20} color={DARK_COLORS.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Style Assistant</Text>
              <Text style={styles.headerSubtitle}>Ask me anything about haircuts</Text>
            </View>
          </View>

          {/* Model Picker */}
          <TouchableOpacity
            style={styles.modelPicker}
            onPress={() => setShowModelPicker(!showModelPicker)}
          >
            <Text style={styles.modelPickerText}>
              {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.icon}{' '}
              {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.name}
            </Text>
            <ChevronDown size={16} color={DARK_COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Model Dropdown */}
        {showModelPicker && (
          <View style={styles.modelDropdown}>
            {MODEL_OPTIONS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  selectedModel === model.id && styles.modelOptionSelected,
                ]}
                onPress={() => {
                  setSelectedModel(model.id);
                  setShowModelPicker(false);
                }}
              >
                <Text style={styles.modelOptionText}>
                  {model.icon} {model.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={activeConversation?.messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Suggestions */}
        {(!activeConversation?.messages.length || activeConversation.messages.length < 2) && (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Try asking:</Text>
            <View style={styles.suggestionChips}>
              {[
                'What haircut suits a round face?',
                'How to maintain a fade?',
                'Best beard styles for my face',
                'Trending hairstyles 2024',
              ].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setInputText(suggestion);
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceChat}
            disabled={isVoiceConnecting}
          >
            {isVoiceConnecting ? (
              <ActivityIndicator size="small" color={DARK_COLORS.primary} />
            ) : (
              <Mic
                size={20}
                color={isVoiceActive ? DARK_COLORS.error : DARK_COLORS.textMuted}
              />
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about haircuts, styles, grooming..."
            placeholderTextColor={DARK_COLORS.textMuted}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
  },
  modelPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  modelPickerText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  modelDropdown: {
    position: 'absolute',
    top: 80,
    right: SPACING.lg,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modelOption: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  modelOptionSelected: {
    backgroundColor: DARK_COLORS.primaryMuted,
  },
  modelOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  messagesList: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    flexDirection: 'row',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: DARK_COLORS.primary,
  },
  aiAvatar: {
    backgroundColor: DARK_COLORS.success,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    backgroundColor: DARK_COLORS.primary,
    borderBottomRightRadius: RADIUS.xs,
  },
  aiBubble: {
    backgroundColor: DARK_COLORS.surface,
    borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: DARK_COLORS.textPrimary,
  },
  modelTag: {
    fontSize: 10,
    color: DARK_COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  systemMessageText: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
    backgroundColor: DARK_COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  typingBubble: {
    paddingVertical: SPACING.lg,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK_COLORS.textMuted,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  suggestions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: DARK_COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: DARK_COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
    backgroundColor: DARK_COLORS.surface,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: DARK_COLORS.surfaceLight,
  },
});

export default AIChatScreen;
