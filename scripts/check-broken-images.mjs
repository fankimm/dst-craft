// 깨진 이미지 회귀 테스트 (#95)
//
// 정적 스캔으로는 못 잡는다 — 이 레포는 `image: "ui/health.png"` 처럼 접두사 없는
// 파일명을 렌더 시점에 `/images/<dir>/` 로 조립하는 곳이 많아, 소스만 봐서는 최종 경로를
// 알 수 없다. #91에서 아이콘을 WebP로 옮길 때 정규식이 `images/` 접두사가 붙은 참조만
// 잡았고, 그래서 `ui/health.png` 계열 4개가 **프로덕션에서 404인 채로 배포됐다.**
//
// 그래서 실제로 띄워서 각 탭을 돌며 404 응답과 `naturalWidth === 0` 인 <img> 를 센다.
// 광고는 차단한다 (서드파티 404는 우리 책임이 아니다).
//
// 사용: node scripts/check-broken-images.mjs [base-url]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "https://beta.dstcraft.com";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const AD = ["ezojs","ezoic","ezodn","gatekeeperconsent","doubleclick","googlesyndication","imasdk"];
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await (await b.newContext({ userAgent: UA, viewport:{width:1512,height:900} })).newPage();
await p.route("**/*", r => AD.some(h=>r.request().url().includes(h)) ? r.abort() : r.continue());
const bad = new Set();
const host = new URL(base).host;
p.on("response", r => { try { if (r.status() >= 400 && new URL(r.url()).host === host) bad.add(r.status()+" "+new URL(r.url()).pathname); } catch {} });
await p.goto(base + "/", { waitUntil:"load" }); await p.waitForTimeout(3000);
for (const t of ["요리","요리솥","보스","스킬","스킨","퀘스트","콘솔","설정","제작"]) {
  await p.evaluate(l => { const x=[...document.querySelectorAll("button")].find(y=>y.textContent.trim()===l); x?.click(); }, t);
  await p.waitForTimeout(3200);
  // 각 탭에서 첫 카드도 눌러 하위 화면까지
  await p.evaluate(() => {
    const sc=[...document.querySelectorAll("[data-scroll-container]")].find(e=>e.getBoundingClientRect().width>0);
    const img=[...(sc?.querySelectorAll("img")||[])].find(i=>{const r=i.getBoundingClientRect(); return r.width>30 && r.top>0 && r.top<innerHeight;});
    (img?.closest("button,[role=button],a")||img?.parentElement?.parentElement)?.click();
  });
  await p.waitForTimeout(2500);
}
// 화면에 깨진 img 태그도 확인
const broken = await p.evaluate(() => [...document.querySelectorAll("img")].filter(i=>i.complete&&i.naturalWidth===0&&i.src).map(i=>new URL(i.src).pathname));
console.log(`\n### ${base}`);
console.log(`  404 응답 (${bad.size}건):`);
[...bad].sort().forEach(x=>console.log("    "+x));
console.log(`  깨진 <img> (${new Set(broken).size}건):`);
[...new Set(broken)].sort().forEach(x=>console.log("    "+x));
await b.close();
process.exit(bad.size || new Set(broken).size ? 1 : 0);
