"use client";

import { useState, useCallback, useEffect } from "react";
import { bossCategories, type BossCategoryId } from "@/data/bosses";

export type BossesCategoryValue = BossCategoryId | "favorites" | "recent";

const VALID_REAL = new Set<string>(bossCategories.map((c) => c.id));
const VALID_PSEUDO = new Set<string>(["favorites", "recent"]);

function isValidCategory(v: string): v is BossesCategoryValue {
  return VALID_PSEUDO.has(v) || VALID_REAL.has(v);
}

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function isBossesTab(): boolean {
  return getParams().get("tab") === "bosses";
}

interface BossesUrlState {
  cat: BossesCategoryValue | null;
  boss: string | null;
}

function readUrlState(): BossesUrlState {
  const params = getParams();
  if (params.get("tab") !== "bosses") return { cat: null, boss: null };
  const cat = params.get("cat");
  return {
    cat: cat && isValidCategory(cat) ? cat : null,
    boss: params.get("boss"),
  };
}

export function useBossesState() {
  const [state, setState] = useState<BossesUrlState>(() =>
    typeof window === "undefined" ? { cat: null, boss: null } : readUrlState(),
  );

  useEffect(() => {
    const onPopState = () => {
      if (!isBossesTab()) return;
      setState(readUrlState());
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && isBossesTab()) setState(readUrlState());
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  /** Select a category — pushState. Closes any open boss panel by dropping `boss` param. */
  const selectCategory = useCallback((value: BossesCategoryValue | null) => {
    const params = getParams();
    params.set("tab", "bosses");
    params.delete("boss");
    if (value === null) {
      params.delete("cat");
      const search = params.toString();
      const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
      window.history.replaceState({ _appNav: true }, "", url);
      setState({ cat: null, boss: null });
      return;
    }
    params.set("cat", value);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ _appNav: true }, "", url);
    setState({ cat: value, boss: null });
  }, []);

  /** Open boss detail (push) or close (back if we own the entry, else strip). */
  const selectBoss = useCallback((bossId: string | null) => {
    if (bossId === null) {
      const params = getParams();
      if (!params.has("boss")) {
        // No URL state to roll back — just clear local
        setState((prev) => ({ ...prev, boss: null }));
        return;
      }
      if (window.history.state?._appNav) {
        window.history.back();
        return;
      }
      params.delete("boss");
      const search = params.toString();
      const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
      window.history.replaceState({}, "", url);
      setState((prev) => ({ ...prev, boss: null }));
      return;
    }
    const params = getParams();
    const hadBoss = params.has("boss");
    params.set("tab", "bosses");
    params.set("boss", bossId);
    const url = `${window.location.pathname}?${params.toString()}`;
    if (hadBoss) {
      window.history.replaceState({ _appNav: true }, "", url);
    } else {
      window.history.pushState({ _appNav: true }, "", url);
    }
    setState((prev) => ({ ...prev, boss: bossId }));
  }, []);

  /** Re-read URL into local state. Use after parent (AppShell) pushed a URL directly. */
  const syncFromUrl = useCallback(() => {
    setState(readUrlState());
  }, []);

  return {
    selectedCategory: state.cat,
    selectedBossId: state.boss,
    selectCategory,
    selectBoss,
    syncFromUrl,
  };
}
