// 광고 자리 오케스트레이션 회귀 테스트 (#75)
//
// 실제 Ezoic은 세션/스로틀에 따라 광고를 줬다 안 줬다 하고, 백그라운드 탭에서는
// IntersectionObserver 자체가 안 돌아 측정이 불가능하다. 그래서 Ezoic 스크립트를
// 차단하고 같은 인터페이스의 가짜를 심어 **우리가 무엇을 요청하는지**만 결정적으로 본다.
//
// 사용: node ad-harness.mjs [base-url]
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("playwright-core가 필요합니다:  npm i -D playwright-core   (설치된 Chrome을 그대로 씁니다)");
  process.exit(2);
}

const BASE = process.argv[2] ?? "https://beta.dstcraft.com";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

// 진짜 Ezoic/CMP 스크립트는 차단 — 가짜가 덮어써지지 않게
await page.route(/(ezojs|ezoic|gatekeeperconsent|ezodn|ezoicanalytics)/i, (r) => r.abort());

await page.addInitScript(() => {
  const calls = [];
  window.__adCalls = calls;
  const rec = (kind) => (...ids) => calls.push(`${kind}(${ids.join(",")})`);
  window.ezstandalone = {
    enabled: true,
    initialized: true,
    // 진짜 SDK처럼 즉시 실행하는 큐
    cmd: { push: (fn) => fn() },
    showAds: rec("show"),
    destroyPlaceholders: rec("destroy"),
    getSelectedPlaceholders: () => ({}),
  };
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const state = () =>
  page.evaluate(() => {
    const counts = {};
    document.querySelectorAll('[id^="ezoic-pub-ad-placeholder-"]').forEach((e) => {
      counts[e.id] = (counts[e.id] || 0) + 1;
    });
    const visible = [...document.querySelectorAll("[data-ad-slot]")]
      .filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => {
        const ph = e.querySelector('[id^="ezoic-pub-ad-placeholder-"]');
        return e.dataset.adSlot + (ph ? "#" + ph.id.replace("ezoic-pub-ad-placeholder-", "") : "#none");
      });
    const hiddenWithPh = [...document.querySelectorAll("[data-ad-slot]")]
      .filter((e) => e.getBoundingClientRect().width === 0)
      .filter((e) => !!e.querySelector('[id^="ezoic-pub-ad-placeholder-"]'))
      .map((e) => e.dataset.adSlot);
    return {
      visible,
      dup: Object.entries(counts).filter(([, n]) => n > 1).map(([k, n]) => `${k}x${n}`),
      hiddenWithPh,
    };
  });

const takeCalls = () => page.evaluate(() => { const c = [...window.__adCalls]; window.__adCalls.length = 0; return c; });

const clickText = async (label) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === t);
    if (!b) return false;
    b.click();
    return true;
  }, label);
  if (!ok) throw new Error(`버튼 없음: ${label}`);
};

const results = [];
const step = async (label, action, wait = 1200) => {
  if (action) await action();
  await sleep(wait);
  const s = await state();
  const calls = await takeCalls();
  results.push({ step: label, calls, ...s });
};

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await step("초기 로드(제작 홈)", null, 2500);

for (const tab of ["요리", "보스", "스킬", "스킨", "퀘스트", "콘솔", "제작"]) {
  await step(`탭: ${tab}`, () => clickText(tab));
}

await step("카테고리 → 도구 목록", () => clickText("도구"));
await step("아이템 클릭(상세 시트)", async () => {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "도끼");
    b?.click();
  });
});
await step("시트 닫기", async () => {
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    const ov = document.querySelector(".fixed.inset-0.z-40");
    ov?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
});
await step("홈으로", () => clickText("제작"));

// ── 판정 ──
const problems = [];
for (const r of results) {
  if (r.dup.length) problems.push(`${r.step}: 중복 placeholder ${r.dup.join(", ")}`);
  if (r.hiddenWithPh.length) problems.push(`${r.step}: 숨은 탭이 자리를 들고 있음 (${r.hiddenWithPh.join(", ")})`);
  if (r.visible.some((v) => v.endsWith("#none"))) problems.push(`${r.step}: 보이는 자리에 placeholder 없음 (${r.visible.join(" ")})`);
  const batches = r.calls.filter((c) => c.startsWith("show")).length;
  if (batches > 1) problems.push(`${r.step}: show 배치가 ${batches}번 — 한 번으로 합쳐져야 함 [${r.calls.join(" ")}]`);
}

console.log(JSON.stringify({ results, problems }, null, 1));
await browser.close();
process.exit(problems.length ? 1 : 0);
