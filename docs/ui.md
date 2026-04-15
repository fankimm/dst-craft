# UI/UX 가이드

새 화면이나 컴포넌트를 만들 때 반드시 이 문서를 참고하여 기존 UI와 통일성을 유지할 것.

---

## 화면 구조도

### AppShell (`src/components/AppShell.tsx`)
```
┌─ 상태바 커버 (z-60, safe-area-inset-top) ──────────────┐
├─ 탭 바 (crafting | cooking | cookpot | bosses | skills | settings)─┤
├─ 활성 탭 컨텐츠 ──────────────────────────────────────────┤
│                                                           │
│  ┌─ CraftingApp / CookingApp / BossesApp / CookpotApp ─┐ │
│  │  ┌─ 헤더 (브레드크럼 + 검색/정렬) ─────────────────┐ │ │
│  │  ├─ 스크롤 영역 ──────────────────────────────────┐ │ │
│  │  │  카테고리 그리드 ← OR → 아이템 리스트           │ │ │
│  │  │                      (슬라이드 전환)            │ │ │
│  │  │  <Footer />                                    │ │ │
│  │  ├────────────────────────────────────────────────┘ │ │
│  │  │  <DetailPanel /> (바텀시트, 선택 시 표시)        │ │
│  │  └────────────────────────────────────────────────┘ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 탭별 3단계 네비게이션
모든 메인 탭(제작, 요리, 보스)은 동일한 패턴:

| 단계 | 뷰 | 컴포넌트 |
|------|-----|---------|
| 1. 홈 | 카테고리 그리드 (즐겨찾기/최근조회 + 카테고리 타일) | `CategoryGrid` / 인라인 그리드 |
| 2. 리스트 | 아이템/레시피/보스 카드 그리드 | `ItemGrid` / `RecipeGrid` / 인라인 |
| 3. 상세 | 바텀시트 상세 패널 | `DetailPanel` > `ItemDetail` / `RecipeDetail` / `BossDetail` |

### 요리솥 탭 (CookpotApp)
카테고리/리스트 없이 단일 화면: 스테이션 선택 + 재료 슬롯 + 결과 + 재료 피커

### 스킬트리 탭 (SkillSimulatorApp)
2단계 네비게이션: 캐릭터 선택 그리드 → Git Graph 스타일 스킬트리 뷰
```
┌─────────────────────────────────────────────┐
│ 브레드크럼 (캐릭터 선택 > 윌슨)              │
├─────────────────────────────────────────────┤
│ [portrait] 윌슨  스킬 5/21 습득   [초기화]  │ ← 헤더
├──────────────────────────────────────────────┤
│ ● 횃불 ──────────────────                    │ ← 그룹 헤더
│ │  [icon] 횃불 지속시간 I           [●]      │ ← 스킬 노드 카드
│ │  [icon] 횃불 지속시간 II          [○]      │
│ ◆  횃불 스킬 3개 필요 ──────                 │ ← 잠금 게이트
│ │  [icon] 횃불 던지기               [○]      │
│                                              │
│ ● 연금술 ────────────────                    │
│ ...                                          │
│ <DetailPanel /> (바텀시트, 노드 탭 시 표시)   │
└──────────────────────────────────────────────┘
```
- 왼쪽: SVG Rail (그룹 컬러 세로 라인 + 정션 포인트)
- 오른쪽: 스킬 노드 카드 (아이콘 + 이름 + 토글)
- 상태 저장: localStorage (`dst:skills:${charId}`)

### SEO 전용 SSG 페이지
클라이언트 앱과 별도로 서버 렌더링되는 정적 페이지:
- `/item/[slug]` — 제작 아이템 상세 (JSON-LD: HowTo)
- `/food/[slug]` — 요리 레시피 상세 (JSON-LD: Recipe)
- `/boss/[slug]` — 보스 상세 (JSON-LD: GamePlayMode)
- `/browse` — 전체 목록 디렉토리
- `/cookpot` — 요리솥 랜딩페이지

> SSG 페이지는 클라이언트 컴포넌트(DetailPanel 등)를 사용하지 않음. 리팩토링 시 주의.

---

## 공유 컴포넌트

### DetailPanel (`src/components/ui/DetailPanel.tsx`)
- **용도**: 바텀시트 상세 패널 (오버레이 + 슬라이드업 + 닫기 버튼 + SupportPill)
- **사용처**: CraftingApp, CookingApp, BossesApp
- **짝 훅**: `useDetailPanel` — 패널 open/close 애니메이션 상태 관리
- **Props**: `open`, `onClose`, `children`

### SortDropdown (`src/components/ui/SortDropdown.tsx`)
- **용도**: 기본/인기순 정렬 드롭다운
- **사용처**: CraftingApp, CookingApp
- **Props**: `value`, `onChange`, `locale`

### ViewCount (`src/components/ui/ViewCount.tsx`)
- **용도**: 조회수 표시 (겨울거인 눈알 아이콘 + 숫자)
- **사용처**: ItemDetail, RecipeDetail, BossDetail
- **Props**: `clicks`, `className?`

### SupportPill (`src/components/ui/SupportPill.tsx`)
- **용도**: Ko-fi 후원 버튼 (DetailPanel 내부에서 자동 포함)
- **참고**: DetailPanel이 자동 포함하므로 직접 사용할 필요 거의 없음

### TagChip (`src/components/ui/TagChip.tsx`)
- **용도**: 메타 정보 표시 — 스테이션, 카테고리, 캐릭터, 음식유형, 스킬, 효과 등
- **구조**: 아이콘(16×16) + 라벨 텍스트, 둥근 pill 형태 (`rounded-full`)

### ItemSlot (`src/components/ui/ItemSlot.tsx`)
- **용도**: 아이템/재료를 아이콘 박스 + 라벨로 표시
- **구조**: 40×40 아이콘 박스(border + bg-surface) + 하단 라벨(11px) + 뱃지(수량/확률)
- **variant**: `default` | `excluded` (금지 재료는 빨간색)

### MaterialSlot (`src/components/crafting/MaterialSlot.tsx`)
- ItemSlot의 래퍼 — materialId로 자동 조회 + 클릭 시 해당 아이템으로 이동

### ItemStatsPanel (`src/components/crafting/ItemStatsPanel.tsx`)
- **용도**: 아이템 스펙 표시 (v3 구조화 데이터 기반)
- **구조**: 4개 그룹 (전투/방어/유틸리티/특수) + 빈 그룹 자동 숨김
- **v3 필드**: tags(TagChip), resistance, shadow_level, set_bonus(강조 카드), repair(아이템 이미지+이름), skill_tree(보라색 블록), immunities(에메랄드 뱃지), effects(불릿)
- **v2 폴백**: v3 데이터 없을 시 기존 usage 텍스트 표시
- **사용처**: ItemDetail

### SearchWithSuggestions (`src/components/ui/SearchWithSuggestions.tsx`)
- **용도**: 드롭다운 서제스천 + 태그 지원 검색 입력
- **사용처**: CookingApp, BossesApp

---

## 공유 훅

### useDetailPanel (`src/hooks/use-detail-panel.ts`)
- **용도**: 바텀시트 패널 open/close 애니메이션 (double-rAF + delayed cleanup)
- **사용처**: CraftingApp, CookingApp, BossesApp
- **반환**: `{ panelItem, panelOpen }`

### useSlideAnimation (`src/hooks/use-slide-animation.ts`)
- **용도**: 카테고리 ↔ 리스트 뷰 전환 시 슬라이드 애니메이션
- **사용처**: CraftingApp, CookingApp, BossesApp
- **반환**: slideClass 문자열 (`animate-slide-right` / `animate-slide-left` / `""`)

### useRecent (`src/hooks/use-recent.ts`)
- **용도**: localStorage 기반 최근 조회 항목 추적 (탭별, 최대 30개)
- **사용처**: CraftingApp, CookingApp, BossesApp
- **반환**: `{ recentIds, addRecent }`

### usePopularity (`src/hooks/use-popularity.ts`)
- **용도**: Redis 기반 클릭 수 조회 (싱글턴 캐시)
- **반환**: `{ getClicks }`

---

## 공유 유틸리티

### statColor / formatStat (`src/lib/stat-utils.ts`)
- **용도**: 체력/허기/정신력 등 스탯 값의 색상 클래스 및 +/- 포맷
- **사용처**: CookingApp, CookpotApp

---

## 스타일 규칙

- 카드: `rounded-lg border bg-surface`, hover 시 `bg-surface-hover border-ring`
- 바텀시트 오버레이: `bg-black/50 transition-opacity duration-180`
- 바텀시트 패널: `transition-transform duration-180 ease-out translate-y-0/full`
- 그리드 레이아웃: `grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full`
- 아이콘 크기: 그리드 타일 48-56px, 카드 내 48-56px, 상세 헤더 64px, 뱃지/슬롯 내 32px
- 텍스트: 카드 라벨 `text-xs sm:text-sm`, 상세 제목 `text-base font-semibold`

## 상세(바텀시트) 패턴

### 헤더 영역
- 아이템 이미지(64×64) + 이름 + 영문명(locale≠en일 때) + 즐겨찾기 하트
- ViewCount (조회수)
- 하단에 TagChip 뱃지 나열 (스테이션, 카테고리, 캐릭터 등)

### 콘텐츠 영역
- **게임 아이템 나열** → `ItemSlot` 사용 (flex-wrap gap-4)
- **수치 정보** → 인라인 스탯 행 (아이콘 + 값)
- **텍스트 정보** → flex justify-between 행

---

## 데이터 자동 파생 패턴

데이터 파일에서 플래그 하나로 파생 항목을 자동 생성하는 패턴들. 수정 시 원본만 고치면 파생 항목도 자동 반영됨.

### 요리솥 재료 (`cookpot-ingredients.ts`)

| 플래그 | 자동 생성 | 이름 규칙 | 이미지 규칙 |
|--------|----------|----------|------------|
| `cookable: true` | Cooked 변형 | `"Cooked " + name` / `nameKo + " (조리됨)"` | `${id}_cooked.png` (또는 `cookedImage` 오버라이드) |
| `dryable: true` | Dried 변형 | `"Dried " + name` / `nameKo + " (건조)"` | `${id}_dried.png` |
| `rawCookable: false` | 원본은 솥에 못 넣고 cooked/dried만 사용 가능 | — | — |

**핵심**: `name`/`nameKo`를 수정하면 Cooked/Dried 파생 이름도 자동으로 바뀜. 파생 항목을 별도 수정할 필요 없음.

### 아이템 이미지 (`items.ts`, `item-stats.ts`)

| 필드 | 규칙 |
|------|------|
| `image` 생략 시 | `${id}.png` 자동 적용 |
| `image` 명시 시 | 해당 파일명 사용 (id와 이미지명이 다른 경우) |

### 아이템 스탯 (`item-stats.ts`)

- `itemStats[itemId]`로 매핑 — 아이템 `id`와 키가 일치해야 자동 연결
- `usage` 필드는 `{ ko, en }` 구조로 다국어 지원
