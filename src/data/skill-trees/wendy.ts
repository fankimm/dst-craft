import type { CharacterSkillTree } from "./types";

export const wendy: CharacterSkillTree = {
  characterId: "wendy",
  groups: [
    { id: "sisturn_upgrades", color: "#ec4899" },
    { id: "potion_upgrades", color: "#10b981" },
    { id: "avengingghost", color: "#ef4444" },
    { id: "smallghost", color: "#8b5cf6" },
    { id: "ghostflower", color: "#f59e0b" },
    { id: "gravestone", color: "#06b6d4" },
    { id: "ghost_command", color: "#3b82f6" },
    { id: "wendy_alliegience", color: "#6b21a8" },
  ],
  nodes: [
    // ── Sisturn Upgrades ──
    { id: "wendy_sisturn_1", group: "sisturn_upgrades", pos: [103, 173], root: true, icon: "wendy_sisturn_1", connects: ["wendy_sisturn_2"], tags: ["sisturn_upgrades", "sisturn"] },
    { id: "wendy_sisturn_2", group: "sisturn_upgrades", pos: [140, 154], icon: "wendy_sisturn_2", connects: ["wendy_sisturn_3"], tags: ["sisturn_upgrades", "sisturn"] },
    { id: "wendy_sisturn_3", group: "sisturn_upgrades", pos: [176, 133], icon: "wendy_sisturn_3", tags: ["sisturn_upgrades", "sisturn"] },

    // ── Potion Upgrades ──
    { id: "wendy_potion_container", group: "potion_upgrades", pos: [-57, 185], root: true, icon: "wendy_potion_container", connects: ["wendy_potion_revive"], tags: ["potion_upgrades", "potion"] },
    { id: "wendy_potion_revive", group: "potion_upgrades", pos: [-20, 190], icon: "wendy_potion_revive", connects: ["wendy_potion_duration"], tags: ["potion_upgrades", "potion"] },
    { id: "wendy_potion_duration", group: "potion_upgrades", pos: [18, 190], icon: "wendy_potion_duration", connects: ["wendy_potion_yield"], tags: ["potion_upgrades", "potion"] },
    { id: "wendy_potion_yield", group: "potion_upgrades", pos: [57, 185], icon: "wendy_potion_yield", tags: ["potion_upgrades", "potion"] },

    // ── Avenging Ghost ──
    { id: "wendy_avenging_ghost", group: "avengingghost", pos: [-47, 139], root: true, icon: "wendy_avenging_ghost", tags: ["avengingghost"] },

    // ── Small Ghost ──
    { id: "wendy_smallghost_1", group: "smallghost", pos: [-173, 133], root: true, icon: "wendy_smallghost_1", connects: ["wendy_smallghost_2"], tags: ["smallghost"] },
    { id: "wendy_smallghost_2", group: "smallghost", pos: [-138, 154], icon: "wendy_smallghost_2", connects: ["wendy_smallghost_3"], tags: ["smallghost"] },
    { id: "wendy_smallghost_3", group: "smallghost", pos: [-101, 173], icon: "wendy_smallghost_3", tags: ["smallghost"] },

    // ── Ghost Flower ──
    { id: "wendy_ghostflower_butterfly", group: "ghostflower", pos: [-168, 73], root: true, icon: "wendy_ghostflower_butterfly", connects: ["wendy_ghostflower_hat"], tags: ["ghostflower"] },
    { id: "wendy_ghostflower_hat", group: "ghostflower", pos: [-132, 100], icon: "wendy_ghostflower_hat", connects: ["wendy_ghostflower_grave"], tags: ["ghostflower"] },
    { id: "wendy_ghostflower_grave", group: "ghostflower", pos: [-96, 118], icon: "wendy_ghostflower_grave", tags: ["ghostflower"] },

    // ── Gravestone ──
    { id: "wendy_gravestone_1", group: "gravestone", pos: [10, 143], root: true, icon: "wendy_gravestone_1", connects: ["wendy_makegravemounds"], tags: ["gravestone"] },
    { id: "wendy_makegravemounds", group: "gravestone", pos: [49, 136], icon: "wendy_makegravemounds", tags: ["gravestone"] },

    // ── Ghost Command ──
    { id: "wendy_ghostcommand_1", group: "ghost_command", pos: [98, 118], root: true, icon: "wendy_ghostcommand_1", connects: ["wendy_ghostcommand_2"], tags: ["ghost_command"] },
    { id: "wendy_ghostcommand_2", group: "ghost_command", pos: [135, 100], icon: "wendy_ghostcommand_2", connects: ["wendy_ghostcommand_3"], tags: ["ghost_command"] },
    { id: "wendy_ghostcommand_3", group: "ghost_command", pos: [171, 73], icon: "wendy_ghostcommand_3", tags: ["ghost_command"] },

    // ── Allegiance: Shadow ──
    { id: "wendy_shadow_lock_1", group: "wendy_alliegience", pos: [-89, 40], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, tags: ["wendy_alliegience", "allegiance", "lock"] },
    { id: "wendy_shadow_lock_2", group: "wendy_alliegience", pos: [-51, 40], root: true, lockType: { type: "no_opposing_faction", faction: "shadow" }, tags: ["wendy_alliegience", "allegiance", "lock"] },
    { id: "wendy_shadow_1", group: "wendy_alliegience", pos: [-9, 40], icon: "wendy_shadow_1", connects: ["wendy_shadow_2"], locks: ["wendy_shadow_lock_1", "wendy_shadow_lock_2"], tags: ["wendy_alliegience", "allegiance", "shadow", "shadow_favor"] },
    { id: "wendy_shadow_2", group: "wendy_alliegience", pos: [32, 40], icon: "wendy_shadow_2", connects: ["wendy_shadow_3"], tags: ["wendy_alliegience", "allegiance", "shadow", "shadow_favor"] },
    { id: "wendy_shadow_3", group: "wendy_alliegience", pos: [73, 40], icon: "wendy_shadow_3", tags: ["wendy_alliegience", "allegiance", "shadow", "shadow_favor"] },

    // ── Allegiance: Lunar ──
    { id: "wendy_lunar_lock_1", group: "wendy_alliegience", pos: [-89, 78], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["wendy_alliegience", "allegiance", "lock"] },
    { id: "wendy_lunar_lock_2", group: "wendy_alliegience", pos: [-51, 78], root: true, lockType: { type: "no_opposing_faction", faction: "lunar" }, tags: ["wendy_alliegience", "allegiance", "lock"] },
    { id: "wendy_lunar_1", group: "wendy_alliegience", pos: [-9, 78], icon: "wendy_lunar_1", connects: ["wendy_lunar_2"], locks: ["wendy_lunar_lock_1", "wendy_lunar_lock_2"], tags: ["wendy_alliegience", "allegiance", "lunar", "lunar_favor"] },
    { id: "wendy_lunar_2", group: "wendy_alliegience", pos: [32, 78], icon: "wendy_lunar_2", connects: ["wendy_lunar_3"], tags: ["wendy_alliegience", "allegiance", "lunar", "lunar_favor"] },
    { id: "wendy_lunar_3", group: "wendy_alliegience", pos: [73, 78], icon: "wendy_lunar_3", tags: ["wendy_alliegience", "allegiance", "lunar", "lunar_favor"] },
  ],
};
