
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useWeatherProfile = () => {
  const [profile, setProfile] = useState<WeatherProfile>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Check for locally stored preferences first
    const localPreferences = localStorage.getItem('weatherPreferences');
    if (localPreferences) {
      try {
        const parsedPreferences = JSON.parse(localPreferences);
        setProfile(parsedPreferences);
      } catch (error) {
        console.error('Error parsing local preferences:', error);
      }
    }
    
    // If user is authenticated, fetch from Supabase
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error) {
        console.error('Error fetching user profile', error);
        // If the profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await createUserProfile(id);
        } else {
          setLoading(false);
        }
      } else if (data) {
        setProfile(data);
        // Save to local storage for offline access
        localStorage.setItem('weatherPreferences', JSON.stringify(data));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setLoading(false);
    }
  };

  const createUserProfile = async (id: string) => {
    try {
      // Get local preferences to use as defaults if available
      const localPrefs = localStorage.getItem('weatherPreferences');
      const startingPrefs = localPrefs ? JSON.parse(localPrefs) : DEFAULT_PREFERENCES;
      
      const { error } = await supabase
        .from('user_preferences')
        .insert([{ 
          user_id: id,
          ...startingPrefs
        }]);

      if (error) {
        console.error('Error creating user profile', error);
        toast.error('Failed to create user profile');
        setLoading(false);
        return false;
      }
      
      setProfile(startingPrefs);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      setLoading(false);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<WeatherProfile>) => {
    try {
      // Always update local state and storage for immediate feedback
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      localStorage.setItem('weatherPreferences', JSON.stringify(updatedProfile));
      
      // If user is logged in, update in Supabase
      if (user) {
        setLoading(true);
        const { error } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating profile', error);
          toast.error('Failed to update profile');
          setLoading(false);
          return false;
        }

        toast.success('Profile updated successfully');
        setLoading(false);
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      setLoading(false);
      return false;
    }
  };

  return { 
    profile, 
    loading, 
    updateProfile,
    isAuthenticated: !!user
  };
};
