// ---------------------------------------------------------------------------
// Crock Pot Simulator — Simulation Engine
// Ported from DST preparedfoods.lua / preparedfoods_warly.lua
// ---------------------------------------------------------------------------

import { cookingRecipes, type CookingRecipe } from "@/data/recipes";
import type { CookpotIngredient } from "@/data/cookpot-ingredients";

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type N = Record<string, number>; // names bag (ingredient counts)
type T = Record<string, number>; // tags bag (summed tag values)

/** Creates a Record<string,number> that returns 0 for missing keys. */
function createBag(): Record<string, number> {
  return new Proxy({} as Record<string, number>, {
    get(target, prop) {
      if (typeof prop === "string") return target[prop] ?? 0;
      return Reflect.get(target, prop);
    },
  });
}

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
    n.kelp + n.kelp_cooked + n.kelp_dried >= 1 &&
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
    n.butterflywings + n.moonbutterflywings >= 1 && !t.meat && t.veggie >= 0.5,

  californiaroll: (n, t) =>
    n.kelp + n.kelp_cooked + n.kelp_dried >= 2 && t.fish >= 1,

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
    t.fish > 0 && n.corn + n.corn_cooked >= 1,

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
    n.mole >= 1 &&
    n.rock_avocado_fruit_ripe + n.rock_avocado_fruit_ripe_cooked + n.cactus_meat + n.cactus_meat_cooked >= 1 &&
    !t.fruit,

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
    n.wobster_sheller_land + n.wobster_sheller_land_cooked >= 1 && t.frozen > 0,

  lobsterdinner: (n, t) =>
    n.wobster_sheller_land + n.wobster_sheller_land_cooked >= 1 &&
    n.butter >= 1 && t.meat >= 1 && t.fish >= 1 && !t.frozen,

  mandrakesoup: (n) =>
    n.mandrake + n.mandrake_cooked >= 1,

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
    n.twigs >= 1 && n.honey >= 1 && n.corn + n.corn_cooked >= 1,

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
    n.moon_cap + n.moon_cap_cooked >= 1 &&
    n.red_cap + n.red_cap_cooked >= 1 &&
    n.blue_cap + n.blue_cap_cooked >= 1 &&
    n.green_cap + n.green_cap_cooked >= 1,

  shroombait: (n) =>
    n.moon_cap + n.moon_cap_cooked >= 2 &&
    n.monstermeat + n.monstermeat_cooked + n.monstermeat_dried >= 1,

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
    n.tallbirdegg + n.tallbirdegg_cooked >= 1 && t.veggie >= 1,

  trailmix: (n, t) =>
    n.acorn + n.acorn_cooked >= 1 && t.seed >= 1 &&
    n.berries + n.berries_cooked >= 1 && t.fruit >= 1 &&
    !t.meat && !t.veggie && !t.egg && !t.dairy,

  turkeydinner: (n, t) =>
    n.drumstick + n.drumstick_cooked >= 2 &&
    t.meat > 1 &&
    (t.veggie >= 0.5 || t.fruit > 0),

  unagi: (n) =>
    n.cutlichen + n.kelp + n.kelp_cooked + n.kelp_dried >= 1 &&
    n.eel + n.eel_cooked >= 1,

  veggieomlet: (_, t) =>
    t.egg >= 1 && t.veggie >= 1 && !t.meat && !t.dairy,

  vegstinger: (n, t) =>
    n.asparagus + n.asparagus_cooked + n.tomato + n.tomato_cooked >= 1 &&
    t.veggie > 2 && t.frozen > 0 && !t.meat && !t.inedible && !t.egg,

  waffles: (n, t) =>
    n.butter >= 1 &&
    n.berries + n.berries_cooked + n.berries_juicy + n.berries_juicy_cooked >= 1 &&
    t.egg > 0,

  watermelonicle: (n, t) =>
    n.watermelon + n.watermelon_cooked >= 1 &&
    t.frozen > 0 && n.twigs >= 1 &&
    !t.meat && !t.veggie && !t.egg,

  wetgoop: () => true, // priority -10 fallback

  // ==================== Portable Cookpot (Warly) ====================

  bonesoup: (n, t) =>
    n.boneshard >= 2 &&
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
    (n.wormlight + n.wormlight_cooked >= 1 ||
      n.wormlight_lesser + n.wormlight_lesser_cooked >= 2) &&
    t.fruit >= 2 && !t.meat && !t.inedible,

  monstertartare: (_, t) =>
    t.monster >= 2 && !t.inedible,

  moqueca: (n, t) =>
    t.fish > 0 &&
    n.onion + n.onion_cooked >= 1 &&
    n.tomato + n.tomato_cooked >= 1 &&
    !t.inedible,

  nightmarepie: (n) =>
    n.nightmarefuel >= 2 &&
    n.potato + n.potato_cooked >= 1 &&
    n.onion + n.onion_cooked >= 1,

  potatosouffle: (n, t) =>
    n.potato + n.potato_cooked >= 2 && t.egg > 0 && !t.meat && !t.inedible,

  voltgoatjelly: (n, t) =>
    n.lightninggoathorn >= 1 && t.sweetener >= 2 && !t.meat,
};

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
  station: "cookpot" | "portablecookpot",
): SimulationResult {
  if (ingredients.length !== 4) {
    return { recipes: [], isRandom: false };
  }

  // 1. Build tags bag (sum all tag values)
  const tags = createBag();
  // 2. Build names bag (count each ingredient by id)
  const names = createBag();

  for (const ing of ingredients) {
    names[ing.id] = names[ing.id] + 1;
    for (const [tag, value] of Object.entries(ing.tags)) {
      if (value) tags[tag] = tags[tag] + value;
    }
  }

  // 3. Filter recipes by station
  const recipesToTest =
    station === "portablecookpot"
      ? cookingRecipes // portable crock pot tests ALL recipes
      : cookingRecipes.filter((r) => r.station === "cookpot");

  // 4. Run test functions, collect matches
  const matched: CookingRecipe[] = [];
  for (const recipe of recipesToTest) {
    const testFn = recipeTests[recipe.id];
    if (testFn && testFn(names, tags)) {
      matched.push(recipe);
    }
  }

  if (matched.length === 0) {
    return { recipes: [], isRandom: false };
  }

  // 5. Sort by priority descending, keep only top priority
  matched.sort((a, b) => b.priority - a.priority);
  const maxPriority = matched[0].priority;
  const topRecipes = matched.filter((r) => r.priority === maxPriority);

  return {
    recipes: topRecipes,
    isRandom: topRecipes.length > 1,
  };
}
