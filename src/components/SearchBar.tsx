
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface SearchBarProps {
  onSearch: (city: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { searchHistory, addToHistory } = useSearchHistory();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Log search history for debugging
  useEffect(() => {
    console.log('SearchBar: Current search history:', searchHistory);
  }, [searchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a city name");
      return;
    }
    
    console.log('SearchBar: Searching for city:', query);
    onSearch(query);
    addToHistory(query);
    setQuery("");
    setIsHistoryOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsHistoryOpen(false);
    searchInputRef.current?.focus();
  };

  const handleHistoryItemClick = (city: string) => {
    console.log('SearchBar: Selected from history:', city);
    onSearch(city);
    setQuery("");
    setIsHistoryOpen(false);
  };

  const handleInputFocus = () => {
    console.log('SearchBar: Input focused, search history length:', searchHistory.length);
    if (searchHistory.length > 0) {
      setIsHistoryOpen(true);
    }
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsHistoryOpen(false);
    
    if (isHistoryOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isHistoryOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto animate-fade-in-down">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a city... (Press '/' to focus)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            className="pr-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Search History Dropdown */}
      {isHistoryOpen && searchHistory.length > 0 && (
        <div 
          className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border rounded-md shadow-lg animate-fade-in-down"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b">
            Recent Searches ({searchHistory.length})
          </div>
          <ul>
            {searchHistory.map((city, index) => (
              <li 
                key={`${city}-${index}`}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                onClick={() => handleHistoryItemClick(city)}
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Search History: {searchHistory.length} items
        </div>
      )}
    </div>
  );
}
