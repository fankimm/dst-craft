const fs = require("fs");
const path = require("path");

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const manifest = {
  name: "Don't Craft Without Recipes",
  short_name: "DST Craft",
  description: "Don't Starve Together 크래프팅·쿠킹 레시피 가이드",
  start_url: basePath + "/",
  scope: basePath + "/",
  display: "standalone",
  background_color: "#0a0a0c",
  theme_color: "#0a0a0c",
  icons: [
    { src: basePath + "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: basePath + "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: basePath + "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: basePath + "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

fs.writeFileSync(
  path.join(__dirname, "../public/manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);
console.log(`[generate-manifest] basePath = "${basePath}"`);
