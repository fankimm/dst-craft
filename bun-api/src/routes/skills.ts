import { Hono } from "hono";
import { db, nowSec } from "../lib/db";
import { extractSub } from "../lib/jwt";

const app = new Hono();

// GET /skills — fetch all saved skill builds for the user
app.get("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const rows = db
    .query<{ character_id: string; skills_json: string; locks_json: string }, [string]>(
      `SELECT character_id, skills_json, locks_json FROM skills_builds WHERE user_sub = ?`,
    )
    .all(sub);

  // Redis HASH 동작과 동일하게: 빈 배열 캐릭터는 응답에서 누락
  const skills: Record<string, string[]> = {};
  const locks: Record<string, string[]> = {};
  for (const r of rows) {
    let s: string[] = [];
    let l: string[] = [];
    try { s = JSON.parse(r.skills_json); } catch {}
    try { l = JSON.parse(r.locks_json); } catch {}
    if (s.length > 0) skills[r.character_id] = s;
    if (l.length > 0) locks[r.character_id] = l;
  }
  return c.json({ skills, locks });
});

// POST /skills — save skill build for one character
app.post("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const characterId = body.characterId as string;
  const skills = body.skills as string[];
  const locks = body.locks as string[];

  if (!characterId || !Array.isArray(skills) || !Array.isArray(locks)) {
    return c.json({ error: "Invalid request" }, 400);
  }

  if (skills.length === 0 && locks.length === 0) {
    db.query(`DELETE FROM skills_builds WHERE user_sub = ? AND character_id = ?`).run(sub, characterId);
  } else {
    db.query(
      `INSERT INTO skills_builds(user_sub, character_id, skills_json, locks_json, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_sub, character_id) DO UPDATE SET skills_json = excluded.skills_json, locks_json = excluded.locks_json, updated_at = excluded.updated_at`,
    ).run(sub, characterId, JSON.stringify(skills), JSON.stringify(locks), nowSec());
  }
  return c.json({ ok: true });
});

export default app;
