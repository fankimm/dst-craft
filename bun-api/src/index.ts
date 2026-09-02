// bun-api 변경 → main 푸시 → self-hosted runner(deploy-beta.yml)가 plist 동기화 + launchctl 재시작.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env";

import analytics from "./routes/analytics";
import auth from "./routes/auth";
import skills from "./routes/skills";
import favorites from "./routes/favorites";
import feedback from "./routes/feedback";
import kofiSupporters from "./routes/kofi-supporters";
import config from "./routes/config";
import debug from "./routes/debug";

const app = new Hono();

// 액세스 로그에 ISO 타임스탬프 prefix — 사후 forensic을 위해 (5/7 사고 RCA에서 timestamp 부재로 시간대 매칭 불가했음).
// hono/logger는 print 함수를 받으므로 wrapping해서 timestamp만 추가.
app.use("*", logger((message: string, ...rest: string[]) => {
  console.log(new Date().toISOString(), message, ...rest);
}));

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "";
      if (env.ALLOWED_ORIGINS.includes(origin)) return origin;
      if (origin.startsWith("http://localhost:")) return origin;
      return "";
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.route("/", analytics);
app.route("/auth", auth);
app.route("/skills", skills);
app.route("/favorites", favorites);
app.route("/feedback", feedback);
app.route("/", kofiSupporters);
app.route("/config", config);
app.route("/_debug", debug);

app.onError((err, c) => {
  console.error("[bun-api]", err);
  return c.json({ error: err.message ?? "Internal error" }, 500);
});

app.notFound((c) => c.text("Not Found", 404));

console.log(`[bun-api] listening on 127.0.0.1:${env.PORT}`);

export default {
  // **루프백에만 바인딩한다** (#68). 지정하지 않으면 Bun은 `0.0.0.0`(모든 인터페이스)에
  // 붙어 집 LAN의 아무 기기나 `http://<맥미니 LAN IP>:3001` 로 API를 직접 때릴 수 있다.
  // 그러면 nginx를 우회하므로 rate limit·캐시 헤더·`CF-Connecting-IP` 기반 real_ip가
  // 전부 무시된다.
  //
  // 2026-08-10 점검에서 같은 원인(`0.0.0.0` 바인딩)으로 `python3 -m http.server` 가
  // `~/dstcraft` 전체를 무인증으로 LAN에 열어두고 있었다 — `.cf-env`(Cloudflare 자격증명)와
  // 라이브 DB(users·supporters·kofi_transactions 포함)가 그대로 받아지는 상태였다.
  // 그때 statshttp·goaccess·nginx는 조치했고 bun API만 레포 안이라 남아 있었다.
  //
  // 모든 소비자가 루프백을 쓴다: nginx `proxy_pass http://127.0.0.1:3001/`,
  // 배포 워크플로우 헬스체크, `reply-as-claude.ts` 전부 localhost.
  hostname: "127.0.0.1",
  port: env.PORT,
  fetch: app.fetch,
};
