"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CraftingItem } from "@/lib/types";
import { searchItemsByTags } from "@/lib/crafting-data";
import type { SearchTag } from "@/lib/crafting-data";
import { trackEvent } from "@/lib/analytics";

export type { SearchTag };

export function useSearch() {
  const [tags, setTags] = useState<SearchTag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [debouncedTexts, setDebouncedTexts] = useState<string[]>([]);
  const [results, setResults] = useState<CraftingItem[]>([]);
  const searchTracked = useRef(false);

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
    // Track search usage once per session
    if (!searchTracked.current) {
      searchTracked.current = true;
      trackEvent("search");
    }
  }, [debouncedTexts.join("\0")]);

  const addTag = useCallback(
    (value: string | SearchTag) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed && !tags.some((t) => t.text === trimmed)) {
          setTags((prev) => [...prev, { text: trimmed, type: "text" }]);
        }
      } else {
        if (!tags.some((t) => t.text === value.text)) {
          setTags((prev) => [...prev, value]);
        }
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
