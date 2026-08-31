/**
 * `<img>` JSX 태그 중 `loading` 속성이 없는 것에 `loading="lazy"` 를 붙인다.
 *
 * 왜: AppShell이 9개 탭을 전부 마운트하고 `hidden`(=display:none)으로만 감추기 때문에,
 * 비활성 탭의 `<img>`도 DOM에 존재한다. 브라우저는 display:none 인 `loading="lazy"`
 * 이미지는 받지 않지만 `loading` 이 없는 이미지는 그대로 받는다 — 홈 실측에서 숨은
 * `<img>` 300개 중 loading 없는 81개가 1,724KB를 끌어왔다 (#91).
 *
 * 뷰포트 안에 있는 이미지는 lazy여도 즉시 로드되므로 목록/그리드에는 무해하다.
 * 다만 상세 페이지 최상단 단일 히어로 이미지는 LCP 요소라 preload 스캐너가 먼저
 * 집어가야 해서 EAGER_KEEP 으로 제외한다.
 *
 * 사용: node scripts/add-img-lazy.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";

/** LCP 히어로라 eager로 남길 자리 — "파일경로:태그가 시작하는 줄번호" */
const EAGER_KEEP = new Set([
  "src/components/seo/ItemPageContent.tsx:224",
  "src/components/seo/BossPageContent.tsx:129",
  "src/components/seo/CharacterPageContent.tsx:105",
  "src/components/seo/FoodPageContent.tsx:145",
  "src/components/seo/SkillTreePageContent.tsx:139",
  "src/components/seo/CookpotContent.tsx:95",
  "src/components/seo/CookpotContent.tsx:96",
  "src/components/seo/QuestPageContent.tsx:108",
]);

const dryRun = process.argv.includes("--dry-run");
const root = process.cwd();

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

/** `<img` 시작 위치에서 태그를 닫는 `/>` 의 인덱스를 찾는다 (문자열·JSX 표현식 인식). */
function findTagEnd(src, start) {
  let i = start;
  const stack = []; // '"' | "'" | '`' | '{'
  while (i < src.length) {
    const c = src[i];
    const top = stack[stack.length - 1];
    if (top === '"' || top === "'") {
      if (c === "\\") i++;
      else if (c === top) stack.pop();
    } else if (top === "`") {
      if (c === "\\") i++;
      else if (c === "`") stack.pop();
      else if (c === "$" && src[i + 1] === "{") { stack.push("{"); i++; }
    } else {
      if (c === '"' || c === "'" || c === "`") stack.push(c);
      else if (c === "{") stack.push("{");
      else if (c === "}") stack.pop();
      else if (c === "/" && src[i + 1] === ">" && stack.length === 0) return i;
      else if (c === ">" && stack.length === 0) return -1; // 자기닫힘이 아닌 태그 — 건너뜀
    }
    i++;
  }
  return -1;
}

const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

let touched = 0, skippedHero = 0, already = 0;
const report = [];

for (const file of walk(path.join(root, "src"))) {
  const rel = path.relative(root, file);
  let src = fs.readFileSync(file, "utf8");
  const edits = [];
  const re = /<img[\s\n]/g;
  let m;
  while ((m = re.exec(src))) {
    const tagStart = m.index;
    const end = findTagEnd(src, tagStart + 4);
    if (end < 0) continue;
    const tag = src.slice(tagStart, end + 2);
    const line = lineOf(src, tagStart);
    if (/\bloading\s*=/.test(tag)) { already++; continue; }
    if (EAGER_KEEP.has(`${rel}:${line}`)) { skippedHero++; continue; }
    edits.push({ end, tag, line });
  }
  if (!edits.length) continue;

  // 뒤에서부터 넣어야 인덱스가 밀리지 않는다
  for (const e of edits.reverse()) {
    const before = src.slice(0, e.end);
    const multiline = e.tag.includes("\n");
    let insert;
    if (multiline) {
      // 마지막 속성 줄의 들여쓰기에 맞춰 새 줄로 넣는다 (`/>` 줄은 한 단계 얕다)
      const closeNl = before.lastIndexOf("\n");
      const attrNl = before.lastIndexOf("\n", closeNl - 1);
      const indent = (before.slice(attrNl + 1).match(/^[ \t]*/) || [""])[0];
      // `before` 는 이미 `/>` 앞 들여쓰기까지 포함하므로, 그 차이만큼만 더 넣으면
      // 새 속성이 직전 속성과 같은 깊이가 된다.
      const closeIndent = (before.slice(closeNl + 1).match(/^[ \t]*/) || [""])[0];
      const pad = indent.startsWith(closeIndent) ? indent.slice(closeIndent.length) : "";
      insert = `${pad}loading="lazy"\n${closeIndent}`;
    } else {
      insert = `loading="lazy" `;
    }
    src = before + insert + src.slice(e.end);
  }
  touched += edits.length;
  report.push(`${rel}  +${edits.length}`);
  if (!dryRun) fs.writeFileSync(file, src);
}

report.sort().forEach((r) => console.log("  " + r));
console.log(`\n${dryRun ? "[dry-run] " : ""}loading="lazy" 추가: ${touched}개 / 이미 있던 것: ${already}개 / 히어로 제외: ${skippedHero}개`);
