// ts-import-hooks.mjs의 resolve 훅 본체 (register는 별도 모듈이어야 한다)
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

let SRC_DIR = "";
export function initialize(data) { SRC_DIR = data.SRC_DIR; }

export async function resolve(specifier, context, next) {
  let s = specifier;
  if (s.startsWith("@/")) s = SRC_DIR + s.slice(2);
  else if ((s.startsWith("./") || s.startsWith("../")) && context.parentURL) s = new URL(s, context.parentURL).href;
  if (s.startsWith("file:") && !/\.[cm]?[jt]sx?$/.test(s)) {
    const p = fileURLToPath(s);
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      if (fs.existsSync(p + ext)) { s = pathToFileURL(p + ext).href; break; }
    }
  }
  return next(s, context);
}
