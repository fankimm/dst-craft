"use client";

import type { CraftingItem, CraftingStation, CategoryId } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MaterialSlot } from "./MaterialSlot";
import { getCategoryById } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { t, itemName, itemAltName, itemDesc, categoryName } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

const stationKeys: Record<CraftingStation, TranslationKey> = {
  none: "station_none",
  science_1: "station_science_1",
  science_2: "station_science_2",
  magic_1: "station_magic_1",
  magic_2: "station_magic_2",
  ancient: "station_ancient",
  celestial: "station_celestial",
  think_tank: "station_think_tank",
  cartography: "station_cartography",
  tackle_station: "station_tackle_station",
  potter_wheel: "station_potter_wheel",
  character: "station_character",
};

const stationIcons: Record<CraftingStation, string | null> = {
  none: null,
  science_1: "prototypers",
  science_2: "prototypers",
  magic_1: "magic",
  magic_2: "magic",
  ancient: "magic",
  celestial: "magic",
  think_tank: "prototypers",
  cartography: "tools",
  tackle_station: "fishing",
  potter_wheel: "tools",
  character: "character",
};

interface ItemDetailProps {
  item: CraftingItem | null;
  onMaterialClick?: (item: CraftingItem) => void;
  onCategoryClick?: (categoryId: CategoryId) => void;
  onCharacterClick?: (characterId: string) => void;
}

export function ItemDetail({ item, onMaterialClick, onCategoryClick, onCharacterClick }: ItemDetailProps) {
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
              src={`/images/items/${item.image}`}
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
          <p className="text-xs text-muted-foreground">
            {itemAltName(item, resolvedLocale)}
          </p>
        </div>

        <p className="text-xs text-dim leading-relaxed line-clamp-2">
          {itemDesc(item, resolvedLocale)}
        </p>

        {/* Badges: station, character, categories */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Station badge (hidden for character-only items since character badge conveys this) */}
          {!item.characterOnly && (
            <Badge
              variant="secondary"
              className="text-xs gap-1 pl-1 pr-2 py-1 bg-surface-hover text-foreground/80 border-border"
            >
              {stationIcons[item.station] && (
                <img
                  src={`/images/category-icons/${stationIcons[item.station]}.png`}
                  alt=""
                  className="size-5 object-contain"
                />
              )}
              {t(resolvedLocale, stationKeys[item.station])}
            </Badge>
          )}
          {/* Character badge (clickable) */}
          {item.characterOnly && (
            <Badge
              variant="secondary"
              className={`text-xs gap-1 pl-0.5 pr-2 py-1 bg-amber-900/40 text-amber-400 border-amber-700/50 ${onCharacterClick ? "cursor-pointer hover:bg-amber-900/60 transition-colors" : ""}`}
              onClick={onCharacterClick ? () => onCharacterClick(item.characterOnly!) : undefined}
              role={onCharacterClick ? "button" : undefined}
            >
              <img
                src={`/images/characters/${item.characterOnly}.png`}
                alt={item.characterOnly}
                className="size-5 rounded-full object-cover object-[center_25%] border border-amber-700/50"
              />
              {item.characterOnly}
            </Badge>
          )}
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
                  className={`text-xs gap-1 pl-1 pr-2 py-1 border-border text-muted-foreground ${clickable ? "cursor-pointer hover:border-primary hover:text-primary transition-colors" : ""}`}
                  onClick={clickable ? () => onCategoryClick(catId) : undefined}
                  role={clickable ? "button" : undefined}
                >
                  <img
                    src={`/images/category-icons/${catId}.png`}
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
