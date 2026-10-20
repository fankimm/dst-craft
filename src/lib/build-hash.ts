import fs from "node:fs";
import path from "node:path";

/**
 * 빌드 해시 — 서비스워커(`public/sw.js`, `scripts/generate-sw.cjs`가 생성)의 `APP_CACHE`와 같은 값.
 * 빌드 시점에 서버 컴포넌트(layout)에서만 읽어 `window.__dstBuild`로 심는다. 새 SW가 활성화될 때
 * 페이지가 이미 그 빌드면 새로고침을 건너뛰기 위한 비교 기준이다 (#128).
 * sw.js가 아직 없으면(개발 서버) "dev".
 */
export function readBuildHash(): string {
  try {
    const sw = fs.readFileSync(path.join(process.cwd(), "public", "sw.js"), "utf8");
    return /dst-app-([0-9a-f]+)/.exec(sw)?.[1] ?? "dev";
  } catch {
    return "dev";
  }
}
