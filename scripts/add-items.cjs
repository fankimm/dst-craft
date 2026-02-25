/**
 * Adds new items to the consolidated items.ts and ko.ts files.
 * Also applies Korean name corrections.
 *
 * Usage: node scripts/add-items.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ITEMS_PATH = path.join(ROOT, "src/data/items.ts");
const KO_PATH = path.join(ROOT, "src/data/locales/ko.ts");

// ===== NEW ITEMS TO ADD =====
const newItems = [
  // --- tools (Batch 2) ---
  {
    id: "trap", name: "Trap", description: "A trap for catching small creatures like rabbits.",
    image: "Trap.png", category: ["tools"], station: "none",
    materials: [{ materialId: "cutgrass", quantity: 6 }, { materialId: "twigs", quantity: 2 }],
    sortOrder: 13,
  },
  {
    id: "bird_trap", name: "Bird Trap", description: "A trap designed for catching birds.",
    image: "Bird_Trap.png", category: ["tools"], station: "science_1",
    materials: [{ materialId: "twigs", quantity: 3 }, { materialId: "silk", quantity: 4 }],
    sortOrder: 14,
  },
  {
    id: "bug_net", name: "Bug Net", description: "A net for catching insects and small creatures.",
    image: "Bug_Net.png", category: ["tools"], station: "science_1",
    materials: [{ materialId: "twigs", quantity: 4 }, { materialId: "silk", quantity: 2 }, { materialId: "rope", quantity: 1 }],
    sortOrder: 15,
  },
  {
    id: "watering_can", name: "Watering Can", description: "A can for watering garden plants to help them grow.",
    image: "Watering_Can.png", category: ["tools", "food_gardening"], station: "science_1",
    materials: [{ materialId: "boards", quantity: 2 }, { materialId: "rope", quantity: 1 }],
    sortOrder: 16,
  },
  {
    id: "luxury_pickaxe", name: "Pick/Axe", description: "A dual-purpose luxury tool that functions as both an axe and a pickaxe.",
    image: "Pick_Axe.png", category: ["tools"], station: "science_2",
    materials: [{ materialId: "goldnugget", quantity: 4 }, { materialId: "twigs", quantity: 4 }],
    sortOrder: 17,
  },
  {
    id: "regal_shovel", name: "Regal Shovel", description: "A superior shovel with greatly increased durability.",
    image: "Regal_Shovel.png", category: ["tools"], station: "science_2",
    materials: [{ materialId: "goldnugget", quantity: 4 }, { materialId: "twigs", quantity: 4 }],
    sortOrder: 18,
  },
  // --- weapons (Batch 2) ---
  {
    id: "glass_cutter", name: "Glass Cutter", description: "A powerful sword made from moon glass that deals extra damage to shadow creatures.",
    image: "Glass_Cutter.png", category: ["weapons"], station: "celestial",
    materials: [{ materialId: "boards", quantity: 1 }, { materialId: "moon_glass", quantity: 6 }],
    sortOrder: 13,
  },
  {
    id: "thulecite_club", name: "Thulecite Club", description: "An ancient weapon made from thulecite with high damage.",
    image: "Thulecite_Club.png", category: ["weapons"], station: "ancient",
    materials: [{ materialId: "thulecite", quantity: 3 }, { materialId: "living_log", quantity: 2 }, { materialId: "nightmare_fuel", quantity: 4 }],
    sortOrder: 14,
  },
  {
    id: "morning_star", name: "Morning Star", description: "An electrified weapon that deals extra damage during rain.",
    image: "Morning_Star.png", category: ["weapons"], station: "science_2",
    materials: [{ materialId: "nitre", quantity: 2 }, { materialId: "electrical_doodad", quantity: 2 }, { materialId: "goldnugget", quantity: 2 }],
    sortOrder: 15,
  },
  {
    id: "electric_dart", name: "Electric Dart", description: "A dart that electrocutes the target.",
    image: "Electric_Dart.png", category: ["weapons"], station: "science_2",
    materials: [{ materialId: "reeds", quantity: 2 }, { materialId: "goldnugget", quantity: 1 }, { materialId: "feather_robin", quantity: 1 }],
    sortOrder: 16,
  },
  {
    id: "gunpowder_item", name: "Gunpowder", description: "An explosive that can be ignited to deal massive damage.",
    image: "Gunpowder.png", category: ["weapons", "refined"], station: "science_2",
    materials: [{ materialId: "charcoal", quantity: 1 }, { materialId: "nitre", quantity: 1 }, { materialId: "rot", quantity: 1 }],
    sortOrder: 17,
  },
  // --- armor (Batch 2) ---
  {
    id: "beekeeper_hat", name: "Beekeeper Hat", description: "A hat that provides protection against bee stings.",
    image: "Beekeeper_Hat.png", category: ["armor", "clothing"], station: "science_1",
    materials: [{ materialId: "silk", quantity: 8 }, { materialId: "rope", quantity: 1 }],
    sortOrder: 9,
  },
  {
    id: "slurtle_armor", name: "Snurtle Shell Armor", description: "A defensive shell that allows hiding inside for full protection.",
    image: "Snurtle_Shell_Armor.png", category: ["armor"], station: "science_2",
    materials: [{ materialId: "slurtle_slime", quantity: 6 }, { materialId: "boards", quantity: 2 }],
    sortOrder: 10,
  },
  {
    id: "scalemail", name: "Scalemail", description: "Fireproof armor made from Dragonfly Scales that sets attackers on fire.",
    image: "Scalemail.png", category: ["armor"], station: "science_2",
    materials: [{ materialId: "log_suit", quantity: 1 }, { materialId: "dragonfly_scales", quantity: 1 }, { materialId: "pigskin", quantity: 3 }],
    sortOrder: 11,
  },
  // --- clothing (Batch 2) ---
  {
    id: "dapper_vest", name: "Dapper Vest", description: "A stylish vest that restores sanity while worn.",
    image: "Dapper_Vest.png", category: ["clothing"], station: "science_2",
    materials: [{ materialId: "tentacle_spots", quantity: 3 }, { materialId: "silk", quantity: 6 }],
    sortOrder: 11,
  },
  {
    id: "hibearnation_vest", name: "Hibearnation Vest", description: "An extremely warm vest that provides the highest cold insulation.",
    image: "Hibearnation_Vest.png", category: ["clothing", "winter"], station: "science_2",
    materials: [{ materialId: "thick_fur", quantity: 1 }, { materialId: "silk", quantity: 8 }, { materialId: "rope", quantity: 2 }],
    sortOrder: 12,
  },
  {
    id: "desert_goggles", name: "Desert Goggles", description: "Goggles that protect against sandstorms in the desert.",
    image: "Desert_Goggles.png", category: ["clothing", "summer"], station: "science_2",
    materials: [{ materialId: "pigskin", quantity: 1 }, { materialId: "desert_stone", quantity: 2 }, { materialId: "bone_shards", quantity: 1 }],
    sortOrder: 13,
  },
  {
    id: "fashion_goggles", name: "Fashion Goggles", description: "Stylish goggles that provide minor sanity restoration.",
    image: "Fashion_Goggles.png", category: ["clothing"], station: "science_2",
    materials: [{ materialId: "goldnugget", quantity: 2 }, { materialId: "pigskin", quantity: 1 }],
    sortOrder: 14,
  },
  {
    id: "summer_frest", name: "Summer Frest", description: "A cool frest hat that provides summer and rain protection.",
    image: "Summer_Frest.png", category: ["clothing", "summer", "rain"], station: "science_2",
    materials: [{ materialId: "boards", quantity: 2 }, { materialId: "rope", quantity: 2 }, { materialId: "down_feather", quantity: 3 }],
    sortOrder: 15,
  },
  {
    id: "flowerhat", name: "Flower Hat", description: "A fancy hat decorated with flowers that attracts bees.",
    image: "Flower_Hat.png", category: ["clothing"], station: "science_1",
    materials: [{ materialId: "petals", quantity: 12 }, { materialId: "silk", quantity: 2 }],
    sortOrder: 16,
  },
  {
    id: "ice_cube", name: "Ice Cube", description: "A block of ice worn on the head to stay cool in summer.",
    image: "Ice_Cube.png", category: ["clothing", "summer"], station: "science_2",
    materials: [{ materialId: "ice", quantity: 10 }, { materialId: "rope", quantity: 4 }, { materialId: "electrical_doodad", quantity: 2 }],
    sortOrder: 17,
  },
  // --- refined (Batch 3) ---
  {
    id: "wax_paper_item", name: "Wax Paper", description: "Paper treated with beeswax used for bundling wraps.",
    image: "Wax_Paper.png", category: ["refined"], station: "science_1",
    materials: [{ materialId: "papyrus", quantity: 1 }, { materialId: "beeswax", quantity: 1 }],
    sortOrder: 6,
  },
  {
    id: "moon_glass_item", name: "Moon Glass", description: "Refined glass from moon shards, used in celestial crafting.",
    image: "Moon_Glass.png", category: ["refined"], station: "celestial",
    materials: [{ materialId: "moon_shard", quantity: 1 }],
    sortOrder: 7,
  },
  {
    id: "thulecite_fragments_item", name: "Thulecite Fragments", description: "Small fragments of thulecite that can be combined into full pieces.",
    image: "Thulecite_Fragments.png", category: ["refined"], station: "ancient",
    materials: [{ materialId: "thulecite", quantity: 1 }],
    sortOrder: 8,
  },
  // --- fishing (Batch 3) ---
  {
    id: "garden_rigamajig", name: "Garden Rigamajig", description: "An advanced tackle for ocean fishing that attracts rare fish.",
    image: "Garden_Rigamajig.png", category: ["fishing"], station: "tackle_station",
    materials: [{ materialId: "twigs", quantity: 3 }, { materialId: "silk", quantity: 3 }],
    sortOrder: 6,
  },
  {
    id: "wobbler_lure", name: "Wobbler", description: "A wobbling lure for ocean fishing.",
    image: "Wobbler.png", category: ["fishing"], station: "tackle_station",
    materials: [{ materialId: "twigs", quantity: 1 }, { materialId: "silk", quantity: 1 }, { materialId: "feather_robin", quantity: 1 }],
    sortOrder: 7,
  },
  {
    id: "rain_fisher", name: "Rain Fisher", description: "A specialized lure that works best during rain.",
    image: "Rain_Fisher.png", category: ["fishing"], station: "tackle_station",
    materials: [{ materialId: "twigs", quantity: 1 }, { materialId: "silk", quantity: 1 }, { materialId: "nitre", quantity: 1 }],
    sortOrder: 8,
  },
  {
    id: "heavy_weighted_lure", name: "Heavy Weighted Lure", description: "A heavy lure for catching deep ocean fish.",
    image: "Heavy_Weighted_Lure.png", category: ["fishing"], station: "tackle_station",
    materials: [{ materialId: "rocks", quantity: 2 }, { materialId: "twigs", quantity: 1 }, { materialId: "silk", quantity: 1 }],
    sortOrder: 9,
  },
  // --- healing (Batch 3) ---
  {
    id: "reviver",  name: "Restorative Heart", description: "A magical heart that can fully resurrect a dead player.",
    image: "Reviver.png", category: ["healing"], station: "magic_2",
    materials: [{ materialId: "red_gem", quantity: 1 }, { materialId: "spider_gland", quantity: 2 }, { materialId: "nightmare_fuel", quantity: 4 }],
    sortOrder: 5,
  },
  // --- food_gardening (Batch 3) ---
  {
    id: "improved_farm", name: "Improved Farm", description: "An upgraded farm with faster growth and more crop slots.",
    image: "Improved_Farm.png", category: ["food_gardening"], station: "science_2",
    materials: [{ materialId: "cutgrass", quantity: 10 }, { materialId: "rot", quantity: 6 }, { materialId: "rocks", quantity: 6 }],
    sortOrder: 6,
  },
  {
    id: "tree_planter", name: "Tree Planter", description: "A planter for growing and managing trees efficiently.",
    image: "Tree_Planter.png", category: ["food_gardening"], station: "science_2",
    materials: [{ materialId: "boards", quantity: 2 }, { materialId: "poop", quantity: 4 }, { materialId: "rocks", quantity: 2 }],
    sortOrder: 7,
  },
  // --- beefalo (Batch 3) ---
  {
    id: "salt_lick", name: "Salt Lick", description: "A salt block that attracts beefalo and helps with domestication.",
    image: "Salt_Lick.png", category: ["beefalo"], station: "science_2",
    materials: [{ materialId: "boards", quantity: 2 }, { materialId: "salt_crystals", quantity: 4 }],
    sortOrder: 4,
  },
  // --- winter (Batch 3) ---
  {
    id: "heating_stone", name: "Heat Stone", description: "A portable stone that absorbs heat from fires to keep you warm.",
    image: "Heat_Stone.png", category: ["winter"], station: "science_2",
    materials: [{ materialId: "rocks", quantity: 10 }, { materialId: "pickaxe", quantity: 1 }, { materialId: "cutstone", quantity: 1 }],
    sortOrder: 3,
  },
  // --- cooking (Batch 3) ---
  {
    id: "portable_grinding_mill", name: "Portable Grinding Mill",
    description: "A portable station for grinding ingredients.",
    image: "Portable_Grinding_Mill.png", category: ["cooking"], station: "science_2",
    materials: [{ materialId: "cutstone", quantity: 3 }, { materialId: "boards", quantity: 2 }, { materialId: "flint", quantity: 3 }],
    sortOrder: 3,
  },
  // --- light (Batch 3) ---
  {
    id: "glowcap", name: "Glowcap", description: "A mushroom light that provides a soft glow without fuel.",
    image: "Glowcap.png", category: ["light"], station: "science_1",
    materials: [{ materialId: "shroom_skin", quantity: 1 }, { materialId: "light_bulb", quantity: 1 }, { materialId: "boards", quantity: 1 }],
    sortOrder: 9,
  },
  {
    id: "wall_lantern", name: "Wall Lantern", description: "A lantern that can be mounted on walls.",
    image: "Wall_Lantern.png", category: ["light"], station: "science_2",
    materials: [{ materialId: "rope", quantity: 1 }, { materialId: "light_bulb", quantity: 1 }, { materialId: "goldnugget", quantity: 2 }],
    sortOrder: 10,
  },
  // --- prototypers (Batch 3) ---
  {
    id: "celestial_altar",  name: "Celestial Altar", description: "A celestial crafting station for moon-powered recipes.",
    image: "Celestial_Altar.png", category: ["prototypers"], station: "celestial",
    materials: [{ materialId: "moon_rock", quantity: 10 }, { materialId: "moon_glass", quantity: 4 }],
    sortOrder: 10,
  },
  {
    id: "ancient_pseudoscience_station", name: "Ancient Pseudoscience Station",
    description: "An ancient crafting station found in the ruins.",
    image: "Ancient_Pseudoscience_Station.png", category: ["prototypers"], station: "none",
    materials: [],
    sortOrder: 11,
  },
  // --- decorations (Batch 3) ---
  {
    id: "potter_sculpture", name: "Potter's Sculpture",
    description: "A decorative sculpture made on the potter's wheel.",
    image: "Potter_Sculpture.png", category: ["decorations"], station: "potter_wheel",
    materials: [{ materialId: "cutstone", quantity: 2 }],
    sortOrder: 7,
  },
  {
    id: "potted_tree", name: "Potted Tree",
    description: "A decorative potted tree for the base.",
    image: "Potted_Tree.png", category: ["decorations"], station: "potter_wheel",
    materials: [{ materialId: "cutgrass", quantity: 5 }, { materialId: "boards", quantity: 1 }],
    sortOrder: 8,
  },
  {
    id: "directional_sign", name: "Directional Sign",
    description: "A sign with an arrow for marking directions.",
    image: "Directional_Sign.png", category: ["decorations"], station: "science_1",
    materials: [{ materialId: "boards", quantity: 1 }, { materialId: "rope", quantity: 1 }],
    sortOrder: 9,
  },
];

// ===== KOREAN TRANSLATIONS FOR NEW + CORRECTED ITEMS =====
const koOverrides = {
  // New items
  trap: { name: "덫" },
  bird_trap: { name: "새 덫" },
  bug_net: { name: "잠자리채" },
  watering_can: { name: "물뿌리개" },
  luxury_pickaxe: { name: "호화 곡괭이" },
  regal_shovel: { name: "제왕의 삽" },
  glass_cutter: { name: "유리 칼" },
  thulecite_club: { name: "튤사이트 곤봉" },
  morning_star: { name: "모닝스타" },
  electric_dart: { name: "전기 다트" },
  gunpowder_item: { name: "화약" },
  beekeeper_hat: { name: "양봉 모자" },
  slurtle_armor: { name: "달팽이 껍데기 갑옷" },
  scalemail: { name: "비늘 갑옷" },
  dapper_vest: { name: "멋진 조끼" },
  hibearnation_vest: { name: "겨울잠 조끼" },
  desert_goggles: { name: "사막 고글" },
  fashion_goggles: { name: "패션 고글" },
  summer_frest: { name: "여름 프레스트" },
  flowerhat: { name: "꽃 모자" },
  ice_cube: { name: "아이스 큐브" },
  wax_paper_item: { name: "왁스 페이퍼" },
  moon_glass_item: { name: "달 유리" },
  thulecite_fragments_item: { name: "튤사이트 조각" },
  garden_rigamajig: { name: "정원 리가마지그" },
  wobbler_lure: { name: "워블러" },
  rain_fisher: { name: "비 낚시 루어" },
  heavy_weighted_lure: { name: "무거운 추 루어" },
  reviver: { name: "부활의 심장" },
  improved_farm: { name: "개량 농장" },
  tree_planter: { name: "나무 재배기" },
  salt_lick: { name: "소금 핥기" },
  heating_stone: { name: "열석" },
  portable_grinding_mill: { name: "휴대용 맷돌" },
  glowcap: { name: "빛나는 버섯" },
  wall_lantern: { name: "벽 랜턴" },
  celestial_altar: { name: "천상의 제단" },
  ancient_pseudoscience_station: { name: "고대 유사과학 제작대" },
  potter_sculpture: { name: "도공 조각품" },
  potted_tree: { name: "나무 화분" },
  directional_sign: { name: "방향 표지판" },

  // === CORRECTIONS (나무위키 기준) ===
  ham_bat: { name: "햄 배트" },
  bat_bat: { name: "배트 배트" },
  weather_pain: { name: "웨더 페인" },
  luxury_axe: { name: "호화 도끼" },
  endothermic_fire: { name: "흡열 모닥불" },
  one_man_band: { name: "원맨 밴드" },
  telelocator_staff: { name: "순간이동 지팡이" },
  telelocator_focus: { name: "순간이동 초점" },
  tail_o_three_cats: { name: "꼬리 세개 달린 채찍" },
  campfire: { name: "모닥불" },
  firepit: { name: "화덕" },
  straw_hat: { name: "밀짚 모자" },
  top_hat: { name: "탑 햇" },
  garland: { name: "꽃 화환" },
  walking_cane: { name: "워킹 케인" },
  rain_coat: { name: "레인 코트" },
  rain_hat: { name: "레인 햇" },
  cat_cap: { name: "캣 캡" },
  breezy_vest: { name: "시원한 조끼" },
  puffy_vest: { name: "푹신한 조끼" },
  log_suit: { name: "통나무 갑옷" },
  marble_suit: { name: "대리석 갑옷" },
  football_helmet: { name: "풋볼 헬멧" },
  night_armour: { name: "어둠의 갑옷" },
  grass_suit: { name: "풀 갑옷" },
  bone_helm: { name: "뼈 투구" },
  shelmet: { name: "조개 투구" },
  dark_sword: { name: "어둠의 검" },
  healing_salve: { name: "치유 연고" },
  honey_poultice: { name: "꿀 습포" },
  booster_shot: { name: "부스터 샷" },
  life_giving_amulet: { name: "생명의 부적" },
  telltale_heart: { name: "고자질쟁이 심장" },
  think_tank: { name: "씽크 탱크" },
  potters_wheel: { name: "도공의 물레" },
  prestihatitator: { name: "프레스티해티테이터" },
  shadow_manipulator: { name: "섀도우 매니퓰레이터" },
  meat_effigy: { name: "고기 인형" },
  night_light: { name: "나이트 라이트" },
  nightmare_amulet: { name: "악몽 부적" },
  chilled_amulet: { name: "냉각 부적" },
  fire_staff: { name: "불의 지팡이" },
  ice_staff: { name: "얼음 지팡이" },
  shadow_logger: { name: "그림자 벌목꾼" },
  shadow_miner: { name: "그림자 광부" },
  shadow_digger: { name: "그림자 굴삭꾼" },
  shadow_duelist: { name: "그림자 결투사" },
  bird_cage: { name: "새장" },
  hay_wall: { name: "건초 벽" },
  wood_wall: { name: "나무 벽" },
  stone_wall: { name: "돌 벽" },
  pig_house: { name: "돼지 집" },
  rabbit_hutch: { name: "토끼 오두막" },
  chest: { name: "상자" },
  scaled_chest: { name: "비늘 상자" },
  tent: { name: "텐트" },
  siesta_lean_to: { name: "시에스타 간이 침대" },
  flingomatic: { name: "소화기" },
  eyebrella: { name: "눈우산" },
  pretty_parasol: { name: "예쁜 양산" },
  boomerang: { name: "부메랑" },
  tooth_trap: { name: "이빨 함정" },
  bee_mine: { name: "벌 지뢰" },
  blow_dart: { name: "독 다트" },
  sleep_dart: { name: "수면 다트" },
  fire_dart: { name: "화염 다트" },
  crock_pot: { name: "요리 솥" },
  drying_rack: { name: "건조대" },
  portable_crock_pot: { name: "휴대용 요리 솥" },
  basic_farm: { name: "정원" },
  garden_hoe: { name: "정원 괭이" },
  garden_digamajig: { name: "정원 만능삽" },
  bee_box: { name: "벌통" },
  mushroom_planter: { name: "버섯 재배기" },
  compost_wrap: { name: "퇴비 포장" },
  thermal_stone: { name: "열석" },
  winter_hat: { name: "겨울 모자" },
  rabbit_earmuffs: { name: "토끼 귀마개" },
  umbrella: { name: "우산" },
  whirly_fan: { name: "부채" },
  luxury_fan: { name: "고급 부채" },
  fashion_melon: { name: "수박 모자" },
  floral_shirt: { name: "꽃무늬 셔츠" },
  science_machine: { name: "과학 기계" },
  alchemy_engine: { name: "연금술 엔진" },
  lightning_rod: { name: "피뢰침" },
  cartography_desk: { name: "지도 제작대" },
  ice_box: { name: "아이스 박스" },
  salt_box: { name: "소금 상자" },
  backpack: { name: "배낭" },
  piggyback: { name: "돼지 배낭" },
  bundling_wrap: { name: "묶음 포장" },
  insulated_pack: { name: "보온 가방" },
};

// ===== APPEND NEW ITEMS TO items.ts =====
let itemsContent = fs.readFileSync(ITEMS_PATH, "utf8");
// Find the closing ];
const closingIdx = itemsContent.lastIndexOf("];");

const newItemsStr = newItems
  .map((item) => {
    const lines = [];
    lines.push(`  {`);
    lines.push(`    id: ${JSON.stringify(item.id)},`);
    lines.push(`    name: ${JSON.stringify(item.name)},`);
    if (item.description.length > 70) {
      lines.push(`    description:`);
      lines.push(`      ${JSON.stringify(item.description)},`);
    } else {
      lines.push(`    description: ${JSON.stringify(item.description)},`);
    }
    lines.push(`    image: ${JSON.stringify(item.image)},`);
    lines.push(`    category: ${JSON.stringify(item.category)},`);
    lines.push(`    station: ${JSON.stringify(item.station)},`);
    if (item.materials.length === 0) {
      lines.push(`    materials: [],`);
    } else if (item.materials.length === 1) {
      const m = item.materials[0];
      lines.push(
        `    materials: [{ materialId: ${JSON.stringify(m.materialId)}, quantity: ${m.quantity} }],`
      );
    } else {
      lines.push(`    materials: [`);
      for (const m of item.materials) {
        lines.push(
          `      { materialId: ${JSON.stringify(m.materialId)}, quantity: ${m.quantity} },`
        );
      }
      lines.push(`    ],`);
    }
    if (item.characterOnly) {
      lines.push(`    characterOnly: ${JSON.stringify(item.characterOnly)},`);
    }
    lines.push(`    sortOrder: ${item.sortOrder},`);
    lines.push(`  },`);
    return lines.join("\n");
  })
  .join("\n");

itemsContent =
  itemsContent.slice(0, closingIdx) + newItemsStr + "\n" + itemsContent.slice(closingIdx);
fs.writeFileSync(ITEMS_PATH, itemsContent);
console.log(`Added ${newItems.length} new items to items.ts`);

// ===== UPDATE ko.ts WITH NEW + CORRECTED TRANSLATIONS =====
let koContent = fs.readFileSync(KO_PATH, "utf8");

for (const [id, entry] of Object.entries(koOverrides)) {
  const nameStr = JSON.stringify(entry.name);
  // Check if the id already exists in the items section
  const existingPattern = new RegExp(`"${id}":\\s*\\{[^}]*\\}`);
  const existingMatch = koContent.match(existingPattern);

  if (existingMatch) {
    // Replace existing entry
    koContent = koContent.replace(
      existingPattern,
      `"${id}": { name: ${nameStr} }`
    );
  } else {
    // Add new entry in the items section (before the closing })
    // Find "items: {" and add before its closing "  },"
    const itemsSectionEnd = koContent.indexOf("  },\n  materials:");
    if (itemsSectionEnd > -1) {
      koContent =
        koContent.slice(0, itemsSectionEnd) +
        `    "${id}": { name: ${nameStr} },\n` +
        koContent.slice(itemsSectionEnd);
    }
  }
}

fs.writeFileSync(KO_PATH, koContent);
console.log(`Updated ko.ts with ${Object.keys(koOverrides).length} translations`);

console.log("\nDone!");
