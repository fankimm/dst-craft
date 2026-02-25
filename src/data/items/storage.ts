import type { CraftingItem } from "@/lib/types";

export const storageItems: CraftingItem[] = [
  {
    id: "ice_box",
    nameEn: "Ice Box",
    nameKo: "아이스 박스",
    description:
      "A refrigeration unit that keeps food fresh for longer.",
    image: "Ice_Box.png",
    category: ["storage"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 1 },
      { materialId: "goldnugget", quantity: 2 },
      { materialId: "gears", quantity: 1 },
    ],
    sortOrder: 0,
  },
  {
    id: "salt_box",
    nameEn: "Salt Box",
    nameKo: "소금 상자",
    description:
      "A storage container that preserves food even better than an Ice Box.",
    image: "Salt_Box.png",
    category: ["storage"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 2 },
      { materialId: "cutstone", quantity: 1 },
      { materialId: "salt_crystals", quantity: 2 },
    ],
    sortOrder: 1,
  },
  {
    id: "backpack",
    nameEn: "Backpack",
    nameKo: "배낭",
    description:
      "A wearable container that provides extra inventory slots.",
    image: "Backpack.png",
    category: ["storage"],
    station: "science_1",
    materials: [
      { materialId: "cutgrass", quantity: 4 },
      { materialId: "twigs", quantity: 4 },
    ],
    sortOrder: 2,
  },
  {
    id: "piggyback",
    nameEn: "Piggyback",
    nameKo: "돼지 등짐",
    description:
      "A large backpack that provides many inventory slots but slows movement.",
    image: "Piggyback.png",
    category: ["storage"],
    station: "science_2",
    materials: [
      { materialId: "pigskin", quantity: 4 },
      { materialId: "silk", quantity: 6 },
      { materialId: "rope", quantity: 2 },
    ],
    sortOrder: 3,
  },
  {
    id: "bundling_wrap",
    nameEn: "Bundling Wrap",
    nameKo: "묶음 포장",
    description:
      "A wrap that bundles items together, preserving freshness of food inside.",
    image: "Bundling_Wrap.png",
    category: ["storage"],
    station: "science_1",
    materials: [
      { materialId: "rope", quantity: 1 },
      { materialId: "wax_paper", quantity: 1 },
    ],
    sortOrder: 4,
  },
  {
    id: "insulated_pack",
    nameEn: "Insulated Pack",
    nameKo: "보온 배낭",
    description:
      "A wearable container that keeps food fresh while being carried.",
    image: "Insulated_Pack.png",
    category: ["storage"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 1 },
      { materialId: "electrical_doodad", quantity: 1 },
      { materialId: "beefalo_wool", quantity: 3 },
    ],
    sortOrder: 5,
  },
];
