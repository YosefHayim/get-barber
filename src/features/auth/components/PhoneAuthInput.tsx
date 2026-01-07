import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';

const GOLD = '#DAA520';

interface PhoneAuthInputProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function formatPhoneNumber(digits: string): string {
  const cleaned = digits.replace(/\D/g, '').slice(0, 9);
  
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  } else {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
}

function extractDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

export function PhoneAuthInput({
  value,
  onChangeText,
  error,
  disabled,
}: PhoneAuthInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleChangeText = (text: string) => {
    const digits = extractDigits(text);
    onChangeText(digits);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#EF4444' : '#E5E7EB', error ? '#EF4444' : GOLD],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor, borderWidth },
          disabled && styles.disabledContainer,
        ]}
      >
        <View style={styles.prefixContainer}>
          <Text style={styles.prefixText}>+972</Text>
        </View>
        <TextInput
          style={styles.input}
          value={formatPhoneNumber(value)}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="phone-pad"
          placeholder="50 123 4567"
          placeholderTextColor="#9CA3AF"
          editable={!disabled}
          maxLength={12}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  prefixContainer: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
});
