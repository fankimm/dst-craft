#!/usr/bin/env bash
# dst-craft beta 정적 빌드 자동 배포 (Mac mini)
# 흐름: source 갱신 → 빌드 → releases/<TS> 생성 → symlink atomic swap → 오래된 release 정리
# 사용: ~/works/dst-craft/scripts/deploy-beta.sh [--force]

set -euo pipefail

ROOT="$HOME/dstcraft"
SOURCE="$ROOT/source"
RELEASES="$ROOT/releases"
LINK="$ROOT/beta"
KEEP=5

FORCE=0
for arg in "$@"; do
  case "$arg" in
    -f|--force) FORCE=1 ;;
    -h|--help)
      echo "Usage: $0 [--force]"
      echo "  --force   원격에 변경 없어도 강제 재빌드"
      exit 0
      ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

log() { printf "\033[1;34m[deploy-beta]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[deploy-beta ERROR]\033[0m %s\n" "$*" >&2; }

[ -d "$SOURCE/.git" ] || { err "$SOURCE is not a git repo"; exit 1; }

cd "$SOURCE"

log "Cleaning source working tree (build artifacts will be discarded)"
git restore . 2>/dev/null || true
git clean -fd >/dev/null 2>&1 || true

log "Fetching origin..."
git fetch --quiet origin

CURRENT=$(git rev-parse HEAD)
TARGET=$(git rev-parse '@{u}')

if [ "$CURRENT" = "$TARGET" ] && [ "$FORCE" -ne 1 ]; then
  log "Already up to date (${CURRENT:0:7}). Use --force to rebuild."
  exit 0
fi

if [ "$CURRENT" != "$TARGET" ]; then
  log "Pulling: ${CURRENT:0:7} -> ${TARGET:0:7}"
  git pull --ff-only --quiet
else
  log "Forced rebuild at ${CURRENT:0:7}"
fi

[ -f .env.local ] || { err ".env.local missing in $SOURCE"; exit 1; }

log "npm ci..."
npm ci --silent

log "npm run build..."
npm run build

[ -f out/index.html ] || { err "Build output invalid (out/index.html missing)"; exit 1; }

TS=$(date +%Y%m%d-%H%M%S)
NEW_RELEASE="$RELEASES/$TS"
mkdir -p "$RELEASES"

log "Moving out/ -> $NEW_RELEASE"
mv out "$NEW_RELEASE"

PREV=""
[ -L "$LINK" ] && PREV=$(readlink "$LINK")

ln -sfn "$NEW_RELEASE" "$LINK"
log "symlink: $LINK -> $NEW_RELEASE"
[ -n "$PREV" ] && log "  (previous: $PREV)"

log "Pruning old releases (keep latest $KEEP)..."
ACTIVE=$(readlink "$LINK")
cd "$RELEASES"
ls -1t | tail -n "+$((KEEP+1))" | while read -r old; do
  full="$RELEASES/$old"
  if [ -d "$full" ] && [ "$full" != "$ACTIVE" ]; then
    log "  rm $old"
    rm -rf "$full"
  fi
done

log "Done. Verify: curl -I https://beta.dstcraft.com"
