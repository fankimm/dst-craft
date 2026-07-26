/**
 * 접속자 로그(analytics_visitors)의 os 컬럼을 현재 parseOS 규칙으로 재계산 (#63)
 *
 * 배경: parseOS에 Bot/Unknown/HarmonyOS 버킷이 추가되기 전에 쌓인 row는 os가 "Other"로
 * 박제돼 있다. 원본 UA는 같은 테이블에 남아 있으므로 로그 테이블만은 되살릴 수 있다.
 *
 * 한계: 집계 카운터(analytics_counters scope='os')는 원본 UA를 보관하지 않아 백필 불가.
 *      OS 카드의 Bot/Unknown/HarmonyOS 수치는 이 배포 이후 유입분부터 쌓인다.
 *      (analytics_visitors는 트리거로 최근 200건만 유지 → 이 스크립트가 건드리는 범위도 그만큼)
 *
 * 사용
 *   DB_PATH=~/dstcraft/data/app.db bun scripts/reparse-visitor-os.ts [--dry-run]
 *
 * 멱등: 몇 번 돌려도 결과 동일 (UA → os는 순수 함수).
 */
import { db } from "../src/lib/db";
import { parseOS } from "../src/lib/util";

const DRY_RUN = process.argv.includes("--dry-run");

const rows = db
  .query<{ id: number; ua: string; os: string; country: string }, []>(
    `SELECT id, ua, os, country FROM analytics_visitors`,
  )
  .all();

const update = db.query(`UPDATE analytics_visitors SET os = ? WHERE id = ?`);
const moved: Record<string, number> = {};
let changed = 0;

for (const r of rows) {
  const next = parseOS(r.ua ?? "");
  if (next === r.os) continue;
  changed++;
  const key = `${r.os || "(empty)"} → ${next}`;
  moved[key] = (moved[key] ?? 0) + 1;
  if (!DRY_RUN) update.run(next, r.id);
}

console.log(`${rows.length} rows scanned, ${changed} reclassified${DRY_RUN ? " (dry-run, not written)" : ""}`);
for (const [k, v] of Object.entries(moved).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}

// 재분류된 항목의 국가 분포 — "중국이 왜 Other냐"의 답을 바로 확인하기 위한 요약.
const byCountry = db
  .query<{ country: string; os: string; c: number }, []>(
    `SELECT country, os, COUNT(*) AS c FROM analytics_visitors GROUP BY country, os ORDER BY c DESC LIMIT 20`,
  )
  .all();
console.log("\n국가 × OS 상위 20 (재분류 후):");
for (const r of byCountry) {
  console.log(`  ${r.country || "(unknown)"} ${r.os}: ${r.c}`);
}
