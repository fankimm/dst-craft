import type { CraftingItem } from "@/lib/types";

export const refinedItems: CraftingItem[] = [
  {
    id: "boards",
    nameEn: "Boards",
    nameKo: "나무 판자",
    description: "Refined wood planks used in advanced crafting.",
    image: "Boards.png",
    category: ["refined"],
    station: "science_1",
    materials: [
      { materialId: "log", quantity: 4 },
    ],
    sortOrder: 0,
  },
  {
    id: "cutstone",
    nameEn: "Cut Stone",
    nameKo: "돌 블록",
    description: "Refined stone blocks used in advanced crafting.",
    image: "Cut_Stone.png",
    category: ["refined"],
    station: "science_1",
    materials: [
      { materialId: "rocks", quantity: 3 },
    ],
    sortOrder: 1,
  },
  {
    id: "rope",
    nameEn: "Rope",
    nameKo: "밧줄",
    description: "Braided grass rope used in many crafting recipes.",
    image: "Rope.png",
    category: ["refined"],
    station: "science_1",
    materials: [
      { materialId: "cutgrass", quantity: 3 },
    ],
    sortOrder: 2,
  },
  {
    id: "papyrus",
    nameEn: "Papyrus",
    nameKo: "파피루스",
    description: "Paper-like material made from reeds.",
    image: "Papyrus.png",
    category: ["refined"],
    station: "science_1",
    materials: [
      { materialId: "reeds", quantity: 4 },
    ],
    sortOrder: 3,
  },
  {
    id: "purple_gem",
    nameEn: "Purple Gem",
    nameKo: "보라 보석",
    description: "A magical gem created by combining red and blue gems.",
    image: "Purple_Gem.png",
    category: ["refined"],
    station: "magic_1",
    materials: [
      { materialId: "red_gem", quantity: 1 },
      { materialId: "blue_gem", quantity: 1 },
    ],
    sortOrder: 4,
  },
  {
    id: "electrical_doodad",
    nameEn: "Electrical Doodad",
    nameKo: "전기 부품",
    description: "An electrical component used in advanced science recipes.",
    image: "Electrical_Doodad.png",
    category: ["refined"],
    station: "science_2",
    materials: [
      { materialId: "goldnugget", quantity: 2 },
      { materialId: "cutstone", quantity: 1 },
    ],
    sortOrder: 5,
  },
];
