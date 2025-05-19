
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SearchBarProps {
  onSearch: (city: string) => void;
  searchHistory: string[];
  addToHistory: (city: string) => void;
}

export default function SearchBar({ onSearch, searchHistory, addToHistory }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a city name");
      return;
    }
    
    onSearch(query);
    addToHistory(query);
    setQuery("");
    setIsHistoryOpen(false);
  };

  const handleHistoryItemClick = (city: string) => {
    onSearch(city);
    setIsHistoryOpen(false);
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

  return (
    <div className="relative w-full max-w-md mx-auto animate-fade-in-down">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => searchHistory.length > 0 && setIsHistoryOpen(true)}
            className="pr-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          />
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
        </div>
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Search History Dropdown */}
      {isHistoryOpen && searchHistory.length > 0 && (
        <div 
          className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border rounded-md shadow-lg animate-fade-in-down"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b">
            Recent Searches
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
    </div>
  );
}
