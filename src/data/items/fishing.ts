import type { CraftingItem } from "@/lib/types";

export const fishingItems: CraftingItem[] = [
  {
    id: "fishing_rod",
    nameEn: "Fishing Rod",
    nameKo: "낚싯대",
    description: "A basic rod for fishing in ponds.",
    image: "Fishing_Rod.png",
    category: ["fishing"],
    station: "science_1",
    materials: [
      { materialId: "twigs", quantity: 2 },
      { materialId: "silk", quantity: 2 },
    ],
    sortOrder: 0,
  },
  {
    id: "ocean_fishing_rod",
    nameEn: "Ocean Fishing Rod",
    nameKo: "바다 낚싯대",
    description: "An advanced fishing rod designed for ocean fishing.",
    image: "Ocean_Fishing_Rod.png",
    category: ["fishing"],
    station: "science_2",
    materials: [
      { materialId: "boards", quantity: 1 },
      { materialId: "silk", quantity: 2 },
    ],
    sortOrder: 1,
  },
  {
    id: "tackle_receptacle",
    nameEn: "Tackle Receptacle",
    nameKo: "낚시 도구함",
    description:
      "A crafting station for creating fishing tackle and lures.",
    image: "Tackle_Receptacle.png",
    category: ["fishing"],
    station: "science_1",
    materials: [
      { materialId: "boards", quantity: 1 },
      { materialId: "rope", quantity: 1 },
    ],
    sortOrder: 2,
  },
  {
    id: "spinnerbait",
    nameEn: "Spinnerbait",
    nameKo: "스피너베이트",
    description:
      "A fishing lure that attracts specific types of ocean fish.",
    image: "Spinnerbait.png",
    category: ["fishing"],
    station: "tackle_station",
    materials: [
      { materialId: "twigs", quantity: 1 },
      { materialId: "silk", quantity: 1 },
      { materialId: "hound_tooth", quantity: 1 },
    ],
    sortOrder: 3,
  },
  {
    id: "spinner",
    nameEn: "Spinner",
    nameKo: "스피너",
    description: "A basic fishing lure for ocean fishing.",
    image: "Spinner.png",
    category: ["fishing"],
    station: "tackle_station",
    materials: [
      { materialId: "twigs", quantity: 2 },
      { materialId: "silk", quantity: 2 },
    ],
    sortOrder: 4,
  },
  {
    id: "bobber",
    nameEn: "Bobber",
    nameKo: "찌",
    description:
      "A fishing float that helps detect when a fish is biting.",
    image: "Bobber.png",
    category: ["fishing"],
    station: "tackle_station",
    materials: [
      { materialId: "twigs", quantity: 1 },
      { materialId: "feather_crow", quantity: 1 },
    ],
    sortOrder: 5,
  },
];
