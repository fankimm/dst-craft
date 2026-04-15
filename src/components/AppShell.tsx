"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { CraftingApp } from "./crafting/CraftingApp";
import { CookingApp } from "./cooking/CookingApp";
import { CookpotApp } from "./cookpot/CookpotApp";
import { BossesApp } from "./bosses/BossesApp";
import { SettingsPage } from "./settings/SettingsPage";
import { SkillSimulatorApp } from "./skills/SkillSimulatorApp";
import { ReviewPrompt } from "./ReviewPrompt";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TabId = "crafting" | "cooking" | "cookpot" | "bosses" | "skills" | "settings";

const allTabs: { id: TabId; labelKey: TranslationKey; image?: string; adminOnly?: boolean }[] = [
  { id: "crafting", labelKey: "tab_crafting", image: "/images/category-icons/tools.png" },
  { id: "cooking", labelKey: "tab_cooking", image: "/images/category-icons/cooking.png" },
  { id: "cookpot", labelKey: "tab_cookpot", image: "/images/game-items/cookpot.png" },
  { id: "bosses", labelKey: "tab_bosses", image: "/images/game-items/deerclops_eyeball.png" },
  { id: "skills", labelKey: "tab_skills", image: "/images/skill-icons/wilson_alchemy_1.png", adminOnly: true },
  { id: "settings", labelKey: "tab_settings", image: "/images/game-items/gears.png" },
];

/** Read tab from current URL. No `tab` param → crafting (backwards compat). */
function readTabFromUrl(): TabId {
  if (typeof window === "undefined") return "crafting";
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "cooking" || tab === "cookpot" || tab === "bosses" || tab === "skills" || tab === "settings") return tab;
  return "crafting";
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("crafting");
  const { resolvedLocale } = useSettings();
  const { isAdmin, token } = useAuth();
  const tabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingRecipeId, setPendingRecipeId] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Sync active tab from URL on mount (SSR-safe)
  useEffect(() => {
    setActiveTab(readTabFromUrl());
  }, []);

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

  // Boss → Crafting item shortcut
  const handleViewCraftingItem = useCallback((itemId: string) => {
    const url = `${window.location.pathname}`;
    window.history.pushState({ _appNav: true }, "", url);
    setPendingItemId(itemId);
    setActiveTab("crafting");
  }, []);

  const handleClearPendingItem = useCallback(() => {
    setPendingItemId(null);
  }, []);

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

  const handleSkillClick = useCallback((skillId: string) => {
    // Extract character from skill ID (e.g., "wilson_alchemy_1" → "wilson")
    const charPrefixes = ["wilson", "willow", "wendy", "woodie", "wathgrithr", "wormwood", "winona", "wortox", "wurt", "walter", "wolfgang"];
    // Map internal IDs to display IDs used in skill tree URL
    const charMap: Record<string, string> = { wathgrithr: "wigfrid" };
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

  // Lock body scroll — AppShell manages its own scroll internally
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100dvh";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground overflow-hidden">
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

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className={activeTab === "crafting" ? "h-full" : "hidden"}>
          <CraftingApp pendingItemId={pendingItemId} onClearPendingItem={handleClearPendingItem} onBlueprintClick={handleBlueprintClick} onSkillClick={handleSkillClick} />
        </div>
        <div className={activeTab === "cooking" ? "h-full" : "hidden"}>
          <CookingApp pendingRecipeId={pendingRecipeId} onClearPendingRecipe={handleClearPendingRecipe} />
        </div>
        <div className={activeTab === "cookpot" ? "h-full" : "hidden"}>
          <CookpotApp onViewRecipe={handleViewRecipe} />
        </div>
        <div className={activeTab === "bosses" ? "h-full" : "hidden"}>
          <BossesApp onViewCraftingItem={handleViewCraftingItem} pendingLootItemId={pendingLootItemId} onClearPendingLoot={handleClearPendingLoot} />
        </div>
        <div className={activeTab === "skills" ? "h-full" : "hidden"}>
          <SkillSimulatorApp onViewCraftingItem={handleViewCraftingItem} />
        </div>
        <div className={activeTab === "settings" ? "h-full" : "hidden"}>
          <SettingsPage />
        </div>
      </div>

      {/* Review Prompt */}
      <ReviewPrompt open={showReview} onClose={handleReviewClose} locale={resolvedLocale} />

      {/* Dev menu */}
      {(process.env.NODE_ENV === "development" || isAdmin) && (
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
    { label: "게임 아이템 DB (1028)", action: () => window.open("/dev/item-database", "_blank") },
    { label: "인기 조합 패널 비교", action: () => window.open("/dev/combo-panel", "_blank") },
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
