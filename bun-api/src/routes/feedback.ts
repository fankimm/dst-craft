import { Hono } from "hono";
import { env } from "../lib/env";
import { db, nowSec } from "../lib/db";
import { extractAdmin } from "../lib/jwt";
import { extractIp, extractCountry } from "../lib/util";
import { checkRateLimit } from "../lib/rate-limit";

const app = new Hono();

// POST /feedback — submit anonymous feedback (1/hour per IP)
app.post("/", async (c) => {
  const ip = extractIp(c);
  if (checkRateLimit(`feedback:${ip}`, 1, 3600)) {
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const message = (body.message as string)?.trim().slice(0, 1000);
  if (!message) return c.json({ error: "Message is required" }, 400);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const country = extractCountry(c);
  const time = new Date().toISOString();

  db.query(
    `INSERT INTO feedback(id, message, time, country, ip, status, hidden, created_at)
     VALUES (?, ?, ?, ?, ?, 'new', 0, ?)`,
  ).run(id, message, time, country, ip, nowSec());

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const text = `📩 새 피드백\n\n${message}\n\n🌍 ${country} · 🕐 ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
    fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }).catch(() => {});
  }

  return c.json({ ok: true, id });
});

// GET /feedback/public — public board (hides IP/country, filters hidden)
app.get("/public", async (c) => {
  const rows = db
    .query<
      { id: string; message: string; time: string; status: string; reply: string | null },
      []
    >(
      `SELECT id, message, time, status, reply FROM feedback
       WHERE hidden = 0 ORDER BY created_at DESC LIMIT 100`,
    )
    .all();
  c.header("Cache-Control", "public, max-age=60");
  return c.json({
    items: rows.map((r) => ({
      id: r.id,
      message: r.message,
      time: r.time,
      status: r.status,
      reply: r.reply,
    })),
  });
});

// GET /feedback — admin only
app.get("/", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const limit = Math.min(Number(c.req.query("limit") ?? "50"), 500);
  const rows = db
    .query<any, [number]>(
      `SELECT id, message, time, country, ip, status, reply, hidden FROM feedback
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit);

  c.header("Cache-Control", "no-store");
  return c.json({
    items: rows.map((r) => ({ ...r, hidden: !!r.hidden })),
  });
});

// PATCH /feedback — admin update
app.patch("/", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const id = body.id as string;
  const status = body.status as string | undefined;
  const reply = ((body.reply as string) ?? "").trim().slice(0, 500);
  const hidden = body.hidden as boolean | undefined;
  const validStatuses = ["new", "done", "hold", "rejected"];
  if (!id || (status !== undefined && !validStatuses.includes(status))) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const sets: string[] = [];
  const params: any[] = [];
  if (status) {
    sets.push("status = ?");
    params.push(status);
  }
  if (reply) {
    sets.push("reply = ?");
    params.push(reply);
  }
  if (hidden === true) sets.push("hidden = 1");
  if (hidden === false) sets.push("hidden = 0");

  if (sets.length > 0) {
    params.push(id);
    db.query(`UPDATE feedback SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  }
  return c.json({ ok: true });
});

// DELETE /feedback?id=...
app.delete("/", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.query("id") ?? "";
  if (!id) return c.json({ error: "Invalid request" }, 400);

  const res = db.query(`DELETE FROM feedback WHERE id = ?`).run(id);
  return c.json({ ok: true, removed: Number(res.changes) });
});

export default app;
