import type { CharacterSkillTree } from "./types";

export const woodie: CharacterSkillTree = {
  characterId: "woodie",
  groups: [
    { id: "curse", color: "#ef4444" },
    { id: "human", color: "#10b981" },
    { id: "allegiance", color: "#6b21a8" },
  ],
  nodes: [
    // ── Curse: Weremeter ──
    { id: "woodie_curse_weremeter_1", group: "curse", pos: [-205, 172], root: true, icon: "woodie_curse_weremeter_1", connects: ["woodie_curse_weremeter_2"], tags: ["curse", "weremeter"] },
    { id: "woodie_curse_weremeter_2", group: "curse", pos: [-205, 134], icon: "woodie_curse_weremeter_2", connects: ["woodie_curse_weremeter_3"], tags: ["curse", "weremeter"] },
    { id: "woodie_curse_weremeter_3", group: "curse", pos: [-205, 96], icon: "woodie_curse_weremeter_3", tags: ["curse", "weremeter"] },

    // ── Curse: Master Lock ──
    { id: "woodie_curse_master_lock", group: "curse", pos: [-205, 58], root: true, lockType: { type: "skill_count", tag: "curse", count: 6 }, connects: ["woodie_curse_master"], tags: ["curse", "lock"] },
    { id: "woodie_curse_master", group: "curse", pos: [-205, 20], icon: "woodie_curse_master", tags: ["cursemaster"] },

    // ── Curse: Beaver ──
    { id: "woodie_curse_beaver_1", group: "curse", pos: [-140, 172], root: true, icon: "woodie_curse_beaver_1", connects: ["woodie_curse_beaver_2"], tags: ["curse", "beaver"] },
    { id: "woodie_curse_beaver_2", group: "curse", pos: [-140, 134], icon: "woodie_curse_beaver_2", connects: ["woodie_curse_beaver_3"], tags: ["curse", "beaver"] },
    { id: "woodie_curse_beaver_3", group: "curse", pos: [-140, 96], icon: "woodie_curse_beaver_3", connects: ["woodie_curse_beaver_lock"], tags: ["curse", "beaver", "recoilimmune"] },
    { id: "woodie_curse_beaver_lock", group: "curse", pos: [-140, 58], lockType: { type: "skill_count", tag: "beaver", count: 3 }, connects: ["woodie_curse_epic_beaver"], tags: ["curse", "lock"] },
    { id: "woodie_curse_epic_beaver", group: "curse", pos: [-140, 20], icon: "woodie_curse_epic_beaver", tags: ["curse", "beaver_epic"] },

    // ── Curse: Moose ──
    { id: "woodie_curse_moose_1", group: "curse", pos: [-95.5, 172], root: true, icon: "woodie_curse_moose_1", connects: ["woodie_curse_moose_2"], tags: ["curse", "moose"] },
    { id: "woodie_curse_moose_2", group: "curse", pos: [-95.5, 134], icon: "woodie_curse_moose_2", connects: ["woodie_curse_moose_3"], tags: ["curse", "moose"] },
    { id: "woodie_curse_moose_3", group: "curse", pos: [-95.5, 96], icon: "woodie_curse_moose_3", connects: ["woodie_curse_moose_lock"], tags: ["curse", "moose"] },
    { id: "woodie_curse_moose_lock", group: "curse", pos: [-95.5, 58], lockType: { type: "skill_count", tag: "moose", count: 3 }, connects: ["woodie_curse_epic_moose"], tags: ["curse", "lock"] },
    { id: "woodie_curse_epic_moose", group: "curse", pos: [-95.5, 20], icon: "woodie_curse_epic_moose", tags: ["curse", "moose_epic"] },

    // ── Curse: Goose ──
    { id: "woodie_curse_goose_1", group: "curse", pos: [-52, 172], root: true, icon: "woodie_curse_goose_1", connects: ["woodie_curse_goose_2"], tags: ["curse", "goose"] },
    { id: "woodie_curse_goose_2", group: "curse", pos: [-52, 134], icon: "woodie_curse_goose_2", connects: ["woodie_curse_goose_3"], tags: ["curse", "goose"] },
    { id: "woodie_curse_goose_3", group: "curse", pos: [-52, 96], icon: "woodie_curse_goose_3", connects: ["woodie_curse_goose_lock"], tags: ["curse", "goose"] },
    { id: "woodie_curse_goose_lock", group: "curse", pos: [-52, 58], lockType: { type: "skill_count", tag: "goose", count: 3 }, connects: ["woodie_curse_epic_goose"], tags: ["curse", "lock"] },
    { id: "woodie_curse_epic_goose", group: "curse", pos: [-52, 20], icon: "woodie_curse_epic_goose", tags: ["curse", "goose_epic"] },

    // ── Human: Quick Picker ──
    { id: "woodie_human_quickpicker_1", group: "human", pos: [37, 172], root: true, icon: "woodie_human_quickpicker_1", connects: ["woodie_human_quickpicker_2"], tags: ["human", "quickpicker"] },
    { id: "woodie_human_quickpicker_2", group: "human", pos: [37, 136], icon: "woodie_human_quickpicker_2", connects: ["woodie_human_quickpicker_3"], tags: ["human", "quickpicker"] },
    { id: "woodie_human_quickpicker_3", group: "human", pos: [37, 100], icon: "woodie_human_quickpicker_3", tags: ["human", "quickpicker"] },

    // ── Human: Treeguard ──
    { id: "woodie_human_treeguard_1", group: "human", pos: [109, 172], root: true, icon: "woodie_human_treeguard_1", connects: ["woodie_human_treeguard_2"], tags: ["human", "treeguard"] },
    { id: "woodie_human_treeguard_2", group: "human", pos: [109, 136], icon: "woodie_human_treeguard_2", connects: ["woodie_human_treeguard_max"], tags: ["human", "treeguard"] },
    { id: "woodie_human_treeguard_max", group: "human", pos: [109, 100], icon: "woodie_human_treeguard_max", tags: ["human", "treeguard"] },

    // ── Human: Lucy ──
    { id: "woodie_human_lucy_1", group: "human", pos: [73, 52], root: true, icon: "woodie_human_lucy_1", connects: ["woodie_human_lucy_2", "woodie_human_lucy_3"], tags: ["human", "lucy"] },
    { id: "woodie_human_lucy_2", group: "human", pos: [45, 14], icon: "woodie_human_lucy_2", tags: ["human", "lucy"] },
    { id: "woodie_human_lucy_3", group: "human", pos: [104, 14], icon: "woodie_human_lucy_3", tags: ["human", "lucy"] },

    // ── Allegiance ──
    { id: "woodie_allegiance_lock_1", group: "allegiance", pos: [202, 172], root: true, lockType: { type: "total_skills", count: 12 }, tags: ["allegiance", "lock"] },

    // Shadow
    { id: "woodie_allegiance_lock_2", group: "allegiance", pos: [179, 128], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, tags: ["allegiance", "lock"] },
    { id: "woodie_allegiance_lock_4", group: "allegiance", pos: [179, 84], root: true, lockType: { type: "no_opposing_faction", faction: "shadow" }, tags: ["allegiance", "lock"] },
    { id: "woodie_allegiance_shadow", group: "allegiance", pos: [179, 38], icon: "wilson_favor_shadow", locks: ["woodie_allegiance_lock_1", "woodie_allegiance_lock_2", "woodie_allegiance_lock_4"], tags: ["allegiance", "shadow", "shadow_favor"] },

    // Lunar
    { id: "woodie_allegiance_lock_3", group: "allegiance", pos: [226, 128], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["allegiance", "lock"] },
    { id: "woodie_allegiance_lock_5", group: "allegiance", pos: [226, 84], root: true, lockType: { type: "no_opposing_faction", faction: "lunar" }, tags: ["allegiance", "lock"] },
    { id: "woodie_allegiance_lunar", group: "allegiance", pos: [226, 38], icon: "wilson_favor_lunar", locks: ["woodie_allegiance_lock_1", "woodie_allegiance_lock_3", "woodie_allegiance_lock_5"], tags: ["allegiance", "lunar", "lunar_favor"] },
  ],
};
