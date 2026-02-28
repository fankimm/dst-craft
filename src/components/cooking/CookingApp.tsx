"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronRight, X } from "lucide-react";
import { cookingRecipes, type CookingRecipe, type CookingStation } from "@/data/recipes";
import { useSettings } from "@/hooks/use-settings";
import { t, foodName, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { Footer } from "../crafting/Footer";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type RecommendCategoryId = "recommend_health" | "recommend_sanity" | "recommend_hunger";
type CookingCategoryId = "all" | CookingStation | RecommendCategoryId;

interface CookingCategory {
  id: CookingCategoryId;
  labelKey: TranslationKey;
  image: string; // path relative to /images/
  count: number;
}

interface CookingFilter {
  type: "foodType" | "station" | "effect";
  value: string;
  label: string;
}

const COOK_TIME_BASE = 40; // seconds per cookTime unit

const HEALTH_THRESHOLD = 40;
const SANITY_THRESHOLD = 15;
const HUNGER_THRESHOLD = 75;

const cookpotCount = cookingRecipes.filter((r) => r.station === "cookpot").length;
const portableCount = cookingRecipes.filter((r) => r.station === "portablecookpot").length;
const healthRecommendCount = cookingRecipes.filter((r) => r.health >= HEALTH_THRESHOLD).length;
const sanityRecommendCount = cookingRecipes.filter((r) => r.sanity >= SANITY_THRESHOLD).length;
const hungerRecommendCount = cookingRecipes.filter((r) => r.hunger >= HUNGER_THRESHOLD).length;

const cookingCategories: CookingCategory[] = [
  { id: "all", labelKey: "cooking_all", image: "category-icons/all.png", count: cookingRecipes.length },
  { id: "cookpot", labelKey: "cooking_cookpot", image: "game-items/cookpot.png", count: cookpotCount },
  { id: "portablecookpot", labelKey: "cooking_portablecookpot", image: "game-items/portablecookpot_item.png", count: portableCount },
  { id: "recommend_health", labelKey: "cooking_recommend_health", image: "ui/health.png", count: healthRecommendCount },
  { id: "recommend_sanity", labelKey: "cooking_recommend_sanity", image: "ui/sanity.png", count: sanityRecommendCount },
  { id: "recommend_hunger", labelKey: "cooking_recommend_hunger", image: "ui/hunger.png", count: hungerRecommendCount },
];

// Effect badge labels
const effectLabels: Record<string, string> = {
  health_regen: "HP Regen",
  sleep_resistance: "Sleep Resist",
  sanity_regen: "Sanity Regen",
  beefalo_food: "Beefalo",
  sleep: "Sleep",
  swap_health_sanity: "HP↔Sanity",
  electric_attack: "Electric",
  glow: "Glow",
  moisture_immunity: "Waterproof",
  heat_resistance: "Heat Resist",
  cold_resistance: "Cold Resist",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statColor(value: number): string {
  if (value > 0) return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

function formatStat(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function isRecommendCategory(id: CookingCategoryId): id is RecommendCategoryId {
  return id === "recommend_health" || id === "recommend_sanity" || id === "recommend_hunger";
}

// ---------------------------------------------------------------------------
// CookingApp
// ---------------------------------------------------------------------------

export function CookingApp() {
  const { resolvedLocale } = useSettings();

  // Navigation state
  const [selectedCategory, setSelectedCategory] = useState<CookingCategoryId | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<CookingRecipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CookingFilter | null>(null);

  // Slide animation
  const [slideDir, setSlideDir] = useState<"right" | "left" | null>(null);
  const prevCat = useRef(selectedCategory);

  useEffect(() => {
    if (prevCat.current !== selectedCategory) {
      setSlideDir(selectedCategory === null ? "left" : "right");
      prevCat.current = selectedCategory;
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!slideDir) return;
    const timer = setTimeout(() => setSlideDir(null), 260);
    return () => clearTimeout(timer);
  }, [slideDir]);

  const slideClass =
    slideDir === "right" ? "animate-slide-right" : slideDir === "left" ? "animate-slide-left" : "";

  // Detail panel animation
  const [panelRecipe, setPanelRecipe] = useState<CookingRecipe | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (selectedRecipe) {
      setPanelRecipe(selectedRecipe);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpen(true));
      });
    } else {
      setPanelOpen(false);
      const timer = setTimeout(() => setPanelRecipe(null), 180);
      return () => clearTimeout(timer);
    }
  }, [selectedRecipe]);

  const handleGoHome = useCallback(() => {
    setSelectedCategory(null);
    setSelectedRecipe(null);
    setSearchQuery("");
    setActiveFilter(null);
  }, []);

  const handleSelectCategory = useCallback((id: CookingCategoryId) => {
    setSelectedCategory(id);
    setSearchQuery("");
    setActiveFilter(null);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedRecipe(null);
  }, []);

  // Badge click handlers — close panel, go to "all", set filter
  const handleFoodTypeClick = useCallback((foodType: string) => {
    setSelectedRecipe(null);
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveFilter({ type: "foodType", value: foodType, label: foodType });
  }, []);

  const handleStationClick = useCallback((station: string, label: string) => {
    setSelectedRecipe(null);
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveFilter({ type: "station", value: station, label });
  }, []);

  const handleEffectClick = useCallback((effect: string) => {
    setSelectedRecipe(null);
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveFilter({ type: "effect", value: effect, label: effectLabels[effect] ?? effect });
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveFilter(null);
  }, []);

  // Filtered recipes for selected category
  const filteredRecipes = useMemo(() => {
    let recipes = cookingRecipes;

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      if (isRecommendCategory(selectedCategory)) {
        switch (selectedCategory) {
          case "recommend_health":
            recipes = recipes.filter((r) => r.health >= HEALTH_THRESHOLD);
            recipes = [...recipes].sort((a, b) => b.health - a.health);
            break;
          case "recommend_sanity":
            recipes = recipes.filter((r) => r.sanity >= SANITY_THRESHOLD);
            recipes = [...recipes].sort((a, b) => b.sanity - a.sanity);
            break;
          case "recommend_hunger":
            recipes = recipes.filter((r) => r.hunger >= HUNGER_THRESHOLD);
            recipes = [...recipes].sort((a, b) => b.hunger - a.hunger);
            break;
        }
      } else {
        recipes = recipes.filter((r) => r.station === selectedCategory);
      }
    }

    // Active filter from badge click
    if (activeFilter) {
      switch (activeFilter.type) {
        case "foodType":
          recipes = recipes.filter((r) => r.foodType === activeFilter.value);
          break;
        case "station":
          recipes = recipes.filter((r) => r.station === activeFilter.value);
          break;
        case "effect":
          recipes = recipes.filter((r) => r.specialEffect === activeFilter.value);
          break;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      recipes = recipes.filter((r) => {
        const localName = foodName(r, resolvedLocale).toLowerCase();
        const engName = r.name.toLowerCase();
        return localName.includes(q) || engName.includes(q);
      });
    }

    return recipes;
  }, [selectedCategory, activeFilter, searchQuery, resolvedLocale]);

  // Current category info
  const currentCat = selectedCategory
    ? cookingCategories.find((c) => c.id === selectedCategory)
    : null;

  // Detail panel
  const detailPanel = panelRecipe && (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-180",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClosePanel}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card max-h-[80dvh] overflow-y-auto overscroll-contain transition-transform duration-180 ease-out",
          panelOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <button
          onClick={handleClosePanel}
          className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
        <RecipeDetail
          recipe={panelRecipe}
          locale={resolvedLocale}
          onFoodTypeClick={handleFoodTypeClick}
          onStationClick={handleStationClick}
          onEffectClick={handleEffectClick}
        />
      </div>
    </>
  );

  // Filter chip component
  const filterChip = activeFilter && (
    <div className="flex items-center gap-1.5 px-4 pt-2">
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium">
        {activeFilter.label}
        <button
          onClick={handleClearFilter}
          className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3" />
        </button>
      </span>
    </div>
  );

  // -----------------------------------------------------------------------
  // Category grid view (home)
  // -----------------------------------------------------------------------
  if (selectedCategory === null) {
    return (
      <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
        {/* Header */}
        <div className="border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
          <CookingBreadcrumb locale={resolvedLocale} onHomeClick={handleGoHome} />
          <SearchInput value={searchQuery} onChange={setSearchQuery} locale={resolvedLocale} />
        </div>

        {/* Category grid */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="flex flex-col min-h-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4">
              {cookingCategories.map((cat) => (
                <button
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
                  onClick={() => handleSelectCategory(cat.id)}
                >
                  <img
                    src={assetPath(`/images/${cat.image}`)}
                    alt={t(resolvedLocale, cat.labelKey)}
                    className="size-12 sm:size-14 object-contain"
                    draggable={false}
                  />
                  <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
                    {t(resolvedLocale, cat.labelKey)}
                  </span>
                </button>
              ))}
            </div>
            <Footer />
          </div>
        </div>

        {detailPanel}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Recipe list view (after category selection)
  // -----------------------------------------------------------------------
  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
      {/* Header */}
      <div className="border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
        <CookingBreadcrumb
          locale={resolvedLocale}
          categoryLabel={currentCat ? t(resolvedLocale, currentCat.labelKey) : undefined}
          onHomeClick={handleGoHome}
        />
        <SearchInput value={searchQuery} onChange={setSearchQuery} locale={resolvedLocale} />
      </div>

      {/* Filter chip */}
      {filterChip}

      {/* Recipe grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col min-h-full">
          {filteredRecipes.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              {t(resolvedLocale, "noItems")}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  locale={resolvedLocale}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          )}
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function CookingBreadcrumb({
  locale,
  categoryLabel,
  onHomeClick,
}: {
  locale: Locale;
  categoryLabel?: string;
  onHomeClick: () => void;
}) {
  const iconSrc = assetPath("/icons/icon-192.png");
  const isHome = !categoryLabel;

  return (
    <nav className="flex items-center gap-1 min-w-0 text-sm">
      {/* Home icon */}
      {isHome ? (
        <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
      ) : (
        <button onClick={onHomeClick} className="shrink-0 rounded-sm hover:opacity-70 transition-opacity">
          <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
        </button>
      )}

      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />

      {isHome ? (
        <span className="font-semibold text-foreground truncate">
          {t(locale, "tab_cooking")}
        </span>
      ) : (
        <>
          <button
            onClick={onHomeClick}
            className="text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            {t(locale, "tab_cooking")}
          </button>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate">{categoryLabel}</span>
        </>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Search input (simple)
// ---------------------------------------------------------------------------

function SearchInput({
  value,
  onChange,
  locale,
}: {
  value: string;
  onChange: (v: string) => void;
  locale: Locale;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t(locale, "searchPlaceholder")}
        className="w-full h-8 rounded-md border border-input bg-surface pl-3 pr-8 text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recipe card (matches ItemIcon style)
// ---------------------------------------------------------------------------

function RecipeCard({
  recipe,
  locale,
  onClick,
}: {
  recipe: CookingRecipe;
  locale: Locale;
  onClick: () => void;
}) {
  const localName = foodName(recipe, locale);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover border-border hover:border-ring"
    >
      {recipe.station === "portablecookpot" && (
        <span className="absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 leading-none">
          W
        </span>
      )}
      <img
        src={assetPath(`/images/game-items/${recipe.id}.png`)}
        alt={localName}
        className="size-12 sm:size-14 object-contain"
        loading="lazy"
      />
      <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight line-clamp-2">
        {localName}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Recipe detail (bottom sheet content)
// ---------------------------------------------------------------------------

function RecipeDetail({
  recipe,
  locale,
  onFoodTypeClick,
  onStationClick,
  onEffectClick,
}: {
  recipe: CookingRecipe;
  locale: Locale;
  onFoodTypeClick?: (foodType: string) => void;
  onStationClick?: (station: string, label: string) => void;
  onEffectClick?: (effect: string) => void;
}) {
  const localName = foodName(recipe, locale);
  const showAltName = locale !== "en" && localName !== recipe.name;
  const cookSeconds = recipe.cookTime * COOK_TIME_BASE;

  return (
    <div className="p-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          src={assetPath(`/images/game-items/${recipe.id}.png`)}
          alt={localName}
          className="size-16 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-base font-semibold">{localName}</h3>
          {showAltName && (
            <p className="text-sm text-muted-foreground">{recipe.name}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <FoodTypeBadge foodType={recipe.foodType} onClick={onFoodTypeClick} />
            {recipe.station === "cookpot" && (
              <button
                onClick={() => onStationClick?.("cookpot", t(locale, "cooking_cookpot"))}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-500/15 text-stone-600 dark:text-stone-400 cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-1"
              >
                <img
                  src={assetPath("/images/game-items/cookpot.png")}
                  alt=""
                  className="size-3.5 object-contain"
                />
                {t(locale, "cooking_cookpot")}
              </button>
            )}
            {recipe.station === "portablecookpot" && (
              <button
                onClick={() => onStationClick?.("portablecookpot", t(locale, "cooking_warly_exclusive"))}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-1"
              >
                <img
                  src={assetPath("/images/game-items/portablecookpot_item.png")}
                  alt=""
                  className="size-3.5 object-contain"
                />
                {t(locale, "cooking_warly_exclusive")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          iconSrc={assetPath("/images/ui/health.png")}
          label={t(locale, "cooking_health")}
          value={recipe.health}
          formatted={formatStat(recipe.health)}
          colorClass={statColor(recipe.health)}
        />
        <StatBox
          iconSrc={assetPath("/images/ui/hunger.png")}
          label={t(locale, "cooking_hunger")}
          value={recipe.hunger}
          formatted={formatStat(recipe.hunger)}
          colorClass={statColor(recipe.hunger)}
        />
        <StatBox
          iconSrc={assetPath("/images/ui/sanity.png")}
          label={t(locale, "cooking_sanity")}
          value={recipe.sanity}
          formatted={formatStat(recipe.sanity)}
          colorClass={statColor(recipe.sanity)}
        />
      </div>

      {/* Info rows */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <img src={assetPath("/images/ui/perish.png")} alt="" className="size-4 object-contain" />
            {t(locale, "cooking_perish")}
          </span>
          <span>
            {recipe.perishDays == null
              ? t(locale, "cooking_no_perish")
              : `${recipe.perishDays}${t(locale, "cooking_days")}`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <img src={assetPath("/images/ui/cooktime.png")} alt="" className="size-4 object-contain" />
            {t(locale, "cooking_cooktime")}
          </span>
          <span>{cookSeconds}{t(locale, "cooking_seconds")}</span>
        </div>
        {recipe.temperature != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {recipe.temperature > 0 ? "🔥" : "❄️"} Temp
            </span>
            <span>
              {recipe.temperature > 0 ? "+" : ""}{recipe.temperature}°
              {recipe.temperatureDuration != null && ` / ${recipe.temperatureDuration}${t(locale, "cooking_seconds")}`}
            </span>
          </div>
        )}
        {recipe.specialEffect && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t(locale, "cooking_effect")}</span>
            <EffectBadge effect={recipe.specialEffect} onClick={onEffectClick} />
          </div>
        )}
      </div>

      {/* Requirements */}
      {recipe.requirements && (
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">{t(locale, "cooking_requirements")}</span>
          <p className="text-sm leading-relaxed">{recipe.requirements}</p>
        </div>
      )}

      {/* Suggested ingredients */}
      {recipe.cardIngredients && recipe.cardIngredients.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">{t(locale, "cooking_ingredients")}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {recipe.cardIngredients.map(([id, qty], i) => (
              <div key={i} className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1">
                <img
                  src={assetPath(`/images/game-items/${id}.png`)}
                  alt={id}
                  className="size-6 object-contain"
                  loading="lazy"
                />
                <span className="text-xs font-medium">x{qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small UI components
// ---------------------------------------------------------------------------

function StatBox({
  iconSrc,
  label,
  formatted,
  colorClass,
}: {
  iconSrc: string;
  label: string;
  value: number;
  formatted: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 text-center">
      <img src={iconSrc} alt={label} className="size-6 mx-auto object-contain" />
      <div className={cn("text-sm font-semibold tabular-nums mt-1", colorClass)}>{formatted}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function FoodTypeBadge({ foodType, onClick }: { foodType: string; onClick?: (foodType: string) => void }) {
  const colors: Record<string, string> = {
    meat: "bg-red-500/15 text-red-600 dark:text-red-400",
    veggie: "bg-green-500/15 text-green-600 dark:text-green-400",
    goodies: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    roughage: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
    generic: "bg-muted text-muted-foreground",
  };

  if (onClick) {
    return (
      <button
        onClick={() => onClick(foodType)}
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-medium capitalize cursor-pointer hover:opacity-70 transition-opacity",
          colors[foodType] ?? colors.generic
        )}
      >
        {foodType}
      </button>
    );
  }

  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium capitalize", colors[foodType] ?? colors.generic)}>
      {foodType}
    </span>
  );
}

function EffectBadge({ effect, onClick }: { effect: string; onClick?: (effect: string) => void }) {
  const label = effectLabels[effect] ?? effect;

  if (onClick) {
    return (
      <button
        onClick={() => onClick(effect)}
        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 cursor-pointer hover:opacity-70 transition-opacity"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400">
      {label}
    </span>
  );
}
