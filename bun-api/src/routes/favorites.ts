import { Hono } from "hono";
import { db, nowSec } from "../lib/db";
import { extractSub } from "../lib/jwt";

const app = new Hono();

// GET /favorites
app.get("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const rows = db
    .query<{ item_id: string }, [string]>(`SELECT item_id FROM favorites WHERE user_sub = ?`)
    .all(sub);
  return c.json({ items: rows.map((r) => r.item_id) });
});

// POST /favorites — add/remove
app.post("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const itemId = body.itemId as string;
  const action = body.action as string;
  if (!itemId || (action !== "add" && action !== "remove")) {
    return c.json({ error: "Invalid request" }, 400);
  }

  if (action === "add") {
    db.query(`INSERT OR IGNORE INTO favorites(user_sub, item_id, created_at) VALUES (?, ?, ?)`).run(
      sub,
      itemId,
      nowSec(),
    );
  } else {
    db.query(`DELETE FROM favorites WHERE user_sub = ? AND item_id = ?`).run(sub, itemId);
  }
  return c.json({ ok: true });
});

export default app;
