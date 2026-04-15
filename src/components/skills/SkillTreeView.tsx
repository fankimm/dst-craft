"use client";

import { useMemo } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import type { CharacterSkillTree, SkillNode } from "@/data/skill-trees/types";
import { characters } from "@/data/characters";
import { characterName, t, type Locale, type TranslationKey } from "@/lib/i18n";
import { skillTranslations, groupTranslations } from "@/data/skill-trees/translations";
import { linearizeGroup, type LinearNode } from "@/lib/skill-tree-layout";
import { SkillNodeCard } from "./SkillNodeCard";
import { SkillLockIndicator } from "./SkillLockIndicator";

interface Props {
  tree: CharacterSkillTree;
  locale: Locale;
  activatedSkills: Set<string>;
  totalPoints: number;
  maxPoints: number;
  isLearned: (id: string) => boolean;
  canLearn: (id: string) => boolean;
  canUnlearn: (id: string) => boolean;
  onToggle: (id: string) => void;
  onNodeTap: (node: SkillNode) => void;
  manualLocks: Set<string>;
  onToggleManualLock: (id: string) => void;
  onReset: () => void;
}

function isLockNode(node: SkillNode): boolean {
  return !node.icon && (!!node.lockType || !!node.tags?.includes("lock"));
}

function getTitle(id: string, locale: Locale): string {
  const entry = skillTranslations[id];
  if (!entry) return id.replace(/_/g, " ");
  return locale === "ko" ? entry.title.ko : entry.title.en;
}

function getDesc(id: string, locale: Locale): string {
  const entry = skillTranslations[id];
  if (!entry) return "";
  return locale === "ko" ? entry.desc.ko : entry.desc.en;
}

function getGroupLabel(groupId: string, locale: Locale): string {
  const entry = groupTranslations[groupId];
  if (!entry) return groupId;
  return locale === "ko" ? entry.ko : entry.en;
}

// ── Rail segment renderer ──

function RailDot({ color, isLock }: { color: string; isLock: boolean }) {
  return (
    <div className="flex items-stretch shrink-0 w-7">
      <div className="relative w-7">
        {/* Vertical line */}
        <div
          className="absolute left-[13px] top-0 bottom-0 w-0.5"
          style={{ backgroundColor: `${color}4d` }}
        />
        {/* Junction */}
        {isLock ? (
          <div className="absolute left-[10px] top-1/2 -translate-y-1/2">
            <div className="size-[8px] rotate-45" style={{ backgroundColor: `${color}40`, border: `1.5px solid ${color}` }} />
          </div>
        ) : (
          <div className="absolute left-[9px] top-1/2 -translate-y-1/2">
            <div className="size-[10px] rounded-full" style={{ backgroundColor: `${color}80`, border: `2px solid ${color}` }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Merge indicator ──

function MergeIndicator({ parentIds, locale, color }: { parentIds: string[]; locale: Locale; color: string }) {
  if (parentIds.length <= 1) return null;
  const sep = locale === "ko" ? " 또는 " : " or ";
  const parentNames = parentIds.map((id) => `"${getTitle(id, locale)}"`).join(sep);
  const label = locale === "ko"
    ? `${parentNames} 습득 필요`
    : `Requires ${parentNames}`;
  return (
    <div className="flex items-center" style={{ minHeight: 28 }}>
      <div className="shrink-0 w-7 relative">
        <div className="absolute left-[13px] top-0 bottom-0 w-0.5" style={{ backgroundColor: `${color}4d` }} />
      </div>
      <div className="text-[10px] text-muted-foreground px-2 py-0.5 truncate">
        ↑ {label}
      </div>
    </div>
  );
}

export function SkillTreeView({
  tree,
  locale,
  activatedSkills,
  totalPoints,
  isLearned,
  canLearn,
  onToggle,
  onNodeTap,
  manualLocks,
  onToggleManualLock,
  onReset,
}: Props) {
  const char = characters.find((c) => c.id === tree.characterId);

  // Group and linearize nodes
  const groupedLinear = useMemo(() => {
    const groups = new Map<string, SkillNode[]>();
    for (const node of tree.nodes) {
      const existing = groups.get(node.group) ?? [];
      existing.push(node);
      groups.set(node.group, existing);
    }
    return tree.groups.map((g) => ({
      group: g,
      items: linearizeGroup(groups.get(g.id) ?? []),
    }));
  }, [tree]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/80">
        {char && (
          <Image
            src={`/images/category-icons/characters/${char.portrait}.png`}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {char ? characterName(char, locale) : tree.characterId}
          </h2>
          <p className="text-xs text-muted-foreground">
            {locale === "ko"
              ? `습득 ${totalPoints} · 남은 포인트 ${15 - totalPoints}`
              : `Learned ${totalPoints} · ${15 - totalPoints} points left`}
          </p>
        </div>
        {totalPoints > 0 && (
          <button
            onClick={onReset}
            className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-surface transition-colors touch-manipulation"
          >
            <RotateCcw className="size-3.5" />
            {t(locale, "skills_reset" as TranslationKey)}
          </button>
        )}
      </div>

      {/* Scrollable tree */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain" data-scroll-container="">
        <div className="max-w-2xl mx-auto w-full pb-8">
          {groupedLinear.map(({ group, items }) => (
            <div key={group.id} className="mt-3 first:mt-2">
              {/* Group header */}
              <div className="flex items-center gap-2 px-4 py-1.5">
                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {getGroupLabel(group.id, locale)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Nodes */}
              <div className="px-2">
                {items.map((item, i) => {

                  if (item.isLock && item.node.lockType) {
                    // Lock gate
                    const satisfied = (() => {
                      switch (item.node.lockType.type) {
                        case "skill_count": {
                          let count = 0;
                          for (const id of activatedSkills) {
                            const n = tree.nodes.find((x) => x.id === id);
                            if (n?.tags?.includes(item.node.lockType.tag)) count++;
                          }
                          return count >= item.node.lockType.count;
                        }
                        case "total_skills":
                          return activatedSkills.size >= item.node.lockType.count;
                        case "boss_kill":
                          return true;
                        case "no_opposing_faction": {
                          const tag = item.node.lockType.faction === "lunar" ? "shadow_favor" : "lunar_favor";
                          for (const id of activatedSkills) {
                            const n = tree.nodes.find((x) => x.id === id);
                            if (n?.tags?.includes(tag)) return false;
                          }
                          return true;
                        }
                        case "manual":
                          return manualLocks.has(item.node.id);
                        default:
                          return true;
                      }
                    })();

                    return (
                      <div key={item.node.id} className="flex items-center" style={{ minHeight: 44 }}>
                        <RailDot color={group.color} isLock={item.isLock} />
                        <div className="flex-1 min-w-0">
                          <SkillLockIndicator
                            lockType={item.node.lockType}
                            isSatisfied={satisfied}
                            groupColor={group.color}
                            locale={locale}
                            onToggle={item.node.lockType.type === "manual" ? () => onToggleManualLock(item.node.id) : undefined}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (item.isLock) {
                    // Lock without lockType — minimal gate
                    return (
                      <div key={item.node.id} className="flex items-center" style={{ minHeight: 40 }}>
                        <RailDot color={group.color} isLock={item.isLock} />
                        <div className="flex-1 flex items-center gap-2 px-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="inline-block size-2.5 rotate-45 border" style={{ borderColor: group.color, backgroundColor: `${group.color}30` }} />
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      </div>
                    );
                  }

                  // Regular skill node
                  const locked = !canLearn(item.node.id) && !isLearned(item.node.id);
                  return (
                    <div key={item.node.id}>
                      {item.parentIds.length > 1 && (
                        <MergeIndicator parentIds={item.parentIds} locale={locale} color={group.color} />
                      )}
                      <div className="flex items-center" style={{ minHeight: 52 }}>
                        <RailDot color={group.color} isLock={item.isLock} />
                        <div className="flex-1 min-w-0 pr-2">
                          <SkillNodeCard
                            skillId={item.node.id}
                            icon={item.node.icon}
                            title={getTitle(item.node.id, locale)}
                            description={getDesc(item.node.id, locale)}
                            isLearned={isLearned(item.node.id)}
                            isLocked={locked}
                            canLearn={canLearn(item.node.id)}
                            groupColor={group.color}
                            onTap={() => onNodeTap(item.node)}
                            onToggle={() => onToggle(item.node.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
