"use client";

import type { CraftingItem, CraftingStation, CategoryId } from "@/lib/types";
import { TagChip } from "@/components/ui/TagChip";
import { MaterialSlot } from "./MaterialSlot";
import { getCategoryById, getCharacterById, stationImages } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useFavorites } from "@/hooks/use-favorites";
import { t, itemName, itemAltName, itemDesc, categoryName, characterName, stationName } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

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
}

export function ItemDetail({ item, onMaterialClick, onCategoryClick, onCharacterClick, onStationClick }: ItemDetailProps) {
  const [imgError, setImgError] = useState(false);
  const { resolvedLocale } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();

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
        </div>

        {/* Extra info: health cost, skill tree, nounlock */}
        {(item.healthCost || item.builderSkill || item.nounlock) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px]">
            {item.healthCost && (
              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                <img src={assetPath("/images/ui/health.png")} alt="" className="size-3.5" />
                {t(resolvedLocale, "health_cost")} -{item.healthCost}
              </span>
            )}
            {item.builderSkill && (
              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v4M8 11v4M1 8h4M11 8h4M3.5 3.5l2.8 2.8M9.7 9.7l2.8 2.8M12.5 3.5l-2.8 2.8M6.3 9.7l-2.8 2.8"/></svg>
                {t(resolvedLocale, "skill_tree_required")}
              </span>
            )}
            {item.nounlock && !item.characterOnly && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>
                {t(resolvedLocale, "station_required")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
