import { Hono } from "hono";
import { env } from "../lib/env";
import { db, nowSec } from "../lib/db";
import { extractAdmin } from "../lib/jwt";
import { extractIp, extractCountry } from "../lib/util";
import { checkRateLimit } from "../lib/rate-limit";

const app = new Hono();

// 답변 작성자. 'human' = 관리자가 화면(FeedbackBoard)에서 직접 작성, 'claude' = Claude가 API로 작성.
// PATCH의 replyAuthor로 지정하며, 값이 없거나 알 수 없는 값이면 'human'으로 떨어진다.
const REPLY_AUTHORS = ["human", "claude"] as const;
type ReplyAuthor = (typeof REPLY_AUTHORS)[number];

function normalizeReplyAuthor(value: unknown): ReplyAuthor {
  return REPLY_AUTHORS.includes(value as ReplyAuthor) ? (value as ReplyAuthor) : "human";
}

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
// 번역본도 같이 내려줘서 프론트가 사용자 locale에 맞춰 토글.
app.get("/public", async (c) => {
  const rows = db
    .query<
      {
        id: string;
        message: string;
        time: string;
        status: string;
        reply: string | null;
        reply_author: string | null;
        message_translated: string | null;
        message_lang: string | null;
        reply_translated: string | null;
        reply_lang: string | null;
      },
      []
    >(
      `SELECT id, message, time, status, reply, reply_author,
              message_translated, message_lang,
              reply_translated, reply_lang
       FROM feedback
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
      replyAuthor: normalizeReplyAuthor(r.reply_author),
      messageTranslated: r.message_translated,
      messageLang: r.message_lang,
      replyTranslated: r.reply_translated,
      replyLang: r.reply_lang,
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
      `SELECT id, message, time, country, ip, status, reply, reply_author, hidden,
              message_translated, message_lang, message_translated_at, message_translated_model,
              reply_translated, reply_lang, reply_translated_at, reply_translated_model
       FROM feedback
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit);

  c.header("Cache-Control", "no-store");
  return c.json({
    items: rows.map((r) => ({
      id: r.id,
      message: r.message,
      time: r.time,
      country: r.country,
      ip: r.ip,
      status: r.status,
      reply: r.reply,
      replyAuthor: normalizeReplyAuthor(r.reply_author),
      hidden: !!r.hidden,
      messageTranslated: r.message_translated,
      messageLang: r.message_lang,
      messageTranslatedAt: r.message_translated_at,
      messageTranslatedModel: r.message_translated_model,
      replyTranslated: r.reply_translated,
      replyLang: r.reply_lang,
      replyTranslatedAt: r.reply_translated_at,
      replyTranslatedModel: r.reply_translated_model,
    })),
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
    // 작성자는 답변과 항상 한 세트로 갱신 — 답변을 새로 쓰면 그 답변을 쓴 주체로 덮인다.
    // (화면에서 Claude 답변을 사람이 고쳐 저장하면 'human'으로 바뀌는 게 맞다.)
    sets.push("reply_author = ?");
    params.push(normalizeReplyAuthor(body.replyAuthor));
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
