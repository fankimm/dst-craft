import { quests, type Quest } from "@/data/quests";
import { canonicalForQuest } from "@/lib/slug";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function resolveIcon(item: { icon?: string; iconPath?: string }): string | null {
  if (item.iconPath) return item.iconPath;
  if (item.icon) return `/images/game-items/${item.icon}`;
  return null;
}

function countSubsteps(q: Quest): number {
  let n = 0;
  for (const s of q.steps) n += s.substeps?.length ?? 0;
  return n;
}

export function QuestsListContent({ lang }: { lang: SeoLang }) {
  const routePrefix = lang === "ko" ? "/ko" : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.questGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground">{L.questsTitle[lang]}</h1>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            {L.questsIntro[lang]}
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quests.map((q) => {
            const icon = resolveIcon(q);
            const primary = lang === "ko" ? q.titleKo : q.titleEn;
            const secondary = lang === "ko" ? q.titleEn : q.titleKo;
            const totalSteps = q.steps.length;
            const subCount = countSubsteps(q);
            const summary =
              subCount > 0
                ? L.questCardSummary[lang]
                    .replace("{steps}", String(totalSteps))
                    .replace("{subs}", String(subCount))
                : L.questCardSummaryNoSubs[lang].replace("{steps}", String(totalSteps));
            return (
              <Link
                key={q.id}
                href={`${routePrefix}/quest/${canonicalForQuest(q.id)}`}
                className="flex items-start gap-4 rounded-xl border border-border bg-surface px-4 py-4 hover:border-ring transition-colors"
              >
                {icon && (
                  <img
                    src={icon}
                    alt={primary}
                    className="size-14 object-contain shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{primary}</p>
                  {secondary && secondary !== primary && (
                    <p className="text-xs text-muted-foreground">{secondary}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1.5">{summary}</p>
                  {q.goal && q.goal < totalSteps && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                      {L.goalNote[lang]
                        .replace("{goal}", String(q.goal))
                        .replace("{steps}", String(totalSteps))}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.seeAllQuests[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.questChecklistHelper[lang]}</p>
          <Link
            href={`/?tab=quests`}
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openQuestChecklist[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildQuestsListMetadata(lang: SeoLang) {
  const title =
    lang === "ko"
      ? "퀘스트 체크리스트 — Don't Starve Together 진행 가이드"
      : "Quest Checklists — Don't Starve Together Progression Guide";
  const description =
    lang === "ko"
      ? "Don't Starve Together 엔드게임 퀘스트 체크리스트 — 은둔자, 고대의 연료직공, 천상의 대변자, 천상의 귀공자. 각 자재 수량과 보스 처치 출처 검증."
      : "Don't Starve Together endgame quest checklists — Hermit Quests, Ancient Fuelweaver, Celestial Champion, and Celestial Scion. Every material count and boss kill, sourced from in-game files.";

  const enUrl = `${SITE_URL}/quests`;
  const koUrl = `${SITE_URL}/ko/quests`;
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
