
-- Set up Row Level Security for the search_history table
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own search history
CREATE POLICY "Users can view their own search history" ON public.search_history
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to update their own search history  
CREATE POLICY "Users can update their own search history" ON public.search_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own search history
CREATE POLICY "Users can insert their own search history" ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
