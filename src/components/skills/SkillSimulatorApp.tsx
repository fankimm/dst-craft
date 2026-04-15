"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSkillTree } from "@/hooks/use-skill-tree";
import { t, characterName, type Locale, type TranslationKey } from "@/lib/i18n";
import { characters } from "@/data/characters";
import { skillTrees, CHARACTERS_WITH_SKILLS } from "@/data/skill-trees";
import type { SkillNode } from "@/data/skill-trees/types";
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
  } = useSkillTree(tree);

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

  const handleSelectChar = useCallback((charId: string) => {
    setSelectedChar(charId);
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

  // Detail panel
  const detailPanel = panelNode && (
    <DetailPanel open={panelOpen} onClose={handleClosePanel}>
      <SkillDetailSheet
        node={panelNode}
        isLearned={isLearned(panelNode.id)}
        canLearn={canLearn(panelNode.id)}
        canUnlearn={canUnlearn(panelNode.id)}
        groupColor={tree?.groups.find((g) => g.id === panelNode.group)?.color ?? "#6b7280"}
        locale={resolvedLocale}
        onToggle={() => toggleSkill(panelNode.id)}
        onViewItem={onViewCraftingItem}
      />
    </DetailPanel>
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Breadcrumb */}
      {selectedChar && (
        <div className="border-b border-border bg-background/80 px-4 py-2.5 shrink-0">
          <div className="flex items-center text-xs text-muted-foreground">
            <button
              onClick={handleGoHome}
              className="hover:text-foreground transition-colors touch-manipulation"
            >
              {t(resolvedLocale, "skills_select_character" as TranslationKey)}
            </button>
            <ChevronRight className="size-3 mx-1" />
            <span className="text-foreground font-medium">
              {charObj ? characterName(charObj, resolvedLocale) : selectedChar}
            </span>
          </div>
        </div>
      )}

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
