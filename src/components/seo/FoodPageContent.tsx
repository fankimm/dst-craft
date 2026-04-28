import { cookingRecipes } from "@/data/recipes";
import { cookpotIngredients } from "@/data/cookpot-ingredients";
import { ko } from "@/data/locales/ko";
import { generateFoodSeoText, generateFoodSeoTextKo } from "@/lib/seo-text";
import { notFound } from "next/navigation";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}
function slugToId(slug: string) {
  return slug.replaceAll("-", "_");
}

const foodTypeKey = {
  meat: "ftMeat",
  veggie: "ftVeggie",
  goodies: "ftGoodies",
  roughage: "ftRoughage",
  nonfood: "ftNonfood",
  generic: "ftGeneric",
} as const;

const foodTypeColors: Record<string, string> = {
  meat: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
  veggie: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
  goodies: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  roughage: "text-lime-600 dark:text-lime-400 bg-lime-500/10 border-lime-500/30",
  nonfood: "text-zinc-500 bg-zinc-500/10 border-zinc-500/30",
  generic: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export function FoodPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const recipe = cookingRecipes.find((r) => r.id === slugToId(slug));
  if (!recipe) notFound();

  const nameKo = ko.foods?.[recipe.id]?.name;
  const displayName = lang === "ko" ? (nameKo ?? recipe.name) : recipe.name;
  const subtitleName = lang === "ko" ? recipe.name : nameKo;

  const isWarlyOnly = recipe.station === "portablecookpot";
  const stationLabel = lang === "ko"
    ? (isWarlyOnly ? "휴대용 요리솥" : "요리솥")
    : (isWarlyOnly ? "Portable Crock Pot" : "Crock Pot");
  const stationImg = isWarlyOnly ? "portablecookpot_item.png" : "cookpot.png";

  // Generate SEO text
  const ingredientNames = cookpotIngredients.map((i) => ({ id: i.id, name: i.name }));
  const ingredientKoNames = cookpotIngredients.map((i) => ({ id: i.id, nameKo: i.nameKo ?? i.name }));
  const seo = lang === "ko" && nameKo
    ? generateFoodSeoTextKo(recipe, nameKo, ingredientKoNames)
    : generateFoodSeoText(recipe, ingredientNames);

  const relatedRecipes = cookingRecipes
    .filter((r) => r.foodType === recipe.foodType && r.id !== recipe.id)
    .slice(0, 4);

  const ingredientList = recipe.cardIngredients
    ? recipe.cardIngredients.map(([id, qty]) => {
        const ing = cookpotIngredients.find((x) => x.id === id);
        const ingName = lang === "ko" ? (ing?.nameKo ?? ing?.name ?? id) : (ing?.name ?? id);
        return `${ingName} ×${qty}`;
      })
    : [recipe.requirements];

  const routePrefix = lang === "ko" ? "/ko" : "";
  const pageUrl = `${SITE_URL}${routePrefix}/food/${idToSlug(recipe.id)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: displayName,
    description: lang === "ko"
      ? `Don't Starve Together의 요리솥 레시피. 필요 재료: ${recipe.requirements}`
      : `Crock pot recipe in Don't Starve Together. Requirements: ${recipe.requirements}`,
    image: `${SITE_URL}/images/game-items/${recipe.id}.png`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    author: {
      "@type": "Organization",
      name: "DST Craft",
      url: SITE_URL,
    },
    cookTime: `PT${Math.round(recipe.cookTime * 60)}S`,
    recipeCategory: L[foodTypeKey[recipe.foodType]]?.[lang] ?? recipe.foodType,
    recipeIngredient: ingredientList,
    keywords: [
      "Don't Starve Together",
      "DST",
      displayName,
      stationLabel,
      L[foodTypeKey[recipe.foodType]]?.[lang] ?? recipe.foodType,
      lang === "ko" ? "요리솥 레시피" : "crock pot recipe",
      ...(subtitleName ? [subtitleName] : []),
    ].join(", "),
    nutrition: {
      "@type": "NutritionInformation",
      calories: lang === "ko" ? `허기 ${recipe.hunger}` : `${recipe.hunger} hunger points`,
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    mainEntity: seo.faq.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/?tab=cooking&cat=all&recipe=${recipe.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.cookingGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
            <img
              src={`/images/game-items/${recipe.id}.png`}
              alt={displayName}
              className="size-20 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {lang === "ko"
                ? `${displayName} 레시피 | Don't Starve Together`
                : `${displayName} Recipe | Don't Starve Together`}
            </h1>
            {subtitleName && (
              <p className="text-base text-muted-foreground mt-0.5">{subtitleName}</p>
            )}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  foodTypeColors[recipe.foodType] ?? "text-muted-foreground border-border"
                }`}
              >
                {L[foodTypeKey[recipe.foodType]]?.[lang] ?? recipe.foodType}
              </span>
              {isWarlyOnly && (
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full border text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30">
                  {L.warlyExclusive[lang]}
                </span>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.howToCook[lang]} {displayName}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.howToCook}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.stats[lang]}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon="/images/ui/health.png" label={lang === "ko" ? "체력" : "Health"} value={recipe.health} color="red" />
            <StatCard icon="/images/ui/hunger.png" label={lang === "ko" ? "허기" : "Hunger"} value={recipe.hunger} color="yellow" />
            <StatCard icon="/images/ui/sanity.png" label={lang === "ko" ? "정신력" : "Sanity"} value={recipe.sanity} color="blue" />
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {displayName} {lang === "ko" ? "스탯" : "Stats"}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.statsExplanation}</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted-foreground">{L.perish[lang]}</p>
            <p className="text-sm font-semibold mt-0.5">
              {recipe.perishDays === null ? L.never[lang] : `${recipe.perishDays} ${L.days[lang]}`}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted-foreground">{L.cookTime[lang]}</p>
            <p className="text-sm font-semibold mt-0.5">{recipe.cookTime}s</p>
          </div>
          {recipe.temperature !== undefined && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3">
              <p className="text-xs text-muted-foreground">{L.temperature[lang]}</p>
              <p className="text-sm font-semibold mt-0.5">
                {recipe.temperature > 0 ? "+" : ""}
                {recipe.temperature}°C / {recipe.temperatureDuration}s
              </p>
            </div>
          )}
          {recipe.specialEffect && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3">
              <p className="text-xs text-muted-foreground">{L.specialEffect[lang]}</p>
              <p className="text-sm font-semibold mt-0.5">{recipe.specialEffect}</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.requirements[lang]}
          </h2>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-sm text-foreground leading-relaxed">{recipe.requirements}</p>
          </div>
        </section>

        {recipe.cardIngredients && recipe.cardIngredients.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.recommendedIngredients[lang]}
            </h2>
            <div className="flex flex-wrap gap-3">
              {recipe.cardIngredients.map(([id, qty]) => {
                const ing = cookpotIngredients.find((x) => x.id === id);
                const ingName = lang === "ko" ? (ing?.nameKo ?? ing?.name ?? id) : (ing?.name ?? id);
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

        {seo.bestIngredients && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">
              {L.bestIngredientsFor[lang]} {displayName}
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed">{seo.bestIngredients}</p>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.cookingStation[lang]}
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

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">{L.faq[lang]}</h2>
          <div className="space-y-3">
            {seo.faq.map((q, i) => (
              <details key={i} className="rounded-lg border border-border bg-surface group">
                <summary className="px-4 py-3 text-sm font-medium text-foreground cursor-pointer select-none">
                  {q.question}
                </summary>
                <p className="px-4 pb-3 text-sm text-foreground/80 leading-relaxed">{q.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {relatedRecipes.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.relatedRecipes[lang]} {L[foodTypeKey[recipe.foodType]]?.[lang] ?? ""} {L.recipesSuffix[lang]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedRecipes.map((r) => {
                const rNameKo = ko.foods?.[r.id]?.name;
                const rDisplayName = lang === "ko" ? (rNameKo ?? r.name) : r.name;
                const rSubtitle = lang === "ko" ? r.name : rNameKo;
                return (
                  <Link
                    key={r.id}
                    href={`${routePrefix}/food/${idToSlug(r.id)}`}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 hover:border-ring transition-colors text-center"
                  >
                    <img
                      src={`/images/game-items/${r.id}.png`}
                      alt={rDisplayName}
                      className="size-10 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{rDisplayName}</p>
                      {rSubtitle && (
                        <p className="text-[10px] text-muted-foreground truncate">{rSubtitle}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.findMoreCookpot[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.ctaCookHelper[lang]}</p>
          <Link
            href={`/?tab=cooking&cat=all&recipe=${recipe.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openCookingGuide[lang]}
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

export function buildFoodMetadata(slug: string, lang: SeoLang) {
  const recipe = cookingRecipes.find((r) => r.id === slugToId(slug));
  if (!recipe) return {};
  const nameKo = ko.foods?.[recipe.id]?.name;
  const displayName = lang === "ko" ? (nameKo ?? recipe.name) : recipe.name;
  const stationLabel = recipe.station === "portablecookpot"
    ? (lang === "ko" ? "휴대용 요리솥" : "Portable Crock Pot")
    : (lang === "ko" ? "요리솥" : "Crock Pot");

  const title = lang === "ko"
    ? `${displayName} — Don't Starve Together 요리솥 레시피`
    : `${displayName} — Don't Starve Together Crock Pot Recipe`;

  const description = lang === "ko"
    ? `Don't Starve Together에서 ${displayName} 만드는 법. ${stationLabel} 레시피 — 체력: ${recipe.health > 0 ? "+" : ""}${recipe.health}, 허기: +${recipe.hunger}, 정신력: ${recipe.sanity > 0 ? "+" : ""}${recipe.sanity}. 재료, 스탯, 팁을 확인하세요.`
    : `Learn how to cook ${displayName} in Don't Starve Together. ${stationLabel} recipe — Health: ${recipe.health > 0 ? "+" : ""}${recipe.health}, Hunger: +${recipe.hunger}, Sanity: ${recipe.sanity > 0 ? "+" : ""}${recipe.sanity}. See ingredients, stats, and tips.`;

  const enUrl = `${SITE_URL}/food/${slug}`;
  const koUrl = `${SITE_URL}/ko/food/${slug}`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        "x-default": enUrl,
        ko: koUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      images: [{ url: `${SITE_URL}/images/game-items/${recipe.id}.png` }],
    },
  };
}
