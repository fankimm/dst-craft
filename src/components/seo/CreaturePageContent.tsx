import Link from "next/link";
import { notFound } from "next/navigation";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { creatureSubcatNames } from "@/data/creature-names";
import { creatureDisplayNames, creatureSlugs, creatureVariantNote, resolveCreatureSlug } from "@/lib/creature-slug";
import { pp } from "@/lib/seo-text";
import { assetPath } from "@/lib/asset-path";
import { ItemStatsPanel } from "@/components/crafting/ItemStatsPanel";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdBleed } from "@/components/ads/AdBleed";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";
import { DataSourceNote, fillTemplate as fill } from "./list-schema";
import { hasGameItemImage } from "./ItemsCatalogContent";
import { buildRelated, lootRows, RelatedChip } from "./CreaturesCatalogContent";
import { LootCard, chancePercent } from "./LootCard";
import { creatureLoot } from "@/data/creature-loot";
import { materialHref } from "@/lib/catalog-slug";

/**
 * 스크랩북 생물 상세 페이지 (/creature/<slug>, /ko/creature/<slug>) — #160, #145 2단계.
 * 어떤 생물이 페이지를 갖는지는 `src/lib/creature-slug.ts`가 정한다.
 * 화면의 게임 사실은 전부 스크랩북 데이터(수치·설명·관련 항목·분류)에서 온다 — 지어낸 문장 없음.
 */

const SITE_URL = "https://www.dstcraft.com";
const imageOf = (id: string) => (hasGameItemImage(id) ? `/images/game-items/${id}.png` : undefined);

function load(slug: string, lang: SeoLang) {
  const id = resolveCreatureSlug(slug);
  if (!id) return undefined;
  const idx = lang === "ko" ? 1 : 0;
  const names = creatureDisplayNames(id);
  const stats = scrapbookStats[id];
  const subcat = stats.subcat && creatureSubcatNames[stats.subcat] ? stats.subcat : undefined;
  return {
    id,
    stats,
    name: names[idx],
    altName: names[1 - idx],
    variantNote: creatureVariantNote(id, lang),
    subcat,
    subcatLabel: subcat ? creatureSubcatNames[subcat][idx] : undefined,
    image: imageOf(id),
    special: (lang === "ko" ? stats.specialinfo_ko : stats.specialinfo_en) ?? stats.specialinfo_en ?? "",
  };
}

/** 같은 스크랩북 분류의 다른 생물 (상세 페이지가 있는 것만) */
function sameCategory(id: string, subcat: string | undefined, lang: SeoLang) {
  if (!subcat) return [];
  const idx = lang === "ko" ? 1 : 0;
  const collator = new Intl.Collator(lang === "ko" ? "ko" : "en");
  return [...creatureSlugs.idToSlug.entries()]
    .filter(([other]) => other !== id && scrapbookStats[other].subcat === subcat)
    .map(([other, slug]) => ({ id: other, slug, name: creatureDisplayNames(other)[idx], image: imageOf(other) }))
    .sort((a, b) => collator.compare(a.name, b.name))
    .slice(0, 12);
}

export function CreaturePageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const c = load(slug, lang);
  if (!c) notFound();
  const routePrefix = lang === "ko" ? "/ko" : "";
  const catalogPath = `${routePrefix}/creatures`;

  // 한국어 문장은 이름에 주제 조사를 붙여 넣는다 (템플릿의 {name} 뒤에 조사 없음)
  // 변종 라벨이 붙은 이름("코알라판트 (겨울)")은 닫는 괄호 앞 글자의 받침으로 조사를 고른다
  const bare = c.name.replace(/\)$/, "");
  const introName = lang === "ko" ? c.name + pp(bare, "은", "는").slice(bare.length) : c.name;
  const related = buildRelated(c.stats.deps, lang, routePrefix);
  const siblings = sameCategory(c.id, c.subcat, lang);
  const loot = lootRows(c.id, lang);
  // 무작위 뽑기 묶음(#176) — AddRandomLoot 줄들 가운데 pick 개만 나온다
  const lootPick = loot.find((r) => r.pick != null)?.pick;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "dstcraft.com", item: `${SITE_URL}${routePrefix}/` },
      { "@type": "ListItem", position: 2, name: L.creatureCatalog[lang], item: `${SITE_URL}${catalogPath}` },
      { "@type": "ListItem", position: 3, name: c.name },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={breadcrumbLd} />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={`${routePrefix}/`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {L.backHome[lang]}
          </Link>
          <Link href={catalogPath} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {L.creatureCatalog[lang]}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          {c.image && (
            <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
              <img src={assetPath(c.image)} alt={c.name} className="size-20 object-contain" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {c.name} | {L.creatureTitleSuffix[lang]}
            </h1>
            {c.altName !== c.name && <p className="text-base text-muted-foreground mt-0.5">{c.altName}</p>}
            {c.variantNote && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.variantNote}</p>}
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
              {c.subcatLabel
                ? fill(L.creatureIntro[lang], { name: introName, cat: c.subcatLabel })
                : fill(L.creatureIntroNoCat[lang], { name: introName })}
            </p>
            {c.subcat && (
              <Link
                href={`${catalogPath}#cat-${c.subcat}`}
                className="inline-block mt-2 text-xs rounded-full border border-border bg-surface px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
              >
                {c.subcatLabel}
              </Link>
            )}
          </div>
        </section>

        <AdBleed>
          <AdSlot variant="top" />
        </AdBleed>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            {c.name} {L.creatureScrapbook[lang]}
          </h2>
          <div className="rounded-lg border border-border bg-surface p-4">
            <ItemStatsPanel itemId={c.id} stats={c.stats} locale={lang} />
          </div>
        </section>

        {loot.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-1">
              {c.name} {L.creatureLoot[lang]}
            </h2>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {L.creatureLootNote[lang]}
              {lootPick != null && <> {L.creatureLootPickNote[lang].replaceAll("{n}", String(lootPick))}</>}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loot.map((row) => (
                <LootCard
                  key={`${row.item}-${row.chance}`}
                  name={row.name}
                  sub={row.sub}
                  image={imageOf(row.item)}
                  href={materialHref(row.item, routePrefix)}
                  count={row.count}
                  chanceLabel={
                    row.pick != null
                      ? `${chancePercent(row.chance)} · ${L.creatureLootPick[lang].replace("{n}", String(row.pick))}`
                      : chancePercent(row.chance)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.creatureCatalogRelated[lang]}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {related.map((r) => (
                <RelatedChip key={r.id} entry={r} />
              ))}
            </div>
          </section>
        )}

        {siblings.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {fill(L.creatureSameCategory[lang], { cat: c.subcatLabel ?? "" })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {siblings.map((s) => (
                <Link
                  key={s.id}
                  href={`${routePrefix}/creature/${s.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                >
                  {s.image && (
                    <img src={assetPath(s.image)} alt="" className="size-10 object-contain shrink-0" loading="lazy" />
                  )}
                  <p className="text-xs font-medium text-foreground leading-tight truncate">{s.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.creatureCatalogHeading[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.creatureCatalogShort[lang]}</p>
          <Link
            href={catalogPath}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.creatureOpenCatalog[lang]}
          </Link>
        </section>

        <DataSourceNote kind="extracted" lang={lang} />
      </main>
    </div>
  );
}

export function buildCreatureMetadata(slug: string, lang: SeoLang) {
  const c = load(slug, lang);
  if (!c) return {};
  // 제목의 "체력·공격력"은 그 수치가 실제로 있는 생물에만 붙인다
  const facets = [
    c.stats.health != null ? (lang === "ko" ? "체력" : "Health") : undefined,
    c.stats.damage != null ? (lang === "ko" ? "공격력" : "Damage") : undefined,
    creatureLoot[c.id] ? (lang === "ko" ? "전리품" : "Drops") : undefined,
  ].filter(Boolean);
  const facetJoined =
    lang === "ko" || facets.length < 2 ? facets.join("·") : `${facets.slice(0, -1).join(", ")} & ${facets.at(-1)}`;
  const facetText = facets.length > 0 ? ` (${facetJoined})` : "";
  const title =
    lang === "ko"
      ? `${c.name} — 굶지마 투게더 생물 정보${facetText}`
      : `${c.name} — Don't Starve Together Creature Stats${facetText}`;
  const firstLine = c.special.split("\n").find(Boolean) ?? "";
  // 전리품이 있는 생물은 확정 전리품 이름을 설명에 넣는다 (검색 "○○ 드롭" 의도)
  const lootNames = [...new Set(lootRows(c.id, lang).map((r) => r.name))].slice(0, 4);
  const lootText =
    lootNames.length > 0
      ? lang === "ko"
        ? ` 전리품: ${lootNames.join(", ")}.`
        : ` Drops: ${lootNames.join(", ")}.`
      : "";
  const lead =
    lang === "ko"
      ? `굶지마 투게더 ${c.name}${c.subcatLabel ? ` (${c.subcatLabel})` : ""}의 인게임 스크랩북 수치와 설명.`
      : `In-game Scrapbook stats and notes for ${c.name}${c.subcatLabel ? ` (${c.subcatLabel})` : ""} in Don't Starve Together.`;
  const description = `${lead}${lootText} ${firstLine}`.trim().slice(0, 300);

  const enUrl = `${SITE_URL}/creature/${slug}`;
  const koUrl = `${SITE_URL}/ko/creature/${slug}`;
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
      ...(c.image ? { images: [{ url: `${SITE_URL}${c.image}` }] } : {}),
    },
  };
}
