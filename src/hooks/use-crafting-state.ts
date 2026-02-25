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

export function useCraftingState() {
  const [urlState, setUrlState] = useState(readUrlState);
  const [searchQuery, setSearchQueryState] = useState("");

  const isSearching = searchQuery.trim().length > 0;
  const showCategoryGrid = !urlState.cat;
  const selectedCategory: CategoryId = urlState.cat || "tools";
  const selectedItem = urlState.item ? (getItemById(urlState.item) ?? null) : null;
  const selectedCharacter = urlState.char;

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handler = () => setUrlState(readUrlState());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const setCategory = useCallback((category: CategoryId) => {
    const url = new URL(window.location.href);
    url.search = `?cat=${category}`;
    window.history.pushState({}, "", url.toString());
    setUrlState({ cat: category, item: null, char: null });
    setSearchQueryState("");
  }, []);

  const setItem = useCallback((item: CraftingItem | null) => {
    if (item === null) {
      // Deselecting: go back if item was in URL
      const params = getParams();
      if (params.has("item")) {
        window.history.back();
      }
      return;
    }

    const params = getParams();
    const hadItem = params.has("item");
    params.set("item", item.id);
    const url = `${window.location.pathname}?${params.toString()}`;

    if (hadItem) {
      // Switching items: replace current entry
      window.history.replaceState({}, "", url);
    } else {
      // First item selection: push new entry
      window.history.pushState({}, "", url);
    }
    setUrlState((prev) => ({ ...prev, item: item.id }));
  }, []);

  const setCharacter = useCallback((characterId: string | null) => {
    const params = getParams();
    if (characterId) {
      params.set("char", characterId);
    } else {
      params.delete("char");
    }
    params.delete("item");
    const url = `${window.location.pathname}?${params.toString()}`;
    // Always replace - character selection is part of the same category page
    window.history.replaceState({}, "", url);
    setUrlState((prev) => ({ ...prev, char: characterId, item: null }));
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
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
  };
}
