import type { CategoryId, CraftingStation, CraftingItem, Material, Category, Character } from "@/lib/types";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { materials } from "@/data/materials";
import { allItems } from "@/data/items";
import { allLocales } from "@/data/locales";
import { stationName, supportedLocales, itemName, materialName, categoryName, characterName } from "@/lib/i18n";

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

// Build material name lookup for search (lazy-initialized, all locales)
let _materialNameMap: Map<string, string[]> | null = null;
function getMaterialNameMap(): Map<string, string[]> {
  if (_materialNameMap) return _materialNameMap;
  _materialNameMap = new Map();
  for (const mat of materials) {
    const nameSet = new Set<string>();
    nameSet.add(mat.name.toLowerCase());
    for (const localeData of Object.values(allLocales)) {
      const n = localeData.materials[mat.id]?.name;
      if (n) nameSet.add(n.toLowerCase());
    }
    _materialNameMap.set(mat.id, [...nameSet]);
  }
  return _materialNameMap;
}

// Build station name lookup for search (lazy-initialized, all locales)
let _stationNameMap: Map<CraftingStation, string[]> | null = null;
function getStationNameMap(): Map<CraftingStation, string[]> {
  if (_stationNameMap) return _stationNameMap;
  _stationNameMap = new Map();
  const stationIds = [...new Set(allItems.map((i) => i.station))].filter(
    (s) => s !== "none" && s !== "character"
  ) as CraftingStation[];
  for (const id of stationIds) {
    const nameSet = new Set<string>();
    for (const locale of supportedLocales) {
      nameSet.add(stationName(id, locale).toLowerCase());
    }
    _stationNameMap.set(id, [...nameSet]);
  }
  return _stationNameMap;
}

function itemMatchesQuery(item: CraftingItem, lowerQuery: string, matNameMap: Map<string, string[]>): boolean {
  // Check item name (English + all locales)
  if (item.name.toLowerCase().includes(lowerQuery)) return true;
  for (const localeData of Object.values(allLocales)) {
    if (localeData.items[item.id]?.name?.toLowerCase().includes(lowerQuery)) return true;
  }
  // Check description (English only — locale descriptions are for display, not search)
  if (item.description.toLowerCase().includes(lowerQuery)) return true;
  // Check station name (all locales already in the map)
  const stationNames = getStationNameMap().get(item.station);
  if (stationNames?.some((n) => n.includes(lowerQuery))) return true;
  // Check character name (English + all locales)
  if (item.characterOnly) {
    const char = characters.find(c => c.id === item.characterOnly);
    if (char) {
      if (char.name.toLowerCase().includes(lowerQuery)) return true;
      for (const localeData of Object.values(allLocales)) {
        if (localeData.characters[char.id]?.name?.toLowerCase().includes(lowerQuery)) return true;
      }
    }
  }
  // Check category name (English + all locales)
  for (const catId of item.category) {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      if (cat.name.toLowerCase().includes(lowerQuery)) return true;
      for (const localeData of Object.values(allLocales)) {
        if (localeData.categories[catId]?.name?.toLowerCase().includes(lowerQuery)) return true;
      }
    }
  }
  // Check materials (all locales already in the map)
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
export type TagType = "character" | "category" | "station" | "material" | "item" | "text";
export interface SearchTag {
  text: string;
  type: TagType;
  portrait?: string; // character portrait id
  /** Image path relative to /images/ */
  image?: string;
}

export function classifyTag(text: string): SearchTag {
  const lower = text.toLowerCase().trim();

  // Check characters (English + all locales) — partial match
  for (const char of characters) {
    if (char.name.toLowerCase().includes(lower)) {
      return { text, type: "character", portrait: char.portrait, image: `category-icons/characters/${char.portrait}.png` };
    }
    for (const localeData of Object.values(allLocales)) {
      if (localeData.characters[char.id]?.name?.toLowerCase().includes(lower)) {
        return { text, type: "character", portrait: char.portrait, image: `category-icons/characters/${char.portrait}.png` };
      }
    }
  }

  // Check categories (English + all locales) — partial match
  for (const cat of categories) {
    if (cat.name.toLowerCase().includes(lower)) {
      return { text, type: "category", image: `category-icons/${cat.id}.png` };
    }
    for (const localeData of Object.values(allLocales)) {
      if (localeData.categories[cat.id]?.name?.toLowerCase().includes(lower)) {
        return { text, type: "category", image: `category-icons/${cat.id}.png` };
      }
    }
  }

  // Check stations (all locales already in the map) — partial match
  for (const [stationId, names] of getStationNameMap()) {
    if (names.some((n) => n.includes(lower))) {
      return { text, type: "station", image: stationImages[stationId] ?? undefined };
    }
  }

  // Check materials (all locales already in the map) — partial match
  const matNameMap = getMaterialNameMap();
  for (const mat of materials) {
    const names = matNameMap.get(mat.id) || [];
    if (names.some((n) => n.includes(lower))) {
      return { text, type: "material", image: `materials/${mat.image}` };
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

export function getSuggestions(query: string, locale: string = "ko"): Suggestion[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];

  const results: Suggestion[] = [];

  // Characters — match English + all locales, display in current locale
  for (const char of characters) {
    let matched = char.name.toLowerCase().includes(lower);
    if (!matched) {
      for (const localeData of Object.values(allLocales)) {
        if (localeData.characters[char.id]?.name?.toLowerCase().includes(lower)) {
          matched = true;
          break;
        }
      }
    }
    if (matched) {
      results.push({
        text: characterName(char, locale),
        type: "character",
        portrait: char.portrait,
        image: `category-icons/characters/${char.portrait}.png`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  // Categories — match English + all locales, display in current locale
  for (const cat of categories) {
    let matched = cat.name.toLowerCase().includes(lower);
    if (!matched) {
      for (const localeData of Object.values(allLocales)) {
        if (localeData.categories[cat.id]?.name?.toLowerCase().includes(lower)) {
          matched = true;
          break;
        }
      }
    }
    if (matched) {
      results.push({
        text: categoryName(cat, locale),
        type: "category",
        image: `category-icons/${cat.id}.png`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  // Items — match English + all locales, display in current locale
  for (const item of allItems) {
    let matched = item.name.toLowerCase().includes(lower);
    if (!matched) {
      for (const localeData of Object.values(allLocales)) {
        if (localeData.items[item.id]?.name?.toLowerCase().includes(lower)) {
          matched = true;
          break;
        }
      }
    }
    if (matched && !results.some((r) => r.text === itemName(item, locale))) {
      results.push({
        text: itemName(item, locale),
        type: "item",
        image: `items/${item.image}`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  // Stations — all locale names already in the map, display in current locale
  for (const [stationId, names] of getStationNameMap()) {
    if (names.some((n) => n.includes(lower))) {
      const label = stationName(stationId, locale);
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

  // Materials — all locale names already in the map, display in current locale
  const matNameMap = getMaterialNameMap();
  for (const mat of materials) {
    const names = matNameMap.get(mat.id) || [];
    if (names.some((n) => n.includes(lower))) {
      results.push({
        text: materialName(mat, locale),
        type: "material",
        image: `materials/${mat.image}`,
      });
    }
    if (results.length >= MAX_SUGGESTIONS) return results;
  }

  return results;
}
