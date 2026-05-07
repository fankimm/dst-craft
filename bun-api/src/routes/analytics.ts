import { Hono } from "hono";
import {
  db,
  nowSec,
  bumpCounter,
  getCounter,
  addUv,
  countUv,
  countUvExcludingCountry,
} from "../lib/db";
import { verifyJWT } from "../lib/jwt";
import { today, isMobile, parseOS, extractIp, extractCountry } from "../lib/util";
import { checkRateLimit } from "../lib/rate-limit";

const app = new Hono();

// POST /track — page view
app.post("/track", async (c) => {
  const ip = extractIp(c);
  if (checkRateLimit(`rl:track:${ip}`, 30, 60)) {
    return c.json({ error: "Too many requests" }, 429);
  }
  const countryCode = extractCountry(c);
  const date = today();
  const month = date.slice(0, 7);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const ua = (body.ua as string)?.slice(0, 120) ?? "";
  const isReturn = !!body.isReturn;
  const device = isMobile(ua) ? "mobile" : "desktop";
  const os = parseOS(ua);

  // PV counters
  bumpCounter("pv_total", "", "");
  bumpCounter("pv_day", date, "");
  bumpCounter("pv_month", month, "");
  bumpCounter("device", device, "");
  bumpCounter("os", os, "");

  if (countryCode) {
    bumpCounter("pv_total", "", countryCode);
    bumpCounter("pv_day", date, countryCode);
    bumpCounter("pv_month", month, countryCode);
    bumpCounter("geo", countryCode, "");
    bumpCounter("device", device, countryCode);
    bumpCounter("os", os, countryCode);
  }

  // UV
  addUv("total", "", "", ip);
  addUv("day", date, "", ip);
  addUv("month", month, "", ip);
  if (countryCode) {
    addUv("total", "", countryCode, ip);
    addUv("day", date, countryCode, ip);
    addUv("month", month, countryCode, ip);
  }

  // Return visitors
  if (isReturn) {
    bumpCounter("return_total", "", "");
    if (countryCode) bumpCounter("return_total", "", countryCode);
  }

  // Referrer
  const referrer = (body.referrer as string)?.slice(0, 100);
  if (referrer && referrer !== "direct") {
    bumpCounter("referrer", referrer, "");
    if (countryCode) bumpCounter("referrer", referrer, countryCode);
  }

  // Visitor log (rolling 200, trimmed by trigger)
  db.query(
    `INSERT INTO analytics_visitors(ip, country, ua, device, os, time) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(ip, countryCode, ua, device, os, new Date().toISOString());

  return c.json({ ok: true });
});

// POST /event
app.post("/event", async (c) => {
  const ip = extractIp(c);
  if (checkRateLimit(`rl:event:${ip}`, 30, 60)) {
    return c.json({ error: "Too many requests" }, 429);
  }
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const type = body.type as string;

  if (type === "search") bumpCounter("event", "search", "");
  else if (type === "pwa_install") bumpCounter("event", "pwa_install", "");
  else if (type === "share") bumpCounter("event", "share", "");
  else if (type === "github_star_click") bumpCounter("event", "github_star_click", "");
  else if (type === "item_click" && typeof body.itemId === "string") {
    const itemId = (body.itemId as string).slice(0, 100);
    db.query(
      `INSERT INTO analytics_clicks(item_id, count) VALUES (?, 1)
       ON CONFLICT(item_id) DO UPDATE SET count = count + 1`,
    ).run(itemId);
  } else if (type === "duration" && typeof body.value === "number") {
    const duration = Math.min(Math.max(Math.round(body.value), 0), 3600);
    db.query(`INSERT INTO analytics_duration_samples(duration) VALUES (?)`).run(duration);
  }

  return c.json({ ok: true });
});

// GET /popular
app.get("/popular", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? "200"), 500);
  const rows = db
    .query<{ item_id: string; count: number }, [number]>(
      `SELECT item_id, count FROM analytics_clicks ORDER BY count DESC LIMIT ?`,
    )
    .all(limit);
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ items: rows.map((r) => ({ id: r.item_id, clicks: r.count })) });
});

// POST /combo
app.post("/combo", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const recipeId = typeof body.recipeId === "string" ? body.recipeId.slice(0, 60) : "";
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
  if (!recipeId || ingredients.length !== 4 || !ingredients.every((i: any) => typeof i === "string")) {
    return c.json({ error: "recipeId + 4 ingredient strings required" }, 400);
  }
  const comboKey = (ingredients as string[]).map((s) => s.slice(0, 60)).sort().join(",");
  db.query(
    `INSERT INTO analytics_combos(recipe_id, combo_key, count) VALUES (?, ?, 1)
     ON CONFLICT(recipe_id, combo_key) DO UPDATE SET count = count + 1`,
  ).run(recipeId, comboKey);
  return c.json({ ok: true });
});

// GET /combos/:recipeId
app.get("/combos/:recipeId", async (c) => {
  const recipeId = c.req.param("recipeId").slice(0, 60);
  if (!recipeId) return c.json({ combos: [] });

  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 50);
  const rows = db
    .query<{ combo_key: string; count: number }, [string, number]>(
      `SELECT combo_key, count FROM analytics_combos WHERE recipe_id = ? ORDER BY count DESC LIMIT ?`,
    )
    .all(recipeId, limit);
  c.header("Cache-Control", "public, max-age=60");
  return c.json({
    combos: rows.map((r) => ({ ingredients: r.combo_key.split(","), count: r.count })),
  });
});

// POST /rate
app.post("/rate", async (c) => {
  const ip = extractIp(c);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ error: "rating must be an integer between 1 and 5" }, 400);
  }

  const prev = db.query<{ rating: number }, [string]>(`SELECT rating FROM rating_ips WHERE ip = ?`).get(ip);
  if (prev?.rating === rating) return c.json({ ok: true });

  db.transaction(() => {
    if (prev) bumpCounter("rating", String(prev.rating), "", -1);
    bumpCounter("rating", String(rating), "");
    db.query(
      `INSERT INTO rating_ips(ip, rating) VALUES (?, ?)
       ON CONFLICT(ip) DO UPDATE SET rating = excluded.rating`,
    ).run(ip, rating);
  })();

  return c.json({ ok: true });
});

// GET /top-countries
app.get("/top-countries", async (c) => {
  const rows = db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'geo' AND country = '' ORDER BY count DESC LIMIT 5`,
    )
    .all();
  c.header("Cache-Control", "public, max-age=60");
  return c.json(rows.map((r) => ({ code: r.bucket, count: r.count })));
});

// GET /rating
app.get("/rating", async (c) => {
  const rows = db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'rating' AND country = ''`,
    )
    .all();
  let total = 0;
  let sum = 0;
  const ratings: Record<string, number> = {};
  for (const r of rows) {
    const star = parseInt(r.bucket, 10);
    total += r.count;
    sum += star * r.count;
    ratings[r.bucket] = r.count;
  }
  const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  c.header("Cache-Control", "no-store");
  return c.json({ avg, total, ratings });
});

// GET /stats — admin가 아니면 recentVisitors 비공개
app.get("/stats", async (c) => {
  const auth = c.req.header("Authorization") ?? "";
  let isAdmin = false;
  if (auth.startsWith("Bearer ")) {
    const jwtPayload = await verifyJWT(auth.slice(7));
    isAdmin = !!(jwtPayload && jwtPayload.role === "admin");
  }

  const date = today();
  const daysParam = Math.min(Math.max(parseInt(c.req.query("days") ?? "7", 10) || 7, 1), 365);
  const dates: string[] = [];
  for (let i = 0; i < daysParam; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const months: string[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const excludeCountry = c.req.query("excludeCountry") ?? "";

  // 기본 카운터 (excludeCountry 적용 전)
  let totalPV = getCounter("pv_total", "", "");
  let totalUV = countUv("total", "", "");
  let todayPV = getCounter("pv_day", date, "");
  let todayUV = countUv("day", date, "");
  let returnTotal = getCounter("return_total", "", "");

  const countries: Record<string, number> = {};
  for (const r of db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'geo' AND country = ''`,
    )
    .all()) {
    countries[r.bucket] = r.count;
  }

  const device: Record<string, number> = {};
  for (const r of db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'device' AND country = ''`,
    )
    .all())
    device[r.bucket] = r.count;

  const os: Record<string, number> = {};
  for (const r of db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'os' AND country = ''`,
    )
    .all())
    os[r.bucket] = r.count;

  const referrers: Record<string, number> = {};
  for (const r of db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'referrer' AND country = ''`,
    )
    .all()) {
    if (r.bucket !== "direct") referrers[r.bucket] = r.count;
  }

  const ratings: Record<string, number> = {};
  let totalRatings = 0;
  let ratingSum = 0;
  for (const r of db
    .query<{ bucket: string; count: number }, []>(
      `SELECT bucket, count FROM analytics_counters WHERE scope = 'rating' AND country = ''`,
    )
    .all()) {
    const star = parseInt(r.bucket, 10);
    ratings[r.bucket] = r.count;
    totalRatings += r.count;
    ratingSum += star * r.count;
  }
  const avgRating = totalRatings > 0 ? Math.round((ratingSum / totalRatings) * 10) / 10 : 0;

  // Duration 평균 (rolling 1000 samples)
  const durationRow = db
    .query<{ cnt: number; sum: number }, []>(
      `SELECT COUNT(*) AS cnt, COALESCE(SUM(duration), 0) AS sum FROM analytics_duration_samples`,
    )
    .get();
  const avgDuration = durationRow && durationRow.cnt > 0 ? Math.round(durationRow.sum / durationRow.cnt) : 0;

  let recentVisitors = db
    .query<
      { ip: string; country: string; ua: string; device: string; os: string; time: string },
      []
    >(`SELECT ip, country, ua, device, os, time FROM analytics_visitors ORDER BY id DESC LIMIT 50`)
    .all()
    .map((v) => ({ ...v, city: "", region: "" }));

  let dailyTrend = dates.map((d) => ({
    date: d,
    pv: getCounter("pv_day", d, ""),
    uv: countUv("day", d, ""),
  }));

  const monthlyTrend = months
    .map((m) => ({
      month: m,
      pv: getCounter("pv_month", m, ""),
      uv: countUv("month", m, ""),
    }))
    .filter((m) => m.pv > 0 || m.uv > 0);

  const searchCount = getCounter("event", "search", "");
  const pwaInstalls = getCounter("event", "pwa_install", "");

  // ─── excludeCountry 적용 ───
  if (excludeCountry) {
    totalPV = Math.max(0, totalPV - getCounter("pv_total", "", excludeCountry));
    todayPV = Math.max(0, todayPV - getCounter("pv_day", date, excludeCountry));
    returnTotal = Math.max(0, returnTotal - getCounter("return_total", "", excludeCountry));

    totalUV = countUvExcludingCountry("total", "", excludeCountry);
    dailyTrend = dailyTrend.map((day) => ({
      date: day.date,
      pv: Math.max(0, day.pv - getCounter("pv_day", day.date, excludeCountry)),
      uv: countUvExcludingCountry("day", day.date, excludeCountry),
    }));
    todayUV = dailyTrend[0]?.uv ?? 0;

    for (const r of db
      .query<{ bucket: string; count: number }, [string]>(
        `SELECT bucket, count FROM analytics_counters WHERE scope = 'device' AND country = ?`,
      )
      .all(excludeCountry)) {
      if (device[r.bucket] !== undefined) device[r.bucket] = Math.max(0, device[r.bucket] - r.count);
    }
    for (const r of db
      .query<{ bucket: string; count: number }, [string]>(
        `SELECT bucket, count FROM analytics_counters WHERE scope = 'os' AND country = ?`,
      )
      .all(excludeCountry)) {
      if (os[r.bucket] !== undefined) os[r.bucket] = Math.max(0, os[r.bucket] - r.count);
    }
    for (const r of db
      .query<{ bucket: string; count: number }, [string]>(
        `SELECT bucket, count FROM analytics_counters WHERE scope = 'referrer' AND country = ?`,
      )
      .all(excludeCountry)) {
      if (referrers[r.bucket] !== undefined) referrers[r.bucket] = Math.max(0, referrers[r.bucket] - r.count);
    }

    delete countries[excludeCountry];
    recentVisitors = recentVisitors.filter((v) => v.country !== excludeCountry);
  }

  const data: Record<string, any> = {
    totalPageViews: totalPV,
    totalUniqueVisitors: totalUV,
    todayPageViews: todayPV,
    todayUniqueVisitors: todayUV,
    dailyTrend: dailyTrend.filter((d) => d.pv > 0 || d.uv > 0),
    monthlyTrend,
    countries,
    recentVisitors: isAdmin ? recentVisitors : [],
    device,
    os,
    referrers,
    returnVisitors: returnTotal,
    returnRate: totalPV > 0 ? Math.round((returnTotal / totalPV) * 100) : 0,
    avgDuration,
    searchCount,
    pwaInstalls,
    ratings,
    avgRating,
    totalRatings,
    isAdmin,
  };

  if (isAdmin) {
    const adminIp = extractIp(c);
    if (adminIp && adminIp !== "unknown") {
      db.query(`INSERT OR IGNORE INTO admin_ips(ip, created_at) VALUES (?, ?)`).run(adminIp, nowSec());
    }
    const adminIps = new Set(
      db.query<{ ip: string }, []>(`SELECT ip FROM admin_ips`).all().map((r) => r.ip),
    );
    data._adminIp = adminIp || "(undetected)";
    data._adminIps = [...adminIps];

    if (adminIps.size > 0) {
      const beforeCount = (data.recentVisitors as any[]).length;
      data.recentVisitors = (data.recentVisitors as any[]).filter((v: any) => !adminIps.has(v.ip));
      data._filteredCount = beforeCount - data.recentVisitors.length;
    }
  }

  // 'private': CF 엣지가 캐시 안 함. 브라우저만 캐시.
  // 이전 'public, max-age=60' → CF가 Authorization 무시하고 캐시 → admin이 옛 public 응답(빈 recentVisitors) 받는 회귀
  c.header("Cache-Control", isAdmin ? "private, no-store" : "private, max-age=60");
  return c.json(data);
});

export default app;
