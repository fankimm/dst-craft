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

### DXT5 디코딩
- Pillow 내장: `Image.frybytes('RGBA', (w,h), data, 'bcn', (3,))`
- pixel_format 0=DXT1(bcn 1), 1=DXT3(bcn 2), 2=DXT5(bcn 3)
