"use client";

import { useCallback, useState } from "react";
import { RotateCcw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useQuestState } from "@/hooks/use-quest-state";
import { quests, type Quest, type QuestStep, type QuestMaterial } from "@/data/quests";
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
function questSummary(quest: Quest, locale: Locale): string {
  return locale === "ko" ? quest.summaryKo : quest.summaryEn;
}

/** icon(game-items 파일명) vs iconPath(/images/... 전체 경로) 통합 해석 */
function resolveIcon(item: { icon?: string; iconPath?: string }): string | null {
  if (item.iconPath) return assetPath(item.iconPath);
  if (item.icon) return assetPath(`/images/game-items/${item.icon}`);
  return null;
}

export function QuestsApp() {
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
            />
          ))}
        </div>
      </TabScrollArea>
    </div>
  );
}

type QuestStateApi = ReturnType<typeof useQuestState>;

function QuestSection({ quest, locale, state }: { quest: Quest; locale: Locale; state: QuestStateApi }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isStepDone, isMaterialDone, toggleStep, toggleMaterial, resetQuest, countStepsDone } = state;

  const checkedCount = countStepsDone(quest);
  const total = quest.steps.length;
  const percent = total === 0 ? 0 : Math.round((checkedCount / total) * 100);
  const allDone = checkedCount === total && total > 0;
  const questIconSrc = resolveIcon(quest);

  const handleReset = useCallback(() => {
    if (checkedCount === 0) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(t(locale, "quests_reset_confirm"));
      if (!ok) return;
    }
    resetQuest(quest.id);
  }, [checkedCount, resetQuest, quest.id, locale]);

  return (
    <section className="rounded-lg border border-border bg-surface/40">
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
              <p className="text-[10px] text-muted-foreground truncate">
                {questSummary(quest, locale)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="text-right">
                <div className="text-xs font-mono tabular-nums">
                  {checkedCount}/{total}
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {percent}%
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
              allDone ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {!collapsed && (
        <ul className="divide-y divide-border/60">
          {quest.steps.map((step) => {
            const checked = isStepDone(quest.id, step);
            const hasMaterials = !!step.materials && step.materials.length > 0;
            const stepIconSrc = resolveIcon(step);
            return (
              <li key={step.id}>
                <button
                  onClick={() => toggleStep(quest.id, step)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                    "hover:bg-surface/60 focus:bg-surface/60 focus:outline-none",
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
                        <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[10px] font-bold bg-surface-hover border border-ring text-foreground/80">
                          ×{step.count}
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

                {hasMaterials && (
                  <ul className="pl-12 pr-3 pb-2 space-y-1">
                    {step.materials!.map((m) => (
                      <MaterialRow
                        key={m.id}
                        material={m}
                        locale={locale}
                        checked={isMaterialDone(quest.id, step.id, m.id)}
                        onToggle={() => toggleMaterial(quest.id, step, m.id)}
                      />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function MaterialRow({
  material,
  locale,
  checked,
  onToggle,
}: {
  material: QuestMaterial;
  locale: Locale;
  checked: boolean;
  onToggle: () => void;
}) {
  const iconSrc = resolveIcon(material);
  return (
    <li>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors",
          "hover:bg-surface/60 focus:bg-surface/60 focus:outline-none",
        )}
      >
        <Checkbox checked={checked} small />
        {iconSrc && (
          <img
            src={iconSrc}
            alt=""
            className={cn("size-5 object-contain shrink-0", checked && "opacity-50")}
            loading="lazy"
          />
        )}
        <span
          className={cn(
            "flex-1 min-w-0 text-[11px] truncate",
            checked ? "line-through text-muted-foreground" : "text-foreground/90",
          )}
        >
          {locale === "ko" ? material.nameKo : material.nameEn}
        </span>
        <span className={cn("text-[11px] tabular-nums shrink-0", checked ? "text-muted-foreground/60" : "text-muted-foreground")}>
          ×{material.qty}
        </span>
      </button>
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
