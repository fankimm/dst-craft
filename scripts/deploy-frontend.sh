#!/usr/bin/env bash
# dst-craft frontend 정적 빌드 자동 배포 (Mac mini) — branch별 source/symlink 매핑
#
# 흐름: source-* 갱신 → npm ci/build → releases/<TS>-<target> 생성 → symlink atomic swap → 오래된 release 정리
# 사용:
#   deploy-frontend.sh <beta|main> [--force]
#     beta : ~/dstcraft/source-beta(beta 브랜치) → ~/dstcraft/beta (beta.dstcraft.com)
#     main : ~/dstcraft/source-main(main 브랜치) → ~/dstcraft/prod (dstcraft.com)
#
# .env.local은 두 source 디렉터리 모두 동일한 값 사용 (수동 복사 필요).

set -euo pipefail

ROOT="$HOME/dstcraft"
TARGET="${1:-}"
case "$TARGET" in
  beta) SOURCE="$ROOT/source-beta"; LINK="$ROOT/beta"; BRANCH="beta" ;;
  main) SOURCE="$ROOT/source-main"; LINK="$ROOT/prod"; BRANCH="main" ;;
  ""|-h|--help)
    echo "Usage: $0 <beta|main> [--force]"
    echo "  beta : source-beta(beta) → ~/dstcraft/beta (beta.dstcraft.com)"
    echo "  main : source-main(main) → ~/dstcraft/prod (dstcraft.com)"
    exit 0
    ;;
  *) echo "Unknown target: $TARGET" >&2; exit 2 ;;
esac
shift  # consume target

KEEP=5
RELEASES="$ROOT/releases"

FORCE=0
for arg in "$@"; do
  case "$arg" in
    -f|--force) FORCE=1 ;;
    -h|--help) echo "Usage: $0 <beta|main> [--force]"; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

log() { printf "\033[1;34m[deploy-%s]\033[0m %s\n" "$TARGET" "$*"; }
err() { printf "\033[1;31m[deploy-%s ERROR]\033[0m %s\n" "$TARGET" "$*" >&2; }

[ -d "$SOURCE/.git" ] || { err "$SOURCE is not a git repo (해당 경로에 fresh clone 필요)"; exit 1; }

cd "$SOURCE"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  err "$SOURCE is on branch '$CURRENT_BRANCH', expected '$BRANCH' — git checkout $BRANCH 후 재시도"
  exit 1
fi

log "Cleaning source working tree (build artifacts will be discarded)"
git restore . 2>/dev/null || true
git clean -fd >/dev/null 2>&1 || true

log "Fetching origin..."
git fetch --quiet origin

CURRENT=$(git rev-parse HEAD)
TARGET_SHA=$(git rev-parse '@{u}')

if [ "$CURRENT" = "$TARGET_SHA" ] && [ "$FORCE" -ne 1 ]; then
  log "Already up to date (${CURRENT:0:7}). Use --force to rebuild."
  exit 0
fi

if [ "$CURRENT" != "$TARGET_SHA" ]; then
  log "Pulling: ${CURRENT:0:7} -> ${TARGET_SHA:0:7}"
  git pull --ff-only --quiet
else
  log "Forced rebuild at ${CURRENT:0:7}"
fi

[ -f .env.local ] || { err ".env.local missing in $SOURCE (source-main에서 복사하거나 직접 작성)"; exit 1; }

log "npm ci..."
npm ci --silent

log "npm run build... (NEXT_PUBLIC_DEPLOY_ENV=$TARGET)"
NEXT_PUBLIC_DEPLOY_ENV="$TARGET" npm run build

[ -f out/index.html ] || { err "Build output invalid (out/index.html missing)"; exit 1; }

TS=$(date +%Y%m%d-%H%M%S)
NEW_RELEASE="$RELEASES/$TS-$TARGET"
mkdir -p "$RELEASES"

log "Moving out/ -> $NEW_RELEASE"
mv out "$NEW_RELEASE"

# Carry over previous release's _next/static so in-flight browsers
# that reference old chunk hashes still find them after symlink swap.
if [ -L "$LINK" ] && [ -d "$(readlink "$LINK")/_next/static" ]; then
  log "Merging previous _next/static/ (preserving old chunks)..."
  cp -Rn "$(readlink "$LINK")/_next/static/." "$NEW_RELEASE/_next/static/" 2>/dev/null || true
fi

PREV=""
[ -L "$LINK" ] && PREV=$(readlink "$LINK")

ln -sfn "$NEW_RELEASE" "$LINK"
log "symlink: $LINK -> $NEW_RELEASE"
[ -n "$PREV" ] && log "  (previous: $PREV)"

log "Pruning old releases for target=$TARGET (keep latest $KEEP)..."
ACTIVE=$(readlink "$LINK")
ls -1dt "$RELEASES"/*-"$TARGET" 2>/dev/null | tail -n "+$((KEEP+1))" | while read -r old; do
  if [ -d "$old" ] && [ "$old" != "$ACTIVE" ]; then
    log "  rm $(basename "$old")"
    rm -rf "$old"
  fi
done

# CF cache purge — origin Cache-Control이 무시되는 경우(엣지가 stale HTML 들고 옛 chunk hash 가리키면 404 → 클라 예외)
# 회피용. ~/dstcraft/.cf-env 에 CF_API_TOKEN + CF_ZONE_ID 있을 때만 실행, 실패해도 deploy는 성공 처리.
CF_ENV="$ROOT/.cf-env"
if [ -f "$CF_ENV" ]; then
  set -a; . "$CF_ENV"; set +a
  if [ -n "${CF_API_TOKEN:-}" ] && [ -n "${CF_ZONE_ID:-}" ]; then
    case "$TARGET" in
      main) HOSTS='["dstcraft.com","www.dstcraft.com"]' ;;
      beta) HOSTS='["beta.dstcraft.com"]' ;;
    esac
    log "CF purge: hosts=$HOSTS"
    PURGE=$(curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"hosts\":$HOSTS}" || echo '{"success":false,"errors":[{"message":"curl failed"}]}')
    if echo "$PURGE" | grep -q '"success":true'; then
      log "  OK"
    else
      err "CF purge failed (deploy 성공 처리 — 수동 purge 필요): $PURGE"
    fi
  else
    log "CF purge skipped (CF_API_TOKEN/CF_ZONE_ID empty in $CF_ENV)"
  fi
else
  log "CF purge skipped ($CF_ENV not found)"
fi

log "Done. Verify: curl -I https://${LINK##*/}.dstcraft.com  (beta) | https://www.dstcraft.com (main)"
