"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Locale, LocaleSetting } from "@/lib/i18n";
import { detectLocale } from "@/lib/i18n";

export type ThemeSetting = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface SettingsContextValue {
  theme: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  locale: LocaleSetting;
  resolvedLocale: Locale;
  setTheme: (theme: ThemeSetting) => void;
  setLocale: (locale: LocaleSetting) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// SSR-safe defaults: must match on server and client initial render
const DEFAULT_THEME: ThemeSetting = "light";
const DEFAULT_LOCALE: LocaleSetting = "system";
const SSR_RESOLVED_THEME: ResolvedTheme = "light";
const SSR_RESOLVED_LOCALE: Locale = "ko";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(setting: ThemeSetting): ResolvedTheme {
  if (setting === "system") return getSystemTheme();
  return setting;
}

function resolveLocale(setting: LocaleSetting): Locale {
  if (setting === "system") return detectLocale();
  return setting;
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#09090b" : "#fafafa");
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with fixed defaults to match SSR output
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<ThemeSetting>(DEFAULT_THEME);
  const [locale, setLocaleState] = useState<LocaleSetting>(DEFAULT_LOCALE);

  // Before mount, use SSR-safe resolved values to prevent hydration mismatch
  const resolvedTheme = useMemo(
    () => (mounted ? resolveTheme(theme) : SSR_RESOLVED_THEME),
    [theme, mounted]
  );
  const resolvedLocale = useMemo(
    () => (mounted ? resolveLocale(locale) : SSR_RESOLVED_LOCALE),
    [locale, mounted]
  );

  const setTheme = useCallback((t: ThemeSetting) => {
    setThemeState(t);
    localStorage.setItem("dst-theme", t);
    applyTheme(resolveTheme(t));
  }, []);

  const setLocale = useCallback((l: LocaleSetting) => {
    setLocaleState(l);
    localStorage.setItem("dst-locale", l);
  }, []);

  // Read saved preferences after mount (hydration-safe)
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("dst-theme") as ThemeSetting) || DEFAULT_THEME;
    const savedLocale =
      (localStorage.getItem("dst-locale") as LocaleSetting) || DEFAULT_LOCALE;
    setThemeState(savedTheme);
    setLocaleState(savedLocale);
    applyTheme(resolveTheme(savedTheme));
    setMounted(true);
  }, []);

  // Listen for system preference changes when theme is "system"
  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, mounted]);

  // Update html lang attribute
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = resolvedLocale.replace("_", "-");
  }, [resolvedLocale, mounted]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      locale,
      resolvedLocale,
      setTheme,
      setLocale,
    }),
    [theme, resolvedTheme, locale, resolvedLocale, setTheme, setLocale]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
