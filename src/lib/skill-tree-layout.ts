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
 * Linearize a group's DAG into a flat list with depth/rail info.
 * Uses DFS from root nodes, following connects edges.
 */
export function linearizeGroup(nodes: SkillNode[]): LinearNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const result: LinearNode[] = [];
  const visited = new Set<string>();

  // Build reverse map: childId → parentIds
  const parentMap = new Map<string, string[]>();
  for (const node of nodes) {
    if (node.connects) {
      for (const childId of node.connects) {
        const parents = parentMap.get(childId) ?? [];
        parents.push(node.id);
        parentMap.set(childId, parents);
      }
    }
  }

  // Find root nodes (no parent within this group, or marked root)
  const rootIds = nodes
    .filter((n) => n.root || !(parentMap.get(n.id)?.length))
    .sort((a, b) => {
      // Sort roots: higher Y first (game convention)
      if (a.pos[1] !== b.pos[1]) return b.pos[1] - a.pos[1];
      return a.pos[0] - b.pos[0];
    })
    .map((n) => n.id);

  function dfs(nodeId: string, depth: number) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return;

    const parents = parentMap.get(nodeId) ?? [];
    const isMerge = parents.length > 1;

    result.push({
      node,
      depth,
      railAbove: "none", // will be computed after
      parentIds: parents,
      isLock: isLockNode(node),
    });

    // Follow connects in order (sort children by pos for consistent ordering)
    const children = (node.connects ?? [])
      .map((id) => nodeMap.get(id))
      .filter(Boolean) as SkillNode[];

    children.sort((a, b) => {
      if (a.pos[1] !== b.pos[1]) return b.pos[1] - a.pos[1];
      return a.pos[0] - b.pos[0];
    });

    if (children.length === 1) {
      // Single child: continue at same depth
      dfs(children[0].id, depth);
    } else if (children.length > 1) {
      // Multiple children: branch out
      for (let i = 0; i < children.length; i++) {
        dfs(children[i].id, depth + 1);
      }
    }
  }

  for (const rootId of rootIds) {
    dfs(rootId, 0);
  }

  // Add any unvisited nodes (disconnected)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      result.push({
        node,
        depth: 0,
        railAbove: "none",
        parentIds: parentMap.get(node.id) ?? [],
        isLock: isLockNode(node),
      });
    }
  }

  // Compute rail indicators
  for (let i = 0; i < result.length; i++) {
    const curr = result[i];
    const prev = i > 0 ? result[i - 1] : null;
    const children = curr.node.connects ?? [];
    const isMerge = curr.parentIds.length > 1;

    if (i === 0) {
      curr.railAbove = "none";
    } else if (isMerge) {
      curr.railAbove = "merge";
    } else if (prev && curr.depth > prev.depth) {
      curr.railAbove = "branch-start";
    } else if (prev && curr.depth === prev.depth && curr.depth > 0) {
      // Check if next sibling exists at same depth
      const next = i + 1 < result.length ? result[i + 1] : null;
      if (next && next.depth === curr.depth) {
        curr.railAbove = "branch-mid";
      } else {
        curr.railAbove = "branch-end";
      }
    } else {
      curr.railAbove = "straight";
    }
  }

  return result;
}
