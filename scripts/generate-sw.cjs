const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const template = fs.readFileSync(
  path.join(__dirname, "../src/sw.template.js"),
  "utf8"
);
const hash = crypto.randomBytes(4).toString("hex");
const output = template.replace("__BUILD_HASH__", hash);

fs.writeFileSync(path.join(__dirname, "../public/sw.js"), output);
console.log(`[generate-sw] CACHE_NAME = dst-crafting-${hash}`);
