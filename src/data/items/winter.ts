import type { CraftingItem } from "@/lib/types";

export const winterItems: CraftingItem[] = [
  {
    id: "thermal_stone",
    nameEn: "Thermal Stone",
    nameKo: "열석",
    description:
      "A stone that absorbs and radiates temperature, helping to regulate body heat.",
    image: "Thermal_Stone.png",
    category: ["winter"],
    station: "science_2",
    materials: [
      { materialId: "rocks", quantity: 10 },
      { materialId: "pickaxe", quantity: 1 },
      { materialId: "cutstone", quantity: 1 },
    ],
    sortOrder: 0,
  },
  {
    id: "winter_hat",
    nameEn: "Winter Hat",
    nameKo: "겨울 모자",
    description:
      "A warm hat that provides good insulation against the cold.",
    image: "Winter_Hat.png",
    category: ["winter", "clothing"],
    station: "science_1",
    materials: [
      { materialId: "beefalo_wool", quantity: 4 },
      { materialId: "silk", quantity: 4 },
    ],
    sortOrder: 1,
  },
  {
    id: "rabbit_earmuffs",
    nameEn: "Rabbit Earmuffs",
    nameKo: "토끼 귀마개",
    description:
      "Earmuffs made from rabbit fur that provide minor cold insulation.",
    image: "Rabbit_Earmuffs.png",
    category: ["winter", "clothing"],
    station: "science_1",
    materials: [
      { materialId: "rabbit", quantity: 2 },
      { materialId: "twigs", quantity: 1 },
    ],
    sortOrder: 2,
  },
];
