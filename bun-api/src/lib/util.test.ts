// `bun test` — UA 분류 회귀 테스트 (#63)
//
// 핵심 위험은 **정상 방문자를 봇으로 오분류하는 것**이다. `bot` 을 부분일치로 잡으면
// 네이버 인앱 브라우저나 `Cubot` 같은 기기명이 걸려 실사용자 트래픽이 통째로 Bot 버킷에
// 들어간다. 그래서 아래 "정상 방문자" 케이스를 고정해 둔다.
import { expect, test, describe } from "bun:test";
import { parseOS, isMobile } from "./util";

describe("parseOS — 정상 방문자", () => {
  const cases: [string, string][] = [
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15", "iOS"],
    ["Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15", "iOS"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140", "Windows"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140", "macOS"],
    ["Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 Chrome/140 Mobile", "Android"],
    ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140", "Linux"],
    ["Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/140", "ChromeOS"],
    // 네이버 인앱 — `bot` 부분일치로 오분류되던 대표 케이스
    ["Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/140 Mobile NAVER(inapp; search; 1234; 12.0.0)", "Android"],
    // 기기명에 bot 이 들어가는 실제 단말
    ["Mozilla/5.0 (Linux; Android 12; CUBOT NOTE 20) AppleWebKit/537.36 Chrome/120 Mobile", "Android"],
    // 카카오톡 인앱
    ["Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile KAKAOTALK", "Android"],
  ];
  for (const [ua, want] of cases) {
    test(`${want} ← ${ua.slice(0, 52)}…`, () => expect(parseOS(ua)).toBe(want));
  }
});

describe("parseOS — HarmonyOS", () => {
  // OpenHarmony 계열은 android/linux 토큰이 없어 예전엔 Other 로 샜다.
  test("OpenHarmony NEXT", () =>
    expect(parseOS("Mozilla/5.0 (Phone; OpenHarmony 5.0) AppleWebKit/537.36 ArkWeb/4.1.6.1")).toBe("HarmonyOS"));
  // 반대로 Android 호환 모드는 Android 로 섞였다 — 둘 다 HarmonyOS 로 모은다.
  test("Android 호환 HarmonyOS", () =>
    expect(parseOS("Mozilla/5.0 (Linux; Android 10; HarmonyOS; ELS-AN00) AppleWebKit/537.36 Chrome/120")).toBe("HarmonyOS"));
});

describe("parseOS — 봇은 OS보다 먼저", () => {
  const bots = [
    // 플랫폼 토큰이 아예 없는 중국계 크롤러
    "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
    "Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)",
    "Mozilla/5.0 (compatible; YisouSpider/5.0; http://www.yisou.com/help/help_zhanzhang.html)",
    // Android 토큰을 달고 오는 봇 — 먼저 안 거르면 Android 집계가 오염된다
    "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)",
    "Mozilla/5.0 (Linux; Android 7.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36 (compatible; PetalBot;+https://webmaster.petalsearch.com/site/petalbot)",
    // 검색·소셜
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    // AI 크롤러
    "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    // 스크립트/모니터링
    "curl/8.7.1",
    "python-requests/2.32.3",
    "Go-http-client/2.0",
    "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/140.0.0.0",
  ];
  for (const ua of bots) {
    test(`Bot ← ${ua.slice(0, 52)}…`, () => expect(parseOS(ua)).toBe("Bot"));
  }
});

describe("parseOS — Unknown vs Other", () => {
  // `/_t` 는 인증·Origin 체크가 없어 body 없이 POST하면 ua 가 빈 문자열로 온다.
  test("빈 UA는 Unknown", () => expect(parseOS("")).toBe("Unknown"));
  test("공백뿐인 UA도 Unknown", () => expect(parseOS("   ")).toBe("Unknown"));
  // Other 는 "정말 규칙에 없는 UA" 만 의미해야 한다.
  test("규칙 밖 UA는 Other", () => expect(parseOS("Mozilla/5.0 (Unknown Platform 1.0)")).toBe("Other"));
});

describe("isMobile", () => {
  test("Android 폰", () =>
    expect(isMobile("Mozilla/5.0 (Linux; Android 14) Chrome/140 Mobile")).toBe(true));
  test("데스크탑 크롬", () =>
    expect(isMobile("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/140")).toBe(false));
});
