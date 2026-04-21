"use client";

import { type ReactNode, useEffect } from "react";
import { X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupportPill } from "./SupportPill";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
}

/**
 * Reusable bottom-sheet detail panel with overlay, close button, and SupportPill.
 * Pair with `useDetailPanel` hook for animation state management.
 */
export function DetailPanel({ open, onClose, onBack, backLabel, children }: DetailPanelProps) {
  // Lock background scroll when panel is open
  useEffect(() => {
    if (!open) return;
    // Find the scrollable container behind the panel
    const scrollContainer = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (scrollContainer) {
      scrollContainer.style.overflow = "hidden";
      return () => { scrollContainer.style.overflow = ""; };
    }
    // Fallback: lock body
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-180",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card max-h-[80dvh] overflow-y-auto overscroll-contain transition-transform duration-180 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {onBack && backLabel ? (
          <div className="flex items-center px-2 py-1.5">
            <button
              onClick={onBack}
              className="flex items-center gap-0.5 px-1 py-0.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              <span className="max-w-[160px] truncate">{backLabel}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
        {children}
        <SupportPill />
      </div>
    </>
  );
}
