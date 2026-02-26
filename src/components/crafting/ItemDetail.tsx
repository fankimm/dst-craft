"use client";

import type { CraftingItem, CraftingStation, CategoryId } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MaterialSlot } from "./MaterialSlot";
import { getCategoryById, getCharacterById, stationImages } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { t, itemName, itemAltName, itemDesc, categoryName, characterName, stationName } from "@/lib/i18n";

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
  onStationClick?: (stationLabel: string) => void;
}

export function ItemDetail({ item, onMaterialClick, onCategoryClick, onCharacterClick, onStationClick }: ItemDetailProps) {
  const [imgError, setImgError] = useState(false);
  const { resolvedLocale } = useSettings();

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
              src={assetPath(`/images/items/${item.image}`)}
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
          <h3 className="text-sm font-semibold text-foreground">
            {itemName(item, resolvedLocale)}
          </h3>
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
            const clickable = !!onStationClick;
            return (
              <Badge
                key={station}
                variant="secondary"
                className={`text-xs gap-1 pl-1 pr-2 py-1 h-7 bg-surface-hover text-foreground/80 border-border ${clickable ? "cursor-pointer hover:border-primary hover:text-primary transition-colors" : ""}`}
                onClick={clickable ? () => onStationClick(label) : undefined}
                role={clickable ? "button" : undefined}
              >
                {stationImages[station] ? (
                  <img
                    src={assetPath(`/images/${stationImages[station]}`)}
                    alt=""
                    className="size-5 object-contain"
                  />
                ) : (
                  <span className="size-5" />
                )}
                {label}
              </Badge>
            );
          })}
          {/* Character badge (clickable) */}
          {item.characterOnly && (() => {
            const char = getCharacterById(item.characterOnly);
            return (
              <Badge
                variant="outline"
                className={`text-xs gap-1 pl-0.5 pr-2 py-1 border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 ${onCharacterClick ? "cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors" : ""}`}
                onClick={onCharacterClick ? () => onCharacterClick(item.characterOnly!) : undefined}
                role={onCharacterClick ? "button" : undefined}
              >
                {char && (
                  <img
                    src={assetPath(`/images/category-icons/characters/${char.portrait}.png`)}
                    alt={item.characterOnly}
                    className="size-5 object-contain"
                  />
                )}
                {char ? characterName(char, resolvedLocale) : item.characterOnly}
              </Badge>
            );
          })()}
          {/* Category badges (exclude "character" when characterOnly is set) */}
          {item.category
            .filter((catId) => !(item.characterOnly && catId === "character"))
            .map((catId) => {
              const cat = getCategoryById(catId);
              if (!cat) return null;
              const clickable = !!onCategoryClick;
              return (
                <Badge
                  key={catId}
                  variant="outline"
                  className={`text-xs gap-1 pl-1 pr-2 py-1 h-7 border-border text-muted-foreground ${clickable ? "cursor-pointer hover:border-primary hover:text-primary transition-colors" : ""}`}
                  onClick={clickable ? () => onCategoryClick(catId) : undefined}
                  role={clickable ? "button" : undefined}
                >
                  <img
                    src={assetPath(`/images/category-icons/${catId}.png`)}
                    alt=""
                    className="size-5 object-contain"
                  />
                  {categoryName(cat, resolvedLocale)}
                </Badge>
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
      </div>
    </div>
  );
}
