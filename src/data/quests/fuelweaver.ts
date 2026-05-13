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
 *  1. 유적(Ruins) 진입 → 고대 유사과학 정거장(Pseudoscience Station) 발견
 *  2. 4색 보석으로 고대의 열쇠 제작
 *  3. 화석 8조각을 모아 'Odd Skeleton' 조립
 *  4. 그림자 향로 / 부활 도구 준비
 *  5. 유적 동굴의 Atrium에서 Ancient Gateway 활성화
 *  6. 페이즈 1: 일반 Stalker (지상 잡몹) — 선택
 *  7. 페이즈 2: Ancient Fuelweaver (관문 활성 상태) 처치 → 뼈 갑옷·뼈 투구 청사진
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
      id: "craft_atrium_key",
      titleKo: "고대의 열쇠 제작",
      titleEn: "Craft the Ancient Key",
      descKo: "악몽 연료 5 + 4색 보석(붉은·푸른·보라·노랑) 1개씩으로 제작.",
      descEn: "Craft with 5 Nightmare Fuel + Red/Blue/Purple/Yellow Gems.",
      icon: "atrium_key.png",
    },
    {
      id: "collect_fossils",
      titleKo: "화석 조각 8개 수집",
      titleEn: "Collect 8 Fossil Pieces",
      descKo: "달의 섬·갈고리꼬리·코끼리 등에서 화석 조각을 모아 'Odd Skeleton' 조립 재료 확보.",
      descEn: "Gather 8 Fossil Pieces from the Lunar Isle and other sources.",
      icon: "fossil_piece.png",
      count: 8,
    },
    {
      id: "assemble_odd_skeleton",
      titleKo: "이상한 해골 조립",
      titleEn: "Assemble the Odd Skeleton",
      descKo: "화석 8개로 'Odd Skeleton' 조립 — 연료직공 부활용 사체.",
      descEn: "Build the Odd Skeleton (Fossil Stalker) — Fuelweaver's body.",
      icon: "fossil_piece.png",
    },
    {
      id: "prepare_thurible",
      titleKo: "그림자 향로 준비",
      titleEn: "Prepare Shadow Thuribles",
      descKo: "악몽 연료·뼛조각·붉은 보석으로 향로 제작(부활/패턴 대응용).",
      descEn: "Craft Shadow Thuribles (used to extinguish shadow tentacles).",
      icon: "thurible.png",
    },
    {
      id: "activate_gateway",
      titleKo: "관문 활성화",
      titleEn: "Activate the Gateway",
      descKo: "고대의 열쇠를 관문에 사용 → 'Odd Skeleton'이 깨어나며 보스전 시작.",
      descEn: "Use the Ancient Key on the gateway to awaken the Fuelweaver.",
      icon: "atrium_key.png",
    },
    {
      id: "defeat_fuelweaver",
      titleKo: "고대의 연료직공 처치",
      titleEn: "Defeat the Ancient Fuelweaver",
      descKo: "그림자 패턴·미니언·뼈벽 패턴 극복. 처치 시 뼈 갑옷·뼈 투구 청사진 보상.",
      descEn: "Survive the shadow patterns and minions. Drops Bone Helm/Armor blueprints.",
      icon: "boneshard.png",
    },
    {
      id: "reset_atrium",
      titleKo: "아트리움 리셋 (선택)",
      titleEn: "Reset the Atrium (Optional)",
      descKo: "처치 후 약 20일 뒤 관문이 다시 활성 — 반복 도전 가능.",
      descEn: "The gateway becomes reusable ~20 days after each kill.",
      icon: "nightmarefuel.png",
    },
  ],
};
