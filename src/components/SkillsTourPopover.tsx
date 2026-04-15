"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const STORAGE_KEY = "dst:tour-skills-v0.11.8";

interface Props {
  /** Index of the Skills tab inside the rendered tab bar (used for arrow alignment). */
  skillsTabIndex: number;
  /** Total number of tabs in the bar (used for arrow alignment). */
  totalTabs: number;
  /** Whether the user is currently on the Skills tab — hide popover if so. */
  isOnSkillsTab: boolean;
  /** Called when the user clicks "체험하기". */
  onTryNow: () => void;
  locale: Locale;
}

export function SkillsTourPopover({
  skillsTabIndex,
  totalTabs,
  isOnSkillsTab,
  onTryNow,
  locale,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (isOnSkillsTab) {
      // User landed directly on Skills tab → mark seen, no popover
      localStorage.setItem(STORAGE_KEY, "1");
      return;
    }
    // Slight delay so it doesn't flash on top of the page transition
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [isOnSkillsTab]);

  // Auto-dismiss when user navigates to Skills tab on their own
  useEffect(() => {
    if (isOnSkillsTab && visible) {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
    }
  }, [isOnSkillsTab, visible]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleTry = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    onTryNow();
  };

  // Position arrow over the Skills tab (each tab takes 1/totalTabs of the width)
  const arrowLeftPct = ((skillsTabIndex + 0.5) / totalTabs) * 100;

  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  return (
    <>
      {/* Pulsing glow on Skills tab (positioned absolutely above the tab bar) */}
      <div
        className="pointer-events-none fixed z-[55] top-0 -translate-x-1/2"
        style={{
          left: `${arrowLeftPct}%`,
          marginTop: "calc(env(safe-area-inset-top, 0px) + 4px)",
        }}
      >
        <div className="size-10 rounded-full bg-amber-400/30 animate-ping" />
      </div>

      {/* Popover anchored below the tab bar, arrow pointing up at the tab */}
      <div
        className={cn(
          "fixed z-[56] left-1/2 -translate-x-1/2",
          "max-w-[340px] w-[calc(100vw-32px)]",
          "animate-in fade-in slide-in-from-top-2 duration-300",
        )}
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 56px)",
        }}
      >
        {/* Arrow */}
        <div
          className="absolute -top-1.5 size-3 rotate-45 bg-popover border-l border-t border-border"
          style={{
            left: `${arrowLeftPct}%`,
            transform: "translateX(-50%) rotate(45deg)",
          }}
        />
        <div className="relative rounded-xl border border-border bg-popover shadow-xl p-4">
          <button
            onClick={dismiss}
            aria-label={t("닫기", "Close")}
            className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <Image
              src="/images/ui/skill_eye.png"
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {t("✨ 스킬 시뮬레이터 새로 등장!", "✨ New: Skill Simulator")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t(
                  "11명 캐릭터의 스킬트리를 미리 짜보세요. 보스 처치/커스텀 과제 토글까지 인게임과 동일하게 동작합니다.",
                  "Plan skill trees for all 11 characters. Boss-kill and custom-task toggles work just like in-game.",
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 justify-end">
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("다음에", "Later")}
            </button>
            <button
              onClick={handleTry}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              {t("체험하기", "Try it")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
