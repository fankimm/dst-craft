"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { CharacterSkillTree, SkillNode } from "@/data/skill-trees/types";
import { manualLockKey } from "@/lib/skill-tree-keys";

interface UseSkillTreeReturn {
  activatedSkills: Set<string>;
  totalPoints: number;
  maxPoints: number;
  isLearned: (id: string) => boolean;
  canLearn: (id: string) => boolean;
  canUnlearn: (id: string) => boolean;
  canUnlockManualLock: (lockId: string) => boolean;
  toggleSkill: (id: string) => void;
  resetAll: () => void;
  loadBuild: (skills: Set<string>) => void;
}

/** Build a map from node ID → node for quick lookups */
function buildNodeMap(tree: CharacterSkillTree): Map<string, SkillNode> {
  return new Map(tree.nodes.map((n) => [n.id, n]));
}

/** Build a reverse map: child ID → parent IDs (nodes that have this child in connects[]) */
function buildParentMap(tree: CharacterSkillTree): Map<string, string[]> {
  const parents = new Map<string, string[]>();
  for (const node of tree.nodes) {
    if (node.connects) {
      for (const childId of node.connects) {
        const existing = parents.get(childId) ?? [];
        existing.push(node.id);
        parents.set(childId, existing);
      }
    }
  }
  return parents;
}

/** Build a reverse map: node ID → downstream dependents (nodes that require this one) */
function buildDependentMap(tree: CharacterSkillTree): Map<string, string[]> {
  const deps = new Map<string, string[]>();
  for (const node of tree.nodes) {
    // If node has locks, each lock is a dependency
    if (node.locks) {
      for (const lockId of node.locks) {
        const existing = deps.get(lockId) ?? [];
        existing.push(node.id);
        deps.set(lockId, existing);
      }
    }
  }
  // Also: if node A connects to B, then A is a dependency of B
  for (const node of tree.nodes) {
    if (node.connects) {
      for (const childId of node.connects) {
        const existing = deps.get(node.id) ?? [];
        existing.push(childId);
        deps.set(node.id, existing);
      }
    }
  }
  return deps;
}

/** Count activated skills that have a given tag */
function countTag(tag: string, activated: Set<string>, nodeMap: Map<string, SkillNode>): number {
  let count = 0;
  for (const id of activated) {
    const node = nodeMap.get(id);
    if (node?.tags?.includes(tag)) count++;
  }
  return count;
}

/** Check if a lock/gate node's condition is satisfied */
function isLockSatisfied(
  node: SkillNode,
  activated: Set<string>,
  nodeMap: Map<string, SkillNode>,
  manualLocks?: Set<string>,
): boolean {
  if (!node.lockType) return true;

  switch (node.lockType.type) {
    case "skill_count":
      return countTag(node.lockType.tag, activated, nodeMap) >= node.lockType.count;
    case "total_skills":
      return activated.size >= node.lockType.count;
    case "boss_kill": {
      const bossOk = manualLocks?.has(manualLockKey(node.lockType, node.id)) ?? false;
      if (!bossOk) return false;
      // Optional mutual exclusion: must have 0 opposing-faction skills.
      if (node.lockType.excludes) {
        const opposingTag = node.lockType.excludes === "lunar" ? "lunar_favor" : "shadow_favor";
        if (countTag(opposingTag, activated, nodeMap) > 0) return false;
      }
      return true;
    }
    case "manual":
      return manualLocks?.has(manualLockKey(node.lockType, node.id)) ?? false;
    case "no_opposing_faction": {
      const opposingTag = node.lockType.faction === "lunar" ? "shadow_favor" : "lunar_favor";
      return countTag(opposingTag, activated, nodeMap) === 0;
    }
    case "disabled":
      return false;
    default:
      return true;
  }
}

/** Check if a node is a lock/gate node */
function isLockNode(node: SkillNode): boolean {
  return !node.icon && (!!node.lockType || !!node.tags?.includes("lock"));
}

export function useSkillTree(tree: CharacterSkillTree | null, manualLocks?: Set<string>): UseSkillTreeReturn {
  const [activatedSkills, setActivatedSkills] = useState<Set<string>>(new Set());

  const nodeMap = useMemo(() => tree ? buildNodeMap(tree) : new Map<string, SkillNode>(), [tree]);
  const parentMap = useMemo(() => tree ? buildParentMap(tree) : new Map<string, string[]>(), [tree]);
  const dependentMap = useMemo(() => tree ? buildDependentMap(tree) : new Map<string, string[]>(), [tree]);

  // Count non-lock, non-infographic nodes as max points
  const maxPoints = useMemo(() => {
    if (!tree) return 0;
    return tree.nodes.filter((n) => !isLockNode(n) && !n.tags?.includes("infographic")).length;
  }, [tree]);

  // Load from localStorage when tree changes
  useEffect(() => {
    if (!tree) { setActivatedSkills(new Set()); return; }
    const key = `dst:skills:${tree.characterId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        // Validate: only keep IDs that still exist in the tree
        const valid = ids.filter((id) => nodeMap.has(id));
        setActivatedSkills(new Set(valid));
        return;
      }
    } catch { /* ignore */ }
    setActivatedSkills(new Set());
  }, [tree, nodeMap]);

  // Save to localStorage when activated skills change
  useEffect(() => {
    if (!tree) return;
    const key = `dst:skills:${tree.characterId}`;
    if (activatedSkills.size === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify([...activatedSkills]));
    }
  }, [tree, activatedSkills]);

  const isLearned = useCallback(
    (id: string) => activatedSkills.has(id),
    [activatedSkills],
  );

  const canLearn = useCallback(
    (id: string) => {
      if (!tree) return false;
      if (activatedSkills.has(id)) return false;

      const node = nodeMap.get(id);
      if (!node) return false;
      if (isLockNode(node)) return false;
      if (node.tags?.includes("infographic")) return false;

      // Check skill point limit (max 15)
      const currentPoints = [...activatedSkills].filter((sid) => {
        const n = nodeMap.get(sid);
        return n && !isLockNode(n);
      }).length;
      if (currentPoints >= 15) return false;

      // Check parent requirement (OR gate): at least one parent must be activated
      // (or satisfied, for lock parents), OR node must be root
      if (node.root) {
        // Root nodes have no parent requirement via connects
      } else {
        const parents = parentMap.get(id);
        if (parents && parents.length > 0) {
          const hasActiveParent = parents.some((pid) => {
            if (activatedSkills.has(pid)) return true;
            const parentNode = nodeMap.get(pid);
            if (parentNode && isLockNode(parentNode)) {
              return isLockSatisfied(parentNode, activatedSkills, nodeMap, manualLocks);
            }
            return false;
          });
          if (!hasActiveParent) return false;
        }
      }

      // Check locks (AND gate): all lock dependencies must be satisfied
      if (node.locks) {
        for (const lockId of node.locks) {
          const lockNode = nodeMap.get(lockId);
          if (!lockNode) return false;
          if (!isLockSatisfied(lockNode, activatedSkills, nodeMap, manualLocks)) return false;
        }
      }

      return true;
    },
    [tree, activatedSkills, nodeMap, parentMap, manualLocks],
  );

  const canUnlearn = useCallback(
    (id: string) => {
      if (!activatedSkills.has(id)) return false;

      const node = nodeMap.get(id);
      if (!node) return false;

      // Check: no downstream non-lock nodes that are activated depend solely on this
      // For connects: if this node is the ONLY active parent of a child, can't unlearn
      if (node.connects) {
        for (const childId of node.connects) {
          if (!activatedSkills.has(childId)) continue;
          // Check if child has other active parents
          const childParents = parentMap.get(childId);
          if (!childParents) continue;
          const otherActiveParents = childParents.filter(
            (pid) => pid !== id && activatedSkills.has(pid),
          );
          if (otherActiveParents.length === 0) return false;
        }
      }

      // Check lock-based dependents: nodes that lock on this node's group tags
      // If unlearning would break a lock condition for an activated downstream node
      const depIds = dependentMap.get(id);
      if (depIds) {
        for (const depId of depIds) {
          if (!activatedSkills.has(depId)) continue;
          const depNode = nodeMap.get(depId);
          if (!depNode || isLockNode(depNode)) continue;
          // Check if this dep's locks would still be satisfied without this skill
          if (depNode.locks) {
            const simulated = new Set(activatedSkills);
            simulated.delete(id);
            for (const lockId of depNode.locks) {
              const lockNode = nodeMap.get(lockId);
              if (lockNode && !isLockSatisfied(lockNode, simulated, nodeMap, manualLocks)) {
                return false;
              }
            }
          }
        }
      }

      return true;
    },
    [activatedSkills, nodeMap, parentMap, dependentMap, manualLocks],
  );

  const canUnlockManualLock = useCallback(
    (lockId: string) => {
      if (!tree) return true;
      const lockNode = nodeMap.get(lockId);
      if (!lockNode?.lockType) return true;
      const key = manualLockKey(lockNode.lockType, lockNode.id);
      if (!manualLocks?.has(key)) return true; // already off — toggle would turn ON
      const simulated = new Set(manualLocks);
      simulated.delete(key);
      // Verify every activated skill still satisfies its parent requirement + AND locks
      for (const skillId of activatedSkills) {
        const node = nodeMap.get(skillId);
        if (!node || isLockNode(node)) continue;
        // Parent OR gate
        if (!node.root) {
          const parents = parentMap.get(skillId);
          if (parents && parents.length > 0) {
            const ok = parents.some((pid) => {
              if (activatedSkills.has(pid)) return true;
              const pn = nodeMap.get(pid);
              if (pn && isLockNode(pn)) {
                return isLockSatisfied(pn, activatedSkills, nodeMap, simulated);
              }
              return false;
            });
            if (!ok) return false;
          }
        }
        // Locks AND gate
        if (node.locks) {
          for (const lId of node.locks) {
            const ln = nodeMap.get(lId);
            if (ln && !isLockSatisfied(ln, activatedSkills, nodeMap, simulated)) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [tree, activatedSkills, manualLocks, nodeMap, parentMap],
  );

  const toggleSkill = useCallback(
    (id: string) => {
      if (activatedSkills.has(id)) {
        if (!canUnlearn(id)) return;
        setActivatedSkills((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        if (!canLearn(id)) return;
        setActivatedSkills((prev) => new Set(prev).add(id));
      }
    },
    [activatedSkills, canLearn, canUnlearn],
  );

  const resetAll = useCallback(() => {
    setActivatedSkills(new Set());
  }, []);

  const loadBuild = useCallback(
    (skills: Set<string>) => {
      if (!tree) return;
      const valid = new Set([...skills].filter((id) => nodeMap.has(id)));
      setActivatedSkills(valid);
    },
    [tree, nodeMap],
  );

  return {
    activatedSkills,
    totalPoints: useMemo(
      () => [...activatedSkills].filter((id) => {
        const n = nodeMap.get(id);
        return n && !isLockNode(n);
      }).length,
      [activatedSkills, nodeMap],
    ),
    maxPoints,
    isLearned,
    canLearn,
    canUnlearn,
    canUnlockManualLock,
    toggleSkill,
    resetAll,
    loadBuild,
  };
}
