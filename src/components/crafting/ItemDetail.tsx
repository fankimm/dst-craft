"use client";

import type { CraftingItem, CraftingStation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MaterialSlot } from "./MaterialSlot";
import { getCategoryById } from "@/lib/crafting-data";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { t, localName } from "@/lib/i18n";
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

interface ItemDetailProps {
  item: CraftingItem | null;
}

export function ItemDetail({ item }: ItemDetailProps) {
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
              {localName(item, resolvedLocale)}
            </span>
          ) : (
            <img
              src={`/images/items/${item.image}`}
              alt={localName(item, resolvedLocale)}
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
            {localName(item, resolvedLocale)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {resolvedLocale === "ko" ? item.nameEn : item.nameKo}
          </p>
        </div>

        <p className="text-xs text-dim leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Station + character badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className="text-[10px] bg-surface-hover text-foreground/80 border-border"
          >
            {t(resolvedLocale, stationKeys[item.station])}
          </Badge>
          {item.characterOnly && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-amber-900/40 text-amber-400 border-amber-700/50"
            >
              {item.characterOnly}
            </Badge>
          )}
        </div>

        {/* Category badges with icons */}
        <div className="flex flex-wrap gap-1.5">
          {item.category.map((catId) => {
            const cat = getCategoryById(catId);
            if (!cat) return null;
            return (
              <Badge
                key={catId}
                variant="outline"
                className="text-[10px] gap-1 pl-1 pr-1.5 py-0.5 border-border text-muted-foreground"
              >
                <img
                  src={`/images/category-icons/${catId}.png`}
                  alt=""
                  className="size-3.5 object-contain"
                />
                {localName(cat, resolvedLocale)}
              </Badge>
            );
          })}
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-3 pt-1">
          {item.materials.map((mat) => (
            <MaterialSlot
              key={mat.materialId}
              materialId={mat.materialId}
              quantity={mat.quantity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
