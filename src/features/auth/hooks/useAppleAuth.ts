import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/services/supabase/client';

interface AppleAuthState {
  isLoading: boolean;
  error: string | null;
}

interface AppleAuthResult {
  success: boolean;
  error: string | null;
}

export function useAppleAuth() {
  const [state, setState] = useState<AppleAuthState>({
    isLoading: false,
    error: null,
  });

  const signInWithApple = useCallback(async (): Promise<AppleAuthResult> => {
    if (Platform.OS !== 'ios') {
      const error = 'Apple Sign In is only available on iOS';
      setState((prev) => ({ ...prev, error }));
      return { success: false, error };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const isAvailableOnDevice = await AppleAuthentication.isAvailableAsync();
      
      if (!isAvailableOnDevice) {
        throw new Error('Apple Sign In is not available on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
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
          const fullName = credential.fullName;
          const displayName = fullName 
            ? `${fullName.givenName ?? ''} ${fullName.familyName ?? ''}`.trim() || 'User'
            : data.user.email?.split('@')[0] ?? 'User';

          await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: displayName,
            user_type: 'customer',
          });
        }
      }

      setState((prev) => ({ ...prev, isLoading: false, error: null }));
      return { success: true, error: null };
    } catch (err) {
      if (err instanceof Error) {
        const userCancelled = err.message.includes('ERR_CANCELED') || err.message.includes('user canceled');
        if (userCancelled) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: null };
        }

        setState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: err.message,
        }));
        return { success: false, error: err.message };
      }

      const errorMessage = 'Apple sign in failed';
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const isAvailable = Platform.OS === 'ios';

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;
    return AppleAuthentication.isAvailableAsync();
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    signInWithApple,
    isAvailable,
    checkAvailability,
    reset,
  };
}
