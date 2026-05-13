import type { Quest } from "./types";

/**
 * 고대의 연료직공(Ancient Fuelweaver / stalker_atrium) 진행 체인.
 *
 * Challenge Board inline_group_stalker_atrium = { collection_fossil(×8), atrium_key, shadowheart }
 *  + 보스 stalker_atrium 처치.
 *
 * 출처 검증:
 *  - atrium_key: minotaur.lua 612 — 고대의 수호자 처치 시 minotaurchest에서 회수 (제작 불가)
 *  - shadowheart: stalker.lua 973/1248/1453/1476 — Stalker(되살아난 해골)의 3가지 변형
 *    (동굴·숲·atrium decay) 모두 lootdropper에 AddChanceLoot("shadowheart", 1)
 *  - 게이트 cooldown: TUNING.ATRIUM_GATE_COOLDOWN = 20일 (tuning.lua)
 */
export const fuelweaverQuest: Quest = {
  id: "stalker_atrium",
  titleKo: "고대의 연료직공",
  titleEn: "Ancient Fuelweaver",
  iconPath: "/images/bosses/stalker_atrium.png",
  steps: [
    { id: "collection_fossil", titleKo: "화석 조각", titleEn: "Fossil Fragments", icon: "fossil_piece.png", count: 8 },
    {
      id: "atrium_key",
      titleKo: "고대의 열쇠",
      titleEn: "Ancient Key",
      icon: "atrium_key.png",
      substeps: [
        { id: "defeat_minotaur",
          nameKo: "고대의 수호자 처치",
          nameEn: "Defeat the Ancient Guardian",
          iconPath: "/images/bosses/minotaur.png",
          bossId: "minotaur" },
      ],
    },
    {
      id: "shadowheart",
      titleKo: "그림자 심장",
      titleEn: "Shadow Atrium",
      icon: "shadowheart.png",
      substeps: [
        { id: "defeat_stalker",
          nameKo: "Stalker 처치",
          nameEn: "Defeat the Stalker",
          iconPath: "/images/bosses/stalker_atrium.png",
          noteKo: "동굴·숲·아트리움 3종 변형 어느 것이든 100% 드롭",
          noteEn: "Drops 100% from any of the 3 Stalker variants (cave / forest / atrium)" },
      ],
    },
    { id: "stalker_atrium",    titleKo: "고대의 연료직공 처치", titleEn: "Defeat the Ancient Fuelweaver",
      iconPath: "/images/bosses/stalker_atrium.png",
      bossId: "stalker_atrium" },
  ],
};
