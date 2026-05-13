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
      // recipes.lua 999: gestalt_cage = thulecitebugnet 1 + wagpunk_bits 2 → 6개 제작 시 잠자리채 6 + 고철더미 12
      // 포획 변형 검증 — wagpunk_arena_manager.lua 886-975 ShouldWagstaffAcceptItem:
      //   CONSTRUCT 상태에서 hasrolling(filled1) + hasflying(filled2) 둘 다 충족돼야 보스 진행
      //   → 6개 중 최소 1개는 작은(filled1=굴러지), 1개는 큰(filled2=개개비 드론)
      titleKo: "게슈탈트 포획 및 설치",
      titleEn: "Capture & Install Gestalt",
      icon: "gestalt_cage.png",
      craftId: "gestalt_cage",
      count: 6,
      substeps: [
        { id: "gestalt_thulecitebugnet", nameKo: "툴레사이트 잠자리채", nameEn: "Thulecite Bug Net", icon: "thulecitebugnet.png", qty: 6,  craftId: "thulecitebugnet" },
        { id: "gestalt_wagpunk_bits",    nameKo: "고철더미",            nameEn: "Scrap",             icon: "wagpunk_bits.png",    qty: 12 },
        { id: "gestalt_capture", nameKo: "게슈탈트 포획", nameEn: "Gestalt Capture", icon: "gestalt_cage_filled2.png", qty: 6, noteKo: "작은(굴러지)·큰(개개비 드론) 각 최소 1개 필수", noteEn: "Min 1 small (Terramite) + min 1 big (Warbler)" },
      ],
    },
  ],
};
