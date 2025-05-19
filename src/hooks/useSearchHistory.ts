
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistoryLocal] = useLocalStorage<string[]>('searchHistory', []);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchSearchHistory(session.user.id);
        } else {
          setUserId(null);
        }
      }
    );

    // Check for an existing session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await fetchSearchHistory(session.user.id);
      }
    };

    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchSearchHistory = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('history')
        .eq('user_id', id)
        .single();

      if (error) {
        // If no history exists, create it
        if (error.code === 'PGRST116') {
          // Get local history and save to Supabase
          if (searchHistory.length > 0) {
            await saveSearchHistory(searchHistory);
          } else {
            await createEmptyHistory();
          }
        } else {
          console.error('Error fetching search history:', error);
        }
      } else if (data && data.history) {
        setSearchHistoryLocal(data.history);
      }
    } catch (error) {
      console.error('Error in fetchSearchHistory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyHistory = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({ user_id: userId, history: [] });

      if (error) {
        console.error('Error creating search history:', error);
      }
    } catch (error) {
      console.error('Error in createEmptyHistory:', error);
    }
  };

  const saveSearchHistory = async (history: string[]) => {
    if (!userId) {
      setSearchHistoryLocal(history);
      return;
    }

    try {
      const { error } = await supabase
        .from('search_history')
        .upsert({ 
          user_id: userId, 
          history: history.slice(0, 20), // Limit to 20 entries
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving search history:', error);
        toast.error('Failed to save your search history');
      }
    } catch (error) {
      console.error('Error in saveSearchHistory:', error);
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
    
    // Update local state
    setSearchHistoryLocal(newHistory);
    
    // Save to Supabase if logged in
    if (userId) {
      saveSearchHistory(newHistory);
    }
  };

  const clearHistory = async () => {
    setSearchHistoryLocal([]);
    
    if (userId) {
      try {
        const { error } = await supabase
          .from('search_history')
          .update({ history: [], updated_at: new Date().toISOString() })
          .eq('user_id', userId);

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
    isAuthenticated: !!userId
  };
};
