# UI/UX 가이드

새 화면이나 컴포넌트를 만들 때 반드시 이 문서를 참고하여 기존 UI와 통일성을 유지할 것.

## 공통 레이아웃

### 탭 화면 구조
모든 메인 탭(제작, 요리, 보스 등)은 동일한 3단계 구조:
1. **카테고리 그리드** — 3열(sm:4, md:5, lg:6) 타일, `bg-surface border-border` 스타일
2. **아이템/보스 리스트** — 동일한 그리드 레이아웃, 카드 클릭 시 상세 열림
3. **바텀시트 상세** — `fixed bottom-0 z-50 rounded-t-xl`, overlay `bg-black/50`, 180ms 트랜지션

### 헤더/브레드크럼
- 각 탭별 아이콘(20×20) + ChevronRight + 탭명 + (선택 시) ChevronRight + 카테고리명
- 홈/카테고리명 클릭 시 네비게이션

### 푸터
- `<Footer />` 컴포넌트를 스크롤 영역 하단에 배치 (sticky 아님)

## 재사용 컴포넌트

### TagChip (`src/components/ui/TagChip.tsx`)
- **용도**: 메타 정보 표시 — 스테이션, 카테고리, 캐릭터, 음식유형, 스킬, 효과 등
- **구조**: 아이콘(16×16) + 라벨 텍스트, 둥근 pill 형태 (`rounded-full`)
- **사용 시점**: 상세 화면에서 분류/속성 정보를 뱃지로 표시할 때

### ItemSlot (`src/components/ui/ItemSlot.tsx`)
- **용도**: 아이템/재료를 아이콘 박스 + 라벨로 표시
- **구조**: 40×40 아이콘 박스(border + bg-surface) + 하단 라벨(11px) + 뱃지(수량/확률)
- **variant**: `default` | `excluded` (금지 재료는 빨간색)
- **사용 시점**: 재료 목록, 전리품 목록, 체력 소모 등 **게임 아이템을 나열**할 때

### MaterialSlot (`src/components/crafting/MaterialSlot.tsx`)
- ItemSlot의 래퍼 — materialId로 자동 조회 + 클릭 시 해당 아이템으로 이동

## 상세(바텀시트) 패턴

### 헤더 영역
- 아이템 이미지(64×64) + 이름 + 영문명(locale≠en일 때) + 즐겨찾기 하트
- 하단에 TagChip 뱃지 나열 (스테이션, 카테고리, 캐릭터 등)

### 콘텐츠 영역
- **게임 아이템 나열** → `ItemSlot` 사용 (flex-wrap gap-4)
  - 예: 제작 재료, 보스 전리품, 체력 소모
- **수치 정보** → `StatBox` 그리드 (grid-cols-3)
  - 예: 체력/허기/정신력
- **텍스트 정보** → flex justify-between 행
  - 예: 유통기한, 조리시간

## 스타일 규칙

- 카드: `rounded-lg border bg-surface`, hover 시 `bg-surface-hover border-ring`
- 바텀시트 오버레이: `bg-black/50 transition-opacity duration-180`
- 바텀시트 패널: `transition-transform duration-180 ease-out translate-y-0/full`
- 아이콘 크기: 그리드 타일 48-56px, 카드 내 48-56px, 상세 헤더 64px, 뱃지/슬롯 내 32px
- 텍스트: 카드 라벨 `text-xs sm:text-sm`, 상세 제목 `text-base font-semibold`
