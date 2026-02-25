"use client";

import { getMaterialById, getItemByMaterialId } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { materialName } from "@/lib/i18n";
import type { CraftingItem } from "@/lib/types";

interface MaterialSlotProps {
  materialId: string;
  quantity: number;
  onMaterialClick?: (item: CraftingItem) => void;
}

export function MaterialSlot({ materialId, quantity, onMaterialClick }: MaterialSlotProps) {
  const material = getMaterialById(materialId);
  const [imgError, setImgError] = useState(false);
  const { resolvedLocale } = useSettings();

  const craftableItem = getItemByMaterialId(materialId);
  const isClickable = !!craftableItem && !!onMaterialClick;

  const handleClick = () => {
    if (isClickable) {
      onMaterialClick(craftableItem);
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-1 ${isClickable ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") handleClick(); } : undefined}
    >
      <div className={`relative flex items-center justify-center size-10 rounded border bg-surface ${isClickable ? "border-primary/50 hover:border-primary hover:bg-primary/10 transition-colors" : "border-input"}`}>
        {material && !imgError ? (
          <img
            src={`/images/materials/${material.image}`}
            alt={materialName(material, resolvedLocale)}
            className="size-8 object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] text-muted-foreground">?</span>
        )}
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center size-5 rounded-full bg-surface-hover border border-ring text-[11px] font-bold text-foreground/80">
          {quantity}
        </span>
      </div>
      <span className={`text-[11px] text-center leading-tight max-w-[60px] truncate ${isClickable ? "text-primary underline decoration-dotted" : "text-muted-foreground"}`}>
        {material ? materialName(material, resolvedLocale) : materialId}
      </span>
    </div>
  );
}
