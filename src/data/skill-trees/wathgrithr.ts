import type { CharacterSkillTree } from "./types";

export const wathgrithr: CharacterSkillTree = {
  characterId: "wigfrid",
  groups: [
    { id: "songs", color: "#ec4899" },
    { id: "beefalo", color: "#f59e0b" },
    { id: "arsenal", color: "#ef4444" },
    { id: "combat", color: "#f97316" },
    { id: "allegiance", color: "#6b21a8" },
  ],
  nodes: [
    // ── Arsenal: Spear ──
    { id: "wathgrithr_arsenal_spear_1", group: "arsenal", pos: [-56.5, 180], root: true, icon: "wathgrithr_arsenal_spear_1", connects: ["wathgrithr_arsenal_spear_2"], tags: ["arsenal", "spear", "inspirationgain"] },
    { id: "wathgrithr_arsenal_spear_2", group: "arsenal", pos: [-56.5, 142], icon: "wathgrithr_arsenal_spear_2", connects: ["wathgrithr_arsenal_spear_3"], tags: ["arsenal", "spear", "inspirationgain"] },
    { id: "wathgrithr_arsenal_spear_3", group: "arsenal", pos: [-56.5, 104], icon: "wathgrithr_arsenal_spear_3", connects: ["wathgrithr_arsenal_spear_4", "wathgrithr_arsenal_spear_5", "wathgrithr_arsenal_shield_1"], tags: ["arsenal", "spear"] },
    { id: "wathgrithr_arsenal_spear_4", group: "arsenal", pos: [-113.5, 123], icon: "wathgrithr_arsenal_spear_4", tags: ["arsenal", "spear"] },
    { id: "wathgrithr_arsenal_spear_5", group: "arsenal", pos: [-113.5, 85], icon: "wathgrithr_arsenal_spear_5", tags: ["arsenal", "spear"] },

    // ── Arsenal: Helmet ──
    { id: "wathgrithr_arsenal_helmet_1", group: "arsenal", pos: [-16.5, 180], root: true, icon: "wathgrithr_arsenal_helmet_1", connects: ["wathgrithr_arsenal_helmet_2"], tags: ["arsenal", "helmet", "helmetcondition"] },
    { id: "wathgrithr_arsenal_helmet_2", group: "arsenal", pos: [-16.5, 142], icon: "wathgrithr_arsenal_helmet_2", connects: ["wathgrithr_arsenal_helmet_3"], tags: ["arsenal", "helmet", "helmetcondition"] },
    { id: "wathgrithr_arsenal_helmet_3", group: "arsenal", pos: [-16.5, 104], icon: "wathgrithr_arsenal_helmet_3", connects: ["wathgrithr_arsenal_helmet_4", "wathgrithr_arsenal_helmet_5", "wathgrithr_arsenal_shield_1"], tags: ["arsenal", "helmet"] },
    { id: "wathgrithr_arsenal_helmet_4", group: "arsenal", pos: [40.5, 123], icon: "wathgrithr_arsenal_helmet_4", tags: ["arsenal", "helmet"] },
    { id: "wathgrithr_arsenal_helmet_5", group: "arsenal", pos: [40.5, 85], icon: "wathgrithr_arsenal_helmet_5", tags: ["arsenal", "helmet"] },

    // ── Arsenal: Shield ──
    { id: "wathgrithr_arsenal_shield_1", group: "arsenal", pos: [-36.5, 58.5], icon: "wathgrithr_arsenal_shield_1", connects: ["wathgrithr_arsenal_shield_2", "wathgrithr_arsenal_shield_3"], tags: ["arsenal", "shield"] },
    { id: "wathgrithr_arsenal_shield_2", group: "arsenal", pos: [-56.5, 13], icon: "wathgrithr_arsenal_shield_2", tags: ["arsenal", "shield"] },
    { id: "wathgrithr_arsenal_shield_3", group: "arsenal", pos: [-16.5, 13], icon: "wathgrithr_arsenal_shield_3", tags: ["arsenal", "shield"] },

    // ── Beefalo ──
    { id: "wathgrithr_beefalo_1", group: "beefalo", pos: [107, 180], root: true, icon: "wathgrithr_beefalo_1", connects: ["wathgrithr_beefalo_2"], tags: ["beefalo", "beefalodomestication"] },
    { id: "wathgrithr_beefalo_2", group: "beefalo", pos: [107, 142], icon: "wathgrithr_beefalo_2", connects: ["wathgrithr_beefalo_3"], tags: ["beefalo", "beefalobucktime"] },
    { id: "wathgrithr_beefalo_3", group: "beefalo", pos: [107, 104], icon: "wathgrithr_beefalo_3", connects: ["wathgrithr_beefalo_saddle"], tags: ["beefalo", "beefaloinspiration"] },
    { id: "wathgrithr_beefalo_saddle", group: "beefalo", pos: [107, 66], icon: "wathgrithr_beefalo_saddle", tags: ["beefalo", "saddle"] },

    // ── Songs ──
    { id: "wathgrithr_songs_instantsong_cd_lock", group: "songs", pos: [-218, 180], root: true, connects: ["wathgrithr_songs_instantsong_cd"], tags: ["songs", "lock"] },
    { id: "wathgrithr_songs_instantsong_cd", group: "songs", pos: [-180, 180], icon: "wathgrithr_songs_instantsong_cd", tags: ["songs"] },
    { id: "wathgrithr_songs_container_lock", group: "songs", pos: [-218, 142], root: true, connects: ["wathgrithr_songs_container"], tags: ["songs", "lock"] },
    { id: "wathgrithr_songs_container", group: "songs", pos: [-180, 142], icon: "wathgrithr_songs_container", tags: ["songs"] },
    { id: "wathgrithr_songs_revivewarrior_lock", group: "songs", pos: [-218, 104], root: true, connects: ["wathgrithr_songs_revivewarrior"], tags: ["songs", "lock"] },
    { id: "wathgrithr_songs_revivewarrior", group: "songs", pos: [-180, 104], icon: "wathgrithr_songs_revivewarrior", tags: ["songs"] },

    // ── Combat ──
    { id: "wathgrithr_combat_defense", group: "combat", pos: [-196, 25], root: true, icon: "wathgrithr_combat_defense", tags: ["combat"] },

    // ── Allegiance ──
    { id: "wathgrithr_allegiance_lock_1", group: "allegiance", pos: [202, 180], root: true, lockType: { type: "total_skills", count: 12 }, tags: ["allegiance", "lock"] },

    // Shadow
    { id: "wathgrithr_allegiance_shadow_lock_1", group: "allegiance", pos: [178, 141], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, tags: ["allegiance", "lock"] },
    { id: "wathgrithr_allegiance_shadow_lock_2", group: "allegiance", pos: [178, 96], root: true, lockType: { type: "no_opposing_faction", faction: "shadow" }, tags: ["allegiance", "lock"] },
    { id: "wathgrithr_allegiance_shadow", group: "allegiance", pos: [178, 43], icon: "wathgrithr_allegiance_shadow", locks: ["wathgrithr_allegiance_lock_1", "wathgrithr_allegiance_shadow_lock_1", "wathgrithr_allegiance_shadow_lock_2"], tags: ["allegiance", "shadow", "shadow_favor"] },

    // Lunar
    { id: "wathgrithr_allegiance_lunar_lock_1", group: "allegiance", pos: [225, 141], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["allegiance", "lock"] },
    { id: "wathgrithr_allegiance_lunar_lock_2", group: "allegiance", pos: [225, 96], root: true, lockType: { type: "no_opposing_faction", faction: "lunar" }, tags: ["allegiance", "lock"] },
    { id: "wathgrithr_allegiance_lunar", group: "allegiance", pos: [225, 43], icon: "wathgrithr_allegiance_lunar", locks: ["wathgrithr_allegiance_lock_1", "wathgrithr_allegiance_lunar_lock_1", "wathgrithr_allegiance_lunar_lock_2"], tags: ["allegiance", "lunar", "lunar_favor"] },
  ],
};
