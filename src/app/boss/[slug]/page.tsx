import { bosses, lootImage, lootDisplayName } from "@/data/bosses";
import { allItems } from "@/data/items";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

const craftableIds = new Set(allItems.map((i) => i.id));

const SITE_URL = "https://www.dstcraft.com";

const categoryLabels: Record<string, string> = {
  seasonal: "Seasonal Boss",
  raid: "Raid Boss",
  ocean: "Ocean Boss",
  dungeon: "Dungeon Boss",
  event: "Event Boss",
  mini: "Mini Boss",
};

const categoryColors: Record<string, string> = {
  seasonal: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30",
  raid: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
  ocean: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  dungeon: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
  event: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
  mini: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
};

export function generateStaticParams() {
  return bosses.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const boss = bosses.find((b) => b.id === slug);
  if (!boss) return {};

  const lootList = [
    ...new Set(boss.loot.map((l) => lootDisplayName(l.item, "en"))),
  ].join(", ");

  const title = `${boss.name} (${boss.nameKo}) — Don't Starve Together Boss Drops`;
  const description = `${boss.name} drops and loot in Don't Starve Together. ${categoryLabels[boss.category] ?? boss.category}. Loot: ${lootList}.`;

  const image = Array.isArray(boss.image) ? boss.image[0] : boss.image;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/boss/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/boss/${slug}`,
      images: [{ url: `${SITE_URL}/images/bosses/${image}` }],
    },
  };
}

export default async function BossPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const boss = bosses.find((b) => b.id === slug);
  if (!boss) notFound();

  const images = Array.isArray(boss.image) ? boss.image : [boss.image];
  const categoryLabel = categoryLabels[boss.category] ?? boss.category;
  const categoryColor = categoryColors[boss.category] ?? "text-muted-foreground border-border";

  // Deduplicate loot for structured data
  const uniqueLoot = boss.loot.filter(
    (l, i, arr) => arr.findIndex((x) => x.item === l.item) === i
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GamePlayMode",
    name: `${boss.name} — Don't Starve Together`,
    description: `${categoryLabel} in Don't Starve Together. Drops: ${uniqueLoot
      .map((l) => lootDisplayName(l.item, "en"))
      .join(", ")}`,
    image: `${SITE_URL}/images/bosses/${images[0]}`,
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
            href="/?tab=bosses"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">Boss Guide</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Boss identity */}
        <section className="flex gap-6 items-start">
          <div className="shrink-0 flex gap-1">
            {images.map((img) => (
              <div
                key={img}
                className="size-24 rounded-xl border border-border bg-surface flex items-center justify-center"
              >
                <img
                  src={`/images/bosses/${img}`}
                  alt={boss.name}
                  className="size-20 object-contain"
                />
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {boss.name}
            </h1>
            <p className="text-base text-muted-foreground mt-0.5">
              {boss.nameKo}
            </p>
            <span
              className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColor}`}
            >
              {categoryLabel}
            </span>
          </div>
        </section>

        {/* Loot table */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Drops / Loot
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {boss.loot.map((loot, i) => {
              const nameEn = lootDisplayName(loot.item, "en");
              const nameKoVal = lootDisplayName(loot.item, "ko");
              const imgSrc = lootImage(loot.item);
              const isBlueprint = loot.blueprint;
              const chanceLabel =
                loot.chance >= 1
                  ? "100%"
                  : `${Math.round(loot.chance * 100)}%`;
              const isCraftable = craftableIds.has(loot.item);

              const inner = (
                <>
                  <div className="relative shrink-0">
                    <img
                      src={imgSrc}
                      alt={nameEn}
                      className="size-10 object-contain"
                    />
                    {loot.count && loot.count > 1 && (
                      <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                        {loot.count}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground leading-tight truncate">
                      {nameKoVal !== nameEn ? nameKoVal : nameEn}
                    </p>
                    {nameKoVal !== nameEn && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {nameEn}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {chanceLabel}
                      </span>
                      {isBlueprint && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          Blueprint
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );

              const cls = "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2";
              return isCraftable ? (
                <Link key={`${loot.item}-${i}`} href={`/item/${idToSlug(loot.item)}`} className={`${cls} hover:border-ring transition-colors`}>
                  {inner}
                </Link>
              ) : (
                <div key={`${loot.item}-${i}`} className={cls}>{inner}</div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            See all DST boss guides
          </p>
          <p className="text-xs text-muted-foreground">
            Boss drops, crafting recipes, and crock pot guides
          </p>
          <Link
            href="/?tab=bosses"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Boss Guide →
          </Link>
        </section>
      </main>
    </div>
  );
}
