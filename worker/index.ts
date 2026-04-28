interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ALLOWED_ORIGIN: string;
  GOOGLE_CLIENT_ID: string;
  JWT_SECRET: string;
  ADMIN_EMAILS: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  KOFI_VERIFICATION_TOKEN: string;
}

function corsHeaders(origin: string, allowed: string): HeadersInit {
  const isAllowed = origin.startsWith(allowed) || origin === "https://dst-craft.vercel.app" || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function redisPipeline(env: Env, commands: string[][]) {
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  return res.json();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isMobile(ua: string): boolean {
  return /mobile|android|iphone|ipad|ipod|webos|blackberry|opera mini|iemobile/i.test(ua);
}

// ---------------------------------------------------------------------------
// JWT helpers (HMAC SHA-256 via Web Crypto API)
// ---------------------------------------------------------------------------

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (s.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;
  const key = await getSigningKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  return `${data}.${base64UrlEncode(sig)}`;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await getSigningKey(secret);
    const enc = new TextEncoder();
    const sigBytes = base64UrlDecode(parts[2]);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes.buffer as ArrayBuffer, enc.encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function extractSub(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  return (payload?.sub as string) ?? null;
}

function parseOS(ua: string): string {
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  if (/cros/i.test(ua)) return "ChromeOS";
  return "Other";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    try {
    return await handleRequest(request, env, headers);
    } catch (err: any) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  },
};

/** Simple rate limiter: returns true if the request should be blocked */
async function isRateLimited(env: Env, key: string, maxPerWindow: number, windowSec: number): Promise<boolean> {
  // INCR + EXPIRE NX in one pipeline — TTL is set only on first request in the
  // window, avoiding the race where a second request lands between INCR and EXPIRE
  // and the key ends up without a TTL (which would block the IP forever).
  const results = await redisPipeline(env, [
    ["INCR", key],
    ["EXPIRE", key, `${windowSec}`, "NX"],
  ]) as { result: any }[];
  const count = parseInt(results[0]?.result ?? "1", 10);
  return count > maxPerWindow;
}

async function handleRequest(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
    const url = new URL(request.url);

    // POST /track — record a visit
    if (url.pathname === "/track" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      // 30/min — generous enough to avoid losing visitors behind shared NAT
      // (offices, schools, mobile carriers) while still blocking real abuse.
      if (await isRateLimited(env, `dst:rl:track:${ip}`, 30, 60)) {
        return new Response(JSON.stringify({ error: "Too many requests" }), {
          status: 429, headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      const countryCode = request.headers.get("CF-IPCountry") ?? "";
      const city = (request as any).cf?.city ?? "";
      const region = (request as any).cf?.region ?? "";

      const date = today();
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const ua = (body.ua as string)?.slice(0, 120) ?? "";
      const isReturn = !!body.isReturn;
      const device = isMobile(ua) ? "mobile" : "desktop";
      const os = parseOS(ua);

      const commands: string[][] = [
        ["INCR", "dst:pv:total"],
        ["INCR", `dst:pv:${date}`],
        ["PFADD", `dst:uv:${date}`, ip],
        ["PFADD", "dst:uv:total", ip],
        // Device type & OS
        ["HINCRBY", "dst:device", device, "1"],
        ["HINCRBY", "dst:os", os, "1"],
      ];

      if (countryCode) {
        commands.push(
          ["HINCRBY", "dst:geo:countries", countryCode, "1"],
          // Per-country tracking for filtering
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
        city,
        region,
        time: new Date().toISOString(),
        ua,
        device,
        os,
      });
      commands.push(
        ["LPUSH", "dst:visitors", logEntry],
        ["LTRIM", "dst:visitors", "0", "199"],
        ["EXPIRE", `dst:pv:${date}`, `${90 * 86400}`],
        ["EXPIRE", `dst:uv:${date}`, `${90 * 86400}`],
      );
      if (countryCode) {
        commands.push(
          ["EXPIRE", `dst:pv:${date}:${countryCode}`, `${90 * 86400}`],
          ["EXPIRE", `dst:uv:${date}:${countryCode}`, `${90 * 86400}`],
        );
      }

      await redisPipeline(env, commands);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // POST /event — track generic events (search, pwa_install, duration)
    if (url.pathname === "/event" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      if (await isRateLimited(env, `dst:rl:event:${ip}`, 30, 60)) {
        return new Response(JSON.stringify({ error: "Too many requests" }), {
          status: 429, headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const type = body.type as string;

      const commands: string[][] = [];

      if (type === "search") {
        commands.push(["INCR", "dst:events:search"]);
      } else if (type === "pwa_install") {
        commands.push(["INCR", "dst:events:pwa_install"]);
      } else if (type === "share") {
        commands.push(["INCR", "dst:events:share"]);
      } else if (type === "github_star_click") {
        commands.push(["INCR", "dst:events:github_star_click"]);
      } else if (type === "item_click" && typeof body.itemId === "string") {
        const itemId = (body.itemId as string).slice(0, 100);
        commands.push(["ZINCRBY", "dst:clicks", "1", itemId]);
      } else if (type === "duration" && typeof body.value === "number") {
        const duration = Math.min(Math.max(Math.round(body.value), 0), 3600);
        commands.push(
          ["LPUSH", "dst:duration:samples", `${duration}`],
          ["LTRIM", "dst:duration:samples", "0", "999"],
        );
      }

      if (commands.length > 0) {
        await redisPipeline(env, commands);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // GET /popular — top clicked items (public, cached)
    if (url.pathname === "/popular" && request.method === "GET") {
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);
      const result = await redisPipeline(env, [
        ["ZREVRANGE", "dst:clicks", "0", `${limit - 1}`, "WITHSCORES"],
      ]) as any;
      const raw: string[] = result?.[0]?.result ?? [];
      const items: { id: string; clicks: number }[] = [];
      for (let i = 0; i < raw.length; i += 2) {
        items.push({ id: raw[i], clicks: Number(raw[i + 1]) });
      }
      return new Response(JSON.stringify({ items }), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      });
    }

    // POST /combo — store a simulation combo (recipeId + sorted ingredients)
    if (url.pathname === "/combo" && request.method === "POST") {
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const recipeId = typeof body.recipeId === "string" ? body.recipeId.slice(0, 60) : "";
      const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
      if (!recipeId || ingredients.length !== 4 || !ingredients.every((i: any) => typeof i === "string")) {
        return new Response(JSON.stringify({ error: "recipeId + 4 ingredient strings required" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      // Sort to normalize order, then join as key
      const comboKey = (ingredients as string[]).map(s => s.slice(0, 60)).sort().join(",");
      await redisPipeline(env, [
        ["ZINCRBY", `dst:combo:${recipeId}`, "1", comboKey],
      ]);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // GET /combos/:recipeId — top combos for a recipe
    if (url.pathname.startsWith("/combos/") && request.method === "GET") {
      const recipeId = url.pathname.replace("/combos/", "").slice(0, 60);
      if (!recipeId) {
        return new Response(JSON.stringify({ combos: [] }), { headers: { ...headers, "Content-Type": "application/json" } });
      }
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
      const result = await redisPipeline(env, [
        ["ZREVRANGE", `dst:combo:${recipeId}`, "0", `${limit - 1}`, "WITHSCORES"],
      ]) as any;
      const raw: string[] = result?.[0]?.result ?? [];
      const combos: { ingredients: string[]; count: number }[] = [];
      for (let i = 0; i < raw.length; i += 2) {
        combos.push({ ingredients: raw[i].split(","), count: Number(raw[i + 1]) });
      }
      return new Response(JSON.stringify({ combos }), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      });
    }

    // POST /rate — submit a star rating (1~5), one per IP (can change)
    if (url.pathname === "/rate" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const rating = body.rating;
      if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return new Response(JSON.stringify({ error: "rating must be an integer between 1 and 5" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      // Check if this IP already rated — if so, decrement old rating first
      const prevRes = await redisPipeline(env, [["HGET", "dst:rating:ips", ip]]) as { result: any }[];
      const prevRating = prevRes[0]?.result as string | null;
      const commands: string[][] = [
        ["HINCRBY", "dst:ratings", `${rating}`, "1"],
        ["HSET", "dst:rating:ips", ip, `${rating}`],
      ];
      if (prevRating && prevRating !== `${rating}`) {
        commands.push(["HINCRBY", "dst:ratings", prevRating, "-1"]);
      }
      // If same rating as before, skip duplicate increment
      if (prevRating === `${rating}`) {
        return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
      }
      await redisPipeline(env, commands);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // GET /top-countries — public top 5 countries
    if (url.pathname === "/top-countries" && request.method === "GET") {
      const raw = await redisPipeline(env, [["HGETALL", "dst:geo:countries"]]) as { result: any }[];
      const arr = raw[0]?.result as string[] | null;
      const countries: { code: string; count: number }[] = [];
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i += 2) {
          countries.push({ code: arr[i], count: parseInt(arr[i + 1], 10) || 0 });
        }
      }
      countries.sort((a, b) => b.count - a.count);
      const top5 = countries.slice(0, 5);
      return new Response(JSON.stringify(top5), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=600" },
      });
    }

    // GET /rating — public average rating
    if (url.pathname === "/rating" && request.method === "GET") {
      const raw = await redisPipeline(env, [["HGETALL", "dst:ratings"]]) as { result: any }[];
      const arr = raw[0]?.result as string[] | null;
      let total = 0;
      let sum = 0;
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i += 2) {
          const star = parseInt(arr[i], 10);
          const count = parseInt(arr[i + 1], 10) || 0;
          total += count;
          sum += star * count;
        }
      }
      const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
      const ratings: Record<string, number> = {};
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i += 2) {
          ratings[arr[i]] = parseInt(arr[i + 1], 10) || 0;
        }
      }
      return new Response(JSON.stringify({ avg, total, ratings }), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      });
    }

    // GET /stats — fetch analytics data (public, admin gets extra details)
    if (url.pathname === "/stats" && request.method === "GET") {
      const auth = request.headers.get("Authorization") ?? "";
      let isAdmin = false;
      if (auth.startsWith("Bearer ")) {
        const jwtPayload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
        isAdmin = !!(jwtPayload && jwtPayload.role === "admin");
      }

      const date = today();
      const daysParam = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "7", 10) || 7, 1), 90);
      const dates: string[] = [];
      for (let i = 0; i < daysParam; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }

      const commands: string[][] = [
        ["GET", "dst:pv:total"],           // 0
        ["PFCOUNT", "dst:uv:total"],       // 1
        ["GET", `dst:pv:${date}`],         // 2
        ["PFCOUNT", `dst:uv:${date}`],     // 3
        ["HGETALL", "dst:geo:countries"],   // 4
        ["LRANGE", "dst:visitors", "0", "49"], // 5
        // New stats
        ["HGETALL", "dst:device"],          // 6
        ["GET", "dst:return:total"],        // 7
        ["GET", "dst:events:search"],       // 8
        ["GET", "dst:events:pwa_install"],  // 9
        ["LRANGE", "dst:duration:samples", "0", "999"], // 10
        ["HGETALL", "dst:os"],              // 11
        ["HGETALL", "dst:referrers"],       // 12
        ["HGETALL", "dst:ratings"],          // 13
      ];
      for (const d of dates) {
        commands.push(["GET", `dst:pv:${d}`]);     // 14 + i*2
        commands.push(["PFCOUNT", `dst:uv:${d}`]); // 15 + i*2
      }

      const results = await redisPipeline(env, commands) as { result: any }[];
      const r = (i: number) => results[i]?.result;

      const countriesRaw = r(4) as string[] | null;
      const countries: Record<string, number> = {};
      if (Array.isArray(countriesRaw)) {
        for (let i = 0; i < countriesRaw.length; i += 2) {
          countries[countriesRaw[i]] = parseInt(countriesRaw[i + 1], 10) || 0;
        }
      }

      const visitorsRaw = r(5) as string[] | null;
      let recentVisitors = (visitorsRaw ?? []).map((v: string) => {
        try { return JSON.parse(v); } catch { return null; }
      }).filter(Boolean);

      // Device stats
      const deviceRaw = r(6) as string[] | null;
      const device: Record<string, number> = {};
      if (Array.isArray(deviceRaw)) {
        for (let i = 0; i < deviceRaw.length; i += 2) {
          device[deviceRaw[i]] = parseInt(deviceRaw[i + 1], 10) || 0;
        }
      }

      // Referrer stats (exclude legacy "direct" entries)
      const referrersRaw = r(12) as string[] | null;
      const referrers: Record<string, number> = {};
      if (Array.isArray(referrersRaw)) {
        for (let i = 0; i < referrersRaw.length; i += 2) {
          if (referrersRaw[i] === "direct") continue;
          referrers[referrersRaw[i]] = parseInt(referrersRaw[i + 1], 10) || 0;
        }
      }

      // OS stats
      const osRaw = r(11) as string[] | null;
      const os: Record<string, number> = {};
      if (Array.isArray(osRaw)) {
        for (let i = 0; i < osRaw.length; i += 2) {
          os[osRaw[i]] = parseInt(osRaw[i + 1], 10) || 0;
        }
      }

      // Ratings
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

      // Average duration
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

      // Country exclusion filter
      const excludeCountry = url.searchParams.get("excludeCountry") ?? "";
      if (excludeCountry) {
        // INCR-backed counters (PV, device, os, return, referrer) can be
        // subtracted arithmetically. UV cannot — HyperLogLog estimates don't
        // support set difference, so we PFMERGE the *other* countries' UV
        // sets and PFCOUNT the result.
        const exCommands: string[][] = [
          ["GET", `dst:pv:total:${excludeCountry}`],           // 0
          ["GET", `dst:pv:${date}:${excludeCountry}`],         // 1
          ["HGETALL", `dst:device:${excludeCountry}`],         // 2
          ["HGETALL", `dst:os:${excludeCountry}`],             // 3
          ["GET", `dst:return:total:${excludeCountry}`],       // 4
          ["HGETALL", `dst:referrers:${excludeCountry}`],      // 5
        ];
        for (const d of dates) {
          exCommands.push(["GET", `dst:pv:${d}:${excludeCountry}`]); // 6 + i
        }

        // Build PFMERGE pipeline for accurate UV difference.
        const otherCountries = Object.keys(countries).filter((c) => c !== excludeCountry);
        const tmpPrefix = `dst:uv:tmp:${excludeCountry}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
        const uvCommands: string[][] = [];
        if (otherCountries.length > 0) {
          // Total UV across all other countries
          uvCommands.push(["PFMERGE", `${tmpPrefix}:total`, ...otherCountries.map((c) => `dst:uv:total:${c}`)]); // 0
          uvCommands.push(["PFCOUNT", `${tmpPrefix}:total`]);                                                    // 1
          uvCommands.push(["DEL", `${tmpPrefix}:total`]);                                                        // 2
          // Per-day UV for the trend
          for (const d of dates) {
            uvCommands.push(["PFMERGE", `${tmpPrefix}:${d}`, ...otherCountries.map((c) => `dst:uv:${d}:${c}`)]);
            uvCommands.push(["PFCOUNT", `${tmpPrefix}:${d}`]);
            uvCommands.push(["DEL", `${tmpPrefix}:${d}`]);
          }
        }

        const [exResults, uvResults] = await Promise.all([
          redisPipeline(env, exCommands) as Promise<{ result: any }[]>,
          uvCommands.length > 0
            ? (redisPipeline(env, uvCommands) as Promise<{ result: any }[]>)
            : Promise.resolve([] as { result: any }[]),
        ]);
        const ex = (i: number) => exResults[i]?.result;

        totalPV = Math.max(0, totalPV - (parseInt(ex(0) ?? "0", 10) || 0));
        todayPV = Math.max(0, todayPV - (parseInt(ex(1) ?? "0", 10) || 0));

        if (otherCountries.length > 0) {
          totalUV = parseInt(uvResults[1]?.result ?? "0", 10) || 0;
          // dates[0] is today (loop pushes today first), so daily UV[0] is today's UV
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

        // Subtract device counts
        const exDeviceRaw = ex(2) as string[] | null;
        if (Array.isArray(exDeviceRaw)) {
          for (let i = 0; i < exDeviceRaw.length; i += 2) {
            if (device[exDeviceRaw[i]] !== undefined) {
              device[exDeviceRaw[i]] = Math.max(0, device[exDeviceRaw[i]] - (parseInt(exDeviceRaw[i + 1], 10) || 0));
            }
          }
        }

        // Subtract OS counts
        const exOsRaw = ex(3) as string[] | null;
        if (Array.isArray(exOsRaw)) {
          for (let i = 0; i < exOsRaw.length; i += 2) {
            if (os[exOsRaw[i]] !== undefined) {
              os[exOsRaw[i]] = Math.max(0, os[exOsRaw[i]] - (parseInt(exOsRaw[i + 1], 10) || 0));
            }
          }
        }

        returnTotal = Math.max(0, returnTotal - (parseInt(ex(4) ?? "0", 10) || 0));

        // Subtract referrer counts
        const exRefRaw = ex(5) as string[] | null;
        if (Array.isArray(exRefRaw)) {
          for (let i = 0; i < exRefRaw.length; i += 2) {
            if (referrers[exRefRaw[i]] !== undefined) {
              referrers[exRefRaw[i]] = Math.max(0, referrers[exRefRaw[i]] - (parseInt(exRefRaw[i + 1], 10) || 0));
            }
          }
        }

        // Subtract daily PV (UV is already replaced via PFMERGE above)
        dailyTrend = dailyTrend.map((day, i) => ({
          ...day,
          pv: Math.max(0, day.pv - (parseInt(ex(6 + i) ?? "0", 10) || 0)),
        }));

        // Filter countries & recent visitors
        delete countries[excludeCountry];
        recentVisitors = recentVisitors.filter((v: any) => v.country !== excludeCountry);
      }

      const data: Record<string, any> = {
        totalPageViews: totalPV,
        totalUniqueVisitors: totalUV,
        todayPageViews: todayPV,
        todayUniqueVisitors: todayUV,
        dailyTrend,
        countries,
        recentVisitors: isAdmin ? recentVisitors : [],
        device,
        os,
        referrers,
        returnVisitors: returnTotal,
        // Both numerator and denominator are visit counters (INCR), so the
        // ratio is "% of sessions that were repeat visits". Mixing INCR with
        // PFCOUNT (totalUV) here would make the rate exceed 100% when a user
        // returns multiple times.
        returnRate: totalPV > 0 ? Math.round((returnTotal / totalPV) * 100) : 0,
        avgDuration,
        searchCount: parseInt(r(8) ?? "0", 10) || 0,
        pwaInstalls: parseInt(r(9) ?? "0", 10) || 0,
        ratings,
        avgRating,
        totalRatings,
        isAdmin,
      };

      // Admin-only: filter admin IP entries from response (non-destructive)
      if (isAdmin) {
        const adminIp =
          request.headers.get("CF-Connecting-IP") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "";

        // Accumulate admin IPs in a Redis set (persists across sessions/networks)
        if (adminIp) {
          await redisPipeline(env, [["SADD", "dst:admin-ips", adminIp]]);
        }

        // Fetch all known admin IPs
        const adminIpsRes = await redisPipeline(env, [["SMEMBERS", "dst:admin-ips"]]);
        const adminIps = new Set<string>(((adminIpsRes as any)?.[0]?.result as string[]) ?? []);

        data._adminIp = adminIp || "(undetected)";
        data._adminIps = [...adminIps];

        // Filter admin IPs from response only (do NOT delete from Redis)
        if (adminIps.size > 0) {
          const beforeCount = data.recentVisitors.length;
          data.recentVisitors = data.recentVisitors.filter((v: any) => !adminIps.has(v.ip));
          data._filteredCount = beforeCount - data.recentVisitors.length;
        }
      }

      const cacheControl = isAdmin ? "no-store" : "public, max-age=60";
      return new Response(JSON.stringify(data), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": cacheControl },
      });
    }

    // POST /auth/google — verify Google ID token, issue JWT
    if (url.pathname === "/auth/google" && request.method === "POST") {
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const idToken = body.idToken as string;
      if (!idToken) {
        return new Response(JSON.stringify({ error: "Missing idToken" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }

      // Verify via Google tokeninfo
      const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!tokenRes.ok) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const tokenInfo = await tokenRes.json() as Record<string, any>;

      // Verify audience
      if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
        return new Response(JSON.stringify({ error: "Invalid audience" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const sub = tokenInfo.sub as string;
      const email = (tokenInfo.email as string) ?? "";
      const name = (tokenInfo.name as string) ?? "";
      const picture = (tokenInfo.picture as string) ?? "";

      // Save user info to Redis
      await redisPipeline(env, [
        ["HSET", `dst:user:${sub}`, "email", email, "name", name, "picture", picture],
      ]);

      // Check admin whitelist
      const adminEmails = (env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
      const isAdmin = adminEmails.includes(email.toLowerCase());

      // Issue JWT (30 days expiry)
      const jwt = await createJWT(
        { sub, email, name, picture, ...(isAdmin ? { role: "admin" } : {}), exp: Math.floor(Date.now() / 1000) + 30 * 86400 },
        env.JWT_SECRET,
      );

      // Admin: register IP and purge all known admin IPs from analytics
      if (isAdmin) {
        const adminIp =
          request.headers.get("CF-Connecting-IP") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "";
        if (adminIp) {
          await redisPipeline(env, [["SADD", "dst:admin-ips", adminIp]]);
        }
      }

      return new Response(
        JSON.stringify({ token: jwt, user: { sub, email, name, picture } }),
        { headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    // GET /skills — fetch all saved skill builds for the user
    if (url.pathname === "/skills" && request.method === "GET") {
      const sub = await extractSub(request, env);
      if (!sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const results = await redisPipeline(env, [
        ["HGETALL", `dst:skills:${sub}`],
        ["HGETALL", `dst:skills-locks:${sub}`],
      ]) as { result: any }[];

      const skillsRaw = results[0]?.result as string[] | null;
      const locksRaw = results[1]?.result as string[] | null;

      const skills: Record<string, string[]> = {};
      if (Array.isArray(skillsRaw)) {
        for (let i = 0; i < skillsRaw.length; i += 2) {
          try { skills[skillsRaw[i]] = JSON.parse(skillsRaw[i + 1]); } catch {}
        }
      }

      const locks: Record<string, string[]> = {};
      if (Array.isArray(locksRaw)) {
        for (let i = 0; i < locksRaw.length; i += 2) {
          try { locks[locksRaw[i]] = JSON.parse(locksRaw[i + 1]); } catch {}
        }
      }

      return new Response(JSON.stringify({ skills, locks }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // POST /skills — save skill build for one character
    if (url.pathname === "/skills" && request.method === "POST") {
      const sub = await extractSub(request, env);
      if (!sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const characterId = body.characterId as string;
      const skills = body.skills as string[];
      const locks = body.locks as string[];

      if (!characterId || !Array.isArray(skills) || !Array.isArray(locks)) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const commands: string[][] = [];
      if (skills.length > 0) {
        commands.push(["HSET", `dst:skills:${sub}`, characterId, JSON.stringify(skills)]);
      } else {
        commands.push(["HDEL", `dst:skills:${sub}`, characterId]);
      }
      if (locks.length > 0) {
        commands.push(["HSET", `dst:skills-locks:${sub}`, characterId, JSON.stringify(locks)]);
      } else {
        commands.push(["HDEL", `dst:skills-locks:${sub}`, characterId]);
      }

      await redisPipeline(env, commands);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // GET /favorites — fetch user favorites
    if (url.pathname === "/favorites" && request.method === "GET") {
      const sub = await extractSub(request, env);
      if (!sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const results = await redisPipeline(env, [["SMEMBERS", `dst:fav:${sub}`]]) as { result: any }[];
      const items = (results[0]?.result as string[]) ?? [];

      return new Response(JSON.stringify({ items }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // POST /favorites — add/remove favorite
    if (url.pathname === "/favorites" && request.method === "POST") {
      const sub = await extractSub(request, env);
      if (!sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const itemId = body.itemId as string;
      const action = body.action as string;

      if (!itemId || (action !== "add" && action !== "remove")) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const cmd = action === "add" ? "SADD" : "SREM";
      await redisPipeline(env, [[cmd, `dst:fav:${sub}`, itemId]]);

      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // POST /feedback — submit anonymous feedback
    if (url.pathname === "/feedback" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

      // Rate limit: 1 feedback per IP per hour
      const rateLimitKey = `dst:feedback:rl:${ip}`;
      const rlCheck = await redisPipeline(env, [["GET", rateLimitKey]]) as { result: any }[];
      if (rlCheck[0]?.result) {
        return new Response(JSON.stringify({ error: "Too many requests" }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const message = (body.message as string)?.trim().slice(0, 1000);
      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const entry = JSON.stringify({
        id,
        message,
        time: new Date().toISOString(),
        country: request.headers.get("CF-IPCountry") ?? "",
        ip,
      });

      await redisPipeline(env, [
        ["LPUSH", "dst:feedback", entry],
        ["LTRIM", "dst:feedback", "0", "499"],
        ["SET", rateLimitKey, "1", "EX", "3600"],
      ]);

      // Telegram notification (fire-and-forget)
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        const country = request.headers.get("CF-IPCountry") ?? "";
        const text = `📩 새 피드백\n\n${message}\n\n🌍 ${country} · 🕐 ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
        fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // GET /feedback — list feedback (admin only)
    if (url.pathname === "/feedback" && request.method === "GET") {
      const auth = request.headers.get("Authorization") ?? "";
      if (!auth.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const jwtPayload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
      if (!jwtPayload || jwtPayload.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 500);
      const results = await redisPipeline(env, [
        ["LRANGE", "dst:feedback", "0", `${limit - 1}`],
        ["HGETALL", "dst:feedback:status"],
      ]) as { result: any }[];
      const raw = (results[0]?.result as string[]) ?? [];
      const statusRaw = results[1]?.result as string[] | null;
      const statusMap: Record<string, string> = {};
      if (Array.isArray(statusRaw)) {
        for (let i = 0; i < statusRaw.length; i += 2) {
          statusMap[statusRaw[i]] = statusRaw[i + 1];
        }
      }
      const items = raw.map((r: string) => {
        try {
          const parsed = JSON.parse(r);
          parsed.status = statusMap[parsed.id] ?? "new";
          return parsed;
        } catch { return null; }
      }).filter(Boolean);

      return new Response(JSON.stringify({ items }), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    // PATCH /feedback — update feedback status (admin only)
    if (url.pathname === "/feedback" && request.method === "PATCH") {
      const auth = request.headers.get("Authorization") ?? "";
      if (!auth.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const jwtPayload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
      if (!jwtPayload || jwtPayload.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const id = body.id as string;
      const status = body.status as string;
      const validStatuses = ["new", "done", "hold", "rejected"];
      if (!id || !validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }

      await redisPipeline(env, [["HSET", "dst:feedback:status", id, status]]);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // POST /kofi-webhook — receive ko-fi donation/subscription/shop events
    // ko-fi sends: Content-Type: application/x-www-form-urlencoded, body = data=<JSON>
    if (url.pathname === "/kofi-webhook" && request.method === "POST") {
      const form = await request.formData().catch(() => null);
      const dataStr = form?.get("data");
      if (typeof dataStr !== "string") {
        return new Response(JSON.stringify({ error: "Missing data" }), {
          status: 400, headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      let payload: Record<string, any>;
      try { payload = JSON.parse(dataStr); }
      catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } }); }

      if (payload.verification_token !== env.KOFI_VERIFICATION_TOKEN) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const isPublic = payload.is_public === true;
      const fromName = (typeof payload.from_name === "string" ? payload.from_name.trim() : "").slice(0, 60);
      // Anonymize: store under __anon__ token when not public, blank, or literal "Anonymous"
      const displayName = (!isPublic || !fromName || /^anonymous$/i.test(fromName)) ? "__anon__" : fromName;

      // Parse amount → cents (ko-fi sends amount as string e.g. "5.00")
      const amount = parseFloat(String(payload.amount ?? "0"));
      const cents = Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
      if (cents <= 0) {
        // Still ack so ko-fi doesn't retry
        return new Response(JSON.stringify({ ok: true, skipped: "no amount" }), { headers: { ...headers, "Content-Type": "application/json" } });
      }

      // De-dupe by transaction id (ko-fi may retry)
      const txId = typeof payload.kofi_transaction_id === "string" ? payload.kofi_transaction_id : "";
      if (txId) {
        const dupRes = await redisPipeline(env, [["SADD", "dst:kofi:tx", txId]]) as { result: any }[];
        if (dupRes[0]?.result === 0) {
          return new Response(JSON.stringify({ ok: true, skipped: "duplicate" }), { headers: { ...headers, "Content-Type": "application/json" } });
        }
      }

      await redisPipeline(env, [
        ["ZINCRBY", "dst:supporters", `${cents}`, displayName],
        ["INCR", "dst:supporters:count"],
      ]);

      // Telegram notification (fire-and-forget)
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

      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // GET /supporters — public top supporters by cumulative amount (amounts not exposed)
    if (url.pathname === "/supporters" && request.method === "GET") {
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "5"), 20);
      const result = await redisPipeline(env, [
        ["ZREVRANGE", "dst:supporters", "0", `${limit - 1}`],
      ]) as { result: any }[];
      const names = (result[0]?.result as string[]) ?? [];
      return new Response(JSON.stringify({ supporters: names.map((name) => ({ name })) }), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      });
    }

    // POST /supporters — admin only: manually add/backfill a supporter
    if (url.pathname === "/supporters" && request.method === "POST") {
      const auth = request.headers.get("Authorization") ?? "";
      if (!auth.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const jwtPayload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
      if (!jwtPayload || jwtPayload.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
      const cents = Number.isInteger(body.cents) ? body.cents : 0;
      if (!name || cents <= 0) {
        return new Response(JSON.stringify({ error: "name + cents required" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }
      await redisPipeline(env, [["ZINCRBY", "dst:supporters", `${cents}`, name]]);
      return new Response(JSON.stringify({ ok: true, name, cents }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // GET /config?key=... — read a global config value (public)
    if (url.pathname === "/config" && request.method === "GET") {
      const key = url.searchParams.get("key");
      if (!key || !/^[a-z_-]+$/.test(key)) {
        return new Response(JSON.stringify({ error: "Invalid key" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const result = await redisPipeline(env, [["GET", `dst:config:${key}`]]) as any;
      const value = result?.[0]?.result ?? null;
      return new Response(JSON.stringify({ key, value }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // POST /config — set a global config value (admin only)
    if (url.pathname === "/config" && request.method === "POST") {
      const auth = request.headers.get("Authorization") ?? "";
      if (!auth.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const jwtPayload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
      if (!jwtPayload || jwtPayload.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const key = body.key as string;
      const value = body.value as string;
      if (!key || !/^[a-z_-]+$/.test(key) || typeof value !== "string") {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
      }
      await redisPipeline(env, [["SET", `dst:config:${key}`, value]]);
      return new Response(JSON.stringify({ ok: true, key, value }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers });
}
