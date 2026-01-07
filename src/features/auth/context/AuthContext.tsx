import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import type { Tables } from '@/services/supabase/database.types';

type Profile = Tables<'profiles'>;

interface AuthError {
  message: string;
}

interface AuthResult {
  error: AuthError | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    const profileData = await fetchProfile(session.user.id);
    setProfile(profileData);
  }, [session?.user?.id, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user?.id) {
        fetchProfile(initialSession.user.id).then(setProfile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user?.id) {
          const profileData = await fetchProfile(newSession.user.id);
          setProfile(profileData);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: { message: error.message } };
      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: { message: error.message } };

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          user_type: 'customer',
        });
        if (profileError) return { error: { message: profileError.message } };
      }
      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isAuthenticated: !!session?.user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
