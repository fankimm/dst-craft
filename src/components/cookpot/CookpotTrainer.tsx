"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Flag, Play, RotateCcw, Shuffle, Timer, Utensils, X, Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { foodName, ingredientName, type Locale } from "@/lib/i18n";
import { statColor, formatStat } from "@/lib/stat-utils";
import { ingredientImage, type CookpotIngredient } from "@/data/cookpot-ingredients";
import type { CookingRecipe } from "@/data/recipes";
import { ItemSlot } from "../ui/ItemSlot";
import { TabScrollArea } from "../ui/TabScrollArea";
import { ShareButton } from "../ui/ShareButton";
import { trackItemClick } from "@/lib/analytics";
import { tt } from "./trainer-text";
import {
  DEFAULT_CONFIG,
  INGREDIENT_COUNTS,
  TIME_LIMITS,
  WARLY_MAX_INGREDIENTS,
  createRound,
  cookActual,
  evaluateRound,
  memoryCounts,
  randomSeed,
  recipeStats,
  scaleStats,
  scoreOf,
  totalsOf,
  warlyMultiplier,
  isPlayerEdible,
  type IngredientCount,
  type OptimalPlan,
  type ScoringMode,
  type StatWeights,
  type Stats,
  type TimeLimit,
  type TrainerAction,
  type TrainerConfig,
  type TrainerResult,
  type TrainerRound,
} from "@/lib/cookpot-trainer";

// ---------------------------------------------------------------------------
// Types / storage
// ---------------------------------------------------------------------------

type Phase = "setup" | "playing" | "result";

interface Play {
  round: TrainerRound;
  actions: TrainerAction[];
  pot: number[];
  startedAt: number;
}

const CONFIG_KEY = "dst:cookpot-trainer:config";

function loadConfig(): TrainerConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const p = JSON.parse(raw) as Partial<TrainerConfig>;
    return {
      ingredientCount: (INGREDIENT_COUNTS as readonly number[]).includes(p.ingredientCount ?? -1) ? (p.ingredientCount as IngredientCount) : DEFAULT_CONFIG.ingredientCount,
      timeLimit: (TIME_LIMITS as readonly number[]).includes(p.timeLimit ?? -1) ? (p.timeLimit as TimeLimit) : DEFAULT_CONFIG.timeLimit,
      scoring: p.scoring === "hunger" || p.scoring === "balanced" || p.scoring === "random" ? p.scoring : DEFAULT_CONFIG.scoring,
      warly: Boolean(p.warly),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(c: TrainerConfig) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); } catch { /* private mode 등 */ }
}

/** 아직 솥에도 안 넣고 먹지도 않은 재료 */
function remainingOf(p: Play): TrainerRound["items"] {
  const used = new Set<number>(p.pot);
  for (const a of p.actions) {
    if (a.type === "cook") a.uids.forEach((u) => used.add(u));
    else used.add(a.uid);
  }
  return p.round.items.filter((it) => !used.has(it.uid));
}

/** 공유 링크 `?tab=cookpot&mode=trainer&seed=<base36>&n=12&t=120&s=balanced&w=1` */
interface Challenge {
  seed: number;
  config: TrainerConfig;
}

function readChallengeFromUrl(): Challenge | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  if (q.get("tab") !== "cookpot" || q.get("mode") !== "trainer") return null;
  const seedStr = q.get("seed");
  if (!seedStr) return null;
  const seed = parseInt(seedStr, 36);
  if (!Number.isFinite(seed) || seed < 0) return null;
  const n = Number(q.get("n"));
  const t = Number(q.get("t"));
  const sc = q.get("s");
  return {
    seed: seed >>> 0,
    config: {
      ingredientCount: (INGREDIENT_COUNTS as readonly number[]).includes(n) ? (n as IngredientCount) : DEFAULT_CONFIG.ingredientCount,
      timeLimit: (TIME_LIMITS as readonly number[]).includes(t) ? (t as TimeLimit) : DEFAULT_CONFIG.timeLimit,
      scoring: sc === "hunger" || sc === "balanced" || sc === "random" ? sc : DEFAULT_CONFIG.scoring,
      warly: q.get("w") === "1",
    },
  };
}

function challengeUrl(round: TrainerRound): string {
  const c = round.config;
  const q = new URLSearchParams({
    tab: "cookpot", mode: "trainer",
    seed: round.seed.toString(36), n: String(c.ingredientCount), t: String(c.timeLimit), s: c.scoring,
  });
  if (c.warly) q.set("w", "1");
  return `/?${q.toString()}`;
}

/** 공유 링크로 들어온 뒤 라운드를 시작하면 URL에서 seed를 지워 "새 라운드"가 같은 재료를 반복하지 않게 한다 */
function clearChallengeFromUrl() {
  const q = new URLSearchParams(window.location.search);
  if (!q.has("seed")) return;
  for (const k of ["seed", "n", "t", "s", "w"]) q.delete(k);
  window.history.replaceState(window.history.state, "", `${window.location.pathname}?${q.toString()}`);
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function fmt1(n: number): string {
  return formatStat(Math.round(n * 10) / 10);
}

// ---------------------------------------------------------------------------
// CookpotTrainer
// ---------------------------------------------------------------------------

export function CookpotTrainer({ locale, onViewRecipe }: { locale: Locale; onViewRecipe?: (recipeId: string) => void }) {
  // 이 컴포넌트는 ssr:false 청크 안에만 있어 첫 렌더부터 localStorage를 읽어도 hydration 불일치가 없다
  const [config, setConfig] = useState<TrainerConfig>(() => (typeof window === "undefined" ? DEFAULT_CONFIG : loadConfig()));
  const updateConfig = useCallback((patch: Partial<TrainerConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      if (next.warly && next.ingredientCount > WARLY_MAX_INGREDIENTS) next.ingredientCount = WARLY_MAX_INGREDIENTS;
      saveConfig(next);
      return next;
    });
  }, []);

  const [phase, setPhase] = useState<Phase>("setup");
  const [play, setPlay] = useState<Play | null>(null);
  const [result, setResult] = useState<TrainerResult | null>(null);
  const [endedByTime, setEndedByTime] = useState(false);
  // 공유 링크(`&seed=`)로 들어왔으면 그 설정·재료로 한 번 시작한다
  const [challenge, setChallenge] = useState<Challenge | null>(() => readChallengeFromUrl());

  const startRound = useCallback((seed?: number) => {
    const useChallenge = seed === undefined && challenge !== null;
    const round = useChallenge ? createRound(challenge.config, challenge.seed) : createRound(config, seed ?? randomSeed());
    if (useChallenge) { setChallenge(null); clearChallengeFromUrl(); }
    setPlay({ round, actions: [], pot: [], startedAt: Date.now() });
    setResult(null);
    setEndedByTime(false);
    setPhase("playing");
    trackItemClick(useChallenge ? "trainer:challenge" : "trainer:start");
  }, [config, challenge]);

  const finishWith = useCallback((p: Play, byTime: boolean) => {
    setPlay(p);
    setResult(evaluateRound(p.round, p.actions));
    setEndedByTime(byTime);
    setPhase("result");
    trackItemClick(byTime ? "trainer:timeup" : "trainer:finish");
  }, []);

  // ---- 타이머 ----
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (phase !== "playing" || !play || play.round.config.timeLimit === 0) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - play.startedAt) / 1000;
      setNow(Date.now());
      if (elapsed >= play.round.config.timeLimit) {
        clearInterval(id);
        finishWith(play, true);
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, play, finishWith]);

  // ---- 플레이 조작 ----
  /** 재료를 다 쓰면(솥도 비어 있으면) 바로 결과로 */
  const commit = useCallback((next: Play) => {
    if (next.pot.length === 0 && remainingOf(next).length === 0) finishWith(next, false);
    else setPlay(next);
  }, [finishWith]);

  const addToPot = useCallback((uid: number) => {
    if (!play || play.pot.length >= 4 || play.pot.includes(uid)) return;
    setPlay({ ...play, pot: [...play.pot, uid] });
  }, [play]);
  const removeFromPot = useCallback((uid: number) => {
    if (play) setPlay({ ...play, pot: play.pot.filter((u) => u !== uid) });
  }, [play]);
  const cook = useCallback(() => {
    if (!play || play.pot.length !== 4) return;
    const ings = play.pot.map((u) => play.round.items[u].ingredient);
    const { recipe, wasRandom } = cookActual(ings, play.round.station);
    const before = play.round.config.warly ? (memoryCounts(play.actions).get(recipe.id) ?? 0) : 0;
    const mult = warlyMultiplier(before);
    const action: TrainerAction = { type: "cook", uids: play.pot, recipe, wasRandom, mult, stats: scaleStats(recipeStats(recipe), mult) };
    commit({ ...play, actions: [...play.actions, action], pot: [] });
  }, [play, commit]);
  const eatRaw = useCallback((uid: number) => {
    if (!play) return;
    const raw = play.round.items[uid].raw;
    if (!raw || play.pot.includes(uid)) return;
    commit({ ...play, actions: [...play.actions, { type: "raw", uid, stats: raw }] });
  }, [play, commit]);

  const remaining = useMemo(() => (play ? remainingOf(play) : []), [play]);

  if (phase === "setup" || !play) {
    return (
      <SetupScreen
        locale={locale}
        config={challenge?.config ?? config}
        challenge={challenge}
        onDismissChallenge={() => { setChallenge(null); clearChallengeFromUrl(); }}
        onChange={updateConfig}
        onStart={() => startRound()}
      />
    );
  }

  if (phase === "result" && result) {
    return (
      <ResultScreen
        locale={locale}
        play={play}
        result={result}
        endedByTime={endedByTime}
        onRetrySame={() => startRound(play.round.seed)}
        onNew={() => startRound()}
        onSetup={() => setPhase("setup")}
        onViewRecipe={onViewRecipe}
      />
    );
  }

  const elapsed = (now - play.startedAt) / 1000;
  const timeLeft = play.round.config.timeLimit > 0 ? play.round.config.timeLimit - elapsed : null;

  return (
    <PlayScreen
      locale={locale}
      play={play}
      remaining={remaining}
      timeLeft={timeLeft}
      onAddToPot={addToPot}
      onRemoveFromPot={removeFromPot}
      onCook={cook}
      onEatRaw={eatRaw}
      onFinish={() => finishWith(play, false)}
    />
  );
}

// ---------------------------------------------------------------------------
// 공통 조각
// ---------------------------------------------------------------------------

function Chip({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-30 disabled:pointer-events-none",
        active ? "bg-foreground text-background border-foreground" : "bg-surface border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function StatRow({ stats, className, size = "sm" }: { stats: Stats; className?: string; size?: "sm" | "md" }) {
  const icon = size === "md" ? "size-4" : "size-3.5";
  const text = size === "md" ? "text-sm" : "text-[11px]";
  return (
    <div className={cn("flex items-center gap-2 tabular-nums", text, className)}>
      {([["hunger", stats.hunger], ["health", stats.health], ["sanity", stats.sanity]] as const).map(([k, v]) => (
        <span key={k} className="inline-flex items-center gap-0.5">
          <img src={assetPath(`/images/ui/${k}.webp`)} alt={k} className={cn(icon, "object-contain")} loading="lazy" />
          <span className={cn("font-semibold", statColor(v))}>{fmt1(v)}</span>
        </span>
      ))}
    </div>
  );
}

function WeightsChip({ weights, locale }: { weights: StatWeights; locale: Locale }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2 rounded-full border border-border bg-surface text-[11px] font-medium tabular-nums" title={tt("weights", locale)}>
      {([["hunger", weights.hunger], ["health", weights.health], ["sanity", weights.sanity]] as const)
        .filter(([, w]) => w > 0)
        .map(([k, w]) => (
          <span key={k} className="inline-flex items-center gap-0.5">
            <img src={assetPath(`/images/ui/${k}.webp`)} alt={k} className="size-3.5 object-contain" loading="lazy" />
            ×{w}
          </span>
        ))}
    </span>
  );
}

function IngredientIcon({ ing, locale, className }: { ing: CookpotIngredient; locale: Locale; className?: string }) {
  return (
    <img
      src={assetPath(`/images/game-items/${ingredientImage(ing)}`)}
      alt={ingredientName(ing, locale)}
      title={ingredientName(ing, locale)}
      className={cn("object-contain", className)}
      loading="lazy"
    />
  );
}

function DishCard({
  recipes,
  stats,
  mult,
  wasRandom,
  locale,
  ingredients,
  onViewRecipe,
}: {
  recipes: CookingRecipe[];
  stats: Stats;
  mult: number;
  wasRandom?: boolean;
  locale: Locale;
  ingredients: CookpotIngredient[];
  onViewRecipe?: (id: string) => void;
}) {
  const main = recipes[0];
  const inedible = !recipes.some(isPlayerEdible);
  const canNav = !!onViewRecipe && recipes.length === 1 && main.id !== "wetgoop";
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-2 py-1.5", inedible ? "border-red-500/30 bg-red-500/5" : "border-border bg-surface")}>
      <div className="flex items-center -space-x-1 shrink-0">
        {ingredients.map((ing, i) => (
          <IngredientIcon key={i} ing={ing} locale={locale} className="size-5 rounded-sm" />
        ))}
      </div>
      <span className="text-muted-foreground text-xs shrink-0">→</span>
      <button
        type="button"
        disabled={!canNav}
        onClick={() => canNav && onViewRecipe(main.id)}
        className={cn("flex items-center gap-1.5 min-w-0 text-left", canNav && "hover:underline")}
      >
        <img src={assetPath(`/images/game-items/${main.id}.png`)} alt="" className="size-7 object-contain shrink-0" loading="lazy" />
        <span className="text-xs font-semibold truncate">
          {recipes.length === 1 ? foodName(main, locale) : recipes.map((r) => foodName(r, locale)).join(" / ")}
        </span>
      </button>
      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        {(wasRandom || recipes.length > 1) && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400"><Shuffle className="size-3" />{tt(recipes.length > 1 ? "expected" : "randomPick", locale)}</span>
        )}
        {inedible && <span className="text-[10px] text-red-500">{tt("inedible", locale)}</span>}
        {mult !== 1 && <span className="text-[10px] text-muted-foreground tabular-nums">×{mult}</span>}
        <StatRow stats={stats} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 설정 화면
// ---------------------------------------------------------------------------

function SetupScreen({ locale, config, challenge, onDismissChallenge, onChange, onStart }: {
  locale: Locale;
  config: TrainerConfig;
  challenge: Challenge | null;
  onDismissChallenge: () => void;
  onChange: (p: Partial<TrainerConfig>) => void;
  onStart: () => void;
}) {
  const locked = challenge !== null;
  const scoringDesc: Record<ScoringMode, string> = {
    hunger: tt("scoringHungerDesc", locale),
    balanced: tt("scoringBalancedDesc", locale),
    random: tt("scoringRandomDesc", locale),
  };
  return (
    <TabScrollArea scrollContainer noFooter>
      <div className="max-w-2xl mx-auto px-4 py-4 w-full space-y-5">
        <div>
          <h2 className="text-base font-semibold">{tt("title", locale)}</h2>
          <p className="text-xs text-muted-foreground mt-1">{tt("intro", locale)}</p>
        </div>

        {challenge && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{tt("challengeTitle", locale)}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{tt("seed", locale)} {challenge.seed.toString(36)}</span>
              <button type="button" onClick={onDismissChallenge} className="ml-auto text-[11px] text-muted-foreground underline">{tt("challengeDismiss", locale)}</button>
            </div>
            <p className="text-[11px] text-muted-foreground">{tt("challengeDesc", locale)}</p>
          </div>
        )}

        <Section label={tt("optIngredients", locale)}>
          {INGREDIENT_COUNTS.map((n) => (
            <Chip key={n} active={config.ingredientCount === n} onClick={() => onChange({ ingredientCount: n })} disabled={locked || (config.warly && n > WARLY_MAX_INGREDIENTS)}>
              {n}
            </Chip>
          ))}
          {config.warly && <span className="text-[11px] text-muted-foreground self-center">{tt("warlyMaxNote", locale)}</span>}
        </Section>

        <Section label={tt("optTime", locale)}>
          {TIME_LIMITS.map((s) => (
            <Chip key={s} active={config.timeLimit === s} onClick={() => onChange({ timeLimit: s })} disabled={locked}>
              {s === 0 ? tt("timeNone", locale) : `${s}${tt("seconds", locale)}`}
            </Chip>
          ))}
        </Section>

        <Section label={tt("optScoring", locale)} hint={scoringDesc[config.scoring]}>
          {(["hunger", "balanced", "random"] as const).map((m) => (
            <Chip key={m} active={config.scoring === m} onClick={() => onChange({ scoring: m })} disabled={locked}>
              {m === "hunger" && <img src={assetPath("/images/ui/hunger.webp")} alt="" className="size-3.5" loading="lazy" />}
              {tt(m === "hunger" ? "scoringHunger" : m === "balanced" ? "scoringBalanced" : "scoringRandom", locale)}
            </Chip>
          ))}
        </Section>

        <Section label={tt("optWarly", locale)} hint={tt("warlyDesc", locale)}>
          <Chip active={config.warly} onClick={() => onChange({ warly: !config.warly })} disabled={locked}>
            <img src={assetPath("/images/game-items/portablecookpot_item.png")} alt="" className="size-4 object-contain" loading="lazy" />
            {tt("optWarly", locale)}
            {config.warly && <Check className="size-3" />}
          </Chip>
        </Section>

        <button
          type="button"
          onClick={onStart}
          className="w-full h-11 rounded-xl bg-foreground text-background font-semibold text-sm inline-flex items-center justify-center gap-2 active:opacity-80"
        >
          <Play className="size-4" />
          {tt("start", locale)}
        </button>
      </div>
    </TabScrollArea>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-foreground/80">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 플레이 화면
// ---------------------------------------------------------------------------

function PlayScreen({
  locale, play, remaining, timeLeft, onAddToPot, onRemoveFromPot, onCook, onEatRaw, onFinish,
}: {
  locale: Locale;
  play: Play;
  remaining: TrainerRound["items"];
  timeLeft: number | null;
  onAddToPot: (uid: number) => void;
  onRemoveFromPot: (uid: number) => void;
  onCook: () => void;
  onEatRaw: (uid: number) => void;
  onFinish: () => void;
}) {
  const { round, actions, pot } = play;
  const totals = totalsOf(actions);
  const score = scoreOf(totals, round.weights);
  const warly = round.config.warly;
  const memory = warly ? memoryCounts(actions) : null;
  const urgent = timeLeft !== null && timeLeft <= 10;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 상단 고정: 타이머·점수·가중치·끝내기 */}
      <div className="shrink-0 px-3 pt-2 pb-2 max-w-4xl mx-auto w-full flex items-center gap-2 flex-wrap">
        <span className={cn("inline-flex items-center gap-1 h-7 px-2 rounded-full border text-xs font-semibold tabular-nums", urgent ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400" : "border-border bg-surface")}>
          <Timer className="size-3.5" />
          {timeLeft === null ? "∞" : formatTime(timeLeft)}
        </span>
        <span className="inline-flex items-center gap-1.5 h-7 px-2 rounded-full border border-border bg-surface text-xs">
          <span className="text-muted-foreground">{tt("score", locale)}</span>
          <span className="font-semibold tabular-nums">{Math.round(score)}</span>
        </span>
        <WeightsChip weights={round.weights} locale={locale} />
        <StatRow stats={totals} className="ml-auto" />
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-foreground text-background text-xs font-medium"
        >
          <Flag className="size-3.5" />
          {tt("finish", locale)}
        </button>
      </div>

      <TabScrollArea scrollContainer noFooter>
        <div className="max-w-4xl mx-auto px-3 pb-4 w-full space-y-3">
          {/* 요리솥 */}
          <div className="rounded-xl border border-border bg-surface/50 p-3">
            <div className="flex items-center gap-2">
              <img src={assetPath(`/images/game-items/${warly ? "portablecookpot_item" : "cookpot"}.png`)} alt="" className="size-6 object-contain" loading="lazy" />
              <span className="text-xs font-semibold">{tt("pot", locale)}</span>
              <span className="text-[11px] text-muted-foreground">{pot.length}/4</span>
              <button
                type="button"
                onClick={onCook}
                disabled={pot.length !== 4}
                className="ml-auto inline-flex items-center gap-1 h-8 px-3 rounded-full bg-foreground text-background text-xs font-semibold disabled:opacity-30"
              >
                <Utensils className="size-3.5" />
                {tt("cook", locale)}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[0, 1, 2, 3].map((i) => {
                const uid = pot[i];
                const item = uid !== undefined ? round.items[uid] : null;
                return item ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onRemoveFromPot(item.uid)}
                    className="relative flex flex-col items-center gap-0.5 rounded-lg border border-border bg-surface p-1.5 active:bg-surface-hover"
                  >
                    <IngredientIcon ing={item.ingredient} locale={locale} className="size-9" />
                    <span className="text-[10px] leading-tight truncate w-full text-center">{ingredientName(item.ingredient, locale)}</span>
                    <X className="absolute top-0.5 right-0.5 size-3 text-muted-foreground" />
                  </button>
                ) : (
                  <div key={i} className="flex items-center justify-center h-[62px] rounded-lg border-2 border-dashed border-border bg-surface/40 text-[11px] text-muted-foreground">
                    {i + 1}
                  </div>
                );
              })}
            </div>
            {pot.length === 0 && <p className="text-[11px] text-muted-foreground mt-2">{tt("potHint", locale)}</p>}
          </div>

          {/* 남은 재료 */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold">{tt("tray", locale)}</span>
              <span className="text-[11px] text-muted-foreground">{remaining.length}</span>
            </div>
            {remaining.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">{tt("trayEmpty", locale)}</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {remaining.map((item) => (
                  <div key={item.uid} className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onAddToPot(item.uid)}
                      disabled={pot.length >= 4}
                      className="flex flex-col items-center gap-0.5 p-1.5 active:bg-surface-hover disabled:opacity-40"
                    >
                      <IngredientIcon ing={item.ingredient} locale={locale} className="size-9 sm:size-10" />
                      <span className="text-[10px] sm:text-[11px] leading-tight text-center line-clamp-2 min-h-[2lh]">{ingredientName(item.ingredient, locale)}</span>
                    </button>
                    {!warly && (
                      <button
                        type="button"
                        onClick={() => onEatRaw(item.uid)}
                        disabled={!item.raw}
                        className="h-6 border-t border-border text-[10px] text-muted-foreground hover:text-foreground hover:bg-surface-hover disabled:opacity-30 disabled:hover:bg-transparent"
                        title={item.raw ? tt("eatRaw", locale) : tt("cantEatRaw", locale)}
                      >
                        {tt("eatRaw", locale)}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 월리 기억 */}
          {memory && memory.size > 0 && (
            <div className="rounded-xl border border-border bg-surface/50 p-3">
              <div className="text-xs font-semibold mb-1.5">{tt("memory", locale)}</div>
              <div className="flex flex-wrap gap-1.5">
                {[...memory.entries()].map(([id, n]) => (
                  <span key={id} className="inline-flex items-center gap-1 h-7 pl-1 pr-2 rounded-full border border-border bg-surface text-[11px]">
                    <img src={assetPath(`/images/game-items/${id}.png`)} alt="" className="size-5 object-contain" loading="lazy" />
                    ×{n}
                    <span className="text-muted-foreground">· {tt("memoryNext", locale)} ×{warlyMultiplier(n)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 먹은 것 */}
          <div>
            <div className="text-xs font-semibold mb-1.5">{tt("log", locale)}</div>
            {actions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">{tt("logEmpty", locale)}</p>
            ) : (
              <div className="space-y-1.5">
                {[...actions].reverse().map((a, i) => <ActionRow key={actions.length - i} action={a} round={round} locale={locale} />)}
              </div>
            )}
          </div>
        </div>
      </TabScrollArea>
    </div>
  );
}

function ActionRow({ action, round, locale, onViewRecipe }: { action: TrainerAction; round: TrainerRound; locale: Locale; onViewRecipe?: (id: string) => void }) {
  if (action.type === "cook") {
    return (
      <DishCard
        recipes={[action.recipe]}
        stats={action.stats}
        mult={action.mult}
        wasRandom={action.wasRandom}
        locale={locale}
        ingredients={action.uids.map((u) => round.items[u].ingredient)}
        onViewRecipe={onViewRecipe}
      />
    );
  }
  const ing = round.items[action.uid].ingredient;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
      <IngredientIcon ing={ing} locale={locale} className="size-7 shrink-0" />
      <span className="text-xs font-semibold truncate">{ingredientName(ing, locale)}</span>
      <span className="text-[10px] text-muted-foreground">{tt("rawEaten", locale)}</span>
      <StatRow stats={action.stats} className="ml-auto" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 결과 화면
// ---------------------------------------------------------------------------

function ResultScreen({
  locale, play, result, endedByTime, onRetrySame, onNew, onSetup, onViewRecipe,
}: {
  locale: Locale;
  play: Play;
  result: TrainerResult;
  endedByTime: boolean;
  onRetrySame: () => void;
  onNew: () => void;
  onSetup: () => void;
  onViewRecipe?: (id: string) => void;
}) {
  const { round, actions } = play;
  const pct = Math.round(result.percent);
  const verdict = pct >= 100 ? "perfect" : pct >= 85 ? "great" : pct >= 60 ? "good" : "tryAgain";
  const verdictColor = pct >= 100 ? "text-green-600 dark:text-green-400" : pct >= 85 ? "text-emerald-600 dark:text-emerald-400" : pct >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-500";

  return (
    <TabScrollArea scrollContainer noFooter>
      <div className="max-w-3xl mx-auto px-3 py-4 w-full space-y-4">
        {/* 점수 */}
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          {endedByTime && <div className="text-[11px] text-red-500 font-medium mb-1">{tt("timeUp", locale)}</div>}
          <div className={cn("text-4xl font-bold tabular-nums", verdictColor)}>{pct}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">{tt("ofOptimal", locale)} · <span className={verdictColor}>{tt(verdict, locale)}</span></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-left">
            <ScoreBox label={tt("yours", locale)} score={result.playerScore} stats={result.playerTotals} />
            <ScoreBox label={tt("optimal", locale)} score={result.optimal.score} stats={result.optimal.totals} />
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            <WeightsChip weights={round.weights} locale={locale} />
            <span className="text-[10px] text-muted-foreground tabular-nums">{tt("seed", locale)} {round.seed.toString(36)}</span>
            <ShareButton
              url={challengeUrl(round)}
              toastMessage={tt("shareCopied", locale)}
              label={tt("share", locale)}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full border border-border bg-background text-[11px] font-medium"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={onRetrySame} className="h-10 rounded-xl border border-border bg-surface text-xs font-medium inline-flex items-center justify-center gap-1"><RotateCcw className="size-3.5" />{tt("retrySame", locale)}</button>
          <button type="button" onClick={onNew} className="h-10 rounded-xl bg-foreground text-background text-xs font-semibold inline-flex items-center justify-center gap-1"><Play className="size-3.5" />{tt("newRound", locale)}</button>
          <button type="button" onClick={onSetup} className="h-10 rounded-xl border border-border bg-surface text-xs font-medium inline-flex items-center justify-center gap-1"><Settings2 className="size-3.5" />{tt("backToSetup", locale)}</button>
        </div>

        {/* 최적 플랜 */}
        <PlanSection title={tt("optimalPlan", locale)} plan={result.optimal} round={round} locale={locale} onViewRecipe={onViewRecipe} />

        {/* 내 플랜 */}
        <div>
          <div className="text-xs font-semibold mb-1.5">{tt("yourPlan", locale)}</div>
          {actions.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">{tt("logEmpty", locale)}</p>
          ) : (
            <div className="space-y-1.5">
              {actions.map((a, i) => <ActionRow key={i} action={a} round={round} locale={locale} onViewRecipe={onViewRecipe} />)}
            </div>
          )}
        </div>
      </div>
    </TabScrollArea>
  );
}

function ScoreBox({ label, score, stats }: { label: string; score: number; stats: Stats }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-lg font-bold tabular-nums leading-tight">{Math.round(score)}</div>
      <StatRow stats={stats} className="mt-1" />
    </div>
  );
}

function PlanSection({ title, plan, round, locale, onViewRecipe }: { title: string; plan: OptimalPlan; round: TrainerRound; locale: Locale; onViewRecipe?: (id: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">{title}</div>
      {plan.pots.length === 0 && plan.rawUids.length === 0 && (
        <p className="text-[11px] text-muted-foreground">—</p>
      )}
      <div className="space-y-1.5">
        {plan.pots.map((p, i) => (
          <DishCard key={i} recipes={p.recipes} stats={p.stats} mult={p.mult} locale={locale} ingredients={p.uids.map((u) => round.items[u].ingredient)} onViewRecipe={onViewRecipe} />
        ))}
      </div>
      {plan.rawUids.length > 0 && (
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">{tt("rawEaten", locale)}</div>
          <div className="flex flex-wrap gap-2">
            {plan.rawUids.map((u) => {
              const it = round.items[u];
              return <ItemSlot key={u} icon={ingredientImage(it.ingredient)} label={ingredientName(it.ingredient, locale)} badge={it.raw ? fmt1(scoreOf(it.raw, round.weights)) : undefined} />;
            })}
          </div>
        </div>
      )}
      {plan.discardUids.length > 0 && (
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">{tt("discarded", locale)}</div>
          <div className="flex flex-wrap gap-2 opacity-60">
            {plan.discardUids.map((u) => {
              const it = round.items[u];
              return <ItemSlot key={u} icon={ingredientImage(it.ingredient)} label={ingredientName(it.ingredient, locale)} variant="excluded" />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
