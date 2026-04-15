import type { CharacterSkillTree } from "./types";

export const wortox: CharacterSkillTree = {
  characterId: "wortox",
  groups: [
    { id: "nice", color: "#10b981" },
    { id: "naughty", color: "#ef4444" },
    { id: "neutral", color: "#f59e0b" },
    { id: "allegiance", color: "#6b21a8" },
  ],
  nodes: [
    // ── Infographic: Inclination Meter ──
    { id: "wortox_inclination_meter", group: "neutral", pos: [0, 199.9], root: true, icon: "wortox_scales", tags: ["infographic"] },
    { id: "wortox_inclination_nice", group: "neutral", pos: [-176, 228.4], root: true, icon: "wortox_inclination_nice", tags: ["infographic", "lock"] },
    { id: "wortox_inclination_naughty", group: "neutral", pos: [176, 228.4], root: true, icon: "wortox_inclination_naughty", tags: ["infographic", "lock"] },

    // ── Locks ──
    { id: "wortox_lifebringer_lock", group: "nice", pos: [-225, 106], root: true, tags: ["lock"] },
    { id: "wortox_soulprotector_lock", group: "nice", pos: [-175, 95], root: true, tags: ["lock"] },
    { id: "wortox_souldecoy_lock", group: "naughty", pos: [225, 106], root: true, tags: ["lock"] },
    { id: "wortox_thief_lock", group: "naughty", pos: [175, 95], root: true, tags: ["lock"] },

    // ── Nice: Lifebringer ──
    { id: "wortox_lifebringer_1", group: "nice", pos: [-225, 32], root: true, icon: "wortox_lifebringer_1", connects: ["wortox_lifebringer_2"], tags: ["nice", "nice1"] },
    { id: "wortox_lifebringer_2", group: "nice", pos: [-225, 72], icon: "wortox_lifebringer_2", tags: ["nice", "nice1"] },
    { id: "wortox_lifebringer_3", group: "nice", pos: [-225, 140], icon: "wortox_lifebringer_3", locks: ["wortox_lifebringer_lock"], tags: ["nice"] },

    // ── Nice: Soul Protector ──
    { id: "wortox_soulprotector_1", group: "nice", pos: [-175, 21], root: true, icon: "wortox_soulprotector_1", connects: ["wortox_soulprotector_2"], tags: ["nice", "nice1"] },
    { id: "wortox_soulprotector_2", group: "nice", pos: [-175, 61], icon: "wortox_soulprotector_2", tags: ["nice", "nice1"] },
    { id: "wortox_soulprotector_3", group: "nice", pos: [-175, 129], icon: "wortox_soulprotector_3", locks: ["wortox_soulprotector_lock"], connects: ["wortox_soulprotector_4"], tags: ["nice"] },
    { id: "wortox_soulprotector_4", group: "nice", pos: [-175, 169], icon: "wortox_soulprotector_4", tags: ["nice"] },

    // ── Nice: Lifted Spirits ──
    { id: "wortox_liftedspirits_1", group: "nice", pos: [-115, 32], root: true, icon: "wortox_liftedspirits_1", connects: ["wortox_liftedspirits_2"], tags: ["nice", "nice1"] },
    { id: "wortox_liftedspirits_2", group: "nice", pos: [-115, 72], icon: "wortox_liftedspirits_2", connects: ["wortox_liftedspirits_3", "wortox_liftedspirits_4"], tags: ["nice", "nice1"] },
    { id: "wortox_liftedspirits_3", group: "nice", pos: [-133, 112], icon: "wortox_liftedspirits_3", tags: ["nice", "nice1"] },
    { id: "wortox_liftedspirits_4", group: "nice", pos: [-97, 112], icon: "wortox_liftedspirits_4", tags: ["nice", "nice1"] },

    // ── Neutral: Panflute ──
    { id: "wortox_panflute_playing", group: "neutral", pos: [0, 0], root: true, icon: "wortox_panflute_playing", connects: ["wortox_panflute_soulcaller", "wortox_panflute_forget"], tags: ["neutral", "nice1", "naughty1"] },
    { id: "wortox_panflute_soulcaller", group: "neutral", pos: [-50, 0], icon: "wortox_panflute_soulcaller", tags: ["neutral", "nice1", "naughty1"] },
    { id: "wortox_panflute_forget", group: "neutral", pos: [50, 0], icon: "wortox_panflute_forget", tags: ["neutral", "nice1", "naughty1"] },

    // ── Naughty: Nab Bag & Soul Jar ──
    { id: "wortox_nabbag", group: "naughty", pos: [115, 32], root: true, icon: "wortox_nabbag", connects: ["wortox_souljar_1"], tags: ["naughty", "naughty1"] },
    { id: "wortox_souljar_1", group: "naughty", pos: [115, 72], icon: "wortox_souljar_1", connects: ["wortox_souljar_2", "wortox_souljar_3"], tags: ["naughty", "naughty1"] },
    { id: "wortox_souljar_2", group: "naughty", pos: [97, 112], icon: "wortox_souljar_2", tags: ["naughty", "naughty1"] },
    { id: "wortox_souljar_3", group: "naughty", pos: [133, 112], icon: "wortox_souljar_3", tags: ["naughty", "naughty1"] },

    // ── Naughty: Thief ──
    { id: "wortox_thief_1", group: "naughty", pos: [175, 21], root: true, icon: "wortox_thief_1", connects: ["wortox_thief_2"], tags: ["naughty", "naughty1"] },
    { id: "wortox_thief_2", group: "naughty", pos: [175, 61], icon: "wortox_thief_2", tags: ["naughty", "naughty1"] },
    { id: "wortox_thief_3", group: "naughty", pos: [175, 129], icon: "wortox_thief_3", locks: ["wortox_thief_lock"], connects: ["wortox_thief_4"], tags: ["naughty"] },
    { id: "wortox_thief_4", group: "naughty", pos: [175, 169], icon: "wortox_thief_4", tags: ["naughty"] },

    // ── Naughty: Soul Decoy ──
    { id: "wortox_souldecoy_1", group: "naughty", pos: [225, 32], root: true, icon: "wortox_souldecoy_1", connects: ["wortox_souldecoy_2"], tags: ["naughty", "naughty1"] },
    { id: "wortox_souldecoy_2", group: "naughty", pos: [225, 72], icon: "wortox_souldecoy_2", tags: ["naughty", "naughty1"] },
    { id: "wortox_souldecoy_3", group: "naughty", pos: [225, 140], icon: "wortox_souldecoy_3", locks: ["wortox_souldecoy_lock"], tags: ["naughty"] },

    // ── Allegiance ──
    { id: "wortox_allegiance_lunar_lock_1", group: "allegiance", pos: [-20, 61.9], root: true, lockType: { type: "boss_kill", boss: "celestialchampion" }, tags: ["allegiance", "lock"] },
    { id: "wortox_allegiance_lunar_lock_2", group: "allegiance", pos: [-20, 95.9], root: true, lockType: { type: "no_opposing_faction", faction: "lunar" }, tags: ["allegiance", "lock"] },
    { id: "wortox_allegiance_lunar", group: "allegiance", pos: [-20, 129.9], icon: "wortox_favor_lunar", locks: ["wortox_allegiance_lunar_lock_1", "wortox_allegiance_lunar_lock_2"], tags: ["lunar_favor", "neutral", "allegiance"] },
    { id: "wortox_allegiance_shadow_lock_1", group: "allegiance", pos: [20, 61.9], root: true, lockType: { type: "boss_kill", boss: "fuelweaver" }, tags: ["allegiance", "lock"] },
    { id: "wortox_allegiance_shadow_lock_2", group: "allegiance", pos: [20, 95.9], root: true, lockType: { type: "no_opposing_faction", faction: "shadow" }, tags: ["allegiance", "lock"] },
    { id: "wortox_allegiance_shadow", group: "allegiance", pos: [20, 129.9], icon: "wortox_favor_shadow", locks: ["wortox_allegiance_shadow_lock_1", "wortox_allegiance_shadow_lock_2"], tags: ["shadow_favor", "neutral", "allegiance"] },
  ],
};
