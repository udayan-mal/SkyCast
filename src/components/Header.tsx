
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, UserRound, Heart, History } from "lucide-react";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import UnitToggle from "@/components/UnitToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UserPreferences from "@/components/UserPreferences";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteCities, type FavoriteCityRecord } from "@/hooks/useFavoriteCities";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { toast } from "sonner";

interface HeaderProps {
  onUnitChange?: () => void;
  onLocationSelect?: (city: string) => void;
}

const getInitials = (email?: string | null) => {
  if (!email) return "G";
  const handle = email.split("@")[0];
  if (!handle) return "U";
  return handle
    .split(/[\W_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2)
    .padEnd(1, "U");
};

const formatFavoriteQuery = (favorite: FavoriteCityRecord) =>
  [favorite.name, favorite.state, favorite.country].filter(Boolean).join(", ");

export const Header = ({ onUnitChange, onLocationSelect }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { favorites } = useFavoriteCities();
  const { searchHistory } = useSearchHistory();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const favoriteShortlist = useMemo(() => favorites.slice(0, 4), [favorites]);
  const historyShortlist = useMemo(() => searchHistory.slice(0, 5), [searchHistory]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const handleFavoriteSelect = (favorite: FavoriteCityRecord) => {
    const query = formatFavoriteQuery(favorite);
    if (!query) return;
    if (onLocationSelect) {
      onLocationSelect(query);
      toast.success(`Loading weather for ${favorite.name}`);
    } else {
      toast.info("Connect a search handler to load this city.");
    }
  };

  const handleHistorySelect = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    if (onLocationSelect) {
      onLocationSelect(trimmed);
      toast.success(`Revisiting ${trimmed}`);
    } else {
      toast.info("Connect a search handler to revisit this city.");
    }
  };

  const initials = getInitials(user?.email ?? null);
  const primaryLabel = user?.email ? user.email : "Guest";
  const profileLabel = user ? "Signed in as" : "Browsing as";

  return (
    <header className="flex justify-between items-center mb-8">
      <Logo />
      <div className="flex items-center gap-2">
        <UnitToggle onUnitChange={onUnitChange} />
        <ThemeToggle />

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>SkyCast Settings</DialogTitle>
              <DialogDescription>
                Adjust your preferences, default city, and notification options.
              </DialogDescription>
            </DialogHeader>
            <UserPreferences />
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="pl-1 pr-3 h-10 flex items-center gap-2"
              aria-label="Open profile menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-flex flex-col items-start leading-tight">
                <span className="text-xs text-muted-foreground">Account</span>
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {primaryLabel}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-xs uppercase text-muted-foreground">{profileLabel}</span>
              <span className="font-medium text-sm text-foreground truncate">{primaryLabel}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
              Favorites
            </DropdownMenuLabel>
            {favoriteShortlist.length === 0 ? (
              <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                No saved cities yet
              </DropdownMenuItem>
            ) : (
              favoriteShortlist.map((favorite) => (
                <DropdownMenuItem
                  key={favorite.id}
                  onSelect={() => handleFavoriteSelect(favorite)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span className="font-medium text-foreground">{favorite.name}</span>
                  </div>
                  {(favorite.state || favorite.country) && (
                    <span className="pl-5 text-xs text-muted-foreground">
                      {[favorite.state, favorite.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
              Recent searches
            </DropdownMenuLabel>
            {historyShortlist.length === 0 ? (
              <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                No recent searches
              </DropdownMenuItem>
            ) : (
              historyShortlist.map((city, index) => (
                <DropdownMenuItem
                  key={`${city}-${index}`}
                  onSelect={() => handleHistorySelect(city)}
                  className="flex items-center gap-2 text-sm"
                >
                  <History className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">{city}</span>
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Open settings</span>
            </DropdownMenuItem>

            {user ? (
              <DropdownMenuItem onSelect={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => navigate("/auth")} className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span>Sign in</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
