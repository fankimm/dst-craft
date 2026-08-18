"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { CraftingApp } from "./crafting/CraftingApp";
import { CookingApp } from "./cooking/CookingApp";
import { CookpotApp } from "./cookpot/CookpotApp";
import { BossesApp } from "./bosses/BossesApp";
import { SettingsPage } from "./settings/SettingsPage";
import { SkillSimulatorApp } from "./skills/SkillSimulatorApp";
import { SkinsApp } from "./skins/SkinsApp";
import { ConsoleApp } from "./console/ConsoleApp";
import { QuestsApp } from "./quests/QuestsApp";
import { ReviewPrompt } from "./ReviewPrompt";
import { FloatingSupportPill } from "./ui/FloatingSupportPill";
import { LegacyPwaNotice } from "./ui/LegacyPwaNotice";
import { AdSlot } from "./ads/AdSlot";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { useUrlStateSync } from "@/hooks/use-url-state";
import { t } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TabId = "crafting" | "cooking" | "cookpot" | "bosses" | "skills" | "skins" | "quests" | "console" | "settings";

const allTabs: { id: TabId; labelKey: TranslationKey; image?: string; adminOnly?: boolean }[] = [
  { id: "crafting", labelKey: "tab_crafting", image: "/images/category-icons/tools.png" },
  { id: "cooking", labelKey: "tab_cooking", image: "/images/category-icons/cooking.png" },
  { id: "cookpot", labelKey: "tab_cookpot", image: "/images/game-items/cookpot.png" },
  { id: "bosses", labelKey: "tab_bosses", image: "/images/game-items/deerclops_eyeball.png" },
  { id: "skills", labelKey: "tab_skills", image: "/images/ui/skill_eye.png" },
  { id: "skins", labelKey: "tab_skins", image: "/images/skins/axe_heart.png" },
  { id: "quests", labelKey: "tab_quests", image: "/images/game-items/hermitcrab_npc.png" },
  { id: "console", labelKey: "tab_console", image: "/images/game-items/papyrus.png" },
  { id: "settings", labelKey: "tab_settings", image: "/images/game-items/gears.png" },
];

/** Read tab from current URL. No `tab` param → crafting (backwards compat). */
function readTabFromUrl(): TabId {
  if (typeof window === "undefined") return "crafting";
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "cooking" || tab === "cookpot" || tab === "bosses" || tab === "skills" || tab === "skins" || tab === "quests" || tab === "console" || tab === "settings") return tab;
  return "crafting";
}

export function AppShell() {
  // 첫 렌더는 서버와 동일한 "crafting", layout effect에서 URL의 tab을 반영한다.
  const [activeTab, setActiveTab] = useState<TabId>("crafting");
  useUrlStateSync(readTabFromUrl, setActiveTab);
  const { resolvedLocale, devMenuEnabled } = useSettings();
  const { isAdmin, token } = useAuth();
  const isDev = process.env.NODE_ENV === "development";
  const tabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin || isDev);
  const showDevMenu = (isDev || isAdmin) && devMenuEnabled;
  const [toast, setToast] = useState<string | null>(null);
  const [pendingRecipeId, setPendingRecipeId] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Listen to popstate — sync tab from URL (browser back/forward)
  useEffect(() => {
    const onPopState = () => {
      setActiveTab(readTabFromUrl());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Review prompt trigger — show after 60s of active usage
  useEffect(() => {
    const dismissed = localStorage.getItem("dst:review-dismissed");
    if (dismissed === "permanent") return;
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (!isNaN(dismissedAt) && Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }
    if (sessionStorage.getItem("dst:review-shown")) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem("dst:review-shown", "1");
      setShowReview(true);
    }, 60_000);
    return () => clearTimeout(timer);
  }, []);

  const handleReviewClose = useCallback(() => {
    setShowReview(false);
  }, []);

  // Tab click handler — pushState + setActiveTab
  // Re-tapping active tab navigates to tab home
  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId === activeTab) {
      window.dispatchEvent(new CustomEvent("dst-tab-go-home"));
      return;
    }
    let url: string;
    if (tabId === "crafting") {
      // Crafting uses no tab param (backwards compat) — clear all params
      url = window.location.pathname;
    } else {
      url = `${window.location.pathname}?tab=${tabId}`;
    }
    window.history.pushState({ _appNav: true }, "", url);
    setActiveTab(tabId);
    window.dispatchEvent(new CustomEvent("dst-tab-switch"));
  }, [activeTab]);

  // Cookpot → Cooking recipe shortcut
  const handleViewRecipe = useCallback((recipeId: string) => {
    // Push a cooking tab URL so back returns to cookpot
    const url = `${window.location.pathname}?tab=cooking`;
    window.history.pushState({ _appNav: true }, "", url);
    setPendingRecipeId(recipeId);
    setActiveTab("cooking");
  }, []);

  const handleClearPendingRecipe = useCallback(() => {
    setPendingRecipeId(null);
  }, []);

  // Boss/Cooking/Skill/Quest → Crafting item shortcut.
  // originTab: 외부 진입 시 DetailPanel에 표시할 "← <label>" 빠른 뒤로 버튼 + 클릭 시 돌아갈 탭
  const [craftingBack, setCraftingBack] = useState<{ tab: TabId; label: string } | null>(null);
  const handleViewCraftingItem = useCallback((itemId: string, origin?: { tab: TabId; label: string }) => {
    const url = `${window.location.pathname}`;
    window.history.pushState({ _appNav: true }, "", url);
    setPendingItemId(itemId);
    setCraftingBack(origin ?? null);
    setActiveTab("crafting");
  }, []);

  const handleClearPendingItem = useCallback(() => {
    setPendingItemId(null);
  }, []);

  const handleExternalBack = useCallback(() => {
    if (!craftingBack) return;
    const target = craftingBack.tab;
    const url = target === "crafting" ? window.location.pathname : `${window.location.pathname}?tab=${target}`;
    window.history.pushState({ _appNav: true }, "", url);
    setCraftingBack(null);
    setActiveTab(target);
  }, [craftingBack]);

  // 사용자가 탭바를 직접 누르거나 brower back으로 crafting을 떠나면 외부 back 라벨 해제
  useEffect(() => {
    if (activeTab !== "crafting" && craftingBack) {
      setCraftingBack(null);
    }
  }, [activeTab, craftingBack]);

  // Crafting → Boss loot search
  const [pendingLootItemId, setPendingLootItemId] = useState<string | null>(null);

  const handleBlueprintClick = useCallback((itemId: string) => {
    const url = `${window.location.pathname}?tab=bosses`;
    window.history.pushState({ _appNav: true }, "", url);
    setPendingLootItemId(itemId);
    setActiveTab("bosses");
  }, []);

  const handleClearPendingLoot = useCallback(() => {
    setPendingLootItemId(null);
  }, []);

  // Quest → Boss detail jump
  const [pendingBossId, setPendingBossId] = useState<string | null>(null);
  const [bossesBack, setBossesBack] = useState<{ tab: TabId; label: string } | null>(null);
  const handleViewBoss = useCallback((bossId: string, origin?: { tab: TabId; label: string }) => {
    const url = `${window.location.pathname}?tab=bosses&boss=${bossId}`;
    window.history.pushState({ _appNav: true }, "", url);
    setPendingBossId(bossId);
    setBossesBack(origin ?? null);
    setActiveTab("bosses");
  }, []);
  const handleClearPendingBoss = useCallback(() => {
    setPendingBossId(null);
  }, []);
  const handleBossesExternalBack = useCallback(() => {
    if (!bossesBack) return;
    const target = bossesBack.tab;
    const url = target === "crafting" ? window.location.pathname : `${window.location.pathname}?tab=${target}`;
    window.history.pushState({ _appNav: true }, "", url);
    setBossesBack(null);
    setActiveTab(target);
  }, [bossesBack]);
  // 사용자가 보스 탭을 떠나면 외부 back 라벨 해제
  useEffect(() => {
    if (activeTab !== "bosses" && bossesBack) {
      setBossesBack(null);
    }
  }, [activeTab, bossesBack]);

  const handleSkillClick = useCallback((skillId: string) => {
    // Extract character from skill ID (e.g., "wilson_alchemy_1" → "wilson")
    const charPrefixes = ["wilson", "willow", "wendy", "woodie", "wathgrithr", "wormwood", "winona", "wortox", "wurt", "walter", "wolfgang", "wx78"];
    // Map internal IDs to display IDs used in skill tree URL
    const charMap: Record<string, string> = { wathgrithr: "wigfrid", wx78: "wx-78" };
    let charId = "";
    for (const prefix of charPrefixes) {
      if (skillId.startsWith(prefix + "_")) {
        charId = charMap[prefix] ?? prefix;
        break;
      }
    }
    if (!charId) return;
    const url = `${window.location.pathname}?tab=skills&char=${charId}`;
    window.history.pushState({ _appNav: true }, "", url);
    setActiveTab("skills");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  // Listen for local-only favorites warning
  useEffect(() => {
    const handler = () => {
      setToast(t(resolvedLocale, "favorites_local_warning"));
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("dst-fav-local-warning", handler);
    return () => window.removeEventListener("dst-fav-local-warning", handler);
  }, [resolvedLocale]);

  // Generic toast event listener (used by ShareButton etc.)
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      if (typeof msg === "string") {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
      }
    };
    window.addEventListener("dst-toast", handler);
    return () => window.removeEventListener("dst-toast", handler);
  }, []);

  // Lock body scroll + iOS Safari keyboard viewport fix.
  // iOS Safari doesn't properly recalculate 100dvh when the virtual keyboard
  // opens/closes, leaving a white gap. Using visualViewport.height directly
  // ensures the layout always matches the actual visible area.
  //
  // #58/#60: 높이는 body가 아니라 앱 루트 컨테이너(fixed)에 건다.
  // body height를 잠그는 방식은 서드파티(Ezoic CMP 등)가 body에 iframe/div를
  // flow로 삽입하면 앱이 밀려 하단이 잘리고 흰 공간이 생겼다. fixed 컨테이너는
  // body 형제 요소의 영향을 받지 않으므로 구조적으로 면역.
  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    // 문서 높이를 CSS 동적 단위로 잠근다 (px 스냅샷 금지 — #60에서 iOS
    // 흰 공간의 원인이 스냅샷 고정이었음). CMP가 body에 뭘 붙여도
    // scrollHeight가 뷰포트를 넘지 않아 iOS의 문서 스크롤 자체가 안 생긴다.
    root.style.height = "100dvh";
    body.style.height = "100dvh";

    // iOS는 overflow:hidden을 무시하고 문서를 밀 때가 있다 (CMP의 hidden
    // iframe focus 등). 문서 오프셋이 생기면 fixed 요소도 같이 밀려 하단이
    // 노출되므로, 스크롤을 항상 (0,0)으로 되돌린다.
    const pinScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
    };
    window.addEventListener("scroll", pinScroll, { passive: true });

    const vv = window.visualViewport;
    const shell = shellRef.current;
    let cleanupVv = () => {};
    if (vv && shell) {
      let prevHeight = vv.height;
      const syncHeight = () => {
        // 키보드로 인한 대폭 축소일 때만 px로 고정한다. 그 외의 vv 변동
        // (URL바 확장/축소, CMP 스크립트가 유발하는 미세 진동 — #58/#60)은
        // 기본값 100dvh가 브라우저 기준으로 항상 옳으므로 덮어쓰지 않는다.
        // iOS에서 키보드는 innerHeight를 안 바꾸고 vv.height만 줄이므로
        // 그 차이(>150px)로 키보드 여부를 판별할 수 있다.
        const keyboardOpen = window.innerHeight - vv.height > 150;
        shell.style.height = keyboardOpen ? `${vv.height}px` : "";
        if (vv.height > prevHeight) window.scrollTo(0, 0);
        prevHeight = vv.height;
      };
      vv.addEventListener("resize", syncHeight);
      cleanupVv = () => {
        vv.removeEventListener("resize", syncHeight);
        shell.style.height = "";
      };
    }

    return () => {
      cleanupVv();
      window.removeEventListener("scroll", pinScroll);
      root.style.overflow = "";
      root.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="fixed inset-x-0 top-0 h-dvh flex flex-col bg-background text-foreground overflow-hidden"
    >
      {/* Status bar cover — sits above overlays so status bar area never dims */}
      <div
        className="fixed top-0 inset-x-0 bg-background z-[60]"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      {/* Tab bar */}
      <div
        className="flex items-center justify-between gap-4 border-b border-border bg-background shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <BetaTabIndicator />
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "shrink-0 flex items-center justify-center gap-1 px-0 py-2 text-xs font-medium transition-colors relative touch-manipulation",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {tab.image ? (
                <Image
                  src={tab.image}
                  alt=""
                  width={16}
                  height={16}
                  className={cn("size-4", !isActive && "opacity-50")}
                />
              ) : null}
              <span className="whitespace-nowrap">{t(resolvedLocale, tab.labelKey)}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content — 데스크탑에서는 좌우에 광고 레일이 붙는다 (#75).
          레일은 컨텐츠와 나란한 flex 아이템이라 본문을 가리지 않는다. Ezoic이 세로로
          여러 유닛을 쌓아 뷰포트보다 길어지는 경우가 있어(실측 1068px vs 뷰포트 772px)
          `max-h-full overflow-y-auto`로 레일 안에서 높이를 흡수한다 — 잘라내면 광고
          정책 위반이라 스크롤로 접근 가능하게 둔다.
          1500px 미만에서는 아예 렌더하지 않는다 (그리드 896 + 좌우 336).
          넓은 화면에서는 컨텐츠 폭을 1024로 묶고 전체를 가운데 정렬한다 — 안 그러면
          컨텐츠가 flex-1로 늘어나 레일만 화면 양 끝으로 밀려나고 사이가 텅 빈다
          (QHD 2560에서 좌우 500px씩 공백). */}
      <div className="flex-1 min-h-0 flex justify-center overflow-hidden">
        <AdSlot variant="rail-left" className="hidden min-[1500px]:flex items-start self-stretch max-h-full overflow-y-auto overscroll-contain" />
        <div className="flex-1 min-w-0 max-w-[1024px] h-full overflow-hidden">
        <div className={activeTab === "crafting" ? "h-full" : "hidden"}>
          <CraftingApp pendingItemId={pendingItemId} onClearPendingItem={handleClearPendingItem} onBlueprintClick={handleBlueprintClick} onSkillClick={handleSkillClick} externalBackLabel={craftingBack?.label ?? null} onExternalBack={craftingBack ? handleExternalBack : undefined} onPanelClose={() => setCraftingBack(null)} />
        </div>
        <div className={activeTab === "cooking" ? "h-full" : "hidden"}>
          <CookingApp pendingRecipeId={pendingRecipeId} onClearPendingRecipe={handleClearPendingRecipe} onViewCraftingItem={handleViewCraftingItem} />
        </div>
        <div className={activeTab === "cookpot" ? "h-full" : "hidden"}>
          <CookpotApp onViewRecipe={handleViewRecipe} />
        </div>
        <div className={activeTab === "bosses" ? "h-full" : "hidden"}>
          <BossesApp onViewCraftingItem={handleViewCraftingItem} pendingLootItemId={pendingLootItemId} onClearPendingLoot={handleClearPendingLoot} pendingBossId={pendingBossId} onClearPendingBoss={handleClearPendingBoss} externalBackLabel={bossesBack?.label ?? null} onExternalBack={bossesBack ? handleBossesExternalBack : undefined} onPanelClose={() => setBossesBack(null)} />
        </div>
        <div className={activeTab === "skills" ? "h-full" : "hidden"}>
          <SkillSimulatorApp onViewCraftingItem={handleViewCraftingItem} />
        </div>
        <div className={activeTab === "skins" ? "h-full" : "hidden"}>
          <SkinsApp />
        </div>
        <div className={activeTab === "quests" ? "h-full" : "hidden"}>
          <QuestsApp onViewCraftingItem={(id) => handleViewCraftingItem(id, { tab: "quests", label: t(resolvedLocale, "tab_quests") })} onViewBoss={(id) => handleViewBoss(id, { tab: "quests", label: t(resolvedLocale, "tab_quests") })} />
        </div>
        <div className={activeTab === "console" ? "h-full" : "hidden"}>
          <ConsoleApp />
        </div>
        <div className={activeTab === "settings" ? "h-full" : "hidden"}>
          <SettingsPage />
        </div>
        </div>
        <AdSlot variant="rail-right" className="hidden min-[1500px]:flex items-start self-stretch max-h-full overflow-y-auto overscroll-contain" />
      </div>

      {/* Review Prompt */}
      <ReviewPrompt open={showReview} onClose={handleReviewClose} locale={resolvedLocale} />

      {/* Floating ko-fi pill — docks into Footer when Footer is in view */}
      <FloatingSupportPill />

      {/* legacy PWA 설치본(하단 흰 띠) 재설치 안내 — 해당 설치본에서만 표시 (#61) */}
      <LegacyPwaNotice />

      {/* Dev menu */}
      {showDevMenu && (
        <DevMenu onOpenReview={() => setShowReview(true)} token={token} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-16 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in duration-200">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dev-only floating menu (stripped from production builds)
// ---------------------------------------------------------------------------

/**
 * Inline BETA pill rendered as the first element in the tab bar (left of "제작").
 * Pure label — not interactive. Sticks to the left during horizontal scroll
 * via `sticky left-0` so it remains visible regardless of tab bar scroll.
 */
function BetaTabIndicator() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hostname.startsWith("beta.")) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <span
      className="sticky left-0 z-10 shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm"
      style={{ textShadow: "0 1px 1px rgba(0,0,0,0.3)" }}
      aria-label="Beta site"
    >
      BETA
    </span>
  );
}

function DevMenu({ onOpenReview, token }: { onOpenReview: () => void; token: string | null }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 12, y: 80 }); // bottom-right offset
  const ref = useRef<HTMLDivElement>(null);
  const pressed = useRef(false);
  const dragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, sx: 0, sy: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pressed.current = true;
    dragging.current = false;
    dragStart.current = { px: e.clientX, py: e.clientY, sx: pos.x, sy: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pressed.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    if (!dragging.current && Math.abs(dx) + Math.abs(dy) < 5) return;
    dragging.current = true;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 40, dragStart.current.sx - dx)),
      y: Math.max(0, Math.min(window.innerHeight - 40, dragStart.current.sy - dy)),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    pressed.current = false;
    if (!dragging.current) return;
    setTimeout(() => { dragging.current = false; }, 0);
  }, []);

  const handleClick = useCallback(() => {
    if (dragging.current) return;
    setOpen((v) => !v);
  }, []);

  const items = [
    { label: "리뷰 프롬프트", action: onOpenReview },
    {
      label: "리뷰 상태 초기화",
      action: () => {
        localStorage.removeItem("dst:review-dismissed");
        sessionStorage.removeItem("dst:review-shown");
      },
    },
    { label: "스킬 아이콘 목록", action: () => window.open("/skill-icons", "_blank") },
    { label: "블루프린트 아이템", action: () => window.open("/blueprints", "_blank") },
    { label: "보스 전리품", action: () => window.open("/bosses", "_blank") },
    { label: "스탯 디자인 비교", action: () => window.open("/dev/stat-designs", "_blank") },
    { label: "플립보드 미리보기", action: () => window.open("/flip-board", "_blank") },
    { label: "아이템 스탯 리뷰", action: () => window.open("/item-stats", "_blank") },
    { label: "데미지 계산기", action: () => window.open("/damage-calc", "_blank") },
    { label: "게임 아이템 DB (1028)", action: () => window.open("/dev/item-database", "_blank") },
    { label: "인기 조합 패널 비교", action: () => window.open("/dev/combo-panel", "_blank") },
    {
      label: (typeof window !== "undefined" && localStorage.getItem("dst:dev-show-all-circuit-effects") === "1")
        ? "현황: 모든 문구 표시 OFF (토글)"
        : "현황: 모든 문구 표시 ON (토글)",
      action: () => {
        const cur = localStorage.getItem("dst:dev-show-all-circuit-effects") === "1";
        if (cur) localStorage.removeItem("dst:dev-show-all-circuit-effects");
        else localStorage.setItem("dst:dev-show-all-circuit-effects", "1");
        location.reload();
      },
    },
    {
      label: "통계 전체 → 클립보드",
      action: async () => {
        try {
          const url = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";
          if (!url) { alert("ANALYTICS_WORKER_URL 미설정"); return; }
          const res = await fetch(`${url}/stats?days=365`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
          alert("클립보드에 복사됨 ✓");
        } catch (e: any) {
          alert(`실패: ${e.message}`);
        }
      },
    },
  ];

  return (
    <div ref={ref} className="fixed z-[60]" style={{ right: pos.x, bottom: pos.y }}>
      {open && (
        <div className="absolute bottom-10 right-0 mb-1 min-w-[160px] rounded-lg border border-border bg-popover shadow-xl py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground tracking-wider">개발자 메뉴</div>
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-xs transition-colors",
                "highlight" in item && item.highlight
                  ? "text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/10"
                  : "text-popover-foreground hover:bg-accent/50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
        className={cn(
          "size-9 rounded-full flex items-center justify-center shadow-lg transition-all touch-none select-none bg-white border-2 border-black",
          open && "ring-2 ring-primary"
        )}
      >
        <img src="/images/game-items/hammer.png" alt="Dev" className="size-7" draggable={false} />
      </button>
    </div>
  );
}
