const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

function analyticsUrl(path: string): string | null {
  if (typeof window !== "undefined" && window.location.hostname.endsWith("dstcraft.com")) {
    return `/api${path}`;
  }
  return WORKER_URL ? `${WORKER_URL}${path}` : null;
}

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
  const url = analyticsUrl("/track");
  if (!url || skipTracking) return;

  if (sessionStorage.getItem("dst:tracked")) return;
  sessionStorage.setItem("dst:tracked", "1");

  const hasVisited = !!localStorage.getItem("dst:visitor");
  localStorage.setItem("dst:visitor", "1");

  let referrer = "";
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (!refUrl.hostname.endsWith("dstcraft.com")) {
        referrer = refUrl.hostname.replace(/^www\./, "");
      }
    } catch { /* malformed referrer */ }
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ua: navigator.userAgent.slice(0, 120),
        isReturn: hasVisited,
        ...(referrer ? { referrer } : {}),
      }),
    });
  } catch {
  }
}

/** Track session duration — send once when user leaves the page */
export function initDurationTracking(skipTracking?: boolean) {
  const eventUrl = analyticsUrl("/event");
  if (!eventUrl || skipTracking) return;

  const start = Date.now();
  let sent = false;

  function sendDuration() {
    if (sent) return;
    const seconds = Math.round((Date.now() - start) / 1000);
    if (seconds < 2) return;
    sent = true;
    navigator.sendBeacon(eventUrl!, JSON.stringify({ type: "duration", value: seconds }));
  }

  // visibilitychange is more reliable than beforeunload on mobile Safari
  // Send only once — the final duration from page open to first hide
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

/** Fetch top supporters (public, cached). Names only — amounts are not exposed. */
export async function fetchSupporters(): Promise<{ name: string }[]> {
  if (!WORKER_URL) return [];
  try {
    const res = await fetch(`${WORKER_URL}/supporters`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.supporters) ? data.supporters : [];
  } catch {
    return [];
  }
}

/** Track an item click for popularity ranking */
export function trackItemClick(itemId: string) {
  const url = analyticsUrl("/event");
  if (!url) return;
  navigator.sendBeacon(url, JSON.stringify({ type: "item_click", itemId }));
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

/** Submit anonymous feedback — returns feedback ID on success, null on failure */
export async function submitFeedback(message: string): Promise<string | null> {
  if (!WORKER_URL) return null;
  try {
    const res = await fetch(`${WORKER_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { ok: boolean; id?: string };
    return data.id ?? null;
  } catch {
    return null;
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
  reply?: string | null;
  hidden?: boolean;
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

/** Update feedback status + optional reply (admin only) */
export async function updateFeedbackStatus(token: string, id: string, status: FeedbackStatus, reply?: string): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status, ...(reply ? { reply } : {}) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Public feedback item (no IP/country) */
export interface PublicFeedbackItem {
  id: string;
  message: string;
  time: string;
  status: FeedbackStatus;
  reply: string | null;
}

/** Fetch public feedback board */
export async function fetchPublicFeedback(): Promise<PublicFeedbackItem[]> {
  if (!WORKER_URL) return [];
  try {
    const res = await fetch(`${WORKER_URL}/feedback/public`);
    if (!res.ok) return [];
    const data = await res.json() as { items: PublicFeedbackItem[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

/** Toggle feedback hidden status (admin only) */
export async function toggleFeedbackHidden(token: string, id: string, hidden: boolean): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, hidden }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Delete feedback (admin only) */
export async function deleteFeedback(token: string, id: string): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await fetch(`${WORKER_URL}/feedback?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Track a generic event */
export function trackEvent(type: "search" | "pwa_install" | "share" | "github_star_click", skipTracking?: boolean) {
  const url = analyticsUrl("/event");
  if (!url || skipTracking) return;
  navigator.sendBeacon(url, JSON.stringify({ type }));
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
