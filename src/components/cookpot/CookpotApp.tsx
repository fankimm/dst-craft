"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, Plus, X, RotateCcw, Shuffle } from "lucide-react";
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Simulation result
  const filledIngredients = slots.filter((s): s is CookpotIngredient => s !== null);
  const allFilled = filledIngredients.length === 4;

  const result = useMemo(() => {
    if (!allFilled) return null;
    return simulate(filledIngredients, station);
  }, [allFilled, filledIngredients, station]);

  // Handlers
  const handleSlotClick = useCallback((index: number) => {
    setActiveSlotIndex(index);
    setPickerOpen(true);
  }, []);

  const handleRemoveSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const handleSelectIngredient = useCallback(
    (ingredient: CookpotIngredient) => {
      if (activeSlotIndex === null) return;
      setSlots((prev) => {
        const next = [...prev];
        next[activeSlotIndex] = ingredient;
        return next;
      });
      setPickerOpen(false);
      setActiveSlotIndex(null);
    },
    [activeSlotIndex],
  );

  const handleClosePicker = useCallback(() => {
    setPickerOpen(false);
    setActiveSlotIndex(null);
  }, []);

  const handleClear = useCallback(() => {
    setSlots([null, null, null, null]);
  }, []);

  const stationImage =
    station === "cookpot" ? "cookpot.png" : "portablecookpot_item.png";

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

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col min-h-full">
          <div className="flex flex-col items-center gap-6 p-4 sm:p-6">
            {/* Slots area: 2×2 grid with cookpot image in center */}
            <SlotsGrid
              slots={slots}
              station={station}
              stationImage={stationImage}
              locale={resolvedLocale}
              onSlotClick={handleSlotClick}
              onRemoveSlot={handleRemoveSlot}
            />

            {/* Clear button */}
            {filledIngredients.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <RotateCcw className="size-3" />
                {t(resolvedLocale, "cookpot_clear")}
              </button>
            )}

            {/* Result area */}
            <ResultArea result={result} allFilled={allFilled} locale={resolvedLocale} />
          </div>
          <Footer />
        </div>
      </div>

      {/* Ingredient picker bottom sheet */}
      <IngredientPicker
        open={pickerOpen}
        locale={resolvedLocale}
        onSelect={handleSelectIngredient}
        onClose={handleClosePicker}
      />
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
// Slots grid (2×2 with cookpot image in center)
// ---------------------------------------------------------------------------

function SlotsGrid({
  slots,
  station,
  stationImage,
  locale,
  onSlotClick,
  onRemoveSlot,
}: {
  slots: Slots;
  station: Station;
  stationImage: string;
  locale: Locale;
  onSlotClick: (index: number) => void;
  onRemoveSlot: (index: number) => void;
}) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] grid-rows-[1fr_auto_1fr] gap-2 sm:gap-3 w-full max-w-[280px]">
      {/* Top-left slot */}
      <IngredientSlot slot={slots[0]} index={0} locale={locale} onClick={onSlotClick} onRemove={onRemoveSlot} />
      {/* Top spacer */}
      <div />
      {/* Top-right slot */}
      <IngredientSlot slot={slots[1]} index={1} locale={locale} onClick={onSlotClick} onRemove={onRemoveSlot} />

      {/* Middle row: spacer - cookpot - spacer */}
      <div />
      <div className="flex items-center justify-center p-2">
        <img
          src={assetPath(`/images/game-items/${stationImage}`)}
          alt={station}
          className="size-16 sm:size-20 object-contain"
          draggable={false}
        />
      </div>
      <div />

      {/* Bottom-left slot */}
      <IngredientSlot slot={slots[2]} index={2} locale={locale} onClick={onSlotClick} onRemove={onRemoveSlot} />
      {/* Bottom spacer */}
      <div />
      {/* Bottom-right slot */}
      <IngredientSlot slot={slots[3]} index={3} locale={locale} onClick={onSlotClick} onRemove={onRemoveSlot} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single ingredient slot
// ---------------------------------------------------------------------------

function IngredientSlot({
  slot,
  index,
  locale,
  onClick,
  onRemove,
}: {
  slot: CookpotIngredient | null;
  index: number;
  locale: Locale;
  onClick: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  if (!slot) {
    return (
      <button
        onClick={() => onClick(index)}
        className="flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-2 border-dashed border-border bg-surface/50 transition-colors hover:border-ring hover:bg-surface active:bg-surface-hover"
      >
        <Plus className="size-5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-medium">
          {t(locale, "cookpot_slot_empty")}
        </span>
      </button>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border border-border bg-surface p-1.5">
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute -top-1.5 -right-1.5 z-10 size-5 flex items-center justify-center rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
      >
        <X className="size-3" />
      </button>
      {/* Click to replace */}
      <button
        onClick={() => onClick(index)}
        className="flex flex-col items-center gap-0.5 w-full"
      >
        <img
          src={assetPath(`/images/game-items/${ingredientImage(slot)}`)}
          alt={ingredientName(slot, locale)}
          className="size-10 sm:size-12 object-contain"
        />
        <span className="text-[10px] sm:text-xs text-foreground/80 font-medium text-center leading-tight line-clamp-2">
          {ingredientName(slot, locale)}
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result area
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
      <div className="text-sm text-muted-foreground text-center py-4">
        {t(locale, "cookpot_no_result")}
      </div>
    );
  }

  if (!result || result.recipes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        {t(locale, "cookpot_no_result")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3">
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
        <ResultCard key={recipe.id} recipe={recipe} locale={locale} isWetGoop={recipe.id === "wetgoop"} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result card
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
        "rounded-xl border p-4 space-y-3",
        isWetGoop
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-surface",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <img
          src={assetPath(`/images/game-items/${recipe.id}.png`)}
          alt={localName}
          className="size-14 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-sm font-semibold">{localName}</h3>
          {showAltName && (
            <p className="text-xs text-muted-foreground">{recipe.name}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {cookSeconds}{t(locale, "cooking_seconds")} ·{" "}
            {recipe.perishDays == null
              ? t(locale, "cooking_no_perish")
              : `${recipe.perishDays}${t(locale, "cooking_days")}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          iconSrc={assetPath("/images/ui/health.png")}
          label={t(locale, "cooking_health")}
          formatted={formatStat(recipe.health)}
          colorClass={statColor(recipe.health)}
        />
        <StatBox
          iconSrc={assetPath("/images/ui/hunger.png")}
          label={t(locale, "cooking_hunger")}
          formatted={formatStat(recipe.hunger)}
          colorClass={statColor(recipe.hunger)}
        />
        <StatBox
          iconSrc={assetPath("/images/ui/sanity.png")}
          label={t(locale, "cooking_sanity")}
          formatted={formatStat(recipe.sanity)}
          colorClass={statColor(recipe.sanity)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatBox
// ---------------------------------------------------------------------------

function StatBox({
  iconSrc,
  label,
  formatted,
  colorClass,
}: {
  iconSrc: string;
  label: string;
  formatted: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2 text-center">
      <img src={iconSrc} alt={label} className="size-5 mx-auto object-contain" />
      <div className={cn("text-sm font-semibold tabular-nums mt-0.5", colorClass)}>
        {formatted}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
