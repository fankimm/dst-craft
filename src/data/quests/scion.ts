import type { Quest } from "./types";

/**
 * 천상의 귀공자(Celestial Scion / alterguardian_phase4_lunarrift) 진행 체인.
 *
 * Challenge Board challenge_defs.lua의 inline_group_wagboss_ready + wagboss_robot/scion 보스 항목 기반.
 * 두 보스(W.A.R.B.O.T. → 천상의 귀공자)가 같은 준비 단계를 공유.
 * children:
 *  - task_pearlmap_help (게팍한 은둔자 이사 돕기)
 *  - task_substrate_extrapolator_tiles (기질 추론기 설치)
 *  - task_gestalt_cage (게슈탈트 포획 및 설치, ×6)
 *  - alterguardian_phase1_lunarrift_gestalt_capture (순수한 게슈탈트 포획)
 *  - wagboss_robot (W.A.R.B.O.T. 처치)
 *  - alterguardian_phase4_lunarrift (천상의 귀공자 처치)
 */
export const scionQuest: Quest = {
  id: "alterguardian_phase4_lunarrift",
  titleKo: "천상의 귀공자",
  titleEn: "Celestial Scion",
  iconPath: "/images/bosses/alterguardian_phase4.png",
  summaryKo: "신보스 콘텐츠. 펄 이사 돕기·기질 추론기·게슈탈트 포획 후 W.A.R.B.O.T. → 천상의 귀공자 처치.",
  summaryEn: "New-boss content. Help Pearl relocate, install the Substrate Extrapolator, capture Gestalts, then defeat W.A.R.B.O.T. → Celestial Scion.",
  steps: [
    {
      id: "task_pearlmap_help",
      titleKo: "게팍한 은둔자 이사 돕기",
      titleEn: "Help Crabby Hermit Relocate",
      icon: "hermitcrab_relocation_kit.png",
    },
    {
      id: "task_substrate_extrapolator_tiles",
      titleKo: "기질 추론기 설치",
      titleEn: "Install Substrate Extrapolator",
      icon: "wagpunk_floor_kit.png",
    },
    {
      id: "task_gestalt_cage",
      titleKo: "게슈탈트 포획 및 설치 ×6",
      titleEn: "Capture & Install Gestalt ×6",
      icon: "gestalt_cage.png",
      count: 6,
    },
    {
      id: "alterguardian_phase1_lunarrift_gestalt_capture",
      titleKo: "순수한 게슈탈트 포획",
      titleEn: "Capture Pure Gestalt",
      iconPath: "/images/bosses/alterguardian_phase1_lunarrift.png",
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
