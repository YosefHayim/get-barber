import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Scissors, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmailAuthInput, OTPInput } from '@/features/auth/components';
import { useEmailAuth } from '@/features/auth/hooks';
import { useToast } from '@/hooks/useToast';
import {
  Text,
  Button,
  ButtonText,
  ButtonSpinner,
  Pressable,
} from '../../components/ui';

const GOLD = '#DAA520';
const BURGUNDY = '#722F37';

type Step = 'email' | 'otp';

export default function EmailLoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { sendOTP, verifyOTP, resendOTP, isLoading, error: authError } = useEmailAuth();
  const toast = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');

  const error = localError || authError;

  const isValidEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue.trim());
  };

  const handleSendOTP = async () => {
    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    setLocalError('');
    const result = await sendOTP(email);

    if (result.success) {
      setStep('otp');
      toast.success('Verification code sent to your email!');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setLocalError('Please enter the complete 6-digit code');
      return;
    }

    setLocalError('');
    const result = await verifyOTP(email, otp);

    if (result.success) {
      toast.success('Welcome!');
      router.replace('/(tabs)');
    }
  };

  const handleResendOTP = async () => {
    setLocalError('');
    setOtp('');
    const result = await resendOTP(email);

    if (result.success) {
      toast.success('New code sent!');
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      setLocalError('');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </Pressable>

        <Animated.View style={styles.header} entering={FadeInDown.duration(600).delay(100)}>
          <View style={styles.logoContainer}>
            <View style={styles.logoInner}>
              <Scissors size={32} color="#FFFFFF" style={{ transform: [{ rotate: '-45deg' }] }} />
            </View>
            <View style={styles.sparkle}>
              <Sparkles size={14} color={GOLD} fill={GOLD} />
            </View>
          </View>

          {step === 'email' ? (
            <>
              <Text className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Enter Email Address
              </Text>
              <Text className="text-base text-gray-500 font-medium text-center">
                We'll send you a verification code
              </Text>
            </>
          ) : (
            <>
              <Text className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Verify Code
              </Text>
              <Text className="text-base text-gray-500 font-medium text-center leading-6">
                Enter the 6-digit code sent to{'\n'}
                <Text className="text-primary-500 font-bold">{email}</Text>
              </Text>
            </>
          )}
        </Animated.View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text className="text-red-600 text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {step === 'email' ? (
            <>
              <EmailAuthInput
                value={email}
                onChangeText={setEmail}
                disabled={isLoading}
              />

              <Button
                className="mt-6 rounded-2xl h-14 bg-primary-500"
                onPress={handleSendOTP}
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <ButtonSpinner color="white" />
                ) : (
                  <ButtonText className="text-white font-semibold text-base">Send Code</ButtonText>
                )}
              </Button>
            </>
          ) : (
            <>
              <OTPInput
                value={otp}
                onChangeText={setOtp}
                error={error ? error : undefined}
              />

              <Button
                className="mt-6 rounded-2xl h-14 bg-primary-500"
                onPress={handleVerifyOTP}
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? (
                  <ButtonSpinner color="white" />
                ) : (
                  <ButtonText className="text-white font-semibold text-base">
                    Verify & Sign In
                  </ButtonText>
                )}
              </Button>

              <Pressable
                onPress={handleResendOTP}
                disabled={isLoading}
                style={styles.resendButton}
              >
                <Text className="text-base text-gray-500">
                  Didn't receive the code?{' '}
                  <Text className="text-primary-500 font-semibold">Resend</Text>
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: BURGUNDY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: BURGUNDY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
  },
});
