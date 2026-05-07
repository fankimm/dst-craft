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

app.use("*", logger());

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

console.log(`[bun-api] listening on :${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
