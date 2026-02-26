import type { CategoryId, CraftingStation, CraftingItem, Material, Category, Character } from "@/lib/types";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { materials } from "@/data/materials";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { stationName } from "@/lib/i18n";

export function getItemsByCategory(categoryId: CategoryId): CraftingItem[] {
  return allItems
    .filter((item) => item.category.includes(categoryId))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getItemById(id: string): CraftingItem | undefined {
  return allItems.find((item) => item.id === id);
}

export function getMaterialById(id: string): Material | undefined {
  return materials.find((material) => material.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

// Station image paths (shared between ItemDetail and search suggestions)
export const stationImages: Record<CraftingStation, string | null> = {
  none: null,
  science_1: "items/Science_Machine.png",
  science_2: "items/Alchemy_Engine.png",
  magic_1: "items/Prestihatitator.png",
  magic_2: "items/Shadow_Manipulator.png",
  ancient: "items/Ancient_Pseudoscience_Station.png",
  celestial: "items/Celestial_Altar.png",
  think_tank: "items/Think_Tank.png",
  cartography: "items/Cartography_Desk.png",
  tackle_station: "items/Tackle_Receptacle.png",
  potter_wheel: "items/Potter's_Wheel.png",
  bookstation: "items/Bookcase.png",
  portableblender: "items/Portable_Grinding_Mill.png",
  lunar_forge: "category-icons/magic.png",
  shadow_forge: "category-icons/magic.png",
  carpentry_station: "items/Carpentry_Station.png",
  turfcraftingstation: "items/Turfcraftingstation.png",
  critter_lab: "category-icons/decorations.png",
  character: null,
};

// Build material name lookup for search (lazy-initialized)
let _materialNameMap: Map<string, string[]> | null = null;
function getMaterialNameMap(): Map<string, string[]> {
  if (_materialNameMap) return _materialNameMap;
  _materialNameMap = new Map();
  for (const mat of materials) {
    const names = [mat.name.toLowerCase()];
    const koName = ko.materials[mat.id]?.name;
    if (koName) names.push(koName.toLowerCase());
    _materialNameMap.set(mat.id, names);
  }
  return _materialNameMap;
}

// Build station name lookup for search (lazy-initialized)
let _stationNameMap: Map<CraftingStation, string[]> | null = null;
function getStationNameMap(): Map<CraftingStation, string[]> {
  if (_stationNameMap) return _stationNameMap;
  _stationNameMap = new Map();
  const stationIds = [...new Set(allItems.map((i) => i.station))].filter(
    (s) => s !== "none" && s !== "character"
  ) as CraftingStation[];
  for (const id of stationIds) {
    const names = new Set<string>();
    names.add(stationName(id, "en").toLowerCase());
    names.add(stationName(id, "ko").toLowerCase());
    _stationNameMap.set(id, [...names]);
  }
  return _stationNameMap;
}

function itemMatchesQuery(item: CraftingItem, lowerQuery: string, matNameMap: Map<string, string[]>): boolean {
  // Check item name (en + ko)
  if (item.name.toLowerCase().includes(lowerQuery)) return true;
  if (ko.items[item.id]?.name?.toLowerCase().includes(lowerQuery)) return true;
  // Check description
  if (item.description.toLowerCase().includes(lowerQuery)) return true;
  // Check station name
  const stationNames = getStationNameMap().get(item.station);
  if (stationNames?.some((n) => n.includes(lowerQuery))) return true;
  // Check character name
  if (item.characterOnly) {
    const char = characters.find(c => c.id === item.characterOnly);
    if (char) {
      if (char.name.toLowerCase().includes(lowerQuery)) return true;
      if (ko.characters[char.id]?.name?.toLowerCase().includes(lowerQuery)) return true;
    }
  }
  // Check category name
  for (const catId of item.category) {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      if (cat.name.toLowerCase().includes(lowerQuery)) return true;
      if (ko.categories[catId]?.name?.toLowerCase().includes(lowerQuery)) return true;
    }
  }
  // Check materials
  for (const m of item.materials) {
    for (const name of (matNameMap.get(m.materialId) || [])) {
      if (name.includes(lowerQuery)) return true;
    }
  }
  return false;
}

export function searchItems(query: string): CraftingItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  const matNameMap = getMaterialNameMap();
  return allItems.filter(item => itemMatchesQuery(item, lowerQuery, matNameMap));
}

export function searchItemsByTags(tags: string[]): CraftingItem[] {
  if (tags.length === 0) return [];
  const lowerTags = tags.map(t => t.toLowerCase().trim()).filter(Boolean);
  if (lowerTags.length === 0) return [];
  const matNameMap = getMaterialNameMap();
  return allItems.filter(item =>
    lowerTags.every(tag => itemMatchesQuery(item, tag, matNameMap))
  );
}

export function getCharacterItems(characterId: string): CraftingItem[] {
  return allItems
    .filter((item) => item.characterOnly === characterId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Find a craftable item whose id matches the given material id */
export function getItemByMaterialId(materialId: string): CraftingItem | undefined {
  return allItems.find((item) => item.id === materialId);
}

export function getCharacterById(characterId: string): Character | undefined {
  return characters.find((c) => c.id === characterId);
}

// --- Tag classification ---
export type TagType = "character" | "category" | "station" | "material" | "text";
export interface SearchTag {
  text: string;
  type: TagType;
  portrait?: string; // character portrait id
}

export function classifyTag(text: string): SearchTag {
  const lower = text.toLowerCase().trim();

  // Check characters (en + ko) — partial match
  for (const char of characters) {
    if (
      char.name.toLowerCase().includes(lower) ||
      ko.characters[char.id]?.name?.toLowerCase().includes(lower)
    ) {
      return { text, type: "character", portrait: char.portrait };
    }
  }

  // Check categories (en + ko) — partial match
  for (const cat of categories) {
    if (
      cat.name.toLowerCase().includes(lower) ||
      ko.categories[cat.id]?.name?.toLowerCase().includes(lower)
    ) {
      return { text, type: "category" };
    }
  }

  // Check stations (en + ko) — partial match
  for (const [, names] of getStationNameMap()) {
    if (names.some((n) => n.includes(lower))) {
      return { text, type: "station" };
    }
  }

  // Check materials (en + ko) — partial match
  const matNameMap = getMaterialNameMap();
  for (const [, names] of matNameMap) {
    if (names.some((n) => n.includes(lower))) {
      return { text, type: "material" };
    }
  }

  return { text, type: "text" };
}

// --- Autocomplete suggestions ---
export interface Suggestion {
  text: string;
  type: TagType;
  portrait?: string;
  /** Image path relative to /images/ */
  image?: string;
}

const MAX_SUGGESTIONS = 6;

export function getSuggestions(query: string): Suggestion[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];

  const results: Suggestion[] = [];

  // Characters
  for (const char of characters) {
    const koName = ko.characters[char.id]?.name;
    if (
      char.name.toLowerCase().includes(lower) ||
      koName?.toLowerCase().includes(lower)
    ) {
      results.push({
        text: koName || char.name,
        type: "character",
        portrait: char.portrait,
        image: `category-icons/characters/${char.portrait}.png`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  // Categories
  for (const cat of categories) {
    const koName = ko.categories[cat.id]?.name;
    if (
      cat.name.toLowerCase().includes(lower) ||
      koName?.toLowerCase().includes(lower)
    ) {
      results.push({
        text: koName || cat.name,
        type: "category",
        image: `category-icons/${cat.id}.png`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  // Stations
  for (const [stationId, names] of getStationNameMap()) {
    if (names.some((n) => n.includes(lower))) {
      const label = stationName(stationId, "ko");
      // Avoid duplicate if station name matches a category already added
      if (!results.some((r) => r.text === label)) {
        results.push({
          text: label,
          type: "station",
          image: stationImages[stationId] ?? undefined,
        });
      }
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  // Materials
  const matNameMap = getMaterialNameMap();
  for (const mat of materials) {
    const names = matNameMap.get(mat.id) || [];
    if (names.some((n) => n.includes(lower))) {
      const koName = ko.materials[mat.id]?.name;
      results.push({
        text: koName || mat.name,
        type: "material",
        image: `items/${mat.image}`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  return results;
}
