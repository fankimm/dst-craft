import type { CharacterSkillTree } from "@/data/skill-trees/types";

/**
 * Skill build codec — encodes/decodes activated skills as a compact bitfield.
 *
 * Each character's activatable skill nodes are sorted alphabetically by ID,
 * then represented as a bitfield (1 = activated, 0 = not).
 * The bitfield is encoded as base64url (no padding) for URL sharing.
 *
 * Example: 26 skill nodes → 26 bits → 4 bytes → ~6 chars in URL.
 */

/** Get sorted activatable skill node IDs for deterministic bitfield ordering */
export function getSkillNodeIds(tree: CharacterSkillTree): string[] {
  return tree.nodes
    .filter((n) => {
      const isLock = !n.icon && (!!n.lockType || !!n.tags?.includes("lock"));
      const isInfo = !!n.tags?.includes("infographic");
      return !isLock && !isInfo;
    })
    .map((n) => n.id)
    .sort();
}

/** Encode activated skills as a compact base64url string */
export function encodeBuild(tree: CharacterSkillTree, activated: Set<string>): string {
  const ids = getSkillNodeIds(tree);
  const byteCount = Math.ceil(ids.length / 8);
  const bytes = new Uint8Array(byteCount);

  for (let i = 0; i < ids.length; i++) {
    if (activated.has(ids[i])) {
      bytes[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
    }
  }

  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a base64url string back to a Set of activated skill IDs */
export function decodeBuild(tree: CharacterSkillTree, encoded: string): Set<string> | null {
  try {
    const ids = getSkillNodeIds(tree);

    // Restore standard base64 from base64url
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const result = new Set<string>();
    for (let i = 0; i < ids.length; i++) {
      const byteIdx = Math.floor(i / 8);
      const bitIdx = 7 - (i % 8);
      if (byteIdx < bytes.length && (bytes[byteIdx] & (1 << bitIdx))) {
        result.add(ids[i]);
      }
    }

    return result;
  } catch {
    return null;
  }
}
