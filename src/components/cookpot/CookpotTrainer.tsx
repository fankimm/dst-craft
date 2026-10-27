"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Flag, Flame, Play, RotateCcw, Shuffle, Timer, Utensils, X, Settings2, Check } from "lucide-react";

/** 요리하기 → 결과가 나오기까지 솥이 흔들리는 시간 */
const COOK_MS = 900;
/** 결과 요리·스탯 연출이 조리대에 머무는 시간 */
const REVEAL_MS = 2200;
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
  TWIG,
  TWIG_UID,
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
  type ItemForm,
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
  /** 재료 uid, 잔가지는 `TWIG_UID` (여러 개 가능) */
  pot: number[];
  /** 모닥불에 구운 재료 uid — 되돌릴 수 없다 */
  roasted: number[];
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

/** 설정별 최고 기록(최적 대비 %) — `dst:cookpot-trainer:best` = { "<n>-<t>-<s>-<w>": 87 } */
const BEST_KEY = "dst:cookpot-trainer:best";
function configKey(c: TrainerConfig): string {
  return `${c.ingredientCount}-${c.timeLimit}-${c.scoring}-${c.warly ? 1 : 0}`;
}
function loadBest(): Record<string, number> {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const obj = raw ? (JSON.parse(raw) as unknown) : null;
    return obj && typeof obj === "object" ? (obj as Record<string, number>) : {};
  } catch {
    return {};
  }
}
function saveBest(best: Record<string, number>) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode 등 */ }
}

function saveConfig(c: TrainerConfig) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); } catch { /* private mode 등 */ }
}

/** 그 재료의 지금 형태 — 구웠으면 구운 것 */
function formOf(p: Play, uid: number): ItemForm {
  const it = p.round.items[uid];
  return it.roasted && p.roasted.includes(uid) ? it.roasted : it;
}

/** 솥 칸의 재료 (잔가지 포함) */
function potIngredient(p: Play, uid: number) {
  return uid === TWIG_UID ? TWIG : formOf(p, uid).ingredient;
}

/** 아직 솥에도 안 넣고 먹지도 않은 재료 */
function remainingOf(p: Play): TrainerRound["items"] {
  const used = new Set<number>(p.pot.filter((u) => u !== TWIG_UID));
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
  const [best, setBest] = useState<Record<string, number>>(() => (typeof window === "undefined" ? {} : loadBest()));
  const [isNewRecord, setIsNewRecord] = useState(false);
  // 공유 링크(`&seed=`)로 들어왔으면 그 설정·재료로 한 번 시작한다
  const [challenge, setChallenge] = useState<Challenge | null>(() => readChallengeFromUrl());
  // 조리 연출: cooking = 솥 흔들리는 중, reveal = 방금 먹은 것(요리/생식)을 조리대에 크게 보여주는 중
  const [cooking, setCooking] = useState(false);
  const [reveal, setReveal] = useState<{ action: TrainerAction; id: number } | null>(null);

  // setTimeout 콜백이 최신 상태를 보도록 — 렌더 중이 아니라 effect에서 갱신한다
  const playRef = useRef<Play | null>(null);
  const phaseRef = useRef<Phase>("setup");
  useEffect(() => { playRef.current = play; phaseRef.current = phase; }, [play, phase]);

  const startRound = useCallback((seed?: number) => {
    const useChallenge = seed === undefined && challenge !== null;
    const round = useChallenge ? createRound(challenge.config, challenge.seed) : createRound(config, seed ?? randomSeed());
    if (useChallenge) { setChallenge(null); clearChallengeFromUrl(); }
    setPlay({ round, actions: [], pot: [], roasted: [], startedAt: Date.now() });
    setResult(null);
    setEndedByTime(false);
    setCooking(false);
    setReveal(null);
    setPhase("playing");
    trackItemClick(useChallenge ? "trainer:challenge" : "trainer:start");
  }, [config, challenge]);

  const finishWith = useCallback((p: Play, byTime: boolean) => {
    const r = evaluateRound(p.round, p.actions);
    setPlay(p);
    setResult(r);
    setEndedByTime(byTime);
    setCooking(false);
    setReveal(null);
    setPhase("result");
    // 최고 기록 (공유받은 라운드도 같은 설정 키로 센다)
    const key = configKey(p.round.config);
    const pct = Math.round(r.percent);
    const prev = loadBest(); // localStorage가 진실 — 다른 탭에서 갱신됐을 수도 있다
    const isNew = p.actions.length > 0 && pct > (prev[key] ?? -1);
    setIsNewRecord(isNew);
    if (isNew) {
      const next = { ...prev, [key]: pct };
      saveBest(next);
      setBest(next);
    }
    trackItemClick(byTime ? "trainer:timeup" : "trainer:finish");
    trackItemClick(`trainer:pct:${Math.min(100, Math.floor(pct / 10) * 10)}`);
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

  // 연출은 일정 시간 뒤 사라진다
  useEffect(() => {
    if (!reveal) return;
    const id = setTimeout(() => setReveal((r) => (r && r.id === reveal.id ? null : r)), REVEAL_MS);
    return () => clearTimeout(id);
  }, [reveal]);

  // ---- 플레이 조작 ----
  /** 재료를 다 쓰면(솥에 잔가지만 남았어도) 바로 결과로 */
  const commit = useCallback((next: Play) => {
    if (next.pot.every((u) => u === TWIG_UID) && remainingOf(next).length === 0) finishWith(next, false);
    else setPlay(next);
  }, [finishWith]);

  const addToPot = useCallback((uid: number) => {
    if (!play || cooking || play.pot.length >= 4 || (uid !== TWIG_UID && play.pot.includes(uid))) return;
    setPlay({ ...play, pot: [...play.pot, uid] });
  }, [play, cooking]);
  /** 칸 위치로 뺀다 — 잔가지는 uid가 같아서 */
  const removeFromPot = useCallback((index: number) => {
    if (play && !cooking) setPlay({ ...play, pot: play.pot.filter((_, i) => i !== index) });
  }, [play, cooking]);
  const roast = useCallback((uid: number) => {
    if (!play || cooking || !play.round.items[uid].roasted || play.roasted.includes(uid) || play.pot.includes(uid)) return;
    setPlay({ ...play, roasted: [...play.roasted, uid] });
    trackItemClick("trainer:roast");
  }, [play, cooking]);
  const cook = useCallback(() => {
    if (!play || cooking || play.pot.length !== 4) return;
    setCooking(true);
    setReveal(null);
    setTimeout(() => {
      const p = playRef.current;
      if (!p || phaseRef.current !== "playing" || p.pot.length !== 4) { setCooking(false); return; }
      const ings = p.pot.map((u) => potIngredient(p, u));
      const { recipe, wasRandom } = cookActual(ings, p.round.station);
      const before = p.round.config.warly ? (memoryCounts(p.actions).get(recipe.id) ?? 0) : 0;
      const mult = warlyMultiplier(before);
      const action: TrainerAction = {
        type: "cook", uids: p.pot.filter((u) => u !== TWIG_UID), ingredients: ings, recipe, wasRandom, mult,
        stats: scaleStats(recipeStats(recipe), mult),
      };
      setCooking(false);
      setReveal({ action, id: Date.now() });
      commit({ ...p, actions: [...p.actions, action], pot: [] });
    }, COOK_MS);
  }, [play, cooking, commit]);
  const eatRaw = useCallback((uid: number) => {
    if (!play || cooking) return;
    const { ingredient, raw } = formOf(play, uid);
    if (!raw || play.pot.includes(uid)) return;
    const action: TrainerAction = { type: "raw", uid, ingredient, stats: raw };
    setReveal({ action, id: Date.now() });
    commit({ ...play, actions: [...play.actions, action] });
  }, [play, cooking, commit]);

  const remaining = useMemo(() => (play ? remainingOf(play) : []), [play]);

  if (phase === "setup" || !play) {
    return (
      <SetupScreen
        locale={locale}
        config={challenge?.config ?? config}
        best={best[configKey(challenge?.config ?? config)]}
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
        isNewRecord={isNewRecord}
        best={best[configKey(play.round.config)]}
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
      cooking={cooking}
      reveal={reveal}
      onAddToPot={addToPot}
      onRemoveFromPot={removeFromPot}
      onCook={cook}
      onEatRaw={eatRaw}
      onRoast={roast}
      onFinish={() => finishWith(play, false)}
    />
  );
}

// ---------------------------------------------------------------------------
// 공통 조각
// ---------------------------------------------------------------------------

function Chip({ active, onClick, children, disabled, size = "md" }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; size?: "md" | "lg" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border transition-colors disabled:opacity-30 disabled:pointer-events-none",
        size === "lg" ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs",
        active ? "bg-foreground text-background border-foreground" : "bg-surface border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const STAT_KEYS = ["hunger", "health", "sanity"] as const;

function StatRow({ stats, className, size = "sm" }: { stats: Stats; className?: string; size?: "sm" | "md" | "lg" }) {
  const icon = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5";
  const text = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";
  return (
    <div className={cn("flex items-center gap-x-2.5 gap-y-0.5 flex-wrap tabular-nums", text, className)}>
      {STAT_KEYS.map((k) => (
        <span key={k} className="inline-flex items-center gap-1">
          <img src={assetPath(`/images/ui/${k}.webp`)} alt={k} className={cn(icon, "object-contain")} loading="lazy" />
          <span className={cn("font-bold", statColor(stats[k]))}>{fmt1(stats[k])}</span>
        </span>
      ))}
    </div>
  );
}

function WeightsChip({ weights, locale, dark }: { weights: StatWeights; locale: Locale; dark?: boolean }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 h-8 px-2.5 rounded-full border border-border bg-surface text-xs font-semibold tabular-nums", dark && "bg-background")}
      title={tt("weights", locale)}
    >
      {STAT_KEYS.filter((k) => weights[k] > 0).map((k) => (
        <span key={k} className="inline-flex items-center gap-0.5">
          <img src={assetPath(`/images/ui/${k}.webp`)} alt={k} className="size-4 object-contain" loading="lazy" />
          ×{weights[k]}
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
      className={cn("object-contain drop-shadow-sm", className)}
      loading="lazy"
    />
  );
}

function DishCard({
  recipes, stats, mult, wasRandom, locale, ingredients, onViewRecipe,
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
  const name = recipes.length === 1 ? foodName(main, locale) : recipes.map((r) => foodName(r, locale)).join(" / ");
  return (
    <div className={cn("flex items-center gap-2.5 rounded-xl border px-2.5 py-2", inedible ? "border-red-500/30 bg-red-500/5" : "border-border bg-surface")}>
      {/* 재료 2×2 */}
      <div className="grid grid-cols-2 gap-0.5 shrink-0">
        {ingredients.map((ing, i) => (
          <IngredientIcon key={i} ing={ing} locale={locale} className="size-6 rounded-md bg-background border border-border p-0.5" />
        ))}
      </div>
      <span className="text-muted-foreground text-sm shrink-0">→</span>
      <img src={assetPath(`/images/game-items/${main.id}.png`)} alt="" className="size-11 object-contain shrink-0" loading="lazy" />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          disabled={!canNav}
          onClick={() => canNav && onViewRecipe(main.id)}
          className={cn("block max-w-full text-left text-sm font-bold leading-tight truncate", canNav && "hover:underline")}
        >
          {name}
        </button>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <StatRow stats={stats} />
          {(wasRandom || recipes.length > 1) && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 dark:text-amber-400"><Shuffle className="size-3" />{tt(recipes.length > 1 ? "expected" : "randomPick", locale)}</span>
          )}
          {inedible && <span className="text-[11px] text-red-500 font-semibold">{tt("inedible", locale)}</span>}
          {mult !== 1 && <span className="text-[11px] text-muted-foreground tabular-nums">×{mult}</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 설정 화면
// ---------------------------------------------------------------------------

function SetupScreen({ locale, config, best, challenge, onDismissChallenge, onChange, onStart }: {
  locale: Locale;
  config: TrainerConfig;
  /** 이 설정의 최고 기록(최적 대비 %) */
  best: number | undefined;
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
        {/* 히어로 */}
        <div className="rounded-xl bg-surface border border-border p-4 flex items-center gap-4">
          <img src={assetPath("/images/game-items/cookpot.png")} alt="" className="size-20 object-contain drop-shadow-lg shrink-0" loading="lazy" />
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight">{tt("title", locale)}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-snug">{tt("intro", locale)}</p>
            {best !== undefined && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 tabular-nums">{tt("bestRecord", locale)} {best}%</p>
            )}
          </div>
        </div>

        {challenge && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{tt("challengeTitle", locale)}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{tt("seed", locale)} {challenge.seed.toString(36)}</span>
              <button type="button" onClick={onDismissChallenge} className="ml-auto text-xs text-muted-foreground underline">{tt("challengeDismiss", locale)}</button>
            </div>
            <p className="text-xs text-muted-foreground">{tt("challengeDesc", locale)}</p>
          </div>
        )}

        <Section label={tt("optIngredients", locale)} hint={config.warly ? tt("warlyMaxNote", locale) : undefined}>
          {INGREDIENT_COUNTS.map((n) => (
            <Chip key={n} size="lg" active={config.ingredientCount === n} onClick={() => onChange({ ingredientCount: n })} disabled={locked || (config.warly && n > WARLY_MAX_INGREDIENTS)}>
              {n}
            </Chip>
          ))}
        </Section>

        <Section label={tt("optTime", locale)}>
          {TIME_LIMITS.map((s) => (
            <Chip key={s} size="lg" active={config.timeLimit === s} onClick={() => onChange({ timeLimit: s })} disabled={locked}>
              {s === 0 ? tt("timeNone", locale) : `${s}${tt("seconds", locale)}`}
            </Chip>
          ))}
        </Section>

        <Section label={tt("optScoring", locale)} hint={scoringDesc[config.scoring]}>
          {(["hunger", "balanced", "random"] as const).map((m) => (
            <Chip key={m} size="lg" active={config.scoring === m} onClick={() => onChange({ scoring: m })} disabled={locked}>
              {m === "hunger" && <img src={assetPath("/images/ui/hunger.webp")} alt="" className="size-4" loading="lazy" />}
              {m === "balanced" && STAT_KEYS.map((k) => <img key={k} src={assetPath(`/images/ui/${k}.webp`)} alt="" className="size-4 -ml-1 first:ml-0" loading="lazy" />)}
              {m === "random" && <Shuffle className="size-4" />}
              {tt(m === "hunger" ? "scoringHunger" : m === "balanced" ? "scoringBalanced" : "scoringRandom", locale)}
            </Chip>
          ))}
        </Section>

        <Section label={tt("optWarly", locale)} hint={tt("warlyDesc", locale)}>
          <Chip size="lg" active={config.warly} onClick={() => onChange({ warly: !config.warly })} disabled={locked}>
            <img src={assetPath("/images/game-items/portablecookpot_item.png")} alt="" className="size-5 object-contain" loading="lazy" />
            {tt("optWarly", locale)}
            {config.warly && <Check className="size-4" />}
          </Chip>
        </Section>

        <button
          type="button"
          onClick={onStart}
          className="w-full h-12 rounded-lg bg-foreground text-background font-bold text-base inline-flex items-center justify-center gap-2 hover:opacity-80 active:scale-[0.98] transition-all"
        >
          <Play className="size-5 fill-current" />
          {tt("start", locale)}
        </button>
      </div>
    </TabScrollArea>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 플레이 화면 — 어두운 조리대 패널 위에 큰 솥, 인벤토리 슬롯, HUD
// ---------------------------------------------------------------------------

interface Stack { ingredient: CookpotIngredient; uids: number[]; raw: Stats | null; canRoast: boolean }

function PlayScreen({
  locale, play, remaining, timeLeft, cooking, reveal, onAddToPot, onRemoveFromPot, onCook, onEatRaw, onRoast, onFinish,
}: {
  locale: Locale;
  play: Play;
  remaining: TrainerRound["items"];
  timeLeft: number | null;
  cooking: boolean;
  reveal: { action: TrainerAction; id: number } | null;
  onAddToPot: (uid: number) => void;
  onRemoveFromPot: (index: number) => void;
  onCook: () => void;
  onEatRaw: (uid: number) => void;
  onRoast: (uid: number) => void;
  onFinish: () => void;
}) {
  const { round, actions, pot } = play;
  const totals = totalsOf(actions);
  const score = scoreOf(totals, round.weights);
  const warly = round.config.warly;
  const memory = warly ? memoryCounts(actions) : null;
  const limit = round.config.timeLimit;
  const urgent = timeLeft !== null && timeLeft <= 10;
  const timeFrac = timeLeft === null ? 1 : Math.max(0, Math.min(1, timeLeft / limit));

  // 같은 재료(같은 형태)는 한 칸에 ×N (인벤토리처럼) — 구운 고기와 받은 구운 고기는 같은 칸
  const stacks = useMemo(() => {
    const m = new Map<string, Stack>();
    for (const it of remaining) {
      const form = formOf(play, it.uid);
      const s = m.get(form.ingredient.id);
      if (s) s.uids.push(it.uid);
      else m.set(form.ingredient.id, { ingredient: form.ingredient, uids: [it.uid], raw: form.raw, canRoast: !!it.roasted && !play.roasted.includes(it.uid) });
    }
    return [...m.values()];
  }, [remaining, play]);

  // 생식·굽기는 되돌릴 수 없어서 두 번 탭 — 첫 탭은 확인 상태(2초)
  const [pending, setPending] = useState<{ kind: "eat" | "roast"; id: string } | null>(null);
  useEffect(() => {
    if (pending === null) return;
    const id = setTimeout(() => setPending(null), 2000);
    return () => clearTimeout(id);
  }, [pending]);
  const handleTap = (kind: "eat" | "roast", s: Stack) => {
    if (pending?.kind === kind && pending.id === s.ingredient.id) {
      setPending(null);
      if (kind === "eat") onEatRaw(s.uids[0]); else onRoast(s.uids[0]);
    } else setPending({ kind, id: s.ingredient.id });
  };

  const lastScore = reveal ? scoreOf(reveal.action.stats, round.weights) : 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* HUD */}
      <div className="shrink-0 px-3 pt-2 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 h-9 px-3 rounded-full border text-lg font-bold tabular-nums shrink-0",
            urgent ? "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 animate-trainer-pulse" : "border-border bg-surface",
          )}>
            <Timer className="size-4" />
            {timeLeft === null ? "∞" : formatTime(timeLeft)}
          </span>
          <span className="inline-flex items-baseline gap-1.5 h-9 px-3 rounded-full border border-border bg-surface whitespace-nowrap shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground">{tt("score", locale)}</span>
            <span key={Math.round(score)} className="text-xl font-bold tabular-nums animate-trainer-pop">{Math.round(score)}</span>
          </span>
          <span className="hidden sm:inline-flex"><WeightsChip weights={round.weights} locale={locale} /></span>
          <button
            type="button"
            onClick={onFinish}
            className="ml-auto inline-flex items-center gap-1 h-9 px-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 whitespace-nowrap shrink-0"
          >
            <Flag className="size-4" />
            {tt("finish", locale)}
          </button>
        </div>
        {/* 타이머 바 */}
        <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-[width] duration-200 ease-linear", urgent ? "bg-red-500" : timeFrac < 0.35 ? "bg-amber-500" : "bg-foreground")}
            style={{ width: `${timeFrac * 100}%` }}
          />
        </div>
      </div>

      <TabScrollArea scrollContainer noFooter>
        <div className="max-w-4xl mx-auto px-3 pt-3 pb-4 w-full space-y-3">
          {/* 조리대 */}
          <div className="rounded-xl bg-surface border border-border p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <StatRow stats={totals} size="md" />
              {memory && memory.size > 0 && (
                <div className="flex items-center gap-1">
                  {[...memory.entries()].map(([id, n]) => (
                    <span key={id} className="relative inline-flex items-center rounded-md bg-background border border-border p-0.5" title={`${tt("memory", locale)} ×${n} · ${tt("memoryNext", locale)} ×${warlyMultiplier(n)}`}>
                      <img src={assetPath(`/images/game-items/${id}.png`)} alt="" className="size-6 object-contain" loading="lazy" />
                      <span className="absolute -bottom-1.5 -right-1.5 text-[9px] font-bold rounded-full px-1 leading-4 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400">×{warlyMultiplier(n)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
              {/* 왼쪽 슬롯 1·2 */}
              <div className="flex flex-col gap-2 items-end">
                {[0, 1].map((i) => <PotSlot key={i} index={i} ingredient={pot[i] !== undefined ? potIngredient(play, pot[i]) : null} locale={locale} disabled={cooking} onRemove={onRemoveFromPot} />)}
              </div>

              {/* 솥 / 결과 연출 */}
              <div className="relative flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
                {reveal && !cooking ? (
                  <RevealView action={reveal.action} locale={locale} score={lastScore} />
                ) : (
                  <>
                    {cooking && (
                      <div className="absolute top-2 inset-x-0 flex justify-center gap-3 pointer-events-none">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="size-2.5 rounded-full bg-muted-foreground/60 animate-trainer-bubble" style={{ animationDelay: `${i * 0.25}s` }} />
                        ))}
                      </div>
                    )}
                    <img
                      src={assetPath(`/images/game-items/${warly ? "portablecookpot_item" : "cookpot"}.png`)}
                      alt=""
                      className={cn("size-24 sm:size-28 object-contain drop-shadow-md", cooking && "animate-trainer-wobble")}
                      loading="lazy"
                    />
                    <span className="mt-1 text-xs font-semibold tabular-nums text-muted-foreground">{cooking ? tt("cooking", locale) : `${pot.length} / 4`}</span>
                  </>
                )}
              </div>

              {/* 오른쪽 슬롯 3·4 */}
              <div className="flex flex-col gap-2 items-start">
                {[2, 3].map((i) => <PotSlot key={i} index={i} ingredient={pot[i] !== undefined ? potIngredient(play, pot[i]) : null} locale={locale} disabled={cooking} onRemove={onRemoveFromPot} />)}
              </div>
            </div>

            <button
              type="button"
              onClick={onCook}
              disabled={pot.length !== 4 || cooking}
              className={cn(
                "mt-3 w-full h-12 rounded-lg text-base font-bold inline-flex items-center justify-center gap-2 transition-all",
                pot.length === 4 && !cooking
                  ? "bg-foreground text-background hover:opacity-80 active:scale-[0.98]"
                  : "bg-surface-hover text-muted-foreground",
              )}
            >
              <Utensils className="size-5" />
              {cooking ? tt("cooking", locale) : tt("cook", locale)}
            </button>
            <p className="text-[11px] text-muted-foreground mt-1.5 text-center">{pot.length === 0 ? tt("tapPot", locale) : tt("removeHint", locale)}</p>
          </div>

          {/* 인벤토리 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">{tt("tray", locale)}</span>
              <span className="text-xs font-semibold text-muted-foreground tabular-nums">{remaining.length}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {/* 잔가지 — 지급 재료가 아니라 언제든 무제한 (#135) */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAddToPot(TWIG_UID)}
                    disabled={cooking || pot.length >= 4}
                    className="relative flex items-center justify-center size-16 sm:size-[72px] rounded-lg bg-background border border-dashed border-ring hover:border-foreground active:bg-surface-hover active:scale-95 transition-all disabled:opacity-40"
                    title={tt("twigHint", locale)}
                  >
                    <IngredientIcon ing={TWIG} locale={locale} className="size-12 sm:size-14" />
                    <span className="absolute -bottom-1.5 -right-1.5 min-w-6 h-6 px-1.5 rounded-full bg-surface-hover border border-ring text-foreground/80 text-sm font-bold flex items-center justify-center">∞</span>
                  </button>
                  <span className="text-[11px] text-foreground/80 font-medium leading-tight text-center line-clamp-2 min-h-[2lh] w-full">{ingredientName(TWIG, locale)}</span>
                </div>
                {stacks.map((s) => {
                  const confirming = pending?.kind === "eat" && pending.id === s.ingredient.id;
                  const confirmingRoast = pending?.kind === "roast" && pending.id === s.ingredient.id;
                  return (
                    <div key={s.ingredient.id} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => onAddToPot(s.uids[0])}
                          disabled={cooking || pot.length >= 4}
                          className="relative flex items-center justify-center size-16 sm:size-[72px] rounded-lg bg-surface border border-border hover:border-ring active:bg-surface-hover active:scale-95 transition-all disabled:opacity-40"
                        >
                          <IngredientIcon ing={s.ingredient} locale={locale} className="size-12 sm:size-14" />
                          {s.uids.length > 1 && (
                            <span className="absolute -bottom-1.5 -right-1.5 min-w-6 h-6 px-1.5 rounded-full bg-surface-hover border border-ring text-foreground/80 text-xs font-bold tabular-nums flex items-center justify-center">×{s.uids.length}</span>
                          )}
                        </button>
                        {!warly && s.raw && (
                          <button
                            type="button"
                            onClick={() => handleTap("eat", s)}
                            disabled={cooking}
                            className={cn(
                              "absolute -top-1.5 -left-1.5 h-6 rounded-full text-[10px] font-bold flex items-center gap-0.5 px-1.5 shadow border transition-colors",
                              confirming
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-trainer-pop"
                                : "bg-background text-muted-foreground border-border hover:text-foreground",
                            )}
                            title={tt("eatRaw", locale)}
                          >
                            <Utensils className="size-3" />
                            {confirming ? tt("eatConfirmShort", locale) : tt("eatShort", locale)}
                          </button>
                        )}
                        {s.canRoast && (
                          <button
                            type="button"
                            onClick={() => handleTap("roast", s)}
                            disabled={cooking}
                            className={cn(
                              "absolute -top-1.5 -right-1.5 h-6 rounded-full text-[10px] font-bold flex items-center gap-0.5 px-1.5 shadow border transition-colors",
                              confirmingRoast
                                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40 animate-trainer-pop"
                                : "bg-background text-muted-foreground border-border hover:text-foreground",
                            )}
                            title={tt("roastHint", locale)}
                          >
                            <Flame className="size-3" />
                            {confirmingRoast ? tt("eatConfirmShort", locale) : tt("roastShort", locale)}
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-foreground/80 font-medium leading-tight text-center line-clamp-2 min-h-[2lh] w-full">{ingredientName(s.ingredient, locale)}</span>
                    </div>
                  );
                })}
            </div>
            {stacks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">{tt("trayEmpty", locale)}</p>}
          </div>

          {/* 먹은 것 */}
          {actions.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">{tt("log", locale)}</div>
              <div className="space-y-1.5">
                {[...actions].reverse().map((a, i) => <ActionRow key={actions.length - i} action={a} locale={locale} />)}
              </div>
            </div>
          )}
        </div>
      </TabScrollArea>
    </div>
  );
}

function PotSlot({ index, ingredient, locale, disabled, onRemove }: { index: number; ingredient: CookpotIngredient | null; locale: Locale; disabled: boolean; onRemove: (index: number) => void }) {
  if (!ingredient) {
    return (
      <div className="flex items-center justify-center size-16 sm:size-[72px] rounded-lg border-2 border-dashed border-border bg-background/50 text-sm font-semibold text-muted-foreground">
        {index + 1}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onRemove(index)}
      disabled={disabled}
      className="relative flex items-center justify-center size-16 sm:size-[72px] rounded-lg bg-background border-2 border-primary/50 hover:border-primary hover:bg-primary/10 active:scale-95 transition-all animate-trainer-pop"
      title={ingredientName(ingredient, locale)}
    >
      <IngredientIcon ing={ingredient} locale={locale} className="size-12 sm:size-14" />
      {!disabled && <X className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-surface-hover border border-ring text-foreground/80 p-0.5" />}
    </button>
  );
}

/** 방금 먹은 것 — 요리면 요리 이미지, 생식이면 재료 이미지가 크게 튀어나오고 스탯이 떠오른다 */
function RevealView({ action, locale, score }: { action: TrainerAction; locale: Locale; score: number }) {
  const isCook = action.type === "cook";
  const img = isCook ? `/images/game-items/${action.recipe.id}.png` : `/images/game-items/${ingredientImage(action.ingredient)}`;
  const name = isCook ? foodName(action.recipe, locale) : ingredientName(action.ingredient, locale);
  const inedible = isCook && !isPlayerEdible(action.recipe);
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="absolute -top-1 inset-x-0 flex justify-center pointer-events-none">
        <span className={cn("text-2xl font-bold tabular-nums animate-trainer-float", statColor(score))}>
          {score > 0 ? "+" : ""}{Math.round(score)}
        </span>
      </div>
      <img src={assetPath(img)} alt="" className="size-24 sm:size-28 object-contain drop-shadow-md animate-trainer-pop" loading="lazy" />
      <span className={cn("mt-1 text-sm font-bold text-center leading-tight line-clamp-1", inedible ? "text-red-500" : "text-foreground")}>
        {inedible ? tt("inedible", locale) : name}
      </span>
      <div className="mt-1 w-max max-w-none">
        <StatRow stats={action.stats} className="flex-nowrap whitespace-nowrap text-[11px]" />
      </div>
      {isCook && action.wasRandom && <span className="absolute top-0 right-0 text-[10px] text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5"><Shuffle className="size-3" />{tt("randomPick", locale)}</span>}
      {isCook && action.mult !== 1 && <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">×{action.mult}</span>}
    </div>
  );
}

function ActionRow({ action, locale, onViewRecipe }: { action: TrainerAction; locale: Locale; onViewRecipe?: (id: string) => void }) {
  if (action.type === "cook") {
    return (
      <DishCard
        recipes={[action.recipe]}
        stats={action.stats}
        mult={action.mult}
        wasRandom={action.wasRandom}
        locale={locale}
        ingredients={action.ingredients}
        onViewRecipe={onViewRecipe}
      />
    );
  }
  const ing = action.ingredient;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-2.5 py-2">
      <IngredientIcon ing={ing} locale={locale} className="size-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold leading-tight truncate">{ingredientName(ing, locale)} <span className="text-[11px] font-medium text-muted-foreground">{tt("rawEaten", locale)}</span></div>
        <div className="mt-1"><StatRow stats={action.stats} /></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 결과 화면 — 등급 도장 + 큰 퍼센트
// ---------------------------------------------------------------------------

function rankOf(pct: number): { letter: string; color: string; verdict: "perfect" | "great" | "good" | "tryAgain" } {
  if (pct >= 100) return { letter: "S", color: "text-amber-600 dark:text-amber-400 border-amber-500", verdict: "perfect" };
  if (pct >= 85) return { letter: "A", color: "text-green-600 dark:text-green-400 border-green-500", verdict: "great" };
  if (pct >= 70) return { letter: "B", color: "text-sky-600 dark:text-sky-400 border-sky-500", verdict: "good" };
  if (pct >= 50) return { letter: "C", color: "text-muted-foreground border-ring", verdict: "good" };
  return { letter: "D", color: "text-red-500 border-red-500", verdict: "tryAgain" };
}

function ResultScreen({
  locale, play, result, endedByTime, onRetrySame, onNew, onSetup, onViewRecipe, isNewRecord, best,
}: {
  locale: Locale;
  play: Play;
  result: TrainerResult;
  endedByTime: boolean;
  isNewRecord: boolean;
  best: number | undefined;
  onRetrySame: () => void;
  onNew: () => void;
  onSetup: () => void;
  onViewRecipe?: (id: string) => void;
}) {
  const { round, actions } = play;
  const pct = Math.round(result.percent);
  const rank = rankOf(pct);

  return (
    <TabScrollArea scrollContainer noFooter>
      <div className="max-w-3xl mx-auto px-3 py-4 w-full space-y-4">
        {/* 점수판 */}
        <div className="relative overflow-hidden rounded-xl bg-surface border border-border p-5 text-center">
          {endedByTime && <div className="text-xs text-red-500 font-semibold mb-1">{tt("timeUp", locale)}</div>}
          <div className="flex items-center justify-center gap-5">
            <div className={cn("flex items-center justify-center size-24 rounded-xl border-4 text-6xl font-black bg-background animate-trainer-stamp", rank.color)}>
              {rank.letter}
            </div>
            <div className="text-left">
              <div className="text-5xl font-black tabular-nums leading-none">{pct}<span className="text-2xl">%</span></div>
              <div className="text-sm text-muted-foreground mt-1">{tt("ofOptimal", locale)}</div>
              <div className={cn("text-base font-bold mt-0.5", rank.color.replace(/border-\S+/, ""))}>{tt(rank.verdict, locale)}</div>
              {isNewRecord
                ? <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 animate-trainer-pop">{tt("newRecord", locale)}</div>
                : best !== undefined && <div className="text-xs text-muted-foreground mt-1 tabular-nums">{tt("bestRecord", locale)} {best}%</div>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left">
            <ScoreBox label={tt("yours", locale)} score={result.playerScore} stats={result.playerTotals} />
            <ScoreBox label={tt("optimal", locale)} score={result.optimal.score} stats={result.optimal.totals} highlight />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <WeightsChip weights={round.weights} locale={locale} dark />
            <span className="text-[11px] text-muted-foreground tabular-nums">{tt("seed", locale)} {round.seed.toString(36)}</span>
            <ShareButton
              url={challengeUrl(round)}
              toastMessage={tt("shareCopied", locale)}
              label={tt("share", locale)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-border bg-background text-foreground text-xs font-semibold"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={onRetrySame} className="h-11 rounded-lg border border-border bg-surface text-sm font-semibold inline-flex items-center justify-center gap-1 hover:bg-surface-hover"><RotateCcw className="size-4" />{tt("retrySame", locale)}</button>
          <button type="button" onClick={onNew} className="h-11 rounded-lg bg-foreground text-background text-sm font-bold inline-flex items-center justify-center gap-1 hover:opacity-80"><Play className="size-4 fill-current" />{tt("newRound", locale)}</button>
          <button type="button" onClick={onSetup} className="h-11 rounded-lg border border-border bg-surface text-sm font-semibold inline-flex items-center justify-center gap-1 hover:bg-surface-hover"><Settings2 className="size-4" />{tt("backToSetup", locale)}</button>
        </div>

        <PlanSection title={tt("optimalPlan", locale)} plan={result.optimal} round={round} locale={locale} onViewRecipe={onViewRecipe} />

        <div>
          <div className="text-sm font-semibold mb-2">{tt("yourPlan", locale)}</div>
          {actions.length === 0 ? (
            <p className="text-xs text-muted-foreground">{tt("logEmpty", locale)}</p>
          ) : (
            <div className="space-y-1.5">
              {actions.map((a, i) => <ActionRow key={i} action={a} locale={locale} onViewRecipe={onViewRecipe} />)}
            </div>
          )}
        </div>
      </div>
    </TabScrollArea>
  );
}

function ScoreBox({ label, score, stats, highlight }: { label: string; score: number; stats: Stats; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg border px-3 py-2.5", highlight ? "border-amber-500/40 bg-amber-500/10" : "border-border bg-background")}>
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="text-2xl font-black tabular-nums leading-tight">{Math.round(score)}</div>
      <StatRow stats={stats} className="mt-1" />
    </div>
  );
}

function PlanSection({ title, plan, round, locale, onViewRecipe }: { title: string; plan: OptimalPlan; round: TrainerRound; locale: Locale; onViewRecipe?: (id: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{title}</div>
      {plan.pots.length === 0 && plan.raws.length === 0 && (
        <p className="text-xs text-muted-foreground">—</p>
      )}
      <div className="space-y-1.5">
        {plan.pots.map((p, i) => (
          <DishCard key={i} recipes={p.recipes} stats={p.stats} mult={p.mult} locale={locale} ingredients={p.ingredients} onViewRecipe={onViewRecipe} />
        ))}
      </div>
      {plan.raws.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">{tt("rawEaten", locale)}</div>
          <div className="flex flex-wrap gap-2">
            {plan.raws.map((r) => (
              <ItemSlot key={r.uid} icon={ingredientImage(r.ingredient)} label={ingredientName(r.ingredient, locale)} badge={fmt1(scoreOf(r.stats, round.weights))} />
            ))}
          </div>
        </div>
      )}
      {plan.discardUids.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">{tt("discarded", locale)}</div>
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
