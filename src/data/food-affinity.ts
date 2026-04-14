/**
 * 캐릭터별 선호 음식 데이터
 * Source: scripts/prefabs/*.lua → inst.components.foodaffinity:AddPrefabAffinity / AddFoodtypeAffinity
 * Bonus values: scripts/tuning.lua → AFFINITY_15_CALORIES_*
 *   TINY=2.6, SMALL=2.2, MED=1.6, LARGE=1.4, HUGE=1.2, SUPERHUGE=1.1
 */

export interface PrefabAffinity {
  character: string; // app character ID (characters.ts)
  food: string;      // food prefab ID
  bonus: number;     // hunger multiplier
}

export interface FoodTypeAffinity {
  character: string;
  foodType: string;  // "veggie" | "meat" | etc.
  bonus: number;
}

/** 개별 음식 선호 */
export const PREFAB_AFFINITIES: PrefabAffinity[] = [
  // Wilson → Bacon and Eggs
  { character: "wilson", food: "baconeggs", bonus: 1.2 },
  // Willow → Spicy Chili
  { character: "willow", food: "hotchili", bonus: 1.4 },
  // Wolfgang → Roasted Potato (not a recipe)
  { character: "wolfgang", food: "potato_cooked", bonus: 1.6 },
  // Wendy → Banana Pop
  { character: "wendy", food: "bananapop", bonus: 2.2 },
  // WX-78 → Butterfly Muffin
  { character: "wx-78", food: "butterflymuffin", bonus: 1.4 },
  // Wickerbottom → Surf 'n' Turf
  { character: "wickerbottom", food: "surfnturf", bonus: 1.4 },
  // Woodie → Honey Nuggets
  { character: "woodie", food: "honeynuggets", bonus: 1.4 },
  // Wes → Fresh Fruit Crepes
  { character: "wes", food: "freshfruitcrepes", bonus: 1.1 },
  // Maxwell → Lobster Dinner
  { character: "maxwell", food: "lobsterdinner", bonus: 1.4 },
  // Wigfrid → Turkey Dinner
  { character: "wigfrid", food: "turkeydinner", bonus: 1.2 },
  // Webber → Ice Cream
  { character: "webber", food: "icecream", bonus: 1.6 },
  // Winona → Veggie Stinger
  { character: "winona", food: "vegstinger", bonus: 1.6 },
  // Wormwood → Cooked Cave Banana (not a recipe)
  { character: "wormwood", food: "cave_banana_cooked", bonus: 2.2 },
  // Wurt → Durian (specific override, higher than veggie base)
  { character: "wurt", food: "durian", bonus: 1.93 },
  { character: "wurt", food: "durian_cooked", bonus: 1.93 },
  { character: "wurt", food: "kelp", bonus: 1.33 },
  { character: "wurt", food: "kelp_cooked", bonus: 1.33 },
  { character: "wurt", food: "boatpatch_kelp", bonus: 1.33 },
  // Walter → Trail Mix
  { character: "walter", food: "trailmix", bonus: 2.2 },
  // Wanda → Taffy
  { character: "wanda", food: "taffy", bonus: 1.6 },
  // Wortox → Pomegranate (not a recipe)
  { character: "wortox", food: "pomegranate", bonus: 2.6 },
  { character: "wortox", food: "pomegranate_cooked", bonus: 2.2 },
  // Wonkey → Cave Banana (not a recipe)
  { character: "wonkey", food: "cave_banana", bonus: 2.2 },
];

/** 음식 카테고리 선호 */
export const FOODTYPE_AFFINITIES: FoodTypeAffinity[] = [
  // Wurt — all veggie foods
  { character: "wurt", foodType: "veggie", bonus: 1.33 },
];

/** 음식 prefab ID + foodType으로 선호 캐릭터 조회 */
export function getAffinityCharacters(
  foodId: string,
  foodType?: string,
): { character: string; bonus: number }[] {
  const result: { character: string; bonus: number }[] = [];

  for (const a of PREFAB_AFFINITIES) {
    if (a.food === foodId) {
      result.push({ character: a.character, bonus: a.bonus });
    }
  }

  if (foodType) {
    for (const a of FOODTYPE_AFFINITIES) {
      if (a.foodType === foodType && !result.some((r) => r.character === a.character)) {
        result.push({ character: a.character, bonus: a.bonus });
      }
    }
  }

  return result;
}

/** 캐릭터 ID로 선호 음식 조회 (캐릭터 페이지용) */
export function getCharacterAffinities(
  characterId: string,
): { food: string; bonus: number; type: "prefab" | "foodtype" }[] {
  const result: { food: string; bonus: number; type: "prefab" | "foodtype" }[] = [];

  for (const a of PREFAB_AFFINITIES) {
    if (a.character === characterId) {
      result.push({ food: a.food, bonus: a.bonus, type: "prefab" });
    }
  }

  for (const a of FOODTYPE_AFFINITIES) {
    if (a.character === characterId) {
      result.push({ food: a.foodType, bonus: a.bonus, type: "foodtype" });
    }
  }

  return result;
}
