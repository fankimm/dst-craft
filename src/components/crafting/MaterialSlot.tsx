"use client";

import { getMaterialById, getItemById } from "@/lib/crafting-data";
import { useSettings } from "@/hooks/use-settings";
import { materialName } from "@/lib/i18n";
import type { CraftingItem } from "@/lib/types";
import { ItemSlot } from "@/components/ui/ItemSlot";

interface MaterialSlotProps {
  materialId: string;
  quantity: number;
  onMaterialClick?: (item: CraftingItem) => void;
}

export function MaterialSlot({ materialId, quantity, onMaterialClick }: MaterialSlotProps) {
  const material = getMaterialById(materialId);
  const { resolvedLocale } = useSettings();

  // Every material — craftable or gathered — opens its own ItemDetail so the
  // user can see "이 재료가 들어가는 제작품". getItemById falls back to a
  // synthetic CraftingItem for raw materials (flint/twigs/rocks/…).
  const target = getItemById(materialId);
  const handleClick = target && onMaterialClick
    ? () => onMaterialClick(target)
    : undefined;

  return (
    <ItemSlot
      icon={material?.image}
      label={material ? materialName(material, resolvedLocale) : materialId}
      badge={String(quantity)}
      onClick={handleClick}
    />
  );
}
