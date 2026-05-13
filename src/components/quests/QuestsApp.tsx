"use client";

import { useCallback, useState } from "react";
import { RotateCcw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useQuestState } from "@/hooks/use-quest-state";
import { quests, type Quest, type QuestStep } from "@/data/quests";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { Footer } from "../crafting/Footer";

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

export function QuestsApp() {
  const { resolvedLocale } = useSettings();
  const { isChecked, toggle, resetQuest, countChecked } = useQuestState();

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <div className="shrink-0 border-b border-border bg-background/80 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-foreground">
          {t(resolvedLocale, "quests_header")}
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {t(resolvedLocale, "quests_subheader")}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" data-scroll-container>
        <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">
          {quests.map((quest) => (
            <QuestSection
              key={quest.id}
              quest={quest}
              locale={resolvedLocale}
              isChecked={isChecked}
              onToggle={toggle}
              onReset={resetQuest}
              checkedCount={countChecked(quest.id)}
            />
          ))}
        </div>
        <Footer />
      </div>
    </div>
  );
}

interface QuestSectionProps {
  quest: Quest;
  locale: Locale;
  isChecked: (questId: Quest["id"], stepId: string) => boolean;
  onToggle: (questId: Quest["id"], stepId: string) => void;
  onReset: (questId: Quest["id"]) => void;
  checkedCount: number;
}

function QuestSection({ quest, locale, isChecked, onToggle, onReset, checkedCount }: QuestSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const total = quest.steps.length;
  const percent = total === 0 ? 0 : Math.round((checkedCount / total) * 100);
  const allDone = checkedCount === total && total > 0;

  const handleReset = useCallback(() => {
    if (checkedCount === 0) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(t(locale, "quests_reset_confirm"));
      if (!ok) return;
    }
    onReset(quest.id);
  }, [checkedCount, onReset, quest.id, locale]);

  return (
    <section className="rounded-lg border border-border bg-surface/40 overflow-hidden">
      <header className="flex items-center gap-3 px-3 py-2.5 bg-surface/60 border-b border-border">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          aria-expanded={!collapsed}
        >
          <img
            src={assetPath(`/images/game-items/${quest.icon}`)}
            alt=""
            className="size-9 object-contain shrink-0"
          />
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
            <span className="sr-only sm:not-sr-only">{t(locale, "quests_reset")}</span>
          </button>
        )}
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-border/40 relative overflow-hidden">
        <div
          className={cn(
            "h-full transition-[width] duration-300",
            allDone ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {!collapsed && (
        <ul className="divide-y divide-border/60">
          {quest.steps.map((step) => {
            const checked = isChecked(quest.id, step.id);
            return (
              <li key={step.id}>
                <button
                  onClick={() => onToggle(quest.id, step.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                    "hover:bg-surface/60 focus:bg-surface/60 focus:outline-none",
                  )}
                >
                  {/* Checkbox */}
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 inline-flex items-center justify-center size-5 rounded border-2 transition-colors",
                      checked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border bg-surface",
                    )}
                  >
                    {checked && <Check className="size-3.5" strokeWidth={3} />}
                  </span>

                  {/* Item icon */}
                  {step.icon && (
                    <span className="relative shrink-0 inline-flex items-center justify-center size-9 rounded border border-input bg-surface">
                      <img
                        src={assetPath(`/images/game-items/${step.icon}`)}
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

                  {/* Text */}
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
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
