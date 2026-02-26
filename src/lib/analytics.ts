const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

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

/** Track a page visit — call once on app load */
export async function trackVisit() {
  if (!WORKER_URL) return;

  // Prevent duplicate tracking in the same session
  if (sessionStorage.getItem("dst:tracked")) return;
  sessionStorage.setItem("dst:tracked", "1");

  try {
    await fetch(`${WORKER_URL}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ua: navigator.userAgent.slice(0, 120) }),
    });
  } catch {
    // Silently fail — analytics should not block the app
  }
}

/** Fetch analytics data for the stats page */
export async function fetchAnalytics(): Promise<AnalyticsData | null> {
  if (!WORKER_URL) return null;

  try {
    const res = await fetch(`${WORKER_URL}/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
