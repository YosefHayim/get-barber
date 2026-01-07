import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';

const GOLD = '#DAA520';

interface OTPInputProps {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
}

export function OTPInput({
  value,
  onChangeText,
  length = 6,
  error,
  autoFocus = true,
}: OTPInputProps): React.JSX.Element {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const focusAnims = useRef<Animated.Value[]>(
    Array.from({ length }, () => new Animated.Value(0))
  ).current;

  const digits = value.padEnd(length, '').slice(0, length).split('');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleFocus = (index: number) => {
    Animated.timing(focusAnims[index], {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (index: number) => {
    Animated.timing(focusAnims[index], {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newValue = value.slice(0, index - 1) + value.slice(index);
        onChangeText(newValue);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChangeText(newValue);
      }
    }
  };

  const handleChange = (index: number, text: string) => {
    if (text.length > 1) {
      const pastedDigits = text.replace(/\D/g, '').slice(0, length);
      onChangeText(pastedDigits);
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    if (digit) {
      const newValue =
        value.slice(0, index) + digit + value.slice(index + 1);
      onChangeText(newValue.slice(0, length));

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        {Array.from({ length }, (_, index) => {
          const borderColor = focusAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [error ? '#EF4444' : '#E5E7EB', error ? '#EF4444' : GOLD],
          });

          const borderWidth = focusAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2],
          });

          return (
            <Pressable
              key={index}
              onPress={() => handleBoxPress(index)}
            >
              <Animated.View
                style={[
                  styles.inputBox,
                  { borderColor, borderWidth },
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.input}
                  value={digits[index] || ''}
                  onChangeText={(text) => handleChange(index, text)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(index, nativeEvent.key)
                  }
                  onFocus={() => handleFocus(index)}
                  onBlur={() => handleBlur(index)}
                  keyboardType="number-pad"
                  maxLength={length}
                  selectTextOnFocus
                  caretHidden
                />
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  inputBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
  },
});
