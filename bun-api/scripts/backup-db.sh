#!/bin/bash
# SQLite 일일 백업 — sqlite3 .backup 사용 (WAL 호환, 잠금 X).
# launchd com.dstcraft.backup 또는 수동 실행.
set -euo pipefail

DB_PATH="${DB_PATH:-$HOME/dstcraft/data/app.db}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/Backups/dstcraft}"
KEEP_DAYS="${KEEP_DAYS:-14}"

if [[ ! -f "$DB_PATH" ]]; then
  echo "DB not found: $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TS=$(date +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/app-$TS.db"

sqlite3 "$DB_PATH" ".backup '$OUT'"
gzip -9 "$OUT"

SIZE=$(du -h "${OUT}.gz" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] backup ok: ${OUT}.gz ($SIZE)"

# Prune older than KEEP_DAYS days
find "$BACKUP_DIR" -name 'app-*.db.gz' -type f -mtime "+${KEEP_DAYS}" -delete
