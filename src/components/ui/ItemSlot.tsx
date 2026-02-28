"use client";

import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

interface ItemSlotProps {
  /** game-items image filename (e.g. "meat.png") */
  icon?: string;
  /** Localized display name shown below the icon */
  label: string;
  /** Badge text shown at bottom-right of icon box (e.g. "×2", "≥3") */
  badge?: string;
  /** Visual variant */
  variant?: "default" | "excluded";
  /** Click handler — makes the slot interactive */
  onClick?: () => void;
}

export function ItemSlot({ icon, label, badge, variant = "default", onClick }: ItemSlotProps) {
  const isExcluded = variant === "excluded";
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1",
        isClickable && "cursor-pointer",
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Icon box */}
      <div
        className={cn(
          "relative flex items-center justify-center size-10 rounded border bg-surface",
          isExcluded
            ? "border-red-500/30 bg-red-500/5"
            : isClickable
              ? "border-primary/50 hover:border-primary hover:bg-primary/10 transition-colors"
              : "border-input",
        )}
      >
        {icon ? (
          <img
            src={assetPath(`/images/game-items/${icon}`)}
            alt={label}
            className="size-8 object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] text-muted-foreground">?</span>
        )}
        {/* Badge */}
        {badge && (
          <span
            className={cn(
              "absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold",
              isExcluded
                ? "bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400"
                : "bg-surface-hover border border-ring text-foreground/80",
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {/* Label */}
      <span
        className={cn(
          "text-[11px] text-center leading-tight max-w-[60px] truncate",
          isExcluded
            ? "text-red-500 dark:text-red-400 line-through"
            : isClickable
              ? "text-primary underline decoration-dotted"
              : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
