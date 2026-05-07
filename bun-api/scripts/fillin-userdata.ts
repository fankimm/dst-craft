#!/usr/bin/env bun
/**
 * 부분 재마이그 — Phase 5.5 cutover 전후 갭의 사용자 데이터 회수.
 *
 * 포함: users, favorites, skills_builds, feedback, kofi_transactions, admin_ips, config
 * 제외: counters / UV / visitors / duration / clicks / combos / supporters / rating_ips
 *       (post-cutover SQLite 증가분이 덮어쓰기될 위험)
 *
 * 모든 INSERT는 OR IGNORE 또는 동등 비교 후 UPSERT — SQLite-side post-cutover 변경 보존.
 *
 * 실행: bun scripts/fillin-userdata.ts
 *   (UPSTASH_REDIS_REST_URL/TOKEN .env에서 자동 로드)
 */
import { db } from "../src/lib/db";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error("Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
}

const stats: Record<string, { inserted: number; skipped: number }> = {};
const bump = (key: string, kind: "inserted" | "skipped") => {
  if (!stats[key]) stats[key] = { inserted: 0, skipped: 0 };
  stats[key][kind] += 1;
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
  return ((await res.json()) as { result: any }[]).map((r) => r.result);
}

async function scanAll(pattern: string): Promise<string[]> {
  let cursor = "0";
  const keys: string[] = [];
  do {
    const [res] = await redis([["SCAN", cursor, "MATCH", pattern, "COUNT", "200"]]);
    cursor = res[0];
    for (const k of res[1]) keys.push(k);
  } while (cursor !== "0");
  return keys;
}

const now = Math.floor(Date.now() / 1000);

// users — 이미 SQLite에 있으면 skip (Google 프로필 재인증 시 자동 갱신되니 손실 무관)
async function fillUsers() {
  for (const key of await scanAll("dst:user:*")) {
    const sub = key.slice("dst:user:".length);
    const existing = db.query<{ sub: string }, [string]>(`SELECT sub FROM users WHERE sub = ?`).get(sub);
    if (existing) {
      bump("users", "skipped");
      continue;
    }
    const [hash] = await redis([["HGETALL", key]]);
    if (!Array.isArray(hash) || hash.length === 0) continue;
    const obj: Record<string, string> = {};
    for (let i = 0; i < hash.length; i += 2) obj[hash[i]] = hash[i + 1];
    db.query(
      `INSERT INTO users(sub, email, name, picture, updated_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(sub, obj.email ?? "", obj.name ?? "", obj.picture ?? "", now);
    bump("users", "inserted");
  }
}

// favorites — INSERT OR IGNORE (자체가 add-only 시맨틱이라 100% 안전)
async function fillFavorites() {
  for (const key of await scanAll("dst:fav:*")) {
    const sub = key.slice("dst:fav:".length);
    const [members] = await redis([["SMEMBERS", key]]);
    if (!Array.isArray(members)) continue;
    for (const itemId of members) {
      const result = db
        .query(`INSERT OR IGNORE INTO favorites(user_sub, item_id, created_at) VALUES (?, ?, ?)`)
        .run(sub, itemId, now);
      bump("favorites", Number(result.changes) > 0 ? "inserted" : "skipped");
    }
  }
}

// skills_builds — (user_sub, character_id) 기존 행이면 skip. SQLite-side 변경 보존.
async function fillSkills() {
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
      const result = db
        .query(
          `INSERT OR IGNORE INTO skills_builds(user_sub, character_id, skills_json, locks_json, updated_at) VALUES (?, ?, ?, ?, ?)`,
        )
        .run(sub, charId, skills[charId] ?? "[]", locks[charId] ?? "[]", now);
      bump("skills_builds", Number(result.changes) > 0 ? "inserted" : "skipped");
    }
  }
}

// feedback — id 기준 INSERT OR IGNORE (SQLite admin status 변경 보존)
async function fillFeedback() {
  const [entries, statusHash, replyHash, hiddenSet] = await redis([
    ["LRANGE", "dst:feedback", "0", "-1"],
    ["HGETALL", "dst:feedback:status"],
    ["HGETALL", "dst:feedback:reply"],
    ["SMEMBERS", "dst:feedback:hidden"],
  ]);
  const status: Record<string, string> = {};
  const reply: Record<string, string> = {};
  if (Array.isArray(statusHash))
    for (let i = 0; i < statusHash.length; i += 2) status[statusHash[i]] = statusHash[i + 1];
  if (Array.isArray(replyHash))
    for (let i = 0; i < replyHash.length; i += 2) reply[replyHash[i]] = replyHash[i + 1];
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
    const result = db
      .query(
        `INSERT OR IGNORE INTO feedback(id, message, time, country, ip, status, reply, hidden, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
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
    bump("feedback", Number(result.changes) > 0 ? "inserted" : "skipped");
  }
}

// kofi_transactions — INSERT OR IGNORE (안전)
async function fillKofiTx() {
  const [txIds] = await redis([["SMEMBERS", "dst:kofi:tx"]]);
  if (!Array.isArray(txIds)) return;
  for (const txId of txIds) {
    const result = db
      .query(`INSERT OR IGNORE INTO kofi_transactions(tx_id, created_at) VALUES (?, ?)`)
      .run(txId, now);
    bump("kofi_transactions", Number(result.changes) > 0 ? "inserted" : "skipped");
  }
}

// admin_ips — INSERT OR IGNORE
async function fillAdminIps() {
  const [ips] = await redis([["SMEMBERS", "dst:admin-ips"]]);
  if (!Array.isArray(ips)) return;
  for (const ip of ips) {
    const result = db.query(`INSERT OR IGNORE INTO admin_ips(ip, created_at) VALUES (?, ?)`).run(ip, now);
    bump("admin_ips", Number(result.changes) > 0 ? "inserted" : "skipped");
  }
}

// config — UPSERT only if value differs (admin manual, drift 가능성)
async function fillConfig() {
  for (const key of await scanAll("dst:config:*")) {
    const k = key.slice("dst:config:".length);
    const [value] = await redis([["GET", key]]);
    if (typeof value !== "string") continue;
    const existing = db.query<{ value: string }, [string]>(`SELECT value FROM config WHERE key = ?`).get(k);
    if (existing && existing.value === value) {
      bump("config", "skipped");
      continue;
    }
    db.query(
      `INSERT INTO config(key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    ).run(k, value, now);
    bump("config", "inserted");
  }
}

const TASKS: Array<[string, () => Promise<void>]> = [
  ["users", fillUsers],
  ["favorites", fillFavorites],
  ["skills_builds", fillSkills],
  ["feedback", fillFeedback],
  ["kofi_transactions", fillKofiTx],
  ["admin_ips", fillAdminIps],
  ["config", fillConfig],
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

console.log(`\nfillin done in ${elapsed}s`);
console.log(stats);
console.log("\nNote: counters/UV/visitors/clicks/combos/supporters/rating_ips skipped to preserve post-cutover SQLite-side changes.");
