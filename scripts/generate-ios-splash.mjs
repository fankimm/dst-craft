#!/usr/bin/env node
// iOS PWA 스플래시 이미지 생성 (apple-touch-startup-image용).
// 단색 배경 + 중앙 로고. prod(흰색) / beta(빨강) 두 세트 동시 생성.
// Usage: node scripts/generate-ios-splash.mjs

import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "icons", "splash");
const LOGO_SRC = join(ROOT, "public", "icons", "icon-512.png");
const DEVICES_JSON = join(ROOT, "src", "lib", "ios-splash-devices.json");

const ENVS = [
  { suffix: "", bg: "#ffffff" },
  { suffix: "-beta", bg: "#ffffff" },
];

const devices = JSON.parse(await readFile(DEVICES_JSON, "utf8"));
await mkdir(OUT_DIR, { recursive: true });

async function generateOne({ pxW, pxH, env }) {
  const logoSize = Math.round(Math.min(pxW, pxH) * 0.4);
  const logoBuf = await sharp(LOGO_SRC)
    .resize(logoSize, logoSize, { fit: "contain" })
    .png()
    .toBuffer();

  const fileName = `splash-${pxW}x${pxH}${env.suffix}.png`;
  await sharp({
    create: { width: pxW, height: pxH, channels: 4, background: env.bg },
  })
    .composite([{ input: logoBuf, gravity: "center" }])
    .png()
    .toFile(join(OUT_DIR, fileName));

  return fileName;
}

let count = 0;
for (const env of ENVS) {
  for (const d of devices) {
    const portrait = await generateOne({ pxW: d.w, pxH: d.h, env });
    const landscape = await generateOne({ pxW: d.h, pxH: d.w, env });
    count += 2;
    console.log(`✓ ${portrait} | ${landscape}`);
  }
}

console.log(`[generate-ios-splash] generated ${count} images in ${OUT_DIR}`);
