import { Hono } from "hono";

const app = new Hono();

app.get("/headers", (c) => {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((v, k) => {
    headers[k] = v;
  });
  return c.json({
    method: c.req.method,
    url: c.req.url,
    headers,
    cfCountry: c.req.header("CF-IPCountry") || null,
    cfConnectingIp: c.req.header("CF-Connecting-IP") || null,
    xForwardedFor: c.req.header("x-forwarded-for") || null,
  });
});

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

export default app;
