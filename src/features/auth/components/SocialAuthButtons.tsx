import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Phone, Mail } from 'lucide-react-native';

const GOLD = '#DAA520';
const GOLD_DARK = '#B8860B';

interface SocialAuthButtonsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onPhonePress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SocialButtonProps {
  onPress?: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'google' | 'apple' | 'phone';
  isLoading?: boolean;
  disabled?: boolean;
}

function SocialButton({
  onPress,
  icon,
  label,
  variant,
  isLoading,
  disabled,
}: SocialButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyles = [
    styles.button,
    variant === 'google' && styles.googleButton,
    variant === 'apple' && styles.appleButton,
    variant === 'phone' && styles.phoneButton,
    disabled && styles.disabledButton,
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'google' && styles.googleText,
    variant === 'apple' && styles.appleText,
    variant === 'phone' && styles.phoneText,
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={[{ transform: [{ scale: scaleAnim }] }]}
    >
      <View style={buttonStyles}>
        {isLoading ? (
          <ActivityIndicator
            color={variant === 'apple' ? '#FFFFFF' : variant === 'phone' ? GOLD : '#1A1A1A'}
            size="small"
          />
        ) : (
          <>
            <View style={styles.iconContainer}>{icon}</View>
            <Text style={textStyles}>{label}</Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

export function SocialAuthButtons({
  onGooglePress,
  onApplePress,
  onPhonePress,
  isLoading,
  disabled,
}: SocialAuthButtonsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <SocialButton
        onPress={onGooglePress}
        icon={<Mail size={20} color="#4285F4" />}
        label="Continue with Google"
        variant="google"
        isLoading={isLoading}
        disabled={disabled}
      />

      {Platform.OS === 'ios' && (
        <SocialButton
          onPress={onApplePress}
          icon={<Text style={styles.appleIcon}></Text>}
          label="Continue with Apple"
          variant="apple"
          isLoading={isLoading}
          disabled={disabled}
        />
      )}

      <SocialButton
        onPress={onPhonePress}
        icon={<Phone size={20} color={GOLD} />}
        label="Continue with Phone"
        variant="phone"
        isLoading={isLoading}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  phoneButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: GOLD,
  },
  disabledButton: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  googleText: {
    color: '#1A1A1A',
  },
  appleText: {
    color: '#FFFFFF',
  },
  phoneText: {
    color: GOLD,
  },
  appleIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
