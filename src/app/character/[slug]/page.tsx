import { characters } from "@/data/characters";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { generateCharacterSeoText } from "@/lib/seo-text";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export function generateStaticParams() {
  return characters.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const char = characters.find((c) => c.id === slug);
  if (!char) return {};

  const title = char.nameKo
    ? `${char.name} (${char.nameKo}) — Don't Starve Together Character Guide`
    : `${char.name} — Don't Starve Together Character Guide`;

  const perksShort = char.perks.slice(0, 2).join(". ");
  const description = `${char.name} guide for Don't Starve Together. Stats: ${char.health} HP, ${char.hunger} Hunger, ${char.sanity} Sanity. ${perksShort}. See perks, tips, and exclusive items.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/character/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/character/${slug}`,
      images: [{ url: `${SITE_URL}/images/characters/${char.portrait}.png` }],
    },
  };
}

const difficultyColors: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
  normal: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  hard: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
};

const difficultyLabels: Record<string, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const char = characters.find((c) => c.id === slug);
  if (!char) notFound();

  // Exclusive items
  const exclusiveItems = allItems.filter((i) => i.characterOnly === char.id).slice(0, 12);

  // Generate SEO text
  const seo = generateCharacterSeoText(char, exclusiveItems.length);

  // Other characters for internal linking
  const otherChars = characters
    .filter((c) => c.id !== char.id && c.id !== "wonkey")
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGameCharacter",
    name: char.name,
    description: seo.overview,
    image: `${SITE_URL}/images/characters/${char.portrait}.png`,
    gameTipDescription: char.perks.join(". "),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faq.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/characters"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← All Characters
          </Link>
          <span className="text-xs text-muted-foreground">Character Guide</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Identity */}
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-28 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
            <img
              src={`/images/characters/${char.portrait}.png`}
              alt={char.name}
              className="h-24 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {char.name} | Don&apos;t Starve Together
            </h1>
            {char.nameKo && (
              <p className="text-base text-muted-foreground mt-0.5">{char.nameKo}</p>
            )}
            {char.motto && (
              <p className="text-sm text-foreground/60 mt-1 italic">
                &quot;{char.motto}&quot;
              </p>
            )}
            <span
              className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                difficultyColors[char.difficulty] ?? ""
              }`}
            >
              {difficultyLabels[char.difficulty]} Difficulty
            </span>
          </div>
        </section>

        {/* Overview — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            About {char.name}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {seo.overview}
          </p>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Base Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <img src="/images/ui/health.png" alt="Health" className="size-5 object-contain mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Health</p>
              <p className="text-base font-bold text-red-600 dark:text-red-400 mt-0.5">{char.health}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <img src="/images/ui/hunger.png" alt="Hunger" className="size-5 object-contain mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Hunger</p>
              <p className="text-base font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">{char.hunger}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <img src="/images/ui/sanity.png" alt="Sanity" className="size-5 object-contain mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Sanity</p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{char.sanity}</p>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Perks &amp; Abilities
          </h2>
          <ul className="space-y-2">
            {char.perks.map((perk, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                <span className="text-primary font-bold shrink-0">•</span>
                <div>
                  <p className="text-sm text-foreground">{perk}</p>
                  {char.perksKo[i] && (
                    <p className="text-xs text-muted-foreground mt-0.5">{char.perksKo[i]}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Perks Description — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {char.name}&apos;s Abilities Explained
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {seo.perksDescription}
          </p>
        </section>

        {/* Playstyle — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            How to Play {char.name}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {seo.playstyle}
          </p>
        </section>

        {/* Exclusive Items */}
        {exclusiveItems.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Exclusive Items ({exclusiveItems.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {exclusiveItems.map((item) => {
                const itemNameKo = ko.items[item.id]?.name;
                return (
                  <Link
                    key={item.id}
                    href={`/item/${idToSlug(item.id)}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                  >
                    <img
                      src={`/images/game-items/${item.image}`}
                      alt={item.name}
                      className="size-10 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight truncate">
                        {item.name}
                      </p>
                      {itemNameKo && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {itemNameKo}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {seo.faq.map((q, i) => (
              <details key={i} className="rounded-lg border border-border bg-surface group">
                <summary className="px-4 py-3 text-sm font-medium text-foreground cursor-pointer select-none">
                  {q.question}
                </summary>
                <p className="px-4 pb-3 text-sm text-foreground/80 leading-relaxed">
                  {q.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Other Characters — internal links */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Other Characters
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherChars.map((c) => (
              <Link
                key={c.id}
                href={`/character/${c.id}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 hover:border-ring transition-colors text-center"
              >
                <img
                  src={`/images/characters/${c.portrait}.png`}
                  alt={c.name}
                  className="h-12 object-contain"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {c.name}
                  </p>
                  {c.nameKo && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {c.nameKo}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-3 text-center">
            <Link
              href="/characters"
              className="text-xs text-primary hover:underline"
            >
              View all characters →
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Find {char.name}&apos;s crafting recipes
          </p>
          <p className="text-xs text-muted-foreground">
            Browse all character-specific items, crock pot recipes, and boss guides
          </p>
          <Link
            href={`/?cat=character&char=${char.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Crafting Guide →
          </Link>
        </section>
      </main>
    </div>
  );
}
