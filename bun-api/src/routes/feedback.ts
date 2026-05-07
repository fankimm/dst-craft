import { Hono } from "hono";
import { env } from "../lib/env";
import { redisPipeline } from "../lib/redis";
import { extractAdmin } from "../lib/jwt";
import { extractIp, extractCountry } from "../lib/util";

const app = new Hono();

// POST /feedback — submit anonymous feedback
app.post("/", async (c) => {
  const ip = extractIp(c);

  const rateLimitKey = `dst:feedback:rl:${ip}`;
  const rlCheck = await redisPipeline([["GET", rateLimitKey]]);
  if (rlCheck[0]?.result) {
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const message = (body.message as string)?.trim().slice(0, 1000);
  if (!message) return c.json({ error: "Message is required" }, 400);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const country = extractCountry(c);
  const entry = JSON.stringify({
    id,
    message,
    time: new Date().toISOString(),
    country,
    ip,
  });

  await redisPipeline([
    ["LPUSH", "dst:feedback", entry],
    ["LTRIM", "dst:feedback", "0", "499"],
    ["SET", rateLimitKey, "1", "EX", "3600"],
  ]);

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
  const results = await redisPipeline([
    ["LRANGE", "dst:feedback", "0", "99"],
    ["HGETALL", "dst:feedback:status"],
    ["HGETALL", "dst:feedback:reply"],
    ["SMEMBERS", "dst:feedback:hidden"],
  ]);

  const raw = (results[0]?.result as string[]) ?? [];
  const statusRaw = results[1]?.result as string[] | null;
  const replyRaw = results[2]?.result as string[] | null;
  const hiddenSet = new Set((results[3]?.result as string[]) ?? []);

  const statusMap: Record<string, string> = {};
  const replyMap: Record<string, string> = {};
  if (Array.isArray(statusRaw)) {
    for (let i = 0; i < statusRaw.length; i += 2) statusMap[statusRaw[i]] = statusRaw[i + 1];
  }
  if (Array.isArray(replyRaw)) {
    for (let i = 0; i < replyRaw.length; i += 2) replyMap[replyRaw[i]] = replyRaw[i + 1];
  }

  const items = raw
    .map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    })
    .filter((e: any) => e && !hiddenSet.has(e.id))
    .map((e: any) => ({
      id: e.id,
      message: e.message,
      time: e.time,
      status: statusMap[e.id] ?? "new",
      reply: replyMap[e.id] ?? null,
    }));

  c.header("Cache-Control", "public, max-age=60");
  return c.json({ items });
});

// GET /feedback — admin only
app.get("/", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const limit = Math.min(Number(c.req.query("limit") ?? "50"), 500);
  const results = await redisPipeline([
    ["LRANGE", "dst:feedback", "0", `${limit - 1}`],
    ["HGETALL", "dst:feedback:status"],
    ["HGETALL", "dst:feedback:reply"],
    ["SMEMBERS", "dst:feedback:hidden"],
  ]);
  const raw = (results[0]?.result as string[]) ?? [];
  const statusRaw = results[1]?.result as string[] | null;
  const replyRaw = results[2]?.result as string[] | null;
  const hiddenSet = new Set((results[3]?.result as string[]) ?? []);
  const statusMap: Record<string, string> = {};
  const replyMap: Record<string, string> = {};
  if (Array.isArray(statusRaw)) {
    for (let i = 0; i < statusRaw.length; i += 2) statusMap[statusRaw[i]] = statusRaw[i + 1];
  }
  if (Array.isArray(replyRaw)) {
    for (let i = 0; i < replyRaw.length; i += 2) replyMap[replyRaw[i]] = replyRaw[i + 1];
  }
  const items = raw
    .map((r) => {
      try {
        const parsed = JSON.parse(r);
        parsed.status = statusMap[parsed.id] ?? "new";
        parsed.reply = replyMap[parsed.id] ?? null;
        parsed.hidden = hiddenSet.has(parsed.id);
        return parsed;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  c.header("Cache-Control", "no-store");
  return c.json({ items });
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

  const ops: any[][] = [];
  if (status) ops.push(["HSET", "dst:feedback:status", id, status]);
  if (reply) ops.push(["HSET", "dst:feedback:reply", id, reply]);
  if (hidden === true) ops.push(["SADD", "dst:feedback:hidden", id]);
  if (hidden === false) ops.push(["SREM", "dst:feedback:hidden", id]);
  if (ops.length > 0) await redisPipeline(ops);
  return c.json({ ok: true });
});

// DELETE /feedback?id=...
app.delete("/", async (c) => {
  const admin = await extractAdmin(c.req.header("Authorization"));
  if (!admin) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.query("id") ?? "";
  if (!id) return c.json({ error: "Invalid request" }, 400);

  const listRes = await redisPipeline([["LRANGE", "dst:feedback", "0", "-1"]]);
  const raw = (listRes[0]?.result as string[]) ?? [];
  const target = raw.find((r) => {
    try {
      return JSON.parse(r)?.id === id;
    } catch {
      return false;
    }
  });
  if (!target) {
    await redisPipeline([
      ["HDEL", "dst:feedback:status", id],
      ["HDEL", "dst:feedback:reply", id],
      ["SREM", "dst:feedback:hidden", id],
    ]);
    return c.json({ ok: true, removed: 0 });
  }

  const ops = await redisPipeline([
    ["LREM", "dst:feedback", "1", target],
    ["HDEL", "dst:feedback:status", id],
    ["HDEL", "dst:feedback:reply", id],
    ["SREM", "dst:feedback:hidden", id],
  ]);
  const removed = Number(ops[0]?.result ?? 0);
  return c.json({ ok: true, removed });
});

export default app;
