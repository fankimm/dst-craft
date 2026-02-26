"use client";

import { useState, useEffect, useCallback } from "react";
import type { CraftingItem } from "@/lib/types";
import { searchItemsByTags } from "@/lib/crafting-data";

export function useSearch() {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  const [results, setResults] = useState<CraftingItem[]>([]);

  // Include inputValue as a live preview tag for real-time filtering
  const effectiveTags = inputValue.trim()
    ? [...tags, inputValue.trim()]
    : tags;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTags(effectiveTags);
    }, 300);
    return () => clearTimeout(timer);
  }, [effectiveTags.join("\0")]);

  useEffect(() => {
    if (debouncedTags.length === 0) {
      setResults([]);
      return;
    }
    setResults(searchItemsByTags(debouncedTags));
  }, [debouncedTags.join("\0")]);

  const addTag = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setInputValue("");
  }, [tags]);

  const removeTag = useCallback((index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setTags([]);
    setInputValue("");
  }, []);

  const isSearching = tags.length > 0 || inputValue.trim().length > 0;

  return {
    tags,
    inputValue,
    setInputValue,
    addTag,
    removeTag,
    clearAll,
    results,
    isSearching,
  };
}
