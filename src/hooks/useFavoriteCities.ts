import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type FavoriteCityRecord = {
  id: string;
  name: string;
  country?: string | null;
  state?: string | null;
  addedAt: number;
};

type FavoriteCityInput = {
  name: string;
  country?: string | null;
  state?: string | null;
};

const STORAGE_KEY_PREFIX = "skycast:favorites";
const FAVORITES_UPDATED_EVENT = "skycast:favoritesUpdated";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const createId = ({ name, country, state }: FavoriteCityInput) => {
  const parts = [name.trim().toLowerCase()];
  if (state) parts.push(state.trim().toLowerCase());
  if (country) parts.push(country.trim().toLowerCase());
  return parts.join("::");
};

const getStorageKey = (userId?: string | null) => {
  if (!userId) return `${STORAGE_KEY_PREFIX}:guest`;
  return `${STORAGE_KEY_PREFIX}:${userId}`;
};

const readFavorites = (key: string): FavoriteCityRecord[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read favorite cities:", error);
    return [];
  }
};

const writeFavorites = (key: string, favorites: FavoriteCityRecord[]) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(favorites));
    window.dispatchEvent(
      new CustomEvent(FAVORITES_UPDATED_EVENT, {
        detail: { key, length: favorites.length },
      })
    );
  } catch (error) {
    console.error("Failed to persist favorite cities:", error);
  }
};

export const useFavoriteCities = () => {
  const { user } = useAuth();
  const storageKeyRef = useRef<string>(getStorageKey(user?.id));
  const [favorites, setFavorites] = useState<FavoriteCityRecord[]>(() => readFavorites(storageKeyRef.current));

  useEffect(() => {
    if (!isBrowser()) {
      setFavorites([]);
      return;
    }
    const key = getStorageKey(user?.id);
    storageKeyRef.current = key;
    setFavorites(readFavorites(key));
  }, [user?.id]);

  useEffect(() => {
    if (!isBrowser()) return;

    const handleChange = (event: Event) => {
      const detailKey = (event as CustomEvent<{ key: string }>).detail?.key;
      const currentKey = storageKeyRef.current;
      if (!detailKey || detailKey === currentKey) {
        setFavorites(readFavorites(currentKey));
      }
    };

  window.addEventListener(FAVORITES_UPDATED_EVENT, handleChange);
  return () => window.removeEventListener(FAVORITES_UPDATED_EVENT, handleChange);
  }, []);

  const persist = (nextFavorites: FavoriteCityRecord[], message?: string) => {
    setFavorites(nextFavorites);
    writeFavorites(storageKeyRef.current, nextFavorites);
    if (message) {
      toast.success(message);
    }
  };

  const addFavorite = ({ name, country = null, state = null }: FavoriteCityInput, silent = false) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const id = createId({ name: trimmedName, country, state });
    if (favorites.some((fav) => fav.id === id)) {
      if (!silent) toast.info(`${trimmedName} is already in favorites`);
      return;
    }

    const nextFavorites = [
      { id, name: trimmedName, country, state, addedAt: Date.now() },
      ...favorites,
    ].slice(0, 50);

    persist(nextFavorites, silent ? undefined : `Saved ${trimmedName} to favorites`);
  };

  const removeFavorite = (id: string) => {
    const existing = favorites.find((fav) => fav.id === id);
    if (!existing) return;
    const nextFavorites = favorites.filter((fav) => fav.id !== id);
    persist(nextFavorites, `Removed ${existing.name} from favorites`);
  };

  const toggleFavorite = (input: FavoriteCityInput) => {
    const id = createId(input);
    const isFav = favorites.some((fav) => fav.id === id);
    if (isFav) {
      removeFavorite(id);
      return false;
    }
    addFavorite(input, true);
    toast.success(`Saved ${input.name} to favorites`);
    return true;
  };

  const isFavorite = (input: FavoriteCityInput) => {
    const id = createId(input);
    return favorites.some((fav) => fav.id === id);
  };

  const clearFavorites = () => {
    persist([], "Cleared favorite cities");
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
};

export type { FavoriteCityRecord, FavoriteCityInput };
