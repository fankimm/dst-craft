import type { CraftingItem } from "@/lib/types";

export const summerItems: CraftingItem[] = [
  {
    id: "umbrella",
    nameEn: "Umbrella",
    nameKo: "우산",
    description:
      "A handheld umbrella that provides protection from rain and summer heat.",
    image: "Umbrella.png",
    category: ["summer", "rain"],
    station: "science_1",
    materials: [
      { materialId: "twigs", quantity: 6 },
      { materialId: "pigskin", quantity: 1 },
      { materialId: "silk", quantity: 2 },
    ],
    sortOrder: 0,
  },
  {
    id: "whirly_fan",
    nameEn: "Whirly Fan",
    nameKo: "부채",
    description:
      "A simple fan that cools the player down when used.",
    image: "Whirly_Fan.png",
    category: ["summer"],
    station: "science_1",
    materials: [
      { materialId: "cutgrass", quantity: 3 },
      { materialId: "twigs", quantity: 1 },
      { materialId: "petals", quantity: 1 },
    ],
    sortOrder: 1,
  },
  {
    id: "luxury_fan",
    nameEn: "Luxury Fan",
    nameKo: "고급 부채",
    description:
      "A powerful fan that greatly cools the user and can extinguish fires.",
    image: "Luxury_Fan.png",
    category: ["summer"],
    station: "science_2",
    materials: [
      { materialId: "down_feather", quantity: 5 },
      { materialId: "cutgrass", quantity: 2 },
      { materialId: "rope", quantity: 2 },
    ],
    sortOrder: 2,
  },
  {
    id: "fashion_melon",
    nameEn: "Fashion Melon",
    nameKo: "수박 모자",
    description:
      "A watermelon helmet that keeps the wearer cool in summer.",
    image: "Fashion_Melon.png",
    category: ["summer", "clothing"],
    station: "science_1",
    materials: [
      { materialId: "watermelon", quantity: 1 },
      { materialId: "twigs", quantity: 3 },
    ],
    sortOrder: 3,
  },
  {
    id: "floral_shirt",
    nameEn: "Floral Shirt",
    nameKo: "꽃무늬 셔츠",
    description:
      "A flowery shirt that provides excellent cooling and summer protection.",
    image: "Floral_Shirt.png",
    category: ["summer", "clothing"],
    station: "science_2",
    materials: [
      { materialId: "cactus_flower", quantity: 5 },
      { materialId: "papyrus", quantity: 3 },
      { materialId: "boards", quantity: 3 },
    ],
    sortOrder: 4,
  },
];
