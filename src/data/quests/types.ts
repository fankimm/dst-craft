/**
 * Challenge Board 모드(workshop 3565356900) 구조 + 인게임 prefabs/recipes/components를 합쳐 만든
 * 인게임 진행 체크리스트 데이터.
 */

export type QuestId =
  | "hermit"
  | "stalker_atrium"
  | "alterguardian_phase3"
  | "alterguardian_phase4_lunarrift";

/**
 * 단계 한 뎁스 아래의 sub-checkbox.
 * 재료(수량 표시)일 수도, 추가 단계(수량 없음, note만)일 수도 있음.
 * 저장 키: `<questId>:<stepId>:<id>` — id는 변경 금지.
 */
export interface QuestSubstep {
  id: string;
  nameKo: string;
  nameEn: string;
  icon?: string;
  iconPath?: string;
  /** 수량 (있으면 라벨 우측에 숫자로 표시) */
  qty?: number;
  /** 부가 설명 (한국어) — 라벨 아래 한 줄 */
  noteKo?: string;
  noteEn?: string;
}

export interface QuestStep {
  /** 안정 ID — 변경 금지 */
  id: string;
  titleKo: string;
  titleEn: string;
  descKo?: string;
  descEn?: string;
  icon?: string;
  iconPath?: string;
  /** 단계 아이콘 오른쪽 아래 숫자 배지 (예: 펄 퀘스트 plant_flowers = 10) */
  count?: number;
  /** 한 뎁스 아래 sub-checkbox 목록 */
  substeps?: QuestSubstep[];
}

export interface Quest {
  id: QuestId;
  titleKo: string;
  titleEn: string;
  icon?: string;
  iconPath?: string;
  summaryKo: string;
  summaryEn: string;
  steps: QuestStep[];
}
