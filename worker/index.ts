interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ALLOWED_ORIGIN: string;
}

function corsHeaders(origin: string, allowed: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin.startsWith(allowed) ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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

    // GET /stats — fetch analytics data
    if (url.pathname === "/stats" && request.method === "GET") {
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

    return new Response("Not Found", { status: 404, headers });
  },
};
