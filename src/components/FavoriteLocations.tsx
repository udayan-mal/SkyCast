
import { useState } from "react";
import { Heart, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface FavoriteLocation {
  id: string;
  name: string;
  country?: string;
}

interface FavoriteLocationsProps {
  onLocationSelect: (location: string) => void;
}

export const FavoriteLocations = ({ onLocationSelect }: FavoriteLocationsProps) => {
  const [favorites, setFavorites] = useLocalStorage<FavoriteLocation[]>('favoriteLocations', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  const addFavorite = () => {
    if (!newLocation.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    const newFav: FavoriteLocation = {
      id: Date.now().toString(),
      name: newLocation.trim(),
    };

    setFavorites([...favorites, newFav]);
    setNewLocation("");
    setIsAddingNew(false);
    toast.success(`Added ${newLocation} to favorites`);
  };

  const removeFavorite = (id: string) => {
    const location = favorites.find(f => f.id === id);
    setFavorites(favorites.filter(f => f.id !== id));
    toast.success(`Removed ${location?.name} from favorites`);
  };

  const handleLocationClick = (location: FavoriteLocation) => {
    onLocationSelect(location.name);
  };

  if (favorites.length === 0 && !isAddingNew) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">No favorite locations yet</p>
          <Button size="sm" onClick={() => setIsAddingNew(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Favorite
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorite Locations
          </h3>
          {!isAddingNew && (
            <Button size="sm" variant="outline" onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isAddingNew && (
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter location name"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFavorite()}
              className="text-sm"
            />
            <Button size="sm" onClick={addFavorite}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => {
              setIsAddingNew(false);
              setNewLocation("");
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {favorites.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-white/20 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
              onClick={() => handleLocationClick(location)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{location.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(location.id);
                }}
                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
