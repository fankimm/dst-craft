// ---------------------------------------------------------------------------
// Crock Pot Simulator — Ingredient Data
// Extracted from DST cooking.lua
// ---------------------------------------------------------------------------

export type IngredientTag =
  | "fruit" | "monster" | "sweetener" | "veggie" | "meat" | "fish"
  | "egg" | "decoration" | "fat" | "dairy" | "inedible" | "seed"
  | "magic" | "frozen" | "precook" | "dried";

export type IngredientCategory =
  | "fruits" | "veggies" | "meats" | "fish" | "eggs" | "sweeteners" | "misc";

export interface CookpotIngredient {
  id: string;
  name: string;
  nameKo?: string;
  tags: Partial<Record<IngredientTag, number>>;
  category: IngredientCategory;
  image?: string;        // override: defaults to `${id}.png`
  cookable?: boolean;    // auto-generate cooked variant
  dryable?: boolean;     // auto-generate dried variant
  cookedImage?: string;  // override for cooked variant image
}

// ---------------------------------------------------------------------------
// Base ingredients (~70)
// ---------------------------------------------------------------------------

const baseIngredients: CookpotIngredient[] = [
  // === Fruits ===
  { id: "pomegranate", name: "Pomegranate", nameKo: "석류", tags: { fruit: 1 }, category: "fruits", cookable: true },
  { id: "dragonfruit", name: "Dragon Fruit", nameKo: "용과", tags: { fruit: 1 }, category: "fruits", cookable: true },
  { id: "cave_banana", name: "Cave Banana", nameKo: "바나나", tags: { fruit: 1 }, category: "fruits", cookable: true },
  { id: "wormlight", name: "Glow Berry", nameKo: "발광 베리", tags: { fruit: 1 }, category: "fruits" },
  { id: "wormlight_lesser", name: "Lesser Glow Berry", nameKo: "작은 발광 베리", tags: { fruit: 0.5 }, category: "fruits" },
  { id: "berries", name: "Berries", nameKo: "베리", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "berries_juicy", name: "Juicy Berries", nameKo: "즙 많은 베리", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "fig", name: "Fig", nameKo: "무화과", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "durian", name: "Durian", nameKo: "두리안", tags: { fruit: 1, monster: 1 }, category: "fruits", cookable: true },
  { id: "watermelon", name: "Watermelon", nameKo: "수박", tags: { fruit: 1 }, category: "fruits", cookable: true },
  { id: "ancientfruit_nightvision", name: "Nightberry", nameKo: "밤베리", tags: { fruit: 1 }, category: "fruits", cookable: true },

  // === Veggies ===
  { id: "carrot", name: "Carrot", nameKo: "당근", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "corn", name: "Corn", nameKo: "옥수수", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "pumpkin", name: "Pumpkin", nameKo: "호박", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "eggplant", name: "Eggplant", nameKo: "가지", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "cutlichen", name: "Cut Lichen", nameKo: "이끼", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "asparagus", name: "Asparagus", nameKo: "아스파라거스", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "onion", name: "Onion", nameKo: "양파", tags: { veggie: 1 }, category: "veggies", image: "quagmire_onion.png", cookable: true, cookedImage: "quagmire_onion_cooked.png" },
  { id: "garlic", name: "Garlic", nameKo: "마늘", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "tomato", name: "Tomato", nameKo: "토마토란", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "potato", name: "Potato", nameKo: "감자", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "pepper", name: "Pepper", nameKo: "고추", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "red_cap", name: "Red Cap", nameKo: "빨간 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "green_cap", name: "Green Cap", nameKo: "녹색 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "blue_cap", name: "Blue Cap", nameKo: "파란 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "moon_cap", name: "Moon Shroom", nameKo: "달버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "kelp", name: "Kelp Fronds", nameKo: "다시마 잎", tags: { veggie: 0.5 }, category: "veggies", cookable: true, dryable: true },
  { id: "mandrake", name: "Mandrake", nameKo: "맨드레이크", tags: { veggie: 1, magic: 1 }, category: "veggies", cookable: true, cookedImage: "cookedmandrake.png" },
  { id: "cactus_meat", name: "Cactus Flesh", nameKo: "선인장 과육", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "rock_avocado_fruit_ripe", name: "Ripe Stone Fruit", nameKo: "익은 아보카돌", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "cactus_flower", name: "Cactus Flower", nameKo: "선인장 꽃", tags: { veggie: 0.5 }, category: "veggies" },

  // === Meats ===
  { id: "meat", name: "Meat", nameKo: "고기", tags: { meat: 1 }, category: "meats", dryable: true, cookable: true, cookedImage: "cookedmeat.png" },
  { id: "monstermeat", name: "Monster Meat", nameKo: "괴물고기", tags: { meat: 1, monster: 1 }, category: "meats", dryable: true, cookable: true, cookedImage: "cookedmonstermeat.png" },
  { id: "froglegs", name: "Frog Legs", nameKo: "개구리 다리", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "drumstick", name: "Drumstick", nameKo: "닭다리", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "batwing", name: "Batilisk Wing", nameKo: "바틸리스크 날개", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "smallmeat", name: "Morsel", nameKo: "고깃조각", tags: { meat: 0.5 }, category: "meats", dryable: true, cookable: true, cookedImage: "cookedsmallmeat.png" },
  { id: "batnose", name: "Batnose", nameKo: "벌거숭이 콧구멍", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "mole", name: "Naked Mole Bat", nameKo: "두더지렁이", tags: { meat: 0.5 }, category: "meats" },
  { id: "trunk_summer", name: "Koalefant Trunk", nameKo: "코알라판트 코", tags: { meat: 1 }, category: "meats" },
  { id: "trunk_winter", name: "Winter Koalefant Trunk", nameKo: "겨울 코알라판트 코", tags: { meat: 1 }, category: "meats" },
  { id: "trunk_cooked", name: "Cooked Koalefant Trunk", nameKo: "구운 코알라판트 코", tags: { meat: 1 }, category: "meats" },
  { id: "plantmeat", name: "Leafy Meat", nameKo: "풀고기", tags: { meat: 1 }, category: "meats" },
  { id: "plantmeat_cooked", name: "Cooked Leafy Meat", nameKo: "구운 풀고기", tags: { meat: 1 }, category: "meats" },

  // === Fish ===
  { id: "eel", name: "Eel", nameKo: "장어", tags: { fish: 1, meat: 0.5 }, category: "fish", cookable: true },
  { id: "fish", name: "Fish", nameKo: "생선", tags: { fish: 1, meat: 1 }, category: "fish", cookable: true },
  { id: "pondeel", name: "Pond Eel", nameKo: "산장어", tags: { fish: 1, meat: 0.5 }, category: "fish", cookable: true },
  { id: "pondfish", name: "Pond Fish", nameKo: "민물고기", tags: { fish: 0.5, meat: 0.5 }, category: "fish" },
  { id: "fishmeat_small", name: "Small Fish Morsel", nameKo: "생선 조각", tags: { fish: 0.5, meat: 0.5 }, category: "fish", cookable: true, dryable: true },
  { id: "fishmeat", name: "Fish Morsel", nameKo: "날생선", tags: { fish: 1, meat: 1 }, category: "fish", cookable: true, dryable: true },
  { id: "wobster_sheller_land", name: "Wobster", nameKo: "왑스터", tags: { fish: 1, meat: 1 }, category: "fish" },
  { id: "barnacle", name: "Barnacle", nameKo: "거북순", tags: { fish: 0.25, meat: 0.25 }, category: "fish" },
  { id: "barnacle_cooked", name: "Cooked Barnacle", nameKo: "구운 거북순", tags: { fish: 0.25, meat: 0.25 }, category: "fish" },
  { id: "oceanfish_small_5_inv", name: "Corn Cod", nameKo: "강냉이복어", tags: { fish: 0.5, meat: 0.5 }, category: "fish" },
  { id: "oceanfish_medium_5_inv", name: "Corn Cod", nameKo: "옥수수대구", tags: { fish: 1, meat: 1 }, category: "fish" },

  // === Eggs ===
  { id: "bird_egg", name: "Egg", nameKo: "알", tags: { egg: 1 }, category: "eggs", cookable: true },
  { id: "tallbirdegg", name: "Tallbird Egg", nameKo: "키다리새 알", tags: { egg: 4 }, category: "eggs", cookable: true },

  // === Sweeteners ===
  { id: "honey", name: "Honey", nameKo: "꿀", tags: { sweetener: 1 }, category: "sweeteners" },
  { id: "honeycomb", name: "Honeycomb", nameKo: "벌집", tags: { sweetener: 1 }, category: "sweeteners" },
  { id: "royal_jelly", name: "Royal Jelly", nameKo: "로열 젤리", tags: { sweetener: 3 }, category: "sweeteners" },

  // === Misc ===
  { id: "butterflywings", name: "Butterfly Wings", nameKo: "나비 날개", tags: { decoration: 2 }, category: "misc" },
  { id: "moonbutterflywings", name: "Moon Moth Wings", nameKo: "달 나방 날개", tags: { decoration: 2 }, category: "misc" },
  { id: "butter", name: "Butter", nameKo: "버터", tags: { fat: 1, dairy: 1 }, category: "misc" },
  { id: "twigs", name: "Twigs", nameKo: "잔가지", tags: { inedible: 1 }, category: "misc" },
  { id: "lightninggoathorn", name: "Volt Goat Horn", nameKo: "번개 염소의 뿔", tags: { inedible: 1 }, category: "misc" },
  { id: "ice", name: "Ice", nameKo: "얼음", tags: { frozen: 1 }, category: "misc" },
  { id: "acorn", name: "Birchnut", nameKo: "버치넛", tags: { seed: 1 }, category: "misc" },
  { id: "acorn_cooked", name: "Roasted Birchnut", nameKo: "구운 버치넛", tags: { seed: 1 }, category: "misc" },
  { id: "goatmilk", name: "Electric Milk", nameKo: "전기 우유", tags: { dairy: 1 }, category: "misc" },
  { id: "milkywhites", name: "Milky Whites", nameKo: "흰자위", tags: { dairy: 1 }, category: "misc" },
  { id: "nightmarefuel", name: "Nightmare Fuel", nameKo: "악몽 연료", tags: { inedible: 1, magic: 1 }, category: "misc" },
  { id: "boneshard", name: "Bone Shards", nameKo: "뼛조각", tags: { inedible: 1 }, category: "misc" },
  { id: "refined_dust", name: "Collected Dust", nameKo: "먼지 덩어리", tags: { decoration: 2 }, category: "misc" },
  { id: "forgetmelots", name: "Forget-Me-Lots", nameKo: "건망초", tags: { decoration: 1 }, category: "misc", dryable: true },
  // Dried-only ingredients (raw forms are NOT cooking ingredients in the game)
  { id: "petals_dried", name: "Dried Petals", nameKo: "말린 꽃잎", tags: { decoration: 1, dried: 1 }, category: "misc" },
  { id: "petals_evil_dried", name: "Dried Dark Petals", nameKo: "말린 어둠의 꽃잎", tags: { decoration: 1, magic: 0.5, dried: 1 }, category: "misc" },
  { id: "foliage_dried", name: "Dried Foliage", nameKo: "말린 나뭇잎", tags: { decoration: 1, dried: 1 }, category: "misc" },
  { id: "succulent_picked_dried", name: "Dried Succulent", nameKo: "말린 다육식물", tags: { decoration: 1, dried: 1 }, category: "misc" },
  { id: "firenettles_dried", name: "Dried Fire Nettles", nameKo: "말린 불쐐기풀", tags: { decoration: 1, dried: 1 }, category: "misc" },
  { id: "tillweed_dried", name: "Dried Tillweed", nameKo: "말린 잡초", tags: { decoration: 1, dried: 1 }, category: "misc" },
  { id: "moon_tree_blossom_dried", name: "Dried Moon Tree Blossom", nameKo: "말린 달나무 꽃", tags: { decoration: 1, dried: 1 }, category: "misc" },
];

// ---------------------------------------------------------------------------
// Auto-generate cooked / dried variants
// ---------------------------------------------------------------------------

// Korean name overrides for auto-generated cooked/dried variants (from ko.po)
const cookedNameKoMap: Record<string, string> = {
  pomegranate_cooked: "가른 석류",
  dragonfruit_cooked: "손질한 용과",
  fig_cooked: "익힌 무화과",
  durian_cooked: "냄새 독한 두리안",
  ancientfruit_nightvision_cooked: "요리된 밤베리",
  corn_cooked: "팝콘",
  pumpkin_cooked: "익힌 호박",
  eggplant_cooked: "튀겨 조린 가지",
  rock_avocado_fruit_ripe_cooked: "구운 아보카돌",
  froglegs_cooked: "개구리 뒷다리 구이",
  drumstick_cooked: "닭다리 구이",
  batwing_cooked: "바틸리스크 날개 구이",
  batnose_cooked: "바싹 구운 콧구멍",
  bird_egg_cooked: "알 부침",
  tallbirdegg_cooked: "키다리새 알 부침",
  fish_cooked: "생선 구이",
  fishmeat_cooked: "생선 스테이크",
  fishmeat_small_cooked: "구운 생선 조각",
  kelp_cooked: "익힌 다시마 잎",
  mandrake_cooked: "맨드레이크 구이",
};

const driedNameKoMap: Record<string, string> = {
  meat_dried: "육포",
  monstermeat_dried: "괴물 육포",
  smallmeat_dried: "작은 육포",
  fishmeat_dried: "어포",
  fishmeat_small_dried: "작은 어포",
};

// Images that do NOT exist for cooked variants — use base image
const missingCookedImages = new Set([
  "tomato_cooked", "pondeel_cooked", "cutlichen_cooked",
]);

function generateVariants(bases: CookpotIngredient[]): CookpotIngredient[] {
  const variants: CookpotIngredient[] = [];

  for (const base of bases) {
    if (base.cookable) {
      const cookedId = `${base.id}_cooked`;
      let cookedImg: string | undefined;

      if (base.cookedImage) {
        cookedImg = base.cookedImage;
      } else if (missingCookedImages.has(cookedId)) {
        cookedImg = base.image ?? `${base.id}.png`;
      }

      variants.push({
        id: cookedId,
        name: `Cooked ${base.name}`,
        nameKo: cookedNameKoMap[cookedId] ?? (base.nameKo ? `구운 ${base.nameKo}` : undefined),
        tags: { ...base.tags, precook: 1 },
        category: base.category,
        image: cookedImg,
      });
    }

    if (base.dryable) {
      const driedId = `${base.id}_dried`;
      variants.push({
        id: driedId,
        name: `Dried ${base.name}`,
        nameKo: driedNameKoMap[driedId] ?? (base.nameKo ? `말린 ${base.nameKo}` : undefined),
        tags: { ...base.tags, dried: 1 },
        category: base.category,
      });
    }
  }

  return variants;
}

const variants = generateVariants(baseIngredients);

// ---------------------------------------------------------------------------
// Export: all ingredients (base + variants)
// ---------------------------------------------------------------------------

export const cookpotIngredients: CookpotIngredient[] = [
  ...baseIngredients,
  ...variants,
];

/** Lookup by id */
const ingredientMap = new Map(cookpotIngredients.map((i) => [i.id, i]));
export function getIngredientById(id: string): CookpotIngredient | undefined {
  return ingredientMap.get(id);
}

/** Get image filename for an ingredient */
export function ingredientImage(ing: CookpotIngredient): string {
  return ing.image ?? `${ing.id}.png`;
}
