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

#### 탭 마운트 정책 — "한 번 연 탭만, 열면 계속" (#91)
- 탭 컨텐츠는 **처음 그 탭을 열 때 마운트**된다. 안 연 탭은 DOM에 아예 없다 (`isTabMounted()` 가 게이트)
- 한 번 마운트된 탭은 **떠나도 언마운트하지 않는다** — `hidden`(=`display:none`)으로 감출 뿐. 검색어·스크롤 위치·스킬 시뮬레이터 편집 상태가 탭을 오가도 살아 있어야 하기 때문
- **9개를 처음부터 다 마운트하면 안 된다.** 안 보여도 DOM·이미지·데이터 비용은 전부 발생한다 — 그 상태의 홈이 안 보이는 탭 때문에 이미지 1,724KB를 받고 프리렌더 HTML이 391KB였다 (`docs/mistakes.md` 참조)
- `openedTabs` 갱신은 effect가 아니라 **렌더 중**에 한다. `activeTab` 은 `useUrlStateSync`의 layout effect에서 바뀌므로, effect로 미루면 딥링크(`?tab=bosses`) 진입 시 페인트 한 번이 빈 화면이 된다
- 새 탭을 추가할 때는 `allTabs` 배열 + `isTabMounted("<id>") && (...)` 블록을 **함께** 넣을 것

#### `<img>` 로딩 정책 (#91)
- `<img>` 의 기본은 **`loading="lazy"`**. 뷰포트 안 이미지는 lazy여도 즉시 로드되므로 목록/그리드에 무해하다
- `eager`(속성 생략)는 **상세 페이지 최상단 히어로 1장**에만 — LCP 요소라 preload 스캐너가 먼저 집어가야 한다. 현재 대상은 `seo/{Item,Boss,Character,Food,SkillTree,Quest}PageContent`, `seo/CookpotContent` 8곳
- 누락 감시·일괄 적용: `node scripts/add-img-lazy.mjs [--dry-run]`

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
- **용도**: Ezoic 광고 자리. placeholder div를 그리고 `ezstandalone.showAds(<id>)`로 광고를 요청. 같은 번호를 쥔 자리가 바뀔 때는 `destroy` 없이 `showAds`만, 자리가 화면에서 아예 사라질 때만 `destroyPlaceholders`
- **자리(variant)와 placeholder id** — 번호는 임의로 고르면 안 된다. Ezoic 대시보드에 위치 유형이 정해진 placeholder가 이미 등록돼 있어 **번호가 곧 위치 유형**이다 (100=Adhesion, 101=top_of_page, 102=under_page_title, 103=bottom_of_page, 104~108=sidebar 계열, 109~115=본문 계열). 우리 자리의 성격과 같은 유형을 골라 쓴다:
  | variant | id (Ezoic 유형) | 위치 | 규격 |
  |---|---|---|---|
  | `top` | 111 (`mid_content`) | 모든 탭의 목록/컨텐츠 첫 줄 (제작·요리 카테고리 화면과 목록, 보스, 스킬 캐릭터 그리드·스킬 트리, 스킨, 퀘스트, 콘솔) **+ SEO 정적 페이지 전부** (`src/components/seo/*Content.tsx` — 히어로/h1 블록 바로 아래) | 폭 728까지 (가로 띠) |
  | `sheet` | 103 (`bottom_of_page`) | 상세 시트 컨텐츠 끝, `SupportPill` 위 (`DetailPanel`) | 가로 띠. 넓은 화면은 970까지 (103이 970×105를 배달) |
  | `rail-left` / `rail-right` | 107 / 108 (`sidebar_floating_1·2`) | 탭 컨텐츠 좌우 (`AppShell`) | 336폭, 세로. 화면 1500 미만은 미표시 |
- **🔴 번호를 쥔 노드는 화면 전환에도 살아 있어야 한다 (#93)** — placeholder div가 교체되면 Ezoic은 새 div로 보고 **처음부터 다시 요청**한다. 프로덕션 실측에서 카테고리를 누르는 순간 `#111` 이 빈칸(iframe 0)이 되고 재요청이 나가 **8초 뒤에야** 다시 찼다. 사용자는 전환할 때마다 빈 띠를 다시 보고, 노출 시간도 매번 0으로 초기화된다(`early` = 소재 도착 전 이탈 56%와 직결). 따라서 **자리는 화면별 컴포넌트 안이 아니라 그 위, 전환에도 유지되는 위치에 하나만 둔다.** 제작 탭은 `CraftingApp`이 두 개의 `return`(홈/목록)으로 갈려 있던 것을 하나로 합쳐 해결했다 — 헤더·본문만 삼항으로 갈리고 `AdSlot`은 트리에 하나뿐이다. 그리드 안에 두면 `col-span-full` 로 격자에 맞출 수 있어 편하지만 **그 편의가 곧 재요청**이다
  - 회귀 확인: `node scripts/check-ad-slots.mjs <url>` 에서 "카테고리 → 목록", "홈으로" 단계의 `calls` 가 **빈 배열**이어야 한다 (`show(111)` 이 찍히면 재요청이 살아난 것)
  - 아직 안 고친 탭: 요리(3곳)·보스(2곳)·스킬(2곳)·스킨·퀘스트·콘솔. SEO 정적 페이지(`seo/*`)는 페이지 이동이 곧 새 문서라 해당 없음
- **요청은 반드시 배칭** — 자리마다 따로 `showAds(id)`를 부르면 Ezoic이 앞선 사이클 도중 들어온 호출을 흘려버려 그 자리가 조용히 빈 채로 남는다. `AdSlot` 모듈의 배치 큐(`requestAd`/`releaseAd`)에 등록만 하고, 같은 틱의 요청을 `showAds(...ids)` 한 번으로 내보낸다. 자리를 추가할 때 개별 호출을 복붙하지 말 것
- **도착 판정은 소재 기준** — no-fill이어도 Ezoic이 18×18 뱃지 이미지를 넣기 때문에 "자식이 있으면 채워짐"으로 보면 빈 회색 AD 카드가 그려진다. iframe / 뱃지보다 큰 이미지 / 텍스트가 있을 때만 채워진 것으로 친다
- **가로 띠만 상시 예약(`reserve`)** — 띠는 컨텐츠 위에 있어 늦게 도착하면 목록이 밀린다(CLS, 유입 65%가 구글). 띠 계열 중 가장 높은 320×100에 맞춰 **100px 하나로 고정**한다(브레이크포인트로 나누지 말 것 — 데스크탑만 90px로 좁혔더니 데스크탑에 320×100이 와서 10px 밀렸다). 레일(옆)·시트(아래)는 밀릴 컨텐츠가 없어 예약하지 않는다
- **예약은 "채워진 뒤에도" 유지, 카드 껍데기는 `filled`와 무관하게 상시 렌더** — 이 둘을 지켜야 예약이 실제로 CLS를 막는다. ① 채워질 때만 껍데기(AD 라벨 + 상하 패딩 ≈27px)를 붙이면 광고 도착 순간 그만큼 밀린다. ② 채워지면 예약을 풀고 `minH`로 줄이면 100px 자리에 320×50이 올 때 위로 50px 당겨진다 — **위로 당기는 것도 CLS다**. 껍데기에서 `filled`에 걸어도 되는 건 높이를 안 만드는 것(테두리·배경·라벨 글자)뿐. `scripts/check-ad-cls.mjs`가 이 불변식을 지킨다
- **`ezstandalone.config()`로 제어 가능** — 전면 광고(`disableInterstitial`, `vignetteDesktop/Mobile/Tablet`), ID 싱크 픽셀 감축(`limitCookies`), 자동 사이드레일(`disableLeftSideRail` 등), 앵커 위치(`anchorAdPosition`), 비디오(`disableVideo`). **대시보드 전용이 아니다** — 실브라우저에서 `typeof ezstandalone.config === "function"` 확인. `disableSidebarFloating`은 우리가 직접 심은 107/108까지 죽일 수 있으니 주의. 현재 beta에서만 `limitCookies: true`를 켜 요청 감소폭을 측정 중
- **`config()`는 `layout.tsx`의 `cmd` 큐 생성 인라인 스크립트에 둔다** — `AdSlot`이 첫 배치를 내보내는 시점(마운트 → 교차 판정 → 250ms 디바운스)은 우리 `showAds`보다는 앞이지만, Ezoic 본체는 head에서 async로 먼저 떠서 **자동 유닛(anchor·vignette·video)과 초기 쿠키 싱크를 그 전에 이미 시작**한다. `limitCookies`처럼 초기 픽셀을 겨냥한 옵션은 그 위치면 늦다
- **`refreshAds(id)`는 우리 구조에 안 맞는다** — "div는 그대로, 내용만 갱신"용이다. div 노드를 갈아끼운 뒤 `refreshAds`만 부르면 그 자리가 빈 채로 남는 것을 실측했다. 탭마다 노드가 교체되는 구조에서는 `showAds`를 쓴다
- **실광고 관측은 `scripts/check-ad-slots-live.mjs`** — GPT 슬롯 누수(탭 왕복 전후 `googletag.pubads().getSlots()` 증가), 우리가 정의하지 않은 자동 삽입 슬롯, SDK API 존재를 본다. 실제 광고는 세션·스로틀·무광고 대조군(`isEzoicUser`)에 따라 흔들리므로 **판정용이 아니라 관측용**
- **자리 폭은 "그 자리에 올 수 있는 최대 규격"으로 잡는다** — Ezoic은 컨테이너 폭을 존중하지 않는다. 160폭 자리에 300×250을 넣어 옆 컨텐츠와 겹치는 것을 실측했다(#75). 잘라내기(`overflow:hidden`)는 금지 — 광고를 일부 가리면 정책 위반이라 계정이 위험하다
- **높이는 최소값만** — 큰 규격이 와도 아래로 늘어나면 되고, 최소 높이가 늦게 온 광고의 레이아웃 시프트를 막는다
- **레일 브레이크포인트 근거**: 아이템 그리드 최대폭 896 + 좌우 300씩 = 1496 → `min-[1500px]`
- **좁은 본문에서는 띠 자리를 `AdBleed`로 넓힌다** (`src/components/ads/AdBleed.tsx`, #83) — SEO 상세 페이지 본문이 `max-w-2xl px-4`(컨텐츠 **640px**)라 `BAND_BOX`가 `sm:max-w-[728px]`까지 열려 있어도 **728×90 leaderboard가 후보에서 빠진다**(실측: `/item/abigail-flower` placeholder #111이 640×100). 띠 계열에서 채움률·단가가 가장 좋은 규격을, 하필 구글 유입이 가장 많은 페이지에서 놓치던 셈. `md:-mx-11`(좌우 44px)로 `640 + 88 = 728`을 만든다. **`md`(768px) 미만에는 적용하지 않는다** — 그보다 좁은 화면에서 벌리면 가로 스크롤이 생긴다. 목록형(`max-w-4xl`, 컨텐츠 864px)에는 불필요
- **번호는 탭이 아니라 자리 역할 단위로 공유** — 한 번 연 탭은 `hidden`(=`display:none`) 상태로 계속 마운트돼 있지만(안 연 탭은 아예 마운트되지 않는다 — 위 "탭 마운트 정책" 참조), `AdSlot`이 **보이는 탭에서만** placeholder div를 그리므로 문서에 같은 번호가 둘 이상 존재하지 않는다. 탭마다 번호를 따로 쓰면 탭이 늘 때마다 고갈된다(본문 계열은 109~115뿐). 좌우 레일만 서로 다른 번호가 필요
- **활성 판정** — 교차하면 활성, 안 교차해도 레이아웃 박스가 있으면 활성 유지(스크롤로 벗어난 것), 박스가 0이면 비활성(탭이 숨겨진 것). 스크롤로 벗어날 때마다 해제하면 되돌아올 때 새 노출이 생겨 노출이 부풀려진다
- **요청 큐는 "주인" 단위, 그리고 배치에는 살아 있는 자리를 전부 넣는다** — 상단 띠는 모든 탭이 같은 번호를 쓰므로 탭 전환 때 placeholder div가 교체된다. 번호만 세면 아무 요청도 안 나가 Ezoic이 사라진 div에 광고를 든 채로 남으므로(새 자리는 영영 빔), 번호를 쥔 엘리먼트가 바뀌면 **`destroy` 없이 `showAds`만** 다시 부른다.
  - 🔴 **다만 그 배치에는 그 시점에 보이는 자리를 전부 넣어야 한다 (#94).** 배치가 나가면 **지목하지 않은 자리의 광고까지 비워진다.** #75에서는 이걸 `destroy` 전용 현상으로 봤지만 **`showAds` 단독으로도 똑같이 일어난다** — 상세 시트를 열면 `#111`의 주인이 바뀌어 배치가 `showAds(111)` 하나만 나갔고, 그 호출에 레일 `#107`·`#108`이 높이 0인 빈 div가 됐다. destroy가 없으니 복구 요청도 안 나가 **시트를 닫아도 돌아오지 않았다**(그 세션 동안 레일 영구 사망, 레일은 최근 7일 수익의 13%). 탭 전환도 같은 상태였다
  - 회귀 확인: `node scripts/check-ad-slots.mjs <url>` 이 "배치에서 빠진 자리 N — 이 배치로 비워진 뒤 복구되지 않는다"로 잡는다
- **같은 번호가 문서에 둘 이상 있으면 Ezoic 동작이 예측 불가**(Ezoic 문서 명시). "보이는 자리만 렌더" 규칙으로 막고 있지만 탭·화면이 늘면 조용히 깨지므로, 개발 빌드에서 실제 DOM을 세어 `console.error`로 드러낸다 (`AdCard`)
- **상세 시트는 `open`일 때만 렌더** — 시트가 탭마다 상시 마운트돼 있어 그냥 두면 안 보이는 노출이 쌓임
- **회귀 검증 스크립트** — 자리를 건드렸으면 반드시 돌린다 (`npm i -D playwright-core` 필요, 설치된 Chrome 사용):
  ```bash
  node scripts/check-ad-slots.mjs https://beta.dstcraft.com          # 탭 순회·카테고리→목록·상세 시트
  node scripts/check-ad-slots-stress.mjs https://beta.dstcraft.com   # 연타·모바일·뒤로가기·스크롤·왕복 20회·검색·자리 없는 탭
  node scripts/check-ad-cls.mjs https://beta.dstcraft.com            # 규격별 도착 시 자리 높이 변화(띠 계열 전부 0이어야 함)
  ```
  Ezoic 스크립트를 차단하고 같은 인터페이스의 가짜를 심어 **우리가 무엇을 요청하는지**만 본다. 실제 광고는 세션·스로틀에 따라 왔다 갔다 하고 백그라운드 탭에서는 아예 안 뜨므로, 채움 여부로 판정하면 테스트가 매번 흔들린다. 판정 항목: 중복 placeholder 없음 / 숨은 탭이 자리를 들고 있지 않음 / 보이는 자리에 placeholder 있음 / 화면 전환당 `show` 배치 1회
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

### useUrlStateSync (`src/hooks/use-url-state.ts`)
- **용도**: URL 쿼리에서 읽어오는 화면 상태를 hydration-safe하게 초기화. 첫 렌더는 서버 HTML과 동일한 기본값, 커밋 직후 layout effect에서 URL을 반영해 딥링크 플리커도 없앤다
- **사용처**: AppShell(activeTab), useCraftingState, useCookingState, useBossesState, SkinsApp(view), SkillSimulatorApp(selectedChar)
- **사용법**: state는 평범한 `useState(SSR_DEFAULT)`로 두고 `useUrlStateSync(readUrlState, setState)`를 덧붙인다
- **금지**: `useState(() => typeof window === "undefined" ? DEFAULT : readUrlState())` 형태의 lazy initializer — 정적 export 서버 HTML과 첫 클라이언트 렌더가 어긋나 hydration mismatch가 난다 (#76)
- **부가 export**: `useIsomorphicLayoutEffect` (서버에선 useEffect, 브라우저에선 useLayoutEffect)

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
