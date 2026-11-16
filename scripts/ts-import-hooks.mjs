// Node가 `src/` 아래 TypeScript를 그대로 실행할 수 있게 하는 로더 훅 (Node 24 type stripping 사용).
//   node --import ./scripts/ts-import-hooks.mjs ./<script>.mts
// `@/x` → `src/x`, 확장자 없는 상대/별칭 import → `.ts`/`.tsx`/`/index.ts` 보완.
// 타입 전용 구문만 지우므로 enum·namespace·데코레이터는 못 쓴다 (src/lib·src/data는 해당 없음).
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const SRC_DIR = pathToFileURL(new URL("../src/", import.meta.url).pathname).href;
register("./ts-import-hooks-resolve.mjs", { parentURL: import.meta.url, data: { SRC_DIR } });
