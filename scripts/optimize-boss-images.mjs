#!/usr/bin/env node
/**
 * 보스 이미지 UI용 축소본 생성 — public/images/bosses/*.png → thumb/*.webp (#88)
 *
 * 왜: 앱에서 보스 이미지는 최대 80px(`size-20`)로 그려지는데 원본은 2108×2492 / 3.5MB짜리가
 * 섞여 있었다. 프로덕션 홈 실측에서 **이미지 10,249KB 중 보스 PNG 9장이 8,982KB(88%)** 였다.
 * Ezoic이 `window load` 이후에야 광고 파이프라인을 시작하므로(인과 확정, docs/ezoic-decision.md)
 * 이 무게가 곧 광고 지연이고, Fast3G 홈에서는 load가 30초 내에 발화하지 않아 광고가 0회 뜬다.
 *
 * 원본을 덮어쓰지 않는다: 같은 파일이 OG/schema.org 이미지로도 쓰이고(BossPageContent),
 * 소셜 카드·리치 결과는 큰 이미지를 원한다. UI용과 크롤러용을 분리한다.
 *
 * 사용법:
 *   node scripts/optimize-boss-images.mjs           # 없거나 원본이 더 새로운 것만
 *   node scripts/optimize-boss-images.mjs --force   # 전부 다시 (설정 바꿨을 때)
 *
 * 보스 이미지를 추가·교체하면 반드시 다시 실행할 것. 안 돌리면 축소본이 없어
 * `bossThumbPath()`가 원본으로 폴백하므로 화면은 안 깨지지만 무게 이득이 사라진다.
 */
import sharp from "sharp";
import { readdir, stat, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * **무손실이다.** 이 소재에는 손실 압축을 쓸 이유가 없다.
 *
 * 보스 아트는 선화 + 평면 채색 + 알파 컷아웃이다. 손실 WebP는 사진용으로 설계돼
 * 4:2:0 크로마 서브샘플링을 하는데, 검은 윤곽선이 정확히 그 대역에 산다 —
 * 실측에서 선을 가로지르는 국소 대비가 5.2% 깎였다(윤곽선이 +3.3/255 밝아지고
 * 반대편이 −3.0 어두워지는 대칭 저역통과). 사용자가 "덜 선명하다"고 두 번 지적한 실체다.
 *
 * 무손실이면 그 논쟁 자체가 사라진다. 그리고 이 소재에서는 비싸지도 않다 —
 * 평면 채색이라 무손실 512px(3,751KB)이 손실 q88 768px(2,210KB)과 같은 자릿수다.
 *
 * 남는 오차는 **축소(리샘플링)뿐**이고, 그건 sharp의 기본 커널 Lanczos3가 처리한다.
 * (이전 구현은 cwebp 내장 `-resize`를 썼는데 Hamming 창이라 음의 로브가 없어
 * 고주파를 깎기만 하고 선의 예리도를 못 살렸다 — 엣지 손실의 89%가 여기서 나왔다.)
 */
const LOSSLESS = true;

/**
 * 긴 변 기준 상한.
 *
 * 앱은 `size-20 object-contain`(80×80 정사각 박스)이라 **긴 변이 80px에 매핑**된다.
 * 폭 기준으로 캡하면 세로로 긴 이미지가 불필요하게 커진다(320×582 등).
 *
 * 512px인 이유: 80 CSS px × DPR 3 = 240 device px면 충분하지만, 표시 크기의 6.4배로
 * 잡아 어떤 화면·확대에서도 부족하지 않게 한다. 무손실이므로 이 값만이 유일한 화질 변수다.
 */
const MAX_EDGE = 512;

/** `sharp`를 쓴다 — ImageMagick + cwebp 조합을 대체. */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..", "public", "images", "bosses");
const OUT_DIR = path.join(SRC_DIR, "thumb");

const force = process.argv.includes("--force");

async function mtime(p) {
  try {
    return (await stat(p)).mtimeMs;
  } catch {
    return null;
  }
}

await mkdir(OUT_DIR, { recursive: true });

// 이전 ImageMagick 구현이 남기던 `.mpc`/`.cache` 잔재를 치운다.
// 한 번은 60MB짜리가 `git add -A`에 딸려 들어가 푸시됐다 (docs/mistakes.md).
for (const f of await readdir(SRC_DIR)) {
  if (/\.(mpc|cache)$/i.test(f)) {
    await unlink(path.join(SRC_DIR, f));
    console.log(`  잔재 제거: ${f}`);
  }
}

let converted = 0;
let skipped = 0;
let srcBytes = 0;
let outBytes = 0;

for (const file of (await readdir(SRC_DIR)).sort()) {
  if (!/\.png$/i.test(file)) continue;
  const src = path.join(SRC_DIR, file);
  const out = path.join(OUT_DIR, file.replace(/\.png$/i, ".webp"));

  srcBytes += (await stat(src)).size;

  const [sm, om] = [await mtime(src), await mtime(out)];
  if (!force && om !== null && om > sm) {
    skipped += 1;
    outBytes += (await stat(out)).size;
    continue;
  }

  await sharp(src)
    // 커널 기본값이 Lanczos3다. `withoutEnlargement`로 작은 원본을 늘려 흐려지게 하지 않는다.
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ lossless: LOSSLESS, effort: 6 })
    .toFile(out);

  converted += 1;
  outBytes += (await stat(out)).size;
}

const kb = (n) => Math.round(n / 1024).toLocaleString();
console.log(
  `보스 이미지 축소본: 변환 ${converted}개 / 재사용 ${skipped}개 ` +
    `(긴 변 ${MAX_EDGE}px, ${LOSSLESS ? "무손실" : "손실"}, sharp/Lanczos3)`,
);
console.log(
  `  원본 합계 ${kb(srcBytes)} KB  →  축소본 합계 ${kb(outBytes)} KB  ` +
    `(${(srcBytes / outBytes).toFixed(1)}배 감소)`,
);
