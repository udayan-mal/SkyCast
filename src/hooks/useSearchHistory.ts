
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
    console.log('Search history hook initialized, user:', user?.id);
    console.log('Local search history:', searchHistory);
    
    if (user) {
      fetchSearchHistory(user.id);
    }
  }, [user]);

  const fetchSearchHistory = async (id: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching search history for user:', id);
      
      const { data, error } = await supabase
        .from('search_history')
        .select('history')
        .eq('user_id', id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

      if (error) {
        console.error('Error fetching search history:', error);
        // If no history exists, create it using local history
        if ((error as PostgrestError).code === 'PGRST116') {
          console.log('No search history found, creating new entry');
          if (searchHistory.length > 0) {
            await saveSearchHistory(searchHistory);
          } else {
            await createEmptyHistory();
          }
        }
      } else if (data && data.history) {
        console.log('Fetched search history from Supabase:', data.history);
        // If user is logged in, prioritize Supabase data over local storage
        setSearchHistoryLocal(data.history);
      } else {
        console.log('No search history data found, creating empty history');
        await createEmptyHistory();
      }
    } catch (error) {
      console.error('Error in fetchSearchHistory:', error);
      // Use local history as fallback
      console.log('Using local search history as fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyHistory = async () => {
    if (!user) return;
    
    try {
      console.log('Creating empty search history for user:', user.id);
      const { error } = await supabase
        .from('search_history')
        .insert({ user_id: user.id, history: searchHistory.length > 0 ? searchHistory : [] });

      if (error) {
        console.error('Error creating search history:', error);
      } else {
        console.log('Empty search history created successfully');
      }
    } catch (error) {
      console.error('Error in createEmptyHistory:', error);
    }
  };

  const saveSearchHistory = async (history: string[]) => {
    // Always update local storage first for immediate feedback
    console.log('Saving search history:', history);
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
          console.error('Error saving search history to Supabase:', error);
        } else {
          console.log('Search history saved to Supabase successfully');
        }
      } catch (error) {
        console.error('Error in saveSearchHistory:', error);
      }
    }
  };

  const addToHistory = (city: string) => {
    // Don't add empty strings
    if (!city.trim()) {
      console.log('Attempted to add empty city to history');
      return;
    }
    
    console.log('Adding city to history:', city);
    
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
    
    console.log('New search history:', newHistory);
    
    // Save the updated history
    saveSearchHistory(newHistory);
  };

  const clearHistory = async () => {
    console.log('Clearing search history');
    
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
          console.log('Search history cleared successfully');
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
