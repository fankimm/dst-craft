"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./use-auth";
import { fetchFavorites, updateFavorite } from "@/lib/favorites-api";

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const LOCAL_KEY = "dst-favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load favorites: from server if logged in, otherwise from localStorage
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (token && user) {
        try {
          const items = await fetchFavorites(token);
          if (!cancelled) setFavorites(new Set(items));
        } catch { /* ignore */ }
      } else {
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw) setFavorites(new Set(JSON.parse(raw)));
          else setFavorites(new Set());
        } catch { /* ignore */ }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [token, user]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const action = next.has(id) ? "remove" : "add";
      if (action === "remove") next.delete(id);
      else next.add(id);

      if (token) {
        // Server sync (fire & forget)
        updateFavorite(token, id, action).catch(() => {});
      } else {
        // Save to localStorage
        localStorage.setItem(LOCAL_KEY, JSON.stringify([...next]));

        // Show warning for non-logged-in users
        window.dispatchEvent(new CustomEvent("dst-fav-local-warning"));
      }

      return next;
    });
  }, [token]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, loading }),
    [favorites, isFavorite, toggleFavorite, loading],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
