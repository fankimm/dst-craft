#!/usr/bin/env node
// 기존 PWA 아이콘에 BETA 배지를 합성하여 베타 빌드용 아이콘 생성.
// Usage: node scripts/generate-beta-icons.mjs

import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "..", "public", "icons");

const targets = [
  { src: "icon-192.png", out: "icon-192-beta.png", size: 192, maskable: false },
  { src: "icon-512.png", out: "icon-512-beta.png", size: 512, maskable: false },
  { src: "icon-maskable-192.png", out: "icon-maskable-192-beta.png", size: 192, maskable: true },
  { src: "icon-maskable-512.png", out: "icon-maskable-512-beta.png", size: 512, maskable: true },
  { src: "icon-180.png", out: "icon-180-beta.png", size: 180, maskable: false },
  { src: "icon-256.png", out: "icon-256-beta.png", size: 256, maskable: false },
];

function badgeSvg(size, maskable) {
  // maskable: 안전영역(중심 80%) 안에 배지가 들어가도록 inset
  const inset = maskable ? Math.round(size * 0.1) : 0;
  const innerW = size - inset * 2;
  const bandH = Math.round(size * 0.26);
  const bandY = size - bandH - inset;
  const fontSize = Math.round(bandH * 0.62);
  const textY = bandY + bandH / 2;
  const letterSpacing = Math.round(fontSize * 0.08);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect x="${inset}" y="${bandY}" width="${innerW}" height="${bandH}" fill="#dc2626" fill-opacity="0.94"/>
  <rect x="${inset}" y="${bandY}" width="${innerW}" height="2" fill="#ffffff" fill-opacity="0.35"/>
  <text x="${size / 2}" y="${textY}" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="${fontSize}" fill="#ffffff" text-anchor="middle" dominant-baseline="central" letter-spacing="${letterSpacing}">BETA</text>
</svg>`;
}

for (const t of targets) {
  const svg = Buffer.from(badgeSvg(t.size, t.maskable));
  await sharp(join(ICONS_DIR, t.src))
    .composite([{ input: svg }])
    .png()
    .toFile(join(ICONS_DIR, t.out));
  console.log(`✓ ${t.out}`);
}
