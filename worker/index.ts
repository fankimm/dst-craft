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
      // IP from Cloudflare
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      // Country from Cloudflare (no GeoIP API needed!)
      const countryCode = request.headers.get("CF-IPCountry") ?? "";
      const city = (request as any).cf?.city ?? "";
      const region = (request as any).cf?.region ?? "";

      const date = today();
      const body = await request.json().catch(() => ({})) as Record<string, string>;
      const ua = body.ua?.slice(0, 120) ?? "";

      const commands: string[][] = [
        ["INCR", "dst:pv:total"],
        ["INCR", `dst:pv:${date}`],
        ["PFADD", `dst:uv:${date}`, ip],
        ["PFADD", "dst:uv:total", ip],
      ];

      if (countryCode) {
        commands.push(["HINCRBY", "dst:geo:countries", countryCode, "1"]);
      }

      const logEntry = JSON.stringify({
        ip,
        country: countryCode,
        city,
        region,
        time: new Date().toISOString(),
        ua,
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
        ["GET", "dst:pv:total"],
        ["PFCOUNT", "dst:uv:total"],
        ["GET", `dst:pv:${date}`],
        ["PFCOUNT", `dst:uv:${date}`],
        ["HGETALL", "dst:geo:countries"],
        ["LRANGE", "dst:visitors", "0", "49"],
      ];
      for (const d of dates) {
        commands.push(["GET", `dst:pv:${d}`]);
        commands.push(["PFCOUNT", `dst:uv:${d}`]);
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

      const last7Days = dates.map((d, i) => ({
        date: d,
        pv: parseInt(r(6 + i * 2) ?? "0", 10) || 0,
        uv: parseInt(r(6 + i * 2 + 1) ?? "0", 10) || 0,
      }));

      const data = {
        totalPageViews: parseInt(r(0) ?? "0", 10) || 0,
        totalUniqueVisitors: parseInt(r(1) ?? "0", 10) || 0,
        todayPageViews: parseInt(r(2) ?? "0", 10) || 0,
        todayUniqueVisitors: parseInt(r(3) ?? "0", 10) || 0,
        last7Days,
        countries,
        recentVisitors,
      };

      return new Response(JSON.stringify(data), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers });
  },
};
