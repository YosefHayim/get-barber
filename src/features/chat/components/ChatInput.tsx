import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, Pressable, Keyboard } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Send, DollarSign, Camera, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onSendOffer: (amount: number) => void;
  onPickImage?: () => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onSendOffer,
  onPickImage,
  isDisabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps): React.JSX.Element {
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
    <View style={styles.container}>
      {showOfferInput && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.offerInputContainer}
        >
          <View style={styles.offerHeader}>
            <DollarSign size={16} color="#3B82F6" />
            <Text style={styles.offerLabel}>Send Price Offer</Text>
            <Pressable onPress={toggleOfferInput}>
              <X size={18} color="#6B7280" />
            </Pressable>
          </View>
          <View style={styles.offerRow}>
            <Text style={styles.currency}>ILS</Text>
            <TextInput
              style={styles.offerInput}
              value={offerAmount}
              onChangeText={setOfferAmount}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              editable={!isDisabled}
              autoFocus
            />
          </View>
        </Animated.View>
      )}

      <View style={styles.inputRow}>
        <View style={styles.actions}>
          <IconButton
            icon={() => <Camera size={22} color="#6B7280" />}
            onPress={onPickImage}
            disabled={isDisabled}
            size={22}
          />
          <IconButton
            icon={() => (
              <DollarSign
                size={22}
                color={showOfferInput ? '#3B82F6' : '#6B7280'}
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
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
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
              color={canSend && !isDisabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 34,
  },
  offerInputContainer: {
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  offerLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  offerInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    minWidth: 120,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
});
