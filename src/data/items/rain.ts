import type { CraftingItem } from "@/lib/types";

export const rainItems: CraftingItem[] = [
  {
    id: "eyebrella",
    nameEn: "Eyebrella",
    nameKo: "눈우산",
    description:
      "A powerful umbrella hat made from a Deerclops Eyeball that provides complete rain and lightning protection.",
    image: "Eyebrella.png",
    category: ["rain", "clothing", "summer"],
    station: "science_2",
    materials: [
      { materialId: "deerclops_eyeball", quantity: 1 },
      { materialId: "twigs", quantity: 15 },
      { materialId: "bone_shards", quantity: 4 },
    ],
    sortOrder: 0,
  },
  {
    id: "pretty_parasol",
    nameEn: "Pretty Parasol",
    nameKo: "예쁜 양산",
    description:
      "A pretty handheld parasol that provides some protection from rain.",
    image: "Pretty_Parasol.png",
    category: ["rain"],
    station: "science_1",
    materials: [
      { materialId: "cutgrass", quantity: 6 },
      { materialId: "twigs", quantity: 4 },
      { materialId: "petals", quantity: 12 },
    ],
    sortOrder: 1,
  },
];
