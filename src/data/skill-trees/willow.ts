import type { CharacterSkillTree } from "./types";

export const willow: CharacterSkillTree = {
  characterId: "willow",
  groups: [
    { id: "lighter", color: "#f59e0b" },
    { id: "bernie", color: "#ec4899" },
    { id: "allegiance", color: "#6b21a8" },
  ],
  nodes: [
    // ── Lighter: Controlled Burn ──
    { id: "willow_controlled_burn_1", group: "lighter", pos: [-218, 176], root: true, icon: "willow_controlled_burn_1", connects: ["willow_controlled_burn_2"], tags: ["lighter"] },
    { id: "willow_controlled_burn_2", group: "lighter", pos: [-218, 137], icon: "willow_controlled_burn_2", connects: ["willow_controlled_burn_3"], tags: ["lighter"] },
    { id: "willow_controlled_burn_3", group: "lighter", pos: [-218, 98], icon: "willow_controlled_burn_3", tags: ["lighter"] },

    // ── Lighter: Attuned Lighter / Embers ──
    { id: "willow_attuned_lighter", group: "lighter", pos: [-155, 95], root: true, icon: "willow_attuned_lighter", connects: ["willow_embers"], tags: ["lighter"] },
    { id: "willow_embers", group: "lighter", pos: [-155, 56], icon: "willow_embers", connects: ["willow_fire_burst", "willow_fire_ball", "willow_fire_frenzy"], tags: ["lighter"] },
    { id: "willow_fire_burst", group: "lighter", pos: [-226, 13], icon: "willow_fire_burst", tags: ["lighter"] },
    { id: "willow_fire_ball", group: "lighter", pos: [-182, 13], icon: "willow_fire_ball", tags: ["lighter"] },
    { id: "willow_fire_frenzy", group: "lighter", pos: [-138, 13], icon: "willow_fire_frenzy", tags: ["lighter"] },

    // ── Lighter: Light Radius ──
    { id: "willow_lightradius_1", group: "lighter", pos: [-147, 176], root: true, icon: "willow_lightradius_1", connects: ["willow_lightradius_2"], tags: ["lighter"] },
    { id: "willow_lightradius_2", group: "lighter", pos: [-147, 137], icon: "willow_lightradius_2", tags: ["lighter"] },

    // ── Bernie ──
    { id: "willow_bernieregen_1", group: "bernie", pos: [-44, 166], root: true, icon: "willow_bernieregen_1", connects: ["willow_bernieregen_2"], tags: ["bernie", "bernie4", "bernie8"] },
    { id: "willow_bernieregen_2", group: "bernie", pos: [-44, 127], icon: "willow_bernieregen_2", tags: ["bernie", "bernie4", "bernie8"] },
    { id: "willow_berniesanity_1", group: "bernie", pos: [0, 166], root: true, icon: "willow_berniesanity_1", connects: ["willow_berniesanity_2"], tags: ["bernie", "bernie4", "bernie8"] },
    { id: "willow_berniesanity_2", group: "bernie", pos: [0, 127], icon: "willow_berniesanity_2", connects: ["willow_bernieai"], tags: ["bernie", "bernie4", "bernie8"] },
    { id: "willow_bernieai", group: "bernie", pos: [0, 88], icon: "willow_bernieai", tags: ["bernie", "bernie4", "bernie8"] },
    { id: "willow_berniespeed_1", group: "bernie", pos: [44, 166], root: true, icon: "willow_berniespeed_1", connects: ["willow_berniespeed_2"], tags: ["bernie", "bernie4", "bernie8"] },
    { id: "willow_berniespeed_2", group: "bernie", pos: [44, 127], icon: "willow_berniespeed_2", tags: ["bernie", "bernie4", "bernie8"] },

    // ── Bernie Locks ──
    { id: "willow_bernie_lock", group: "bernie", pos: [-45, 84], root: true, lockType: { type: "skill_count", tag: "bernie4", count: 4 }, connects: ["willow_berniehealth_1"], tags: ["lock"] },
    { id: "willow_berniehealth_1", group: "bernie", pos: [-45, 49], icon: "willow_berniehealth_1", connects: ["willow_berniehealth_2"], tags: ["bernie", "bernie8"] },
    { id: "willow_berniehealth_2", group: "bernie", pos: [-45, 14], icon: "willow_berniehealth_2", tags: ["bernie", "bernie8"] },
    { id: "willow_bernie_lock_2", group: "bernie", pos: [43, 84], root: true, lockType: { type: "skill_count", tag: "bernie8", count: 8 }, connects: ["willow_burnignbernie"], tags: ["lock"] },
    { id: "willow_burnignbernie", group: "bernie", pos: [43, 49], icon: "willow_burnignbernie", tags: ["bernie", "bernie4"] },

    // ── Allegiance: Shadow ──
    { id: "willow_allegiance_lock_1", group: "allegiance", pos: [180, 174], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, connects: ["willow_allegiance_shadow_fire", "willow_allegiance_shadow_bernie"], tags: ["allegiance", "lock"] },
    { id: "willow_allegiance_lock_2", group: "allegiance", pos: [146, 144], root: true, lockType: { type: "skill_count", tag: "bernie", count: 6 }, connects: ["willow_allegiance_shadow_bernie"], tags: ["allegiance", "lock"] },
    { id: "willow_allegiance_lock_3", group: "allegiance", pos: [214, 144], root: true, lockType: { type: "skill_count", tag: "lighter", count: 7 }, connects: ["willow_allegiance_shadow_fire"], tags: ["allegiance", "lock"] },
    { id: "willow_allegiance_shadow_fire", group: "allegiance", pos: [214, 109], icon: "willow_allegiance_shadow_fire", locks: ["willow_allegiance_lock_1", "willow_allegiance_lock_3"], tags: ["allegiance", "shadow_favor"] },
    { id: "willow_allegiance_shadow_bernie", group: "allegiance", pos: [146, 109], icon: "willow_allegiance_shadow_bernie", locks: ["willow_allegiance_lock_1", "willow_allegiance_lock_2"], tags: ["allegiance", "shadow_favor"] },

    // ── Allegiance: Lunar ──
    { id: "willow_allegiance_lock_4", group: "allegiance", pos: [180, 73], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, connects: ["willow_allegiance_lunar_fire", "willow_allegiance_lunar_bernie"], tags: ["allegiance", "lock"] },
    { id: "willow_allegiance_lock_5", group: "allegiance", pos: [214, 43], root: true, lockType: { type: "skill_count", tag: "lighter", count: 7 }, connects: ["willow_allegiance_lunar_fire"], tags: ["allegiance", "lock"] },
    { id: "willow_allegiance_lock_6", group: "allegiance", pos: [146, 43], root: true, lockType: { type: "skill_count", tag: "bernie", count: 6 }, connects: ["willow_allegiance_lunar_bernie"], tags: ["allegiance", "lock"] },
    { id: "willow_allegiance_lunar_fire", group: "allegiance", pos: [214, 8], icon: "willow_allegiance_lunar_fire", locks: ["willow_allegiance_lock_4", "willow_allegiance_lock_5"], tags: ["allegiance", "lunar_favor"] },
    { id: "willow_allegiance_lunar_bernie", group: "allegiance", pos: [146, 8], icon: "willow_allegiance_lunar_bernie", locks: ["willow_allegiance_lock_4", "willow_allegiance_lock_6"], tags: ["allegiance", "lunar_favor"] },
  ],
};
