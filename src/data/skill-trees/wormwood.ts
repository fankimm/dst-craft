import type { CharacterSkillTree } from "./types";

export const wormwood: CharacterSkillTree = {
  characterId: "wormwood",
  groups: [
    { id: "crafting", color: "#10b981" },
    { id: "gathering", color: "#f59e0b" },
    { id: "allegiance1", color: "#6b21a8" },
    { id: "allegiance2", color: "#6b21a8" },
  ],
  nodes: [
    // ── Root (gathering) ──
    { id: "wormwood_identify_plants2", group: "gathering", pos: [7, 20], root: true, icon: "wormwood_identify_plants", connects: ["wormwood_saplingcrafting", "wormwood_mushroomplanter_ratebonus1", "wormwood_blooming_speed1", "wormwood_blooming_farmrange1"], tags: ["gathering"] },

    // ── Crafting: Sapling Branch ──
    { id: "wormwood_saplingcrafting", group: "crafting", pos: [-98, 30], icon: "wormwood_saplingcrafting", connects: ["wormwood_berrybushcrafting"], tags: ["crafting"] },
    { id: "wormwood_berrybushcrafting", group: "crafting", pos: [-148, 30], icon: "wormwood_berrybushcrafting", connects: ["wormwood_reedscrafting", "wormwood_juicyberrybushcrafting"], tags: ["crafting"] },
    { id: "wormwood_juicyberrybushcrafting", group: "crafting", pos: [-168, 78], icon: "wormwood_juicyberrybushcrafting", tags: ["crafting"] },
    { id: "wormwood_reedscrafting", group: "crafting", pos: [-198, 30], icon: "wormwood_reedscrafting", connects: ["wormwood_lureplantbulbcrafting"], tags: ["crafting"] },
    { id: "wormwood_lureplantbulbcrafting", group: "crafting", pos: [-228, 78], icon: "wormwood_lureplantbulbcrafting", tags: ["crafting"] },

    // ── Crafting: Mushroom Planter Branch ──
    { id: "wormwood_mushroomplanter_ratebonus1", group: "crafting", pos: [-28, 85], icon: "wormwood_mushroomplanter_ratebonus1", connects: ["wormwood_mushroomplanter_ratebonus2"], tags: ["crafting"] },
    { id: "wormwood_mushroomplanter_ratebonus2", group: "crafting", pos: [-83, 115], icon: "wormwood_mushroomplanter_ratebonus2", connects: ["wormwood_mushroomplanter_upgrade", "wormwood_syrupcrafting"], tags: ["crafting"] },
    { id: "wormwood_mushroomplanter_upgrade", group: "crafting", pos: [-83, 165], icon: "wormwood_mushroomplanter_upgrade", connects: ["wormwood_moon_cap_eating"], tags: ["crafting"] },
    { id: "wormwood_moon_cap_eating", group: "crafting", pos: [-63, 210], icon: "wormwood_moon_cap_eating", tags: ["crafting"] },
    { id: "wormwood_syrupcrafting", group: "crafting", pos: [-23, 145], icon: "wormwood_syrupcrafting", tags: ["crafting"] },

    // ── Gathering: Blooming Speed ──
    { id: "wormwood_blooming_speed1", group: "gathering", pos: [112, 30], icon: "wormwood_blooming_speed1", connects: ["wormwood_blooming_speed2"], tags: ["gathering", "blooming"] },
    { id: "wormwood_blooming_speed2", group: "gathering", pos: [162, 30], icon: "wormwood_blooming_speed2", connects: ["wormwood_blooming_max_upgrade", "wormwood_blooming_overheatprotection"], tags: ["gathering", "blooming"] },
    { id: "wormwood_blooming_overheatprotection", group: "gathering", pos: [172, 80], icon: "wormwood_blooming_overheatprotection", tags: ["gathering", "blooming"] },
    { id: "wormwood_blooming_max_upgrade", group: "gathering", pos: [212, 30], icon: "wormwood_blooming_speed3", connects: ["wormwood_blooming_photosynthesis"], tags: ["gathering", "blooming"] },
    { id: "wormwood_blooming_photosynthesis", group: "gathering", pos: [227, 80], icon: "wormwood_blooming_photosynthesis", tags: ["gathering", "blooming"] },

    // ── Gathering: Farm Range Branch ──
    { id: "wormwood_blooming_farmrange1", group: "gathering", pos: [62, 99], icon: "wormwood_blooming_farmrange1", connects: ["wormwood_quick_selffertilizer"], tags: ["gathering", "blooming"] },
    { id: "wormwood_quick_selffertilizer", group: "gathering", pos: [102, 135], icon: "wormwood_quick_selffertilizer", connects: ["wormwood_blooming_trapbramble", "wormwood_bugs"], tags: ["gathering", "blooming"] },
    { id: "wormwood_bugs", group: "gathering", pos: [50, 170], icon: "wormwood_bugs", tags: ["gathering", "blooming"] },
    { id: "wormwood_blooming_trapbramble", group: "gathering", pos: [144, 165], icon: "wormwood_blooming_trapbramble", connects: ["wormwood_armor_bramble"], tags: ["gathering", "blooming"] },
    { id: "wormwood_armor_bramble", group: "gathering", pos: [127, 207], icon: "wormwood_armor_bramble", tags: ["gathering", "blooming"] },

    // ── Allegiance 1 (Mutations — left side) ──
    { id: "wormwood_allegiance_lock_lunar_1", group: "allegiance1", pos: [-201, 130], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["allegiance1", "allegiance", "lock"] },
    { id: "wormwood_allegiance_count_lock_1", group: "allegiance1", pos: [-201, 160], lockType: { type: "skill_count", tag: "crafting", count: 5 }, locks: ["wormwood_allegiance_lock_lunar_1"], tags: ["allegiance1", "allegiance", "lock"] },
    { id: "wormwood_allegiance_lunar_mutations_1", group: "allegiance1", pos: [-201, 195], icon: "wormwood_lunar_mutations_1", locks: ["wormwood_allegiance_lock_lunar_1", "wormwood_allegiance_count_lock_1"], connects: ["wormwood_allegiance_lunar_mutations_2", "wormwood_allegiance_lunar_mutations_3"], tags: ["allegiance1", "allegiance", "lunar", "lunar_favor"] },
    { id: "wormwood_allegiance_lunar_mutations_2", group: "allegiance1", pos: [-228, 236], icon: "wormwood_lunar_mutations_2", tags: ["allegiance1", "allegiance", "lunar", "lunar_favor"] },
    { id: "wormwood_allegiance_lunar_mutations_3", group: "allegiance1", pos: [-174, 236], icon: "wormwood_lunar_mutations_3", tags: ["allegiance1", "allegiance", "lunar", "lunar_favor"] },

    // ── Allegiance 2 (Plant Gear — right side) ──
    { id: "wormwood_allegiance_lock_lunar_2", group: "allegiance2", pos: [224.5, 131], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["allegiance2", "allegiance", "lock"] },
    { id: "wormwood_allegiance_count_lock_2", group: "allegiance2", pos: [224.5, 164], lockType: { type: "skill_count", tag: "blooming", count: 5 }, locks: ["wormwood_allegiance_lock_lunar_2"], tags: ["allegiance2", "allegiance", "lock"] },
    { id: "wormwood_allegiance_lunar_plant_gear_1", group: "allegiance2", pos: [224.5, 201], icon: "wormwood_allegiance_lunar_plant_gear_1", locks: ["wormwood_allegiance_lock_lunar_2", "wormwood_allegiance_count_lock_2"], connects: ["wormwood_allegiance_lunar_plant_gear_2"], tags: ["allegiance2", "allegiance", "lunar", "lunar_favor"] },
    { id: "wormwood_allegiance_lunar_plant_gear_2", group: "allegiance2", pos: [224.5, 241], icon: "wormwood_allegiance_lunar_plant_gear_2", tags: ["allegiance2", "allegiance", "lunar", "lunar_favor"] },
  ],
};
