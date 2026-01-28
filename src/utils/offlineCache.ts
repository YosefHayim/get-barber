import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState, useCallback } from 'react';

// Cache configuration
const CACHE_PREFIX = '@cache_';
const CACHE_EXPIRY_PREFIX = '@cache_expiry_';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache options
interface CacheOptions {
  duration?: number; // Cache duration in ms
  forceRefresh?: boolean; // Skip cache and fetch fresh
}

// Store data in cache
export async function setCache<T>(
  key: string,
  data: T,
  duration: number = DEFAULT_CACHE_DURATION
): Promise<void> {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + duration,
  };

  try {
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(entry)
    );
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

// Get data from cache
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if expired
    if (now > entry.expiresAt) {
      await removeCache(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

// Remove cache entry
export async function removeCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('Cache remove error:', error);
  }
}

// Clear all cache
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
}

// Get cache age in ms
export async function getCacheAge(key: string): Promise<number | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry = JSON.parse(cached);
    return Date.now() - entry.timestamp;
  } catch (error) {
    return null;
  }
}

// Check if cache is stale
export async function isCacheStale(
  key: string,
  maxAge: number = DEFAULT_CACHE_DURATION
): Promise<boolean> {
  const age = await getCacheAge(key);
  if (age === null) return true;
  return age > maxAge;
}

// Cached fetch wrapper
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { duration = DEFAULT_CACHE_DURATION, forceRefresh = false } = options;

  // Check network status
  const netInfo = await NetInfo.fetch();
  const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

  // Try cache first if not forcing refresh
  if (!forceRefresh) {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      // If offline, return cached data
      if (!isOnline) {
        return cached;
      }
      // If online but cache is fresh, return cached
      const isStale = await isCacheStale(key, duration);
      if (!isStale) {
        return cached;
      }
    }
  }

  // If offline and no cache, throw error
  if (!isOnline) {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }
    throw new Error('No internet connection and no cached data available');
  }

  // Fetch fresh data
  const data = await fetcher();
  await setCache(key, data, duration);
  return data;
}

// Network status hook
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOnline: isConnected && isInternetReachable,
    isOffline: !isConnected || !isInternetReachable,
  };
}

// Offline data hook
export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...cacheOptions } = options;
  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await getCache<T>(key);

      if (cached !== null) {
        setData(cached);
        setIsFromCache(true);
      }

      // If online, try to fetch fresh
      if (isOnline) {
        const freshData = await cachedFetch(key, fetcher, cacheOptions);
        setData(freshData);
        setIsFromCache(false);
      } else if (cached === null) {
        throw new Error('Offline and no cached data');
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, isOnline, cacheOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return cachedFetch(key, fetcher, { ...cacheOptions, forceRefresh: true })
      .then(setData)
      .catch(setError);
  }, [key, fetcher, cacheOptions]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    isOnline,
    refresh,
  };
}

// Pending actions queue for offline submissions
interface PendingAction {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
}

const PENDING_ACTIONS_KEY = '@pending_actions';

export async function addPendingAction(
  type: string,
  payload: unknown
): Promise<string> {
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const action: PendingAction = {
    id,
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  };

  const existing = await getPendingActions();
  existing.push(action);
  await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(existing));

  return id;
}

export async function getPendingActions(): Promise<PendingAction[]> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function removePendingAction(id: string): Promise<void> {
  const actions = await getPendingActions();
  const filtered = actions.filter((a) => a.id !== id);
  await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(filtered));
}

export async function processPendingActions(
  processor: (action: PendingAction) => Promise<void>
): Promise<{ processed: number; failed: number }> {
  const actions = await getPendingActions();
  let processed = 0;
  let failed = 0;

  for (const action of actions) {
    try {
      await processor(action);
      await removePendingAction(action.id);
      processed++;
    } catch {
      // Update retry count
      action.retries++;
      if (action.retries >= 3) {
        await removePendingAction(action.id);
        failed++;
      }
    }
  }

  return { processed, failed };
}

// Hook for offline actions
export function useOfflineAction(
  type: string,
  onlineHandler: (payload: unknown) => Promise<void>
) {
  const { isOnline } = useNetworkStatus();

  const execute = useCallback(
    async (payload: unknown) => {
      if (isOnline) {
        await onlineHandler(payload);
      } else {
        await addPendingAction(type, payload);
      }
    },
    [isOnline, type, onlineHandler]
  );

  return { execute, isOnline };
}

export default {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  getCacheAge,
  isCacheStale,
  cachedFetch,
  useNetworkStatus,
  useOfflineData,
  addPendingAction,
  getPendingActions,
  removePendingAction,
  processPendingActions,
  useOfflineAction,
};
