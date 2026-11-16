import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { itemNames, itemSubcatNames } from "@/data/item-names";
import { itemSlugs } from "@/lib/slug";
import { assetPath } from "@/lib/asset-path";
import { ItemStatsPanel } from "@/components/crafting/ItemStatsPanel";
import { AdSlot } from "@/components/ads/AdSlot";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";
import { DataSourceNote, fillTemplate as fill, itemListLd } from "./list-schema";

/**
 * 아이템 도감 (/items, /ko/items) — #148, #144 1단계.
 * 인게임 스크랩북의 `type: "item"` 전부를 스크랩북 분류(subcat)대로 묶는다.
 * 제작 가능(= /item/<slug> 페이지가 있는) 아이템은 링크만, 제작 불가 아이템은 여기서 스펙까지 보여 준다.
 * 이름·분류 이름은 scripts/extract-item-names.py 가 ko.po 에서 뽑은 것만 쓴다.
 */

const SITE_URL = "https://www.dstcraft.com";
const OTHER = "_other";

export interface CatalogEntry {
  id: string;
  name: string;
  /** 반대 언어 이름 (ko 페이지에서 영문 병기용) */
  altName: string;
  slug?: string;
  image?: string;
}

export const hasGameItemImage = (id: string) =>
  existsSync(path.join(process.cwd(), "public/images/game-items", `${id}.png`));

function buildCatalog(lang: SeoLang) {
  const groups = new Map<string, CatalogEntry[]>();
  for (const [id, stats] of Object.entries(scrapbookStats)) {
    if (stats.type !== "item") continue;
    const names = itemNames[id];
    if (!names) continue; // 생성 스크립트가 누락을 exit 1로 막는다 — 여기 오면 데이터 불일치
    const [en, ko] = names;
    const key = stats.subcat && itemSubcatNames[stats.subcat] ? stats.subcat : OTHER;
    const list = groups.get(key) ?? [];
    list.push({
      id,
      name: lang === "ko" ? ko : en,
      altName: lang === "ko" ? en : ko,
      slug: itemSlugs.idToSlug.get(id),
      image: hasGameItemImage(id) ? `/images/game-items/${id}.png` : undefined,
    });
    groups.set(key, list);
  }
  const collator = new Intl.Collator(lang === "ko" ? "ko" : "en");
  for (const list of groups.values()) list.sort((a, b) => collator.compare(a.name, b.name) || a.id.localeCompare(b.id));
  // 큰 분류부터, 분류 없는 항목은 맨 끝
  const ordered = [...groups.entries()].sort(([a, la], [b, lb]) =>
    a === OTHER ? 1 : b === OTHER ? -1 : lb.length - la.length || a.localeCompare(b),
  );
  return ordered.map(([key, items]) => ({
    key,
    label: key === OTHER ? L.itemCatalogOther[lang] : itemSubcatNames[key][lang === "ko" ? 1 : 0],
    items,
  }));
}

export function CatalogIconBox({ entry }: { entry: CatalogEntry }) {
  // ItemSlot 과 같은 40px 상자 — 라벨을 오른쪽에 두려고 아이콘만 쓴다 (ItemSlot 라벨은 60px에서 잘린다)
  return (
    <div className="flex shrink-0 items-center justify-center size-10 rounded border border-input bg-surface">
      {entry.image ? (
        <img src={assetPath(entry.image)} alt={entry.name} className="size-8 object-contain" loading="lazy" />
      ) : (
        <span className="text-[10px] text-muted-foreground">?</span>
      )}
    </div>
  );
}

export function ItemsCatalogContent({ lang }: { lang: SeoLang }) {
  const routePrefix = lang === "ko" ? "/ko" : "";
  const groups = buildCatalog(lang);
  const all = groups.flatMap((g) => g.items);
  const craftable = all.filter((e) => e.slug).length;

  const listLd = itemListLd(
    L.itemCatalogHeading[lang],
    `${routePrefix}/items`,
    all.map((e) => ({
      name: e.name,
      path: e.slug ? `${routePrefix}/item/${e.slug}` : `${routePrefix}/items#${e.id}`,
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
          <span className="text-xs text-muted-foreground">{L.itemCatalog[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground">{L.itemCatalogHeading[lang]}</h1>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            {fill(L.itemCatalogIntro[lang], { n: all.length, c: craftable, u: all.length - craftable })}
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

        {groups.map((g) => {
          const linked = g.items.filter((e) => e.slug);
          const inline = g.items.filter((e) => !e.slug);
          return (
            <section key={g.key} id={`cat-${g.key}`} className="scroll-mt-4 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                {g.label} <span className="text-sm font-normal text-muted-foreground tabular-nums">{g.items.length}</span>
              </h2>

              {linked.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{L.itemCatalogCraftable[lang]}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                    {linked.map((e) => (
                      <Link
                        key={e.id}
                        id={e.id}
                        href={`${routePrefix}/item/${e.slug}`}
                        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 hover:border-ring transition-colors"
                      >
                        <CatalogIconBox entry={e} />
                        <span className="text-sm text-primary underline decoration-dotted truncate">{e.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {inline.length > 0 && (
                <div>
                  {linked.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-1.5">{L.itemCatalogNotCraftable[lang]}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inline.map((e) => (
                      <article
                        key={e.id}
                        id={e.id}
                        className="scroll-mt-4 rounded-lg border border-border bg-surface p-3 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <CatalogIconBox entry={e} />
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground">{e.name}</h3>
                            {e.altName !== e.name && <p className="text-xs text-muted-foreground">{e.altName}</p>}
                          </div>
                        </div>
                        <ItemStatsPanel itemId={e.id} stats={scrapbookStats[e.id]} locale={lang} />
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        <DataSourceNote kind="extracted" lang={lang} />
      </main>
    </div>
  );
}

export function buildItemsCatalogMetadata(lang: SeoLang) {
  const title =
    lang === "ko"
      ? "아이템 도감 — 굶지마 투게더 전체 아이템 (제작 불가 포함)"
      : "Item Catalog — Every Don't Starve Together Item (incl. non-craftable)";
  const description =
    lang === "ko"
      ? "굶지마 투게더 인게임 스크랩북의 모든 아이템을 분류별로 정리했습니다. 보석·잡동사니·장식품·바닥·보스 전리품처럼 제작할 수 없는 아이템의 공격력·내구도·방어력·유통기한까지 확인하세요."
      : "Every item from the Don't Starve Together Scrapbook, grouped by category. Check damage, durability, armor and spoil time even for non-craftable items like gems, trinkets, ornaments, turfs and boss drops.";
  const enUrl = `${SITE_URL}/items`;
  const koUrl = `${SITE_URL}/ko/items`;
  const canonical = lang === "ko" ? koUrl : enUrl;
  return {
    title,
    description,
    alternates: { canonical, languages: { en: enUrl, "x-default": enUrl, ko: koUrl } },
    openGraph: { title, description, url: canonical, locale: lang === "ko" ? "ko_KR" : "en_US" },
  };
}
