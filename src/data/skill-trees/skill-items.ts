import { allItems } from "@/data/items";

/** Lazy-built reverse lookup: builderSkill ID → CraftingItem IDs */
let _cache: Map<string, string[]> | null = null;

export function getItemsBySkill(skillId: string): string[] {
  if (!_cache) {
    _cache = new Map();
    for (const item of allItems) {
      if (item.builderSkill) {
        const existing = _cache.get(item.builderSkill) ?? [];
        existing.push(item.id);
        _cache.set(item.builderSkill, existing);
      }
    }
  }
  return _cache.get(skillId) ?? [];
}
