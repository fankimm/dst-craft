"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupporterTicker } from "@/hooks/use-supporter-ticker";

export function SupportPill() {
  const { slots, index, prevIndex } = useSupporterTicker();

  return (
    <div className="flex justify-center" style={{ paddingTop: 2, paddingBottom: "max(2px, calc(env(safe-area-inset-bottom, 2px) * 0.4))" }}>
      <a
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        data-support-pill-anchor
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Heart className="size-3 fill-rose-400/80 text-rose-400/80 shrink-0" />
        <span className="relative inline-block h-3.5 overflow-hidden align-middle leading-[14px]">
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
    </div>
  );
}
