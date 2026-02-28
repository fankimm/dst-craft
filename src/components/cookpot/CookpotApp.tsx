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
          {/* Result + Slots area */}
          <div className="px-3 pt-4 pb-2">
            <div className="flex gap-2">
              {/* Left: result card or empty placeholder — 50% */}
              <div className="w-1/2 min-w-0">
                <ResultPanel result={result} allFilled={allFilled} locale={resolvedLocale} />
              </div>

              {/* Right: vertical slots + clear button — 50% */}
              <div className="w-1/2 flex flex-col gap-1.5 items-start">
                {slots.map((slot, i) => (
                  <IngredientSlot
                    key={i}
                    slot={slot}
                    index={i}
                    locale={resolvedLocale}
                    onRemove={handleRemoveSlot}
                  />
                ))}
                {/* Clear button — always visible, disabled when empty */}
                <button
                  onClick={handleClear}
                  disabled={filledIngredients.length === 0}
                  className="flex items-center gap-1 mt-0.5 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface border border-border transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  title={t(resolvedLocale, "cookpot_clear")}
                >
                  <RotateCcw className="size-3" />
                  {t(resolvedLocale, "cookpot_clear")}
                </button>
              </div>
            </div>
          </div>

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
      <div className="flex items-center gap-1.5 w-full h-10 rounded-lg border-2 border-dashed border-border bg-surface/50 px-1.5">
        <div className="size-6 flex items-center justify-center rounded bg-muted/50 text-[10px] font-semibold text-muted-foreground shrink-0">
          {index + 1}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-1 w-full h-10 rounded-lg border border-border bg-surface px-1.5">
      <img
        src={assetPath(`/images/game-items/${ingredientImage(slot)}`)}
        alt={ingredientName(slot, locale)}
        className="size-7 object-contain shrink-0"
      />
      <span className="text-[9px] sm:text-[10px] text-foreground/80 font-medium leading-tight truncate flex-1">
        {ingredientName(slot, locale)}
      </span>
      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="flex-shrink-0 size-4 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="size-2.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result panel (left column: empty placeholder or result card)
// ---------------------------------------------------------------------------

function ResultPanel({
  result,
  allFilled,
  locale,
}: {
  result: ReturnType<typeof simulate> | null;
  allFilled: boolean;
  locale: Locale;
}) {
  // No result — show dashed placeholder
  if (!allFilled || !result || result.recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/30 h-full">
        <span className="text-[10px] text-muted-foreground text-center px-2">
          {t(locale, "cookpot_no_result")}
        </span>
      </div>
    );
  }

  // Has result — show card(s)
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Random result badge */}
      {result.isRandom && (
        <span className="inline-flex items-center gap-1 self-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Shuffle className="size-3" />
          {t(locale, "cookpot_random_result")}
        </span>
      )}

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

      {/* Stats (vertical) */}
      <div className="flex flex-col gap-1">
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
