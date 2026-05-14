#!/usr/bin/env bash
# Sync DST game data: extract scripts.zip → snapshot repo → run converters.
#
# Maintains ~/dst-game-snapshot/ as a local git repo tracking each game build:
#   scripts/      ← unzipped scripts.zip (replaced wholesale every sync)
#   ko.po         ← Korean translation mod
#   buildid.txt   ← Steam buildid
#   last_updated.txt
#
# After updating the snapshot, runs convert-scrapbook / extract-raw-foods /
# verify-skill-trees and updates src/data/game-version.ts.
#
# Existing converter scripts read from /tmp/dst-{extract,scrapbook}/. We
# symlink those to the snapshot, so no changes to existing scripts needed.

set -euo pipefail

# ─── Paths ─────────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SNAPSHOT="${HOME}/dst-game-snapshot"
GAME_BASE="${HOME}/Library/Application Support/Steam/steamapps"
SCRIPTS_ZIP="${GAME_BASE}/common/Don't Starve Together/dontstarve_steam.app/Contents/data/databundles/scripts.zip"
MANIFEST="${GAME_BASE}/appmanifest_322330.acf"
KOPO_SRC="${GAME_BASE}/workshop/content/322330/2391246365/scripts/languages/ko.po"

FORCE="${1:-}"

# ─── 1. Read Steam manifest ────────────────────────────────────────────────
if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: Steam manifest not found at $MANIFEST" >&2
  exit 1
fi
CURR_BUILDID=$(grep -E '"buildid"' "$MANIFEST" | head -1 | awk -F'"' '{print $4}')
LAST_UPDATED_TS=$(grep -E '"LastUpdated"' "$MANIFEST" | head -1 | awk -F'"' '{print $4}')
LAST_UPDATED_HUMAN=$(date -r "$LAST_UPDATED_TS" "+%Y-%m-%d %H:%M %Z")

echo "Game buildid:    $CURR_BUILDID"
echo "Game updated at: $LAST_UPDATED_HUMAN"

# ─── 2. Compare with snapshot ──────────────────────────────────────────────
PREV_BUILDID=""
[[ -f "$SNAPSHOT/buildid.txt" ]] && PREV_BUILDID=$(<"$SNAPSHOT/buildid.txt")

echo "Snapshot buildid: ${PREV_BUILDID:-<none>}"

if [[ "$CURR_BUILDID" == "$PREV_BUILDID" && "$FORCE" != "--force" ]]; then
  echo
  echo "Already at buildid $CURR_BUILDID (no game update). Pass --force to re-run converters."
  exit 0
fi

# ─── 3. Init snapshot repo if needed ───────────────────────────────────────
if [[ ! -d "$SNAPSHOT/.git" ]]; then
  echo
  echo "Initializing snapshot repo at $SNAPSHOT..."
  mkdir -p "$SNAPSHOT"
  git -C "$SNAPSHOT" init -q -b main
  cat > "$SNAPSHOT/README.md" <<EOF
# dst-game-snapshot

Local-only git repo tracking Don't Starve Together's \`scripts.zip\` extracted
contents and the Korean translation mod (\`ko.po\`) build-over-build.

**Do not push to a remote.** Klei assets are not for redistribution.

Updated by \`dst-craft/scripts/sync-game-data.sh\`.
EOF
  git -C "$SNAPSHOT" add README.md
  git -C "$SNAPSHOT" commit -q -m "init" || true
fi

# ─── 4. Extract scripts.zip into snapshot ──────────────────────────────────
echo
echo "Extracting scripts.zip → $SNAPSHOT/scripts/ ..."
rm -rf "$SNAPSHOT/scripts"
unzip -q -o "$SCRIPTS_ZIP" -d "$SNAPSHOT"

# ─── 5. Copy ko.po ─────────────────────────────────────────────────────────
if [[ -f "$KOPO_SRC" ]]; then
  cp "$KOPO_SRC" "$SNAPSHOT/ko.po"
else
  echo "WARNING: ko.po not found at $KOPO_SRC (skipping)"
fi

# ─── 6. Write buildid markers ──────────────────────────────────────────────
echo "$CURR_BUILDID" > "$SNAPSHOT/buildid.txt"
echo "$LAST_UPDATED_HUMAN" > "$SNAPSHOT/last_updated.txt"

# ─── 7. Commit snapshot ────────────────────────────────────────────────────
git -C "$SNAPSHOT" add -A
if git -C "$SNAPSHOT" diff --cached --quiet; then
  echo "Snapshot: no file changes (buildid bumped but content identical)."
else
  git -C "$SNAPSHOT" commit -q -m "buildid $CURR_BUILDID @ $LAST_UPDATED_HUMAN"
  echo "Snapshot committed."
fi

# ─── 8. Symlink /tmp paths for existing converter scripts ──────────────────
# rm first because /tmp may contain old extract directories from the prior
# workflow — `ln -sfn` won't replace a directory, it nests the symlink inside.
rm -rf /tmp/dst-extract /tmp/dst-scrapbook
ln -sfn "$SNAPSHOT" /tmp/dst-extract
ln -sfn "$SNAPSHOT" /tmp/dst-scrapbook

# ─── 9. Run converters ─────────────────────────────────────────────────────
cd "$REPO_ROOT"

echo
echo "═══ convert-scrapbook ═══"
python3 scripts/convert-scrapbook.py

echo
echo "═══ extract-raw-foods ═══"
python3 scripts/extract-raw-foods.py

echo
echo "═══ verify-skill-trees ═══"
python3 scripts/verify-skill-trees.py || echo "(verify-skill-trees reported divergences — review above)"

# ─── 10. Update game-version.ts (preserve `release`, bump buildid + date) ─
TODAY=$(date "+%Y-%m-%d")
GAME_VER="$REPO_ROOT/src/data/game-version.ts"
sed -i.bak \
  -e "s/steamBuildId: \"[^\"]*\"/steamBuildId: \"$CURR_BUILDID\"/" \
  -e "s/dataUpdatedAt: \"[^\"]*\"/dataUpdatedAt: \"$TODAY\"/" \
  "$GAME_VER"
rm -f "$GAME_VER.bak"

# ─── 11. Summary ───────────────────────────────────────────────────────────
echo
echo "═══ Repo data changes ═══"
git -C "$REPO_ROOT" diff --stat -- src/data/ || true
echo
echo "Done."
echo "Next: review the diff, update the 'release' field in src/data/game-version.ts"
echo "      if Klei published a new hotfix number, then commit."
