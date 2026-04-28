"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import { fetchSupporters } from "@/lib/analytics";

const ANON_TOKEN = "__anon__";

export function SupportPill() {
  const { resolvedLocale } = useSettings();
  const [supporters, setSupporters] = useState<{ name: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);

  useEffect(() => {
    fetchSupporters().then(setSupporters);
  }, []);

  // Slot 0 = base label ("Support the developer"), then supporter names rotate
  const baseLabel = t(resolvedLocale, "support_kofi");
  const slots: string[] = [
    baseLabel,
    ...supporters.map((s) => (s.name === ANON_TOKEN ? t(resolvedLocale, "support_anonymous") : s.name)),
  ];

  useEffect(() => {
    if (slots.length <= 1) return;
    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((prev) => (prev + 1) % slots.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slots.length, index]);

  return (
    <div className="flex justify-center pt-1" style={{ paddingBottom: "max(4px, calc(env(safe-area-inset-bottom, 4px) * 0.5))" }}>
      <a
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Heart className="size-3 fill-rose-400/80 text-rose-400/80" />
        <span className="relative inline-block h-4 overflow-hidden align-middle">
          {/* invisible width-setter (longest slot) */}
          <span className="invisible whitespace-nowrap">
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
    </div>
  );
}
