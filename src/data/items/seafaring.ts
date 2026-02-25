import type { CraftingItem } from "@/lib/types";

export const seafaringItems: CraftingItem[] = [
  {
    id: "boat_kit",
    nameEn: "Boat Kit",
    nameKo: "보트 키트",
    description:
      "A kit that deploys a boat when placed on the ocean.",
    image: "Boat_Kit.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 4 },
    ],
    sortOrder: 0,
  },
  {
    id: "oar",
    nameEn: "Oar",
    nameKo: "노",
    description: "A basic rowing tool for propelling a boat.",
    image: "Oar.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 1 },
    ],
    sortOrder: 1,
  },
  {
    id: "driftwood_oar",
    nameEn: "Driftwood Oar",
    nameKo: "유목 노",
    description: "A lightweight oar made from driftwood.",
    image: "Driftwood_Oar.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "driftwood", quantity: 1 },
    ],
    sortOrder: 2,
  },
  {
    id: "mast",
    nameEn: "Mast",
    nameKo: "돛대",
    description:
      "A sail mast that allows the boat to be propelled by wind.",
    image: "Mast.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 3 },
      { materialId: "rope", quantity: 3 },
      { materialId: "silk", quantity: 3 },
    ],
    sortOrder: 3,
  },
  {
    id: "anchor_kit",
    nameEn: "Anchor Kit",
    nameKo: "닻 키트",
    description:
      "An anchor that keeps the boat stationary when deployed.",
    image: "Anchor_Kit.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 2 },
      { materialId: "rope", quantity: 3 },
      { materialId: "cutstone", quantity: 3 },
    ],
    sortOrder: 4,
  },
  {
    id: "steering_wheel_kit",
    nameEn: "Steering Wheel Kit",
    nameKo: "조타 키트",
    description:
      "A steering wheel that allows precise control of the boat's direction.",
    image: "Steering_Wheel_Kit.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 2 },
      { materialId: "rope", quantity: 1 },
    ],
    sortOrder: 5,
  },
  {
    id: "tin_fishin_bin",
    nameEn: "Tin Fishin' Bin",
    nameKo: "틴 낚시통",
    description:
      "A storage bin attached to the boat for storing caught fish.",
    image: "Tin_Fishin_Bin.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "cutstone", quantity: 1 },
      { materialId: "rope", quantity: 1 },
    ],
    sortOrder: 6,
  },
  {
    id: "boat_patch",
    nameEn: "Boat Patch",
    nameKo: "보트 수리",
    description: "A patch for repairing leaks in the boat.",
    image: "Boat_Patch.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 1 },
      { materialId: "stinger", quantity: 2 },
    ],
    sortOrder: 7,
  },
  {
    id: "deck",
    nameEn: "Plank",
    nameKo: "갑판",
    description:
      "A plank that extends the walking area on a boat.",
    image: "Plank.png",
    category: ["seafaring"],
    station: "think_tank",
    materials: [
      { materialId: "boards", quantity: 1 },
    ],
    sortOrder: 8,
  },
];
