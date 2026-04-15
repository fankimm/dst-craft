import type { CharacterSkillTree } from "./types";

export const winona: CharacterSkillTree = {
  characterId: "winona",
  groups: [
    { id: "wagstaff", color: "#06b6d4" },
    { id: "charlie", color: "#8b5cf6" },
    { id: "midshelf", color: "#f59e0b" },
    { id: "lowshelf", color: "#10b981" },
  ],
  nodes: [
    // ── Low Shelf ──
    { id: "winona_spotlight_heated", group: "lowshelf", pos: [-125, 5], root: true, icon: "winona_spotlight_heated", tags: ["lowshelf"] },
    { id: "winona_spotlight_range", group: "lowshelf", pos: [-75, 5], root: true, icon: "winona_spotlight_range", tags: ["lowshelf"] },
    { id: "winona_portable_structures", group: "lowshelf", pos: [0, 5], root: true, icon: "winona_portable_structures", connects: ["winona_gadget_recharge"], tags: ["lowshelf"] },
    { id: "winona_gadget_recharge", group: "lowshelf", pos: [50, 5], icon: "winona_gadget_recharge", tags: ["lowshelf"] },
    { id: "winona_battery_idledrain", group: "lowshelf", pos: [125, 5], root: true, icon: "winona_battery_idledrain", tags: ["lowshelf"] },

    // ── Low Shelf Lock (lowshelf > 2, i.e. >= 3) ──
    { id: "winona_lowshelf_lock", group: "lowshelf", pos: [-220, 35], root: true, lockType: { type: "skill_count", tag: "lowshelf", count: 3 }, connects: ["winona_catapult_speed_1", "winona_catapult_aoe_1", "winona_battery_efficiency_1"], tags: ["lowshelf", "lock"] },

    // ── Mid Shelf: Catapult Speed ──
    { id: "winona_catapult_speed_1", group: "midshelf", pos: [-100, 65], icon: "winona_catapult_speed_1", connects: ["winona_catapult_speed_2"], tags: ["midshelf"] },
    { id: "winona_catapult_speed_2", group: "midshelf", pos: [-150, 65], icon: "winona_catapult_speed_2", connects: ["winona_catapult_speed_3"], tags: ["midshelf"] },
    { id: "winona_catapult_speed_3", group: "midshelf", pos: [-200, 65], icon: "winona_catapult_speed_3", tags: ["midshelf"] },

    // ── Mid Shelf: Catapult AOE ──
    { id: "winona_catapult_aoe_1", group: "midshelf", pos: [-100, 105], icon: "winona_catapult_aoe_1", connects: ["winona_catapult_aoe_2"], tags: ["midshelf"] },
    { id: "winona_catapult_aoe_2", group: "midshelf", pos: [-150, 105], icon: "winona_catapult_aoe_2", connects: ["winona_catapult_aoe_3"], tags: ["midshelf"] },
    { id: "winona_catapult_aoe_3", group: "midshelf", pos: [-200, 105], icon: "winona_catapult_aoe_3", tags: ["midshelf"] },

    // ── Mid Shelf: Battery Efficiency ──
    { id: "winona_battery_efficiency_1", group: "midshelf", pos: [100, 65], icon: "winona_battery_efficiency_1", connects: ["winona_battery_efficiency_2"], tags: ["midshelf"] },
    { id: "winona_battery_efficiency_2", group: "midshelf", pos: [150, 65], icon: "winona_battery_efficiency_2", connects: ["winona_battery_efficiency_3"], tags: ["midshelf"] },
    { id: "winona_battery_efficiency_3", group: "midshelf", pos: [200, 65], icon: "winona_battery_efficiency_3", tags: ["midshelf"] },

    // ── Mid Shelf: Portable Structures Lock ──
    { id: "winona_portable_structures_lock", group: "midshelf", pos: [0, 85], root: true, connects: ["winona_catapult_volley_1", "winona_catapult_boost_1"], lockType: { type: "manual", desc_ko: "휴대성 스킬 습득 및 위쪽 선반의 스킬 해금 필요", desc_en: "Requires Portability skill and upper shelf skills unlocked" }, tags: ["midshelf", "lock"] },

    // ── Mid Shelf: Volley & Boost ──
    { id: "winona_catapult_volley_1", group: "midshelf", pos: [-35, 65], icon: "winona_catapult_volley_1", locks: ["winona_lowshelf_lock", "winona_portable_structures_lock"], tags: ["midshelf"] },
    { id: "winona_catapult_boost_1", group: "midshelf", pos: [35, 65], icon: "winona_catapult_boost_1", locks: ["winona_lowshelf_lock", "winona_portable_structures_lock"], tags: ["midshelf"] },

    // ── Mid Shelf Lock ──
    { id: "winona_midshelf_lock", group: "midshelf", pos: [-220, 135], root: true, connects: ["winona_shadow_1", "winona_charlie_1", "winona_lunar_1", "winona_wagstaff_1"], lockType: { type: "manual", desc_ko: "휴대성 스킬 습득 시 해금", desc_en: "Requires Portability skill" }, tags: ["midshelf", "lock"] },

    // ── Charlie (Shadow) ──
    { id: "winona_shadow_1", group: "charlie", pos: [-120, 165], icon: "winona_shadow_1", connects: ["winona_shadow_2"], tags: ["charlie"] },
    { id: "winona_shadow_2", group: "charlie", pos: [-110, 205], icon: "winona_shadow_2", tags: ["charlie"] },
    { id: "winona_shadow_3_lock", group: "charlie", pos: [-60, 165], root: true, lockType: { type: "manual", desc_ko: "휴대성 스킬 및 순수한 공포 발전기 스킬 습득 시 해금", desc_en: "Requires Portability + G.E.M.erator skills" }, tags: ["charlie", "lock"] },
    { id: "winona_shadow_3", group: "charlie", pos: [-60, 205], icon: "winona_shadow_3", locks: ["winona_shadow_3_lock", "winona_portable_structures_lock"], tags: ["charlie"] },
    { id: "winona_charlie_1", group: "charlie", pos: [-170, 165], icon: "winona_charlie_1", tags: ["charlie"] },
    { id: "winona_charlie_2_lock", group: "charlie", pos: [-210, 165], root: true, lockType: { type: "manual", desc_ko: "급속충전 스킬 습득 시 해금", desc_en: "Requires Rapid Recharge skill" }, tags: ["charlie", "lock"] },
    { id: "winona_charlie_2", group: "charlie", pos: [-220, 205], icon: "winona_charlie_2", locks: ["winona_charlie_2_lock"], tags: ["charlie"] },

    // ── Wagstaff (Lunar) ──
    { id: "winona_lunar_1", group: "wagstaff", pos: [120, 165], icon: "winona_lunar_1", connects: ["winona_lunar_2"], tags: ["wagstaff"] },
    { id: "winona_lunar_2", group: "wagstaff", pos: [110, 205], icon: "winona_lunar_2", connects: ["winona_lunar_3"], tags: ["wagstaff"] },
    { id: "winona_lunar_3_lock", group: "wagstaff", pos: [60, 165], root: true, lockType: { type: "manual", desc_ko: "휴대성 스킬 및 광휘 발G.E.M.기 스킬 습득 시 해금", desc_en: "Requires Portability + Brightstone G.E.M.erator skills" }, tags: ["wagstaff", "lock"] },
    { id: "winona_lunar_3", group: "wagstaff", pos: [60, 205], icon: "winona_lunar_3", locks: ["winona_lunar_3_lock", "winona_portable_structures_lock"], tags: ["wagstaff"] },
    { id: "winona_wagstaff_1", group: "wagstaff", pos: [170, 165], icon: "winona_wagstaff_1", tags: ["wagstaff"] },
    { id: "winona_wagstaff_2_lock", group: "wagstaff", pos: [210, 165], root: true, lockType: { type: "manual", desc_ko: "와그스태프 협력 스킬 습득 시 해금", desc_en: "Requires Wagstaff Collaboration skill" }, tags: ["wagstaff", "lock"] },
    { id: "winona_wagstaff_2", group: "wagstaff", pos: [220, 205], icon: "winona_wagstaff_2", locks: ["winona_wagstaff_2_lock"], tags: ["wagstaff"] },
  ],
};
