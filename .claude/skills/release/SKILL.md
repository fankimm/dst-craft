---
name: release
description: 특정 feat 브랜치를 main으로 머지 + main 푸시 (Production 배포). 인자 없으면 현재 워크트리 브랜치 자동 인식. 릴리즈노트/버전 bump는 이 시점에 작성.
---

# /release — feat → main 릴리즈 워크플로우

특정 `feat/X` 브랜치를 `main`에 머지하고 푸시하여 Production(`www.dstcraft.com`)에 배포한다. main에 직접 푸시하는 **유일한 허용 경로**. CLAUDE.md의 Branch & Deploy Strategy / Release Notes Rules / Mistakes Rules를 준수.

> **중요**: 이 스킬은 *"beta 전체 → main"이 아니다*. **특정 feat 한 개**만 main에 들어간다. beta에 in-flight인 다른 feat들은 production에 영향 없음.

## 인자 처리

- **인자 없음**: 현재 워크트리의 브랜치를 자동 인식해서 그 브랜치를 릴리즈 대상으로 사용
  - 단, 현재 브랜치가 `main`/`beta`이면 모호하므로 사용자에게 어떤 feat을 릴리즈할지 묻는다
- **인자 있음** (`/release feat/X`): 명시된 브랜치를 릴리즈 대상으로 사용

릴리즈 대상 브랜치를 `RELEASE_BRANCH`라 부른다.

## 사전 점검

다음을 병렬로 실행하여 상태 확인:
- `git fetch --all --prune` — 원격 최신화
- `git status` — 워킹트리 clean 확인 (dirty면 중단하고 사용자에게 알림)
- `git rev-parse --abbrev-ref HEAD` — 현재 브랜치
- `git log --oneline main..$RELEASE_BRANCH` — 릴리즈 대상이 main 대비 가진 커밋들
- `git log --oneline main..origin/main` — main이 원격 대비 뒤처져 있는지
- `git branch -a --contains $RELEASE_BRANCH` — 브랜치 존재 확인

**중단 조건**:
- 워킹트리 dirty → 사용자에게 알리고 중단 (먼저 정리)
- `RELEASE_BRANCH`가 존재하지 않음 → 중단, 사용자에게 알림
- `main..$RELEASE_BRANCH`가 비어있음 (이미 main에 머지됨, 또는 새 커밋 없음) → 중단
- `origin/main`이 로컬 `main`보다 앞서감 → 사용자에게 보고 후 결정 (보통 `git pull` 먼저)

## 0. feat 워크트리 base 자동 동기화

`/task`로 만든 feat 워크트리는 만든 시점의 `origin/main`에서 분기하므로, 그 사이 main에 다른 feat이 머지됐다면 base가 뒤처져 있다. 그대로 main에 머지하려 하면:
- `version.ts` / `releases/page.tsx`에서 충돌 (이번 release가 작성한 새 버전과 그 사이 들어간 버전이 같은 위치를 건드림)
- 릴리즈노트가 그 사이 들어간 항목 위에 정확히 붙는지 보장 X

따라서 **릴리즈노트 작성 전에 항상 `origin/main`을 feat 브랜치에 머지**한다:

```bash
# feat 워크트리 경로 (보통 ../dst-craft-<issue-num>)
FEAT_WT=$(git worktree list --porcelain | awk -v b="refs/heads/$RELEASE_BRANCH" '/^worktree/{p=$2} $0=="branch "b{print p}')

# 사전 점검에서 main..origin/main이 비어있지 않거나 origin/main..$RELEASE_BRANCH의 base가 origin/main보다 뒤처졌으면 머지
git -C "$FEAT_WT" fetch origin main
if ! git -C "$FEAT_WT" merge-base --is-ancestor origin/main HEAD; then
  git -C "$FEAT_WT" merge origin/main --no-edit
fi
```

머지 충돌 시 중단하고 사용자에게 보고. 이 단계가 끝나면 feat 브랜치는 `origin/main` 위에 깔끔히 올라가 있고, 이후 릴리즈노트 작성/버전 bump가 충돌 없이 그 위에 누적된다.

## 1. 릴리즈 범위 분석

`git log --oneline main..$RELEASE_BRANCH`와 `git diff main...$RELEASE_BRANCH`를 보고:

- **버전 bump 단계 결정** (그 feat 분량만 기준):
  - `patch` (0.0.x): 버그픽스, 소규모 수정
  - `minor` (0.x.0): 새 기능 / 새 페이지 / 의미 있는 추가
  - `major` (x.0.0): 대규모 구조 변경
- **user-facing 변경 추출**: 그 feat의 커밋들에서 사용자 노출 가능한 표현으로 재작성
- **dev 항목**: 그 feat의 모든 기술 변경

판단 애매하면 한 줄로 확인 (예: "patch 0.22.6 → 0.22.7로 갈게요").

빌드에 영향 없는 docs/메타 작업(CLAUDE.md, `.claude/skills/`, `memory/` 등)이라 사용자 노출 변경이 없으면 릴리즈노트/버전 bump를 **생략 가능** — 그 경우 그냥 main 머지만.

## 2. 릴리즈노트 + 버전 갱신 (RELEASE_BRANCH에서)

릴리즈노트 작성이 필요한 경우만:

먼저 `git checkout $RELEASE_BRANCH` (이미 그 브랜치가 아니면).

- `src/lib/version.ts`의 `APP_VERSION` 갱신
- `src/app/releases/page.tsx`의 `releases` 배열 맨 앞에 새 항목 추가:
  - `version`: 새 버전
  - `date`: 오늘 (YYYY-MM-DD)
  - `dev`: 그 feat의 모든 기술 변경 (한국어, 파일/함수 수준)
  - `changes.ko` / `changes.en`: 사용자가 이해 가능한 표현. 두 언어 모두 채울 것

`git add` + commit (메시지 예: `chore(release): v<버전> 릴리즈노트 정리`).

## 3. 빌드 검증 (필수)

릴리즈노트 변경이 있었거나 코드 변경이 있는 경우:
- `npm run build` — 빌드 성공 확인
- `npx tsc --noEmit` — 타입 에러 없음 확인

빌드 실패 시 중단하고 수정 후 재시도.

## 4. main 머지 + 푸시 (Production 배포)

브랜치명에서 이슈 번호 추출 (`feat/<num>-<slug>` 패턴이면 `<num>`). 있으면 머지 커밋 메시지에 `Closes #<num>` 포함 → main 푸시 시 GitHub가 자동으로 이슈 close.

메인 워크트리(=`main` 브랜치 유지)에서 머지·푸시:

```bash
# 이슈 번호 추출 (있는 경우)
ISSUE_NUM=$(echo "$RELEASE_BRANCH" | sed -nE 's|^feat/([0-9]+)-.*|\1|p')

# 메인 워크트리 경로 자동 탐색 (main 체크아웃된 곳)
MAIN_WT=$(git worktree list --porcelain \
  | awk '/^worktree/{p=$2} /^branch refs\/heads\/main$/{print p}')

git -C "$MAIN_WT" pull --ff-only origin main
if [ -n "$ISSUE_NUM" ]; then
  git -C "$MAIN_WT" merge --no-ff $RELEASE_BRANCH -m "Release: $RELEASE_BRANCH → main" -m "Closes #$ISSUE_NUM"
else
  git -C "$MAIN_WT" merge --no-ff $RELEASE_BRANCH -m "Release: $RELEASE_BRANCH → main"
fi
git -C "$MAIN_WT" push origin main
```

머지 충돌 시 중단하고 사용자에게 보고. 임의 해결 금지.

> 머지 커밋 메시지에 버전이 있다면 포함 (예: `Release v0.22.7: feat/42-buddy-w-radio → main`).

## 5. beta에도 반영 (보통은 자동)

`RELEASE_BRANCH`가 이미 beta에 머지되어 있으면 (정상 워크플로우에서는 `/beta`를 거쳤으므로 항상 그러함) beta는 그 feat 커밋을 이미 포함. 별도 작업 불필요.

beta에 그 feat이 머지 안 돼 있으면 — `/beta`를 건너뛴 케이스 — `../dst-craft-beta` 워크트리에서 `feat → beta`로만 머지:
```bash
BETA_WT="../dst-craft-beta"
# 없으면 생성
if ! git worktree list --porcelain | grep -q "^worktree .*dst-craft-beta$"; then
  git fetch origin beta
  git worktree add "$BETA_WT" beta
fi
git -C "$BETA_WT" merge --no-ff $RELEASE_BRANCH -m "merge $RELEASE_BRANCH into beta (post-release)"
git -C "$BETA_WT" push origin beta
```

> ⚠️ **`main ← beta` 방향 머지 절대 금지**. `git merge beta`, `git merge --ff-only beta` 등 beta를 main으로 흘리는 모든 명령은 사용 금지. beta는 in-flight 합집합 검증용이라 다른 feat의 미검증 커밋이 같이 따라 들어간다. main 동기화는 항상 `feat → main` 방향(이 스킬의 4단계)으로만.

## 6. 워크트리 + 브랜치 정리

릴리즈된 feat 브랜치는 정리. `/task`로 만든 워크트리는 `../dst-craft-<issue-num>` 패턴이므로 이슈 번호로 찾음.

```bash
# 워크트리 자동 탐색 (이슈 번호 기반)
if [ -n "$ISSUE_NUM" ]; then
  WT_PATH="../dst-craft-$ISSUE_NUM"
  if git worktree list | grep -q "$WT_PATH"; then
    git worktree remove "$WT_PATH"
  fi
fi
# 또는 일반: git worktree list 출력에서 $RELEASE_BRANCH가 체크아웃된 경로 찾아서 remove

# 브랜치 삭제 (로컬만)
git branch -d $RELEASE_BRANCH
```

> **원격 feat 브랜치는 유지가 디폴트.** 머지 커밋이 main에 `Release: <branch> → main`으로 박혀있어 히스토리는 보장되고, 회귀 발견 시 `git diff origin/<branch>~..origin/<branch>` 같은 시점별 비교가 직관적. 브랜치는 commit hash 하나라 저장 비용 ~0. 사용자가 **명시적으로** 삭제 요청한 경우에만 `git push origin --delete $RELEASE_BRANCH` 실행.

## 7. 마무리

- 메인 워크트리는 `main` 그대로 유지 (CLAUDE.md 규칙). 임의로 brancht 변경 X
- `git -C "$MAIN_WT" log -1 --oneline` + `git -C "$BETA_WT" log -1 --oneline` — 푸시 결과 확인
- 사용자에게 결과 보고: 릴리즈된 feat, 머지된 커밋 수, 새 버전(있으면), www.dstcraft.com 배포 트리거 여부

## 규칙
- **main 푸시는 /release를 통해서만** — 다른 경로로 main에 직접 푸시 금지
- 머지 전략은 `--no-ff` (머지 커밋 명시적으로 남김 — 릴리즈 경계 추적용)
- 메인 워크트리는 `main` 유지 — 임의로 다른 브랜치로 옮기지 말 것
- `--no-verify`, `--force` 사용 금지
- 사용자가 명시적으로 "특정 커밋만 cherry-pick" 같은 변형을 요청하면 그에 따름. 기본은 `--no-ff` merge.
- **여러 feat을 한 번에 main에 넣으려면**: 각각 `/release feat/A`, `/release feat/B` 순서로 호출. 자동으로 합쳐주지 않음 (의도적).
