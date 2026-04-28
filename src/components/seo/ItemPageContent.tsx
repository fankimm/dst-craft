import { allItems } from "@/data/items";
import { materials } from "@/data/materials";
import { characters } from "@/data/characters";
import { categories } from "@/data/categories";
import { ko } from "@/data/locales/ko";
import { stationImages } from "@/lib/crafting-data";
import { stationName } from "@/lib/i18n";
import { generateItemSeoText, generateItemSeoTextKo } from "@/lib/seo-text";
import type { CraftingStation } from "@/lib/types";
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

const stationLabelsEn: Record<string, string> = {
  none: "Hand Craft",
  science_1: "Science Machine",
  science_2: "Alchemy Engine",
  magic_1: "Prestihatitator",
  magic_2: "Shadow Manipulator",
  ancient: "Ancient Pseudoscience Station",
  celestial: "Celestial Altar",
  think_tank: "Think Tank",
  cartography: "Cartography Desk",
  tackle_station: "Tackle Receptacle",
  potter_wheel: "Potter's Wheel",
  bookstation: "Bookcase",
  portableblender: "Portable Grinding Mill",
  lunar_forge: "Lunar Forge",
  shadow_forge: "Shadow Forge",
  carpentry_station: "Carpentry Station",
  turfcraftingstation: "Turf Crafting Station",
  wagpunk_workstation: "Notional Fabricator",
  critter_lab: "Rock Den",
  character: "Character Specific",
};

function stationLabelFor(station: string, lang: SeoLang): string {
  if (lang === "ko") {
    return stationName(station as CraftingStation, "ko");
  }
  return stationLabelsEn[station] ?? station;
}

export function ItemPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const item = allItems.find((i) => i.id === slugToId(slug));
  if (!item) notFound();

  const nameKo = ko.items[item.id]?.name;
  const descKo = ko.items[item.id]?.desc;
  const displayName = lang === "ko" ? (nameKo ?? item.name) : item.name;
  const subtitle = lang === "ko" ? item.name : nameKo;
  const description = lang === "ko" ? (descKo ?? item.description) : item.description;
  const altDescription = lang === "ko" ? item.description : descKo;

  const character = item.characterOnly
    ? characters.find((c) => c.id === item.characterOnly)
    : null;
  const characterName = character
    ? (lang === "ko" ? (character.nameKo ?? character.name) : character.name)
    : null;
  const stationImg = stationImages[item.station];
  const stationLabel = stationLabelFor(item.station, lang);
  const itemCategories = categories.filter((c) =>
    item.category.includes(c.id as never),
  );

  const usedIn = allItems
    .filter((other) => other.materials.some((m) => m.materialId === item.id))
    .slice(0, 8);

  const materialItems = item.materials.map((m) => ({
    ...m,
    item: allItems.find((x) => x.id === m.materialId),
  }));

  const seoMaterials = item.materials.map((m) => {
    const mat = materials.find((x) => x.id === m.materialId);
    return {
      name: mat?.name ?? m.materialId,
      quantity: m.quantity,
      slug: allItems.find((x) => x.id === m.materialId) ? idToSlug(m.materialId) : undefined,
    };
  });
  const seoMaterialsKo = item.materials.map((m) => {
    const mat = materials.find((x) => x.id === m.materialId);
    const matNameKo = ko.materials[m.materialId]?.name ?? ko.items[m.materialId]?.name ?? mat?.name ?? m.materialId;
    return { nameKo: matNameKo, quantity: m.quantity };
  });
  const usedInNamesEn = usedIn.map((u) => u.name);
  const usedInNamesKo = usedIn.map((u) => ko.items[u.id]?.name ?? u.name);

  const seo = lang === "ko"
    ? generateItemSeoTextKo(
        {
          nameKo: nameKo ?? item.name,
          descriptionKo: descKo ?? item.description,
          station: item.station,
          materials: seoMaterialsKo,
          characterOnly: item.characterOnly,
          category: item.category,
          healthCost: (item as { healthCost?: number }).healthCost,
        },
        stationLabel,
        characterName,
        usedInNamesKo,
      )
    : generateItemSeoText(
        {
          name: item.name,
          description: item.description,
          station: item.station,
          materials: seoMaterials,
          characterOnly: item.characterOnly,
          category: item.category,
          healthCost: (item as { healthCost?: number }).healthCost,
        },
        stationLabel,
        characterName,
        usedInNamesEn,
      );

  const routePrefix = lang === "ko" ? "/ko" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: lang === "ko"
      ? `Don't Starve Together에서 ${displayName} 만드는 법`
      : `How to craft ${displayName} in Don't Starve Together`,
    description,
    image: `${SITE_URL}/images/game-items/${item.image}`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    supply: item.materials.map((m) => {
      const mat = materials.find((x) => x.id === m.materialId);
      const matName = lang === "ko"
        ? (ko.materials[m.materialId]?.name ?? ko.items[m.materialId]?.name ?? mat?.name ?? m.materialId)
        : (mat?.name ?? m.materialId);
      return {
        "@type": "HowToSupply",
        name: matName,
        requiredQuantity: m.quantity,
      };
    }),
    tool: [{ "@type": "HowToTool", name: stationLabel }],
    step: lang === "ko"
      ? [
          {
            "@type": "HowToStep",
            text: `재료 모으기: ${seoMaterialsKo.map((m) => `${m.nameKo} ×${m.quantity}`).join(", ")}.`,
          },
          {
            "@type": "HowToStep",
            text:
              item.station === "none"
                ? "손으로 제작합니다 (제작대 불필요)."
                : `${stationLabel}을(를) 사용하여 제작합니다.`,
          },
        ]
      : [
          {
            "@type": "HowToStep",
            text: `Gather materials: ${seoMaterials.map((m) => `${m.name} ×${m.quantity}`).join(", ")}.`,
          },
          {
            "@type": "HowToStep",
            text:
              item.station === "none"
                ? "Craft by hand (no station required)."
                : `Use a ${stationLabel} to craft.`,
          },
        ],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/?item=${item.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.craftingGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
            <img
              src={`/images/game-items/${item.image}`}
              alt={displayName}
              className="size-20 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {lang === "ko"
                ? `${displayName} | Don't Starve Together 제작 가이드`
                : `${displayName} | Don't Starve Together Crafting Guide`}
            </h1>
            {subtitle && (
              <p className="text-base text-muted-foreground mt-0.5">{subtitle}</p>
            )}
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{description}</p>
            {altDescription && (
              <p className="text-xs text-muted-foreground mt-1 italic">{altDescription}</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.howToCraft[lang]} {displayName}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.howToCraft}</p>
        </section>

        {character && (
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
            <img
              src={`/images/category-icons/characters/${character.portrait}.png`}
              alt={characterName ?? character.name}
              className="size-8 object-contain"
            />
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                {L.characterExclusive[lang]}
              </p>
              <p className="text-sm text-foreground">
                {L.onlyXCanCraft[lang].replace("{x}", characterName ?? character.name)}
              </p>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.craftingStation[lang]}
          </h2>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            {stationImg ? (
              <img src={`/images/${stationImg}`} alt={stationLabel} className="size-8 object-contain" />
            ) : (
              <span className="size-8 flex items-center justify-center text-lg">🤲</span>
            )}
            <span className="text-sm font-medium">{stationLabel}</span>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.materialsRequired[lang]}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {materialItems.map((m) => {
              const mat = materials.find((x) => x.id === m.materialId);
              const matName = mat?.name ?? m.materialId;
              const matNameKo = ko.materials[m.materialId]?.name ?? ko.items[m.materialId]?.name;
              const primary = lang === "ko" ? (matNameKo ?? matName) : matName;
              const secondary = lang === "ko" ? matName : matNameKo;
              const inner = (
                <>
                  <div className="relative shrink-0">
                    <img
                      src={`/images/game-items/${mat?.image ?? m.materialId + ".png"}`}
                      alt={primary}
                      className="size-10 object-contain"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {m.quantity}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight truncate">{primary}</p>
                    {secondary && secondary !== primary && (
                      <p className="text-[10px] text-muted-foreground truncate">{secondary}</p>
                    )}
                  </div>
                </>
              );
              const cls = "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2";
              return m.item ? (
                <Link
                  key={m.materialId}
                  href={`${routePrefix}/item/${idToSlug(m.materialId)}`}
                  className={`${cls} hover:border-ring transition-colors`}
                >
                  {inner}
                </Link>
              ) : (
                <div key={m.materialId} className={cls}>{inner}</div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {displayName} {L.usesAndTips[lang]}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.usesAndTips}</p>
        </section>

        {itemCategories.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.categories[lang]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {itemCategories.map((cat) => {
                const catName = lang === "ko" ? (ko.categories[cat.id]?.name ?? cat.name) : cat.name;
                return (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground"
                  >
                    <img src={`/images/category-icons/${cat.id}.png`} alt="" className="size-3.5 object-contain" />
                    {catName}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {usedIn.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.usedIn[lang]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {usedIn.map((other) => {
                const otherKo = ko.items[other.id]?.name;
                const otherPrimary = lang === "ko" ? (otherKo ?? other.name) : other.name;
                const otherSecondary = lang === "ko" ? other.name : otherKo;
                return (
                  <Link
                    key={other.id}
                    href={`${routePrefix}/item/${idToSlug(other.id)}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                  >
                    <img
                      src={`/images/game-items/${other.image}`}
                      alt={otherPrimary}
                      className="size-10 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight truncate">{otherPrimary}</p>
                      {otherSecondary && otherSecondary !== otherPrimary && (
                        <p className="text-[10px] text-muted-foreground truncate">{otherSecondary}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

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

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.findMoreCrafting[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.ctaSearchAll[lang]}</p>
          <Link
            href={`/?item=${item.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openCraftingGuide[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildItemMetadata(slug: string, lang: SeoLang) {
  const item = allItems.find((i) => i.id === slugToId(slug));
  if (!item) return {};
  const nameKo = ko.items[item.id]?.name;
  const descKo = ko.items[item.id]?.desc;
  const displayName = lang === "ko" ? (nameKo ?? item.name) : item.name;
  const description = lang === "ko" ? (descKo ?? item.description) : item.description;

  const matList = item.materials
    .map((m) => {
      const mat = materials.find((x) => x.id === m.materialId);
      const matName = lang === "ko"
        ? (ko.materials[m.materialId]?.name ?? ko.items[m.materialId]?.name ?? mat?.name ?? m.materialId)
        : (mat?.name ?? m.materialId);
      return `${matName} ×${m.quantity}`;
    })
    .join(", ");

  const title = lang === "ko"
    ? `${displayName} — Don't Starve Together 제작 레시피`
    : `${displayName} — Don't Starve Together Crafting Recipe`;
  const desc = lang === "ko"
    ? `Don't Starve Together에서 ${displayName} 만드는 법. ${description} 재료: ${matList}. 제작대, 용도, 팁을 확인하세요.`
    : `How to craft ${displayName} in Don't Starve Together. ${description} Materials: ${matList}. See crafting station, uses, and tips.`;

  const enUrl = `${SITE_URL}/item/${slug}`;
  const koUrl = `${SITE_URL}/ko/item/${slug}`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description: desc,
    alternates: {
      canonical,
      languages: { en: enUrl, "x-default": enUrl, ko: koUrl },
    },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      images: [{ url: `${SITE_URL}/images/game-items/${item.image}` }],
    },
  };
}
