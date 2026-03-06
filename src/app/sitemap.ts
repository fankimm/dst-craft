import type { MetadataRoute } from "next";
import { allItems } from "@/data/items";
import { cookingRecipes } from "@/data/recipes";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
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

  const itemRoutes: MetadataRoute.Sitemap = allItems.map((item) => ({
    url: `${SITE_URL}/item/${idToSlug(item.id)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const foodRoutes: MetadataRoute.Sitemap = cookingRecipes.map((recipe) => ({
    url: `${SITE_URL}/food/${idToSlug(recipe.id)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...itemRoutes, ...foodRoutes];
}
