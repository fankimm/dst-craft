"use client";

import { Settings, Sun, Moon, Monitor, Check } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSettings, type ThemeSetting } from "@/hooks/use-settings";
import type { LocaleSetting } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const themeOptions: { value: ThemeSetting; icon: typeof Sun; labelKey: "light" | "dark" | "system" }[] = [
  { value: "light", icon: Sun, labelKey: "light" },
  { value: "dark", icon: Moon, labelKey: "dark" },
  { value: "system", icon: Monitor, labelKey: "system" },
];

const localeOptions: { value: LocaleSetting; labelKey: "korean" | "english" | "system" }[] = [
  { value: "ko", labelKey: "korean" },
  { value: "en", labelKey: "english" },
  { value: "system", labelKey: "system" },
];

export function SettingsButton() {
  const { theme, locale, resolvedLocale, setTheme, setLocale } = useSettings();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handleClick(e: Event) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open, updatePosition]);

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className="fixed z-50 w-48 rounded-lg border border-border bg-card shadow-lg p-3 space-y-3"
          style={{ top: pos.top, right: pos.right }}
        >
          {/* Theme */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {t(resolvedLocale, "theme")}
            </p>
            <div className="space-y-0.5">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onPointerDown={(e) => { e.stopPropagation(); setTheme(opt.value); }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors touch-manipulation",
                      isActive
                        ? "bg-surface-hover text-foreground font-medium"
                        : "text-muted-foreground hover:bg-surface-hover/50"
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {t(resolvedLocale, opt.labelKey)}
                    {isActive && <Check className="size-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {t(resolvedLocale, "language")}
            </p>
            <div className="space-y-0.5">
              {localeOptions.map((opt) => {
                const isActive = locale === opt.value;
                return (
                  <button
                    key={opt.value}
                    onPointerDown={(e) => { e.stopPropagation(); setLocale(opt.value); }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors touch-manipulation",
                      isActive
                        ? "bg-surface-hover text-foreground font-medium"
                        : "text-muted-foreground hover:bg-surface-hover/50"
                    )}
                  >
                    {t(resolvedLocale, opt.labelKey)}
                    {isActive && <Check className="size-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
        aria-label={t(resolvedLocale, "settings")}
      >
        <Settings className="size-4" />
      </button>
      {panel}
    </>
  );
}
