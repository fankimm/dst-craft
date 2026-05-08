---
name: task
description: 새 작업 시작용 — 깃허브 이슈 오픈 → feat 브랜치 분기 → 워크트리 생성까지 일괄 처리. 멀티 세션 충돌 방지(메인 beta 워크트리에 다른 세션의 in-flight 변경이 섞이는 문제) 목적. 사용법 `/task <한 줄 설명>`. 코드 변경 작업의 진입점.
---

# /task — 이슈 기반 워크트리 부트스트랩

새 작업을 받으면 **반드시** 이 스킬로 시작한다. 깃허브 이슈를 만들고, 그 이슈 번호로 `feat/<num>-<slug>` 브랜치를 main에서 분기한 뒤, `../dst-craft-<num>` 워크트리를 만들어 격리된 작업 공간을 제공한다. 이후 작업은 새 세션을 그 워크트리에서 열어 진행한다.

## 왜 이렇게 하나
메인 워크트리(`/Users/jihwan-kim3/private-works/dst-craft`)는 항상 beta 브랜치라서, 같은 디렉터리에서 동시에 여러 Claude 세션이 작업하면 한 세션의 in-flight 변경이 다른 세션의 `/push`에 섞여 들어간다. 모든 코드 변경 작업을 별도 워크트리로 격리하면 이 문제가 구조적으로 사라진다.

## 적용 범위
- ✅ **모든 코드 변경 지시** — 1줄 fix든 새 기능이든 동일하게 `/task`로 시작
- ❌ 탐색/질문/설명 요청 (코드를 바꾸지 않는 작업) — 메인 세션에서 그대로 답변
- ❌ 문서만 수정하는 메타 작업 (CLAUDE.md, .claude/skills/, memory/) — 메인 beta에서 직접 가능 (CLAUDE.md 규칙)

판단 애매하면 사용자에게 한 줄로 묻는다.

## 사전 조건
- `gh auth status`로 로그인 확인. 미로그인이면 사용자에게 `! gh auth login` 안내 후 중단
- 현재 working tree가 dirty면 사용자에게 보고 후 중단 (다른 세션 in-flight 변경 가능)
- `origin/main`이 최신인지 `git fetch origin main` 실행

## 실행 절차

### 1. 인자 파싱 + 이슈 초안 작성
- `/task <설명>` 형식. 설명이 없으면 사용자에게 한 줄로 요청
- Claude가 이슈 제목/본문 초안 작성:
  - **제목**: 한국어, 50자 이내, 명령형 (예: "그림자 기물 카테고리 underground 제거")
  - **본문**:
    ```markdown
    ## 요청
    <사용자 원문 그대로>

    ## 배경 / 컨텍스트
    <Claude가 조사한 관련 파일/현재 상태 1-3줄>

    ## Acceptance Criteria
    - [ ] <구체적 완료 조건 1>
    - [ ] <조건 2>
    ```
- 사용자에게 제목+AC만 한 화면에 보여주고 OK/수정 받기

### 2. 이슈 생성
```bash
gh issue create \
  --title "<제목>" \
  --body "$(cat <<'EOF'
<본문>
EOF
)"
```
- 출력에서 이슈 번호 파싱 (`gh issue create`는 URL을 반환 — 마지막 path segment가 번호)

### 3. 브랜치명 결정
- 슬러그: 제목을 ASCII로 변환 (한글 → 영문 키워드 또는 transliterate). Claude가 짧은 영문 슬러그 만들기 (kebab-case, 4단어 이하)
- 브랜치명: `feat/<issue-num>-<slug>` (예: `feat/42-shadow-chess-fix`)

### 4. 워크트리 생성
```bash
git fetch origin main
git worktree add ../dst-craft-<issue-num> -b feat/<issue-num>-<slug> origin/main
```
- 워크트리 경로는 항상 `../dst-craft-<issue-num>` (이슈 번호 기준 — 슬러그 충돌 방지)
- main에서 분기 (CLAUDE.md 규칙)

### 5. 사용자 안내
- 이슈 URL, 워크트리 경로, 브랜치명을 한 블록으로 출력
- **새 Claude 세션을 그 워크트리에서 열라고 안내** (현재 세션에서 cd로 이동 X — 컨텍스트 혼란 방지)
- 안내 예시:
  ```
  ✅ 작업 환경 준비됨
  - 이슈: <URL>
  - 워크트리: ~/private-works/dst-craft-42
  - 브랜치: feat/42-shadow-chess-fix

  → 새 터미널에서 `cd ~/private-works/dst-craft-42` 후 Claude 세션 시작
  → 작업 완료되면 그 세션에서 /push (beta 배포) → /release (main 배포)
  ```

### 6. 메인 세션은 종료 또는 다른 작업 대기
- 현재 세션은 더 이상 그 작업에 관여하지 않음 (격리 원칙)

## /push, /release와의 연동
- `/push`는 그대로 동작 — feat 워크트리에서 commit + beta 머지/푸시
- `/release` 시 PR/머지 커밋 메시지에 `Closes #<issue-num>` 자동 포함 → main 머지 시 이슈 자동 close
  - `/release` 스킬도 이 규칙을 알아야 함 — 호출 시 현재 브랜치명에서 이슈 번호 추출(`feat/<num>-...`)해서 commit message에 `Closes #<num>` 추가

## 워크트리 정리
- `/release` 후 main 머지가 끝나면 워크트리 삭제 (release 스킬 책임)
- 수동 정리: `git worktree remove ../dst-craft-<num> && git branch -d feat/<num>-<slug>`

## 안전장치
- 같은 이슈 번호로 워크트리가 이미 있으면 (`git worktree list` 확인) 재사용 또는 사용자에게 확인
- 브랜치명 충돌 시 `-2`, `-3` 접미사로 회피 또는 사용자에게 확인
- main이 origin/main과 발산해 있으면 사용자에게 보고 후 중단

## 거부 케이스
- 코드 변경 없는 단순 질문 → `/task` 스킵, 그냥 답변
- 사용자가 "지금 이 자리에서 빨리 고쳐"라고 명시적으로 요청 → 한 번 더 확인하고 메인 워크트리에서 진행 (위험 인지)
