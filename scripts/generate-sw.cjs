const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const template = fs.readFileSync(
  path.join(__dirname, "../src/sw.template.js"),
  "utf8"
);

// Vercel 빌드: VERCEL_GIT_COMMIT_SHA, 로컬: git rev-parse
const hash =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ||
  execSync("git rev-parse --short HEAD").toString().trim();

const output = template.replace("__BUILD_HASH__", hash);

fs.writeFileSync(path.join(__dirname, "../public/sw.js"), output);
console.log(`[generate-sw] CACHE_NAME = dst-crafting-${hash}`);
