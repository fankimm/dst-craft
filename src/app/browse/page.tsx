import { allItems } from "@/data/items";
import { cookingRecipes } from "@/data/recipes";
import { bosses } from "@/data/bosses";
import { characters } from "@/data/characters";
import { categories } from "@/data/categories";
import { ko } from "@/data/locales/ko";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export const metadata: Metadata = {
  title:
    "Browse All Items, Recipes & Bosses — Don't Starve Together Guide",
  description:
    "Complete directory of all Don't Starve Together crafting items, crock pot recipes, and boss loot. Find every recipe, ingredient, and boss drop.",
  alternates: { canonical: `${SITE_URL}/browse` },
  openGraph: {
    title: "Browse All — Don't Starve Together Guide",
    description:
      "Complete directory of all DST crafting items, crock pot recipes, and boss loot.",
    url: `${SITE_URL}/browse`,
  },
};

// Group items by first category
function groupByCategory(items: typeof allItems) {
  const groups: Record<string, typeof allItems> = {};
  for (const item of items) {
    const cat = item.category[0] ?? "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return groups;
}

export default function BrowsePage() {
  const grouped = groupByCategory(allItems);
  const catNames: Record<string, string> = {};
  for (const c of categories) catNames[c.id] = c.name;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">Browse All</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <h1 className="text-2xl font-bold">
          Don&apos;t Starve Together — All Items, Recipes &amp; Bosses
        </h1>

        {/* ── Crafting Items ── */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Crafting Items ({allItems.length})
          </h2>
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([catId, items]) => (
              <div key={catId} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {catNames[catId] ?? catId}
                </h3>
                <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
                  {items.map((item) => {
                    const nameKo = ko.items[item.id]?.name;
                    return (
                      <li key={item.id} className="mb-1 break-inside-avoid">
                        <Link
                          href={`/item/${idToSlug(item.id)}`}
                          className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                        >
                          {item.name}
                          {nameKo && (
                            <span className="text-muted-foreground text-xs ml-1">
                              {nameKo}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </section>

        {/* ── Crock Pot Recipes ── */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Crock Pot Recipes ({cookingRecipes.length})
          </h2>
          <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
            {cookingRecipes.map((r) => {
              const nameKo = ko.foods?.[r.id]?.name;
              return (
                <li key={r.id} className="mb-1 break-inside-avoid">
                  <Link
                    href={`/food/${idToSlug(r.id)}`}
                    className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                  >
                    {r.name}
                    {nameKo && (
                      <span className="text-muted-foreground text-xs ml-1">
                        {nameKo}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Bosses ── */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Bosses ({bosses.length})
          </h2>
          <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
            {bosses.map((b) => (
              <li key={b.id} className="mb-1 break-inside-avoid">
                <Link
                  href={`/boss/${b.id}`}
                  className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                >
                  {b.name}
                  <span className="text-muted-foreground text-xs ml-1">
                    {b.nameKo}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Characters ── */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Characters ({characters.length})
          </h2>
          <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
            {characters.map((c) => (
              <li key={c.id} className="mb-1 break-inside-avoid">
                <Link
                  href={`/character/${c.id}`}
                  className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                >
                  {c.name}
                  {c.nameKo && (
                    <span className="text-muted-foreground text-xs ml-1">
                      {c.nameKo}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Interactive crafting &amp; cooking guide
          </p>
          <Link
            href="/"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Guide →
          </Link>
        </section>
      </main>
    </div>
  );
}
