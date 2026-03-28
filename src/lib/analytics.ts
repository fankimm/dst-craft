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

/** Fetch public average rating */
export async function fetchPublicRating(): Promise<{ avg: number; total: number; ratings?: Record<string, number> } | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/rating`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch top countries (public, cached) */
export async function fetchTopCountries(): Promise<{ code: string; count: number }[]> {
  if (!WORKER_URL) return [];
  try {
    const res = await fetch(`${WORKER_URL}/top-countries`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
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

/** Track a simulation combo (recipeId + 4 ingredients) */
export function trackCombo(recipeId: string, ingredientIds: string[]) {
  if (!WORKER_URL || ingredientIds.length !== 4) return;
  navigator.sendBeacon(
    `${WORKER_URL}/combo`,
    JSON.stringify({ recipeId, ingredients: ingredientIds }),
  );
}

/** Fetch popular combos for a recipe */
export async function fetchCombos(recipeId: string): Promise<{ ingredients: string[]; count: number }[]> {
  if (!WORKER_URL) return [];
  try {
    const res = await fetch(`${WORKER_URL}/combos/${recipeId}`);
    if (!res.ok) return [];
    const data = await res.json() as { combos: { ingredients: string[]; count: number }[] };
    return data.combos ?? [];
  } catch {
    return [];
  }
}

/** Submit anonymous feedback */
export async function submitFeedback(message: string): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.status === 429) return false;
    return res.ok;
  } catch {
    return false;
  }
}

export type FeedbackStatus = "new" | "done" | "hold" | "rejected";

export interface FeedbackItem {
  id: string;
  message: string;
  time: string;
  country: string;
  ip: string;
  status: FeedbackStatus;
}

/** Fetch feedback list (admin only) */
export async function fetchFeedback(token: string): Promise<FeedbackItem[]> {
  if (!WORKER_URL) return [];
  try {
    const res = await fetch(`${WORKER_URL}/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json() as { items: FeedbackItem[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

/** Update feedback status (admin only) */
export async function updateFeedbackStatus(token: string, id: string, status: FeedbackStatus): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
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

/** Fetch analytics data for the stats page (public; admin token enables extra details) */
export async function fetchAnalytics(token: string | null, days = 7, excludeCountry?: string): Promise<AnalyticsData | null> {
  if (!WORKER_URL) return null;

  try {
    const params = new URLSearchParams({ days: String(days) });
    if (excludeCountry) params.set("excludeCountry", excludeCountry);
    const fetchHeaders: Record<string, string> = {};
    if (token) fetchHeaders.Authorization = `Bearer ${token}`;
    const res = await fetch(`${WORKER_URL}/stats?${params}`, {
      headers: fetchHeaders,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
