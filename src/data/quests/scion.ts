import type { Quest } from "./types";

/**
 * 천상의 귀공자(Celestial Scion / alterguardian_phase4_lunarrift) 진행 체인.
 *
 * Challenge Board:
 *  - inline_group_wagboss_ready = { task_pearlmap_help, task_substrate_extrapolator_tiles,
 *    task_gestalt_cage(×6), alterguardian_phase1_lunarrift_gestalt_capture }
 *  - inline_group_possessed_boss = { possessed_varg, mutateddeerclops, armored_bearger }
 *    (newboss preset의 prereq)
 *  - 보스: wagboss_robot, alterguardian_phase4_lunarrift
 *
 * 출처 검증:
 *  - 변형 보스 3종: components/lunarriftmutationsmanager.lua MUTATIONS_NAMES =
 *    { "mutatedwarg", "mutatedbearger", "mutateddeerclops" }
 *    → 3종 모두 처치하면 Wagstaff가 등장(TriggerWagstaffAppearance) → 본 라인 진입
 *  - gestalt_cage: recipes.lua 999 — thulecitebugnet 1 + wagpunk_bits 2 (TECH.WAGPUNK_WORKSTATION_TWO)
 *  - thulecitebugnet: recipes.lua 389 — thulecite 2 + refined_dust 1 (TECH.LOST)
 *  - wagpunk_floor_kit (기질 추론기): recipes.lua 998 — cutstone 1 + wagpunk_bits 1, numtogive=4
 */
export const scionQuest: Quest = {
  id: "alterguardian_phase4_lunarrift",
  titleKo: "천상의 귀공자",
  titleEn: "Celestial Scion",
  iconPath: "/images/bosses/alterguardian_phase4.png",
  steps: [
    {
      id: "mutated_trio",
      // Challenge Board UI:POSSESSED_BOSS
      titleKo: "빙의된 보스 처치",
      titleEn: "Possessed Bosses",
      iconPath: "/images/bosses/mutateddeerclops.png",
      substeps: [
        { id: "mutatedwarg",      nameKo: "귀신들린 바르그", nameEn: "Possessed Varg",    iconPath: "/images/bosses/mutatedwarg.png",      bossId: "mutatedwarg" },
        { id: "mutateddeerclops", nameKo: "수정체 외눈사슴", nameEn: "Crystal Deerclops", iconPath: "/images/bosses/mutateddeerclops.png", bossId: "mutateddeerclops" },
        { id: "mutatedbearger",   nameKo: "무장한 곰소리",   nameEn: "Armored Bearger",   iconPath: "/images/bosses/mutatedbearger.png",   bossId: "mutatedbearger" },
      ],
    },
    {
      id: "task_pearlmap_help",
      // Challenge Board UI:PEARL_MAP_HELP_FMT + STRINGS.NAMES.HERMITCRAB
      titleKo: "게팍한 은둔자 이사 돕기",
      titleEn: "Help Crabby Hermit Relocate",
      icon: "hermitcrab_relocation_kit.png",
      substeps: [
        { id: "make_map", nameKo: "지도 만들기", nameEn: "Make the Map", icon: "cartographydesk.png", craftId: "cartographydesk" },
      ],
    },
    {
      id: "task_substrate_extrapolator_tiles",
      // Challenge Board UI:INSTALL_FMT + STRINGS.NAMES.WAGPUNK_FLOOR_KIT
      // recipes.lua 998: cutstone 1 + wagpunk_bits 1 → numtogive=4. 76 타일 = 19회 제작
      titleKo: "기질 추론기 설치 및 제작",
      titleEn: "Install & Craft Substrate Extrapolator",
      icon: "wagpunk_floor_kit.png",
      craftId: "wagpunk_floor_kit",
      count: 76,
      substeps: [
        { id: "tiles_cutstone",     nameKo: "석재",     nameEn: "Cut Stone", icon: "cutstone.png",     qty: 19, craftId: "cutstone" },
        { id: "tiles_wagpunk_bits", nameKo: "고철더미", nameEn: "Scrap",     icon: "wagpunk_bits.png", qty: 19 },
      ],
    },
    {
      id: "task_gestalt_cage",
      // Challenge Board UI:RESOURCE_GESTALT_CAGE + STRINGS.NAMES.GESTALT
      titleKo: "게슈탈트 포획 및 설치",
      titleEn: "Capture & Install Gestalt",
      icon: "gestalt_cage.png",
      count: 6,
      substeps: [
        { id: "craft_thulecitebugnet", nameKo: "툴레사이트 잠자리채", nameEn: "Thulecite Bug Net",
          icon: "thulecitebugnet.png",
          craftId: "thulecitebugnet" },
        { id: "craft_gestalt_cage", nameKo: "게슈탈트 포획기", nameEn: "Gestalt Cage",
          icon: "gestalt_cage.png",
          craftId: "gestalt_cage" },
        { id: "capture_gestalts", nameKo: "게슈탈트 포획", nameEn: "Gestalt Capture",
          icon: "gestalt_cage_filled3.png",
          qty: 6 },
      ],
    },
    { id: "alterguardian_phase1_lunarrift_gestalt_capture",
      // Challenge Board UI:CAPTURE_FMT + STRINGS.NAMES.ALTERGUARDIAN_PHASE1_LUNARRIFT_GESTALT
      titleKo: "순수한 게슈탈트 포획",
      titleEn: "Capture Pure Gestalt",
      iconPath: "/images/bosses/alterguardian_phase1_lunarrift.png",
      bossId: "alterguardian_phase1_lunarrift" },
    { id: "wagboss_robot",
      titleKo: "W.A.R.B.O.T. 처치",
      titleEn: "Defeat W.A.R.B.O.T.",
      iconPath: "/images/bosses/wagboss_robot.png",
      bossId: "wagboss_robot" },
    { id: "alterguardian_phase4_lunarrift",
      titleKo: "천상의 귀공자 처치",
      titleEn: "Defeat the Celestial Scion",
      iconPath: "/images/bosses/alterguardian_phase4.png",
      bossId: "alterguardian_phase4_lunarrift" },
  ],
};
