import type { Quest } from "./types";

/**
 * 천상의 대변자(Celestial Champion / alterguardian_phase3) 진행 체인.
 *
 * Challenge Board challenge_defs.lua의 inline_group_alterguardian_phase3 + alterguardian_phase3 보스 항목 기반.
 * children:
 *  - collection_moonglass (moonglass_charged) ×30
 *  - collection_moonlight (moonstorm_spark) ×15
 *  - collection_scrap (wagpunk_bits) ×8
 *  - moonstorm_static_item ×1
 *  - task_moon_device (달 공명추출기 설치)
 * also_completes: 보스 처치 시 위 항목 자동 완료
 */
export const celestialQuest: Quest = {
  id: "alterguardian_phase3",
  titleKo: "천상의 대변자",
  titleEn: "Celestial Champion",
  iconPath: "/images/bosses/alterguardian_phase3.png",
  summaryKo: "달의 진영 엔드게임. 달 공명추출기 가동 후 3페이즈 보스 처치.",
  summaryEn: "Lunar endgame. Activate the Lunar Siphonator, then defeat the 3-phase boss.",
  steps: [
    {
      id: "collection_moonglass",
      titleKo: "충전된 달 파편 ×30",
      titleEn: "Infused Moon Shard ×30",
      icon: "moonglass_charged.png",
      count: 30,
    },
    {
      id: "collection_moonlight",
      titleKo: "달빛 ×15",
      titleEn: "Moongleam ×15",
      icon: "moonstorm_spark.png",
      count: 15,
    },
    {
      id: "collection_scrap",
      titleKo: "고철더미 ×8",
      titleEn: "Scrap ×8",
      icon: "wagpunk_bits.png",
      count: 8,
    },
    {
      id: "moonstorm_static_item",
      titleKo: "억제된 정전기",
      titleEn: "Restrained Static",
      icon: "moonstorm_static_item.png",
    },
    {
      id: "task_moon_device",
      titleKo: "달 공명추출기 설치",
      titleEn: "Install Lunar Siphonator",
      icon: "moon_device_construction1.png",
    },
    {
      id: "alterguardian_phase3",
      titleKo: "천상의 대변자 처치",
      titleEn: "Defeat the Celestial Champion",
      iconPath: "/images/bosses/alterguardian_phase3.png",
    },
  ],
};
