import { Hono } from "hono";
import { env } from "../lib/env";
import { redisPipeline } from "../lib/redis";
import { createJWT } from "../lib/jwt";
import { extractIp } from "../lib/util";

const app = new Hono();

// POST /auth/google — verify Google ID token, issue JWT
app.post("/google", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const idToken = body.idToken as string;
  if (!idToken) return c.json({ error: "Missing idToken" }, 400);

  const tokenRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!tokenRes.ok) return c.json({ error: "Invalid token" }, 401);

  const tokenInfo = (await tokenRes.json()) as Record<string, any>;
  if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
    return c.json({ error: "Invalid audience" }, 401);
  }

  const sub = tokenInfo.sub as string;
  const email = (tokenInfo.email as string) ?? "";
  const name = (tokenInfo.name as string) ?? "";
  const picture = (tokenInfo.picture as string) ?? "";

  await redisPipeline([
    ["HSET", `dst:user:${sub}`, "email", email, "name", name, "picture", picture],
  ]);

  const isAdmin = env.ADMIN_EMAILS.includes(email.toLowerCase());

  const jwt = await createJWT({
    sub,
    email,
    name,
    picture,
    ...(isAdmin ? { role: "admin" } : {}),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400,
  });

  if (isAdmin) {
    const adminIp = extractIp(c);
    if (adminIp && adminIp !== "unknown") {
      await redisPipeline([["SADD", "dst:admin-ips", adminIp]]);
    }
  }

  return c.json({ token: jwt, user: { sub, email, name, picture } });
});

export default app;
