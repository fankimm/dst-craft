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
import { ItemSlot } from "../ui/ItemSlot";
import { SearchWithSuggestions, type SearchSuggestion } from "../ui/SearchWithSuggestions";

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
  icon?: string; // game-items image filename
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
  { id: "all", labelKey: "cooking_all", image: "game-items/meatballs.png", count: cookingRecipes.length },
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
    const ftIcons: Record<string, string> = { meat: "meat.png", veggie: "carrot.png", goodies: "honey.png", roughage: "cutlichen.png" };
    const ftLabelKeys: Record<string, TranslationKey> = { meat: "foodtype_meat", veggie: "foodtype_veggie", goodies: "foodtype_goodies", roughage: "foodtype_roughage" };
    const label = ftLabelKeys[foodType] ? t(resolvedLocale, ftLabelKeys[foodType]) : foodType;
    setActiveFilter({ type: "foodType", value: foodType, label, icon: ftIcons[foodType] });
  }, [resolvedLocale]);

  const handleStationClick = useCallback((station: string, label: string) => {
    setSelectedRecipe(null);
    setSelectedCategory("all");
    setSearchQuery("");
    const stIcons: Record<string, string> = { cookpot: "cookpot.png", portablecookpot: "portablecookpot_item.png" };
    setActiveFilter({ type: "station", value: station, label, icon: stIcons[station] });
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

  const handleSearchSelectRecipe = useCallback((recipe: CookingRecipe) => {
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveFilter(null);
    setSelectedRecipe(recipe);
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
  if (selectedCategory === null) {
    return (
      <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
        {/* Header */}
        <div className="border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
          <CookingBreadcrumb locale={resolvedLocale} onHomeClick={handleGoHome} />
          <CookingSearchInput value={searchQuery} onChange={setSearchQuery} locale={resolvedLocale} onSelectRecipe={handleSearchSelectRecipe} />
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
        <CookingSearchInput value={searchQuery} onChange={setSearchQuery} locale={resolvedLocale} onSelectRecipe={handleSearchSelectRecipe} />
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
// Search input with recipe suggestions
// ---------------------------------------------------------------------------

function CookingSearchInput({
  value,
  onChange,
  locale,
  onSelectRecipe,
}: {
  value: string;
  onChange: (v: string) => void;
  locale: Locale;
  onSelectRecipe: (recipe: CookingRecipe) => void;
}) {
  const suggestions: SearchSuggestion[] = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return cookingRecipes
      .filter((r) => {
        const localName = foodName(r, locale).toLowerCase();
        const engName = r.name.toLowerCase();
        return localName.includes(q) || engName.includes(q);
      })
      .slice(0, 8)
      .map((r) => ({
        key: r.id,
        text: foodName(r, locale),
        image: `game-items/${r.id}.png`,
        typeLabel: t(locale, "tab_cooking"),
        data: r,
      }));
  }, [value, locale]);

  return (
    <SearchWithSuggestions
      value={value}
      onChange={onChange}
      suggestions={suggestions}
      onSelect={(s) => onSelectRecipe(s.data as CookingRecipe)}
      placeholder={t(locale, "searchPlaceholder")}
    />
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
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <TagChip
              label={foodTypeLabelKeys[recipe.foodType] ? t(locale, foodTypeLabelKeys[recipe.foodType]) : recipe.foodType}
              icon={foodTypeIcons[recipe.foodType]}
              onClick={onFoodTypeClick ? () => onFoodTypeClick(recipe.foodType) : undefined}
            />
            {recipe.station === "cookpot" && (
              <TagChip
                label={t(locale, "cooking_cookpot")}
                icon="cookpot.png"
                onClick={onStationClick ? () => onStationClick("cookpot", t(locale, "cooking_cookpot")) : undefined}
              />
            )}
            {recipe.station === "portablecookpot" && (
              <TagChip
                label={t(locale, "cooking_warly_exclusive")}
                icon="portablecookpot_item.png"
                onClick={onStationClick ? () => onStationClick("portablecookpot", t(locale, "cooking_warly_exclusive")) : undefined}
              />
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
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <img
                src={assetPath(`/images/game-items/${recipe.temperature > 0 ? "campfire" : "ice"}.png`)}
                alt=""
                className="size-4 object-contain"
              />
              Temp
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
            <TagChip
              label={effectLabels[recipe.specialEffect] ?? recipe.specialEffect}
              onClick={onEffectClick ? () => onEffectClick(recipe.specialEffect!) : undefined}
            />
          </div>
        )}
      </div>

      {/* Requirements — split into needed / excluded */}
      {recipe.requirements && <RequirementsSections text={recipe.requirements} locale={locale} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Requirements renderer — replace item names with inline icons
// ---------------------------------------------------------------------------

/** Map of item display names → game-items image filenames */
const requirementIcons: Record<string, string> = {
  "Asparagus": "asparagus.png",
  "Cave Banana": "cave_banana.png",
  "Barnacle": "barnacle.png",
  "Berries": "berries.png",
  "Butter": "butter.png",
  "Butterfly Wings": "butterflywings.png",
  "Cactus Flower": "cactus_flower.png",
  "Cactus Flesh": "cactus_meat.png",
  "Corn": "corn.png",
  "Dragon Fruit": "dragonfruit.png",
  "Drumstick": "drumstick.png",
  "Eggplant": "eggplant.png",
  "Fig": "fig.png",
  "Forget-Me-Lots": "forgetmelots.png",
  "Frog Legs": "froglegs.png",
  "Garlic": "garlic.png",
  "Glow Berry": "wormlight.png",
  "Honey": "honey.png",
  "Kelp": "kelp.png",
  "Koalefant Trunk": "trunk_summer.png",
  "Leafy Meat": "plantmeat.png",
  "Lichen": "cutlichen.png",
  "Mandrake": "mandrake.png",
  "Moleworm": "mole.png",
  "Monster Meat": "monstermeat.png",
  "Moon Shroom": "moon_cap.png",
  "Red Cap": "red_cap.png",
  "Blue Cap": "blue_cap.png",
  "Green Cap": "green_cap.png",
  "Nightmare Fuel": "nightmarefuel.png",
  "Onion": "quagmire_onion.png",
  "Pepper": "pepper.png",
  "Pomegranate": "pomegranate.png",
  "Potato": "potato.png",
  "Pumpkin": "pumpkin.png",
  "Ripe Stone Fruit": "rock_avocado_fruit_ripe.png",
  "Royal Jelly": "royal_jelly.png",
  "Tallbird Egg": "tallbirdegg.png",
  "Tomato": "tomato.png",
  "Twigs": "twigs.png",
  "Volt Goat Horn": "lightninggoathorn.png",
  "Watermelon": "watermelon.png",
  "Wobster": "wobster_sheller_land.png",
  "Eel": "pondeel.png",
  "Bone Shards": "boneshard.png",
  "Acorn": "acorn.png",
  "Durian": "durian.png",
  // Tag-based requirements
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

/** Find the first known icon in a requirement string */
function findReqIcon(text: string): string | undefined {
  for (const [name, icon] of Object.entries(requirementIcons)) {
    if (text.includes(name)) return icon;
  }
  return undefined;
}

/** Render a requirement chip: icon + label */
/** Localized names for requirement terms */
const reqTranslations: Record<string, Record<string, string>> = {
  ko: {
    "Meat": "고기", "Veggie": "채소", "Fruit": "과일", "Fish": "생선",
    "Egg": "알", "Sweetener": "감미료", "Monster": "괴물", "Inedible": "못먹는것",
    "Frozen": "냉동", "Dairy": "유제품", "Fat": "지방", "Seed": "씨앗",
    "Magic": "마법", "Honey": "꿀", "Butter": "버터",
    "Asparagus": "아스파라거스", "Cave Banana": "동굴 바나나", "Barnacle": "거북순",
    "Berries": "딸기", "Butterfly Wings": "나비 날개", "Cactus Flower": "선인장 꽃",
    "Cactus Flesh": "선인장 과육", "Corn": "옥수수", "Dragon Fruit": "용과",
    "Drumstick": "닭다리", "Eggplant": "가지", "Fig": "무화과",
    "Forget-Me-Lots": "물망초", "Frog Legs": "개구리 다리", "Garlic": "마늘",
    "Glow Berry": "발광 열매", "Kelp": "다시마", "Koalefant Trunk": "코 주둥이",
    "Leafy Meat": "풀고기", "Lichen": "이끼", "Mandrake": "맨드레이크",
    "Moleworm": "두더지", "Monster Meat": "괴물 고기",
    "Moon Shroom": "달 버섯", "Red Cap": "빨간 버섯", "Blue Cap": "파란 버섯",
    "Green Cap": "초록 버섯", "Nightmare Fuel": "악몽 연료",
    "Onion": "양파", "Pepper": "고추", "Pomegranate": "석류",
    "Potato": "감자", "Pumpkin": "호박",
    "Ripe Stone Fruit": "돌과일", "Royal Jelly": "로열젤리",
    "Tallbird Egg": "톨버드 알", "Tomato": "토마토", "Twigs": "나뭇가지",
    "Volt Goat Horn": "번개 염소 뿔", "Watermelon": "수박",
    "Wobster": "로브스터", "Eel": "장어", "Bone Shards": "뼛조각",
    "Acorn": "도토리", "Durian": "두리안",
  },
};

function translateReq(text: string, locale: Locale): string {
  if (locale === "en") return text;
  const dict = reqTranslations[locale];
  if (!dict) return text;
  // Replace known terms (longest first)
  let result = text;
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), dict[key]);
  }
  return result;
}

/** Parse a single requirement entry like "Meat ≥ 3" or "Asparagus ×2" into name + badge */
function parseReqEntry(text: string): { name: string; badge?: string } {
  // Match patterns: "Name ×2", "Name ≥ 3", "Name > 2", "Name < 1", "Name ≤ 1"
  const m = text.match(/^(.+?)\s*(×|≥|>|<|≤)\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    return { name: m[1].trim(), badge: `${m[2]}${m[3]}` };
  }
  return { name: text.trim() };
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
          <div className="flex flex-wrap gap-4">
            {needed.map((item, i) => {
              const { name, badge } = parseReqEntry(item);
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

// ---------------------------------------------------------------------------
// TagChip — shared chip component for tags & filter badges
// ---------------------------------------------------------------------------

function TagChip({
  label,
  icon,
  onClick,
  onRemove,
}: {
  label: string;
  icon?: string; // game-items image filename
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const inner = (
    <>
      {icon && <img src={assetPath(`/images/game-items/${icon}`)} alt="" className="size-4 object-contain" />}
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3" />
        </button>
      )}
    </>
  );

  const base = "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium transition-colors";

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(base, "cursor-pointer hover:bg-surface-hover")}>
        {inner}
      </button>
    );
  }

  return <span className={base}>{inner}</span>;
}

// ---------------------------------------------------------------------------
// Tag helpers
// ---------------------------------------------------------------------------

const foodTypeIcons: Record<string, string> = {
  meat: "meat.png",
  veggie: "carrot.png",
  goodies: "honey.png",
  roughage: "cutlichen.png",
};

const foodTypeLabelKeys: Record<string, TranslationKey> = {
  meat: "foodtype_meat",
  veggie: "foodtype_veggie",
  goodies: "foodtype_goodies",
  roughage: "foodtype_roughage",
};
