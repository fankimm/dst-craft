# UI/UX 가이드

새 화면이나 컴포넌트를 만들 때 반드시 이 문서를 참고하여 기존 UI와 통일성을 유지할 것.

---

## 화면 구조도

### AppShell (`src/components/AppShell.tsx`)
```
┌─ 상태바 커버 (z-60, safe-area-inset-top) ──────────────┐
├─ 탭 바 (crafting | cooking | cookpot | bosses | skills | skins | quests | farming | console | settings)─┤
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
헤더 우측 "시뮬레이터 | 트레이너" 토글로 두 화면을 바꾼다. URL `?tab=cookpot&mode=trainer` (#128, `useUrlStateSync` + `useTabSync` 패턴)
- **시뮬레이터**: 카테고리/리스트 없이 단일 화면: 스테이션 선택 + 재료 슬롯 + 결과 + 재료 피커
- **트레이너** (`cookpot/CookpotTrainer.tsx`): 설정 → 플레이 → 결과 3단계 단일 컴포넌트 (URL에는 모드만, 라운드 상태는 로컬)
```
┌ 설정 ─────────────────────────────────────┐   ┌ 플레이 ──────────────────────────────┐   ┌ 결과 ───────────────────────┐
│ 재료 수 [8][12][16]                        │   │ [⏱ 1:48][점수 63][가중치 칩] 합계 [끝내기] │   │        87%  최적 대비 · 훌륭해요   │
│ 제한 시간 [무제한][60초][120초][180초]      │   │ ┌ 요리솥 2/4 ──────────── [요리하기] ┐ │   │ [내 결과 156] [최적 180]            │
│ 채점 [허기][균형][랜덤 가중치] + 설명 한 줄 │ → │ │ [고기][베리][ 3 ][ 4 ]              │ │ → │ [같은 재료로 다시][새 라운드][설정]  │
│ 월리 모드 [칩] + 설명                      │   │ └────────────────────────────────────┘ │   │ 최적 플랜: DishCard × N            │
│ [▶ 시작]                                   │   │ 남은 재료: 타일 그리드 (탭=솥에, 하단 "생으로 먹기") │   │   생으로 먹음: ItemSlot(배지=점수) │
└───────────────────────────────────────────┘   │ 기억하는 요리 (월리만) · 먹은 것 로그   │   │   안 씀: ItemSlot excluded         │
                                                └──────────────────────────────────────┘   │ 내 플랜: 같은 카드               │
                                                                                            └────────────────────────────┘
```
- 로직은 전부 `src/lib/cookpot-trainer.ts` — 라운드 생성(seed, mulberry32), 채점 가중치, 요리 기대값/실제값, 최적해(일반: 종류별 개수 DP ≤20개, 지배되는 묶음 제외 / 월리: 배율 없는 DP를 상한으로 쓰는 분기한정 ≤16개), 결과 비교. 컴포넌트는 상태와 그리기만. 비트마스크 DP(`_solveBitmaskDp`)·월리 전수 열거(`_solveWarlyEnum`)는 대조 테스트용으로만 남겨 둠
- `CookpotApp`은 트레이너를 한 번 열면 `hidden`으로 숨길 뿐 언마운트하지 않는다 — 탭 왕복·레시피 보기 후 라운드 보존. 생식 버튼은 두 번 탭(2초 확인). 최고 기록은 localStorage `dst:cookpot-trainer:best`(설정 키 `n-t-s-w`)
- 문구는 `cookpot/trainer-text.ts` (`tt(key, locale)`) — 홈 번들에 안 실리게 `i18n.ts`와 분리 (농사 탭과 같은 이유)
- 설정은 localStorage `dst:cookpot-trainer:config`. 요리 결과 미리보기는 **일부러 없다** (레시피 암기가 트레이닝의 목적)
- 결과 화면 "결과 공유"는 `&seed=<base36>&n=&t=&s=&w=` 링크를 복사한다(`ShareButton label`). 그 링크로 들어오면 설정 화면에 배너 + 설정 잠금, 시작하면 같은 재료. 시작 직후 `replaceState`로 seed를 지운다 — 안 지우면 "새 라운드"도 같은 재료가 나온다
- `DishCard`(재료 2×2 → 요리 아이콘·이름 + 스탯 줄)는 플레이 로그·결과 플랜 양쪽이 같이 쓴다
- **게임 화면이지만 색은 사이트 토큰 그대로**: 패널 `bg-surface border-border`, 주요 버튼 `bg-foreground text-background`, 슬롯·×N 배지는 `ItemSlot`과 같은 `bg-surface-hover border-ring`, 강조는 사이트가 쓰는 amber 틴트(`bg-amber-500/15 text-amber-600`)만. 처음엔 검정 패널+호박색 버튼으로 만들었다가 "통일감이 없다"는 피드백으로 되돌렸다 — 게임 느낌은 큰 솥·슬롯·연출·등급 도장으로 내고 색으로 내지 않는다. 연출 키프레임(`trainer-wobble`·`pop`·`float`·`bubble`·`pulse`·`stamp`)은 `globals.css` 끝에 있다. 요리하기 → 0.9초 흔들림(`COOK_MS`) → 결과 요리 2.2초 노출(`REVEAL_MS`), 그동안 입력 잠금

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
- 오른쪽: 스킬 노드 카드 (아이콘 + 이름 + 토글). 아이콘은 `SkillIcon` — 다크모드에서 밝은 배경판 (#113)
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

`scrollContainer` 마커는 탭마다 **여러 개가 동시에 DOM 에 있다**(숨은 탭도 마운트 유지, #91). 잡을 땐
`document.querySelector` 가 아니라 자기 `ref` 또는 `findScrollContainerFor` 를 쓴다 (#105).
AppShell 의 탭 래퍼에는 `data-tab-root="<tabId>"` 가 붙어 있어 탭 경계 판정에 쓴다.

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

### 농사 탭 (FarmingApp) (#120)
헤더의 보기 칩 3개로 화면을 바꾸는 단일 스크롤 탭. 상태는 전부 URL(`?tab=farming&view=&season=&with=&crop=`, `useFarmingState`).
```
┌─────────────────────────────────────────────┐
│ 농사                                         │
│ [계절별 조합] [작물] [참고표]                 │ ← 보기 칩 (TagChip + 선택 강조)
├─────────────────────────────────────────────┤
│ (계절별 조합)                                │
│ [봄][여름][가을][겨울]                       │ ← 계절 칩 (텍스트 — 봄·가을 아이콘이 게임에 없다)
│ ⚠ 일반 씨앗 → 거대 작물 불가 안내            │
│ 이 작물이 들어간 조합: [전체][당근]…          │ ← 제철 작물만, 작물 상세에서 넘어오면 미리 선택됨
│ ┌ 조합 카드 ───────────────────────────────┐ │
│ │ [5 타일당 | 토마토란] + [5 | 감자 가지]   │ │ ← 칸 = 양분 역할, 칸 안 작물은 서로 대체 가능
│ │ (타일 1개로 충분) (새 밭에서 안전)        │ │ ← 상태 배지 2개 (초록=좋음 / 호박색=주의)
│ │ 최악 순서 수요 — 성장 촉진제 10 …         │ │
│ └──────────────────────────────────────────┘ │
│ (작물) CategoryCard 그리드 14개 → DetailPanel │
│ (참고표) 비료 · 돌보기 도구 · 급수 · 스트레스 7항목 · 수확물 · 잡초 │
│ <Footer />                                   │
└──────────────────────────────────────────────┘
```
- **데이터**: `src/data/farming.ts`(자동 생성, `scripts/extract-farming.py`) — 이름·도감 라벨·스트레스 대사까지 ko.po에서 온다. 게임에 없는 말만 `src/components/farming/farming-text.ts`에 둔다 (홈 번들에 안 실리게 `i18n.ts`와 분리)
- **조합은 저장하지 않고 계산한다**: `src/lib/farming-combos.ts` `farmCombos(season)`. 정렬은 ① 타일 하나로 끝남 ② 칸 수 적음 ③ 새 밭에서 안전 ④ 일반 씨앗에서 흔한 작물
- **작물 상세(`CropDetail`)**: 인게임 식물 도감 순서 — 계절 → 물 소비량 → 양분 순환 → 씨앗·생산물·거대 작물(`ItemSlot`) → 성장 시간 → 일반 씨앗 확률 → 맞는 비료(`ItemSlot`, 배지 = 양분값) → 조합으로 이동 → 현장 기록
- **`ValueBadge`**(`src/components/farming/ValueBadge.tsx`): "게임 수치" / "계산값" 구분 표시. 게임에서 그대로 온 값과 우리가 계산한 값(조합·포기 수·양분 수요·씨앗 확률)을 화면에서 나눈다 — 농사 화면에 수치를 더할 땐 반드시 둘 중 하나를 붙일 것
- 스트레스 7항목 이름은 게임에 공식 라벨이 없어 나무위키식 표기를 쓰고 인게임 대사(윌슨)를 곁들인다
- 양파 작물 이미지는 게임 파일명이 `quagmire_onion.png` — `cropImage()`가 처리한다

### SEO 전용 SSG 페이지
클라이언트 앱과 별도로 서버 렌더링되는 정적 페이지:
- `/item/[slug]` — 제작 아이템 상세 (JSON-LD: HowTo)
- `/food/[slug]` — 요리 레시피 상세 (JSON-LD: Recipe)
- `/boss/[slug]` — 보스 상세 (JSON-LD: GamePlayMode)
- `/browse` — 전체 목록 디렉토리
- `/cookpot` — 요리솥 랜딩페이지
- `/farming` — 농사 가이드 (`seo/FarmingContent` — 계절별 조합을 빌드 시 계산해 표로 담는다. 참고표는 탭의 `FarmingGuide`를 그대로 재사용 + 계절별 FAQ + 농사 관련 아이템 링크)
- `/skill-trees` — 스킬트리 허브 (`seo/SkillTreesListContent` — 캐릭터 카드 + 스킬/분기 수 + FAQ, #126)
- `/llms.txt` — AI 검색용 사이트 안내 (`src/app/llms.txt/route.ts`, 빌드 시 데이터에서 생성, #126)

**목록(허브) 페이지 공통 — `seo/list-schema.tsx` (#126)**
- `itemListLd()` — 허브 페이지 ItemList JSON-LD (characters·quests·cookpot·browse·skill-trees)
- `faqLd()` + `FaqSection` — FAQ JSON-LD와 화면 FAQ를 **같은 배열**로 만든다 (구조화 데이터만 있고 화면에 없으면 구글이 무시). 답변은 게임 데이터에서 계산한 문장만
- `DataSourceNote kind="extracted"|"verified"` — 게임 릴리즈 기준 출처 문구 (`DST_GAME_VERSION`). **게임 파일에서 자동 생성했거나(농사) 스크립트로 대조 검증한(스킬트리) 페이지에만** 붙인다. characters·cookpot·browse처럼 손으로 관리하는 데이터에 붙이면 직접 쓴 설명이 AI 검색에 "게임 원문"으로 인용된다 (#126 리뷰)
- `fillTemplate()` — FAQ 문장 틀의 `{key}` 채우기
- 새 허브 페이지를 만들면 `SeoFooterLinks`(홈)·`BrowseContent`·사이트맵 `staticPaths`에 링크를 같이 추가할 것 — `/farming`이 사이트맵에만 있고 내부 링크가 없던 게 #126의 발단

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
- **사용처**: CraftingApp, CookingApp, BossesApp, FarmingApp, SkinsApp, Wx78StatusPanel, Wx78CircuitBoard, FeedbackBoard (설정 탭)
- **짝 훅**: `useDetailPanel` — 패널 open/close 애니메이션 상태 관리
- **Props**: `open`, `onClose`, `onBack`/`backLabel`, `hideClose`, `children`
- **스크롤 잠금 (#105)**: 열리는 동안 **자기 탭의** `[data-scroll-container]` 에 인라인 `overflow:hidden`. 대상은 `findScrollContainerFor(overlayRef)` 로 찾는다 — `document.querySelector` 첫 매치는 숨은 제작 탭이라 금지. 오버레이에 `data-detail-open="true|false"` 마커가 있어 `useScrollLockHeal` 이 "시트 없는 잠금" 을 판정한다
- **탭을 떠나면 닫혀야 한다**: URL 상태 시트는 `useTabSync(() => set(readUrlState()))` 로, 로컬 상태 시트(스킨·WX-78·피드백 보드)는 `useTabSync(() => setSelected(null))` 로. 열린 채 `display:none` 이 되면 잠금이 잔존해 그 탭 스크롤이 죽는다

### FeedbackBoard (`src/components/settings/FeedbackBoard.tsx`)
- **용도**: 사용자 피드백 게시판 (설정 탭에 임베드). 공개 목록 + 어드민 관리 UI를 한 컴포넌트에서 분기
- **구조(공개)**: 피드백 카드 리스트(본문/상태 뱃지/자동 번역 배지+원문 토글) + 답변이 있으면 답변 블록
- **번역 선택**: `pickDisplay`가 원문 언어와 사용자 로캘을 비교해 원문/번역 중 하나만 보여준다. 번역 칸은 보통 반대 언어 문자열 하나지만, 원문이 ko/en이 아니면(pt 등) `{"ko","en"}` JSON 맵이 들어오고 `translationFor`가 로캘 키를 고른다 (#123)
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
- **사용처**: CraftingApp(CategoryGrid), CookingApp, BossesApp, FarmingApp(작물 그리드)
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

### SkillIcon (`src/components/ui/SkillIcon.tsx`)
- **용도**: 스킬트리 아이콘(`public/images/skill-icons/*.png`) 표시. 인게임 추출본이 **검은 선화 + 투명 배경**이라 다크모드에선 어두운 카드에 묻힌다 → 다크모드에서만 `dark:bg-zinc-200` 배경판을 깐다 (#113). 라이트모드는 배경 없음
- **Props**: `icon`(파일명, 확장자 제외), `alt?`, `className?`(크기 — `size-10` 등)
- **사용처**: `SkillNodeCard`(스킬트리 탭), `SkillTreePageContent`(SEO 스킬트리 페이지). 제작탭 상세의 "스킬 필요" 칩은 노란 배경이라 `TagChip` 그대로
- **규칙**: 스킬 아이콘을 새로 그리는 곳은 `<img>` 직접 쓰지 말고 이 컴포넌트를 쓸 것

### SearchWithSuggestions (`src/components/ui/SearchWithSuggestions.tsx`)
- **용도**: 드롭다운 서제스천 + 태그 지원 검색 입력
- **사용처**: `SearchBar`(제작), `CookingSearchBar`(요리), BossesApp(전리품 검색)
- **선택 동작**: 제안의 `data`를 그대로 돌려주고 탭별 핸들러가 해석한다. 제작 `item`·요리 `recipe` 제안은 태그 추가 + 상세 패널 즉시 오픈(`onSelectItem` / `onSelectRecipe`), 요리 `rawFood` 제안은 태그 없이 상세 직행(`onSelectRawFood`). 제작품이면서 재료인 아이템은 아이템 줄이 재료 줄 바로 위에 온다 — 재료 줄은 "그 재료를 쓰는 레시피" 필터 (#102)

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
- **용도**: Google AdSense 광고 자리 (#134 — Ezoic에서 전환, 배경은 `docs/ezoic-decision.md`). 자리별 `<ins class="adsbygoogle">`를 그리고 `adsbygoogle.push({})`로 요청. 로더(`adsbygoogle.js`)는 `layout.tsx`가 1회 동적 삽입, 상수는 `src/lib/adsense.ts`
- **자리(variant)와 광고 단위** — slot id는 `src/lib/adsense.ts`의 `ADSENSE_SLOT`에 둔다(공개 정보라 환경변수 불필요). 콘솔에서 **디스플레이 광고 · 반응형**으로 만들고 규격은 코드가 CSS로 정한다:
  | variant | 위치 | 규격 |
  |---|---|---|
  | `top` | 모든 탭의 목록/컨텐츠 첫 줄 (제작·요리 카테고리 화면과 목록, 보스, 스킬 캐릭터 그리드·스킬 트리, 스킨, 퀘스트, 콘솔, 농사) **+ SEO 정적 페이지 전부** (`src/components/seo/*Content.tsx` — 히어로/h1 블록 바로 아래) | **CSS 고정** 320×100, `md` 이상 728×90 (가로 띠) |
  | `rail-left` / `rail-right` | 탭 컨텐츠 좌우 (`AppShell`) | 336폭(바깥 352) 반응형 세로(`data-ad-format="vertical"`). 화면 1500 미만은 미표시 |
  - **상세 시트 안에는 자리를 두지 않는다 (#110)** — Ezoic 시절 시트 자리(103)가 viewability 51%(다른 자리 78~93%)에 수익 4.7%였다. 사용자가 보러 온 정보가 광고 위에서 끝나 스크롤할 동기가 없고, 고정 `SupportPill`이 소재 위로 겹쳤다(광고 가림은 정책 위반)
- **🔴 `<ins>` 하나에 요청은 한 번뿐** — 같은 노드에 `push`를 두 번 하면 "All 'ins' elements … already have ads in them" 오류. 그래서 자리가 숨겨지면(탭 `display:none`) `<ins>`를 **DOM에서 빼고**, 다시 보이면 **새 노드**를 그려 새로 요청한다. `AdCard`는 `key={active}`로 활성 전환마다 상태를 새로 시작한다. 요청 전 `data-adsbygoogle-status`(AdSense가 처리한 노드 표식)를 확인해 StrictMode 이중 실행도 거른다
- **보이는 자리만 `<ins>`를 그린다** — 숨은 탭의 자리에 요청하면 아무도 못 보는 노출(정책 위반)이고, 폭 0인 `<ins>`는 AdSense가 "No slot size for availableWidth=0"으로 거부한다. 활성 판정: 교차하면 활성, 안 교차해도 레이아웃 박스가 있으면 활성 유지(스크롤로 벗어난 것 — 해제하면 돌아올 때 새 노드·새 노출로 부풀려진다), 박스가 0이면 비활성(탭이 숨겨진 것)
- **🔴 자리를 쥔 노드는 화면 전환에도 살아 있어야 한다 (#93)** — 노드가 교체되면 새 요청이 나가 광고가 비었다가 다시 찬다. **자리는 화면별 컴포넌트 안이 아니라 그 위, 전환에도 유지되는 위치에 하나만 둔다.** 제작·요리·보스는 여러 `return`을 하나로 합쳐 자리를 공유 스크롤 컨테이너에 하나만 뒀고(#95), 스킬은 캐릭터 그리드 ↔ 스킬트리 삼항 **위**로 올렸다. 새 탭을 만들 때도 같은 규칙
- **상단 띠는 규격을 CSS로 고정한다 — CLS 0의 근거** — 띠는 컨텐츠 위에 있어 높이가 뒤늦게 정해지면 목록이 밀린다(유입 65%가 구글). AdSense 반응형은 도착 시점에 높이를 정하므로 띠에는 못 쓴다. Google이 문서화한 "CSS 미디어 쿼리로 규격 지정" 방식(`BAND_INS_CLASS`: 320×100 / `md:` 728×90)을 쓰면 그 크기의 소재만 오고, 못 채워도(`data-ad-status="unfilled"`) 박스 크기가 같아 전후 높이가 동일하다. **브레이크포인트는 `sm`이 아니라 `md`** — SEO 본문은 640px이고 `AdBleed`가 `md` 이상에서만 728을 만들어 준다
- **높이를 만드는 것(사방 패딩 8px · "AD" 라벨 줄 14px · 띠 고정 규격)은 `filled`와 무관하게 항상 그린다** — 채워질 때만 붙이면 도착 순간 그만큼 밀린다. 장식(테두리·배경)과 라벨 글자만 `filled`에 건다. 못 채운 띠는 빈 여백으로 남는다 — 예약을 풀어 위로 당기는 것도 CLS다. "AD" 라벨은 소재 **위** 자기 줄에 있다(AdSense 소재엔 Ezoic 같은 신고 줄이 없어 겹쳐 놓을 자리가 없다 — 소재 위에 겹치면 정책 위반)
- **카드는 사방 8px 안쪽 여백, 바깥 폭 = 소재 폭 + 16** — 여백 없이 꽉 채우면 `rounded-xl` + `overflow-hidden`이 소재 귀퉁이(AdChoices 아이콘)를 잘라낸다 (#104). `BAND_BOX_CLASS`·`RAIL_BOX_CLASS` 폭 = `*_INS_CLASS` 폭 + `CARD_PAD` (개발 빌드가 어긋나면 콘솔 에러)
- **도착 판정은 `data-ad-status`** — AdSense가 응답 뒤 `<ins>`에 `filled`/`unfilled`를 박는다. 자식·iframe을 셀 필요가 없다. `AdVisibilityProbe`(도달 계측 #85)·`EnvDiagOverlay`도 같은 `isAdFilled`를 쓴다
- **테스트 광고 모드 = beta 빌드** (`ADSENSE_TEST`, `NEXT_PUBLIC_DEPLOY_ENV=beta`) — 모든 `<ins>`에 `data-adtest="on"`(Google이 "Test Ad" 소재를 보내고 노출·클릭을 집계하지 않는다), 로더에 `?client=`를 떼어 **자동 광고를 막는다**(자동 광고엔 테스트 플래그가 없어 켜면 실광고). beta에서 광고를 눌러 봐도 무효 트래픽이 안 된다. 별도 환경변수로 두지 않은 이유: main 빌드에 섞일 경로를 없애기 위해
- **자동 광고(앵커·전면)는 코드가 아니라 AdSense 콘솔(사이트별 설정)에서 켠다** — 권장: **앵커 + 전면(vignette)만 켜고 페이지 내 자동 삽입·사이드레일은 끈다.** 우리 자리는 예약 높이로 CLS를 막는데 자동 삽입은 그걸 우회한다. Ezoic 때 전면 광고가 수익의 29%(RPM 최고)였다(`docs/ezoic-decision.md`). 앵커 높이는 `AppShell`이 `--ad-anchor-h`로 빼 준다(#97) — 셀렉터 `ins.adsbygoogle[data-anchor-status]`(`src/lib/ad-anchor.ts`), 전면(vignette)도 같은 클래스의 fixed `<ins>`라 `data-anchor-status`로 한정한다
- **좁은 본문에서는 띠 자리를 `AdBleed`로 넓힌다** (`src/components/ads/AdBleed.tsx`, #83) — SEO 상세 본문이 640px이라 `md:-mx-11`로 `640 + 88 = 728`을 만든다. **`md` 미만에는 적용하지 않는다**(가로 스크롤)
- **레일 브레이크포인트 근거**: 아이템 그리드 최대폭 896 + 좌우 300씩 = 1496 → `min-[1500px]`
- **검증 스크립트** — 자리를 건드렸으면 beta에 올린 뒤 반드시 돌린다 (`npm i -D playwright-core`, 설치된 Chrome 사용):
  ```bash
  node scripts/check-adsense-beta.mjs https://beta.dstcraft.com
  ```
  판정: 로더 태그 1개·본체 로드 / 보이는 자리마다 `<ins>` 1개, 숨은 탭엔 0개 / beta는 전부 `data-adtest` + `filled` / 탭·카테고리·시트 왕복 뒤 콘솔 adsbygoogle 오류 0 / 띠 높이 도착 전후 동일·누적 layout-shift ≤ 0.1 / beta에 자동 광고 `<ins>` 없음. beta는 테스트 소재가 결정적으로 와서 채움까지 판정한다(production 주소를 넘기면 채움은 뺀다)
- **목업 모드**: `?admock=<자리>[:<규격>]` (쉼표로 복수, `all` 지원). 실제 광고 대신 규격만큼의 점선 박스를 그린다 — 예 `?admock=all`, `?admock=top:320x100,rail-left`

### LegacyPwaNotice (`src/components/ui/LegacyPwaNotice.tsx`)
- **용도**: iOS 26 legacy 웹클립 설치본(#60 이전 black-translucent 박제 → 하단 흰 띠)에만 뜨는 재설치 안내 배너. standalone + (screen-innerHeight>20) + safe-area-inset-top>0 시그니처로 감지, 닫기 시 localStorage 영구 dismiss. 해당 설치본이 소멸하면 자연히 안 뜨는 자기소멸형
- **사용처**: `src/components/AppShell.tsx`

---

## 공유 훅

### useDetailPanel (`src/hooks/use-detail-panel.ts`)
- **용도**: 바텀시트 패널 open/close 애니메이션 (double-rAF + delayed cleanup). 열리는 두 프레임 사이에 선택이 풀리면 rAF 를 취소한다 — 안 그러면 빈 시트 + 오버레이가 영구히 남는다 (#105)
- **사용처**: CraftingApp, CookingApp, BossesApp, SkinsApp, FeedbackBoard
- **반환**: `{ panelItem, panelOpen }`

### useTabSync (`src/hooks/use-tab-sync.ts`)
- **용도**: 탭 URL 이 바뀌는 모든 순간(`popstate`, `dst-tab-switch`, `pageshow` persisted)에 콜백 호출 (#105)
- **사용처**: use-crafting-state, use-bosses-state, use-cooking-state (`set(readUrlState())`), SkinsApp, Wx78StatusPanel, Wx78CircuitBoard, FeedbackBoard (로컬 시트 닫기)
- **규칙**: 콜백은 "내 탭이 아니면 return" 하지 말고 무조건 URL 을 다시 읽어 덮어쓴다. 새 탭의 URL 상태 훅은 popstate 를 직접 듣지 말고 이 훅을 쓸 것

### useScrollLockHeal (`src/hooks/use-scroll-lock-heal.ts`)
- **용도**: 시트 없이 남은 스크롤 잠금(인라인 overflow)을 탭 전환·`visibilitychange`·`pageshow` 때 지우는 자가 복구 (#105)
- **사용처**: AppShell 1곳 (`useScrollLockHeal(activeTab)`)

### findScrollContainerFor (`src/lib/scroll-container.ts`)
- **용도**: 패널 DOM 위치에서 자기 탭의 `[data-scroll-container]` 찾기 — `closest` → 조상 단계별 `querySelectorAll`(보이는 것 우선) → `[data-tab-root]` 에서 중단 (#105)
- **사용처**: DetailPanel. 탭 안에서 "내 스크롤 컨테이너" 가 필요하면 `document.querySelector` 대신 이것 또는 자기 `ref`

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

### 조각상 도면·결과물 (`src/data/sketches.ts`)
- **용도**: 도예가의 돌림판 조각상(`chesspiece_*_builder`)의 필요 도면과 입수처, 조각 재료별 결과물 이미지를 한 곳에서 파생 (#111)
- **데이터**: `figureSketchSources` (조각상 id → `SketchSource[]`), `sketchName()`("{조각상} 도면" / "{Figure} Sketch" — 인게임 named 컴포넌트와 동일 규칙), `sketchIcon()`(전용 아이콘 없으면 `sketch.png`), `sculptResultImages()`(대리석 / `_stone` / `_moonglass` 접미사)
- **사용처**: `ItemDetail`(도면 필요 칩 + 재료별 결과물 슬롯 + 도면 입수처 칩), `ItemPageContent`(SEO 페이지 같은 두 섹션), `bosses.ts`의 `lootDisplayName`/`lootImage`(도면 전리품 이름·아이콘), `BossesApp` 전리품 알약(도면 클릭 → 조각상 상세)
- **입수처 칩 동작**: 보스 → `onBlueprintClick(sketchId)`로 보스탭 전리품 검색, 제작 도면 → `onItemClick(itemId)`로 그 도면 아이템 상세, 나머지(회전초·석상 채굴·돼지왕 교환·신월 부활·성소)는 `sketchSourceLabel()` 텍스트 칩
- **조각 재료**: 인게임 `Ingredient(TECH_INGREDIENT.SCULPTING, 2)`는 "돌림판에 올린 조각용 돌 1개"라 재료 슬롯 `sculpting_material ×1`로 표현. 새 조각상을 추가하면 `figureSketchSources`에 입수처를 함께 등록할 것

