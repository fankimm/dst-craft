"use client";

import { getMaterialById } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { materialName } from "@/lib/i18n";

interface MaterialSlotProps {
  materialId: string;
  quantity: number;
}

export function MaterialSlot({ materialId, quantity }: MaterialSlotProps) {
  const material = getMaterialById(materialId);
  const [imgError, setImgError] = useState(false);
  const { resolvedLocale } = useSettings();

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center size-8 rounded border border-input bg-surface">
        {material && !imgError ? (
          <img
            src={`/images/materials/${material.image}`}
            alt={materialName(material, resolvedLocale)}
            className="size-6 object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-[8px] text-muted-foreground">?</span>
        )}
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center size-4 rounded-full bg-surface-hover border border-ring text-[10px] font-bold text-foreground/80">
          {quantity}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[48px] truncate">
        {material ? materialName(material, resolvedLocale) : materialId}
      </span>
    </div>
  );
}
