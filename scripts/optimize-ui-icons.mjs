/**
 * UI 아이콘 PNG → **무손실** WebP 변환 (#91).
 *
 * 대상: `public/images/category-icons/**` (카테고리 타일·캐릭터 초상), `public/images/ui/**`.
 * 홈 실측에서 이 아이콘들이 이미지 942KB 중 ~800KB를 차지했다 — `all.png` 한 장이 165KB.
 *
 * **해상도는 건드리지 않는다.** #88에서 보스 썸네일 크기를 정할 때, 브라우저 밉맵 체인이
 * 목표 크기 바로 위에서 끝나면 마지막 축소가 1.0배에 가까워져 바이리니어가 가장 못 다룬다는
 * 걸 실측으로 확인했다(512px DPR3에서 엣지 보존율 0.850 — 원본보다 15% 나쁨). 즉 축소는
 * 반드시 브라우저 재측정이 따라야 하는 결정이다. 포맷만 무손실로 바꾸면 픽셀이 완전히
 * 동일하므로 그 논쟁 자체가 생기지 않는다.
 *
 * **보스 이미지(`optimize-boss-images.mjs`)와 달리 원본을 덮어쓴다.** 보스는 같은 파일이
 * OG·schema.org 이미지로도 쓰여서 크롤러용 원본을 남겨야 했지만, 이 아이콘들은 메타데이터에
 * 전혀 쓰이지 않는다(검증: openGraph/og:image/JSON-LD 어디에도 없음). 남겨두면 참조되지 않는
 * 사본만 쌓인다.
 *
 * 사용: node scripts/optimize-ui-icons.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIRS = ["public/images/category-icons", "public/images/ui"];
const dryRun = process.argv.includes("--dry-run");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.toLowerCase().endsWith(".png")) out.push(p);
  }
  return out;
}

const files = DIRS.flatMap((d) => walk(d));
let origTotal = 0, webpTotal = 0, converted = 0;
const skipped = [];

for (const png of files) {
  const orig = fs.statSync(png).size;
  const buf = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
  origTotal += orig;

  // WebP가 더 크면 PNG를 그대로 둔다. 그런 파일이 하나라도 있으면 소스의 확장자
  // 일괄 치환이 깨지므로, 스크립트가 실패로 보고해서 사람이 판단하게 한다.
  if (buf.length >= orig) {
    skipped.push({ png, orig, webp: buf.length });
    webpTotal += orig;
    continue;
  }

  webpTotal += buf.length;
  converted++;
  if (!dryRun) {
    fs.writeFileSync(png.replace(/\.png$/i, ".webp"), buf);
    fs.unlinkSync(png);
  }
}

const kb = (n) => Math.round(n / 1024);
console.log(`${dryRun ? "[dry-run] " : ""}${converted}/${files.length}장 변환: ${kb(origTotal)}KB → ${kb(webpTotal)}KB (-${Math.round((1 - webpTotal / origTotal) * 100)}%)`);

if (skipped.length) {
  console.error(`\n⚠️  WebP가 더 큰 파일 ${skipped.length}장 — PNG로 남겼다. 소스 확장자 치환 전에 개별 판단 필요:`);
  for (const s of skipped) console.error(`   ${s.png}  ${kb(s.orig)}KB → ${kb(s.webp)}KB`);
  process.exit(1);
}
