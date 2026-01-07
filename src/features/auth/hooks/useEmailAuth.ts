import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';

interface EmailAuthState {
  isLoading: boolean;
  error: string | null;
  verificationSent: boolean;
}

interface EmailAuthResult {
  success: boolean;
  error: string | null;
}

export function useEmailAuth() {
  const [state, setState] = useState<EmailAuthState>({
    isLoading: false,
    error: null,
    verificationSent: false,
  });

  const sendOTP = useCallback(async (email: string): Promise<EmailAuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: true,
        },
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
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<EmailAuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: otp,
        type: 'email',
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
          const emailPrefix = email.split('@')[0];
          await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: emailPrefix,
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
  }, []);

  const resendOTP = useCallback(async (email: string): Promise<EmailAuthResult> => {
    setState((prev) => ({ ...prev, verificationSent: false }));
    return sendOTP(email);
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
  };
}
