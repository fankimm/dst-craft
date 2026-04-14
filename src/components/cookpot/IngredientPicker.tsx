"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { X, Star } from "lucide-react";
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
// LocalStorage helpers
// ---------------------------------------------------------------------------

const FAV_KEY = "dst:cookpot-fav-ingredients";
const RECENT_KEY = "dst:cookpot-recent-ingredients";
const MAX_RECENT = 20;

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

// ---------------------------------------------------------------------------
// Category tabs with icons
// ---------------------------------------------------------------------------

type PickerCategory = "favorites" | "recent" | "all" | IngredientCategory;

interface CategoryTab {
  id: PickerCategory;
  labelKey: TranslationKey;
  icon: string;
}

const categoryTabs: CategoryTab[] = [
  { id: "favorites", labelKey: "cookpot_category_favorites", icon: "health.png" },
  { id: "recent", labelKey: "cookpot_category_recent", icon: "cooktime.png" },
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
  const [category, setCategory] = useState<PickerCategory>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Favorites & recent state
  const [favIds, setFavIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setFavIds(readList(FAV_KEY));
    setRecentIds(readList(RECENT_KEY));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeList(FAV_KEY, next);
      return next;
    });
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      writeList(RECENT_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    // Special categories
    if (category === "favorites") {
      const favSet = new Set(favIds);
      return cookpotIngredients.filter((i) => favSet.has(i.id));
    }
    if (category === "recent") {
      const ingMap = new Map(cookpotIngredients.map((i) => [i.id, i]));
      return recentIds.map((id) => ingMap.get(id)).filter((i): i is CookpotIngredient => !!i);
    }

    let list = cookpotIngredients;

    // Category filter
    if (category !== "all") {
      list = list.filter((i) => i.category === category);
    }

    // Search filter
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const localName = ingredientName(i, locale).toLowerCase();
        const engName = i.name.toLowerCase();
        return localName.includes(q) || engName.includes(q);
      });
    }

    return list;
  }, [category, debouncedSearch, locale, favIds, recentIds]);

  const handleSelect = (ing: CookpotIngredient) => {
    if (disabled) return;
    addRecent(ing.id);
    onSelect(ing);
  };

  const favSet = useMemo(() => new Set(favIds), [favIds]);

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
          {categoryTabs.map((tab) => {
            const isUi = tab.id === "favorites" || tab.id === "recent";
            const imgDir = isUi ? "ui" : "game-items";
            return (
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
                  src={assetPath(`/images/${imgDir}/${tab.icon}`)}
                  alt=""
                  className="size-4 object-contain"
                />
                {t(locale, tab.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingredient grid — fixed height so layout doesn't jump */}
      <div className="overflow-y-auto overscroll-contain px-3" style={{ height: "40dvh", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 1rem))" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
            {category === "favorites"
              ? (locale === "ko" ? "재료를 길게 눌러 즐겨찾기에 추가하세요" : "Long-press an ingredient to add to favorites")
              : category === "recent"
                ? (locale === "ko" ? "아직 사용한 재료가 없습니다" : "No recently used ingredients")
                : t(locale, "noItems")}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
            {filtered.map((ing) => (
              <IngredientButton
                key={ing.id}
                ingredient={ing}
                locale={locale}
                isFav={favSet.has(ing.id)}
                onSelect={handleSelect}
                onToggleFav={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ingredient button with long-press favorite
// ---------------------------------------------------------------------------

function IngredientButton({
  ingredient,
  locale,
  isFav,
  onSelect,
  onToggleFav,
}: {
  ingredient: CookpotIngredient;
  locale: Locale;
  isFav: boolean;
  onSelect: (ing: CookpotIngredient) => void;
  onToggleFav: (id: string) => void;
}) {
  const timerRef = useState<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useState(false);

  const handlePointerDown = () => {
    didLongPress[1](false);
    timerRef[1](setTimeout(() => {
      didLongPress[1](true);
      onToggleFav(ingredient.id);
    }, 500));
  };

  const handlePointerUp = () => {
    if (timerRef[0]) clearTimeout(timerRef[0]);
    if (!didLongPress[0]) {
      onSelect(ingredient);
    }
  };

  const handlePointerLeave = () => {
    if (timerRef[0]) clearTimeout(timerRef[0]);
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors active:bg-surface-hover hover:bg-surface-hover select-none",
        isFav
          ? "border-amber-400/50 bg-amber-500/5"
          : "border-border bg-surface hover:border-ring",
      )}
    >
      {isFav && (
        <Star className="absolute top-0.5 right-0.5 size-2.5 fill-amber-400 text-amber-400" />
      )}
      <img
        src={assetPath(`/images/game-items/${ingredientImage(ingredient)}`)}
        alt={ingredientName(ingredient, locale)}
        className="size-9 sm:size-10 object-contain pointer-events-none"
        loading="lazy"
      />
      <span className="text-[10px] sm:text-xs text-foreground/80 font-medium text-center leading-tight line-clamp-2 pointer-events-none">
        {ingredientName(ingredient, locale)}
      </span>
    </button>
  );
}
