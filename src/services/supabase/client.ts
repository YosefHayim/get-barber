import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isSSR = typeof window === 'undefined';

const memoryStorage: Record<string, string> = {};
const ssrSafeStorage = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(memoryStorage[key] ?? null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    memoryStorage[key] = value;
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    delete memoryStorage[key];
    return Promise.resolve();
  },
};

const getStorage = () => {
  if (isSSR) {
    return ssrSafeStorage;
  }
  
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }
  
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: !isSSR,
    persistSession: !isSSR,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type { Database };
