"use client";

import { useState, useEffect } from "react";
import type { CraftingItem } from "@/lib/types";
import { searchItems } from "@/lib/crafting-data";

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<CraftingItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setResults([]);
      return;
    }
    const items = searchItems(debouncedQuery);
    setResults(items);
  }, [debouncedQuery]);

  return {
    results,
    debouncedQuery,
    isLoading: query !== debouncedQuery,
  };
}
