// ---------------------------------------------------------------------------
// Crock Pot Trainer — 미니게임 엔진 (#128)
//
// 랜덤 재료 N개를 받아 제한 시간 안에 "요리솥에 넣어 끓이기 / 생으로 먹기 / 버리기"로
// 스탯 이득을 최대화하고, 끝나면 최적해(전수 탐색)와 비교한다.
//
// 게임 수치 출처:
//  - 요리 판정: `cookpot-engine.ts` `simulate()` (preparedfoods.lua 이식)
//  - 생식 수치: `raw-foods.ts` (prefab edible 컴포넌트, 캐릭터 보정 전 기본값)
//  - 월리: eater.lua `PrefersToEat` — `preparedfood` 태그 없는 음식은 먹지 못한다.
//          foodmemory.lua — 같은 요리를 `WARLY_SAME_OLD_COOLDOWN`(2일) 안에 다시 먹으면
//          `WARLY_SAME_OLD_MULTIPLIERS = { .9, .8, .65, .5, .3 }` 배율 (체력·허기·정신력 모두,
//          eater.lua `base_mult`). 한 라운드는 2일 안이라고 가정한다.
// ---------------------------------------------------------------------------

import { cookpotIngredients, getIngredientById, type CookpotIngredient } from "@/data/cookpot-ingredients";
import { rawFoods, type RawFood } from "@/data/raw-foods";
import { simulate } from "@/lib/cookpot-engine";
import type { CookingRecipe } from "@/data/recipes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Stats {
  hunger: number;
  health: number;
  sanity: number;
}

export type StatWeights = Stats;

export type ScoringMode = "hunger" | "balanced" | "random";

/**
 * 20이 상한인 이유: 최적해가 종류별 개수 DP(아래 `solveMultisetDp`)인데 24개는 상태 150만·약 3초,
 * 20개는 상태 20만·0.3초 안팎이다 (2026-10-20 실측). 더 열려면 Web Worker가 필요하다.
 */
export const INGREDIENT_COUNTS = [8, 12, 16, 20] as const;
export type IngredientCount = (typeof INGREDIENT_COUNTS)[number];

/** 0 = 무제한 */
export const TIME_LIMITS = [0, 60, 120, 180] as const;
export type TimeLimit = (typeof TIME_LIMITS)[number];

/** 월리 모드는 기억 배율 때문에 분할 단위로 전수 평가한다 — 12개(요리솥 3번)까지만 */
export const WARLY_MAX_INGREDIENTS: IngredientCount = 12;

export interface TrainerConfig {
  ingredientCount: IngredientCount;
  timeLimit: TimeLimit;
  scoring: ScoringMode;
  warly: boolean;
}

export const DEFAULT_CONFIG: TrainerConfig = {
  ingredientCount: 12,
  timeLimit: 120,
  // 허기만 세면 최적 요리의 70%가 미트볼·고기 스튜라(300라운드 분석) 기본은 균형
  scoring: "balanced",
  warly: false,
};

/** 라운드에 지급된 재료 한 개. 같은 재료가 여러 개일 수 있어 uid로 구분한다. */
export interface TrainerItem {
  uid: number;
  ingredient: CookpotIngredient;
  /** 생으로 먹을 때 수치. 없으면 생식 불가(잔가지·얼음) 또는 월리. */
  raw: Stats | null;
}

export type TrainerAction =
  | {
      type: "cook";
      uids: number[];
      recipe: CookingRecipe;
      /** 같은 우선순위 레시피가 여럿이라 무작위로 골랐을 때 */
      wasRandom: boolean;
      /** 월리 기억 배율 (아니면 1) */
      mult: number;
      stats: Stats;
    }
  | { type: "raw"; uid: number; stats: Stats };

export interface TrainerRound {
  seed: number;
  config: TrainerConfig;
  weights: StatWeights;
  items: TrainerItem[];
  /** 월리 모드에서만 — 요리 레시피 집합 */
  station: "cookpot" | "portablecookpot";
}

// 최적해 ---------------------------------------------------------------------

export interface PlanPot {
  uids: number[];
  /** 기대값 기준 — 랜덤 결과면 후보 전부 */
  recipes: CookingRecipe[];
  mult: number;
  stats: Stats;
}

export interface OptimalPlan {
  pots: PlanPot[];
  rawUids: number[];
  discardUids: number[];
  totals: Stats;
  score: number;
}

// ---------------------------------------------------------------------------
// 재료 풀 — 게임 초중반에 흔히 손에 들어오는 요리솥 재료만. 가중치가 곧 출현 빈도.
// 생식 수치가 `raw-foods.ts`에 있거나(자동 추출) 아예 먹을 수 없는 것(잔가지·얼음)만 넣는다 —
// 생식 수치를 손으로 적지 않기 위해서다.
// ---------------------------------------------------------------------------

const POOL: ReadonlyArray<readonly [id: string, weight: number]> = [
  // 가중치 메모 (2026-10-20 300라운드 분석): 처음엔 고기 6·괴물고기 7·잔가지 7·얼음 5였는데 허기 채점에서
  // 최적 요리의 70%가 미트볼+고기 스튜였다. 채움 재료(잔가지·얼음·괴물고기)를 줄이고 알·꿀·생선·특정
  // 채소를 올려 다양하게. 그래도 미트볼이 1위인 건 게임이 그런 것이라 그대로 둔다
  // 고기류
  ["meat", 5], ["smallmeat", 5], ["monstermeat", 4], ["drumstick", 3], ["batwing", 2],
  ["fishmeat_small", 3], ["fishmeat", 3], ["plantmeat", 2], ["batnose", 1], ["barnacle", 1],
  // 채소·과일
  ["berries", 6], ["berries_juicy", 2], ["carrot", 5], ["corn", 3], ["pumpkin", 3], ["potato", 4],
  ["tomato", 3], ["onion", 3], ["garlic", 2], ["pepper", 3], ["eggplant", 3], ["asparagus", 2],
  ["dragonfruit", 2], ["pomegranate", 2], ["watermelon", 3], ["durian", 2], ["cactus_meat", 2],
  ["kelp", 2], ["fig", 2], ["cave_banana", 2],
  ["red_cap", 3], ["blue_cap", 3], ["green_cap", 3],
  // 알·감미료·기타
  ["bird_egg", 6], ["honey", 6], ["butter", 2], ["twigs", 5], ["ice", 4],
];

const rawById = new Map<string, RawFood>(rawFoods.map((r) => [r.id, r]));

function assertPool() {
  for (const [id] of POOL) {
    const ing = getIngredientById(id);
    if (!ing) throw new Error(`[cookpot-trainer] unknown pool ingredient: ${id}`);
    // 먹을 수 없는 것만 생식 수치 없이 허용
    if (!rawById.has(id) && !ing.tags.inedible && !ing.tags.frozen) {
      throw new Error(`[cookpot-trainer] pool ingredient without raw stats: ${id}`);
    }
  }
}
assertPool();

/** 풀에 든 재료 (설명·도움말용) */
export const TRAINER_POOL_IDS: readonly string[] = POOL.map(([id]) => id);

// ---------------------------------------------------------------------------
// 난수 — mulberry32. seed만 있으면 같은 라운드를 다시 돌릴 수 있다.
// ---------------------------------------------------------------------------

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// 채점
// ---------------------------------------------------------------------------

export const ZERO: Stats = { hunger: 0, health: 0, sanity: 0 };

export function addStats(a: Stats, b: Stats): Stats {
  return { hunger: a.hunger + b.hunger, health: a.health + b.health, sanity: a.sanity + b.sanity };
}

export function scaleStats(s: Stats, k: number): Stats {
  return { hunger: s.hunger * k, health: s.health * k, sanity: s.sanity * k };
}

export function scoreOf(s: Stats, w: StatWeights): number {
  return s.hunger * w.hunger + s.health * w.health + s.sanity * w.sanity;
}

const RANDOM_WEIGHT_CHOICES = [0, 0.5, 1, 2] as const;

export function weightsFor(mode: ScoringMode, rng: () => number): StatWeights {
  if (mode === "hunger") return { hunger: 1, health: 0, sanity: 0 };
  if (mode === "balanced") return { hunger: 1, health: 1, sanity: 1 };
  // 랜덤 우선순위 — 전부 0이거나 한 종류만 1인 평범한 조합은 다시 뽑는다
  for (;;) {
    const pick = () => RANDOM_WEIGHT_CHOICES[Math.floor(rng() * RANDOM_WEIGHT_CHOICES.length)];
    const w = { hunger: pick(), health: pick(), sanity: pick() };
    const nonzero = [w.hunger, w.health, w.sanity].filter((v) => v > 0).length;
    if (nonzero >= 2) return w;
  }
}

// ---------------------------------------------------------------------------
// 라운드 생성
// ---------------------------------------------------------------------------

export function rawStatsOf(ing: CookpotIngredient): Stats | null {
  const raw = rawById.get(ing.id);
  if (!raw) return null;
  return { hunger: raw.hunger, health: raw.health, sanity: raw.sanity };
}

export function createRound(config: TrainerConfig, seed: number = randomSeed()): TrainerRound {
  const rng = makeRng(seed);
  const weights = weightsFor(config.scoring, rng);
  const count = config.warly ? Math.min(config.ingredientCount, WARLY_MAX_INGREDIENTS) : config.ingredientCount;

  const totalWeight = POOL.reduce((s, [, w]) => s + w, 0);
  const draw = (): string[] => {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      let r = rng() * totalWeight;
      let id = POOL[POOL.length - 1][0];
      for (const [pid, w] of POOL) {
        r -= w;
        if (r < 0) { id = pid; break; }
      }
      ids.push(id);
    }
    return ids;
  };
  // 종류가 너무 흩어진 세트는 최적해 상태 수(Π(개수+1))가 폭발한다 — 같은 난수열로 다시 뽑는다 (seed 결정적)
  let ids = draw();
  for (let tries = 0; tries < 50 && multisetStateCount(ids) > MAX_DP_STATES; tries++) ids = draw();

  const items: TrainerItem[] = ids.map((id, i) => {
    const ingredient = getIngredientById(id)!;
    return { uid: i, ingredient, raw: config.warly ? null : rawStatsOf(ingredient) };
  });

  return {
    seed,
    config: { ...config, ingredientCount: count as IngredientCount },
    weights,
    items,
    station: config.warly ? "portablecookpot" : "cookpot",
  };
}

// ---------------------------------------------------------------------------
// 요리 — 기대값과 실제(무작위) 둘 다
// ---------------------------------------------------------------------------

export const WARLY_SAME_OLD_MULTIPLIERS = [0.9, 0.8, 0.65, 0.5, 0.3] as const;

/** 이미 n번 먹은 요리를 또 먹을 때 배율 (foodmemory.lua GetFoodMultiplier) */
export function warlyMultiplier(timesEatenBefore: number): number {
  if (timesEatenBefore <= 0) return 1;
  return WARLY_SAME_OLD_MULTIPLIERS[Math.min(WARLY_SAME_OLD_MULTIPLIERS.length, timesEatenBefore) - 1];
}

/** 플레이어(FOODGROUP.OMNI)가 먹을 수 있는 음식 유형 — 소 먹이(roughage)·비식품은 먹지 못한다 */
const PLAYER_EDIBLE = new Set<string>(["meat", "veggie", "generic", "goodies"]);

export function isPlayerEdible(r: CookingRecipe): boolean {
  return PLAYER_EDIBLE.has(r.foodType);
}

/** 플레이어가 먹었을 때 수치 — 못 먹는 요리는 0 */
export function recipeStats(r: CookingRecipe): Stats {
  if (!isPlayerEdible(r)) return ZERO;
  return { hunger: r.hunger, health: r.health, sanity: r.sanity };
}

function expectedStats(recipes: CookingRecipe[]): Stats {
  const sum = recipes.reduce((acc, r) => addStats(acc, recipeStats(r)), ZERO);
  return scaleStats(sum, 1 / recipes.length);
}

const dishCache = new Map<string, CookingRecipe[]>();

/** 4재료 → 최상위 우선순위 레시피들 (정렬된 id 키로 캐시) */
export function dishFor(ings: CookpotIngredient[], station: TrainerRound["station"]): CookingRecipe[] {
  const key = station + ":" + ings.map((i) => i.id).sort().join(",");
  let hit = dishCache.get(key);
  if (!hit) {
    hit = simulate(ings, station).recipes;
    dishCache.set(key, hit);
  }
  return hit;
}

/** 플레이어가 실제로 끓였을 때 — 게임처럼 후보 중 하나를 무작위로 */
export function cookActual(
  ings: CookpotIngredient[],
  station: TrainerRound["station"],
  rng: () => number = Math.random,
): { recipe: CookingRecipe; wasRandom: boolean } {
  const recipes = dishFor(ings, station);
  const recipe = recipes[Math.floor(rng() * recipes.length)];
  return { recipe, wasRandom: recipes.length > 1 };
}

// ---------------------------------------------------------------------------
// 플레이어 누적 (UI 상태에서 호출)
// ---------------------------------------------------------------------------

/** 월리 기억: 지금까지 먹은 요리 id → 횟수. 랜덤 결과도 실제로 나온 레시피 기준 */
export function memoryCounts(actions: TrainerAction[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of actions) {
    if (a.type === "cook") m.set(a.recipe.id, (m.get(a.recipe.id) ?? 0) + 1);
  }
  return m;
}

export function totalsOf(actions: TrainerAction[]): Stats {
  return actions.reduce((acc, a) => addStats(acc, a.stats), ZERO);
}

// ---------------------------------------------------------------------------
// 최적해
// ---------------------------------------------------------------------------

interface PotEval {
  recipes: CookingRecipe[];
  stats: Stats; // 배율 전 기대값
  score: number; // 배율 전
}

function evalPot(round: TrainerRound, uids: number[]): PotEval {
  const ings = uids.map((u) => round.items[u].ingredient);
  const recipes = dishFor(ings, round.station);
  const stats = expectedStats(recipes);
  return { recipes, stats, score: scoreOf(stats, round.weights) };
}

function memoryKey(recipes: CookingRecipe[]): string {
  return recipes.map((r) => r.id).join("|");
}

/** 4개 조합 전부의 평가를 미리 — N=16이면 1,820개 */
function evalAllQuads(round: TrainerRound): { evals: Map<number, PotEval>; score: Float64Array } {
  const n = round.items.length;
  const evals = new Map<number, PotEval>();
  const score = new Float64Array(1 << n);
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) {
          const mask = (1 << a) | (1 << b) | (1 << c) | (1 << d);
          const ev = evalPot(round, [a, b, c, d]);
          evals.set(mask, ev);
          score[mask] = ev.score;
        }
  return { evals, score };
}

function rawScore(round: TrainerRound, uid: number): number {
  const raw = round.items[uid].raw;
  return raw ? scoreOf(raw, round.weights) : 0;
}

/**
 * 일반 모드 — 비트마스크 DP. dp[mask] = mask 안의 재료만 써서 얻는 최대 점수.
 * 가장 낮은 비트의 재료를 (버림 | 생식 | 다른 3개와 요리) 중 하나로 처리한다.
 * 요리끼리 독립이라 분리 가능 (월리 기억 배율이 없을 때만).
 */
function solveDp(round: TrainerRound): OptimalPlan {
  const n = round.items.length;
  const { evals: quads, score: quadScore } = evalAllQuads(round);
  const size = 1 << n;
  const dp = new Float64Array(size);
  // choice[mask]: 0 = 버림, 1 = 생식, 그 외 = 요리에 쓴 4개 mask
  const choice = new Int32Array(size);
  const raws = round.items.map((_, u) => Math.max(0, rawScore(round, u)));
  const rawOk = round.items.map((it, u) => it.raw !== null && rawScore(round, u) > 0);

  for (let mask = 1; mask < size; mask++) {
    const low = mask & -mask;
    const i = 31 - Math.clz32(low);
    const rest = mask ^ low;
    let best = dp[rest];
    let bestChoice = 0;
    if (rawOk[i]) {
      const v = raws[i] + dp[rest];
      if (v > best) { best = v; bestChoice = 1; }
    }
    // rest 안에서 3개 고르기
    if (popcount(rest) >= 3) {
      const bits: number[] = [];
      for (let b = 0; b < n; b++) if (rest & (1 << b)) bits.push(b);
      const m = bits.length;
      for (let x = 0; x < m; x++)
        for (let y = x + 1; y < m; y++)
          for (let z = y + 1; z < m; z++) {
            const q = low | (1 << bits[x]) | (1 << bits[y]) | (1 << bits[z]);
            const v = quadScore[q] + dp[mask ^ q];
            if (v > best) { best = v; bestChoice = q; }
          }
    }
    dp[mask] = best;
    choice[mask] = bestChoice;
  }

  // 역추적
  const pots: PlanPot[] = [];
  const rawUids: number[] = [];
  const discardUids: number[] = [];
  let mask = size - 1;
  while (mask) {
    const low = mask & -mask;
    const i = 31 - Math.clz32(low);
    const c = choice[mask];
    if (c === 0) { discardUids.push(i); mask ^= low; }
    else if (c === 1) { rawUids.push(i); mask ^= low; }
    else {
      const uids: number[] = [];
      for (let b = 0; b < n; b++) if (c & (1 << b)) uids.push(b);
      const ev = quads.get(c)!;
      pots.push({ uids, recipes: ev.recipes, mult: 1, stats: ev.stats });
      mask ^= c;
    }
  }
  return finalizePlan(round, pots, rawUids, discardUids);
}

function popcount(x: number): number {
  let c = 0;
  while (x) { x &= x - 1; c++; }
  return c;
}

/**
 * 월리 모드 — 요리솥 분할 전수 열거 (N ≤ 12 → 요리 최대 3번, 분할 ~24k개).
 * 같은 요리를 여러 번 먹으면 배율이 줄어 요리끼리 독립이 아니므로 분할 단위로 평가한다.
 * 생식은 불가라 요리에 안 쓴 재료는 전부 버린다.
 */
function solveEnum(round: TrainerRound): OptimalPlan {
  const n = round.items.length;
  const { evals: quads } = evalAllQuads(round);
  const full = (1 << n) - 1;

  let bestScore = 0;
  let bestPots: number[] = [];

  const evalPartition = (potMasks: number[]) => {
    // 같은 요리 횟수별 배율 — 같은 요리는 점수 높은 순으로 1배, .9배, … 가 되도록 정렬 무관(동일 기대값)
    const seen = new Map<string, number>();
    let total = 0;
    for (const q of potMasks) {
      const ev = quads.get(q)!;
      const key = memoryKey(ev.recipes);
      const before = seen.get(key) ?? 0;
      seen.set(key, before + 1);
      total += ev.score * warlyMultiplier(before);
    }
    if (total > bestScore) { bestScore = total; bestPots = [...potMasks]; }
  };

  // 분할 열거: 남은 재료 중 가장 낮은 비트를 포함하는 4개 조합을 고르거나, 그 재료를 버린다
  const rec = (remaining: number, chosen: number[]) => {
    evalPartition(chosen);
    if (popcount(remaining) < 4) return;
    const low = remaining & -remaining;
    // (a) 가장 낮은 재료를 버린다
    rec(remaining ^ low, chosen);
    // (b) 가장 낮은 재료를 포함하는 요리
    const rest = remaining ^ low;
    const bits: number[] = [];
    for (let b = 0; b < n; b++) if (rest & (1 << b)) bits.push(b);
    const m = bits.length;
    for (let x = 0; x < m; x++)
      for (let y = x + 1; y < m; y++)
        for (let z = y + 1; z < m; z++) {
          const q = low | (1 << bits[x]) | (1 << bits[y]) | (1 << bits[z]);
          chosen.push(q);
          rec(remaining ^ q, chosen);
          chosen.pop();
        }
  };
  rec(full, []);

  const seen = new Map<string, number>();
  const pots: PlanPot[] = bestPots.map((q) => {
    const ev = quads.get(q)!;
    const key = memoryKey(ev.recipes);
    const before = seen.get(key) ?? 0;
    seen.set(key, before + 1);
    const mult = warlyMultiplier(before);
    const uids: number[] = [];
    for (let b = 0; b < n; b++) if (q & (1 << b)) uids.push(b);
    return { uids, recipes: ev.recipes, mult, stats: scaleStats(ev.stats, mult) };
  });
  const used = bestPots.reduce((m, q) => m | q, 0);
  const discardUids: number[] = [];
  for (let b = 0; b < n; b++) if (!(used & (1 << b))) discardUids.push(b);
  return finalizePlan(round, pots, [], discardUids);
}

function finalizePlan(round: TrainerRound, pots: PlanPot[], rawUids: number[], discardUids: number[]): OptimalPlan {
  let totals = ZERO;
  for (const p of pots) totals = addStats(totals, p.stats);
  for (const u of rawUids) totals = addStats(totals, round.items[u].raw!);
  // 점수가 같은 요리는 보기 좋게 점수 내림차순
  pots.sort((a, b) => scoreOf(b.stats, round.weights) - scoreOf(a.stats, round.weights));
  return { pots, rawUids, discardUids, totals, score: scoreOf(totals, round.weights) };
}

/** 종류별 개수 DP의 상태 수 상한 — 넘으면 `createRound`가 다시 뽑는다. 40만 상태 ≈ 0.6초 (20개 평균은 20만) */
export const MAX_DP_STATES = 400_000;

export function multisetStateCount(ids: readonly string[]): number {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  let total = 1;
  for (const c of counts.values()) total *= c + 1;
  return total;
}

interface TypeInfo {
  ingredient: CookpotIngredient;
  uids: number[];
  count: number;
  raw: number; // 생식 점수 (0 이하면 0 = 안 먹음)
  rawOk: boolean;
}

/**
 * 일반 모드 — 종류별 개수 DP. 같은 재료는 구분할 이유가 없어서 상태를 "종류별 남은 개수"
 * (혼합 기수 정수)로 두면 상태 수가 2^N 대신 Π(개수+1)이 된다 — 24개도 보통 수십만 상태.
 * 전이: 가장 낮은 종류 하나를 (버림 | 생식 | 나머지에서 3개 골라 요리). 요리끼리 독립일 때만 (월리 제외).
 */
function solveMultisetDp(round: TrainerRound): OptimalPlan {
  // 종류 묶기 (id 순 — seed가 같으면 결과도 같게)
  const byId = new Map<string, TypeInfo>();
  for (const it of round.items) {
    let t = byId.get(it.ingredient.id);
    if (!t) {
      const rawScore = it.raw ? scoreOf(it.raw, round.weights) : 0;
      t = { ingredient: it.ingredient, uids: [], count: 0, raw: Math.max(0, rawScore), rawOk: it.raw !== null && rawScore > 0 };
      byId.set(it.ingredient.id, t);
    }
    t.uids.push(it.uid);
    t.count++;
  }
  const types = [...byId.values()].sort((a, b) => (a.ingredient.id < b.ingredient.id ? -1 : 1));
  const T = types.length;
  const stride = new Array<number>(T);
  let total = 1;
  for (let t = 0; t < T; t++) { stride[t] = total; total *= types[t].count + 1; }
  if (total > MAX_DP_STATES * 4) throw new Error(`[cookpot-trainer] too many DP states: ${total}`);

  // --- 쓸모 있는 4개 묶음만 미리 뽑는다 ---
  // 요리 점수가 그 4개를 각각 생식(또는 버림)한 합보다 크지 않으면 그 묶음은 절대 최적에 안 들어간다
  // (생식은 항상 가능한 독립 대안이라 지배됨). 보통 묶음의 80~90%가 여기서 걸러진다.
  // byMin[i] = 가장 낮은 종류가 i인 묶음들. 각 묶음은 (code, 종류별 필요 개수 ≤4쌍)
  const byMin: { code: number; need: Int32Array; score: number }[][] = types.map(() => []);
  {
    const pick: number[] = [];
    const rec = (startType: number, left: number) => {
      if (left === 0) {
        const ings = pick.map((t) => types[t].ingredient);
        const recipes = dishFor(ings, round.station);
        const score = scoreOf(expectedStats(recipes), round.weights);
        const rawSum = pick.reduce((acc, t) => acc + types[t].raw, 0);
        if (score > rawSum + 1e-9) {
          let code = 0;
          const need = new Int32Array(8); // [type,k]×4
          let n = 0;
          for (let x = 0; x < 4; x++) {
            code += stride[pick[x]];
            if (n > 0 && need[2 * (n - 1)] === pick[x]) need[2 * (n - 1) + 1]++;
            else { need[2 * n] = pick[x]; need[2 * n + 1] = 1; n++; }
          }
          // 개수 상한을 넘는 묶음은 애초에 못 만든다
          let ok = true;
          for (let x = 0; x < n; x++) if (need[2 * x + 1] > types[need[2 * x]].count) ok = false;
          if (ok) byMin[pick[0]].push({ code, need: need.slice(0, 2 * n), score });
        }
        return;
      }
      for (let j = startType; j < T; j++) {
        pick.push(j);
        rec(j, left - 1);
        pick.pop();
      }
    };
    rec(0, 4);
  }

  const dp = new Float64Array(total);
  // choice: 0 = 버림, 1 = 생식, ≥2 = (요리에 쓴 4개 multiset 코드) + 2
  const choice = new Int32Array(total);
  const counts = new Int32Array(T);
  const decode = (state: number) => {
    let rem = state;
    for (let t = T - 1; t >= 0; t--) { counts[t] = Math.floor(rem / stride[t]); rem -= counts[t] * stride[t]; }
  };

  for (let state = 1; state < total; state++) {
    decode(state);
    let i = 0;
    while (counts[i] === 0) i++;
    const rest = state - stride[i];
    let best = dp[rest];
    let bestChoice = 0;
    if (types[i].rawOk) {
      const v = types[i].raw + dp[rest];
      if (v > best) { best = v; bestChoice = 1; }
    }
    const quads = byMin[i];
    for (let q = 0; q < quads.length; q++) {
      const { need, code, score } = quads[q];
      let ok = true;
      for (let x = 0; x < need.length; x += 2) if (counts[need[x]] < need[x + 1]) { ok = false; break; }
      if (!ok) continue;
      const v = score + dp[state - code];
      if (v > best) { best = v; bestChoice = code + 2; }
    }
    dp[state] = best;
    choice[state] = bestChoice;
  }

  // 역추적 — 각 종류의 uid를 앞에서부터 배정
  const next = types.map(() => 0);
  const takeUid = (t: number) => types[t].uids[next[t]++];
  const pots: PlanPot[] = [];
  const rawUids: number[] = [];
  const discardUids: number[] = [];
  let state = total - 1;
  while (state > 0) {
    decode(state);
    let i = 0;
    while (counts[i] === 0) i++;
    const c = choice[state];
    if (c === 0) { discardUids.push(takeUid(i)); state -= stride[i]; }
    else if (c === 1) { rawUids.push(takeUid(i)); state -= stride[i]; }
    else {
      const code = c - 2;
      const uids: number[] = [];
      let r = code;
      for (let t = T - 1; t >= 0; t--) {
        const k = Math.floor(r / stride[t]);
        r -= k * stride[t];
        for (let x = 0; x < k; x++) uids.push(takeUid(t));
      }
      const recipes = dishFor(uids.map((u) => round.items[u].ingredient), round.station);
      pots.push({ uids, recipes, mult: 1, stats: expectedStats(recipes) });
      state -= code;
    }
  }
  return finalizePlan(round, pots, rawUids, discardUids);
}

export function solveOptimal(round: TrainerRound): OptimalPlan {
  return round.config.warly ? solveEnum(round) : solveMultisetDp(round);
}

/** 테스트용 — 자리 기준 비트마스크 DP (N ≤ 16). 종류별 DP와 결과가 같아야 한다 */
export const _solveBitmaskDp = solveDp;

// ---------------------------------------------------------------------------
// 결과 비교
// ---------------------------------------------------------------------------

export interface TrainerResult {
  playerTotals: Stats;
  playerScore: number;
  optimal: OptimalPlan;
  /** 0–100 (최적이 0 이하면 플레이어가 0 이상일 때 100) */
  percent: number;
}

export function evaluateRound(round: TrainerRound, actions: TrainerAction[]): TrainerResult {
  const playerTotals = totalsOf(actions);
  const playerScore = scoreOf(playerTotals, round.weights);
  const optimal = solveOptimal(round);
  let percent: number;
  if (optimal.score <= 0) percent = playerScore >= optimal.score ? 100 : 0;
  else percent = Math.max(0, Math.min(100, (playerScore / optimal.score) * 100));
  return { playerTotals, playerScore, optimal, percent };
}

/** 재료 풀 전체 (디버그·도움말) */
export function trainerPoolIngredients(): CookpotIngredient[] {
  const set = new Set(TRAINER_POOL_IDS);
  return cookpotIngredients.filter((i) => set.has(i.id));
}
