import type { CraftingItem } from "@/lib/types";

export const foodGardeningItems: CraftingItem[] = [
  {
    id: "basic_farm",
    nameEn: "Basic Farm",
    nameKo: "농장",
    description:
      "A farming plot for growing vegetables and other crops.",
    image: "Basic_Farm.png",
    category: ["food_gardening"],
    station: "science_1",
    materials: [
      { materialId: "cutgrass", quantity: 8 },
      { materialId: "rot", quantity: 4 },
      { materialId: "rocks", quantity: 4 },
    ],
    sortOrder: 0,
  },
  {
    id: "garden_hoe",
    nameEn: "Garden Hoe",
    nameKo: "정원 괭이",
    description: "A tool for tilling soil in garden plots.",
    image: "Garden_Hoe.png",
    category: ["food_gardening"],
    station: "science_1",
    materials: [
      { materialId: "twigs", quantity: 2 },
      { materialId: "flint", quantity: 2 },
    ],
    sortOrder: 1,
  },
  {
    id: "garden_digamajig",
    nameEn: "Garden Digamajig",
    nameKo: "정원 만능삽",
    description:
      "An advanced gardening tool for creating and managing garden plots.",
    image: "Garden_Digamajig.png",
    category: ["food_gardening"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 2 },
      { materialId: "rope", quantity: 2 },
      { materialId: "flint", quantity: 2 },
    ],
    sortOrder: 2,
  },
  {
    id: "bee_box",
    nameEn: "Bee Box",
    nameKo: "양봉 상자",
    description:
      "A structure that houses bees and produces honey over time.",
    image: "Bee_Box.png",
    category: ["food_gardening"],
    station: "science_1",
    materials: [
      { materialId: "boards", quantity: 2 },
      { materialId: "honeycomb", quantity: 1 },
      { materialId: "bee", quantity: 4 },
    ],
    sortOrder: 3,
  },
  {
    id: "mushroom_planter",
    nameEn: "Mushroom Planter",
    nameKo: "버섯 재배기",
    description:
      "A planter for growing mushrooms using living logs and rot.",
    image: "Mushroom_Planter.png",
    category: ["food_gardening"],
    station: "science_2",
    materials: [
      { materialId: "living_log", quantity: 1 },
      { materialId: "rot", quantity: 8 },
      { materialId: "boards", quantity: 2 },
    ],
    sortOrder: 4,
  },
  {
    id: "compost_wrap",
    nameEn: "Compost Wrap",
    nameKo: "퇴비 포장",
    description:
      "A fertilizer wrap that can be applied to garden plots to boost growth.",
    image: "Compost_Wrap.png",
    category: ["food_gardening"],
    station: "science_1",
    materials: [
      { materialId: "rot", quantity: 5 },
      { materialId: "nitre", quantity: 1 },
      { materialId: "poop", quantity: 1 },
    ],
    sortOrder: 5,
  },
];
