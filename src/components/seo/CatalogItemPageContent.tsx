import Link from "next/link";
import { notFound } from "next/navigation";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { itemNames, itemSubcatNames } from "@/data/item-names";
import { canonicalForItem } from "@/lib/slug";
import { catalogItemSlugs, resolveCatalogItemSlug } from "@/lib/catalog-slug";
import { pp } from "@/lib/seo-text";
import { assetPath } from "@/lib/asset-path";
import { ItemStatsPanel } from "@/components/crafting/ItemStatsPanel";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdBleed } from "@/components/ads/AdBleed";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";
import { DataSourceNote, fillTemplate as fill } from "./list-schema";
import { hasGameItemImage } from "./ItemsCatalogContent";
import { buildRelated, RelatedChip } from "./CreaturesCatalogContent";
import { DroppedBySection, dropSourcesOf } from "./DroppedBy";

/**
 * 제작 탭에 없는 스크랩북 아이템의 상세 페이지 (/item/<slug>, /ko/item/<slug>) — #159, #144 2단계.
 * 어떤 아이템이 페이지를 갖는지는 `src/lib/catalog-slug.ts`가 정한다.
 * 화면의 게임 사실은 전부 스크랩북 데이터(수치·설명·관련 항목)와 제작 데이터(사용처)에서 온다 — 지어낸 문장 없음.
 */

const SITE_URL = "https://www.dstcraft.com";

function load(slug: string, lang: SeoLang) {
  const id = resolveCatalogItemSlug(slug);
  if (!id) return undefined;
  const idx = lang === "ko" ? 1 : 0;
  const names = itemNames[id];
  const stats = scrapbookStats[id];
  const subcat = stats.subcat && itemSubcatNames[stats.subcat] ? stats.subcat : undefined;
  return {
    id,
    stats,
    name: names[idx],
    altName: names[1 - idx],
    subcat,
    subcatLabel: subcat ? itemSubcatNames[subcat][idx] : undefined,
    image: hasGameItemImage(id) ? `/images/game-items/${id}.png` : undefined,
    special: (lang === "ko" ? stats.specialinfo_ko : stats.specialinfo_en) ?? stats.specialinfo_en ?? "",
  };
}

/** 이 아이템을 재료로 쓰는 제작법 전체 — 설명 없는 재료 페이지에선 이 목록이 본문이다 (#162) */
function usedInOf(id: string) {
  return allItems.filter((other) => other.materials.some((m) => m.materialId === id));
}

export function CatalogItemPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const item = load(slug, lang);
  if (!item) notFound();
  const routePrefix = lang === "ko" ? "/ko" : "";
  const catalogPath = `${routePrefix}/items`;

  const usedIn = usedInOf(item.id);
  // 한국어 문장은 이름에 주제 조사를 붙여 넣는다 (템플릿의 {name} 뒤에 조사 없음)
  const introName = lang === "ko" ? pp(item.name, "은", "는") : item.name;
  const related = buildRelated(item.stats.deps, lang, routePrefix);
  const dropSources = dropSourcesOf(item.id, lang, routePrefix);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "dstcraft.com", item: `${SITE_URL}${routePrefix}/` },
      { "@type": "ListItem", position: 2, name: L.itemCatalog[lang], item: `${SITE_URL}${catalogPath}` },
      { "@type": "ListItem", position: 3, name: item.name },
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
            {L.itemCatalog[lang]}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          {item.image && (
            <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
              <img src={assetPath(item.image)} alt={item.name} className="size-20 object-contain" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {item.name} | {L.catalogItemTitleSuffix[lang]}
            </h1>
            {item.altName !== item.name && <p className="text-base text-muted-foreground mt-0.5">{item.altName}</p>}
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
              {item.subcatLabel
                ? fill(L.catalogItemIntro[lang], { name: introName, cat: item.subcatLabel })
                : fill(L.catalogItemIntroNoCat[lang], { name: introName })}
              {usedIn.length > 0 && ` ${fill(L.catalogItemUsedInCount[lang], { n: String(usedIn.length) })}`}
            </p>
            {item.subcat && (
              <Link
                href={`${catalogPath}#cat-${item.subcat}`}
                className="inline-block mt-2 text-xs rounded-full border border-border bg-surface px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
              >
                {item.subcatLabel}
              </Link>
            )}
          </div>
        </section>

        <AdBleed>
          <AdSlot variant="top" />
        </AdBleed>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            {item.name} {L.catalogItemScrapbook[lang]}
          </h2>
          <div className="rounded-lg border border-border bg-surface p-4">
            <ItemStatsPanel itemId={item.id} stats={item.stats} locale={lang} />
          </div>
        </section>

        <DroppedBySection sources={dropSources} lang={lang} />

        {usedIn.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.catalogItemUsedIn[lang]} ({usedIn.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {usedIn.map((other) => {
                const otherKo = ko.items[other.id]?.name;
                const primary = lang === "ko" ? (otherKo ?? other.name) : other.name;
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

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.itemCatalogHeading[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.itemCatalogShort[lang]}</p>
          <Link
            href={catalogPath}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.catalogItemOpenCatalog[lang]}
          </Link>
        </section>

        <DataSourceNote kind="extracted" lang={lang} />
      </main>
    </div>
  );
}

export function buildCatalogItemMetadata(slug: string, lang: SeoLang) {
  const item = load(slug, lang);
  if (!item) return {};
  const canonicalSlug = catalogItemSlugs.idToSlug.get(item.id) ?? slug;
  const title =
    lang === "ko"
      ? `${item.name} — 굶지마 투게더 아이템 정보`
      : `${item.name} — Don't Starve Together Item Stats`;
  const firstLine = item.special.split("\n").find(Boolean) ?? "";
  const lead =
    lang === "ko"
      ? `굶지마 투게더 ${item.name}${item.subcatLabel ? ` (${item.subcatLabel})` : ""}의 인게임 스크랩북 수치와 설명.`
      : `In-game Scrapbook stats and description for ${item.name}${item.subcatLabel ? ` (${item.subcatLabel})` : ""} in Don't Starve Together.`;
  const usedIn = usedInOf(item.id);
  const usedNames = usedIn.slice(0, 5).map((o) => (lang === "ko" ? (ko.items[o.id]?.name ?? o.name) : o.name));
  const usedLine =
    usedIn.length === 0
      ? ""
      : lang === "ko"
        ? `제작법 ${usedIn.length}개의 재료: ${usedNames.join(", ")}${usedIn.length > usedNames.length ? " 등" : ""}.`
        : `Used in ${usedIn.length} crafting recipe${usedIn.length > 1 ? "s" : ""}: ${usedNames.join(", ")}${usedIn.length > usedNames.length ? " and more" : ""}.`;
  // 검색 "○○ 얻는 법" 의도 — 떨어뜨리는 생물 이름을 설명에 넣는다 (#177)
  const dropNames = dropSourcesOf(item.id, lang, "").slice(0, 4).map((d) => d.name);
  const dropLine =
    dropNames.length === 0 ? "" : lang === "ko" ? `떨어뜨리는 생물: ${dropNames.join(", ")}.` : `Dropped by ${dropNames.join(", ")}.`;
  const description = `${lead} ${dropLine} ${usedLine} ${firstLine}`.replace(/\s+/g, " ").trim().slice(0, 300);

  const enUrl = `${SITE_URL}/item/${canonicalSlug}`;
  const koUrl = `${SITE_URL}/ko/item/${canonicalSlug}`;
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
      ...(item.image ? { images: [{ url: `${SITE_URL}${item.image}` }] } : {}),
    },
  };
}
