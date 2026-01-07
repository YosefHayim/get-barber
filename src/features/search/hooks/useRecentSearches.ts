import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@barberconnect/recent_searches';
const MAX_RECENT_SEARCHES = 10;

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type: 'barber' | 'service' | 'location';
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      setRecentSearches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecentSearch = useCallback(async (query: string, type: RecentSearch['type'] = 'barber') => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const newSearch: RecentSearch = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: trimmedQuery,
      timestamp: Date.now(),
      type,
    };

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});

      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback(async (id: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY).catch(() => {});
  }, []);

  return {
    recentSearches,
    isLoading,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
