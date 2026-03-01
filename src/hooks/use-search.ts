"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CraftingItem } from "@/lib/types";
import { searchItemsByTags } from "@/lib/crafting-data";
import type { SearchTag } from "@/lib/crafting-data";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";

export type { SearchTag };

/** Serialize SearchTag array for useEffect dependency comparison */
function tagKey(tags: SearchTag[]): string {
  return tags.map((t) => `${t.type}\x01${t.text}`).join("\0");
}

export function useSearch() {
  const { isAdmin } = useAuth();
  const [tags, setTags] = useState<SearchTag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [debouncedTags, setDebouncedTags] = useState<SearchTag[]>([]);
  const [results, setResults] = useState<CraftingItem[]>([]);
  const searchTracked = useRef(false);

  // Include inputValue as a live-preview "text" tag for real-time filtering
  const effectiveTags: SearchTag[] = inputValue.trim()
    ? [...tags, { text: inputValue.trim(), type: "text" as const }]
    : tags;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTags(effectiveTags);
    }, 300);
    return () => clearTimeout(timer);
  }, [tagKey(effectiveTags)]);

  useEffect(() => {
    if (debouncedTags.length === 0) {
      setResults([]);
      return;
    }
    setResults(searchItemsByTags(debouncedTags));
    // Track search usage once per session
    if (!searchTracked.current) {
      searchTracked.current = true;
      trackEvent("search", isAdmin);
    }
  }, [tagKey(debouncedTags)]);

  const addTag = useCallback(
    (value: string | SearchTag) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed && !tags.some((t) => t.text === trimmed)) {
          setTags((prev) => [...prev, { text: trimmed, type: "text" }]);
        }
      } else {
        if (!tags.some((t) => t.text === value.text && t.type === value.type)) {
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
