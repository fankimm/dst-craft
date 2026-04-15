import type { CharacterSkillTree } from "./types";

export const wolfgang: CharacterSkillTree = {
  characterId: "wolfgang",
  groups: [
    { id: "might", color: "#ef4444" },
    { id: "training", color: "#f59e0b" },
    { id: "planardamage", color: "#3b82f6" },
    { id: "allegiance", color: "#6b21a8" },
  ],
  nodes: [
    // ── Might: Crit Work ──
    { id: "wolfgang_critwork_1", group: "might", pos: [-218, 170], root: true, icon: "wolfgang_critwork_1", connects: ["wolfgang_critwork_2"], tags: ["might"] },
    { id: "wolfgang_critwork_2", group: "might", pos: [-218, 132], icon: "wolfgang_critwork_2", connects: ["wolfgang_critwork_3"], tags: ["might"] },
    { id: "wolfgang_critwork_3", group: "might", pos: [-218, 94], icon: "wolfgang_critwork_3", tags: ["might"] },

    // ── Training: Auto Gym ──
    { id: "wolfgang_autogym", group: "training", pos: [-131, 170], root: true, icon: "wolfgang_autogym", tags: ["autogym"] },

    // ── Training: Coach & Speed ──
    { id: "wolfgang_normal_coach", group: "training", pos: [-93, 170], root: true, icon: "wolfgang_coach", connects: ["wolfgang_normal_speed"], tags: ["training"] },
    { id: "wolfgang_normal_speed", group: "training", pos: [-93, 132], icon: "wolfgang_speed", tags: ["training"] },

    // ── Training: Dumbbell ──
    { id: "wolfgang_dumbbell_crafting", group: "training", pos: [-55, 170], root: true, icon: "wolfgang_dumbbell_crafting", connects: ["wolfgang_dumbbell_throwing_1"], tags: ["dumbbell_craft"] },
    { id: "wolfgang_dumbbell_throwing_1", group: "training", pos: [-55, 132], icon: "wolfgang_dumbbell_throwing_1", connects: ["wolfgang_dumbbell_throwing_2"], tags: ["dumbbell_throwing"] },
    { id: "wolfgang_dumbbell_throwing_2", group: "training", pos: [-55, 94], icon: "wolfgang_dumbbell_throwing_2", tags: ["dumbbell_throwing"] },

    // ── Training: Overbuff ──
    { id: "wolfgang_overbuff_1", group: "training", pos: [-17, 170], root: true, icon: "wolfgang_overbuff_1", connects: ["wolfgang_overbuff_2"], tags: ["overbuff"] },
    { id: "wolfgang_overbuff_2", group: "training", pos: [-17, 132], icon: "wolfgang_overbuff_2", connects: ["wolfgang_overbuff_3"], tags: ["overbuff"] },
    { id: "wolfgang_overbuff_3", group: "training", pos: [-17, 94], icon: "wolfgang_overbuff_3", connects: ["wolfgang_overbuff_4"], tags: ["overbuff"] },
    { id: "wolfgang_overbuff_4", group: "training", pos: [-17, 56], icon: "wolfgang_overbuff_4", connects: ["wolfgang_overbuff_5"], tags: ["overbuff"] },
    { id: "wolfgang_overbuff_5", group: "training", pos: [-17, 18], icon: "wolfgang_overbuff_5", tags: ["overbuff"] },

    // ── Planar Damage ──
    { id: "wolfgang_planardamage_1", group: "planardamage", pos: [90, 170], root: true, icon: "wolfgang_planardamage_1", connects: ["wolfgang_planardamage_2"], tags: ["planardamage"] },
    { id: "wolfgang_planardamage_2", group: "planardamage", pos: [90, 132], icon: "wolfgang_planardamage_2", connects: ["wolfgang_planardamage_3"], tags: ["planardamage"] },
    { id: "wolfgang_planardamage_3", group: "planardamage", pos: [90, 94], icon: "wolfgang_planardamage_3", connects: ["wolfgang_planardamage_4"], tags: ["planardamage"] },
    { id: "wolfgang_planardamage_4", group: "planardamage", pos: [90, 56], icon: "wolfgang_planardamage_4", connects: ["wolfgang_planardamage_5"], tags: ["planardamage"] },
    { id: "wolfgang_planardamage_5", group: "planardamage", pos: [90, 18], icon: "wolfgang_planardamage_5", tags: ["planardamage"] },

    // ── Allegiance: Locks ──
    { id: "wolfgang_allegiance_lock_1", group: "allegiance", pos: [181, 170], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, connects: ["wolfgang_allegiance_shadow_1"], tags: ["allegiance", "lock"] },
    { id: "wolfgang_allegiance_lock_2", group: "allegiance", pos: [219, 170], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, connects: ["wolfgang_allegiance_lunar_1"], tags: ["allegiance", "lock"] },
    { id: "wolfgang_allegiance_lock_3", group: "allegiance", pos: [181, 132], root: true, lockType: { type: "no_opposing_faction", faction: "shadow" }, connects: ["wolfgang_allegiance_shadow_1"], tags: ["allegiance", "lock"] },
    { id: "wolfgang_allegiance_lock_4", group: "allegiance", pos: [219, 132], root: true, lockType: { type: "no_opposing_faction", faction: "lunar" }, connects: ["wolfgang_allegiance_lunar_1"], tags: ["allegiance", "lock"] },

    // ── Allegiance: Shadow ──
    { id: "wolfgang_allegiance_shadow_1", group: "allegiance", pos: [181, 94], icon: "wolfgang_allegiance_shadow_1", locks: ["wolfgang_allegiance_lock_1", "wolfgang_allegiance_lock_3"], connects: ["wolfgang_allegiance_shadow_2"], tags: ["allegiance", "shadow", "shadow_favor"] },
    { id: "wolfgang_allegiance_shadow_2", group: "allegiance", pos: [181, 56], icon: "wolfgang_allegiance_shadow_2", connects: ["wolfgang_allegiance_shadow_3"], tags: ["allegiance", "shadow", "shadow_favor"] },
    { id: "wolfgang_allegiance_shadow_3", group: "allegiance", pos: [181, 18], icon: "wolfgang_allegiance_shadow_3", tags: ["allegiance", "shadow", "shadow_favor"] },

    // ── Allegiance: Lunar ──
    { id: "wolfgang_allegiance_lunar_1", group: "allegiance", pos: [219, 94], icon: "wolfgang_allegiance_lunar_1", locks: ["wolfgang_allegiance_lock_2", "wolfgang_allegiance_lock_4"], connects: ["wolfgang_allegiance_lunar_2"], tags: ["allegiance", "lunar", "lunar_favor"] },
    { id: "wolfgang_allegiance_lunar_2", group: "allegiance", pos: [219, 56], icon: "wolfgang_allegiance_lunar_2", connects: ["wolfgang_allegiance_lunar_3"], tags: ["allegiance", "lunar", "lunar_favor"] },
    { id: "wolfgang_allegiance_lunar_3", group: "allegiance", pos: [219, 18], icon: "wolfgang_allegiance_lunar_3", tags: ["allegiance", "lunar", "lunar_favor"] },
  ],
};
