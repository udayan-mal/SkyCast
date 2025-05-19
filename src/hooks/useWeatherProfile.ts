
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchUserProfile(session.user.id);
        } else {
          setUserId(null);
          setProfile(DEFAULT_PREFERENCES);
        }
        setLoading(false);
      }
    );

    // Check for an existing session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (id: string) => {
    try {
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
          setProfile(DEFAULT_PREFERENCES);
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfile(DEFAULT_PREFERENCES);
    }
  };

  const createUserProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert([{ 
          user_id: id,
          ...DEFAULT_PREFERENCES
        }]);

      if (error) {
        console.error('Error creating user profile', error);
        toast.error('Failed to create user profile');
        return false;
      }
      
      setProfile(DEFAULT_PREFERENCES);
      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<WeatherProfile>) => {
    if (!userId) {
      toast.error('Please log in to save preferences');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile', error);
        toast.error('Failed to update profile');
        return false;
      }

      setProfile(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    profile, 
    loading, 
    updateProfile,
    isAuthenticated: !!userId
  };
};
