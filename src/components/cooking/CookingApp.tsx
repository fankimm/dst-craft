"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { trackItemClick, fetchCombos } from "@/lib/analytics";
import { usePopularity } from "@/hooks/use-popularity";
import { cookingRecipes, type CookingRecipe } from "@/data/recipes";
import { cookpotIngredients, ingredientImage } from "@/data/cookpot-ingredients";
import { useSettings } from "@/hooks/use-settings";
import { useFavorites } from "@/hooks/use-favorites";
import { useCookingState, type CookingCategoryId } from "@/hooks/use-cooking-state";
import { t, foodName, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { Footer } from "../crafting/Footer";
import { ItemSlot } from "../ui/ItemSlot";
import { SearchWithSuggestions, type SearchSuggestion } from "../ui/SearchWithSuggestions";
import { TagChip } from "../ui/TagChip";
import { useAuth } from "@/hooks/use-auth";
import { ViewCount } from "@/components/ui/ViewCount";
import { useRecent } from "@/hooks/use-recent";
import { ShareButton } from "../ui/ShareButton";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { SortDropdown } from "@/components/ui/SortDropdown";
import { FavClickBadge } from "@/components/ui/FavClickBadge";
import { statColor, formatStat } from "@/lib/stat-utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface CookingCategory {
  id: CookingCategoryId;
  labelKey: TranslationKey;
  image: string; // path relative to /images/
  count: number;
}

interface CookingFilter {
  type: "foodType" | "station" | "effect" | "ingredient";
  value: string;
  label: string;
  icon?: string; // game-items image filename
}

const COOK_TIME_BASE = 40; // seconds per cookTime unit

const HEALTH_THRESHOLD = 40;
const SANITY_THRESHOLD = 15;
const HUNGER_THRESHOLD = 62.5;

const cookpotCount = cookingRecipes.filter((r) => r.station === "cookpot").length;
const portableCount = cookingRecipes.filter((r) => r.station === "portablecookpot").length;
const healthRecommendCount = cookingRecipes.filter((r) => r.health >= HEALTH_THRESHOLD).length;
const sanityRecommendCount = cookingRecipes.filter((r) => r.sanity >= SANITY_THRESHOLD).length;
const hungerRecommendCount = cookingRecipes.filter((r) => r.hunger >= HUNGER_THRESHOLD).length;

const cookingCategories: CookingCategory[] = [
  { id: "all", labelKey: "cooking_all", image: "category-icons/cooking_all.png", count: cookingRecipes.length },
  { id: "cookpot", labelKey: "cooking_cookpot", image: "game-items/cookpot.png", count: cookpotCount },
  { id: "portablecookpot", labelKey: "cooking_portablecookpot", image: "game-items/portablecookpot_item.png", count: portableCount },
  { id: "recommend_health", labelKey: "cooking_recommend_health", image: "ui/health.png", count: healthRecommendCount },
  { id: "recommend_sanity", labelKey: "cooking_recommend_sanity", image: "ui/sanity.png", count: sanityRecommendCount },
  { id: "recommend_hunger", labelKey: "cooking_recommend_hunger", image: "ui/hunger.png", count: hungerRecommendCount },
];

// Effect badge labels
function effectLabel(effect: string, locale: Locale): string {
  const key = `effect_${effect}` as TranslationKey;
  const label = t(locale, key);
  return label !== key ? label : effect;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function isRecommendCategory(id: CookingCategoryId): boolean {
  return id === "recommend_health" || id === "recommend_sanity" || id === "recommend_hunger";
}

/** Extract searchable ingredient/tag names from recipe requirements (en + locale) */
function getRecipeIngredientNames(recipe: CookingRecipe, locale: Locale): string[] {
  if (!recipe.requirements) return [];
  const items = recipe.requirements.split(",").map(s => s.trim()).filter(Boolean);
  const names: string[] = [];
  for (const item of items) {
    const raw = item.replace(/^No\s+/, "");
    const { name } = parseReqEntry(raw);
    const parts = name.split(/\s*\/\s*/);
    for (const part of parts) {
      names.push(part.toLowerCase());
      const translated = translateReq(part, locale);
      if (translated !== part) names.push(translated.toLowerCase());
    }
  }
  return names;
}

/** Cooking ingredient suggestions (matches crafting-tab getSuggestions pattern) */
function getCookingIngredientSuggestions(query: string, locale: Locale) {
  const lower = query.toLowerCase();
  const results: Array<{ text: string; image: string; engName: string }> = [];

  // 1. cookpotIngredients: match by name + nameKo
  for (const ing of cookpotIngredients) {
    const names = [ing.name.toLowerCase()];
    if (ing.nameKo) names.push(ing.nameKo.toLowerCase());
    if (names.some(n => n.includes(lower))) {
      results.push({
        text: locale === "ko" && ing.nameKo ? ing.nameKo : ing.name,
        image: `game-items/${ingredientImage(ing)}`,
        engName: ing.name,
      });
    }
    if (results.length >= 5) return results;
  }

  // 2. Tag search (Meat→고기, Veggie→채소 etc.) via tagIcons + reqTagTranslations
  for (const [engTag, icon] of Object.entries(tagIcons)) {
    const translated = reqTagTranslations[locale]?.[engTag];
    const names = [engTag.toLowerCase()];
    if (translated) names.push(translated.toLowerCase());
    if (names.some(n => n.includes(lower))) {
      if (!results.some(r => r.engName === engTag)) {
        results.push({
          text: translated || engTag,
          image: `game-items/${icon}`,
          engName: engTag,
        });
      }
    }
    if (results.length >= 5) return results;
  }

  return results;
}

const cookingTypeLabels: Record<string, Record<string, string>> = {
  ko: { ingredient: "재료", recipe: "요리" },
  en: { ingredient: "Ingredient", recipe: "Recipe" },
  ja: { ingredient: "素材", recipe: "料理" },
  zh_CN: { ingredient: "材料", recipe: "料理" },
  zh_TW: { ingredient: "材料", recipe: "料理" },
};

// ---------------------------------------------------------------------------
// CookingApp
// ---------------------------------------------------------------------------

export function CookingApp({
  pendingRecipeId,
  onClearPendingRecipe,
}: {
  pendingRecipeId?: string | null;
  onClearPendingRecipe?: () => void;
}) {
  const { resolvedLocale } = useSettings();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const {
    selectedCategory,
    selectedRecipeId,
    showCategoryGrid,
    selectCategory,
    selectRecipe,
    openRecipeFromExternal,
    goHome,
  } = useCookingState();

  // Derive recipe object from ID
  const selectedRecipe = selectedRecipeId
    ? cookingRecipes.find((r) => r.id === selectedRecipeId) ?? null
    : null;

  // Cooking favorites: filter recipes whose id is in favorites set
  const cookingFavCount = useMemo(
    () => cookingRecipes.filter((r) => favorites.has(r.id)).length,
    [favorites],
  );

  const { getClicks } = usePopularity();
  const { isAdmin } = useAuth();
  const { recentIds, addRecent } = useRecent("cooking");
  const [sortByPopular, setSortByPopular] = useState(false);

  // Local transient state (search, filters, animation)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CookingFilter | null>(null);

  // Debounce search query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const slideClass = useSlideAnimation(selectedCategory, (v) => v === null);

  // Handle pending recipe from cookpot tab
  useEffect(() => {
    if (!pendingRecipeId) return;
    const recipe = cookingRecipes.find((r) => r.id === pendingRecipeId);
    if (recipe) {
      openRecipeFromExternal(recipe.id, "all");
      setSearchQuery("");
      setActiveFilter(null);
    }
    onClearPendingRecipe?.();
  }, [pendingRecipeId, onClearPendingRecipe, openRecipeFromExternal]);

  const { panelItem: panelRecipe, panelOpen } = useDetailPanel(selectedRecipe);

  const handleGoHome = useCallback(() => {
    goHome();
    setSearchQuery("");
    setActiveFilter(null);
  }, [goHome]);

  // Re-tap active tab → go home
  useEffect(() => {
    const handler = () => handleGoHome();
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, [handleGoHome]);

  const handleSelectCategory = useCallback((id: CookingCategoryId) => {
    selectCategory(id);
    setSearchQuery("");
    setActiveFilter(null);
    setSortByPopular(false);
  }, [selectCategory]);

  const handleClosePanel = useCallback(() => {
    selectRecipe(null);
  }, [selectRecipe]);

  // Badge click handlers — close panel, go to "all", set filter
  const handleFoodTypeClick = useCallback((foodType: string) => {
    selectRecipe(null);
    selectCategory("all");
    setSearchQuery("");
    const ftIcons: Record<string, string> = { meat: "game-items/meat.png", veggie: "game-items/carrot.png", goodies: "game-items/honey.png", roughage: "game-items/cutlichen.png" };
    const ftLabelKeys: Record<string, TranslationKey> = { meat: "foodtype_meat", veggie: "foodtype_veggie", goodies: "foodtype_goodies", roughage: "foodtype_roughage" };
    const label = ftLabelKeys[foodType] ? t(resolvedLocale, ftLabelKeys[foodType]) : foodType;
    setActiveFilter({ type: "foodType", value: foodType, label, icon: ftIcons[foodType] });
  }, [resolvedLocale, selectRecipe, selectCategory]);

  const handleStationClick = useCallback((station: string, label: string) => {
    selectRecipe(null);
    selectCategory("all");
    setSearchQuery("");
    const stIcons: Record<string, string> = { cookpot: "game-items/cookpot.png", portablecookpot: "game-items/portablecookpot_item.png" };
    setActiveFilter({ type: "station", value: station, label, icon: stIcons[station] });
  }, [selectRecipe, selectCategory]);

  const handleEffectClick = useCallback((effect: string) => {
    selectRecipe(null);
    selectCategory("all");
    setSearchQuery("");
    setActiveFilter({ type: "effect", value: effect, label: effectLabel(effect, resolvedLocale) });
  }, [selectRecipe, selectCategory, resolvedLocale]);

  const handleClearFilter = useCallback(() => {
    setActiveFilter(null);
  }, []);

  const handleSearchSelectRecipe = useCallback((recipe: CookingRecipe) => {
    selectCategory("all");
    setSearchQuery("");
    setActiveFilter(null);
    selectRecipe(recipe.id);
  }, [selectCategory, selectRecipe]);

  const handleSearchSelectIngredient = useCallback((engName: string, label: string, image?: string) => {
    selectCategory("all");
    setSearchQuery("");
    setActiveFilter({ type: "ingredient", value: engName, label, icon: image });
  }, [selectCategory]);

  // Filtered recipes for selected category
  const filteredRecipes = useMemo(() => {
    let recipes = cookingRecipes;

    // Category filter
    if (selectedCategory === "recent") {
      recipes = recentIds
        .map((id) => cookingRecipes.find((r) => r.id === id))
        .filter((r): r is CookingRecipe => !!r);
    } else if (selectedCategory === "favorites") {
      recipes = recipes.filter((r) => favorites.has(r.id));
    } else if (selectedCategory && selectedCategory !== "all") {
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
        case "ingredient":
          recipes = recipes.filter((r) => {
            if (!r.requirements) return false;
            const items = r.requirements.split(",").map(s => s.trim()).filter(Boolean);
            return items.some(item => {
              if (item.startsWith("No ")) return false;
              const { name } = parseReqEntry(item);
              return name.split(/\s*\/\s*/).some(part => part === activeFilter.value);
            });
          });
          break;
      }
    }

    // Search filter (uses debounced query)
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      recipes = recipes.filter((r) => {
        const localName = foodName(r, resolvedLocale).toLowerCase();
        const engName = r.name.toLowerCase();
        return localName.includes(q) || engName.includes(q) ||
          getRecipeIngredientNames(r, resolvedLocale).some(n => n.includes(q));
      });
    }

    return recipes;
  }, [selectedCategory, activeFilter, debouncedQuery, resolvedLocale, favorites, recentIds]);

  const displayRecipes = useMemo(() => {
    if (!sortByPopular) return filteredRecipes;
    return [...filteredRecipes].sort((a, b) => getClicks(b.id) - getClicks(a.id));
  }, [filteredRecipes, sortByPopular, getClicks]);

  // Current category info
  const currentCat = selectedCategory
    ? cookingCategories.find((c) => c.id === selectedCategory)
    : null;

  // Detail panel
  const detailPanel = panelRecipe && (
    <DetailPanel open={panelOpen} onClose={handleClosePanel}>
      <RecipeDetail
        recipe={panelRecipe}
        locale={resolvedLocale}
        onFoodTypeClick={handleFoodTypeClick}
        onStationClick={handleStationClick}
        onEffectClick={handleEffectClick}
        isFav={isFavorite(panelRecipe.id)}
        onToggleFav={() => toggleFavorite(panelRecipe.id)}
        clicks={getClicks(panelRecipe.id)}
      />
    </DetailPanel>
  );

  // Filter chip component
  const filterChip = activeFilter && (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <TagChip
        label={activeFilter.label}
        icon={activeFilter.icon}
        onRemove={handleClearFilter}
      />
    </div>
  );

  // -----------------------------------------------------------------------
  // Category grid view (home)
  // -----------------------------------------------------------------------
  if (showCategoryGrid) {
    return (
      <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
        {/* Header */}
        <div className="border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
          <CookingBreadcrumb locale={resolvedLocale} onHomeClick={handleGoHome} />
          <CookingSearchInput value={searchQuery} debouncedValue={debouncedQuery} onChange={setSearchQuery} locale={resolvedLocale} onSelectRecipe={handleSearchSelectRecipe} onSelectIngredient={handleSearchSelectIngredient} />
        </div>

        {/* Category grid */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
          <div className="flex flex-col min-h-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
              {/* Favorites tile */}
              {cookingFavCount > 0 && (
                <button
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
                  onClick={() => handleSelectCategory("favorites")}
                >
                  <div className="relative flex items-center justify-center size-12 sm:size-14">
                    <img
                      src={assetPath("/images/ui/health.png")}
                      alt=""
                      className="size-10 sm:size-12 object-contain"
                    />
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold bg-surface-hover border border-ring text-foreground/80">
                      {cookingFavCount}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
                    {t(resolvedLocale, "favorites")}
                  </span>
                </button>
              )}
              {/* Recent tile */}
              {recentIds.length > 0 && (
                <button
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
                  onClick={() => handleSelectCategory("recent" as CookingCategoryId)}
                >
                  <div className="flex items-center justify-center size-12 sm:size-14">
                    <img src={assetPath("/images/game-items/pocketwatch_warp.png")} alt="" className="size-10 sm:size-12 object-contain" draggable={false} />
                  </div>
                  <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
                    {t(resolvedLocale, "recent")}
                  </span>
                </button>
              )}
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
        <div className="flex items-center gap-2 min-w-0">
          <CookingBreadcrumb
            locale={resolvedLocale}
            categoryLabel={selectedCategory === "favorites" ? t(resolvedLocale, "favorites") : selectedCategory === "recent" ? t(resolvedLocale, "recent") : currentCat ? t(resolvedLocale, currentCat.labelKey) : undefined}
            onHomeClick={handleGoHome}
          />
          <div className="ml-auto shrink-0">
            <SortDropdown
              value={sortByPopular ? "popular" : "default"}
              onChange={(v) => setSortByPopular(v === "popular")}
              locale={resolvedLocale}
            />
          </div>
        </div>
        <CookingSearchInput value={searchQuery} debouncedValue={debouncedQuery} onChange={setSearchQuery} locale={resolvedLocale} onSelectRecipe={handleSearchSelectRecipe} onSelectIngredient={handleSearchSelectIngredient} />
      </div>

      {/* Filter chip */}
      {filterChip}

      {/* Recipe grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="flex flex-col min-h-full">
          <RecipeGrid
            recipes={displayRecipes}
            locale={resolvedLocale}
            onSelect={(recipe) => { selectRecipe(recipe.id); trackItemClick(recipe.id); addRecent(recipe.id); }}
            isFavorite={isFavorite}
            onToggleFav={toggleFavorite}
            getClicks={sortByPopular ? getClicks : undefined}
          />
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
  const iconSrc = assetPath("/images/category-icons/cooking.png");
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
// Search input with recipe suggestions
// ---------------------------------------------------------------------------

function CookingSearchInput({
  value,
  debouncedValue,
  onChange,
  locale,
  onSelectRecipe,
  onSelectIngredient,
}: {
  value: string;
  debouncedValue: string;
  onChange: (v: string) => void;
  locale: Locale;
  onSelectRecipe: (recipe: CookingRecipe) => void;
  onSelectIngredient: (engName: string, label: string, image?: string) => void;
}) {
  const suggestions: SearchSuggestion[] = useMemo(() => {
    const q = debouncedValue.trim().toLowerCase();
    if (!q) return [];
    const result: SearchSuggestion[] = [];

    // Ingredient suggestions first (crafting tab: materials before items)
    for (const s of getCookingIngredientSuggestions(debouncedValue, locale)) {
      result.push({
        key: `ing-${s.engName}`,
        text: s.text,
        image: s.image,
        typeLabel: cookingTypeLabels[locale]?.ingredient ?? "Ingredient",
        data: { type: "ingredient", engName: s.engName, label: s.text, image: s.image },
      });
    }

    // Recipe suggestions after
    const recipeMatches = cookingRecipes
      .filter((r) => {
        const localName = foodName(r, locale).toLowerCase();
        const engName = r.name.toLowerCase();
        return localName.includes(q) || engName.includes(q) ||
          getRecipeIngredientNames(r, locale).some(n => n.includes(q));
      })
      .slice(0, 8 - result.length);

    for (const r of recipeMatches) {
      result.push({
        key: r.id,
        text: foodName(r, locale),
        image: `game-items/${r.id}.png`,
        typeLabel: cookingTypeLabels[locale]?.recipe ?? "Recipe",
        data: { type: "recipe", recipe: r },
      });
    }

    return result.slice(0, 8);
  }, [debouncedValue, locale]);

  return (
    <SearchWithSuggestions
      value={value}
      onChange={onChange}
      suggestions={suggestions}
      onSelect={(s) => {
        const d = s.data as { type: string; [key: string]: unknown };
        if (d.type === "ingredient") {
          onSelectIngredient(d.engName as string, d.label as string, d.image as string | undefined);
        } else {
          onSelectRecipe((d as { type: string; recipe: CookingRecipe }).recipe);
        }
      }}
      placeholder={t(locale, "searchPlaceholder")}
    />
  );
}

// ---------------------------------------------------------------------------
// Recipe card (matches ItemIcon style)
// ---------------------------------------------------------------------------

const RECIPE_PAGE_SIZE = 36;

function RecipeGrid({
  recipes,
  locale,
  onSelect,
  isFavorite,
  onToggleFav,
  getClicks,
}: {
  recipes: CookingRecipe[];
  locale: Locale;
  onSelect: (recipe: CookingRecipe) => void;
  isFavorite: (id: string) => boolean;
  onToggleFav: (id: string) => void;
  getClicks?: (id: string) => number;
}) {
  const [visibleCount, setVisibleCount] = useState(RECIPE_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(RECIPE_PAGE_SIZE);
  }, [recipes]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + RECIPE_PAGE_SIZE, recipes.length));
  }, [recipes.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= recipes.length) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, recipes.length, loadMore]);

  if (recipes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {t(locale, "noItems")}
      </div>
    );
  }

  const visible = recipes.length > RECIPE_PAGE_SIZE ? recipes.slice(0, visibleCount) : recipes;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
      {visible.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          locale={locale}
          onClick={() => onSelect(recipe)}
          isFav={isFavorite(recipe.id)}
          onToggleFav={() => onToggleFav(recipe.id)}
          clicks={getClicks?.(recipe.id)}
        />
      ))}
      {visibleCount < recipes.length && (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-4">
          <div className="size-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  locale,
  onClick,
  isFav,
  onToggleFav,
  clicks,
}: {
  recipe: CookingRecipe;
  locale: Locale;
  onClick: () => void;
  isFav: boolean;
  onToggleFav: () => void;
  clicks?: number;
}) {
  const localName = foodName(recipe, locale);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover border-border hover:border-ring"
    >
      <FavClickBadge isFav={isFav} onToggleFav={onToggleFav} clicks={clicks} />
      {recipe.station === "portablecookpot" && (
        <img
          src={assetPath("/images/category-icons/characters/warly.png")}
          alt="Warly"
          className="absolute top-0.5 right-0.5 size-5 rounded-full"
        />
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
  isFav,
  onToggleFav,
  clicks,
}: {
  recipe: CookingRecipe;
  locale: Locale;
  onFoodTypeClick?: (foodType: string) => void;
  onStationClick?: (station: string, label: string) => void;
  onEffectClick?: (effect: string) => void;
  isFav: boolean;
  onToggleFav: () => void;
  clicks: number;
}) {
  const localName = foodName(recipe, locale);
  const showAltName = locale !== "en" && localName !== recipe.name;
  const cookSeconds = recipe.cookTime * COOK_TIME_BASE;

  const [activeTab, setActiveTab] = useState<"detail" | "combos">("detail");
  const [combos, setCombos] = useState<{ ingredients: string[]; count: number }[]>([]);
  const [combosLoading, setCombosLoading] = useState(false);
  const combosFetched = useRef<string | null>(null);

  // Fetch combos when switching to combos tab (or on mount if already on combos tab)
  useEffect(() => {
    if (activeTab !== "combos") return;
    if (combosFetched.current === recipe.id) return;
    combosFetched.current = recipe.id;
    setCombosLoading(true);
    fetchCombos(recipe.id).then(data => {
      setCombos(data);
      setCombosLoading(false);
    });
  }, [activeTab, recipe.id]);

  // Reset tab when recipe changes
  useEffect(() => {
    setActiveTab("detail");
    combosFetched.current = null;
    setCombos([]);
  }, [recipe.id]);

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
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold">{localName}</h3>
            <button
              onClick={onToggleFav}
              className="p-0.5 rounded-full transition-colors shrink-0"
              aria-label="favorite"
            >
              <img src={assetPath("/images/ui/health.png")} alt="" className={cn("size-4", !isFav && "opacity-30 grayscale")} />
            </button>
            <ShareButton
              url={`/?tab=cooking&cat=all&recipe=${recipe.id}`}
              toastMessage={locale === "ko" ? "링크가 복사되었습니다" : "Link copied"}
            />
          </div>
          {showAltName && (
            <p className="text-sm text-muted-foreground">{recipe.name}</p>
          )}
          <ViewCount clicks={clicks} className="mt-0.5" />
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <TagChip
              label={foodTypeLabelKeys[recipe.foodType] ? t(locale, foodTypeLabelKeys[recipe.foodType]) : recipe.foodType}
              icon={foodTypeIcons[recipe.foodType]}
              onClick={onFoodTypeClick ? () => onFoodTypeClick(recipe.foodType) : undefined}
            />
            {recipe.station === "cookpot" && (
              <TagChip
                label={t(locale, "cooking_cookpot")}
                icon="game-items/cookpot.png"
                onClick={onStationClick ? () => onStationClick("cookpot", t(locale, "cooking_cookpot")) : undefined}
              />
            )}
            {recipe.station === "portablecookpot" && (
              <TagChip
                label={t(locale, "cooking_warly_exclusive")}
                icon="game-items/portablecookpot_item.png"
                onClick={onStationClick ? () => onStationClick("portablecookpot", t(locale, "cooking_warly_exclusive")) : undefined}
              />
            )}
            {recipe.specialEffect && (
              <TagChip
                label={effectLabel(recipe.specialEffect, locale)}
                onClick={onEffectClick ? () => onEffectClick(recipe.specialEffect!) : undefined}
                className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats inline */}
      <div className="flex items-center justify-around rounded-lg border border-border bg-surface px-3 py-2.5">
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
          divider
        />
        <StatBox
          iconSrc={assetPath("/images/ui/sanity.png")}
          label={t(locale, "cooking_sanity")}
          value={recipe.sanity}
          formatted={formatStat(recipe.sanity)}
          colorClass={statColor(recipe.sanity)}
          divider
        />
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        <button
          onClick={() => setActiveTab("detail")}
          className={cn(
            "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
            activeTab === "detail"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {locale === "ko" ? "상세정보" : "Details"}
        </button>
        <button
          onClick={() => setActiveTab("combos")}
          className={cn(
            "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
            activeTab === "combos"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {locale === "ko" ? "인기 조합" : "Popular Combos"}
          {combos.length > 0 && <span className="ml-1 text-[10px] text-muted-foreground">{combos.length}</span>}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "detail" ? (
        <>
          {/* Info row — perish / cooktime / temp inline */}
          <div className="flex items-center py-1 text-sm">
            <div className="flex-1 flex items-center justify-center gap-1.5">
              <img src={assetPath("/images/ui/perish.png")} alt="" className="size-4 object-contain" />
              <div>
                <div className="font-semibold tabular-nums leading-tight">
                  {recipe.perishDays == null
                    ? t(locale, "cooking_no_perish")
                    : <>{recipe.perishDays}<span className="text-muted-foreground font-normal">{t(locale, "cooking_days")}</span></>}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{t(locale, "cooking_perish")}</div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 border-l border-border">
              <img src={assetPath("/images/ui/cooktime.png")} alt="" className="size-4 object-contain" />
              <div>
                <div className="font-semibold tabular-nums leading-tight">{cookSeconds}<span className="text-muted-foreground font-normal">{t(locale, "cooking_seconds")}</span></div>
                <div className="text-[10px] text-muted-foreground leading-tight">{t(locale, "cooking_cooktime")}</div>
              </div>
            </div>
            {recipe.temperature != null && (
              <div className="flex-1 flex items-center justify-center gap-1.5 border-l border-border">
                <img
                  src={assetPath(`/images/game-items/${recipe.temperature > 0 ? "campfire" : "ice"}.png`)}
                  alt=""
                  className="size-4 object-contain"
                />
                <div>
                  <div className="font-semibold tabular-nums leading-tight">
                    {recipe.temperature > 0 ? "+" : ""}{recipe.temperature}°
                    {recipe.temperatureDuration != null && <>{" / "}{recipe.temperatureDuration}<span className="text-muted-foreground font-normal">{t(locale, "cooking_seconds")}</span></>}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{t(locale, "cooking_temp")}</div>
                </div>
              </div>
            )}
          </div>

          {/* Requirements — split into needed / excluded */}
          {recipe.requirements && <RequirementsSections text={recipe.requirements} locale={locale} />}
        </>
      ) : (
        <CombosTab combos={combos} loading={combosLoading} locale={locale} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Combos tab — popular ingredient combinations from user simulations
// ---------------------------------------------------------------------------

const comboIngMap = new Map(cookpotIngredients.map(i => [i.id, i]));

function CombosTab({ combos, loading, locale }: {
  combos: { ingredients: string[]; count: number }[];
  loading: boolean;
  locale: Locale;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span className="text-sm">{locale === "ko" ? "불러오는 중..." : "Loading..."}</span>
      </div>
    );
  }

  if (combos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">{locale === "ko" ? "아직 조합 데이터가 없습니다" : "No combo data yet"}</p>
        <p className="text-xs mt-1">{locale === "ko" ? "요리솥 시뮬레이터에서 레시피를 만들어보세요!" : "Try making this recipe in the Crock Pot simulator!"}</p>
      </div>
    );
  }

  const totalCount = combos.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {locale === "ko" ? "인기순" : "Most popular"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {locale === "ko" ? `총 ${totalCount}회` : `${totalCount} total`}
        </span>
      </div>
      <div className="space-y-3">
        {combos.map((combo, i) => {
          // Group same ingredients with count
          const grouped = groupIngredients(combo.ingredients);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
                {combo.count}{locale === "ko" ? "회" : "×"}
              </span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {grouped.map((g, j) => {
                  const ing = comboIngMap.get(g.id);
                  const image = ing ? ingredientImage(ing) : undefined;
                  const name = locale === "ko" ? (ing?.nameKo ?? ing?.name ?? g.id) : (ing?.name ?? g.id);
                  return (
                    <ItemSlot
                      key={j}
                      icon={image}
                      label={name}
                      badge={g.count > 1 ? `${g.count}` : undefined}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Group sorted ingredient IDs into [{ id, count }] */
function groupIngredients(ids: string[]): { id: string; count: number }[] {
  const result: { id: string; count: number }[] = [];
  for (const id of ids) {
    const last = result[result.length - 1];
    if (last?.id === id) {
      last.count++;
    } else {
      result.push({ id, count: 1 });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Requirements renderer — replace item names with inline icons
// ---------------------------------------------------------------------------

/** Ingredient lookup by display name (from cookpot-ingredients — single source of truth) */
const ingredientByName = new Map(cookpotIngredients.map(ing => [ing.name, ing]));
// Aliases for requirement names that differ from canonical ingredient names
ingredientByName.set("Kelp", ingredientByName.get("Kelp Fronds")!);
ingredientByName.set("Lichen", ingredientByName.get("Cut Lichen")!);
ingredientByName.set("Moleworm", ingredientByName.get("Naked Mole Bat")!);
ingredientByName.set("Acorn", ingredientByName.get("Birchnut")!);

/** Tag-based requirement icons (not tied to a specific ingredient) */
const tagIcons: Record<string, string> = {
  "Meat": "meat.png",
  "Veggie": "carrot.png",
  "Fruit": "pomegranate.png",
  "Fish": "fishmeat.png",
  "Egg": "tallbirdegg.png",
  "Sweetener": "honey.png",
  "Monster": "monstermeat.png",
  "Inedible": "twigs.png",
  "Frozen": "ice.png",
  "Dairy": "butter.png",
  "Fat": "butter.png",
  "Seed": "seeds.png",
  "Magic": "nightmarefuel.png",
};

/** Find icon for a requirement: ingredient lookup first, then tag fallback */
function findReqIcon(text: string): string | undefined {
  const ing = ingredientByName.get(text);
  if (ing) return ingredientImage(ing);
  return tagIcons[text];
}

/** Tag-only translations (ingredient translations come from cookpot-ingredients) */
const reqTagTranslations: Record<string, Record<string, string>> = {
  ko: {
    "Meat": "고기", "Veggie": "채소", "Fruit": "과일", "Fish": "생선",
    "Egg": "알", "Sweetener": "감미료", "Monster": "괴물", "Inedible": "못먹는것",
    "Frozen": "얼음", "Dairy": "유제품", "Fat": "지방", "Seed": "씨앗",
    "Magic": "마법",
  },
};

function translateReq(text: string, locale: Locale): string {
  if (locale === "en") return text;
  // 1. cookpot-ingredients에서 재료 이름 찾기
  const ing = ingredientByName.get(text);
  if (ing?.nameKo && locale === "ko") return ing.nameKo;
  // 2. 태그 번역 폴백
  return reqTagTranslations[locale]?.[text] ?? text;
}

/** Parse a single requirement entry like "Meat ≥ 3" or "Asparagus ×2" into name + badge */
function parseReqEntry(text: string): { name: string; badge?: string } {
  // Strip parenthetical notes like "(or Lesser ×2)"
  const clean = text.replace(/\s*\(.*?\)\s*/, " ").trim();
  // Match patterns: "Name ×2", "Name ≥ 3", "Name > 2", "Name < 1", "Name ≤ 1"
  const m = clean.match(/^(.+?)\s*(×|≥|>|<|≤)\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    const op = m[2];
    return { name: m[1].trim(), badge: op === "×" ? m[3] : `${op}${m[3]}` };
  }
  return { name: clean };
}

/** Split requirements into "needed" and "excluded (No ...)" sections */
function RequirementsSections({ text, locale }: { text: string; locale: Locale }) {
  const items = text.split(",").map((s) => s.trim()).filter(Boolean);
  const needed: string[] = [];
  const excluded: string[] = [];

  for (const item of items) {
    if (item.startsWith("No ")) {
      excluded.push(item.replace(/^No\s+/, ""));
    } else {
      needed.push(item);
    }
  }

  // Skip "Anything (default)" type entries
  if (needed.length === 1 && needed[0].includes("Anything")) return null;

  return (
    <div className="space-y-3">
      {needed.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">{t(locale, "cooking_req_needed")}</span>
          <div className="flex flex-wrap items-center gap-4">
            {needed.map((item, i) => {
              const { name, badge } = parseReqEntry(item);
              const parts = name.split(/\s*\/\s*/);
              if (parts.length > 1) {
                return (
                  <div key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-1.5 py-1">
                    {parts.map((part, j) => (
                      <span key={j} className="flex items-center gap-1.5">
                        {j > 0 && <span className="text-[10px] text-muted-foreground">{t(locale, "cooking_or")}</span>}
                        <ItemSlot
                          icon={findReqIcon(part)}
                          label={translateReq(part, locale)}
                          badge={badge}
                        />
                      </span>
                    ))}
                  </div>
                );
              }
              return (
                <ItemSlot
                  key={i}
                  icon={findReqIcon(name)}
                  label={translateReq(name, locale)}
                  badge={badge}
                />
              );
            })}
          </div>
        </div>
      )}
      {excluded.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-red-500 dark:text-red-400 font-medium">{t(locale, "cooking_req_excluded")}</span>
          <div className="flex flex-wrap gap-4">
            {excluded.map((item, i) => {
              const { name } = parseReqEntry(item);
              return (
                <ItemSlot
                  key={i}
                  icon={findReqIcon(name)}
                  label={translateReq(name, locale)}
                  variant="excluded"
                />
              );
            })}
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
  divider,
}: {
  iconSrc: string;
  label: string;
  value: number;
  formatted: string;
  colorClass: string;
  divider?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", divider && "border-l border-border pl-4")}>
      <img src={iconSrc} alt={label} className="size-5 object-contain" />
      <div>
        <div className={cn("text-sm font-semibold tabular-nums leading-tight", colorClass)}>{formatted}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tag helpers
// ---------------------------------------------------------------------------

const foodTypeIcons: Record<string, string> = {
  meat: "game-items/meat.png",
  veggie: "game-items/carrot.png",
  goodies: "game-items/honey.png",
  roughage: "game-items/cutlichen.png",
  nonfood: "game-items/batnosehat.png",
};

const foodTypeLabelKeys: Record<string, TranslationKey> = {
  meat: "foodtype_meat",
  veggie: "foodtype_veggie",
  goodies: "foodtype_goodies",
  roughage: "foodtype_roughage",
  nonfood: "foodtype_nonfood",
};
