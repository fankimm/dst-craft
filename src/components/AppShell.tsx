"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { CraftingApp } from "./crafting/CraftingApp";
import { CookingApp } from "./cooking/CookingApp";
import { CookpotApp } from "./cookpot/CookpotApp";
import { SettingsPage } from "./settings/SettingsPage";
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
