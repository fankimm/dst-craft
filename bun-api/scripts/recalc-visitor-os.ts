/**
 * `analytics_visitors.os` 재계산 (#63).
 *
 * `parseOS` 가 `Bot`/`Unknown`/`HarmonyOS` 버킷을 갖기 전에 기록된 행은 그 셋이 전부
 * `Other`(또는 봇이 Android)로 들어가 있다. 이 테이블은 원본 `ua` 를 보관하므로
 * 다시 계산할 수 있다.
 *
 * **집계 카운터(`analytics_counters` 의 `os` 키)는 백필할 수 없다** — 원본 UA를 안 남기고
 * 버킷 이름만 세기 때문이다. 그래서 `/stats` 의 OS 분포는 이 배포 시점부터 새 기준으로
 * 쌓이고, 그 이전 구간은 옛 기준이 섞여 있다. 접속자 로그(rolling 200건)만 정정된다.
 *
 * 실행 (맥미니):
 *   ssh fankimm@100.85.118.4 '~/.bun/bin/bun run ~/works/dst-craft/bun-api/scripts/recalc-visitor-os.ts'
 *   ssh fankimm@100.85.118.4 '~/.bun/bin/bun run ~/works/dst-craft/bun-api/scripts/recalc-visitor-os.ts --apply'
 *
 * 기본은 dry-run — 무엇이 바뀌는지 먼저 보여주고, `--apply` 를 줘야 쓴다.
 */
import { db } from "../src/lib/db";
import { parseOS } from "../src/lib/util";

const apply = process.argv.includes("--apply");

const rows = db
  .query<{ id: number; ua: string | null; os: string | null }, []>(
    "SELECT id, ua, os FROM analytics_visitors ORDER BY id",
  )
  .all();

const changes: { id: number; from: string; to: string; ua: string }[] = [];
for (const r of rows) {
  const next = parseOS(r.ua ?? "");
  if (next !== (r.os ?? "")) {
    changes.push({ id: r.id, from: r.os ?? "(빈값)", to: next, ua: (r.ua ?? "").slice(0, 70) });
  }
}

const byTransition = new Map<string, number>();
for (const c of changes) {
  const k = `${c.from} → ${c.to}`;
  byTransition.set(k, (byTransition.get(k) ?? 0) + 1);
}

console.log(`대상 ${rows.length}건 중 변경 ${changes.length}건`);
if (byTransition.size) {
  console.log("\n전이 요약:");
  for (const [k, n] of [...byTransition].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}건  ${k}`);
  }
  console.log("\n예시 (최대 10건):");
  for (const c of changes.slice(0, 10)) {
    console.log(`  #${c.id} ${c.from} → ${c.to}  ${c.ua}`);
  }
}

if (!changes.length) {
  console.log("\n변경 없음.");
} else if (!apply) {
  console.log("\n(dry-run) 실제로 쓰려면 --apply 를 붙일 것.");
} else {
  const stmt = db.prepare("UPDATE analytics_visitors SET os = ? WHERE id = ?");
  const tx = db.transaction((cs: typeof changes) => {
    for (const c of cs) stmt.run(c.to, c.id);
  });
  tx(changes);
  console.log(`\n${changes.length}건 반영 완료.`);
}
