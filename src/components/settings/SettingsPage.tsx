"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Sun, Moon, Monitor, ChevronRight, LogOut, BarChart3, Download, Share, Plus, ChevronDown, Heart, Star } from "lucide-react";
import { useSettings, type ThemeSetting } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import type { LocaleSetting } from "@/lib/i18n";
import { t, supportedLocales, localeLabels } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
import { Footer } from "../crafting/Footer";
import { fetchPublicRating, submitRating } from "@/lib/analytics";

const themeOptions: { value: ThemeSetting; icon: typeof Sun; labelKey: "light" | "dark" | "system" }[] = [
  { value: "light", icon: Sun, labelKey: "light" },
  { value: "dark", icon: Moon, labelKey: "dark" },
  { value: "system", icon: Monitor, labelKey: "system" },
];

const localeOptions: { value: LocaleSetting; label: string }[] = [
  { value: "system", label: "System" },
  ...supportedLocales.map((code) => ({ value: code as LocaleSetting, label: localeLabels[code] })),
];

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function SettingsPage() {
  const { theme, locale, resolvedLocale, setTheme, setLocale } = useSettings();
  const { user, loading: authLoading, gisReady, isAdmin, logout, renderGoogleButton } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Rating state
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    // Load my rating from localStorage
    const saved = localStorage.getItem("dst:my-rating");
    if (saved) setMyRating(Number(saved));
    // Fetch public average
    fetchPublicRating().then((data) => {
      if (data) {
        setAvgRating(data.avg);
        setTotalRatings(data.total);
      }
    });
  }, []);

  const handleRate = useCallback(async (star: number) => {
    setMyRating(star);
    setRatingSubmitted(true);
    localStorage.setItem("dst:my-rating", String(star));
    localStorage.setItem("dst:review-dismissed", "permanent");
    await submitRating(star);
    // Refresh average
    const data = await fetchPublicRating();
    if (data) {
      setAvgRating(data.avg);
      setTotalRatings(data.total);
    }
    setTimeout(() => setRatingSubmitted(false), 1500);
  }, []);

  // PWA install state
  const [isPwa, setIsPwa] = useState(true); // default true to avoid flash
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect if running as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsPwa(isStandalone);

    // Detect iOS Safari
    const ua = navigator.userAgent;
    setIsIos(/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream);

    // Listen for beforeinstallprompt (Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsPwa(true);
    }
  }, [deferredPrompt]);

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

          {/* PWA Install Guide */}
          {!isPwa && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">{t(resolvedLocale, "pwa_install_title")}</h2>
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/icon-192.png"
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-lg shrink-0"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t(resolvedLocale, "pwa_install_desc")}
                  </p>
                </div>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-foreground text-background px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/90"
                  >
                    <Download className="size-4" />
                    {t(resolvedLocale, "pwa_install_button")}
                  </button>
                ) : isIos ? (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center size-5 rounded-full bg-muted text-foreground text-[10px] font-bold shrink-0">1</span>
                      <span className="flex items-center gap-1">
                        <Share className="size-3.5" />
                        {t(resolvedLocale, "pwa_install_ios_step1")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center size-5 rounded-full bg-muted text-foreground text-[10px] font-bold shrink-0">2</span>
                      <span className="flex items-center gap-1">
                        <Plus className="size-3.5" />
                        {t(resolvedLocale, "pwa_install_ios_step2")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t(resolvedLocale, "pwa_install_generic")}
                  </p>
                )}
              </div>
            </div>
          )}

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
            <div className="relative">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as LocaleSetting)}
                className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2.5 pr-8 text-sm text-foreground transition-colors hover:bg-surface-hover/50 focus:outline-none focus:ring-1 focus:ring-foreground/20"
              >
                {localeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === "system" ? t(resolvedLocale, "system") : opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{t(resolvedLocale, "rating_title")}</h2>
            <div className="rounded-lg border border-border p-4 space-y-3">
              {/* Average display */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold tabular-nums">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "size-4",
                          star <= Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  {totalRatings > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {totalRatings}{t(resolvedLocale, "rating_count")}
                    </span>
                  )}
                </div>
              </div>

              {/* My rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">{t(resolvedLocale, "rating_my")}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className="p-0.5 touch-manipulation transition-transform active:scale-90"
                    >
                      <Star
                        className={cn(
                          "size-6 transition-colors",
                          star <= myRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {ratingSubmitted && (
                  <span className="text-xs text-green-500 animate-in fade-in">{t(resolvedLocale, "review_thanks")}</span>
                )}
              </div>
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

          {/* Ko-fi Support */}
          <a
            href="https://ko-fi.com/fankim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Heart className="size-4" />
              {t(resolvedLocale, "support_kofi")}
            </span>
            <ChevronRight className="size-4" />
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 py-2">v{APP_VERSION}</p>
        <Footer />
      </div>
    </div>
  );
}
