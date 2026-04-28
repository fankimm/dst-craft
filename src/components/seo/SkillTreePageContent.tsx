import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS, skillTrees } from "@/data/skill-trees/registry";
import { groupTranslations, skillTranslations } from "@/data/skill-trees/translations";
import { getItemsBySkill } from "@/data/skill-trees/skill-items";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { generateSkillTreeSeoText, generateSkillTreeSeoTextKo } from "@/lib/seo-text";
import { notFound } from "next/navigation";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export function SkillTreePageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const char = characters.find((c) => c.id === slug);
  const tree = skillTrees[slug];
  if (!char || !tree) notFound();

  const displayName = lang === "ko" ? (char.nameKo ?? char.name) : char.name;
  const subtitle = lang === "ko" ? char.name : char.nameKo;

  const skillNodes = tree.nodes.filter((n) => n.icon);
  const skillCount = skillNodes.length;

  const unlockedItemIds = new Set<string>();
  for (const node of skillNodes) {
    for (const itemId of getItemsBySkill(node.id)) {
      unlockedItemIds.add(itemId);
    }
  }
  const unlockedItems = allItems.filter((i) => unlockedItemIds.has(i.id)).slice(0, 12);

  const groupNamesEn: Record<string, string> = {};
  const groupNamesKo: Record<string, string> = {};
  for (const g of tree.groups) {
    groupNamesEn[g.id] = groupTranslations[g.id]?.en ?? g.id;
    groupNamesKo[g.id] = groupTranslations[g.id]?.ko ?? groupTranslations[g.id]?.en ?? g.id;
  }

  const seo = lang === "ko"
    ? generateSkillTreeSeoTextKo(
        { nameKo: char.nameKo ?? char.name, difficulty: char.difficulty },
        tree,
        groupNamesKo,
        skillCount,
        unlockedItemIds.size,
      )
    : generateSkillTreeSeoText(char, tree, groupNamesEn, skillCount, unlockedItemIds.size);

  const otherChars = CHARACTERS_WITH_SKILLS
    .filter((id) => id !== slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
    .map((id) => characters.find((c) => c.id === id)!)
    .filter(Boolean);

  const routePrefix = lang === "ko" ? "/ko" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: lang === "ko"
      ? `${displayName} 스킬트리 — Don't Starve Together`
      : `${displayName} Skill Tree — Don't Starve Together`,
    description: seo.overview,
    image: `${SITE_URL}/images/characters/${char.portrait}.png`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    isPartOf: {
      "@type": "WebApplication",
      name: "Don't Craft Without Recipes",
      url: SITE_URL,
    },
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
            href={`${routePrefix}/character/${char.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {displayName}
          </Link>
          <span className="text-xs text-muted-foreground">{L.skillTreeGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-28 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
            <img src={`/images/characters/${char.portrait}.png`} alt={displayName} className="h-24 object-contain" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {displayName} {L.skillTreeOfX[lang]} | Don&apos;t Starve Together
            </h1>
            {subtitle && (
              <p className="text-base text-muted-foreground mt-0.5">
                {subtitle} {L.skillTreeOfX[lang]}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                {skillCount} {L.skillsCount[lang]}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-muted-foreground/30 bg-muted text-muted-foreground">
                {tree.groups.length} {L.branchesCount[lang]}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.about[lang]} {displayName}{lang === "ko" ? "의 스킬트리" : "'s Skill Tree"}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.overview}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.skillBranches[lang]}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tree.groups.map((group) => {
              const nodesInGroup = tree.nodes.filter((n) => n.group === group.id && n.icon);
              const groupNameEn = groupTranslations[group.id]?.en ?? group.id;
              const groupNameKo = groupTranslations[group.id]?.ko;
              const primary = lang === "ko" ? (groupNameKo ?? groupNameEn) : groupNameEn;
              const secondary = lang === "ko" ? groupNameEn : groupNameKo;
              return (
                <div key={group.id} className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
                  <div className="size-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: group.color }} />
                  <p className="text-xs font-medium text-foreground">{primary}</p>
                  {secondary && secondary !== primary && (
                    <p className="text-[10px] text-muted-foreground">{secondary}</p>
                  )}
                  <p className="text-sm font-bold text-foreground mt-1">
                    {nodesInGroup.length} {L.skillsCount[lang]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.skillBranchBreakdown[lang]}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.branchesDescription}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.notableSkills[lang]}
          </h2>
          <div className="space-y-2">
            {skillNodes.slice(0, 6).map((node) => {
              const tr = skillTranslations[node.id];
              const titlePrimary = lang === "ko" ? (tr?.title.ko ?? tr?.title.en ?? node.id) : (tr?.title.en ?? node.id);
              const titleSecondary = lang === "ko" ? tr?.title.en : tr?.title.ko;
              const descPrimary = lang === "ko" ? (tr?.desc.ko ?? tr?.desc.en) : tr?.desc.en;
              const group = tree.groups.find((g) => g.id === node.group);
              return (
                <div key={node.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                  {node.icon && (
                    <img
                      src={`/images/skill-icons/${node.icon}.png`}
                      alt={titlePrimary}
                      className="size-10 object-contain shrink-0 rounded"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground leading-tight">{titlePrimary}</p>
                      {group && (
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                      )}
                    </div>
                    {titleSecondary && titleSecondary !== titlePrimary && (
                      <p className="text-[10px] text-muted-foreground">{titleSecondary}</p>
                    )}
                    {descPrimary && (
                      <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{descPrimary}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.howToUseSkillTree[lang]} {lang === "en" ? `${displayName}'s Skill Tree` : ""}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.howToUse}</p>
        </section>

        {unlockedItems.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.skillTreeItems[lang]} ({unlockedItemIds.size})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unlockedItems.map((item) => {
                const itemKo = ko.items[item.id]?.name;
                const primary = lang === "ko" ? (itemKo ?? item.name) : item.name;
                const secondary = lang === "ko" ? item.name : itemKo;
                return (
                  <Link
                    key={item.id}
                    href={`${routePrefix}/item/${idToSlug(item.id)}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 hover:border-ring transition-colors"
                  >
                    <img src={`/images/game-items/${item.image}`} alt={primary} className="size-10 object-contain shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight truncate">{primary}</p>
                      {secondary && secondary !== primary && (
                        <p className="text-[10px] text-muted-foreground truncate">{secondary}</p>
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

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.otherSkillTrees[lang]}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherChars.map((c) => {
              const primary = lang === "ko" ? (c.nameKo ?? c.name) : c.name;
              const secondary = lang === "ko" ? c.name : c.nameKo;
              return (
                <Link
                  key={c.id}
                  href={`${routePrefix}/skill-tree/${c.id}`}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 hover:border-ring transition-colors text-center"
                >
                  <img src={`/images/characters/${c.portrait}.png`} alt={primary} className="h-12 object-contain" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{primary}</p>
                    {secondary && secondary !== primary && (
                      <p className="text-[10px] text-muted-foreground truncate">{secondary}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            {L.trySkillSimulator[lang].replace("{x}", displayName)}
          </p>
          <p className="text-xs text-muted-foreground">{L.skillSimulatorHelper[lang]}</p>
          <Link
            href={`/?tab=skills&char=${char.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openSkillTreeSimulator[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildSkillTreeMetadata(slug: string, lang: SeoLang) {
  const char = characters.find((c) => c.id === slug);
  const tree = skillTrees[slug];
  if (!char || !tree) return {};

  const displayName = lang === "ko" ? (char.nameKo ?? char.name) : char.name;
  const skillCount = tree.nodes.filter((n) => n.icon).length;
  const branchNames = tree.groups.map((g) => {
    const tr = groupTranslations[g.id];
    return lang === "ko" ? (tr?.ko ?? tr?.en ?? g.id) : (tr?.en ?? g.id);
  });

  const title = lang === "ko"
    ? `${displayName} 스킬트리 — Don't Starve Together 스킬트리 시뮬레이터`
    : `${displayName} Skill Tree — Don't Starve Together Skill Tree Simulator`;
  const description = lang === "ko"
    ? `Don't Starve Together ${displayName} 스킬트리 가이드. ${tree.groups.length}개 분기에 ${skillCount}개의 스킬: ${branchNames.join(", ")}. 인터랙티브 스킬트리 시뮬레이터로 빌드를 계획해보세요.`
    : `${displayName} skill tree guide for Don't Starve Together. ${skillCount} skills across ${tree.groups.length} branches: ${branchNames.join(", ")}. Plan your build with the interactive skill tree simulator.`;

  const enUrl = `${SITE_URL}/skill-tree/${slug}`;
  const koUrl = `${SITE_URL}/ko/skill-tree/${slug}`;
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
      images: [{ url: `${SITE_URL}/images/characters/${char.portrait}.png` }],
    },
  };
}
