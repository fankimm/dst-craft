/**
 * 인게임 진행 체크리스트 데이터 타입.
 *
 * 출처:
 * - 은둔자(Pearl): Challenge Board 모드(workshop 3565356900) challenge_defs.lua + ko.po,
 *   인게임 prefabs/hermitcrab.lua의 TASKS enum
 * - 대변자(Celestial Champion / Alterguardian): 인게임 prefabs/moon_altar*.lua, alterguardian_phase*.lua,
 *   wagstaff_npc.lua + strings.lua + 한글모드 ko.po
 * - 연료직공(Ancient Fuelweaver / Stalker): 인게임 prefabs/atrium*.lua, stalker.lua, fossil*.lua,
 *   thurible.lua + strings.lua + 한글모드 ko.po
 */

export type QuestId = "hermit" | "celestial" | "fuelweaver";

export interface QuestStep {
  /** 안정 ID — localStorage 키로 사용, 변경 금지 */
  id: string;
  /** 단계 제목 (한국어) */
  titleKo: string;
  /** 단계 제목 (영어) */
  titleEn: string;
  /** 한 줄 설명 (한국어) */
  descKo?: string;
  /** 한 줄 설명 (영어) */
  descEn?: string;
  /** 게임 아이템 아이콘 파일명 (public/images/game-items/<icon>) */
  icon?: string;
  /** 반복 횟수 (있으면 "×N" 배지로 표시) */
  count?: number;
}

export interface Quest {
  id: QuestId;
  titleKo: string;
  titleEn: string;
  /** 탭 헤더 아이콘 */
  icon: string;
  /** 한 줄 소개 (한국어) */
  summaryKo: string;
  /** 한 줄 소개 (영어) */
  summaryEn: string;
  steps: QuestStep[];
}
