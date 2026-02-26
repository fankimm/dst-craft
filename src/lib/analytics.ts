const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

function isAdmin(): boolean {
  try { return localStorage.getItem("dst:admin") === "1"; } catch { return false; }
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
    device?: string;
    os?: string;
  }[];
  device: Record<string, number>;
  os: Record<string, number>;
  returnVisitors: number;
  returnRate: number;
  avgDuration: number;
  searchCount: number;
  pwaInstalls: number;
}

/** Track a page visit — call once on app load */
export async function trackVisit() {
  if (!WORKER_URL || isAdmin()) return;

  // Prevent duplicate tracking in the same session
  if (sessionStorage.getItem("dst:tracked")) return;
  sessionStorage.setItem("dst:tracked", "1");

  // Return visitor detection
  const hasVisited = !!localStorage.getItem("dst:visitor");
  localStorage.setItem("dst:visitor", "1");

  try {
    await fetch(`${WORKER_URL}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ua: navigator.userAgent.slice(0, 120),
        isReturn: hasVisited,
      }),
    });
  } catch {
    // Silently fail
  }
}

/** Track session duration — call on visibility change / unload */
export function initDurationTracking() {
  if (!WORKER_URL || isAdmin()) return;

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

/** Track a generic event */
export function trackEvent(type: "search" | "pwa_install") {
  if (!WORKER_URL || isAdmin()) return;
  // Use sendBeacon to avoid blocking
  navigator.sendBeacon(
    `${WORKER_URL}/event`,
    JSON.stringify({ type }),
  );
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
