
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export type WeatherProfile = {
  theme: string;
  unit: string;
  default_city: string | null;
  language: string;
  notifications_enabled: boolean;
  analytics_enabled: boolean;
};

export const DEFAULT_PREFERENCES = {
  theme: 'light',
  unit: 'metric',
  default_city: null,
  language: 'en',
  notifications_enabled: false,
  analytics_enabled: true,
};

const STORAGE_KEY_PREFIX = 'skycast:weatherPreferences';
const LEGACY_KEY = 'weatherPreferences';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getStorageKey = (userId?: string | null) => {
  if (!userId) return `${STORAGE_KEY_PREFIX}:guest`;
  return `${STORAGE_KEY_PREFIX}:${userId}`;
};

const readPreferences = (userId?: string | null): WeatherProfile => {
  if (!isBrowser()) return DEFAULT_PREFERENCES;
  const key = getStorageKey(userId);

  try {
    const raw = window.localStorage.getItem(key) ?? (!userId ? window.localStorage.getItem(LEGACY_KEY) : null);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    console.error('Failed to read weather preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

const writePreferences = (profile: WeatherProfile, userId?: string | null) => {
  if (!isBrowser()) return;
  try {
    const key = getStorageKey(userId);
    window.localStorage.setItem(key, JSON.stringify(profile));
    if (!userId) {
      window.localStorage.setItem(LEGACY_KEY, JSON.stringify(profile));
    }
  } catch (error) {
    console.error('Failed to persist weather preferences:', error);
  }
};

export const useWeatherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WeatherProfile>(() => readPreferences(user?.id));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBrowser()) {
      setProfile(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    setLoading(true);
    const preferences = readPreferences(user?.id ?? undefined);
    setProfile(preferences);
    setLoading(false);
  }, [user?.id]);

  const updateProfile = async (updates: Partial<WeatherProfile>) => {
    try {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      writePreferences(updatedProfile, user?.id ?? undefined);
      toast.success('Preferences saved');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    isAuthenticated: !!user,
  };
};
