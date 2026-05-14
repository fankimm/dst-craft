# Mistakes & Lessons (오답노트)

## 게임 데이터

### station 정보를 인게임 recipes.lua 검증 없이 작성
- **문제**: 와그펑크 작업장(`TECH.WAGPUNK_WORKSTATION_TWO`) 레시피 8종이 모두 `station: "none"`으로 등록됨 (기질 추론기, 게슈탈트 포획기, W.A.R.B.O.T. 키트 2종, 청사진 2종, 정전기 억제기, 방전 방주). 인게임에서는 와그펑크 작업장(관념 조립기) 근처에서만 제작 가능하나 우리 앱은 "맨손 제작"으로 표시
- **원인**: 레시피 데이터 작성 시 `recipes.lua`의 `Recipe2(...)` 세 번째 인자(TECH 레벨)를 확인하지 않음
- **교훈**: 모든 station 값은 `recipes.lua`의 TECH 인자에서 도출해야 함. `TECH.NONE` → "none", `TECH.SCIENCE_ONE` → "science_1", `TECH.WAGPUNK_WORKSTATION_TWO` → "wagpunk_workstation" 식으로 1:1 매핑. 다른 잘 알려지지 않은 작업장(SHELLWEAVER, MASHTURFCRAFTING 등)도 검증 필요할 수 있음
- **검증**: `grep '^Recipe2("<id>"' recipes.lua` → TECH 인자 확인 → constants.lua:1229의 `TECH = {...}` 정의에서 어느 작업장 tier인지 역인덱스
- **부수 발견**: `numtogive=N` 옵션도 함께 누락되는 경우 많음 (슬링샷 탄, 향신료, 벽 등 30+ 레시피). 데이터 정확도가 필요한 부분

### lua 원본의 오타를 "고치지" 말 것
- **문제**: wurt 스킬 데이터에서 `swampmaser` 태그(`t` 빠진 오타)가 lua 원본에 그대로 있는데, 우리 TS 데이터에서 "오타니까 정리"해서 모두 제거함
- **원인**: 검증 스크립트가 "missing tags: ['swampmaster']"라고 출력 → 후에 다시 검증 시 이번엔 "missing tags: ['swampmaser']" → 처음엔 "swampmaster"가 정답이라 오해
- **교훈**: 인게임 lua 데이터의 명백한 오타도 우리 TS는 그대로 매칭해야 함. 오타 자체가 게임 내 태그 검색 키이므로 "수정"하면 게임과 동작이 달라짐
- **검증**: `grep "swampmaser" /tmp/dst-extract/scripts/prefabs/skilltree_wurt.lua` — lua 원본도 같은지 먼저 확인

### nounlock ≠ blueprint 혼동
- **문제**: `nounlock: true`인 아이템 전부에 블루프린트 뱃지를 표시함
- **원인**: `nounlock`(프로토타입 불가)과 `TECH.LOST`(블루프린트 필요)를 구분하지 않음
- **교훈**: DST 레시피의 두 가지 속성은 별개:
  1. `nounlock=true` — 프로토타입 불가 (매번 스테이션 필요, 양념류/캐릭터 전용 등)
  2. `TECH.LOST` — 블루프린트 필요 (보스 드롭 등으로 블루프린트를 얻어야 제작 가능)
  - `TECH.LOST`인 아이템은 `nounlock`이기도 하지만, 역은 성립하지 않음
- **해결**: 데이터 모델에 `blueprint: boolean` 필드 분리, `TECH.LOST` 기준으로만 블루프린트 뱃지 표시
- **검증**: `grep "TECH.LOST" recipes.lua`로 블루프린트 아이템, `grep "nounlock=true" recipes.lua`로 프로토타입 불가 아이템 별도 확인

### 한글명을 ko.po 확인 없이 임의 작성
- **문제**: 아이템 스펙 문서(armor.md)에 한글명을 ko.po 원본 확인 없이 아이템 ID에서 추측하여 작성 → 23개 중 7개 불일치
- **원인**: 영문명/ID에서 한글명을 유추하여 적음 (예: voidclothhat → "공허천 투구", 정답은 "공허의 두건")
- **교훈**: 한글명은 반드시 ko.po 파일에서 `STRINGS.NAMES.<ID>` → `msgstr` 값을 확인한 후 작성할 것. 절대 추측 금지.
- **검증**: `grep -A 2 'STRINGS.NAMES.<ID>' ko.po | grep msgstr`로 원본 확인

### ko.po 한글 번역 자체에 게임 메커닉과 어긋나는 수치 버그가 박혀있는 경우
- **문제**: `wx78module_maxsanity1`(연산 회로) 한글 스크랩북: "최대 정신력이 100 증가한다". 영문 스크랩북·tuning.lua 모두 +40. 한글 표기를 따라 wx78-circuits.ts에 value: 100 박았다가(0.21.13) 잘못된 값임을 확인하고 +40으로 되돌림(0.21.14). 제작탭(ItemStatsPanel)에 표시되는 한글 specialinfo_ko도 동일한 버그
- **원인**: ko.po 번역 자체가 게임 동작과 어긋남(인게임 번역팀 측 실수). "사용자가 인게임에서 보는 한글 표기와 일치시키자" 원칙이 평소엔 옳지만, 한글 번역이 게임 코드와 모순될 때는 코드/영문이 정답
- **교훈**: ko.po의 한글 번역에 "수치"가 들어있는 경우(체력 +N, 데미지 +N% 등), 영문 원문 또는 tuning.lua/prefabs/*.lua의 실제 상수와 한 번 더 대조할 것. 일치하면 한글 그대로, 어긋나면 코드/영문이 우선. 명백한 번역 버그는 변환 파이프라인에서 보정(`scripts/convert-scrapbook.py`의 `KO_TRANSLATION_FIXES` 같은 dict)
- **검증**: `grep -A1 'STRINGS.SCRAPBOOK.SPECIALINFO.<ID_UPPER>' ko.po | grep msgstr` ↔ `grep '<ID_UPPER>' tuning.lua` ↔ 영문 specialinfo (`grep -A5 'SCRAPBOOK_SPECIALINFO' strings.lua`). 셋이 같은 수치를 가리키는지 교차 확인
- **부수**: 비슷한 번역 버그가 다른 회로/캐릭터/아이템에도 있을 수 있음. 시뮬레이터/스탯 시스템에서 한글 스크랩북 텍스트의 수치를 직접 파싱해 사용하지 말 것 — 별도 정형 필드(value: number)로 코드 기준 값을 두고, 텍스트는 표시용으로만 사용

### "카테고리 affinity"를 "특별 선호 음식"과 동일시
- **문제**: 워트가 `AddFoodtypeAffinity(FOODTYPE.VEGGIE, 1.33)`을 가지고 있다는 사실만 보고 "모든 채소는 워트 선호 음식"이라고 답변/구현 → 음식 카드마다 "워트의 선호 음식" 라벨이 붙어 노이즈가 됨. 사용자 피드백으로 발각: "워트 선호는 두리안만 맞는 것 같다, 두리안에게만 +15 추가 보너스가 있다"
- **원인**: 인게임 wurt.lua를 다시 읽어보니 `AddPrefabAffinity("durian", 1.93)` 주석이 명시적으로 "veggi bonus + 15", `AddPrefabAffinity("kelp", 1.33)` 주석은 "prevents the negative stats, otherwise foodtypeaffinity would have suffice"라고 적혀있음. 즉 두리안만 채소 기본을 *초과*하는 진짜 특별 선호이고, 켈프는 음수 스탯 방지용 동일 배수 override일 뿐. 코드 주석을 끝까지 안 읽고 함수 호출만 보고 결론지음
- **교훈**: foodtype affinity와 prefab affinity는 다른 의미. UI에서 "○○의 선호 음식"으로 강조하려면 prefab 보너스가 그 캐릭터의 foodtype 기본 보너스를 *초과*해야 함. 동일하면 카테고리 다이어트(예: 워트 = 채식주의자, 모든 채소 ×1.33)일 뿐 카드별 강조 라벨은 부적절. 또한 수치 옆 인게임 주석은 항상 끝까지 읽을 것 — `-- veggi bonus + 15` / `-- prevents the negative stats` 같은 짧은 주석에 결정적 의미가 들어있음
- **검증**: `grep -B2 -A5 "foodaffinity" prefabs/<char>.lua` → AddFoodtypeAffinity와 AddPrefabAffinity의 배수 비교 → 코드 주석으로 "특별 보너스 vs 동일 override" 의도 확인. UI 라벨은 prefab > foodtype baseline일 때만 표시
- **추가 사실**: 사용자가 같은 주제로 두 번 피드백을 줬는데 1차 답변에서 "모든 채소가 선호 음식이 맞다"고 잘못 닫았다. 사용자 재차 지적하지 않았다면 그대로 잘못된 상태로 남았을 것 — 사용자 피드백을 받았을 때 코드를 한 단계 더 확인하지 않은 게 본질적 실수

### 함수명만 보고 동작을 추측
- **문제**: `MakeForgeRepairable` 함수명만 보고 "대장간에서 수리 가능"이라고 작성 → 실제로는 전용 수리 키트로 수리하는 구조
- **원인**: 함수 내부 구현(standardcomponents.lua)과 관련 컴포넌트(forgerepair.lua, forgerepairable.lua)를 읽지 않고 함수명에서 의미를 추측
- **교훈**: 함수명/변수명에서 동작을 추측하지 말 것. 반드시 구현부를 읽고 확인한 후 작성.
- **검증**: 함수 정의 → 호출하는 컴포넌트 → 실제 동작까지 추적

### 통합 파일에서 다른 아이템 코드를 해당 아이템 것으로 혼동
- **문제**: hats.lua에서 wathgrithr_improvedhat 스펙을 추출할 때, 근처에 있던 walter_refreshattunedskills(월터 모자)의 보온/방수 업그레이드를 wathgrithr_improvedhat 것으로 잘못 기재. 또한 캐릭터 본체 스킬(wathgrithr_combat_defense, BONUS_PLANAR_DEF=5)을 투구 스킬로 혼동.
- **원인**: 여러 아이템이 한 파일에 정의된 통합 파일(hats.lua 등)에서 함수 경계를 정확히 추적하지 않고, 근처 코드를 해당 아이템의 것으로 간주.
- **교훈**: 통합 파일에서는 반드시 함수 스코프를 확인할 것. 특히 `fns.아이템명 = function()` 블록 내부인지, 별도 함수인지 구분. 스킬트리 코드는 스킬 ID와 적용 대상(아이템 vs 캐릭터)을 정확히 추적.
- **검증**: 해당 함수가 어디서 호출되는지 역추적 (ListenForEvent, onequip 등)

### tuning.lua만으로 스펙 작성하고 프리팹 파일 미확인
- **문제**: 어둠의 검(nightsword)의 정신력 감소(dapperness=CRAZINESS_MED)를 누락. tuning.lua에 NIGHTSWORD_DAPPERNESS 같은 전용 변수가 없어서 grep에 안 잡힘.
- **원인**: 갑옷에서는 프리팹을 전부 읽었으나, 무기에서는 시간 절약을 위해 tuning.lua grep만으로 스펙을 작성. dapperness, walkspeedmult, insulated 등 프리팹 코드에서 직접 대입하는 속성을 놓침.
- **교훈**: 모든 카테고리에서 반드시 프리팹 파일도 읽을 것. tuning.lua는 수치 원본이지만, 프리팹에서만 설정하는 속성(dapperness, insulated, walkspeedmult, SetConsumption, 내구도 유무 등)이 존재함. 절대 tuning.lua만으로 스펙이 완전하다고 판단하지 말 것. 아이템 수가 많아도 "단순해 보이는 것"을 건너뛰지 말 것 — 단순해 보이는 아이템이 오히려 예외(내구도 무한 등)일 수 있음.

### 유저 피드백을 검증 없이 반영
- **문제**: 폴리 로저 모자의 스펙을 유저가 알려준 내용 그대로 반영하고 인게임 소스를 확인하지 않음
- **원인**: 유저가 게임에 익숙하니 맞을 것이라고 판단하고 검증 생략
- **교훈**: 유저 피드백이라도 반드시 소스에서 검증한 후 반영할 것. 유저의 기억이 정확할 수도 있지만, 패치로 변경되었거나 세부 동작이 다를 수 있음. 소스가 유일한 진실(source of truth).

### 스킬 이름 ID 불일치
- **문제**: `builderSkill` ID ≠ ko.po 키 ≠ 아이콘 파일명
- **예시**:
  - `wormwood_berrybushcrafting` → ko.po: `WORMWOOD.BERRYBUSHCRAFTING_TITLE` (캐릭터 접두사 없음)
  - `wolfgang_normal_coach` → ko.po: `WOLFGANG_COACH_TITLE`, 아이콘: `wolfgang_coach.png`
  - `wilson_alchemy_2` → ko.po: `wilson_alchemy_gem_1`, 아이콘: `wilson_alchemy_gem_1.png`
- **교훈**: 반드시 ko.po에서 직접 검색 + 아이콘 파일 직접 확인해서 매핑할 것. 자동 매핑 신뢰 금지.

### 기존 레시피 데이터를 원본과 교차 검증하지 않음
- **문제**: WX-78 기존 아이템 3개의 레시피가 인게임 소스와 불일치 — 발광 회로(scandata 6→2), 광전자 회로(fireflies→wx78module_light), 회로 추출기(rocks→flint). 용파리 보석 드롭도 100% 확정인데 15~25%로 잘못 입력
- **원인**: 초기 입력 시 오류가 들어간 후 검증 없이 유지됨
- **교훈**: 새 아이템 추가나 관련 데이터 수정 시, 해당 카테고리의 기존 아이템도 함께 인게임 소스와 교차 검증할 것. 특히 recipes.lua의 Ingredient 목록과 수량을 1:1 대조.

### scrapbook specialinfo_ko에 동작 효과 + 최대 vital을 한 문장으로 묶어 비문 생성
- **문제**: `wx78module_bee.specialinfo_ko`가 `30초마다 체력을 5 회복하고, 정신력을 분당 2 회복하며, 최대 정신력이 100 증가한다.` 처럼 회복 효과와 최대 vital을 한 문장에 연결어미(`-며`)로 묶어 작성. WX-78 현황 패널이 `최대 정신력 100`을 합산 카드로 추출하면서 남은 본문이 `...회복하며.` 로 끝나 비문이 됨
- **원인**: `Wx78StatusPanel.tsx`의 `extractVitalKo` 정규식이 `^(.+),\s*최대 ... 증가한다\.?$` 패턴으로 vital만 떼어내고 `rest`에 마침표를 강제로 붙이는데, `rest`의 끝이 `-며` 같은 연결어미면 그래밋이 깨짐. 작성 시점에는 패널이 통째로 표시한다고 가정함
- **교훈**: scrapbook 한국어 본문에서 `최대 체력/정신력/허기` 증가 문구는 **반드시 별도 문장**(`. `로 분리)으로 작성. 회복 효과 등과 한 문장에 연결어미로 묶지 말 것. 합산 카드가 vital을 빼가도 본문이 완전한 문장으로 남아야 함.

## TEX 아틀라스 추출

### UV 좌표 V축 반전
- **문제**: 추출된 아이콘이 전부 투명(빈 이미지)
- **원인**: V축을 OpenGL 방식으로 반전함 (`top = (1 - v2) * H`)
- **교훈**: Klei TEX는 V축을 반전하지 않음 (top-left origin). `top = v1 * H` 직접 사용

### 추출 이미지 상하 반전
- **문제**: 아이콘이 위아래 뒤집혀서 표시
- **교훈**: 추출 후 `img.transpose(Image.FLIP_TOP_BOTTOM)` 상하 반전 필요

### 원본 아이콘 색상
- **문제**: 아이콘을 금색으로 틴팅했으나 검정으로 나옴
- **원인**: 원본이 흰색 실루엣이 아니라 **검정 실루엣 + 알파 채널** (RGB=0, 알파만 다름)
- **교훈**: 인게임 스타일은 금색 원형 배경(`#dab74e`) 위에 어두운 실루엣(`rgb(45,35,20)`)을 합성하는 방식

### 보스 이름 자체 번역
- **문제**: 보스 한글 이름 16개 중 9개가 ko.po와 불일치
- **원인**: ko.po를 확인하지 않고 커뮤니티에서 흔히 쓰는 이름을 임의로 사용
- **예시**: 곰거→곰소리, 게 왕→대게왕, 말바트로스→꽉새치, 거미 여왕→여왕 거미
- **교훈**: CLAUDE.md 규칙대로 **반드시** ko.po의 `STRINGS.NAMES.<ID>` msgstr 값을 사용할 것. 자체 번역/추측 금지

### 블루프린트 = 보스 드롭 가정
- **문제**: 블루프린트 뱃지 클릭 시 보스탭으로 이동하는데, 부두 키트 등 보스 전리품이 아닌 블루프린트 아이템은 매칭 안 됨
- **원인**: `{itemId}_blueprint`로 보스 전리품 목록만 검색 → 127개 블루프린트 중 보스 드롭이 아닌 것들은 빈 결과
- **교훈**: 블루프린트 입수처는 다양함 (보스 드롭, NPC 거래, 이벤트 등). 보스 전리품에 없으면 폴백 처리 필요

## 상태 관리

### CSS hidden 탭에서 상태 잔류
- **문제**: 제작탭에서 상세 패널 열고 → 보스탭 → 다시 제작탭 돌아오면 패널이 닫히지 않음
- **원인**: 탭을 CSS `display:none`(hidden 클래스)으로 숨기므로 컴포넌트 언마운트 안 됨. `pushState`는 `popstate`를 발생시키지 않아 URL 기반 상태(`useCraftingState`)가 동기화 안 됨
- **해결**: 탭 전환 시 `dst-tab-switch` 커스텀 이벤트 발행 → 각 탭의 상태 훅에서 감지하여 선택 초기화
- **교훈**: CSS hidden 방식 탭에서는 탭 전환 시 각 탭의 상태를 명시적으로 동기화해야 함

## React

### useState를 useRef 대신 사용하여 무한 루프
- **문제**: 보스 탭에서 카테고리 선택 시 무한 로딩(브라우저 멈춤)
- **원인**: 이전 카테고리 값을 추적하는 `prevCat`을 `useState`로 선언 → `useEffect` 의존성 배열에 포함 → 매 렌더마다 새 배열 참조 생성 → 무한 리렌더
- **잘못된 코드**: `const prevCat = useState<T>(null);` + `useEffect(..., [prevCat])`
- **올바른 코드**: `const prevCat = useRef<T>(null);` + `useEffect(..., [selectedCategory])`
- **교훈**: 렌더를 유발하지 않고 이전 값만 추적할 때는 반드시 `useRef` 사용. `useState`는 값 변경 시 리렌더를 유발하므로 "이전 값 기억" 용도에 부적합

### Upstash Redis pipeline 응답 파싱 실수
- **문제**: `/rating`, `/top-countries` 공개 엔드포인트에서 데이터가 빈 값으로 반환
- **원인**: `redisPipeline()` 반환값을 `(raw as string[][])[0]`으로 접근했으나, Upstash pipeline 응답 형태는 `[{ result: [...] }]`
- **올바른 코드**: `(raw as { result: any }[])[0]?.result`
- **교훈**: 관리자 `/stats` 엔드포인트에서는 이미 `results[i]?.result`로 올바르게 접근하고 있었음. 새 엔드포인트 추가 시 기존 파싱 패턴을 반드시 참조할 것

### 스테이션 태그 아이콘 임시값 방치
- **문제**: `lunar_forge`, `shadow_forge`, `critter_lab` 스테이션 아이콘이 `magic.png`, `decorations.png` 같은 엉뚱한 아이콘을 사용
- **원인**: 초기에 해당 스테이션 전용 아이콘이 없어서 임시로 유사 카테고리 아이콘을 넣었는데, 이후 교체하지 않음
- **교훈**: 임시값(placeholder)을 넣을 때는 TODO 주석을 반드시 달 것. 아이콘/이미지 추가 시 `stationImages` 매핑도 함께 확인

### SW 캐시로 이미지 교체 미반영
- **문제**: 카테고리 아이콘 PNG를 교체했으나 PWA에서 이전 이미지가 계속 표시
- **원인**: `sw.js`의 이미지 캐시 전략이 cache-first + 재요청 없음. 한번 캐시되면 SW 캐시 버전을 올리기 전까지 절대 갱신 안 됨
- **해결**: `CACHE_NAME` 버전 bump (v7→v8) → 이후 빌드 시 자동 해시 주입으로 근본 해결 (`scripts/generate-sw.cjs`)
- **교훈**: 수동 버전 관리는 반드시 잊게 되어있음. 빌드 자동화로 해결할 것

### v1 데이터만 수정하고 v3 미수정
- **문제**: `pickaxe_lunarplant`에 망치 겸용 기능을 `item-stats.ts`(v1)에만 추가 → UI에 반영 안 됨
- **원인**: UI는 v3 데이터가 있으면 v1의 `usage`를 무시 (`!hasV3 && stats.usage`). v3의 `effects` 배열을 함께 수정하지 않음
- **교훈**: 아이템 스펙 수정 시 **v3 데이터(`item-stats-v3.ts`)를 항상 먼저 확인**. v3가 존재하는 아이템은 v3만 UI에 반영됨

### 카테고리 아이콘 스타일 불일치
- **문제**: 새 카테고리 아이콘으로 위키의 건물 이미지(풀컬러, 비정형 사이즈)를 사용 → 기존 아이콘(인게임 제작탭 아이콘, 256x256 정사각형, 모노톤 스타일)과 이질적
- **교훈**: 카테고리 아이콘은 인게임 제작탭의 Station Icon을 사용할 것. 위키에서 `{StationName}_Station_Icon.png`으로 검색 가능. 기존 아이콘과 스타일 통일이 중요

### 보스 전리품을 위키/기억 기반으로 작성
- **문제**: 고대의 수호자(minotaur)에서 수호자의 뿔(minotaurhorn) 누락, 상자 내용물을 직접 드랍으로 혼동, 기둥 비계 도면 빠짐. 클라우스에서 보따리 보상(핵심 컨텐츠) 전체 누락.
- **원인**: DST 보스의 드랍 구조를 인게임 lua 소스 검증 없이 위키/기억으로 작성. DST 보스는 (1) `SetSharedLootTable` = 직접 드랍, (2) 별도 스폰 메커니즘(상자/보따리) = 2차 보상으로 분리됨. 이 구조를 구분하지 않고 대표 아이템만 나열.
- **교훈**: 보스 데이터 수정/추가 시 반드시:
  1. `prefabs/<boss>.lua`의 `SetSharedLootTable` → 직접 드랍 목록
  2. 같은 파일의 chest/sack 스폰 로직 + 관련 컴포넌트 → 2차 보상 목록
  3. 두 가지를 모두 확인하고 구분하여 입력
- **검증**: `grep "SetSharedLootTable\|chest_loot\|GetLoot\|dospawnchest" prefabs/<boss>.lua`

### 퀘스트/진행 단계 설명을 인게임 소스 미검증으로 작성
- **문제**: #29 퀘스트 체크리스트 작성 시 자체 추정이 그대로 들어감:
  1. 은둔자 fix_house_3 설명 "최종 완성 — 차 가게 청사진을 받음" — hermitcrab.lua 870-876행 확인 결과 평시엔 추가 보상 없음. 겨울 축제 중에만 `winter_ornament_boss_hermithouse` 1개. 청사진은 받지 않음.
  2. 연료직공 craft_atrium_key 설명 "악몽 연료 5 + 4색 보석으로 제작" — recipes.lua에 `Recipe2("atrium_key", ...)`가 존재하지 않음. 실제는 유적에 1회 배치된 키를 회수 → atrium_gate에 trade로 삽입 → 처치 후 pickable로 재회수 (atrium_gate.lua trader/pickable + TUNING.ATRIUM_GATE_COOLDOWN=20일).
  3. 천상의 대변자 페이즈별 패턴 묘사("광역 레이저와 분신", "가시 분출과 돌진") — SG state 미확인 자체 묘사.
- **원인**: prefab 파일을 line-by-line 보지 않고 community/wiki 지식으로 채움. user-facing 단계 설명이라 "그럴듯한 묘사"만 채우고 진행.
- **교훈**:
  1. 퀘스트/진행 체인 단계 설명도 인게임 소스에서 직접 검증할 것 — `prefabs/<boss>.lua`의 reward 함수, `recipes.lua` Recipe2 존재 여부, `TUNING.<KEY>` 상수, world spawn / construction 메커니즘 등
  2. 검증 못한 단계는 "묘사 없이 단계명만" 두는 게 그럴듯한 거짓 묘사보다 낫다 (memory: `feedback_specialinfo_no_self_authoring`의 일반화)
  3. 사용자가 한 번 의심하면 같은 패턴의 다른 단계도 즉시 전수 재검증할 것
- **검증**: `grep 'Recipe2("<prefab>"' recipes.lua`, `grep "TUNING\\.<KEY>" tuning.lua`, prefab 파일에서 lootdropper / construction_product / friendlevels rewardfn 등 직접 추적

### 아이템 특수 효과 팩트체크 누락
- **문제**: item-stats.ts에 usage 추가 시 게임 지식에만 의존하여 3개 오류 발생
  1. `yellowamulet` — 부활 효과로 적었으나 실제는 발광+이동속도 부적 (부활은 `amulet`)
  2. `yellowstaff` — "별로 변환"이라 적었으나 실제는 Dwarf Star 소환
  3. `trident` — damage 51/uses 200으로 적었으나 실제 34/150 (보트 위 3배)
- **교훈**: 게임 데이터 수치/효과 추가 시 반드시 위키(`dontstarve.wiki.gg`) **또는 인게임 소스코드**에서 팩트체크 후 커밋. 기억에 의존하지 말 것. 소스가 접근 가능하면 소스 우선.
  - 추가 사례: `spear_wathgrithr_lightning` — "3번째 타격마다 번개 소환"이라 적었으나, 실제는 쿨다운 후 돌진(lunge) + 범위 전기 피해. 소스코드 확인으로 발견
  - 추가 사례: `trident` — 위키 기반으로 damage 34로 수정했으나, tuning.lua에서 확인하니 `wilson_attack * 1.5 = 51`이 맞음. **위키도 틀릴 수 있으므로 소스코드가 최종 권위**
  - 추가 사례: `featherfan` — uses 9로 되어있었으나 소스에서 15 확인. 데이터 입력 시 소스 미확인

### 방어구/무기 특수 효과 누락
- **문제**: 소스코드에 특수 효과가 있는데 usage를 안 넣은 아이템 다수 발견
  - `ruins_bat` — 20% 확률 그림자 촉수 소환 (`SHADOW_TENTACLE_RUINS_BAT_CHANCE = 0.2`)
  - `armor_lunarplant` — 차원 반사 피해 10/20 (`damagereflect` 컴포넌트)
  - `armor_voidcloth` — 정신력 부정적 오라 면역 (`neg_aura_modifiers:SetModifier(inst, 0)`)
  - `nightstick` — 전기 무기 + 광원
- **교훈**: 스탯 추가 시 prefab 소스코드의 `onattack`, `onequip`, `AddComponent` 호출을 반드시 확인. 수치만 보지 말고 특수 로직도 체크

### ko.ts 중복 키 추가
- **문제**: 이미 존재하는 아이템 번역(shadowlumber_builder 등)을 확인 없이 재추가 → 빌드 실패
- **교훈**: 로캘 데이터 추가 전 반드시 기존 키 존재 여부 grep으로 확인

### 크록팟 재료 태그 데이터 대규모 오류
- **문제**: `cookpot-ingredients.ts`의 재료 태그가 인게임 `cooking.lua`와 15개 항목에서 불일치
- **주요 오류**:
  - `rock_avocado_fruit_ripe`: `fruit: 0.5` → 실제 `veggie: 1` (완전히 다른 태그)
  - `plantmeat`/`plantmeat_cooked`: `veggie: 1` 태그 추가되어 있었으나 인게임에는 없음
  - `fish(물고기)`: `meat: 0.5` → 실제 `meat: 1`
  - `wobster_sheller_land`: `fish: 2` → 실제 `fish: 1`, cookable=true → 실제 NOT cookable
  - `durian`: `fruit: 0.5` → 실제 `fruit: 1`
  - `lightninggoathorn`: `magic: 2` 태그 존재 → 인게임에는 없음
  - `wormlight`: `magic: 1` 태그 + cookable → 인게임에는 둘 다 없음
  - `refined_dust`: `inedible: 1` → 실제 `decoration: 2`, 이름도 "Powdercake Dust" → "Collected Dust"
- **원인**: 위키/커뮤니티 자료 기반으로 데이터를 입력하면서 인게임 소스(`cooking.lua`)와 대조하지 않음
- **교훈**: 크록팟 재료 데이터는 **반드시 인게임 `cooking.lua`와 1:1 대조** 후 입력. 위키도 틀릴 수 있음. 게임 소스코드 경로: `dontstarve_steam.app/Contents/data/databundles/scripts.zip` → `scripts/cooking.lua`
- **검증 방법**: `unzip -o scripts.zip "scripts/cooking.lua"` → `grep "AddIngredientValues" cooking.lua`로 전수 대조

### 크록팟 레시피 테스트 함수 대규모 오류
- **문제**: `cookpot-engine.ts`의 레시피 테스트 함수가 인게임 `preparedfoods.lua`와 17개 항목에서 불일치
- **주요 오류 유형**:
  1. **raw vs cooked 혼동**: 게임은 `names.mandrake`(raw만) 체크하는데 우리는 `n.mandrake + n.mandrake_cooked >= 1`로 cooked도 허용 (mandrakesoup, turkeydinner, shroomcake, shroombait, talleggs, watermelonicle, guacamole 등 9개)
  2. **정확한 개수 vs 이상**: 게임은 `names.boneshard == 2`(정확히 2개)인데 우리는 `>= 2`로 변환 (californiaroll, nightmarepie, bonesoup)
  3. **누락 재료 대안**: fishtacos/powcake에서 Corn Cod 대안 누락, unagi에서 pondeel 누락
  4. **없는 레시피 누락**: dustmeringue(엠버로시아) 미구현
- **원인**: Lua→TypeScript 포팅 시 `names.xxx`를 일괄적으로 `n.xxx + n.xxx_cooked >= 1`로 변환한 것이 주원인. 게임에서 raw만 체크하는 경우가 많음
- **교훈**: Lua `names.xxx` → `!!n.xxx`, Lua `(names.xxx or 0) + (names.xxx_cooked or 0) >= N` → `n.xxx + n.xxx_cooked >= N`. 각 레시피마다 cooked 포함 여부를 개별 확인. `==` vs `>=` 구분도 주의

### cooking.lua의 `_dried`/`_cooked` 가상 재료를 실제 아이템으로 착각
- **문제**: `batnose`에 `dryable: true`를 주어 `batnose_dried` 변형을 자동 생성 → `batnose_dried.png`가 없어 크록팟 시뮬레이터에서 이미지 깨짐
- **원인**: `cooking.lua`의 `AddIngredientValues({"batnose"}, ..., true, true)`만 보고 `batnose_dried` 아이템이 실재한다고 가정. 실제로는 `prefabs/meats.lua`의 `BATNOSE_DRYABLE_DATA.product = "smallmeat_dried"` — 박쥐 콧구멍을 건조대에 올리면 별도 prefab이 아니라 작은 육포(`smallmeat_dried`)가 생성됨. cooking.lua의 `_dried` 등록은 단지 태그 lookup용 내부 엔트리이지 실재 아이템이 아님
- **교훈**: 크록팟 재료에 `dryable`/`cookable`을 표시하기 전에 반드시 `prefabs/<id>.lua`의 `*_DRYABLE_DATA.product` / `*_COOKABLE_DATA.product`로 실제 산출물을 확인. cooking.lua는 "이 ID로 들어오면 어떤 태그를 부여하는가"의 룩업 테이블이고, 실제 산출 prefab은 prefab 파일에서만 결정됨
- **검증**: `unzip -p scripts.zip scripts/prefabs/meats.lua | grep -B1 -A5 "<NAME>_DRYABLE_DATA\|<NAME>_COOKABLE_DATA"` → product 필드 확인

### preparednonfoods.lua 존재를 간과
- **문제**: Amberosia(dustmeringue)가 `preparedfoods.lua`에 없어서 게임에 없는 것으로 착각
- **실제**: `preparednonfoods.lua`에 비음식 요리솥 레시피로 별도 정의되어 있음
- **교훈**: 요리솥 레시피 소스는 3개 파일을 모두 확인: `preparedfoods.lua`, `preparedfoods_warly.lua`, `preparednonfoods.lua`

### v2 usage 텍스트의 구조적 한계
- **문제**: v2의 `usage` 필드에 모든 메타 정보(캐릭터 전용, 세트 보너스, 수리 방법, 스킬트리, 태그 등)를 인라인 마커(`[세트]`, `[수리]` 등)로 텍스트에 끼워넣음 → 렌더링 시 파싱 어렵고, ko/en 분리 후 세그먼트 정렬 꼬임, 번역 오류 원천 차단 불가
- **교훈**: 텍스트 안에 구조화 정보를 태그로 넣지 말 것. 처음부터 별도 필드로 분리하면 렌더링도 깔끔하고, 번역도 itemName() 같은 함수로 안전하게 해결 가능
- **해결**: v3에서 usage 제거, tags/character/resistance/set_bonus/repair/skill_tree/immunities/effects 필드로 분리

### 병렬 에이전트의 파일 충돌 주의
- **문제**: 6개 에이전트가 동일 파일(item-stats-v3.ts)을 동시에 편집 → 마지막 에이전트(3-7)가 리밋에 걸렸을 때, 이전 에이전트들의 편집이 이미 파일에 반영되어 있어 충돌 가능성
- **교훈**: 같은 파일을 여러 에이전트가 동시에 편집하면 후발 에이전트가 선발의 변경을 덮어쓸 수 있음. 가능하면 파일별로 에이전트를 분리하거나, 순차 실행할 것
- **이번 케이스**: 각 에이전트가 다른 아이템 ID를 편집해서 실제 충돌은 없었으나, 운이 좋았음

### 보스 2단계 드롭 메커니즘 누락
- **문제**: 천상의 대변자(Celestial Champion)에서 계몽의 왕관(alterguardianhat) 드롭이 빠짐
- **원인**: 보스 프리팹(`alterguardian_phase3.lua`)의 `SetSharedLootTable`만 확인하고 끝냄. 실제로는 보스 사망 → 오브(`alterguardian_phase3dead`) 스폰 → **오브의 loot table**에서 왕관 100% 드롭하는 2단계 구조
- **교훈**: DST 보스의 전리품은 단일 loot table만이 아님. 사망 시 SpawnPrefab으로 생성되는 중간 엔티티(dead 오브, corpse 등)의 loot table도 반드시 확인. `grep "SpawnPrefab" stategraph`로 사망 애니메이션 중 스폰되는 프리팹 추적

### isLockSatisfied가 manualLocks를 받지 않아서 boss_kill/manual lock AND 게이트 통과 불가
- **문제**: 친화(allegiance) 스킬(그림자/월광 가희)을 12스킬+보스 처치 토글 모두 켜도 잠금 상태로 남아 습득 불가
- **원인**: `use-skill-tree.ts`의 `isLockSatisfied`가 `manualLocks` 파라미터를 받지 않고 boss_kill=false, manual=true로 하드코딩됨. `canLearn`의 locks(AND 게이트) 체크는 이 함수를 그대로 호출해서 boss_kill이 항상 미충족으로 판정. parent(OR 게이트) 쪽에만 `manualLocks` 특수 분기가 있었음
- **교훈**: lock 충족 판정 로직은 한 곳(`isLockSatisfied`)으로 통합하고 `manualLocks`를 인자로 받을 것. 호출부마다 분기를 추가하면 일부 경로에서 누락됨. SkillTreeView에 같은 이름의 헬퍼를 만들면서 hook 쪽의 기존 버그를 보지 못했던 것도 원인
- **검증**: 친화 그룹이 있는 캐릭터(Wilson 등)에서 12스킬 + fuelweaver/celestialchampion 토글 후 그림자/월광 스킬이 학습 가능한지 UI 확인

### 잠금 조건 라벨: 제네릭 문구 사용 + no_opposing_faction 반전
- **문제1**: 스킬트리 잠금 조건이 "스킬 6개 필요"처럼 제네릭 템플릿으로만 표시. 인게임은 "버니 스킬 6개를 습득하세요"처럼 구체적
- **문제2**: no_opposing_faction 라벨이 반대로 표시 (lunar↔shadow 뒤바뀜). 모든 캐릭터 공통 버그
- **문제3**: WX-78 진영 잠금을 `manual` 하나로 합쳐서 무조건 클릭으로 열림
- **원인**: lockTranslations에 인게임 원문이 있었는데 UI에서 사용하지 않고 제네릭 i18n 키만 사용. no_opposing_faction의 faction 의미("이 잠금이 속한 진영")를 "체크할 진영"으로 잘못 해석하여 라벨 반전
- **교훈**: 
  1. 인게임 원문(lockTranslations)이 있으면 반드시 우선 사용. 제네릭 템플릿은 fallback용
  2. lua의 복합 lock_open은 개별 typed lock 노드로 분리 (자동 검증 가능한 조건은 자동으로)
  3. 라벨/설명은 임의 작성 금지 — ko.po/strings.lua 원문 사용 필수
- **해결**: lockLabel에 lockId 파라미터 추가 → lockTranslations 우선 참조, no_opposing_faction 반전 수정, WX-78 잠금 3개로 분리 + disabled 타입 추가

### 게임 데이터 소스 선택: 파생 데이터 → 원본으로 3회 회귀
- **문제**: 콘솔 소환용 아이템 목록을 game-items-db(recipes.lua 기반, 1028개) → Prefab() grep(1130개) → ko.po STRINGS.NAMES(2796개)로 3번 교체
- **원인**: "가장 완전하고 신뢰할 수 있는 소스는 무엇인가"를 먼저 따지지 않고, 가까이 있는 기존 데이터부터 가져다 씀
  1. `game-items-db`: recipes.lua 기반 → 제작 아이템만 있고 자연채집/보스드랍 누락
  2. `Prefab()` grep: 팩토리 패턴(MakeHat, MakeArmor 등)으로 생성되는 프리팹 누락
  3. `ko.po STRINGS.NAMES`: 게임에서 이름이 있는 모든 엔티티 = 소환 가능한 모든 것
- **교훈**: 새 데이터 소스가 필요할 때, "이 데이터의 완전한 원본(single source of truth)은 어디인가"를 먼저 파악할 것. DST에서 "이름이 있는 모든 엔티티" = ko.po STRINGS.NAMES. 파생 데이터(recipes.lua, Prefab() 정의)는 항상 부분집합.

### iOS Safari input 자동 확대 (font-size < 16px)
- **문제**: 숫자 input 포커스 시 iOS가 자동 확대 → 축소 후 하단에 흰 가림막 발생
- **원인**: iOS Safari는 `font-size < 16px`인 input/select/textarea에 포커스하면 자동 확대. 확대→축소 사이클에서 `100dvh` 레이아웃이 제대로 복원 안 됨
- **교훈**: 모든 input/select/textarea에 `text-base`(16px) 적용 필수. 데스크톱에서 작게 보이길 원하면 `text-base sm:text-xs` 패턴 사용. `SearchWithSuggestions`는 이미 `text-base sm:text-sm`으로 처리되어 있었음
- **검증**: 새 input 추가 시 반드시 `text-base` 포함 여부 확인

### iOS Safari 키보드 열고 닫으면 100dvh 복원 안 됨
- **문제**: input 포커스로 키보드 열림 → 닫으면 하단에 키보드 높이만큼 흰 패널 발생 + 상단 탭바까지 스크롤 불가
- **원인**: iOS Safari가 키보드 열릴 때 `overflow:hidden`에도 불구하고 페이지를 강제 스크롤. 키보드 닫혀도 `100dvh`가 원래 높이로 복원 안 되어 레이아웃이 깨짐
- **해결**: CSS `100dvh` 대신 `window.visualViewport.height`를 직접 사용. viewport resize 이벤트마다 html/body 높이를 실제 뷰포트에 맞추고, 키보드 닫힐 때 `window.scrollTo(0,0)` 호출. AppShell 루트도 `h-dvh` → `h-full`로 변경하여 body 높이를 상속
- **교훈**: iOS Safari에서 `100dvh`는 키보드 상태 변화 시 신뢰할 수 없음. `visualViewport` API가 더 정확

### DXT5 디코딩
- Pillow 내장: `Image.frybytes('RGBA', (w,h), data, 'bcn', (3,))`
- pixel_format 0=DXT1(bcn 1), 1=DXT3(bcn 2), 2=DXT5(bcn 3)

## Worker / 외부 연동

### production Worker에 검증용 payload를 직접 POST
- **문제**: ko-fi webhook 구현 후 verification 토큰 동작 확인을 위해 production worker에 `from_name=__SELFTEST__` payload를 직접 POST → 그 닉네임이 `dst:supporters` sorted set에 저장되어 공개 `/supporters` TOP 5에 노출됨. 정리하려고 admin DELETE 엔드포인트 추가 + 재배포 + CORS DELETE 허용 추가 + 사용자에게 브라우저 콘솔 fetch 안내까지 후폭풍 발생
- **원인**: 저장 경로에 dry-run 또는 테스트 식별 옵션이 없는 상태에서 production 검증을 강행
- **교훈**: 새 external webhook/event 핸들러를 production에서 검증하기 전에 다음 중 하나는 반드시 갖출 것:
  1. `wrangler dev`로 로컬에서 검증
  2. Worker가 dry-run 헤더(예: `X-Dry-Run: 1`)를 인식해 저장 스킵
  3. transaction id 패턴(예: `selftest-`)을 인식해 저장 스킵
- **검증**: 외부 연동 코드 작성 시 위 3가지 중 하나가 코드에 들어 있는지 PR 자체 점검 항목으로 확인

## 컴포넌트 / 리팩터링

### querySelector로 anchor 잡을 때 AppShell 다중 탭 마운트 함정
- **문제**: FloatingSupportPill이 푸터로 docking되는 동작이 Crafting 탭에서만 작동, 다른 탭(Cooking/Boss/Skills 등)에선 floating이 계속 떠있고 푸터가 보여도 안 빨려들어감
- **원인**: AppShell은 모든 탭을 동시에 마운트하고 `display: none`만 토글하는 구조. 각 탭의 Footer 안에 `<SupportPill data-support-pill-anchor />`가 들어있으니 anchor 마커가 **6개 동시 존재**. 기존 코드는 `document.querySelector("[data-support-pill-anchor]")`로 첫 번째(=Crafting의 anchor)만 잡고 그것만 IntersectionObserver로 관찰 → Crafting 탭에 있을 땐 visible이라 정상 동작, 다른 탭에선 그 anchor가 `display:none`이라 IntersectionObserver가 항상 `isIntersecting=false` 반환 → docking 영원히 안 일어남
- **해결**: `querySelectorAll`로 모든 anchor를 observe + WeakMap으로 각 anchor의 intersection 상태 누적 추적 → 어느 하나라도 visible이면 dock. callback의 `entries`는 변경분만 오므로 단순히 그것만 검사하면 다른 탭의 anchor가 이미 visible이어도 false로 판단할 수 있음
- **교훈**:
  1. AppShell이 다중 탭을 한꺼번에 마운트하는 구조에서 `data-*` 마커는 항상 **여러 개 존재**한다고 가정. `querySelector` 대신 `querySelectorAll` 기본
  2. IntersectionObserver의 `entries`는 변화된 것만 오므로, 다중 타깃 관찰 시 누적 상태(WeakMap/ref)로 따로 보관 필요
- **검증**: 단일 인스턴스가 보장되는 마커가 아니면 `querySelectorAll(...).length`를 dev 모드에서 한번 출력해 다중 마운트 여부 확인

### "공통 컴포넌트만 고치면 다 적용된다" 가정으로 사용처 확인 누락
- **문제**: ko-fi 후원자 ticker를 `SupportPill` 컴포넌트에 구현했는데, 사용자가 "푸터의 서포트 버튼"이라고 명시한 메인 푸터(`Footer.tsx`)는 `SupportPill`을 쓰지 않고 동일 디자인의 ko-fi 버튼을 별도 하드코딩하고 있었음 → ticker가 메인 푸터에 적용 안 됨, 사용자가 빈 ticker 보고 보고 후 발견
- **원인**:
  1. `grep "SupportPill"` 만 돌리고 `grep "ko-fi.com"` / `grep "Support this project"` (실제 동작/텍스트)로는 안 찾음
  2. 컴포넌트 이름과 실제 푸터 버튼이 1:1 매핑된다고 자동 가정 (이름 유사성)
  3. CLAUDE.md "중복 코드 자동 공통화" 룰을 사전에 적용했어야 하는데 무시 — 동일 패턴 ko-fi 버튼이 5곳(Footer/SupportPill/ReviewPrompt/SettingsPage/DetailPanel)에 산재
- **교훈**: 사용자가 UI 위치를 지목하면 **컴포넌트 이름이 아니라 실제 동작/텍스트/링크/className으로 grep**해서 모든 사용처 파악 후 작업
- **검증**: 새 기능 작업 시작 전 `grep -rn "<관련 텍스트나 URL>"` 으로 사용처 후보 모두 나열 → 중복이면 먼저 공통화 후 본 작업 진행

## SEO

### 글로벌 layout에 페이지 단위 schema(FAQPage 등)를 넣어 모든 페이지에서 중복
- **문제**: `src/app/layout.tsx`에 FAQPage JSON-LD를 박아둔 상태에서, 캐릭터/아이템/보스/음식/스킬트리 Content 컴포넌트도 자체 FAQPage를 출력 → 모든 상세 페이지에 FAQPage 2개. Google Search Console "잦은 문의 사항" 리포트에서 `'FAQPage' 입력란이 중복되었습니다` 에러 32개 페이지 전부에 검출, "URL이 Google에 등록되어 있지만 문제가 있음" 표시 + 리치 결과 노출 거부
- **원인**: 처음 글로벌 FAQ를 layout에 넣을 때 "사이트 전체 FAQ"로 의도했으나, 이후 페이지별 FAQPage를 추가하면서 layout 쪽을 정리하지 않음. 스키마는 페이지 단위로 1개씩이어야 한다는 제약을 잊음
- **교훈**: `app/layout.tsx`에는 사이트 전체에 항상 동일하게 적용되는 schema(WebApplication, Organization 등)만 두기. 페이지마다 내용이 달라지는 schema(FAQPage, HowTo, Recipe, Article 등)는 절대 layout에 두지 말 것
- **검증**: 빌드 후 `grep -oE '"@type":"FAQPage"' out/<path>.html | wc -l`로 페이지당 1개인지 확인. 글로벌 FAQ가 필요하면 홈(`src/app/page.tsx`)에만 두는 게 안전

### 게임 내부 ID를 그대로 URL slug로 쓰면 검색어 매칭이 안 됨
- **문제**: 아이템·보스·음식 데이터에서 인게임 prefab ID(`hambat`, `nightsword`, `beequeen`)를 idToSlug(_→-만 치환)로 그대로 URL에 노출 → 사람들이 검색하는 키워드 "ham bat", "dark sword", "bee queen"과 토큰 분리가 안 돼 SEO 매칭 약화. 특히 `nightsword`는 게임 내부 ID라 사람이 절대 검색하지 않는 문자열
- **원인**: 초기 sitemap/라우트 설계 시 "ID == slug"가 가장 단순해서 그렇게 시작 → 데이터 양 늘어난 뒤로는 변경 비용 부담으로 방치
- **교훈**: SEO용 URL slug는 **사용자가 검색할 영문명**(`name` 필드)에서 파생해야 함. `nameToSlug(name)`으로 lower-case + 비영숫자→하이픈 → 토큰 분리. 단 ID-기반 옛 slug로 이미 색인된 페이지가 있으면 양쪽 다 살려두고 새 slug에 canonical을 두어 점진 이전(static export라 301 redirect 못 씀)
- **검증**: 빌드 후 `out/sitemap.xml`에 새 slug만 있는지 + `out/<path>/<old-slug>.html`의 `<link rel="canonical">`이 새 slug를 가리키는지 확인. 외부에서 옛 URL로 들어와도 200 + canonical 정상이어야 함
- **부수 발견**: 이름이 같은 아이템이 있을 수 있어 slug 빌드 시 중복 검출 → ID 접미사로 fallback (`<base>-<id>`) 처리 필요

## 인프라 / 셀프호스팅

### Next.js 16 Metadata API의 `appleWebApp.capable`이 `apple-mobile-web-app-capable` 메타를 출력하지 않음
- **문제**: iOS PWA 스플래시(apple-touch-startup-image)가 미표시. 18개 기기 사양으로 PNG 72장 + media query까지 정확히 세팅했는데도 안 나옴. `screen and` prefix 누락(0.22.3)을 고친 후에도 여전히 미표시
- **원인**: Next.js 16의 `metadata.appleWebApp.capable: true` 설정이 신규 표준인 `<meta name="mobile-web-app-capable" content="yes">`만 출력하고, **레거시 `<meta name="apple-mobile-web-app-capable" content="yes">`는 누락**. iOS Safari는 PWA standalone 모드 활성화에 여전히 apple-prefix 메타가 필요 → 활성화 안 되면 splash 매칭도 스킵됨
- **검증**: `grep -oE '<meta name="(apple|mobile)[^>]*>' out/index.html` → `mobile-web-app-capable`만 보이고 `apple-mobile-web-app-capable` 없으면 이 케이스
- **해결**: `layout.tsx`의 `<head>`에 `<meta name="apple-mobile-web-app-capable" content="yes" />` 수동 주입
- **교훈**: PWA 메타 태그는 Next.js Metadata API에 100% 위임 금지. 빌드 결과(`out/<page>.html`)에서 실제로 어떤 메타가 출력되는지 grep으로 확인하는 단계 필수. 특히 iOS는 deprecated 표기에도 여전히 apple-prefix를 요구하는 케이스가 있음
- **부수**: 이미 홈 화면에 추가된 PWA 아이콘은 첫 install 시점의 splash 메타를 캐시함. 메타 수정 후 사용자는 **아이콘 삭제 후 재추가** 필요 (릴리즈 노트에 명시)

### nginx 정적 캐시 정규식이 sw.js까지 1년 immutable로 캐시 (PWA 표준 위반)
- **문제**: Phase 1 nginx 설정의 `location ~* \.(js|css|...)$ { expires 1y; ... immutable; }`가 `sw.js`도 매칭 → Service Worker 파일이 1년간 immutable로 캐시. 빌드를 새로 해도 사용자 브라우저의 옛 SW가 활성 상태로 옛 chunk를 영구 서빙. Phase 3 배포 후 supporters dedupe 패치가 적용된 chunk가 빌드/배포됐는데 사용자 화면엔 여전히 7회 호출되는 현상으로 발견
- **원인**: brew nginx 정적 캐시 템플릿을 그대로 쓰고 sw.js 예외 처리를 빠뜨림. PWA 표준에선 sw.js는 `Cache-Control: no-cache` 또는 `max-age=0` 권장. 브라우저는 24시간마다 sw.js 재검증하지만 immutable 헤더면 무력화될 수 있고, CDN(Cloudflare 등)이 1년 캐시하면 origin이 바뀌어도 사용자에게 옛 sw.js 서빙
- **교훈**: nginx에서 `~* \.js$` 같은 정규식 정적 캐시 location을 만들면 **반드시 sw.js / manifest.webmanifest 예외 처리** 먼저 (`location = /sw.js` exact match를 위에 두면 nginx가 우선 적용). chunk 파일은 해시 기반 이름이라 immutable이 안전하지만, sw.js와 manifest는 고정 경로라 캐시되면 영구화됨
- **해결**:
  ```nginx
  location = /sw.js {
    expires off;
    add_header Cache-Control "public, max-age=0, must-revalidate";
  }
  location = /manifest.webmanifest {
    expires off;
    add_header Cache-Control "public, max-age=0, must-revalidate";
  }
  location ~* \.(js|css|...)$ { expires 1y; ... immutable; }
  ```
- **검증**: `curl -sI https://<domain>/sw.js | grep -i cache-control` → `max-age=0` 확인. immutable 보이면 즉시 패치
- **부수 작업**: 이미 immutable 헤더를 받은 사용자/CDN 캐시는 자동 무효화 안 됨. CF zone에서 해당 파일 수동 purge 필요. 사용자는 hard refresh + DevTools SW unregister로 즉시 회복

### Turbopack 코드 분할로 module-level dedupe 변수가 chunk별 복제되어 무력화
- **문제**: `fetchSupporters()`에 module-level `let _supportersCache = null` 캐시 추가했는데, Turbopack이 같은 모듈을 3+ chunk에 중복 번들링하면서 각 chunk가 자기만의 `_supportersCache`를 가짐 → chunk 간 dedupe 미작동. 페이지 1회 로드에 7~8회 fetch.
- **원인**: 정적 export + Turbopack의 chunk splitting에서 shared 모듈이라도 사용처(컴포넌트)별로 다른 chunk에 들어가면 모듈 코드가 그대로 복제됨. JS의 모듈 일치성은 "같은 URL/ID로 import" 기준이 아니라 chunk별 별도 인스턴스 — 이게 module-level 클로저 변수에는 치명적
- **검증**: 빌드 후 `grep -lE "fetch\([^)]+/supporters" out/_next/static/chunks/*.js | wc -l` — 1보다 크면 중복. 그리고 minify된 코드의 캐시 변수명이 chunk마다 다른지 확인 (`a.promise` vs `i.promise` vs `l.promise` 등)
- **교훈**: 빌드 타임에 chunk 분할이 발생할 수 있는 환경(특히 Turbopack/webpack splitChunks)에서는 **dedupe 캐시는 module-level이 아니라 `globalThis`에 저장**해야 단일 소스 보장. 패턴:
  ```ts
  const KEY = "__myCache";
  type Cache = { promise: Promise<T>; at: number };
  const g = globalThis as Record<string, unknown>;
  const cached = g[KEY] as Cache | undefined;
  if (cached && Date.now() - cached.at < TTL) return cached.promise;
  // ...
  g[KEY] = { promise, at: Date.now() };
  ```
- **부수 발견**: 같은 이유로 module-level 카운터/플래그/싱글톤 등도 chunk 분할 환경에서 공유가 깨질 수 있음. 진짜 전역 상태가 필요하면 `globalThis` 또는 React Context를 써야 함

### GH Variables/Secrets에 paste한 값에 trailing newline이 묻어들어가 외부 API가 정당히 400으로 거절
- **문제**: watchdog의 CF API auto-failover step에서 `WATCHDOG_VERCEL_CNAME=cname.vercel-dns.com` GH Variable 값을 사용해 PATCH 요청. CF가 HTTP 400 + `9207: Request body is invalid`로 거절. 같은 PATCH를 Mac mini 셸에서 실행하면 200 성공. body 디버그 출력해보니 `{"content":"cname.vercel-dns.com\n","proxied":true}` — 사용자가 GH UI에 붙여넣을 때 trailing `\n`이 따라 들어가 JSON에 literal newline이 박혀 invalid
- **원인**: GH Actions UI에서 변수를 paste할 때 클립보드/입력 필드가 trailing newline을 보존. shell `$VAR` 치환은 newline 그대로 유지. printf '%s' 도 strip하지 않음. `$()` substitution이라면 bash가 자동 strip하지만 env-injected 값은 그대로
- **교훈**: 외부 API에 보낼 값이 GH Vars/Secrets에서 오면 **반드시 whitespace trim**. 디버그 시 body의 길이와 visible content를 같이 출력해 invisible char를 surface
- **해결**:
  ```bash
  CF_API_TOKEN=$(printf '%s' "$CF_API_TOKEN" | tr -d '[:space:]')
  CF_ZONE_ID=$(printf '%s' "$CF_ZONE_ID" | tr -d '[:space:]')
  VERCEL_TARGET=$(printf '%s' "$VERCEL_TARGET" | tr -d '[:space:]')
  ```
  + body output에 `len=${#VAR}` 같이 길이 노출해 차후 비슷한 함정 빨리 발견
- **부수 발견**: curl `-fsS` 는 4xx 응답 body를 swallow함. API 실패 디버깅 시 `-sS -w "\nHTTP:%{http_code}"` 로 body+status 같이 출력하는 패턴이 더 유용

### Vercel build cache가 NEXT_PUBLIC_* 환경변수 변경을 부분 무시 — 일부 chunks만 새 값, 일부는 옛 값으로 inline
- **문제**: 대시보드에서 NEXT_PUBLIC_ANALYTICS_WORKER_URL을 worker URL → `/api`로 변경 후 redeploy. HTML과 일부 chunks(homepage용 a582fde, 3798a76)는 새 값(`let t="/api"`)으로 inline됐지만, AppShell이 lazy-load하는 다른 chunks(31704072, 160be81a, 269b99d6)에는 옛 값(`let t="https://dst-analytics.fankimm.workers.dev"`)이 그대로 박혀 있음 → 사용자가 페이지 들어가면 일부 fetch는 Mac mini로, 일부는 worker로 분기. 캐시 청소·SW 재등록·incognito·신규 브라우저 모두 시도해도 동일 (서버가 그 chunks를 그대로 서빙)
- **원인**: Vercel "Redeploy with existing Build Cache" 옵션이 default ON. NEXT_PUBLIC_* 변경 시 cache invalidation이 부분적으로만 동작. Next.js Turbopack/SWC가 module별로 cached output을 재사용하는데, env가 inline된 chunks도 cache hit으로 간주되는 케이스 존재
- **교훈**: 환경변수(특히 NEXT_PUBLIC_*) 값을 바꿨으면 **반드시 build cache 끄고 redeploy**. Vercel 대시보드 Deployment ⋯ 메뉴 → Redeploy → "Use existing Build Cache" 체크 해제. 또는 package-lock.json/package.json 수정해서 cache key 강제 무효화. 부분 적용된 빌드는 진단이 어렵다(homepage는 멀쩡한데 sub-component만 옛 동작) — chunks 전수조사로만 발견됨
- **검증**: `curl https://www.dstcraft.com/_next/static/chunks/<hash>.js | grep workers.dev` 같은 명령으로 chunks 다 훑어서 옛 URL이 박혀있는지 확인. clean build이면 0건이어야 함

### 같은 monorepo에 Bun 런타임 패키지(`bun-api/`)를 추가했더니 Vercel(Next.js) 빌드가 typecheck로 줄줄이 실패
- **문제**: Phase 4에서 `bun-api/`를 main에 추가한 직후부터 Vercel 빌드 10회 연속 실패. `Type error: Cannot find module 'bun:sqlite'` — Next.js가 `tsc --noEmit` 단계에서 bun-api 코드까지 같이 컴파일하다 죽음. 사용자에게 매 push마다 Vercel 실패 메일 발송. 그 사이 prod는 마지막 성공 빌드(옛 worker URL이 inline된 클라이언트 JS)로 계속 동작 — 환경변수 변경(NEXT_PUBLIC_*)도 새 빌드 성공해야 반영
- **원인**: `tsconfig.json`의 `include`가 `**/*.ts` 와일드카드 + `exclude`에 `worker`만 있고 `bun-api`는 없음. Next.js는 root tsconfig를 기준으로 전체 타입체크. bun-api는 자체 `bun-api/tsconfig.json` + Bun 런타임 전용 모듈(`bun:sqlite`, `bun.lock` 등) 사용해서 Node 환경에선 해결 불가
- **교훈**: 동일 repo에 다중 런타임 패키지(Next.js + Bun + Cloudflare Worker 등)를 둘 때 root tsconfig의 `exclude`에 모든 비-Next 디렉터리 추가 필수. 새 패키지 디렉터리 만들 때마다 점검. 또한 NEXT_PUBLIC_* 환경변수 변경은 **새 빌드가 성공해야** 반영됨 — 빌드가 실패 중이면 옛 값이 inline된 채로 영구 박힘
- **해결**: `tsconfig.json` `exclude` 에 `bun-api` 추가 (이미 worker는 있었음)
- **검증**: Vercel 대시보드 Deployments 빨간 X 행렬 + 로컬 `npm run build` 재현. 수정 후 typecheck 통과 + prod env 변경 반영 확인
- **부수 발견**: `next build`는 typecheck 실패 시 즉시 종료. 이걸 알아채려면 Vercel deployments 페이지를 주기적으로 확인하거나 알림 hook을 거는 게 안전 (이메일은 소음에 묻히기 쉬움). Phase 6.5 watchdog과 별개로, 빌드 실패 알림도 Telegram으로 받는 게 좋음

### self-hosted runner workflow가 "로컬 HEAD"로 변경 감지하면 같은 머신에서 commit한 push를 no_change로 오판
- **문제**: deploy-beta.yml 첫 버전이 `BEFORE=$(git rev-parse HEAD)` / `AFTER=$(git rev-parse origin/main)` 비교로 변경 감지. SSH로 들어와 Mac mini에서 직접 commit + push 하면 ~/works/dst-craft의 HEAD가 이미 origin/main과 같아 BEFORE==AFTER → no_change=true → 모든 step skip. bun-api 변경이 있어도 재시작 안 됨
- **원인**: 로컬 작업트리 HEAD vs 원격 HEAD 비교는 **다른 머신에서 push했을 때만** 의미가 있음. push가 같은 머신에서 발생하면 둘이 항상 동일. self-hosted runner의 작업 트리가 사용자가 commit하는 트리와 같을 수 있음을 간과
- **교훈**: GitHub Actions에서 푸시 이벤트의 변경 범위는 항상 `${{ github.event.before }}..${{ github.sha }}` 사용. 로컬 작업트리 상태는 사용처(stash, reset)에만 쓰고 변경 감지에는 절대 쓰지 말 것. workflow_dispatch는 force 입력 또는 명시 SHA 받기.
- **해결**:
  ```yaml
  env:
    BEFORE_SHA: ${{ github.event.before }}
    AFTER_SHA: ${{ github.sha }}
  ```
  ```bash
  ZERO=0000000000000000000000000000000000000000
  if [ "$EVENT" = "push" ] && [ "$BEFORE_SHA" != "$ZERO" ]; then
    if git cat-file -e "$BEFORE_SHA" 2>/dev/null; then
      changed=$(git diff --name-only "$BEFORE_SHA" "$AFTER_SHA")
    else
      changed="src/ bun-api/"  # force-push 안전망
    fi
  fi
  ```
- **검증**: 같은 머신에서 commit → push → workflow_run 로그 확인. "Processing step: 'bun-api restart'" 라인 뒤에 "Skipping step" 없는지

### SQLite UPSERT에서 INSERT 측 `MAX(0, ?)` 클램프가 `excluded.count`까지 0으로 만들어 음수 누적이 깨짐
- **문제**: `bumpCounter`에서 음수 bump(rating 재투표 시 이전 별점 -1) 클램프 위해 다음 SQL 작성:
  ```sql
  INSERT INTO analytics_counters(...) VALUES (?, ?, ?, MAX(0, ?))
  ON CONFLICT(...) DO UPDATE SET count = MAX(0, count + excluded.count)
  ```
  `bumpCounter("rating", "5", "", -1)` 호출 시, INSERT 측 `MAX(0, -1)` = 0이 되면서 `excluded.count` = 0이 되어 UPDATE 식의 `count + 0` = 변화 없음. 별점 차감이 무력화됨
- **원인**: SQLite의 `excluded.<col>`은 INSERT 측 VALUES에서 평가된 결과를 가리킴. INSERT VALUES에서 `MAX(0, ?)`로 클램프하면 그 클램프된 값이 `excluded.count`로 흘러 UPDATE 식에서도 음수 정보가 사라짐
- **교훈**: UPSERT에서 `excluded.<col>`로 음수 누적이 필요한 경우, INSERT 측에서 클램프하지 말 것. 클램프해야 한다면 파라미터를 두 번 바인딩해서 INSERT/UPDATE 식을 분리:
  ```sql
  INSERT INTO ... VALUES (?, ?, ?, MAX(0, ?))
  ON CONFLICT(...) DO UPDATE SET count = MAX(0, count + ?)
  ```
  ```ts
  stmt.run(scope, bucket, country, by, by);  // by를 두 번
  ```
- **검증**: `bumpCounter("x","y","")` 2회 → 2, `bumpCounter("x","y","",-10)` → MAX(0, 2 + -10) = 0. INSERT 경로도 `bumpCounter("z","w","",-5)` → MAX(0, -5) = 0
- **부수 발견**: ON CONFLICT에서 `excluded.<col>`는 매우 미묘함. 가능하면 ON CONFLICT 경로에서 파라미터 직접 참조(`?`)가 의도가 더 명확

### Service Worker의 catch-all SWR 핸들러가 /api/*까지 가로채서 매 호출 백그라운드 fetch 추가
- **문제**: `sw.template.js`의 fetch 핸들러가 `/_next/`, navigation 외 모든 GET을 stale-while-revalidate로 처리. `/api/*` 응답까지 SW 캐시에 들어가고, **매 호출마다 SW가 백그라운드 revalidate fetch 추가 발생** → 클라이언트 dedupe로 1번이어야 할 호출이 네트워크 탭에 2번 보임. 게다가 API 응답이 SW 캐시에 stale 데이터로 남음
- **원인**: 정적 자산용 SWR 패턴을 catch-all로 두고 API 경로를 예외 처리하지 않음. API는 데이터가 자주 바뀌고 HTTP-level Cache-Control로 충분함
- **교훈**: SW fetch 핸들러에서 `/api/*` (또는 동적 데이터 경로)는 명시적 early return 으로 bypass. SWR 캐싱은 정적 자산(이미지, font, hashed JS/CSS)에만. 동적 데이터는 HTTP cache + 클라이언트 dedupe 조합으로
- **해결**:
  ```js
  // sw.js fetch handler 내, navigation check 위에:
  if (url.pathname.startsWith(BASE + "/api/")) return;
  ```
- **검증**: Network 탭에서 `/api/<endpoint>` 요청 initiator 확인. `sw.js:<line>` 이 보이면 SW가 가로채는 것 — bypass 추가 필요

### CF 엣지가 origin Cache-Control max-age=60을 무시하고 stale HTML 서빙 → 옛 chunk hash 가리키며 origin 404 → 클라이언트 사이드 예외
- **문제**: PWA에서 "Application error: a client-side exception has occurred while loading www.dstcraft.com" 화면. 라이브 `/` 응답 헤더가 `cf-cache-status: HIT, age=775s` (max-age=60인데 13분째 stale). 그 옛 HTML은 `/_next/static/chunks/c6aa1d91165b1e34.js`를 참조하지만 신규 배포(`~/dstcraft/prod/`)에서 hash가 바뀌어서 origin에 그 파일 없음 → 404 → Next 클라이언트 catch boundary 발동
- **원인**: 대시보드의 "Cache Everything" Page Rule(또는 default Cache TTL)이 origin Cache-Control을 override. `Cache-Control: public, max-age=60, must-revalidate`을 nginx에서 명시했는데도 CF 엣지가 안 지킴. 그동안의 fix들(d867c3b HTML 캐시 5분→1분, 6b4c9ab Cache-Control 명시, 9f333f8 베타 캐시 비활성)은 origin 쪽만 손봐서 무력화됨
- **교훈**: CF Free 플랜 + Page Rule 설정에 따라 origin `Cache-Control`이 무시될 수 있음. 새 빌드 배포 시 **CF 엣지 캐시도 함께 purge**해야 안전. nginx만 고쳐서는 부족. 보조 방어책으로 `deploy-frontend.sh`가 이전 release의 `_next/static/`을 새 release로 carry-over해서 옛 chunk hash 요청도 받아주지만 — release pruning(KEEP=5)에 밀려 사라지면 동일 회귀
- **해결**:
  1. 인시던트 즉시: CF API `purge_cache`로 전체 purge
  2. 영구: `scripts/deploy-frontend.sh` 끝에 hostname 단위 purge 자동 호출 (main → dstcraft.com, www.dstcraft.com / beta → beta.dstcraft.com). 토큰은 `~/dstcraft/.cf-env` (chmod 600, repo 밖)
  3. 영구(추가): CF 대시보드 Page Rules 점검 — HTML/`/`엔 "Bypass cache" 또는 "Respect origin"으로 설정
- **검증**:
  ```bash
  # 새 배포 직후
  curl -sI https://www.dstcraft.com/ | grep -iE 'cf-cache-status|age|last-modified'
  # cf-cache-status: MISS 또는 EXPIRED 가 정상. HIT + age > origin max-age면 룰 override 의심
  for c in $(curl -sS https://www.dstcraft.com/ | grep -oE '/_next/static/chunks/[a-f0-9]+\.js' | sort -u); do
    echo "$(curl -sSo /dev/null -w "%{http_code}" "https://www.dstcraft.com$c") $c"
  done | grep -v ^200  # 비어 있어야 정상
  ```
- **부수 발견**: SW 캐시도 같은 함정 — 새 SW(ea7a4ec)가 activate에서 `clients.navigate()`로 강제 reload하지만, 사용자 PWA가 한 번도 새 SW를 받기 전이면 이 안전망 미작동. CF 엣지 fresh + SW activate hook 둘 다 있어야 1차/2차 보호 완성

### nginx origin 검증 시 포트 80에 macOS 기본 Apache가 떠있어 "차단 룰이 안 먹힌다"고 오진 (2026-05-09)
- **문제**: #19 SG IP 차단 룰 배포 후 `curl -H 'CF-Connecting-IP: 43.128.5.10' http://127.0.0.1/` 으로 origin 검증했는데 모든 spoofed IP가 200 반환 → "룰이 깨졌다"고 판단하고 디버깅 시작
- **원인**: Mac mini의 nginx는 `listen 8080` (CF Tunnel이 그쪽으로 라우팅). 포트 80에는 macOS에 따라온 Apache 2.4.62가 기본 페이지("It works!")를 서빙 중이었음. 80에 hit하면 Apache가 받고 nginx 룰은 통과조차 못 함. `Server: Apache/2.4.62 (Unix)` 헤더로 식별 가능
- **교훈**: 셀프호스팅 Mac mini에서 nginx origin 검증은 **반드시 nginx가 실제 listen하는 포트**(현재 8080)로 hit. `lsof -i :80 -sTCP:LISTEN` / `lsof -i :8080` 로 사전에 listener 확인. 80 포트 응답이 200이라도 nginx 결과가 아닐 수 있다는 의심 먼저
- **검증**: `curl -sI http://127.0.0.1/ | grep -i server` → `Server: nginx` 가 아니면 즉시 정지하고 포트 재확인. 또는 nginx 단독 테스트는 항상 `127.0.0.1:8080`
- **부수**: Apache가 떠있는 자체는 dstcraft 서비스에 영향 없음 (CF Tunnel은 8080으로만 매핑). 다만 origin 디버깅 시 잡음. 향후 비활성 검토 가능 (`sudo apachectl stop` + launchd 비활성화)

## 분석 / 통계

### Redis 일별 키에 TTL을 걸어 통계 데이터 영구 손실
- **문제**: `dst:pv:{날짜}`, `dst:uv:{날짜}` 키에 90일 EXPIRE를 설정 → 90일 이전의 일별 PV/UV 데이터가 자동 삭제되어 복구 불가. 전체 누적(dst:pv:total 등)은 살아있으나 일별 트렌드 그래프에 빈 구간 발생
- **원인**: Upstash 무료 티어 용량 걱정으로 TTL 설정. 실제로 일별 키는 키당 수 바이트라 수년 분량도 무료 티어 한도(10K commands/day)에 영향 없음
- **교훈**: 통계/분석 데이터는 일종의 자산이므로 TTL을 걸지 말 것. 특히 INCR/PFADD 기반 집계 데이터는 한번 삭제되면 원본(개별 요청)이 없어 복구 불가. 용량 절감이 필요하면 원본을 삭제하는 게 아니라 월별 롤업 등 요약 계층을 추가할 것
- **해결**: TTL 제거 + 월별 롤업 키(`dst:pv:m:YYYY-MM`, `dst:uv:m:YYYY-MM`) 추가하여 장기 트렌드는 월 단위로 영구 보존

### 일별 집계 키를 UTC 기준으로 잡아 한국 사용자 자정~오전9시 활동 누락 (2026-05-14)
- **문제**: `bun-api/src/lib/util.ts`의 `today()`가 `new Date().toISOString().slice(0, 10)` — UTC 기준. KST 기준 어떤 날(예: 5/13)의 자정~오전 9시 활동이 UTC로는 전날(5/12)에 들어가서 daily PV/UV 그래프가 한국 사용자 활동을 잘못 분류함. 자체 통계 daily UV가 nginx 로그 대비 30% 이상 적게 보이던 원인 중 하나 (이슈 #34)
- **원인**: 통계 함수 작성 시 시간대 가정 명시 안 함. `toISOString`이 UTC라는 점은 알았지만 "어차피 분/시 단위 차이"라고 가볍게 봄. 실제로는 매일 9시간 분량의 활동이 다른 날짜 버킷으로 흘러감
- **교훈**: 한국 사용자 대상 서비스의 일별 집계 키는 반드시 KST 명시. JS 표준 라이브러리만 쓰려면 `Date(now + 9*3600_000).toISOString().slice(0,10)` 패턴이 가장 단순. `Intl.DateTimeFormat`도 가능하나 오버헤드. 월별 키도 같은 처리 필요 (월 경계가 시간대로 갈림)

### `/api/track` 같은 직설적 트래킹 경로명이 광고차단 필터에 차단됨 (2026-05-14)
- **문제**: 자체 통계 daily UV 356 vs nginx 로그의 `/api/track` 200 응답 unique IP 566. 200 응답이 안 잡힌 갭은 거의 전부 EasyPrivacy/uBlock Origin/Brave shields가 경로명 `track`을 차단해 클라이언트 fetch 자체가 발생 안 한 케이스. 모바일 광고차단 앱(AdGuard 등) 비율이 높은 한국에서 영향 큼 (이슈 #34)
- **원인**: REST 관점에서 자연스러운 동사를 그대로 경로로 씀. 광고차단 필터 리스트에 `/track`, `/analytics`, `/pixel`, `/beacon`, `/collect`가 거의 항상 포함됨을 간과
- **교훈**: 1st-party 트래킹 엔드포인트는 의미 모호한 짧은 경로(`/_t`, `/api/_t` 등)로 둘 것. 차단 필터의 패턴 매칭은 보통 정규식 단어 단위라 짧고 평범하면 회피율이 높음. 기존 경로는 SW 캐시 호환을 위해 한동안 유지하다 점진 폐기

## 코드 구조

### 삭제된 컴포넌트(SkillDetailSheet)에 기능 추가
- **문제**: WX-78 스킬트리 상세 수치(details) 기능을 `SkillDetailSheet.tsx`에만 추가하여 실제 화면에 반영되지 않음. 해당 컴포넌트는 이전에 상세 시트 UI를 없애면서 사실상 미사용 상태였으나 파일이 삭제되지 않고 남아있었음
- **원인**: 파일이 존재하고 import도 유효해서 현재 사용 중인 컴포넌트라고 판단. 실제 렌더링 경로(`SkillTreeView → SkillNodeCard`)를 추적하지 않음
- **교훈**: 코드 수정 전 반드시 **실제 렌더링 경로를 추적**할 것. 파일 존재 + 타입 에러 없음 ≠ 현재 사용 중. `grep`으로 import/사용처를 확인하고, 사용되지 않는 컴포넌트는 발견 즉시 삭제 제안할 것

## 워크플로우 / 머지

### `main ← beta` 방향 머지로 in-flight feat이 production 배포됨 (2026-05-08)
- **문제**: 메타 변경(스킬 보강 commit `c89a4d4`)을 메인 워크트리(beta)에서 commit한 뒤, main으로 가져가려 `git checkout main && git merge --ff-only beta && git push origin main` 실행. 그 시점 beta에는 다른 워크트리(`dst-craft-1`)에서 `/push`로 흘려둔 검증 중인 `feat/1-damage-calculator`(`134f2fc`, dev 페이지 `/damage-calc`)가 함께 있었고, ff merge가 그 커밋까지 main으로 가져가 그대로 production(`www.dstcraft.com`)에 배포됨. `/release`를 거치지 않은 채 main에 들어간 사고
- **원인**: "메타 변경은 beta 우회해서 main 직접 머지 가능"이라는 CLAUDE.md 옛 예외 조항을 잘못 해석. 우회는 "main에서 직접 commit" 또는 "특정 commit cherry-pick"이어야 했는데, "beta에 commit 후 main에 ff merge"로 처리. **beta는 in-flight 합집합 검증용**이지 main의 입구가 아니라는 모델을 잊음
- **교훈**:
  - **`main ← beta` 방향의 모든 머지 명령은 절대 금지**. `git merge beta`, `git merge --ff-only beta`(main에서) 등.
  - 올바른 머지 방향은 `feat → beta`(=`/push`)와 `feat → main`(=`/release`) 둘 뿐. 두 쪽으로 각각 직접 머지하는 비대칭 구조
  - 메타/문서 변경도 동일 패턴(`/task` → `/push` → `/release`)을 따른다. 예외 없음
- **사후 처리**: production에 들어간 dev 페이지(`/damage-calc`)는 프론트 진입점이 없어 사용자 노출 없음 → revert하지 않고 그대로 둠. CLAUDE.md / `/release` 스킬에 머지 방향 규칙을 명시하고, 본 사례를 오답노트에 기록 (이슈 #4)

### SessionStart hook의 divergence 경고를 놓침 (2026-05-13)
- **문제**: 세션 시작 시 `[git sync] beta` hook이 `fatal: Not possible to fast-forward, aborting.`를 출력했는데 즉시 인지하지 못하고 `/task`로 새 작업(이슈 #28)을 진행. 이슈 #29 메타 작업까지 끝낸 후에야 메인 워크트리(beta)가 origin/beta 대비 5 ahead / 40 behind 발산 상태임을 발견. 그 사이 사용자가 옛 `/push` 모델을 전제로 흐름을 짜고 있었음
- **원인**: SessionStart hook 출력을 시스템 알림 정도로 흘려 봄. `[git sync]` 라벨 + `fatal:` 키워드가 같이 떴는데도 우선순위를 낮게 잡음
- **교훈**:
  - **세션 시작 시 SessionStart hook 출력에 `fatal`/`error`/`conflict`/`diverging` 단어가 보이면 즉시 사용자에게 보고하고 작업 보류**. hook이 자동 동기화에 실패했다는 건 working tree와 origin의 모델이 어긋났다는 신호
  - `git status`만으로는 발산 감지 못 함 (clean으로 표시됨). `git rev-parse HEAD origin/<branch>` 비교 또는 `git log @..@{u}` / `@{u}..@` 확인 필요
- **사후 처리**: 별개로 정리(메인 워크트리를 main으로 전환 + `/beta clear`). 새 `/beta clear` 서브커맨드가 이런 청소에 쓰임

## SEO / 구조화 데이터

### React 18+ server component에서 `dangerouslySetInnerHTML` JSON-LD가 RSC stream에 props로 재직렬화 (2026-05-14, #37)
- **문제**: `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />`을 server component에서 직접 출력하면, 정상 `<script>` 태그(1개) 외에 React RSC payload에도 props(`{"dangerouslySetInnerHTML":{"__html":"..."}}`)가 escape된 JSON 문자열로 한 번 더 직렬화돼서 HTML에 포함됨. GSC가 같은 페이지에서 FAQPage schema를 2번으로 카운트 → "FAQPage 입력란이 중복되었습니다" critical 오류 → 27 페이지 리치 결과 차단
- **확인 방법**: `grep -oE 'FAQPage' built.html | wc -l`이 2 이상이면 의심. 첫 번째 매치는 `<script type="application/ld+json">{...}` 정상, 두 번째 매치는 `\\\"@type\\\":\\\"FAQPage\\\"` 형태(escape된 RSC payload). 둘 다 같은 HTML 파일에 inline으로 들어감
- **잘못된 fix 시도**: 헬퍼 컴포넌트(`<JsonLd data={...} />`)로 한 단 감싸도 여전히 RSC payload에 props 그대로 들어감. children 패턴(`<script>{JSON.stringify(data)}</script>`)도 children 자체가 RSC stream에 escape돼서 동일 증상 발생
- **올바른 진단**: 검색엔진 JSON-LD 파서는 `<script type="application/ld+json">` **태그 안의 내용만** 본다. RSC payload escape 문자열은 다른 `<script>`(타입 없음, hydration용) 안에 있어 무시됨. 즉 `<script type="application/ld+json">` 태그 개수 + 각 태그의 `@type` 분포가 진짜 카운트
- **교훈**: 빌드 결과 검증 시 `grep -oE '<script[^>]*application/ld\+json[^>]*>([^<]*)</script>'`로 실제 JSON-LD 태그 수와 @type 분포를 봐야 함. raw `grep FAQPage`는 RSC payload escape를 카운트해 거짓 양성. 현재 패턴(`<JsonLd data={...}` + children, `suppressHydrationWarning`)이 빌드 결과상 `<script type="application/ld+json">` 태그 1개 + RSC payload escape 1개 = grep으론 2번이지만 검색엔진엔 1개로 보임 → GSC 정상화 예상
- **검증 스크립트**: `python3` 한 줄로 모든 detail 페이지 빌드 결과의 `<script type="application/ld+json">` 태그 수와 `@type` 분포 출력해서 페이지당 정확히 1 FAQPage인지 확인
