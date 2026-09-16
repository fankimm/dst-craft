"use client";

import { useState, useCallback } from "react";
import type { CategoryId, CraftingItem } from "@/lib/types";
import { getItemById } from "@/lib/crafting-data";
import { useUrlStateSync } from "./use-url-state";
import { useTabSync } from "./use-tab-sync";

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

interface CraftingUrlState {
  cat: CategoryId | null;
  item: string | null;
  char: string | null;
}

function readUrlState(): CraftingUrlState {
  const params = getParams();
  // `tab` 이 있으면 다른 탭의 URL 이다 (제작 탭은 tab 파라미터를 쓰지 않는다) → 선택 없음.
  // `?tab=cooking&cat=all` 의 `cat` 을 제작 카테고리로 읽으면 안 된다.
  if (params.get("tab")) return { cat: null, item: null, char: null };
  return {
    cat: (params.get("cat") as CategoryId) || null,
    item: params.get("item"),
    char: params.get("char"),
  };
}

// SSR-safe default: always start empty to match server render
const SSR_DEFAULT: CraftingUrlState = { cat: null, item: null, char: null };

export function useCraftingState() {
  // 첫 렌더는 서버와 동일한 SSR_DEFAULT, layout effect에서 URL을 반영한다.
  // (딥링크 플리커 없이 hydration mismatch도 없는 구조 — useUrlStateSync 주석 참고)
  const [urlState, setUrlState] = useState(SSR_DEFAULT);
  useUrlStateSync(readUrlState, setUrlState);
  const [itemHistory, setItemHistory] = useState<string[]>([]);

  const showCategoryGrid = !urlState.cat;
  const selectedCategory: CategoryId = urlState.cat || "tools";
  const selectedItem = urlState.item ? (getItemById(urlState.item) ?? null) : null;
  const selectedCharacter = urlState.char;
  const previousItem = itemHistory.length > 0 ? (getItemById(itemHistory[itemHistory.length - 1]) ?? null) : null;

  // 뒤로가기·탭 전환·bfcache 복원 때 URL 을 다시 읽는다. 다른 탭 URL 이면 readUrlState 가
  // 초기값을 주므로 열린 시트가 닫히고 스크롤 잠금이 풀린다 (#105).
  useTabSync(() => setUrlState(readUrlState()));

  const setCategory = useCallback((category: CategoryId) => {
    const url = new URL(window.location.href);
    url.search = `?cat=${category}`;
    window.history.pushState({ _appNav: true }, "", url.toString());
    setUrlState({ cat: category, item: null, char: null });
  }, []);

  const setItem = useCallback((item: CraftingItem | null) => {
    if (item === null) {
      setItemHistory([]);
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
    const currentItemId = getParams().get("item");
    if (currentItemId) {
      setItemHistory(prev => [...prev, currentItemId]);
    }
    const category = item.category[0] || "tools";
    const charId = item.characterOnly ?? null;
    const url = charId
      ? `${window.location.pathname}?cat=${category}&char=${charId}&item=${item.id}`
      : `${window.location.pathname}?cat=${category}&item=${item.id}`;
    window.history.pushState({ _appNav: true, _jump: true }, "", url);
    setUrlState({ cat: category, item: item.id, char: charId });
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

  const goBackToItem = useCallback(() => {
    if (itemHistory.length === 0) return;
    setItemHistory(prev => prev.slice(0, -1));
    window.history.back();
  }, [itemHistory.length]);

  const goHome = useCallback(() => {
    setItemHistory([]);
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
    previousItem,
    setCategory,
    setItem,
    setCharacter,
    goBack,
    goBackToItem,
    goHome,
    goToCategory,
    navigateToItem,
    jumpToCategory,
    jumpToCharacter,
  };
}
