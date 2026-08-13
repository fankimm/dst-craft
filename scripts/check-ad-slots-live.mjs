// 실광고 상태 관측 스크립트 (#75) — 판정용이 아니라 **관측용**.
//
// `check-ad-slots*.mjs`는 Ezoic을 가짜로 갈아끼워 우리 요청만 결정적으로 본다.
// 이 스크립트는 반대로 **진짜 광고가 붙은 창**에서 SDK/GPT 내부 상태를 관측한다.
// 실제 광고는 세션·스로틀·A/B(무광고 대조군)에 따라 흔들리므로 CI 판정에는 쓰지 말 것.
//
// 확인 항목
//  1. GPT 슬롯 누수 — 탭을 왕복해도 `googletag.pubads().getSlots()`가 늘지 않아야 한다.
//     늘어난다면 화면에 없는 슬롯에 자동 리프레시가 계속 입찰을 걸게 된다.
//  2. 자동 삽입 광고 — 우리가 정의하지 않은 슬롯(Interstitial/Anchor 등)이 있는지.
//  3. SDK API 표면 — 버전이 올라가며 우리가 쓰는 함수가 사라지지 않았는지.
//
// 사용: node scripts/check-ad-slots-live.mjs [base-url]   (npm i -D playwright-core 필요)
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("playwright-core가 필요합니다:  npm i -D playwright-core   (설치된 Chrome을 그대로 씁니다)");
  process.exit(2);
}

const BASE = process.argv[2] ?? "https://beta.dstcraft.com";
// 백그라운드 탭에서는 IntersectionObserver가 멈춰 광고가 아예 안 뜬다 → 창을 띄운다
const browser = await chromium.launch({ channel: "chrome", headless: false, args: ["--window-size=1500,950"] });
const page = await browser.newPage({ viewport: { width: 1500, height: 850 } });

const slots = () =>
  page.evaluate(() =>
    window.googletag?.pubads ? window.googletag.pubads().getSlots().map((s) => s.getSlotElementId()) : null,
  );
const fills = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("[data-ad-slot]")]
      .filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => {
        const ph = e.querySelector('[id^="ezoic-pub-ad-placeholder-"]');
        const st = !ph ? "no-ph" : ph.querySelector("iframe") ? "FILLED" : ph.childElementCount ? "badge" : "EMPTY";
        return `${e.dataset.adSlot}:${st}`;
      }),
  );
const click = (label) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === t);
    b?.click();
  }, label);

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(12000);

const api = await page.evaluate(() => {
  const ez = window.ezstandalone || {};
  const used = ["config", "showAds", "destroyPlaceholders", "refreshAds", "setInterstitialAllowed", "isEzoicUser"];
  return Object.fromEntries(used.map((k) => [k, typeof ez[k]]));
});
const before = { slots: await slots(), fills: await fills() };

for (let i = 0; i < 10; i++) {
  await click("요리");
  await page.waitForTimeout(700);
  await click("제작");
  await page.waitForTimeout(700);
}
await page.waitForTimeout(4000);
const after = { slots: await slots(), fills: await fills() };

const problems = [];
if (before.slots && after.slots && after.slots.length > before.slots.length) {
  problems.push(`GPT 슬롯 누수: ${before.slots.length} → ${after.slots.length} (화면에 없는 슬롯에 리프레시가 걸린다)`);
}
for (const k of Object.keys(api)) {
  if (api[k] === "undefined") problems.push(`SDK에 ${k}()가 없다 — 버전 변경 확인 필요`);
}
const auto = (after.slots ?? []).filter((s) => /interstitial|anchor|vignette|outstream/i.test(s));
if (auto.length) problems.push(`우리가 정의하지 않은 자동 삽입 슬롯: ${auto.join(", ")}`);

console.log(JSON.stringify({ api, before, after, problems }, null, 1));
await browser.close();
process.exit(problems.length ? 1 : 0);
