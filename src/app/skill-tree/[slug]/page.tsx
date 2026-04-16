import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS, skillTrees } from "@/data/skill-trees/registry";
import { groupTranslations, skillTranslations } from "@/data/skill-trees/translations";
import { getItemsBySkill } from "@/data/skill-trees/skill-items";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { generateSkillTreeSeoText } from "@/lib/seo-text";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export function generateStaticParams() {
  return CHARACTERS_WITH_SKILLS.map((id) => ({ slug: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const char = characters.find((c) => c.id === slug);
  const tree = skillTrees[slug];
  if (!char || !tree) return {};

  const skillCount = tree.nodes.filter((n) => n.icon).length;
  const branchNames = tree.groups.map(
    (g) => groupTranslations[g.id]?.en ?? g.id,
  );

  const title = `${char.name} Skill Tree — Don't Starve Together Skill Tree Simulator`;
  const description = `${char.name} skill tree guide for Don't Starve Together. ${skillCount} skills across ${tree.groups.length} branches: ${branchNames.join(", ")}. Plan your build with the interactive skill tree simulator.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/skill-tree/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/skill-tree/${slug}`,
      images: [{ url: `${SITE_URL}/images/characters/${char.portrait}.png` }],
    },
  };
}

export default async function SkillTreePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const char = characters.find((c) => c.id === slug);
  const tree = skillTrees[slug];
  if (!char || !tree) notFound();

  // Compute skill stats
  const skillNodes = tree.nodes.filter((n) => n.icon);
  const skillCount = skillNodes.length;

  // Count items unlocked by skill tree
  const unlockedItemIds = new Set<string>();
  for (const node of skillNodes) {
    for (const itemId of getItemsBySkill(node.id)) {
      unlockedItemIds.add(itemId);
    }
  }
  const unlockedItems = allItems.filter((i) => unlockedItemIds.has(i.id)).slice(0, 12);

  // Group name lookup
  const groupNames: Record<string, string> = {};
  for (const g of tree.groups) {
    groupNames[g.id] = groupTranslations[g.id]?.en ?? g.id;
  }

  // Generate SEO text
  const seo = generateSkillTreeSeoText(
    char,
    tree,
    groupNames,
    skillCount,
    unlockedItemIds.size,
  );

  // Other characters with skill trees for internal linking
  const otherChars = CHARACTERS_WITH_SKILLS
    .filter((id) => id !== slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
    .map((id) => characters.find((c) => c.id === id)!)
    .filter(Boolean);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${char.name} Skill Tree — Don't Starve Together`,
    description: seo.overview,
    image: `${SITE_URL}/images/characters/${char.portrait}.png`,
    isPartOf: {
      "@type": "WebApplication",
      name: "Don't Craft Without Recipes",
      url: SITE_URL,
    },
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
            href={`/character/${char.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {char.name}
          </Link>
          <span className="text-xs text-muted-foreground">Skill Tree Guide</span>
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
              {char.name} Skill Tree | Don&apos;t Starve Together
            </h1>
            {char.nameKo && (
              <p className="text-base text-muted-foreground mt-0.5">
                {char.nameKo} Skill Tree
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                {skillCount} Skills
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-muted-foreground/30 bg-muted text-muted-foreground">
                {tree.groups.length} Branches
              </span>
            </div>
          </div>
        </section>

        {/* Overview — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            About {char.name}&apos;s Skill Tree
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {seo.overview}
          </p>
        </section>

        {/* Branches */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Skill Branches
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tree.groups.map((group) => {
              const nodesInGroup = tree.nodes.filter(
                (n) => n.group === group.id && n.icon,
              );
              const groupNameEn = groupTranslations[group.id]?.en ?? group.id;
              const groupNameKo = groupTranslations[group.id]?.ko;
              return (
                <div
                  key={group.id}
                  className="rounded-lg border border-border bg-surface px-3 py-3 text-center"
                >
                  <div
                    className="size-3 rounded-full mx-auto mb-1.5"
                    style={{ backgroundColor: group.color }}
                  />
                  <p className="text-xs font-medium text-foreground">
                    {groupNameEn}
                  </p>
                  {groupNameKo && (
                    <p className="text-[10px] text-muted-foreground">
                      {groupNameKo}
                    </p>
                  )}
                  <p className="text-sm font-bold text-foreground mt-1">
                    {nodesInGroup.length} skills
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Branches Description — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            Skill Branch Breakdown
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {seo.branchesDescription}
          </p>
        </section>

        {/* Notable Skills */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Notable Skills
          </h2>
          <div className="space-y-2">
            {skillNodes.slice(0, 6).map((node) => {
              const tr = skillTranslations[node.id];
              const group = tree.groups.find((g) => g.id === node.group);
              return (
                <div
                  key={node.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  {node.icon && (
                    <img
                      src={`/images/skill-icons/${node.icon}.png`}
                      alt={tr?.title.en ?? node.id}
                      className="size-10 object-contain shrink-0 rounded"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {tr?.title.en ?? node.id}
                      </p>
                      {group && (
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                    </div>
                    {tr?.title.ko && (
                      <p className="text-[10px] text-muted-foreground">
                        {tr.title.ko}
                      </p>
                    )}
                    {tr?.desc.en && (
                      <p className="text-xs text-foreground/70 mt-1 line-clamp-2">
                        {tr.desc.en}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to Use — SEO */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            How to Use {char.name}&apos;s Skill Tree
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {seo.howToUse}
          </p>
        </section>

        {/* Unlocked Items */}
        {unlockedItems.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Skill Tree Items ({unlockedItemIds.size})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unlockedItems.map((item) => {
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

        {/* Other Characters' Skill Trees — internal links */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Other Skill Trees
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherChars.map((c) => (
              <Link
                key={c.id}
                href={`/skill-tree/${c.id}`}
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
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Try {char.name}&apos;s Skill Tree Simulator
          </p>
          <p className="text-xs text-muted-foreground">
            Plan your skill build interactively before committing in-game
          </p>
          <Link
            href={`/?tab=skills&char=${char.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Skill Tree Simulator →
          </Link>
        </section>
      </main>
    </div>
  );
}
