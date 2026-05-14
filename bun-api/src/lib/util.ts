import type { Context } from "hono";

// KST(UTC+9) 기준 날짜 키. 통계 집계는 모두 한국 표준시 기준.
// 이전 UTC 기준 today()는 KST 자정~오전9시 활동을 다른 날로 분류해 daily UV가 새는 문제가 있었음.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function dateKey(daysAgo = 0, base: Date = new Date()): string {
  const t = base.getTime() + KST_OFFSET_MS - daysAgo * 86400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function monthKey(monthsAgo = 0, base: Date = new Date()): string {
  // KST 기준 연/월을 직접 계산해서 월 경계 오차 회피.
  const kst = new Date(base.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth() - monthsAgo;
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 7);
}

export function today(): string {
  return dateKey(0);
}

export function isMobile(ua: string): boolean {
  return /mobile|android|iphone|ipad|ipod|webos|blackberry|opera mini|iemobile/i.test(ua);
}

export function parseOS(ua: string): string {
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  if (/cros/i.test(ua)) return "ChromeOS";
  return "Other";
}

export function extractIp(c: Context): string {
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return c.req.header("CF-Connecting-IP") || c.req.header("x-real-ip") || "unknown";
}

export function extractCountry(c: Context): string {
  return (
    c.req.header("CF-IPCountry") ||
    c.req.header("x-vercel-ip-country") ||
    ""
  );
}
