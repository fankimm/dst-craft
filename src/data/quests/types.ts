/**
 * Challenge Board 모드(workshop 3565356900) 구조를 차용한 인게임 진행 체크리스트.
 *
 * 출처:
 *  - Challenge Board challenge_defs.lua의 ITEMS / INLINE_GROUPS / GROUPS
 *  - Challenge Board locales/ko.po + en.po (UI 텍스트)
 *  - 한글모드 ko.po (workshop 2391246365, STRINGS.NAMES.*)
 *  - 인게임 prefabs (보스 처치 / 게이트 메커니즘 등)
 */

export type QuestId = "hermit" | "stalker_atrium" | "alterguardian_phase3" | "alterguardian_phase4_lunarrift";

export interface QuestMaterial {
  /** 게임 prefab id (예: "cookiecuttershell") — 디버그/매핑용 */
  id: string;
  nameKo: string;
  nameEn: string;
  /** public/images/game-items/<icon> */
  icon?: string;
  /** icon보다 우선. 전체 경로(예: "/images/bosses/stalker_atrium.png") */
  iconPath?: string;
  qty: number;
}

export interface QuestStep {
  /** 안정 ID — localStorage 키로 사용, 변경 금지 */
  id: string;
  titleKo: string;
  titleEn: string;
  descKo?: string;
  descEn?: string;
  icon?: string;
  iconPath?: string;
  /** Challenge Board total_count — 표시용 ×N */
  count?: number;
  /** 한 뎁스 아래 sub-checkbox. 모두 체크되면 상위 자동 완료 */
  materials?: QuestMaterial[];
}

export interface Quest {
  id: QuestId;
  titleKo: string;
  titleEn: string;
  /** 탭 헤더 아이콘 — Challenge Board GROUP의 icon_tex 매핑 */
  icon?: string;
  iconPath?: string;
  summaryKo: string;
  summaryEn: string;
  steps: QuestStep[];
}
