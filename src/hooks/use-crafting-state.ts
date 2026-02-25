"use client";

import { useState, useCallback, useEffect } from "react";
import type { CategoryId, CraftingItem } from "@/lib/types";
import { getItemById } from "@/lib/crafting-data";

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function readUrlState() {
  const params = getParams();
  return {
    cat: (params.get("cat") as CategoryId) || null,
    item: params.get("item"),
    char: params.get("char"),
  };
}

// SSR-safe default: always start empty to match server render
const SSR_DEFAULT = { cat: null as CategoryId | null, item: null as string | null, char: null as string | null };

export function useCraftingState() {
  const [urlState, setUrlState] = useState(SSR_DEFAULT);
  const [searchQuery, setSearchQueryState] = useState("");

  const isSearching = searchQuery.trim().length > 0;
  const showCategoryGrid = !urlState.cat;
  const selectedCategory: CategoryId = urlState.cat || "tools";
  const selectedItem = urlState.item ? (getItemById(urlState.item) ?? null) : null;
  const selectedCharacter = urlState.char;

  // Sync from URL after mount (hydration-safe)
  useEffect(() => {
    setUrlState(readUrlState());
  }, []);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handler = () => setUrlState(readUrlState());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const setCategory = useCallback((category: CategoryId) => {
    const url = new URL(window.location.href);
    url.search = `?cat=${category}`;
    window.history.pushState({ _appNav: true }, "", url.toString());
    setUrlState({ cat: category, item: null, char: null });
    setSearchQueryState("");
  }, []);

  const setItem = useCallback((item: CraftingItem | null) => {
    if (item === null) {
      // Deselecting: go back if item was in URL
      const params = getParams();
      if (params.has("item")) {
        if (window.history.state?._jump) {
          // Navigated here via material/item jump — just remove item param
          params.delete("item");
          const search = params.toString();
          const url = search
            ? `${window.location.pathname}?${search}`
            : window.location.pathname;
          window.history.replaceState({ _appNav: true }, "", url);
          setUrlState(readUrlState());
        } else if (window.history.state?._appNav) {
          window.history.back();
        } else {
          // Direct URL access — navigate to parent
          params.delete("item");
          const search = params.toString();
          const url = search
            ? `${window.location.pathname}?${search}`
            : window.location.pathname;
          window.history.replaceState({}, "", url);
          setUrlState(readUrlState());
        }
      }
      return;
    }

    const params = getParams();
    const hadItem = params.has("item");
    params.set("item", item.id);
    const url = `${window.location.pathname}?${params.toString()}`;

    if (hadItem) {
      // Switching items: replace current entry
      window.history.replaceState({ _appNav: true }, "", url);
    } else {
      // First item selection: push new entry
      window.history.pushState({ _appNav: true }, "", url);
    }
    setUrlState((prev) => ({ ...prev, item: item.id }));
  }, []);

  const setCharacter = useCallback((characterId: string | null) => {
    const params = getParams();
    const hadChar = params.has("char");
    if (characterId) {
      params.set("char", characterId);
    } else {
      params.delete("char");
    }
    params.delete("item");
    const url = `${window.location.pathname}?${params.toString()}`;
    if (hadChar) {
      // Switching characters: replace current entry
      window.history.replaceState({ _appNav: true }, "", url);
    } else {
      // First character selection: push new entry
      window.history.pushState({ _appNav: true }, "", url);
    }
    setUrlState((prev) => ({ ...prev, char: characterId, item: null }));
  }, []);

  // Navigate to a character's items by replacing current history entry
  const jumpToCharacter = useCallback((characterId: string) => {
    const url = `${window.location.pathname}?cat=character&char=${characterId}`;
    window.history.replaceState({ _appNav: true }, "", url);
    setUrlState({ cat: "character", item: null, char: characterId });
    setSearchQueryState("");
  }, []);

  // Navigate to a category by replacing current history entry
  // Used when jumping from item detail to a different category
  const jumpToCategory = useCallback((category: CategoryId) => {
    const url = new URL(window.location.href);
    url.search = `?cat=${category}`;
    window.history.replaceState({ _appNav: true }, "", url.toString());
    setUrlState({ cat: category, item: null, char: null });
    setSearchQueryState("");
  }, []);

  const navigateToItem = useCallback((item: CraftingItem) => {
    const category = item.category[0] || "tools";
    const url = `${window.location.pathname}?cat=${category}&item=${item.id}`;
    window.history.pushState({ _appNav: true, _jump: true }, "", url);
    setUrlState({ cat: category, item: item.id, char: null });
    setSearchQueryState("");
  }, []);

  const goBack = useCallback(() => {
    // Always navigate to logical parent depth (hierarchical navigation)
    const params = getParams();
    if (params.has("item")) {
      params.delete("item");
    } else if (params.has("char")) {
      params.delete("char");
      params.delete("item");
    } else if (params.has("cat")) {
      params.delete("cat");
      params.delete("item");
    }
    const search = params.toString();
    const url = search
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;
    window.history.replaceState({ _appNav: true }, "", url);
    setUrlState(readUrlState());
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
  }, []);

  return {
    selectedCategory,
    selectedItem,
    selectedCharacter,
    searchQuery,
    isSearching,
    showCategoryGrid,
    setCategory,
    setItem,
    setCharacter,
    setSearchQuery,
    clearSearch,
    goBack,
    navigateToItem,
    jumpToCategory,
    jumpToCharacter,
  };
}
