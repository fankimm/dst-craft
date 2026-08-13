// 광고 자리 스트레스 테스트 (#75) — 연타 / 모바일 / 뒤로가기 / 스크롤 / 왕복 누수
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("playwright-core가 필요합니다:  npm i -D playwright-core   (설치된 Chrome을 그대로 씁니다)");
  process.exit(2);
}

const BASE = process.argv[2] ?? "https://beta.dstcraft.com";
const browser = await chromium.launch({ channel: "chrome", headless: true });

const problems = [];
const log = [];

async function newPage(viewport = { width: 1600, height: 900 }, settle = 2500) {
  const page = await browser.newPage({ viewport });
  await page.route(/(ezojs|ezoic|gatekeeperconsent|ezodn|ezoicanalytics)/i, (r) => r.abort());
  await page.addInitScript(() => {
    const calls = [];
    window.__adCalls = calls;
    const rec = (k) => (...ids) => calls.push(`${k}(${ids.join(",")})`);
    window.ezstandalone = {
      enabled: true,
      initialized: true,
      cmd: { push: (fn) => fn() },
      showAds: rec("show"),
      destroyPlaceholders: rec("destroy"),
      getSelectedPlaceholders: () => ({}),
    };
  });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  if (settle) await page.waitForTimeout(settle);
  return page;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const state = (page) =>
  page.evaluate(() => {
    const counts = {};
    document.querySelectorAll('[id^="ezoic-pub-ad-placeholder-"]').forEach((e) => (counts[e.id] = (counts[e.id] || 0) + 1));
    return {
      visible: [...document.querySelectorAll("[data-ad-slot]")]
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => {
          const ph = e.querySelector('[id^="ezoic-pub-ad-placeholder-"]');
          return e.dataset.adSlot + (ph ? "#" + ph.id.replace("ezoic-pub-ad-placeholder-", "") : "#none");
        }),
      total: document.querySelectorAll('[id^="ezoic-pub-ad-placeholder-"]').length,
      dup: Object.entries(counts).filter(([, n]) => n > 1).map(([k, n]) => `${k}x${n}`),
      hiddenWithPh: [...document.querySelectorAll("[data-ad-slot]")]
        .filter((e) => e.getBoundingClientRect().width === 0 && e.querySelector('[id^="ezoic-pub-ad-placeholder-"]'))
        .map((e) => e.dataset.adSlot),
    };
  });
const takeCalls = (page) => page.evaluate(() => { const c = [...window.__adCalls]; window.__adCalls.length = 0; return c; });
const click = (page, label) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === t);
    if (b) b.click();
    return !!b;
  }, label);

/** 공통 판정 — 중복 자리, 숨은 탭의 자리 보유, 보이는데 자리가 비어 있음 */
const check = (name, s, extra = []) => {
  if (s.dup.length) problems.push(`${name}: 중복 ${s.dup.join(",")}`);
  if (s.hiddenWithPh.length) problems.push(`${name}: 숨은 자리가 placeholder 보유 (${s.hiddenWithPh.join(",")})`);
  if (s.visible.some((v) => v.endsWith("#none"))) problems.push(`${name}: 보이는 자리에 placeholder 없음 (${s.visible.join(" ")})`);
  problems.push(...extra);
};

// ── 1. 탭 연타 (대기 없이) ─────────────────────────────────
{
  const page = await newPage({ width: 1600, height: 900 });
  await takeCalls(page);
  for (const t of ["요리", "보스", "스킬", "스킨", "퀘스트", "콘솔", "제작"]) {
    await click(page, t);
    await sleep(60); // 사람이 빠르게 연타하는 수준
  }
  await sleep(1500);
  const calls = await takeCalls(page);
  const s = await state(page);
  log.push({ case: "탭 연타 7회", calls, ...s });
  if (s.dup.length) problems.push(`연타: 중복 ${s.dup.join(",")}`);
  if (s.hiddenWithPh.length) problems.push(`연타: 숨은 탭이 자리 보유 (${s.hiddenWithPh.join(",")})`);
  if (s.visible.some((v) => v.endsWith("#none"))) problems.push(`연타: 보이는 자리에 placeholder 없음 (${s.visible.join(" ")})`);
  const shows = calls.filter((c) => c.startsWith("show")).length;
  if (shows > 3) problems.push(`연타: show 배치 ${shows}회 — 연타 구간에서 과도한 재요청`);
  await page.close();
}

// ── 2. 모바일 뷰포트 — 레일은 자리조차 없어야 함 ─────────────
{
  const page = await newPage({ width: 390, height: 844 });
  const s = await state(page);
  const calls = await takeCalls(page);
  log.push({ case: "모바일 390x844", calls, ...s });
  if (s.visible.some((v) => v.startsWith("rail"))) problems.push(`모바일: 레일이 보임 (${s.visible.join(" ")})`);
  if (calls.join(" ").match(/10[78]/)) problems.push(`모바일: 레일 번호를 요청함 [${calls.join(" ")}]`);
  if (!s.visible.some((v) => v.startsWith("top#"))) problems.push(`모바일: 상단 띠 자리가 없음 (${s.visible.join(" ")})`);
  await page.close();
}

// ── 3. 카테고리 진입 후 뒤로가기 ────────────────────────────
{
  const page = await newPage({ width: 1600, height: 900 });
  await click(page, "도구");
  await sleep(1200);
  await takeCalls(page);
  await page.goBack();
  await sleep(1500);
  const calls = await takeCalls(page);
  const s = await state(page);
  log.push({ case: "뒤로가기", calls, ...s });
  if (s.dup.length) problems.push(`뒤로가기: 중복 ${s.dup.join(",")}`);
  if (s.visible.some((v) => v.endsWith("#none"))) problems.push(`뒤로가기: 보이는 자리에 placeholder 없음 (${s.visible.join(" ")})`);
  await page.close();
}

// ── 4. 스크롤로 자리를 벗어나도 해제하면 안 됨 ────────────────
{
  const page = await newPage({ width: 1600, height: 900 });
  await click(page, "도구");
  await sleep(1500);
  await takeCalls(page);
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll("[data-scroll-container]")].find((e) => e.clientHeight > 0 && e.scrollHeight > e.clientHeight);
    if (sc) sc.scrollTop = sc.scrollHeight;
  });
  await sleep(1500);
  const calls = await takeCalls(page);
  const s = await state(page);
  log.push({ case: "목록 끝까지 스크롤", calls, ...s });
  if (calls.some((c) => c.startsWith("destroy"))) problems.push(`스크롤: 자리를 해제함 [${calls.join(" ")}] — 되돌아올 때 노출이 부풀려진다`);
  await page.close();
}

// ── 5. 탭 왕복 20회 — 누수/증식 검사 ────────────────────────
{
  const page = await newPage({ width: 1600, height: 900 });
  for (let i = 0; i < 10; i++) {
    await click(page, "요리");
    await sleep(400);
    await click(page, "제작");
    await sleep(400);
  }
  await sleep(1500);
  const s = await state(page);
  log.push({ case: "탭 왕복 20회", ...s, calls: (await takeCalls(page)).length + "건" });
  if (s.total !== 3) problems.push(`왕복: placeholder 총 ${s.total}개 (3개여야 함)`);
  if (s.dup.length) problems.push(`왕복: 중복 ${s.dup.join(",")}`);
  if (s.visible.some((v) => v.endsWith("#none"))) problems.push(`왕복: 보이는 자리에 placeholder 없음 (${s.visible.join(" ")})`);
  await page.close();
}

// ── 6. 광고 자리가 없는 탭(요리솥/설정) 왕복 ──────────────────
{
  const page = await newPage();
  await takeCalls(page);
  await click(page, "요리솥"); await sleep(1200);
  const s1 = await state(page); const c1 = await takeCalls(page);
  await click(page, "설정"); await sleep(1200);
  const s2 = await state(page); const c2 = await takeCalls(page);
  await click(page, "제작"); await sleep(1500);
  const s3 = await state(page); const c3 = await takeCalls(page);
  log.push({ case: "요리솥→설정→제작", 요리솥: { calls: c1, ...s1 }, 설정: { calls: c2, ...s2 }, 제작복귀: { calls: c3, ...s3 } });
  check("요리솥", s1); check("설정", s2); check("제작복귀", s3);
  if (!s1.visible.some((v) => v.startsWith("rail"))) problems.push("요리솥: 레일 자리가 사라짐 — 자리 없는 탭에서도 레일은 남아야 한다");
  if (!s3.visible.some((v) => v.startsWith("top#"))) problems.push("제작복귀: 상단 띠가 안 돌아옴");
  await page.close();
}

// ── 7. 검색 결과 그리드 ─────────────────────────────────────
{
  const page = await newPage();
  await takeCalls(page);
  await page.evaluate(() => {
    const input = document.querySelector('input[type="text"], input:not([type])');
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, "도끼");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await sleep(1800);
  const s = await state(page); const calls = await takeCalls(page);
  log.push({ case: "검색 '도끼'", calls, ...s });
  check("검색", s);
  await page.close();
}

// ── 8. 상세 시트 연속 전환 (아이템 A → 닫기 → B) ───────────────
{
  const page = await newPage();
  await click(page, "도구"); await sleep(1200); await takeCalls(page);
  const openItem = (name) => page.evaluate((n) => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === n); if (b) b.click(); return !!b; }, name);
  await openItem("도끼"); await sleep(1200);
  const sA = await state(page); const cA = await takeCalls(page);
  await page.keyboard.press("Escape"); await sleep(900);
  await openItem("곡괭이"); await sleep(1200);
  const sB = await state(page); const cB = await takeCalls(page);
  log.push({ case: "시트 A→닫기→B", A: { calls: cA, ...sA }, B: { calls: cB, ...sB } });
  check("시트A", sA); check("시트B", sB);
  if (sB.total !== sA.total) problems.push(`시트 전환: placeholder 총수 변화 ${sA.total}→${sB.total}`);
  await page.close();
}

// ── 9. 로드 직후 즉시 탭 전환 (초기 요청과 경합) ────────────────
{
  const page = await newPage({ width: 1600, height: 900 }, 0);
  await sleep(150);
  await click(page, "보스");
  await sleep(2500);
  const s = await state(page); const calls = await takeCalls(page);
  log.push({ case: "로드 직후 즉시 탭 전환", calls, ...s });
  check("로드경합", s);
  const shows = calls.filter((c) => c.startsWith("show")).length;
  if (shows > 2) problems.push(`로드경합: show ${shows}회 — 초기 요청과 전환이 안 합쳐짐 [${calls.join(" ")}]`);
  await page.close();
}

console.log(JSON.stringify({ log, problems }, null, 1));
await browser.close();
process.exit(problems.length ? 1 : 0);
