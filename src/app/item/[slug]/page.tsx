import { allItems } from "@/data/items";
import { materials } from "@/data/materials";
import { characters } from "@/data/characters";
import { categories } from "@/data/categories";
import { ko } from "@/data/locales/ko";
import { stationImages } from "@/lib/crafting-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}
function slugToId(slug: string) {
  return slug.replaceAll("-", "_");
}

export function generateStaticParams() {
  return allItems.map((item) => ({ slug: idToSlug(item.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = allItems.find((i) => i.id === slugToId(slug));
  if (!item) return {};

  const nameKo = ko.items[item.id]?.name;
  const descKo = ko.items[item.id]?.desc;
  const matList = item.materials
    .map((m) => {
      const mat = materials.find((x) => x.id === m.materialId);
      return `${mat?.name ?? m.materialId} ×${m.quantity}`;
    })
    .join(", ");

  const title = nameKo
    ? `${item.name} (${nameKo}) — Don't Starve Together Crafting Recipe`
    : `${item.name} — Don't Starve Together Crafting Recipe`;

  const description = `How to craft ${item.name} in Don't Starve Together. ${item.description} Materials needed: ${matList}.${descKo ? ` ${descKo}` : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/item/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/item/${slug}`,
      images: [{ url: `${SITE_URL}/images/game-items/${item.image}` }],
    },
  };
}

const stationLabels: Record<string, string> = {
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
  critter_lab: "Rock Den",
  character: "Character Specific",
};

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = allItems.find((i) => i.id === slugToId(slug));
  if (!item) notFound();

  const nameKo = ko.items[item.id]?.name;
  const descKo = ko.items[item.id]?.desc;
  const character = item.characterOnly
    ? characters.find((c) => c.id === item.characterOnly)
    : null;
  const stationImg = stationImages[item.station];
  const stationLabel = stationLabels[item.station] ?? item.station;
  const itemCategories = categories.filter((c) =>
    item.category.includes(c.id as never)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to craft ${item.name} in Don't Starve Together`,
    description: item.description,
    image: `${SITE_URL}/images/game-items/${item.image}`,
    supply: item.materials.map((m) => {
      const mat = materials.find((x) => x.id === m.materialId);
      return {
        "@type": "HowToSupply",
        name: mat?.name ?? m.materialId,
        requiredQuantity: m.quantity,
      };
    }),
    tool: [{ "@type": "HowToTool", name: stationLabel }],
    step: [
      {
        "@type": "HowToStep",
        text: `Gather materials: ${item.materials
          .map((m) => {
            const mat = materials.find((x) => x.id === m.materialId);
            return `${mat?.name ?? m.materialId} ×${m.quantity}`;
          })
          .join(", ")}.`,
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
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">Crafting Guide</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Item identity */}
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
            <img
              src={`/images/game-items/${item.image}`}
              alt={item.name}
              className="size-20 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {item.name}
            </h1>
            {nameKo && (
              <p className="text-base text-muted-foreground mt-0.5">{nameKo}</p>
            )}
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
              {descKo ?? item.description}
            </p>
            {descKo && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {item.description}
              </p>
            )}
          </div>
        </section>

        {/* Character exclusive */}
        {character && (
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
            <img
              src={`/images/category-icons/characters/${character.portrait}.png`}
              alt={character.name}
              className="size-8 object-contain"
            />
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Character Exclusive
              </p>
              <p className="text-sm text-foreground">
                Only {character.name} can craft this item.
              </p>
            </div>
          </section>
        )}

        {/* Crafting station */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Crafting Station
          </h2>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            {stationImg ? (
              <img
                src={`/images/${stationImg}`}
                alt={stationLabel}
                className="size-8 object-contain"
              />
            ) : (
              <span className="size-8 flex items-center justify-center text-lg">
                🤲
              </span>
            )}
            <span className="text-sm font-medium">{stationLabel}</span>
          </div>
        </section>

        {/* Materials */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Materials Required
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {item.materials.map((m) => {
              const mat = materials.find((x) => x.id === m.materialId);
              const matNameKo =
                ko.materials[m.materialId]?.name ?? ko.items[m.materialId]?.name;
              return (
                <div
                  key={m.materialId}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <div className="relative shrink-0">
                    <img
                      src={`/images/game-items/${mat?.image ?? m.materialId + ".png"}`}
                      alt={mat?.name ?? m.materialId}
                      className="size-10 object-contain"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {m.quantity}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight truncate">
                      {matNameKo ?? mat?.name ?? m.materialId}
                    </p>
                    {matNameKo && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {mat?.name ?? m.materialId}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Categories */}
        {itemCategories.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {itemCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground"
                >
                  <img
                    src={`/images/category-icons/${cat.id}.png`}
                    alt=""
                    className="size-3.5 object-contain"
                  />
                  {cat.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Find more DST crafting recipes
          </p>
          <p className="text-xs text-muted-foreground">
            Search all items, crock pot recipes, and character-specific crafts
          </p>
          <Link
            href="/"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Crafting Guide →
          </Link>
        </section>
      </main>
    </div>
  );
}
