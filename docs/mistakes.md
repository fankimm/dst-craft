# Mistakes & Lessons (오답노트)

## 게임 데이터

### 게임 데이터 sync 후 "새 아이템 반영 완료"로 성급히 보고 — 제작 탭은 수작업 카탈로그 (2026-06-26, #53)
- **문제**: `sync-game-data.sh` 실행 후 scrapbook-stats.ts에 신규 아이템(fumaroleaxe 등)이 들어온 것만 보고 "새 아이템 반영 완료"라 보고. 실제로는 제작 탭에서 `fumaroleaxe` 검색 시 "아이템이 없습니다" — sync는 반영의 절반만 한 것
- **근본 원인**: "게임 데이터"는 단일 소스가 아니라 **두 갈래**다.
  1. **자동(sync 스크립트)**: `scrapbook-stats.ts`(아이템 상세 스펙), `raw-foods.ts`, `skills`, `skins.ts` — converter가 game 파일에서 자동 생성
  2. **수작업**: `src/data/items.ts`(제작 탭 검색 소스 = 아이템 카탈로그, 12500줄), `materials.ts`(재료), `src/data/locales/*.ts`(다국어 이름/설명), `public/images/game-items/*.png`(아이콘) — **전부 사람이 손으로 관리**. sync 파이프라인이 건드리지 않음
- **함정**: scrapbook-stats(상세 스펙)와 items.ts(제작 카탈로그)가 **별개 데이터**라는 걸 놓침. scrapbook에 있어도 items.ts에 없으면 제작 탭/검색에 안 뜸. 데브 페이지용 `game-items-db.ts`(item-list.md 기반)도 또 다른 별개 수작업 데이터
- **신규 제작 아이템 추가 시 연쇄 작업** (1개 추가에 6곳+):
  1. `src/data/items.ts` — CraftingItem 객체 (id/name(영)/desc(영)/image/category/station/materials/sortOrder)
  2. `src/data/materials.ts` — 신규 재료 (없으면 추가)
  3. `src/data/locales/ko.ts` — items 블록 + materials 블록 한국어 (ko.po의 STRINGS.NAMES/RECIPE_DESC)
  4. `public/images/game-items/<id>.png` — 게임 `images.zip`의 inventoryimages 아틀라스에서 KTEX 추출 (extract-skin-icons.py의 decode_ktex 재사용)
  5. station이 `CraftingStation` enum에 없으면(예: vault 정제소): `src/lib/types.ts` + `i18n.ts`(ko/en station_X) + `crafting-data.ts`의 `stationImages` Record + `locales/ko.ts` stations 블록까지 — Record<CraftingStation,_> 라 하나라도 빠지면 tsc 에러
- **신규 레시피 식별법**: 스냅샷 git diff — `git -C ~/dst-game-snapshot diff HEAD~1 -- scripts/recipes.lua` 에서 추가된 `Recipe2("<id>"`를 뽑고, items.ts의 기존 id와 차집합. 단 carnival/이벤트성 kit은 보통 제외 판단
- **교훈**: (1) "새 아이템 반영"은 sync 한 방이 아니다 — 제작 탭 카탈로그(items.ts)는 수작업이라 별도. (2) 반영 작업은 **반드시 실제 제작 탭에서 검색되는지** 확인하고 보고. scrapbook 추가만으로 "완료" 단정 금지. (3) sync 후 새 빌드 신규 레시피는 recipes.lua diff로 교차 확인

### extract-skin-icons가 매 sync마다 PNG를 재인코딩해 957개 가짜 diff 생성 (2026-06-25, #53)
- **문제**: `bash scripts/sync-game-data.sh` 실행 시 `public/images/skins/*.png` 957개가 modified로 잡힘. 전수 픽셀 비교(PIL `ImageChops.difference`) 결과 **957개 전부 픽셀 동일** — 실제 에셋 변화 0건. `extract-skin-icons.py`가 KTEX 아틀라스에서 아이콘을 매번 `cropped.save(..., optimize=True)`로 무조건 덮어쓰는데, PIL의 PNG optimize 인코딩이 비결정적이라 같은 픽셀도 매 실행마다 다른 바이트로 저장됨 → git이 전부 변경으로 인식
- **영향**: 매 게임 데이터 sync마다 957개 노이즈 커밋이 쌓여 리포 비대 + 진짜 신규 아이콘이 노이즈에 묻힘
- **1차 수정의 함정**: "기존 파일과 픽셀 같으면 save skip"을 저장 직전에 넣었더니 957→11로 줄었지만 11개(전부 abigail_flower_*)가 잔존. 원인은 **같은 stem이 한 sync 안에서 2번 저장**되는 경우(priority 충돌: 첫 매칭은 낮은 우선순위 소스, 두 번째 매칭이 더 나은 소스로 덮어씀) — 두 번째 save의 픽셀 비교 대상이 **원본이 아니라 방금 첫 번째가 덮어쓴 파일**이라 노이즈가 새어나옴
- **올바른 해결**: 저장을 루프 안에서 하지 말고, stem당 최종 crop을 메모리(`chosen: dict[str, tuple[priority, Image]]`)에 모은 뒤 **모든 아틀라스 처리가 끝난 다음 stem당 정확히 1회만** 저장. 이때만 픽셀 비교 대상이 항상 "이번 sync에서 아직 안 건드린 원본"으로 고정됨 → `985 unique skin icons (0 written, 985 unchanged)`로 노이즈 0 달성
- **교훈**: (1) 바이너리 자동 생성물은 "내용 동일 시 미저장" 가드가 없으면 비결정적 인코더 때문에 거대한 가짜 diff를 만든다. (2) 멱등성 가드를 넣을 땐 **같은 실행 내 다중 쓰기**가 비교 기준을 오염시키지 않는지 확인 — 비교 기준은 항상 "쓰기 전 원본"이어야 한다. (3) sync 후 이미지가 대량 modified면 커밋 전 픽셀 비교로 노이즈 여부부터 검증

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

### 자동 생성 variant와 수동 등록이 겹쳐 재료 목록에 같은 ID 2개 (2026-08-11, #69)
- **문제**: `cookpot-ingredients.ts`에서 `forgetmelots`에 `dryable: true`가 걸려 `forgetmelots_dried`가 자동 생성되는데, "Dried-only ingredients" 블록에 같은 ID가 수동으로 또 등록돼 있었음. 요리솥 재료 고르기에 말린 건망초가 중복 표시 (사용자 피드백: "말린건망초 즐겨찾기하면 진짜 건망초마냥 무한번식해요")
- **증상이 데이터 중복(2개)보다 큼**: 데이터상 중복은 2개인데 화면에는 3개, 4개, 그 이상. 헤드리스로 검색을 6회 반복하니 3→5→7→9→11→13으로 **매 검색마다 2개씩 누적**. `IngredientPicker`의 그리드가 `key={ing.id}`를 쓰는데 형제 간 key가 겹치면 필터 갱신 때 React가 기존 노드를 정리하지 못하고 계속 덧붙임. 즉 데이터 중복 1건이 화면에서는 무한 증식으로 증폭됨
- **원인**: 자동 생성(`cookable`/`dryable` 플래그)과 수동 등록이라는 두 경로가 같은 ID 공간을 쓰는데, 최종 배열에 중복 검사가 전혀 없어서 조용히 통과. 눈으로는 base 목록과 dried-only 목록이 떨어져 있어 안 보임
- **교훈**:
  1. 파생 항목을 자동 생성하는 데이터 파일은 **export 시점에 ID 중복 제거 + 개발 모드 경고**를 반드시 붙일 것 (조용한 중복은 UI에서만 드러남)
  2. 플래그 기반 자동 생성이 있는 목록에 항목을 수동 추가할 때는 그 ID가 자동 생성되지 않는지 먼저 확인
  3. 중복 여부는 눈이 아니라 스크립트로 — ID 전수 카운트 한 번이면 끝
- **참고**: 즐겨찾기는 `ing:<id>` 문자열 하나로 저장되므로 중복 항목 제거로 기존 즐겨찾기가 깨지지 않음 (남는 항목의 ID가 동일)

### 자동 생성 데이터 파일이 커지자 TypeScript 유니온 한계(TS2590)에 걸림 (2026-08-18, #80)
- **문제**: 게임 데이터 동기화 후 `npm run build`/`tsc`가 `src/data/skins.ts(53,35): error TS2590: Expression produces a union type that is too complex to represent`로 실패. 직전 main은 클린이었고 이번 sync가 스킨을 1362 → 1387개로 늘린 것 말고는 변화가 없었다
- **원인**: `export const SKINS: SkinEntry[] = [ ...1387개 객체 리터럴... ]`. `SkinEntry`의 선택적 필드가 7개(rarity_modifier / quote_en / quote_ko / set_id / character / icon / body_image)라 항목마다 shape이 갈리고, TS가 배열 리터럴을 체크하며 만드는 내부 유니온이 한계치를 넘었다. **데이터가 틀린 게 아니라 개수가 임계값을 넘은 것** — 타입도 데이터도 그대로 두고 다음 sync에서 또 터질 수 있는 종류의 실패
- **해결**: 생성 스크립트(`scripts/extract-skins.py`)가 200개씩 끊어 `const SKINS_0..N: SkinEntry[] = [...]`로 내보내고 마지막에 `export const SKINS: SkinEntry[] = [...SKINS_0, ...]`로 합치도록 변경. 청크마다 유니온이 리셋되므로 타입 체크는 그대로 유지하면서 한계를 피한다
- **교훈**:
  1. 자동 생성 데이터는 **생성 스크립트에서 고칠 것.** 생성물(`src/data/*.ts`)을 손으로 고치면 다음 sync에 사라진다 — `as unknown as`나 `@ts-expect-error`로 생성물을 덮는 건 특히 잘못된 방향
  2. 항목 수가 계속 늘어나는 생성 배열은 **처음부터 청크로 내보낼 것.** 임계값을 넘는 순간이 하필 게임 업데이트 반영 중이라 원인이 데이터 변경처럼 보인다
  3. 이런 실패는 `main`에서 같은 명령을 돌려 **기존 문제인지 이번 변경 탓인지 먼저 갈라놓는 게** 가장 빠른 절반 나누기다
- **덤(워크트리 함정)**: feat 워크트리엔 `node_modules`가 없어 메인 워크트리에서 심볼릭 링크를 걸었더니 `tsc`는 통과하는데 `npm run build`가 `Symlink node_modules is invalid, it points out of the filesystem root` (TurbopackInternalError)로 죽었다. 워크트리에서 빌드까지 검증하려면 **링크 말고 `npm ci`**

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

### 복합 lock_open을 `manual` fallback으로 우회 — 자동 해제 끊김 (2026-05-20, #40)
- **문제**: 위노나 스킬트리에서 찰리·와그스태프 트리(악몽발전기·계몽 발G.E.M.기 4갈래) 진입 스킬이 클릭이 안 됨. 인게임 `winona_midshelf_lock`은 `CountTags("lowshelf") + CountTags("midshelf") > 5` 자동 평가인데, 우리 `winona.ts`는 `manual` + "휴대성 스킬 시 해금" 가짜 설명으로 들어가 있어 사용자가 잠금 아이콘을 직접 클릭해야만 해제. 같은 패턴이 6개 잠금(`midshelf_lock`/`shadow_3_lock`/`lunar_3_lock`/`charlie_2_lock`/`wagstaff_2_lock`/`portable_structures_lock`)에 걸쳐 있었고 일부는 설명까지 인게임과 다르게 임의 작성 (`charlie_2_lock`이 "급속충전 시 해금" 등)
- **원인**: 위노나 lock_open 함수가 `LockCondition` 타입으로 표현 못 하는 케이스 — `skill_count`는 단일 태그만, "특정 스킬 활성 AND 다른 스킬 미활성" 조건 없음 — 만나서 `manual`로 떼우고 desc도 손으로 적음. 위 "잠금 조건 라벨" 교훈 #2("lua의 복합 lock_open은 개별 typed lock 노드로 분리")를 따랐어야 하나, 타입 자체에 표현 수단이 없어 우회. `verify-skill-trees.py`는 `lock_open` 본문 의미를 스킵해서 자동 탐지 못 함
- **교훈**:
  1. lock_open을 `manual`로 우회하지 말 것 — 자동 조건은 자동 typed lock으로 표현해야 사용자 UX가 인게임과 일치
  2. 표현 수단이 없으면 `LockCondition` 타입 자체를 확장 (#40에서 `compound` 추가: `required_skills` / `excluded_skills` / `tag_counts.tags[]` 합산)
  3. `verify-skill-trees.py`가 `lock_open` 본문을 검사하지 않으므로, 신규/갱신 캐릭터 작업 시 lock 노드 의미는 lua 원본을 펼쳐서 수동 대조 필수. desc가 ko.po(`STRINGS.SKILLTREE.<CHAR>.<KEY>_LOCK_DESC`)에 있으면 그것이 정답이므로 절대 임의 문구 작성 금지
- **부수**: TS 파서가 `lockType: { ..., tag_counts: { tags: [...] } }`처럼 nested한 `tags:` 키를 외부 노드 `tags:`보다 먼저 매칭해 verify가 거짓 양성 → `verify-skill-trees.py`에서 lockType 본문을 잘라낸 뒤 top-level 필드 스캔하도록 수정

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

### GitHub Actions cron으로 헬스 감시를 걸어두고 5분 주기라고 믿음 (2026-07-28, #64)
- **문제**: `watchdog.yml`에 `cron: "*/5 * * * *"`를 걸고 "5분마다 감시 중"이라고 여겼으나, 실제 실행 이력은 **1~3시간에 한 번**이었다. 2026-07-26~28 최근 20회 실행 간격을 실측해서야 드러남. 그동안 진짜 장애가 났다면 몇 시간 뒤에나 알았을 상태
- **원인**: GitHub Actions의 schedule은 best-effort다. 러너가 붐비면 예약 실행을 지연시키거나 **아예 건너뛴다**(드랍된 실행은 재시도되지 않음). 공개 저장소·무료 러너일수록 심함. cron 표기가 통과했다고 그 주기로 돈다는 보장이 전혀 없다
- **왜 못 알아챘나**: 워크플로우가 매번 초록불(success)이라 정상으로 보였다. "실패했나"만 봤지 "몇 번 돌았나"는 본 적이 없음. 감시 도구 자체의 동작 여부를 감시하지 않은 것
- **교훈**:
  1. **주기가 의미 있는 작업(헬스 감시, 백업, 정기 동기화)을 GH Actions schedule에 의존하지 말 것.** 정확한 주기가 필요하면 Cloudflare Cron Trigger나 launchd처럼 실행이 보장되는 스케줄러로
  2. 정기 작업은 **실행 간격 자체를 주기적으로 검증**. `gh run list --workflow=<f> --json createdAt`로 간격을 눈으로 확인 — 초록불은 "돌았을 때 성공했다"는 뜻일 뿐
  3. GH Actions에 남겨도 되는 것: 실행 시점이 정확할 필요 없는 백업 감지, 또는 외부에서 `workflow_dispatch`로 불러 쓰는 복구 액션
- **해결 (#64)**: 감지는 CF Worker(`watchdog/`, Cron 1분)로 이전. GH Actions는 복구 담당(DNS failover, SSH kickstart)으로 축소하고 Worker가 `workflow_dispatch`로 호출. GH schedule은 Worker 자체 장애 대비 백업으로만 유지

### 배포는 "성공"인데 CF Worker cron이 안 돌아 30분 헤맴 (2026-08-05, #64)
- **문제**: `wrangler deploy` 출력에 `schedule: * * * * *`가 찍히고 워커도 정상 서빙 중인데, cron이 한 번도 실행되지 않았다. `HEALTH_URL`을 없는 주소로 바꿔 배포하고 10분 넘게 기다려도 상태가 `ok` 그대로
- **원인 추정**: 배포 직후 `wrangler secret put`으로 시크릿 2개를 넣었고, 그때 워커 버전이 새로 생성됐다(`deployments list`에 `Source: Secret Change`로 남음). 이 새 버전에 cron trigger가 따라붙지 않은 것으로 보인다. `wrangler triggers deploy`로 트리거만 다시 붙이자 88초 만에 정상 동작
- **왜 오래 걸렸나**: `wrangler tail`이 출력을 전혀 뱉지 않아(빈 파일) 로그로 확인할 길이 없었고, "배포 성공 = 크론 등록 완료"라고 믿어 트리거를 의심하기까지 오래 걸림. 판정 로직과 크론 실행을 분리해 검증할 수단이 없던 것이 핵심
- **교훈**:
  1. **크론 워커에는 로직을 강제 실행하는 HTTP 경로(`/run`)를 처음부터 둘 것.** 로직 버그와 스케줄러 미동작을 즉시 갈라낼 수 있다 — 이게 없으면 둘이 뒤섞여 원인 추적이 몇 배로 오래 걸린다
  2. **시크릿 추가·변경 후에는 `wrangler triggers deploy`를 함께 실행.** 시크릿 변경도 새 버전을 만들고, 트리거가 딸려가지 않을 수 있다
  3. 크론 동작 검증은 "로그가 보이나"가 아니라 **관측 가능한 상태 변화**로 — 감시 대상을 일부러 실패시키고 저장된 상태가 뒤집히는지 확인하는 편이 확실하다
  4. `[observability] enabled = true`를 처음부터 켜둘 것 (무료 플랜 포함). `wrangler tail`은 조용히 아무것도 안 뱉는 경우가 있다

### failover만 만들고 복귀 경로를 안 만들어 실장애 때 손으로 복구 (2026-08-07, #65)
- **문제**: 집 전기 차단으로 Mac mini가 꺼지자 워치독이 설계대로 3/3 실패를 잡고 DNS를 Vercel로 넘겼다. 여기까진 완벽. 그런데 미니가 다시 켜져도 **되돌릴 방법이 CF 대시보드 수동 편집뿐**이었다. 워치독 헬스 프로브 대상이 `www.dstcraft.com`이라 failover 후에는 Vercel을 찌르는 셈이 되어, 미니가 죽어 있어도 계속 초록불 — 지금 어디에 붙어 있는지조차 알려주지 않았다
- **원인**: failover를 "장애 대응"으로만 설계하고 복귀를 시나리오에서 뺐다. `TODO-self-hosting.md`에 "복구 시 수동 swap 필요"라고 적어두긴 했지만, 적어둔 것과 실행 가능한 것은 다르다. 토큰이 맥미니(`~/.cf-env`)에만 있어서 정작 미니가 죽은 상황에선 CLI로 되돌릴 수도 없었다
- **교훈**:
  1. **자동 전환을 만들면 복귀도 같은 커밋에서 만든다.** 한쪽만 자동화된 스위치는 "장애가 끝나도 임시 상태로 눌러앉는" 결과를 낳는다
  2. **헬스 프로브 대상이 failover로 바뀌는 주소면 그 프로브는 origin 상태를 못 본다.** failover 대상이 아닌 호스트(여기선 터널을 그대로 쓰는 `beta`)를 origin 확인용으로 따로 둘 것
  3. 되돌리기 전 origin 생존을 먼저 확인한다. 죽은 origin으로 되돌리면 failover보다 나쁜 결과(전면 다운)가 된다
  4. 200 응답만으로 origin을 판정하지 말 것 — Vercel도 같은 경로에 200을 준다. `x-vercel-id` 같은 **origin 식별 헤더**로 확정
  5. 복구에 필요한 자격증명을 복구 대상 머신에만 두지 말 것 (CF 토큰이 미니에만 있던 문제)
- **해결 (#65)**: `watchdog.yml`에 `failback` 입력 추가. pre-flight(beta 경유 origin 헬스) → CNAME swap → Vercel 헤더 소멸 확인 → 텔레그램. `gh workflow run watchdog.yml -f failback=true` 한 줄로 복귀. 자동 복귀는 플래핑 우려로 일부러 뺌

### 백업을 검증 없이 만들고, 그 뒤에 무조건 로테이션을 돌림 (2026-08-10, #66)
- **문제**: `bun-api/scripts/backup-db.sh`가 `sqlite3 .backup` 후 곧바로 `gzip -9`하고 끝. 검증이 없어 깨진 백업도 그대로 로테이션에 들어가고, 스크립트 마지막 `find -mtime +14 -delete`는 **성공/실패와 무관하게 항상 실행**됐다. 소스가 손상된 상태로 14일이 지나면 깨진 백업만 남고 마지막 정상본이 삭제된다 — 백업이 있다고 믿는 상태에서 복구 불가
- **어떻게 발견**: 서버 최적화 중이던 다른 Claude 세션이 오프사이트 스크립트(`~/dstcraft/bin/backup-offsite.sh`, 레포 밖)를 점검하다 제보. 그쪽에서는 iCloud 복사가 실패하는데도 매일 `iCloud copy ok` 로그가 찍히고 있었다 — `mkdir -p`가 iCloud가 아닌 평범한 로컬 폴더를 만들어버려서 `cp`가 늘 성공했기 때문
- **교훈**:
  1. **`ok` 로그는 성공의 증거가 아니다.** exit code가 아니라 **산출물을 직접 검사한 뒤** 기록할 것 (파일 존재·크기·무결성). "성공했다고 로그가 말한다"는 검증이 아니다
  2. **정리(prune/rotate)는 검증 통과 이후에만 도달하게 배치할 것.** 검증과 정리 사이에 조기 종료 지점이 없으면, 실패가 곧 "기존 정상본 삭제"가 된다
  3. **백업 파이프라인은 복원까지 해봐야 백업이다.** 96개가 쌓여 있었지만 복원 기록이 없었다. `gzip -t` + `PRAGMA integrity_check` + 핵심 테이블 행 수 대조까지가 1세트
  4. 실패 경로에서 만들다 만 산출물을 지울 것 — 안 지우면 다음 실행이 "이미 오늘 백업 있음"으로 착각할 여지
  5. macOS launchd는 `/bin/bash`(3.2.57)로 실행된다. `mapfile`/`readarray`/`declare -A` 등 bash 4 문법은 **매일 조용히 죽는다**. 스크립트에 bash 3.2 호환 주석을 남길 것
- **해결 (#66)**: `.backup` 직후 `integrity_check`, `gzip -9` 직후 `gzip -t`. 실패 시 산출물 삭제 + exit 1로 prune 미도달. 격리 테스트로 정상/손상 두 경로 검증 (손상 소스일 때 기존 백업 보존 확인)
- **후속 회귀 (#67)**: 그 `integrity_check`가 WAL 모드 백업본을 여는 순간 `app-<TS>.db-wal`/`-shm` 사이드카를 만드는데, `gzip`은 `.db`만 가져가고 prune 패턴은 `app-*.db.gz`라 잔재가 영구 누적됐다. **정리 대상 패턴을 산출물 하나로만 잡으면, 나중에 추가된 단계가 만드는 부산물은 자동으로 청소 범위 밖이 된다.** 검증 단계를 넣을 때 "그 도구가 파일을 만드는가"를 같이 볼 것 — 읽기 전용 작업이라고 파일을 안 만드는 건 아니다(SQLite는 읽기만 해도 WAL 사이드카를 만든다). 해결: `sqlite3 "file:$OUT?immutable=1"`로 열어 애초에 안 만들고, 경로에 URI 특수문자가 있는 경우를 대비해 `rm -f "$OUT"-wal "$OUT"-shm` 안전망 추가. 실패 경로에서도 같이 삭제. `immutable=1`로도 손상 탐지가 유지되는지 재검증함

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

## 빌드 · 도구

### 이미지 화질을 브라우저가 아닌 변환 도구로만 재서 원인을 세 번 놓쳤다 (2026-08-27, #88)
- **문제**: 보스 이미지를 축소했더니 사용자가 "덜 선명하다"고 했다. 나는 sharp·ImageMagick·cwebp로 SSIM·RMSE·엣지 보존율을 반복 측정하며 *"압축 손실은 미미하다"*, *"해상도는 충분하다"*, *"비교본이 불공정해서 그렇게 보이는 것"* 이라고 세 번 결론 냈다. **세 번 다 틀렸고 사용자가 세 번 다 맞았다.**
- **원인 — 화면에 그리는 것은 브라우저인데, 브라우저로 재지 않았다.** Chrome은 이미지를 축소할 때 밉맵 체인을 탄다. 체인이 목표 크기 **바로 위**에서 끝나면 마지막 한 단계가 1.0배에 가까운 축소가 되고, 바이리니어가 그 구간을 가장 못 다뤄 뭉갠다. sharp·ImageMagick에는 이 아티팩트가 아예 없어서 **어떤 지표로 재도 정상으로 나온다.**
- **그래서 "해상도는 클수록 좋다"가 성립하지 않는다.** 80px 자리를 Chrome이 그린 결과의 엣지 보존율(원본=1.0, 대표 4장 평균):

  | 저장 해상도 | DPR 2 (160px) | DPR 3 (240px) |
  |---|---|---|
  | 384 | 1.015 | 1.035 |
  | **512** | 1.087 | **0.850** |
  | **640** | 1.059 | **1.018** |
  | 768 | 0.988 | 1.005 |
  | **1024** | 1.068 | **0.832** |

  512와 1024가 최악인 이유는 같다 — 체인이 256px에서 끝난 뒤 256→240으로 아주 조금만 줄인다. 하필 우리가 고른 512px이 DPR 3에서 **15% 손실**을 내는 값이었다.
- **교훈**:
  - **최종 렌더러로 측정한다.** 이미지 화질은 브라우저가, 폰트는 브라우저가, 인쇄물은 프린터가 최종 렌더러다. 중간 도구의 지표는 그 도구 안에서만 참이다
  - **사용자가 같은 지적을 두 번 하면 내 측정 방법을 의심한다.** 나는 매번 "측정상 문제없다"로 되받았는데, 두 번째 지적에서 이미 측정 파이프라인 자체를 바꿔야 했다
  - "크게 잡으면 안전하다"는 직관은 리샘플링에서 성립하지 않는다. **비율이 어중간할 때가 가장 나쁘다**
- **해결**: 640px으로 확정(DPR 2 1.027 / DPR 3 1.024, 둘 다 원본 이상). 이 표를 `scripts/optimize-boss-images.mjs` 주석에 남겨 값을 바꿀 때 반드시 브라우저로 재측정하게 했다

### `git add -A`로 60MB 임시 캐시를 커밋해 푸시했다 (2026-08-27, #88)
- **문제**: 보스 이미지 변환 작업 중 `git add -A && git commit`으로 커밋했더니 ImageMagick이 남긴 `public/images/bosses/mask.cache`(**60MB**)와 `mask.mpc`가 딸려 들어가 origin까지 푸시됐다. GitHub가 *"File is 60.12 MB; larger than GitHub's recommended maximum"* 경고를 띄워서야 발견
- **원인 1 — 규칙이 이미 있었는데 어겼다.** `.claude/skills/beta/SKILL.md`에 *"`git add <files>` — 명시적 파일 추가, `-A` / `.` 금지"* 라고 적혀 있다. 앞선 커밋들에서는 파일을 일일이 나열했는데, 생성물(`public/images/bosses/thumb/` 34장)이 많다는 이유로 `-A`로 바꿨다
- **원인 2 — `git status`를 보지 않고 커밋했다.** `-A`를 쓸 거였으면 최소한 무엇이 잡히는지 먼저 봤어야 했다. 실제로 커밋 직전 `git status --short`를 찍은 적이 없다
- **원인 3 — ImageMagick이 작업 디렉터리를 오염시킨다는 걸 몰랐다.** `magick`은 마스크 연산 중간 결과를 `.mpc` + `.cache` 쌍으로 **입력 파일이 있는 디렉터리에** 쓸 수 있다. 이미지 도구를 레포 안에서 돌릴 때의 기본 위험이다
- **교훈**:
  - **`git add -A` 금지는 예외 없다.** 파일이 많으면 디렉터리 단위로 명시(`git add public/images/bosses/thumb/`)하면 되지 전체를 긁을 이유가 없다
  - **커밋 전 `git status --short`를 반드시 본다.** 특히 외부 도구(이미지·빌드·변환)를 돌린 뒤에는 무엇이 새로 생겼는지 모른다고 전제할 것
  - **이미지/변환 도구는 스크래치패드에서 돌린다.** 레포 안에서 돌려야 하면 산출물 경로를 명시하고, 끝나고 `git status`로 잔재를 확인한다
- **해결**: `git rm --cached` + `--amend`로 커밋에서 제거, `feat/88`을 `--force-with-lease`로 재푸시, `origin/beta`를 `origin/main` 기준으로 리셋 후 재머지. main에는 들어가기 전이라 히스토리 오염 없이 회수됨. `.gitignore`에 `*.mpc` / `*.cache` 추가로 재발 차단

## 광고 / Ezoic

### 정점 구간 7일만 잘라 ePMV 기준값을 40% 과대평가 (2026-08-31, #90)
- **문제**: `docs/ezoic-decision.md`의 "지금까지의 실측"에 8/19~8/25 7일치(`$3.10` / 2,515 visits → **ePMV $1.23**, 월 $13)를 기준값으로 박았다. 사용자가 Ezoic Earnings **일별 표 전체**를 스크린샷으로 공유하자 그 창이 정확히 **정점 구간**이었음이 드러났다 — 전 구간(8/11~8/29, 18일)은 `$5.54` / 5,647 visits → ePMV `$0.98`, **최근 7일은 `$0.88`**. 기준값이 실제보다 **40% 높았다**
- **원인**: 데이터가 그것뿐이라 7일을 쓴 게 아니라, **처음 열린 화면에 보이던 구간을 그대로 채택**했다. 하필 그 창에 최고 3일(8/20 `$1.81` · 8/21 `$1.35` · 8/22 `$1.33`)이 전부 들어 있었다. 더 나쁜 건, 같은 문서에 *"일별 ePMV가 하락 추세. 승인 직후 반짝인지 추세인지 9월 데이터 필요"* 라고 **하락을 이미 적어 놓고도** 그 하락하는 값이 아니라 정점 평균을 기준값으로 남겼다는 것
- **교훈**:
  - **추세가 있는 지표의 기준값은 "최근 구간"이다.** 전체 평균도, 처음 본 구간도 아니다. 문서에 "하락 추세"라고 쓰는 순간 같은 문서의 기준값은 이미 낡았다고 봐야 한다 — 그 두 문장이 나란히 있으면 모순이다
  - 외부 대시보드는 기본 창(최근 N일 등)을 **자기 마음대로** 보여준다. **창을 내가 고르지 않았다면 그 숫자는 인용하지 말 것.** 전 구간을 펼친 뒤 창을 명시적으로 정하고, 왜 그 창인지를 숫자 옆에 적는다
  - 같은 계열의 반복이다 — [서로 다른 기간의 두 숫자를 나눠 격차를 15배로 오진 (#85)](#서로-다른-기간의-두-숫자를-나눠-격차를-15배로-오진했다-2026-08-27-85). 그때는 분자·분모의 기간이 어긋났고 이번엔 창의 위치가 편향됐다. **기간을 다루는 실수는 형태만 바꿔 계속 온다**
  - 결론이 안 바뀐 건 판정 임계(43%)가 ePMV 수준과 **무관한 구조**였던 덕이다 (양변에 같은 ePMV가 곱해져 약분된다). 그건 **운이지 내가 설계한 안전장치가 아니었다** — 임계가 ePMV에 의존했다면 40% 과대평가가 그대로 오판이 됐다. 판정식을 세울 때 **어떤 입력의 오차에 둔감한지**를 확인해 둘 것
- **영향**: 10/15 결정 자체는 안 바뀜(AdSense 단독). 다만 문서에 남아 있던 "월 $13"이 실제 `$9.6`이라, 전환 작업의 실익을 실제보다 크게 보이게 하고 있었다

### 헤드리스에서 광고가 안 뜨는 걸 "이 환경은 수익화 대상이 아니다"로 잘못 귀속했다 (2026-08-27, #86)
- **문제**: beta에서 프로브를 검증하며 `filled:false`, placeholder iframe 0개가 나오자 *"beta 서브도메인은 Ezoic이 수익화하지 않는다"* 고 단정하고 사용자에게 그렇게 보고했다. 사용자가 실제 브라우저 스크린샷을 보내왔는데 **beta에 광고 3개가 멀쩡히 떠 있었다**(좌 레일·상단 띠·우 레일)
- **원인**: **Ezoic은 클라이언트를 분류해 봇으로 판정되면 광고를 안 보낸다.** 같은 URL을 `userAgent`만 실제 Chrome 문자열로 바꿔 다시 재니 3개 자리 전부 충전됐다(`filled:true, elapsed:7177`). 더 나쁜 건 **이 사실이 같은 세션의 지연 조사 결과에 "미해결 질문" 1번으로 이미 적혀 있었다**는 것 — *"기본 headless UA에서는 우리 포함 Ezoic 계열 5개 사이트 전부 0% 충전이었고 UA 문자열 하나만 바꾸면 충전된다"*. 손에 든 정보를 눈앞의 관측에 대입하지 않았다
- **교훈**:
  - **헤드리스 관측으로 "광고가 붙는가"를 판정하지 말 것.** 헤드리스로 판정할 수 있는 것은 *우리 코드의 동작*(비콘이 나가는가, 페이로드 모양, CLS, 자리 크기)까지다. 충전 여부·규격·낙찰은 광고망이 클라이언트를 어떻게 분류하느냐에 달려 있어 별개 문제다
  - 광고 충전을 봐야 하면 **최소한 실제 UA + 로케일 + 타임존을 씌우고**, 그래도 절대값은 실사용자와 다를 수 있다고 전제한다
  - **"안 보인다"를 "제공되지 않는다"로 옮겨 적지 말 것.** 관측 실패와 대상 부재는 다르다. 특히 사용자가 실물을 볼 수 있는 대상이라면 단정 전에 한 장 요청하는 게 훨씬 싸다 (같은 세션에서 Ezoic visits 오진 때 이미 나온 교훈인데 반복했다)

### 계측의 판정 시각을 실측 없이 추정으로 정해 지표를 스스로 오염시켰다 (2026-08-27, #85 → #86)
- **문제**: 광고 도달 계측(#85)의 판정 체크포인트를 **4초**로 잡아 배포했다. 그런데 실측 조사 결과 첫 크리에이티브 도착이 데스크탑 콜드 **4.1~5.4초**(상단 띠 111은 4.9~5.9초), Fast3G **15~17초**, 사용자 눈대중 **6~7초**였다. **4초는 광고가 아직 오는 중인 시점**이라 그 표본이 통째로 `nofill`로 집계됐다. ePMV 저하 원인을 "재고 부족"과 "단가"로 가르려고 만든 지표가, 하필 그 판정을 스스로 망가뜨리는 값으로 배포된 것
- **원인 1 — 상수의 근거가 추정이었다.** *"`AdSlot`의 배치 창 최대 1.5초(`FLUSH_MAX_WAIT_MS`) + 입찰·렌더"* 라고 코드 주석에까지 적어 놓고, 그 합이 실제로 얼마인지 한 번도 재지 않았다. 우리 코드가 관장하는 구간(1.5초)만 계산했고 **Ezoic·Google 파이프라인이 그 뒤에 3~4초를 더 붙인다**는 걸 몰랐다
- **원인 2 — 재는 방법이 이미 레포에 있었다.** `scripts/check-ad-audit.mjs`가 *"지금 실제로 무엇이 어디에 그려졌나"* 를 덤프하는 용도로 존재했고, 첫 크리에이티브 시각을 재는 데 그대로 쓸 수 있었다. 계측 도구를 만들면서 기존 계측 도구를 안 돌렸다
- **원인 3 — 사용자가 이미 답을 갖고 있었다.** 같은 세션에서 *"광고 뜨는 게 수초 걸림"* 이라고 말했는데, 그 진술을 지연 조사의 입력으로만 쓰고 **내가 방금 정한 4초 상수의 반증으로는 대입하지 않았다.** "수 초"와 "4초 안에 안 오면 재고 없음"은 정면으로 충돌한다
- **교훈**:
  - **타이밍 상수는 추정으로 정하지 않는다.** 특히 서드파티 파이프라인이 끼어 있으면 우리가 통제하는 구간만 더해서는 실제 종단 시간을 알 수 없다. 상수를 넣기 전에 그 구간을 한 번 재고, 근거를 주석에 **실측값으로** 남긴다
  - **"기다렸다가 판정"보다 "관측하다 도착하면 판정"이 구조적으로 안전하다.** 고정 대기는 상수가 틀리는 순간 전 표본이 오염되지만, 이벤트 구동은 늦게 와도 오판하지 않는다. 고정 시각은 "끝내 안 오는 경우"의 데드라인으로만 쓴다
  - **사용자의 체감 진술은 내 상수의 검증 데이터다.** "수초 걸린다"를 들었으면 그 자리에서 내가 쓴 4초와 대조했어야 했다
- **해결**: #86 — 250ms 폴링으로 도착을 관측해 소재가 붙는 즉시 `filled` 보고, 데드라인 20초. 첫 도착 시각(ms)을 함께 실어 실사용자 지연 분포도 수집

### beta에서 검증 불가능한 완료 조건을 이슈 AC에 적었다 (2026-08-27, #85)
- **문제**: 프론트(프로브)와 bun-api(`/_e` 라우트 + 집계)를 같이 바꾸는 작업인데, AC에 *"beta 배포 후 실데이터로 판정"* 을 넣었다. beta 배포 후 확인해 보니 `POST /api/_e`가 **404**였다 — 프론트만 beta에 올라가고 API는 그대로였다
- **원인**: `CLAUDE.md`의 Deploy Checklist에 *"bun-api: `bun-api/` 변경 시 push하면 GitHub Actions가 자동 재시작 (**main만, beta는 무시**)"* 이라고 이미 적혀 있었다. 읽지 않고 작업 계획을 세웠다
- **교훈**:
  - **프론트+API를 함께 바꾸는 기능은 beta에서 통합 검증이 불가능하다.** beta는 프론트 전용 스테이징이다. beta에서 확인할 수 있는 것은 클라이언트 동작(비콘이 나가는가, 페이로드 모양, CLS)까지고, 서버 수신·집계는 main 머지 이후에만 확인된다
  - 그런 작업의 AC는 **"beta에서 클라이언트 동작 확인" / "main 머지 후 수신 확인"** 두 단계로 쪼개 적는다
  - 배포 경로가 갈리는 변경을 계획할 때는 Deploy Checklist를 **작업 시작 전에** 읽는다 — 다 만든 뒤에 읽으면 검증 계획을 다시 짜야 한다

### 서로 다른 기간의 두 숫자를 나눠 격차를 15배로 오진했다 (2026-08-27, #85)
- **문제**: `todo.md`의 *"Ezoic Website Visits 949(30일)"* 와 자체 UV 월 ~14,000을 그대로 나눠 **"약 15배 격차"** 라고 사용자에게 보고했다. 그 격차를 근거로 "애드블록이 원인일 것"이라며 계측 작업의 우선순위를 올렸다. 실제 대시보드를 보니 8/19~8/25 **Visits 2,515 = 일 359**, 자체 UV 일평균 470 → **격차는 약 1.2배**였다. 봇(~10%)과 중국 도달 불가만으로 거의 설명되는 수준이다
- **원인 1 — 분자와 분모의 기간이 달랐다.** 949는 "30일 창"의 값이지만 광고는 8/13에 켜져 **실제로는 5일치**였다. 30일 UV와 5일치 visits를 나눴으니 6배가 그냥 곱해졌다. 대시보드의 "지난 30일" 라벨을 데이터가 30일치라는 뜻으로 읽은 것이 잘못 — **수익화가 최근에 시작된 지표는 라벨 기간과 데이터 기간이 다르다**
- **원인 2 — 자릿수가 이상한데 검산하지 않았다.** 15배는 "우리 트래픽의 93%가 광고를 못 본다"는 뜻이다. 그 정도면 애드블록만으로 불가능하고 훨씬 근본적인 고장을 의심해야 정상인데, 그 이상함을 그대로 결론으로 실어 보냈다. `todo.md`에 이미 *"격차 자체는 이상 징후가 아닐 가능성이 높음"* 이라고 적혀 있었는데도 반대 방향으로 갔다
- **원인 3 — 손이 닿는 원본을 안 보고 2차 기록으로 판단했다.** Ezoic 대시보드는 사용자가 스크린샷 한 장으로 바로 보여줄 수 있는 것이었다. 일별 표를 한 번 보는 것이 `todo.md`의 요약값을 나누는 것보다 언제나 정확하다
- **교훈**:
  - **비율을 말하기 전에 분자·분모의 관측 기간이 같은지 먼저 확인한다.** 다르면 반드시 일 단위로 정규화한 뒤 나눈다
  - **결과가 상식 범위를 벗어나면(예: 93% 손실) 그것은 결론이 아니라 검산 신호다.** 그 상태로 사용자에게 보고하면 잘못된 우선순위가 그대로 실행된다
  - **대시보드 원본을 볼 수 있으면 요약 기록으로 추론하지 말 것.** 사용자에게 화면 한 장을 요청하는 비용이 오진 비용보다 훨씬 싸다
- **결과**: 계측(#85) 자체는 유지하되 **목적을 바꿨다** — 애드블록 격차 규명이 아니라, ePMV가 낮은 원인을 "재고 없음(no-fill)"과 "단가 하락"으로 가르는 용도

### 부모 컨테이너가 광고 자리를 눌러 최고 단가 규격이 빠지는 걸 두 달 놓칠 뻔함 (2026-08-20, #83)
- **문제**: SEO 상세 페이지의 상단 띠가 `BAND_BOX`의 `sm:max-w-[728px]`까지 열려 있으니 728×90이 온다고 믿었다. 실제로는 본문이 `max-w-2xl px-4`(컨텐츠 **640px**)라 부모가 자리를 눌렀고, **728×90 leaderboard가 후보에서 통째로 빠져 있었다.** 띠 계열에서 채움률·단가가 가장 좋은 규격을, 하필 구글 유입이 가장 많은 상세 페이지에서 놓치고 있었다
- **원인 1 — 자기 컴포넌트의 `max-w`만 보고 실효 폭을 확인하지 않았다.** `max-w`는 상한이지 확보된 폭이 아니다. 실효 폭은 항상 부모가 정한다. 기존 오답노트에 *"자리 폭은 그 자리에 올 수 있는 최대 규격으로 잡는다"*를 적어 뒀지만, 그건 **자리 자신의 폭** 이야기였고 부모가 그걸 되눌러 무효로 만드는 경우는 다루지 않았다
- **원인 2 — 실측 데이터를 손에 쥐고 낙관적으로 오독했다.** 8/17 실측은 `placeholder #111이 640×100, 안쪽 크리에이티브 슬롯 높이 90px`이었다. 이걸 *"728×90 계열 띠를 기대하고 있음"* 으로 읽고 `[x]`로 닫았다. 폭 640에 728짜리가 들어올 리 없다 — 높이 90은 468×60·320×100 같은 **좁은 띠**의 자리였을 뿐이다. 높이만 보고 규격을 추정한 것이 잘못
- **원인 3 — 같은 파일에 정확한 진단이 이미 있었는데 낙관적인 쪽을 완료 처리했다.** `todo.md`의 다른 항목에는 *"자리 폭이 640px이고 728×90이 후보에서 빠진다. 하필 구글 랜딩 페이지들"* 이라고 정확히 적혀 있었다. 모순된 두 기록이 공존했고, `[x]`가 붙은 쪽이 낙관 오독본이라 조치가 밀렸다
- **교훈**:
  - **`max-w`를 확보된 폭으로 읽지 말 것.** 광고 자리를 새로 놓거나 옮길 때는 렌더된 실효 폭(`getBoundingClientRect().width`)을 재고, 그 폭에 원하는 규격이 실제로 들어가는지 산수로 확인한다
  - **규격은 높이가 아니라 폭으로 판정한다.** 배달된 높이는 여러 규격이 공유하므로 단서가 못 된다
  - **모순되는 기록이 보이면 낙관적인 쪽이 아니라 비관적인 쪽을 먼저 검증한다.** 완료 표시(`[x]`)는 그 항목을 다음 사람의 시야에서 지운다 — 틀린 완료 처리는 미완료보다 나쁘다
- **해결**: `AdBleed`(`src/components/ads/AdBleed.tsx`)로 `md:-mx-11` 브레이크아웃 → `640 + 88 = 728`. SEO 상세 6종에 적용. md(768px) 미만은 가로 스크롤이 생기므로 제외, 목록형(`max-w-4xl`, 864px)은 이미 충분해 제외

### anchor(Adhesion)를 코드로 만들려다 방향을 되돌림 (2026-08-20, #83)
- **문제**: `todo.md`가 *"anchor 포맷 RPM $0.00 — `AD_PLACEHOLDER_ID`에 anchor를 쓰는 코드가 아예 없음. '안 팔린 것'이 아니라 '자리를 안 만든 것'"* 이라고 진단해 둬서, 수익 회수를 위해 placeholder 100 자리를 코드로 추가하려 했다
- **왜 틀렸나**: Adhesion(100)은 **Ezoic이 대시보드 설정에 따라 자동 삽입하고 `position:fixed`로 직접 배치하는 유닛**이다. 같은 파일의 다른 오답노트가 이미 *"자동 배치는 코드로 막을 수 없다 — 대시보드에서 Adhesion / Vignette / auto-insert를 끄고…"* 라고 적고 있었다. #75에서 UX 이유로 **대시보드에서 껐던 것**이 RPM $0.00의 실제 원인이지, 자리를 안 만들어서가 아니다. 코드로 div를 넣으면 본문에 유령 자리(예약 높이 + AD 라벨)가 남고 광고는 별도로 하단에 고정되는, 둘 다 생기는 꼴이 될 수 있었다
- **교훈**:
  - **자동 유닛과 우리가 심는 유닛을 구분할 것.** 우리 코드가 관장하는 건 `showAds(<id>)`로 요청하는 자리뿐이고, Adhesion·Vignette·사이드월(116·117)은 대시보드 소관이다. 리포트에 RPM $0.00이 보이면 "자리를 안 만들었나"보다 **"대시보드에서 꺼 놨나"** 를 먼저 본다
  - 오답노트에 답이 이미 있는데도 다른 파일(`todo.md`)의 진단만 보고 움직일 뻔했다 — **코드를 건드리기 전에 같은 주제의 오답노트를 먼저 훑을 것**
- **결론**: anchor를 켜려면 Ezoic 대시보드에서 Adhesion을 다시 켜야 하고, 그건 UX 트레이드오프(하단 91px 상시 점유)를 동반하는 **사용자 결정 사항**이다. 코드 변경으로 처리하지 않는다

### Ezoic이 자리 크기를 무시하고 큰 규격을 넣어 레이아웃이 겹침 (2026-08-11, #75)
- **문제**: 광고 자리에 최대 폭만 주고 "Ezoic이 그 폭에 맞는 규격을 고를 것"이라 가정해 레일을 160폭으로 잡았다. beta 실측 결과 Ezoic이 그 자리에 **300×250**을 넣어(`ezaw=300`) 오른쪽으로 325px 삐져나오며 아이템 카드와 겹쳤다. 사용자 눈에는 "광고가 셀 뒤쪽에 뜨고 레이아웃이 깨진" 것으로 보임
- **교훈**:
  - 자리 폭은 **그 자리에 올 수 있는 규격의 최대치**로 잡는다. 컨테이너를 좁게 주고 광고망이 맞춰줄 것을 기대하면 안 된다
  - `overflow:hidden`으로 잘라내는 건 해결책이 아니다 — 광고를 일부 가리는 건 정책 위반이라 계정이 정지될 수 있다
  - 규격 검증은 **실제 브라우저**에서만 가능하다. 헤드리스는 봇으로 판정돼 광고가 아예 채워지지 않으므로 "자리는 잡혔다"까지만 확인된다. 겹침·넘침은 실브라우저에서 `ezaw`/`ezah` 속성과 자식 요소의 `getBoundingClientRect`를 직접 비교해야 잡힌다
- **해결**: 레일 폭 300 고정 + 표시 조건을 `min-[1500px]`(그리드 896 + 좌우 300 = 1496)로 조정

### placeholder 번호를 임의로 골라 Ezoic 기본 자리와 충돌 (2026-08-11, #75)
- **문제**: `showAds(101~104)`로 우리 자리를 임의 번호에 붙였다. 그런데 Ezoic 대시보드에는 번호마다 위치 유형이 이미 정의돼 있었다 — 100=Adhesion, 101=top_of_page, 102=under_page_title, **103=bottom_of_page**, 104~108=sidebar 계열, 109~115=본문 계열. 왼쪽 레일로 쓴 103이 Ezoic에게는 "페이지 맨 아래"였으므로 970×105 가로 배너가 배달됐다
- **교훈**: Ezoic에서 **placeholder 번호는 곧 위치 유형**이다. 임의 번호를 쓰면 안 되고, 대시보드(`EzoicAds → Ad Positions → Placeholders`)에서 기존 목록을 먼저 확인해 우리 자리의 성격과 같은 유형의 번호를 골라 쓴다. 새 유형이 필요하면 `NEW PLACEHOLDER`로 만들어 발급된 번호를 코드에 쓴다 — 코드가 번호를 발명하는 방향은 항상 틀린다
- **해결**: infeed=111(mid_content), sheet=115(incontent_5), rail-left/right=107/108(sidebar_floating_1·2)로 재배치

### Ezoic 자동 배치가 전면·하단 고정 광고를 제멋대로 삽입 (2026-08-11, #75)
- **문제**: 우리가 정의한 자리(101~104)와 별개로 Ezoic이 ① 하단 고정 배너(`Adhesion`, placeholder 100, `position:fixed; z-index:100000`으로 화면 하단 91px 점유) ② 이탈 후 복귀 시 전면 광고(Vignette/Interstitial) ③ 카드 그리드 칸 안에 끼어드는 광고를 자동 삽입했다. 하단 고정 배너는 우리가 UX 이유로 후보에서 **제외한** 형태였다
- **원인**: Ezoic Ad Tester의 자동 배치(auto-insert) 기능. 스크립트만 붙어 있으면 대시보드 설정에 따라 서버 쪽에서 알아서 심는다
- **교훈**: 자동 배치는 **코드로 막을 수 없다** — Ezoic 대시보드에서 Adhesion / Vignette·Interstitial / auto-insert를 끄고 "우리가 정의한 자리에만" 넣도록 설정해야 한다. 광고 자리를 코드로 설계할 때 이 설정을 먼저 확인하지 않으면, 배포 후에야 의도하지 않은 광고 형태를 사용자가 먼저 발견한다
- **진단법**: 실브라우저에서 `document.querySelectorAll(".ezoic-ad")`를 전수 조회해 각 요소의 부모 경로·position·z-index를 찍으면 자동 삽입분과 우리 자리를 구분할 수 있다. 자동 삽입분은 `adtester-container-<n>` 클래스와 `Adhesion`/`Vignette` 같은 종류 이름을 달고 있다

### 목업 기본 규격만 바꾸고 규격 표에 항목을 안 넣어 띠가 통째로 사라짐 (2026-08-12, #75)
- **문제**: `bf9bbf07`에서 첫 줄 띠 목업 기본값을 `728x90` → `468x60`으로 바꿨는데 `MOCK_SIZES` 표에는 `468x60` 항목을 넣지 않았다. `AdSlotMock`이 알 수 없는 키에 대해 `return null`로 조용히 빠져나가는 구조라, `?admock=all`에서 **데스크탑 첫 줄 띠가 아무 흔적 없이 사라졌다**. 모바일(320x50)은 표에 있어 정상 렌더돼서 더 눈치채기 어려웠다
- **원인**: "기본값"과 "그 기본값을 해석하는 표"가 서로 다른 상수에 나뉘어 있는데, 한쪽만 고쳤다. 타입은 `Record<string, ...>`이라 존재하지 않는 키도 컴파일을 통과한다
- **교훈**:
  - 문자열 키로 다른 표를 참조하는 상수를 바꿀 땐 **참조되는 표에 그 키가 있는지 같은 커밋에서 확인**한다. `Record<string, T>`는 키 존재를 보장하지 않으므로 tsc가 잡아주지 않는다
  - **조회 실패를 `return null`로 조용히 처리하면 안 된다.** "의도적으로 안 그림"(레일의 모바일 규격 없음)과 "표에 없어서 못 그림"은 다른 상황이므로 분기를 나누고, 후자는 `console.warn`으로 드러낸다
- **검증**: 목업 URL을 연 뒤 `document.querySelectorAll('[data-ad-slot]')`로 **기대한 자리 개수가 다 나오는지** 센다. 눈으로 "광고가 안 보이네"는 no-fill과 구분되지 않는다
### 자리마다 따로 showAds를 불러 광고가 "뜨다 안 뜨다" (2026-08-13, #75)
- **문제**: `AdSlot`이 각자 마운트 시점에 `ezstandalone.showAds(id)`를 호출했다. 레일은 마운트 즉시, 목록 첫 줄 띠는 IntersectionObserver가 걸린 뒤, 상세 시트는 열 때 — 시점이 다 어긋난다. 그 결과 같은 화면인데도 어떤 때는 레일이 차고 어떤 때는 비고, 상단 띠도 떴다 안 떴다 했다. 사용자가 "양옆에 언젠 뜨고 언젠 안 뜨고", "상단 가로 긴 거 뜨다 안 뜨다"로 지적
- **원인**: Ezoic은 `showAds` 한 번을 입찰→렌더 사이클로 처리하고, **그 사이클이 도는 중에 들어온 다음 호출은 무시**한다. 자리를 여러 개 두고 개별 호출하면 늦게 들어온 자리가 조용히 누락된다. 콘솔 에러도 안 난다
- **교훈**:
  - Ezoic 요청은 **한 번에 모아서** — 같은 틱에 생긴 자리들을 `showAds(...ids)` 한 호출로 배칭한다. SPA 전환에서는 `destroyPlaceholders(...)` 먼저, 그다음 `showAds(...)` (Ezoic 문서 패턴)
  - 사이클이 한 번만 도니 표시도 빨라진다 — "광고가 늦게 뜬다"는 체감의 절반은 이 누락·재요청 때문이었다
  - 자리를 늘릴 때 개별 호출을 복붙하는 방향은 항상 틀린다. 자리 추가는 배치 큐에 id를 넣는 것으로 끝나야 한다
- **해결**: `AdSlot.tsx`에 모듈 단위 배치 큐(`requestAd`/`releaseAd` → `setTimeout(flush, 0)`) 추가. 각 자리는 큐에 등록만 하고 실제 호출은 한 번

### Ezoic setup 화면의 "Not yet started"를 지금 해야 할 일로 오판 (2026-08-17)
- **문제**: Ezoic setup 페이지의 `Identity Verification: Not yet started` / `Address Verification: Not yet started`를 보고 "지금 신원·주소 확인을 해야 하고 45일 시계가 이미 돌기 시작했다"고 판단했다. 실제로 Ad Manager → 지급 → **확인 검사**(`#payments/verification`) 화면을 열어 보니 **빈 상태**였다 — 업로드 폼도, 시작 버튼도, 진행 항목도 없고 *"수입이 확인 기준액에 도달하면 …필요할 수 있습니다"* 안내만 있었다. 즉 구글은 아직 아무것도 요구하지 않은 상태였고, 당시 누적 수익은 $0.68로 기준액과 한참 멀었다
- **원인**: Ezoic 대시보드는 **앞으로 필요해질 단계까지 미리 나열**한다. `Not yet started`는 "네 차례인데 안 했다"가 아니라 "아직 시작되지 않은 단계"라는 뜻이다. 중개 대시보드의 표시를 원 사업자(구글)의 현재 요구로 읽은 것이 오판의 본질 — `Ad Manager Account Status`가 승인 후에도 한동안 `Pending`으로 남았던 것과 같은 종류의 동기화·표현 차이다
- **교훈**:
  - **Ezoic 표시는 구글 상태의 근거가 아니다.** 판단 기준은 항상 구글 쪽 원본 — Ad Manager 화면과 `admanager-noreply@google.com` 메일이다. Ezoic은 참고용 요약으로만 볼 것
  - 기한이 걸린 항목(45일 시계, PIN 우편 2~4주)은 **시작 시점을 잘못 잡으면 없는 마감에 쫓기거나 진짜 마감을 놓친다.** "언제부터 세는가"를 원본 화면에서 확인한 뒤 일정에 올릴 것
- **후속 (2026-08-18)**: Identity는 실제로 `Verified`로 전환됨. 셋업이 안 끝난 진짜 원인은 별개로 `Ad Manager Domain Status: In Progress`(8/17 제출, 최대 14일)였다 — **미완료 항목이 여러 개 보일 때 그중 무엇이 실제 병목인지부터 가릴 것**

### 같은 오판을 반대 방향으로 반복 — 대시보드만 보고 "아직 요청 안 옴"으로 종결 (2026-08-18)
- **문제**: 바로 위 항목의 교훈("Ezoic 표시를 구글 상태의 근거로 쓰지 말 것")을 오답노트에 적어 커밋한 **바로 그 세션에서**, Address Verification을 "아직 요청 안 됨, 지금 할 일 없음"으로 정리해 `todo.md`에 커밋했다. 그런데 같은 날 **08:40 UTC(17:40 KST)에 이미 구글이 PIN 우편물을 발송**하고 *"조치 필요: Ad Manager에서 수취인 주소를 확인해 주세요"* 메일을 보낸 상태였다. 45일 시계(마감 2026-10-02)가 이미 돌고 있는데 "할 일 없음"으로 닫은 것
- **원인**: 판정 근거로 **Ezoic setup 화면만** 봤다. 그 화면은 PIN 발송 이후에도 여전히 `Address Verification: Not yet started`였다. 8/17에는 같은 화면을 보고 "지금 해야 한다"고 과잉 판정했고, 8/18에는 같은 화면을 보고 "아직 아니다"라고 과소 판정했다 — **방향만 반대일 뿐 원인은 동일**하다. 원본을 안 봤다
- **교훈**:
  - **기한이 걸린 외부 절차의 통보는 메일로 온다.** 대시보드에 안 떴다는 것은 통보가 없었다는 증거가 못 된다. 상태를 "없음/불필요"로 **종결하기 전에 반드시 메일함을 조회**할 것 — `from:admanager-noreply@google.com` 같은 발신자 검색 한 번이면 끝난다
  - "교훈을 문서에 적는 것"과 "그 교훈을 지금 적용하는 것"은 별개다. 오답노트에 규칙을 쓰는 순간이 그 규칙을 스스로 어기기 가장 쉬운 순간이다 — **쓴 직후 현재 판단에 그 규칙을 대입해 볼 것**
  - 부정 판정("아직 아니다", "해당 없음", "영향 없음")은 긍정 판정보다 검증을 더 요구한다. 틀렸을 때 **아무도 알려주지 않고 조용히 기한만 지나가기** 때문이다
- **영향**: 실손해는 없었다 — 사용자가 "메일 온 것 같은데"라고 물어 같은 날 발견했다. 발견이 늦었다면 PIN 우편(도착 3주) 대응이 밀리고, 재발송은 이전 발송 3주 후에야 요청 가능해 10/2 마감을 넘겼을 것

### no-fill을 "채워짐"으로 오판해 빈 회색 AD 박스를 그림 (2026-08-13, #75)
- **문제**: `AdCard`가 `el.childElementCount > 0`으로 광고 도착을 판정했다. 그런데 재고가 안 붙어도(no-fill) Ezoic은 규격만큼 공간을 잡고 **18×18 자사 뱃지 이미지 하나**를 넣는다. 그래서 광고가 하나도 없는 상태에서 728×90·336×250짜리 텅 빈 회색 "AD" 카드가 그려졌다 — 사용자가 본 "지저분함"의 상당 부분이 이것
- **원인**: "자식이 생겼다 = 광고가 왔다"는 가정. 광고망은 노출 측정용 픽셀·뱃지·빈 컨테이너를 항상 심으므로 자식 수는 신호가 못 된다
- **교훈**:
  - 광고 도착 판정은 **소재로 볼 만한 것**(iframe / 뱃지보다 큰 이미지 / 텍스트)이 있는지로 한다
  - 이미지 소재는 로드 전 `getBoundingClientRect().width`가 0이라 첫 판정에서 놓친다 — MutationObserver(`subtree: true`)에 더해 몇 번 지연 재확인이 필요
  - 소재는 placeholder 바로 아래가 아니라 몇 겹 안쪽에 들어온다. `childList`만 관찰하면 iframe 삽입을 놓친다
- **검증**: `document.querySelector('#ezoic-pub-ad-placeholder-<id> img').naturalWidth`가 18이면 뱃지뿐 = no-fill. 자리 크기가 잡혔다고 광고가 온 게 아니다

### 탭 전환 때 광고가 통째로 죽음 — 번호만 세고 "누가 쥐고 있는지"를 안 봄 (2026-08-13, #75)
- **문제**: 상단 띠는 모든 탭이 같은 placeholder 번호(111)를 공유한다. 탭을 바꾸면 A탭의 placeholder div가 언마운트되고 B탭에 새 div가 마운트되는데, 요청 큐가 참조 수(“이 번호를 쓰는 자리가 있는가”)만 세다 보니 계속 1이라 **아무 요청도 나가지 않았다**. Ezoic은 DOM에서 사라진 옛 div에 광고를 들고 있는 상태가 되고, 새 자리는 영영 빈다. 그 상태에서 다음 사이클이 돌면 **레일 광고까지 같이 날아갔다**
- **증상 구분법**: 재고가 없을 때(no-fill)는 18×18 뱃지 이미지라도 남는다. 이 버그는 iframe·이미지가 **0개**이고 `getSelectedPlaceholders()`에서 다른 번호들이 통째로 빠진다. "광고를 못 받았나 보다"로 넘기기 쉬우니 두 상태를 반드시 구분할 것
- **교훈**:
  - 같은 번호를 여러 화면이 공유하면, 상태는 번호가 아니라 **"지금 그 번호를 쥐고 있는 엘리먼트/인스턴스"** 단위로 잡아야 한다. 주인이 바뀌면 `destroyPlaceholders → showAds`로 다시 붙인다
  - 해제는 **자기가 주인일 때만** 반영한다. 언마운트가 새 자리의 요청보다 늦게 도착해도 방금 잡은 자리를 빼앗지 않는다
  - SPA에서 광고망 SDK는 "id 문자열"로 DOM을 기억한다. React가 그 DOM을 갈아끼우는 순간 SDK의 기억과 실제가 어긋나므로, 마운트/언마운트 경계마다 SDK에 알려야 한다
- **해결**: 요청 큐를 참조 수 → 주인 토큰(`desiredOwner`/`shownOwner`) 비교로 교체

### 서비스워커가 서드파티(광고) 요청까지 가로채고 있었음 (2026-08-13, #75)
- **문제**: `sw.template.js`의 fetch 핸들러에 same-origin 가드가 없어, 우리 자산 분기에 안 걸린 **모든 교차 출처 요청**이 맨 아래 stale-while-revalidate로 흘렀다. 광고가 붙자 Ezoic·Google 요청 수백 건이 SW를 거치게 됐고, DevTools에서 `ads?pvsid=...`의 initiator가 `sw.js`로 찍혔다. SW 홉이 추가돼 느려지는 데다, `response.ok`인 서드파티 응답은 캐시에 들어가 다음 로드에 stale 광고 응답이 나갈 수 있었다
- **원인**: 최종 분기가 "그 외 전부"였고, 그 전제(우리 자산만 온다)가 광고 도입으로 깨졌다. 광고 이전에는 교차 출처 요청이 거의 없어 드러나지 않았다
- **교훈**:
  - SW fetch 핸들러는 **맨 앞에 `if (url.origin !== self.location.origin) return;`**. "그 외 전부"를 우리 것으로 가정하지 말 것
  - 서드파티 스크립트를 새로 붙이면 SW·CSP·프록시처럼 **"전부"를 받는 계층**을 다시 점검한다. 전제가 조용히 깨진다
- **함정**: `public/sw.js`는 `.gitignore` 대상 **빌드 산출물**이다 (`src/sw.template.js` → `scripts/generate-sw.cjs`). 생성물을 고치면 다음 빌드에 사라진다 — 원본은 `src/sw.template.js`

### 광고 자리를 예약해 놓고 CLS를 못 막고 있었음 (2026-08-14, #75)
- **문제**: 띠 광고 자리에 `min-h`로 공간을 예약해 뒀는데도 광고가 도착할 때마다 컨텐츠가 밀렸다. 예약을 50 → 90/100px로 올린 뒤에도 **모든 규격에서 20~30px 시프트가 남았다**. 실측(`scripts/check-ad-cls.mjs`) 결과 원인이 둘이었다:
  1. 카드 껍데기(AD 라벨 + 상하 패딩 ≈27px)를 `filled`일 때만 렌더 → 광고 도착 순간 그 27px이 새로 생김
  2. 채워지면 예약을 풀고 `minH`(50px)로 줄임 → 100px 예약한 자리에 320×50이 오면 **위로 50px 당겨짐**
- **원인**: "예약 = 광고 소재 높이"로만 생각했다. 실제로 시프트를 만드는 건 **자리 전체 높이의 변화**이고, 거기엔 껍데기도 포함된다. 그리고 CLS는 아래로 미는 것만 세는 게 아니라 **위로 당기는 것도 센다** — 예약을 넉넉히 잡은 뒤 채워질 때 줄이면 그 자체가 시프트다
- **왜 눈에 안 띄었나**: 기존 회귀 하네스 2종은 "우리가 무엇을 **요청**하는지"만 본다. 요청은 완벽했고 레이아웃은 아무도 안 쟀다. 자리가 21개 케이스를 통과하는데 CLS는 그대로였다
- **교훈**:
  1. 광고 자리의 불변식은 **"비었을 때 높이 == 채워졌을 때 높이"** 하나다. `filled`로 분기해도 되는 건 높이를 안 만드는 것(테두리·배경·라벨 글자)뿐
  2. 예약 높이를 브레이크포인트로 쪼개지 말 것 — 데스크탑만 90px로 좁혔더니 데스크탑에 320×100이 와서 10px 밀렸다. 띠 계열 최대치 하나(100px)로 고정
  3. **"요청이 맞다"와 "레이아웃이 맞다"는 다른 테스트다.** 눈으로 안 보이는 지표(CLS)는 반드시 수치로 재는 하네스를 따로 둘 것 — iframe을 규격별로 직접 꽂아 높이 변화를 재면 실광고 없이 결정적으로 검증된다
- **해결 (#75)**: 껍데기 상시 렌더(라벨은 `invisible`) + 예약 높이를 `filled`와 무관하게 유지 + `reserve: min-h-[100px]` 단일화. `scripts/check-ad-cls.mjs` 추가로 띠 계열 4규격 × 5화면 전부 시프트 0 확인
- **꼬리 (같은 날, beta 실측)**: 위를 고치고 beta에 올려 실브라우저로 보니 **여전히 116px → 143px로 밀렸다**. `filled` 전환만 막았고 그 바깥의 **`active` 전환**(비활성일 때 빈 div ↔ 활성일 때 `AdCard`)에 껍데기 27px 차이가 그대로 있었다. 백그라운드 탭에서 로드되면 IntersectionObserver가 포커스 후에야 돌아 첫 페인트보다 늦게 활성화된다 — 그게 그대로 CLS. 새로 만든 하네스도 못 잡았는데, **로드 2초 뒤(=이미 활성) 상태만 쟀기 때문**이다. 비활성일 때도 같은 `AdCard`를 그리고 `id`만 활성일 때 붙이는 것으로 수정(id가 없으면 Ezoic이 그 div를 못 찾으므로 중복 위험도 그대로 없다). 하네스에는 `IntersectionObserver`를 절대 fire 안 하는 스텁으로 갈아끼워 비활성 높이를 재는 케이스를 추가
  - **교훈 추가**: 조건부 렌더 경계가 둘 이상이면(`active`, `filled`) **모든 경계**에서 높이가 같은지 재야 한다. 하나만 막고 "고쳤다"고 판단한 게 실서버에서 바로 드러났다. 그리고 **로컬 하네스가 통과해도 실브라우저에서 한 번은 눈으로 볼 것** — 하네스는 자기가 재는 상태만 안다
- **남은 것**: 사각형 소재(336×280)가 오면 +180px 시프트는 예약으로 흡수 불가. 111번에 사각형이 실제로 배달되는지는 `check-ad-slots-live.mjs`로 관측 후 판단. 특히 SEO 페이지는 `max-w-2xl` 때문에 자리 폭이 640px이라 728×90이 애초에 후보에서 빠진다 → 사각형이 올 확률이 SPA보다 높다

## 워크플로우 / 머지

### feat 워크트리에서 dev 서버를 띄우려다 두 번 헛발질 (2026-08-11, #75)
- **문제 1 — node_modules 심볼릭 링크**: 워크트리에 `ln -s ../dst-craft/node_modules`로 링크를 걸었더니 Next 16이 `Symlink node_modules is invalid, it points out of the filesystem root`로 거부. 절대 경로 링크도 동일하게 실패
- **해결**: 하드링크 복사 `cp -Rpl <메인>/node_modules <워크트리>/node_modules` — 557MB가 10초, 디스크 추가 사용은 사실상 0. `npm install` 재실행보다 훨씬 싸다
- **문제 2 — dev 서버가 Bash 호출 사이에 죽음**: `(npx next dev &)` / `nohup ... & disown` / 백그라운드 툴 모두 다음 Bash 호출 시점엔 프로세스가 사라져 `ERR_CONNECTION_REFUSED`. 게다가 백그라운드 툴 경유로는 `-p`/`--port` 옵션이 `unknown option`으로 튕겼다 (명령이 rtk 프록시로 재작성되며 인자가 유실)
- **교훈**: 로컬 서버가 필요한 검증은 **한 번의 Bash 호출 안에서 서버 기동 → 준비 대기 루프 → 스크립트 실행까지 전부 끝낼 것**. 호출을 쪼개면 매번 서버가 죽어 있다. 캡처/E2E 스크립트를 먼저 파일로 써두고 마지막에 한 방에 돌리는 순서가 맞다

### 빌드 실패가 source HEAD를 advance시켜 재배포가 "already up to date"로 스킵됨 (2026-05-21, #42)
- **문제**: v0.26.7(IndexNow) 배포가 1차에서 `next/font/google` 폰트 모듈 에러로 빌드 실패. 실패한 워크플로우를 `gh run rerun --failed`로 재실행했더니 frontend 재빌드 스텝이 `[deploy-main] Already up to date (6b2e844). Use --force to rebuild.`로 끝나며 exit 0. 배포는 성공으로 떴지만 symlink swap이 안 일어나 옛 릴리즈가 그대로 서빙 → 키 파일 404, IndexNow ping 미실행
- **원인**: `deploy-frontend.sh`는 `source-main`을 `git pull`로 먼저 올린 뒤 `npm run build`를 돈다. 빌드가 실패하면 `source-main` git HEAD만 푸시된 SHA로 advance된 채 남는다. 재실행 시 스크립트의 `CURRENT == TARGET_SHA` 검사가 "이미 최신"으로 판정 → 재빌드 통째 스킵. `deploy-beta.yml`의 main 재빌드 스텝은 `--force` 없이 호출해서 `workflow_dispatch`의 `force_frontend`를 켜도 강제 불가 (beta 스텝은 `--force`를 붙임)
- **교훈**:
  - 배포가 "성공"으로 떠도 **로그에서 symlink swap / `Done.` 라인을 확인**할 것. `Already up to date`로 끝났으면 실제 배포 안 된 것
  - 빌드 실패 후 재배포는 `git pull`이 이미 일어났을 수 있으므로 SHA 기반 idempotency 검사를 신뢰하지 말고 `--force` 경로를 쓸 것
  - 빌드 전 `git pull`/`git reset` → 빌드 → swap 순서의 스크립트는, 빌드 실패 시 "소스만 advance, 산출물은 옛 것" 상태를 만든다. 재시도 가능성을 항상 `--force`로 열어둘 것
- **사후 처리**: `deploy-beta.yml` main 재빌드 스텝이 `force_frontend == true`일 때 `deploy-frontend.sh main --force`를 호출하도록 수정 (#42)

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

### 메인 워크트리가 mid-session에 `beta`로 드리프트 — 4회 재발 (2026-05-13/20/23/28, #46)
- **문제**: 메인 워크트리(`/Users/fankimm/works/dst-craft`)가 어느 시점엔가 `main` → `beta`로 HEAD가 바뀌어, `/release` 첫 머지가 main 대신 beta 위에 박힘. 매번 `reset --hard origin/beta` + `git switch main` + 재머지로 복구해 origin엔 영향 없었지만 같은 패턴 4회 반복
- **트리거 미상**: 5-28 사고에서는 `worktree list`가 [main]을 보고한 직후 `git -C ../dst-craft pull --ff-only origin main` 출력에 `$ git reset --hard\n복구됩니다.` 라는 비정상 라인이 섞이며 HEAD가 beta로 바뀜. `.claude/settings.json`, `.git/hooks/`, `~/.zshrc`, git config 어디서도 자동 switch/reset을 유발할 만한 hook/alias 미발견. 어떤 외부 wrapper(Claude Code의 자동 복구·다른 백그라운드 프로세스 등) 의심
- **원인 (가설)**: 다중 worktree 환경에서 같은 branch ref를 두 worktree가 동시에 가리키게 되는 비정상 상태가 트리거인 듯. dst-craft + dst-craft-beta가 모두 `[beta]`로 표시되는 케이스가 5-20·5-23·5-28 사고에서 공통
- **교훈**:
  1. 근본 원인 미상이면 **방어층**으로라도 보호 — 결과 일관성이 더 중요
  2. 메인 워크트리는 "거기에 main이 있다"는 가정으로 모든 워크플로우가 짜여 있어, 가정이 깨지면 즉시 자동 복구할 것
  3. 매번 같은 패턴이면 진단 로그를 자동 수집 — 다음 사고 발생 시 reflog/worktree list 스냅샷이 트리거 분석에 결정적
- **해결 (#46)**:
  - `scripts/check-main-worktree.sh` 가드 작성 — HEAD!=main이고 clean이면 자동 switch, dirty면 비파괴 종료, drift 발생 시 reflog 스냅샷을 `~/.dstcraft-debug/worktree-drift.log`에 누적
  - `.claude/settings.json`에 SessionStart hook 등록 (매 세션 시작 시 자동 실행)
  - `/release` · `/beta` 스킬 사전 점검에도 가드 호출 추가 (안전망 한 겹 더)

## SEO / 구조화 데이터

### React 18+ server component에서 `dangerouslySetInnerHTML` JSON-LD가 RSC stream에 props로 재직렬화 (2026-05-14, #37)
- **문제**: `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />`을 server component에서 직접 출력하면, 정상 `<script>` 태그(1개) 외에 React RSC payload에도 props(`{"dangerouslySetInnerHTML":{"__html":"..."}}`)가 escape된 JSON 문자열로 한 번 더 직렬화돼서 HTML에 포함됨. GSC가 같은 페이지에서 FAQPage schema를 2번으로 카운트 → "FAQPage 입력란이 중복되었습니다" critical 오류 → 27 페이지 리치 결과 차단
- **확인 방법**: `grep -oE 'FAQPage' built.html | wc -l`이 2 이상이면 의심. 첫 번째 매치는 `<script type="application/ld+json">{...}` 정상, 두 번째 매치는 `\\\"@type\\\":\\\"FAQPage\\\"` 형태(escape된 RSC payload). 둘 다 같은 HTML 파일에 inline으로 들어감
- **잘못된 fix 시도**: 헬퍼 컴포넌트(`<JsonLd data={...} />`)로 한 단 감싸도 여전히 RSC payload에 props 그대로 들어감. children 패턴(`<script>{JSON.stringify(data)}</script>`)도 children 자체가 RSC stream에 escape돼서 동일 증상 발생
- **올바른 진단**: 검색엔진 JSON-LD 파서는 `<script type="application/ld+json">` **태그 안의 내용만** 본다. RSC payload escape 문자열은 다른 `<script>`(타입 없음, hydration용) 안에 있어 무시됨. 즉 `<script type="application/ld+json">` 태그 개수 + 각 태그의 `@type` 분포가 진짜 카운트
- **교훈**: 빌드 결과 검증 시 `grep -oE '<script[^>]*application/ld\+json[^>]*>([^<]*)</script>'`로 실제 JSON-LD 태그 수와 @type 분포를 봐야 함. raw `grep FAQPage`는 RSC payload escape를 카운트해 거짓 양성. 현재 패턴(`<JsonLd data={...}` + children, `suppressHydrationWarning`)이 빌드 결과상 `<script type="application/ld+json">` 태그 1개 + RSC payload escape 1개 = grep으론 2번이지만 검색엔진엔 1개로 보임 → GSC 정상화 예상
- **검증 스크립트**: `python3` 한 줄로 모든 detail 페이지 빌드 결과의 `<script type="application/ld+json">` 태그 수와 `@type` 분포 출력해서 페이지당 정확히 1 FAQPage인지 확인

## UI / 탭 구조

### 새 탭에서 TabScrollArea를 안 쓰고 외곽 구조를 인라인 복붙 (2026-06-23, #50)
- **문제**: SkinsApp 작성 시 docs/ui.md에 명시된 "새 탭은 `TabScrollArea` 무조건 사용" 규정을 무시하고, 각 view(home/characters/list)마다 별도 return으로 `<div className="flex-1 min-h-0 overflow-y-auto">...<Footer /></div>` 패턴을 손으로 복붙. view 전환마다 Footer가 unmount → mount 다시 되어 깜빡임 + SupportPill 상태 리셋 + ko-fi ticker 재로딩
- **원인**: 새 컴포넌트 만들기 전 docs/ui.md 안 읽음. 보스 탭 코드를 참고하긴 했지만 TabScrollArea 컴포넌트 자체는 무시하고 내부 구조만 인라인으로 베낌. 첫 결과만 동작하면 OK라고 넘긴 게 누적 오류로 발전
- **사용자 분노 트리거**: 푸터 깜빡임 패턴이 view 전환 시마다 반복되니까 사용자가 "내가 분명 푸터랑 그런거 퍼음 도입할때 그지럴하지 말라고 말했거늘"이라고 분노. 이미 한 번 명시적으로 듣고 docs/ui.md에 적었던 룰을 또 어김
- **교훈**:
  1. 새 탭/페이지/모달 작성 전 **반드시** docs/ui.md 읽기. 1줄 변경 아닌 경우 예외 없음
  2. 가장 가까운 기존 탭의 import + return 외곽을 그대로 베낄 것. 인라인으로 같은 클래스명 손으로 다시 쓰지 말 것
  3. `flex-1 min-h-0 overflow-y-auto` + `flex flex-col min-h-full` + `Footer` 조합을 인라인으로 쓰는 모든 코드는 자동으로 `<TabScrollArea scrollContainer>{...}</TabScrollArea>` 로 교체
  4. 사용자가 "통일감 없다 / 쌩뚱맞다 / 버그난다" 코멘트 → docs/ui.md 다시 읽고 공용 컴포넌트 누락 여부 점검이 1순위
- **해결 (#50)**: SkinsApp 외곽을 단일 wrapper + `TabScrollArea` 한 번 + DetailPanel 한 번으로 통합. view 분기는 헤더/그리드 콘텐츠 변수만. Footer는 더 이상 재마운트되지 않음

### `hidden` 탭은 화면에 없을 뿐 다운로드는 다 한다 — `loading` 속성 유무가 갈랐다 (2026-08-31, #91)
- **문제**: 홈(제작 탭)만 떠 있는데 프로덕션 실측에서 이미지 97장 2,666KB를 받고 있었다. 그중 **59장 1,724KB(65%)가 렌더 크기 0×0** — 보이지도 않는 이미지였다. 보스 썸네일 9장 1,351KB가 제작 탭에서 통째로 다운로드되고 있었다
- **원인**: `AppShell.tsx`가 9개 탭을 **전부 마운트**하고 비활성 탭을 `className="hidden"`(=`display:none`)으로만 감춘다. React는 9개 앱을 다 렌더하므로 비활성 탭의 `<img>`도 DOM에 실재한다
- **왜 여태 안 보였나**: `display:none` 이면 브라우저는 `loading="lazy"` 이미지를 **받지 않는다**. 그래서 lazy가 붙은 219개는 정상적으로 조용했고, **`loading` 속성이 아예 없는 81개만** 그대로 빨려 들어왔다. 즉 "일부 컴포넌트에 lazy가 빠졌다"는 사소해 보이는 누락이 곧 1.7MB였다. 숨은 `<img>` 300개 중 `loading` 없음 81개 = 전부 다운로드 / `lazy` 219개 = 195개 미다운로드로 실측 확인
- **함정**: #88에서 보스 이미지를 9MB → 1.3MB로 줄이는 최적화를 했는데, **줄인 1.3MB가 여전히 안 보이는 탭에서 전량 다운로드되고 있었다.** 용량을 줄이는 최적화가 "애초에 받지 말아야 한다"는 더 큰 문제를 가렸다
- **교훈**:
  1. `<img>`에는 **기본이 `loading="lazy"`** 다. eager는 상세 페이지 최상단 히어로(LCP 요소)에만 의도적으로 남긴다 — 뷰포트 안 이미지는 lazy여도 즉시 로드되므로 목록/그리드에 lazy는 무해하다
  2. 이미지 최적화를 하기 전에 **"이 이미지가 지금 화면에 그려지긴 하는가"** 를 먼저 잰다. `getBoundingClientRect()`가 0×0인 이미지가 몇 KB를 받고 있는지가 첫 질문
  3. 탭을 `display:none` 으로 감추는 구조는 "안 보이면 비용 0"이 아니다. DOM·이미지·JS 번들 전부 비용이 살아 있다
  4. 회귀 방지: `scripts/add-img-lazy.mjs` 가 `loading` 없는 `<img>`를 찾아 붙인다. `--dry-run` 으로 누락 감시 가능

### 순차 curl 타이밍으로 "직렬 -2.1초"를 추정 — 실제 페이지는 병렬이었다 (2026-08-31, #91)
- **문제**: 홈 API 최적화를 제안하면서 "왕복 8회 → 1회, -2.1초(직렬 시)"라고 적었다. 근거는 (a) `curl` 로 엔드포인트를 **하나씩 순차** 호출해 잰 건당 ~300ms, (b) 사용자 DevTools 스샷의 610~863ms. 실제 페이지를 계측해 보니 **GET 5건이 같은 시각(2505ms)에 동시 발사**되고 각 94~103ms였다 — 이미 병렬이고, HTTP/2 다중화라 왕복은 사실상 1회였다
- **원인**: 두 근거 모두 실제 로드 조건이 아니었다. `curl` 은 매 호출마다 TLS 핸드셰이크를 새로 하고 순차로 돈다. 스샷의 610~863ms는 광고 스크립트와 경합하던 값이라 API 자체 비용이 아니었다. **"엔드포인트 하나의 응답시간"을 재고 "페이지가 그걸 어떻게 호출하는지"를 안 쟀다**
- **더 나쁜 점**: 그 잘못된 추정이 없었으면 안 했을 작업(번들 엔드포인트 신설)을 계획에 올렸다. 실제로 계측해 보니 앞선 탭 lazy mount 작업으로 5건 중 3건(`rating`·`top-countries`·`feedback/public` — 전부 설정 탭 소속)이 이미 사라져 남은 건 2건이었고, 게다가 그 2건은 공개·캐시 가능한 응답이라 사용자별 `favorites` 와 합치면 **디스크 캐시 히트를 잃어 오히려 느려지는** 구조였다
- **교훈**:
  1. 네트워크 개선을 제안하기 전에 **브라우저에서 그 페이지를 실제로 로드해** 요청 시작 시각을 찍는다. `curl` 반복은 "엔드포인트가 느린가"에만 답하고 "페이지가 느린가"에는 답하지 않는다
  2. 여러 작업을 순서대로 할 때는 **앞 작업이 뒤 작업의 전제를 무너뜨렸는지** 매번 재측정한다. 처음 세운 계획의 근거는 1번 작업이 끝나는 순간 낡는다
  3. 응답을 묶기 전에 **캐시 가능성이 같은지** 본다. 공개·장수명 응답과 사용자별 응답을 한 엔드포인트로 합치면 전자의 캐시가 죽는다
  4. #86의 "타이밍 상수를 실측 없이 추정으로 확정"과 같은 실수다. 추정치를 사용자에게 숫자로 제시할 때는 **어떻게 쟀는지**를 같이 적어야 스스로도 검증 조건을 의심하게 된다

## 디버깅 프로세스

### 증상이 비슷한 별개 버그 2개를 하나로 착각 + 원격 왕복 디버깅 낭비 (2026-07-09~14, #60)
- **문제**: "iOS 하단 흰 공간"이라는 증상에 실제로는 원인이 다른 버그 2개가 겹쳐 있었음. ① #58: Ezoic/CMP가 body에 flow 요소 삽입 → body-height 하이잭 구조에서 앱이 밀려 대형 흰 공간 (Ezoic 원인 맞음). ② iOS 26 웹앱 셸이 `apple-mobile-web-app-status-bar-style: black-translucent`를 legacy 취급 → 뷰포트를 (화면-상태바)로 잘라 하단 62pt 죽은 영역 (Ezoic 무관, 신규 설치 웹클립에서만 발생). ①을 고친 뒤 ②가 계속 보이자 "수정 실패"로 오판, 같은 가설(뷰포트 계산)만 3차례 변주하며 사용자 아이폰 스샷 왕복으로 며칠 소모
- **왜 갇혔나**:
  1. 증상 동일 = 원인 동일이라는 무의식적 가정. A/B 격리(스크립트만 끄기)를 3번째 실패 후에야 실행 — 첫 실패 직후 했어야 함
  2. 사용자 기기 스샷 왕복은 1회당 반나절 — iOS 시뮬레이터 재현(xcrun simctl + 웹클립 파일 직접 설치 + 픽셀 프로파일링)으로 전환하자 30분 만에 원인 확정. 재현 환경 로컬화가 가설 3개 소비보다 싸다
  3. 장기 세션(여러 날)에서 로컬 git ref가 낡아 "다른 세션이 7/4에 스크립트를 뺐다"는 결정적 사실을 놓친 채 서빙/빌드 diff를 헤맴 — 진단 시작 전 `git fetch` 필수
- **교훈**:
  1. 수정이 "안 먹었"으면 가설 변주 전에 **변수 격리(A/B)부터** — 원인이라 믿는 것만 끄고 나머지 동일하게
  2. 원격 기기 왕복 2회 실패 시 **로컬 재현 환경 구축으로 전환** (iOS: 시뮬레이터 + `~/Library/Developer/CoreSimulator/Devices/<UDID>/data/Library/WebClips/`에 웹클립 심기 + `simctl launch booted com.apple.webapp` + 스크린샷 픽셀 프로파일)
  3. 진단성 결론(서빙이 이상하다, 빌드가 다르다) 내리기 전 `git fetch --all` — 세션이 날짜를 넘겼으면 무조건
  4. 뷰포트류 버그는 눈보다 수치 — 디버그 오버레이(scrollY/vv/dvh/shell rect/elementFromPoint/전수 페인트 스캔)를 첫 수로 심으면 왕복당 정보량이 몇 배
- **해결 (#60)**: ① fixed 쉘 + 문서 100dvh 잠금 + 스크롤 핀 (서드파티 body 삽입 면역), ② `statusBarStyle: "default"` (기존 설치본은 박제된 스타일이라 무영향, 신규/재설치부터 정상)

### 우리가 만든 에러 로그를 외부 장애로 오독 + 원인 확정 전 수정부터 적용 (2026-08-17, #77)
- **문제**: 워치독 "3/3 실패" 알림이 반복되자 cloudflared 로그의 `Unable to reach the origin service ...: EOF`를 근거로 "nginx `keepalive_timeout` 65s가 cloudflared 기본 90s보다 짧아 idle 커넥션 재사용 시 EOF"라고 단정. 그럴듯한 인과(저빈도 요청인 워치독 프로브만 만료 직전 커넥션에 걸린다)까지 만들어 붙이고 실서버 nginx를 reload까지 했다. **전부 오진.** EOF의 정체는 우리가 직접 써 둔 봇 차단 룰 `return 444`였다 — 444는 응답 없이 커넥션을 닫으므로 cloudflared 입장에선 EOF로 보인다. 누적 11,276건 EOF는 의도대로 Tencent/Sogou 봇을 막은 흔적이지 장애가 아니었다
- **왜 갇혔나**:
  1. **로그를 잘라서 봤다.** `cut -c1-160`으로 tail한 탓에 라인 뒤쪽의 `dest=` 필드가 안 보였다. 전체 라인을 한 번만 봤으면 `dest=.../item/hermitcrab-relocation-kit`(일반 페이지, 워치독 프로브 아님)이 즉시 드러나 가설이 그 자리에서 죽었다
  2. **에러 메시지의 일반론으로 점프**했다. keepalive 미스매치는 실제로 흔한 원인이라 검색 지식과 맞아떨어졌고, 그래서 "우리 설정 중 EOF를 만들 수 있는 게 있나"를 되묻지 않았다. `return 444`는 같은 파일 안에, 내가 방금 편집한 곳 20줄 위에 있었다
  3. **실패한 요청을 특정하지 않고 수정부터 했다.** "실패한 프로브가 origin 로그에 남았는가"는 5초짜리 확인인데 reload 뒤에 했다. 확인해보니 health 대상 EOF는 0건이고 실패 프로브는 nginx access.log에 아예 없었다 — 요청이 origin에 닿기 전에 사라진다는, 완전히 다른 층위의 문제였다
- **교훈**:
  1. 에러 로그로 원인을 지목하기 전에 **실패한 개별 요청을 특정**할 것. "무엇이 실패했는가(dest/path/UA/IP)"가 "왜 실패했는가"보다 먼저다
  2. 로그는 **자르지 말고 전체 라인**을 먼저 볼 것. `cut`/`head -c`는 필드가 뒤에 있는 구조화 로그(cloudflared, JSON 로그)에서 결정적 단서를 지운다
  3. 외부 컴포넌트가 뱉은 에러라도 **우리 설정이 만든 결과일 수 있다.** `return 444`, `deny`, rate limit처럼 의도적으로 커넥션을 끊는 룰이 있으면 프록시 로그엔 장애처럼 찍힌다. 자기 conf부터 훑을 것
  4. 원인 미확정 상태에서 프로덕션 설정을 바꾸지 말 것. 이번엔 무해했지만(keepalive 역전은 어차피 바로잡을 값이었다) 오진 위에 쌓은 수정은 나중에 진짜 원인을 가린다
- **진짜 원인 (미해결, 관찰 중)**: 실패 프로브는 Worker → CF edge → 터널 앞단에서 사라진다. origin·cloudflared 어느 로그에도 흔적이 없고, cloudflared 메트릭의 `quic_client_lost_packets{reason="timeout"}`가 꾸준히 쌓인다(가정용 업링크의 QUIC 패킷 유실 추정). 대응은 워치독 `TRY_TIMEOUT_MS` 5s → 10s 완화. 그래도 오탐이 남으면 TRIES를 5회로 늘리고 4회 실패 기준으로 조정

### 이슈 본문의 "누락 목록"을 그대로 믿고 작업할 뻔함 (2026-08-18, #59)
- **문제**: 이슈 #59는 ko 로케일에 `cookiecuttershell`, `fishingnet` 두 개가 빠졌다고 적혀 있었다. 그대로 넣었으면 `cookiecuttershell`은 **이미 들어있어 중복**이 되고, 정작 빠져 있던 `spear_wathgrithr_lightning`(materials 섹션)은 계속 누락된 채였다. 이슈가 쓰인 시점(2026-07)과 작업 시점 사이에 다른 작업이 일부를 이미 채운 것
- **왜**: 로케일 파일은 `items` / `materials` 두 섹션에 같은 id가 따로 들어가서, 단순 `grep <id> ko.ts`로는 "있다"만 보이고 **어느 섹션에 없는지**가 안 보인다
- **교훈**:
  1. 데이터 누락 이슈는 착수 전 **전 로케일 key diff로 실측**할 것. 이슈 본문은 그 시점의 스냅샷일 뿐
  2. 실측 방법: 각 로케일을 섹션별 key set으로 파싱 → "다른 로케일 5개 이상에 있는데 ko에 없는 key" 를 뽑는다. 이번엔 이걸로 정확히 2건(`items.fishingnet`, `materials.spear_wathgrithr_lightning`)이 나왔다
  3. 섹션이 나뉜 데이터 파일은 grep 결과를 **섹션 단위로** 해석할 것

## Hydration / SSR

### 플리커를 없애려 useState lazy initializer에서 URL을 읽어 hydration mismatch 유발 (2026-08-18, #76)
- **문제**: 딥링크(`/?cat=tools`, `/?tab=cooking&cat=all&recipe=...` 등)로 들어오면 콘솔에 "Hydration failed because the server rendered HTML didn't match the client"가 뜨고, React가 앱 트리 전체를 클라이언트에서 재생성. crafting / cooking / bosses / skins 4곳에서 재현
- **원인**: 이전에 "딥링크 진입 시 카테고리 그리드가 잠깐 보였다가 상세로 바뀌는 플리커"를 고치려고, SSR 기본값 + mount `useEffect` 동기화 패턴을 `useState(() => typeof window === "undefined" ? DEFAULT : readUrlState())` lazy initializer로 바꿨음. 정적 export된 서버 HTML은 항상 홈(카테고리 그리드)인데 첫 클라이언트 렌더는 상세 뷰가 되므로 구조적으로 어긋남. **한 문제(플리커)를 고치면서 다른 문제(mismatch)를 만든 전형적 트레이드오프**
- **해결**: 첫 렌더는 서버와 동일한 기본값으로 두고, **layout effect**(`useLayoutEffect`, 서버에선 `useEffect`)에서 URL을 읽어 setState. layout effect는 DOM 커밋 후 브라우저가 그리기 **전에** 동기 실행되므로 두 번째 렌더까지 같은 프레임에 끝난다 → mismatch도 없고 플리커도 없음. 공통 훅 `useUrlStateSync`로 추출 (`src/hooks/use-url-state.ts`)
- **교훈 1**: "hydration 일치"와 "플리커 없음"은 배타적이지 않다. `useEffect`(페인트 후) vs lazy init(페인트 전이지만 서버와 불일치) 두 선택지만 놓고 고민하면 갇힌다. **`useLayoutEffect`가 정확히 그 사이 칸**
- **교훈 2**: 커스텀 훅이 `useState`의 setter를 그대로 되돌려주면 **React Compiler가 그것을 안정된 setter로 인식하지 못한다**. 훅이 `[state, setState]`를 반환하는 순간 기존 `useCallback(..., [])`들이 전부 "inferred dependency `setUrlState` not present in source" 에러로 깨졌다. state는 호출부에 `useState`로 두고 **동기화 로직만** 훅으로 빼는 구조가 안전
- **교훈 3**: 렌더 중 ref에 쓰기(`readRef.current = read`) 금지 — `react-hooks/refs` 에러. 마운트 시점 값만 필요하면 `useRef(read)` 초기값으로 고정
- **검증 방법**: headless Playwright로 딥링크 진입 시 `pageerror` 수집 + rAF 프레임마다 DOM 텍스트 시그니처를 찍어 "홈 → 상세" 전환 시각을 기록. main 브랜치 dev 서버를 다른 포트에 같이 띄워 **수정 전후 전환 시각 분포를 비교**하면 플리커 재발 여부를 눈이 아니라 수치로 판정할 수 있다
- **주의**: 같은 탭에서 재진입할 때 나오는 "A tree hydrated but some attributes ... didn't match" 경고는 **이 건과 무관한 별개 이슈** — `<head>`의 Ezoic/CMP 스크립트 순서가 어긋나는 문제로, 쿼리 없는 `/` 재진입에서도 동일하게 재현된다. 증상이 비슷하다고 한 원인으로 묶지 말 것

### React 19의 async 스크립트 hoisting이 CMP↔광고 순서를 뒤집음 (2026-08-18, #79)
- **문제 (원래 신고)**: 같은 탭에서 재진입하면 "A tree hydrated but some attributes ... didn't match" 경고. **진짜 문제는 따로 있었다** — React 19는 `<script async src>`를 hoistable resource로 보고 `<head>` 최상단으로 끌어올린다. 그래서 광고 본체 `sa.min.js`가 CMP 동의 스크립트와 `ezstandalone.cmd` 큐 부트스트랩보다 **먼저** 나갔다 (프로덕션 HTML에서 @2.1KB vs @20.8KB). #75 주석이 명시한 의도와 정반대. hydration 경고는 그렇게 흐트러진 head에 Ezoic이 자기 스크립트를 끼워넣을 때만 산발적으로 뜨는 **증상**이었다
- **교훈 1**: 사용자가 신고한 증상(경고)만 쫓지 말고 **서버가 실제로 내보낸 HTML의 순서를 직접 찍어볼 것**. `curl | grep '<script'` + 바이트 오프셋 한 번이면 hoisting이 드러났다. JSX 소스의 순서 = 출력 순서라고 가정하면 안 된다 — React 19 Float(`async` script, `link rel=preload`, `stylesheet`)는 위치를 바꾼다
- **교훈 2 (자책 포인트)**: 1차 수정으로 인라인 부트스트랩을 head **중간**에 두자 경고가 산발 → **8/8 확정 발생**으로 악화됐다. 파싱 중 `document.head.appendChild`는 아직 파싱되지 않은 뒤쪽 head 요소들보다 앞에 노드를 꽂으므로, React가 위치로 매칭하는 자식들이 통째로 밀린다. **동적 삽입은 `</head>` 직전(=React가 렌더한 자식들 뒤)에서 해야 한다.** main에서 Ezoic이 hydration 후 append할 땐 경고가 없던 것이 바로 이 힌트였는데 처음에 못 읽었다
- **교훈 3**: 수정 전후를 **같은 하네스로 N회** 돌려 비율로 판정할 것. 이 경고는 Ezoic의 주입 여부에 따라 산발적이라 1~3회 로드로는 "고쳐졌다"는 착시가 쉽게 난다. 8회 반복으로 baseline 0/8 vs 1차 수정 8/8이 드러나 악화를 즉시 잡았다
- **교훈 4**: `<link rel="preload">`를 JSX로 쓰면 React가 hoist한 사본과 원본이 **둘 다** HTML에 나가 중복된다(`<body>`로 옮겨도 동일). 중복 없이 하나만 심으려면 `ReactDOM.preload(href, { as: "script" })`를 쓴다
- **교훈 5 (하마터면 놓칠 뻔)**: 부트스트랩을 head 끝으로 옮기면 파서가 URL을 늦게 발견한다. **로컬 dev에선 차이가 안 보였다**(head가 작고 네트워크가 0ms) — 실측 결과 dev는 preload 유무가 동일해서 "이득 없음"으로 판단하고 뺐는데, beta 배포 후 재보니 광고 요청 시작이 prod 중앙값 274ms → 487ms로 **200ms 밀려 있었다**. 27KB짜리 head를 네트워크로 받는 실환경에서만 드러나는 차이다. **네트워크·문서 크기에 좌우되는 최적화는 localhost 수치로 판단하지 말 것** — beta에 올려 prod와 나란히 재야 한다
- **해결 (#79)**: JSX에서 `async` 스크립트를 전부 제거(=hoist될 대상 없음)하고, `</head>` 직전 인라인 `adBootstrapScript` 하나가 `document.createElement` + `s.async = false`로 CMP → CMP → `sa.min.js` → analytics 순서대로 삽입. `async=false`가 **삽입 순서 = 실행 순서**를 보장하고, 동적 삽입이라 파서도 막지 않는다
  `ReactDOM.preload()`로 head 앞쪽에 preload를 심어 늦어진 발견 시점을 되돌린다.
- **검증**: 재진입 8회 경고 0/8, 딥링크 4종 0건, 실행 순서 CMP→광고→분석 확인, 요청 시작 시각 main과 동일(90~113ms), 중복 fetch 없음, `check-ad-slots`·`check-ad-slots-stress` problems 없음. (`check-ad-cls`의 "SEO 아이템/목록 상단 띠 없음" 3건은 main에서도 동일하게 실패하는 기존 이슈)
