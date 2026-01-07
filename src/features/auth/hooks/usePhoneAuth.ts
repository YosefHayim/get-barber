import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';

interface PhoneAuthState {
  isLoading: boolean;
  error: string | null;
  verificationSent: boolean;
}

interface PhoneAuthResult {
  success: boolean;
  error: string | null;
}

export function usePhoneAuth() {
  const [state, setState] = useState<PhoneAuthState>({
    isLoading: false,
    error: null,
    verificationSent: false,
  });

  const formatToE164 = useCallback((phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? digits.slice(1) : digits;
    return `+972${normalized}`;
  }, []);

  const sendOTP = useCallback(async (phone: string): Promise<PhoneAuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const formattedPhone = formatToE164(phone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { channel: 'sms' },
      });

      if (error) {
        setState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message,
          verificationSent: false,
        }));
        return { success: false, error: error.message };
      }

      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: null,
        verificationSent: true,
      }));
      
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        verificationSent: false,
      }));
      return { success: false, error: errorMessage };
    }
  }, [formatToE164]);

  const verifyOTP = useCallback(async (phone: string, otp: string): Promise<PhoneAuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const formattedPhone = formatToE164(phone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        setState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!profileData) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: `User ${formattedPhone.slice(-4)}`,
            user_type: 'customer',
          });
        }
      }

      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: null,
      }));
      
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [formatToE164]);

  const resendOTP = useCallback(async (phone: string): Promise<PhoneAuthResult> => {
    setState((prev) => ({ ...prev, verificationSent: false }));
    return sendOTP(phone);
  }, [sendOTP]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      verificationSent: false,
    });
  }, []);

  return {
    ...state,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset,
    formatToE164,
  };
}
