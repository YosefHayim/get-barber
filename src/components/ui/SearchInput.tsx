import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  loading?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  loading = false,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [COLORS.border, COLORS.gold]
    );
    return { borderColor };
  });

  const showClearButton = value.length > 0 && !loading;

  return (
    <AnimatedView
      style={[
        styles.container,
        { borderWidth: isFocused ? 2 : 1 },
        animatedBorderStyle,
      ]}
    >
      <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {loading && (
        <ActivityIndicator size="small" color={COLORS.gold} style={styles.loader} />
      )}
      {showClearButton && (
        <Pressable onPress={handleClear} style={styles.clearButton} hitSlop={8}>
          <X size={18} color={COLORS.textMuted} />
        </Pressable>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    height: 48,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    height: '100%',
  },
  loader: {
    marginLeft: SPACING.sm,
  },
  clearButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
});
