# Mistakes & Lessons (오답노트)

## 게임 데이터

### nounlock 67개 누락
- **문제**: 용비늘 화로 등 67개 아이템에 `nounlock: true` 누락
- **원인**: `nounlock=true` 파라미터만 체크하고 `TECH.LOST` 기술 레벨을 놓침
- **교훈**: DST에서 블루프린트 필요 아이템은 두 가지 방법으로 정의됨:
  1. `TECH.LOST` — 기술 레벨이 LOST (보스 드롭 블루프린트 등)
  2. `nounlock=true` — 레시피 옵션에 직접 명시 (양념류, 캐릭터 전용 등)
- **검증**: `grep "TECH.LOST" recipes.lua` + `grep "nounlock=true" recipes.lua` 모두 확인할 것

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

### DXT5 디코딩
- Pillow 내장: `Image.frybytes('RGBA', (w,h), data, 'bcn', (3,))`
- pixel_format 0=DXT1(bcn 1), 1=DXT3(bcn 2), 2=DXT5(bcn 3)
