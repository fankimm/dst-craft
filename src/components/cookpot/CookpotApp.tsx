"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight, X, RotateCcw, Shuffle, ExternalLink, Star } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { t, foodName, ingredientName, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { statColor, formatStat } from "@/lib/stat-utils";
import { assetPath } from "@/lib/asset-path";
import { ingredientImage, getIngredientById, type CookpotIngredient } from "@/data/cookpot-ingredients";
import { useFavorites } from "@/hooks/use-favorites";
import { simulate, reachableRecipes } from "@/lib/cookpot-engine";
import type { CookingRecipe } from "@/data/recipes";
import { IngredientPicker } from "./IngredientPicker";
import { CookpotTrainer } from "./CookpotTrainer";
import { tt } from "./trainer-text";
import { useUrlStateSync } from "@/hooks/use-url-state";
import { useTabSync } from "@/hooks/use-tab-sync";
import { Footer } from "../crafting/Footer";
import { ItemSlot } from "../ui/ItemSlot";
import { useDelayedReady } from "@/hooks/use-delayed-ready";
import { trackItemClick, trackCombo } from "@/lib/analytics";
import { usePopularity } from "@/hooks/use-popularity";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Station = "cookpot" | "portablecookpot";
type Slots = (CookpotIngredient | null)[];
/** `?tab=cookpot&mode=trainer` → 트레이너 (#128). 없으면 시뮬레이터 */
type CookpotMode = "sim" | "trainer";

function readModeFromUrl(): CookpotMode {
  if (typeof window === "undefined") return "sim";
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") === "cookpot" && params.get("mode") === "trainer" ? "trainer" : "sim";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


const COOK_TIME_BASE = 40;

// 내 조합 (#167) — 즐겨찾기 저장소를 그대로 쓴다(로그인하면 계정에 동기화). 키: `combo:<station>:<id,id,id,id>`
// 재료 순서는 결과에 영향이 없어 정렬해 둔다 → 같은 조합을 순서만 바꿔 두 번 저장하지 않는다
const COMBO_FAV_PREFIX = "combo:";
const MAX_SAVED_COMBOS = 20;

interface SavedCombo {
  key: string;
  station: Station;
  ingredients: CookpotIngredient[];
}

function comboKey(station: Station, ingredients: CookpotIngredient[]): string {
  return `${COMBO_FAV_PREFIX}${station}:${ingredients.map((i) => i.id).sort().join(",")}`;
}

function parseComboKey(key: string): SavedCombo | null {
  if (!key.startsWith(COMBO_FAV_PREFIX)) return null;
  const rest = key.slice(COMBO_FAV_PREFIX.length);
  const sep = rest.indexOf(":");
  if (sep < 0) return null;
  const station = rest.slice(0, sep);
  if (station !== "cookpot" && station !== "portablecookpot") return null;
  const ingredients = rest.slice(sep + 1).split(",").map((id) => getIngredientById(id));
  if (ingredients.length !== 4 || ingredients.some((i) => !i)) return null; // 게임 패치로 사라진 재료 등
  return { key, station, ingredients: ingredients as CookpotIngredient[] };
}

// ---------------------------------------------------------------------------
// CookpotApp
// ---------------------------------------------------------------------------

export function CookpotApp({ onViewRecipe }: { onViewRecipe?: (recipeId: string) => void }) {
  const { resolvedLocale } = useSettings();

  // State
  const [slots, setSlots] = useState<Slots>([null, null, null, null]);
  const [station, setStation] = useState<Station>("cookpot");

  // 모드 — URL이 진실. 첫 렌더는 서버와 같은 "sim", layout effect에서 URL 반영
  const [mode, setMode] = useState<CookpotMode>("sim");
  useUrlStateSync(readModeFromUrl, setMode);
  useTabSync(() => setMode(readModeFromUrl()));
  // 트레이너는 한 번 열면 언마운트하지 않는다 — 다른 탭에 갔다 오거나 결과의 레시피를 보고 돌아와도
  // 진행 중인 라운드가 살아 있어야 한다 (탭 마운트 정책과 같은 이유, #91). 렌더 중 갱신은 AppShell의 openedTabs와 같은 패턴
  const [trainerOpened, setTrainerOpened] = useState(false);
  if (mode === "trainer" && !trainerOpened) setTrainerOpened(true);
  const switchMode = useCallback((next: CookpotMode) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "cookpot");
    if (next === "trainer") params.set("mode", "trainer");
    else {
      params.delete("mode");
      for (const k of ["seed", "n", "t", "s", "w"]) params.delete(k); // 트레이너 공유 링크 잔여물
    }
    window.history.pushState(window.history.state, "", `${window.location.pathname}?${params.toString()}`);
    setMode(next);
  }, []);

  // Simulation result
  const filledIngredients = slots.filter((s): s is CookpotIngredient => s !== null);
  const allFilled = filledIngredients.length === 4;

  const result = useMemo(() => {
    if (!allFilled) return null;
    return simulate(filledIngredients, station);
  }, [allFilled, filledIngredients, station]);

  // 1~3개만 넣었을 때 "아직 될 수 있는 요리" (#137). slots가 state라 재료가 바뀔 때만 다시 계산
  const candidates = useMemo(() => {
    const filled = slots.filter((s): s is CookpotIngredient => s !== null);
    return filled.length > 0 && filled.length < 4 ? reachableRecipes(filled, station) : [];
  }, [slots, station]);
  const candidatesKey = `${station}:${filledIngredients.map((i) => i.id).join(",")}`;

  // Track simulation results
  const prevResultId = useRef<string | null>(null);
  useEffect(() => {
    if (!result) { prevResultId.current = null; return; }
    const topId = result.recipes[0]?.id;
    if (topId && topId !== "wetgoop" && topId !== prevResultId.current) {
      trackItemClick(`sim:${topId}`);
      trackCombo(topId, filledIngredients.map(i => i.id));
      prevResultId.current = topId;
    }
  }, [result]);

  const { getClicks } = usePopularity();

  // 내 조합 (#167)
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const savedCombos = useMemo(() => {
    const list: SavedCombo[] = [];
    favorites.forEach((fav) => {
      const combo = parseComboKey(fav);
      if (combo) list.push(combo);
    });
    return list.reverse(); // 최근에 저장한 것이 앞
  }, [favorites]);
  const currentComboKey = allFilled ? comboKey(station, filledIngredients) : null;
  const currentSaved = currentComboKey !== null && isFavorite(currentComboKey);
  const canSave = currentComboKey !== null && (currentSaved || savedCombos.length < MAX_SAVED_COMBOS);
  const handleToggleSave = useCallback(() => {
    if (currentComboKey) toggleFavorite(currentComboKey);
  }, [currentComboKey, toggleFavorite]);
  const handleLoadCombo = useCallback((combo: SavedCombo) => {
    setSlots([...combo.ingredients]);
    setStation(combo.station);
  }, []);

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
        <div className="flex items-center gap-2">
          <CookpotBreadcrumb locale={resolvedLocale} />
          {/* 시뮬레이터 | 트레이너 (#128) */}
          <div className="ml-auto inline-flex rounded-full border border-border bg-surface p-0.5">
            {(["sim", "trainer"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "h-6 px-2.5 rounded-full text-[11px] font-medium transition-colors",
                  mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tt(m === "sim" ? "modeSim" : "modeTrainer", resolvedLocale)}
              </button>
            ))}
          </div>
        </div>
        {/* Station toggle */}
        {mode === "sim" && (
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
        )}
      </div>
      {trainerOpened && (
        <div className={mode === "trainer" ? "flex-1 min-h-0 flex flex-col" : "hidden"}>
          <CookpotTrainer locale={resolvedLocale} onViewRecipe={onViewRecipe} />
        </div>
      )}
      {mode === "sim" && (
      <>
      {/* Result + Slots area — fixed, not scrollable */}
      <div className="shrink-0 px-3 pt-4 pb-2 max-w-4xl mx-auto w-full">
        <div className="flex gap-2">
          {/* Left: result card or empty placeholder — 50% */}
          <div className="w-1/2 min-w-0 relative">
            <ResultPanel
              result={result}
              allFilled={allFilled}
              candidates={candidates}
              candidatesKey={candidatesKey}
              filledCount={filledIngredients.length}
              locale={resolvedLocale}
              onViewRecipe={onViewRecipe}
              getSimClicks={(id) => getClicks(`sim:${id}`)}
            />
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
            <div className="flex items-center gap-1 mt-0.5">
            {/* Clear button — always visible, disabled when empty */}
            <button
              onClick={handleClear}
              disabled={filledIngredients.length === 0}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface border border-border transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title={t(resolvedLocale, "cookpot_clear")}
            >
              <RotateCcw className="size-3" />
              {t(resolvedLocale, "cookpot_clear")}
            </button>
            {/* 내 조합 저장 (#167) — 4칸이 다 찼을 때만 */}
            <button
              onClick={handleToggleSave}
              disabled={!canSave}
              aria-pressed={currentSaved}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-colors disabled:opacity-30 disabled:pointer-events-none",
                currentSaved
                  ? "border-amber-400/60 text-amber-500 bg-amber-400/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-surface",
              )}
              title={t(resolvedLocale, currentSaved ? "cookpot_combo_saved" : "cookpot_combo_save")}
            >
              <Star className={cn("size-3", currentSaved && "fill-current")} />
              {t(resolvedLocale, currentSaved ? "cookpot_combo_saved" : "cookpot_combo_save")}
            </button>
            </div>
          </div>
        </div>
        {savedCombos.length > 0 && (
          <SavedComboStrip
            combos={savedCombos}
            activeKey={currentSaved ? currentComboKey : null}
            locale={resolvedLocale}
            onLoad={handleLoadCombo}
            onRemove={toggleFavorite}
          />
        )}
      </div>

      {/* Ingredient picker — fills remaining space, scrolls internally */}
      <div className="flex-1 min-h-0">
        <IngredientPicker
          locale={resolvedLocale}
          onSelect={handleAddIngredient}
          disabled={allFilled}
        />
      </div>
      </>
      )}

      {/* Footer pinned to bottom — stays visible at all times */}
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function CookpotBreadcrumb({ locale }: { locale: Locale }) {
  const iconSrc = assetPath("/images/game-items/cookpot.png");

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
// 내 조합 목록 (#167) — 가로 스크롤 띠. 누르면 슬롯에 불러오고, ×로 삭제
// ---------------------------------------------------------------------------

function SavedComboStrip({
  combos,
  activeKey,
  locale,
  onLoad,
  onRemove,
}: {
  combos: SavedCombo[];
  activeKey: string | null;
  locale: Locale;
  onLoad: (combo: SavedCombo) => void;
  onRemove: (key: string) => void;
}) {
  return (
    <div className="mt-2.5">
      <div className="text-[10px] font-semibold text-muted-foreground mb-1 px-0.5">
        {t(locale, "cookpot_combo_mine")}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        {combos.map((combo) => {
          const names = combo.ingredients.map((i) => ingredientName(i, locale)).join(", ");
          return (
            <div
              key={combo.key}
              className={cn(
                "relative shrink-0 flex items-center rounded-lg border bg-surface",
                combo.key === activeKey ? "border-amber-400/70" : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => onLoad(combo)}
                className="flex items-center gap-0.5 pl-1.5 pr-5 py-1 hover:bg-muted/50 rounded-lg"
                title={names}
                aria-label={`${t(locale, "cookpot_combo_load")}: ${names}`}
              >
                {combo.station === "portablecookpot" && (
                  <img
                    src={assetPath("/images/game-items/portablecookpot_item.png")}
                    alt=""
                    className="size-4 object-contain mr-0.5 opacity-70"
                    loading="lazy"
                  />
                )}
                {combo.ingredients.map((ing, i) => (
                  <img
                    key={i}
                    src={assetPath(`/images/game-items/${ingredientImage(ing)}`)}
                    alt=""
                    className="size-6 object-contain"
                    loading="lazy"
                  />
                ))}
              </button>
              <button
                type="button"
                onClick={() => onRemove(combo.key)}
                className="absolute top-0.5 right-0.5 size-4 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label={t(locale, "cookpot_combo_remove")}
                title={t(locale, "cookpot_combo_remove")}
              >
                <X className="size-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
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
        loading="lazy"
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
        loading="lazy"
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
  candidates,
  candidatesKey,
  filledCount,
  locale,
  onViewRecipe,
  getSimClicks,
}: {
  result: ReturnType<typeof simulate> | null;
  allFilled: boolean;
  /** 1~3개 넣은 상태에서 아직 될 수 있는 요리 (#137) */
  candidates: CookingRecipe[];
  /** 재료 구성이 바뀌면 후보 패널을 다시 마운트해 고스트 클릭 가드를 재시작 */
  candidatesKey: string;
  filledCount: number;
  locale: Locale;
  onViewRecipe?: (recipeId: string) => void;
  getSimClicks: (id: string) => number;
}) {
  // Partially filled — show what the pot can still become
  if (!allFilled && filledCount > 0) {
    return <CandidatePanel key={candidatesKey} candidates={candidates} locale={locale} onViewRecipe={onViewRecipe} />;
  }

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
          onViewRecipe={onViewRecipe}
          simCount={getSimClicks(recipe.id)}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Candidate panel — dishes the pot can still become (#137)
// ---------------------------------------------------------------------------
// 슬롯 칸 높이에 맞춰 absolute로 채우고 안에서 스크롤한다 — 후보가 60개를 넘어도 재료 피커 영역을 밀어내지 않게

function CandidatePanel({
  candidates,
  locale,
  onViewRecipe,
}: {
  candidates: CookingRecipe[];
  locale: Locale;
  onViewRecipe?: (recipeId: string) => void;
}) {
  const ready = useDelayedReady();
  const canNavigate = !!onViewRecipe && ready;

  return (
    <div className="absolute inset-0 flex flex-col rounded-xl border border-border bg-surface/50 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-1 px-2 py-1 border-b border-border text-[10px] text-muted-foreground">
        <span className="truncate">{t(locale, "cookpot_candidates")}</span>
        <span className="font-semibold tabular-nums text-foreground/80">{candidates.length}</span>
      </div>
      {candidates.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-2 text-[10px] text-muted-foreground text-center">
          {t(locale, "cookpot_candidates_none")}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-1.5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-y-1.5 gap-x-0.5 justify-items-center">
            {candidates.map((recipe) => (
              <ItemSlot
                key={recipe.id}
                icon={`${recipe.id}.png`}
                label={foodName(recipe, locale)}
                onClick={canNavigate ? () => onViewRecipe(recipe.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}
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
  onViewRecipe,
  simCount,
}: {
  recipe: CookingRecipe;
  locale: Locale;
  isWetGoop: boolean;
  onViewRecipe?: (recipeId: string) => void;
  simCount: number;
}) {
  // Prevent ghost-click on mobile: the picker tap that filled the 4th slot must not land on this card
  const ready = useDelayedReady();

  const localName = foodName(recipe, locale);
  const showAltName = locale !== "en" && localName !== recipe.name;
  const cookSeconds = recipe.cookTime * COOK_TIME_BASE;
  const canNavigate = !isWetGoop && !!onViewRecipe && ready;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 space-y-2 transition-colors",
        isWetGoop
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-surface",
        canNavigate && "cursor-pointer active:bg-surface-hover hover:border-ring",
      )}
      {...(canNavigate && {
        role: "button",
        tabIndex: 0,
        onClick: () => onViewRecipe(recipe.id),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewRecipe(recipe.id);
          }
        },
      })}
    >
      {/* Header row: image + name + meta */}
      <div className="flex items-center gap-3">
        <img
          src={assetPath(`/images/game-items/${recipe.id}.png`)}
          alt={localName}
          className="size-10 object-contain shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-semibold leading-tight">{localName}</h3>
            {canNavigate && (
              <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
          {showAltName && (
            <p className="text-[10px] text-muted-foreground">{recipe.name}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5">
              <img src={assetPath("/images/ui/cooktime.webp")} alt="" className="size-3.5 object-contain" loading="lazy" />
              {cookSeconds}{t(locale, "cooking_seconds")}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <img src={assetPath("/images/ui/perish.webp")} alt="" className="size-3.5 object-contain" loading="lazy" />
              {recipe.perishDays == null
                ? t(locale, "cooking_no_perish")
                : `${recipe.perishDays}${t(locale, "cooking_days")}`}
            </span>
            {simCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-muted-foreground/50">
                {simCount.toLocaleString()} cooked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats (vertical) */}
      <div className="flex flex-col gap-1">
        <InlineStat
          iconSrc={assetPath("/images/ui/health.webp")}
          formatted={formatStat(recipe.health)}
          colorClass={statColor(recipe.health)}
        />
        <InlineStat
          iconSrc={assetPath("/images/ui/hunger.webp")}
          formatted={formatStat(recipe.hunger)}
          colorClass={statColor(recipe.hunger)}
        />
        <InlineStat
          iconSrc={assetPath("/images/ui/sanity.webp")}
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
      <img src={iconSrc} alt="" className="size-4 object-contain" loading="lazy" />
      <span className={cn("text-xs font-semibold tabular-nums", colorClass)}>
        {formatted}
      </span>
    </div>
  );
}
