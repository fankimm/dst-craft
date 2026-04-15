"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import type { CharacterSkillTree, SkillNode } from "@/data/skill-trees/types";
import { skillTranslations, groupTranslations } from "@/data/skill-trees/translations";
import { characters } from "@/data/characters";
import { characterName, t, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SkillRail } from "./SkillRail";
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
  // Lock nodes: have lockType, or have "lock" tag with no icon
  return (!node.icon && (!!node.lockType || !!node.tags?.includes("lock")));
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

/** Sort nodes within a group: by y-position descending (game y=high is top), then x */
function sortNodes(nodes: SkillNode[]): SkillNode[] {
  return [...nodes].sort((a, b) => {
    if (a.pos[1] !== b.pos[1]) return b.pos[1] - a.pos[1]; // higher y first
    return a.pos[0] - b.pos[0]; // left to right
  });
}

// Node heights are now dynamic (CSS flex) — no fixed height constant

export function SkillTreeView({
  tree,
  locale,
  activatedSkills,
  totalPoints,
  maxPoints,
  isLearned,
  canLearn,
  canUnlearn,
  onToggle,
  onNodeTap,
  manualLocks,
  onToggleManualLock,
  onReset,
}: Props) {
  const char = characters.find((c) => c.id === tree.characterId);

  // Group nodes by group ID, maintaining group order
  const groupedNodes = useMemo(() => {
    const groups = new Map<string, SkillNode[]>();
    for (const node of tree.nodes) {
      const existing = groups.get(node.group) ?? [];
      existing.push(node);
      groups.set(node.group, existing);
    }
    // Order by tree.groups order
    return tree.groups.map((g) => ({
      group: g,
      nodes: sortNodes(groups.get(g.id) ?? []),
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
          {groupedNodes.map(({ group, nodes }) => (
            <div key={group.id} className="mt-3 first:mt-2">
              {/* Group header */}
              <div className="flex items-center gap-2 px-4 py-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {getGroupLabel(group.id, locale)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Rail + Node cards */}
              <div className="flex px-2">
                {/* SVG Rail */}
                <SkillRail
                  nodes={nodes.map((n) => ({
                    isLock: isLockNode(n),
                    isLearned: isLearned(n.id),
                    canLearn: canLearn(n.id),
                  }))}
                  color={group.color}
                />

                {/* Node cards */}
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                  {nodes.map((node) => {
                    if (isLockNode(node)) {
                      if (node.lockType) {
                        // Evaluate lock satisfaction
                        const satisfied = (() => {
                          switch (node.lockType.type) {
                            case "skill_count": {
                              let count = 0;
                              for (const id of activatedSkills) {
                                const n = tree.nodes.find((x) => x.id === id);
                                if (n?.tags?.includes(node.lockType.tag)) count++;
                              }
                              return count >= node.lockType.count;
                            }
                            case "total_skills":
                              return activatedSkills.size >= node.lockType.count;
                            case "boss_kill":
                              return true;
                            case "no_opposing_faction": {
                              const tag = node.lockType.faction === "lunar" ? "shadow_favor" : "lunar_favor";
                              for (const id of activatedSkills) {
                                const n = tree.nodes.find((x) => x.id === id);
                                if (n?.tags?.includes(tag)) return false;
                              }
                              return true;
                            }
                            case "manual":
                              return manualLocks.has(node.id);
                            default:
                              return true;
                          }
                        })();

                        return (
                          <div key={node.id} style={{ minHeight: 52 }} className="flex items-center">
                            <SkillLockIndicator
                              lockType={node.lockType}
                              isSatisfied={satisfied}
                              groupColor={group.color}
                              locale={locale}
                              onToggle={node.lockType.type === "manual" ? () => onToggleManualLock(node.id) : undefined}
                            />
                          </div>
                        );
                      }
                      // Lock node without lockType: render as a simple gate line (always open in simulator)
                      return (
                        <div key={node.id} style={{ minHeight: 52 }} className="flex items-center px-3">
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 h-px bg-border" />
                            <span
                              className="inline-block size-2.5 rotate-45 border"
                              style={{ borderColor: group.color, backgroundColor: `${group.color}30` }}
                            />
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={node.id} style={{ minHeight: 52 }} className="flex items-center pr-2">
                        <SkillNodeCard
                          skillId={node.id}
                          icon={node.icon}
                          title={getTitle(node.id, locale)}
                          description={getDesc(node.id, locale)}
                          isLearned={isLearned(node.id)}
                          isLocked={!canLearn(node.id) && !isLearned(node.id)}
                          canLearn={canLearn(node.id)}
                          groupColor={group.color}
                          onTap={() => onNodeTap(node)}
                          onToggle={() => onToggle(node.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
