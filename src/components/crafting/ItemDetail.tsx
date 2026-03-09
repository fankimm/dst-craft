"use client";

import type { CraftingItem, CraftingStation, CategoryId } from "@/lib/types";
import { TagChip } from "@/components/ui/TagChip";
import { MaterialSlot } from "./MaterialSlot";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { getCategoryById, getCharacterById, stationImages } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useFavorites } from "@/hooks/use-favorites";
import { t, itemName, itemAltName, itemDesc, categoryName, characterName, stationName, skillName } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { usePopularity } from "@/hooks/use-popularity";

// Higher-tier stations that can also craft items of the base station
const stationUpgrades: Partial<Record<CraftingStation, CraftingStation[]>> = {
  science_1: ["science_2"],
  magic_1: ["magic_2"],
};

interface ItemDetailProps {
  item: CraftingItem | null;
  onMaterialClick?: (item: CraftingItem) => void;
  onCategoryClick?: (categoryId: CategoryId) => void;
  onCharacterClick?: (characterId: string) => void;
  onStationClick?: (stationLabel: string, station?: string) => void;
  onBlueprintClick?: (itemId: string) => void;
}

export function ItemDetail({ item, onMaterialClick, onCategoryClick, onCharacterClick, onStationClick, onBlueprintClick }: ItemDetailProps) {
  const [imgError, setImgError] = useState(false);
  const { resolvedLocale } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getClicks } = usePopularity();
  const clicks = item ? getClicks(item.id) : 0;

  if (!item) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
        {t(resolvedLocale, "selectItem")}
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4">
      {/* Item image */}
      <div className="flex items-start justify-center shrink-0">
        <div className="flex items-center justify-center size-16 rounded-md border border-input bg-surface">
          {imgError ? (
            <span className="text-xs text-muted-foreground text-center px-1">
              {itemName(item, resolvedLocale)}
            </span>
          ) : (
            <img
              src={assetPath(`/images/game-items/${item.image}`)}
              alt={itemName(item, resolvedLocale)}
              className="size-14 object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              {itemName(item, resolvedLocale)}
            </h3>
            <button
              onClick={() => toggleFavorite(item.id)}
              className="p-0.5 rounded-full transition-colors shrink-0"
              aria-label="favorite"
            >
              <img src={assetPath("/images/ui/health.png")} alt="" className={cn("size-4", !isFavorite(item.id) && "opacity-30 grayscale")} />
            </button>
          </div>
          {itemAltName(item, resolvedLocale) && (
            <p className="text-xs text-muted-foreground">
              {itemAltName(item, resolvedLocale)}
            </p>
          )}
          {clicks > 0 && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
              <img src={assetPath("/images/game-items/deerclops_eyeball.png")} alt="" className="size-3 object-contain" />
              <span className="tabular-nums">{clicks.toLocaleString()}</span>
            </p>
          )}
        </div>

        <p className="text-xs text-dim leading-relaxed line-clamp-2">
          {itemDesc(item, resolvedLocale)}
        </p>

        {/* Badges: station, character, categories */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Station badges (hidden for character-only items since character badge conveys this) */}
          {!item.characterOnly && [item.station, ...(stationUpgrades[item.station] ?? [])].map((station) => {
            const label = stationName(station, resolvedLocale);
            return (
              <TagChip
                key={station}
                label={label}
                icon={stationImages[station] ?? undefined}
                onClick={onStationClick ? () => onStationClick(label, station) : undefined}
              />
            );
          })}
          {/* Character badge (clickable) */}
          {item.characterOnly && (() => {
            const char = getCharacterById(item.characterOnly);
            return (
              <TagChip
                label={char ? characterName(char, resolvedLocale) : item.characterOnly}
                icon={char ? `category-icons/characters/${char.portrait}.png` : undefined}
                onClick={onCharacterClick ? () => onCharacterClick(item.characterOnly!) : undefined}
                className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              />
            );
          })()}
          {/* Category badges (exclude "character" when characterOnly is set) */}
          {item.category
            .filter((catId) => !(item.characterOnly && catId === "character"))
            .map((catId) => {
              const cat = getCategoryById(catId);
              if (!cat) return null;
              return (
                <TagChip
                  key={catId}
                  label={categoryName(cat, resolvedLocale)}
                  icon={`category-icons/${catId}.png`}
                  onClick={onCategoryClick ? () => onCategoryClick(catId) : undefined}
                  className="text-muted-foreground"
                />
              );
            })}
          {/* Skill badge */}
          {item.builderSkill && (
            <TagChip
              label={resolvedLocale === "ko"
                ? `${skillName(item.builderSkill, resolvedLocale)} 스킬 필요`
                : `${skillName(item.builderSkill, resolvedLocale)} Skill Required`}
              icon={`skill-icons/${item.builderSkill}.png`}
              className="border-[#dab74e] bg-[#dab74e] text-black dark:border-[#dab74e] dark:bg-[#dab74e] dark:text-black"
            />
          )}
          {/* Blueprint badge */}
          {item.blueprint && !item.characterOnly && (
            <div className="flex flex-col items-center">
              <TagChip
                label={t(resolvedLocale, "blueprint_required")}
                icon="game-items/blueprint.png"
                onClick={onBlueprintClick ? () => onBlueprintClick(item.id) : undefined}
                className="border-[#3975ce] bg-[#3975ce] text-white dark:border-[#3975ce] dark:bg-[#3975ce] dark:text-white"
              />
              {onBlueprintClick && (
                <span className="w-3/4 border-b-2 border-dotted border-[#3975ce]/60 mt-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-4 pt-1">
          {item.materials.map((mat) => (
            <MaterialSlot
              key={mat.materialId}
              materialId={mat.materialId}
              quantity={mat.quantity}
              onMaterialClick={onMaterialClick}
            />
          ))}
          {/* Health cost — displayed as a material-style slot */}
          {item.healthCost && (
            <ItemSlot
              iconPath="/images/ui/health.png"
              label={t(resolvedLocale, "health_cost")}
              badge={`-${item.healthCost}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
