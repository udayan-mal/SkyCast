
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onGetLocation: () => void;
  onSearch?: (city: string) => void;
}

export default function EmptyState({ onGetLocation, onSearch }: EmptyStateProps) {
  const handleTryNewYork = () => {
    if (onSearch) {
      onSearch("New York");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
        <Search className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Search for a location</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Enter a city name in the search bar above to check the current weather and 7-day forecast.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onGetLocation} variant="outline" className="flex gap-2">
          <MapPin className="w-4 h-4" />
          Use my location
        </Button>
        <Button onClick={handleTryNewYork} className="flex gap-2">
          <Search className="w-4 h-4" />
          Try "New York"
        </Button>
      </div>
    </div>
  );
}
