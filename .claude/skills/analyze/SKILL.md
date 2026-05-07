---
name: analyze
description: 인게임/외부 코드 로직 분석 전문 에이전트. 함수 호출 그래프 추적, TUNING 값 매핑, 스태킹/오버라이드 메커니즘 파악, 트리거-실효 분리 분석. 분석 중 발견한 패턴은 learnings.md에 자동 누적되어 모든 머신에서 공유됨.
---

# /analyze — 코드 로직 분석 에이전트

코드의 실제 동작을 정확히 파악하기 위해 호출 그래프를 추적하고, 노하우를 누적하는 에이전트.

## 사용 예시

- `/analyze 알파1 찍었을 때 연산 회로 효과만`
- `/analyze 빈부스터 모듈이 어떤 스킬과 연결돼?`
- `/analyze 방어 회로의 gammabuffs_2 효과 뭐야?`
- `/analyze TASER_BUILDUP_GAIN_RATE이 어떻게 사용되는지`

## 역할

질문에 답하기 위해 코드를 따라가며:
1. 진입점 → 호출 그래프 → 최종 effect까지 추적
2. 추상화/간접 호출 뒤에 숨은 실제 동작 파악
3. 결과를 코드 인용 + 한국어 설명으로 정리
4. **새로운 패턴/노하우 발견 시 `learnings.md`에 자동 추가**

## 분석 절차

### 1. 진입점 식별
질문에서 추출:
- 스킬 ID (`wx78_circuitry_alphabuffs_1`)
- 함수명 (`maxsanity_skill_activate`)
- 상수명 (`TASER_BUILDUP_GAIN_RATE`)
- 회로/아이템 이름 (한글 → ko.po에서 영문 매핑)

### 2. 호출 그래프 추적
- `grep -n` 으로 정의/호출처 모두 찾기
- 콜백 등록 패턴 (`Circuit_SetUpSkillCb`, `ListenForEvent`, `AddInherentAction`) 식별
- 등록만 하는 함수와 실제 effect를 주는 함수를 구분
- TUNING 상수는 `tuning.lua`에서 값 확인

### 3. 메커니즘 분류
각 effect에 대해 다음을 식별:
- **트리거**: 언제 발동? (스킬 활성, 이벤트, 조건문)
- **실효 효과**: 실제로 무엇이 변하는지 (수치, 상태)
- **누적 방식**: 합연산 / 곱연산 / 오버라이드 / 1회성

### 4. 출력
질문에 직접 답하되, 다음을 포함:
- 코드 인용 (블록 형식)
- 호출 흐름 다이어그램 (텍스트 트리)
- 핵심 결론 1-2줄

### 5. **learnings.md 자동 갱신** (필수)
분석 중 다음 중 하나라도 있으면 `learnings.md`에 추가:
- **트리거-실효 분리** 패턴 (예: "알파1은 함수 등록만, 알파2가 실제 발동")
- **누적 메커니즘 함정** (예: "SetModifier는 같은 inst로 호출 시 덮어씀")
- **이름과 다른 동작** (예: "발열 회로는 화염이 아니라 빙결 저항")
- **출처 간 모순** (예: "나무위키 발열↔냉각 정보 반대")
- **API/관용구** (예: "DST에서 회로↔스킬 연결은 `Circuit_SetUpSkillCb`")

추가 형식:
```markdown
## YYYY-MM-DD - <짧은 제목>
**맥락**: 어떤 분석에서 발견했는지
**패턴**: 일반화된 교훈 (다른 분석에도 적용 가능하게)
**예시**: 구체적 코드/사례
```

기존에 비슷한 패턴이 있으면 새로 추가하지 말고 기존 항목을 보강.

## 중요한 원칙

- **추측 금지**: 함수명에서 동작을 추측하지 말 것. 반드시 본문 읽기
- **복수 출처 교차**: 코드 vs 위키 정보가 다르면 코드 우선
- **체감 단위**: 사용자에게 답할 때는 코드 단위가 아니라 인게임 체감 단위
- **분석 후 learnings.md 갱신은 필수**: 노하우 누적이 이 에이전트의 핵심 가치

## 머신 간 동기화

이 스킬과 `learnings.md`는 git에 커밋되어 있으므로:
- 다른 머신에서 `git pull` → 즉시 사용 가능
- 새 노하우 추가 시 git에 push해야 다른 머신에 반영됨
- 분석 작업 후 변경된 `learnings.md`도 함께 commit/push 권장

## 참고 경로

- 인게임 소스: `/tmp/dst-extract/scripts/` (없으면 `unzip`으로 추출, CLAUDE.md의 Game & Mod Paths 참고)
- TUNING 값: `/tmp/dst-extract/scripts/tuning.lua`
- 회로 모듈: `/tmp/dst-extract/scripts/wx78_moduledefs.lua`
- 한국어 이름: ko.po (`STRINGS.NAMES.*`)
- 누적 노하우: `.claude/skills/analyze/learnings.md`
