/**
 * 캐릭터별 선호 음식 데이터
 * Source: scripts/prefabs/*.lua → inst.components.foodaffinity:AddPrefabAffinity / AddFoodtypeAffinity
 * Bonus values: scripts/tuning.lua → AFFINITY_15_CALORIES_*
 *   TINY=2.6, SMALL=2.2, MED=1.6, LARGE=1.4, HUGE=1.2, SUPERHUGE=1.1
 *
 * "특별 선호 음식" 판정 규칙 (UI 라벨용):
 *   - prefab 보너스가 같은 캐릭터의 foodtype 기본 보너스를 *초과*할 때만 특별 선호
 *   - 동일하면(예: 워트의 kelp = 1.33 == veggie 기본 1.33) 카테고리 다이어트일 뿐 특별 선호 아님
 *   - foodtype 기본만 매치하는 경우는 라벨 노이즈가 되므로 표기 제외 (모든 채소가 워트 선호로 표시되는 문제)
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

/**
 * 특별 선호 캐릭터 조회 (음식 카드의 "○○의 선호 음식" 라벨용).
 * - prefab 보너스가 그 캐릭터의 foodtype 기본 보너스를 초과할 때만 포함
 * - 카테고리 전체 affinity (예: 워트 채소 ×1.33)는 여기서 제외 — 카드별 라벨이 모든 채소에 붙어 노이즈가 되기 때문
 *
 * `foodType` 인자는 시그니처 호환성을 위해 유지하지만 현재 로직에서는 사용하지 않는다.
 */
export function getAffinityCharacters(
  foodId: string,
  _foodType?: string,
): { character: string; bonus: number }[] {
  const result: { character: string; bonus: number }[] = [];

  for (const a of PREFAB_AFFINITIES) {
    if (a.food !== foodId) continue;
    const baseline = FOODTYPE_AFFINITIES.find((f) => f.character === a.character);
    if (baseline && a.bonus <= baseline.bonus) continue; // 카테고리 기본과 동일 → 특별 선호 아님
    result.push({ character: a.character, bonus: a.bonus });
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
