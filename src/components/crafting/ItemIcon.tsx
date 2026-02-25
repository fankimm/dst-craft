"use client";

import type { CraftingItem } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ItemIconProps {
  item: CraftingItem;
  isSelected: boolean;
  onClick: () => void;
}

export function ItemIcon({ item, isSelected, onClick }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative flex items-center justify-center rounded-md border bg-zinc-900 transition-colors hover:border-zinc-500 hover:bg-zinc-800 aspect-square",
            isSelected
              ? "border-amber-500 ring-1 ring-amber-500/50"
              : "border-zinc-700"
          )}
        >
          {imgError ? (
            <span className="text-[10px] text-zinc-500 text-center px-0.5 leading-tight">
              {item.nameKo}
            </span>
          ) : (
            <img
              src={`/images/items/${item.image}`}
              alt={item.nameKo}
              className="size-10 sm:size-12 object-contain"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{item.nameKo}</p>
      </TooltipContent>
    </Tooltip>
  );
}
