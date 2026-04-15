"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSkillTree } from "@/hooks/use-skill-tree";
import { t, characterName, type Locale, type TranslationKey } from "@/lib/i18n";
import { characters } from "@/data/characters";
import { skillTrees, CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import { skillTranslations } from "@/data/skill-trees/translations";
import type { SkillNode } from "@/data/skill-trees/types";
import type { UnlockRequirement } from "./SkillDetailSheet";
import { cn } from "@/lib/utils";
import { SkillCharacterGrid } from "./SkillCharacterGrid";
import { SkillTreeView } from "./SkillTreeView";
import { SkillDetailSheet } from "./SkillDetailSheet";
import { DetailPanel } from "@/components/ui/DetailPanel";

interface Props {
  onViewCraftingItem?: (itemId: string) => void;
}

function readSkillUrlState() {
  if (typeof window === "undefined") return { char: null as string | null };
  const params = new URLSearchParams(window.location.search);
  return { char: params.get("char") };
}

export function SkillSimulatorApp({ onViewCraftingItem }: Props) {
  const { resolvedLocale } = useSettings();
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  // Manual lock state (for lockType: "manual" nodes) — must be before useSkillTree
  const [manualLocks, setManualLocks] = useState<Set<string>>(new Set());

  const tree = selectedChar ? skillTrees[selectedChar] ?? null : null;
  const {
    activatedSkills,
    totalPoints,
    maxPoints,
    isLearned,
    canLearn,
    canUnlearn,
    toggleSkill,
    resetAll,
  } = useSkillTree(tree, manualLocks);

  const slideClass = useSlideAnimation(selectedChar, (v) => v === null);
  const { panelItem: panelNode, panelOpen } = useDetailPanel(selectedNode);

  // Sync from URL on mount
  useEffect(() => {
    const { char } = readSkillUrlState();
    if (char && CHARACTERS_WITH_SKILLS.includes(char)) {
      setSelectedChar(char);
    }
  }, []);

  // Re-tap active tab → go home
  useEffect(() => {
    const handler = () => {
      setSelectedNode(null);
      setSelectedChar(null);
    };
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, []);
  const toggleManualLock = useCallback((nodeId: string) => {
    setManualLocks((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleSelectChar = useCallback((charId: string) => {
    setSelectedChar(charId);
    setManualLocks(new Set());
    const url = `${window.location.pathname}?tab=skills&char=${charId}`;
    window.history.pushState({ _appNav: true }, "", url);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedNode(null);
    setSelectedChar(null);
    const url = `${window.location.pathname}?tab=skills`;
    window.history.pushState({ _appNav: true }, "", url);
  }, []);

  const handleNodeTap = useCallback((node: SkillNode) => {
    // Only open detail for non-lock nodes
    if (node.icon) {
      setSelectedNode(node);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Listen to popstate for browser back
  useEffect(() => {
    const onPop = () => {
      const { char } = readSkillUrlState();
      if (char && CHARACTERS_WITH_SKILLS.includes(char)) {
        setSelectedChar(char);
      } else {
        setSelectedChar(null);
      }
      setSelectedNode(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const charObj = selectedChar ? characters.find((c) => c.id === selectedChar) : null;

  // Compute unlock requirements for selected node
  const nodeRequirements = useMemo((): UnlockRequirement[] | undefined => {
    if (!panelNode || !tree) return undefined;
    const reqs: UnlockRequirement[] = [];
    // Parent skill requirements (nodes whose connects include this node)
    if (!panelNode.root) {
      const parents = tree.nodes.filter((n: SkillNode) => n.connects?.includes(panelNode.id));
      for (const parent of parents) {
        // If parent is a lock node, show its condition description
        const isLock = !parent.icon && (!!parent.lockType || parent.tags?.includes("lock"));
        if (isLock) {
          if (parent.lockType?.type === "manual") {
            reqs.push({
              type: "lock_gate",
              label: resolvedLocale === "ko" ? parent.lockType.desc_ko : parent.lockType.desc_en,
              satisfied: manualLocks.has(parent.id),
            });
          } else if (parent.lockType) {
            // Other lock types — skip (handled by lock gate section)
            continue;
          }
          continue;
        }
        const parentTitle = skillTranslations[parent.id]
          ? (resolvedLocale === "ko" ? skillTranslations[parent.id].title.ko : skillTranslations[parent.id].title.en)
          : parent.id;
        reqs.push({
          type: "parent_skill",
          label: resolvedLocale === "ko" ? `"${parentTitle}" 습득 필요` : `Requires "${parentTitle}"`,
          satisfied: isLearned(parent.id),
        });
      }
    }

    // Lock gate requirements
    if (panelNode.locks) {
      for (const lockId of panelNode.locks) {
        const lockNode = tree.nodes.find((n: SkillNode) => n.id === lockId);
        if (lockNode?.lockType) {
          let label = "";
          switch (lockNode.lockType.type) {
            case "skill_count":
              label = resolvedLocale === "ko"
                ? `"${lockNode.lockType.tag}" 스킬 ${lockNode.lockType.count}개 습득 필요`
                : `${lockNode.lockType.count} "${lockNode.lockType.tag}" skills required`;
              break;
            case "total_skills":
              label = resolvedLocale === "ko"
                ? `총 ${lockNode.lockType.count}개 스킬 습득 필요`
                : `${lockNode.lockType.count} total skills required`;
              break;
            case "boss_kill":
              label = resolvedLocale === "ko"
                ? `보스 처치 필요 (${lockNode.lockType.boss})`
                : `Boss kill required (${lockNode.lockType.boss})`;
              break;
            case "no_opposing_faction":
              label = resolvedLocale === "ko"
                ? `${lockNode.lockType.faction === "lunar" ? "그림자" : "달"} 성향 스킬 미습득 필요`
                : `No ${lockNode.lockType.faction === "lunar" ? "Shadow" : "Lunar"} faction skills`;
              break;
          }
          reqs.push({
            type: "lock_gate",
            label,
            satisfied: canLearn(panelNode.id),
          });
        }
      }
    }

    return reqs.length > 0 ? reqs : undefined;
  }, [panelNode, tree, resolvedLocale, isLearned, canLearn]);

  // Detail panel
  const detailPanel = panelNode && (
    <DetailPanel open={panelOpen} onClose={handleClosePanel}>
      <SkillDetailSheet
        node={panelNode}
        isLearned={isLearned(panelNode.id)}
        canLearn={canLearn(panelNode.id)}
        canUnlearn={canUnlearn(panelNode.id)}
        groupColor={tree?.groups.find((g: { id: string; color: string }) => g.id === panelNode.group)?.color ?? "#6b7280"}
        locale={resolvedLocale}
        requirements={nodeRequirements}
        onToggle={() => toggleSkill(panelNode.id)}
        onViewItem={onViewCraftingItem}
      />
    </DetailPanel>
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background/80 px-4 py-2.5 shrink-0">
        <nav className="flex items-center gap-1 min-w-0 text-sm">
          {/* Home icon */}
          {selectedChar ? (
            <button onClick={handleGoHome} className="shrink-0 rounded-sm hover:opacity-70 transition-opacity">
              <img src="/images/skill-icons/wilson_alchemy_1.png" alt="" className="size-5 rounded-sm" />
            </button>
          ) : (
            <img src="/images/skill-icons/wilson_alchemy_1.png" alt="" className="size-5 rounded-sm" />
          )}
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          {selectedChar ? (
            <>
              <button onClick={handleGoHome} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                {t(resolvedLocale, "tab_skills" as TranslationKey)}
              </button>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="font-semibold text-foreground truncate">
                {charObj ? characterName(charObj, resolvedLocale) : selectedChar}
              </span>
            </>
          ) : (
            <span className="font-semibold text-foreground truncate">
              {t(resolvedLocale, "tab_skills" as TranslationKey)}
            </span>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-h-0 overflow-hidden", slideClass)}>
        {selectedChar && tree ? (
          <SkillTreeView
            tree={tree}
            locale={resolvedLocale}
            activatedSkills={activatedSkills}
            totalPoints={totalPoints}
            maxPoints={maxPoints}
            isLearned={isLearned}
            canLearn={canLearn}
            canUnlearn={canUnlearn}
            onToggle={toggleSkill}
            onNodeTap={handleNodeTap}
            manualLocks={manualLocks}
            onToggleManualLock={toggleManualLock}
            onReset={resetAll}
          />
        ) : (
          <div className="h-full overflow-y-auto overscroll-contain" data-scroll-container="">
            <SkillCharacterGrid
              locale={resolvedLocale}
              onSelect={handleSelectChar}
            />
          </div>
        )}
      </div>

      {detailPanel}
    </div>
  );
}
