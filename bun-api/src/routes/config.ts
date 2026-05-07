import { Hono } from "hono";
import { redisPipeline } from "../lib/redis";
import { extractAdmin } from "../lib/jwt";

const app = new Hono();

// GET /config?key=...
app.get("/", async (c) => {
  const key = c.req.query("key");
  if (!key || !/^[a-z_-]+$/.test(key)) {
    return c.json({ error: "Invalid key" }, 400);
  }
  const result = await redisPipeline([["GET", `dst:config:${key}`]]);
  const value = result[0]?.result ?? null;
  return c.json({ key, value });
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
  await redisPipeline([["SET", `dst:config:${key}`, value]]);
  return c.json({ ok: true, key, value });
});

export default app;
