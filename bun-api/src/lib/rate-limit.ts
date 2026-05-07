// 인메모리 rate limiter — 재시작 시 리셋되어도 무방 (TODO-self-hosting Phase 4 명시).

type Bucket = { count: number; expiresAt: number };
const buckets = new Map<string, Bucket>();

// true = 한도 초과 (요청 차단)
export function checkRateLimit(key: string, max: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowSec * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.expiresAt <= now) buckets.delete(k);
  }
}, 5 * 60 * 1000).unref?.();
