"use client";

import { useState, useEffect } from "react";
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

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("crafting");
  const { resolvedLocale } = useSettings();
  const [toast, setToast] = useState<string | null>(null);

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
              onClick={() => setActiveTab(tab.id)}
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
          <CookingApp />
        </div>
        <div className={activeTab === "cookpot" ? "h-full" : "hidden"}>
          <CookpotApp />
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
