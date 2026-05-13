import { Database } from "bun:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./env";

mkdirSync(dirname(env.DB_PATH), { recursive: true });

export const db = new Database(env.DB_PATH, { create: true });

// WAL: 다중 read + 단일 write 동시성. SQLite 단일 프로세스(bun-api 1개)라 충분.
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA synchronous = NORMAL");
db.exec("PRAGMA busy_timeout = 5000");
db.exec("PRAGMA foreign_keys = ON");

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
db.exec(readFileSync(schemaPath, "utf8"));

// ─── 멱등 마이그레이션 ───
// schema.sql의 CREATE TABLE IF NOT EXISTS는 기존 DB의 신규 컬럼을 못 채움.
// PRAGMA table_info로 컬럼 존재 체크 후 없는 것만 ALTER TABLE ADD.
function ensureColumns(table: string, cols: { name: string; type: string }[]): void {
  const existing = new Set(
    db
      .query<{ name: string }, []>(`PRAGMA table_info(${table})`)
      .all()
      .map((r) => r.name),
  );
  for (const c of cols) {
    if (!existing.has(c.name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${c.name} ${c.type}`);
    }
  }
}

ensureColumns("feedback", [
  { name: "message_translated", type: "TEXT" },
  { name: "message_lang", type: "TEXT" },
  { name: "message_translated_at", type: "INTEGER" },
  { name: "message_translated_model", type: "TEXT" },
  { name: "reply_translated", type: "TEXT" },
  { name: "reply_lang", type: "TEXT" },
  { name: "reply_translated_at", type: "INTEGER" },
  { name: "reply_translated_model", type: "TEXT" },
]);

export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

// counter UPSERT — Redis INCR/HINCRBY 대체
export function bumpCounter(scope: string, bucket: string, country: string, by = 1): void {
  // MAX(0, ...) — 음수 bump (rating 재투표 시 이전 별점 -1) 누적 결과가 음수가 되지 않도록 방어.
  // INSERT/UPDATE 두 식 모두 clamp. excluded.count 대신 ?를 두 번 바인딩 (INSERT 측 MAX가 excluded를 0으로 만들면 UPDATE 누적이 깨짐).
  db.query(
    `INSERT INTO analytics_counters(scope, bucket, country, count) VALUES (?, ?, ?, MAX(0, ?))
     ON CONFLICT(scope, bucket, country) DO UPDATE SET count = MAX(0, count + ?)`,
  ).run(scope, bucket, country, by, by);
}

export function getCounter(scope: string, bucket: string, country: string): number {
  const row = db
    .query<{ count: number }, [string, string, string]>(
      `SELECT count FROM analytics_counters WHERE scope = ? AND bucket = ? AND country = ?`,
    )
    .get(scope, bucket, country);
  return row?.count ?? 0;
}

// HASH 형태 카운터 전체 조회 (HGETALL 대체)
export function getCounterMap(scope: string, country = ""): Record<string, number> {
  const rows = db
    .query<{ bucket: string; count: number }, [string, string]>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = ? AND country = ?`,
    )
    .all(scope, country);
  const map: Record<string, number> = {};
  for (const r of rows) map[r.bucket] = r.count;
  return map;
}

// PFADD 대체 — 이미 있으면 무시
export function addUv(scope: "total" | "day" | "month", bucket: string, country: string, ip: string): void {
  if (!ip || ip === "unknown") return;
  db.query(
    `INSERT OR IGNORE INTO analytics_uv(scope, bucket, country, ip) VALUES (?, ?, ?, ?)`,
  ).run(scope, bucket, country, ip);
}

// PFCOUNT 대체 — 정확한 distinct count
export function countUv(scope: "total" | "day" | "month", bucket: string, country: string): number {
  const row = db
    .query<{ c: number }, [string, string, string]>(
      `SELECT COUNT(*) AS c FROM analytics_uv WHERE scope = ? AND bucket = ? AND country = ?`,
    )
    .get(scope, bucket, country);
  return row?.c ?? 0;
}

// PFMERGE+PFCOUNT 대체 — 특정 country를 제외한 합계
export function countUvExcludingCountry(scope: "total" | "day" | "month", bucket: string, excludeCountry: string): number {
  const row = db
    .query<{ c: number }, [string, string, string]>(
      `SELECT COUNT(DISTINCT ip) AS c FROM analytics_uv
       WHERE scope = ? AND bucket = ? AND country != '' AND country != ?`,
    )
    .get(scope, bucket, excludeCountry);
  return row?.c ?? 0;
}
