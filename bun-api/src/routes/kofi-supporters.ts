import { Hono } from "hono";
import { env } from "../lib/env";
import { db, nowSec, bumpCounter } from "../lib/db";
import { extractAdmin } from "../lib/jwt";

const app = new Hono();

// POST /kofi-webhook
app.post("/kofi-webhook", async (c) => {
  const form = await c.req.formData().catch(() => null);
  const dataStr = form?.get("data");
  if (typeof dataStr !== "string") return c.json({ error: "Missing data" }, 400);

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(dataStr);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  if (payload.verification_token !== env.KOFI_VERIFICATION_TOKEN) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const isPublic = payload.is_public === true;
  const fromName = (typeof payload.from_name === "string" ? payload.from_name.trim() : "").slice(0, 60);
  const displayName = !isPublic || !fromName || /^anonymous$/i.test(fromName) ? "__anon__" : fromName;

  const amount = parseFloat(String(payload.amount ?? "0"));
  const cents = Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
  if (cents <= 0) return c.json({ ok: true, skipped: "no amount" });

  const txId = typeof payload.kofi_transaction_id === "string" ? payload.kofi_transaction_id : "";
  if (txId) {
    const res = db.query(`INSERT OR IGNORE INTO kofi_transactions(tx_id, created_at) VALUES (?, ?)`).run(txId, nowSec());
    if (Number(res.changes) === 0) {
      return c.json({ ok: true, skipped: "duplicate" });
    }
  }

  db.query(
    `INSERT INTO supporters(name, cents, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET cents = cents + excluded.cents, updated_at = excluded.updated_at`,
  ).run(displayName, cents, nowSec());

  bumpCounter("supporters_count", "", "");

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const currency = (payload.currency as string) ?? "USD";
    const message = (payload.message as string) ?? "";
    const text = `☕ 새 ko-fi 후원!\n\n${displayName === "__anon__" ? "(익명)" : displayName} · ${amount} ${currency}\n${message ? `\n💬 ${message}` : ""}`;
    fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }).catch(() => {});
  }

  return c.json({ ok: true });
});

// GET /supporters — public top
app.get("/supporters", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? "5"), 20);
  const rows = db
    .query<{ name: string }, [number]>(
      `SELECT name FROM supporters ORDER BY cents DESC, name ASC LIMIT ?`,
    )
    .all(limit);
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ supporters: rows.map((r) => ({ name: r.name })) });
});

// POST /supporters — admin manual add
app.post("/supporters", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const cents = Number.isInteger(body.cents) ? body.cents : 0;
  if (!name || cents <= 0) return c.json({ error: "name + cents required" }, 400);

  db.query(
    `INSERT INTO supporters(name, cents, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET cents = cents + excluded.cents, updated_at = excluded.updated_at`,
  ).run(name, cents, nowSec());
  return c.json({ ok: true, name, cents });
});

// DELETE /supporters?name=...
app.delete("/supporters", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const name = c.req.query("name") ?? "";
  if (!name) return c.json({ error: "name required" }, 400);

  const res = db.query(`DELETE FROM supporters WHERE name = ?`).run(name);
  return c.json({ ok: true, removed: Number(res.changes) });
});

export default app;
