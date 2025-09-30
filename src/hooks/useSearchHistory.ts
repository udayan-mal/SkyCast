
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY_PREFIX = 'skycast:searchHistory';
const LEGACY_KEY = 'searchHistory';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getStorageKey = (userId?: string | null) => {
  if (!userId) return `${STORAGE_KEY_PREFIX}:guest`;
  return `${STORAGE_KEY_PREFIX}:${userId}`;
};

const readHistory = (key: string, isGuest: boolean) => {
  if (!isBrowser()) return [] as string[];
  try {
    const raw = window.localStorage.getItem(key) ?? (isGuest ? window.localStorage.getItem(LEGACY_KEY) : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read search history:', error);
    return [];
  }
};

const writeHistory = (key: string, history: string[], isGuest: boolean) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(history));
    if (isGuest) {
      window.localStorage.setItem(LEGACY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to persist search history:', error);
  }
};

export const useSearchHistory = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const storageKeyRef = useRef<string>(getStorageKey(user?.id));

  useEffect(() => {
    const key = getStorageKey(user?.id);
    storageKeyRef.current = key;

    if (!isBrowser()) {
      setSearchHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const history = readHistory(key, !user);
    setSearchHistory(history);
    setIsLoading(false);
  }, [user?.id]);

  const persistHistory = (history: string[]) => {
    setSearchHistory(history);
    writeHistory(storageKeyRef.current, history, !user);
  };

  const addToHistory = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;

    const existingIndex = searchHistory.findIndex(item => item.toLowerCase() === trimmed.toLowerCase());
    let updatedHistory: string[];

    if (existingIndex !== -1) {
      updatedHistory = [searchHistory[existingIndex], ...searchHistory.filter((_, idx) => idx !== existingIndex)];
    } else {
      updatedHistory = [trimmed, ...searchHistory];
    }

    persistHistory(updatedHistory.slice(0, 20));
  };

  const clearHistory = () => {
    persistHistory([]);
    toast.success('Search history cleared');
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    isLoading,
    isAuthenticated: !!user,
  };
};
