import { Hono } from "hono";
import { redisPipeline } from "../lib/redis";
import { verifyJWT } from "../lib/jwt";
import { today, isMobile, parseOS, extractIp, extractCountry } from "../lib/util";

const app = new Hono();

async function isRateLimited(key: string, maxPerWindow: number, windowSec: number): Promise<boolean> {
  const results = await redisPipeline([
    ["INCR", key],
    ["EXPIRE", key, `${windowSec}`, "NX"],
  ]);
  const count = parseInt(results[0]?.result ?? "1", 10);
  return count > maxPerWindow;
}

// POST /track
app.post("/track", async (c) => {
  const ip = extractIp(c);
  if (await isRateLimited(`dst:rl:track:${ip}`, 30, 60)) {
    return c.json({ error: "Too many requests" }, 429);
  }
  const countryCode = extractCountry(c);
  const date = today();
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const ua = (body.ua as string)?.slice(0, 120) ?? "";
  const isReturn = !!body.isReturn;
  const device = isMobile(ua) ? "mobile" : "desktop";
  const os = parseOS(ua);

  const commands: string[][] = [
    ["INCR", "dst:pv:total"],
    ["INCR", `dst:pv:${date}`],
    ["PFADD", `dst:uv:${date}`, ip],
    ["PFADD", "dst:uv:total", ip],
    ["HINCRBY", "dst:device", device, "1"],
    ["HINCRBY", "dst:os", os, "1"],
  ];

  if (countryCode) {
    commands.push(
      ["HINCRBY", "dst:geo:countries", countryCode, "1"],
      ["INCR", `dst:pv:total:${countryCode}`],
      ["INCR", `dst:pv:${date}:${countryCode}`],
      ["PFADD", `dst:uv:${date}:${countryCode}`, ip],
      ["PFADD", `dst:uv:total:${countryCode}`, ip],
      ["HINCRBY", `dst:device:${countryCode}`, device, "1"],
      ["HINCRBY", `dst:os:${countryCode}`, os, "1"],
    );
  }

  if (isReturn) {
    commands.push(["INCR", "dst:return:total"]);
    if (countryCode) commands.push(["INCR", `dst:return:total:${countryCode}`]);
  }

  const referrer = (body.referrer as string)?.slice(0, 100);
  if (referrer && referrer !== "direct") {
    commands.push(["HINCRBY", "dst:referrers", referrer, "1"]);
    if (countryCode) commands.push(["HINCRBY", `dst:referrers:${countryCode}`, referrer, "1"]);
  }

  const logEntry = JSON.stringify({
    ip,
    country: countryCode,
    city: "",
    region: "",
    time: new Date().toISOString(),
    ua,
    device,
    os,
  });
  const month = date.slice(0, 7);
  commands.push(
    ["LPUSH", "dst:visitors", logEntry],
    ["LTRIM", "dst:visitors", "0", "199"],
    ["INCR", `dst:pv:m:${month}`],
    ["PFADD", `dst:uv:m:${month}`, ip],
  );
  if (countryCode) {
    commands.push(
      ["INCR", `dst:pv:m:${month}:${countryCode}`],
      ["PFADD", `dst:uv:m:${month}:${countryCode}`, ip],
    );
  }

  await redisPipeline(commands);
  return c.json({ ok: true });
});

// POST /event
app.post("/event", async (c) => {
  const ip = extractIp(c);
  if (await isRateLimited(`dst:rl:event:${ip}`, 30, 60)) {
    return c.json({ error: "Too many requests" }, 429);
  }
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const type = body.type as string;
  const commands: string[][] = [];

  if (type === "search") commands.push(["INCR", "dst:events:search"]);
  else if (type === "pwa_install") commands.push(["INCR", "dst:events:pwa_install"]);
  else if (type === "share") commands.push(["INCR", "dst:events:share"]);
  else if (type === "github_star_click") commands.push(["INCR", "dst:events:github_star_click"]);
  else if (type === "item_click" && typeof body.itemId === "string") {
    const itemId = (body.itemId as string).slice(0, 100);
    commands.push(["ZINCRBY", "dst:clicks", "1", itemId]);
  } else if (type === "duration" && typeof body.value === "number") {
    const duration = Math.min(Math.max(Math.round(body.value), 0), 3600);
    commands.push(
      ["LPUSH", "dst:duration:samples", `${duration}`],
      ["LTRIM", "dst:duration:samples", "0", "999"],
    );
  }

  if (commands.length > 0) await redisPipeline(commands);
  return c.json({ ok: true });
});

// GET /popular
app.get("/popular", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? "200"), 500);
  const result = await redisPipeline([
    ["ZREVRANGE", "dst:clicks", "0", `${limit - 1}`, "WITHSCORES"],
  ]);
  const raw: string[] = result[0]?.result ?? [];
  const items: { id: string; clicks: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    items.push({ id: raw[i], clicks: Number(raw[i + 1]) });
  }
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ items });
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
  await redisPipeline([["ZINCRBY", `dst:combo:${recipeId}`, "1", comboKey]]);
  return c.json({ ok: true });
});

// GET /combos/:recipeId
app.get("/combos/:recipeId", async (c) => {
  const recipeId = c.req.param("recipeId").slice(0, 60);
  if (!recipeId) return c.json({ combos: [] });

  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 50);
  const result = await redisPipeline([
    ["ZREVRANGE", `dst:combo:${recipeId}`, "0", `${limit - 1}`, "WITHSCORES"],
  ]);
  const raw: string[] = result[0]?.result ?? [];
  const combos: { ingredients: string[]; count: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    combos.push({ ingredients: raw[i].split(","), count: Number(raw[i + 1]) });
  }
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ combos });
});

// POST /rate
app.post("/rate", async (c) => {
  const ip = extractIp(c);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ error: "rating must be an integer between 1 and 5" }, 400);
  }

  const prevRes = await redisPipeline([["HGET", "dst:rating:ips", ip]]);
  const prevRating = prevRes[0]?.result as string | null;

  if (prevRating === `${rating}`) return c.json({ ok: true });

  const commands: string[][] = [
    ["HINCRBY", "dst:ratings", `${rating}`, "1"],
    ["HSET", "dst:rating:ips", ip, `${rating}`],
  ];
  if (prevRating && prevRating !== `${rating}`) {
    commands.push(["HINCRBY", "dst:ratings", prevRating, "-1"]);
  }
  await redisPipeline(commands);
  return c.json({ ok: true });
});

// GET /top-countries
app.get("/top-countries", async (c) => {
  const raw = await redisPipeline([["HGETALL", "dst:geo:countries"]]);
  const arr = raw[0]?.result as string[] | null;
  const countries: { code: string; count: number }[] = [];
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i += 2) {
      countries.push({ code: arr[i], count: parseInt(arr[i + 1], 10) || 0 });
    }
  }
  countries.sort((a, b) => b.count - a.count);
  c.header("Cache-Control", "public, max-age=60");
  return c.json(countries.slice(0, 5));
});

// GET /rating
app.get("/rating", async (c) => {
  const raw = await redisPipeline([["HGETALL", "dst:ratings"]]);
  const arr = raw[0]?.result as string[] | null;
  let total = 0;
  let sum = 0;
  const ratings: Record<string, number> = {};
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i += 2) {
      const star = parseInt(arr[i], 10);
      const count = parseInt(arr[i + 1], 10) || 0;
      total += count;
      sum += star * count;
      ratings[arr[i]] = count;
    }
  }
  const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  c.header("Cache-Control", "no-store");
  return c.json({ avg, total, ratings });
});

// GET /stats
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

  const commands: string[][] = [
    ["GET", "dst:pv:total"],
    ["PFCOUNT", "dst:uv:total"],
    ["GET", `dst:pv:${date}`],
    ["PFCOUNT", `dst:uv:${date}`],
    ["HGETALL", "dst:geo:countries"],
    ["LRANGE", "dst:visitors", "0", "49"],
    ["HGETALL", "dst:device"],
    ["GET", "dst:return:total"],
    ["GET", "dst:events:search"],
    ["GET", "dst:events:pwa_install"],
    ["LRANGE", "dst:duration:samples", "0", "999"],
    ["HGETALL", "dst:os"],
    ["HGETALL", "dst:referrers"],
    ["HGETALL", "dst:ratings"],
  ];
  for (const d of dates) {
    commands.push(["GET", `dst:pv:${d}`]);
    commands.push(["PFCOUNT", `dst:uv:${d}`]);
  }
  const months: string[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthBaseIdx = 14 + dates.length * 2;
  for (const m of months) {
    commands.push(["GET", `dst:pv:m:${m}`]);
    commands.push(["PFCOUNT", `dst:uv:m:${m}`]);
  }

  const results = await redisPipeline(commands);
  const r = (i: number) => results[i]?.result;

  const countriesRaw = r(4) as string[] | null;
  const countries: Record<string, number> = {};
  if (Array.isArray(countriesRaw)) {
    for (let i = 0; i < countriesRaw.length; i += 2) {
      countries[countriesRaw[i]] = parseInt(countriesRaw[i + 1], 10) || 0;
    }
  }

  const visitorsRaw = r(5) as string[] | null;
  let recentVisitors = (visitorsRaw ?? [])
    .map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const deviceRaw = r(6) as string[] | null;
  const device: Record<string, number> = {};
  if (Array.isArray(deviceRaw)) {
    for (let i = 0; i < deviceRaw.length; i += 2) {
      device[deviceRaw[i]] = parseInt(deviceRaw[i + 1], 10) || 0;
    }
  }

  const referrersRaw = r(12) as string[] | null;
  const referrers: Record<string, number> = {};
  if (Array.isArray(referrersRaw)) {
    for (let i = 0; i < referrersRaw.length; i += 2) {
      if (referrersRaw[i] === "direct") continue;
      referrers[referrersRaw[i]] = parseInt(referrersRaw[i + 1], 10) || 0;
    }
  }

  const osRaw = r(11) as string[] | null;
  const os: Record<string, number> = {};
  if (Array.isArray(osRaw)) {
    for (let i = 0; i < osRaw.length; i += 2) {
      os[osRaw[i]] = parseInt(osRaw[i + 1], 10) || 0;
    }
  }

  const ratingsRaw = r(13) as string[] | null;
  const ratings: Record<string, number> = {};
  let totalRatings = 0;
  let ratingSum = 0;
  if (Array.isArray(ratingsRaw)) {
    for (let i = 0; i < ratingsRaw.length; i += 2) {
      const star = parseInt(ratingsRaw[i], 10);
      const count = parseInt(ratingsRaw[i + 1], 10) || 0;
      ratings[ratingsRaw[i]] = count;
      totalRatings += count;
      ratingSum += star * count;
    }
  }
  const avgRating = totalRatings > 0 ? Math.round((ratingSum / totalRatings) * 10) / 10 : 0;

  const durationRaw = r(10) as string[] | null;
  let avgDuration = 0;
  if (Array.isArray(durationRaw) && durationRaw.length > 0) {
    const sum = durationRaw.reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
    avgDuration = Math.round(sum / durationRaw.length);
  }

  let totalPV = parseInt(r(0) ?? "0", 10) || 0;
  let totalUV = parseInt(r(1) ?? "0", 10) || 0;
  let todayPV = parseInt(r(2) ?? "0", 10) || 0;
  let todayUV = parseInt(r(3) ?? "0", 10) || 0;
  let returnTotal = parseInt(r(7) ?? "0", 10) || 0;

  let dailyTrend = dates.map((d, i) => ({
    date: d,
    pv: parseInt(r(14 + i * 2) ?? "0", 10) || 0,
    uv: parseInt(r(14 + i * 2 + 1) ?? "0", 10) || 0,
  }));

  const monthlyTrend = months
    .map((m, i) => ({
      month: m,
      pv: parseInt(r(monthBaseIdx + i * 2) ?? "0", 10) || 0,
      uv: parseInt(r(monthBaseIdx + i * 2 + 1) ?? "0", 10) || 0,
    }))
    .filter((m) => m.pv > 0 || m.uv > 0);

  const excludeCountry = c.req.query("excludeCountry") ?? "";
  if (excludeCountry) {
    const exCommands: string[][] = [
      ["GET", `dst:pv:total:${excludeCountry}`],
      ["GET", `dst:pv:${date}:${excludeCountry}`],
      ["HGETALL", `dst:device:${excludeCountry}`],
      ["HGETALL", `dst:os:${excludeCountry}`],
      ["GET", `dst:return:total:${excludeCountry}`],
      ["HGETALL", `dst:referrers:${excludeCountry}`],
    ];
    for (const d of dates) {
      exCommands.push(["GET", `dst:pv:${d}:${excludeCountry}`]);
    }

    const otherCountries = Object.keys(countries).filter((cc) => cc !== excludeCountry);
    const tmpPrefix = `dst:uv:tmp:${excludeCountry}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const uvCommands: string[][] = [];
    if (otherCountries.length > 0) {
      uvCommands.push(["PFMERGE", `${tmpPrefix}:total`, ...otherCountries.map((cc) => `dst:uv:total:${cc}`)]);
      uvCommands.push(["PFCOUNT", `${tmpPrefix}:total`]);
      uvCommands.push(["DEL", `${tmpPrefix}:total`]);
      for (const d of dates) {
        uvCommands.push(["PFMERGE", `${tmpPrefix}:${d}`, ...otherCountries.map((cc) => `dst:uv:${d}:${cc}`)]);
        uvCommands.push(["PFCOUNT", `${tmpPrefix}:${d}`]);
        uvCommands.push(["DEL", `${tmpPrefix}:${d}`]);
      }
    }

    const [exResults, uvResults] = await Promise.all([
      redisPipeline(exCommands),
      uvCommands.length > 0 ? redisPipeline(uvCommands) : Promise.resolve([] as { result: any }[]),
    ]);
    const ex = (i: number) => exResults[i]?.result;

    totalPV = Math.max(0, totalPV - (parseInt(ex(0) ?? "0", 10) || 0));
    todayPV = Math.max(0, todayPV - (parseInt(ex(1) ?? "0", 10) || 0));

    if (otherCountries.length > 0) {
      totalUV = parseInt(uvResults[1]?.result ?? "0", 10) || 0;
      dailyTrend = dailyTrend.map((day, i) => ({
        ...day,
        uv: parseInt(uvResults[4 + i * 3]?.result ?? "0", 10) || 0,
      }));
      todayUV = dailyTrend[0]?.uv ?? 0;
    } else {
      totalUV = 0;
      todayUV = 0;
      dailyTrend = dailyTrend.map((day) => ({ ...day, uv: 0 }));
    }

    const exDeviceRaw = ex(2) as string[] | null;
    if (Array.isArray(exDeviceRaw)) {
      for (let i = 0; i < exDeviceRaw.length; i += 2) {
        if (device[exDeviceRaw[i]] !== undefined) {
          device[exDeviceRaw[i]] = Math.max(0, device[exDeviceRaw[i]] - (parseInt(exDeviceRaw[i + 1], 10) || 0));
        }
      }
    }

    const exOsRaw = ex(3) as string[] | null;
    if (Array.isArray(exOsRaw)) {
      for (let i = 0; i < exOsRaw.length; i += 2) {
        if (os[exOsRaw[i]] !== undefined) {
          os[exOsRaw[i]] = Math.max(0, os[exOsRaw[i]] - (parseInt(exOsRaw[i + 1], 10) || 0));
        }
      }
    }

    returnTotal = Math.max(0, returnTotal - (parseInt(ex(4) ?? "0", 10) || 0));

    const exRefRaw = ex(5) as string[] | null;
    if (Array.isArray(exRefRaw)) {
      for (let i = 0; i < exRefRaw.length; i += 2) {
        if (referrers[exRefRaw[i]] !== undefined) {
          referrers[exRefRaw[i]] = Math.max(0, referrers[exRefRaw[i]] - (parseInt(exRefRaw[i + 1], 10) || 0));
        }
      }
    }

    dailyTrend = dailyTrend.map((day, i) => ({
      ...day,
      pv: Math.max(0, day.pv - (parseInt(ex(6 + i) ?? "0", 10) || 0)),
    }));

    delete countries[excludeCountry];
    recentVisitors = recentVisitors.filter((v: any) => v.country !== excludeCountry);
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
    searchCount: parseInt(r(8) ?? "0", 10) || 0,
    pwaInstalls: parseInt(r(9) ?? "0", 10) || 0,
    ratings,
    avgRating,
    totalRatings,
    isAdmin,
  };

  if (isAdmin) {
    const adminIp = extractIp(c);

    if (adminIp && adminIp !== "unknown") {
      await redisPipeline([["SADD", "dst:admin-ips", adminIp]]);
    }

    const adminIpsRes = await redisPipeline([["SMEMBERS", "dst:admin-ips"]]);
    const adminIps = new Set<string>(((adminIpsRes[0]?.result as string[]) ?? []));

    data._adminIp = adminIp || "(undetected)";
    data._adminIps = [...adminIps];

    if (adminIps.size > 0) {
      const beforeCount = data.recentVisitors.length;
      data.recentVisitors = data.recentVisitors.filter((v: any) => !adminIps.has(v.ip));
      data._filteredCount = beforeCount - data.recentVisitors.length;
    }
  }

  c.header("Cache-Control", isAdmin ? "no-store" : "public, max-age=60");
  return c.json(data);
});

export default app;
