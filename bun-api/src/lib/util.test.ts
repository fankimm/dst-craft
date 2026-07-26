import { describe, expect, test } from "bun:test";
import { isBot, parseOS } from "./util";

// 실제 access log에서 관측되는 UA 형태를 그대로 고정해 둔다.
// (분류 규칙을 손댈 때 정상 방문자가 봇으로 새는지 즉시 확인하려는 목적)
describe("parseOS", () => {
  test("일반 브라우저", () => {
    expect(parseOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36")).toBe("Windows");
    expect(parseOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15")).toBe("macOS");
    expect(parseOS("Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1")).toBe("iOS");
    expect(parseOS("Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 Chrome/131.0 Mobile")).toBe("Android");
    expect(parseOS("Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/131.0")).toBe("ChromeOS");
    expect(parseOS("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0")).toBe("Linux");
  });

  test("네이버/카카오 인앱 브라우저는 봇이 아니다", () => {
    expect(parseOS("Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 NAVER(inapp; search; 2000; 12.9.2)")).toBe("iOS");
    expect(parseOS("Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 Chrome/131.0 Mobile KAKAOTALK")).toBe("Android");
  });

  test("HarmonyOS — android 토큰 유무와 무관하게 HarmonyOS", () => {
    // HarmonyOS NEXT (Android 계보 없음) — 기존 규칙에선 Other로 샜다
    expect(parseOS("Mozilla/5.0 (Phone; OpenHarmony 5.0) AppleWebKit/537.36 ArkWeb/4.1.6.1 Mobile")).toBe("HarmonyOS");
    // HarmonyOS 4 이하 (Android 호환)
    expect(parseOS("Mozilla/5.0 (Linux; Android 12; HarmonyOS; LIO-AN00) AppleWebKit/537.36 Chrome/114.0 Mobile")).toBe("HarmonyOS");
  });

  test("크롤러 — 플랫폼 토큰 유무와 무관하게 Bot", () => {
    // 플랫폼 토큰이 아예 없는 형태 (기존 규칙에선 전부 Other)
    expect(parseOS("Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)")).toBe("Bot");
    expect(parseOS("Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)")).toBe("Bot");
    expect(parseOS("Mozilla/5.0 (compatible; YisouSpider/5.0; http://www.yisou.com/help)")).toBe("Bot");
    expect(parseOS("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe("Bot");
    // 정상 플랫폼 토큰을 달고 오는 봇 (기존 규칙에선 Android/Windows로 집계됐다)
    expect(parseOS("Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 Chrome/70.0 Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)")).toBe("Bot");
    expect(parseOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0 Safari/537.36 HeadlessChrome/119.0")).toBe("Bot");
    // 스크립트/HTTP 라이브러리
    expect(parseOS("python-requests/2.32.3")).toBe("Bot");
    expect(parseOS("curl/8.7.1")).toBe("Bot");
  });

  test("CUBOT 등 bot 문자열이 들어간 실제 기기는 오탐하지 않는다", () => {
    expect(parseOS("Mozilla/5.0 (Linux; Android 11; CUBOT NOTE 20) AppleWebKit/537.36 Chrome/95.0 Mobile")).toBe("Android");
  });

  test("UA 미전송은 Unknown — 엔드포인트 직접 호출 시그니처", () => {
    expect(parseOS("")).toBe("Unknown");
    expect(parseOS("   ")).toBe("Unknown");
  });

  test("분류 규칙에 없는 UA만 Other", () => {
    expect(parseOS("Mozilla/5.0 (PlayStation; PlayStation 5/9.60)")).toBe("Other");
  });
});

describe("isBot", () => {
  test("빈 UA는 봇으로 단정하지 않는다 (Unknown과 구분)", () => {
    expect(isBot("")).toBe(false);
  });
});
