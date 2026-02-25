import type { CategoryId, CraftingItem, Material, Category } from "@/lib/types";
import { categories } from "@/data/categories";
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

export function searchItems(query: string): CraftingItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  return allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      (ko.items[item.id]?.name?.toLowerCase().includes(lowerQuery) ?? false) ||
      item.description.toLowerCase().includes(lowerQuery)
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
