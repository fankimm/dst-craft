"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import { fetchSupporters } from "@/lib/analytics";

const ANON_TOKEN = "__anon__";

/**
 * Thin strip shown under the search bar (or at the top of search-less tabs)
 * that rotates supporter names. Hidden when there are no supporters.
 * Click navigates to ko-fi.
 */
export function SupporterStrip() {
  const { resolvedLocale } = useSettings();
  const [supporters, setSupporters] = useState<{ name: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);

  useEffect(() => {
    fetchSupporters().then(setSupporters);
  }, []);

  const slots = supporters.map((s) =>
    s.name === ANON_TOKEN
      ? `${t(resolvedLocale, "support_thanks")} ${t(resolvedLocale, "support_anonymous")}`
      : `${t(resolvedLocale, "support_thanks")} ${s.name}${resolvedLocale === "ko" ? "님" : ""}`,
  );

  useEffect(() => {
    if (slots.length <= 1) return;
    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((prev) => (prev + 1) % slots.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slots.length, index]);

  if (slots.length === 0) return null;

  return (
    <a
      href="https://ko-fi.com/fankim"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 h-6 px-3 text-[11px] text-muted-foreground/80 hover:text-foreground border-b border-border/40 bg-rose-500/[0.03] hover:bg-rose-500/[0.06] transition-colors"
    >
      <Heart className="size-2.5 fill-rose-400/80 text-rose-400/80 shrink-0" />
      <span className="relative inline-block h-4 overflow-hidden align-middle leading-4">
        <span aria-hidden className="invisible whitespace-nowrap">
          {slots.reduce((a, b) => (b.length > a.length ? b : a), "")}
        </span>
        {slots.map((label, i) => {
          const isCurrent = i === index;
          const isLeaving = i === prevIndex;
          return (
            <span
              key={`${i}-${label}`}
              className={cn(
                "absolute inset-0 flex items-center justify-center whitespace-nowrap transition-all duration-500 ease-in-out",
                isCurrent && "translate-y-0 opacity-100",
                isLeaving && "-translate-y-full opacity-0",
                !isCurrent && !isLeaving && "translate-y-full opacity-0",
              )}
            >
              {label}
            </span>
          );
        })}
      </span>
    </a>
  );
}
