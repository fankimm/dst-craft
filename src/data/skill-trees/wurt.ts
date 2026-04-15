import type { CharacterSkillTree } from "./types";

export const wurt: CharacterSkillTree = {
  characterId: "wurt",
  groups: [
    { id: "amphibian", color: "#06b6d4" },
    { id: "swampmaster", color: "#10b981" },
    { id: "allegiance", color: "#6b21a8" },
  ],
  nodes: [
    // ── Amphibian: Sanity ──
    { id: "wurt_amphibian_sanity_1", group: "amphibian", pos: [-191.5, 172], root: true, icon: "wurt_amphibian_sanity_1", connects: ["wurt_amphibian_sanity_2"], tags: ["amphibian", "wetness_sanity"] },
    { id: "wurt_amphibian_sanity_2", group: "amphibian", pos: [-191.5, 134], icon: "wurt_amphibian_sanity_2", connects: ["wurt_amphibian_temperature"], tags: ["amphibian", "wetness_sanity"] },
    { id: "wurt_amphibian_temperature", group: "amphibian", pos: [-191.5, 96], icon: "wurt_amphibian_temperature", connects: ["wurt_amphibian_thickskin_1", "wurt_amphibian_healing_1"], tags: ["amphibian", "wetness_temperature"] },

    // ── Amphibian: Thick Skin ──
    { id: "wurt_amphibian_thickskin_1", group: "amphibian", pos: [-210.5, 58], icon: "wurt_amphibian_thickskin_1", connects: ["wurt_amphibian_thickskin_2"], tags: ["amphibian", "wetness_defense"] },
    { id: "wurt_amphibian_thickskin_2", group: "amphibian", pos: [-210.5, 20], icon: "wurt_amphibian_thickskin_2", tags: ["amphibian", "wetness_defense", "marsh_wetness"] },

    // ── Amphibian: Healing ──
    { id: "wurt_amphibian_healing_1", group: "amphibian", pos: [-172.5, 58], icon: "wurt_amphibian_healing_1", connects: ["wurt_amphibian_healing_2"], tags: ["amphibian", "wetness_healing"] },
    { id: "wurt_amphibian_healing_2", group: "amphibian", pos: [-172.5, 20], icon: "wurt_amphibian_healing_2", tags: ["amphibian", "wetness_healing", "marsh_wetness"] },

    // ── Swampmaster: Mosquito ──
    { id: "wurt_mosquito_craft_1", group: "swampmaster", pos: [-46.5, 172], root: true, icon: "wurt_mosquito_craft_1", connects: ["wurt_mosquito_craft_2"], tags: ["swampmaser", "mosquito"] },
    { id: "wurt_mosquito_craft_2", group: "swampmaster", pos: [-46.5, 134], icon: "wurt_mosquito_craft_2", connects: ["wurt_mosquito_craft_3"], tags: ["swampmaser", "mosquito"] },
    { id: "wurt_mosquito_craft_3", group: "swampmaster", pos: [-46.5, 96], icon: "wurt_mosquito_craft_3", tags: ["swampmaser", "mosquito"] },

    // ── Swampmaster: Merm King Shoulders/Crown/Trident ──
    { id: "wurt_mermkingshoulders", group: "swampmaster", pos: [5.75, 172], root: true, icon: "wurt_mermkingshoulders", connects: ["wurt_mermkingcrown"], tags: ["swampmaser", "mermking_quest"] },
    { id: "wurt_mermkingcrown", group: "swampmaster", pos: [5.75, 134], icon: "wurt_mermkingcrown", connects: ["wurt_mermkingtrident"], tags: ["swampmaser", "mermking_quest"] },
    { id: "wurt_mermkingtrident", group: "swampmaster", pos: [5.75, 96], icon: "wurt_mermkingtrident", tags: ["swampmaser", "mermking_quest"] },

    // ── Swampmaster: Merm King Hunger ──
    { id: "wurt_merm_king_hunger_1", group: "swampmaster", pos: [58, 172], root: true, icon: "wurt_merm_king_hunger_1", connects: ["wurt_merm_king_hunger_2"], tags: ["swampmaser", "merm_king_max_hunger"] },
    { id: "wurt_merm_king_hunger_2", group: "swampmaster", pos: [58, 134], icon: "wurt_merm_king_hunger_2", connects: ["wurt_merm_king_hunger_3"], tags: ["swampmaser", "merm_king_max_hunger"] },
    { id: "wurt_merm_king_hunger_3", group: "swampmaster", pos: [58, 96], icon: "wurt_merm_king_hunger_3", tags: ["swampmaser", "merm_king_hunger_rate"] },

    // ── Swampmaster: Civilization ──
    { id: "wurt_civ_1", group: "swampmaster", pos: [-32.25, 58], root: true, icon: "wurt_civ_1", connects: ["wurt_civ_1_2"], tags: ["swampmaser", "civ"] },
    { id: "wurt_civ_1_2", group: "swampmaster", pos: [-32.25, 20], icon: "wurt_civ_1_2", tags: ["swampmaser", "civ"] },
    { id: "wurt_civ_2", group: "swampmaster", pos: [5.75, 58], root: true, icon: "wurt_civ_2", connects: ["wurt_civ_2_2"], tags: ["swampmaser", "civ"] },
    { id: "wurt_civ_2_2", group: "swampmaster", pos: [5.75, 20], icon: "wurt_civ_2_2", tags: ["swampmaser", "civ"] },
    { id: "wurt_civ_3", group: "swampmaster", pos: [43.75, 58], root: true, icon: "wurt_civ_3", connects: ["wurt_civ_3_2"], tags: ["swampmaser", "civ"] },
    { id: "wurt_civ_3_2", group: "swampmaster", pos: [43.75, 20], icon: "wurt_civ_3_2", tags: ["swampmaser", "civ"] },

    // ── Swampmaster: Pathfinder ──
    { id: "wurt_pathfinder", group: "swampmaster", pos: [92.2, 39], root: true, icon: "wurt_pathfinder", tags: ["swampmaser", "pathfinder"] },

    // ── Swampmaster: Merm Flee ──
    { id: "wurt_merm_flee", group: "swampmaster", pos: [-80.7, 39], root: true, icon: "wurt_merm_flee", tags: ["swampmaser", "merm_flee"] },

    // ── Allegiance ──
    { id: "wurt_allegiance_lock_1", group: "allegiance", pos: [203.5, 172], root: true, lockType: { type: "total_skills", count: 12 }, tags: ["allegiance", "lock"] },

    // Shadow
    { id: "wurt_allegiance_lock_2", group: "allegiance", pos: [222.5, 134], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, tags: ["allegiance", "lock"] },
    { id: "wurt_allegiance_lock_4", group: "allegiance", pos: [222.5, 96], root: true, lockType: { type: "no_opposing_faction", faction: "shadow" }, tags: ["allegiance", "lock"] },
    { id: "wurt_shadow_allegiance_1", group: "allegiance", pos: [222.5, 58], icon: "wurt_shadow_allegiance_1", locks: ["wurt_allegiance_lock_1", "wurt_allegiance_lock_2", "wurt_allegiance_lock_4"], connects: ["wurt_shadow_allegiance_2"], tags: ["allegiance", "shadow", "shadow_favor"] },
    { id: "wurt_shadow_allegiance_2", group: "allegiance", pos: [222.5, 20], icon: "wurt_shadow_allegiance_2", tags: ["allegiance", "shadow"] },

    // Lunar
    { id: "wurt_allegiance_lock_3", group: "allegiance", pos: [184.5, 134], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["allegiance", "lock"] },
    { id: "wurt_allegiance_lock_5", group: "allegiance", pos: [184.5, 96], root: true, lockType: { type: "no_opposing_faction", faction: "lunar" }, tags: ["allegiance", "lock"] },
    { id: "wurt_lunar_allegiance_1", group: "allegiance", pos: [184.5, 58], icon: "wurt_lunar_allegiance_1", locks: ["wurt_allegiance_lock_1", "wurt_allegiance_lock_3", "wurt_allegiance_lock_5"], connects: ["wurt_lunar_allegiance_2"], tags: ["allegiance", "lunar", "lunar_favor"] },
    { id: "wurt_lunar_allegiance_2", group: "allegiance", pos: [184.5, 20], icon: "wurt_lunar_allegiance_2", tags: ["allegiance", "lunar"] },
  ],
};
