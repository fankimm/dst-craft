// ---------------------------------------------------------------------------
// Crock Pot Simulator — Simulation Engine
// Ported from DST preparedfoods.lua / preparedfoods_warly.lua
// ---------------------------------------------------------------------------

import { cookingRecipes, type CookingRecipe } from "@/data/recipes";
import { cookpotIngredients, type CookpotIngredient, type IngredientTag } from "@/data/cookpot-ingredients";
import { cookpotReachableSingle } from "@/data/cookpot-reachable";

export type Station = "cookpot" | "portablecookpot";

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type N = Record<string, number>; // names bag (ingredient counts)
type T = Record<string, number>; // tags bag (summed tag values)

// ---------------------------------------------------------------------------
// Recipe test functions (Lua → TypeScript)
// Each returns true if the 4 ingredients satisfy the recipe.
// n = ingredient name counts, t = summed tag values
// ---------------------------------------------------------------------------

const recipeTests: Record<string, (n: N, t: T) => boolean> = {
  // ======================== Cookpot recipes ========================

  asparagussoup: (n, t) =>
    n.asparagus + n.asparagus_cooked >= 1 && t.veggie > 2 && !t.meat && !t.inedible,

  baconeggs: (_, t) =>
    t.egg > 1 && t.meat > 1 && !t.veggie,

  bananajuice: (n, t) =>
    n.cave_banana + n.cave_banana_cooked >= 2 && !t.meat && !t.fish && !t.monster,

  bananapop: (n, t) =>
    n.cave_banana + n.cave_banana_cooked >= 1 && t.frozen >= 1 && n.twigs >= 1 && !t.meat && !t.fish,

  barnaclinguine: (n, t) =>
    n.barnacle + n.barnacle_cooked >= 2 && t.veggie >= 2,

  barnaclepita: (n, t) =>
    n.barnacle + n.barnacle_cooked >= 1 && t.veggie >= 0.5,

  barnaclesushi: (n, t) =>
    n.barnacle + n.barnacle_cooked >= 1 &&
    (!!n.kelp || !!n.kelp_cooked) &&
    t.egg >= 1,

  barnaclestuffedfishhead: (n, t) =>
    n.barnacle + n.barnacle_cooked >= 1 && t.fish >= 1.25,

  beefalofeed: (_, t) =>
    t.inedible > 0 && !t.monster && !t.meat && !t.fish && !t.egg && !t.fat && !t.dairy && !t.magic,

  beefalotreat: (n, t) =>
    t.inedible > 0 && t.seed > 0 &&
    n.forgetmelots + n.forgetmelots_dried >= 1 &&
    !t.monster && !t.meat && !t.fish && !t.egg && !t.fat && !t.dairy && !t.magic,

  bonestew: (_, t) =>
    t.meat >= 3 && !t.inedible,

  bunnystew: (_, t) =>
    t.frozen >= 2 && t.meat > 0 && t.meat < 1 && !t.inedible,

  butterflymuffin: (n, t) =>
    (!!n.butterflywings || !!n.moonbutterflywings) && !t.meat && t.veggie >= 0.5,

  californiaroll: (n, t) =>
    n.kelp + n.kelp_cooked + n.kelp_dried === 2 && t.fish >= 1,

  ceviche: (_, t) =>
    t.fish >= 2 && t.frozen > 0 && !t.inedible && !t.egg,

  dragonpie: (n, t) =>
    n.dragonfruit + n.dragonfruit_cooked >= 1 && !t.meat,

  figatoni: (n, t) =>
    n.fig + n.fig_cooked >= 1 && t.veggie >= 2 && !t.meat,

  figkabab: (n, t) =>
    n.fig + n.fig_cooked >= 1 && n.twigs >= 1 && t.meat >= 1 && t.monster <= 1,

  fishsticks: (n, t) =>
    t.fish > 0 && n.twigs >= 1 && t.inedible <= 1,

  fishtacos: (n, t) =>
    t.fish > 0 && (!!n.corn || !!n.corn_cooked || !!n.oceanfish_small_5_inv || !!n.oceanfish_medium_5_inv),

  flowersalad: (n, t) =>
    n.cactus_flower >= 1 && t.veggie >= 2 && !t.meat && !t.inedible && !t.egg && !t.sweetener && !t.fruit,

  frogglebunwich: (n, t) =>
    n.froglegs + n.froglegs_cooked >= 1 && t.veggie >= 0.5,

  frognewton: (n) =>
    n.fig + n.fig_cooked >= 1 && n.froglegs + n.froglegs_cooked >= 1,

  frozenbananadaiquiri: (n, t) =>
    n.cave_banana + n.cave_banana_cooked >= 1 && t.frozen >= 1 && !t.meat && !t.fish,

  fruitmedley: (_, t) =>
    t.fruit >= 3 && !t.meat && !t.veggie,

  guacamole: (n, t) =>
    !!n.mole && (!!n.rock_avocado_fruit_ripe || !!n.cactus_meat) && !t.fruit,

  honeyham: (n, t) =>
    n.honey >= 1 && t.meat > 1.5 && !t.inedible,

  honeynuggets: (n, t) =>
    n.honey >= 1 && t.meat > 0 && t.meat <= 1.5 && !t.inedible,

  hotchili: (_, t) =>
    t.meat >= 1.5 && t.veggie >= 1.5,

  icecream: (_, t) =>
    t.frozen > 0 && t.dairy > 0 && t.sweetener > 0 && !t.meat && !t.veggie && !t.inedible && !t.egg,

  jammypreserves: (_, t) =>
    t.fruit > 0 && !t.meat && !t.veggie && !t.inedible,

  jellybean: (n, t) =>
    n.royal_jelly >= 1 && !t.inedible && !t.monster,

  justeggs: (_, t) =>
    t.egg >= 3,

  kabobs: (n, t) =>
    t.meat > 0 && n.twigs >= 1 && t.monster <= 1 && t.inedible <= 1,

  koalefig_trunk: (n) =>
    n.trunk_summer + n.trunk_winter + n.trunk_cooked >= 1 &&
    n.fig + n.fig_cooked >= 1,

  leafloaf: (n) =>
    n.plantmeat + n.plantmeat_cooked >= 2,

  leafymeatburger: (n, t) =>
    n.plantmeat + n.plantmeat_cooked >= 1 &&
    n.onion + n.onion_cooked >= 1 &&
    t.veggie >= 2,

  leafymeatsouffle: (n, t) =>
    n.plantmeat + n.plantmeat_cooked >= 2 && t.sweetener >= 2,

  lobsterbisque: (n, t) =>
    !!n.wobster_sheller_land && t.frozen > 0,

  lobsterdinner: (n, t) =>
    !!n.wobster_sheller_land && n.butter >= 1 && t.meat >= 1 && t.fish >= 1 && !t.frozen,

  mandrakesoup: (n) =>
    !!n.mandrake,

  mashedpotatoes: (n, t) =>
    n.potato + n.potato_cooked >= 2 &&
    n.garlic + n.garlic_cooked >= 1 &&
    !t.meat && !t.inedible,

  meatballs: (_, t) =>
    t.meat > 0 && !t.inedible,

  meatysalad: (n, t) =>
    n.plantmeat + n.plantmeat_cooked >= 1 && t.veggie >= 3,

  monsterlasagna: (_, t) =>
    t.monster >= 2 && !t.inedible,

  pepperpopper: (n, t) =>
    n.pepper + n.pepper_cooked >= 1 && t.meat > 0 && t.meat <= 1.5 && !t.inedible,

  perogies: (_, t) =>
    t.egg > 0 && t.meat > 0 && t.veggie >= 0.5 && !t.inedible,

  potatotornado: (n, t) =>
    n.potato + n.potato_cooked >= 1 && n.twigs >= 1 &&
    t.monster <= 1 && !t.meat && t.inedible <= 2,

  powcake: (n) =>
    !!n.twigs && !!n.honey && (!!n.corn || !!n.corn_cooked || !!n.oceanfish_small_5_inv || !!n.oceanfish_medium_5_inv),

  pumpkincookie: (n, t) =>
    n.pumpkin + n.pumpkin_cooked >= 1 && t.sweetener >= 2,

  ratatouille: (_, t) =>
    !t.meat && t.veggie >= 0.5 && !t.inedible,

  salsa: (n, t) =>
    n.tomato + n.tomato_cooked >= 1 &&
    n.onion + n.onion_cooked >= 1 &&
    !t.meat && !t.inedible && !t.egg,

  seafoodgumbo: (_, t) =>
    t.fish > 2,

  shroomcake: (n) =>
    !!n.moon_cap && !!n.red_cap && !!n.blue_cap && !!n.green_cap,

  shroombait: (n) =>
    n.moon_cap >= 2 && !!n.monstermeat,

  stuffedeggplant: (n, t) =>
    n.eggplant + n.eggplant_cooked >= 1 && t.veggie > 1,

  surfnturf: (_, t) =>
    t.meat >= 2.5 && t.fish >= 1.5 && !t.frozen,

  sweettea: (n, t) =>
    n.forgetmelots + n.forgetmelots_dried >= 1 &&
    t.sweetener > 0 && t.frozen > 0 &&
    !t.monster && !t.veggie && !t.meat && !t.fish &&
    !t.egg && !t.fat && !t.dairy && !t.inedible,

  taffy: (_, t) =>
    t.sweetener >= 3 && !t.meat,

  talleggs: (n, t) =>
    !!n.tallbirdegg && t.veggie >= 1,

  trailmix: (n, t) =>
    n.acorn + n.acorn_cooked >= 1 && t.seed >= 1 &&
    (!!n.berries || !!n.berries_cooked || !!n.berries_juicy || !!n.berries_juicy_cooked) && t.fruit >= 1 &&
    !t.meat && !t.veggie && !t.egg && !t.dairy,

  turkeydinner: (n, t) =>
    n.drumstick >= 2 &&
    t.meat > 1 &&
    (t.veggie >= 0.5 || t.fruit > 0),

  unagi: (n) =>
    (!!n.cutlichen || !!n.kelp || !!n.kelp_cooked || !!n.kelp_dried) &&
    (!!n.eel || !!n.eel_cooked || !!n.pondeel),

  veggieomlet: (_, t) =>
    t.egg >= 1 && t.veggie >= 1 && !t.meat && !t.dairy,

  vegstinger: (n, t) =>
    n.asparagus + n.asparagus_cooked + n.tomato + n.tomato_cooked >= 1 &&
    t.veggie > 2 && t.frozen > 0 && !t.meat && !t.inedible && !t.egg,

  waffles: (n, t) =>
    n.butter >= 1 &&
    (!!n.berries || !!n.berries_cooked || !!n.berries_juicy || !!n.berries_juicy_cooked) &&
    t.egg > 0,

  watermelonicle: (n, t) =>
    !!n.watermelon && t.frozen > 0 && n.twigs >= 1 &&
    !t.meat && !t.veggie && !t.egg,

  wetgoop: () => true, // priority -10 fallback

  // ==================== Non-Food Cookpot Recipes ====================

  dustmeringue: (n) =>
    !!n.refined_dust,

  batnosehat: (n, t) =>
    !!n.batnose && !!n.kelp && t.dairy >= 1,

  // ==================== Portable Cookpot (Warly) ====================

  bonesoup: (n, t) =>
    n.boneshard === 2 &&
    n.onion + n.onion_cooked >= 1 &&
    t.inedible < 3,

  dragonchilisalad: (n, t) =>
    n.dragonfruit + n.dragonfruit_cooked >= 1 &&
    n.pepper + n.pepper_cooked >= 1 &&
    !t.meat && !t.inedible && !t.egg,

  freshfruitcrepes: (n, t) =>
    t.fruit >= 1.5 && n.butter >= 1 && n.honey >= 1,

  frogfishbowl: (n, t) =>
    n.froglegs + n.froglegs_cooked >= 2 && t.fish >= 1 && !t.inedible,

  gazpacho: (n, t) =>
    n.asparagus + n.asparagus_cooked >= 2 && t.frozen >= 2,

  glowberrymousse: (n, t) =>
    (!!n.wormlight || n.wormlight_lesser >= 2) &&
    t.fruit >= 2 && !t.meat && !t.inedible,

  monstertartare: (_, t) =>
    t.monster >= 2 && !t.inedible,

  moqueca: (n, t) =>
    t.fish > 0 &&
    n.onion + n.onion_cooked >= 1 &&
    n.tomato + n.tomato_cooked >= 1 &&
    !t.inedible,

  nightmarepie: (n) =>
    n.nightmarefuel === 2 &&
    n.potato + n.potato_cooked >= 1 &&
    n.onion + n.onion_cooked >= 1,

  potatosouffle: (n, t) =>
    n.potato + n.potato_cooked >= 2 && t.egg > 0 && !t.meat && !t.inedible,

  voltgoatjelly: (n, t) =>
    n.lightninggoathorn >= 1 && t.sweetener >= 2 && !t.meat,
};

// ---------------------------------------------------------------------------
// Bags
// ---------------------------------------------------------------------------
// 테스트 함수는 `n.x + n.y >= 1` 같은 합을 쓰므로 키가 없으면 NaN → 항상 false가 된다.
// 그래서 bag은 Proxy가 아니라 **알려진 키를 전부 0으로 깐 평범한 객체**다 — 열거(reachableRecipes)가
// 수백만 번 읽어서 Proxy trap 비용을 감당할 수 없다. recipeTests가 이름으로 참조하는 id는
// 모두 `cookpotIngredients`에 있어야 한다 (없으면 그 레시피는 조용히 안 나온다).

const TAG_KEYS: IngredientTag[] = [
  "fruit", "monster", "sweetener", "veggie", "meat", "fish", "egg", "decoration",
  "fat", "dairy", "inedible", "seed", "magic", "frozen", "precook", "dried",
];
const NAME_KEYS = cookpotIngredients.map((i) => i.id);
const NAME_KEY_SET = new Set(NAME_KEYS);

function zeroBag(keys: readonly string[]): Record<string, number> {
  const bag: Record<string, number> = {};
  for (const k of keys) bag[k] = 0;
  return bag;
}

const tagEntriesCache = new WeakMap<CookpotIngredient, [string, number][]>();
function tagEntries(ing: CookpotIngredient): [string, number][] {
  let e = tagEntriesCache.get(ing);
  if (!e) {
    e = Object.entries(ing.tags).filter((kv): kv is [string, number] => !!kv[1]);
    tagEntriesCache.set(ing, e);
  }
  return e;
}

/** 재료 하나를 bag에 더하거나(+1) 뺀다(-1). */
function addToBags(names: N, tags: T, ing: CookpotIngredient, sign: 1 | -1): void {
  names[ing.id] += sign;
  for (const [tag, value] of tagEntries(ing)) tags[tag] += sign * value;
}

const byPriorityDesc = (a: CookingRecipe, b: CookingRecipe) => b.priority - a.priority;
/** 스테이션별 테스트 대상 — 우선순위 내림차순 정렬 (topMatches가 첫 매치 뒤 낮은 우선순위를 통째로 건너뛴다) */
const STATION_RECIPES = {
  // portable crock pot tests ALL recipes (game behavior)
  portablecookpot: [...cookingRecipes].sort(byPriorityDesc),
  cookpot: cookingRecipes.filter((r) => r.station === "cookpot").sort(byPriorityDesc),
} satisfies Record<string, CookingRecipe[]>;

function recipesForStation(station: Station): CookingRecipe[] {
  return STATION_RECIPES[station];
}

/**
 * 매치된 레시피 중 우선순위 최상위만 — 게임이 이 중에서 무작위로 하나를 고른다.
 * `recipes`는 우선순위 내림차순이어야 한다: 첫 매치 이후 더 낮은 우선순위는 테스트 없이 끝낸다.
 */
function topMatches(names: N, tags: T, recipes: CookingRecipe[]): CookingRecipe[] {
  const top: CookingRecipe[] = [];
  for (const recipe of recipes) {
    if (top.length && recipe.priority < top[0].priority) break;
    const testFn = recipeTests[recipe.id];
    if (testFn && testFn(names, tags)) top.push(recipe);
  }
  return top;
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

export interface SimulationResult {
  recipes: CookingRecipe[];
  isRandom: boolean;
}

/**
 * Simulate crock pot cooking with 4 ingredients.
 *
 * @param ingredients — exactly 4 ingredients
 * @param station — "cookpot" or "portablecookpot"
 *   cookpot: only cookpot recipes
 *   portablecookpot: cookpot + portablecookpot recipes (game behavior)
 */
export function simulate(
  ingredients: CookpotIngredient[],
  station: Station,
): SimulationResult {
  if (ingredients.length !== 4) {
    return { recipes: [], isRandom: false };
  }

  const names = zeroBag(NAME_KEYS);
  const tags = zeroBag(TAG_KEYS);
  for (const ing of ingredients) addToBags(names, tags, ing, 1);

  const topRecipes = topMatches(names, tags, recipesForStation(station));
  return {
    recipes: topRecipes,
    isRandom: topRecipes.length > 1,
  };
}

// ---------------------------------------------------------------------------
// Partial pot — which dishes can this still become? (#137)
// ---------------------------------------------------------------------------

/**
 * 테스트 함수가 `n.<id>`로 직접 보는 재료 id. 여기 없는 재료는 태그로만 구분되므로
 * 태그가 같은 것끼리 한 묶음으로 열거해도 결과가 같다 (열거 수를 수십 배 줄인다).
 *
 * 레시피 테스트에 새 `n.<id>`를 쓰면 **여기에도 추가**해야 한다 — 빠지면 그 재료가 같은 태그의
 * 다른 재료와 합쳐져 후보에서 빠질 수 있다. 개발 모드에선 아래 self-check가 소스를 읽어 누락을 throw한다.
 */
const NAME_REFERENCED_IDS = new Set<string>([
  "asparagus", "asparagus_cooked", "cave_banana", "cave_banana_cooked", "twigs",
  "barnacle", "barnacle_cooked", "kelp", "kelp_cooked", "kelp_dried",
  "forgetmelots", "forgetmelots_dried", "butterflywings", "moonbutterflywings",
  "dragonfruit", "dragonfruit_cooked", "fig", "fig_cooked",
  "corn", "corn_cooked", "oceanfish_small_5_inv", "oceanfish_medium_5_inv",
  "cactus_flower", "froglegs", "froglegs_cooked", "mole", "rock_avocado_fruit_ripe", "cactus_meat",
  "honey", "royal_jelly", "trunk_summer", "trunk_winter", "trunk_cooked",
  "plantmeat", "plantmeat_cooked", "onion", "onion_cooked", "wobster_sheller_land", "butter",
  "mandrake", "potato", "potato_cooked", "garlic", "garlic_cooked", "pepper", "pepper_cooked",
  "pumpkin", "pumpkin_cooked", "tomato", "tomato_cooked",
  "moon_cap", "red_cap", "blue_cap", "green_cap", "monstermeat",
  "eggplant", "eggplant_cooked", "tallbirdegg", "acorn", "acorn_cooked",
  "berries", "berries_cooked", "berries_juicy", "berries_juicy_cooked", "drumstick",
  "cutlichen", "eel", "eel_cooked", "pondeel", "watermelon",
  "refined_dust", "batnose", "boneshard", "wormlight", "wormlight_lesser",
  "nightmarefuel", "lightninggoathorn",
]);

if (process.env.NODE_ENV !== "production") {
  // 소스에서 `<첫 인자>.<id>`를 긁어 위 목록과 대조. 미니파이 전 소스에서만 믿을 수 있어 개발 모드 한정
  const missing = new Set<string>();
  for (const fn of Object.values(recipeTests)) {
    const src = fn.toString();
    const param = /^\(?\s*([A-Za-z_$][\w$]*)/.exec(src)?.[1];
    if (!param || param === "_") continue;
    for (const m of src.matchAll(new RegExp(`\\b${param}\\.([a-z0-9_]+)`, "g"))) {
      if (!NAME_REFERENCED_IDS.has(m[1])) missing.add(m[1]);
      if (!NAME_KEY_SET.has(m[1])) missing.add(`${m[1]} (not an ingredient)`);
    }
  }
  if (missing.size) {
    throw new Error(`cookpot-engine: NAME_REFERENCED_IDS에 없는 재료 참조: ${[...missing].join(", ")}`);
  }
}

/** 테스트 결과가 같은 재료를 하나로 묶은 대표 목록 (이름 참조 재료는 각자, 나머지는 태그 조합별 1개). */
let ingredientClassesCache: CookpotIngredient[] | null = null;
function ingredientClasses(): CookpotIngredient[] {
  if (ingredientClassesCache) return ingredientClassesCache;
  const seen = new Set<string>();
  const reps: CookpotIngredient[] = [];
  for (const ing of cookpotIngredients) {
    const key = NAME_REFERENCED_IDS.has(ing.id)
      ? `id:${ing.id}`
      : `tags:${Object.entries(ing.tags).filter(([, v]) => v).sort().map(([k, v]) => `${k}=${v}`).join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    reps.push(ing);
  }
  ingredientClassesCache = reps;
  return reps;
}

/**
 * 후보를 화면 순서로 정리 — 그 요리로 끝나는 조합 수(hits)가 많은 것부터. "지금 재료로 가장 흔하게
 * 나오는 요리"가 위에 오고 재료 하나가 더 필요한 특수 요리(앰브로시아·밀크메이드 모자 등)는 뒤로 간다.
 * hits는 대표 재료 조합 기준이라 정확한 경우의 수는 아니고 순서용 근사치다. 곤죽은 뺀다.
 */
function finalizeReachable(hits: Map<string, number>, recipes: CookingRecipe[]): CookingRecipe[] {
  return recipes
    .filter((r) => r.id !== "wetgoop" && hits.has(r.id))
    .sort((a, b) => hits.get(b.id)! - hits.get(a.id)! || b.priority - a.priority || a.name.localeCompare(b.name));
}

/**
 * 남은 칸의 모든 재료 조합(중복 허용, 순서 무관)을 전부 열거해 `topMatches`에 든 레시피를 모은다 —
 * 우선순위에 밀려 절대 나올 수 없는 요리는 조건을 만족하더라도 제외된다는 뜻.
 *
 * 비용(데스크톱 Node): 빈 칸 3개 C(91,3)≈12만 조합 → 0.25~0.4초, 빈 칸 2개 ≈10ms, 1개 <1ms.
 * 그래서 빈 칸 3개(재료 1개)는 `scripts/generate-cookpot-reachable.mts`가 미리 계산한 표를 쓰고
 * 이 함수는 그 생성기와 2~3개 경우만 직접 부른다.
 */
export function _computeReachableRecipes(filled: CookpotIngredient[], station: Station): CookingRecipe[] {
  const open = 4 - filled.length;
  if (filled.length === 0 || open <= 0) return [];

  const recipes = recipesForStation(station);
  const names = zeroBag(NAME_KEYS);
  const tags = zeroBag(TAG_KEYS);
  for (const ing of filled) addToBags(names, tags, ing, 1);

  const classes = ingredientClasses();
  const hits = new Map<string, number>();

  const walk = (start: number, left: number): void => {
    if (left === 0) {
      for (const r of topMatches(names, tags, recipes)) hits.set(r.id, (hits.get(r.id) ?? 0) + 1);
      return;
    }
    for (let i = start; i < classes.length; i++) {
      addToBags(names, tags, classes[i], 1);
      walk(i, left - 1);
      addToBags(names, tags, classes[i], -1);
    }
  };
  walk(0, open);

  return finalizeReachable(hits, recipes);
}

// --- 미리 계산한 표 (재료 1개) -------------------------------------------------

/** 정렬된 레시피 목록 → cookingRecipes 인덱스를 base36 두 글자씩 이어 붙인 문자열. 생성 스크립트가 쓴다 */
export function encodeRecipeOrder(recipes: CookingRecipe[]): string {
  const index = new Map(cookingRecipes.map((r, i) => [r.id, i]));
  return recipes.map((r) => index.get(r.id)!.toString(36).padStart(2, "0")).join("");
}

function decodeRecipeOrder(encoded: string): CookingRecipe[] {
  const out: CookingRecipe[] = [];
  for (let i = 0; i + 2 <= encoded.length; i += 2) out.push(cookingRecipes[parseInt(encoded.slice(i, i + 2), 36)]);
  return out;
}

/** 표가 지금 레시피 목록과 같은 순서로 만들어졌는지 — 다르면 표를 통째로 버린다 */
const TABLE_VALID =
  cookpotReachableSingle.recipeIds.length === cookingRecipes.length &&
  cookpotReachableSingle.recipeIds.every((id, i) => id === cookingRecipes[i].id);

const REGEN_HINT = "node --import ./scripts/ts-import-hooks.mjs ./scripts/generate-cookpot-reachable.mts";

if (process.env.NODE_ENV !== "production") {
  if (!TABLE_VALID) throw new Error(`cookpot-reachable.ts가 레시피 목록과 어긋남 — 재생성: ${REGEN_HINT}`);
  for (const station of ["cookpot", "portablecookpot"] as const) {
    for (const ing of cookpotIngredients) {
      if (!(ing.id in cookpotReachableSingle[station])) {
        throw new Error(`cookpot-reachable.ts에 ${ing.id}(${station}) 없음 — 재생성: ${REGEN_HINT}`);
      }
    }
    // 테스트 로직만 바뀐 건 id로 못 잡는다 — 잔가지 한 건을 실제로 계산해 표와 대조 (개발 모드, ~0.3초)
    const twigs = cookpotIngredients.find((i) => i.id === "twigs")!;
    const expected = encodeRecipeOrder(_computeReachableRecipes([twigs], station));
    if (expected !== cookpotReachableSingle[station].twigs) {
      throw new Error(`cookpot-reachable.ts가 엔진과 어긋남(twigs/${station}) — 재생성: ${REGEN_HINT}`);
    }
  }
}

/**
 * 재료를 1~3개만 넣은 상태에서, 남은 칸을 어떤 재료로 채워도 **최종 결과가 될 수 있는** 요리 목록 (#137).
 * 0개나 4개일 땐 빈 배열 (각각 자리 표시자 / `simulate` 몫). 재료 1개는 미리 계산한 표에서 읽고,
 * 표를 못 쓰면(어긋남) 직접 계산한다.
 */
export function reachableRecipes(filled: CookpotIngredient[], station: Station): CookingRecipe[] {
  if (filled.length === 1 && TABLE_VALID) {
    const encoded = (cookpotReachableSingle[station] as Record<string, string>)[filled[0].id];
    if (encoded) return decodeRecipeOrder(encoded);
  }
  return _computeReachableRecipes(filled, station);
}
