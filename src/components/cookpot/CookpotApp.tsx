"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, X, RotateCcw, Shuffle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { t, foodName, ingredientName, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { ingredientImage, type CookpotIngredient } from "@/data/cookpot-ingredients";
import { simulate } from "@/lib/cookpot-engine";
import type { CookingRecipe } from "@/data/recipes";
import { IngredientPicker } from "./IngredientPicker";
import { Footer } from "../crafting/Footer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Station = "cookpot" | "portablecookpot";
type Slots = (CookpotIngredient | null)[];

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

const COOK_TIME_BASE = 40;

// ---------------------------------------------------------------------------
// CookpotApp
// ---------------------------------------------------------------------------

export function CookpotApp() {
  const { resolvedLocale } = useSettings();

  // State
  const [slots, setSlots] = useState<Slots>([null, null, null, null]);
  const [station, setStation] = useState<Station>("cookpot");

  // Simulation result
  const filledIngredients = slots.filter((s): s is CookpotIngredient => s !== null);
  const allFilled = filledIngredients.length === 4;

  const result = useMemo(() => {
    if (!allFilled) return null;
    return simulate(filledIngredients, station);
  }, [allFilled, filledIngredients, station]);

  // Handlers
  const handleAddIngredient = useCallback((ingredient: CookpotIngredient) => {
    setSlots((prev) => {
      const next = [...prev];
      const emptyIdx = next.findIndex((s) => s === null);
      if (emptyIdx === -1) return prev;
      next[emptyIdx] = ingredient;
      return next;
    });
  }, []);

  const handleRemoveSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setSlots([null, null, null, null]);
  }, []);

  const stationImage =
    station === "cookpot" ? "cookpot.png" : "portablecookpot_item.png";

  // First result recipe (for overlay)
  const firstRecipe = result?.recipes[0] ?? null;

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
        <CookpotBreadcrumb locale={resolvedLocale} />
        {/* Station toggle */}
        <div className="flex items-center gap-1.5">
          <StationButton
            station="cookpot"
            active={station === "cookpot"}
            locale={resolvedLocale}
            onClick={() => setStation("cookpot")}
          />
          <StationButton
            station="portablecookpot"
            active={station === "portablecookpot"}
            locale={resolvedLocale}
            onClick={() => setStation("portablecookpot")}
          />
        </div>
      </div>

      {/* Scrollable main area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col min-h-full">
          {/* Cookpot + Slots area */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Cookpot image with result overlay */}
              <div className="relative flex-shrink-0">
                {/* Swap to cookpot_full when result exists (cookpot station only) */}
                <img
                  src={assetPath(`/images/game-items/${firstRecipe && station === "cookpot" ? "cookpot_full.png" : stationImage}`)}
                  alt={station}
                  className="size-20 sm:size-24 object-contain"
                  draggable={false}
                />
                {/* Result recipe image overlay */}
                {firstRecipe && firstRecipe.id !== "wetgoop" && (
                  <img
                    src={assetPath(`/images/game-items/${firstRecipe.id}.png`)}
                    alt={foodName(firstRecipe, resolvedLocale)}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 size-11 sm:size-13 object-contain drop-shadow-lg"
                  />
                )}
              </div>

              {/* Vertical slots */}
              <div className="flex flex-col gap-1.5">
                {slots.map((slot, i) => (
                  <IngredientSlot
                    key={i}
                    slot={slot}
                    index={i}
                    locale={resolvedLocale}
                    onRemove={handleRemoveSlot}
                  />
                ))}
              </div>

              {/* Clear button */}
              <div className="flex-shrink-0 self-end pb-1">
                {filledIngredients.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="flex items-center justify-center size-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    title={t(resolvedLocale, "cookpot_clear")}
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Result area (inline) */}
          <ResultArea result={result} allFilled={allFilled} locale={resolvedLocale} />

          {/* Ingredient picker (always visible) */}
          <div className="mt-auto">
            <IngredientPicker
              locale={resolvedLocale}
              onSelect={handleAddIngredient}
              disabled={allFilled}
            />
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function CookpotBreadcrumb({ locale }: { locale: Locale }) {
  const iconSrc = assetPath("/icons/icon-192.png");

  return (
    <nav className="flex items-center gap-1 min-w-0 text-sm">
      <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
      <span className="font-semibold text-foreground truncate">
        {t(locale, "tab_cookpot")}
      </span>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Station toggle button
// ---------------------------------------------------------------------------

function StationButton({
  station,
  active,
  locale,
  onClick,
}: {
  station: Station;
  active: boolean;
  locale: Locale;
  onClick: () => void;
}) {
  const img = station === "cookpot" ? "cookpot.png" : "portablecookpot_item.png";
  const labelKey: TranslationKey =
    station === "cookpot" ? "cookpot_station_cookpot" : "cookpot_station_portable";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-surface border border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <img
        src={assetPath(`/images/game-items/${img}`)}
        alt=""
        className="size-4 object-contain"
      />
      {t(locale, labelKey)}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Single ingredient slot (compact, horizontal row style)
// ---------------------------------------------------------------------------

function IngredientSlot({
  slot,
  index,
  locale,
  onRemove,
}: {
  slot: CookpotIngredient | null;
  index: number;
  locale: Locale;
  onRemove: (index: number) => void;
}) {
  if (!slot) {
    return (
      <div className="flex items-center gap-2 w-36 sm:w-44 h-10 rounded-lg border-2 border-dashed border-border bg-surface/50 px-2">
        <div className="size-7 flex items-center justify-center rounded-md bg-muted/50 text-xs font-semibold text-muted-foreground">
          {index + 1}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {t(locale, "cookpot_slot_empty")}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 w-36 sm:w-44 h-10 rounded-lg border border-border bg-surface px-2">
      <img
        src={assetPath(`/images/game-items/${ingredientImage(slot)}`)}
        alt={ingredientName(slot, locale)}
        className="size-7 object-contain"
      />
      <span className="text-[10px] sm:text-xs text-foreground/80 font-medium leading-tight truncate flex-1">
        {ingredientName(slot, locale)}
      </span>
      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="flex-shrink-0 size-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result area (inline, compact)
// ---------------------------------------------------------------------------

function ResultArea({
  result,
  allFilled,
  locale,
}: {
  result: ReturnType<typeof simulate> | null;
  allFilled: boolean;
  locale: Locale;
}) {
  if (!allFilled) {
    return (
      <div className="text-xs text-muted-foreground text-center py-3 px-4">
        {t(locale, "cookpot_no_result")}
      </div>
    );
  }

  if (!result || result.recipes.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-3 px-4">
        {t(locale, "cookpot_no_result")}
      </div>
    );
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {/* Random result badge */}
      {result.isRandom && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Shuffle className="size-3" />
            {t(locale, "cookpot_random_result")}
          </span>
        </div>
      )}

      {/* Result cards */}
      {result.recipes.map((recipe) => (
        <ResultCard
          key={recipe.id}
          recipe={recipe}
          locale={locale}
          isWetGoop={recipe.id === "wetgoop"}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result card (compact inline)
// ---------------------------------------------------------------------------

function ResultCard({
  recipe,
  locale,
  isWetGoop,
}: {
  recipe: CookingRecipe;
  locale: Locale;
  isWetGoop: boolean;
}) {
  const localName = foodName(recipe, locale);
  const showAltName = locale !== "en" && localName !== recipe.name;
  const cookSeconds = recipe.cookTime * COOK_TIME_BASE;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 space-y-2",
        isWetGoop
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-surface",
      )}
    >
      {/* Header row: image + name + meta */}
      <div className="flex items-center gap-3">
        <img
          src={assetPath(`/images/game-items/${recipe.id}.png`)}
          alt={localName}
          className="size-10 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{localName}</h3>
          {showAltName && (
            <p className="text-[10px] text-muted-foreground">{recipe.name}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {cookSeconds}{t(locale, "cooking_seconds")} ·{" "}
            {recipe.perishDays == null
              ? t(locale, "cooking_no_perish")
              : `${recipe.perishDays}${t(locale, "cooking_days")}`}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2">
        <InlineStat
          iconSrc={assetPath("/images/ui/health.png")}
          formatted={formatStat(recipe.health)}
          colorClass={statColor(recipe.health)}
        />
        <InlineStat
          iconSrc={assetPath("/images/ui/hunger.png")}
          formatted={formatStat(recipe.hunger)}
          colorClass={statColor(recipe.hunger)}
        />
        <InlineStat
          iconSrc={assetPath("/images/ui/sanity.png")}
          formatted={formatStat(recipe.sanity)}
          colorClass={statColor(recipe.sanity)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InlineStat (compact stat display)
// ---------------------------------------------------------------------------

function InlineStat({
  iconSrc,
  formatted,
  colorClass,
}: {
  iconSrc: string;
  formatted: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
      <img src={iconSrc} alt="" className="size-4 object-contain" />
      <span className={cn("text-xs font-semibold tabular-nums", colorClass)}>
        {formatted}
      </span>
    </div>
  );
}
