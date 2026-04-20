/** Lock condition for gate nodes */
export type LockCondition =
  | { type: "skill_count"; tag: string; count: number }
  /**
   * Boss kill gate. Optionally combined with mutual exclusion: when `excludes`
   * is set, the lock additionally requires that no skills with the opposing
   * faction tag have been activated. This mirrors lua's combined check pattern
   * (e.g. willow_allegiance_lock_1 — `lunar_favor > 0 → false; else fuelweaver_killed`).
   * Faction values match the tag suffix: "lunar" excludes lunar_favor, "shadow" excludes shadow_favor.
   */
  | { type: "boss_kill"; boss: "fuelweaver" | "celestialchampion"; excludes?: "lunar" | "shadow" }
  | { type: "no_opposing_faction"; faction: "lunar" | "shadow" }
  | { type: "total_skills"; count: number }
  | { type: "manual"; desc_ko: string; desc_en: string }
  | { type: "disabled"; desc_ko: string; desc_en: string };

/** A single node in a character's skill tree */
export interface SkillNode {
  /** Unique ID, e.g. "wilson_torch_1" */
  id: string;
  /** Group/branch this skill belongs to, e.g. "torch" */
  group: string;
  /** Original game canvas position [x, y] — used for ordering */
  pos: [number, number];
  /** True if this is a root node (no parent required) */
  root?: boolean;
  /** Icon filename (without path/ext). undefined = lock/gate node */
  icon?: string;
  /** Child node IDs — at least one parent must be active (OR gate) */
  connects?: string[];
  /** AND-dependency node IDs — all must be satisfied */
  locks?: string[];
  /** Lock/gate condition (only for gate nodes) */
  lockType?: LockCondition;
  /** Tags for counting-based lock evaluation */
  tags?: string[];
}

/** A visual group/branch in the skill tree */
export interface SkillGroup {
  /** Group ID matching SkillNode.group */
  id: string;
  /** Display color (hex) for the rail line */
  color: string;
}

/** Complete skill tree definition for one character */
export interface CharacterSkillTree {
  characterId: string;
  groups: SkillGroup[];
  nodes: SkillNode[];
}
