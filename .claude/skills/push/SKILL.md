---
name: push
description: 타겟 브랜치를 origin으로 push (배포 X). 인자 없으면 현재 워크트리 브랜치를 commit+push. 인자(브랜치명/이슈번호/이슈URL/자연어)로 다른 브랜치 지정 가능. beta 배포는 /beta, production 배포는 /release.
---

# /push — 브랜치를 origin으로 push (배포 X)

타겟 브랜치를 GitHub origin에 push한다. **배포 동작 없음** — beta 배포는 `/beta`, production은 `/release`.

## 인자 처리 — 타겟 결정

인자 형식 (공통: `/beta`도 동일하게 적용):
- **인자 없음**: 현재 워크트리 브랜치(`git rev-parse --abbrev-ref HEAD`)를 타겟으로 사용
- **`feat/...` 등 브랜치명**: 그대로 타겟
- **숫자만** (예: `42`): `feat/42-*` 패턴으로 로컬 브랜치 검색 → 매칭되는 1개를 타겟
- **이슈 URL** (`https://github.com/.../issues/<num>`): `<num>` 추출 후 위와 동일
- **자연어** (예: `보스 분류`): `gh issue list --state all --json number,title,state` → 제목 fuzzy 매칭으로 후보 제시. 1개면 자동, 2+개는 사용자에게 1줄 확인

타겟 결정 후 `TARGET_BRANCH` 변수로 부른다. 결정에 실패하거나 모호하면 중단하고 사용자에게 묻기.

## 동작 분기

### A. TARGET_BRANCH = 현재 워크트리 브랜치 (인자 없거나 같은 브랜치 지정)
**commit + push**:
1. 상태 점검 (`git status`, `git diff`, `git log -5 --oneline`)
2. 변경사항이 있으면 commit 초안 작성 → 같은 워크트리에 commit
3. `git push origin <TARGET_BRANCH>`

`docs/mistakes.md` 작성 필요 여부도 같이 체크 (실수/교훈 있으면 같은 커밋에 포함).

### B. TARGET_BRANCH = 다른 브랜치 (현재 워크트리와 다름)
**commit 없이 push만**:
1. 그 브랜치가 로컬에 존재하는지 확인 (`git rev-parse --verify <TARGET_BRANCH>`)
2. 그 브랜치가 체크아웃된 워크트리 경로 찾기 (`git worktree list --porcelain`)
3. `git -C <워크트리경로> push origin <TARGET_BRANCH>` (워크트리 dirty면 사용자에게 보고 후 중단)

> 다른 브랜치에 commit까지 떠넘기지 않는 이유: 의도와 어긋나는 변경 혼입 위험. commit하려면 그 브랜치 워크트리로 옮겨가서 직접 작업 후 `/push`.

## 실행 절차

### 0. cwd 처리 규칙
이 환경의 Bash tool은 매 호출마다 cwd가 메인 워킹 디렉터리로 리셋된다. **모든 git 명령은 `git -C <워크트리경로>` 형태로 호출**하거나 `cd <워크트리경로> &&` 프리픽스를 매번 붙일 것. Read/Edit/Write는 절대경로라 영향 없음.

### 1. 타겟 결정
인자 파싱 → `TARGET_BRANCH` + 그 브랜치가 체크아웃된 워크트리 경로 `TARGET_WT`.

```bash
# 현재 브랜치라면
TARGET_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TARGET_WT="."  # 현재 디렉터리

# 다른 브랜치라면
TARGET_WT=$(git worktree list --porcelain \
  | awk -v b="refs/heads/$TARGET_BRANCH" '/^worktree/{p=$2} $0=="branch "b{print p}')
# TARGET_WT가 비어있으면 그 브랜치는 어떤 워크트리에도 체크아웃되지 않음 → push만 가능
```

### 2. 상태 점검
- `git -C "$TARGET_WT" status`
- `git -C "$TARGET_WT" diff` (스테이지 + 언스테이지)
- `git -C "$TARGET_WT" log -5 --oneline` (커밋 스타일 참고)

### 3. 시나리오 분기 실행

**시나리오 A (현재 브랜치, dirty)**:
- 변경 분류: user-facing 여부 + commit 메시지 type/scope 결정
- 오답노트: 실수/교훈 있으면 `docs/mistakes.md` 먼저 추가 (같은 커밋에 포함)
- commit:
  ```bash
  git add <files>  # 명시적 파일 추가, -A/. 금지
  git commit -m "$(cat <<'EOF'
  <type>(<scope>): <한 줄 요약>

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```
- push: `git push origin <TARGET_BRANCH>`

**시나리오 A (현재 브랜치, clean)**: 그냥 push만.
```bash
git push origin <TARGET_BRANCH>
```
push할 미푸시 커밋도 없으면 즉시 중단 ("nothing to push").

**시나리오 B (다른 브랜치)**:
- TARGET_WT가 dirty면 보고 후 중단 (그 워크트리에서 직접 push 또는 commit 권유)
- 미푸시 커밋이 없으면 중단
- `git -C "$TARGET_WT" push origin <TARGET_BRANCH>`

### 4. 마무리
- `git -C "$TARGET_WT" log -1 --oneline` 결과 확인
- 사용자에게 결과 보고: 푸시된 브랜치, 푸시 커밋 수

## 규칙
- **배포 동작 없음** — beta 배포는 `/beta`, production은 `/release`
- **`main`에 직접 push 금지** — 사용자가 명시해도 `/release` 권장
- **`git add -A` / `git add .` 금지** — 변경된 파일을 명시적으로 add (CLAUDE.md 안전 규칙)
- **다른 브랜치에 commit 강요 금지** — 시나리오 B에서는 push만
- 릴리즈노트/버전 bump는 `/release`에서. `/push`에서는 건드리지 않음
- `--no-verify`, `--force` 등 위험 옵션 사용 금지
- 사용자에게 묻지 않고 위 절차를 끝까지 진행 (이미 push 권한 위임). 단, 타겟 결정이 모호하면 한 줄로만 확인.
