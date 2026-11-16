/**
 * 게팍한 은둔자(진주) 거래·찻집·집 꾸미기 점수 데이터 (#142).
 *
 * 전부 게임 소스에서 직접 읽은 값이다 — 아래 경로 밖의 수치를 적지 말 것.
 *  - 병 교환 품목·가격: recipes.lua 932-950 (`hermitshop_*`, 재료는 전부 `messagebottleempty`)
 *  - 해금 친구 레벨: prefabs/hermitcrab.lua `friendlevel_N_reward` — EnableShop(1/2/3/4)가 Lv1/3/6/8,
 *    tuning.lua PROTOTYPER_TREES.HERMITCRABSHOP_L1..L4 = 테크 1/3/5/7 ↔ constants.lua TECH.HERMITCRABSHOP_ONE/THREE/FIVE/SEVEN.
 *    Lv9 `supertacklecontainer`, Lv10 `winter_ornament_boss_pearl`는 LearnItem으로 따로 열린다.
 *    `winter_ornament_boss_hermithouse`는 집 수리 3단계 완료 + 겨울 축제 중 (initfriendlevellisteners·OnLoadPostPass)
 *  - 찻집: recipes.lua 1503-1516 (레벨별 말린 재료 수 common {8,6,4} / rare {6,4,2}, 빈 병 1),
 *    prefabs/hermitcrab_teashop.lua UpdateRecipes (점수 ≥75 → 3, ≥50 → 2, 그 외 1),
 *    prefabs/hermitcrabtea_defs.lua TEA_DEFS·BUFF_DEFS, prefabs/hermitcrabtea.lua (healthvalue 기본 HEALING_TINY, 10회 사용),
 *    tuning.lua SANITY_*·HEALING_*·HERMITCRABTEA_*·HERMITCRAB_*TEA_* (seg_time = 30초)
 *  - 꾸미기 점수: components/pearldecorationscore.lua + tuning.lua HERMITCRAB_DECOR_* (9156-9227)
 *  - 점수로 열리는 것: prefabs/hermithouse.lua UNLOCKABLE_RECIPES·UNLOCKABLE_LVL5_CONSTR, prefabs/shellweaver.lua
 *    UNLOCKABLE_SECOND_TIER, stategraphs/SGhermitcrab.lua(온천 담그기 시간), hermitcrab.lua 616(행복 ≥90 칭찬)
 *  - 이름: ko.po / strings.lua `STRINGS.NAMES.*`
 */

export interface HermitTrade {
  /** items.ts의 레시피 id (`hermitshop_*`) — 제작 탭 상세로 점프하는 키 */
  id: string;
  /** 받는 물건의 prefab */
  product: string;
  nameKo: string;
  nameEn: string;
  /** public/images/game-items/ 파일명 */
  icon: string;
  /** 내는 빈 병 수 */
  bottles: number;
  /** 한 번에 받는 개수 (기본 1) */
  gives?: number;
  /** 해금 조건 */
  unlock: { kind: "level"; level: number } | { kind: "house3_winter" };
}

export const HERMIT_TRADES: HermitTrade[] = [
  // Lv1 — HERMITCRABSHOP_ONE
  { id: "hermitshop_hermit_bundle_shells", product: "hermit_bundle_shells", nameKo: "소리고둥 묶음", nameEn: "Shell Bell Bundle", icon: "hermit_bundle.png", bottles: 1, unlock: { kind: "level", level: 1 } },
  { id: "hermitshop_winch_blueprint", product: "winch_blueprint", nameKo: "집게 도르래 청사진", nameEn: "Pinchin' Winch Blueprint", icon: "blueprint_rare.png", bottles: 1, unlock: { kind: "level", level: 1 } },
  { id: "hermitshop_turf_shellbeach_blueprint", product: "turf_shellbeach_blueprint", nameKo: "조개 껍질 바닥 청사진", nameEn: "Shell Turf Blueprint", icon: "blueprint_rare.png", bottles: 3, unlock: { kind: "level", level: 1 } },
  // Lv3 — HERMITCRABSHOP_THREE
  { id: "hermitshop_oceanfishingbobber_crow", product: "oceanfishingbobber_crow", nameKo: "검은 깃털 찌", nameEn: "Jet Quill Float", icon: "oceanfishingbobber_crow.png", bottles: 1, unlock: { kind: "level", level: 3 } },
  { id: "hermitshop_oceanfishingbobber_robin", product: "oceanfishingbobber_robin", nameKo: "붉은 깃털 찌", nameEn: "Crimson Quill Float", icon: "oceanfishingbobber_robin.png", bottles: 1, unlock: { kind: "level", level: 3 } },
  { id: "hermitshop_oceanfishingbobber_robin_winter", product: "oceanfishingbobber_robin_winter", nameKo: "푸른 깃털 찌", nameEn: "Azure Quill Float", icon: "oceanfishingbobber_robin_winter.png", bottles: 1, unlock: { kind: "level", level: 3 } },
  { id: "hermitshop_oceanfishingbobber_canary", product: "oceanfishingbobber_canary", nameKo: "노란 깃털 찌", nameEn: "Saffron Quill Float", icon: "oceanfishingbobber_canary.png", bottles: 1, unlock: { kind: "level", level: 3 } },
  { id: "hermitshop_tacklecontainer", product: "tacklecontainer", nameKo: "낚시 도구함", nameEn: "Tackle Box", icon: "tacklecontainer.png", bottles: 3, unlock: { kind: "level", level: 3 } },
  // Lv6 — HERMITCRABSHOP_FIVE
  { id: "hermitshop_oceanfishinglure_hermit_rain", product: "oceanfishinglure_hermit_rain", nameKo: "우천의 루어", nameEn: "Rainy Day Lure", icon: "oceanfishinglure_hermit_rain.png", bottles: 1, unlock: { kind: "level", level: 6 } },
  { id: "hermitshop_oceanfishinglure_hermit_snow", product: "oceanfishinglure_hermit_snow", nameKo: "강설의 루어", nameEn: "Snow Day Lure", icon: "oceanfishinglure_hermit_snow.png", bottles: 1, unlock: { kind: "level", level: 6 } },
  { id: "hermitshop_oceanfishinglure_hermit_drowsy", product: "oceanfishinglure_hermit_drowsy", nameKo: "바보의 루어", nameEn: "Stupefying Lure", icon: "oceanfishinglure_hermit_drowsy.png", bottles: 1, unlock: { kind: "level", level: 6 } },
  { id: "hermitshop_oceanfishinglure_hermit_heavy", product: "oceanfishinglure_hermit_heavy", nameKo: "묵직한 루어", nameEn: "Heavy Weighted Lure", icon: "oceanfishinglure_hermit_heavy.png", bottles: 1, unlock: { kind: "level", level: 6 } },
  // Lv8 — HERMITCRABSHOP_SEVEN
  { id: "hermitshop_oceanfishingbobber_goose", product: "oceanfishingbobber_goose", nameKo: "솜깃 찌", nameEn: "Down Quill Float", icon: "oceanfishingbobber_goose.png", bottles: 1, unlock: { kind: "level", level: 8 } },
  { id: "hermitshop_oceanfishingbobber_malbatross", product: "oceanfishingbobber_malbatross", nameKo: "꽉새치 깃털 찌", nameEn: "Malbatross Quill Float", icon: "oceanfishingbobber_malbatross.png", bottles: 1, unlock: { kind: "level", level: 8 } },
  { id: "hermitshop_chum", product: "chum", nameKo: "물고기 밥", nameEn: "Fish Food", icon: "chum.png", bottles: 1, gives: 3, unlock: { kind: "level", level: 8 } },
  { id: "hermitshop_chum_blueprint", product: "chum_blueprint", nameKo: "물고기 밥 청사진", nameEn: "Fish Food Blueprint", icon: "blueprint_rare.png", bottles: 5, unlock: { kind: "level", level: 8 } },
  // Lv9 — LearnItem (friendlevel_9_reward)
  { id: "hermitshop_supertacklecontainer", product: "supertacklecontainer", nameKo: "멋에 찌든 도구함", nameEn: "Spectackler Box", icon: "supertacklecontainer.png", bottles: 6, unlock: { kind: "level", level: 9 } },
  // Lv10 — LearnItem (friendlevel_10_reward)
  { id: "hermitshop_winter_ornament_boss_pearl", product: "winter_ornament_boss_pearl", nameKo: "감성적인 장식품", nameEn: "Sentimental Adornment", icon: "winter_ornament_boss_pearl.png", bottles: 8, unlock: { kind: "level", level: 10 } },
  // 집 수리 3단계 완료 + 겨울 축제 기간
  { id: "hermitshop_winter_ornament_boss_hermithouse", product: "winter_ornament_boss_hermithouse", nameKo: "감성적인 장식품", nameEn: "Sentimental Adornment", icon: "winter_ornament_boss_hermithouse.png", bottles: 4, unlock: { kind: "house3_winter" } },
];

/** 친구 레벨 → 상점 단계. hermitcrab.lua EnableShop 호출 위치 (Lv1·3·6·8) + Lv9·10의 개별 LearnItem */
export const HERMIT_SHOP_LEVELS = [1, 3, 6, 8, 9, 10] as const;

// ---------------------------------------------------------------------------
// 찻집

/** recipes.lua NUM_COMMON_PETALS_FOR_TEASHOP_LEVEL / NUM_RARE_PETALS_FOR_TEASHOP_LEVEL */
export const HERMIT_TEASHOP_LEVELS = [
  { level: 1, minScore: 0, common: 8, rare: 6 },
  { level: 2, minScore: 50, common: 6, rare: 4 },
  { level: 3, minScore: 75, common: 4, rare: 2 },
] as const;

/** 한 잔으로 마실 수 있는 횟수 — tuning HERMITCRABTEA_USES */
export const HERMIT_TEA_USES = 10;

export type HermitTeaBuff =
  | { kind: "sanity_tick"; perTick: number; tickSec: number; durationSec: number }
  | { kind: "health_tick"; perTick: number; tickSec: number; durationSec: number }
  | { kind: "neg_aura"; multiplier: number; durationSec: number }
  | { kind: "temperature"; delta: number; durationSec: number }
  | { kind: "shadow_panic"; durationSec: number; panicSec: number };

export interface HermitTea {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  /** 말린 재료 prefab */
  ingredient: string;
  ingredientKo: string;
  ingredientEn: string;
  /** 재료 수 표 — common 또는 rare */
  cost: "common" | "rare";
  /** 마실 때 즉시 (edible) */
  sanity: number;
  health: number;
  buff?: HermitTeaBuff;
}

const SEG = 30; // tuning seg_time

export const HERMIT_TEAS: HermitTea[] = [
  { id: "hermitcrabtea_petals", nameKo: "꽃차", nameEn: "Petal Tea", icon: "hermitcrabtea_petals.png", ingredient: "petals_dried", ingredientKo: "말린 꽃잎", ingredientEn: "Dried Petals", cost: "common", sanity: 10, health: 1,
    buff: { kind: "sanity_tick", perTick: 1, tickSec: 1, durationSec: SEG * 1.5 } },
  { id: "hermitcrabtea_petals_evil", nameKo: "어둠꽃차", nameEn: "Dark Petal Tea", icon: "hermitcrabtea_petals_evil.png", ingredient: "petals_evil_dried", ingredientKo: "말린 어둠의 꽃잎", ingredientEn: "Dried Dark Petals", cost: "common", sanity: -15, health: 1,
    buff: { kind: "sanity_tick", perTick: -2, tickSec: 1, durationSec: SEG * 2 } },
  { id: "hermitcrabtea_foliage", nameKo: "고사리차", nameEn: "Foliage Tea", icon: "hermitcrabtea_foliage.png", ingredient: "foliage_dried", ingredientKo: "말린 고사리잎", ingredientEn: "Dried Foliage", cost: "common", sanity: 5, health: 1,
    buff: { kind: "neg_aura", multiplier: 0.1, durationSec: SEG * 6 } },
  { id: "hermitcrabtea_succulent_picked", nameKo: "다육이차", nameEn: "Succulent Tea", icon: "hermitcrabtea_succulent_picked.png", ingredient: "succulent_picked_dried", ingredientKo: "말린 다육식물", ingredientEn: "Dried Succulent", cost: "rare", sanity: 5, health: 8,
    buff: { kind: "temperature", delta: -40, durationSec: SEG * 4 } },
  { id: "hermitcrabtea_firenettles", nameKo: "불쐐기차", nameEn: "Fire Nettle Tea", icon: "hermitcrabtea_firenettles.png", ingredient: "firenettles_dried", ingredientKo: "말린 불쐐기 잎", ingredientEn: "Dried Fire Nettle Frond", cost: "rare", sanity: 5, health: 1,
    buff: { kind: "temperature", delta: 40, durationSec: SEG * 4 } },
  { id: "hermitcrabtea_tillweed", nameKo: "뒤엎시라차", nameEn: "Tillweed Tea", icon: "hermitcrabtea_tillweed.png", ingredient: "tillweed_dried", ingredientKo: "말린 뒤엎시라", ingredientEn: "Dried Tillweed", cost: "rare", sanity: 5, health: 20,
    buff: { kind: "health_tick", perTick: 1, tickSec: 0.5, durationSec: SEG * 0.5 } },
  { id: "hermitcrabtea_moon_tree_blossom", nameKo: "달빛나무 꽃차", nameEn: "Lune Tree Blossom Tea", icon: "hermitcrabtea_moon_tree_blossom.png", ingredient: "moon_tree_blossom_dried", ingredientKo: "말린 달빛나무 꽃", ingredientEn: "Dried Lune Tree Blossom", cost: "common", sanity: 10, health: 1,
    buff: { kind: "shadow_panic", durationSec: SEG * 6, panicSec: SEG } },
  { id: "hermitcrabtea_forgetmelots", nameKo: "건망초차", nameEn: "Forget-Me-Lots Tea", icon: "hermitcrabtea_forgetmelots.png", ingredient: "forgetmelots_dried", ingredientKo: "말린 건망초", ingredientEn: "Dried Forget-Me-Lots", cost: "rare", sanity: 20, health: 1,
    buff: { kind: "sanity_tick", perTick: 2, tickSec: 1, durationSec: SEG * 1.5 } },
];

// ---------------------------------------------------------------------------
// 집 꾸미기 점수

export const HERMIT_DECOR_CONSTANTS = {
  maxScore: 100,
  happyScore: 90,
  maxTiles: 100,
  hotspringSoakSec: 30,
  hotspringHappySoakSec: 60,
  winterSkinBonus: 2,
} as const;

export type HermitDecorKey =
  | "unique" | "house5" | "ornaments" | "tiles" | "watertree" | "critter" | "beebox" | "flower" | "lightpost"
  | "pickable" | "meatrack" | "chair" | "trophyfish" | "pottedplant" | "dockpost" | "table"
  | "spawner" | "junk" | "fishing";

export interface HermitDecorEntry {
  key: HermitDecorKey;
  /** 대표 아이콘 (game-items). 없으면 UI가 lucide로 대체 */
  icon?: string;
  /** 단위 점수 — 항목별 세부는 `parts` */
  parts: { labelKo: string; labelEn: string; points: number; per?: "each" | "tile" | "slot" | "weight"; icon?: string }[];
  /** 항목 합계 상한 (양수) 또는 하한 (음수). 없으면 무제한 */
  cap?: number;
}

export const HERMIT_DECOR: HermitDecorEntry[] = [
  { key: "unique", icon: "hermitcrab_teashop.png", parts: [
    { labelKo: "진주네 찻집", labelEn: "Pearl's Tea Shop", points: 10, icon: "hermitcrab_teashop.png" },
    { labelKo: "진주의 온천", labelEn: "Pearl's Hot Spring", points: 10, icon: "hermithotspring_constr.png" },
    { labelKo: "낚시도구 거치대", labelEn: "Tackle Receptacle", points: 3, icon: "tacklestation.png" },
    { labelKo: "염합기", labelEn: "Combriner", points: 3, icon: "shellweaver.png" },
  ] },
  { key: "house5", icon: "hermithouse_stage3.png", parts: [{ labelKo: "은둔자의 집 5단계", labelEn: "Hermit Home (stage 5)", points: 5 }] },
  { key: "ornaments", icon: "hermithouse_ornament.png", parts: [
    { labelKo: "풍경 등 장식", labelEn: "Wind Charm & ornaments", points: 2, per: "each", icon: "hermithouse_ornament.png" },
    { labelKo: "겨울 축제 장식", labelEn: "Winter's Feast ornament", points: 4, per: "each", icon: "winter_ornament_boss_hermithouse.png" },
    { labelKo: "왁스태프의 물건", labelEn: "Wagstaff's items", points: 8, per: "each", icon: "wagstaff_item_1.png" },
  ] },
  { key: "tiles", icon: "turf_shellbeach.png", cap: 15, parts: [
    { labelKo: "조개 껍질 바닥", labelEn: "Shell Beach Turf", points: 0.15, per: "tile", icon: "turf_shellbeach.png" },
    { labelKo: "월숭이 섬 해변 바닥", labelEn: "Moon Quay Beach Turf", points: 0.1, per: "tile", icon: "turf_monkey_ground.png" },
    { labelKo: "바위 해안 바닥", labelEn: "Rocky Beach Turf", points: 0.1, per: "tile", icon: "turf_pebblebeach.png" },
  ] },
  { key: "watertree", cap: 15, parts: [{ labelKo: "거대한 나무 둥치 (그늘이 섬 10칸 이상)", labelEn: "Great Tree Trunk (canopy over 10+ tiles)", points: 15 }] },
  { key: "critter", icon: "critter_kitten_builder.png", parts: [{ labelKo: "진주의 반려동물", labelEn: "Pearl's critter", points: 5, per: "each" }] },
  { key: "beebox", icon: "beebox.png", cap: 5, parts: [{ labelKo: "벌통", labelEn: "Bee Box", points: 1, per: "each" }] },
  { key: "flower", icon: "petals.png", cap: 5, parts: [{ labelKo: "꽃", labelEn: "Flower", points: 0.5, per: "each" }] },
  { key: "lightpost", icon: "hermitcrab_lightpost.png", cap: 10, parts: [
    { labelKo: "진주의 가로등 (켜짐)", labelEn: "Pearl's Light Post (lit)", points: 1, per: "each" },
    { labelKo: "진주의 가로등 (꺼짐)", labelEn: "Pearl's Light Post (unlit)", points: 1 / 3, per: "each" },
  ] },
  { key: "pickable", icon: "dug_berrybush.png", cap: 10, parts: [{ labelKo: "채집 식물 (덤불·풀·묘목 등, 가시 식물 제외)", labelEn: "Pickable plants (bushes, grass, saplings; not thorny)", points: 0.5, per: "each" }] },
  { key: "meatrack", icon: "meatrack.png", cap: 9, parts: [{ labelKo: "건조대", labelEn: "Drying Rack", points: 1, per: "slot" }] },
  { key: "chair", icon: "wood_chair.png", cap: 8, parts: [{ labelKo: "의자", labelEn: "Chair", points: 2, per: "each" }] },
  { key: "trophyfish", icon: "trophyscale_fish.png", parts: [
    { labelKo: "어류 체중 측정기의 물고기 (종류별 가장 무거운 1마리)", labelEn: "Fish on a Fish Scale-O-Matic (heaviest of each species)", points: 0.012, per: "weight" },
    { labelKo: "16종을 모두 올리면", labelEn: "All 16 species displayed", points: 20 },
  ] },
  { key: "pottedplant", icon: "pottedfern.png", cap: 10, parts: [{ labelKo: "화분 (양치식물·다육식물)", labelEn: "Potted plant (fern, succulent)", points: 1, per: "each" }] },
  { key: "dockpost", icon: "dock_woodposts_item.png", cap: 10, parts: [{ labelKo: "부두 말뚝", labelEn: "Dock Piling", points: 0.5, per: "each" }] },
  { key: "table", icon: "wood_table_round.png", cap: 15, parts: [
    { labelKo: "탁자", labelEn: "Table", points: 2, per: "each" },
    { labelKo: "탁자 위에 장식을 올리면", labelEn: "Table with a decoration on it", points: 5, per: "each" },
  ] },
  { key: "spawner", cap: -33, parts: [
    { labelKo: "몬스터가 나오는 둥지·굴 (벌통·캣쿤 굴 제외)", labelEn: "Mob spawner (dens, nests; bee boxes & Catcoon dens excluded)", points: -1, per: "each" },
    { labelKo: "무덤", labelEn: "Grave", points: -3, per: "each" },
  ] },
  { key: "junk", cap: -50, parts: [{ labelKo: "바닥에 떨어진 아이템·쓰레기 더미", labelEn: "Items left on the ground, junk piles", points: -0.5, per: "each" }] },
  { key: "fishing", icon: "oceanfishingrod.png", cap: -64, parts: [{ labelKo: "진주의 낚시터 16곳 중 땅으로 덮인 곳", labelEn: "Pearl's fishing spots (16) covered by land", points: -4, per: "each" }] },
];

/** 꾸미기 점수로 열리고 닫히는 것 — 모두 친구 Lv10이 전제 (hermithouse.lua CheckUnlocks) */
export const HERMIT_DECOR_UNLOCKS = [
  { id: "hermitcrab_lightpost", nameKo: "진주의 가로등", nameEn: "Pearl's Light Post", icon: "hermitcrab_lightpost.png", unlockAt: 10, relockBelow: 5, requiresMaxLevel: true },
  { id: "hermitcrab_teashop", nameKo: "진주네 찻집", nameEn: "Pearl's Tea Shop", icon: "hermitcrab_teashop.png", unlockAt: 25, relockBelow: 15, requiresMaxLevel: true },
  { id: "shellweaver_tier2", nameKo: "염합기 2단계 (냉동 지팡이 등)", nameEn: "Combriner tier 2 (Deep Freeze Staff etc.)", icon: "shellweaver.png", unlockAt: 40, relockBelow: 30, requiresMaxLevel: false },
  { id: "teashop_level2", nameKo: "찻집 메뉴 2단계 — 재료 6개 / 4개", nameEn: "Tea Shop level 2 — 6 / 4 ingredients", icon: "hermitcrabtea_petals.png", unlockAt: 50, requiresMaxLevel: false },
  { id: "hermithotspring_constr", nameKo: "온천", nameEn: "Hot Spring", icon: "hermithotspring_constr.png", unlockAt: 60, relockBelow: 50, requiresMaxLevel: true },
  { id: "teashop_level3", nameKo: "찻집 메뉴 3단계 — 재료 4개 / 2개", nameEn: "Tea Shop level 3 — 4 / 2 ingredients", icon: "hermitcrabtea_forgetmelots.png", unlockAt: 75, requiresMaxLevel: false },
  { id: "meatrack_hermit_multi", nameKo: "대형 건조대", nameEn: "Large Drying Rack", icon: "meatrack_hermit_multi.png", unlockAt: 90, relockBelow: 80, requiresMaxLevel: true },
] as const;
