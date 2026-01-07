import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/services/supabase/client';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthState {
  isLoading: boolean;
  error: string | null;
}

interface GoogleAuthResult {
  success: boolean;
  error: string | null;
}

const GOOGLE_CLIENT_ID_WEB = Constants.expoConfig?.extra?.googleClientIdWeb ?? '';
const GOOGLE_CLIENT_ID_IOS = Constants.expoConfig?.extra?.googleClientIdIos ?? '';
const GOOGLE_CLIENT_ID_ANDROID = Constants.expoConfig?.extra?.googleClientIdAndroid ?? '';

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID_WEB,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success') {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        
        try {
          const { authentication } = response;
          
          if (!authentication?.idToken) {
            throw new Error('No ID token received from Google');
          }

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: authentication.idToken,
          });

          if (error) {
            setState((prev) => ({ 
              ...prev, 
              isLoading: false, 
              error: error.message,
            }));
            return;
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
                display_name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
                avatar_url: data.user.user_metadata?.avatar_url ?? null,
                user_type: 'customer',
              });
            }
          }

          setState((prev) => ({ ...prev, isLoading: false, error: null }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Google sign in failed';
          setState((prev) => ({ 
            ...prev, 
            isLoading: false, 
            error: errorMessage,
          }));
        }
      } else if (response?.type === 'error') {
        setState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error?.message ?? 'Google sign in was cancelled or failed',
        }));
      }
    };

    if (response) {
      handleResponse();
    }
  }, [response]);

  const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
    if (!request) {
      const error = 'Google auth is not configured. Please add Google OAuth credentials.';
      setState((prev) => ({ ...prev, error }));
      return { success: false, error };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await promptAsync();
      
      if (result.type === 'cancel') {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: null };
      }
      
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Google sign in';
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [request, promptAsync]);

  const isAvailable = Platform.OS !== 'web' || !!GOOGLE_CLIENT_ID_WEB;

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    signInWithGoogle,
    isAvailable,
    isReady: !!request,
    reset,
  };
}
