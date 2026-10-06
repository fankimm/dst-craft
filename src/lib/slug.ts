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

// 이름이 바뀌어 사라진 옛 슬러그 → id. 외부에 남은 옛 링크가 404 나지 않도록 legacy로 받는다 (#125)
const RENAMED_BOSS_SLUGS: Record<string, string> = {
  "crystalline-deerclops": "mutateddeerclops", // #49 Crystalline → Crystal Deerclops
  "celestial-retinue": "alterguardian_phase1_lunarrift", // #49 Celestial Retinue → Revenant
};
const RENAMED_ITEM_SLUGS: Record<string, string> = {
  "winona-spotlight-item": "winona_spotlight",
  "winona-battery-low-item": "winona_battery_low",
  "winona-battery-high-item": "winona_battery_high",
};

function buildIndex<T extends Indexable>(
  records: T[],
  renamed: Record<string, string> = {},
): SlugIndex {
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
    // 하이픈 변환 전 원본 id 주소(/boss/stalker_atrium)도 외부 링크로 들어온다 (#125)
    if (rec.id !== old && rec.id !== slug && /^[a-z0-9_-]+$/.test(rec.id)) {
      legacySlugToId.set(rec.id, rec.id);
    }
  }
  for (const [old, id] of Object.entries(renamed)) {
    if (idToSlug.has(id) && !slugToId.has(old)) legacySlugToId.set(old, id);
  }

  const allSlugs = Array.from(
    new Set([...slugToId.keys(), ...legacySlugToId.keys()]),
  );
  return { idToSlug, slugToId, legacySlugToId, allSlugs };
}

export const itemSlugs = buildIndex(allItems, RENAMED_ITEM_SLUGS);
export const foodSlugs = buildIndex(cookingRecipes);
export const bossSlugs = buildIndex(bosses, RENAMED_BOSS_SLUGS);
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
