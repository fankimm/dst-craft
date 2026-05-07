#!/usr/bin/env bun
/**
 * Upstash Redis → SQLite 일회성 마이그레이션. 멱등(재실행 가능).
 *
 * 실행:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *     JWT_SECRET=... GOOGLE_CLIENT_ID=... \
 *     bun scripts/migrate-upstash.ts [--dry-run]
 *
 * 주의: dst:uv:* (HyperLogLog) 는 IP 추출 불가 → 마이그레이션 안 함.
 *       UV 카운트는 마이그레이션 시점부터 새로 누적.
 */
import { db } from "../src/lib/db";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error("Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const stats: Record<string, number> = {};
const bump = (key: string, by = 1) => {
  stats[key] = (stats[key] ?? 0) + by;
};

async function redis(commands: unknown[][]): Promise<any[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { result: any }[];
  return json.map((r) => r.result);
}

async function scanAll(pattern: string, count = 200): Promise<string[]> {
  let cursor = "0";
  const keys: string[] = [];
  do {
    const [res] = await redis([["SCAN", cursor, "MATCH", pattern, "COUNT", String(count)]]);
    cursor = res[0];
    for (const k of res[1]) keys.push(k);
  } while (cursor !== "0");
  return keys;
}

const now = Math.floor(Date.now() / 1000);

// ─── 사용자/유저 ───
async function migrateUsers() {
  for (const key of await scanAll("dst:user:*")) {
    const sub = key.slice("dst:user:".length);
    const [hash] = await redis([["HGETALL", key]]);
    if (!Array.isArray(hash) || hash.length === 0) continue;
    const obj: Record<string, string> = {};
    for (let i = 0; i < hash.length; i += 2) obj[hash[i]] = hash[i + 1];
    if (!DRY_RUN) {
      db.query(
        `INSERT INTO users(sub, email, name, picture, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(sub) DO UPDATE SET email = excluded.email, name = excluded.name, picture = excluded.picture, updated_at = excluded.updated_at`,
      ).run(sub, obj.email ?? "", obj.name ?? "", obj.picture ?? "", now);
    }
    bump("users");
  }
}

async function migrateFavorites() {
  for (const key of await scanAll("dst:fav:*")) {
    const sub = key.slice("dst:fav:".length);
    const [members] = await redis([["SMEMBERS", key]]);
    if (!Array.isArray(members)) continue;
    for (const itemId of members) {
      if (!DRY_RUN) {
        db.query(`INSERT OR IGNORE INTO favorites(user_sub, item_id, created_at) VALUES (?, ?, ?)`).run(
          sub,
          itemId,
          now,
        );
      }
      bump("favorites");
    }
  }
}

async function migrateSkills() {
  // skills:<sub> 와 skills-locks:<sub>가 동시 존재. SCAN으로 sub 모음 후 둘 다 조회.
  const subs = new Set<string>();
  for (const key of await scanAll("dst:skills:*")) subs.add(key.slice("dst:skills:".length));
  for (const key of await scanAll("dst:skills-locks:*")) subs.add(key.slice("dst:skills-locks:".length));

  for (const sub of subs) {
    const [skillsHash, locksHash] = await redis([
      ["HGETALL", `dst:skills:${sub}`],
      ["HGETALL", `dst:skills-locks:${sub}`],
    ]);
    const skills: Record<string, string> = {};
    const locks: Record<string, string> = {};
    if (Array.isArray(skillsHash)) {
      for (let i = 0; i < skillsHash.length; i += 2) skills[skillsHash[i]] = skillsHash[i + 1];
    }
    if (Array.isArray(locksHash)) {
      for (let i = 0; i < locksHash.length; i += 2) locks[locksHash[i]] = locksHash[i + 1];
    }
    const charIds = new Set([...Object.keys(skills), ...Object.keys(locks)]);
    for (const charId of charIds) {
      const s = skills[charId] ?? "[]";
      const l = locks[charId] ?? "[]";
      if (!DRY_RUN) {
        db.query(
          `INSERT INTO skills_builds(user_sub, character_id, skills_json, locks_json, updated_at) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(user_sub, character_id) DO UPDATE SET skills_json = excluded.skills_json, locks_json = excluded.locks_json, updated_at = excluded.updated_at`,
        ).run(sub, charId, s, l, now);
      }
      bump("skills_builds");
    }
  }
}

async function migrateFeedback() {
  const [entries, statusHash, replyHash, hiddenSet] = await redis([
    ["LRANGE", "dst:feedback", "0", "-1"],
    ["HGETALL", "dst:feedback:status"],
    ["HGETALL", "dst:feedback:reply"],
    ["SMEMBERS", "dst:feedback:hidden"],
  ]);
  const status: Record<string, string> = {};
  const reply: Record<string, string> = {};
  if (Array.isArray(statusHash)) for (let i = 0; i < statusHash.length; i += 2) status[statusHash[i]] = statusHash[i + 1];
  if (Array.isArray(replyHash)) for (let i = 0; i < replyHash.length; i += 2) reply[replyHash[i]] = replyHash[i + 1];
  const hidden = new Set<string>(Array.isArray(hiddenSet) ? hiddenSet : []);

  if (!Array.isArray(entries)) return;
  for (const raw of entries) {
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const id = parsed.id;
    if (!id) continue;
    if (!DRY_RUN) {
      db.query(
        `INSERT INTO feedback(id, message, time, country, ip, status, reply, hidden, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET status = excluded.status, reply = excluded.reply, hidden = excluded.hidden`,
      ).run(
        id,
        parsed.message ?? "",
        parsed.time ?? "",
        parsed.country ?? "",
        parsed.ip ?? "",
        status[id] ?? "new",
        reply[id] ?? null,
        hidden.has(id) ? 1 : 0,
        Math.floor(new Date(parsed.time).getTime() / 1000) || now,
      );
    }
    bump("feedback");
  }
}

async function migrateSupporters() {
  const [zrange, txIds] = await redis([
    ["ZRANGE", "dst:supporters", "0", "-1", "WITHSCORES"],
    ["SMEMBERS", "dst:kofi:tx"],
  ]);
  if (Array.isArray(zrange)) {
    for (let i = 0; i < zrange.length; i += 2) {
      const name = zrange[i];
      const cents = parseInt(zrange[i + 1], 10) || 0;
      if (cents <= 0) continue;
      if (!DRY_RUN) {
        db.query(
          `INSERT INTO supporters(name, cents, updated_at) VALUES (?, ?, ?)
           ON CONFLICT(name) DO UPDATE SET cents = excluded.cents, updated_at = excluded.updated_at`,
        ).run(name, cents, now);
      }
      bump("supporters");
    }
  }
  if (Array.isArray(txIds)) {
    for (const txId of txIds) {
      if (!DRY_RUN) {
        db.query(`INSERT OR IGNORE INTO kofi_transactions(tx_id, created_at) VALUES (?, ?)`).run(txId, now);
      }
      bump("kofi_transactions");
    }
  }
}

async function migrateConfig() {
  for (const key of await scanAll("dst:config:*")) {
    const k = key.slice("dst:config:".length);
    const [value] = await redis([["GET", key]]);
    if (typeof value !== "string") continue;
    if (!DRY_RUN) {
      db.query(
        `INSERT INTO config(key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      ).run(k, value, now);
    }
    bump("config");
  }
}

async function migrateAdminIps() {
  const [ips] = await redis([["SMEMBERS", "dst:admin-ips"]]);
  if (!Array.isArray(ips)) return;
  for (const ip of ips) {
    if (!DRY_RUN) {
      db.query(`INSERT OR IGNORE INTO admin_ips(ip, created_at) VALUES (?, ?)`).run(ip, now);
    }
    bump("admin_ips");
  }
}

async function migrateRatingIps() {
  const [hash] = await redis([["HGETALL", "dst:rating:ips"]]);
  if (!Array.isArray(hash)) return;
  for (let i = 0; i < hash.length; i += 2) {
    const ip = hash[i];
    const rating = parseInt(hash[i + 1], 10);
    if (!ip || !Number.isInteger(rating) || rating < 1 || rating > 5) continue;
    if (!DRY_RUN) {
      db.query(
        `INSERT INTO rating_ips(ip, rating) VALUES (?, ?)
         ON CONFLICT(ip) DO UPDATE SET rating = excluded.rating`,
      ).run(ip, rating);
    }
    bump("rating_ips");
  }
}

function setCounter(scope: string, bucket: string, country: string, count: number) {
  if (count === 0) return;
  if (!DRY_RUN) {
    db.query(
      `INSERT INTO analytics_counters(scope, bucket, country, count) VALUES (?, ?, ?, ?)
       ON CONFLICT(scope, bucket, country) DO UPDATE SET count = excluded.count`,
    ).run(scope, bucket, country, count);
  }
  bump("counters");
}

async function migrateCounters() {
  const singletons: Array<[string, [string, string, string]]> = [
    ["dst:pv:total", ["pv_total", "", ""]],
    ["dst:return:total", ["return_total", "", ""]],
    ["dst:events:search", ["event", "search", ""]],
    ["dst:events:pwa_install", ["event", "pwa_install", ""]],
    ["dst:events:share", ["event", "share", ""]],
    ["dst:events:github_star_click", ["event", "github_star_click", ""]],
    ["dst:supporters:count", ["supporters_count", "", ""]],
  ];
  if (singletons.length > 0) {
    const cmds = singletons.map(([key]) => ["GET", key]);
    const results = await redis(cmds);
    singletons.forEach(([, [scope, bucket, country]], i) => {
      setCounter(scope, bucket, country, parseInt(results[i] ?? "0", 10) || 0);
    });
  }

  // dst:pv:* (total:cc, day, day:cc / monthly와 m:는 별도 처리 후 skip)
  const pvKeys = await scanAll("dst:pv:*");
  const pvBatch: Array<[string, [string, string, string]]> = [];
  for (const key of pvKeys) {
    if (key === "dst:pv:total") continue;
    const rest = key.slice("dst:pv:".length);
    if (rest.startsWith("m:")) continue;
    if (rest.startsWith("total:")) {
      pvBatch.push([key, ["pv_total", "", rest.slice("total:".length)]]);
    } else {
      const idx = rest.indexOf(":");
      if (idx === -1) pvBatch.push([key, ["pv_day", rest, ""]]);
      else pvBatch.push([key, ["pv_day", rest.slice(0, idx), rest.slice(idx + 1)]]);
    }
  }
  if (pvBatch.length > 0) {
    const results = await redis(pvBatch.map(([key]) => ["GET", key]));
    pvBatch.forEach(([, [scope, bucket, country]], i) => {
      setCounter(scope, bucket, country, parseInt(results[i] ?? "0", 10) || 0);
    });
  }

  // dst:pv:m:*
  const monthKeys = await scanAll("dst:pv:m:*");
  const monthBatch: Array<[string, [string, string, string]]> = [];
  for (const key of monthKeys) {
    const rest = key.slice("dst:pv:m:".length);
    const idx = rest.indexOf(":");
    if (idx === -1) monthBatch.push([key, ["pv_month", rest, ""]]);
    else monthBatch.push([key, ["pv_month", rest.slice(0, idx), rest.slice(idx + 1)]]);
  }
  if (monthBatch.length > 0) {
    const results = await redis(monthBatch.map(([key]) => ["GET", key]));
    monthBatch.forEach(([, [scope, bucket, country]], i) => {
      setCounter(scope, bucket, country, parseInt(results[i] ?? "0", 10) || 0);
    });
  }

  // dst:return:total:*
  const returnKeys = await scanAll("dst:return:total:*");
  if (returnKeys.length > 0) {
    const results = await redis(returnKeys.map((key) => ["GET", key]));
    returnKeys.forEach((key, i) => {
      const cc = key.slice("dst:return:total:".length);
      setCounter("return_total", "", cc, parseInt(results[i] ?? "0", 10) || 0);
    });
  }

  // HASH global counters
  const hashScopes: Array<[string, string]> = [
    ["dst:device", "device"],
    ["dst:os", "os"],
    ["dst:referrers", "referrer"],
    ["dst:ratings", "rating"],
    ["dst:geo:countries", "geo"],
  ];
  for (const [redisKey, scope] of hashScopes) {
    const [hash] = await redis([["HGETALL", redisKey]]);
    if (!Array.isArray(hash)) continue;
    for (let i = 0; i < hash.length; i += 2) {
      setCounter(scope, hash[i], "", parseInt(hash[i + 1], 10) || 0);
    }
  }

  // HASH country-suffixed: dst:device:KR / dst:os:KR / dst:referrers:KR
  for (const [prefix, scope] of [
    ["dst:device", "device"],
    ["dst:os", "os"],
    ["dst:referrers", "referrer"],
  ] as const) {
    const keys = await scanAll(`${prefix}:*`);
    for (const key of keys) {
      const cc = key.slice(prefix.length + 1);
      const [hash] = await redis([["HGETALL", key]]);
      if (!Array.isArray(hash)) continue;
      for (let i = 0; i < hash.length; i += 2) {
        setCounter(scope, hash[i], cc, parseInt(hash[i + 1], 10) || 0);
      }
    }
  }
}

async function migrateVisitors() {
  const [entries] = await redis([["LRANGE", "dst:visitors", "0", "-1"]]);
  if (!Array.isArray(entries)) return;
  // LPUSH 순(최신부터). 오래된 → 최신 순으로 INSERT 하기 위해 reverse.
  for (const raw of [...entries].reverse()) {
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!DRY_RUN) {
      db.query(
        `INSERT INTO analytics_visitors(ip, country, ua, device, os, time) VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        parsed.ip ?? "",
        parsed.country ?? "",
        parsed.ua ?? "",
        parsed.device ?? "",
        parsed.os ?? "",
        parsed.time ?? "",
      );
    }
    bump("visitors");
  }
}

async function migrateDuration() {
  const [entries] = await redis([["LRANGE", "dst:duration:samples", "0", "-1"]]);
  if (!Array.isArray(entries)) return;
  for (const raw of [...entries].reverse()) {
    const d = parseInt(raw, 10);
    if (!Number.isFinite(d)) continue;
    if (!DRY_RUN) {
      db.query(`INSERT INTO analytics_duration_samples(duration) VALUES (?)`).run(d);
    }
    bump("duration");
  }
}

async function migrateClicks() {
  const [zrange] = await redis([["ZRANGE", "dst:clicks", "0", "-1", "WITHSCORES"]]);
  if (!Array.isArray(zrange)) return;
  for (let i = 0; i < zrange.length; i += 2) {
    const itemId = zrange[i];
    const count = parseInt(zrange[i + 1], 10) || 0;
    if (count === 0) continue;
    if (!DRY_RUN) {
      db.query(
        `INSERT INTO analytics_clicks(item_id, count) VALUES (?, ?)
         ON CONFLICT(item_id) DO UPDATE SET count = excluded.count`,
      ).run(itemId, count);
    }
    bump("clicks");
  }
}

async function migrateCombos() {
  for (const key of await scanAll("dst:combo:*")) {
    const recipeId = key.slice("dst:combo:".length);
    const [zrange] = await redis([["ZRANGE", key, "0", "-1", "WITHSCORES"]]);
    if (!Array.isArray(zrange)) continue;
    for (let i = 0; i < zrange.length; i += 2) {
      const comboKey = zrange[i];
      const count = parseInt(zrange[i + 1], 10) || 0;
      if (count === 0) continue;
      if (!DRY_RUN) {
        db.query(
          `INSERT INTO analytics_combos(recipe_id, combo_key, count) VALUES (?, ?, ?)
           ON CONFLICT(recipe_id, combo_key) DO UPDATE SET count = excluded.count`,
        ).run(recipeId, comboKey, count);
      }
      bump("combos");
    }
  }
}

const TASKS: Array<[string, () => Promise<void>]> = [
  ["users", migrateUsers],
  ["favorites", migrateFavorites],
  ["skills_builds", migrateSkills],
  ["feedback", migrateFeedback],
  ["supporters", migrateSupporters],
  ["config", migrateConfig],
  ["admin_ips", migrateAdminIps],
  ["rating_ips", migrateRatingIps],
  ["counters", migrateCounters],
  ["visitors", migrateVisitors],
  ["duration_samples", migrateDuration],
  ["clicks", migrateClicks],
  ["combos", migrateCombos],
];

const t0 = performance.now();
for (const [name, fn] of TASKS) {
  process.stdout.write(`[${name}] `);
  try {
    await fn();
    console.log("ok");
  } catch (e: any) {
    console.log(`FAILED: ${e.message ?? e}`);
    throw e;
  }
}
const elapsed = ((performance.now() - t0) / 1000).toFixed(1);

console.log(`\n${DRY_RUN ? "[DRY-RUN] " : ""}done in ${elapsed}s`);
console.log(stats);
console.log("\nNote: dst:uv:* (HyperLogLog) was NOT migrated — UV count starts fresh.");
