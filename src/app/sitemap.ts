import type { MetadataRoute } from "next";
import { allItems } from "@/data/items";
import { cookingRecipes } from "@/data/recipes";
import { bosses } from "@/data/bosses";
import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

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

  const dynamicEntries: { path: string; ids: string[] }[] = [
    { path: "/item", ids: allItems.map((i) => idToSlug(i.id)) },
    { path: "/food", ids: cookingRecipes.map((r) => idToSlug(r.id)) },
    { path: "/boss", ids: bosses.map((b) => b.id) },
    { path: "/character", ids: characters.map((c) => c.id) },
    { path: "/skill-tree", ids: [...CHARACTERS_WITH_SKILLS] },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = dynamicEntries.flatMap(({ path, ids }) =>
    ids.flatMap((id) => [
      {
        url: `${SITE_URL}${path}/${id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/ko${path}/${id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ]),
  );

  return [...homeRoutes, ...staticRoutes, ...dynamicRoutes];
}
