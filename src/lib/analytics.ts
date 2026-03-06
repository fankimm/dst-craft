const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

export interface AnalyticsData {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  dailyTrend: { date: string; pv: number; uv: number }[];
  countries: Record<string, number>;
  recentVisitors: {
    ip: string;
    country: string;
    city: string;
    region: string;
    time: string;
    ua: string;
    device?: string;
    os?: string;
  }[];
  device: Record<string, number>;
  os: Record<string, number>;
  referrers: Record<string, number>;
  returnVisitors: number;
  returnRate: number;
  avgDuration: number;
  searchCount: number;
  pwaInstalls: number;
  ratings?: Record<string, number>;
  avgRating?: number;
  totalRatings?: number;
}

/** Track a page visit — call once on app load */
export async function trackVisit(skipTracking?: boolean) {
  if (!WORKER_URL || skipTracking) return;

  // Prevent duplicate tracking in the same session
  if (sessionStorage.getItem("dst:tracked")) return;
  sessionStorage.setItem("dst:tracked", "1");

  // Return visitor detection
  const hasVisited = !!localStorage.getItem("dst:visitor");
  localStorage.setItem("dst:visitor", "1");

  // Parse referrer
  let referrer = "direct";
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (!refUrl.hostname.endsWith("dstcraft.com")) {
        referrer = refUrl.hostname.replace(/^www\./, "");
      } else {
        referrer = ""; // internal navigation — skip
      }
    } catch {
      referrer = "direct";
    }
  }

  try {
    await fetch(`${WORKER_URL}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ua: navigator.userAgent.slice(0, 120),
        isReturn: hasVisited,
        ...(referrer ? { referrer } : {}),
      }),
    });
  } catch {
    // Silently fail
  }
}

/** Track session duration — call on visibility change / unload */
export function initDurationTracking(skipTracking?: boolean) {
  if (!WORKER_URL || skipTracking) return;

  const start = Date.now();

  function sendDuration() {
    const seconds = Math.round((Date.now() - start) / 1000);
    if (seconds < 2) return; // Ignore very short visits
    navigator.sendBeacon(
      `${WORKER_URL}/event`,
      JSON.stringify({ type: "duration", value: seconds }),
    );
  }

  // visibilitychange is more reliable than beforeunload on mobile Safari
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendDuration();
    }
  });
}

/** Submit a star rating (1~5) */
export async function submitRating(rating: number): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Track an item click for popularity ranking */
export function trackItemClick(itemId: string) {
  if (!WORKER_URL) return;
  navigator.sendBeacon(
    `${WORKER_URL}/event`,
    JSON.stringify({ type: "item_click", itemId }),
  );
}

/** Track a generic event */
export function trackEvent(type: "search" | "pwa_install" | "share" | "github_star_click", skipTracking?: boolean) {
  if (!WORKER_URL || skipTracking) return;
  // Use sendBeacon to avoid blocking
  navigator.sendBeacon(
    `${WORKER_URL}/event`,
    JSON.stringify({ type }),
  );
}

/** Fetch analytics data for the stats page (requires admin JWT) */
export async function fetchAnalytics(token: string, days = 7, excludeCountry?: string): Promise<AnalyticsData | null> {
  if (!WORKER_URL || !token) return null;

  try {
    const params = new URLSearchParams({ days: String(days) });
    if (excludeCountry) params.set("excludeCountry", excludeCountry);
    const res = await fetch(`${WORKER_URL}/stats?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
