import { apiFetch, TokenExpiredError, notifyAuthExpired } from "./api-fetch";
import { isJWTValid } from "./jwt";

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
    id?: number;
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
  /** 풀 URL referrer Top 50 — admin only (비-admin 응답은 빈 배열) */
  referrerUrls?: { url: string; count: number }[];
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
  let referrerUrl = "";
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (!refUrl.hostname.endsWith("dstcraft.com")) {
        referrer = refUrl.hostname.replace(/^www\./, "");
        // 풀 URL은 외부 도메인일 때만 전송. 길이는 서버에서 500자 클램프.
        referrerUrl = document.referrer.slice(0, 500);
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
        ...(referrerUrl ? { referrerUrl } : {}),
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
// 캐시는 globalThis에 — Turbopack 코드 분할로 같은 모듈이 여러 chunk에 중복 박혀도
// module-level 변수로는 chunk별로 캐시가 분리되어 dedupe가 안 됨. 단일 소스 보장 필요.
type SupportersCache = { promise: Promise<{ name: string }[]>; at: number };
const SUPPORTERS_KEY = "__dstSupportersCache";
const SUPPORTERS_TTL_MS = 60_000;

export async function fetchSupporters(): Promise<{ name: string }[]> {
  if (!WORKER_URL) return [];
  const g = globalThis as Record<string, unknown>;
  const cached = g[SUPPORTERS_KEY] as SupportersCache | undefined;
  if (cached && Date.now() - cached.at < SUPPORTERS_TTL_MS) {
    return cached.promise;
  }
  const promise = (async () => {
    try {
      const res = await fetch(`${WORKER_URL}/supporters`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.supporters) ? data.supporters : [];
    } catch {
      return [];
    }
  })();
  g[SUPPORTERS_KEY] = { promise, at: Date.now() } satisfies SupportersCache;
  return promise;
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
  // 번역 메타 (자동/수동 번역 후 채워짐). admin 응답에 노출.
  messageTranslated?: string | null;
  messageLang?: string | null;
  messageTranslatedAt?: number | null;
  messageTranslatedModel?: string | null;
  replyTranslated?: string | null;
  replyLang?: string | null;
  replyTranslatedAt?: number | null;
  replyTranslatedModel?: string | null;
}

/** Fetch feedback list (admin only) */
export async function fetchFeedback(token: string): Promise<FeedbackItem[]> {
  if (!WORKER_URL) return [];
  try {
    const res = await apiFetch(`${WORKER_URL}/feedback`, token);
    if (!res.ok) return [];
    const data = await res.json() as { items: FeedbackItem[] };
    return data.items ?? [];
  } catch (e) {
    if (e instanceof TokenExpiredError) return [];
    return [];
  }
}

/** Update feedback status + optional reply (admin only) */
export async function updateFeedbackStatus(token: string, id: string, status: FeedbackStatus, reply?: string): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await apiFetch(`${WORKER_URL}/feedback`, token, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...(reply ? { reply } : {}) }),
    });
    return res.ok;
  } catch (e) {
    if (e instanceof TokenExpiredError) return false;
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
  // 번역 (KR↔EN 양방향). null = 미번역. 프론트가 locale 따라 선택해 표시.
  messageTranslated?: string | null;
  messageLang?: string | null;
  replyTranslated?: string | null;
  replyLang?: string | null;
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
    const res = await apiFetch(`${WORKER_URL}/feedback`, token, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hidden }),
    });
    return res.ok;
  } catch (e) {
    if (e instanceof TokenExpiredError) return false;
    return false;
  }
}

/** Delete feedback (admin only) */
export async function deleteFeedback(token: string, id: string): Promise<boolean> {
  if (!WORKER_URL) return false;
  try {
    const res = await apiFetch(`${WORKER_URL}/feedback?id=${encodeURIComponent(id)}`, token, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    if (e instanceof TokenExpiredError) return false;
    return false;
  }
}

/** Track a generic event */
export function trackEvent(type: "search" | "pwa_install" | "share" | "github_star_click", skipTracking?: boolean) {
  const url = analyticsUrl("/event");
  if (!url || skipTracking) return;
  navigator.sendBeacon(url, JSON.stringify({ type }));
}

export interface VisitorPage {
  items: AnalyticsData["recentVisitors"];
  nextCursor: number | null;
}

/** Fetch paginated visitors (admin only). Pass cursor=last id to fetch older. */
export async function fetchVisitors(token: string, cursor: number | null, limit = 30): Promise<VisitorPage | null> {
  if (!WORKER_URL || !token) return null;
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor != null) params.set("cursor", String(cursor));
    const res = await apiFetch(`${WORKER_URL}/visitors?${params}`, token);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    if (e instanceof TokenExpiredError) return null;
    return null;
  }
}

/** Fetch analytics data for the stats page (public; admin token enables extra details) */
export async function fetchAnalytics(token: string | null, days = 7, excludeCountry?: string): Promise<AnalyticsData | null> {
  if (!WORKER_URL) return null;

  // 토큰이 있지만 만료됐으면 logout 트리거 후 public 모드로 fallback
  let effectiveToken = token;
  if (effectiveToken && !isJWTValid(effectiveToken)) {
    notifyAuthExpired();
    effectiveToken = null;
  }

  try {
    const params = new URLSearchParams({ days: String(days) });
    if (excludeCountry) params.set("excludeCountry", excludeCountry);
    // CF 엣지가 URL만으로 cache key 구성하고 응답의 'private' 지시자도 가끔 무시함 → admin 요청이 옛 public 응답 받는 회귀.
    // 토큰이 있을 때 _t=admin query를 붙여 cache key 분리. 백엔드는 무시.
    const fetchHeaders: Record<string, string> = {};
    if (effectiveToken) {
      fetchHeaders.Authorization = `Bearer ${effectiveToken}`;
      params.set("_t", "admin");
    }
    const res = await fetch(`${WORKER_URL}/stats?${params}`, {
      headers: fetchHeaders,
    });
    if (res.status === 401) {
      notifyAuthExpired();
      return null;
    }
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
