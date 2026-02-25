"use client";

import { useState, useCallback } from "react";
import type { CategoryId, CraftingItem } from "@/lib/types";

export interface CraftingState {
  selectedCategory: CategoryId;
  selectedItem: CraftingItem | null;
  selectedCharacter: string | null;
  searchQuery: string;
  isSearching: boolean;
}

export interface CraftingActions {
  setCategory: (category: CategoryId) => void;
  setItem: (item: CraftingItem | null) => void;
  setCharacter: (characterId: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export function useCraftingState(): CraftingState & CraftingActions {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("tools");
  const [selectedItem, setSelectedItem] = useState<CraftingItem | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQueryState] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const setCategory = useCallback((category: CategoryId) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setSelectedCharacter(null);
    setSearchQueryState("");
  }, []);

  const setItem = useCallback((item: CraftingItem | null) => {
    setSelectedItem(item);
  }, []);

  const setCharacter = useCallback((characterId: string | null) => {
    setSelectedCharacter(characterId);
    setSelectedItem(null);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    if (query.trim().length > 0) {
      setSelectedItem(null);
    }
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
    setCategory,
    setItem,
    setCharacter,
    setSearchQuery,
    clearSearch,
  };
}
