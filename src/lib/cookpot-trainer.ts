// ---------------------------------------------------------------------------
// Crock Pot Trainer — 미니게임 엔진 (#128)
//
// 랜덤 재료 N개를 받아 제한 시간 안에 "요리솥에 넣어 끓이기 / 생으로 먹기 / 모닥불에 굽기 / 버리기"로
// 스탯 이득을 최대화하고, 끝나면 최적해(전수 탐색)와 비교한다. 잔가지는 지급하지 않고 언제든 무제한으로
// 솥에 넣을 수 있다 (게임에서 가장 흔한 채움 재료라서, #135).
//
// 게임 수치 출처:
//  - 요리 판정: `cookpot-engine.ts` `simulate()` (preparedfoods.lua 이식)
//  - 생식 수치: `raw-foods.ts` (prefab edible 컴포넌트, 캐릭터 보정 전 기본값). 구운 재료는 같은 파일의
//          `cookedFoods` — 요리솥 재료 id(`<원재료>_cooked`, cooking.lua `AddIngredientValues`)와 같다
//  - 월리: eater.lua `PrefersToEat` — `preparedfood` 태그 없는 음식은 먹지 못한다.
//          foodmemory.lua — 같은 요리를 `WARLY_SAME_OLD_COOLDOWN`(2일) 안에 다시 먹으면
//          `WARLY_SAME_OLD_MULTIPLIERS = { .9, .8, .65, .5, .3 }` 배율 (체력·허기·정신력 모두,
//          eater.lua `base_mult`). 한 라운드는 2일 안이라고 가정한다.
// ---------------------------------------------------------------------------

import { cookpotIngredients, getIngredientById, type CookpotIngredient } from "@/data/cookpot-ingredients";
import { rawFoods, cookedFoods, type RawFood } from "@/data/raw-foods";
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
 * 20개는 상태 20만·0.3초 안팎이다 (2026-10-20 실측). 굽기·잔가지가 들어간 뒤(#135) 20개는 평균 0.35초·
 * 최악 0.9초다 (2026-10-24, 30라운드). 더 열려면 Web Worker가 필요하다.
 */
export const INGREDIENT_COUNTS = [8, 12, 16, 20] as const;
export type IngredientCount = (typeof INGREDIENT_COUNTS)[number];

/** 0 = 무제한 */
export const TIME_LIMITS = [0, 60, 120, 180] as const;
export type TimeLimit = (typeof TIME_LIMITS)[number];

/**
 * 월리 모드 상한 16: 기억 배율 때문에 분기한정 탐색(`solveWarlyBnB`)을 쓰는데 16개 평균 47ms·최악 160ms,
 * 20개는 평균 2.8초·최악 75초다 (2026-10-20, 40라운드 실측). 굽기·잔가지 뒤(#135) 16개 평균 0.17초·최악 0.32초
 */
export const WARLY_MAX_INGREDIENTS: IngredientCount = 16;

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

/** 재료의 한 형태 — 지급된 그대로, 또는 모닥불에 구운 것 */
export interface ItemForm {
  ingredient: CookpotIngredient;
  /** 그 형태로 먹을 때 수치. 없으면 먹을 수 없음 또는 월리. */
  raw: Stats | null;
}

/** 라운드에 지급된 재료 한 개. 같은 재료가 여러 개일 수 있어 uid로 구분한다. */
export interface TrainerItem extends ItemForm {
  uid: number;
  /** 모닥불에 구운 형태 — 구울 수 없으면(이미 구움·꿀·버터·얼음) null. 굽기는 되돌릴 수 없다 */
  roasted: ItemForm | null;
}

/** 솥 칸의 잔가지 — 재료 uid 자리에 넣는 표식 (무제한이라 uid가 없다) */
export const TWIG_UID = -1;

export type TrainerAction =
  | {
      type: "cook";
      /** 지급된 재료만 (잔가지 제외) */
      uids: number[];
      /** 솥에 넣은 4개 그대로 — 구운 형태·잔가지 포함 */
      ingredients: CookpotIngredient[];
      recipe: CookingRecipe;
      /** 같은 우선순위 레시피가 여럿이라 무작위로 골랐을 때 */
      wasRandom: boolean;
      /** 월리 기억 배율 (아니면 1) */
      mult: number;
      stats: Stats;
    }
  | { type: "raw"; uid: number; ingredient: CookpotIngredient; stats: Stats };

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
  /** 지급된 재료만 (잔가지 제외) */
  uids: number[];
  /** 솥에 넣는 4개 — 구운 형태·잔가지 포함 */
  ingredients: CookpotIngredient[];
  /** 기대값 기준 — 랜덤 결과면 후보 전부 */
  recipes: CookingRecipe[];
  mult: number;
  stats: Stats;
}

export interface PlanRaw {
  uid: number;
  /** 먹는 형태 (구워서 먹으면 구운 재료) */
  ingredient: CookpotIngredient;
  stats: Stats;
}

export interface OptimalPlan {
  pots: PlanPot[];
  raws: PlanRaw[];
  discardUids: number[];
  totals: Stats;
  score: number;
}

// ---------------------------------------------------------------------------
// 재료 풀 — 게임 초중반에 흔히 손에 들어오는 요리솥 재료만. 가중치가 곧 출현 빈도.
// 생식 수치가 `raw-foods.ts`에 있는 것만 넣는다(자동 추출) — 생식 수치를 손으로 적지 않기 위해서다.
// 구울 수 있는 재료는 구운 수치(`cookedFoods`)도 있어야 한다. 잔가지는 풀에 없다 (무제한, `TWIG_UID`).
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
  // 알·감미료·기타 (잔가지는 무제한 공급이라 풀에서 뺐다, #135)
  ["bird_egg", 6], ["honey", 6], ["butter", 2], ["ice", 4],
  // 이미 구워진 채로 받은 것 — 사냥·채집 뒤 모닥불을 거쳐 온 셈. 다시 구울 수는 없다 (#135)
  ["meat_cooked", 1], ["smallmeat_cooked", 1], ["drumstick_cooked", 1], ["fishmeat_small_cooked", 1],
  ["bird_egg_cooked", 1], ["berries_cooked", 1], ["carrot_cooked", 1],
];

const rawById = new Map<string, RawFood>([...rawFoods, ...cookedFoods].map((r) => [r.id, r]));

/** 모닥불에 구우면 되는 요리솥 재료 — cooking.lua가 `<id>_cooked`로 만든 변형이 있으면 */
function roastTarget(ing: CookpotIngredient): CookpotIngredient | null {
  if (ing.tags.precook) return null;
  return getIngredientById(`${ing.id}_cooked`) ?? null;
}

function assertPool() {
  for (const [id] of POOL) {
    const ing = getIngredientById(id);
    if (!ing) throw new Error(`[cookpot-trainer] unknown pool ingredient: ${id}`);
    if (!rawById.has(id)) throw new Error(`[cookpot-trainer] pool ingredient without raw stats: ${id}`);
    const roast = roastTarget(ing);
    if (roast && !rawById.has(roast.id)) throw new Error(`[cookpot-trainer] pool ingredient without cooked stats: ${roast.id}`);
  }
}
assertPool();

/** 무제한 잔가지 */
export const TWIG: CookpotIngredient = (() => {
  const twig = getIngredientById("twigs");
  if (!twig) throw new Error("[cookpot-trainer] twigs missing from cookpot ingredients");
  return twig;
})();

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
    const roast = roastTarget(ingredient);
    return {
      uid: i,
      ingredient,
      raw: config.warly ? null : rawStatsOf(ingredient),
      roasted: roast ? { ingredient: roast, raw: config.warly ? null : rawStatsOf(roast) } : null,
    };
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

function memoryKey(recipes: CookingRecipe[]): string {
  return recipes.map((r) => r.id).join("|");
}

function finalizePlan(round: TrainerRound, pots: PlanPot[], raws: PlanRaw[], discardUids: number[]): OptimalPlan {
  let totals = ZERO;
  for (const p of pots) totals = addStats(totals, p.stats);
  for (const r of raws) totals = addStats(totals, r.stats);
  // 점수가 같은 요리는 보기 좋게 점수 내림차순
  pots.sort((a, b) => scoreOf(b.stats, round.weights) - scoreOf(a.stats, round.weights));
  return { pots, raws, discardUids, totals, score: scoreOf(totals, round.weights) };
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

/** 지급된 재료 한 종류 — 같은 재료는 구분할 이유가 없어 개수로만 다룬다 */
interface TypeInfo {
  uids: number[];
  count: number;
  /** [지급된 그대로, 구운 것?] */
  forms: ItemForm[];
  /** 한 개를 따로 먹을 때 가장 좋은 점수(0 이하면 0 = 안 먹음)와 그 형태 */
  bestRaw: number;
  bestRawForm: number;
}

/** 쓸모 있는 솥 하나 — 지급 재료 1~4개(형태 지정) + 나머지는 잔가지 */
interface Quad {
  /** 종류별 개수 상태에서 빼는 값 */
  code: number;
  /** [type, k] 쌍 — 상태가 이만큼 남아 있어야 만들 수 있다 */
  need: Int32Array;
  /** 솥에 넣는 지급 재료의 (종류, 형태) — 종류 순 */
  slots: { type: number; form: number }[];
  twigs: number;
  recipes: CookingRecipe[];
  stats: Stats;
  score: number;
  dish: string;
}

interface Problem {
  types: TypeInfo[];
  stride: number[];
  total: number;
  /** byMin[i] = 가장 낮은 종류가 i인 솥들 */
  byMin: Quad[][];
}

/**
 * 솥 후보 열거. (종류, 형태) 슬롯에서 1~4개를 중복 조합으로 고르고 모자란 자리는 잔가지로 채운다.
 * 같은 종류 조합(code)이면 형태 배정만 다른 후보 중 가장 좋은 것만 남긴다 — 단 `perDish`(월리)면
 * 기억 배율이 요리 id에 달려 있어서 요리별로 따로 남긴다.
 * `keep(score, slots)`가 false인 후보는 버린다 (지배되는 솥 가지치기).
 */
function buildProblem(
  round: TrainerRound,
  perDish: boolean,
  keep: (score: number, slots: { type: number; form: number }[], types: TypeInfo[]) => boolean,
): Problem {
  // 종류 묶기 (id 순 — seed가 같으면 결과도 같게)
  const byId = new Map<string, TypeInfo>();
  for (const it of round.items) {
    let t = byId.get(it.ingredient.id);
    if (!t) {
      const forms: ItemForm[] = [{ ingredient: it.ingredient, raw: it.raw }];
      if (it.roasted) forms.push(it.roasted);
      let bestRaw = 0;
      let bestRawForm = -1;
      forms.forEach((f, i) => {
        const v = f.raw ? scoreOf(f.raw, round.weights) : 0;
        if (f.raw && v > bestRaw) { bestRaw = v; bestRawForm = i; }
      });
      t = { uids: [], count: 0, forms, bestRaw, bestRawForm };
      byId.set(it.ingredient.id, t);
    }
    t.uids.push(it.uid);
    t.count++;
  }
  const types = [...byId.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([, t]) => t);
  const T = types.length;
  const stride = new Array<number>(T);
  let total = 1;
  for (let t = 0; t < T; t++) { stride[t] = total; total *= types[t].count + 1; }
  if (total > MAX_DP_STATES * 4) throw new Error(`[cookpot-trainer] too many DP states: ${total}`);

  const slotList: { type: number; form: number }[] = [];
  for (let t = 0; t < T; t++) for (let f = 0; f < types[t].forms.length; f++) slotList.push({ type: t, form: f });

  const best = new Map<string, Quad>();
  const pick: number[] = []; // slotList 인덱스, 오름차순(중복 허용)
  const used = new Int32Array(T);
  const consider = () => {
    const slots = pick.map((s) => slotList[s]);
    const twigs = 4 - slots.length;
    const ings = slots.map((s) => types[s.type].forms[s.form].ingredient);
    for (let k = 0; k < twigs; k++) ings.push(TWIG);
    const recipes = dishFor(ings, round.station);
    const stats = expectedStats(recipes);
    const score = scoreOf(stats, round.weights);
    if (!keep(score, slots, types)) return;
    let code = 0;
    const need: number[] = [];
    for (const s of slots) {
      code += stride[s.type];
      if (need.length > 0 && need[need.length - 2] === s.type) need[need.length - 1]++;
      else need.push(s.type, 1);
    }
    const dish = memoryKey(recipes);
    const key = perDish ? `${code}:${dish}` : String(code);
    const prev = best.get(key);
    if (!prev || score > prev.score) {
      best.set(key, { code, need: Int32Array.from(need), slots, twigs, recipes, stats, score, dish });
    }
  };
  const rec = (start: number) => {
    if (pick.length > 0) consider();
    if (pick.length === 4) return;
    for (let s = start; s < slotList.length; s++) {
      const t = slotList[s].type;
      if (used[t] >= types[t].count) continue;
      used[t]++;
      pick.push(s);
      rec(s);
      pick.pop();
      used[t]--;
    }
  };
  rec(0);

  const byMin: Quad[][] = types.map(() => []);
  for (const q of best.values()) byMin[q.slots[0].type].push(q);
  // 점수 내림차순 — 월리 분기한정이 좋은 해를 먼저 찾아 가지를 많이 친다
  for (const list of byMin) list.sort((a, b) => b.score - a.score);
  return { types, stride, total, byMin };
}

/** 솥 후보의 uid 배정 — 각 종류의 uid를 앞에서부터 */
function makeTaker(types: TypeInfo[]) {
  const next = types.map(() => 0);
  return {
    take: (t: number) => types[t].uids[next[t]++],
    rest: () => {
      const out: number[] = [];
      for (let t = 0; t < types.length; t++) while (next[t] < types[t].uids.length) out.push(types[t].uids[next[t]++]);
      return out;
    },
  };
}

function potOf(q: Quad, types: TypeInfo[], take: (t: number) => number, mult: number): PlanPot {
  const uids = q.slots.map((s) => take(s.type));
  const ingredients = q.slots.map((s) => types[s.type].forms[s.form].ingredient);
  for (let k = 0; k < q.twigs; k++) ingredients.push(TWIG);
  return { uids, ingredients, recipes: q.recipes, mult, stats: scaleStats(q.stats, mult) };
}

function makeDecoder(p: Problem) {
  const T = p.types.length;
  const counts = new Int32Array(T);
  const decode = (state: number) => {
    let rem = state;
    for (let t = T - 1; t >= 0; t--) { counts[t] = Math.floor(rem / p.stride[t]); rem -= counts[t] * p.stride[t]; }
  };
  const lowest = () => { let i = 0; while (counts[i] === 0) i++; return i; };
  const feasible = (q: Quad) => {
    for (let x = 0; x < q.need.length; x += 2) if (counts[q.need[x]] < q.need[x + 1]) return false;
    return true;
  };
  return { decode, lowest, feasible };
}

/**
 * 일반 모드 — 종류별 개수 DP. 상태를 "종류별 남은 개수"(혼합 기수 정수)로 두면 상태 수가 2^N 대신
 * Π(개수+1)이 된다. 전이: 가장 낮은 종류 하나를 (버림 | 따로 먹기(생/구워서) | 그 종류를 포함한 솥).
 * 솥은 나머지 지급 재료 0~3개 + 잔가지. 요리끼리 독립일 때만 (월리 제외).
 */
function solveMultisetDp(round: TrainerRound): OptimalPlan {
  // 솥 점수가 그 재료들을 각각 따로 먹은 합보다 크지 않으면 절대 최적에 안 들어간다
  // (따로 먹기는 항상 가능한 독립 대안이라 지배됨). 보통 후보의 대부분이 여기서 걸러진다.
  const prob = buildProblem(round, false, (score, slots, types) =>
    score > slots.reduce((acc, s) => acc + types[s.type].bestRaw, 0) + 1e-9);
  const { types, stride, total, byMin } = prob;
  const { decode, lowest, feasible } = makeDecoder(prob);

  const dp = new Float64Array(total);
  // choice: 0 = 버림, 1 = 따로 먹기, ≥2 = byMin[i] 인덱스 + 2
  const choice = new Int32Array(total);
  for (let state = 1; state < total; state++) {
    decode(state);
    const i = lowest();
    let best = dp[state - stride[i]];
    let bestChoice = 0;
    if (types[i].bestRawForm >= 0) {
      const v = types[i].bestRaw + dp[state - stride[i]];
      if (v > best) { best = v; bestChoice = 1; }
    }
    const quads = byMin[i];
    for (let q = 0; q < quads.length; q++) {
      if (!feasible(quads[q])) continue;
      const v = quads[q].score + dp[state - quads[q].code];
      if (v > best) { best = v; bestChoice = q + 2; }
    }
    dp[state] = best;
    choice[state] = bestChoice;
  }

  // 역추적
  const { take, rest } = makeTaker(types);
  const pots: PlanPot[] = [];
  const raws: PlanRaw[] = [];
  const discardUids: number[] = [];
  let state = total - 1;
  while (state > 0) {
    decode(state);
    const i = lowest();
    const c = choice[state];
    if (c === 0) { discardUids.push(take(i)); state -= stride[i]; }
    else if (c === 1) {
      const form = types[i].forms[types[i].bestRawForm];
      raws.push({ uid: take(i), ingredient: form.ingredient, stats: form.raw! });
      state -= stride[i];
    } else {
      const q = byMin[i][c - 2];
      pots.push(potOf(q, types, take, 1));
      state -= q.code;
    }
  }
  discardUids.push(...rest());
  return finalizePlan(round, pots, raws, discardUids);
}

/**
 * 월리 모드 — 종류별 개수 상태 + "지금까지 만든 요리별 횟수"로 분기한정 DFS.
 * 같은 요리를 또 먹으면 배율이 줄어 요리끼리 독립이 아니지만, 서로 영향을 주는 건 **같은 요리 id**뿐이다.
 * 남은 재료 중 가장 낮은 종류를 "버림 | 그 종류를 포함한 솥" 둘 중 하나로 처리하는 정규 순서라 같은 분할을
 * 두 번 세지 않는다. 생식·구워 먹기는 불가(PrefersToEat) — 굽기는 솥 재료를 바꾸는 용도로만 쓴다.
 */
function solveWarlyBnB(round: TrainerRound): OptimalPlan {
  // 생식 대안이 없으니 점수 > 0이면 후보. 같은 종류 조합이라도 요리가 다르면 따로 둔다 (기억 배율)
  const prob = buildProblem(round, true, (score) => score > 1e-9);
  const { types, stride, total, byMin } = prob;
  const { decode, lowest, feasible } = makeDecoder(prob);

  // 상한: 기억 배율을 무시한 종류별 개수 DP. 배율은 점수를 깎기만 하므로 bound[state] ≥ 실제 최대
  const bound = new Float64Array(total);
  for (let state = 1; state < total; state++) {
    decode(state);
    const i = lowest();
    let best = bound[state - stride[i]];
    const quads = byMin[i];
    for (let q = 0; q < quads.length; q++) {
      if (!feasible(quads[q])) continue;
      const v = quads[q].score + bound[state - quads[q].code];
      if (v > best) best = v;
    }
    bound[state] = best;
  }

  let bestScore = 0;
  let bestPath: Quad[] = [];
  const path: Quad[] = [];
  const made = new Map<string, number>();
  const dfs = (state: number, acc: number) => {
    if (acc > bestScore) { bestScore = acc; bestPath = [...path]; }
    if (state === 0 || acc + bound[state] <= bestScore + 1e-9) return;
    decode(state);
    const i = lowest();
    const quads = byMin[i];
    for (let q = 0; q < quads.length; q++) {
      const quad = quads[q];
      decode(state); // 재귀가 counts를 덮어쓰므로 복원
      if (!feasible(quad)) continue;
      const before = made.get(quad.dish) ?? 0;
      const gain = quad.score * warlyMultiplier(before);
      // 이 솥을 써도 상한을 못 넘기면 건너뜀 (점수순이지만 배율이 달라 break는 못 한다)
      if (acc + gain + bound[state - quad.code] <= bestScore + 1e-9) continue;
      made.set(quad.dish, before + 1);
      path.push(quad);
      dfs(state - quad.code, acc + gain);
      path.pop();
      if (before === 0) made.delete(quad.dish); else made.set(quad.dish, before);
    }
    // 버림
    dfs(state - stride[i], acc);
  };
  dfs(total - 1, 0);

  // 복원 — 경로 순서대로 uid 배정, 배율은 같은 요리 등장 순
  const { take, rest } = makeTaker(types);
  const seen = new Map<string, number>();
  const pots: PlanPot[] = bestPath.map((q) => {
    const before = seen.get(q.dish) ?? 0;
    seen.set(q.dish, before + 1);
    return potOf(q, types, take, warlyMultiplier(before));
  });
  return finalizePlan(round, pots, [], rest());
}

export function solveOptimal(round: TrainerRound): OptimalPlan {
  return round.config.warly ? solveWarlyBnB(round) : solveMultisetDp(round);
}

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
