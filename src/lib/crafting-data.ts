import type { CategoryId, CraftingItem, Material, Category, Character } from "@/lib/types";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { materials } from "@/data/materials";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";

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

function itemMatchesQuery(item: CraftingItem, lowerQuery: string, matNameMap: Map<string, string[]>): boolean {
  // Check item name (en + ko)
  if (item.name.toLowerCase().includes(lowerQuery)) return true;
  if (ko.items[item.id]?.name?.toLowerCase().includes(lowerQuery)) return true;
  // Check description
  if (item.description.toLowerCase().includes(lowerQuery)) return true;
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
