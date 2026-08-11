# UI/UX 가이드

새 화면이나 컴포넌트를 만들 때 반드시 이 문서를 참고하여 기존 UI와 통일성을 유지할 것.

---

## 화면 구조도

### AppShell (`src/components/AppShell.tsx`)
```
┌─ 상태바 커버 (z-60, safe-area-inset-top) ──────────────┐
├─ 탭 바 (crafting | cooking | cookpot | bosses | skills | quests | console | settings)─┤
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

### 콘솔 탭 (ConsoleApp)
단일 화면 스크롤: 아이템 소환 빌더 + 카테고리별 명령어 카드
```
┌─────────────────────────────────────────────┐
│ [papyrus] 콘솔                               │
├─────────────────────────────────────────────┤
│ ┌─ 아이템 소환 빌더 ─────────────────────┐  │
│ │ [인벤토리|커서위치] 모드 토글            │  │
│ │ [검색 입력]                            │  │
│ │ [선택된 아이템 이미지+이름]              │  │
│ │ [−][갯수][+] [5][10][20][40]           │  │
│ │ [c_give("prefab", 1)]  [📋]           │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ● 캐릭터 상태 ───── (2열 그리드)            │
│ ● 월드 제어 ─────── (2열 그리드)            │
│ ● 서버 관리 ─────── (2열 그리드)            │
│ ● 디버그 ─────────  (2열 그리드)            │
│ <Footer />                                   │
└──────────────────────────────────────────────┘
```
- 명령어 카드: 이름+설명 + 파라미터(인라인 input/select) + 복사 버튼
- 파라미터 있는 명령어: 인라인 편집 후 즉시 반영
- 탭하면 클립보드 복사 + 토스트

### 탭 컨텐츠 스크롤 + Footer 패턴 — **반드시 `TabScrollArea`로 감쌀 것**
새 탭을 만들 때 가장 흔히 잘못되는 부분: 컨텐츠가 짧을 때 Footer가 화면 중간에 떠버리는 버그.
원인은 `mt-auto`가 flex-col 부모에서만 동작하는데, `overflow-y-auto` 컨테이너 안에 그냥 div + Footer를 두면
flex가 아니라서 Footer가 컨텐츠 바로 뒤에 붙어버리기 때문.

**해결 — `<TabScrollArea scrollContainer>` 컴포넌트 사용**(`src/components/ui/TabScrollArea.tsx`):
```tsx
return (
  <div className="flex flex-col h-full ...">
    <div className="shrink-0 ...">{header}</div>
    <TabScrollArea scrollContainer>
      <div className="max-w-3xl mx-auto px-3 py-3 w-full">{main}</div>
    </TabScrollArea>
  </div>
);
```
내부 구조: `flex-1 min-h-0 overflow-y-auto` → `flex flex-col min-h-full` → children + Footer.
Footer는 자동 포함 (`noFooter` prop으로 끌 수 있음 — CookpotApp처럼 외부에 pinned할 때만).

### 퀘스트 탭 (QuestsApp)
단일 화면 스크롤: 3개 퀘스트 섹션(은둔자/대변자/연료직공) 카드형 체크리스트
```
┌─────────────────────────────────────────────┐
│ 퀘스트 체크리스트                            │
│ (한 줄 설명)                                │
├─────────────────────────────────────────────┤
│ ┌─ 은둔자 ─────────────  3/17  17%   [↻] ┐  │ ← 섹션 헤더 (탭하면 collapse)
│ │ ━━━━░░░░░░░░░░░░░░ (진행 바)            │  │
│ │ ☐ [icon] 집 수리 1단계  (한 줄 설명)    │  │ ← 체크 OFF
│ │ ☑ [icon] 집 수리 2단계  (취소선)       │  │ ← 체크 ON
│ │ ...                                     │  │
│ └─────────────────────────────────────────┘  │
│ ┌─ 대변자 ─────────────  0/18   0%        ┐  │
│ │ ...                                     │  │
│ ┌─ 연료직공 ──────────  0/9    0%        ┐  │
│ │ ...                                     │  │
│ <Footer />                                   │
└──────────────────────────────────────────────┘
```
- 체크 상태: localStorage `dst:quest-checks` (`{questId:stepId}` 형식 키)
- 데이터: `src/data/quests/{hermit,celestial,fuelweaver}.ts` (인게임 + Challenge Board 모드 원천)
- 훅: `useQuestState` — toggle / resetQuest / countChecked
- 아이템 아이콘은 게임 내 이미지 사용 (lureplantbulb, moon_altar_*, atrium_key, thurible 등)

### SEO 전용 SSG 페이지
클라이언트 앱과 별도로 서버 렌더링되는 정적 페이지:
- `/item/[slug]` — 제작 아이템 상세 (JSON-LD: HowTo)
- `/food/[slug]` — 요리 레시피 상세 (JSON-LD: Recipe)
- `/boss/[slug]` — 보스 상세 (JSON-LD: GamePlayMode)
- `/browse` — 전체 목록 디렉토리
- `/cookpot` — 요리솥 랜딩페이지

> SSG 페이지는 클라이언트 컴포넌트(DetailPanel 등)를 사용하지 않음. 리팩토링 시 주의.

### 데미지 계산기 (`/damage-calc`)
DevMenu에서 접근하는 단일 화면 dev 페이지. `BackToHome` 헤더 + 단일 컬럼 스크롤 레이아웃:
- 캐릭터 칩 (TagChip 활성 강조), 무기/방어구 그리드 (ItemSlot + 배지로 데미지/흡수율 표시)
- 더미 종류 선택 + 더미 머리/몸통 장착 슬롯
- 버프 토글(체크박스 카드) — 음식, 장비 효과, 환경 변수
- 결과 패널: 1히트 총 피해 / 처치 타격 수 / 무기 1자루 처치, 접이식 디버그 trace
- 계산 로직: `src/lib/damage-calc.ts` (인게임 combat.lua / inventory.lua / planarentity.lua 공식 그대로)

---

## 공유 컴포넌트

### DetailPanel (`src/components/ui/DetailPanel.tsx`)
- **용도**: 바텀시트 상세 패널 (오버레이 + 슬라이드업 + 닫기 버튼 + SupportPill)
- **사용처**: CraftingApp, CookingApp, BossesApp, AdminFeedbackSection (설정 탭)
- **짝 훅**: `useDetailPanel` — 패널 open/close 애니메이션 상태 관리
- **Props**: `open`, `onClose`, `children`

### FeedbackBoard (`src/components/settings/FeedbackBoard.tsx`)
- **용도**: 사용자 피드백 게시판 (설정 탭에 임베드). 공개 목록 + 어드민 관리 UI를 한 컴포넌트에서 분기
- **구조(공개)**: 피드백 카드 리스트(본문/상태 뱃지/자동 번역 배지+원문 토글) + 답변이 있으면 답변 블록
- **구조(어드민)**: 상태 필터 칩 추가 + 항목 탭 시 DetailPanel(전체 메시지/메타/답변 작성/상태 변경/숨김/삭제)
- **답변 작성자 표시**: 답변 블록 제목은 `ReplyAuthorLabel`이 그린다. `replyAuthor === "claude"`면 WX-78 얼굴 아이콘 + 보라색 "Claude 답변", 그 외에는 기존 회색 "개발자 답변". 작성자 선택 UI는 두지 않는다 — 화면 저장은 항상 `human`, `claude`는 API 직접 호출로만 (CLAUDE.md "Feedback Replies" 참조)
- **모바일 최적화**: 좌우 스크롤 없음, 한 줄당 최소 정보만 노출
- **권한**: 어드민 UI는 `useAuth().isAdmin` 또는 개발 모드에서만 노출

### SortDropdown (`src/components/ui/SortDropdown.tsx`)
- **용도**: 기본/인기순 정렬 드롭다운
- **사용처**: CraftingApp, CookingApp
- **Props**: `value`, `onChange`, `locale`

### PrefabIdButton (`src/components/ui/PrefabIdButton.tsx`)
- **용도**: 콘솔명(프리팹 ID) 표시 + 클릭 시 클립보드 복사
- **사용처**: ItemDetail, RecipeDetail(CookingApp), BossDetail(BossesApp)
- **Props**: `id`, `locale?`

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

### CategoryCard (`src/components/ui/CategoryCard.tsx`)
- **용도**: 카테고리 그리드 타일 (아이콘 + 라벨, 즐겨찾기/최근조회는 우하단 카운트 뱃지)
- **사용처**: CraftingApp(CategoryGrid), CookingApp, BossesApp
- **레이아웃 규칙**: 아이콘 영역 size-12 sm:size-14 고정 + 라벨 영역 `min-h-[2lh]` 고정 → 라벨이 1줄이든 2줄이든 모든 카드의 카드 높이 / 아이콘 수직 위치가 동일 (인게임 라벨이 단일 진실 공급원이라 텍스트 줄 수가 가변)
- **Props**: `imageSrc`, `imageAlt?`, `label`, `badgeCount?`, `onClick`
- **badge 동작**: `badgeCount === undefined`면 안쪽 이미지 크기를 size-12/14로 확장(뱃지 자리 없이 가득). 정의됐고 > 0이면 우하단에 카운트 뱃지

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

### AffinityBadges (`src/components/cooking/CookingApp.tsx` 내부)
- **용도**: 음식의 캐릭터 선호 라벨 ("○○의 선호 음식") 한 줄 노출
- **사용처**: RecipeDetail (cookpot 레시피), RawFoodDetail (생식 음식)
- **데이터 소스**: `getAffinityCharacters(foodId, foodType)` — prefab 보너스가 캐릭터의 foodtype 기본을 *초과*할 때만 표시 (예: 워트는 두리안만, 카테고리 ×1.33 일치 항목은 노출 안 됨)

### LegalDoc (`src/components/ui/LegalDoc.tsx`)
- **용도**: 법적 고지 문서(개인정보처리방침·이용약관) 공통 레이아웃 — `BackToHome` + `max-w-2xl` 본문 + 섹션 리스트
- **입력**: `LegalDocContent`(title/updated/intro/sections) + `locale` + 선택적 `children`(본문 섹션 뒤 렌더 — 예: privacy의 Ezoic 고지문 주입 앵커). 페이지는 locale별 콘텐츠 객체만 넘김
- **사용처**: `/privacy`(`src/app/privacy/page.tsx`), `/terms`(`src/app/terms/page.tsx`)

### FooterLegalLinks (`src/components/ui/FooterLegalLinks.tsx`)
- **용도**: Footer 하단에 노출되는 소개(About)·개인정보처리방침·이용약관 링크 (client, `useSettings`로 locale 반영)
- **사용처**: `src/components/crafting/Footer.tsx`

### AdSlot (`src/components/ads/AdSlot.tsx`)
- **용도**: Ezoic 광고 자리. placeholder div를 그리고 `ezstandalone.showAds(<id>)`로 광고를 요청, 언마운트 시 `destroyPlaceholders`로 정리
- **자리(variant)와 placeholder id** — 대시보드 리포트 기준값이라 변경 금지:
  | variant | id | 위치 | 규격 |
  |---|---|---|---|
  | `infeed` | 101 | 아이템 그리드 18칸마다 한 행 (`ItemGrid`) | 모바일 320×100 / 데스크탑 728×90 |
  | `sheet` | 102 | 상세 시트 컨텐츠 끝, `SupportPill` 위 (`DetailPanel`) | 300×100 |
  | `rail-left` / `rail-right` | 103 / 104 | 탭 컨텐츠 좌우 (`AppShell`) | 300×600. 화면 1500 미만은 미표시 |
- **자리 폭은 "그 자리에 올 수 있는 최대 규격"으로 잡는다** — Ezoic은 컨테이너 폭을 존중하지 않는다. 160폭 자리에 300×250을 넣어 옆 컨텐츠와 겹치는 것을 실측했다(#75). 잘라내기(`overflow:hidden`)는 금지 — 광고를 일부 가리면 정책 위반이라 계정이 위험하다
- **높이는 최소값만** — 큰 규격이 와도 아래로 늘어나면 되고, 최소 높이가 늦게 온 광고의 레이아웃 시프트를 막는다
- **레일 브레이크포인트 근거**: 아이템 그리드 최대폭 896 + 좌우 300씩 = 1496 → `min-[1500px]`
- **좌우 레일은 반드시 다른 id** — 같은 번호를 두 곳에 쓰면 한쪽만 채워짐
- **상세 시트는 `open`일 때만 렌더** — 시트가 탭마다 상시 마운트돼 있어 그냥 두면 안 보이는 노출이 쌓임
- **목업 모드**: `?admock=<자리>[:<규격>]` (쉼표로 복수, `all` 지원). 실제 광고 대신 규격만큼의 점선 박스를 그린다. 자리를 옮기거나 규격을 비교할 때 사용 — 예 `?admock=all`, `?admock=infeed,sheet:250x250`

### LegacyPwaNotice (`src/components/ui/LegacyPwaNotice.tsx`)
- **용도**: iOS 26 legacy 웹클립 설치본(#60 이전 black-translucent 박제 → 하단 흰 띠)에만 뜨는 재설치 안내 배너. standalone + (screen-innerHeight>20) + safe-area-inset-top>0 시그니처로 감지, 닫기 시 localStorage 영구 dismiss. 해당 설치본이 소멸하면 자연히 안 뜨는 자기소멸형
- **사용처**: `src/components/AppShell.tsx`

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

### 캐릭터 이미지 — 앱 UI에는 `category-icons/characters/` 만 쓴다

- **앱 화면**: `/images/category-icons/characters/<portrait>.png` — 배경 투명한 얼굴 아이콘. 작게 줄여도 식별되고, 이미 스킬/요리/제작/스킨 탭이 전부 이걸 쓴다
- **`/images/characters/<portrait>.png` 는 앱 UI에 쓰지 말 것** — 액자(프레임)가 포함된 큰 초상화라 작게 줄이면 액자만 남아 어두운 덩어리로 뭉개진다. SEO 페이지의 큰 이미지와 OG 이미지 전용
- 액자 이미지를 잘라 아이콘을 새로 만들지도 말 것 — 얼굴 아이콘이 이미 있다

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
