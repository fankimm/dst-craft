#!/bin/bash
# SQLite 일일 백업 — sqlite3 .backup 사용 (WAL 호환, 잠금 X).
# launchd com.dstcraft.backup 또는 수동 실행.
#
# 검증 없이 백업을 로테이션에 넣으면, 깨진 백업이 매일 쌓이는 동안
# 마지막 정상본이 KEEP_DAYS 경과로 삭제된다. 그래서 생성 직후
# integrity_check + gzip -t 를 통과한 백업만 남기고, 검증에 실패하면
# 산출물을 지우고 prune 없이 중단한다 (기존 정상본 보존).
#
# 호환: macOS 기본 bash 3.2 — mapfile/readarray 등 4.0 문법 금지.
set -euo pipefail

DB_PATH="${DB_PATH:-$HOME/dstcraft/data/app.db}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/Backups/dstcraft}"
KEEP_DAYS="${KEEP_DAYS:-14}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# 검증 실패: 산출물을 지우고 중단. prune 에 도달하지 않으므로 기존 백업은 그대로 남는다.
fail() {
  log "ERROR: $1" >&2
  rm -f "$OUT" "${OUT}.gz" "${OUT}-wal" "${OUT}-shm"
  log "aborted — 기존 백업 보존 (prune 미실행)" >&2
  exit 1
}

if [[ ! -f "$DB_PATH" ]]; then
  echo "DB not found: $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TS=$(date +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/app-$TS.db"

sqlite3 "$DB_PATH" ".backup '$OUT'"
[[ -s "$OUT" ]] || fail "backup file missing or empty: $OUT"

# 1) 백업본 무결성 — 손상된 페이지가 섞여 들어왔는지 확인
#    immutable=1 로 열지 않으면 WAL 모드 백업본을 여는 순간 -wal/-shm 사이드카가 생기고,
#    아래 prune 은 'app-*.db.gz' 만 지우므로 그 잔재가 영구 누적된다.
#    .backup 산출물은 체크포인트가 끝난 단일 파일이라 WAL 을 무시해도 안전하다.
CHECK=$(sqlite3 "file:${OUT}?immutable=1" "PRAGMA integrity_check;" 2>&1) || fail "integrity_check 실행 실패: $CHECK"
[[ "$CHECK" == "ok" ]] || fail "integrity_check 실패: $CHECK"
# BACKUP_DIR 경로에 URI 특수문자가 있어 immutable 이 안 먹은 경우를 대비한 안전망
rm -f "${OUT}-wal" "${OUT}-shm"
log "integrity_check ok"

gzip -9 "$OUT"

# 2) 압축본 무결성 — gzip 이 중간에 잘렸는지 확인
gzip -t "${OUT}.gz" 2>/dev/null || fail "gzip -t 실패 (압축본 손상): ${OUT}.gz"
log "gzip -t ok"

SIZE=$(du -h "${OUT}.gz" | cut -f1)
log "backup ok: ${OUT}.gz ($SIZE)"

# Prune older than KEEP_DAYS days — 위 검증을 모두 통과한 경우에만 도달
find "$BACKUP_DIR" -name 'app-*.db.gz' -type f -mtime "+${KEEP_DAYS}" -delete
