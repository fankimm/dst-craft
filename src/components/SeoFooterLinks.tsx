import Link from "next/link";
import { allItems } from "@/data/items";
import { cookingRecipes } from "@/data/recipes";
import { bosses } from "@/data/bosses";
import { characters } from "@/data/characters";
import { categories } from "@/data/categories";
import { ko } from "@/data/locales/ko";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

/** Pick representative items from each category for a balanced link set */
function pickRepresentativeItems(count: number) {
  const catItems: Record<string, typeof allItems> = {};
  for (const item of allItems) {
    const cat = item.category[0] ?? "other";
    if (!catItems[cat]) catItems[cat] = [];
    catItems[cat].push(item);
  }

  const picked: typeof allItems = [];
  const catIds = Object.keys(catItems).sort();
  const perCat = Math.max(1, Math.ceil(count / catIds.length));

  for (const catId of catIds) {
    const items = catItems[catId];
    picked.push(...items.slice(0, perCat));
  }

  return picked.slice(0, count);
}

/**
 * Server-rendered footer with internal links to SEO pages.
 * Helps Google discover and prioritize crawling of individual pages.
 */
export function SeoFooterLinks() {
  const featuredItems = pickRepresentativeItems(60);
  const featuredRecipes = cookingRecipes.slice(0, 40);
  const catNames: Record<string, string> = {};
  for (const c of categories) catNames[c.id] = c.name;

  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-8 text-xs text-muted-foreground">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/70">
            Don&apos;t Starve Together Guide
          </h2>
          <Link
            href="/browse"
            className="text-xs text-foreground/60 hover:text-foreground hover:underline"
          >
            Browse All Items &amp; Recipes →
          </Link>
        </div>

        {/* Characters */}
        <section>
          <h3 className="font-medium text-foreground/60 mb-1">
            <Link href="/characters" className="hover:underline">
              Characters ({characters.length})
            </Link>
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {characters.map((c) => (
              <Link
                key={c.id}
                href={`/character/${c.id}`}
                className="hover:text-foreground hover:underline"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Bosses */}
        <section>
          <h3 className="font-medium text-foreground/60 mb-1">
            Bosses ({bosses.length})
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {bosses.map((b) => (
              <Link
                key={b.id}
                href={`/boss/${b.id}`}
                className="hover:text-foreground hover:underline"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Cooking Recipes */}
        <section>
          <h3 className="font-medium text-foreground/60 mb-1">
            <Link href="/cookpot" className="hover:underline">
              Crock Pot Recipes
            </Link>
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {featuredRecipes.map((r) => (
              <Link
                key={r.id}
                href={`/food/${idToSlug(r.id)}`}
                className="hover:text-foreground hover:underline"
              >
                {r.name}
              </Link>
            ))}
            <Link
              href="/browse"
              className="text-foreground/50 hover:text-foreground hover:underline"
            >
              +{cookingRecipes.length - featuredRecipes.length} more
            </Link>
          </div>
        </section>

        {/* Crafting Items */}
        <section>
          <h3 className="font-medium text-foreground/60 mb-1">
            Crafting Items
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {featuredItems.map((item) => (
              <Link
                key={item.id}
                href={`/item/${idToSlug(item.id)}`}
                className="hover:text-foreground hover:underline"
              >
                {item.name}
                {ko.items[item.id]?.name && (
                  <span className="ml-0.5 opacity-60">
                    {ko.items[item.id].name}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/browse"
              className="text-foreground/50 hover:text-foreground hover:underline"
            >
              +{allItems.length - featuredItems.length} more
            </Link>
          </div>
        </section>

        <p className="text-center text-[10px] opacity-40 pt-2">
          Don&apos;t Craft Without Recipes — A complete crafting &amp; cooking
          guide for Don&apos;t Starve Together
        </p>
      </div>
    </footer>
  );
}
