"use client";

import { useState, useCallback } from "react";
import { FARM_CROPS, FARM_SEASONS, type FarmSeason } from "@/data/farming";
import { useUrlStateSync } from "./use-url-state";
import { useTabSync } from "./use-tab-sync";

export type FarmingView = "combos" | "crops" | "guide";

interface FarmingUrlState {
  view: FarmingView;
  season: FarmSeason;
  /** 조합 목록을 이 작물이 들어간 것만으로 거른다 */
  withCrop: string | null;
  /** 상세 시트에 띄운 작물 */
  crop: string | null;
}

const VIEWS = new Set<string>(["combos", "crops", "guide"]);
const CROP_IDS = new Set(FARM_CROPS.map((c) => c.id));

// SSR-safe default: 서버 렌더와 같아야 한다
const SSR_DEFAULT: FarmingUrlState = { view: "combos", season: "spring", withCrop: null, crop: null };

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function readUrlState(): FarmingUrlState {
  const params = getParams();
  if (params.get("tab") !== "farming") return SSR_DEFAULT;
  const view = params.get("view");
  const season = params.get("season");
  const withCrop = params.get("with");
  const crop = params.get("crop");
  return {
    view: view && VIEWS.has(view) ? (view as FarmingView) : "combos",
    season: FARM_SEASONS.includes(season as FarmSeason) ? (season as FarmSeason) : "spring",
    withCrop: withCrop && CROP_IDS.has(withCrop) ? withCrop : null,
    crop: crop && CROP_IDS.has(crop) ? crop : null,
  };
}

function buildUrl(next: FarmingUrlState): string {
  const params = getParams();
  params.set("tab", "farming");
  const set = (key: string, value: string | null, fallback?: string) => {
    if (value === null || value === fallback) params.delete(key);
    else params.set(key, value);
  };
  set("view", next.view, "combos");
  set("season", next.season, "spring");
  set("with", next.withCrop);
  set("crop", next.crop);
  return `${window.location.pathname}?${params.toString()}`;
}

/** 보기·계절·거르기 전환은 현재 항목을 고쳐 쓰되, 시트가 쌓은 `_appNav` 표시는 보존한다 */
const keepNav = () => Boolean(window.history.state?._appNav);

export function useFarmingState() {
  const [state, setState] = useState<FarmingUrlState>(SSR_DEFAULT);
  useUrlStateSync(readUrlState, setState);
  // 뒤로가기·탭 전환·bfcache 복원 때 URL 을 다시 읽는다. 다른 탭 URL 에서는 초기값이 나오므로
  // 탭을 떠나면 시트가 자연히 닫힌다 (#105).
  useTabSync(() => setState(readUrlState()));

  // URL 이 단일 진실 공급원이다. 다음 상태는 항상 URL 에서 다시 읽어 만든다 — setState 업데이터
  // 안에서 history 를 건드리면 StrictMode 의 이중 호출로 pushState 가 두 번 나간다.
  const write = useCallback((patch: Partial<FarmingUrlState>, mode: "push" | "replace", appNav: boolean) => {
    const next = { ...readUrlState(), ...patch };
    const historyState = appNav ? { _appNav: true } : {};
    if (mode === "push") window.history.pushState(historyState, "", buildUrl(next));
    else window.history.replaceState(historyState, "", buildUrl(next));
    setState(next);
  }, []);

  /** 화면 안 전환(보기·계절·거르기)은 히스토리를 쌓지 않는다 */
  const setView = useCallback((view: FarmingView) => write({ view }, "replace", keepNav()), [write]);
  const setSeason = useCallback((season: FarmSeason) => write({ season }, "replace", keepNav()), [write]);
  const setWithCrop = useCallback((withCrop: string | null) => write({ withCrop }, "replace", keepNav()), [write]);

  /** 작물 상세 열기(push) / 닫기(우리가 쌓은 항목이면 back) */
  const selectCrop = useCallback((cropId: string | null) => {
    if (cropId === null) {
      if (getParams().has("crop") && window.history.state?._appNav) {
        window.history.back(); // popstate → useTabSync 가 상태를 맞춘다
        return;
      }
      write({ crop: null }, "replace", false);
      return;
    }
    write({ crop: cropId }, getParams().has("crop") ? "replace" : "push", true);
  }, [write]);

  /** 작물 상세에서 "이 작물이 들어간 조합 보기" — 시트를 닫고 조합 보기로 간다 */
  const showCombosWith = useCallback((cropId: string, season: FarmSeason) => {
    write({ view: "combos", season, withCrop: cropId, crop: null }, "replace", false);
  }, [write]);

  return { ...state, setView, setSeason, setWithCrop, selectCrop, showCombosWith };
}
