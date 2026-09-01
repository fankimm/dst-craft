"use client";

import { useMemo, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { ClipboardPaste, RotateCcw, Share2, Infinity as InfinityIcon } from "lucide-react";
import type { CharacterSkillTree, SkillNode, LockCondition } from "@/data/skill-trees/types";
import { characters } from "@/data/characters";
import { characterName, characterTitle, t, type Locale, type TranslationKey } from "@/lib/i18n";
import { skillTranslations, groupTranslations } from "@/data/skill-trees/translations";
import { linearizeGroup, type LinearNode } from "@/lib/skill-tree-layout";
import { manualLockKey } from "@/lib/skill-tree-keys";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";
import { SkillNodeCard, type LockRequirement } from "./SkillNodeCard";
import { SkillLockIndicator, LockConditionPill } from "./SkillLockIndicator";
import { Wx78CircuitBoard } from "./Wx78CircuitBoard";
import { Wx78StatusPanel } from "./Wx78StatusPanel";
import { Footer } from "../crafting/Footer";
import { cn } from "@/lib/utils";

type Wx78SubTab = "skills" | "circuits" | "status";

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
  onShare?: () => void;
  onImport?: () => void;
  // WX-78 circuits (lifted up from this component to SkillSimulatorApp)
  circuitCounts?: CircuitCounts;
  onCircuitEquip?: (id: string) => void;
  onCircuitUnequip?: (id: string) => void;
  onCircuitReset?: () => void;
  unlimited?: boolean;
  onToggleUnlimited?: () => void;
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

function getDetails(id: string, locale: Locale): string {
  const entry = skillTranslations[id];
  if (!entry?.details) return "";
  return locale === "ko" ? entry.details.ko : entry.details.en;
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
    case "boss_kill":
      return manualLocks.has(manualLockKey(lockType, lockId));
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
    case "disabled":
      return false;
    case "compound": {
      if (lockType.required_skills) {
        for (const id of lockType.required_skills) if (!activatedSkills.has(id)) return false;
      }
      if (lockType.excluded_skills) {
        for (const id of lockType.excluded_skills) if (activatedSkills.has(id)) return false;
      }
      if (lockType.tag_counts) {
        let sum = 0;
        for (const tag of lockType.tag_counts.tags) {
          for (const id of activatedSkills) {
            const n = nodeMap.get(id);
            if (n?.tags?.includes(tag)) sum++;
          }
        }
        if (sum < lockType.tag_counts.count) return false;
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
  onShare,
  onImport,
  circuitCounts,
  onCircuitEquip,
  onCircuitUnequip,
  onCircuitReset,
  unlimited,
  onToggleUnlimited,
}: Props) {
  const char = characters.find((c) => c.id === tree.characterId);
  const pointsRef = useRef<HTMLDivElement>(null);
  const nodeMap = useMemo(() => new Map(tree.nodes.map((n) => [n.id, n])), [tree.nodes]);
  const isWx78 = tree.characterId === "wx-78";
  const [wx78SubTab, setWx78SubTab] = useState<Wx78SubTab>("skills");
  const counts = circuitCounts ?? {};
  const equip = onCircuitEquip ?? (() => {});
  const unequip = onCircuitUnequip ?? (() => {});
  const resetCircuits = onCircuitReset ?? (() => {});

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
            src={`/images/category-icons/characters/${char.portrait}.webp`}
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
          <div ref={pointsRef} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Image
              src="/images/ui/skill_eye.webp"
              alt=""
              width={16}
              height={16}
              className={cn("size-4", unlimited && "opacity-50")}
            />
            {unlimited ? (
              <>
                <span className="font-semibold text-foreground">∞</span>
                <span>{locale === "ko" ? "제한 해제" : "unlimited"}</span>
                <span className="opacity-60">· {locale === "ko" ? `습득 ${totalPoints}` : `learned ${totalPoints}`}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">{Math.max(0, 15 - totalPoints)}</span>
                <span>{locale === "ko" ? "통찰력 남음" : "insight left"}</span>
                <span className="opacity-60">· {locale === "ko" ? `습득 ${totalPoints}` : `learned ${totalPoints}`}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {onToggleUnlimited && (
            <button
              onClick={onToggleUnlimited}
              title={
                locale === "ko"
                  ? unlimited
                    ? "제한 해제 끄기 (정규 규칙으로 복귀)"
                    : "제한 해제 (통찰력 15·회로 슬롯 캡 무시)"
                  : unlimited
                    ? "Disable unlimited mode"
                    : "Unlimited mode (ignore insight & circuit caps)"
              }
              className={cn(
                "size-8 flex items-center justify-center rounded-md transition-colors touch-manipulation",
                unlimited
                  ? "text-amber-500 bg-amber-500/15 hover:bg-amber-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface",
              )}
            >
              <InfinityIcon className="size-4" />
            </button>
          )}
          {onImport && (
            <button
              onClick={onImport}
              title={t(locale, "skills_import" as TranslationKey)}
              className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-surface transition-colors touch-manipulation"
            >
              <ClipboardPaste className="size-4" />
            </button>
          )}
          {totalPoints > 0 && onShare && (
            <button
              onClick={onShare}
              title={t(locale, "skills_share" as TranslationKey)}
              className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-surface transition-colors touch-manipulation"
            >
              <Share2 className="size-4" />
            </button>
          )}
          {totalPoints > 0 && (
            <button
              onClick={onReset}
              title={t(locale, "skills_reset" as TranslationKey)}
              className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-surface transition-colors touch-manipulation"
            >
              <RotateCcw className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* WX-78 sub-tabs */}
      {isWx78 && (
        <div className="shrink-0 flex border-b border-border bg-background/80">
          {([
            { id: "skills" as const, ko: "스킬트리", en: "Skill Tree", src: "/images/ui/skill_eye.webp" },
            { id: "circuits" as const, ko: "회로판", en: "Circuit Board", src: "/images/game-items/wx78_moduleremover.png" },
            { id: "status" as const, ko: "현황", en: "Status", src: "/images/game-items/scandata.png" },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setWx78SubTab(t.id)}
              className={cn(
                "flex-1 py-2 px-1 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors border-b-2",
                wx78SubTab === t.id
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <Image src={t.src} alt="" width={20} height={20} className="size-5 shrink-0 object-contain" />
              <span className="truncate">{locale === "ko" ? t.ko : t.en}</span>
            </button>
          ))}
        </div>
      )}

      {/* Body — switch by sub-tab for WX-78 */}
      {isWx78 && wx78SubTab === "circuits" ? (
        <Wx78CircuitBoard
          locale={locale}
          activatedSkills={activatedSkills}
          counts={counts}
          onEquip={equip}
          onUnequip={unequip}
          onReset={resetCircuits}
          onViewItem={onViewItem}
          unlimited={unlimited}
        />
      ) : isWx78 && wx78SubTab === "status" ? (
        <Wx78StatusPanel
          locale={locale}
          activatedSkills={activatedSkills}
          counts={counts}
        />
      ) : (
      /* Scrollable tree */
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain" data-scroll-container="">
        <div className="max-w-2xl mx-auto w-full pb-2">
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

            // Group shared locks that serve the same set of skill nodes
            const lockDependents = new Map<string, string[]>();
            for (const item of items) {
              if (item.isLock || !item.node.locks) continue;
              for (const lockId of item.node.locks) {
                if (consumedLocks.has(lockId)) continue;
                const deps = lockDependents.get(lockId) ?? [];
                deps.push(item.node.id);
                lockDependents.set(lockId, deps);
              }
            }
            const lockGroupMap = new Map<string, string[]>();
            const lockToGroupKey = new Map<string, string>();
            for (const [lockId, deps] of lockDependents) {
              const key = [...deps].sort().join(",");
              const grp = lockGroupMap.get(key) ?? [];
              grp.push(lockId);
              lockGroupMap.set(key, grp);
              lockToGroupKey.set(lockId, key);
            }
            const renderedLockGroups = new Set<string>();

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
                    if (consumedLocks.has(item.node.id)) return null;
                    const groupKey = lockToGroupKey.get(item.node.id);
                    if (groupKey && renderedLockGroups.has(groupKey)) return null;
                    if (groupKey) renderedLockGroups.add(groupKey);

                    const groupLockIds = groupKey ? (lockGroupMap.get(groupKey) ?? [item.node.id]) : [item.node.id];

                    if (groupLockIds.length === 1) {
                      const lockType = item.node.lockType;
                      const satisfied = isLockSatisfied(lockType, item.node.id, activatedSkills, manualLocks, nodeMap);
                      const isManual = lockType.type === "manual" || lockType.type === "boss_kill";
                      return (
                        <div key={item.node.id} className="flex items-center mt-2" style={{ minHeight: 44 }}>
                          <div className="flex-1 min-w-0">
                            <SkillLockIndicator
                              lockId={item.node.id}
                              lockType={lockType}
                              isSatisfied={satisfied}
                              locale={locale}
                              onToggle={isManual ? () => onToggleManualLock(item.node.id, handleNoPoints) : undefined}
                            />
                          </div>
                        </div>
                      );
                    }

                    // Grouped locks — render multiple pills in one row
                    return (
                      <div key={item.node.id} className="flex items-center mt-2" style={{ minHeight: 44 }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 px-3 py-1.5">
                            <div className="flex-1 h-px bg-border" />
                            <div className="flex flex-wrap gap-1.5">
                              {groupLockIds.map((lockId) => {
                                const lockNode = nodeMap.get(lockId)!;
                                const lockType = lockNode.lockType!;
                                const satisfied = isLockSatisfied(lockType, lockId, activatedSkills, manualLocks, nodeMap);
                                const isManual = lockType.type === "manual" || lockType.type === "boss_kill";
                                return (
                                  <LockConditionPill
                                    key={lockId}
                                    lockId={lockId}
                                    lockType={lockType}
                                    isSatisfied={satisfied}
                                    locale={locale}
                                    onToggle={isManual ? () => onToggleManualLock(lockId, handleNoPoints) : undefined}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex-1 h-px bg-border" />
                          </div>
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
                            details={getDetails(item.node.id, locale)}
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
          <div className="pt-6">
            <Footer />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
