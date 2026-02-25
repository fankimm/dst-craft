/**
 * Migration script: converts old nameEn/nameKo format to approach C.
 * Reads all existing TS data files and generates:
 *   - src/data/items.ts (consolidated, English-only)
 *   - src/data/materials.ts (English-only)
 *   - src/data/categories.ts (English-only)
 *   - src/data/characters.ts (English-only)
 *   - src/data/locales/ko.ts (Korean translations)
 *
 * Usage: node scripts/migrate-data.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ITEMS_DIR = path.join(ROOT, "src/data/items");

function readAndEval(filePath, varPattern) {
  const content = fs.readFileSync(filePath, "utf8");
  // Extract array between [ and ];
  const match = content.match(/\[([\s\S]*)\]\s*;/);
  if (!match) {
    console.error(`  Could not parse: ${filePath}`);
    return [];
  }
  try {
    return eval(`[${match[1]}]`);
  } catch (e) {
    console.error(`  Eval failed for ${filePath}: ${e.message}`);
    return [];
  }
}

// ===== Process Items =====
const fileOrder = [
  "tools.ts",
  "light-sources.ts",
  "prototypers.ts",
  "refined.ts",
  "weapons.ts",
  "armor.ts",
  "clothing.ts",
  "healing.ts",
  "magic.ts",
  "decorations.ts",
  "structures.ts",
  "storage.ts",
  "cooking.ts",
  "food-gardening.ts",
  "fishing.ts",
  "seafaring.ts",
  "beefalo.ts",
  "winter.ts",
  "summer.ts",
  "rain.ts",
  "survivor.ts",
];

const allItems = [];
const koItems = {};

for (const file of fileOrder) {
  const filePath = path.join(ITEMS_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${file}`);
    continue;
  }
  console.log(`  Processing: ${file}`);
  const items = readAndEval(filePath);

  for (const item of items) {
    // Korean translation
    const koEntry = {};
    if (item.nameKo) koEntry.name = item.nameKo;
    if (item.descriptionKo) koEntry.desc = item.descriptionKo;
    if (Object.keys(koEntry).length > 0) {
      koItems[item.id] = koEntry;
    }

    // New item (English only)
    const newItem = {
      id: item.id,
      name: item.nameEn || item.name,
      description: item.description,
      image: item.image,
      category: item.category,
      station: item.station,
      materials: item.materials,
      sortOrder: item.sortOrder,
    };
    if (item.characterOnly) {
      newItem.characterOnly = item.characterOnly;
    }
    allItems.push(newItem);
  }
}

// ===== Process Materials =====
const materialsPath = path.join(ROOT, "src/data/materials.ts");
const rawMaterials = readAndEval(materialsPath);
const koMaterials = {};
const newMaterials = rawMaterials.map((m) => {
  if (m.nameKo) koMaterials[m.id] = { name: m.nameKo };
  return { id: m.id, name: m.nameEn || m.name, image: m.image };
});

// ===== Process Categories =====
const categoriesPath = path.join(ROOT, "src/data/categories.ts");
const rawCategories = readAndEval(categoriesPath);
const koCategories = {};
const newCategories = rawCategories.map((c) => {
  if (c.nameKo) koCategories[c.id] = { name: c.nameKo };
  return { id: c.id, name: c.nameEn || c.name, icon: c.icon, order: c.order };
});

// ===== Process Characters =====
const charactersPath = path.join(ROOT, "src/data/characters.ts");
const rawCharacters = readAndEval(charactersPath);
const koCharacters = {};
const newCharacters = rawCharacters.map((c) => {
  if (c.nameKo) koCharacters[c.id] = { name: c.nameKo };
  return { id: c.id, name: c.nameEn || c.name, portrait: c.portrait };
});

// ===== Generate Output =====

function indent(str, level = 1) {
  return str
    .split("\n")
    .map((line) => "  ".repeat(level) + line)
    .join("\n");
}

function stringifyItem(item) {
  const lines = [];
  lines.push(`  {`);
  lines.push(`    id: ${JSON.stringify(item.id)},`);
  lines.push(`    name: ${JSON.stringify(item.name)},`);
  // Handle long descriptions
  if (item.description.length > 70) {
    lines.push(`    description:`);
    lines.push(`      ${JSON.stringify(item.description)},`);
  } else {
    lines.push(`    description: ${JSON.stringify(item.description)},`);
  }
  lines.push(`    image: ${JSON.stringify(item.image)},`);
  lines.push(`    category: ${JSON.stringify(item.category)},`);
  lines.push(`    station: ${JSON.stringify(item.station)},`);

  // Materials
  if (item.materials.length === 1) {
    const m = item.materials[0];
    lines.push(
      `    materials: [{ materialId: ${JSON.stringify(m.materialId)}, quantity: ${m.quantity} }],`
    );
  } else {
    lines.push(`    materials: [`);
    for (const m of item.materials) {
      lines.push(
        `      { materialId: ${JSON.stringify(m.materialId)}, quantity: ${m.quantity} },`
      );
    }
    lines.push(`    ],`);
  }

  if (item.characterOnly) {
    lines.push(`    characterOnly: ${JSON.stringify(item.characterOnly)},`);
  }
  lines.push(`    sortOrder: ${item.sortOrder},`);
  lines.push(`  },`);
  return lines.join("\n");
}

// Write items.ts
const itemsOutput = [
  `import type { CraftingItem } from "@/lib/types";`,
  ``,
  `export const allItems: CraftingItem[] = [`,
  allItems.map(stringifyItem).join("\n"),
  `];`,
  ``,
].join("\n");

fs.writeFileSync(path.join(ROOT, "src/data/items-new.ts"), itemsOutput);
console.log(`\nWrote items-new.ts (${allItems.length} items)`);

// Write materials.ts
const materialsOutput = [
  `import type { Material } from "@/lib/types";`,
  ``,
  `export const materials: Material[] = [`,
  newMaterials
    .map(
      (m) =>
        `  { id: ${JSON.stringify(m.id)}, name: ${JSON.stringify(m.name)}, image: ${JSON.stringify(m.image)} },`
    )
    .join("\n"),
  `];`,
  ``,
].join("\n");

fs.writeFileSync(
  path.join(ROOT, "src/data/materials-new.ts"),
  materialsOutput
);
console.log(`Wrote materials-new.ts (${newMaterials.length} materials)`);

// Write categories.ts
const categoriesOutput = [
  `import type { Category } from "@/lib/types";`,
  ``,
  `export const categories: Category[] = [`,
  newCategories
    .map(
      (c) =>
        `  { id: ${JSON.stringify(c.id)}, name: ${JSON.stringify(c.name)}, icon: ${JSON.stringify(c.icon)}, order: ${c.order} },`
    )
    .join("\n"),
  `];`,
  ``,
].join("\n");

fs.writeFileSync(
  path.join(ROOT, "src/data/categories-new.ts"),
  categoriesOutput
);
console.log(`Wrote categories-new.ts (${newCategories.length} categories)`);

// Write characters.ts
const charactersOutput = [
  `import type { Character } from "@/lib/types";`,
  ``,
  `export const characters: Character[] = [`,
  newCharacters
    .map(
      (c) =>
        `  { id: ${JSON.stringify(c.id)}, name: ${JSON.stringify(c.name)}, portrait: ${JSON.stringify(c.portrait)} },`
    )
    .join("\n"),
  `];`,
  ``,
].join("\n");

fs.writeFileSync(
  path.join(ROOT, "src/data/characters-new.ts"),
  charactersOutput
);
console.log(`Wrote characters-new.ts (${newCharacters.length} characters)`);

// Write ko.ts
function formatLocaleSection(obj, indent = "    ") {
  return Object.entries(obj)
    .map(([key, val]) => {
      const parts = Object.entries(val)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(", ");
      return `${indent}${JSON.stringify(key)}: { ${parts} },`;
    })
    .join("\n");
}

const koOutput = [
  `import type { LocaleData } from "./types";`,
  ``,
  `export const ko: LocaleData = {`,
  `  items: {`,
  formatLocaleSection(koItems),
  `  },`,
  `  materials: {`,
  formatLocaleSection(koMaterials),
  `  },`,
  `  categories: {`,
  formatLocaleSection(koCategories),
  `  },`,
  `  characters: {`,
  formatLocaleSection(koCharacters),
  `  },`,
  `};`,
  ``,
].join("\n");

fs.writeFileSync(path.join(ROOT, "src/data/locales/ko.ts"), koOutput);
console.log(`Wrote locales/ko.ts`);

// Summary
console.log(`\n=== Migration Summary ===`);
console.log(`Items: ${allItems.length}`);
console.log(`Materials: ${newMaterials.length}`);
console.log(`Categories: ${newCategories.length}`);
console.log(`Characters: ${newCharacters.length}`);
console.log(`Korean item translations: ${Object.keys(koItems).length}`);
console.log(`Korean material translations: ${Object.keys(koMaterials).length}`);
console.log(
  `\nFiles written with -new suffix. Review and rename to replace originals.`
);
