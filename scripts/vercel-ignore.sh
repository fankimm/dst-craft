#!/usr/bin/env bash
# Vercel ignoreCommand — exit 0 to SKIP build, exit 1 to PROCEED with build.
#
# Vercel runs this in the build environment after fetching the commit. We use it to
# skip Hobby quota burn on changes that don't affect Vercel's static output.
#
# Mental model: Vercel here is failover-only (CLAUDE.md: Phase 6 auto DNS swap).
# It produces the same `out/` static export as Mac mini. So Vercel only needs to
# rebuild when the static export would actually change — i.e., when src/, public/,
# package*.json, next.config, tsconfig, or the generate-* build scripts change.
# Everything else (docs, bun-api/, .claude/, todo.md, memory/, root *.md) is skipped.
#
# bun-api/ is NOT a build trigger because bun-api runs only on Mac mini — Vercel
# proxies /api/* to the live origin via vercel.json rewrites.

set -e

# Determine previous SHA. Vercel exposes VERCEL_GIT_PREVIOUS_SHA on commits
# beyond the first; fall back to HEAD^ otherwise.
if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ]; then
  PREV="$VERCEL_GIT_PREVIOUS_SHA"
else
  PREV="HEAD^"
fi

# Compute changed files. If diff fails (shallow clone, missing parent),
# default to building — the safe fallback.
if ! changed=$(git diff --name-only "$PREV" HEAD 2>/dev/null); then
  echo "vercel-ignore: cannot compute diff against $PREV — building"
  exit 1
fi

if [ -z "$changed" ]; then
  echo "vercel-ignore: no changed files — skipping"
  exit 0
fi

# Files that affect Vercel's Next.js static export OR runtime config.
# - src/, public/: source + assets
# - package*, next.config, tsconfig: build inputs
# - postcss.config: CSS pipeline (Tailwind v4)
# - vercel.json: routing/headers config (applied on deploy, not build)
# - scripts/generate-*: PWA manifest / service worker / iOS splash generators
PATTERN='^(src/|public/|package(-lock)?\.json|next\.config|tsconfig\.json|postcss\.config|vercel\.json|scripts/generate-)'

if echo "$changed" | grep -qE "$PATTERN"; then
  echo "vercel-ignore: user-facing changes detected — building"
  echo "$changed" | grep -E "$PATTERN" | head -10 | sed 's/^/  + /'
  exit 1
fi

echo "vercel-ignore: only meta/docs changed — skipping build"
echo "$changed" | head -10 | sed 's/^/  - /'
exit 0
