"use client";

import { cn } from "@/lib/utils";
import type { LockCondition } from "@/data/skill-trees/types";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";

interface Props {
  lockType: LockCondition;
  isSatisfied: boolean;
  groupColor: string;
  locale: Locale;
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
    default:
      return "";
  }
}

export function SkillLockIndicator({ lockType, isSatisfied, groupColor, locale }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      {/* Left line */}
      <div className="flex-1 h-px bg-border" />

      {/* Diamond + label */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
          isSatisfied
            ? "border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/5"
            : "border-border text-muted-foreground bg-surface",
        )}
      >
        <span
          className="inline-block size-2.5 rotate-45"
          style={{
            backgroundColor: isSatisfied ? "#22c55e" : `${groupColor}60`,
            border: `1px solid ${isSatisfied ? "#22c55e" : groupColor}`,
          }}
        />
        {lockLabel(lockType, locale)}
      </div>

      {/* Right line */}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
