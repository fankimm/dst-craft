"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupportPill } from "./SupportPill";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Reusable bottom-sheet detail panel with overlay, close button, and SupportPill.
 * Pair with `useDetailPanel` hook for animation state management.
 */
export function DetailPanel({ open, onClose, children }: DetailPanelProps) {
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
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
        {children}
        <SupportPill />
      </div>
    </>
  );
}
