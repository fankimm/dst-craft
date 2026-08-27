import { Hono, type Context } from "hono";
import {
  db,
  nowSec,
  bumpCounter,
  getCounter,
  getCounterMap,
  addUv,
  countUv,
  countUvExcludingCountry,
} from "../lib/db";
import { verifyJWT } from "../lib/jwt";
import { today, dateKey, monthKey, isMobile, parseOS, extractIp, extractCountry } from "../lib/util";
import { checkRateLimit } from "../lib/rate-limit";

const app = new Hono();

// POST /track (legacy) / POST /_t — page view
// 두 경로 모두 동일 핸들러. /_t는 광고차단 필터(EasyPrivacy/uBlock 등) 회피용 별칭.
// 기존 SW가 캐시한 클라이언트 호환을 위해 /track도 유지.
const trackHandler = async (c: Context) => {
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

  // Referrer (도메인) — 기존 hostname 기반 집계.
  const referrer = (body.referrer as string)?.slice(0, 100);
  if (referrer && referrer !== "direct") {
    bumpCounter("referrer", referrer, "");
    if (countryCode) bumpCounter("referrer", referrer, countryCode);
  }

  // Referrer 풀 URL — DC인사이드 등 외부 글 단위 유입 경로 추적용. 길이 500자로 클램프.
  // 외부 도메인 여부 판정 + 정규화는 클라이언트 책임 (analytics.ts / layout.tsx 인라인 스크립트).
  const referrerUrl = typeof body.referrerUrl === "string" ? body.referrerUrl.slice(0, 500) : "";
  if (referrerUrl) {
    db.query(
      `INSERT INTO analytics_referrer_urls(url, count, last_seen_at) VALUES (?, 1, ?)
       ON CONFLICT(url) DO UPDATE SET count = count + 1, last_seen_at = excluded.last_seen_at`,
    ).run(referrerUrl, nowSec());
  }

  // Visitor log (rolling 200, trimmed by trigger)
  db.query(
    `INSERT INTO analytics_visitors(ip, country, ua, device, os, time) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(ip, countryCode, ua, device, os, new Date().toISOString());

  return c.json({ ok: true });
};

app.post("/track", trackHandler);
app.post("/_t", trackHandler);

/**
 * 광고 도달 상태 (#85).
 *
 * 순서가 결과를 바꾼다. **`filled`가 가장 먼저다** — 코스메틱 필터만 켠 사용자는 미끼가
 * 숨겨져 `adblock`으로 잡히지만 실제 광고는 정상 배달된다. 그 세션은 수익이 나므로
 * 차단으로 세면 노출률이 실제보다 낮게 나온다.
 * `early`(체크포인트 전 이탈)는 아직 도착 중이던 광고를 no-fill로 오판하지 않도록
 * 별도 버킷으로 뺀다 — 버리지는 않는다. 이탈 세션도 Ezoic은 visit로 세기 때문이다.
 */
const AD_STATES = ["filled", "nofill", "blocked", "noscript", "early"] as const;
type AdState = (typeof AD_STATES)[number];

/**
 * 첫 소재 도착 시각 구간 (#86).
 *
 * 실측 조사가 전부 headless에서 나왔고 Ezoic이 클라이언트를 분류하는 정황이 있어
 * 절대값을 실사용자로 확증할 수 없었다. 이 분포가 그 확증이다.
 * 구간은 조사 실측(데스크탑 4.1~5.9초, Fast3G 15~17초)을 가르도록 잡았다.
 * 별도 테이블 대신 카운터를 써서 마이그레이션 없이 넣는다.
 */
const AD_FILL_BUCKETS = [2000, 4000, 6000, 8000, 12000, 20000] as const;

function fillMsBucket(ms: number): string {
  let lo = 0;
  for (const hi of AD_FILL_BUCKETS) {
    if (ms < hi) return `${lo / 1000}-${hi / 1000}s`;
    lo = hi;
  }
  return `${lo / 1000}s+`;
}

function adState(body: Record<string, any>): AdState {
  if (body.filled) return "filled";
  if (body.early) return "early";
  if (body.adblock) return "blocked";
  if (!body.script) return "noscript";
  return "nofill";
}

// POST /event (legacy) / POST /_e
// 두 경로 모두 동일 핸들러. /_e는 광고차단 필터(EasyPrivacy/uBlock 등) 회피용 별칭.
// 광고 도달 계측(adstate)은 반드시 /_e로 와야 한다 — /event가 필터에 걸리면
// 차단된 세션의 표본만 소실돼 차단율이 0에 수렴한다 (#85).
const eventHandler = async (c: Context) => {
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
  } else if (type === "adstate") {
    const state = adState(body);
    const countryCode = extractCountry(c);
    bumpCounter("adstate", state, "");
    if (countryCode) bumpCounter("adstate", state, countryCode);
    // 날짜별 추이 — 대시보드 설정을 바꿨을 때 노출률이 움직이는지 보려면 필요하다.
    bumpCounter("adstate_day", `${today()}:${state}`, "");
    bumpCounter("adcmp", body.cmp ? "yes" : "no", "");
    // 도착 시각은 실제로 소재가 온 세션에서만 의미가 있다 — no-fill의 elapsed는
    // "데드라인까지 기다린 시간"이라 분포에 섞으면 20초 구간만 부풀린다.
    if (state === "filled" && typeof body.elapsed === "number" && body.elapsed >= 0) {
      bumpCounter("adfill_ms", fillMsBucket(Math.min(body.elapsed, 600000)), "");
    }
  }

  return c.json({ ok: true });
};

app.post("/event", eventHandler);
app.post("/_e", eventHandler);

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
  for (let i = 0; i < daysParam; i++) dates.push(dateKey(i));
  const months: string[] = [];
  for (let i = 0; i < 24; i++) months.push(monthKey(i));

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

  // 초기 응답엔 30건만. 더보기는 /visitors 엔드포인트(infinite scroll cursor 페이지네이션)로 fetch.
  let recentVisitors = db
    .query<
      { id: number; ip: string; country: string; ua: string; device: string; os: string; time: string },
      []
    >(`SELECT id, ip, country, ua, device, os, time FROM analytics_visitors ORDER BY id DESC LIMIT 30`)
    .all()
    .map((v) => ({ ...v, city: "", region: "" }));

  // referrer 풀 URL Top 50 — admin only (URL에 PII가 박힐 가능성).
  const referrerUrls = isAdmin
    ? db
        .query<{ url: string; count: number }, []>(
          `SELECT url, count FROM analytics_referrer_urls ORDER BY count DESC LIMIT 50`,
        )
        .all()
    : [];

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

  // ─── 광고 도달 계측 (#85) ───
  // ePMV가 낮을 때 원인이 "재고가 안 붙음(nofill)"인지 "단가가 낮음"인지 가르는 숫자.
  const adVisibility = getCounterMap("adstate");
  const adCmp = getCounterMap("adcmp");
  const adFillMs = getCounterMap("adfill_ms");
  const adVisibilityDaily = dates
    .map((d) => {
      const row = { date: d } as { date: string } & Record<AdState, number>;
      for (const st of AD_STATES) row[st] = getCounter("adstate_day", `${d}:${st}`, "");
      return row;
    })
    .filter((row) => AD_STATES.some((st) => row[st] > 0));
  // 국가별은 admin only — 중국(광고 도메인 도달 불가)을 분리해서 봐야 나머지 해석이 선다.
  const adVisibilityByCountry: Record<string, Record<string, number>> = {};
  if (isAdmin) {
    for (const r of db
      .query<{ bucket: string; country: string; count: number }, []>(
        `SELECT bucket, country, count FROM analytics_counters WHERE scope = 'adstate' AND country != ''`,
      )
      .all()) {
      (adVisibilityByCountry[r.country] ??= {})[r.bucket] = r.count;
    }
  }

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
    referrerUrls,
    returnVisitors: returnTotal,
    returnRate: totalPV > 0 ? Math.round((returnTotal / totalPV) * 100) : 0,
    avgDuration,
    searchCount,
    pwaInstalls,
    ratings,
    avgRating,
    totalRatings,
    adVisibility,
    adVisibilityDaily,
    adVisibilityByCountry,
    adCmp,
    adFillMs,
    isAdmin,
  };

  // 어드민 자기 방문 필터는 제거됨 (이전: admin_ips에 자동 등록 + recentVisitors에서 제외).
  // 어드민 본인의 통계도 그대로 노출되어야 한다는 요구. admin_ips 테이블 자체는 /auth/google에서 로그인 시
  // 트래킹은 유지되며 다른 용도로 쓸 수 있게 둠.

  // 'private': CF 엣지가 캐시 안 함. 브라우저만 캐시.
  // 이전 'public, max-age=60' → CF가 Authorization 무시하고 캐시 → admin이 옛 public 응답(빈 recentVisitors) 받는 회귀
  c.header("Cache-Control", isAdmin ? "private, no-store" : "private, max-age=60");
  return c.json(data);
});

// GET /visitors — admin 전용 cursor 페이지네이션. 접속자 상세 무한 스크롤용.
// query: cursor(=마지막으로 받은 id), limit(default 30, max 100)
// returns: { items: [...], nextCursor: number | null }
app.get("/visitors", async (c) => {
  const auth = c.req.header("Authorization") ?? "";
  let isAdmin = false;
  if (auth.startsWith("Bearer ")) {
    const jwtPayload = await verifyJWT(auth.slice(7));
    isAdmin = !!(jwtPayload && jwtPayload.role === "admin");
  }
  if (!isAdmin) return c.json({ error: "Forbidden" }, 403);

  const cursor = parseInt(c.req.query("cursor") ?? "", 10);
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") ?? "30", 10) || 30, 1), 100);

  const rows = isFinite(cursor) && cursor > 0
    ? db
        .query<
          { id: number; ip: string; country: string; ua: string; device: string; os: string; time: string },
          [number, number]
        >(`SELECT id, ip, country, ua, device, os, time FROM analytics_visitors WHERE id < ? ORDER BY id DESC LIMIT ?`)
        .all(cursor, limit)
    : db
        .query<
          { id: number; ip: string; country: string; ua: string; device: string; os: string; time: string },
          [number]
        >(`SELECT id, ip, country, ua, device, os, time FROM analytics_visitors ORDER BY id DESC LIMIT ?`)
        .all(limit);

  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;

  c.header("Cache-Control", "private, no-store");
  return c.json({
    items: rows.map((r) => ({ ...r, city: "", region: "" })),
    nextCursor,
  });
});

export default app;
