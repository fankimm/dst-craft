import { Hono } from "hono";
import { redisPipeline } from "../lib/redis";
import { extractSub } from "../lib/jwt";

const app = new Hono();

// GET /favorites
app.get("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const results = await redisPipeline([["SMEMBERS", `dst:fav:${sub}`]]);
  const items = (results[0]?.result as string[]) ?? [];
  return c.json({ items });
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

  const cmd = action === "add" ? "SADD" : "SREM";
  await redisPipeline([[cmd, `dst:fav:${sub}`, itemId]]);
  return c.json({ ok: true });
});

export default app;
