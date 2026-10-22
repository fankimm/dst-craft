// AdSense 자리 검증 (headless) — #134
//
//   node scripts/check-adsense-beta.mjs [base=https://beta.dstcraft.com]
//
// beta는 테스트 광고 모드(`data-adtest="on"`)라 실광고와 달리 결정적으로 채워진다. 그래서
// 여기서는 "채움" 자체를 판정에 넣는다 (Ezoic 시절 스크립트는 채움을 판정에서 뺐다 —
// 세션·스로틀에 따라 흔들렸기 때문). production 주소를 넘기면 채움 판정은 끄고 나머지만 본다.
//
// 확인 항목
//  1. `adsbygoogle.js` 스크립트 태그가 문서에 정확히 1개, 본체 로드(`adsbygoogle.loaded`)
//  2. 보이는 자리마다 `<ins class="adsbygoogle">` 1개 — 숨은 탭에는 없음, 같은 자리에 둘 없음
//  3. beta: 모든 `<ins>`에 `data-adtest="on"`, 응답 뒤 `data-ad-status="filled"` + iframe
//  4. 탭 왕복·카테고리 전환·상세 시트 뒤 콘솔에 adsbygoogle 오류 0건 ("already have ads" 등)
//  5. 상단 띠 CLS — 광고 도착 전후 띠 자리 높이 동일, 페이지 누적 layout-shift
//  6. 자동 광고(앵커·전면) `<ins>`: beta에서는 없어야 한다 (테스트 플래그가 없는 포맷)
//
// `npm i -D playwright-core` + 설치된 Chrome 사용.
import { chromium } from "playwright-core";

const BASE = (process.argv[2] ?? "https://beta.dstcraft.com").replace(/\/$/, "");
const IS_BETA = /beta\./.test(BASE);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];
const report = [];

const CLS_INIT = `
  window.__cls = 0;
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
      .observe({ type: "layout-shift", buffered: true });
  } catch {}
`;

async function snapshot(page) {
  return page.evaluate(() => {
    const ins = [...document.querySelectorAll("ins.adsbygoogle")].map((e) => {
      const host = e.closest("[data-ad-slot]");
      const r = e.getBoundingClientRect();
      return {
        variant: host?.getAttribute("data-ad-slot") ?? (e.getAttribute("data-anchor-status") ? "anchor" : e.getAttribute("data-vignette-loaded") ? "vignette" : "auto"),
        status: e.getAttribute("data-ad-status"),
        processed: e.getAttribute("data-adsbygoogle-status"),
        adtest: e.getAttribute("data-adtest"),
        slot: e.getAttribute("data-ad-slot"),
        w: Math.round(r.width),
        h: Math.round(r.height),
        iframe: !!e.querySelector("iframe"),
      };
    });
    const hosts = [...document.querySelectorAll("[data-ad-slot]")].map((h) => ({
      variant: h.getAttribute("data-ad-slot"),
      visible: h.getClientRects().length > 0,
      ins: h.querySelectorAll("ins.adsbygoogle").length,
      h: Math.round(h.getBoundingClientRect().height),
    }));
    return {
      scripts: document.querySelectorAll('script[src*="adsbygoogle"]').length,
      loaded: window.adsbygoogle?.loaded === true,
      ins,
      hosts,
      cls: Number((window.__cls ?? 0).toFixed(4)),
    };
  });
}

async function run(label, { viewport, path, actions = [] }) {
  const ctx = await browser.newContext({ userAgent: UA, viewport });
  const page = await ctx.newPage();
  await page.addInitScript(CLS_INIT);
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error" && /adsbygoogle|googlesyndication|TagError/i.test(m.text())) errors.push(m.text().slice(0, 160));
  });
  page.on("pageerror", (e) => {
    if (/adsbygoogle|TagError/i.test(String(e))) errors.push(String(e).slice(0, 160));
  });

  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await sleep(1500);
  const early = await snapshot(page); // 광고 도착 전 — 띠 높이 기준값
  await sleep(7000);
  const steps = [{ step: "초기", ...(await snapshot(page)) }];

  for (const a of actions) {
    await a.do(page);
    await sleep(a.wait ?? 2500);
    steps.push({ step: a.label, ...(await snapshot(page)) });
  }

  const final = steps[steps.length - 1];
  const first = steps[0];

  // 1. 로더
  if (first.scripts !== 1) problems.push(`${label}: adsbygoogle 스크립트 태그 ${first.scripts}개 (1이어야 함)`);
  if (!first.loaded) problems.push(`${label}: adsbygoogle.js 본체 미로드 (loaded=false)`);

  for (const s of steps) {
    // 2. 보이는 자리마다 ins 1개, 숨은 자리엔 0개
    for (const h of s.hosts) {
      if (h.visible && h.ins !== 1) problems.push(`${label}/${s.step}: 보이는 자리 ${h.variant}에 ins ${h.ins}개`);
      if (!h.visible && h.ins !== 0) problems.push(`${label}/${s.step}: 숨은 자리 ${h.variant}에 ins ${h.ins}개`);
    }
    // 3. 테스트 플래그·채움 (beta만 결정적)
    for (const i of s.ins) {
      if (IS_BETA && i.adtest !== "on") problems.push(`${label}/${s.step}: ${i.variant} ins에 data-adtest 없음 — beta에서 실광고 요청`);
      if (!i.processed) problems.push(`${label}/${s.step}: ${i.variant} ins가 처리되지 않음 (push 누락 또는 폭 0: ${i.w}×${i.h})`);
      if (IS_BETA && i.variant !== "anchor" && i.variant !== "vignette" && i.status !== "filled") {
        problems.push(`${label}/${s.step}: ${i.variant} status=${i.status ?? "(없음)"} iframe=${i.iframe}`);
      }
      // 6. beta에 자동 광고가 있으면 테스트 플래그 없는 실광고
      if (IS_BETA && (i.variant === "anchor" || i.variant === "vignette" || i.variant === "auto")) {
        problems.push(`${label}/${s.step}: 자동 광고 ins(${i.variant}) 발견 — beta는 ?client= 없이 로드돼야 한다`);
      }
    }
  }
  // 4. 콘솔
  for (const e of errors) problems.push(`${label}: 콘솔 ${e}`);
  // 5. 띠 CLS — 도착 전후 자리 높이
  const topEarly = early.hosts.find((h) => h.variant === "top" && h.visible);
  const topLate = first.hosts.find((h) => h.variant === "top" && h.visible);
  if (topEarly && topLate && topEarly.h !== topLate.h) {
    problems.push(`${label}: 상단 띠 높이 변화 ${topEarly.h} → ${topLate.h}px (CLS)`);
  }
  if (final.cls > 0.1) problems.push(`${label}: 누적 layout-shift ${final.cls} (> 0.1)`);

  report.push({ label, viewport: `${viewport.width}×${viewport.height}`, cls: final.cls, errors: errors.length, steps: steps.map((s) => ({ step: s.step, ins: s.ins.map((i) => `${i.variant}:${i.status ?? "-"}${i.adtest ? "(test)" : ""}${i.w}×${i.h}`) })) });
  await ctx.close();
}

const clickText = (t) => async (page) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === t);
    if (!b) return false;
    b.click();
    return true;
  }, t);
  if (!ok) throw new Error(`버튼 없음: ${t}`);
};

const DESKTOP = { width: 1600, height: 900 }; // 1500 이상 — 레일이 그려지는 폭
const MOBILE = { width: 390, height: 844 };

await run("앱(데스크탑)", {
  viewport: DESKTOP,
  path: "/",
  actions: [
    { label: "탭: 요리", do: clickText("요리") },
    { label: "탭: 보스", do: clickText("보스") },
    { label: "탭: 제작", do: clickText("제작") },
    { label: "카테고리 → 도구", do: clickText("도구") },
    {
      label: "상세 시트 열기",
      do: async (page) => {
        await page.evaluate(() => {
          const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "도끼");
          b?.click();
        });
      },
    },
    {
      label: "상세 시트 닫기",
      do: async (page) => {
        await page.keyboard.press("Escape");
      },
    },
    { label: "홈으로", do: clickText("제작") },
  ],
});
await run("앱(모바일)", { viewport: MOBILE, path: "/", actions: [{ label: "탭: 요리", do: clickText("요리") }, { label: "탭: 제작", do: clickText("제작") }] });
await run("SEO 상세", { viewport: DESKTOP, path: "/item/abigail-flower" });
await run("SEO 상세(모바일)", { viewport: MOBILE, path: "/item/abigail-flower" });
await run("농사", { viewport: DESKTOP, path: "/farming" });

await browser.close();

console.log(JSON.stringify(report, null, 1));
if (problems.length) {
  console.error("\n문제:");
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}
console.log("\n✅ 문제 없음");
