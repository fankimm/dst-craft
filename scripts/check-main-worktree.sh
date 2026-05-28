#!/usr/bin/env bash
# 메인 워크트리가 항상 `main` 브랜치를 가리키도록 강제하는 가드.
#
# 왜: 정체 불명의 트리거로 메인 워크트리(`<repo>/../dst-craft`)가 `beta`로 드리프트하는 사고가
# 4회 재발 (2026-05-13/20/23/28). `/release`의 첫 머지가 잘못된 브랜치에 박혀 매번 수동 복구.
# 매번 origin은 무사했지만 매번 발생 → 자동 방어층 필요.
#
# 진입점:
#   - SessionStart hook (`.claude/settings.local.json`)에서 매 세션 시작 시 자동 호출
#   - `/release` · `/beta` 스킬 사전 점검에서도 호출 (안전망 한 겹 더)
#
# 동작:
#   - 메인 워크트리 자동 탐색 (path가 `/dst-craft`로 끝나는 worktree) → `$DST_MAIN_WT`로 override 가능
#   - HEAD == main → silent OK
#   - HEAD != main && clean → drift를 디버그 로그에 기록하고 자동 `git switch main`
#   - HEAD != main && dirty → 사용자에게 보고하고 비파괴 종료 (수동 정리 필요)
#   - 메인 워크트리 자체를 못 찾으면 silent skip (CI · 다른 머신)

set -eu

EXPECTED_BRANCH="main"
LOG_DIR="$HOME/.dstcraft-debug"
LOG_FILE="$LOG_DIR/worktree-drift.log"

# 1) 메인 워크트리 위치 결정. 우선순위: env override → worktree list에서 path가 dst-craft로 끝나는 항목
MAIN_WT="${DST_MAIN_WT:-}"
if [ -z "$MAIN_WT" ]; then
  MAIN_WT=$(git worktree list --porcelain 2>/dev/null \
    | sed -n 's/^worktree //p' \
    | grep -E '/dst-craft$' \
    | head -1 || true)
fi

# 메인 워크트리 자체가 없으면 무시 (해당 사고가 없는 환경)
if [ -z "${MAIN_WT:-}" ] || [ ! -d "$MAIN_WT/.git" ] && [ ! -f "$MAIN_WT/.git" ]; then
  exit 0
fi

current=$(git -C "$MAIN_WT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")

if [ "$current" = "$EXPECTED_BRANCH" ]; then
  exit 0
fi

dirty=$(git -C "$MAIN_WT" status --porcelain 2>/dev/null || true)

if [ -n "$dirty" ]; then
  echo "[worktree-guard] ⚠️  메인 워크트리($MAIN_WT)가 '$current' 브랜치에 있고 dirty합니다."
  echo "[worktree-guard]    수동 정리(stash / commit / reset) 후 'git -C $MAIN_WT switch main' 실행하세요."
  exit 1
fi

# 2) drift 디버그 로그 (트리거 분석용 reflog 스냅샷)
mkdir -p "$LOG_DIR"
{
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo "from=$current to=$EXPECTED_BRANCH path=$MAIN_WT"
  echo "-- HEAD reflog (last 30) --"
  git -C "$MAIN_WT" reflog -30 2>&1 | head -30
  echo "-- worktree list --"
  git -C "$MAIN_WT" worktree list 2>&1
  echo
} >> "$LOG_FILE"

# 3) clean이면 자동 복구
git -C "$MAIN_WT" switch "$EXPECTED_BRANCH" >/dev/null 2>&1
echo "[worktree-guard] 메인 워크트리를 '$current' → '$EXPECTED_BRANCH' 로 복원했습니다. (드리프트 로그: $LOG_FILE)"
