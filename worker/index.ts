interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ALLOWED_ORIGIN: string;
  GOOGLE_CLIENT_ID: string;
  JWT_SECRET: string;
  ADMIN_EMAILS: string;
}

function corsHeaders(origin: string, allowed: string): HeadersInit {
  const isAllowed = origin.startsWith(allowed) || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

async function handleRequest(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
    const url = new URL(request.url);

    // POST /track — record a visit
    if (url.pathname === "/track" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
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
        commands.push(["HINCRBY", "dst:geo:countries", countryCode, "1"]);
      }

      if (isReturn) {
        commands.push(["INCR", "dst:return:total"]);
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

      await redisPipeline(env, commands);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "Content-Type": "application/json" } });
    }

    // POST /event — track generic events (search, pwa_install, duration)
    if (url.pathname === "/event" && request.method === "POST") {
      const body = await request.json().catch(() => ({})) as Record<string, any>;
      const type = body.type as string;

      const commands: string[][] = [];

      if (type === "search") {
        commands.push(["INCR", "dst:events:search"]);
      } else if (type === "pwa_install") {
        commands.push(["INCR", "dst:events:pwa_install"]);
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

    // GET /stats — fetch analytics data (admin only)
    if (url.pathname === "/stats" && request.method === "GET") {
      const auth = request.headers.get("Authorization") ?? "";
      if (!auth.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }
      const jwtPayload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
      if (!jwtPayload || jwtPayload.role !== "admin") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
      }

      const date = today();
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
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
      ];
      for (const d of dates) {
        commands.push(["GET", `dst:pv:${d}`]);     // 12 + i*2
        commands.push(["PFCOUNT", `dst:uv:${d}`]); // 13 + i*2
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
      const recentVisitors = (visitorsRaw ?? []).map((v: string) => {
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

      // OS stats
      const osRaw = r(11) as string[] | null;
      const os: Record<string, number> = {};
      if (Array.isArray(osRaw)) {
        for (let i = 0; i < osRaw.length; i += 2) {
          os[osRaw[i]] = parseInt(osRaw[i + 1], 10) || 0;
        }
      }

      // Average duration
      const durationRaw = r(10) as string[] | null;
      let avgDuration = 0;
      if (Array.isArray(durationRaw) && durationRaw.length > 0) {
        const sum = durationRaw.reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
        avgDuration = Math.round(sum / durationRaw.length);
      }

      const totalPV = parseInt(r(0) ?? "0", 10) || 0;
      const returnTotal = parseInt(r(7) ?? "0", 10) || 0;

      const last7Days = dates.map((d, i) => ({
        date: d,
        pv: parseInt(r(12 + i * 2) ?? "0", 10) || 0,
        uv: parseInt(r(12 + i * 2 + 1) ?? "0", 10) || 0,
      }));

      const data = {
        totalPageViews: totalPV,
        totalUniqueVisitors: parseInt(r(1) ?? "0", 10) || 0,
        todayPageViews: parseInt(r(2) ?? "0", 10) || 0,
        todayUniqueVisitors: parseInt(r(3) ?? "0", 10) || 0,
        last7Days,
        countries,
        recentVisitors,
        // New stats
        device,
        os,
        returnVisitors: returnTotal,
        returnRate: totalPV > 0 ? Math.round((returnTotal / totalPV) * 100) : 0,
        avgDuration,
        searchCount: parseInt(r(8) ?? "0", 10) || 0,
        pwaInstalls: parseInt(r(9) ?? "0", 10) || 0,
      };

      return new Response(JSON.stringify(data), {
        headers: { ...headers, "Content-Type": "application/json" },
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

      return new Response(
        JSON.stringify({ token: jwt, user: { sub, email, name, picture } }),
        { headers: { ...headers, "Content-Type": "application/json" } },
      );
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

    return new Response("Not Found", { status: 404, headers });
}
