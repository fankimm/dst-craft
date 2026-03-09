"use client";

import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

function formatClicks(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

interface FavClickBadgeProps {
  isFav: boolean;
  onToggleFav: () => void;
  clicks?: number;
}

/**
 * Shared top-left badge: favorite heart + optional click count pill.
 * Used in ItemIcon, RecipeCard, BossCard grid items.
 */
export function FavClickBadge({ isFav, onToggleFav, clicks }: FavClickBadgeProps) {
  return (
    <div className="absolute top-1 left-1 flex items-center gap-0.5 z-10">
      <div
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
        className="p-0.5 rounded-full transition-colors cursor-pointer"
        role="button"
        aria-label="favorite"
      >
        <img
          src={assetPath("/images/ui/health.png")}
          alt=""
          className={cn("size-3.5 sm:size-4", !isFav && "opacity-30 grayscale")}
        />
      </div>
      {!!clicks && clicks > 0 && (
        <span className="flex items-center gap-px text-[9px] text-muted-foreground/50 tabular-nums">
          <img src={assetPath("/images/game-items/deerclops_eyeball.png")} alt="" className="size-2.5 object-contain" />
          {formatClicks(clicks)}
        </span>
      )}
    </div>
  );
}
