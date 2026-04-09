# 아이템 스탯 v3 리스트럭처링 TODO

> v2 데이터의 3가지 문제(구조/번역/문체) 해결을 위한 작업 목록
> 플랜 상세: `.claude/plans/delegated-swimming-spark.md`

## Phase 1: 데이터 구조 설계
- [x] 1-1. `ItemStatsV3` 인터페이스 정의 (`src/data/item-stats-v3.ts`)
  - usage 제거, tags/character/resistance/set_bonus/repair/skill_tree/immunities/effects 필드 추가
  - repair.item_id → 렌더 시 itemName()으로 한글명 해결 (번역 오류 원천 차단)
- [x] 1-2. 버전 훅 확장 (`src/hooks/use-item-stats-version.ts`)
  - StatsVersion에 "v3" 추가, 기본값 v3

## Phase 2: 마이그레이션 스크립트
- [x] 2-1. v2 → v3 자동 변환 스크립트 작성 (`scripts/migrate-v2-to-v3.py`)
  - `[태그]` 파싱 → 구조화된 필드로 분리
  - "그림자 레벨 N", "X 속성 저항 N%", "X 면역" 패턴 추출
  - 나머지 텍스트 → effects[] 배열
- [x] 2-2. 스크립트 실행하여 초안 `item-stats-v3.ts` 생성 (434개 아이템)

## Phase 3: 컨텐츠 리라이팅 (카테고리별)
> 스펙시트 톤 → 플레이어 가이드 톤. 번역은 반드시 ko.ts(ko.po) 기준.
- [x] 3-1. 방어구 (armor + hat) ~23개 — 세트 효과 집중 검수
- [x] 3-2. 무기 (weapons) ~37개
- [x] 3-3. 도구 (tools) ~25개
- [x] 3-4. 의류/장신구 (clothing, accessories) ~17개
- [x] 3-5. 마법 (magic, books, songs) ~20개
- [x] 3-6. 캐릭터 전용 ~60개
- [x] 3-7. 나머지 (건축, 항해, 장식 등) ~90개

## Phase 4: 렌더링 컴포넌트 리디자인
- [x] 4-1. `ItemStatsPanel` 컴포넌트 생성 (`src/components/crafting/ItemStatsPanel.tsx`)
  - 4개 그룹: 전투 / 방어 / 유틸리티 / 특수
  - 빈 그룹 자동 숨김
  - set_bonus → 강조 카드, repair → 아이템 이미지 + itemName(), effects → 불릿 리스트
  - TagChip 재사용
- [x] 4-2. `ItemDetail.tsx` 수정 — 기존 스탯 블록 → ItemStatsPanel 교체

## Phase 5: 정리 및 검증
- [x] 5-1. 번역 검증 — v3 아이템 vs ko.ts 크로스 체크 (충전된 뇌전창 추가)
- [x] 5-2. 문서 업데이트 — docs/ui.md (ItemStatsPanel 추가)
- [x] 5-3. `npm run build` 통과 확인
- [x] 5-4. 오답노트 작성 (docs/mistakes.md) — v2 구조적 한계 + 병렬 에이전트 주의
