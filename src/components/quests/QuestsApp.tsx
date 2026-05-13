"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Check, ChevronDown, ChevronUp, Star, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useQuestState } from "@/hooks/use-quest-state";
import { quests, type Quest, type QuestStep, type QuestSubstep } from "@/data/quests";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { TabScrollArea } from "@/components/ui/TabScrollArea";

function stepTitle(step: QuestStep, locale: Locale): string {
  return locale === "ko" ? step.titleKo : step.titleEn;
}
function stepDesc(step: QuestStep, locale: Locale): string | undefined {
  return locale === "ko" ? step.descKo : step.descEn;
}
function questTitle(quest: Quest, locale: Locale): string {
  return locale === "ko" ? quest.titleKo : quest.titleEn;
}
function questSummary(quest: Quest, locale: Locale): string | undefined {
  return locale === "ko" ? quest.summaryKo : quest.summaryEn;
}
function substepNote(s: QuestSubstep, locale: Locale): string | undefined {
  return locale === "ko" ? s.noteKo : s.noteEn;
}

function resolveIcon(item: { icon?: string; iconPath?: string }): string | null {
  if (item.iconPath) return assetPath(item.iconPath);
  if (item.icon) return assetPath(`/images/game-items/${item.icon}`);
  return null;
}

export function QuestsApp({ onViewCraftingItem, onViewBoss }: { onViewCraftingItem?: (itemId: string) => void; onViewBoss?: (bossId: string) => void } = {}) {
  const { resolvedLocale } = useSettings();
  const state = useQuestState();
  const { resetAll, hasAnyChecked } = state;

  const handleResetAll = useCallback(() => {
    if (!hasAnyChecked) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(t(resolvedLocale, "quests_reset_all_confirm"));
      if (!ok) return;
    }
    resetAll();
  }, [hasAnyChecked, resetAll, resolvedLocale]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <div className="shrink-0 border-b border-border bg-background/80 px-4 py-2.5 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">
            {t(resolvedLocale, "quests_header")}
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t(resolvedLocale, "quests_subheader")}
          </p>
        </div>
        {hasAnyChecked && (
          <button
            onClick={handleResetAll}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface border border-border transition-colors"
            title={t(resolvedLocale, "quests_reset_all")}
          >
            <RotateCcw className="size-3" />
            {t(resolvedLocale, "quests_reset_all")}
          </button>
        )}
      </div>

      <TabScrollArea scrollContainer>
        <div className="max-w-3xl mx-auto px-3 py-3 space-y-3 w-full">
          {quests.map((quest) => (
            <QuestSection
              key={quest.id}
              quest={quest}
              locale={resolvedLocale}
              state={state}
              onViewCraftingItem={onViewCraftingItem}
              onViewBoss={onViewBoss}
            />
          ))}
        </div>
      </TabScrollArea>
    </div>
  );
}

type QuestStateApi = ReturnType<typeof useQuestState>;

function QuestSection({
  quest,
  locale,
  state,
  onViewCraftingItem,
  onViewBoss,
}: {
  quest: Quest;
  locale: Locale;
  state: QuestStateApi;
  onViewCraftingItem?: (itemId: string) => void;
  onViewBoss?: (bossId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const wasCollapsedRef = useRef(collapsed);
  // 접을 때만 섹션 헤더를 뷰포트 상단으로 끌어올린다. 그러지 않으면 위쪽 콘텐츠가
  // 줄어든 만큼 아래 섹션들이 위로 밀려 올라가 사용자가 의도하지 않은 위치로 이동.
  useEffect(() => {
    if (!wasCollapsedRef.current && collapsed) {
      sectionRef.current?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    }
    wasCollapsedRef.current = collapsed;
  }, [collapsed]);
  // 서브스텝이 있는 단계는 기본 펼쳐짐. 사용자가 접고/펼치고 토글 가능 (세션 한정).
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(() => new Set());
  const toggleStepExpand = useCallback((stepId: string) => {
    setCollapsedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }, []);
  const { isStepDone, isSubstepDone, toggleStep, toggleSubstep, resetQuest, getEffectiveProgress } = state;

  const progress = getEffectiveProgress(quest);
  const { total, checkedCount, goal, effective, goalReached, allDone } = progress;
  const denom = goal;
  const percent = denom === 0 ? 0 : Math.round((effective / denom) * 100);
  const questIconSrc = resolveIcon(quest);
  // 진행바: effective/goal 기반. goal < total인 경우 goal 위치 마커 표시
  const fillPercent = denom === 0 ? 0 : Math.min(100, Math.round((effective / denom) * 100));
  const goalMarkerPercent = goal < total ? Math.round((goal / total) * 100) : null;

  const handleReset = useCallback(() => {
    if (checkedCount === 0) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(t(locale, "quests_reset_confirm"));
      if (!ok) return;
    }
    resetQuest(quest.id);
  }, [checkedCount, resetQuest, quest.id, locale]);

  return (
    <section ref={sectionRef} className="rounded-lg border border-border bg-surface/40">
      <div className="sticky top-0 z-10 rounded-t-lg overflow-hidden">
        <header className="flex items-center gap-3 px-3 py-2.5 bg-background/95 backdrop-blur-sm border-b border-border">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
            aria-expanded={!collapsed}
          >
            {questIconSrc && (
              <img src={questIconSrc} alt="" className="size-9 object-contain shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn("text-sm font-semibold truncate", allDone && "text-emerald-600 dark:text-emerald-400")}>
                  {questTitle(quest, locale)}
                </h3>
                {allDone && <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              </div>
              {questSummary(quest, locale) && (
                <p className="text-[10px] text-muted-foreground truncate">
                  {questSummary(quest, locale)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="text-right">
                <div className="text-xs font-mono tabular-nums flex items-center gap-1 justify-end">
                  <span>{effective}/{denom}</span>
                  {goal < total && (
                    <span className="text-[9px] font-normal text-muted-foreground tabular-nums">
                      ({checkedCount}/{total})
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1 justify-end">
                  {goalReached && <Star className="size-3 fill-amber-500 text-amber-500" strokeWidth={0} />}
                  <span>{percent}%</span>
                </div>
              </div>
              {collapsed ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronUp className="size-4 text-muted-foreground" />}
            </div>
          </button>
          {checkedCount > 0 && (
            <button
              onClick={handleReset}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface border border-border transition-colors"
              title={t(locale, "quests_reset")}
              aria-label={t(locale, "quests_reset")}
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </header>
        <div className="h-1 bg-border/40 relative overflow-hidden">
          <div
            className={cn(
              "h-full transition-[width] duration-300",
              allDone ? "bg-emerald-500" : goalReached ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${fillPercent}%` }}
          />
          {goalMarkerPercent != null && (
            <div
              className={cn(
                "absolute top-0 bottom-0 w-px",
                goalReached ? "bg-amber-700/60" : "bg-amber-500/80",
              )}
              style={{ left: `${goalMarkerPercent}%` }}
              aria-hidden
            />
          )}
        </div>
      </div>

      {!collapsed && (
        <ul className="divide-y divide-border/60">
          {(() => {
            const doneIds = new Set(quest.steps.filter((s) => isStepDone(quest.id, s)).map((s) => s.id));
            return quest.steps.map((step) => {
              const checked = isStepDone(quest.id, step);
              const hasSubsteps = !!step.substeps && step.substeps.length > 0;
              const stepIconSrc = resolveIcon(step);
              const expanded = hasSubsteps && !collapsedSteps.has(step.id);
              const locked = (step.requires ?? []).some((r) => !doneIds.has(r));
              return (
              <li key={step.id} className={cn(locked && "bg-surface/50 opacity-60")}>
                <div className="flex items-stretch">
                  <button
                    onClick={() => { if (!locked) toggleStep(quest.id, step); }}
                    disabled={locked}
                    className={cn(
                      "flex-1 min-w-0 flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                      locked
                        ? "cursor-not-allowed focus:outline-none"
                        : "hover:bg-surface/60 focus:bg-surface/60 focus:outline-none",
                    )}
                  >
                    <Checkbox checked={checked} />

                    {stepIconSrc && (
                      <span className="relative shrink-0 inline-flex items-center justify-center size-9 rounded border border-input bg-surface">
                        <img
                          src={stepIconSrc}
                          alt=""
                          className={cn("size-7 object-contain", checked && "opacity-50")}
                          loading="lazy"
                        />
                        {step.count && step.count > 1 && (
                          <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[10px] font-bold bg-surface-hover border border-ring text-foreground/80 tabular-nums">
                            {step.count}
                          </span>
                        )}
                      </span>
                    )}

                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          checked && "line-through text-muted-foreground",
                        )}
                      >
                        {stepTitle(step, locale)}
                      </span>
                      {stepDesc(step, locale) && (
                        <span
                          className={cn(
                            "block text-[11px] leading-snug mt-0.5",
                            checked ? "text-muted-foreground/60 line-through" : "text-muted-foreground",
                          )}
                        >
                          {stepDesc(step, locale)}
                        </span>
                      )}
                    </span>
                  </button>
                  {step.craftId && onViewCraftingItem && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewCraftingItem(step.craftId!); }}
                      aria-label="제작 상세 보기"
                      title="제작 탭에서 보기"
                      className="shrink-0 px-2 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface/60 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </button>
                  )}
                  {step.bossId && onViewBoss && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewBoss(step.bossId!); }}
                      aria-label="보스 상세 보기"
                      title="보스 탭에서 보기"
                      className="shrink-0 px-2 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface/60 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </button>
                  )}
                  {hasSubsteps && (
                    <button
                      onClick={() => toggleStepExpand(step.id)}
                      aria-expanded={expanded}
                      aria-label={expanded ? "접기" : "펼치기"}
                      className="shrink-0 px-2 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface/60 transition-colors"
                    >
                      {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  )}
                </div>

                {hasSubsteps && expanded && (
                  <ul className="pl-12 pr-3 pb-2 space-y-1">
                    {step.substeps!.map((s) => (
                      <SubstepRow
                        key={s.id}
                        substep={s}
                        locale={locale}
                        checked={isSubstepDone(quest.id, step.id, s.id)}
                        onToggle={() => toggleSubstep(quest.id, step, s.id)}
                        onViewCraftingItem={onViewCraftingItem}
                        onViewBoss={onViewBoss}
                      />
                    ))}
                  </ul>
                )}
              </li>
            );
            });
          })()}
        </ul>
      )}
    </section>
  );
}

function SubstepRow({
  substep,
  locale,
  checked,
  onToggle,
  onViewCraftingItem,
  onViewBoss,
}: {
  substep: QuestSubstep;
  locale: Locale;
  checked: boolean;
  onToggle: () => void;
  onViewCraftingItem?: (itemId: string) => void;
  onViewBoss?: (bossId: string) => void;
}) {
  const iconSrc = resolveIcon(substep);
  const note = substepNote(substep, locale);
  return (
    <li className="flex items-stretch">
      <button
        onClick={onToggle}
        className={cn(
          "flex-1 min-w-0 flex items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
          "hover:bg-surface/60 focus:bg-surface/60 focus:outline-none",
        )}
      >
        <span className="pt-0.5">
          <Checkbox checked={checked} small />
        </span>
        {iconSrc && (
          <img
            src={iconSrc}
            alt=""
            className={cn("size-5 object-contain shrink-0 mt-0.5", checked && "opacity-50")}
            loading="lazy"
          />
        )}
        <span className="flex-1 min-w-0">
          <span className="flex items-baseline flex-wrap gap-x-1.5">
            <span
              className={cn(
                "text-[11px] truncate",
                checked ? "line-through text-muted-foreground" : "text-foreground/90",
              )}
            >
              {locale === "ko" ? substep.nameKo : substep.nameEn}
            </span>
            {substep.qty != null && (
              <span className={cn("text-[11px] tabular-nums", checked ? "text-muted-foreground/60" : "text-muted-foreground")}>
                {substep.qty}
              </span>
            )}
          </span>
          {note && (
            <span
              className={cn(
                "block text-[10px] leading-snug mt-0.5",
                checked ? "text-muted-foreground/60 line-through" : "text-muted-foreground",
              )}
            >
              {note}
            </span>
          )}
        </span>
      </button>
      {substep.craftId && onViewCraftingItem && (
        <button
          onClick={(e) => { e.stopPropagation(); onViewCraftingItem(substep.craftId!); }}
          aria-label="제작 상세 보기"
          title="제작 탭에서 보기"
          className="shrink-0 px-2 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface/60 rounded-md transition-colors"
        >
          <ExternalLink className="size-3" />
        </button>
      )}
      {substep.bossId && onViewBoss && (
        <button
          onClick={(e) => { e.stopPropagation(); onViewBoss(substep.bossId!); }}
          aria-label="보스 상세 보기"
          title="보스 탭에서 보기"
          className="shrink-0 px-2 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface/60 rounded-md transition-colors"
        >
          <ExternalLink className="size-3" />
        </button>
      )}
    </li>
  );
}

function Checkbox({ checked, small = false }: { checked: boolean; small?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center justify-center rounded border-2 transition-colors",
        small ? "size-4" : "mt-0.5 size-5",
        checked
          ? "bg-emerald-500 border-emerald-500 text-white"
          : "border-border bg-surface",
      )}
    >
      {checked && <Check className={small ? "size-3" : "size-3.5"} strokeWidth={3} />}
    </span>
  );
}
