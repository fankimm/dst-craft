"use client";

import { useState, useCallback, useEffect } from "react";
import type { CookingStation } from "@/data/recipes";

// ---------------------------------------------------------------------------
// Types (exported for CookingApp)
// ---------------------------------------------------------------------------

export type RecommendCategoryId = "recommend_health" | "recommend_sanity" | "recommend_hunger";
export type CookingCategoryId = "all" | "favorites" | CookingStation | RecommendCategoryId;

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function isCookingTab(): boolean {
  return getParams().get("tab") === "cooking";
}

function readUrlState() {
  const params = getParams();
  if (params.get("tab") !== "cooking") {
    return { cat: null as CookingCategoryId | null, recipe: null as string | null };
  }
  return {
    cat: (params.get("cat") as CookingCategoryId) || null,
    recipe: params.get("recipe"),
  };
}

// SSR-safe default: always start empty to match server render
const SSR_DEFAULT = { cat: null as CookingCategoryId | null, recipe: null as string | null };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCookingState() {
  const [urlState, setUrlState] = useState(SSR_DEFAULT);

  const showCategoryGrid = !urlState.cat;
  const selectedCategory = urlState.cat;
  const selectedRecipeId = urlState.recipe;

  // Sync from URL after mount (hydration-safe)
  useEffect(() => {
    setUrlState(readUrlState());
  }, []);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const onPopState = () => {
      // Only sync when on cooking tab
      if (!isCookingTab()) return;
      setUrlState(readUrlState());
    };
    window.addEventListener("popstate", onPopState);
    // Sync state when page is restored from bfcache (Safari back/forward)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && isCookingTab()) setUrlState(readUrlState());
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // Select a category — pushState
  const selectCategory = useCallback((cat: CookingCategoryId) => {
    const url = `${window.location.pathname}?tab=cooking&cat=${cat}`;
    window.history.pushState({ _appNav: true }, "", url);
    setUrlState({ cat, recipe: null });
  }, []);

  // Select a recipe — first push, subsequent replace (same pattern as crafting setItem)
  const selectRecipe = useCallback((recipeId: string | null) => {
    if (recipeId === null) {
      // Close recipe
      const params = getParams();
      if (params.has("recipe")) {
        if (window.history.state?._jump) {
          params.delete("recipe");
          const search = params.toString();
          const url = search
            ? `${window.location.pathname}?${search}`
            : window.location.pathname;
          window.history.replaceState({ _appNav: true }, "", url);
          setUrlState(readUrlState());
        } else if (window.history.state?._appNav) {
          window.history.back();
        } else {
          params.delete("recipe");
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

    // Open / switch recipe
    const params = getParams();
    const hadRecipe = params.has("recipe");
    params.set("tab", "cooking");
    if (!params.has("cat")) params.set("cat", "all");
    params.set("recipe", recipeId);
    const url = `${window.location.pathname}?${params.toString()}`;

    if (hadRecipe) {
      window.history.replaceState({ _appNav: true }, "", url);
    } else {
      window.history.pushState({ _appNav: true }, "", url);
    }
    setUrlState({ cat: (params.get("cat") as CookingCategoryId) || "all", recipe: recipeId });
  }, []);

  // Open recipe from external source (cookpot → cooking shortcut)
  // Uses replaceState so back goes to the source tab, not intermediate states
  const openRecipeFromExternal = useCallback((recipeId: string, category: CookingCategoryId = "all") => {
    const url = `${window.location.pathname}?tab=cooking&cat=${category}&recipe=${recipeId}`;
    window.history.replaceState({ _appNav: true, _jump: true }, "", url);
    setUrlState({ cat: category, recipe: recipeId });
  }, []);

  // Go home — replaceState to cooking home
  const goHome = useCallback(() => {
    const url = `${window.location.pathname}?tab=cooking`;
    window.history.replaceState({ _appNav: true }, "", url);
    setUrlState({ cat: null, recipe: null });
  }, []);

  return {
    selectedCategory,
    selectedRecipeId,
    showCategoryGrid,
    selectCategory,
    selectRecipe,
    openRecipeFromExternal,
    goHome,
  };
}
