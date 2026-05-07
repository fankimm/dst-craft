import { env } from "./env";

export type RedisResult = { result: any };

export async function redisPipeline(commands: unknown[][]): Promise<RedisResult[]> {
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upstash error ${res.status}: ${text}`);
  }
  return (await res.json()) as RedisResult[];
}
