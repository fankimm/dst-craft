import { quests, type Quest, type QuestStep, type QuestSubstep } from "@/data/quests";
import { generateQuestSeoText, generateQuestSeoTextKo } from "@/lib/seo-text";
import {
  canonicalForBoss,
  canonicalForItem,
  canonicalForQuest,
  resolveQuestSlug,
} from "@/lib/slug";
import { notFound } from "next/navigation";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

function resolveIcon(item: { icon?: string; iconPath?: string }): string | null {
  if (item.iconPath) return item.iconPath;
  if (item.icon) return `/images/game-items/${item.icon}`;
  return null;
}

function stepTitle(step: QuestStep, lang: SeoLang): string {
  return lang === "ko" ? step.titleKo : step.titleEn;
}
function substepName(s: QuestSubstep, lang: SeoLang): string {
  return lang === "ko" ? s.nameKo : s.nameEn;
}
function substepNote(s: QuestSubstep, lang: SeoLang): string | undefined {
  return lang === "ko" ? s.noteKo : s.noteEn;
}
function questTitle(q: Quest, lang: SeoLang): string {
  return lang === "ko" ? q.titleKo : q.titleEn;
}

function countSubsteps(q: Quest): number {
  let n = 0;
  for (const s of q.steps) n += s.substeps?.length ?? 0;
  return n;
}

export function QuestPageContent({ slug, lang }: { slug: string; lang: SeoLang }) {
  const id = resolveQuestSlug(slug);
  const quest = id ? quests.find((q) => q.id === id) : undefined;
  if (!quest) notFound();

  const displayName = questTitle(quest, lang);
  const subtitle = lang === "ko" ? quest.titleEn : quest.titleKo;
  const totalSteps = quest.steps.length;
  const subCount = countSubsteps(quest);
  const heroIcon = resolveIcon(quest);

  const seo = lang === "ko" ? generateQuestSeoTextKo(quest) : generateQuestSeoText(quest);

  const routePrefix = lang === "ko" ? "/ko" : "";

  const otherQuests = quests.filter((q) => q.id !== quest.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name:
      lang === "ko"
        ? `${displayName} — Don't Starve Together 퀘스트 체크리스트`
        : `${displayName} — Don't Starve Together Quest Checklist`,
    description: seo.overview,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    step: quest.steps.map((s) => ({
      "@type": "HowToStep",
      name: stepTitle(s, lang),
      itemListElement: (s.substeps ?? []).map((ss) => ({
        "@type": "HowToDirection",
        text: ss.qty ? `${substepName(ss, lang)} ×${ss.qty}` : substepName(ss, lang),
      })),
    })),
    ...(heroIcon ? { image: `${SITE_URL}${heroIcon}` } : {}),
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
            href={`${routePrefix}/quests`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {L.questsLink[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.questGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="flex gap-6 items-start">
          {heroIcon && (
            <div className="shrink-0 size-24 rounded-xl border border-border bg-surface flex items-center justify-center">
              <img src={heroIcon} alt={displayName} className="size-20 object-contain" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {lang === "ko"
                ? `${displayName} | DST 퀘스트 체크리스트`
                : `${displayName} | DST Quest Checklist`}
            </h1>
            <p className="text-base text-muted-foreground mt-0.5">{subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-muted-foreground">
                {L.totalStepsLabel[lang]}: <span className="text-foreground font-medium">{totalSteps}</span>
              </span>
              {subCount > 0 && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-muted-foreground">
                  {L.substepsLabel[lang]}: <span className="text-foreground font-medium">{subCount}</span>
                </span>
              )}
              {quest.goal && quest.goal < totalSteps && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400">
                  {L.goalLabel[lang]}: {quest.goal}/{totalSteps}
                </span>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            {L.questOverview[lang]} {displayName}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.overview}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            {L.questStepsBreakdown[lang]}
          </h2>
          <ol className="space-y-3">
            {quest.steps.map((step, i) => {
              const icon = resolveIcon(step);
              const title = stepTitle(step, lang);
              return (
                <li
                  key={step.id}
                  className="rounded-lg border border-border bg-surface px-3 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-10 rounded-md border border-border bg-background flex items-center justify-center relative">
                      {icon ? (
                        <img src={icon} alt={title} className="size-8 object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                      )}
                      {typeof step.count === "number" && step.count > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center leading-none">
                          {step.count}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {i + 1}. {title}
                        </p>
                        {step.required && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            ★ {lang === "ko" ? "필수" : "Required"}
                          </span>
                        )}
                      </div>
                      {step.bossId && (
                        <Link
                          href={`${routePrefix}/boss/${canonicalForBoss(step.bossId)}`}
                          className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {lang === "ko" ? "보스 가이드 →" : "Boss guide →"}
                        </Link>
                      )}
                      {step.craftId && (
                        <Link
                          href={`${routePrefix}/item/${canonicalForItem(step.craftId)}`}
                          className="inline-flex items-center gap-1 mt-1 ml-3 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {lang === "ko" ? "제작 레시피 →" : "Crafting recipe →"}
                        </Link>
                      )}
                      {step.substeps && step.substeps.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {step.substeps.map((ss) => {
                            const ssIcon = resolveIcon(ss);
                            const ssName = substepName(ss, lang);
                            const ssNote = substepNote(ss, lang);
                            const ssCraft = ss.craftId ? canonicalForItem(ss.craftId) : undefined;
                            const ssBoss = ss.bossId ? canonicalForBoss(ss.bossId) : undefined;
                            const inner = (
                              <span className="flex items-center gap-2">
                                {ssIcon && (
                                  <img
                                    src={ssIcon}
                                    alt={ssName}
                                    className="size-5 object-contain shrink-0"
                                  />
                                )}
                                <span className="text-xs text-foreground/90">
                                  {ssName}
                                  {typeof ss.qty === "number" && (
                                    <span className="ml-1 text-muted-foreground">×{ss.qty}</span>
                                  )}
                                </span>
                              </span>
                            );
                            return (
                              <li key={ss.id} className="flex flex-col">
                                {ssCraft ? (
                                  <Link
                                    href={`${routePrefix}/item/${ssCraft}`}
                                    className="hover:underline"
                                  >
                                    {inner}
                                  </Link>
                                ) : ssBoss ? (
                                  <Link
                                    href={`${routePrefix}/boss/${ssBoss}`}
                                    className="hover:underline"
                                  >
                                    {inner}
                                  </Link>
                                ) : (
                                  inner
                                )}
                                {ssNote && (
                                  <p className="ml-7 text-[10px] text-muted-foreground leading-tight">
                                    {ssNote}
                                  </p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">{L.questTips[lang]}</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{seo.tips}</p>
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

        {otherQuests.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {L.otherQuests[lang]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {otherQuests.map((q) => {
                const qIcon = resolveIcon(q);
                const qName = questTitle(q, lang);
                const qSub = lang === "ko" ? q.titleEn : q.titleKo;
                return (
                  <Link
                    key={q.id}
                    href={`${routePrefix}/quest/${canonicalForQuest(q.id)}`}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 hover:border-ring transition-colors text-center"
                  >
                    {qIcon && (
                      <img src={qIcon} alt={qName} className="size-10 object-contain" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{qName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{qSub}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

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

export function buildQuestMetadata(slug: string, lang: SeoLang) {
  const id = resolveQuestSlug(slug);
  const quest = id ? quests.find((q) => q.id === id) : undefined;
  if (!quest) return {};
  const canonicalSlug = canonicalForQuest(quest.id) ?? slug;

  const displayName = questTitle(quest, lang);
  const totalSteps = quest.steps.length;
  const subCount = countSubsteps(quest);
  const goal = quest.goal;

  const title =
    lang === "ko"
      ? `${displayName} — Don't Starve Together 퀘스트 체크리스트`
      : `${displayName} — Don't Starve Together Quest Checklist`;

  const description =
    lang === "ko"
      ? `Don't Starve Together ${displayName} 진행 체크리스트. ${totalSteps}단계${subCount > 0 ? ` · 하위 ${subCount}단계` : ""}${goal && goal < totalSteps ? ` · 보상에는 ${goal}단계만 필요` : ""}. 모든 자재 수량, 청사진, 보스 처치 출처 검증.`
      : `Don't Starve Together ${displayName} progression checklist. ${totalSteps} steps${subCount > 0 ? `, ${subCount} substeps` : ""}${goal && goal < totalSteps ? `, only ${goal} required for the main reward` : ""}. Every material count, blueprint, and boss kill — sourced from in-game files.`;

  const enUrl = `${SITE_URL}/quest/${canonicalSlug}`;
  const koUrl = `${SITE_URL}/ko/quest/${canonicalSlug}`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  const heroIcon = resolveIcon(quest);

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
      ...(heroIcon ? { images: [{ url: `${SITE_URL}${heroIcon}` }] } : {}),
    },
  };
}
