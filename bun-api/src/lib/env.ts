function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function optional(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),

  UPSTASH_REDIS_REST_URL: required("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: required("UPSTASH_REDIS_REST_TOKEN"),

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
