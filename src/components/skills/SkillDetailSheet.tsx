"use client";

import Image from "next/image";
import { Check, Lock, Plus } from "lucide-react";
import type { SkillNode } from "@/data/skill-trees/types";
import { skillTranslations, groupTranslations } from "@/data/skill-trees/translations";
import { getItemsBySkill } from "@/data/skill-trees/skill-items";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { t, itemName, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { allItems } from "@/data/items";

interface UnlockRequirement {
  type: "parent_skill" | "lock_gate";
  label: string;
  satisfied: boolean;
}

interface Props {
  node: SkillNode;
  isLearned: boolean;
  canLearn: boolean;
  canUnlearn: boolean;
  groupColor: string;
  locale: Locale;
  /** Unlock requirements (parent skills + lock gates) */
  requirements?: UnlockRequirement[];
  onToggle: () => void;
  onViewItem?: (itemId: string) => void;
}

export type { UnlockRequirement };

function getTranslation(id: string, locale: Locale) {
  const entry = skillTranslations[id];
  if (!entry) return { title: id, desc: "" };
  return {
    title: locale === "ko" ? entry.title.ko : entry.title.en,
    desc: locale === "ko" ? entry.desc.ko : entry.desc.en,
  };
}

function getGroupLabel(groupId: string, locale: Locale): string {
  const entry = groupTranslations[groupId];
  if (!entry) return groupId;
  return locale === "ko" ? entry.ko : entry.en;
}

export function SkillDetailSheet({
  node,
  isLearned,
  canLearn,
  canUnlearn,
  groupColor,
  locale,
  requirements,
  onToggle,
  onViewItem,
}: Props) {
  const { title, desc } = getTranslation(node.id, locale);
  const altTitle = locale !== "en" ? getTranslation(node.id, "en").title : "";
  const relatedItemIds = getItemsBySkill(node.id);
  const relatedItems = relatedItemIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as typeof allItems;

  const iconSrc = node.icon ? `/images/skill-icons/${node.icon}.png` : undefined;

  return (
    <div className="p-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        {iconSrc ? (
          <Image src={iconSrc} alt="" width={64} height={64} className="size-16 shrink-0" />
        ) : (
          <div
            className="size-16 shrink-0 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${groupColor}15`, border: `2px solid ${groupColor}40` }}
          >
            <div className="size-8 rounded-full" style={{ backgroundColor: `${groupColor}60` }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {altTitle && (
            <p className="text-xs text-muted-foreground">{altTitle}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: groupColor }}
            />
            <span className="text-xs text-muted-foreground">
              {getGroupLabel(node.group, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {desc && (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {desc}
        </p>
      )}

      {/* Unlock requirements */}
      {requirements && requirements.length > 0 && !isLearned && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground">
            {locale === "ko" ? "해금 조건" : "Unlock Requirements"}
          </h4>
          {requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={cn("size-1.5 rounded-full shrink-0", req.satisfied ? "bg-green-500" : "bg-red-400")} />
              <span className={req.satisfied ? "text-muted-foreground line-through" : "text-foreground"}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Related crafting items */}
      {relatedItems.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            {t(locale, "skills_unlocks_items" as TranslationKey)}
          </h4>
          <div className="flex flex-wrap gap-4">
            {relatedItems.map((item) => (
              <ItemSlot
                key={item.id}
                icon={item.image}
                label={itemName(item, locale)}
                onClick={onViewItem ? () => onViewItem(item.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Learn/Unlearn button */}
      <button
        onClick={onToggle}
        disabled={!canLearn && !canUnlearn}
        className={cn(
          "w-full py-2.5 rounded-lg text-sm font-semibold transition-all touch-manipulation",
          isLearned
            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20"
            : canLearn
              ? "text-white border-0"
              : "bg-surface text-muted-foreground border border-border cursor-not-allowed",
        )}
        style={
          !isLearned && canLearn
            ? { backgroundColor: groupColor }
            : undefined
        }
      >
        <span className="flex items-center justify-center gap-1.5">
          {isLearned ? (
            <>
              <Check className="size-4" />
              {t(locale, "skills_unlearn" as TranslationKey)}
            </>
          ) : canLearn ? (
            <>
              <Plus className="size-4" />
              {t(locale, "skills_learn" as TranslationKey)}
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {t(locale, "skills_locked" as TranslationKey)}
            </>
          )}
        </span>
      </button>
    </div>
  );
}
