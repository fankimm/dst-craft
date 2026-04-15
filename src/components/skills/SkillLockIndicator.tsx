"use client";

import { cn } from "@/lib/utils";
import type { LockCondition } from "@/data/skill-trees/types";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";

interface Props {
  lockType: LockCondition;
  isSatisfied: boolean;
  groupColor: string;
  locale: Locale;
  onToggle?: () => void;
}

function lockLabel(lock: LockCondition, locale: Locale): string {
  switch (lock.type) {
    case "skill_count": {
      const template = t(locale, "skills_gate_skill_count" as TranslationKey);
      return template.replace("{count}", String(lock.count));
    }
    case "total_skills": {
      const template = t(locale, "skills_gate_total_skills" as TranslationKey);
      return template.replace("{count}", String(lock.count));
    }
    case "boss_kill":
      return lock.boss === "fuelweaver"
        ? t(locale, "skills_gate_boss_fuelweaver" as TranslationKey)
        : t(locale, "skills_gate_boss_celestialchampion" as TranslationKey);
    case "no_opposing_faction":
      return lock.faction === "lunar"
        ? t(locale, "skills_gate_no_lunar" as TranslationKey)
        : t(locale, "skills_gate_no_shadow" as TranslationKey);
    case "manual":
      return locale === "ko" ? lock.desc_ko : lock.desc_en;
    default:
      return "";
  }
}

export function SkillLockIndicator({ lockType, isSatisfied, groupColor, locale, onToggle }: Props) {
  const isManual = lockType.type === "manual" || lockType.type === "boss_kill";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      {/* Left line */}
      <div className="flex-1 h-px bg-border" />

      {/* Dot + label */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
          isSatisfied
            ? "border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/5"
            : "border-border text-muted-foreground bg-surface",
          isManual && "cursor-pointer hover:border-ring transition-colors",
        )}
        onClick={isManual ? onToggle : undefined}
        role={isManual ? "button" : undefined}
      >
        {isManual ? (
          <span className={cn(
            "inline-flex items-center justify-center size-3 rounded-sm border transition-colors",
            isSatisfied ? "bg-green-500 border-green-500" : "border-muted-foreground/50",
          )}>
            {isSatisfied && <span className="text-white text-[8px]">✓</span>}
          </span>
        ) : (
          <span className={`inline-block size-[6px] rounded-full ${isSatisfied ? "bg-green-500" : "bg-muted-foreground/40"}`} />
        )}
        {lockLabel(lockType, locale)}
      </div>

      {/* Right line */}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
