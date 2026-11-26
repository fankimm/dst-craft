import Link from "next/link";
import { notFound } from "next/navigation";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { ingredientImage, type CookpotIngredient, type IngredientTag } from "@/data/cookpot-ingredients";
import type { CookingRecipe } from "@/data/recipes";
import { reachableRecipes } from "@/lib/cookpot-engine";
import { canonicalForFood, canonicalForItem } from "@/lib/slug";
import { itemHref } from "@/lib/catalog-slug";
import { ingredientSlugs, resolveIngredientSlug } from "@/lib/ingredient-slug";
import { pp } from "@/lib/seo-text";
import { AdSlot } from "@/components/ads/AdSlot";
import { DroppedBySection, dropSourcesOf } from "./DroppedBy";
import { AdBleed } from "@/components/ads/AdBleed";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";
import { DataSourceNote, FaqSection, faqLd, type FaqEntry } from "./list-schema";

/**
 * 요리솥 재료 상세 페이지 (/ingredient/<slug>, /ko/ingredient/<slug>) — #163, #144 4단계.
 * 어떤 재료가 페이지를 갖는지는 `src/lib/ingredient-slug.ts`가 정한다.
 * 화면의 게임 사실은 전부 데이터에서 온다: 태그 값(cookpot-ingredients), 먹었을 때 수치(scrapbook-stats),
 * 만들 수 있는 요리(cookpot-engine의 도달 가능 요리 표), 제작 사용처(items). 지어낸 문장 없음.
 */

const SITE_URL = "https://www.dstcraft.com";

/** 요리솥 태그 표기 — 한국어는 요리 탭 조건 표기(`CookingApp`의 reqTagTranslations)와 같은 낱말을 쓴다 */
const TAG_LABELS: Partial<Record<IngredientTag, [string, string]>> = {
  meat: ["Meat", "고기"],
  fish: ["Fish", "생선"],
  veggie: ["Veggie", "채소"],
  fruit: ["Fruit", "과일"],
  egg: ["Egg", "알"],
  sweetener: ["Sweetener", "감미료"],
  dairy: ["Dairy", "유제품"],
  fat: ["Fat", "지방"],
  monster: ["Monster", "괴물"],
  inedible: ["Inedible", "못먹는것"],
  frozen: ["Frozen", "얼음"],
  seed: ["Seed", "씨앗"],
  magic: ["Magic", "마법"],
  decoration: ["Decoration", "장식"],
  dried: ["Dried", "말림"],
};

const T = {
  kind: { en: "Crock Pot Ingredient", ko: "요리솥 재료" },
  valuesHeading: { en: "Crock Pot Values", ko: "요리솥 태그 값" },
  valuesNote: {
    en: "Recipes check the total of these values across the four ingredients in the pot.",
    ko: "요리솥은 넣은 재료 4개의 이 값을 합쳐서 레시피 조건을 판정합니다.",
  },
  statsHeading: { en: "Stats When Eaten", ko: "먹었을 때 수치" },
  form: { en: "Form", ko: "형태" },
  raw: { en: "Raw", ko: "생" },
  cooked: { en: "Cooked", ko: "구움" },
  dried: { en: "Dried", ko: "말림" },
  hunger: { en: "Hunger", ko: "허기" },
  health: { en: "Health", ko: "체력" },
  sanity: { en: "Sanity", ko: "정신력" },
  perish: { en: "Spoils in", ko: "부패" },
  noPerish: { en: "—", ko: "—" },
  recipesHeading: { en: "Dishes You Can Cook With {name}", ko: "{name} 넣어 만들 수 있는 요리" },
  recipesNote: {
    en: "Every dish that can come out of a Crock Pot holding one {name}, depending on the other three ingredients. Dishes that always lose to a higher-priority recipe are left out.",
    ko: "{name} 1개를 넣었을 때, 나머지 세 칸을 어떻게 채우느냐에 따라 요리솥에서 나올 수 있는 요리 전체입니다. 우선순위에 밀려 절대 나오지 않는 요리는 뺐습니다.",
  },
  warlyHeading: { en: "Portable Crock Pot Only (Warly)", ko: "휴대용 요리솥 전용 (월리)" },
  usedInHeading: { en: "Also a Crafting Material", ko: "제작 재료로도 쓰임" },
  itemPage: { en: "{name} item page →", ko: "{name} 아이템 페이지 →" },
  cta: { en: "Try it in the Crock Pot Simulator", ko: "요리솥 시뮬레이터에서 넣어 보기" },
  ctaDesc: {
    en: "Add four ingredients and see which dish the game would cook.",
    ko: "재료 4개를 넣으면 게임 로직대로 어떤 요리가 나오는지 보여 줍니다.",
  },
  ctaButton: { en: "Open the simulator", ko: "시뮬레이터 열기" },
  faqTitle: { en: "FAQ", ko: "자주 묻는 질문" },
};

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** 9.375 같은 값을 그대로, 정수는 정수로 */
const num = (v: number) => String(Math.round(v * 1000) / 1000);
const signed = (v: number) => (v > 0 ? `+${num(v)}` : num(v));
const statColor = (v: number) =>
  v > 0 ? "text-green-600 dark:text-green-400" : v < 0 ? "text-red-500 dark:text-red-400" : "text-muted-foreground";

interface FormRow {
  key: "raw" | "cooked" | "dried";
  id: string;
  hunger: number;
  health: number;
  sanity: number;
  perishDays?: number;
}

/** 스크랩북에서 먹을 수 있는 형태의 수치를 찾는다. 고기류의 구운 형태는 prefab id가 `cooked<id>`다 */
function formRows(id: string): FormRow[] {
  // 자기 페이지를 가진 말린·구운 형태(말린 꽃잎, 구운 코알라펀트 코)는 그 형태 한 줄만
  const own = id.match(/_(cooked|dried)$/)?.[1] as "cooked" | "dried" | undefined;
  const candidates: [FormRow["key"], string[]][] = own
    ? [[own, [id]]]
    : [
        ["raw", [id]],
        ["cooked", [`${id}_cooked`, `cooked${id}`]],
        ["dried", [`${id}_dried`]],
      ];
  const rows: FormRow[] = [];
  for (const [key, ids] of candidates) {
    const found = ids.find((c) => scrapbookStats[c]?.hungervalue !== undefined);
    if (!found) continue;
    const s = scrapbookStats[found];
    rows.push({
      key,
      id: found,
      hunger: s.hungervalue ?? 0,
      health: s.healthvalue ?? 0,
      sanity: s.sanityvalue ?? 0,
      perishDays: s.perishable ? s.perishable / 480 : undefined,
    });
  }
  return rows;
}

function tagList(ing: CookpotIngredient, lang: SeoLang) {
  const idx = lang === "ko" ? 1 : 0;
  return (Object.entries(ing.tags) as [IngredientTag, number][])
    .filter(([tag]) => TAG_LABELS[tag])
    .map(([tag, value]) => ({ tag, label: TAG_LABELS[tag]![idx], value }));
}

function load(slug: string, lang: SeoLang) {
  const ing = resolveIngredientSlug(slug);
  if (!ing) return undefined;
  const name = lang === "ko" ? (ing.nameKo ?? ing.name) : ing.name;
  const altName = lang === "ko" ? ing.name : (ing.nameKo ?? ing.name);
  const cookpot = reachableRecipes([ing], "cookpot");
  const inCookpot = new Set(cookpot.map((r) => r.id));
  const warlyOnly = reachableRecipes([ing], "portablecookpot").filter((r) => !inCookpot.has(r.id));
  return {
    ing,
    name,
    altName,
    image: `/images/game-items/${ingredientImage(ing)}`,
    tags: tagList(ing, lang),
    forms: formRows(ing.id),
    cookpot,
    warlyOnly,
    usedIn: allItems.filter((other) => other.materials.some((m) => m.materialId === ing.id)),
  };
}

const foodName = (r: CookingRecipe, lang: SeoLang) => (lang === "ko" ? (ko.foods?.[r.id]?.name ?? r.name) : r.name);

function buildFaq(d: NonNullable<ReturnType<typeof load>>, lang: SeoLang): FaqEntry[] {
  const faq: FaqEntry[] = [];
  const tagText = d.tags.map((t) => `${t.label} ${num(t.value)}`).join(", ");
  if (tagText) {
    faq.push(
      lang === "ko"
        ? {
            question: `${pp(d.name, "은", "는")} 요리솥에서 어떤 재료로 계산되나요?`,
            answer: `${d.name} 1개의 요리솥 값은 ${tagText}입니다.`,
          }
        : {
            question: `What does ${d.name} count as in the Crock Pot?`,
            answer: `One ${d.name} counts as ${tagText} in the Crock Pot.`,
          },
    );
  }
  if (d.cookpot.length > 0) {
    const top = d.cookpot.slice(0, 6).map((r) => foodName(r, lang)).join(", ");
    const more = d.cookpot.length > 6;
    faq.push(
      lang === "ko"
        ? {
            question: `${pp(d.name, "을", "를")} 넣으면 어떤 요리를 만들 수 있나요?`,
            answer: `${d.name} 1개를 넣은 요리솥에서는 나머지 재료에 따라 ${d.cookpot.length}가지 요리가 나올 수 있습니다: ${top}${more ? " 등" : ""}.`,
          }
        : {
            question: `What can you cook with ${d.name}?`,
            answer: `A Crock Pot holding one ${d.name} can produce ${d.cookpot.length} different dishes depending on the other ingredients, including ${top}${more ? " and more" : ""}.`,
          },
    );
  }
  const raw = d.forms.find((f) => f.key === "raw");
  if (raw) {
    faq.push(
      lang === "ko"
        ? {
            question: `${pp(d.name, "을", "를")} 그냥 먹으면 어떻게 되나요?`,
            answer: `생으로 먹으면 허기 ${signed(raw.hunger)}, 체력 ${signed(raw.health)}, 정신력 ${signed(raw.sanity)}입니다.`,
          }
        : {
            question: `What happens if you eat ${d.name} raw?`,
            answer: `Eaten raw it gives ${signed(raw.hunger)} hunger, ${signed(raw.health)} health and ${signed(raw.sanity)} sanity.`,
          },
    );
  }
  return faq;
}

function RecipeGrid({ recipes, lang, routePrefix }: { recipes: CookingRecipe[]; lang: SeoLang; routePrefix: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {recipes.map((r) => {
        const primary = foodName(r, lang);
        return (
          <Link
            key={r.id}
            href={`${routePrefix}/food/${canonicalForFood(r.id)}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
          >
            <img src={`/images/game-items/${r.id}.png`} alt={primary} className="size-10 object-contain shrink-0" loading="lazy" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground leading-tight truncate">{primary}</p>
              <div className="flex gap-2 mt-0.5 text-[10px] tabular-nums">
                <span className={statColor(r.health)}>{signed(r.health)}</span>
                <span className={statColor(r.hunger)}>{signed(r.hunger)}</span>
                <span className={statColor(r.sanity)}>{signed(r.sanity)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function IngredientPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const d = load(slug, lang);
  if (!d) notFound();
  const routePrefix = lang === "ko" ? "/ko" : "";
  const cookpotPath = `${routePrefix}/cookpot`;
  const faq = buildFaq(d, lang);
  const itemPage = itemHref(d.ing.id, routePrefix);
  const hasItemPage = itemPage && !itemPage.includes("#");

  const tagText = d.tags.map((t) => `${t.label} ${num(t.value)}`).join(" · ");
  const intro =
    lang === "ko"
      ? `${pp(d.name, "은", "는")} Don't Starve Together의 요리솥 재료입니다.${tagText ? ` 요리솥 값은 ${tagText}입니다.` : ""}${d.cookpot.length ? ` 이 재료를 넣어 만들 수 있는 요리는 ${d.cookpot.length}가지입니다.` : ""}`
      : `${d.name} is a Crock Pot ingredient in Don't Starve Together.${tagText ? ` It counts as ${tagText} in the pot.` : ""}${d.cookpot.length ? ` ${d.cookpot.length} dishes can be cooked with it.` : ""}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "dstcraft.com", item: `${SITE_URL}${routePrefix}/` },
      { "@type": "ListItem", position: 2, name: L.cookpotSimulator[lang], item: `${SITE_URL}${cookpotPath}` },
      { "@type": "ListItem", position: 3, name: d.name },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={breadcrumbLd} />
      {faq.length > 0 && <JsonLd data={faqLd(faq, lang)} />}

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={`${routePrefix}/`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {L.backHome[lang]}
          </Link>
          <Link href={cookpotPath} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {L.cookpotSimulator[lang]}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
            <img src={d.image} alt={d.name} className="size-20 object-contain" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {d.name} | {T.kind[lang]}
            </h1>
            {d.altName !== d.name && <p className="text-base text-muted-foreground mt-0.5">{d.altName}</p>}
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{intro}</p>
          </div>
        </section>

        <AdBleed>
          <AdSlot variant="top" />
        </AdBleed>

        {d.tags.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">
              {d.name} {T.valuesHeading[lang]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {d.tags.map((t) => (
                <span
                  key={t.tag}
                  className="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm"
                >
                  {t.label}
                  <span className="font-semibold tabular-nums">{num(t.value)}</span>
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{T.valuesNote[lang]}</p>
          </section>
        )}

        {d.forms.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">
              {d.name} {T.statsHeading[lang]}
            </h2>
            <div className="rounded-lg border border-border bg-surface overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left font-medium px-3 py-2">{T.form[lang]}</th>
                    <th className="text-right font-medium px-3 py-2">{T.hunger[lang]}</th>
                    <th className="text-right font-medium px-3 py-2">{T.health[lang]}</th>
                    <th className="text-right font-medium px-3 py-2">{T.sanity[lang]}</th>
                    <th className="text-right font-medium px-3 py-2">{T.perish[lang]}</th>
                  </tr>
                </thead>
                <tbody>
                  {d.forms.map((f) => (
                    <tr key={f.key} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{T[f.key][lang]}</td>
                      <td className={`px-3 py-2 text-right ${statColor(f.hunger)}`}>{signed(f.hunger)}</td>
                      <td className={`px-3 py-2 text-right ${statColor(f.health)}`}>{signed(f.health)}</td>
                      <td className={`px-3 py-2 text-right ${statColor(f.sanity)}`}>{signed(f.sanity)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {f.perishDays === undefined
                          ? T.noPerish[lang]
                          : lang === "ko"
                            ? `${num(f.perishDays)}일`
                            : `${num(f.perishDays)}d`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {d.cookpot.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-1">
              {fill(T.recipesHeading[lang], { name: lang === "ko" ? pp(d.name, "을", "를") : d.name })} ({d.cookpot.length})
            </h2>
            <p className="text-xs text-muted-foreground mb-3">{fill(T.recipesNote[lang], { name: d.name })}</p>
            <RecipeGrid recipes={d.cookpot} lang={lang} routePrefix={routePrefix} />
          </section>
        )}

        {d.warlyOnly.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {T.warlyHeading[lang]} ({d.warlyOnly.length})
            </h2>
            <RecipeGrid recipes={d.warlyOnly} lang={lang} routePrefix={routePrefix} />
          </section>
        )}

        <DroppedBySection sources={dropSourcesOf(d.ing.id, lang, routePrefix)} lang={lang} />

        {(d.usedIn.length > 0 || hasItemPage) && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {T.usedInHeading[lang]}
              {d.usedIn.length > 0 && ` (${d.usedIn.length})`}
            </h2>
            {d.usedIn.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {d.usedIn.map((other) => {
                  const primary = lang === "ko" ? (ko.items[other.id]?.name ?? other.name) : other.name;
                  return (
                    <Link
                      key={other.id}
                      href={`${routePrefix}/item/${canonicalForItem(other.id)}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                    >
                      <img
                        src={`/images/game-items/${other.image}`}
                        alt={primary}
                        className="size-10 object-contain shrink-0"
                        loading="lazy"
                      />
                      <p className="text-xs font-medium text-foreground leading-tight truncate">{primary}</p>
                    </Link>
                  );
                })}
              </div>
            )}
            {hasItemPage && (
              <Link href={itemPage} className="inline-block mt-3 text-xs text-muted-foreground hover:text-foreground underline">
                {fill(T.itemPage[lang], { name: d.name })}
              </Link>
            )}
          </section>
        )}

        {faq.length > 0 && <FaqSection title={T.faqTitle[lang]} faq={faq} />}

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{T.cta[lang]}</p>
          <p className="text-xs text-muted-foreground">{T.ctaDesc[lang]}</p>
          <Link
            href="/?tab=cookpot"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {T.ctaButton[lang]}
          </Link>
        </section>

        <DataSourceNote kind="extracted" lang={lang} />
      </main>
    </div>
  );
}

export function buildIngredientMetadata(slug: string, lang: SeoLang) {
  const d = load(slug, lang);
  if (!d) return {};
  const canonicalSlug = ingredientSlugs.idToSlug.get(d.ing.id) ?? slug;
  const title =
    lang === "ko"
      ? `${d.name} — 굶지마 투게더 요리솥 재료 · 만들 수 있는 요리`
      : `${d.name} — Don't Starve Together Crock Pot Ingredient & Recipes`;
  const tagText = d.tags.map((t) => `${t.label} ${num(t.value)}`).join(", ");
  const raw = d.forms.find((f) => f.key === "raw") ?? d.forms[0];
  const top = d.cookpot.slice(0, 5).map((r) => foodName(r, lang)).join(", ");
  const description = (
    lang === "ko"
      ? `굶지마 투게더 ${d.name}${tagText ? `: 요리솥 값 ${tagText}.` : "."}${raw ? ` 먹으면 허기 ${signed(raw.hunger)}, 체력 ${signed(raw.health)}, 정신력 ${signed(raw.sanity)}.` : ""}${d.cookpot.length ? ` 만들 수 있는 요리 ${d.cookpot.length}가지: ${top} 등.` : ""}`
      : `${d.name} in Don't Starve Together${tagText ? `: Crock Pot value ${tagText}.` : "."}${raw ? ` Eating it gives ${signed(raw.hunger)} hunger, ${signed(raw.health)} health, ${signed(raw.sanity)} sanity.` : ""}${d.cookpot.length ? ` Used in ${d.cookpot.length} dishes: ${top} and more.` : ""}`
  ).slice(0, 300);

  const enUrl = `${SITE_URL}/ingredient/${canonicalSlug}`;
  const koUrl = `${SITE_URL}/ko/ingredient/${canonicalSlug}`;
  const canonical = lang === "ko" ? koUrl : enUrl;
  return {
    title,
    description,
    alternates: { canonical, languages: { en: enUrl, "x-default": enUrl, ko: koUrl } },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      images: [{ url: `${SITE_URL}${d.image}` }],
    },
  };
}
