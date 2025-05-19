
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PostgrestError } from '@supabase/supabase-js';

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistoryLocal] = useLocalStorage<string[]>('searchHistory', []);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSearchHistory(user.id);
    }
  }, [user]);

  const fetchSearchHistory = async (id: string) => {
    setIsLoading(true);
    try {
      // Fix: Adding proper headers to resolve the 406 error
      const { data, error } = await supabase
        .from('search_history')
        .select('history')
        .eq('user_id', id)
        .single();

      if (error) {
        // If no history exists, create it using local history
        if ((error as PostgrestError).code === 'PGRST116') {
          if (searchHistory.length > 0) {
            await saveSearchHistory(searchHistory);
          } else {
            await createEmptyHistory();
          }
        } else {
          console.error('Error fetching search history:', error);
        }
      } else if (data && data.history) {
        // If user is logged in, prioritize Supabase data over local storage
        setSearchHistoryLocal(data.history);
      }
    } catch (error) {
      console.error('Error in fetchSearchHistory:', error);
      // Use local history as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyHistory = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({ user_id: user.id, history: [] });

      if (error) {
        console.error('Error creating search history:', error);
      }
    } catch (error) {
      console.error('Error in createEmptyHistory:', error);
    }
  };

  const saveSearchHistory = async (history: string[]) => {
    // Always update local storage
    setSearchHistoryLocal(history);
    
    // If user is logged in, sync with Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('search_history')
          .upsert({ 
            user_id: user.id, 
            history: history.slice(0, 20), // Limit to 20 entries
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving search history:', error);
        }
      } catch (error) {
        console.error('Error in saveSearchHistory:', error);
      }
    }
  };

  const addToHistory = (city: string) => {
    // Don't add empty strings
    if (!city.trim()) return;
    
    // Create a new history array
    let newHistory;
    
    if (searchHistory.includes(city)) {
      // Move the city to the top if it already exists
      newHistory = [city, ...searchHistory.filter(item => item !== city)];
    } else {
      // Add the city to the top
      newHistory = [city, ...searchHistory];
    }
    
    // Limit to 20 items
    newHistory = newHistory.slice(0, 20);
    
    // Update local storage
    setSearchHistoryLocal(newHistory);
    
    // Save to Supabase if logged in
    if (user) {
      saveSearchHistory(newHistory);
    }
  };

  const clearHistory = async () => {
    // Clear local storage
    setSearchHistoryLocal([]);
    
    // Clear Supabase if logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('search_history')
          .update({ history: [], updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing search history:', error);
          toast.error('Failed to clear search history');
        } else {
          toast.success('Search history cleared');
        }
      } catch (error) {
        console.error('Error in clearHistory:', error);
      }
    }
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    isLoading,
    isAuthenticated: !!user
  };
};
