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
  { id: "cave_banana", name: "Cave Banana", nameKo: "동굴 바나나", tags: { fruit: 1 }, category: "fruits", cookable: true },
  { id: "wormlight", name: "Glow Berry", nameKo: "발광 열매", tags: { fruit: 1, magic: 1 }, category: "fruits", cookable: true },
  { id: "wormlight_lesser", name: "Lesser Glow Berry", nameKo: "작은 발광 열매", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "berries", name: "Berries", nameKo: "딸기", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "berries_juicy", name: "Juicy Berries", nameKo: "즙이 많은 딸기", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "fig", name: "Fig", nameKo: "무화과", tags: { fruit: 0.5 }, category: "fruits", cookable: true },
  { id: "durian", name: "Durian", nameKo: "두리안", tags: { fruit: 0.5, monster: 1 }, category: "fruits", cookable: true },
  { id: "watermelon", name: "Watermelon", nameKo: "수박", tags: { fruit: 1 }, category: "fruits", cookable: true },
  { id: "ancientfruit_nightvision", name: "Nightshade Nostrum", nameKo: "밤그늘 묘약", tags: { fruit: 1 }, category: "fruits", cookable: true },

  // === Veggies ===
  { id: "carrot", name: "Carrot", nameKo: "당근", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "corn", name: "Corn", nameKo: "옥수수", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "pumpkin", name: "Pumpkin", nameKo: "호박", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "eggplant", name: "Eggplant", nameKo: "가지", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "cutlichen", name: "Cut Lichen", nameKo: "이끼", tags: { veggie: 0.5 }, category: "veggies" },
  { id: "asparagus", name: "Asparagus", nameKo: "아스파라거스", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "onion", name: "Onion", nameKo: "양파", tags: { veggie: 1 }, category: "veggies", image: "quagmire_onion.png", cookable: true, cookedImage: "quagmire_onion_cooked.png" },
  { id: "garlic", name: "Garlic", nameKo: "마늘", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "tomato", name: "Tomato", nameKo: "토마토", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "potato", name: "Potato", nameKo: "감자", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "pepper", name: "Pepper", nameKo: "고추", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "red_cap", name: "Red Cap", nameKo: "붉은 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "green_cap", name: "Green Cap", nameKo: "초록 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "blue_cap", name: "Blue Cap", nameKo: "파란 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "moon_cap", name: "Moon Shroom", nameKo: "달 버섯", tags: { veggie: 0.5 }, category: "veggies", cookable: true },
  { id: "kelp", name: "Kelp Fronds", nameKo: "다시마", tags: { veggie: 0.5 }, category: "veggies", cookable: true, dryable: true },
  { id: "mandrake", name: "Mandrake", nameKo: "맨드레이크", tags: { veggie: 1, magic: 1 }, category: "veggies", cookable: true, cookedImage: "cookedmandrake.png" },
  { id: "cactus_meat", name: "Cactus Flesh", nameKo: "선인장 과육", tags: { veggie: 1 }, category: "veggies", cookable: true },
  { id: "rock_avocado_fruit_ripe", name: "Ripe Stone Fruit", nameKo: "돌 열매", tags: { fruit: 0.5 }, category: "veggies", cookable: true },
  { id: "cactus_flower", name: "Cactus Flower", nameKo: "선인장 꽃봉오리", tags: { veggie: 0.5 }, category: "veggies" },

  // === Meats ===
  { id: "meat", name: "Meat", nameKo: "고기", tags: { meat: 1 }, category: "meats", dryable: true, cookable: true, cookedImage: "cookedmeat.png" },
  { id: "monstermeat", name: "Monster Meat", nameKo: "괴물 고기", tags: { meat: 1, monster: 1 }, category: "meats", dryable: true, cookable: true, cookedImage: "cookedmonstermeat.png" },
  { id: "froglegs", name: "Frog Legs", nameKo: "개구리 다리", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "drumstick", name: "Drumstick", nameKo: "닭다리", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "batwing", name: "Batilisk Wing", nameKo: "박쥐 날개", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "smallmeat", name: "Morsel", nameKo: "작은 고기", tags: { meat: 0.5 }, category: "meats", dryable: true, cookable: true, cookedImage: "cookedsmallmeat.png" },
  { id: "batnose", name: "Batnose", nameKo: "박쥐코", tags: { meat: 0.5 }, category: "meats", cookable: true },
  { id: "mole", name: "Naked Mole Bat", nameKo: "두더지 박쥐", tags: { meat: 0.5 }, category: "meats" },
  { id: "trunk_summer", name: "Koalefant Trunk", nameKo: "코 주둥이", tags: { meat: 1 }, category: "meats" },
  { id: "trunk_winter", name: "Winter Koalefant Trunk", nameKo: "겨울 코 주둥이", tags: { meat: 1 }, category: "meats" },
  { id: "trunk_cooked", name: "Cooked Koalefant Trunk", nameKo: "구운 코 주둥이", tags: { meat: 1, precook: 1 }, category: "meats" },
  { id: "plantmeat", name: "Leafy Meat", nameKo: "풀고기", tags: { meat: 1, veggie: 1 }, category: "meats" },
  { id: "plantmeat_cooked", name: "Cooked Leafy Meat", nameKo: "구운 풀고기", tags: { meat: 1, veggie: 1, precook: 1 }, category: "meats" },

  // === Fish ===
  { id: "eel", name: "Eel", nameKo: "뱀장어", tags: { fish: 1, meat: 0.5 }, category: "fish", cookable: true },
  { id: "fish", name: "Fish", nameKo: "물고기", tags: { fish: 1, meat: 0.5 }, category: "fish", cookable: true },
  { id: "pondeel", name: "Pond Eel", nameKo: "연못 뱀장어", tags: { fish: 0.5, meat: 0.25 }, category: "fish", cookable: true },
  { id: "pondfish", name: "Pond Fish", nameKo: "연못 물고기", tags: { fish: 0.5, meat: 0.25 }, category: "fish", cookable: true },
  { id: "fishmeat_small", name: "Small Fish Morsel", nameKo: "작은 생선살", tags: { fish: 0.5, meat: 0.5 }, category: "fish", cookable: true, dryable: true },
  { id: "fishmeat", name: "Fish Morsel", nameKo: "생선살", tags: { fish: 1, meat: 1 }, category: "fish", cookable: true, dryable: true },
  { id: "wobster_sheller_land", name: "Wobster", nameKo: "로브스터", tags: { fish: 2, meat: 1 }, category: "fish", cookable: true, cookedImage: "wobster_sheller_dead_cooked.png" },
  { id: "barnacle", name: "Barnacle", nameKo: "거북순", tags: { fish: 0.25, meat: 0.25 }, category: "fish" },
  { id: "barnacle_cooked", name: "Cooked Barnacle", nameKo: "구운 거북순", tags: { fish: 0.25, meat: 0.25, precook: 1 }, category: "fish" },
  { id: "oceanfish_small_5_inv", name: "Corn Cod", nameKo: "옥수수 대구", tags: { fish: 0.5, meat: 0.5 }, category: "fish" },
  { id: "oceanfish_medium_5_inv", name: "Corn Cod", nameKo: "점박이 텔레스코프", tags: { fish: 1, meat: 1 }, category: "fish" },

  // === Eggs ===
  { id: "bird_egg", name: "Egg", nameKo: "알", tags: { egg: 1 }, category: "eggs", cookable: true },
  { id: "tallbirdegg", name: "Tallbird Egg", nameKo: "큰새 알", tags: { egg: 4 }, category: "eggs", cookable: true },

  // === Sweeteners ===
  { id: "honey", name: "Honey", nameKo: "꿀", tags: { sweetener: 1 }, category: "sweeteners" },
  { id: "honeycomb", name: "Honeycomb", nameKo: "벌집", tags: { sweetener: 1 }, category: "sweeteners" },
  { id: "royal_jelly", name: "Royal Jelly", nameKo: "로열 젤리", tags: { sweetener: 3 }, category: "sweeteners" },

  // === Misc ===
  { id: "butterflywings", name: "Butterfly Wings", nameKo: "나비 날개", tags: { decoration: 2 }, category: "misc" },
  { id: "moonbutterflywings", name: "Moon Moth Wings", nameKo: "달나방 날개", tags: { decoration: 2 }, category: "misc" },
  { id: "butter", name: "Butter", nameKo: "버터", tags: { fat: 1, dairy: 1 }, category: "misc" },
  { id: "twigs", name: "Twigs", nameKo: "잔가지", tags: { inedible: 1 }, category: "misc" },
  { id: "lightninggoathorn", name: "Volt Goat Horn", nameKo: "번개 염소 뿔", tags: { inedible: 1, magic: 2 }, category: "misc" },
  { id: "ice", name: "Ice", nameKo: "얼음", tags: { frozen: 1 }, category: "misc" },
  { id: "acorn", name: "Birchnut", nameKo: "자작나무 열매", tags: { seed: 1 }, category: "misc", cookable: true },
  { id: "goatmilk", name: "Electric Milk", nameKo: "전기 우유", tags: { dairy: 1 }, category: "misc" },
  { id: "milkywhites", name: "Milky Whites", nameKo: "젖빛", tags: { dairy: 1 }, category: "misc" },
  { id: "nightmarefuel", name: "Nightmare Fuel", nameKo: "악몽 연료", tags: { inedible: 1, magic: 1 }, category: "misc" },
  { id: "boneshard", name: "Bone Shards", nameKo: "뼛조각", tags: { inedible: 1 }, category: "misc" },
  { id: "refined_dust", name: "Powdercake Dust", nameKo: "분말 먼지", tags: { inedible: 1 }, category: "misc" },
  { id: "forgetmelots", name: "Forget-Me-Lots", nameKo: "울지마 꽃", tags: { decoration: 1 }, category: "misc", dryable: true },
  { id: "petals", name: "Petals", nameKo: "꽃잎", tags: { decoration: 0.5 }, category: "misc", dryable: true },
  { id: "petals_evil", name: "Dark Petals", nameKo: "어두운 꽃잎", tags: { decoration: 0.5 }, category: "misc", dryable: true },
  { id: "foliage", name: "Foliage", nameKo: "나뭇잎", tags: { decoration: 0.5 }, category: "misc", dryable: true },
];

// ---------------------------------------------------------------------------
// Auto-generate cooked / dried variants
// ---------------------------------------------------------------------------

// Images that do NOT exist for cooked variants — use base image
const missingCookedImages = new Set([
  "tomato_cooked", "pondeel_cooked", "pondfish_cooked", "honey_cooked",
  "wormlight_cooked", "wormlight_lesser_cooked", "cutlichen_cooked",
  "cactus_flower_cooked", "mole_cooked",
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
        nameKo: base.nameKo ? `구운 ${base.nameKo}` : undefined,
        tags: { ...base.tags, precook: 1 },
        category: base.category,
        image: cookedImg,
      });
    }

    if (base.dryable) {
      variants.push({
        id: `${base.id}_dried`,
        name: `Dried ${base.name}`,
        nameKo: base.nameKo ? `말린 ${base.nameKo}` : undefined,
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

export const cookpotIngredients: CookpotIngredient[] = [...baseIngredients, ...variants];

/** Lookup by id */
const ingredientMap = new Map(cookpotIngredients.map((i) => [i.id, i]));
export function getIngredientById(id: string): CookpotIngredient | undefined {
  return ingredientMap.get(id);
}

/** Get image filename for an ingredient */
export function ingredientImage(ing: CookpotIngredient): string {
  return ing.image ?? `${ing.id}.png`;
}
