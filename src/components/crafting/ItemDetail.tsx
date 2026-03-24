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
import { ViewCount } from "@/components/ui/ViewCount";
import { itemStats, type ItemStats } from "@/data/item-stats";

const STAT_DISPLAY_ORDER: (keyof ItemStats)[] = [
  "damage", "planar_damage", "shadow_bonus", "uses", "armor_hp", "absorption", "planar_def",
  "speed_mult", "dapperness", "health_regen", "hunger_drain",
  "insulation", "summer_insulation", "waterproof", "slots",
  "fuel_time", "perish_time", "usage",
];

const STAT_LABELS: Record<string, Record<string, string>> = {
  ko: {
    damage: "공격력", planar_damage: "차원 피해", shadow_bonus: "그림자 보너스",
    uses: "내구도", armor_hp: "방어력", absorption: "흡수율", planar_def: "차원 방어",
    speed_mult: "이동속도", dapperness: "정신력",
    health_regen: "체력 회복", hunger_drain: "허기 소모",
    insulation: "보온", summer_insulation: "방열",
    waterproof: "방수", slots: "슬롯",
    fuel_time: "연료", perish_time: "부패", usage: "용도",
  },
  en: {
    damage: "Damage", planar_damage: "Planar DMG", shadow_bonus: "vs Shadow",
    uses: "Durability", armor_hp: "Armor", absorption: "Absorb", planar_def: "Planar DEF",
    speed_mult: "Speed", dapperness: "Sanity",
    health_regen: "HP Regen", hunger_drain: "Hunger Drain",
    insulation: "Insulation", summer_insulation: "Cooling",
    waterproof: "Waterproof", slots: "Slots",
    fuel_time: "Fuel", perish_time: "Perish", usage: "Usage",
  },
};


function formatItemStat(key: string, value: number | string | { ko: string; en: string }, locale: string): string {
  if (typeof value === "object" && value !== null && "ko" in value) {
    return locale === "ko" ? value.ko : value.en;
  }
  if (typeof value === "string") return value;
  if (key === "absorption" || key === "waterproof")
    return `${Math.round(value * 100)}%`;
  if (key === "speed_mult") {
    if (value > 1) return `+${Math.round((value - 1) * 100)}%`;
    if (value < 1) return `${Math.round((value - 1) * 100)}%`;
    return "0%";
  }
  if (key === "shadow_bonus") {
    return `x${value}`;
  }
  if (key === "health_regen" || key === "hunger_drain") {
    return `${value > 0 ? "+" : ""}${value}/s`;
  }
  if (key === "slots") {
    return locale === "ko" ? `${value}칸` : `${value}`;
  }
  if (key === "dapperness") {
    const perMin = Math.round(value * 60 * 10) / 10;
    return `${perMin > 0 ? "+" : ""}${perMin}${locale === "ko" ? "/분" : "/min"}`;
  }
  if (key === "fuel_time" || key === "perish_time") {
    const mins = Math.round(value / 60);
    if (mins >= 60) {
      const hrs = (mins / 60).toFixed(1);
      return locale === "ko" ? `${hrs}시간` : `${hrs}hr`;
    }
    return locale === "ko" ? `${mins}분` : `${mins}min`;
  }
  return String(value);
}

function getStatLabel(key: string, locale: string): string {
  return (STAT_LABELS[locale === "ko" ? "ko" : "en"]?.[key]) ?? key;
}

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
          <ViewCount clicks={clicks} />
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

        {/* Stats */}
        {itemStats[item.id] && (() => {
          const stats = itemStats[item.id];
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded px-1.5 py-0.5 leading-none w-fit">Beta</span>
              {STAT_DISPLAY_ORDER.filter((k) => stats[k] != null).map((k) => (
                k === "usage" ? (
                  <div key={k} className="text-xs text-foreground">
                    {formatItemStat(k, stats[k]!, resolvedLocale)}
                  </div>
                ) : (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{getStatLabel(k, resolvedLocale)}</span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatItemStat(k, stats[k]!, resolvedLocale)}
                      {k === "shadow_bonus" && stats.damage != null && (
                        <span className="font-normal text-muted-foreground">
                          {` (${Math.round(stats.damage * (stats[k] as number) * 10) / 10})`}
                        </span>
                      )}
                    </span>
                  </div>
                )
              ))}
            </div>
          );
        })()}

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
