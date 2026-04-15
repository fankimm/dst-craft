import type { LockCondition, SkillNode } from "@/data/skill-trees/types";

/**
 * Derive the storage key for a lock node in the manualLocks set.
 *
 * Locks that represent the same in-game state (e.g. multiple "Fuelweaver killed"
 * gates across different sections of one character's tree) must share a key so
 * toggling one propagates to all of them. lua's lock_open functions check global
 * state (TheGenericKV), so the simulator should mirror that.
 *
 *   - boss_kill   → `boss:<boss>`        (shared per boss across the whole tree)
 *   - manual      → `manual:<node.id>`   (per-task, never shared)
 *   - other types → don't use manualLocks
 */
export function manualLockKey(lockType: LockCondition, nodeId: string): string {
  switch (lockType.type) {
    case "boss_kill":
      return `boss:${lockType.boss}`;
    case "manual":
      return `manual:${nodeId}`;
    default:
      return `id:${nodeId}`;
  }
}

/** Convenience wrapper: returns null for nodes without a manual-lock-bearing lockType. */
export function manualLockKeyForNode(node: SkillNode): string | null {
  if (!node.lockType) return null;
  if (node.lockType.type !== "boss_kill" && node.lockType.type !== "manual") return null;
  return manualLockKey(node.lockType, node.id);
}
