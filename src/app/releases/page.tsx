"use client";

import { BackToHome } from "@/components/ui/BackToHome";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

interface Release {
  version: string;
  date: string;
  /** Developer-facing changes (not displayed) */
  dev: string[];
  /** User-facing changes (displayed) */
  changes: { ko: string[]; en: string[] };
}

const releases: Release[] = [
  {
    version: "0.10.6",
    date: "2026-04-15",
    dev: [
      "dev: NODE_ENV=development일 때도 admin-only 탭(Skills)을 표시 — 로컬 개발 편의성",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.10.5",
    date: "2026-04-15",
    dev: [
      "ui: 탭 바에 justify-between + gap-4 조합 — 평소에는 탭이 균등 분배되고, 폭을 넘으면 gap 간격으로 가로 스크롤",
    ],
    changes: {
      ko: [
        "탭 메뉴 간격이 화면 폭에 맞춰 균등 분배되도록 조정",
      ],
      en: [
        "Tab menu now distributes spacing evenly across the viewport width",
      ],
    },
  },
  {
    version: "0.10.4",
    date: "2026-04-15",
    dev: [
      "ui: 탭 바 레이아웃 조정 — flex-1 균등 분할 제거, 내용 폭 기반으로 변경",
      "ui: 탭 간 간격 gap-4로 확대, 아이콘-라벨 간격 gap-1로 축소",
      "ui: 탭 바 가로 스크롤 허용 + 스크롤바 시각적 숨김 (overflow-x-auto, scrollbar-width:none, ::-webkit-scrollbar:hidden)",
    ],
    changes: {
      ko: [
        "탭 메뉴 여백 조정 — 아이콘과 라벨은 더 붙이고, 탭 사이 간격은 넓힘",
        "탭 메뉴가 화면 폭을 넘으면 가로로 스크롤되도록 개선",
      ],
      en: [
        "Tab menu spacing — tighter icon-to-label, wider gap between tabs",
        "Tab bar scrolls horizontally when it exceeds the viewport width",
      ],
    },
  },
  {
    version: "0.10.3",
    date: "2026-04-15",
    dev: [
      "fix: 친화(allegiance) 스킬이 '총 12 스킬 + 보스 처치 토글' 조건 충족에도 잠금 상태로 남던 버그 — use-skill-tree.ts의 isLockSatisfied가 manualLocks를 받지 않아 boss_kill/manual lock의 AND 게이트 판정이 항상 실패",
      "feat: manual/boss_kill lock을 해제할 때, 해당 lock에 의존하는 습득된 스킬이 있으면 토글 차단 + shake 효과 — hook에 canUnlockManualLock 추가",
      "ui: 탭 메뉴 텍스트 줄바꿈 방지 — 'Crock Pot' 등 공백 포함 라벨이 두 줄로 깨지지 않도록 whitespace-nowrap 적용",
    ],
    changes: {
      ko: [
        "친화 스킬 잠금 버그 수정 — 12개 스킬 + 보스 처치 조건 충족 시 그림자/월광 스킬 정상 습득 가능",
        "커스텀 과제(예: 전투의 함성 10번 사용) 해제가 습득된 하위 스킬을 깨뜨릴 경우 차단하고 shake 효과로 알림",
        "탭 메뉴 텍스트가 두 줄로 깨지는 문제 수정",
      ],
      en: [
        "Fix Affinity skill lock bug — Shadow/Lunar skills now learnable when 12-skill + boss-kill conditions are met",
        "Prevent unlocking a custom task (e.g., 'Use Battle Cry 10 times') when it would break an already-learned downstream skill; shake on blocked action",
        "Fix tab menu text wrapping onto two lines",
      ],
    },
  },
  {
    version: "0.10.2",
    date: "2026-04-15",
    dev: [
      "ui: 스킬트리 필요 조건(prereq)을 노드 카드 내부 상단 pill로 이동",
      "ui: 헤드라이너/친화 등 lock 기반 게이트도 카드 내부로 이동 — 전용 lock만 흡수, 공유 lock(예: 친화 '총 12 스킬')은 그룹 상단에 게이트 라인으로 유지",
      "ui: 조건 pill들은 기본 한 줄, 넘치면 줄바꿈(flex-wrap)",
      "refactor: PrereqIndicator 제거, getPrereq/isLockSatisfied 헬퍼로 분리 — SkillNodeCard에 prereq/lockRequirements prop 전달",
      "refactor: SkillLockIndicator에서 LockConditionPill 분리 — 게이트 라인/카드 내부 모두에서 재사용",
    ],
    changes: {
      ko: [
        "스킬트리 — 각 스킬의 습득 조건(선행 스킬, 보스 처치, 커스텀 과제 등)이 노드 카드 안쪽으로 이동하여 레이아웃이 더 깔끔해짐",
        "여러 조건은 기본적으로 한 줄, 넘치면 줄바꿈으로 표시",
        "공유되는 조건(예: 친화의 '총 12개 스킬 습득')은 그룹 상단에 한 번만 표시",
      ],
      en: [
        "Skill tree — per-skill requirements (prerequisite skills, boss kills, custom tasks) are now displayed inside node cards for a cleaner layout",
        "Multiple requirements display on a single row by default, wrapping when they overflow",
        "Shared requirements (e.g., Affinity's 'Learn 12 skills') remain as a single group-level gate",
      ],
    },
  },
  {
    version: "0.10.0",
    date: "2026-04-15",
    dev: [
      "feat: 스킬트리 시뮬레이터 탭 추가 (Git Graph 스타일 UI)",
      "data: 11개 캐릭터 스킬트리 데이터 추출 — 게임 Lua → TypeScript 변환 (~403 노드)",
      "data: ko.po + strings.lua에서 스킬 번역 추출 (타이틀/설명/그룹명/잠금 조건)",
      "feat: 스킬 습득/해제 시뮬레이션 + 의존성 검증 + 상호 배제 (월광/그림자)",
      "feat: 스킬 상세 패널에서 해금 제작 아이템 크로스링크 (스킬→제작탭)",
      "feat: localStorage 기반 상태 저장 (캐릭터별)",
      "ui: SVG Rail + SkillNodeCard + SkillLockIndicator + SkillDetailSheet 컴포넌트",
      "ui: AppShell에 스킬 탭 추가 (6탭 구성)",
    ],
    changes: {
      ko: [
        "스킬트리 시뮬레이터 추가 — 11개 캐릭터의 스킬트리를 확인하고 습득 시뮬레이션",
        "스킬 상세 패널에서 해금 아이템 확인 및 제작탭 이동 지원",
      ],
      en: [
        "Skill tree simulator — browse and simulate skill allocation for 11 characters",
        "View unlocked crafting items from skill detail panel",
      ],
    },
  },
  {
    version: "0.9.2",
    date: "2026-04-15",
    dev: [
      "fix: 체류시간 중복 기록 — visibilitychange마다 샘플 전송 → sent 플래그로 세션당 1회만",
      "fix: 재방문율 공식 오류 — returnTotal/totalPV → returnTotal/totalUV",
      "fix: 관리자 IP 정제를 destructive 삭제에서 응답 시점 필터링(non-destructive)으로 변경",
      "feat: /track(5/분), /event(30/분) IP 기반 레이트 리밋 추가",
      "feat: 별점 IP 기반 중복 제출 방지 (변경은 허용)",
      "ui: KR 제외 시 필터 미적용 지표에 점선 테두리 + '필터 미적용' 표시",
      "fix: 'direct' referrer를 도메인 referrer와 분리 — 저장/표시에서 제외",
    ],
    changes: {
      ko: [
        "방문자 통계 정확도 개선 — 체류시간·재방문율 계산 수정",
        "봇 공격 방지를 위한 레이트 리밋 추가",
        "별점 중복 제출 방지",
      ],
      en: [
        "Analytics accuracy improvements — duration & return rate fixes",
        "Rate limiting for bot protection",
        "Prevent duplicate star rating submissions",
      ],
    },
  },
  {
    version: "0.9.1",
    date: "2026-04-15",
    dev: [
      "SEO: 정적 sitemap.xml 삭제 → 동적 sitemap.ts만 사용",
      "SEO: robots.txt에 dev/debug 경로 차단 추가",
      "SEO: 메인 페이지에 SSR 내부 링크 푸터 추가 (155개 링크 — item 60, food 40, boss 29, character 19)",
      "fix: CookingApp 빌드 에러 수정 (debouncedQuery, activeFilter 잔재 코드 제거)",
    ],
    changes: {
      ko: [
        "검색엔진 최적화 개선 — 구글 인덱싱 속도 향상",
      ],
      en: [
        "SEO improvements — faster Google indexing",
      ],
    },
  },
  {
    version: "0.9.0",
    date: "2026-04-14",
    dev: [
      "보스 8종 추가: 천상의 대변자, 고철덩이 늑대돼지, 그림자 체스 말, 서리턱상어, 트리가드, 바르그, 귀신들린 바르그, 초파리 대왕",
      "캐릭터 선호 음식 표시 (요리 탭 레시피 상세)",
      "v1/v2 아이템 스탯 시스템 폐기 → v3 전용",
      "버전 스위칭 훅(use-item-stats-version) 및 DevMenu 토글 제거",
      "PWA SW 캐시 자동 갱신 (빌드마다 커밋 SHA 해시 주입)",
    ],
    changes: {
      ko: [
        "보스 8종 추가 — 천상의 대변자, 서리턱상어, 트리가드 등",
        "요리 탭에서 캐릭터 선호 음식 표시",
        "PWA 캐시 갱신 문제 해결",
      ],
      en: [
        "Added 8 bosses — Celestial Champion, Frostjaw, Treeguard, and more",
        "Character favorite food indicator in cooking tab",
        "Fixed PWA cache refresh issues",
      ],
    },
  },
  {
    version: "0.8.3",
    date: "2026-04-06",
    dev: [
      "SEO 페이지 CTA 딥링크 적용 (food, item, boss, character → 해당 상세패널 직접 열기)",
      "Boss 탭 URL 파라미터 딥링크 지원 추가 (?tab=bosses&boss={id})",
      "SEO 페이지 영어 통일 — 아이템/보스/캐릭터 리스트에서 영어를 주요 이름으로 변경",
    ],
    changes: {
      ko: [
        "SEO 페이지에서 앱으로 이동 시 해당 아이템 상세를 바로 표시",
      ],
      en: [
        "SEO pages now deep-link to the specific item detail panel",
      ],
    },
  },
  {
    version: "0.8.0",
    date: "2026-03-26",
    dev: [
      "천상/대황간/그림자 공예/동물 친구 카테고리 4개 추가 + 아이템 54개 재분류",
      "카테고리 아이콘 인게임 제작탭 아이콘으로 교체 (위키 Station Icon)",
      "스테이션 태그 아이콘 통일 (celestial, lunar_forge, shadow_forge, critter_lab)",
      "상세 패널 스테이션-카테고리 태그 중복 표시 제거",
      "인게임 소스코드 기반 아이템 스탯 전수 검증 (tuning.lua + prefab 소스)",
      "usage 필드 141개 보강 — 특수 효과, 세트 보너스, on-hit/on-equip 효과 전부 추가",
      "삼지창/럭셔리팬/부적류 등 수치 오류 수정",
      "설정 페이지 익명 피드백 기능 + 텔레그램 알림 + 상태 관리",
      "피드백 textarea iOS 자동 확대 방지",
      "접속국가 티커 애니메이션 개선",
      "푸터에서 GitHub/이메일 → 설정 페이지로 이동",
      "SW 캐시 버전 bump (이미지 교체 반영)",
    ],
    changes: {
      ko: [
        "천상/대황간/그림자 공예/동물 친구 카테고리 추가",
        "인게임 소스코드 기반 아이템 특수 효과 전수 추가 (141개 아이템)",
        "설정 페이지에 익명 의견 보내기 기능 추가",
        "접속국가 티커 애니메이션 개선",
      ],
      en: [
        "Added Celestial/Lunar Forge/Shadow Forge/Critter Den categories",
        "Added item special effects based on game source code (141 items)",
        "Added anonymous feedback feature in settings",
        "Improved country ticker animation",
      ],
    },
  },
  {
    version: "0.7.2",
    date: "2026-03-24",
    dev: [
      "ItemDetail에 아이템 스탯 표시 추가 (공격력, 내구도, 방어력 등)",
      "item-stats.ts 데이터 보강 (slots, usage 다국어, shadow_bonus 실제 데미지 계산 표시)",
      "Beta 뱃지로 스탯 데이터 불완전 표시",
      "DevMenu 외부 클릭 감지 mousedown → pointerdown 수정 (모바일 대응)",
      "dev/stat-designs 페이지에 Beta 표시 디자인 비교 추가",
    ],
    changes: {
      ko: [
        "아이템 상세에 스탯 정보 표시 (공격력, 내구도, 방어력, 이동속도 등)",
        "스탯 데이터 보강 (107개 → 확장)",
      ],
      en: [
        "Item detail now shows stats (damage, durability, armor, speed, etc.)",
        "Expanded item stat data coverage",
      ],
    },
  },
  {
    version: "0.7.1",
    date: "2026-03-11",
    dev: [
      "설정 페이지 별점 섹션에 평가 분포 차트 추가 (별점 준 사용자 한정)",
      "설정 페이지에 국가별 접속 TOP 5 슬라이드 티커 추가",
      "Worker /rating 응답에 ratings 분포 데이터 추가",
      "Worker /top-countries 공개 엔드포인트 추가",
      "Worker 공개 엔드포인트 Redis pipeline 응답 파싱 버그 수정",
      "별점 평가 후 리뷰 프롬프트 반복 표시 버그 수정 (permanent dismiss 처리)",
      "별점 유도 패널에서 평가 시 즉시 닫고 상단 토스트로 변경",
      "통계 페이지 국가명에서 국가 코드 괄호 표기 제거",
    ],
    changes: {
      ko: [
        "설정 페이지에 별점 분포 차트 추가",
        "설정 페이지에 국가별 접속 순위 TOP 5 표시",
        "별점 평가 후 리뷰 요청이 반복되던 버그 수정",
        "별점 유도 패널 UX 개선 — 평가 시 즉시 닫힘",
      ],
      en: [
        "Added rating distribution chart in settings",
        "Added top 5 countries ticker in settings",
        "Fixed review prompt repeating after rating",
        "Improved rating prompt UX — closes immediately after rating",
      ],
    },
  },
  {
    version: "0.7.0",
    date: "2026-03-11",
    dev: [
      "캐릭터 데이터 보강: stats(HP/Hunger/Sanity), perks, motto, difficulty, 한국어 번역 추가",
      "캐릭터 목록 페이지 (/characters) — 전체 캐릭터 그리드, 난이도·스탯 표시",
      "캐릭터 개별 페이지 (/character/[slug]) — SEO 텍스트(Overview, Abilities, Playstyle), FAQ(FAQPage schema), 전용 아이템 링크, 관련 캐릭터 내부 링크",
      "캐릭터 SEO 텍스트 생성기 (generateCharacterSeoText) 추가",
      "sitemap.ts에 캐릭터 페이지 추가",
      "browse 페이지에 캐릭터 섹션 추가",
    ],
    changes: {
      ko: [
        "캐릭터 가이드 페이지 추가 — 19명 캐릭터별 스탯, 능력, 전용 아이템, FAQ",
        "캐릭터 목록 페이지 추가 (/characters)",
      ],
      en: [
        "Added character guide pages — stats, perks, exclusive items, and FAQ for all 19 characters",
        "Added characters listing page (/characters)",
      ],
    },
  },
  {
    version: "0.6.0",
    date: "2026-03-11",
    dev: [
      "SEO 텍스트 자동 생성 시스템 (src/lib/seo-text.ts) — food/boss/item 페이지 전체 적용",
      "Food 페이지: How to Cook, Stats Explanation, Best Ingredients 섹션 + FAQ(details/summary) + FAQPage schema + Related Recipes 내부 링크",
      "Boss 페이지: Overview, Loot Description, Strategy 섹션 + FAQ + FAQPage schema + Related Bosses 내부 링크",
      "Item 페이지: How to Craft, Uses and Tips 섹션 + FAQ + FAQPage schema",
      "모든 페이지 H1에 SEO 키워드 포함 (Recipe | DST, Boss Guide, Crafting Guide)",
      "meta description 강화 — 'Learn how to...' + 'See ingredients, stats, and tips' 형태로 변경",
      "통계 페이지에 일자별 누적 접속자 그래프 추가",
      "admin IP 누적 세트(dst:admin-ips) Worker 버그 수정",
    ],
    changes: {
      ko: [
        "음식/보스/아이템 개별 페이지에 설명 텍스트, FAQ, 관련 항목 링크 추가 (SEO 강화)",
        "통계 페이지에 일자별 누적 접속자 그래프 추가",
      ],
      en: [
        "Added SEO text sections (How to cook/craft, FAQ, tips) to all food/boss/item pages",
        "Added cumulative visitors chart to stats page",
      ],
    },
  },
  {
    version: "0.5.1",
    date: "2026-03-09",
    dev: [
      "보스 탭 즐겨찾기 기능 추가 (useFavorites 훅 연동, BossCard/BossDetail에 하트 토글)",
      "최근 조회 아이콘을 역행의 시계(pocketwatch_warp.png)로 변경 (제작/요리/보스 전체)",
      "공통 컴포넌트/훅 대규모 리팩토링: DetailPanel, SortDropdown, ViewCount, useDetailPanel, useSlideAnimation, stat-utils 추출",
      "BackToHome 컴포넌트에 iOS safe-area-inset-top 패딩 추가",
      "Footer/SupportPill 하단 여백 축소",
      "Admin 클릭 카운트 배지 스타일을 rounded-full 뱃지로 변경",
    ],
    changes: {
      ko: [
        "보스 탭 즐겨찾기 기능 추가",
        "최근 조회 아이콘 변경 (역행의 시계)",
        "릴리즈/통계 페이지 상단 상태바 겹침 수정",
        "푸터 하단 여백 조정",
      ],
      en: [
        "Added favorites to Bosses tab",
        "Changed recent icon to Backstep Watch",
        "Fixed status bar overlap on releases/stats pages",
        "Adjusted footer bottom padding",
      ],
    },
  },
  {
    version: "0.5.0",
    date: "2026-03-09",
    dev: [
      "iOS Safe Area: viewport-fit: cover + z-60 status bar cover div로 상세 패널 오픈 시 상태바 딤 방지",
      "하단 safe-area-inset-bottom 패딩 Footer/SupportPill에서 개별 처리",
      "Footer 리디자인: Ko-fi 도네이션 버튼 부각 + GitHub/Mail 아이콘 + sr-only SEO 링크",
      "SupportPill 컴포넌트 신규 — 모든 상세 패널 하단에 Ko-fi 도네이션 버튼 추가",
      "브레드크럼 개선: 탭 이름(Crafting Guide 등)을 중간 세그먼트로 추가",
      "탭 재탭 시 해당 탭 홈으로 이동 (dst-tab-go-home 커스텀 이벤트)",
      "클릭 수 표시: admin은 그리드 아이템에 카운트 표시, 전체 유저는 상세에서 조회수 표시",
      "요리솥 시뮬레이션 결과 추적 (trackItemClick sim: prefix) + 결과 카드에 cooked 횟수 표시",
      "최근 조회 카테고리: 모든 탭(제작/요리/보스)에 localStorage 기반 최근 본 항목 카테고리 추가",
      "use-recent.ts 훅 신규 (localStorage, MAX_RECENT=30)",
      "i18n: recent 키 추가",
    ],
    changes: {
      ko: [
        "iOS 상태바 딤 현상 수정",
        "푸터 디자인 개선 — 후원 버튼 부각",
        "모든 상세 패널 하단에 후원 버튼 추가",
        "브레드크럼에 탭 이름 표시",
        "탭 재탭 시 홈으로 이동",
        "아이템 조회수 표시 (상세 패널)",
        "요리솥 시뮬레이션 결과 횟수 표시",
        "최근 조회 카테고리 추가 (제작/요리/보스 전체 탭)",
      ],
      en: [
        "Fixed iOS status bar dimming when panels open",
        "Footer redesign — donation button prominence",
        "Added donation button to all detail panels",
        "Breadcrumb now shows tab name",
        "Re-tap active tab to go home",
        "Item view count display (detail panels)",
        "Cookpot simulation result tracking",
        "Recently viewed category added to all tabs",
      ],
    },
  },
  {
    version: "0.4.3",
    date: "2026-03-06",
    dev: [
      "요리 상세 스탯(체력/허기/정신력) UI를 카드형 → 가로 인라인으로 변경",
      "유통기한/조리시간/온도를 가로 인라인 한 줄로 통합, flex-1 균등 배치",
      "온도 라벨 'Temp' 번역 누락 수정 → i18n cooking_temp 키 추가",
      "단위 텍스트(일, 초) text-muted-foreground 적용",
      "재료 수량 표기 ×2 → 2 로 간소화 (비교 연산자 ≥ 등은 유지)",
      "데브 메뉴: 스탯 디자인 비교 페이지 추가",
    ],
    changes: {
      ko: [
        "요리 상세 스탯 UI 개선 — 가로 인라인 레이아웃으로 변경",
        "유통기한·조리시간·온도를 한 줄로 통합 표시",
        "온도 라벨 한국어 번역 추가",
        "재료 수량 표기 간소화 (×2 → 2)",
      ],
      en: [
        "Cooking detail stat UI redesign — horizontal inline layout",
        "Perish/cook time/temperature merged into a single row",
        "Added Korean translation for temperature label",
        "Simplified ingredient quantity display (×2 → 2)",
      ],
    },
  },
  {
    version: "0.4.2",
    date: "2026-03-06",
    dev: [
      "보스 전리품 검색: SearchWithSuggestions + TagChip 패턴 적용 (드롭다운 서제스천 + 태그)",
      "보스 블루프린트 pill 클릭 → 제작 탭 해당 아이템 상세로 이동 (cross-tab navigation)",
      "제작 탭 '블루프린트 필요' 칩 클릭 → 보스 전리품 검색으로 이동",
      "블루프린트 pill에 점선 밑줄(클릭 가능 힌트) 추가",
      "모든 상세 패널 하단 여백을 푸터와 동일하게 통일 (safe-area-inset-bottom)",
      "디바운스 전체 300ms 통일 (요리 200→300, 요리솥 신규 추가)",
      "i18n: boss_loot_search, boss_loot_search_result 키 추가",
    ],
    changes: {
      ko: [
        "보스 전리품 검색 기능 추가 — 드롭다운 + 태그 방식",
        "보스 블루프린트 클릭 시 제작법으로 이동",
        "제작 상세 '블루프린트 필요' 클릭 시 보스 전리품 검색으로 이동",
        "모든 상세 패널 하단 여백 통일 (아이폰 safe area)",
        "검색 디바운스 300ms 통일",
      ],
      en: [
        "Added boss loot search — dropdown suggestions + tag chips",
        "Blueprint loot click navigates to crafting recipe",
        "Crafting 'Blueprint Required' click navigates to boss loot search",
        "Unified bottom padding on all detail panels (iPhone safe area)",
        "Unified search debounce to 300ms",
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-03-06",
    dev: [
      "보스/요리 탭 '전체' 카테고리에 2×2 합성 아이콘(bosses_all.png, cooking_all.png) 적용",
      "BossesApp: CSS 그리드 → 단일 합성 이미지로 교체",
      "CookingApp: meatballs.png → cooking_all.png로 교체",
      "허기 추천 임계값 75→62.5 (미트볼, 몬스터 타르타르 포함)",
      "Footer 하단 여백 0.75rem→1.5rem (아이폰 모서리 여유)",
      "보스 상세: 카테고리 뱃지 수동 span → TagChip 컴포넌트",
      "보스 상세: 전리품 표시를 TagChip 스타일 pill로 통일 (아이콘+라벨)",
      "블루프린트 전리품: BP 텍스트 → 블루프린트 아이콘 사용",
      "공포의 쌍둥이 nameKo를 ko.po 통칭('공포의 쌍둥이')으로 변경",
    ],
    changes: {
      ko: [
        "보스/요리 탭 '전체' 카테고리 아이콘 개선 (2×2 합성 이미지)",
        "허기 추천에 미트볼 포함",
        "보스 상세 전리품 UI 개선 — 칩 스타일로 통일",
        "블루프린트 전리품에 블루프린트 아이콘 표시",
        "공포의 쌍둥이 이름 수정",
        "푸터 하단 여백 추가 (아이폰 하단 여유)",
      ],
      en: [
        "Improved boss/cooking 'All' category icons (2×2 composite image)",
        "Meatballs now included in hunger recommendations",
        "Boss detail loot UI improved — unified chip style",
        "Blueprint loot now shows blueprint icon",
        "Fixed Twins of Terror Korean name",
        "Added footer bottom padding for iPhone",
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-03-06",
    dev: [
      "CraftingItem 타입에 healthCost, nounlock, builderSkill 필드 추가",
      "워톡스 3개 아이템 버그 수정: characterOnly + station: character 추가",
      "맥스웰 리워크 반영: deprecated 그림자 인형 4개 제거 (Logger/Miner/Digger/Duelist)",
      "Codex Umbra에 healthCost: 50 추가",
      "111개 아이템에 builderSkill 메타데이터 추가 (10개 캐릭터)",
      "316개 아이템에 nounlock: true 추가",
      "14개 아이템에 healthCost 추가 (Telltale Heart, Meat Effigy, Wormwood 등)",
      "ItemDetail에 체력 소모/스킬트리/스테이션 필요 표시 UI 추가",
      "cookpot-ingredients: rawCookable 필드 추가, 꽃잎/나뭇잎 raw 버전 요리솥 제외",
      "Milkmade Hat(우유 짜는 모자) 요리 레시피 추가 + 시뮬레이터 매칭 함수",
      "FoodType에 nonfood 타입 추가",
      "i18n에 health_cost, skill_tree_required, station_required, prototypable, foodtype_nonfood 번역 키 추가",
    ],
    changes: {
      ko: [
        "워톡스 아이템 버그 수정 — 캐릭터 전용 + 스킬트리 표시",
        "맥스웰 리워크 반영 — deprecated 그림자 인형 제거",
        "아이템 상세에 체력 소모, 스킬트리, 스테이션 필요 정보 표시",
        "요리솥에 넣을 수 없는 raw 꽃잎/나뭇잎 제거 (말린 것만 유효)",
        "우유 짜는 모자 요리 레시피 추가 + 시뮬레이터 지원",
        "111개 스킬트리 레시피 + 316개 스테이션 전용 아이템 데이터 추가",
      ],
      en: [
        "Fixed Wortox items — added character-only + skill tree display",
        "Applied Maxwell rework — removed deprecated shadow puppets",
        "Added health cost, skill tree, and station-required info to item details",
        "Removed raw petals/foliage from crock pot (only dried versions valid)",
        "Added Milkmade Hat cooking recipe + simulator support",
        "Added 111 skill tree recipes + 316 station-only item data",
      ],
    },
  },
  {
    version: "0.3.1",
    date: "2026-03-05",
    dev: [
      "ReviewPrompt.tsx 신규 생성 — iOS 스타일 바텀시트 (별점 + GitHub Star + 공유)",
      "AppShell.tsx에 방문 횟수 카운트 + 리뷰 프롬프트 트리거 로직 추가",
      "Worker POST /rate 엔드포인트 추가 (HINCRBY dst:ratings)",
      "Worker /event에 share, github_star_click 이벤트 타입 추가",
      "Worker /stats에 ratings, avgRating, totalRatings 응답 필드 추가",
      "analytics.ts에 submitRating() 함수 + trackEvent 타입 확장",
      "i18n.ts에 review_* 번역 키 6개 추가 (ko/en)",
      "stats/page.tsx에 별점 분포 통계 카드 추가",
      "docs/terminology.md에 리뷰 프롬프트 용어 추가",
    ],
    changes: {
      ko: [
        "리뷰 프롬프트 추가 — 5회 이상 방문 시 별점 평가, GitHub Star, 공유 요청",
        "통계 페이지에 별점 분포 차트 추가",
      ],
      en: [
        "Added review prompt — star rating, GitHub Star, and share after 5+ visits",
        "Added rating distribution chart to stats page",
      ],
    },
  },
  {
    version: "0.3.0",
    date: "2026-03-04",
    dev: [
      "SettingsPage에 PWA 설치 가이드 섹션 추가 (beforeinstallprompt + iOS Safari 가이드)",
      "i18n.ts에 PWA 설치 관련 번역 키 6개 추가 (ko/en)",
      "로딩화면 MutationObserver + data-app-ready → DOMContentLoaded 기반으로 변경",
      "el.remove() → display:none으로 변경 (React hydration 불일치 방지)",
      "AppShell에서 data-app-ready 속성 제거",
    ],
    changes: {
      ko: [
        "설정에 앱 설치 가이드 추가 — 브라우저별 PWA 설치 안내",
        "통계/릴리즈 노트 페이지 진입 시 로딩화면이 오래 표시되던 문제 수정",
        "하위 페이지에서 뒤로가기 시 에러 발생하던 문제 수정",
      ],
      en: [
        "Added PWA install guide in settings — browser-specific installation instructions",
        "Fixed loading screen staying too long on stats/release notes pages",
        "Fixed back navigation error from sub-pages",
      ],
    },
  },
  {
    version: "0.2.1",
    date: "2026-03-01",
    dev: [
      "reqTranslations(CookingApp.tsx), cookpot-ingredients.ts nameKo, ko.ts foods를 DST 한글모드 ko.po 기준으로 전면 수정",
      "CLAUDE.md에 Korean Translation Rules 섹션 추가 — 번역 기준 문서화",
    ],
    changes: {
      ko: [
        "요리 재료/음식 이름을 한글모드 번역에 맞춰 수정",
      ],
      en: [
        "Fixed cooking ingredient/food names to match Korean community translation mod",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-03-01",
    dev: [
      "src/app/favicon.ico 삭제 — Next.js App Router route convention 충돌 해소, public/favicon.ico만 사용",
      "Worker: ADMIN_EMAILS 환경변수 추가 (wrangler.toml), Env 인터페이스 확장",
      "Worker /auth/google: 이메일 화이트리스트 매칭 시 JWT에 role: admin 포함",
      "Worker /stats: Bearer JWT 인증 + role === admin 검증 필수, 미인증 시 401",
      "use-auth.tsx: JWT payload에서 role 추출, isAdmin: boolean 컨텍스트에 노출",
      "favorites-api.ts: AuthUser에 role?: string 추가",
      "i18n.ts: insight 번역 키 추가 (ko: 통계, en: Insight)",
      "SettingsPage: isAdmin일 때 Insight 버튼 (BarChart3 아이콘) 표시",
      "analytics.ts: isAdmin() localStorage 방식 제거, trackVisit/initDurationTracking/trackEvent에 skipTracking 파라미터 추가",
      "analytics.ts: fetchAnalytics(token) — JWT를 Authorization 헤더에 포함",
      "stats/page.tsx: 비관리자 접근 시 홈 리다이렉트, 7일 추이 SVG 영역(area) 차트로 변경",
    ],
    changes: {
      ko: [
        "파비콘이 시크릿모드에서 정상 표시되도록 수정",
        "관리자 전용 통계 페이지 — 로그인 기반 접근 제어",
        "설정에 통계(Insight) 바로가기 추가 (관리자만 표시)",
        "7일 접속 추이 차트를 영역(area) 차트로 개선",
      ],
      en: [
        "Fixed favicon not showing in incognito mode",
        "Admin-only stats page with login-based access control",
        "Insight shortcut in settings (visible to admins only)",
        "7-day trend chart upgraded to area chart",
      ],
    },
  },
  {
    version: "0.1.1",
    date: "2026-03-01",
    dev: [
      "릴리즈 노트 페이지 다국어 지원 (changes를 { ko, en } 구조로 변경)",
      "releases/page.tsx를 client component로 전환 (useSettings 사용)",
      "i18n.ts에 release_notes 번역 키 추가",
      "SettingsPage Release Notes 링크 텍스트 다국어 처리",
    ],
    changes: {
      ko: [
        "릴리즈 노트 다국어 지원 — 언어 설정에 따라 한국어/영어 표시",
      ],
      en: [
        "Release notes now displayed in your selected language",
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-03-01",
    dev: [
      "Google Identity Services (GIS) renderButton 방식 로그인 구현",
      "Worker에 JWT 발급/검증 (HMAC SHA-256) + /auth/google 엔드포인트 추가",
      "Worker에 GET/POST /favorites 엔드포인트 추가 (Redis Set)",
      "use-auth.tsx: AuthProvider + useAuth 훅 (GIS renderButton, JWT localStorage 저장)",
      "use-favorites.tsx: FavoritesProvider + useFavorites 훅 (비로그인=localStorage, 로그인=Redis)",
      "favorites-api.ts: Worker 즐겨찾기 API 클라이언트",
      "로그인/비로그인 즐겨찾기 완전 분리 (마이그레이션 없음)",
      "제작탭 즐겨찾기 카운트: 제작 아이템만 필터링 (요리 포함 안 됨)",
      "ItemIcon/ItemDetail/RecipeCard/RecipeDetail에 인게임 체력 아이콘 즐겨찾기 토글 추가",
      "CategoryGrid/CookingApp에 즐겨찾기 카테고리 타일 추가",
      "SettingsPage에 Google 로그인/프로필/로그아웃 UI (key prop으로 DOM 재사용 방지)",
      "비로그인 즐겨찾기 매번 경고 토스트 구현",
      "설정 브랜딩 텍스트 스타일 변경 + 버전정보 하단 이동",
      "wrangler.toml에 GOOGLE_CLIENT_ID 변수 추가",
      "CORS 헤더에 Authorization 허용 + localhost 지원",
    ],
    changes: {
      ko: [
        "즐겨찾기 기능 추가 — 아이템과 레시피를 즐겨찾기로 저장",
        "Google 로그인 — 기기 간 즐겨찾기 동기화",
        "모든 아이템 카드와 상세 패널에 즐겨찾기 토글",
        "제작/요리 홈 화면에 즐겨찾기 카테고리 타일",
        "설정에 계정 섹션 (로그인/로그아웃)",
        "비로그인 시 즐겨찾기 저장 경고 토스트",
      ],
      en: [
        "Added favorites — save items and recipes to your favorites",
        "Google sign-in — sync favorites across devices",
        "Favorite toggle on all item cards and detail panels",
        "Favorites category tile on crafting/cooking home screens",
        "Account section in settings (sign in/out)",
        "Warning toast when saving favorites without signing in",
      ],
    },
  },
  {
    version: "0.0.4",
    date: "2026-02-28",
    dev: [
      "Desktop grid max-width 4xl constraint + mx-auto center alignment",
      "AppShell title bar removed, branding moved to SettingsPage",
      "Release Notes page added at /releases route (server component)",
      "Analytics Worker ALLOWED_ORIGIN changed from github.io to vercel.app",
      "Worker parseOS() reordered: iOS check before macOS to fix UA matching",
      "Redis dst:os hash migrated via one-time /migrate-os endpoint",
      "public/favicon.ico replaced with icon-192.png derived ICO",
      "Removed Vercel template SVGs (vercel.svg, next.svg, file.svg, globe.svg, window.svg)",
      "CLAUDE.md updated with release notes workflow rules",
    ],
    changes: {
      ko: [
        "데스크톱 레이아웃 개선 (콘텐츠 중앙 정렬)",
        "깔끔한 UI: 타이틀 바 제거로 화면 공간 확보",
        "릴리즈 노트 페이지 추가 (설정 > 릴리즈 노트)",
        "새 도메인에서 통계가 로드되지 않던 문제 수정",
        "iOS 기기가 macOS로 잘못 표시되던 문제 수정",
        "앱 파비콘이 정상 표시되도록 수정",
      ],
      en: [
        "Improved desktop layout with centered content",
        "Cleaner UI: title bar removed for more screen space",
        "Release Notes page added (Settings > Release Notes)",
        "Fixed analytics not loading on new domain",
        "Fixed iOS devices incorrectly showing as macOS in stats",
        "App favicon now shows correctly",
      ],
    },
  },
  {
    version: "0.0.3",
    date: "2026-02-27",
    dev: [
      "Vercel migration: removed basePath, switched from static export to SSR",
      "SEO: added cooking keywords to metadata, updated OG tags",
      "Title rebranding + meta theme-color dark mode support",
      "Cooking tab category icons changed to meatballs",
      "SearchWithSuggestions extracted as shared component",
    ],
    changes: {
      ko: [
        "더 빠른 호스팅으로 이전 (Vercel)",
        "검색 엔진 노출 개선",
        "앱 브랜딩 업데이트",
        "요리 탭 아이콘 새로고침",
        "모든 탭에서 검색 추천 사용 가능",
      ],
      en: [
        "Migrated to faster hosting (Vercel)",
        "Improved search engine visibility",
        "Updated app branding",
        "Cooking tab icons refreshed",
        "Search suggestions now available across all tabs",
      ],
    },
  },
  {
    version: "0.0.2",
    date: "2026-02-26",
    dev: [
      "CookingApp component with full recipe browsing",
      "RecipeDetail bottom sheet with stats grid, requirements parser, effect badges",
      "CookingSearchInput with recipe suggestion dropdown",
      "TagChip + filter system for foodType/station/effect",
      "Recommend categories: health >= 40, sanity >= 15, hunger >= 75",
    ],
    changes: {
      ko: [
        "새 요리 탭: 모든 요리솥 레시피 탐색",
        "레시피 상세 정보 — 체력, 허기, 정신력 수치",
        "레시피 이름으로 검색",
        "음식 유형, 조리 기구, 특수 효과 필터",
        "체력, 정신력, 허기 추천 레시피",
      ],
      en: [
        "New Cooking tab: browse all crock pot recipes",
        "Recipe details with health, hunger, sanity stats",
        "Search recipes by name",
        "Filter by food type, cooking station, and special effects",
        "Recommended recipes for health, sanity, and hunger",
      ],
    },
  },
  {
    version: "0.0.1",
    date: "2026-02-25",
    dev: [
      "Initial release: Next.js 16 App Router + Tailwind v4 + shadcn/ui",
      "CraftingApp with category grid, item grid, item detail bottom sheet",
      "Tag-based search with SearchBar + useSearch hook",
      "CharacterSelector for character-specific items",
      "i18n system with 13 locales, client-side locale detection",
      "Dark/light/system theme via useSettings hook + localStorage",
      "PWA: manifest.json + service worker + installable",
      "Analytics: Cloudflare Worker + Upstash Redis",
    ],
    changes: {
      ko: [
        "첫 출시!",
        "카테고리별 모든 제작 레시피 탐색",
        "아이템 상세 정보: 재료, 제작대, 캐릭터 정보",
        "스마트 자동완성 검색",
        "캐릭터 전용 아이템 탐색",
        "13개 언어 지원",
        "다크/라이트 테마",
        "앱으로 설치 가능 (PWA)",
      ],
      en: [
        "First release!",
        "Browse all crafting recipes by category",
        "View item details: materials, crafting stations, character info",
        "Search items with smart autocomplete",
        "Browse character-specific items",
        "13 languages supported",
        "Dark and light theme",
        "Install as app (PWA)",
      ],
    },
  },
];

export default function ReleasesPage() {
  const { resolvedLocale } = useSettings();
  const changes = (release: Release) =>
    resolvedLocale === "ko" ? release.changes.ko : release.changes.en;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        <h1 className="text-lg font-bold">{t(resolvedLocale, "release_notes")}</h1>

        {releases.map((release) => (
          <section key={release.version} className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold">v{release.version}</h2>
              <span className="text-xs text-muted-foreground">{release.date}</span>
            </div>
            <ul className="space-y-1 text-sm text-foreground/80">
              {changes(release).map((change, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">-</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
