"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Sun, Moon, Monitor, Check, ChevronRight, LogOut, BarChart3 } from "lucide-react";
import { useSettings, type ThemeSetting } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import type { LocaleSetting } from "@/lib/i18n";
import { t, supportedLocales, localeLabels } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
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
  const { user, loading: authLoading, gisReady, isAdmin, logout, renderGoogleButton } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Render Google button when ready and not logged in
  useEffect(() => {
    const el = googleBtnRef.current;
    if (!authLoading && !user && gisReady && el) {
      renderGoogleButton(el, "standard");
    }
    return () => {
      if (el) el.innerHTML = "";
    };
  }, [authLoading, user, gisReady, renderGoogleButton]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto overscroll-contain">
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-4 space-y-6 max-w-md mx-auto w-full">
          {/* Branding */}
          <div className="flex flex-col items-center gap-2 py-4">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-lg"
            />
            <div className="text-center">
              <h1 className="text-sm tracking-wide">
                <span className="font-bold">DON&apos;T CRAFT</span>{" "}
                <span className="text-muted-foreground">WITHOUT RECIPES</span>
              </h1>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{t(resolvedLocale, "account")}</h2>
            {!authLoading && (
              user ? (
                <div key="profile" className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="size-10 rounded-full shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="shrink-0 flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    {t(resolvedLocale, "sign_out")}
                  </button>
                </div>
              ) : (
                <div key="login" className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {t(resolvedLocale, "favorites_login_prompt")}
                  </p>
                  <div ref={googleBtnRef} className="flex justify-center" />
                </div>
              )
            )}
          </div>

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

          {/* Insight (admin only) */}
          {isAdmin && (
            <a
              href="/stats"
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                {t(resolvedLocale, "insight")}
              </span>
              <ChevronRight className="size-4" />
            </a>
          )}

          {/* Release Notes */}
          <a
            href="/releases"
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
          >
            <span>{t(resolvedLocale, "release_notes")}</span>
            <ChevronRight className="size-4" />
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 py-2">v{APP_VERSION}</p>
        <Footer />
      </div>
    </div>
  );
}
