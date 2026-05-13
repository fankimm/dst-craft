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
  summaryKo: "그림자 진영 엔드게임. 화석·열쇠·그림자 심장을 모은 뒤 관문에 열쇠를 삽입.",
  summaryEn: "Shadow endgame. Gather fossils, the key, and the shadow heart — then insert the key into the gate.",
  steps: [
    {
      id: "collection_fossil",
      titleKo: "화석 조각",
      titleEn: "Fossil Fragments",
      icon: "fossil_piece.png",
      count: 8,
      descKo: "유적·미궁에서 발굴해 'Odd Skeleton'(fossil_stalker)을 조립.",
      descEn: "Dig up from the Ruins / Labyrinth to assemble the Odd Skeleton.",
    },
    {
      id: "atrium_key",
      titleKo: "고대의 열쇠",
      titleEn: "Ancient Key",
      icon: "atrium_key.png",
      descKo: "고대의 수호자(Ancient Guardian) 처치 후 그가 떨군 상자에서 회수.",
      descEn: "Recover from the chest dropped by the Ancient Guardian (Minotaur).",
    },
    {
      id: "shadowheart",
      titleKo: "그림자 심장",
      titleEn: "Shadow Atrium",
      icon: "shadowheart.png",
      descKo: "Stalker(되살아난 해골) 처치 시 드롭 (cave/forest/atrium decay 변형 공통).",
      descEn: "Drops from the Stalker (Reanimated Skeleton — cave / forest / atrium decay).",
    },
    {
      id: "stalker_atrium",
      titleKo: "고대의 연료직공 처치",
      titleEn: "Defeat the Ancient Fuelweaver",
      iconPath: "/images/bosses/stalker_atrium.png",
      descKo: "관문(atrium_gate)에 고대의 열쇠를 삽입 → 보스전. 처치 후 게이트는 20일 cooldown.",
      descEn: "Insert the Ancient Key into the atrium gate to summon the fight. 20-day cooldown after each kill.",
    },
  ],
};
