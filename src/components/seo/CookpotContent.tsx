import { cookingRecipes } from "@/data/recipes";
import { cookpotIngredients } from "@/data/cookpot-ingredients";
import { ko } from "@/data/locales/ko";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

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

const foodTypeLabelKey = {
  meat: "meatDishes",
  veggie: "veggieDishes",
  goodies: "goodiesGroup",
  roughage: "roughageGroup",
  generic: "genericGroup",
} as const;

const ingredientCategories = [
  { id: "meats", labelKey: "ingMeats" },
  { id: "veggies", labelKey: "ingVeggies" },
  { id: "fruits", labelKey: "ingFruits" },
  { id: "sweeteners", labelKey: "ingSweeteners" },
  { id: "eggs", labelKey: "ingEggs" },
  { id: "dairy", labelKey: "ingDairy" },
  { id: "fishes", labelKey: "ingFishes" },
  { id: "misc", labelKey: "ingMisc" },
] as const;

function statBadge(value: number) {
  if (value > 0) return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

export function CookpotContent({ lang }: { lang: SeoLang }) {
  const showcaseRecipes = SHOWCASE_IDS.map((id) => cookingRecipes.find((r) => r.id === id)).filter(
    Boolean,
  ) as typeof cookingRecipes;

  const recipesByType: Record<string, typeof cookingRecipes> = {};
  for (const r of cookingRecipes) {
    if (!recipesByType[r.foodType]) recipesByType[r.foodType] = [];
    recipesByType[r.foodType].push(r);
  }

  const routePrefix = lang === "ko" ? "/ko" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: lang === "ko" ? "Don't Starve Together 요리솥 시뮬레이터" : "Don't Starve Together Crock Pot Simulator",
    description: lang === "ko"
      ? "Don't Starve Together의 인터랙티브 요리솥 레시피 계산기. 재료 4개로 조리를 시뮬레이션해보세요."
      : "Interactive crock pot recipe calculator for Don't Starve Together. Simulate cooking with any 4 ingredients.",
    url: `${SITE_URL}${routePrefix}/cookpot`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">{L.cookpotSimulator[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src="/images/game-items/cookpot.png" alt="Crock Pot" className="size-16 object-contain" />
            <img src="/images/game-items/portablecookpot_item.png" alt="Portable Crock Pot" className="size-14 object-contain" />
          </div>
          <h1 className="text-3xl font-bold whitespace-pre-line">
            {L.cookpotPageHeading[lang]}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">{L.cookpotIntro[lang]}</p>
          <p className="text-sm text-muted-foreground">{L.cookpotIntroSub[lang]}</p>
          <Link
            href="/?tab=cookpot"
            className="inline-block rounded-lg bg-foreground text-background text-sm font-semibold px-6 py-3 hover:opacity-80 transition-opacity"
          >
            {L.openSimulator[lang]}
          </Link>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">{L.howItWorks[lang]}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: L.hiwStep1Title[lang], desc: L.hiwStep1Desc[lang] },
              { step: "2", title: L.hiwStep2Title[lang], desc: L.hiwStep2Desc[lang] },
              { step: "3", title: L.hiwStep3Title[lang], desc: L.hiwStep3Desc[lang] },
            ].map((s) => (
              <div key={s.step} className="rounded-lg border border-border bg-surface p-4 space-y-2">
                <span className="inline-flex items-center justify-center size-7 rounded-full bg-foreground text-background text-sm font-bold">
                  {s.step}
                </span>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">{L.popularRecipes[lang]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {showcaseRecipes.map((r) => {
              const nameKo = ko.foods?.[r.id]?.name;
              const primary = lang === "ko" ? (nameKo ?? r.name) : r.name;
              const secondary = lang === "ko" ? r.name : nameKo;
              return (
                <Link
                  key={r.id}
                  href={`${routePrefix}/food/${idToSlug(r.id)}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                >
                  <img src={`/images/game-items/${r.id}.png`} alt={primary} className="size-10 object-contain shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight truncate">{primary}</p>
                    {secondary && secondary !== primary && (
                      <p className="text-[10px] text-muted-foreground truncate">{secondary}</p>
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

        <section>
          <h2 className="text-lg font-semibold mb-4">
            {L.allCockpotRecipes[lang]} ({cookingRecipes.length})
          </h2>
          {Object.entries(recipesByType).map(([type, recipes]) => {
            const typeLabel = L[foodTypeLabelKey[type as keyof typeof foodTypeLabelKey]]?.[lang] ?? type;
            return (
              <div key={type} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {typeLabel} ({recipes.length})
                </h3>
                <ul className="columns-2 sm:columns-3 md:columns-4 gap-x-4 text-sm">
                  {recipes.map((r) => {
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
              </div>
            );
          })}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            {L.cookpotIngredientsLabel[lang]} ({cookpotIngredients.length})
          </h2>
          {ingredientCategories.map((cat) => {
            const ings = cookpotIngredients.filter((i) => i.category === cat.id);
            if (ings.length === 0) return null;
            const catLabel = L[cat.labelKey][lang];
            return (
              <div key={cat.id} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {catLabel} ({ings.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ings.map((ing) => {
                    const ingName = lang === "ko" ? (ing.nameKo ?? ing.name) : ing.name;
                    return (
                      <span
                        key={ing.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
                      >
                        <img src={`/images/game-items/${ing.image ?? ing.id + ".png"}`} alt={ingName} className="size-4 object-contain" />
                        {ingName}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 text-center space-y-3">
          <h2 className="text-base font-semibold">{L.readyToCook[lang]}</h2>
          <p className="text-sm text-muted-foreground">{L.readyToCookDesc[lang]}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/?tab=cookpot"
              className="inline-block rounded-lg bg-foreground text-background text-sm font-semibold px-6 py-3 hover:opacity-80 transition-opacity"
            >
              {L.openSimulator[lang]}
            </Link>
            <Link
              href="/?tab=cooking"
              className="inline-block rounded-lg border border-border text-foreground text-sm font-semibold px-6 py-3 hover:bg-surface-hover transition-colors"
            >
              {L.browseAllRecipes[lang]}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export function buildCookpotMetadata(lang: SeoLang) {
  const title = lang === "ko"
    ? "요리솥 시뮬레이터 & 레시피 계산기 — Don't Starve Together"
    : "Crock Pot Simulator & Recipe Calculator — Don't Starve Together";
  const description = lang === "ko"
    ? "Don't Starve Together의 인터랙티브 요리솥 시뮬레이터. 재료 4개를 추가하면 어떤 레시피가 만들어지는지 예측합니다. 80개 이상의 모든 요리솥 레시피를 스탯, 재료, 팁과 함께 확인하세요."
    : "Interactive crock pot simulator for Don't Starve Together. Add 4 ingredients to predict recipes. Browse all 80+ crock pot recipes with stats, ingredients, and cooking tips.";

  const enUrl = `${SITE_URL}/cookpot`;
  const koUrl = `${SITE_URL}/ko/cookpot`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description,
    keywords: lang === "ko"
      ? [
          "DST 요리솥",
          "DST 요리",
          "Don't Starve Together 요리솥",
          "DST 요리솥 시뮬레이터",
          "DST 요리솥 레시피",
          "DST 음식",
          "DST 레시피 계산기",
        ]
      : [
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
    alternates: {
      canonical,
      languages: { en: enUrl, "x-default": enUrl, ko: koUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      images: [{ url: `${SITE_URL}/images/game-items/cookpot.png` }],
    },
  };
}
