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

export function searchItems(query: string): CraftingItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  // Find matching material ids
  const matNameMap = getMaterialNameMap();
  const matchingMatIds = new Set<string>();
  for (const [matId, names] of matNameMap) {
    if (names.some(n => n.includes(lowerQuery))) {
      matchingMatIds.add(matId);
    }
  }

  return allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      (ko.items[item.id]?.name?.toLowerCase().includes(lowerQuery) ?? false) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      (matchingMatIds.size > 0 && item.materials.some(m => matchingMatIds.has(m.materialId)))
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
