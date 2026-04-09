# 아이템 스탯 v3 리스트럭처링 TODO

> v2 데이터의 3가지 문제(구조/번역/문체) 해결을 위한 작업 목록
> 플랜 상세: `.claude/plans/delegated-swimming-spark.md`

## Phase 1: 데이터 구조 설계
- [ ] 1-1. `ItemStatsV3` 인터페이스 정의 (`src/data/item-stats-v3.ts`)
  - usage 제거, tags/character/resistance/set_bonus/repair/skill_tree/immunities/effects 필드 추가
  - repair.item_id → 렌더 시 itemName()으로 한글명 해결 (번역 오류 원천 차단)
- [ ] 1-2. 버전 훅 확장 (`src/hooks/use-item-stats-version.ts`)
  - StatsVersion에 "v3" 추가, 기본값 v3

## Phase 2: 마이그레이션 스크립트
- [ ] 2-1. v2 → v3 자동 변환 스크립트 작성 (`scripts/migrate-v2-to-v3.ts`)
  - `[태그]` 파싱 → 구조화된 필드로 분리
  - "그림자 레벨 N", "X 속성 저항 N%", "X 면역" 패턴 추출
  - 나머지 텍스트 → effects[] 배열
- [ ] 2-2. 스크립트 실행하여 초안 `item-stats-v3.ts` 생성 (423개 아이템)

## Phase 3: 컨텐츠 리라이팅 (카테고리별)
> 스펙시트 톤 → 플레이어 가이드 톤. 번역은 반드시 ko.ts(ko.po) 기준.
- [ ] 3-1. 방어구 (armor + hat) ~30개 — 세트 효과 집중 검수
- [ ] 3-2. 무기 (weapons) ~40개
- [ ] 3-3. 도구 (tools) ~50개
- [ ] 3-4. 의류/장신구 (clothing, accessories) ~30개
- [ ] 3-5. 마법 (magic, books, songs) ~45개
- [ ] 3-6. 캐릭터 전용 ~150개
- [ ] 3-7. 나머지 (건축, 항해, 장식 등) ~80개

## Phase 4: 렌더링 컴포넌트 리디자인
- [ ] 4-1. `ItemStatsPanel` 컴포넌트 생성 (`src/components/crafting/ItemStatsPanel.tsx`)
  - 4개 그룹: 전투 / 방어 / 유틸리티 / 특수
  - 빈 그룹 자동 숨김
  - set_bonus → 강조 카드, repair → 아이템 이미지 + itemName(), effects → 불릿 리스트
  - TagChip 재사용
- [ ] 4-2. `ItemDetail.tsx` 수정 — 기존 스탯 블록(241-272줄) → ItemStatsPanel 교체

## Phase 5: 정리 및 검증
- [ ] 5-1. 번역 검증 — v3 내 모든 아이템명 참조 vs ko.ts 크로스 체크
- [ ] 5-2. 문서 업데이트 — docs/ui.md, docs/terminology.md
- [ ] 5-3. `npm run build` 통과 + 주요 아이템 수동 확인
- [ ] 5-4. 오답노트 작성 (docs/mistakes.md) — v2에서 발생한 번역/구조 실수 기록
