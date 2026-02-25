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
  name: string;
  description: string;
  image: string;
  category: CategoryId[];
  station: CraftingStation;
  materials: { materialId: string; quantity: number }[];
  characterOnly?: string;
  sortOrder: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  order: number;
}

export interface Material {
  id: string;
  name: string;
  image: string;
}

export interface Character {
  id: string;
  name: string;
  portrait: string;
}
