"use client";

import Image from "next/image";
import { Check, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getItemsBySkill } from "@/data/skill-trees/skill-items";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { itemName, type Locale } from "@/lib/i18n";
import { allItems } from "@/data/items";
import type { LockCondition } from "@/data/skill-trees/types";
import { LockConditionPill } from "./SkillLockIndicator";

export interface LockRequirement {
  id: string;
  lockType: LockCondition;
  satisfied: boolean;
  onToggle?: () => void;
}

interface Props {
  skillId: string;
  icon?: string;
  title: string;
  description?: string;
  isLearned: boolean;
  isLocked: boolean;
  canLearn: boolean;
  groupColor: string;
  locale: Locale;
  onToggle: () => void;
  onViewItem?: (itemId: string) => void;
  onNoPoints?: () => void;
  prereq?: { label: string; satisfied: boolean };
  lockRequirements?: LockRequirement[];
}

export function SkillNodeCard({
  skillId,
  icon,
  title,
  description,
  isLearned,
  isLocked,
  canLearn,
  groupColor,
  locale,
  onToggle,
  onViewItem,
  onNoPoints,
  prereq,
  lockRequirements,
}: Props) {
  const iconSrc = icon ? `/images/skill-icons/${icon}.png` : undefined;
  const relatedItemIds = getItemsBySkill(skillId);
  const relatedItems = relatedItemIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as typeof allItems;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canLearn && !isLearned && onNoPoints) {
      onNoPoints();
      return;
    }
    onToggle();
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border transition-colors w-full",
        isLocked
          ? "bg-surface/50 border-border/50 opacity-60"
          : !isLearned
            ? "bg-surface border-border"
            : "",
      )}
      style={isLearned ? { backgroundColor: `${groupColor}08`, borderColor: `${groupColor}50` } : undefined}
    >
      {/* Requirement pills (prereq + locks) */}
      {(prereq || (lockRequirements && lockRequirements.length > 0)) && (
        <div className="flex flex-wrap gap-1.5">
          {prereq && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
                prereq.satisfied
                  ? "border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/5"
                  : "border-border text-muted-foreground bg-surface",
              )}
            >
              <span className={`inline-block size-[6px] rounded-full ${prereq.satisfied ? "bg-green-500" : "bg-muted-foreground/40"}`} />
              {prereq.label}
            </div>
          )}
          {lockRequirements?.map((lr) => (
            <LockConditionPill
              key={lr.id}
              lockId={lr.id}
              lockType={lr.lockType}
              isSatisfied={lr.satisfied}
              locale={locale}
              onToggle={lr.onToggle}
            />
          ))}
        </div>
      )}

      {/* Main row: icon + title + toggle */}
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div
          className="shrink-0 size-10 rounded-md flex items-center justify-center overflow-hidden"
          style={!iconSrc ? { backgroundColor: `${groupColor}15` } : undefined}
        >
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={40} height={40} className="size-10" />
          ) : (
            <div className="size-5 rounded-full" style={{ backgroundColor: `${groupColor}60` }} />
          )}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{title}</div>
          {description && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {description}
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          className={cn(
            "shrink-0 size-7 rounded-full flex items-center justify-center transition-all touch-manipulation",
            isLearned
              ? "text-white"
              : canLearn
                ? "border-2 text-muted-foreground hover:text-foreground"
                : "border border-border/50 text-muted-foreground/50",
          )}
          style={
            isLearned
              ? { backgroundColor: groupColor }
              : canLearn
                ? { borderColor: groupColor, color: groupColor }
                : undefined
          }
        >
          {isLearned ? (
            <Check className="size-4" strokeWidth={3} />
          ) : isLocked ? (
            <Lock className="size-3" />
          ) : (
            <Plus className="size-4" />
          )}
        </button>
      </div>

      {/* Related items (inline) */}
      {relatedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-[50px]">
          {relatedItems.map((item) => (
            <ItemSlot
              key={item.id}
              icon={item.image}
              label={itemName(item, locale)}
              onClick={onViewItem ? () => onViewItem(item.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
