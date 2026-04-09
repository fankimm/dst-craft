# Mistakes & Lessons (오답노트)

## 게임 데이터

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
- **해결**: `CACHE_NAME` 버전 bump (v7→v8)
- **교훈**: `/images/` 경로의 파일을 교체할 때는 반드시 `sw.js`의 `CACHE_NAME` 버전을 올릴 것

### 카테고리 아이콘 스타일 불일치
- **문제**: 새 카테고리 아이콘으로 위키의 건물 이미지(풀컬러, 비정형 사이즈)를 사용 → 기존 아이콘(인게임 제작탭 아이콘, 256x256 정사각형, 모노톤 스타일)과 이질적
- **교훈**: 카테고리 아이콘은 인게임 제작탭의 Station Icon을 사용할 것. 위키에서 `{StationName}_Station_Icon.png`으로 검색 가능. 기존 아이콘과 스타일 통일이 중요

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

### DXT5 디코딩
- Pillow 내장: `Image.frybytes('RGBA', (w,h), data, 'bcn', (3,))`
- pixel_format 0=DXT1(bcn 1), 1=DXT3(bcn 2), 2=DXT5(bcn 3)
