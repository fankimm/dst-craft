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

/**
 * 봇/크롤러 UA (#63).
 *
 * **OS 판정보다 먼저** 걸러야 한다. Bytespider·Baiduspider 같은 중국계 크롤러는 Android
 * 토큰을 달고 오기 때문에, 나중에 보면 봇 트래픽이 그대로 Android 집계에 섞인다.
 *
 * 정상 방문자를 봇으로 오분류하지 않도록 **토큰 경계를 지켜** 매칭한다 — 예전에 `bot` 을
 * 부분일치로 잡으면 네이버 인앱 브라우저(`NAVER(inapp; search; ...)`)나 `Cubot` 같은
 * 기기명이 걸린다. 그래서 `bot` 은 단어 경계 + 흔한 접미형(`-bot`, `bot/`)만 본다.
 */
const BOT_RE = new RegExp(
  [
    String.raw`\bbot\b`, String.raw`[-\/]bot\b`, String.raw`\bbot[\/-]`,
    "spider", "crawler", "crawling", "slurp",
    "baiduspider", "yisouspider", "sogou web spider", "bytespider", "petalbot",
    "googlebot", "bingbot", "yandex(bot|images)", "duckduckbot", "applebot",
    "facebookexternalhit", "twitterbot", "slackbot", "telegrambot", "discordbot",
    "ahrefs", "semrush", "mj12bot", "dotbot", "dataforseo",
    "gptbot", "claudebot", "anthropic-ai", "ccbot", "perplexitybot", "amazonbot",
    "headlesschrome", "phantomjs", "python-requests", "curl/", "wget/", "go-http-client",
    "okhttp", "axios/", "node-fetch", "libwww-perl", "java/", "scrapy",
    "monitoring", "uptimerobot", "pingdom", "site24x7", "statuscake",
  ].join("|"),
  "i",
);

/**
 * UA → OS 버킷 (#63).
 *
 * 예전에는 6종 정규식에 안 걸리면 전부 `Other` 였다. 그래서 `Other` 가 진단 불가능한
 * 쓰레기통이 됐다 — 중국계 크롤러(플랫폼 토큰 없음), UA 미전송, HarmonyOS가 한 칸에
 * 뭉쳐 있어 화면만 보고는 셋 중 무엇인지 가릴 수 없었다.
 *
 * 판정 순서가 곧 규칙이다:
 *  1. `Unknown` — UA 자체가 없음. `/_t` 는 인증·Origin 체크가 없어서 봇이 body 없이
 *     POST하면 여기로 온다. "정말 규칙에 없는 UA"(`Other`)와 구분해야 진단이 된다
 *  2. `Bot`     — OS 판정보다 먼저 (위 주석 참조)
 *  3. `HarmonyOS` — `OpenHarmony`/`ArkWeb` 은 android·linux 토큰이 없어 예전엔 `Other`
 *     였고, Android 호환 모드로 오는 HarmonyOS는 반대로 Android에 섞였다. 둘 다 여기로
 *  4. 나머지는 기존 6종
 */
export function parseOS(ua: string): string {
  if (!ua.trim()) return "Unknown";
  if (BOT_RE.test(ua)) return "Bot";
  if (/openharmony|arkweb|harmonyos/i.test(ua)) return "HarmonyOS";
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
