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
  summaryKo: "신보스 콘텐츠. 변형 보스 3종 처치 → 펄 이사 + 기질 추론기 + 게슈탈트 포획 후 W.A.R.B.O.T. → 천상의 귀공자.",
  summaryEn: "New-boss content. Beat the 3 mutated bosses, then relocate Pearl, deploy the extrapolator, capture Gestalts, and defeat W.A.R.B.O.T. → Celestial Scion.",
  steps: [
    {
      id: "mutated_trio",
      titleKo: "변형 보스 3종 처치",
      titleEn: "Defeat 3 Mutated Bosses",
      iconPath: "/images/bosses/mutateddeerclops.png",
      descKo: "lunarriftmutationsmanager가 추적. 3종 모두 잡으면 와그스태프 등장 → 후속 단계 잠금 해제.",
      descEn: "Tracked by lunarriftmutationsmanager. Defeating all three triggers Wagstaff's arrival.",
      substeps: [
        { id: "mutatedwarg",       nameKo: "귀신들린 바르그",   nameEn: "Possessed Varg",    iconPath: "/images/bosses/mutatedwarg.png" },
        { id: "mutateddeerclops",  nameKo: "수정체 외눈사슴",   nameEn: "Crystal Deerclops", iconPath: "/images/bosses/mutateddeerclops.png" },
        { id: "mutatedbearger",    nameKo: "무장한 곰소리",     nameEn: "Armored Bearger",   iconPath: "/images/bosses/mutatedbearger.png" },
      ],
    },
    {
      id: "task_pearlmap_help",
      titleKo: "게팍한 은둔자 이사 돕기",
      titleEn: "Help Crabby Hermit Relocate",
      icon: "hermitcrab_relocation_kit.png",
      descKo: "원숭이섬 포털 지도를 펄→와그스태프 경로로 가공해 새 거주지로 이사시킴.",
      descEn: "Carry the Monkey Pirate map through Pearl → Wagstaff → Pearl to relocate her.",
      substeps: [
        { id: "get_monkey_map",   nameKo: "펄에게 원숭이섬 포털 지도 받기", nameEn: "Get monkey island portal map from Pearl",
          icon: "hermitcrab_npc.png" },
        { id: "give_to_wagstaff", nameKo: "와그스태프에게 지도 전달 → 새 지도 받기", nameEn: "Bring map to Wagstaff → receive new map",
          icon: "wagstaff_item_1.png" },
        { id: "give_to_pearl",    nameKo: "새 지도를 펄에게 전달 → 이사 완료",       nameEn: "Hand new map back to Pearl → relocation",
          icon: "hermitcrab_relocation_kit.png" },
      ],
    },
    {
      id: "task_substrate_extrapolator_tiles",
      titleKo: "기질 추론기 설치",
      titleEn: "Install Substrate Extrapolator",
      icon: "wagpunk_floor_kit.png",
      craftId: "wagpunk_floor_kit",
      descKo: "wagpunk_floor_kit를 충분히 깔아 와그스태프 거점 주변 타일 활성화.",
      descEn: "Place wagpunk_floor_kit tiles to activate the area.",
      substeps: [
        { id: "craft_floor_kit", nameKo: "wagpunk_floor_kit 제작 (×4 산출)", nameEn: "Craft wagpunk_floor_kit (×4 per recipe)",
          icon: "wagpunk_floor_kit.png",
          craftId: "wagpunk_floor_kit",
          noteKo: "cutstone 1 + wagpunk_bits 1 — 와그펑크 작업장 Tier 2",
          noteEn: "cutstone 1 + wagpunk_bits 1 — Wagpunk Workstation tier 2" },
      ],
    },
    {
      id: "task_gestalt_cage",
      titleKo: "게슈탈트 포획 및 설치",
      titleEn: "Capture & Install Gestalt",
      icon: "gestalt_cage.png",
      count: 6,
      descKo: "도구(잠자리채) 제작 → 포획기 제작 → 게슈탈트 6마리 포획.",
      descEn: "Craft the bug net → craft the cage → capture 6 gestalts.",
      substeps: [
        { id: "craft_thulecitebugnet", nameKo: "툴레사이트 잠자리채 제작", nameEn: "Craft Thulecite Bug Net",
          icon: "thulecitebugnet.png",
          craftId: "thulecitebugnet",
          noteKo: "thulecite 2 + refined_dust 1 — TECH.LOST",
          noteEn: "thulecite 2 + refined_dust 1 — TECH.LOST" },
        { id: "craft_gestalt_cage", nameKo: "게슈탈트 포획기 제작", nameEn: "Craft Gestalt Cage",
          icon: "gestalt_cage.png",
          craftId: "gestalt_cage",
          noteKo: "thulecitebugnet 1 + wagpunk_bits 2",
          noteEn: "thulecitebugnet 1 + wagpunk_bits 2" },
        { id: "capture_gestalts", nameKo: "게슈탈트 포획 및 설치", nameEn: "Capture & install gestalts",
          icon: "gestalt_cage_filled3.png",
          qty: 6 },
      ],
    },
    {
      id: "alterguardian_phase1_lunarrift_gestalt_capture",
      titleKo: "순수한 게슈탈트 포획",
      titleEn: "Capture Pure Gestalt",
      iconPath: "/images/bosses/alterguardian_phase1_lunarrift.png",
      descKo: "Celestial Revenant(alterguardian_phase1_lunarrift)이 떨어트리는 순수한 게슈탈트를 포획.",
      descEn: "Capture the Pure Gestalt dropped by the Celestial Revenant.",
    },
    {
      id: "wagboss_robot",
      titleKo: "W.A.R.B.O.T. 처치",
      titleEn: "Defeat W.A.R.B.O.T.",
      iconPath: "/images/bosses/wagboss_robot.png",
    },
    {
      id: "alterguardian_phase4_lunarrift",
      titleKo: "천상의 귀공자 처치",
      titleEn: "Defeat the Celestial Scion",
      iconPath: "/images/bosses/alterguardian_phase4.png",
    },
  ],
};
