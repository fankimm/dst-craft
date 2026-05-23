"use client";

import { getMaterialById } from "@/lib/crafting-data";
import { useSettings } from "@/hooks/use-settings";
import { materialName } from "@/lib/i18n";
import { ItemSlot } from "@/components/ui/ItemSlot";

interface MaterialSlotProps {
  materialId: string;
  quantity: number;
  /** Click triggers a material-tag search (handled by parent). */
  onMaterialClick?: (materialId: string) => void;
}

export function MaterialSlot({ materialId, quantity, onMaterialClick }: MaterialSlotProps) {
  const material = getMaterialById(materialId);
  const { resolvedLocale } = useSettings();

  // Clicking a material in the recipe runs a search for "items using this
  // material" — same pattern as clicking a category/station badge.
  const handleClick = onMaterialClick
    ? () => onMaterialClick(materialId)
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
