"use client";

import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useSettings, type ThemeSetting } from "@/hooks/use-settings";
import type { LocaleSetting } from "@/lib/i18n";
import { t, supportedLocales, localeLabels } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Footer } from "../crafting/Footer";

const themeOptions: { value: ThemeSetting; icon: typeof Sun; labelKey: "light" | "dark" | "system" }[] = [
  { value: "light", icon: Sun, labelKey: "light" },
  { value: "dark", icon: Moon, labelKey: "dark" },
  { value: "system", icon: Monitor, labelKey: "system" },
];

const localeOptions: { value: LocaleSetting; label: string }[] = [
  { value: "system", label: "System" },
  ...supportedLocales.map((code) => ({ value: code as LocaleSetting, label: localeLabels[code] })),
];

export function SettingsPage() {
  const { theme, locale, resolvedLocale, setTheme, setLocale } = useSettings();

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto overscroll-contain">
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-4 space-y-6 max-w-md mx-auto w-full">
          {/* Theme */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{t(resolvedLocale, "theme")}</h2>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs transition-colors",
                      isActive
                        ? "border-foreground/30 bg-surface-hover text-foreground font-medium"
                        : "border-border text-muted-foreground hover:bg-surface-hover/50"
                    )}
                  >
                    <Icon className="size-5" />
                    <span>{t(resolvedLocale, opt.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{t(resolvedLocale, "language")}</h2>
            <div className="rounded-lg border border-border divide-y divide-border">
              {localeOptions.map((opt) => {
                const isActive = locale === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setLocale(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:bg-surface-hover/50"
                    )}
                  >
                    <span>
                      {opt.value === "system" ? t(resolvedLocale, "system") : opt.label}
                    </span>
                    {isActive && <Check className="size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
