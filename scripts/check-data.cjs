/**
 * Data integrity checker.
 * Checks for duplicate IDs, missing material references, etc.
 *
 * Usage: node scripts/check-data.cjs
 */
const fs = require("fs");

const itemsContent = fs.readFileSync("src/data/items.ts", "utf8");
const matContent = fs.readFileSync("src/data/materials.ts", "utf8");

const ids = [...itemsContent.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log(`Items: ${ids.length}`);
console.log(`Duplicate IDs: ${dupes.length ? dupes.join(", ") : "none"}`);

const matIds = new Set(
  [...matContent.matchAll(/id: "([^"]+)"/g)].map((m) => m[1])
);
const refMats = new Set(
  [...itemsContent.matchAll(/materialId: "([^"]+)"/g)].map((m) => m[1])
);
const missing = [...refMats].filter((m) => !matIds.has(m));
console.log(`Materials defined: ${matIds.size}`);
console.log(`Materials referenced: ${refMats.size}`);
console.log(`Missing materials: ${missing.length ? missing.join(", ") : "none"}`);

if (dupes.length || missing.length) {
  process.exit(1);
}
console.log("\nAll checks passed!");
