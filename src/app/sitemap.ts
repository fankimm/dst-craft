import type { MetadataRoute } from "next";
import { bossSlugs, foodSlugs, itemSlugs } from "@/lib/slug";
import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";

export const dynamic = "force-static";

const SITE_URL = "https://www.dstcraft.com";

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

  const staticPaths = ["/browse", "/cookpot", "/characters"];
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
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = dynamicEntries.flatMap(({ path, slugs }) =>
    slugs.flatMap((slug) => {
      const p = `${path}/${slug}`;
      return [
        {
          url: `${SITE_URL}${p}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.8,
          alternates: alt(p),
        },
        {
          url: `${SITE_URL}/ko${p}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
          alternates: alt(p),
        },
      ];
    }),
  );

  return [...homeRoutes, ...staticRoutes, ...dynamicRoutes];
}
