#!/usr/bin/env node
/**
 * Generate locale files from Don't Starve Together .po translation files.
 *
 * Downloads .po files from the DST game scripts repo and produces TypeScript
 * locale files that conform to the LocaleData interface.
 *
 * Usage: node scripts/generate-locales.cjs
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PO_BASE_URL =
  "https://raw.githubusercontent.com/taichunmin/dont-starve-together-game-scripts/master/languages";

/** Map from PO file name → our locale code */
const LANG_MAP = {
  chinese_s: "zh_CN",
  chinese_t: "zh_TW",
  french: "fr",
  german: "de",
  italian: "it",
  japanese: "ja",
  // korean: "ko", — we keep the hand-curated ko.ts
  polish: "pl",
  portuguese_br: "pt_BR",
  russian: "ru",
  spanish: "es",
  spanish_mex: "es_MX",
};

/** Map our character IDs → DST internal IDs (for CHARACTER_NAMES lookup) */
const CHAR_ID_MAP = {
  "wx-78": "wx78",
  maxwell: "waxwell",
  wigfrid: "wathgrithr",
};

/** Map our category IDs → PO CRAFTING_FILTERS keys */
const CATEGORY_FILTER_MAP = {
  character: "CHARACTER",
  tools: "TOOLS",
  light: "LIGHT",
  prototypers: "PROTOTYPERS",
  refined: "REFINE",
  weapons: "WEAPONS",
  armor: "ARMOUR",
  clothing: "CLOTHING",
  healing: "RESTORATION",
  magic: "MAGIC",
  decorations: "DECOR",
  structures: "STRUCTURES",
  storage: "CONTAINERS",
  cooking: "COOKING",
  food_gardening: "GARDENING",
  fishing: "FISHING",
  seafaring: "SEAFARING",
  beefalo: "RIDING",
  winter: "WINTER",
  summer: "SUMMER",
  rain: "RAIN",
};

// ---------------------------------------------------------------------------
// Extract IDs from source files (regex-based, no TS compiler needed)
// ---------------------------------------------------------------------------

function extractIds(filePath, pattern) {
  const src = fs.readFileSync(filePath, "utf-8");
  return [...src.matchAll(pattern)].map((m) => m[1]);
}

const ROOT = path.resolve(__dirname, "..");
const itemIds = extractIds(
  path.join(ROOT, "src/data/items.ts"),
  /id:\s*"([^"]+)"/g
);
const materialIds = extractIds(
  path.join(ROOT, "src/data/materials.ts"),
  /id:\s*"([^"]+)"/g
);
const characterIds = extractIds(
  path.join(ROOT, "src/data/characters.ts"),
  /id:\s*"([^"]+)"/g
);
const categoryIds = extractIds(
  path.join(ROOT, "src/data/categories.ts"),
  /id:\s*"([^"]+)"/g
);

console.log(
  `Found ${itemIds.length} items, ${materialIds.length} materials, ${characterIds.length} characters, ${categoryIds.length} categories`
);

// ---------------------------------------------------------------------------
// PO parser — extract msgctxt/msgid/msgstr triples
// ---------------------------------------------------------------------------

/**
 * Parse a .po file into a Map<msgctxt, { msgid, msgstr }>.
 * Handles multi-line strings.
 */
function parsePo(text) {
  const entries = new Map();
  const lines = text.split("\n");
  let ctx = null;
  let field = null; // "msgctxt" | "msgid" | "msgstr"
  let values = { msgctxt: "", msgid: "", msgstr: "" };

  function flush() {
    if (values.msgctxt && values.msgstr) {
      entries.set(values.msgctxt, {
        msgid: values.msgid,
        msgstr: values.msgstr,
      });
    }
    ctx = null;
    field = null;
    values = { msgctxt: "", msgid: "", msgstr: "" };
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line = end of entry
    if (!trimmed) {
      flush();
      continue;
    }

    // Comment line
    if (trimmed.startsWith("#")) continue;

    // Field start
    const fieldMatch = trimmed.match(/^(msgctxt|msgid|msgstr)\s+"(.*)"/);
    if (fieldMatch) {
      const [, f, val] = fieldMatch;
      if (f === "msgctxt" && values.msgctxt) flush(); // new entry
      field = f;
      values[f] = val;
      continue;
    }

    // Continuation string
    const contMatch = trimmed.match(/^"(.*)"/);
    if (contMatch && field) {
      values[field] += contMatch[1];
    }
  }
  flush();

  return entries;
}

// ---------------------------------------------------------------------------
// Download and generate
// ---------------------------------------------------------------------------

async function downloadPo(langFile) {
  const url = `${PO_BASE_URL}/${langFile}.po`;
  console.log(`  Downloading ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function lookupName(entries, key) {
  const entry = entries.get(key);
  return entry?.msgstr || null;
}

function generateLocaleData(entries) {
  const data = {
    items: {},
    materials: {},
    categories: {},
    characters: {},
  };

  // Items: names from STRINGS.NAMES, descs from STRINGS.RECIPE_DESC
  for (const id of itemIds) {
    const nameKey = `STRINGS.NAMES.${id.toUpperCase()}`;
    const descKey = `STRINGS.RECIPE_DESC.${id.toUpperCase()}`;
    const name = lookupName(entries, nameKey);
    const desc = lookupName(entries, descKey);
    if (name || desc) {
      data.items[id] = {};
      if (name) data.items[id].name = name;
      if (desc) data.items[id].desc = desc;
    }
  }

  // Materials: names from STRINGS.NAMES
  for (const id of materialIds) {
    const nameKey = `STRINGS.NAMES.${id.toUpperCase()}`;
    const name = lookupName(entries, nameKey);
    if (name) {
      data.materials[id] = { name };
    }
  }

  // Characters: names from STRINGS.CHARACTER_NAMES
  for (const id of characterIds) {
    const dstId = CHAR_ID_MAP[id] || id;
    const nameKey = `STRINGS.CHARACTER_NAMES.${dstId}`;
    const name = lookupName(entries, nameKey);
    if (name) {
      data.characters[id] = { name };
    }
  }

  // Categories: names from STRINGS.UI.CRAFTING_FILTERS
  for (const id of categoryIds) {
    const filterKey = CATEGORY_FILTER_MAP[id];
    if (!filterKey) continue;
    const nameKey = `STRINGS.UI.CRAFTING_FILTERS.${filterKey}`;
    const name = lookupName(entries, nameKey);
    if (name) {
      data.categories[id] = { name };
    }
  }

  return data;
}

function escapeStr(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function generateTs(localeCode, data) {
  let out = 'import type { LocaleData } from "./types";\n\n';
  out += `export const ${localeCode.replace("-", "_")}: LocaleData = {\n`;

  // Items
  out += "  items: {\n";
  for (const [id, val] of Object.entries(data.items)) {
    const parts = [];
    if (val.name) parts.push(`name: "${escapeStr(val.name)}"`);
    if (val.desc) parts.push(`desc: "${escapeStr(val.desc)}"`);
    out += `    "${id}": { ${parts.join(", ")} },\n`;
  }
  out += "  },\n";

  // Materials
  out += "  materials: {\n";
  for (const [id, val] of Object.entries(data.materials)) {
    out += `    "${id}": { name: "${escapeStr(val.name)}" },\n`;
  }
  out += "  },\n";

  // Categories
  out += "  categories: {\n";
  for (const [id, val] of Object.entries(data.categories)) {
    out += `    "${id}": { name: "${escapeStr(val.name)}" },\n`;
  }
  out += "  },\n";

  // Characters
  out += "  characters: {\n";
  for (const [id, val] of Object.entries(data.characters)) {
    out += `    "${id}": { name: "${escapeStr(val.name)}" },\n`;
  }
  out += "  },\n";

  out += "};\n";
  return out;
}

async function main() {
  const localesDir = path.join(ROOT, "src/data/locales");

  for (const [langFile, localeCode] of Object.entries(LANG_MAP)) {
    console.log(`\nProcessing ${langFile} → ${localeCode}...`);
    const poText = await downloadPo(langFile);
    const entries = parsePo(poText);
    console.log(`  Parsed ${entries.size} entries`);

    const data = generateLocaleData(entries);
    console.log(
      `  Found: ${Object.keys(data.items).length} items, ${Object.keys(data.materials).length} materials, ${Object.keys(data.characters).length} characters, ${Object.keys(data.categories).length} categories`
    );

    const tsCode = generateTs(localeCode, data);
    const outFile = path.join(localesDir, `${localeCode}.ts`);
    fs.writeFileSync(outFile, tsCode, "utf-8");
    console.log(`  Written to ${outFile}`);
  }

  // Generate index.ts that re-exports all locales
  generateIndex(localesDir);
  console.log("\nDone!");
}

function generateIndex(localesDir) {
  const codes = Object.values(LANG_MAP);
  let out = '// Auto-generated locale index\n';
  out += 'import type { LocaleData } from "./types";\n';
  out += 'export { ko } from "./ko";\n';
  for (const code of codes) {
    const varName = code.replace("-", "_");
    out += `export { ${varName} } from "./${code}";\n`;
  }
  out += "\n";
  out += "export const localeRegistry: Record<string, LocaleData> = {};\n";
  out += "\n// Lazy-load locales to avoid bundling all at once\n";
  out += "const loaders: Record<string, () => Promise<{ default: LocaleData } | Record<string, LocaleData>>> = {\n";
  // Actually, let's keep it simple with static imports for now since these are small files
  // and the app needs them for search

  // Let me reconsider: we should build a simple registry
  const outFile = path.join(localesDir, "index.ts");

  let idx = 'import type { LocaleData } from "./types";\n';
  idx += 'import { ko } from "./ko";\n';
  for (const code of codes) {
    const varName = code.replace("-", "_");
    idx += `import { ${varName} } from "./${code}";\n`;
  }
  idx += "\n";
  idx += "export const allLocales: Record<string, LocaleData> = {\n";
  idx += "  ko,\n";
  for (const code of codes) {
    const varName = code.replace("-", "_");
    idx += `  "${code}": ${varName},\n`;
  }
  idx += "};\n";

  fs.writeFileSync(outFile, idx, "utf-8");
  console.log(`  Written index to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
