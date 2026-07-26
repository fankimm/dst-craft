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

// 이름이 명확한 크롤러/프리뷰어/모니터링 봇.
// 주의: 네이버/다음은 브랜드명이 아니라 크롤러 이름(Yeti/Daumoa)으로만 매칭한다 —
// 네이버 앱 인앱 브라우저 UA에 "NAVER" 문자열이 들어 있어서 브랜드명으로 잡으면
// 실제 한국인 방문자가 통째로 봇으로 분류된다.
const KNOWN_BOT_UA =
  /(googlebot|google-inspectiontool|bingbot|yandexbot|baiduspider|sogou|yisou|petalbot|bytespider|applebot|duckduckbot|yeti|daumoa|semrush|ahrefs|mj12|dotbot|blexbot|dataforseo|serpstat|seznambot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexity|ccbot|amazonbot|meta-externalagent|facebookexternalhit|twitterbot|slackbot|discordbot|telegrambot|linkedinbot|pinterest|redditbot|whatsapp|feedfetcher|uptimerobot|pingdom|censys|internetmeasurement)/i;

// 이름 없는 자동화 트래픽의 일반 시그니처 (HTTP 라이브러리, 헤드리스 브라우저 등).
const GENERIC_BOT_UA =
  /(bot\b|crawler|crawling|spider|scraper|slurp|archiver|http[-_ ]?client|python-requests|aiohttp|scrapy|okhttp|go-http-client|java\/|curl\/|wget|libwww|headlesschrome|phantomjs)/i;

// GENERIC_BOT_UA의 `bot\b`에 걸리는 실제 기기/브랜드명 (예: "CUBOT NOTE 20").
// 이 목록에 걸리면 일반 시그니처는 무시하고 KNOWN_BOT_UA만 본다.
const BOT_FALSE_POSITIVE = /(cubot|hotbot|abbott)/i;

/**
 * 봇/크롤러 UA 판정.
 * parseOS에서 OS 판정보다 **먼저** 호출해야 한다 — Bytespider(Android 토큰 포함),
 * 클라우드 스크래퍼 fleet(Windows NT 로테이션)처럼 정상 플랫폼 토큰을 달고 오는 봇이
 * 많아서, OS를 먼저 보면 Windows/Android 집계에 봇이 섞인다.
 */
export function isBot(ua: string): boolean {
  if (!ua) return false;
  if (BOT_FALSE_POSITIVE.test(ua)) return KNOWN_BOT_UA.test(ua);
  return KNOWN_BOT_UA.test(ua) || GENERIC_BOT_UA.test(ua);
}

/**
 * UA → OS 버킷. 통계 페이지의 "운영체제" 카드 + 접속자 로그에 그대로 쓰인다.
 *
 * "Other"가 중국 트래픽에 몰려 보이던 원인(#63): Baiduspider/Sogou 같은 중국계
 * 크롤러 UA는 `(compatible; XxxSpider; +http://...)` 형태라 플랫폼 토큰이 아예 없고,
 * 화웨이 HarmonyOS NEXT는 `(Phone; OpenHarmony 5.0)`이라 android/linux에 안 걸린다.
 * 둘 다 "Other"로 뭉뚱그려져 원인 진단이 불가능했으므로 별도 버킷으로 분리한다.
 * 이제 "Other"는 "정말로 분류 규칙에 없는 UA"만 의미한다.
 */
export function parseOS(ua: string): string {
  if (!ua.trim()) return "Unknown"; // UA 미전송 = 브라우저가 아닌 엔드포인트 직접 호출
  if (isBot(ua)) return "Bot";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  // HarmonyOS는 android보다 먼저 — HarmonyOS 4 이하는 Android 토큰을 함께 달고 온다.
  if (/harmonyos|openharmony|arkweb/i.test(ua)) return "HarmonyOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/cros/i.test(ua)) return "ChromeOS";
  if (/linux/i.test(ua)) return "Linux";
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
