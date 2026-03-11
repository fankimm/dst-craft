"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Star, Github, Share2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { submitRating, trackEvent } from "@/lib/analytics";

interface ReviewPromptProps {
  open: boolean;
  onClose: () => void;
  locale: Locale;
}

export function ReviewPrompt({ open, onClose, locale }: ReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem("dst:review-dismissed", String(Date.now()));
    onClose();
  }, [onClose]);

  const [toast, setToast] = useState<string | null>(null);

  const handleRate = useCallback(async (star: number) => {
    setRating(star);
    localStorage.setItem("dst:my-rating", String(star));
    localStorage.setItem("dst:review-dismissed", "permanent");
    onClose();
    setToast(t(locale, "review_thanks"));
    setTimeout(() => setToast(null), 2000);
    await submitRating(star);
  }, [onClose, locale]);

  const handleGitHubStar = useCallback(() => {
    trackEvent("github_star_click");
    window.open("https://github.com/fankimm/dst-craft", "_blank", "noopener");
  }, []);

  const handleShare = useCallback(async () => {
    trackEvent("share");
    try {
      await navigator.share({
        title: "DST Craft",
        url: "https://dstcraft.com",
      });
    } catch {
      // User cancelled or share failed
    }
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-180",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card transition-transform duration-180 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex flex-col items-center px-6 pt-6 gap-4" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0.5rem))" }}>
              {/* App icon */}
              <Image
                src="/icons/icon-192.png"
                alt="DST Craft"
                width={56}
                height={56}
                className="rounded-xl"
              />

              {/* Title & message */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  {t(locale, "review_title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t(locale, "review_message")}
                </p>
              </div>

              {/* Star rating */}
              <div className="flex gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="p-1 touch-manipulation transition-transform active:scale-90"
                  >
                    <Star
                      className={cn(
                        "size-8 transition-colors",
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleGitHubStar}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors whitespace-nowrap"
                >
                  <Github className="size-4 shrink-0" />
                  <span className="truncate">{t(locale, "review_github_star")}</span>
                </button>
                {canShare && (
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors whitespace-nowrap"
                  >
                    <Share2 className="size-4 shrink-0" />
                    <span className="truncate">{t(locale, "review_share")}</span>
                  </button>
                )}
              </div>

              {/* Ko-fi support */}
              <a
                href="https://ko-fi.com/fankim"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
              >
                <Heart className="size-4" />
                {t(locale, "support_kofi")}
              </a>

              {/* Dismiss link */}
              <button
                onClick={dismiss}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(locale, "review_later")}
              </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-[60] pointer-events-none">
          <div className="bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in duration-200">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
