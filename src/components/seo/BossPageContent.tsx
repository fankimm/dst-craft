import { bosses, lootImage, lootDisplayName } from "@/data/bosses";
import { allItems } from "@/data/items";
import { generateBossSeoText, generateBossSeoTextKo } from "@/lib/seo-text";
import { notFound } from "next/navigation";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

const craftableIds = new Set(allItems.map((i) => i.id));

const categoryKey = {
  seasonal: "bcSeasonal",
  raid: "bcRaid",
  ocean: "bcOcean",
  dungeon: "bcDungeon",
  event: "bcEvent",
  mini: "bcMini",
} as const;

const categoryColors: Record<string, string> = {
  seasonal: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30",
  raid: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
  ocean: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  dungeon: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
  event: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
  mini: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
};

export function BossPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const boss = bosses.find((b) => b.id === slug);
  if (!boss) notFound();

  const displayName = lang === "ko" ? boss.nameKo : boss.name;
  const subtitle = lang === "ko" ? boss.name : boss.nameKo;
  const images = Array.isArray(boss.image) ? boss.image : [boss.image];

  const categoryLabel = L[categoryKey[boss.category as keyof typeof categoryKey]]?.[lang] ?? boss.category;
  const categoryColor = categoryColors[boss.category] ?? "text-muted-foreground border-border";

  const uniqueLoot = boss.loot.filter(
    (l, i, arr) => arr.findIndex((x) => x.item === l.item) === i
  );

  const seo = lang === "ko"
    ? generateBossSeoTextKo(
        boss,
        uniqueLoot.map((l) => ({
          item: l.item,
          nameKo: lootDisplayName(l.item, "ko"),
        })),
      )
    : generateBossSeoText(
        boss,
        uniqueLoot.map((l) => ({
          item: l.item,
          nameEn: lootDisplayName(l.item, "en"),
        })),
      );

  const relatedBosses = bosses
    .filter((b) => b.category === boss.category && b.id !== boss.id)
    .slice(0, 4);

  const routePrefix = lang === "ko" ? "/ko" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GamePlayMode",
    name: lang === "ko"
      ? `${displayName} — Don't Starve Together`
      : `${displayName} — Don't Starve Together`,
    description: lang === "ko"
      ? `Don't Starve Together의 ${categoryLabel}. 드롭: ${uniqueLoot.map((l) => lootDisplayName(l.item, "ko")).join(", ")}`
      : `${categoryLabel} in Don't Starve Together. Drops: ${uniqueLoot.map((l) => lootDisplayName(l.item, "en")).join(", ")}`,
    image: `${SITE_URL}/images/bosses/${images[0]}`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
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
            href={`/?tab=bosses&boss=${boss.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.bossGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          <div className="shrink-0 flex gap-1">
            {images.map((img) => (
              <div
                key={img}
                className="size-24 rounded-xl border border-border bg-surface flex items-center justify-center"
              >
                <img src={`/images/bosses/${img}`} alt={displayName} className="size-20 object-contain" />
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {lang === "ko"
                ? `${displayName} | Don't Starve Together 보스 가이드`
                : `${displayName} | Don't Starve Together Boss Guide`}
            </h1>
            <p className="text-base text-muted-foreground mt-0.5">{subtitle}</p>
            <span
              className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColor}`}
            >
              {categoryLabel}
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.about[lang]} {displayName}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.overview}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.drops[lang]}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {boss.loot.map((loot, i) => {
              const nameEn = lootDisplayName(loot.item, "en");
              const nameKoVal = lootDisplayName(loot.item, "ko");
              const lootName = lang === "ko" ? nameKoVal : nameEn;
              const lootSub = lang === "ko" ? nameEn : (nameKoVal !== nameEn ? nameKoVal : null);
              const imgSrc = lootImage(loot.item);
              const isBlueprint = loot.blueprint;
              const chanceLabel =
                loot.chance >= 1 ? "100%" : `${Math.round(loot.chance * 100)}%`;
              const isCraftable = craftableIds.has(loot.item);

              const inner = (
                <>
                  <div className="relative shrink-0">
                    <img src={imgSrc} alt={lootName} className="size-10 object-contain" />
                    {loot.count && loot.count > 1 && (
                      <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                        {loot.count}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground leading-tight truncate">{lootName}</p>
                    {lootSub && lootSub !== lootName && (
                      <p className="text-[10px] text-muted-foreground truncate">{lootSub}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{chanceLabel}</span>
                      {isBlueprint && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          {L.blueprint[lang]}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );
              const cls = "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2";
              return isCraftable ? (
                <Link
                  key={`${loot.item}-${i}`}
                  href={`${routePrefix}/item/${idToSlug(loot.item)}`}
                  className={`${cls} hover:border-ring transition-colors`}
                >
                  {inner}
                </Link>
              ) : (
                <div key={`${loot.item}-${i}`} className={cls}>{inner}</div>
              );
            })}
          </div>
        </section>

        {boss.stashLoot && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {lang === "ko" ? boss.stashLoot.label : boss.stashLoot.labelEn}
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              {lang === "ko" ? boss.stashLoot.note : boss.stashLoot.noteEn}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(boss.stashLoot.items ?? boss.stashLoot.bundles?.flatMap((b) => b.items) ?? []).map((loot, i) => {
                const nameEn = lootDisplayName(loot.item, "en");
                const nameKoVal = lootDisplayName(loot.item, "ko");
                const lootName = lang === "ko" ? nameKoVal : nameEn;
                const lootSub = lang === "ko" ? nameEn : (nameKoVal !== nameEn ? nameKoVal : null);
                const imgSrc = lootImage(loot.item);
                const isBlueprint = loot.blueprint;
                const chanceLabel = loot.pool
                  ? L.pickOne[lang]
                  : loot.chance >= 1
                    ? "100%"
                    : `${Math.round(loot.chance * 100)}%`;
                const isCraftable = craftableIds.has(loot.item);

                const inner = (
                  <>
                    <div className="relative shrink-0">
                      <img src={imgSrc} alt={lootName} className="size-10 object-contain" />
                      {loot.count && loot.count > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                          {loot.count}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground leading-tight truncate">{lootName}</p>
                      {lootSub && lootSub !== lootName && (
                        <p className="text-[10px] text-muted-foreground truncate">{lootSub}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] ${loot.pool ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                        >
                          {chanceLabel}
                        </span>
                        {isBlueprint && (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            {L.blueprint[lang]}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );
                const cls = "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2";
                return isCraftable ? (
                  <Link
                    key={`stash-${loot.item}-${i}`}
                    href={`${routePrefix}/item/${idToSlug(loot.item)}`}
                    className={`${cls} hover:border-ring transition-colors`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={`stash-${loot.item}-${i}`} className={cls}>{inner}</div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {displayName} {L.lootAndDrops[lang]}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.lootDescription}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.howToDefeat[lang]} {displayName}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.strategy}</p>
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

        {relatedBosses.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {lang === "ko" ? "다른 " + categoryLabel : "Other " + categoryLabel}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedBosses.map((b) => {
                const img = Array.isArray(b.image) ? b.image[0] : b.image;
                const rDisplay = lang === "ko" ? b.nameKo : b.name;
                const rSub = lang === "ko" ? b.name : b.nameKo;
                return (
                  <Link
                    key={b.id}
                    href={`${routePrefix}/boss/${b.id}`}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 hover:border-ring transition-colors text-center"
                  >
                    <img src={`/images/bosses/${img}`} alt={rDisplay} className="size-10 object-contain" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{rDisplay}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{rSub}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.seeAllBossGuides[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.bossGuideHelper[lang]}</p>
          <Link
            href={`/?tab=bosses&boss=${boss.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openBossGuide[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildBossMetadata(slug: string, lang: SeoLang) {
  const boss = bosses.find((b) => b.id === slug);
  if (!boss) return {};

  const displayName = lang === "ko" ? boss.nameKo : boss.name;
  const lootList = [
    ...new Set(boss.loot.map((l) => lootDisplayName(l.item, lang === "ko" ? "ko" : "en"))),
  ].join(", ");
  const categoryLabel =
    L[categoryKey[boss.category as keyof typeof categoryKey]]?.[lang] ?? boss.category;

  const title = lang === "ko"
    ? `${displayName} — Don't Starve Together 보스 가이드`
    : `${displayName} — Don't Starve Together Boss Guide`;
  const description = lang === "ko"
    ? `Don't Starve Together에서 ${displayName}을(를) 잡는 법. ${categoryLabel} — 드롭: ${lootList}. 공략, 전리품 표, 팁.`
    : `How to defeat ${displayName} in Don't Starve Together. ${categoryLabel} — drops: ${lootList}. Strategy, loot table, and tips.`;

  const image = Array.isArray(boss.image) ? boss.image[0] : boss.image;
  const enUrl = `${SITE_URL}/boss/${slug}`;
  const koUrl = `${SITE_URL}/ko/boss/${slug}`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en: enUrl, "x-default": enUrl, ko: koUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      images: [{ url: `${SITE_URL}/images/bosses/${image}` }],
    },
  };
}
