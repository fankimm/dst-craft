import { Hono } from "hono";
import { db, nowSec } from "../lib/db";
import { extractAdmin } from "../lib/jwt";

const app = new Hono();

// GET /config?key=...
app.get("/", async (c) => {
  const key = c.req.query("key");
  if (!key || !/^[a-z_-]+$/.test(key)) {
    return c.json({ error: "Invalid key" }, 400);
  }
  const row = db.query<{ value: string }, [string]>(`SELECT value FROM config WHERE key = ?`).get(key);
  return c.json({ key, value: row?.value ?? null });
});

// POST /config — admin only
app.post("/", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const key = body.key as string;
  const value = body.value as string;
  if (!key || !/^[a-z_-]+$/.test(key) || typeof value !== "string") {
    return c.json({ error: "Invalid request" }, 400);
  }
  db.query(
    `INSERT INTO config(key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run(key, value, nowSec());
  return c.json({ ok: true, key, value });
});

export default app;
