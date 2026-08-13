// 광고 자리 레이아웃 시프트(CLS) 회귀 테스트 (#75)
//
// 예약 높이가 "광고가 도착한 뒤의 실제 높이"와 같은지 본다. 예약만 해 두고 카드 껍데기
// (AD 라벨 + 상하 패딩)를 채워졌을 때만 붙이거나, 채워지면 예약을 풀어 버리면 광고가
// 오는 순간 컨텐츠가 밀린다 — 예약해 놓고 예약을 무효로 만드는 상태다. 실제로 그랬다:
// 예약을 50 → 90/100px로 올린 뒤에도 껍데기 몫 ~27px과 "320×50이 오면 100 → 50으로
// 줄어드는" 몫이 그대로 남아 있었다.
//
// Ezoic을 차단하고 가짜를 심은 뒤 placeholder 안에 실제 규격의 iframe을 직접 넣어
// 자리 높이 변화를 잰다. 띠 계열 규격은 전부 0이어야 한다.
// 사각형(336×280 등)은 예약으로 흡수할 수 없는 크기라 참고로만 출력한다 — 그 규격이
// 실제로 배달되는지는 `check-ad-slots-live.mjs`로 관측할 것.
//
// 사용: node scripts/check-ad-cls.mjs [base-url]
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("playwright-core가 필요합니다:  npm i -D playwright-core   (설치된 Chrome을 그대로 씁니다)");
  process.exit(2);
}

const BASE = process.argv[2] ?? "https://beta.dstcraft.com";

// 정적 export는 `/item/<slug>.html`로 떨어지고 nginx가 확장자 없는 경로를 정규화한다.
// 로컬 `out/`을 그대로 서빙할 때도 돌아가도록 확장자를 붙인 경로를 쓴다.
const EXT = BASE.includes("localhost") ? ".html" : "";
const PAGES = [
  { name: "SPA 홈", path: "/", vw: 1280 },
  { name: "SPA 홈 (모바일)", path: "/", vw: 390 },
  { name: "SEO 아이템", path: `/item/abigail-flower${EXT}`, vw: 1280 },
  { name: "SEO 아이템 (모바일)", path: `/item/abigail-flower${EXT}`, vw: 390 },
  { name: "SEO 목록", path: `/browse${EXT}`, vw: 1280 },
];

/** 띠 계열 — 예약 높이로 전부 흡수돼야 한다 */
const BANDS = [
  [728, 90],
  [468, 60],
  [320, 100],
  [320, 50],
];
/** 사각형 — 흡수 불가, 참고용 */
const SQUARES = [[336, 280]];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];
const report = [];

for (const p of PAGES) {
  const page = await browser.newPage({ viewport: { width: p.vw, height: 900 } });
  await page.route(/(ezojs|ezoic|gatekeeperconsent|ezodn|ezoicanalytics|googlesyndication|doubleclick)/i, (r) =>
    r.abort(),
  );
  await page.addInitScript(() => {
    window.ezstandalone = { cmd: [], showAds() {}, destroyPlaceholders() {}, config() {} };
    setInterval(() => window.ezstandalone.cmd.splice(0).forEach((f) => f()), 50);
  });
  await page.goto(BASE + p.path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const base = await page.evaluate(() => {
    const slot = document.querySelector('[data-ad-slot="top"]');
    const ph = document.querySelector('[id^="ezoic-pub-ad-placeholder-"]');
    if (!slot) return null;
    return {
      emptyH: Math.round(slot.getBoundingClientRect().height),
      phW: ph ? Math.round(ph.getBoundingClientRect().width) : null,
      hasPh: !!ph,
    };
  });

  if (!base) {
    problems.push(`${p.name}: 상단 띠 자리가 없다`);
    report.push({ ...p, missing: true });
    await page.close();
    continue;
  }
  if (!base.hasPh) {
    problems.push(`${p.name}: placeholder div가 안 그려졌다 (활성 판정 실패)`);
    report.push({ ...p, ...base, rows: [] });
    await page.close();
    continue;
  }

  const rows = [];
  for (const [w, h] of [...BANDS, ...SQUARES]) {
    const filledH = await page.evaluate(
      async ([w, h]) => {
        const slot = document.querySelector('[data-ad-slot="top"]');
        const ph = document.querySelector('[id^="ezoic-pub-ad-placeholder-"]');
        ph.innerHTML = "";
        const f = document.createElement("iframe");
        f.width = String(w);
        f.height = String(h);
        f.style.border = "0";
        f.style.display = "block";
        ph.appendChild(f);
        await new Promise((r) => setTimeout(r, 400));
        const res = Math.round(slot.getBoundingClientRect().height);
        ph.innerHTML = "";
        await new Promise((r) => setTimeout(r, 400));
        return res;
      },
      [w, h],
    );
    const isBand = BANDS.some(([bw, bh]) => bw === w && bh === h);
    const shift = filledH - base.emptyH;
    rows.push({ size: `${w}x${h}`, filledH, shift, isBand });
    if (isBand && shift !== 0) {
      problems.push(`${p.name}: ${w}×${h} 도착 시 ${shift > 0 ? "+" : ""}${shift}px 시프트`);
    }
  }
  report.push({ ...p, ...base, rows });
  await page.close();
}
await browser.close();

for (const r of report) {
  console.log(`\n■ ${r.name}  (viewport ${r.vw})`);
  if (r.missing) {
    console.log("  광고 자리 없음");
    continue;
  }
  console.log(`  미충전 높이 ${r.emptyH}px / placeholder 폭 ${r.phW}px`);
  for (const x of r.rows) {
    const tag = !x.isBand ? "참고 " : x.shift === 0 ? "OK   " : "시프트";
    const d = x.shift === 0 ? "" : ` (${x.shift > 0 ? "+" : ""}${x.shift})`;
    console.log(`   ${tag} ${x.size.padEnd(8)} → ${String(x.filledH).padStart(4)}px${d}`);
  }
}

if (problems.length) {
  console.log("\n실패:");
  problems.forEach((p) => console.log("  - " + p));
  process.exit(1);
}
console.log("\n띠 계열 규격 전부 시프트 0.");
