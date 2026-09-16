"use client";

import { useState, useCallback } from "react";
import type { CookingStation } from "@/data/recipes";
import { useUrlStateSync } from "./use-url-state";
import { useTabSync } from "./use-tab-sync";

// ---------------------------------------------------------------------------
// Types (exported for CookingApp)
// ---------------------------------------------------------------------------

export type RecommendCategoryId = "recommend_health" | "recommend_sanity" | "recommend_hunger";
/** Synthetic category — items eaten without cooking, sourced from `src/data/raw-foods.ts`. */
export type RawCategoryId = "raw";
export type CookingCategoryId = "all" | "favorites" | "recent" | CookingStation | RecommendCategoryId | RawCategoryId;

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
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
  // 첫 렌더는 서버와 동일한 SSR_DEFAULT, layout effect에서 URL을 반영한다.
  const [urlState, setUrlState] = useState(SSR_DEFAULT);
  useUrlStateSync(readUrlState, setUrlState);

  const showCategoryGrid = !urlState.cat;
  const selectedCategory = urlState.cat;
  const selectedRecipeId = urlState.recipe;

  // 뒤로가기·탭 전환·bfcache 복원 때 URL 을 다시 읽는다. 예전엔 "요리 탭이 아니면 return"
  // 했는데, 그러면 요리솥→레시피에서 Back(→ ?tab=cookpot) 했을 때 시트가 숨은 요리 탭에
  // 열린 채 남아 스크롤 잠금이 잔존했다 (#105). readUrlState 는 다른 탭 URL 에서 초기값을
  // 주므로 무조건 덮어써도 된다.
  useTabSync(() => setUrlState(readUrlState()));

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
      if (!params.has("recipe")) {
        // URL 엔 레시피가 없는데 시트가 열려 있는 상태 — 로컬만 닫는다 (보스 탭과 동일).
        // 이게 없으면 X·오버레이가 아무 일도 안 해서 리로드 말고는 닫을 방법이 없다 (#105).
        setUrlState((prev) => ({ ...prev, recipe: null }));
        return;
      }
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
