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
        { id: "mutatedwarg",      nameKo: "귀신들린 바르그", nameEn: "Possessed Varg",    iconPath: "/images/bosses/mutatedwarg.png" },
        { id: "mutateddeerclops", nameKo: "수정체 외눈사슴", nameEn: "Crystal Deerclops", iconPath: "/images/bosses/mutateddeerclops.png" },
        { id: "mutatedbearger",   nameKo: "무장한 곰소리",   nameEn: "Armored Bearger",   iconPath: "/images/bosses/mutatedbearger.png" },
      ],
    },
    {
      id: "task_pearlmap_help",
      // Challenge Board UI:PEARL_MAP_HELP_FMT + STRINGS.NAMES.HERMITCRAB
      titleKo: "게팍한 은둔자 이사 돕기",
      titleEn: "Help Crabby Hermit Relocate",
      icon: "hermitcrab_relocation_kit.png",
      substeps: [
        { id: "get_monkey_map",   nameKo: "원숭이섬 포털 지도",     nameEn: "Monkey Island Portal Map",   icon: "hermitcrab_npc.png" },
        { id: "give_to_wagstaff", nameKo: "와그스태프 변환 지도",   nameEn: "Wagstaff's Converted Map",   icon: "wagstaff_item_1.png" },
        { id: "give_to_pearl",    nameKo: "새 거주지로 이사",       nameEn: "Relocation Complete",        icon: "hermitcrab_relocation_kit.png" },
      ],
    },
    {
      id: "task_substrate_extrapolator_tiles",
      // Challenge Board UI:INSTALL_FMT + STRINGS.NAMES.WAGPUNK_FLOOR_KIT
      titleKo: "기질 추론기 설치",
      titleEn: "Install Substrate Extrapolator",
      icon: "wagpunk_floor_kit.png",
      craftId: "wagpunk_floor_kit",
      substeps: [
        { id: "craft_floor_kit", nameKo: "기질 추론기", nameEn: "Substrate Extrapolator",
          icon: "wagpunk_floor_kit.png",
          craftId: "wagpunk_floor_kit",
          noteKo: "cutstone 1 + wagpunk_bits 1 (×4 산출)",
          noteEn: "cutstone 1 + wagpunk_bits 1 (yields 4)" },
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
          craftId: "thulecitebugnet",
          noteKo: "thulecite 2 + refined_dust 1",
          noteEn: "thulecite 2 + refined_dust 1" },
        { id: "craft_gestalt_cage", nameKo: "게슈탈트 포획기", nameEn: "Gestalt Cage",
          icon: "gestalt_cage.png",
          craftId: "gestalt_cage",
          noteKo: "thulecitebugnet 1 + wagpunk_bits 2",
          noteEn: "thulecitebugnet 1 + wagpunk_bits 2" },
        { id: "capture_gestalts", nameKo: "게슈탈트 포획", nameEn: "Gestalt Capture",
          icon: "gestalt_cage_filled3.png",
          qty: 6 },
      ],
    },
    { id: "alterguardian_phase1_lunarrift_gestalt_capture",
      // Challenge Board UI:CAPTURE_FMT + STRINGS.NAMES.ALTERGUARDIAN_PHASE1_LUNARRIFT_GESTALT
      titleKo: "순수한 게슈탈트 포획",
      titleEn: "Capture Pure Gestalt",
      iconPath: "/images/bosses/alterguardian_phase1_lunarrift.png" },
    { id: "wagboss_robot",
      titleKo: "W.A.R.B.O.T. 처치",
      titleEn: "Defeat W.A.R.B.O.T.",
      iconPath: "/images/bosses/wagboss_robot.png" },
    { id: "alterguardian_phase4_lunarrift",
      titleKo: "천상의 귀공자 처치",
      titleEn: "Defeat the Celestial Scion",
      iconPath: "/images/bosses/alterguardian_phase4.png" },
  ],
};
