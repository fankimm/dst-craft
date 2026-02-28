"use client";

import { getMaterialById, getItemByMaterialId } from "@/lib/crafting-data";
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

  const craftableItem = getItemByMaterialId(materialId);
  const isClickable = !!craftableItem && !!onMaterialClick;

  const handleClick = isClickable
    ? () => onMaterialClick(craftableItem)
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
