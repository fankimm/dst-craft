"use client";

import type { CraftingItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { localName } from "@/lib/i18n";

interface ItemIconProps {
  item: CraftingItem;
  isSelected: boolean;
  onClick: () => void;
}

export function ItemIcon({ item, isSelected, onClick }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);
  const { resolvedLocale } = useSettings();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover",
        isSelected
          ? "border-amber-500 ring-1 ring-amber-500/50"
          : "border-border hover:border-ring"
      )}
    >
      {imgError ? (
        <div className="flex items-center justify-center size-12 sm:size-14">
          <span className="text-xs text-muted-foreground text-center leading-tight">
            {localName(item, resolvedLocale)}
          </span>
        </div>
      ) : (
        <img
          src={`/images/items/${item.image}`}
          alt={localName(item, resolvedLocale)}
          className="size-12 sm:size-14 object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
      <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight line-clamp-2">
        {localName(item, resolvedLocale)}
      </span>
    </button>
  );
}
