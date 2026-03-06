"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { CraftingApp } from "./crafting/CraftingApp";
import { CookingApp } from "./cooking/CookingApp";
import { CookpotApp } from "./cookpot/CookpotApp";
import { SettingsPage } from "./settings/SettingsPage";
import { ReviewPrompt } from "./ReviewPrompt";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TabId = "crafting" | "cooking" | "cookpot" | "settings";

const tabs: { id: TabId; labelKey: TranslationKey; image?: string }[] = [
  { id: "crafting", labelKey: "tab_crafting", image: "/images/category-icons/tools.png" },
  { id: "cooking", labelKey: "tab_cooking", image: "/images/category-icons/cooking.png" },
  { id: "cookpot", labelKey: "tab_cookpot", image: "/images/game-items/cookpot.png" },
  { id: "settings", labelKey: "tab_settings", image: "/images/game-items/gears.png" },
];

/** Read tab from current URL. No `tab` param → crafting (backwards compat). */
function readTabFromUrl(): TabId {
  if (typeof window === "undefined") return "crafting";
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "cooking" || tab === "cookpot" || tab === "settings") return tab;
  return "crafting";
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("crafting");
  const { resolvedLocale } = useSettings();
  const [toast, setToast] = useState<string | null>(null);
  const [pendingRecipeId, setPendingRecipeId] = useState<string | null>(null);
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

  // Review prompt trigger — count visits, show after 5+
  useEffect(() => {
    if (sessionStorage.getItem("dst:review-counted")) return;
    sessionStorage.setItem("dst:review-counted", "1");

    const count = (parseInt(localStorage.getItem("dst:visit-count") ?? "0", 10) || 0) + 1;
    localStorage.setItem("dst:visit-count", String(count));

    if (count >= 5 && !localStorage.getItem("dst:review-dismissed")) {
      const timer = setTimeout(() => setShowReview(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReviewClose = useCallback(() => {
    setShowReview(false);
  }, []);

  // Tab click handler — pushState + setActiveTab
  const handleTabClick = useCallback((tabId: TabId) => {
    let url: string;
    if (tabId === "crafting") {
      // Crafting uses no tab param (backwards compat) — clear all params
      url = window.location.pathname;
    } else {
      url = `${window.location.pathname}?tab=${tabId}`;
    }
    window.history.pushState({ _appNav: true }, "", url);
    setActiveTab(tabId);
  }, []);

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

  // Listen for local-only favorites warning
  useEffect(() => {
    const handler = () => {
      setToast(t(resolvedLocale, "favorites_local_warning"));
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("dst-fav-local-warning", handler);
    return () => window.removeEventListener("dst-fav-local-warning", handler);
  }, [resolvedLocale]);

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-background shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors relative touch-manipulation",
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
              <span>{t(resolvedLocale, tab.labelKey)}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className={activeTab === "crafting" ? "h-full" : "hidden"}>
          <CraftingApp />
        </div>
        <div className={activeTab === "cooking" ? "h-full" : "hidden"}>
          <CookingApp pendingRecipeId={pendingRecipeId} onClearPendingRecipe={handleClearPendingRecipe} />
        </div>
        <div className={activeTab === "cookpot" ? "h-full" : "hidden"}>
          <CookpotApp onViewRecipe={handleViewRecipe} />
        </div>
        <div className={activeTab === "settings" ? "h-full" : "hidden"}>
          <SettingsPage />
        </div>
      </div>

      {/* Review Prompt */}
      <ReviewPrompt open={showReview} onClose={handleReviewClose} locale={resolvedLocale} />

      {/* Dev menu */}
      {process.env.NODE_ENV === "development" && (
        <DevMenu onOpenReview={() => setShowReview(true)} />
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

function DevMenu({ onOpenReview }: { onOpenReview: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 12, y: 80 }); // bottom-right offset
  const ref = useRef<HTMLDivElement>(null);
  const pressed = useRef(false);
  const dragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, sx: 0, sy: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    { label: "Review Prompt", action: onOpenReview },
    {
      label: "Reset Review State",
      action: () => {
        localStorage.removeItem("dst:review-dismissed");
        localStorage.removeItem("dst:visit-count");
        sessionStorage.removeItem("dst:review-counted");
      },
    },
  ];

  return (
    <div ref={ref} className="fixed z-[60]" style={{ right: pos.x, bottom: pos.y }}>
      {open && (
        <div className="absolute bottom-10 right-0 mb-1 min-w-[160px] rounded-lg border border-border bg-popover shadow-xl py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dev Menu</div>
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-popover-foreground hover:bg-accent/50 transition-colors"
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
