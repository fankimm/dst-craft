"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LockCondition } from "@/data/skill-trees/types";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";

interface Props {
  lockType: LockCondition;
  isSatisfied: boolean;
  locale: Locale;
  onToggle?: () => void;
}

export function lockLabel(lock: LockCondition, locale: Locale): string {
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

interface PillProps {
  lockType: LockCondition;
  isSatisfied: boolean;
  locale: Locale;
  onToggle?: () => void;
}

export function LockConditionPill({ lockType, isSatisfied, locale, onToggle }: PillProps) {
  const isManual = lockType.type === "manual" || lockType.type === "boss_kill";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
        isSatisfied
          ? "border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/5"
          : "border-border text-muted-foreground bg-surface",
        isManual && "cursor-pointer hover:border-ring transition-colors",
      )}
      onClick={isManual && onToggle ? (e) => { e.stopPropagation(); onToggle(); } : undefined}
      role={isManual ? "button" : undefined}
    >
      <Image
        src={isSatisfied ? "/images/ui/skill_unlock_large.png" : "/images/ui/skill_lock_large.png"}
        alt=""
        width={14}
        height={14}
        className="size-3.5 shrink-0"
      />
      {lockLabel(lockType, locale)}
    </div>
  );
}

export function SkillLockIndicator({ lockType, isSatisfied, locale, onToggle }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <div className="flex-1 h-px bg-border" />
      <LockConditionPill lockType={lockType} isSatisfied={isSatisfied} locale={locale} onToggle={onToggle} />
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
