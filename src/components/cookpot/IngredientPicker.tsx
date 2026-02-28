"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import {
  cookpotIngredients,
  ingredientImage,
  type CookpotIngredient,
  type IngredientCategory,
} from "@/data/cookpot-ingredients";
import { t, ingredientName, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

// ---------------------------------------------------------------------------
// Category tabs with icons
// ---------------------------------------------------------------------------

interface CategoryTab {
  id: "all" | IngredientCategory;
  labelKey: TranslationKey;
  icon: string; // game-items image filename
}

const categoryTabs: CategoryTab[] = [
  { id: "all", labelKey: "cookpot_category_all", icon: "cookpot.png" },
  { id: "fruits", labelKey: "cookpot_category_fruits", icon: "pomegranate.png" },
  { id: "veggies", labelKey: "cookpot_category_veggies", icon: "carrot.png" },
  { id: "meats", labelKey: "cookpot_category_meats", icon: "meat.png" },
  { id: "fish", labelKey: "cookpot_category_fish", icon: "fishmeat.png" },
  { id: "eggs", labelKey: "cookpot_category_eggs", icon: "tallbirdegg.png" },
  { id: "sweeteners", labelKey: "cookpot_category_sweeteners", icon: "honey.png" },
  { id: "misc", labelKey: "cookpot_category_misc", icon: "twigs.png" },
];

// ---------------------------------------------------------------------------
// IngredientPicker (inline, always visible)
// ---------------------------------------------------------------------------

interface IngredientPickerProps {
  locale: Locale;
  onSelect: (ingredient: CookpotIngredient) => void;
  disabled?: boolean;
}

export function IngredientPicker({ locale, onSelect, disabled }: IngredientPickerProps) {
  const [category, setCategory] = useState<"all" | IngredientCategory>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = cookpotIngredients;

    // Category filter
    if (category !== "all") {
      list = list.filter((i) => i.category === category);
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const localName = ingredientName(i, locale).toLowerCase();
        const engName = i.name.toLowerCase();
        return localName.includes(q) || engName.includes(q);
      });
    }

    return list;
  }, [category, search, locale]);

  const handleSelect = (ing: CookpotIngredient) => {
    if (disabled) return;
    onSelect(ing);
  };

  return (
    <div className={cn(
      "flex flex-col border-t border-border bg-card rounded-t-xl",
      disabled && "opacity-50 pointer-events-none",
    )}>
      {/* Header: search + category tabs */}
      <div className="shrink-0 px-4 pt-3 pb-2 space-y-2">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(locale, "cookpot_search_ingredients")}
            className="w-full h-8 rounded-md border border-input bg-surface pl-3 pr-8 text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={cn(
                "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                category === tab.id
                  ? "bg-foreground text-background"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <img
                src={assetPath(`/images/game-items/${tab.icon}`)}
                alt=""
                className="size-4 object-contain"
              />
              {t(locale, tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient grid — fixed height so layout doesn't jump */}
      <div className="overflow-y-auto overscroll-contain px-3 pb-4" style={{ height: "40dvh" }}>
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            {t(locale, "noItems")}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
            {filtered.map((ing) => (
              <button
                key={ing.id}
                onClick={() => handleSelect(ing)}
                className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface p-2 transition-colors active:bg-surface-hover hover:bg-surface-hover hover:border-ring"
              >
                <img
                  src={assetPath(`/images/game-items/${ingredientImage(ing)}`)}
                  alt={ingredientName(ing, locale)}
                  className="size-9 sm:size-10 object-contain"
                  loading="lazy"
                />
                <span className="text-[10px] sm:text-xs text-foreground/80 font-medium text-center leading-tight line-clamp-2">
                  {ingredientName(ing, locale)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
