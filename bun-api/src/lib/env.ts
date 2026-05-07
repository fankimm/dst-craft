function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function optional(name: string): string {
  return process.env[name] ?? "";
}

const home = process.env.HOME ?? "";

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),

  DB_PATH: process.env.DB_PATH ?? `${home}/dstcraft/data/app.db`,

  // Upstash는 마이그레이션 스크립트 + 임시 백필용으로만 유지. 런타임 라우트는 SQLite만 사용.
  UPSTASH_REDIS_REST_URL: optional("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: optional("UPSTASH_REDIS_REST_TOKEN"),

  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  JWT_SECRET: required("JWT_SECRET"),
  ADMIN_EMAILS: optional("ADMIN_EMAILS")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),

  TELEGRAM_BOT_TOKEN: optional("TELEGRAM_BOT_TOKEN"),
  TELEGRAM_CHAT_ID: optional("TELEGRAM_CHAT_ID"),
  KOFI_VERIFICATION_TOKEN: optional("KOFI_VERIFICATION_TOKEN"),
};
