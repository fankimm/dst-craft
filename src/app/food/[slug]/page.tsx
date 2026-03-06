import { cookingRecipes } from "@/data/recipes";
import { cookpotIngredients } from "@/data/cookpot-ingredients";
import { ko } from "@/data/locales/ko";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}
function slugToId(slug: string) {
  return slug.replaceAll("-", "_");
}

export function generateStaticParams() {
  return cookingRecipes.map((r) => ({ slug: idToSlug(r.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = cookingRecipes.find((r) => r.id === slugToId(slug));
  if (!recipe) return {};

  const nameKo = ko.foods?.[recipe.id]?.name;
  const title = nameKo
    ? `${recipe.name} (${nameKo}) — DST Crock Pot Recipe`
    : `${recipe.name} — Don't Starve Together Crock Pot Recipe`;

  const stationLabel =
    recipe.station === "portablecookpot" ? "Portable Crock Pot" : "Crock Pot";
  const description = `${recipe.name} crock pot recipe in Don't Starve Together. ${stationLabel} — Health: ${recipe.health > 0 ? "+" : ""}${recipe.health}, Hunger: +${recipe.hunger}, Sanity: ${recipe.sanity > 0 ? "+" : ""}${recipe.sanity}. Requirements: ${recipe.requirements}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/food/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/food/${slug}`,
      images: [{ url: `${SITE_URL}/images/game-items/${recipe.id}.png` }],
    },
  };
}

const foodTypeLabels: Record<string, string> = {
  meat: "Meat",
  veggie: "Veggie",
  goodies: "Goodies",
  roughage: "Roughage",
  nonfood: "Non-Food",
  generic: "Generic",
};

const foodTypeColors: Record<string, string> = {
  meat: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
  veggie: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
  goodies: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  roughage: "text-lime-600 dark:text-lime-400 bg-lime-500/10 border-lime-500/30",
  nonfood: "text-zinc-500 bg-zinc-500/10 border-zinc-500/30",
  generic: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export default async function FoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = cookingRecipes.find((r) => r.id === slugToId(slug));
  if (!recipe) notFound();

  const nameKo = ko.foods?.[recipe.id]?.name;
  const isWarlyOnly = recipe.station === "portablecookpot";
  const stationLabel = isWarlyOnly ? "Portable Crock Pot" : "Crock Pot";
  const stationImg = isWarlyOnly
    ? "portablecookpot_item.png"
    : "cookpot.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: `Crock pot recipe in Don't Starve Together. Requirements: ${recipe.requirements}`,
    image: `${SITE_URL}/images/game-items/${recipe.id}.png`,
    cookTime: `PT${Math.round(recipe.cookTime * 60)}S`,
    recipeCategory: foodTypeLabels[recipe.foodType] ?? recipe.foodType,
    recipeIngredient: recipe.cardIngredients
      ? recipe.cardIngredients.map(([id, qty]) => {
          const ing = cookpotIngredients.find((x) => x.id === id);
          return `${ing?.name ?? id} ×${qty}`;
        })
      : [recipe.requirements],
    nutrition: {
      "@type": "NutritionInformation",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/?tab=cooking"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">Cooking Guide</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Food identity */}
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
            <img
              src={`/images/game-items/${recipe.id}.png`}
              alt={recipe.name}
              className="size-20 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {recipe.name}
            </h1>
            {nameKo && (
              <p className="text-base text-muted-foreground mt-0.5">{nameKo}</p>
            )}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  foodTypeColors[recipe.foodType] ?? "text-muted-foreground border-border"
                }`}
              >
                {foodTypeLabels[recipe.foodType] ?? recipe.foodType}
              </span>
              {isWarlyOnly && (
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full border text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30">
                  Warly Exclusive
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon="/images/ui/health.png"
              label="Health"
              value={recipe.health}
              color="red"
            />
            <StatCard
              icon="/images/ui/hunger.png"
              label="Hunger"
              value={recipe.hunger}
              color="yellow"
            />
            <StatCard
              icon="/images/ui/sanity.png"
              label="Sanity"
              value={recipe.sanity}
              color="blue"
            />
          </div>
        </section>

        {/* Info row */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted-foreground">Perish</p>
            <p className="text-sm font-semibold mt-0.5">
              {recipe.perishDays === null ? "Never" : `${recipe.perishDays} days`}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted-foreground">Cook Time</p>
            <p className="text-sm font-semibold mt-0.5">{recipe.cookTime}s</p>
          </div>
          {recipe.temperature !== undefined && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3">
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="text-sm font-semibold mt-0.5">
                {recipe.temperature > 0 ? "+" : ""}
                {recipe.temperature}°C for {recipe.temperatureDuration}s
              </p>
            </div>
          )}
          {recipe.specialEffect && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3">
              <p className="text-xs text-muted-foreground">Special Effect</p>
              <p className="text-sm font-semibold mt-0.5">{recipe.specialEffect}</p>
            </div>
          )}
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Requirements
          </h2>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-sm text-foreground leading-relaxed">
              {recipe.requirements}
            </p>
          </div>
        </section>

        {/* Recommended ingredients */}
        {recipe.cardIngredients && recipe.cardIngredients.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Recommended Ingredients
            </h2>
            <div className="flex flex-wrap gap-3">
              {recipe.cardIngredients.map(([id, qty]) => {
                const ing = cookpotIngredients.find((x) => x.id === id);
                const ingName = ing?.name ?? id;
                const imgFile = ing?.image ?? `${id}.png`;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={`/images/game-items/${imgFile}`}
                        alt={ingName}
                        className="size-10 object-contain"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                        {qty}
                      </span>
                    </div>
                    <span className="text-xs font-medium">{ingName}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Cooking station */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Cooking Station
          </h2>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            <img
              src={`/images/game-items/${stationImg}`}
              alt={stationLabel}
              className="size-8 object-contain"
            />
            <span className="text-sm font-medium">{stationLabel}</span>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Find more DST crock pot recipes
          </p>
          <p className="text-xs text-muted-foreground">
            Simulate crock pot combinations and find crafting recipes
          </p>
          <Link
            href="/?tab=cooking"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Cooking Guide →
          </Link>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: "red" | "yellow" | "blue";
}) {
  const colorMap = {
    red: "text-red-600 dark:text-red-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    blue: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
      <img src={icon} alt={label} className="size-5 object-contain mx-auto mb-1" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-bold mt-0.5 ${colorMap[color]}`}>
        {value > 0 ? "+" : ""}
        {value}
      </p>
    </div>
  );
}
