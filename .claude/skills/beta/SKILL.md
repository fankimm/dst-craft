---
name: beta
description: 타겟 브랜치를 (필요 시 commit 후) beta 브랜치에 머지/푸시해서 beta.dstcraft.com에 배포. 인자 없으면 현재 워크트리 브랜치. 인자(브랜치명/이슈번호/이슈URL/자연어)로 다른 feat 지정 가능. 별도 ../dst-craft-beta 워크트리에서 머지. 서브커맨드 `clear`로 origin/beta를 main 기준으로 리셋. Production 배포는 /release.
---

# /beta — commit + beta 배포 (또는 beta 리셋)

타겟 브랜치를 `beta`에 머지/푸시해서 `beta.dstcraft.com`에 자동 배포한다. 타겟이 현재 워크트리 브랜치고 변경사항이 dirty면 먼저 commit + origin push까지 같이 처리한다.

CLAUDE.md의 Branch & Deploy Strategy를 준수.

## 호출 형태

```
/beta             # 현재 워크트리 브랜치를 타겟. dirty면 commit→push→merge→push 한 번에
/beta <타겟>      # 명시 타겟. 인자 형식은 아래 참고
/beta clear       # origin/beta 리셋(파괴적): origin/beta 삭제 후 origin/main 기준으로 재생성
```

## 인자 처리 — 타겟 결정

- **인자 없음**: 현재 워크트리 브랜치(`git rev-parse --abbrev-ref HEAD`)를 타겟. 그 브랜치가 `main`/`beta`면 거부.
- **`feat/...` 브랜치명**: 그대로 타겟
- **숫자만** (예: `42`): `feat/42-*` 패턴으로 로컬 브랜치 검색 → 정확히 1개면 자동, 0개/2개 이상이면 사용자에게 확인
- **이슈 URL** (`https://github.com/.../issues/<num>`): 번호 추출 후 위와 동일
- **자연어** (예: `보스 분류`): `gh issue list --state all --json number,title,state` 후 제목 fuzzy 매칭으로 후보 제시. 1개면 자동, 다수면 사용자에게 1줄 확인. 컨텍스트(최근 대화에서 언급된 이슈/브랜치)도 후보에 포함

타겟 결정 결과를 `TARGET_BRANCH`로 부른다. 형태는 `feat/X` — `main`/`beta` 자체는 거부.

결정에 실패하거나 모호하면 중단하고 사용자에게 묻기.

## 0. cwd 처리 규칙

이 환경의 Bash tool은 매 호출마다 cwd가 메인 워킹 디렉터리로 리셋된다. **모든 git 명령은 `git -C <워크트리경로>`** 또는 `cd <경로> &&` 프리픽스. Read/Edit/Write는 절대경로라 영향 없음.

## 사전 점검 (공통)

병렬 실행:
- `git fetch --all --prune`
- `git rev-parse --verify <TARGET_BRANCH>` (브랜치 존재 확인 — `clear` 모드는 스킵)
- `git worktree list --porcelain` (타겟 워크트리 + dst-craft-beta 워크트리 위치 파악)

**중단 조건**:
- TARGET_BRANCH가 존재하지 않음 (clear 모드 제외)
- TARGET_BRANCH가 체크아웃된 워크트리가 dirty + 타겟이 현재 워크트리가 아님 (다른 워크트리에 commit 강요 금지)

## 1. Commit (현재 워크트리 + dirty인 경우만)

타겟이 현재 워크트리 브랜치이고 변경사항이 있으면:

1. 상태 점검: `git status`, `git diff`, `git log -5 --oneline`
2. 변경 분류:
   - user-facing 여부 (사용자가 화면에서 인지하는가?)
   - commit type/scope 결정 (`feat`, `fix`, `chore`, `docs`, `refactor` 등)
   - 오답노트 필요 여부 — 실수/교훈 있으면 `docs/mistakes.md` 먼저 추가(같은 커밋 포함)
3. Commit:
   ```bash
   git add <files>   # 명시적 파일 추가, -A / . 금지
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <한 줄 요약>

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
4. 미푸시 커밋 origin push: `git push origin "$TARGET_BRANCH"`

타겟이 다른 워크트리거나 clean이면 이 단계 스킵.

## 2. 타겟 브랜치 origin push 보장

```bash
TARGET_WT=$(git worktree list --porcelain \
  | awk -v b="refs/heads/$TARGET_BRANCH" '/^worktree/{p=$2} $0=="branch "b{print p}')

# 미푸시 커밋이 있으면 push (1단계에서 이미 했더라도 idempotent)
git -C "$TARGET_WT" push origin "$TARGET_BRANCH"
```

워크트리에 체크아웃되지 않은 브랜치라면 `git push origin "$TARGET_BRANCH":refs/heads/$TARGET_BRANCH`로 push (드문 케이스).

## 3. Beta 워크트리 보장

`../dst-craft-beta` 워크트리가 있는지 확인. 없으면 자동 생성:

```bash
BETA_WT="../dst-craft-beta"
if ! git worktree list --porcelain | grep -q "^worktree .*$(basename $BETA_WT)$"; then
  git fetch origin beta
  git worktree add "$BETA_WT" beta
fi
```

beta 브랜치 자체가 origin에 없으면: `git worktree add -b beta "$BETA_WT" main` 후 origin push.

## 4. Beta 워크트리에서 머지 + push

```bash
git -C "$BETA_WT" fetch origin
git -C "$BETA_WT" pull --ff-only origin beta
git -C "$BETA_WT" merge "$TARGET_BRANCH" -m "merge $TARGET_BRANCH into beta for staging"
git -C "$BETA_WT" push origin beta
```

머지 충돌 시 중단하고 사용자에게 보고. 임의 해결 금지.

## 5. 마무리

- `git -C "$BETA_WT" log -1 --oneline` (beta 최신 커밋 확인)
- 사용자에게 결과 보고: 어떤 feat이 beta에 들어갔는지, beta.dstcraft.com 배포 트리거됨

## 서브커맨드: `/beta clear`

origin/beta를 origin/main 기준으로 리셋한다. beta는 staging 배포 전용이라 누적된 머지 커밋이나 통과 못한 in-flight feat을 한꺼번에 청산하는 **일상 작업**. 오염됐다 싶을 때 부담 없이 호출.

> beta에는 main에 들어갈 가치 있는 변경이 없다는 게 전제. main에 이미 들어간 feat은 다시 /beta로 올리면 되고, 검증 못한 feat은 어차피 main에 안 들어갈 거였으니 폐기해도 됨.

### 절차

1. **dst-craft-beta 워크트리 처리**: beta가 체크아웃돼있으면 워크트리 제거. 워크트리가 dirty면 보호 차원에서 중단하고 사용자에게 보고.
   ```bash
   BETA_WT="../dst-craft-beta"
   if git worktree list --porcelain | grep -q "^worktree .*$(basename $BETA_WT)$"; then
     if [ -n "$(git -C "$BETA_WT" status --porcelain)" ]; then
       echo "dst-craft-beta가 dirty — 정리 후 재시도"; exit 1
     fi
     git worktree remove "$BETA_WT"
   fi
   ```

2. **로컬 beta 삭제 + 재생성**:
   ```bash
   git fetch origin main
   git branch -D beta 2>/dev/null || true
   git branch beta origin/main
   ```

3. **원격 강제 갱신**: `--force-with-lease` 사용 (다른 push 있었으면 거부 — 안전).
   ```bash
   git push origin beta --force-with-lease
   ```

4. **워크트리 재생성**:
   ```bash
   git worktree add "$BETA_WT" beta
   ```

5. **보고**: "origin/beta를 origin/main(<short-sha>) 기준으로 리셋. 폐기된 commit N개" 출력.

### 안전장치 (가벼움)

- `--force` 단독 금지, `--force-with-lease`만
- dst-craft-beta 워크트리가 dirty면 중단 (미커밋 작업 보호)
- 별도 확인 프롬프트 없음 — 사용자가 `/beta clear`를 명시적으로 호출한 시점이 의도 표명. 단, 폐기될 커밋 수가 비정상적으로 크면(예: 10개+) 한 줄로 확인.

## 규칙

- **`feat → beta` 방향 머지만** — `main → beta`, `beta → main` 등 다른 방향은 다루지 않음
- **`main ← beta` 절대 금지** (CLAUDE.md 핵심 규칙) — beta는 in-flight 합집합, main 입구 아님
- **메인 워크트리(=main) 건드리지 말 것** — 모든 머지/푸시는 `../dst-craft-beta` 워크트리에서만
- **beta 워크트리에서 직접 작업 금지** — `/beta`가 배포 용도로만 사용
- 머지 전략: fast-forward 가능하면 그대로, 안 되면 머지 커밋 명시
- 릴리즈노트/버전 bump는 `/release`에서. `/beta`는 deploy-only
- `--no-verify`, `--force` (단독) 사용 금지
- 사용자에게 묻지 않고 절차를 끝까지 진행 (push 권한 위임). 단, 타겟 결정이 모호하거나 `clear`는 반드시 확인.

## /release와의 흐름

```
작업 → /beta  (commit + origin push + beta 머지 + 배포)
     → /release (../dst-craft-<num> 워크트리에서 main 배포)
```

`/beta`만 호출하면 commit → origin push → beta 머지/푸시까지 한 번에. 코드 리뷰/PR 흐름이 필요하면 그냥 `git push` 후 GitHub에서 확인 후 `/beta` 호출.
