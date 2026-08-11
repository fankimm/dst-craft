// 피드백에 Claude 명의로 답변을 단다 (reply_author = 'claude').
//
// 관리자 JWT를 사용자에게 받아오는 대신, 서버 안에서 .env의 JWT_SECRET으로
// 단기(10분) 토큰을 만들어 로컬 API로만 호출한다. 시크릿도 토큰도 서버 밖으로 나가지 않고
// 출력되지도 않는다.
//
// **반드시 서버(맥미니)에서 실행할 것** — .env와 localhost:3001에 접근해야 한다.
//
// 실행:
//   bun run bun-api/scripts/reply-as-claude.ts <피드백 id> <답변 본문> [status]
//
// 예:
//   ssh fankimm@100.85.118.4 '~/.bun/bin/bun run ~/works/dst-craft/bun-api/scripts/reply-as-claude.ts \
//     "1786395320853-r2i66t" "정리했습니다. 제보 감사합니다" done'
//
// status 생략 시 done. 답변은 API가 500자에서 자른다.
// 답변 본문은 공개 게시판에 그대로 노출되므로 보내기 전 반드시 사용자 확인을 받을 것.

import { Database } from "bun:sqlite";
import { homedir } from "node:os";
import { join } from "node:path";

const ENV_PATH = process.env.BUN_API_ENV ?? join(homedir(), "works", "dst-craft", "bun-api", ".env");
const API_URL = process.env.API_URL ?? "http://localhost:3001";
const DB_PATH = process.env.DB_PATH ?? join(homedir(), "dstcraft", "data", "app.db");
const TOKEN_TTL_SEC = 600;
const VALID_STATUSES = ["new", "done", "hold", "rejected"];

const [id, reply, status = "done"] = process.argv.slice(2);

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
console.log("공개 목록 캐시가 60초라 사이트 반영에는 최대 1분 걸린다.");
