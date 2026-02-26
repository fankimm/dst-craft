const URL = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;

async function redis(command: string[]) {
  if (!URL || !TOKEN) return null;
  try {
    const res = await fetch(`${URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (!res.ok) return null;
    return (await res.json()).result;
  } catch {
    return null;
  }
}

async function redisPipeline(commands: string[][]) {
  if (!URL || !TOKEN) return null;
  try {
    const res = await fetch(`${URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

interface GeoInfo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
}

async function getGeoInfo(): Promise<GeoInfo | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ip: data.ip,
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch {
    return null;
  }
}

/** Track a page visit — call once on app load */
export async function trackVisit() {
  if (!URL || !TOKEN) return;

  // Prevent duplicate tracking in the same session
  if (sessionStorage.getItem("dst:tracked")) return;
  sessionStorage.setItem("dst:tracked", "1");

  const date = today();
  const geo = await getGeoInfo();
  const ip = geo?.ip ?? "unknown";

  const commands: string[][] = [
    // Total page views
    ["INCR", "dst:pv:total"],
    // Daily page views
    ["INCR", `dst:pv:${date}`],
    // Daily unique visitors (HyperLogLog)
    ["PFADD", `dst:uv:${date}`, ip],
    // Total unique visitors
    ["PFADD", "dst:uv:total", ip],
  ];

  // Country stats
  if (geo?.countryCode) {
    commands.push(["HINCRBY", "dst:geo:countries", geo.countryCode, "1"]);
  }

  // Visitor log (keep last 200)
  const logEntry = JSON.stringify({
    ip,
    country: geo?.countryCode ?? "",
    city: geo?.city ?? "",
    region: geo?.region ?? "",
    time: new Date().toISOString(),
    ua: navigator.userAgent.slice(0, 120),
  });
  commands.push(
    ["LPUSH", "dst:visitors", logEntry],
    ["LTRIM", "dst:visitors", "0", "199"],
  );

  // Set TTL on daily keys (auto-expire after 90 days)
  commands.push(
    ["EXPIRE", `dst:pv:${date}`, `${90 * 86400}`],
    ["EXPIRE", `dst:uv:${date}`, `${90 * 86400}`],
  );

  await redisPipeline(commands);
}

export interface AnalyticsData {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  last7Days: { date: string; pv: number; uv: number }[];
  countries: Record<string, number>;
  recentVisitors: {
    ip: string;
    country: string;
    city: string;
    region: string;
    time: string;
    ua: string;
  }[];
}

/** Fetch analytics data for the stats page */
export async function fetchAnalytics(): Promise<AnalyticsData | null> {
  if (!URL || !TOKEN) return null;

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

  // Daily stats for last 7 days
  for (const d of dates) {
    commands.push(["GET", `dst:pv:${d}`]);
    commands.push(["PFCOUNT", `dst:uv:${d}`]);
  }

  const results = await redisPipeline(commands);
  if (!results) return null;

  const r = (i: number) => results[i]?.result;

  // Parse countries hash
  const countriesRaw = r(4) as string[] | null;
  const countries: Record<string, number> = {};
  if (Array.isArray(countriesRaw)) {
    for (let i = 0; i < countriesRaw.length; i += 2) {
      countries[countriesRaw[i]] = parseInt(countriesRaw[i + 1], 10) || 0;
    }
  }

  // Parse recent visitors
  const visitorsRaw = r(5) as string[] | null;
  const recentVisitors = (visitorsRaw ?? []).map((v: string) => {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Parse 7-day stats
  const last7Days = dates.map((d, i) => ({
    date: d,
    pv: parseInt(r(6 + i * 2) ?? "0", 10) || 0,
    uv: parseInt(r(6 + i * 2 + 1) ?? "0", 10) || 0,
  }));

  return {
    totalPageViews: parseInt(r(0) ?? "0", 10) || 0,
    totalUniqueVisitors: parseInt(r(1) ?? "0", 10) || 0,
    todayPageViews: parseInt(r(2) ?? "0", 10) || 0,
    todayUniqueVisitors: parseInt(r(3) ?? "0", 10) || 0,
    last7Days,
    countries,
    recentVisitors,
  };
}
