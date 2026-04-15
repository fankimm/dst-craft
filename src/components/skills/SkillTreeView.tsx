"use client";

import { useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import type { CharacterSkillTree, SkillNode, LockCondition } from "@/data/skill-trees/types";
import { characters } from "@/data/characters";
import { characterName, characterTitle, t, type Locale, type TranslationKey } from "@/lib/i18n";
import { skillTranslations, groupTranslations } from "@/data/skill-trees/translations";
import { linearizeGroup, type LinearNode } from "@/lib/skill-tree-layout";
import { manualLockKey } from "@/lib/skill-tree-keys";
import { SkillNodeCard, type LockRequirement } from "./SkillNodeCard";
import { SkillLockIndicator } from "./SkillLockIndicator";
import { Footer } from "../crafting/Footer";

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
  manualLocks: Set<string>;
  onToggleManualLock: (id: string, onBlocked?: () => void) => void;
  onReset: () => void;
  onViewItem?: (itemId: string) => void;
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

// Rail dots removed — group card border replaces visual grouping

function getPrereq(parentIds: string[], locale: Locale, isLearned: (id: string) => boolean): { label: string; satisfied: boolean } | undefined {
  if (parentIds.length === 0) return undefined;
  const skillParents = parentIds.filter((id) => !!skillTranslations[id]);
  if (skillParents.length === 0) return undefined;
  const satisfied = skillParents.some((id) => isLearned(id));
  const sep = skillParents.length > 1 ? (locale === "ko" ? " 또는 " : " or ") : "";
  const parentNames = skillParents.map((id) => `"${getTitle(id, locale)}"`).join(sep);
  const label = locale === "ko" ? `${parentNames} 습득 필요` : `Requires ${parentNames}`;
  return { label, satisfied };
}

function isLockSatisfied(
  lockType: LockCondition,
  lockId: string,
  activatedSkills: Set<string>,
  manualLocks: Set<string>,
  nodeMap: Map<string, SkillNode>,
): boolean {
  switch (lockType.type) {
    case "skill_count": {
      let count = 0;
      for (const id of activatedSkills) {
        const n = nodeMap.get(id);
        if (n?.tags?.includes(lockType.tag)) count++;
      }
      return count >= lockType.count;
    }
    case "total_skills":
      return activatedSkills.size >= lockType.count;
    case "boss_kill": {
      const bossOk = manualLocks.has(manualLockKey(lockType, lockId));
      if (!bossOk) return false;
      if (lockType.excludes) {
        const opposingTag = lockType.excludes === "lunar" ? "lunar_favor" : "shadow_favor";
        for (const id of activatedSkills) {
          const n = nodeMap.get(id);
          if (n?.tags?.includes(opposingTag)) return false;
        }
      }
      return true;
    }
    case "manual":
      return manualLocks.has(manualLockKey(lockType, lockId));
    case "no_opposing_faction": {
      const tag = lockType.faction === "lunar" ? "shadow_favor" : "lunar_favor";
      for (const id of activatedSkills) {
        const n = nodeMap.get(id);
        if (n?.tags?.includes(tag)) return false;
      }
      return true;
    }
    default:
      return true;
  }
}

export function SkillTreeView({
  tree,
  locale,
  activatedSkills,
  totalPoints,
  isLearned,
  canLearn,
  onToggle,
  manualLocks,
  onToggleManualLock,
  onReset,
  onViewItem,
}: Props) {
  const char = characters.find((c) => c.id === tree.characterId);
  const pointsRef = useRef<HTMLParagraphElement>(null);
  const nodeMap = useMemo(() => new Map(tree.nodes.map((n) => [n.id, n])), [tree.nodes]);

  const handleNoPoints = useCallback(() => {
    const el = pointsRef.current;
    if (!el) return;
    el.classList.remove("animate-shake");
    void el.offsetWidth; // force reflow
    el.classList.add("animate-shake");
  }, []);

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
            {char && characterTitle(char, locale) && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {characterTitle(char, locale)}
              </span>
            )}
          </h2>
          <p ref={pointsRef} className="text-xs text-muted-foreground">
            {locale === "ko"
              ? `습득 ${totalPoints} · 남은 포인트 ${Math.max(0, 15 - totalPoints)}`
              : `Learned ${totalPoints} · ${Math.max(0, 15 - totalPoints)} points left`}
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
          {groupedLinear.map(({ group, items }) => {
            // Count how many skills reference each lock as a parent within this group.
            // Exclusive locks (count === 1) → move inside the skill card.
            // Shared locks (count >= 2) → keep as separate gate row outside.
            const lockRefCount = new Map<string, number>();
            for (const item of items) {
              if (item.isLock) continue;
              for (const pid of item.parentIds) {
                const pnode = nodeMap.get(pid);
                if (pnode && isLockNode(pnode) && pnode.lockType) {
                  lockRefCount.set(pid, (lockRefCount.get(pid) ?? 0) + 1);
                }
              }
            }
            const consumedLocks = new Set<string>();
            for (const [lockId, count] of lockRefCount) {
              if (count === 1) consumedLocks.add(lockId);
            }

            return (
            <div key={group.id} className="mt-3 first:mt-2">
              {/* Group card */}
              <div
                className="mx-3 rounded-lg border-2 overflow-hidden"
                style={{ borderColor: `${group.color}40` }}
              >
                {/* Group header — hide for single-node groups */}
                {items.length > 1 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {getGroupLabel(group.id, locale)}
                    </span>
                  </div>
                ) : (
                  <div className="py-1" />
                )}

                {/* Nodes */}
                <div className="px-1.5 py-1.5 space-y-1.5">
                {items.map((item) => {

                  if (item.isLock && item.node.lockType) {
                    // Skip locks that are moved inside a skill card
                    if (consumedLocks.has(item.node.id)) return null;
                    const lockType = item.node.lockType;
                    const satisfied = isLockSatisfied(lockType, item.node.id, activatedSkills, manualLocks, nodeMap);
                    const isManual = lockType.type === "manual" || lockType.type === "boss_kill";

                    return (
                      <div key={item.node.id} className="flex items-center mt-2" style={{ minHeight: 44 }}>
                        <div className="flex-1 min-w-0">
                          <SkillLockIndicator
                            lockType={lockType}
                            isSatisfied={satisfied}
                            locale={locale}
                            onToggle={isManual ? () => onToggleManualLock(item.node.id, handleNoPoints) : undefined}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (item.isLock) {
                    // Lock without lockType — minimal gate
                    return (
                      <div key={item.node.id} className="flex items-center mt-2" style={{ minHeight: 40 }}>

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
                  const prereq = getPrereq(item.parentIds, locale, isLearned);
                  const lockRequirements: LockRequirement[] = [];
                  for (const pid of item.parentIds) {
                    if (!consumedLocks.has(pid)) continue;
                    const pnode = nodeMap.get(pid);
                    if (!pnode || !pnode.lockType) continue;
                    const lockType = pnode.lockType;
                    const isManual = lockType.type === "manual" || lockType.type === "boss_kill";
                    lockRequirements.push({
                      id: pnode.id,
                      lockType,
                      satisfied: isLockSatisfied(lockType, pnode.id, activatedSkills, manualLocks, nodeMap),
                      onToggle: isManual ? () => onToggleManualLock(pnode.id, handleNoPoints) : undefined,
                    });
                  }

                  return (
                    <div key={item.node.id}>
                      <div className="flex items-center" style={{ minHeight: 52 }}>

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
                            locale={locale}
                            onToggle={() => onToggle(item.node.id)}
                            onViewItem={onViewItem}
                            onNoPoints={handleNoPoints}
                            prereq={prereq}
                            lockRequirements={lockRequirements.length > 0 ? lockRequirements : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
            );
          })}
          <Footer />
        </div>
      </div>
    </div>
  );
}
