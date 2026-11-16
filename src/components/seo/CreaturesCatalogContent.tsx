import Link from "next/link";
import { scrapbookStats } from "@/data/scrapbook-stats";
import {
  creatureNames,
  creatureRelatedNames,
  creatureSubcatNames,
} from "@/data/creature-names";
import { itemNames } from "@/data/item-names";
import { itemSlugs } from "@/lib/slug";
import { assetPath } from "@/lib/asset-path";
import { ItemStatsPanel } from "@/components/crafting/ItemStatsPanel";
import { AdSlot } from "@/components/ads/AdSlot";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";
import { DataSourceNote, fillTemplate as fill, itemListLd } from "./list-schema";
import { CatalogIconBox, hasGameItemImage, type CatalogEntry } from "./ItemsCatalogContent";

/**
 * 생물 도감 (/creatures, /ko/creatures) — #149, #145 1단계.
 * 인게임 스크랩북의 `type: "creature"` 전부를 스크랩북 분류(subcat)대로 묶는다. 거인(`type: "giant"`)은 보스 페이지 몫.
 * 이름·분류명·관련 항목 이름은 scripts/extract-item-names.py 가 ko.po 에서 뽑은 것만 쓴다.
 * "관련 항목"은 스크랩북 deps 그대로다 — 전리품만이 아니라 서식지·연관 생물도 섞여 있어 "전리품"이라 부르지 않는다.
 */

const SITE_URL = "https://www.dstcraft.com";
const OTHER = "_other";

interface RelatedEntry {
  id: string;
  name: string;
  href?: string;
  image?: string;
}

function buildRelated(deps: string[] | undefined, lang: SeoLang, routePrefix: string): RelatedEntry[] {
  const idx = lang === "ko" ? 1 : 0;
  const out: RelatedEntry[] = [];
  for (const id of deps ?? []) {
    const names = creatureNames[id] ?? creatureRelatedNames[id];
    if (!names) continue; // 게임에 이름 문자열이 없는 표시용 prefab — 생성 스크립트가 개수를 알린다
    const slug = itemSlugs.idToSlug.get(id);
    const href = creatureNames[id]
      ? `#${id}`
      : slug
        ? `${routePrefix}/item/${slug}`
        : itemNames[id]
          ? `${routePrefix}/items#${id}`
          : undefined;
    out.push({
      id,
      name: names[idx],
      href,
      image: hasGameItemImage(id) ? `/images/game-items/${id}.png` : undefined,
    });
  }
  return out;
}

function buildCatalog(lang: SeoLang) {
  const idx = lang === "ko" ? 1 : 0;
  const groups = new Map<string, CatalogEntry[]>();
  for (const [id, stats] of Object.entries(scrapbookStats)) {
    if (stats.type !== "creature") continue;
    const names = creatureNames[id];
    if (!names) continue; // 생성 스크립트가 누락을 exit 1로 막는다 — 여기 오면 데이터 불일치
    const key = stats.subcat && creatureSubcatNames[stats.subcat] ? stats.subcat : OTHER;
    const list = groups.get(key) ?? [];
    list.push({
      id,
      name: names[idx],
      altName: names[1 - idx],
      image: hasGameItemImage(id) ? `/images/game-items/${id}.png` : undefined,
    });
    groups.set(key, list);
  }
  const collator = new Intl.Collator(lang === "ko" ? "ko" : "en");
  for (const list of groups.values()) list.sort((a, b) => collator.compare(a.name, b.name) || a.id.localeCompare(b.id));
  const ordered = [...groups.entries()].sort(([a, la], [b, lb]) =>
    a === OTHER ? 1 : b === OTHER ? -1 : lb.length - la.length || a.localeCompare(b),
  );
  return ordered.map(([key, items]) => ({
    key,
    label: key === OTHER ? L.itemCatalogOther[lang] : creatureSubcatNames[key][idx],
    items,
  }));
}

function RelatedChip({ entry }: { entry: RelatedEntry }) {
  const body = (
    <>
      {entry.image && (
        <img src={assetPath(entry.image)} alt="" className="size-3.5 object-contain" loading="lazy" />
      )}
      <span>{entry.name}</span>
    </>
  );
  const cls = "inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px]";
  return entry.href ? (
    <Link href={entry.href} className={`${cls} text-primary hover:border-ring transition-colors`}>
      {body}
    </Link>
  ) : (
    <span className={`${cls} text-muted-foreground`}>{body}</span>
  );
}

export function CreaturesCatalogContent({ lang }: { lang: SeoLang }) {
  const routePrefix = lang === "ko" ? "/ko" : "";
  const groups = buildCatalog(lang);
  const all = groups.flatMap((g) => g.items);

  const listLd = itemListLd(
    L.creatureCatalogHeading[lang],
    `${routePrefix}/creatures`,
    all.map((e) => ({
      name: e.name,
      path: `${routePrefix}/creatures#${e.id}`,
      ...(e.image ? { image: e.image } : {}),
    })),
    lang,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={listLd} />
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.creatureCatalog[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground">{L.creatureCatalogHeading[lang]}</h1>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            {fill(L.creatureCatalogIntro[lang], { n: all.length })}
          </p>
        </section>

        <nav className="flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <a
              key={g.key}
              href={`#cat-${g.key}`}
              className="text-xs rounded-full border border-border bg-surface px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
            >
              {g.label} <span className="tabular-nums">{g.items.length}</span>
            </a>
          ))}
        </nav>

        <AdSlot variant="top" />

        {groups.map((g) => (
          <section key={g.key} id={`cat-${g.key}`} className="scroll-mt-4 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              {g.label} <span className="text-sm font-normal text-muted-foreground tabular-nums">{g.items.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {g.items.map((e) => {
                const related = buildRelated(scrapbookStats[e.id].deps, lang, routePrefix);
                return (
                  <article
                    key={e.id}
                    id={e.id}
                    className="scroll-mt-4 rounded-lg border border-border bg-surface p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      {e.image && <CatalogIconBox entry={e} />}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{e.name}</h3>
                        {e.altName !== e.name && <p className="text-xs text-muted-foreground">{e.altName}</p>}
                      </div>
                    </div>
                    <ItemStatsPanel itemId={e.id} stats={scrapbookStats[e.id]} locale={lang} />
                    {related.length > 0 && (
                      <div>
                        <p className="text-[11px] text-muted-foreground mb-1">{L.creatureCatalogRelated[lang]}</p>
                        <div className="flex flex-wrap gap-1">
                          {related.map((r) => (
                            <RelatedChip key={r.id} entry={r} />
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <DataSourceNote kind="extracted" lang={lang} />
      </main>
    </div>
  );
}

export function buildCreaturesCatalogMetadata(lang: SeoLang) {
  const title =
    lang === "ko"
      ? "생물 도감 — 굶지마 투게더 몬스터·동물 체력과 공격력"
      : "Creature Catalog — Don't Starve Together Mob Health & Damage";
  const description =
    lang === "ko"
      ? "굶지마 투게더 인게임 스크랩북의 모든 생물을 분류별로 정리했습니다. 거미·사냥개·어인·태엽 장치·그림자 생물 등 몬스터와 동물의 체력, 공격력, 정신력 오라를 확인하세요."
      : "Every creature from the Don't Starve Together Scrapbook, grouped by category. Check health, damage and sanity aura for spiders, hounds, merms, clockworks, shadow creatures and more.";
  const enUrl = `${SITE_URL}/creatures`;
  const koUrl = `${SITE_URL}/ko/creatures`;
  const canonical = lang === "ko" ? koUrl : enUrl;
  return {
    title,
    description,
    alternates: { canonical, languages: { en: enUrl, "x-default": enUrl, ko: koUrl } },
    openGraph: { title, description, url: canonical, locale: lang === "ko" ? "ko_KR" : "en_US" },
  };
}
