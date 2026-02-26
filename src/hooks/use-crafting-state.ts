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
  }, []);

  const setItem = useCallback((item: CraftingItem | null) => {
    if (item === null) {
      const params = getParams();
      if (params.has("item")) {
        if (window.history.state?._jump) {
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
      window.history.replaceState({ _appNav: true }, "", url);
    } else {
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
      window.history.replaceState({ _appNav: true }, "", url);
    } else {
      window.history.pushState({ _appNav: true }, "", url);
    }
    setUrlState((prev) => ({ ...prev, char: characterId, item: null }));
  }, []);

  const jumpToCharacter = useCallback((characterId: string) => {
    const url = `${window.location.pathname}?cat=character&char=${characterId}`;
    window.history.replaceState({ _appNav: true }, "", url);
    setUrlState({ cat: "character", item: null, char: characterId });
  }, []);

  const jumpToCategory = useCallback((category: CategoryId) => {
    const url = new URL(window.location.href);
    url.search = `?cat=${category}`;
    window.history.replaceState({ _appNav: true }, "", url.toString());
    setUrlState({ cat: category, item: null, char: null });
  }, []);

  const navigateToItem = useCallback((item: CraftingItem) => {
    const category = item.category[0] || "tools";
    const url = `${window.location.pathname}?cat=${category}&item=${item.id}`;
    window.history.pushState({ _appNav: true, _jump: true }, "", url);
    setUrlState({ cat: category, item: item.id, char: null });
  }, []);

  const goBack = useCallback(() => {
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

  const goHome = useCallback(() => {
    const url = window.location.pathname;
    window.history.replaceState({ _appNav: true }, "", url);
    setUrlState({ cat: null, item: null, char: null });
  }, []);

  const goToCategory = useCallback(() => {
    const params = getParams();
    params.delete("char");
    params.delete("item");
    const search = params.toString();
    const url = search
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;
    window.history.replaceState({ _appNav: true }, "", url);
    setUrlState(readUrlState());
  }, []);

  return {
    selectedCategory,
    selectedItem,
    selectedCharacter,
    showCategoryGrid,
    setCategory,
    setItem,
    setCharacter,
    goBack,
    goHome,
    goToCategory,
    navigateToItem,
    jumpToCategory,
    jumpToCharacter,
  };
}
