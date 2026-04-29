import type { MetadataRoute } from "next";
import { bossSlugs, foodSlugs, itemSlugs } from "@/lib/slug";
import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";

export const dynamic = "force-static";

const SITE_URL = "https://www.dstcraft.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const homeRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/releases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const staticPaths = ["/browse", "/cookpot", "/characters"];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap((p) => [
    {
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ko${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  const dynamicEntries: { path: string; slugs: string[] }[] = [
    { path: "/item", slugs: Array.from(itemSlugs.idToSlug.values()) },
    { path: "/food", slugs: Array.from(foodSlugs.idToSlug.values()) },
    { path: "/boss", slugs: Array.from(bossSlugs.idToSlug.values()) },
    { path: "/character", slugs: characters.map((c) => c.id) },
    { path: "/skill-tree", slugs: [...CHARACTERS_WITH_SKILLS] },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = dynamicEntries.flatMap(({ path, slugs }) =>
    slugs.flatMap((slug) => [
      {
        url: `${SITE_URL}${path}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/ko${path}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ]),
  );

  return [...homeRoutes, ...staticRoutes, ...dynamicRoutes];
}
