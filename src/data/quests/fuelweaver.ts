import type { Quest } from "./types";

/**
 * 연료직공(Ancient Fuelweaver / Stalker Atrium) 진행 체인.
 *
 * 출처:
 * - 인게임 prefabs/atrium_gate.lua, atrium_overgrowth.lua, fossil_piece.lua, stalker.lua,
 *   thurible.lua, pseudoscience_station* + strings.lua
 * - 한국어 명칭: 한글모드 ko.po (STRINGS.NAMES.*)
 *
 * 진행 순서:
 *  1. 유적(Ruins) 진입 → Atrium 동굴 + 고대 유사과학 정거장 위치 확보
 *  2. 고대의 열쇠 회수 (제작 불가 — recipes.lua에 Recipe2 없음. 유적에서 1회 회수)
 *  3. 화석 조각을 모아 'Odd Skeleton'(fossil_stalker) 조립
 *  4. 그림자 향로 등 보조 도구 준비
 *  5. 관문(atrium_gate)에 열쇠를 trade → Fuelweaver 소환
 *  6. 처치 → 게이트는 ATRIUM_GATE_COOLDOWN(20일) 후 재활성
 *
 * 검증 위치: atrium_gate.lua(trader/pickable, TUNING.ATRIUM_GATE_COOLDOWN=20일),
 * stalker.lua(fossil_piece loot 8회), recipes.lua(atrium_key Recipe2 없음).
 */
export const fuelweaverQuest: Quest = {
  id: "fuelweaver",
  titleKo: "연료직공",
  titleEn: "Ancient Fuelweaver",
  icon: "thurible.png",
  summaryKo: "그림자 진영 엔드게임. 고대의 관문을 활성화해 연료직공 처치.",
  summaryEn: "Shadow endgame. Activate the Ancient Gateway and defeat the Fuelweaver.",
  steps: [
    {
      id: "find_atrium",
      titleKo: "고대의 관문 발견",
      titleEn: "Find the Ancient Gateway",
      descKo: "유적(Ruins) 깊숙한 곳의 아트리움 동굴에서 활성화 가능한 관문 위치 확보.",
      descEn: "Locate the Ancient Gateway in the Atrium cave deep in the Ruins.",
      icon: "atrium_key.png",
    },
    {
      id: "find_pseudoscience_station",
      titleKo: "고대 유사과학 정거장 가동",
      titleEn: "Power the Ancient Pseudoscience Station",
      descKo: "수정된 관문 근처의 유사과학 정거장에서 고대 청사진 사용 준비.",
      descEn: "Use the Ancient Pseudoscience Station to craft ancient items.",
      icon: "researchlab4.png",
    },
    {
      id: "obtain_atrium_key",
      titleKo: "고대의 열쇠 회수",
      titleEn: "Obtain the Ancient Key",
      descKo: "유적 안에 1회 배치된 고대의 열쇠를 회수 (제작 불가). 처치 후엔 관문에서 재회수.",
      descEn: "Pick up the Ancient Key from the Ruins (not craftable). After each kill it can be picked back from the gate.",
      icon: "atrium_key.png",
    },
    {
      id: "collect_fossils",
      titleKo: "화석 조각 수집",
      titleEn: "Collect Fossil Pieces",
      descKo: "유적·미궁 등에서 화석 조각(fossil_piece)을 모음.",
      descEn: "Gather Fossil Pieces from the Ruins / Labyrinth.",
      icon: "fossil_piece.png",
    },
    {
      id: "assemble_odd_skeleton",
      titleKo: "이상한 해골 조립",
      titleEn: "Assemble the Odd Skeleton",
      descKo: "화석 조각을 배치해 'Odd Skeleton'(fossil_stalker) 조립 — 연료직공 부활용 사체.",
      descEn: "Place fossil pieces to construct the Odd Skeleton (fossil_stalker) — Fuelweaver's body.",
      icon: "fossil_piece.png",
    },
    {
      id: "prepare_thurible",
      titleKo: "그림자 향로 준비",
      titleEn: "Prepare Shadow Thuribles",
      descKo: "보스전 중 그림자 패턴 대응용으로 그림자 향로(thurible) 보조.",
      descEn: "Bring Shadow Thuribles to deal with shadow patterns during the fight.",
      icon: "thurible.png",
    },
    {
      id: "activate_gateway",
      titleKo: "관문에 열쇠 삽입",
      titleEn: "Insert Key into the Gateway",
      descKo: "고대의 열쇠를 관문(atrium_gate)에 trade — 'Odd Skeleton'이 깨어나며 보스전 시작.",
      descEn: "Trade the Ancient Key to the Ancient Gateway — the Odd Skeleton reanimates as the Fuelweaver.",
      icon: "atrium_key.png",
    },
    {
      id: "defeat_fuelweaver",
      titleKo: "고대의 연료직공 처치",
      titleEn: "Defeat the Ancient Fuelweaver",
      descKo: "그림자·미니언 패턴 극복 후 처치.",
      descEn: "Survive the shadow & minion patterns and bring it down.",
      icon: "boneshard.png",
    },
    {
      id: "reset_atrium",
      titleKo: "아트리움 리셋 (선택)",
      titleEn: "Reset the Atrium (Optional)",
      descKo: "처치 후 게이트는 20일(TUNING.ATRIUM_GATE_COOLDOWN) 뒤 다시 활성 — 반복 도전 가능.",
      descEn: "The gateway becomes reusable after 20 days (TUNING.ATRIUM_GATE_COOLDOWN).",
      icon: "nightmarefuel.png",
    },
  ],
};
