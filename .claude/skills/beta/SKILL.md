---
name: beta
description: 타겟 브랜치를 beta로 머지/푸시해서 beta.dstcraft.com에 배포. 인자 없으면 현재 워크트리 브랜치. 인자(브랜치명/이슈번호/이슈URL/자연어)로 다른 feat 브랜치 지정 가능. 별도 ../dst-craft-beta 워크트리에서 머지 (없으면 자동 생성). origin push까지 보장. Production 배포는 /release.
---

# /beta — 타겟 브랜치를 beta에 배포

타겟 브랜치를 `beta` 브랜치에 머지하고 push하여 `beta.dstcraft.com`에 자동 배포한다. CLAUDE.md의 Branch & Deploy Strategy를 준수.

> `/push`는 단순히 origin에 push할 뿐 배포는 안 함. **beta 배포는 이 스킬을 통해서만**.

## 인자 처리 — 타겟 결정

`/push`와 동일 규칙:
- **인자 없음**: 현재 워크트리 브랜치를 타겟
- **`feat/...` 브랜치명**: 그대로
- **숫자만**: `feat/<num>-*` 패턴으로 로컬 브랜치 검색
- **이슈 URL**: 번호 추출 후 위와 동일
- **자연어**: `gh issue list`에서 fuzzy 매칭, 모호하면 1줄 확인

타겟을 `TARGET_BRANCH`라 부른다. 결과는 `feat/X` 형태여야 함 — `main`/`beta` 자체는 거부 (자기 자신/main 머지 무의미).

## 사전 점검

병렬 실행:
- `git fetch --all --prune`
- `git rev-parse --verify <TARGET_BRANCH>` (브랜치 존재 확인)
- `git worktree list --porcelain` (TARGET_BRANCH 워크트리 + beta 워크트리 위치 파악)

**중단 조건**:
- TARGET_BRANCH가 존재하지 않음
- TARGET_BRANCH가 체크아웃된 워크트리가 dirty (먼저 정리 권유)

## 0. cwd 처리 규칙

이 환경의 Bash tool은 매 호출마다 cwd가 메인 워킹 디렉터리로 리셋된다. **모든 git 명령은 `git -C <워크트리경로>`** 또는 `cd <경로> &&` 프리픽스. Read/Edit/Write는 절대경로라 영향 없음.

## 1. Beta 워크트리 보장

`../dst-craft-beta` 워크트리가 있는지 확인. 없으면 자동 생성:

```bash
BETA_WT="../dst-craft-beta"
if ! git worktree list --porcelain | grep -q "^worktree .*$(basename $BETA_WT)$"; then
  # origin/beta 최신화 후 생성
  git fetch origin beta
  git worktree add "$BETA_WT" beta
fi
```

beta 브랜치 자체가 origin에 없으면 (드문 케이스): `git worktree add -b beta "$BETA_WT" main` 후 origin push.

## 2. 타겟 브랜치 origin push 보장

```bash
TARGET_WT=$(git worktree list --porcelain \
  | awk -v b="refs/heads/$TARGET_BRANCH" '/^worktree/{p=$2} $0=="branch "b{print p}')

# 그 브랜치에 미푸시 커밋이 있으면 push
git -C "$TARGET_WT" push origin "$TARGET_BRANCH"
```

워크트리에 체크아웃되지 않은 브랜치라면 `git push origin "$TARGET_BRANCH":refs/heads/$TARGET_BRANCH`로 push (드문 케이스).

## 3. Beta 워크트리에서 머지 + push

```bash
git -C "$BETA_WT" fetch origin
git -C "$BETA_WT" pull --ff-only origin beta
git -C "$BETA_WT" merge "$TARGET_BRANCH" -m "merge $TARGET_BRANCH into beta for staging"
git -C "$BETA_WT" push origin beta
```

머지 충돌 시 중단하고 사용자에게 보고. 임의 해결 금지.

## 4. 마무리

- `git -C "$BETA_WT" log -1 --oneline` (beta 최신 커밋 확인)
- 사용자에게 결과 보고: 어떤 feat이 beta에 들어갔는지, beta.dstcraft.com 배포 트리거됨

## 규칙

- **`feat → beta` 방향 머지만** — `main → beta`, `beta ← main` 등 다른 방향은 이 스킬에서 다루지 않음
- **`main ← beta` 절대 금지** (CLAUDE.md 핵심 규칙) — beta는 in-flight 합집합, main 입구 아님
- **메인 워크트리(=main) 건드리지 말 것** — 모든 머지/푸시는 `../dst-craft-beta` 워크트리에서만
- **beta 워크트리에서 직접 작업 금지** — 오직 `/beta`가 배포 용도로만 사용
- 머지 전략: fast-forward 가능하면 그대로, 안 되면 머지 커밋 명시 (`-m "merge ... for staging"`)
- 릴리즈노트/버전 bump는 `/release`에서. `/beta`는 deploy-only
- `--no-verify`, `--force` 사용 금지

## /push, /release와의 흐름

```
작업 → /push  (커밋 + origin push)
     → /beta  (../dst-craft-beta 워크트리에서 beta 배포)
     → /release (../dst-craft-<num> 워크트리에서 main 배포)
```

`/beta`만 단독으로 호출해도 OK — 내부에서 origin push를 보장하므로 `/push` 생략 가능. 하지만 코드 리뷰/PR 흐름이 필요하면 `/push` 먼저 해서 GitHub에서 확인.
