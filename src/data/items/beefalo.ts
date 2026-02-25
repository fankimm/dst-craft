import type { CraftingItem } from "@/lib/types";

export const beefaloItems: CraftingItem[] = [
  {
    id: "saddle",
    nameEn: "Saddle",
    nameKo: "안장",
    description:
      "A basic saddle for riding beefalo, providing moderate speed.",
    image: "Saddle.png",
    category: ["beefalo"],
    station: "science_2",
    materials: [
      { materialId: "pigskin", quantity: 4 },
      { materialId: "goldnugget", quantity: 4 },
      { materialId: "beefalo_wool", quantity: 4 },
    ],
    sortOrder: 0,
  },
  {
    id: "war_saddle",
    nameEn: "War Saddle",
    nameKo: "전쟁 안장",
    description:
      "A heavy saddle that increases beefalo damage at the cost of speed.",
    image: "War_Saddle.png",
    category: ["beefalo"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 4 },
      { materialId: "steel_wool", quantity: 4 },
      { materialId: "log", quantity: 10 },
    ],
    sortOrder: 1,
  },
  {
    id: "glossamer_saddle",
    nameEn: "Glossamer Saddle",
    nameKo: "투명한 안장",
    description:
      "A lightweight saddle that provides maximum beefalo speed.",
    image: "Glossamer_Saddle.png",
    category: ["beefalo"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 4 },
      { materialId: "silk", quantity: 4 },
      { materialId: "butterfly_wings", quantity: 68 },
    ],
    sortOrder: 2,
  },
  {
    id: "beefalo_bell",
    nameEn: "Beefalo Bell",
    nameKo: "비팔로 종",
    description:
      "A bell that bonds a beefalo to the player, making it follow them.",
    image: "Beefalo_Bell.png",
    category: ["beefalo"],
    station: "science_2",
    materials: [
      { materialId: "goldnugget", quantity: 3 },
      { materialId: "flint", quantity: 1 },
    ],
    sortOrder: 3,
  },
];
