// ad-audit.mjs — 광고 자리 종합 실측 (headless)
// node ad-audit.mjs <url> [width] [height]
//
// 확인 항목
//  1. 문서 내 모든 ezoic placeholder(우리 것 + 자동 삽입) 의 위치·크기·부모 체인
//  2. 배달된 실제 크리에이티브 규격 (iframe width×height)
//  3. CLS (layout-shift 엔트리 + 어떤 노드가 밀렸는지)
import { chromium } from "playwright-core";

const [url, W = "1600", H = "1000"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: +W, height: +H } });

// CLS 수집기를 문서 스크립트보다 먼저 심는다
await page.addInitScript(() => {
  window.__cls = { total: 0, entries: [] };
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__cls.total += e.value;
      window.__cls.entries.push({
        value: +e.value.toFixed(5),
        t: Math.round(e.startTime),
        sources: (e.sources || []).map((s) => {
          const n = s.node;
          if (!n || !n.tagName) return "(detached)";
          const id = n.id ? `#${n.id}` : "";
          const cls = typeof n.className === "string" && n.className ? `.${n.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
          return `${n.tagName.toLowerCase()}${id}${cls}`;
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
});

await page.goto(url, { waitUntil: "domcontentloaded" });
// 지연 로드 자리를 깨우기 위해 천천히 아래로
for (let i = 0; i < 6; i++) {
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(700);
}
await page.waitForTimeout(6000);

const out = await page.evaluate(() => {
  const chain = (el) => {
    const parts = [];
    for (let n = el.parentElement, i = 0; n && i < 4; n = n.parentElement, i++) {
      const id = n.id ? `#${n.id}` : "";
      const slot = n.getAttribute?.("data-ad-slot");
      parts.push(`${n.tagName.toLowerCase()}${id}${slot ? `[data-ad-slot=${slot}]` : ""}`);
    }
    return parts.join(" < ");
  };
  const ph = [...document.querySelectorAll('[id^="ezoic-pub-ad-placeholder"]')].map((el) => {
    const r = el.getBoundingClientRect();
    const ours = !!el.closest("[data-ad-slot]");
    const ifr = [...el.querySelectorAll("iframe")].map((f) => {
      const fr = f.getBoundingClientRect();
      return `${Math.round(fr.width)}x${Math.round(fr.height)}`;
    });
    return {
      id: el.id.replace("ezoic-pub-ad-placeholder-", "#"),
      ours,
      rect: `${Math.round(r.width)}x${Math.round(r.height)} @y=${Math.round(r.top + window.scrollY)}`,
      filled: el.innerHTML.length,
      creatives: ifr,
      parents: chain(el),
    };
  });
  const slots = [...document.querySelectorAll("[data-ad-slot]")].map((el) => {
    const r = el.getBoundingClientRect();
    return { slot: el.getAttribute("data-ad-slot"), h: Math.round(r.height), w: Math.round(r.width) };
  });
  return {
    viewport: `${innerWidth}x${innerHeight}`,
    cls: { total: +window.__cls.total.toFixed(4), worst: window.__cls.entries.sort((a, b) => b.value - a.value).slice(0, 5) },
    ourSlots: slots,
    placeholders: ph,
  };
});

console.log(JSON.stringify({ url, ...out }, null, 1));
await browser.close();
