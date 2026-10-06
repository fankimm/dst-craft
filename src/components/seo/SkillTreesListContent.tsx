import { characters } from "@/data/characters";
import { CHARACTERS_WITH_SKILLS, skillTrees } from "@/data/skill-trees/registry";
import { groupTranslations } from "@/data/skill-trees/translations";
import Link from "next/link";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";
import { DataSourceNote, FaqSection, faqLd, itemListLd, type FaqEntry } from "./list-schema";

const SITE_URL = "https://www.dstcraft.com";

/** `/skill-trees`, `/ko/skill-trees` — 스킬트리 상세 페이지들의 허브 (#126) */
function skillTreeRows(lang: SeoLang) {
  return CHARACTERS_WITH_SKILLS.flatMap((id) => {
    const char = characters.find((c) => c.id === id);
    const tree = skillTrees[id];
    if (!char || !tree) return [];
    const branches = tree.groups.map((g) => {
      const tr = groupTranslations[g.id];
      return lang === "ko" ? (tr?.ko ?? tr?.en ?? g.id) : (tr?.en ?? g.id);
    });
    return [{
      char,
      name: lang === "ko" ? (char.nameKo ?? char.name) : char.name,
      skills: tree.nodes.filter((n) => n.icon).length,
      branches,
    }];
  });
}

function skillTreesFaq(rows: ReturnType<typeof skillTreeRows>, lang: SeoLang): FaqEntry[] {
  const fill = (tpl: string, vars: Record<string, string | number>) =>
    tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  const list = rows
    .map((r) => (lang === "ko" ? `${r.name} ${r.skills}개` : `${r.name} has ${r.skills}`))
    .join(", ");
  return [
    {
      question: L.skillTreesWhichQ[lang],
      answer: fill(L.skillTreesWhichA[lang], { n: rows.length, names: rows.map((r) => r.name).join(", ") }),
    },
    { question: L.skillTreesCountQ[lang], answer: fill(L.skillTreesCountA[lang], { list }) },
  ];
}

export function SkillTreesListContent({ lang }: { lang: SeoLang }) {
  const routePrefix = lang === "ko" ? "/ko" : "";
  const rows = skillTreeRows(lang);
  const faq = skillTreesFaq(rows, lang);
  const listLd = itemListLd(
    L.skillTreesTitle[lang],
    `${routePrefix}/skill-trees`,
    rows.map((r) => ({
      name: r.name,
      path: `${routePrefix}/skill-tree/${r.char.id}`,
      image: `/images/characters/${r.char.portrait}.png`,
    })),
    lang,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={listLd} />
      <JsonLd data={faqLd(faq, lang)} />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.skillTreeGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground">{L.skillTreesTitle[lang]}</h1>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            {L.skillTreesIntro[lang].replace("{n}", String(rows.length))}
          </p>
        </section>

        <AdSlot variant="top" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {rows.map((r) => {
            const secondary = lang === "ko" ? r.char.name : null;
            return (
              <Link
                key={r.char.id}
                href={`${routePrefix}/skill-tree/${r.char.id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 hover:border-ring transition-colors text-center"
              >
                <img src={`/images/characters/${r.char.portrait}.png`} alt={r.name} className="size-20 object-contain" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                  {secondary && secondary !== r.name && (
                    <p className="text-xs text-muted-foreground">{secondary}</p>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {L.skillTreeCardSummary[lang]
                    .replace("{skills}", String(r.skills))
                    .replace("{branches}", String(r.branches.length))}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">{r.branches.join(" · ")}</p>
              </Link>
            );
          })}
        </div>

        <FaqSection title={L.faq[lang]} faq={faq} />

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.skillSimulatorHelper[lang]}</p>
          <Link
            href="/?tab=skills"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openSkillTreeSimulator[lang]}
          </Link>
        </section>

        <DataSourceNote lang={lang} />
      </main>
    </div>
  );
}

export function buildSkillTreesListMetadata(lang: SeoLang) {
  const title = lang === "ko"
    ? "모든 스킬트리 — Don't Starve Together 캐릭터별 스킬트리 시뮬레이터"
    : "All Skill Trees — Don't Starve Together Skill Tree Simulator";
  const description = lang === "ko"
    ? `Don't Starve Together 스킬트리가 있는 ${CHARACTERS_WITH_SKILLS.length}명의 캐릭터별 스킬 수, 분기, 해금 아이템을 한 곳에서 비교하고 빌드를 계획하세요.`
    : `Every Don't Starve Together skill tree in one place: skills, branches and unlockable items for all ${CHARACTERS_WITH_SKILLS.length} characters, with an interactive build planner.`;

  const enUrl = `${SITE_URL}/skill-trees`;
  const koUrl = `${SITE_URL}/ko/skill-trees`;
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
    },
  };
}
