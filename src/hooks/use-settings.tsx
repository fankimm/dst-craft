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

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
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
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSetting>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("dst-theme") as ThemeSetting) || "dark";
  });

  const [locale, setLocaleState] = useState<LocaleSetting>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("dst-locale") as LocaleSetting) || "system";
  });

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
  const resolvedLocale = useMemo(() => resolveLocale(locale), [locale]);

  const setTheme = useCallback((t: ThemeSetting) => {
    setThemeState(t);
    localStorage.setItem("dst-theme", t);
    applyTheme(resolveTheme(t));
  }, []);

  const setLocale = useCallback((l: LocaleSetting) => {
    setLocaleState(l);
    localStorage.setItem("dst-locale", l);
  }, []);

  // Apply theme on mount and listen for system preference changes
  useEffect(() => {
    applyTheme(resolveTheme(theme));

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme(getSystemTheme());
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  // Update html lang attribute
  useEffect(() => {
    document.documentElement.lang = resolvedLocale;
  }, [resolvedLocale]);

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
