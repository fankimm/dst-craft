import type { Context } from "hono";

export function today(): string {
  return new Date().toISOString().slice(0, 10);
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
