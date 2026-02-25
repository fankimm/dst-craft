import type { CraftingItem } from "@/lib/types";

export const cookingItems: CraftingItem[] = [
  {
    id: "crock_pot",
    nameEn: "Crock Pot",
    nameKo: "요리 솥",
    description:
      "A cooking station that combines ingredients into powerful recipes.",
    image: "Crock_Pot.png",
    category: ["cooking"],
    station: "science_1",
    materials: [
      { materialId: "cutstone", quantity: 3 },
      { materialId: "charcoal", quantity: 6 },
      { materialId: "twigs", quantity: 6 },
    ],
    sortOrder: 0,
  },
  {
    id: "drying_rack",
    nameEn: "Drying Rack",
    nameKo: "건조대",
    description:
      "A rack for drying meat into jerky, which lasts longer and restores sanity.",
    image: "Drying_Rack.png",
    category: ["cooking"],
    station: "science_1",
    materials: [
      { materialId: "twigs", quantity: 3 },
      { materialId: "charcoal", quantity: 2 },
      { materialId: "rope", quantity: 3 },
    ],
    sortOrder: 1,
  },
  {
    id: "portable_crock_pot",
    nameEn: "Portable Crock Pot",
    nameKo: "휴대용 요리 솥",
    description:
      "A portable cooking station that can be placed and picked up.",
    image: "Portable_Crock_Pot.png",
    category: ["cooking"],
    station: "science_2",
    materials: [
      { materialId: "cutstone", quantity: 3 },
      { materialId: "charcoal", quantity: 6 },
      { materialId: "goldnugget", quantity: 2 },
    ],
    sortOrder: 2,
  },
];
