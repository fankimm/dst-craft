import type { MetadataRoute } from "next";
import {
  bossSlugs,
  canonicalForBoss,
  canonicalForItem,
  foodSlugs,
  itemSlugs,
  questSlugs,
} from "@/lib/slug";
import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import {
  WX78_PRIORITY_BOSS_IDS,
  WX78_PRIORITY_ITEM_IDS,
  WX78_PRIORITY_SKILL_TREE_IDS,
} from "@/lib/seo-priority";

export const dynamic = "force-static";

const SITE_URL = "https://www.dstcraft.com";

function buildPrioritySet(): Set<string> {
  const paths: string[] = [];
  for (const id of WX78_PRIORITY_ITEM_IDS) {
    const slug = canonicalForItem(id);
    if (slug) paths.push(`/item/${slug}`);
  }
  for (const id of WX78_PRIORITY_BOSS_IDS) {
    const slug = canonicalForBoss(id);
    if (slug) paths.push(`/boss/${slug}`);
  }
  for (const id of WX78_PRIORITY_SKILL_TREE_IDS) {
    paths.push(`/skill-tree/${id}`);
  }
  return new Set(paths);
}

const PRIORITY_PATHS = buildPrioritySet();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const alt = (p: string) => ({
    languages: { en: `${SITE_URL}${p}`, ko: `${SITE_URL}/ko${p}` },
  });

  const homeRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: alt(""),
    },
    {
      url: `${SITE_URL}/ko`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: alt(""),
    },
    {
      url: `${SITE_URL}/releases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const staticPaths = ["/browse", "/cookpot", "/characters", "/quests"];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap((p) => [
    {
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: alt(p),
    },
    {
      url: `${SITE_URL}/ko${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: alt(p),
    },
  ]);

  const dynamicEntries: { path: string; slugs: string[] }[] = [
    { path: "/item", slugs: Array.from(itemSlugs.idToSlug.values()) },
    { path: "/food", slugs: Array.from(foodSlugs.idToSlug.values()) },
    { path: "/boss", slugs: Array.from(bossSlugs.idToSlug.values()) },
    { path: "/character", slugs: characters.map((c) => c.id) },
    { path: "/skill-tree", slugs: [...CHARACTERS_WITH_SKILLS] },
    { path: "/quest", slugs: Array.from(questSlugs.idToSlug.values()) },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = dynamicEntries.flatMap(({ path, slugs }) =>
    slugs.flatMap((slug) => {
      const p = `${path}/${slug}`;
      const boosted = PRIORITY_PATHS.has(p);
      const changeFrequency = boosted ? ("weekly" as const) : ("monthly" as const);
      const enPriority = boosted ? 0.9 : 0.8;
      const koPriority = boosted ? 0.85 : 0.7;
      return [
        {
          url: `${SITE_URL}${p}`,
          lastModified: now,
          changeFrequency,
          priority: enPriority,
          alternates: alt(p),
        },
        {
          url: `${SITE_URL}/ko${p}`,
          lastModified: now,
          changeFrequency,
          priority: koPriority,
          alternates: alt(p),
        },
      ];
    }),
  );

  return [...homeRoutes, ...staticRoutes, ...dynamicRoutes];
}
