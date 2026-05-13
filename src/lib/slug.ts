import { allItems } from "@/data/items";
import { cookingRecipes } from "@/data/recipes";
import { bosses } from "@/data/bosses";
import { quests } from "@/data/quests";

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function legacySlug(id: string): string {
  return id.replaceAll("_", "-");
}

type Indexable = { id: string; name: string };

interface SlugIndex {
  idToSlug: Map<string, string>;
  slugToId: Map<string, string>;
  legacySlugToId: Map<string, string>;
  allSlugs: string[];
}

function buildIndex<T extends Indexable>(records: T[]): SlugIndex {
  const idToSlug = new Map<string, string>();
  const slugToId = new Map<string, string>();
  const legacySlugToId = new Map<string, string>();
  const taken = new Set<string>();

  for (const rec of records) {
    const baseSlug = nameToSlug(rec.name) || legacySlug(rec.id);
    let slug = baseSlug;
    if (taken.has(slug)) {
      slug = `${baseSlug}-${legacySlug(rec.id)}`;
    }
    taken.add(slug);
    idToSlug.set(rec.id, slug);
    slugToId.set(slug, rec.id);

    const old = legacySlug(rec.id);
    if (old !== slug) {
      legacySlugToId.set(old, rec.id);
    }
  }

  const allSlugs = Array.from(
    new Set([...slugToId.keys(), ...legacySlugToId.keys()]),
  );
  return { idToSlug, slugToId, legacySlugToId, allSlugs };
}

export const itemSlugs = buildIndex(allItems);
export const foodSlugs = buildIndex(cookingRecipes);
export const bossSlugs = buildIndex(bosses);
export const questSlugs = buildIndex(quests.map((q) => ({ id: q.id, name: q.titleEn })));

export function resolveItemSlug(slug: string): string | undefined {
  return itemSlugs.slugToId.get(slug) ?? itemSlugs.legacySlugToId.get(slug);
}

export function resolveFoodSlug(slug: string): string | undefined {
  return foodSlugs.slugToId.get(slug) ?? foodSlugs.legacySlugToId.get(slug);
}

export function resolveBossSlug(slug: string): string | undefined {
  return bossSlugs.slugToId.get(slug) ?? bossSlugs.legacySlugToId.get(slug);
}

export function resolveQuestSlug(slug: string): string | undefined {
  return questSlugs.slugToId.get(slug) ?? questSlugs.legacySlugToId.get(slug);
}

export function isCanonicalSlug(slug: string, index: SlugIndex): boolean {
  return index.slugToId.has(slug);
}

export function canonicalForItem(id: string): string | undefined {
  return itemSlugs.idToSlug.get(id);
}

export function canonicalForFood(id: string): string | undefined {
  return foodSlugs.idToSlug.get(id);
}

export function canonicalForBoss(id: string): string | undefined {
  return bossSlugs.idToSlug.get(id);
}

export function canonicalForQuest(id: string): string | undefined {
  return questSlugs.idToSlug.get(id);
}
