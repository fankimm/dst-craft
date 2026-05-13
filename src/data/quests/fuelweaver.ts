import type { Quest } from "./types";

/**
 * 고대의 연료직공(Ancient Fuelweaver / stalker_atrium) 진행 체인.
 *
 * Challenge Board challenge_defs.lua의 inline_group_stalker_atrium + stalker_atrium 보스 항목 기반.
 * children = collection_fossil(×8), atrium_key(×1), shadowheart(×1)
 * also_completes: 보스 처치 시 위 3개 자동 완료
 *
 * 한국어/영어 텍스트: 한글모드 ko.po STRINGS.NAMES.* + Challenge Board UI fmt
 */
export const fuelweaverQuest: Quest = {
  id: "stalker_atrium",
  titleKo: "고대의 연료직공",
  titleEn: "Ancient Fuelweaver",
  iconPath: "/images/bosses/stalker_atrium.png",
  summaryKo: "그림자 진영 엔드게임. 화석·열쇠·그림자 심장을 모은 뒤 처치.",
  summaryEn: "Shadow endgame. Gather fossils, the key, and the shadow heart — then defeat.",
  steps: [
    {
      id: "collection_fossil",
      titleKo: "화석 조각 ×8",
      titleEn: "Fossil Fragments ×8",
      icon: "fossil_piece.png",
      count: 8,
    },
    {
      id: "atrium_key",
      titleKo: "고대의 열쇠",
      titleEn: "Ancient Key",
      icon: "atrium_key.png",
    },
    {
      id: "shadowheart",
      titleKo: "그림자 심장",
      titleEn: "Shadow Atrium",
      icon: "shadowheart.png",
    },
    {
      id: "stalker_atrium",
      titleKo: "고대의 연료직공 처치",
      titleEn: "Defeat the Ancient Fuelweaver",
      iconPath: "/images/bosses/stalker_atrium.png",
    },
  ],
};
