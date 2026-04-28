import { characters } from "@/data/characters";
import { allItems } from "@/data/items";
import { ko } from "@/data/locales/ko";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import { generateCharacterSeoText, generateCharacterSeoTextKo } from "@/lib/seo-text";
import { notFound } from "next/navigation";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

const difficultyColors: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
  normal: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  hard: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
};

const diffKey = {
  easy: "diffEasy",
  normal: "diffNormal",
  hard: "diffHard",
} as const;

export function CharacterPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const char = characters.find((c) => c.id === slug);
  if (!char) notFound();

  const displayName = lang === "ko" ? (char.nameKo ?? char.name) : char.name;
  const subtitle = lang === "ko" ? char.name : char.nameKo;
  const titleSub = lang === "ko" ? char.titleKo : char.title;
  const motto = lang === "ko" ? char.mottoKo : char.motto;

  const exclusiveItems = allItems.filter((i) => i.characterOnly === char.id).slice(0, 12);

  const seo = lang === "ko"
    ? generateCharacterSeoTextKo(
        {
          nameKo: char.nameKo ?? char.name,
          titleKo: char.titleKo,
          mottoKo: char.mottoKo,
          health: char.health,
          hunger: char.hunger,
          sanity: char.sanity,
          perksKo: char.perksKo ?? char.perks,
          difficulty: char.difficulty,
        },
        exclusiveItems.length,
      )
    : generateCharacterSeoText(char, exclusiveItems.length);

  const hasSkillTree = CHARACTERS_WITH_SKILLS.includes(char.id);

  const otherChars = characters
    .filter((c) => c.id !== char.id && c.id !== "wonkey")
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const routePrefix = lang === "ko" ? "/ko" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGameCharacter",
    name: displayName,
    description: seo.overview,
    image: `${SITE_URL}/images/characters/${char.portrait}.png`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    gameTipDescription: (lang === "ko" ? char.perksKo : char.perks).join(". "),
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
            href={`${routePrefix}/characters`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === "ko" ? "← 모든 캐릭터" : "← All Characters"}
          </Link>
          <span className="text-xs text-muted-foreground">{L.characterGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          <div className="shrink-0 size-28 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
            <img src={`/images/characters/${char.portrait}.png`} alt={displayName} className="h-24 object-contain" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {displayName} | Don&apos;t Starve Together
            </h1>
            {(subtitle || titleSub) && (
              <p className="text-base text-muted-foreground mt-0.5">
                {subtitle ?? ""}
                {titleSub && <span className="ml-2 text-sm text-foreground/60">· {titleSub}</span>}
              </p>
            )}
            {motto && <p className="text-sm text-foreground/60 mt-1 italic">&quot;{motto}&quot;</p>}
            <span
              className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[char.difficulty] ?? ""}`}
            >
              {L[diffKey[char.difficulty]][lang]} {L.difficultyLabel[lang]}
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
            {L.baseStats[lang]}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <img src="/images/ui/health.png" alt={lang === "ko" ? "체력" : "Health"} className="size-5 object-contain mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{lang === "ko" ? "체력" : "Health"}</p>
              <p className="text-base font-bold text-red-600 dark:text-red-400 mt-0.5">{char.health}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <img src="/images/ui/hunger.png" alt={lang === "ko" ? "허기" : "Hunger"} className="size-5 object-contain mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{lang === "ko" ? "허기" : "Hunger"}</p>
              <p className="text-base font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">{char.hunger}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <img src="/images/ui/sanity.png" alt={lang === "ko" ? "정신력" : "Sanity"} className="size-5 object-contain mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{lang === "ko" ? "정신력" : "Sanity"}</p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{char.sanity}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {L.perksAndAbilities[lang]}
          </h2>
          <ul className="space-y-2">
            {char.perks.map((perk, i) => {
              const primary = lang === "ko" ? (char.perksKo[i] ?? perk) : perk;
              const secondary = lang === "ko" ? perk : char.perksKo[i];
              return (
                <li key={i} className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <div>
                    <p className="text-sm text-foreground">{primary}</p>
                    {secondary && secondary !== primary && (
                      <p className="text-xs text-muted-foreground mt-0.5">{secondary}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {displayName}{lang === "ko" ? "의 능력" : "'s Abilities Explained"}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.perksDescription}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.howToPlay[lang]} {displayName}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.playstyle}</p>
        </section>

        {exclusiveItems.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.exclusiveItems[lang]} ({exclusiveItems.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {exclusiveItems.map((item) => {
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
            {L.otherCharacters[lang]}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherChars.map((c) => {
              const primary = lang === "ko" ? (c.nameKo ?? c.name) : c.name;
              const secondary = lang === "ko" ? c.name : c.nameKo;
              return (
                <Link
                  key={c.id}
                  href={`${routePrefix}/character/${c.id}`}
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
          <div className="mt-3 text-center">
            <Link href={`${routePrefix}/characters`} className="text-xs text-primary hover:underline">
              {L.viewAllCharacters[lang]}
            </Link>
          </div>
        </section>

        {hasSkillTree && (
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              {displayName}{lang === "ko" ? "의 스킬트리" : "'s Skill Tree"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "ko"
                ? `${displayName}의 스킬 분기를 살펴보고 빌드를 계획하세요`
                : `Explore ${displayName}'s skill branches and plan your build`}
            </p>
            <Link
              href={`${routePrefix}/skill-tree/${char.id}`}
              className="inline-block mt-1 rounded-lg border border-primary bg-primary/10 text-primary text-sm font-semibold px-5 py-2 hover:bg-primary/20 transition-colors"
            >
              {lang === "ko" ? "스킬트리 보기 →" : "View Skill Tree →"}
            </Link>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            {L.findCharCrafting[lang].replace("{x}", displayName)}
          </p>
          <p className="text-xs text-muted-foreground">{L.charCraftingHelper[lang]}</p>
          <Link
            href={`/?cat=character&char=${char.id}`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openCraftingGuide[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildCharacterMetadata(slug: string, lang: SeoLang) {
  const char = characters.find((c) => c.id === slug);
  if (!char) return {};

  const displayName = lang === "ko" ? (char.nameKo ?? char.name) : char.name;
  const perks = lang === "ko" ? (char.perksKo ?? char.perks) : char.perks;
  const perksShort = perks.slice(0, 2).join(". ");

  const title = lang === "ko"
    ? `${displayName} — Don't Starve Together 캐릭터 가이드`
    : `${displayName} — Don't Starve Together Character Guide`;
  const description = lang === "ko"
    ? `Don't Starve Together ${displayName} 캐릭터 가이드. 스탯: 체력 ${char.health}, 허기 ${char.hunger}, 정신력 ${char.sanity}. ${perksShort}. 특성, 팁, 전용 아이템을 확인하세요.`
    : `${displayName} guide for Don't Starve Together. Stats: ${char.health} HP, ${char.hunger} Hunger, ${char.sanity} Sanity. ${perksShort}. See perks, tips, and exclusive items.`;

  const enUrl = `${SITE_URL}/character/${slug}`;
  const koUrl = `${SITE_URL}/ko/character/${slug}`;
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
