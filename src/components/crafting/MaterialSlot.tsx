"use client";

import { getMaterialById } from "@/lib/crafting-data";
import { useState } from "react";

interface MaterialSlotProps {
  materialId: string;
  quantity: number;
}

export function MaterialSlot({ materialId, quantity }: MaterialSlotProps) {
  const material = getMaterialById(materialId);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center size-8 rounded border border-zinc-700 bg-zinc-900">
        {material && !imgError ? (
          <img
            src={`/images/materials/${material.image}`}
            alt={material.nameKo}
            className="size-6 object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-[8px] text-zinc-500">?</span>
        )}
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center size-4 rounded-full bg-zinc-800 border border-zinc-600 text-[10px] font-bold text-zinc-200">
          {quantity}
        </span>
      </div>
      <span className="text-[10px] text-zinc-400 text-center leading-tight max-w-[48px] truncate">
        {material?.nameKo ?? materialId}
      </span>
    </div>
  );
}
