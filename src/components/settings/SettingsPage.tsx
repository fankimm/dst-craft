"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Sun, Moon, Monitor, ChevronRight, LogOut, BarChart3, Download, Share, Plus, ChevronDown, Heart, Star, MessageSquare, Send, Github, Mail } from "lucide-react";
import { useSettings, type ThemeSetting } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import type { LocaleSetting } from "@/lib/i18n";
import { t, supportedLocales, localeLabels } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
import { Footer } from "../crafting/Footer";
import { fetchPublicRating, submitRating, fetchTopCountries, submitFeedback } from "@/lib/analytics";
import { Globe } from "lucide-react";

/** ISO 3166-1 alpha-2 → flag emoji */
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "\u{1F3F3}\uFE0F";
  return String.fromCodePoint(0x1F1E6 + upper.charCodeAt(0) - 65, 0x1F1E6 + upper.charCodeAt(1) - 65);
}

function countryName(code: string, locale: string): string {
  const upper = code.toUpperCase();
  const displayNames = new Intl.DisplayNames([locale.replace(/_/g, "-")], { type: "region" });
  const name = displayNames.of(upper);
  return name && name !== upper ? name : upper;
}

/** Slide-up ticker — 현재 항목은 위로 퇴장, 다음 항목은 아래에서 등장 */
function CountryTicker({ items }: { items: { rank: number; flag: string; name: string; count: number }[] }) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length, index]);

  return (
    <div className="rounded-lg border border-border bg-card px-3 overflow-hidden h-9 relative">
      {items.map((item, i) => {
        const isCurrent = i === index;
        const isLeaving = i === prevIndex;
        return (
          <div
            key={item.rank}
            className={cn(
              "absolute inset-x-3 flex items-center gap-2 h-9 transition-all duration-500 ease-in-out",
              isCurrent && "translate-y-0 opacity-100",
              isLeaving && "-translate-y-full opacity-0",
              !isCurrent && !isLeaving && "translate-y-full opacity-0",
            )}
          >
            <span className="text-xs font-bold text-muted-foreground w-4 text-right">{item.rank}</span>
            <span className="text-sm">{item.flag}</span>
            <span className="text-sm font-medium truncate">{item.name}</span>
            <span className="flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums">{item.count.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

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
  const { theme, locale, resolvedLocale, devMenuEnabled, setTheme, setLocale, setDevMenuEnabled } = useSettings();
  const { user, loading: authLoading, gisReady, isAdmin, logout, renderGoogleButton } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Rating state
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingDist, setRatingDist] = useState<Record<string, number>>({});
  const [myRating, setMyRating] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [topCountries, setTopCountries] = useState<{ code: string; count: number }[]>([]);

  useEffect(() => {
    // Load my rating from localStorage
    const saved = localStorage.getItem("dst:my-rating");
    if (saved) setMyRating(Number(saved));
    // Fetch public average
    fetchPublicRating().then((data) => {
      if (data) {
        setAvgRating(data.avg);
        setTotalRatings(data.total);
        if (data.ratings) setRatingDist(data.ratings);
      }
    });
    // Fetch top countries
    fetchTopCountries().then(setTopCountries);
  }, []);

  const handleRate = useCallback(async (star: number) => {
    setMyRating(star);
    localStorage.setItem("dst:my-rating", String(star));
    localStorage.setItem("dst:review-dismissed", "permanent");
    setToast(t(resolvedLocale, "review_thanks"));
    setTimeout(() => setToast(null), 2000);
    await submitRating(star);
    const data = await fetchPublicRating();
    if (data) {
      setAvgRating(data.avg);
      setTotalRatings(data.total);
      if (data.ratings) setRatingDist(data.ratings);
    }
  }, [resolvedLocale]);

  // Feedback state
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);

  const handleFeedback = useCallback(async () => {
    const msg = feedbackMsg.trim();
    if (!msg) {
      setToast(t(resolvedLocale, "feedback_empty"));
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setFeedbackSending(true);
    const ok = await submitFeedback(msg);
    setFeedbackSending(false);
    if (ok) {
      setFeedbackMsg("");
      setToast(t(resolvedLocale, "feedback_thanks"));
    } else {
      setToast(t(resolvedLocale, "feedback_too_many"));
    }
    setTimeout(() => setToast(null), 2000);
  }, [feedbackMsg, resolvedLocale]);

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

          {/* Top Countries */}
          {topCountries.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Globe className="size-4" />
                {t(resolvedLocale, "top_countries")}
              </h2>
              <CountryTicker
                items={topCountries.map((c, i) => ({
                  rank: i + 1,
                  flag: countryFlag(c.code),
                  name: countryName(c.code, resolvedLocale),
                  count: c.count,
                }))}
              />
            </div>
          )}

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
                    myRating > 0 ? (
                      <span key={star} className="p-0.5">
                        <Star
                          className={cn(
                            "size-6",
                            star <= myRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </span>
                    ) : (
                      <button
                        key={star}
                        onClick={() => handleRate(star)}
                        className="p-0.5 touch-manipulation transition-transform active:scale-90"
                      >
                        <Star className="size-6 text-muted-foreground/30 transition-colors" />
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Rating distribution — only for users who rated */}
              {myRating > 0 && totalRatings > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDist[String(star)] ?? 0;
                    const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-right text-muted-foreground">{star}★</span>
                        <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400/70 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-muted-foreground tabular-nums">{count}{t(resolvedLocale, "rating_dist_count")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="size-4" />
              {t(resolvedLocale, "feedback_title")}
            </h2>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <textarea
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value.slice(0, 1000))}
                placeholder={t(resolvedLocale, "feedback_placeholder")}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{feedbackMsg.length}/1000</span>
                <button
                  onClick={handleFeedback}
                  disabled={feedbackSending || !feedbackMsg.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground/90 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send className="size-3.5" />
                  {t(resolvedLocale, "feedback_submit")}
                </button>
              </div>
            </div>
          </div>

          {/* Insight */}
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

          {/* Release Notes */}
          <a
            href="/releases"
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
          >
            <span>{t(resolvedLocale, "release_notes")}</span>
            <ChevronRight className="size-4" />
          </a>

          {/* Dev menu toggle — admin only */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setDevMenuEnabled(!devMenuEnabled)}
              className="w-full flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
            >
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span>{t(resolvedLocale, "dev_menu")}</span>
                <span className="text-xs text-muted-foreground/70">{t(resolvedLocale, "dev_menu_desc")}</span>
              </span>
              <span
                role="switch"
                aria-checked={devMenuEnabled}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  devMenuEnabled ? "bg-foreground" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "inline-block size-4 rounded-full bg-background shadow-sm transition-transform",
                    devMenuEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>
          )}

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

          {/* GitHub & Email */}
          <div className="flex gap-2">
            <a
              href="https://github.com/fankimm/dst-craft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <a
              href="mailto:fankim@icloud.com"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover/50 transition-colors"
            >
              <Mail className="size-4" />
              Email
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 py-2">v{APP_VERSION}</p>
        <Footer />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in duration-200">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
