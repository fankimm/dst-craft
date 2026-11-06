// 피드백에 Claude 명의로 답변을 단다 (reply_author = 'claude').
//
// 관리자 JWT를 사용자에게 받아오는 대신, 서버 안에서 .env의 JWT_SECRET으로
// 단기(10분) 토큰을 만들어 로컬 API로만 호출한다. 시크릿도 토큰도 서버 밖으로 나가지 않고
// 출력되지도 않는다.
//
// **반드시 서버(맥미니)에서 실행할 것** — .env와 localhost:3001에 접근해야 한다.
//
// 실행:
//   bun run bun-api/scripts/reply-as-claude.ts <피드백 id> <답변 본문> [status] [옵션]
//
// 옵션 (번역을 답변과 한 번에 저장 — #140):
//   --reply-lang=<ko|en|pt…>        답변 원문 언어
//   --reply-translated=<문자열>     반대 언어 번역. 원문이 ko/en이 아니면 {"ko":"…","en":"…"} JSON
//   --message-lang=<…>              피드백 원문 언어 (아직 미번역일 때만 저장됨)
//   --message-translated=<문자열>   피드백 번역 (형식은 위와 같음)
//   --model=<모델 id>               번역 작성 모델 (기본 claude-fable-5-1)
//
// 예:
//   ssh fankimm@100.85.118.4 '~/.bun/bin/bun run ~/works/dst-craft/bun-api/scripts/reply-as-claude.ts \
//     "1786395320853-r2i66t" "정리했습니다. 제보 감사합니다" done \
//     --reply-lang=ko --reply-translated="Cleaned up. Thanks for the report!"'
//
// 평소엔 직접 ssh하지 않고 `scripts/feedback-reply.sh`(→ feedback-reply 워크플로우 → 맥미니 러너)로 부른다.
//
// status 생략 시 done. 답변은 API가 500자에서 자른다.
// 답변이 바뀌면 옛 답변의 번역은 항상 지운다 — 새 번역을 같이 주지 않으면 번역 없음 상태가 된다
// (예전엔 번역이 남아 옛 문구가 반대 로캘에 계속 보였다).
// 답변 본문은 공개 게시판에 그대로 노출된다. 작성 기준은 docs/autopilot.md "피드백 답변 원칙".

import { Database } from "bun:sqlite";
import { homedir } from "node:os";
import { join } from "node:path";

const ENV_PATH = process.env.BUN_API_ENV ?? join(homedir(), "works", "dst-craft", "bun-api", ".env");
const API_URL = process.env.API_URL ?? "http://localhost:3001";
const DB_PATH = process.env.DB_PATH ?? join(homedir(), "dstcraft", "data", "app.db");
const TOKEN_TTL_SEC = 600;
const VALID_STATUSES = ["new", "done", "hold", "rejected"];

const DEFAULT_MODEL = "claude-fable-5-1";

const rawArgs = process.argv.slice(2);
const flags = new Map<string, string>();
const positional: string[] = [];
for (const arg of rawArgs) {
  const m = /^--([a-z-]+)=([\s\S]*)$/.exec(arg);
  if (m) flags.set(m[1], m[2]);
  else positional.push(arg);
}
const [id, reply, status = "done"] = positional;

const KNOWN_FLAGS = ["reply-lang", "reply-translated", "message-lang", "message-translated", "model"];
for (const name of flags.keys()) {
  if (!KNOWN_FLAGS.includes(name)) {
    console.error(`모르는 옵션: --${name} (쓸 수 있는 것: ${KNOWN_FLAGS.map((f) => `--${f}`).join(", ")})`);
    process.exit(1);
  }
}

// 빈 값은 "안 줌"으로 본다 — 워크플로우가 비어 있는 입력도 그대로 넘기기 때문.
const flag = (name: string): string | undefined => flags.get(name)?.trim() || undefined;

// 번역 한 쌍(lang + translated)을 검증한다. 원문이 ko/en이면 반대 언어 문자열 하나,
// 그 외 언어면 ko·en 사용자 모두 번역이 필요하므로 {"ko","en"} JSON 맵이어야 한다 (#123).
function readTranslation(kind: "reply" | "message"): { lang: string; translated: string } | null {
  const lang = flag(`${kind}-lang`);
  const translated = flag(`${kind}-translated`);
  if (!lang && !translated) return null;
  if (!lang || !translated) {
    console.error(`--${kind}-lang과 --${kind}-translated는 같이 줘야 한다`);
    process.exit(1);
  }
  if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(lang)) {
    console.error(`--${kind}-lang 값이 언어 코드가 아니다: ${lang}`);
    process.exit(1);
  }
  if (lang !== "ko" && lang !== "en") {
    let map: unknown;
    try {
      map = JSON.parse(translated);
    } catch {
      map = null;
    }
    const ok =
      map !== null &&
      typeof map === "object" &&
      typeof (map as Record<string, unknown>).ko === "string" &&
      typeof (map as Record<string, unknown>).en === "string";
    if (!ok) {
      console.error(`원문이 ko/en이 아니면(${lang}) --${kind}-translated는 {"ko":"…","en":"…"} JSON이어야 한다`);
      process.exit(1);
    }
  }
  return { lang, translated };
}

if (!id || !reply) {
  console.error("사용법: bun run reply-as-claude.ts <피드백 id> <답변 본문> [status]");
  process.exit(1);
}
if (!VALID_STATUSES.includes(status)) {
  console.error(`status는 ${VALID_STATUSES.join(" / ")} 중 하나여야 한다 (받은 값: ${status})`);
  process.exit(1);
}

function readSecret(envText: string): string {
  const line = envText.split("\n").find((l) => l.trim().startsWith("JWT_SECRET="));
  const value = line?.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  if (!value) throw new Error(`JWT_SECRET을 찾지 못했다: ${ENV_PATH}`);
  return value;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// bun-api/src/lib/jwt.ts의 createJWT와 동일한 HS256 서명.
async function createAdminToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "claude-cli",
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC,
  };
  const data = `${base64Url(enc.encode(JSON.stringify(header)))}.${base64Url(enc.encode(JSON.stringify(payload)))}`;
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  return `${data}.${base64Url(sig)}`;
}

const replyTranslation = readTranslation("reply");
const messageTranslation = readTranslation("message");
const model = flag("model") ?? DEFAULT_MODEL;

// 답변 전 상태 — 운영 장부(docs/autopilot-ledger.md)에 "이전 상태"로 남길 값이라 먼저 읽어 출력한다.
const before = new Database(DB_PATH, { readonly: true })
  .query<{ reply: string | null; reply_author: string | null; status: string }, [string]>(
    `SELECT reply, reply_author, status FROM feedback WHERE id = ?`,
  )
  .get(id);
if (!before) {
  console.error(`그런 id가 없다: ${id}`);
  console.error("공개 목록에서 id를 다시 확인할 것: curl -s https://www.dstcraft.com/api/feedback/public | jq '.items[].id'");
  process.exit(1);
}
console.log(`이전 상태 — status=${before.status}, replyAuthor=${before.reply_author ?? "-"}, reply=${before.reply ?? "(없음)"}`);

const secret = readSecret(await Bun.file(ENV_PATH).text());
const token = await createAdminToken(secret);

const res = await fetch(`${API_URL}/feedback`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ id, status, reply, replyAuthor: "claude" }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`실패 (${res.status}): ${body}`);
  process.exit(1);
}

// PATCH는 없는 id에도 200 ok를 준다 (UPDATE 0건). 오타 하나로 "달았다"고 착각하지 않도록
// DB에서 실제 저장 결과를 직접 확인한다.
const row = new Database(DB_PATH, { readonly: true })
  .query<{ reply: string | null; reply_author: string; status: string }, [string]>(
    `SELECT reply, reply_author, status FROM feedback WHERE id = ?`,
  )
  .get(id);

if (!row) {
  console.error(`저장 안 됨 — 그런 id가 없다: ${id}`);
  console.error("공개 목록에서 id를 다시 확인할 것: curl -s https://www.dstcraft.com/api/feedback/public | jq '.items[].id'");
  process.exit(1);
}
if ((row.reply ?? "") !== reply.slice(0, 500) || row.reply_author !== "claude") {
  console.error(`저장 결과가 보낸 값과 다르다 — reply_author=${row.reply_author}, reply=${row.reply}`);
  process.exit(1);
}

console.log(`저장 완료 — id=${id}, status=${row.status}, replyAuthor=${row.reply_author}`);
console.log(`답변: ${row.reply}`);

// 번역 — PATCH는 번역 칸을 건드리지 않으므로 여기서 직접 쓴다.
const db = new Database(DB_PATH);
const now = Math.floor(Date.now() / 1000);
const replyChanged = (before.reply ?? "") !== (row.reply ?? "");
if (replyTranslation) {
  db.query(
    `UPDATE feedback
        SET reply_translated = ?, reply_lang = ?, reply_translated_at = ?, reply_translated_model = ?
      WHERE id = ?`,
  ).run(replyTranslation.translated, replyTranslation.lang, now, model, id);
  console.log(`답변 번역 저장 — replyLang=${replyTranslation.lang}`);
} else if (replyChanged) {
  db.query(
    `UPDATE feedback
        SET reply_translated = NULL, reply_lang = NULL, reply_translated_at = NULL, reply_translated_model = NULL
      WHERE id = ?`,
  ).run(id);
  console.log("답변이 바뀌어 옛 번역을 지웠다 — 새 번역이 없으니 --reply-lang/--reply-translated로 다시 넣을 것");
}
if (messageTranslation) {
  // 메시지 번역은 이미 있으면 덮어쓰지 않는다 (translate-existing-feedback.ts와 같은 규칙).
  const m = db
    .query(
      `UPDATE feedback
          SET message_translated = ?, message_lang = ?, message_translated_at = ?, message_translated_model = ?
        WHERE id = ? AND message_translated_at IS NULL`,
    )
    .run(messageTranslation.translated, messageTranslation.lang, now, model, id);
  console.log(m.changes > 0 ? `메시지 번역 저장 — messageLang=${messageTranslation.lang}` : "메시지 번역은 이미 있어 건너뜀");
}
db.close();
console.log("공개 목록 캐시가 60초라 사이트 반영에는 최대 1분 걸린다.");
