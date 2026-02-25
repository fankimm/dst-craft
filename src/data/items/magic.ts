import type { CraftingItem } from "@/lib/types";

export const magicItems: CraftingItem[] = [
  {
    id: "meat_effigy",
    nameEn: "Meat Effigy",
    nameKo: "고기 인형",
    description:
      "A creepy effigy that allows the player to resurrect at its location upon death.",
    image: "Meat_Effigy.png",
    category: ["magic"],
    station: "magic_1",
    materials: [
      { materialId: "boards", quantity: 4 },
      { materialId: "beard_hair", quantity: 4 },
      { materialId: "nightmare_fuel", quantity: 4 },
    ],
    sortOrder: 0,
  },
  {
    id: "night_light",
    nameEn: "Night Light",
    nameKo: "밤의 조명",
    description:
      "A magical light fueled by nightmare fuel that drains sanity of nearby players.",
    image: "Night_Light.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "goldnugget", quantity: 8 },
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "red_gem", quantity: 1 },
    ],
    sortOrder: 1,
  },
  {
    id: "one_man_band",
    nameEn: "One-man Band",
    nameKo: "1인 밴드",
    description:
      "A wearable instrument that causes nearby creatures to follow the player.",
    image: "One-man_Band.png",
    category: ["magic"],
    station: "magic_1",
    materials: [
      { materialId: "goldnugget", quantity: 2 },
      { materialId: "nightmare_fuel", quantity: 4 },
      { materialId: "pigskin", quantity: 1 },
    ],
    sortOrder: 2,
  },
  {
    id: "nightmare_amulet",
    nameEn: "Nightmare Amulet",
    nameKo: "악몽 부적",
    description:
      "An amulet that rapidly drains sanity, allowing the wearer to interact with shadow creatures.",
    image: "Nightmare_Amulet.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "goldnugget", quantity: 6 },
      { materialId: "nightmare_fuel", quantity: 4 },
      { materialId: "purple_gem", quantity: 1 },
    ],
    sortOrder: 3,
  },
  {
    id: "chilled_amulet",
    nameEn: "Chilled Amulet",
    nameKo: "냉각 부적",
    description:
      "An amulet that keeps the wearer cool and can freeze nearby enemies.",
    image: "Chilled_Amulet.png",
    category: ["magic"],
    station: "magic_1",
    materials: [
      { materialId: "goldnugget", quantity: 3 },
      { materialId: "blue_gem", quantity: 1 },
    ],
    sortOrder: 4,
  },
  {
    id: "fire_staff",
    nameEn: "Fire Staff",
    nameKo: "불의 지팡이",
    description: "A magical staff that sets targets on fire from a distance.",
    image: "Fire_Staff.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "red_gem", quantity: 1 },
      { materialId: "spear", quantity: 1 },
    ],
    sortOrder: 5,
  },
  {
    id: "ice_staff",
    nameEn: "Ice Staff",
    nameKo: "얼음 지팡이",
    description: "A magical staff that freezes targets from a distance.",
    image: "Ice_Staff.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "blue_gem", quantity: 1 },
      { materialId: "spear", quantity: 1 },
    ],
    sortOrder: 6,
  },
  {
    id: "telelocator_staff",
    nameEn: "Telelocator Staff",
    nameKo: "텔레포커스 지팡이",
    description:
      "A staff that teleports the target to a random location, or to a Telelocator Focus.",
    image: "Telelocator_Staff.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 4 },
      { materialId: "living_log", quantity: 2 },
      { materialId: "purple_gem", quantity: 2 },
    ],
    sortOrder: 7,
  },
  {
    id: "telelocator_focus",
    nameEn: "Telelocator Focus",
    nameKo: "텔레포커스 초점",
    description:
      "A structure that acts as a destination for Telelocator Staff teleportation.",
    image: "Telelocator_Focus.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 4 },
      { materialId: "living_log", quantity: 3 },
      { materialId: "goldnugget", quantity: 8 },
    ],
    sortOrder: 8,
  },
  {
    id: "shadow_logger",
    nameEn: "Shadow Logger",
    nameKo: "그림자 벌목꾼",
    description:
      "A shadow worker that automatically chops trees near the player.",
    image: "Shadow_Logger.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "living_log", quantity: 1 },
    ],
    sortOrder: 9,
  },
  {
    id: "shadow_miner",
    nameEn: "Shadow Miner",
    nameKo: "그림자 광부",
    description:
      "A shadow worker that automatically mines rocks near the player.",
    image: "Shadow_Miner.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "living_log", quantity: 1 },
    ],
    sortOrder: 10,
  },
  {
    id: "shadow_digger",
    nameEn: "Shadow Digger",
    nameKo: "그림자 굴삭꾼",
    description:
      "A shadow worker that automatically digs things near the player.",
    image: "Shadow_Digger.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "living_log", quantity: 1 },
    ],
    sortOrder: 11,
  },
  {
    id: "shadow_duelist",
    nameEn: "Shadow Duelist",
    nameKo: "그림자 결투사",
    description:
      "A shadow fighter that attacks enemies near the player.",
    image: "Shadow_Duelist.png",
    category: ["magic"],
    station: "magic_2",
    materials: [
      { materialId: "nightmare_fuel", quantity: 2 },
      { materialId: "living_log", quantity: 1 },
    ],
    sortOrder: 12,
  },
];
