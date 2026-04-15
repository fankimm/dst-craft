import { cookingRecipes } from "@/data/recipes";
import { cookpotIngredients } from "@/data/cookpot-ingredients";
import { ko } from "@/data/locales/ko";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export const metadata: Metadata = {
  title:
    "Crock Pot Simulator & Recipe Calculator — Don't Starve Together",
  description:
    "Interactive crock pot simulator for Don't Starve Together. Add 4 ingredients to predict recipes. Browse all 80+ crock pot recipes with stats, ingredients, and cooking tips.",
  keywords: [
    "dst crock pot",
    "dst cooking",
    "dst crock pot calculator",
    "dst crock pot simulator",
    "dst crock pot recipes",
    "don't starve together cooking",
    "don't starve together crock pot",
    "dst food recipes",
    "dst recipe calculator",
  ],
  alternates: { canonical: `${SITE_URL}/cookpot` },
  openGraph: {
    title: "Crock Pot Simulator — Don't Starve Together",
    description:
      "Add 4 ingredients and predict recipes. Browse all DST crock pot recipes.",
    url: `${SITE_URL}/cookpot`,
    images: [{ url: `${SITE_URL}/images/game-items/cookpot.png` }],
  },
};

// Pick popular recipes for showcase
const SHOWCASE_IDS = [
  "baconeggs",
  "bonestew",
  "pierogi",
  "dragonpie",
  "meatballs",
  "honeynuggets",
  "fishtacos",
  "waffles",
  "lobsterdinner",
  "surfnturf",
  "voltgoatjelly",
  "jellybean",
];

const showcaseRecipes = SHOWCASE_IDS.map((id) =>
  cookingRecipes.find((r) => r.id === id)
).filter(Boolean) as typeof cookingRecipes;

// Group all recipes by food type
const recipesByType: Record<string, typeof cookingRecipes> = {};
for (const r of cookingRecipes) {
  if (!recipesByType[r.foodType]) recipesByType[r.foodType] = [];
  recipesByType[r.foodType].push(r);
}

const foodTypeLabels: Record<string, string> = {
  meat: "Meat Dishes",
  veggie: "Veggie Dishes",
  goodies: "Goodies",
  roughage: "Roughage",
  generic: "Generic",
};

const ingredientCategories = [
  { id: "meats", label: "Meats", labelKo: "고기류" },
  { id: "veggies", label: "Veggies", labelKo: "야채류" },
  { id: "fruits", label: "Fruits", labelKo: "과일류" },
  { id: "sweeteners", label: "Sweeteners", labelKo: "감미료" },
  { id: "eggs", label: "Eggs", labelKo: "알류" },
  { id: "dairy", label: "Dairy", labelKo: "유제품" },
  { id: "fishes", label: "Fishes", labelKo: "생선류" },
  { id: "misc", label: "Misc", labelKo: "기타" },
];

function statBadge(value: number) {
  if (value > 0)
    return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

export default function CookpotPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Don't Starve Together Crock Pot Simulator",
    description:
      "Interactive crock pot recipe calculator for Don't Starve Together. Simulate cooking with any 4 ingredients.",
    url: `${SITE_URL}/cookpot`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">
            Crock Pot Simulator
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/images/game-items/cookpot.png"
              alt="Crock Pot"
              className="size-16 object-contain"
            />
            <img
              src="/images/game-items/portablecookpot_item.png"
              alt="Portable Crock Pot"
              className="size-14 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold">
            Don&apos;t Starve Together
            <br />
            Crock Pot Simulator
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Add any 4 ingredients to simulate crock pot cooking. Predict
            recipes, check stats, and find the best food for your situation.
          </p>
          <p className="text-sm text-muted-foreground">
            DST crock pot simulator — add 4 ingredients and see what you can
            cook.
          </p>
          <Link
            href="/?tab=cookpot"
            className="inline-block rounded-lg bg-foreground text-background text-sm font-semibold px-6 py-3 hover:opacity-80 transition-opacity"
          >
            Open Simulator →
          </Link>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Pick Ingredients",
                desc: "Choose 4 ingredients from the ingredient picker. Tap to add, long-press for details.",
              },
              {
                step: "2",
                title: "See Results",
                desc: "The simulator calculates which recipe will be cooked based on DST's actual game logic.",
              },
              {
                step: "3",
                title: "Compare Stats",
                desc: "View health, hunger, sanity values and find the optimal recipe for your needs.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-lg border border-border bg-surface p-4 space-y-2"
              >
                <span className="inline-flex items-center justify-center size-7 rounded-full bg-foreground text-background text-sm font-bold">
                  {s.step}
                </span>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular recipes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Popular Crock Pot Recipes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {showcaseRecipes.map((r) => {
              const nameKo = ko.foods?.[r.id]?.name;
              return (
                <Link
                  key={r.id}
                  href={`/food/${idToSlug(r.id)}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                >
                  <img
                    src={`/images/game-items/${r.id}.png`}
                    alt={r.name}
                    className="size-10 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight truncate">
                      {nameKo ?? r.name}
                    </p>
                    {nameKo && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {r.name}
                      </p>
                    )}
                    <div className="flex gap-2 mt-0.5 text-[10px] tabular-nums">
                      <span className={statBadge(r.health)}>
                        {r.health > 0 ? "+" : ""}
                        {r.health}
                      </span>
                      <span className={statBadge(r.hunger)}>
                        {r.hunger > 0 ? "+" : ""}
                        {r.hunger}
                      </span>
                      <span className={statBadge(r.sanity)}>
                        {r.sanity > 0 ? "+" : ""}
                        {r.sanity}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* All recipes by type */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            All Crock Pot Recipes ({cookingRecipes.length})
          </h2>
          {Object.entries(recipesByType).map(([type, recipes]) => (
            <div key={type} className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {foodTypeLabels[type] ?? type} ({recipes.length})
              </h3>
              <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
                {recipes.map((r) => {
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
            </div>
          ))}
        </section>

        {/* Ingredients reference */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Crock Pot Ingredients ({cookpotIngredients.length})
          </h2>
          {ingredientCategories.map((cat) => {
            const ings = cookpotIngredients.filter(
              (i) => i.category === cat.id
            );
            if (ings.length === 0) return null;
            return (
              <div key={cat.id} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {cat.label} / {cat.labelKo} ({ings.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ings.map((ing) => (
                    <span
                      key={ing.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
                    >
                      <img
                        src={`/images/game-items/${ing.image ?? ing.id + ".png"}`}
                        alt={ing.name}
                        className="size-4 object-contain"
                      />
                      {ing.nameKo ?? ing.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-6 text-center space-y-3">
          <h2 className="text-base font-semibold">
            Ready to cook?
          </h2>
          <p className="text-sm text-muted-foreground">
            Try the interactive crock pot simulator — add ingredients and see
            what you&apos;ll get!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/?tab=cookpot"
              className="inline-block rounded-lg bg-foreground text-background text-sm font-semibold px-6 py-3 hover:opacity-80 transition-opacity"
            >
              Open Simulator →
            </Link>
            <Link
              href="/?tab=cooking"
              className="inline-block rounded-lg border border-border text-foreground text-sm font-semibold px-6 py-3 hover:bg-surface-hover transition-colors"
            >
              Browse All Recipes →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
