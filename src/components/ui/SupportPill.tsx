"use client";

import { Heart } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

export function SupportPill() {
  const { resolvedLocale } = useSettings();
  return (
    <div className="flex justify-center pt-1" style={{ paddingBottom: "max(4px, calc(env(safe-area-inset-bottom, 4px) * 0.5))" }}>
      <a
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        data-support-pill-anchor
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Heart className="size-3 fill-rose-400/80 text-rose-400/80" />
        <span>{t(resolvedLocale, "support_kofi")}</span>
      </a>
    </div>
  );
}
