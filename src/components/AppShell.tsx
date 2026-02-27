"use client";

import { useState } from "react";
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

const basePath = process.env.NODE_ENV === "production" ? "/dst-craft" : "";

const tabs: { id: TabId; labelKey: TranslationKey; image?: string }[] = [
  { id: "crafting", labelKey: "tab_crafting", image: `${basePath}/images/category-icons/tools.png` },
  { id: "cooking", labelKey: "tab_cooking", image: `${basePath}/images/category-icons/cooking.png` },
  { id: "cookpot", labelKey: "tab_cookpot", image: `${basePath}/images/game-items/cookpot.png` },
  { id: "settings", labelKey: "tab_settings", image: `${basePath}/images/game-items/gears.png` },
];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("crafting");
  const { resolvedLocale } = useSettings();

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-black text-white shrink-0">
        <div className="flex items-center gap-1.5">
          <Image
            src={`${basePath}/icons/icon-192.png`}
            alt=""
            width={20}
            height={20}
            className="size-5 rounded-sm"
          />
          <span className="text-sm font-bold tracking-wide">STARVE CRAFT</span>
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-black leading-none">
          BETA
        </span>
      </div>

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
    </div>
  );
}
