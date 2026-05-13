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
  /** 제작 가능한 아이템의 items.ts id — 클릭 시 제작탭 해당 상세로 점프 */
  craftId?: string;
  /** bosses.ts id — 클릭 시 보스탭 해당 상세로 점프 */
  bossId?: string;
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
  /** 단계 아이콘 오른쪽 아래 숫자 배지 */
  count?: number;
  /** 한 뎁스 아래 sub-checkbox 목록 */
  substeps?: QuestSubstep[];
  /** 필수 단계 표시(★) — 일부 퀘스트는 게임 메커닉상 반드시 완료해야 후속 진행 */
  required?: boolean;
  /** 선행 단계 id 목록 — 모두 완료해야 본 단계 토글 가능 (스킬트리 잠금과 동일한 UX) */
  requires?: string[];
  /** 제작 가능한 아이템의 items.ts id — 클릭 시 제작탭 해당 상세로 점프 */
  craftId?: string;
  /** bosses.ts id — 클릭 시 보스탭 해당 상세로 점프 */
  bossId?: string;
}

export interface Quest {
  id: QuestId;
  titleKo: string;
  titleEn: string;
  icon?: string;
  iconPath?: string;
  /** 섹션 부제 — Challenge Board에 없는 자체 작성은 가급적 피함 */
  summaryKo?: string;
  summaryEn?: string;
  steps: QuestStep[];
  /**
   * 목표 단계 수 (전체 totalSteps와 다를 수 있음 — 예: 은둔자는 17개 중 10개 완료가 친구 Lv 10 달성 기준).
   * 지정 시 진행률 바에 마커가 표시되고 카운트 표기가 "n/goal" 형태로 바뀜.
   */
  goal?: number;
}
