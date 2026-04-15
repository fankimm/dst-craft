/**
 * Skill tree linear layout with Git-graph style branching.
 * One node per row. DFS traversal to determine order.
 * Rail indicators for branch/merge points.
 */

import type { SkillNode } from "@/data/skill-trees/types";

// ── Output types ──

export interface LinearNode {
  node: SkillNode;
  depth: number;       // indentation level (0 = main trunk)
  /** Rail connection type for the line ABOVE this node */
  railAbove: "straight" | "branch-start" | "branch-mid" | "branch-end" | "merge" | "none";
  /** IDs of parent nodes (for merge display) */
  parentIds: string[];
  isLock: boolean;
}

function isLockNode(node: SkillNode): boolean {
  return !node.icon && (!!node.lockType || !!node.tags?.includes("lock"));
}

/**
 * Linearize a group's DAG into a flat list.
 * Uses modified topological sort: merge nodes are deferred until all parents are visited.
 * This ensures convergence points (like shield) appear after all their parent chains.
 */
export function linearizeGroup(nodes: SkillNode[]): LinearNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const result: LinearNode[] = [];
  const visited = new Set<string>();

  // Build reverse map: childId → parentIds (within this group only)
  // Includes both connects (OR gate) and locks (AND gate) relationships
  const parentMap = new Map<string, string[]>();
  for (const node of nodes) {
    if (node.connects) {
      for (const childId of node.connects) {
        if (nodeMap.has(childId)) {
          const parents = parentMap.get(childId) ?? [];
          parents.push(node.id);
          parentMap.set(childId, parents);
        }
      }
    }
  }
  // Also add locks relationships (lock → dependent)
  for (const node of nodes) {
    if (node.locks) {
      for (const lockId of node.locks) {
        if (nodeMap.has(lockId)) {
          const parents = parentMap.get(node.id) ?? [];
          if (!parents.includes(lockId)) {
            parents.push(lockId);
            parentMap.set(node.id, parents);
          }
        }
      }
    }
  }

  // Find root nodes
  const roots = nodes
    .filter((n) => n.root || !(parentMap.get(n.id)?.length))
    .sort((a, b) => {
      if (a.pos[1] !== b.pos[1]) return b.pos[1] - a.pos[1];
      return a.pos[0] - b.pos[0];
    });

  // Process queue with deferred merge nodes
  const deferred = new Set<string>();

  function canVisit(nodeId: string): boolean {
    const parents = parentMap.get(nodeId) ?? [];
    // All parents within this group must be visited
    return parents.every((pid) => visited.has(pid));
  }

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    if (!canVisit(nodeId)) {
      deferred.add(nodeId);
      return;
    }

    visited.add(nodeId);
    deferred.delete(nodeId);
    const node = nodeMap.get(nodeId)!;
    const parents = parentMap.get(nodeId) ?? [];

    result.push({
      node,
      depth: 0,
      railAbove: "none",
      parentIds: parents,
      isLock: isLockNode(node),
    });

    // Visit children, sorted by game position
    const children = (node.connects ?? [])
      .map((id) => nodeMap.get(id))
      .filter(Boolean) as SkillNode[];

    children.sort((a, b) => {
      if (a.pos[1] !== b.pos[1]) return b.pos[1] - a.pos[1];
      return a.pos[0] - b.pos[0];
    });

    for (const child of children) {
      visit(child.id);
    }
  }

  for (const root of roots) {
    visit(root.id);
  }

  // Process deferred merge nodes (all parent chains completed)
  let safety = 0;
  while (deferred.size > 0 && safety < 100) {
    safety++;
    let progress = false;
    for (const defId of [...deferred]) {
      if (canVisit(defId)) {
        visit(defId);
        progress = true;
      }
    }
    if (!progress) break;
  }

  // Process any remaining deferred
  for (const defId of [...deferred]) {
    if (!visited.has(defId)) {
      visited.add(defId);
      const node = nodeMap.get(defId)!;
      result.push({
        node,
        depth: 0,
        railAbove: "none",
        parentIds: parentMap.get(defId) ?? [],
        isLock: isLockNode(node),
      });
    }
  }

  // Add any completely disconnected nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      result.push({
        node,
        depth: 0,
        railAbove: "none",
        parentIds: [],
        isLock: isLockNode(node),
      });
    }
  }

  // Post-process: for skills with `locks`, move their EXCLUSIVE lock deps immediately before them
  // Shared locks (referenced by multiple skills) stay in their original position
  const lockRefCount = new Map<string, number>();
  for (const item of result) {
    if (item.node.locks) {
      for (const lockId of item.node.locks) {
        lockRefCount.set(lockId, (lockRefCount.get(lockId) ?? 0) + 1);
      }
    }
  }

  // Identify exclusive locks (only referenced by 1 skill) — defer these
  const exclusiveLocks = new Set<string>();
  for (const [lockId, count] of lockRefCount) {
    if (count <= 1) exclusiveLocks.add(lockId);
  }

  const reordered: LinearNode[] = [];
  const placed = new Set<string>();

  for (const item of result) {
    if (placed.has(item.node.id)) continue;

    // Skip exclusive locks — they'll be placed before their skill
    if (exclusiveLocks.has(item.node.id)) continue;

    // If this node has locks, place its exclusive lock deps right before it
    if (item.node.locks && !item.isLock) {
      for (const lockId of item.node.locks) {
        if (!placed.has(lockId) && exclusiveLocks.has(lockId)) {
          const lockItem = result.find((r) => r.node.id === lockId);
          if (lockItem) {
            reordered.push(lockItem);
            placed.add(lockId);
          }
        }
      }
    }

    reordered.push(item);
    placed.add(item.node.id);
  }

  return reordered;
}
