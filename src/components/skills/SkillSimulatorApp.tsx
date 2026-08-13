"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { useSkillTree } from "@/hooks/use-skill-tree";
import { t, characterName, type Locale, type TranslationKey } from "@/lib/i18n";
import { characters } from "@/data/characters";
import { skillTrees, CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import { skillTranslations } from "@/data/skill-trees/translations";
import type { SkillNode } from "@/data/skill-trees/types";
import { manualLockKey, manualLockKeyForNode } from "@/lib/skill-tree-keys";
import { fetchAllSkills, saveCharacterSkills } from "@/lib/favorites-api";
import { cn } from "@/lib/utils";
import { encodeBuild, decodeBuild } from "@/lib/skill-build-codec";
import { useWx78Circuits, encodeCircuits, decodeCircuits } from "@/hooks/use-wx78-circuits";
import { useSkillUnlimited } from "@/hooks/use-skill-unlimited";
import { SkillCharacterGrid } from "./SkillCharacterGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { SkillTreeView } from "./SkillTreeView";

interface Props {
  onViewCraftingItem?: (itemId: string) => void;
}

function readSkillUrlState() {
  if (typeof window === "undefined") return { char: null as string | null, build: null as string | null };
  const params = new URLSearchParams(window.location.search);
  return { char: params.get("char"), build: params.get("b") };
}

function readSkillUnlimitedFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("u") === "1";
}

export function SkillSimulatorApp({ onViewCraftingItem }: Props) {
  const { resolvedLocale } = useSettings();
  const { token } = useAuth();
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Manual lock state (for lockType: "manual" / "boss_kill" nodes) — must be before useSkillTree
  const [manualLocks, setManualLocks] = useState<Set<string>>(new Set());
  const skipLockSaveRef = useRef(false);

  // Load manualLocks from localStorage when character changes
  useEffect(() => {
    if (!selectedChar) return;
    skipLockSaveRef.current = true;
    const key = `dst:skills-locks:${selectedChar}`;
    try {
      const saved = localStorage.getItem(key);
      setManualLocks(saved ? new Set(JSON.parse(saved) as string[]) : new Set());
    } catch { setManualLocks(new Set()); }
  }, [selectedChar]);

  // Save manualLocks to localStorage
  useEffect(() => {
    if (!selectedChar) return;
    if (skipLockSaveRef.current) { skipLockSaveRef.current = false; return; }
    const key = `dst:skills-locks:${selectedChar}`;
    if (manualLocks.size === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify([...manualLocks]));
    }
  }, [selectedChar, manualLocks]);

  // --- Server sync: on login, fetch all skills → localStorage ---
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchAllSkills(token).then(({ skills, locks }) => {
      if (cancelled) return;
      const hasServerData = Object.keys(skills).length > 0 || Object.keys(locks).length > 0;

      if (hasServerData) {
        // Server → localStorage
        for (const [charId, skillIds] of Object.entries(skills)) {
          if (skillIds.length > 0) {
            localStorage.setItem(`dst:skills:${charId}`, JSON.stringify(skillIds));
          } else {
            localStorage.removeItem(`dst:skills:${charId}`);
          }
        }
        for (const [charId, lockKeys] of Object.entries(locks)) {
          if (lockKeys.length > 0) {
            localStorage.setItem(`dst:skills-locks:${charId}`, JSON.stringify(lockKeys));
          } else {
            localStorage.removeItem(`dst:skills-locks:${charId}`);
          }
        }
        // Reload current character's manualLocks if selected
        if (selectedChar && locks[selectedChar]) {
          skipLockSaveRef.current = true;
          setManualLocks(new Set(locks[selectedChar]));
        }
        // Force use-skill-tree to re-read from localStorage
        setRefreshKey((k) => k + 1);
      } else {
        // First login migration: localStorage → server
        for (const charId of CHARACTERS_WITH_SKILLS) {
          const skillsRaw = localStorage.getItem(`dst:skills:${charId}`);
          const locksRaw = localStorage.getItem(`dst:skills-locks:${charId}`);
          if (skillsRaw || locksRaw) {
            const s = skillsRaw ? JSON.parse(skillsRaw) as string[] : [];
            const l = locksRaw ? JSON.parse(locksRaw) as string[] : [];
            saveCharacterSkills(token, charId, s, l).catch(() => {});
          }
        }
      }
    }).catch(() => {});

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const tree = selectedChar ? skillTrees[selectedChar] ?? null : null;

  // Shared build string: read synchronously from URL (ref doesn't affect hydration)
  const sharedBuildRef = useRef<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("b")
      : null,
  );

  const { unlimited, toggle: toggleUnlimited, setUnlimited } = useSkillUnlimited();

  // Apply unlimited flag from URL once on mount (sender's intent carries over)
  const unlimitedFromUrlRef = useRef<boolean | null>(null);
  if (unlimitedFromUrlRef.current === null) {
    unlimitedFromUrlRef.current = readSkillUnlimitedFromUrl();
  }
  const unlimitedAppliedRef = useRef(false);
  useEffect(() => {
    if (unlimitedAppliedRef.current) return;
    if (unlimitedFromUrlRef.current === true && !unlimited) {
      setUnlimited(true);
    }
    unlimitedAppliedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    activatedSkills,
    totalPoints,
    maxPoints,
    isLearned,
    canLearn,
    canUnlearn,
    canUnlockManualLock,
    toggleSkill,
    resetAll,
    loadBuild,
  } = useSkillTree(tree, manualLocks, refreshKey, sharedBuildRef.current, unlimited);

  // WX-78 circuits — lifted up from SkillTreeView so we can include them in share URLs
  const {
    counts: circuitCounts,
    equip: circuitEquip,
    unequip: circuitUnequip,
    reset: circuitReset,
    loadCounts: circuitLoad,
  } = useWx78Circuits();

  // Apply shared circuits from URL once (alongside shared build)
  const sharedCircuitsRef = useRef<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("c")
      : null,
  );
  const circuitsAppliedRef = useRef(false);
  useEffect(() => {
    if (!tree || tree.characterId !== "wx-78") return;
    if (circuitsAppliedRef.current) return;
    if (!sharedCircuitsRef.current) return;
    const decoded = decodeCircuits(sharedCircuitsRef.current);
    if (decoded) {
      circuitsAppliedRef.current = true;
      circuitLoad(decoded);
    }
  }, [tree, circuitLoad]);

  // --- Debounced save to server on skill/lock change ---
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!token || !selectedChar) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveCharacterSkills(token, selectedChar, [...activatedSkills], [...manualLocks]).catch(() => {});
    }, 1000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [token, selectedChar, activatedSkills, manualLocks]);

  const slideClass = useSlideAnimation(selectedChar, (v) => v === null);

  // Sync character from URL on mount
  useEffect(() => {
    const { char } = readSkillUrlState();
    if (char && CHARACTERS_WITH_SKILLS.includes(char)) {
      setSelectedChar(char);
    }
  }, []);

  // When shared build is applied: infer manual locks + show toast
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (!tree || !sharedBuildRef.current || toastShownRef.current) return;
    const decoded = decodeBuild(tree, sharedBuildRef.current);
    if (decoded && decoded.size > 0) {
      toastShownRef.current = true;

      // Infer required manual locks (boss kills etc.) from activated skills
      const requiredLocks = new Set<string>();
      for (const skillId of decoded) {
        const node = tree.nodes.find(n => n.id === skillId);
        if (!node?.locks) continue;
        for (const lockId of node.locks) {
          const lockNode = tree.nodes.find(n => n.id === lockId);
          if (!lockNode) continue;
          const key = manualLockKeyForNode(lockNode);
          if (key) requiredLocks.add(key);
        }
      }
      if (requiredLocks.size > 0) {
        skipLockSaveRef.current = true;
        setManualLocks(requiredLocks);
      }

      window.dispatchEvent(
        new CustomEvent("dst-toast", {
          detail: t(resolvedLocale, "skills_build_loaded" as TranslationKey),
        }),
      );
    }
  }, [tree, resolvedLocale]);

  // Re-tap active tab → go home
  useEffect(() => {
    const handler = () => {
      setSelectedChar(null);
    };
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, []);
  const toggleManualLock = useCallback((nodeId: string, onBlocked?: () => void) => {
    const node = tree?.nodes.find((n) => n.id === nodeId);
    if (!node?.lockType) return;
    const key = manualLockKey(node.lockType, nodeId);
    const currentlyOn = manualLocks.has(key);
    if (currentlyOn && !canUnlockManualLock(nodeId)) {
      onBlocked?.();
      return;
    }
    setManualLocks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, [tree, manualLocks, canUnlockManualLock]);

  const handleSelectChar = useCallback((charId: string) => {
    sharedBuildRef.current = null;
    setSelectedChar(charId);
    const url = `${window.location.pathname}?tab=skills&char=${charId}`;
    window.history.pushState({ _appNav: true }, "", url);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedChar(null);
    const url = `${window.location.pathname}?tab=skills`;
    window.history.pushState({ _appNav: true }, "", url);
  }, []);

  const handleShare = useCallback(async () => {
    if (!tree) return;
    const hasSkills = activatedSkills.size > 0;
    const hasCircuits = tree.characterId === "wx-78"
      && Object.values(circuitCounts).some((n) => n > 0);
    if (!hasSkills && !hasCircuits) return;
    const params = new URLSearchParams({ tab: "skills", char: tree.characterId });
    if (hasSkills) params.set("b", encodeBuild(tree, activatedSkills));
    if (hasCircuits) params.set("c", encodeCircuits(circuitCounts));
    if (unlimited) params.set("u", "1");
    const url = `${window.location.origin}/?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    window.dispatchEvent(
      new CustomEvent("dst-toast", {
        detail: t(resolvedLocale, "skills_share_copied" as TranslationKey),
      }),
    );
  }, [tree, activatedSkills, circuitCounts, resolvedLocale, unlimited]);

  const handleImport = useCallback(async () => {
    const toast = (key: string) =>
      window.dispatchEvent(new CustomEvent("dst-toast", { detail: t(resolvedLocale, key as TranslationKey) }));
    try {
      const text = await navigator.clipboard.readText();
      const url = new URL(text);
      const build = url.searchParams.get("b");
      const circuits = url.searchParams.get("c");
      const char = url.searchParams.get("char");
      const unlim = url.searchParams.get("u") === "1";
      if (!char || !CHARACTERS_WITH_SKILLS.includes(char)) {
        toast("skills_import_invalid");
        return;
      }
      const targetTree = skillTrees[char] ?? null;
      if (!targetTree) { toast("skills_import_invalid"); return; }
      const decoded = build ? decodeBuild(targetTree, build) : new Set<string>();
      const decodedCircuits = circuits ? decodeCircuits(circuits) : null;
      const hasAnything = (decoded && decoded.size > 0) || (decodedCircuits && Object.keys(decodedCircuits).length > 0);
      if (!hasAnything) {
        toast("skills_import_invalid");
        return;
      }
      if (unlim) setUnlimited(true);
      if (char !== selectedChar) {
        sharedBuildRef.current = build;
        sharedCircuitsRef.current = circuits;
        circuitsAppliedRef.current = false;
        setSelectedChar(char);
      } else {
        if (decoded) loadBuild(decoded);
        if (char === "wx-78" && decodedCircuits) circuitLoad(decodedCircuits);
      }
      toast("skills_build_loaded");
    } catch {
      toast("skills_import_failed");
    }
  }, [selectedChar, resolvedLocale, loadBuild, circuitLoad, setUnlimited]);

  // Listen to popstate for browser back
  useEffect(() => {
    const onPop = () => {
      const { char } = readSkillUrlState();
      if (char && CHARACTERS_WITH_SKILLS.includes(char)) {
        setSelectedChar(char);
      } else {
        setSelectedChar(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const charObj = selectedChar ? characters.find((c) => c.id === selectedChar) : null;

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background/80 px-4 py-2.5 shrink-0">
        <nav className="flex items-center gap-1 min-w-0 text-sm">
          {/* Home icon */}
          {selectedChar ? (
            <button onClick={handleGoHome} className="shrink-0 rounded-sm hover:opacity-70 transition-opacity">
              <img src="/images/ui/skill_eye.png" alt="" className="size-5 rounded-sm" />
            </button>
          ) : (
            <img src="/images/ui/skill_eye.png" alt="" className="size-5 rounded-sm" />
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
            manualLocks={manualLocks}
            onToggleManualLock={toggleManualLock}
            onReset={() => { resetAll(); setManualLocks(new Set()); }}
            onViewItem={onViewCraftingItem}
            onShare={handleShare}
            onImport={handleImport}
            circuitCounts={circuitCounts}
            onCircuitEquip={circuitEquip}
            onCircuitUnequip={circuitUnequip}
            onCircuitReset={circuitReset}
            unlimited={unlimited}
            onToggleUnlimited={toggleUnlimited}
          />
        ) : (
          <div className="h-full overflow-y-auto overscroll-contain" data-scroll-container="">
            <AdSlot variant="top" />
            <SkillCharacterGrid
              locale={resolvedLocale}
              onSelect={handleSelectChar}
            />
          </div>
        )}
      </div>
    </div>
  );
}
