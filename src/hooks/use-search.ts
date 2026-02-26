"use client";

import { useState, useEffect, useCallback } from "react";
import type { CraftingItem } from "@/lib/types";
import { searchItemsByTags, classifyTag } from "@/lib/crafting-data";
import type { SearchTag } from "@/lib/crafting-data";

export type { SearchTag };

export function useSearch() {
  const [tags, setTags] = useState<SearchTag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [debouncedTexts, setDebouncedTexts] = useState<string[]>([]);
  const [results, setResults] = useState<CraftingItem[]>([]);

  // Include inputValue as a live preview tag for real-time filtering
  const effectiveTexts = inputValue.trim()
    ? [...tags.map((t) => t.text), inputValue.trim()]
    : tags.map((t) => t.text);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTexts(effectiveTexts);
    }, 300);
    return () => clearTimeout(timer);
  }, [effectiveTexts.join("\0")]);

  useEffect(() => {
    if (debouncedTexts.length === 0) {
      setResults([]);
      return;
    }
    setResults(searchItemsByTags(debouncedTexts));
  }, [debouncedTexts.join("\0")]);

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed && !tags.some((t) => t.text === trimmed)) {
        setTags((prev) => [...prev, classifyTag(trimmed)]);
      }
      setInputValue("");
    },
    [tags]
  );

  const removeTag = useCallback((index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
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
