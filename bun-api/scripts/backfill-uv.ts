/**
 * 일자별/월별 UV 카운트 백필
 *
 * 배경: Phase 4 마이그레이션에서 dst:uv:* HyperLogLog는 원본 IP 추출 불가라 SQLite로 옮기지 못 함.
 * 그러나 PFCOUNT는 호출 가능 → 일자별 카드(distinct count)는 알 수 있음.
 * 이 스크립트는 그 카운트만큼 합성 IP("legacy:<bucket>:<country>:<n>")를 analytics_uv에 INSERT.
 * countUv()는 COUNT(*)만 보므로 결과적으로 차트가 복원됨.
 *
 * 사용
 *   DB_PATH=~/dstcraft/data/app.db \
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   bun scripts/backfill-uv.ts [--dry-run]
 *
 * 멱등: 다시 실행해도 이미 존재하는 row는 INSERT OR IGNORE로 건너뜀.
 *      다만 PFCOUNT 결과가 늘어나면 추가 row 생성됨 (실제 사용 X — Phase 7 후 Upstash 폐기 시 1회만 도는 게 정상).
 */
import { db } from "../src/lib/db";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!URL || !TOKEN) {
  console.error("Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

async function redis<T = any>(...args: (string | number)[]): Promise<T> {
  const res = await fetch(`${URL}/${args.map((a) => encodeURIComponent(String(a))).join("/")}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Upstash ${res.status} for ${args[0]}`);
  return ((await res.json()) as { result: T }).result;
}

async function scan(pattern: string): Promise<string[]> {
  const all: string[] = [];
  let cursor = "0";
  do {
    const result = await redis<[string, string[]]>(
      "SCAN",
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      "100",
    );
    cursor = result[0];
    all.push(...result[1]);
  } while (cursor !== "0");
  return all;
}

interface Parsed {
  scope: "total" | "day" | "month";
  bucket: string;
  country: string;
}

function parseKey(key: string): Parsed | null {
  // dst:uv                          → total, '', ''
  // dst:uv:total                    → total, '', ''
  // dst:uv:total:CC                 → total, '', CC
  // dst:uv:YYYY-MM-DD               → day, YYYY-MM-DD, ''
  // dst:uv:YYYY-MM-DD:CC            → day, YYYY-MM-DD, CC
  // dst:uv:m:YYYY-MM                → month, YYYY-MM, ''
  // dst:uv:m:YYYY-MM:CC             → month, YYYY-MM, CC

  const parts = key.split(":");
  if (parts[0] !== "dst" || parts[1] !== "uv") return null;

  if (parts.length === 2) {
    return { scope: "total", bucket: "", country: "" };
  }

  // dst:uv:total[:CC]
  if (parts[2] === "total") {
    return { scope: "total", bucket: "", country: parts[3] ?? "" };
  }

  // dst:uv:m:YYYY-MM[:CC]
  if (parts[2] === "m") {
    if (parts.length < 4) return null;
    return { scope: "month", bucket: parts[3], country: parts[4] ?? "" };
  }

  // dst:uv:YYYY-MM-DD[:CC]
  if (parts.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(parts[2])) {
    return { scope: "day", bucket: parts[2], country: parts[3] ?? "" };
  }

  return null;
}

function existing(scope: string, bucket: string, country: string): number {
  const row = db
    .query<{ c: number }, [string, string, string]>(
      "SELECT COUNT(*) AS c FROM analytics_uv WHERE scope=? AND bucket=? AND country=?",
    )
    .get(scope, bucket, country);
  return row?.c ?? 0;
}

const insertStmt = db.prepare(
  "INSERT OR IGNORE INTO analytics_uv(scope, bucket, country, ip) VALUES (?, ?, ?, ?)",
);

async function backfillKey(key: string): Promise<{ scope: string; bucket: string; country: string; pfcount: number; inserted: number }> {
  const parsed = parseKey(key);
  if (!parsed) {
    console.warn(`skip unrecognized key: ${key}`);
    return { scope: "?", bucket: key, country: "", pfcount: 0, inserted: 0 };
  }
  const pfcount = await redis<number>("PFCOUNT", key);
  const have = existing(parsed.scope, parsed.bucket, parsed.country);
  const need = pfcount - have;

  if (need <= 0) return { ...parsed, pfcount, inserted: 0 };
  if (DRY_RUN) return { ...parsed, pfcount, inserted: need };

  const tx = db.transaction((n: number) => {
    for (let i = 0; i < n; i++) {
      const ip = `legacy:${parsed.bucket || "_"}:${parsed.country || "_"}:${have + i}`;
      insertStmt.run(parsed.scope, parsed.bucket, parsed.country, ip);
    }
  });
  tx(need);
  return { ...parsed, pfcount, inserted: need };
}

async function main() {
  const keys = await scan("dst:uv:*");
  // 단일 dst:uv 키도 따로 (SCAN의 dst:uv:* glob에 포함되지 않을 수 있음)
  if (!keys.includes("dst:uv")) {
    try {
      const t = await redis<string>("TYPE", "dst:uv");
      if (t === "string") keys.push("dst:uv");
    } catch {}
  }

  console.log(`Found ${keys.length} dst:uv* keys (mode=${DRY_RUN ? "DRY-RUN" : "EXECUTE"})`);

  let totalInserted = 0;
  const byScope: Record<string, { keys: number; pfcount: number; inserted: number }> = {
    total: { keys: 0, pfcount: 0, inserted: 0 },
    day: { keys: 0, pfcount: 0, inserted: 0 },
    month: { keys: 0, pfcount: 0, inserted: 0 },
  };

  for (const key of keys) {
    try {
      const r = await backfillKey(key);
      const bucket = byScope[r.scope] ?? (byScope[r.scope] = { keys: 0, pfcount: 0, inserted: 0 });
      bucket.keys += 1;
      bucket.pfcount += r.pfcount;
      bucket.inserted += r.inserted;
      totalInserted += r.inserted;
      if (r.inserted > 0 || r.pfcount > 0) {
        const tag = r.country || "(global)";
        console.log(`  ${r.scope.padEnd(5)} ${r.bucket.padEnd(12)} ${tag.padEnd(8)} pfcount=${r.pfcount} inserted=${r.inserted}`);
      }
    } catch (e: any) {
      console.error(`error on ${key}: ${e.message}`);
    }
  }

  console.log("\n=== summary ===");
  for (const [scope, s] of Object.entries(byScope)) {
    if (s.keys > 0) {
      console.log(`${scope}: ${s.keys} keys, sum pfcount=${s.pfcount}, inserted=${s.inserted}`);
    }
  }
  console.log(`Total inserted: ${totalInserted}${DRY_RUN ? " (dry-run, no actual writes)" : ""}`);
}

await main();
