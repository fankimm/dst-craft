export type CraftingStation =
  | "none"
  | "science_1"
  | "science_2"
  | "magic_1"
  | "magic_2"
  | "ancient"
  | "celestial"
  | "think_tank"
  | "cartography"
  | "tackle_station"
  | "potter_wheel"
  | "character";

export type CategoryId =
  | "character"
  | "tools"
  | "light"
  | "prototypers"
  | "refined"
  | "weapons"
  | "armor"
  | "clothing"
  | "healing"
  | "magic"
  | "decorations"
  | "structures"
  | "storage"
  | "cooking"
  | "food_gardening"
  | "fishing"
  | "seafaring"
  | "beefalo"
  | "winter"
  | "summer"
  | "rain";

export interface CraftingItem {
  id: string;
  nameEn: string;
  nameKo: string;
  description: string;
  descriptionKo?: string;
  image: string;
  category: CategoryId[];
  station: CraftingStation;
  materials: { materialId: string; quantity: number }[];
  characterOnly?: string;
  sortOrder: number;
}

export interface Category {
  id: CategoryId;
  nameEn: string;
  nameKo: string;
  icon: string;
  order: number;
}

export interface Material {
  id: string;
  nameEn: string;
  nameKo: string;
  image: string;
}

export interface Character {
  id: string;
  nameEn: string;
  nameKo: string;
  portrait: string;
}
