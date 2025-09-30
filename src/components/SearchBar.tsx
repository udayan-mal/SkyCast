
import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { Search, X, MapPin, History, Navigation, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { CitySuggestion, fetchCitySuggestions } from "@/lib/api";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onUseCurrentLocation?: () => void;
}

type DropdownItem = {
  key: string;
  label: string;
  secondary?: string;
  icon: ReactNode;
  onSelect: () => void;
  group: "action" | "suggestion" | "history";
};

const formatSuggestionLabel = (suggestion: CitySuggestion) => suggestion.name;

const formatSuggestionSecondary = (suggestion: CitySuggestion) => {
  const segments: string[] = [];
  if (suggestion.state) segments.push(suggestion.state);
  if (suggestion.country) segments.push(suggestion.country);
  return segments.join(", ");
};

const formatSuggestionQuery = (suggestion: CitySuggestion) => {
  const segments: string[] = [suggestion.name];
  if (suggestion.state) segments.push(suggestion.state);
  if (suggestion.country) segments.push(suggestion.country);
  return segments.join(", ");
};

export default function SearchBar({ onSearch, onUseCurrentLocation }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const { searchHistory, addToHistory } = useSearchHistory();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a city name");
      return;
    }
    onSearch(query);
    addToHistory(query);
    setQuery("");
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    searchInputRef.current?.focus();
  };

  const handleHistoryItemClick = (city: string) => {
    onSearch(city);
    setQuery("");
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const formatted = formatSuggestionQuery(suggestion);
    onSearch(formatted);
    addToHistory(formatted);
    setQuery("");
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleInputFocus = () => {
    console.log('SearchBar: Input focused, search history length:', searchHistory.length);
    if (searchHistory.length > 0 || suggestions.length > 0 || onUseCurrentLocation) {
      setIsDropdownOpen(true);
    }
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  useEffect(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSuggestions([]);
      setSuggestionError(null);
      setIsLoadingSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setIsLoadingSuggestions(true);
    setSuggestionError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await fetchCitySuggestions(trimmedQuery);
        if (!cancelled) {
          setSuggestions(results);
          const firstSuggestionIndex = results.length ? (onUseCurrentLocation ? 1 : 0) : -1;
          setActiveIndex(firstSuggestionIndex);
        }
      } catch (error) {
        console.error('Suggestion fetch failed:', error);
        if (!cancelled) {
          setSuggestionError('Unable to load suggestions right now');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery, onUseCurrentLocation]);

  useEffect(() => {
    if (trimmedQuery.length >= 1 || searchHistory.length > 0 || suggestions.length > 0 || onUseCurrentLocation) {
      setIsDropdownOpen(true);
    }
  }, [trimmedQuery, searchHistory.length, suggestions.length, onUseCurrentLocation]);

  useEffect(() => {
    if (!isDropdownOpen) {
      setActiveIndex(-1);
    }
  }, [isDropdownOpen]);

  const dropdownItems: DropdownItem[] = useMemo(() => {
    const items: DropdownItem[] = [];

    if (onUseCurrentLocation) {
      items.push({
        key: 'use-current-location',
        label: 'Use Current Location',
        secondary: undefined,
        icon: <Navigation className="h-4 w-4 text-sky-500" />, 
        onSelect: () => {
          onUseCurrentLocation();
          setIsDropdownOpen(false);
          setActiveIndex(-1);
        },
        group: "action",
      });
    }

    if (suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        items.push({
          key: `suggestion-${suggestion.id}`,
          label: formatSuggestionLabel(suggestion),
          secondary: formatSuggestionSecondary(suggestion) || undefined,
          icon: <MapPin className="h-4 w-4 text-emerald-500" />, 
          onSelect: () => handleSuggestionClick(suggestion),
          group: "suggestion",
        });
      });
    }

    if (searchHistory.length > 0) {
      searchHistory.forEach((city, index) => {
        items.push({
          key: `history-${city}-${index}`,
          label: city,
          secondary: 'Recent search',
          icon: <History className="h-4 w-4 text-slate-500" />, 
          onSelect: () => handleHistoryItemClick(city),
          group: "history",
        });
      });
    }

    return items;
  }, [onUseCurrentLocation, suggestions, searchHistory]);

  const dropdownListEntries = useMemo(() => {
    const entries: Array<
      | { type: 'heading'; id: string; label: string }
      | { type: 'item'; id: string; item: DropdownItem; itemIndex: number }
    > = [];

    let lastGroup: DropdownItem['group'] | null = null;

    dropdownItems.forEach((item, index) => {
      if (item.group !== 'action' && item.group !== lastGroup) {
        const headingLabel = item.group === 'suggestion' ? 'Suggestions' : 'Recent';
        entries.push({
          type: 'heading',
          id: `heading-${item.group}`,
          label: headingLabel,
        });
      }

      entries.push({
        type: 'item',
        id: item.key,
        item,
        itemIndex: index,
      });

      lastGroup = item.group;
    });

    return entries;
  }, [dropdownItems]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || dropdownItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % dropdownItems.length);
      setIsDropdownOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + dropdownItems.length) % dropdownItems.length);
      setIsDropdownOpen(true);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && dropdownItems[activeIndex]) {
        e.preventDefault();
        dropdownItems[activeIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  let lastGroup: DropdownItem["group"] | null = null;

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto animate-fade-in-down">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a city... (Press '/' to focus)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
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

      {/* Search Suggestions & History Dropdown */}
      {isDropdownOpen && (
        <div
          className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border rounded-md shadow-lg overflow-hidden"
          onMouseDown={(e) => e.preventDefault()}
        >
          {isLoadingSuggestions && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching cities…
            </div>
          )}

          {!isLoadingSuggestions && suggestionError && (
            <div className="px-4 py-3 text-sm text-destructive">
              {suggestionError}
            </div>
          )}

          {dropdownItems.length === 0 && !isLoadingSuggestions && !suggestionError && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Start typing to search for locations
            </div>
          )}

          {dropdownItems.length > 0 && (
            <ul role="listbox" aria-label="City suggestions" className="max-h-64 overflow-y-auto">
              {dropdownListEntries.map((entry) => {
                if (entry.type === 'heading') {
                  return (
                    <li
                      key={entry.id}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-slate-50 dark:bg-slate-800/70"
                      role="presentation"
                    >
                      {entry.label}
                    </li>
                  );
                }

                const { item, itemIndex } = entry;
                const isActive = activeIndex === itemIndex;

                return (
                  <li
                    key={entry.id}
                    role="option"
                    aria-selected={isActive}
                    className={`flex items-start gap-3 px-4 py-2 cursor-pointer transition-colors text-sm ${
                      isActive ? 'bg-sky-50 dark:bg-slate-700/60' : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onClick={() => item.onSelect()}
                  >
                    <span className="mt-0.5">{item.icon}</span>
                    <span className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-50">{item.label}</span>
                      {item.secondary && (
                        <span className="text-xs text-muted-foreground">{item.secondary}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
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
