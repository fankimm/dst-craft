import { allItems } from "@/data/items";
import { cookingRecipes } from "@/data/recipes";
import { bosses } from "@/data/bosses";
import { characters } from "@/data/characters";
import { categories } from "@/data/categories";
import { ko } from "@/data/locales/ko";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

function groupByCategory(items: typeof allItems) {
  const groups: Record<string, typeof allItems> = {};
  for (const item of items) {
    const cat = item.category[0] ?? "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return groups;
}

export function BrowseContent({ lang }: { lang: SeoLang }) {
  const grouped = groupByCategory(allItems);
  const catNames: Record<string, string> = {};
  for (const c of categories) {
    catNames[c.id] = lang === "ko" ? (ko.categories[c.id]?.name ?? c.name) : c.name;
  }
  const routePrefix = lang === "ko" ? "/ko" : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">{L.browseAll[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <h1 className="text-2xl font-bold">{L.browseTitle[lang]}</h1>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            {L.craftingItems[lang]} ({allItems.length})
          </h2>
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([catId, items]) => (
              <div key={catId} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{catNames[catId] ?? catId}</h3>
                <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
                  {items.map((item) => {
                    const nameKo = ko.items[item.id]?.name;
                    const primary = lang === "ko" ? (nameKo ?? item.name) : item.name;
                    const secondary = lang === "ko" ? item.name : nameKo;
                    return (
                      <li key={item.id} className="mb-1 break-inside-avoid">
                        <Link
                          href={`${routePrefix}/item/${idToSlug(item.id)}`}
                          className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                        >
                          {primary}
                          {secondary && secondary !== primary && (
                            <span className="text-muted-foreground text-xs ml-1">{secondary}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            {L.crockPotRecipes[lang]} ({cookingRecipes.length})
          </h2>
          <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
            {cookingRecipes.map((r) => {
              const nameKo = ko.foods?.[r.id]?.name;
              const primary = lang === "ko" ? (nameKo ?? r.name) : r.name;
              const secondary = lang === "ko" ? r.name : nameKo;
              return (
                <li key={r.id} className="mb-1 break-inside-avoid">
                  <Link
                    href={`${routePrefix}/food/${idToSlug(r.id)}`}
                    className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                  >
                    {primary}
                    {secondary && secondary !== primary && (
                      <span className="text-muted-foreground text-xs ml-1">{secondary}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            {L.bossesLabel[lang]} ({bosses.length})
          </h2>
          <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
            {bosses.map((b) => {
              const primary = lang === "ko" ? b.nameKo : b.name;
              const secondary = lang === "ko" ? b.name : b.nameKo;
              return (
                <li key={b.id} className="mb-1 break-inside-avoid">
                  <Link
                    href={`${routePrefix}/boss/${b.id}`}
                    className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                  >
                    {primary}
                    {secondary && secondary !== primary && (
                      <span className="text-muted-foreground text-xs ml-1">{secondary}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            {L.charactersLabel[lang]} ({characters.length})
          </h2>
          <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
            {characters.map((c) => {
              const primary = lang === "ko" ? (c.nameKo ?? c.name) : c.name;
              const secondary = lang === "ko" ? c.name : c.nameKo;
              return (
                <li key={c.id} className="mb-1 break-inside-avoid">
                  <Link
                    href={`${routePrefix}/character/${c.id}`}
                    className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
                  >
                    {primary}
                    {secondary && secondary !== primary && (
                      <span className="text-muted-foreground text-xs ml-1">{secondary}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.interactiveGuide[lang]}</p>
          <Link
            href="/"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openGuide[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildBrowseMetadata(lang: SeoLang) {
  const title = lang === "ko"
    ? "모든 아이템, 레시피, 보스 둘러보기 — Don't Starve Together 가이드"
    : "Browse All Items, Recipes & Bosses — Don't Starve Together Guide";
  const description = lang === "ko"
    ? "Don't Starve Together의 모든 제작 아이템, 요리솥 레시피, 보스 전리품을 한 곳에서. 모든 레시피, 재료, 보스 드롭을 찾아보세요."
    : "Complete directory of all Don't Starve Together crafting items, crock pot recipes, and boss loot. Find every recipe, ingredient, and boss drop.";

  const enUrl = `${SITE_URL}/browse`;
  const koUrl = `${SITE_URL}/ko/browse`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en: enUrl, "x-default": enUrl, ko: koUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
    },
  };
}
