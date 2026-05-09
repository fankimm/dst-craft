-- bun-api SQLite 스키마. CREATE IF NOT EXISTS만 사용 → db.ts 부팅 시 매번 실행해도 멱등.

-- ─── 인증/유저 ───
CREATE TABLE IF NOT EXISTS users (
  sub TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_ips (
  ip TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

-- ─── 사용자 데이터 ───
CREATE TABLE IF NOT EXISTS favorites (
  user_sub TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_sub, item_id)
);

CREATE TABLE IF NOT EXISTS skills_builds (
  user_sub TEXT NOT NULL,
  character_id TEXT NOT NULL,
  skills_json TEXT NOT NULL DEFAULT '[]',
  locks_json TEXT NOT NULL DEFAULT '[]',
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_sub, character_id)
);

-- ─── 운영 ───
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  reply TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

CREATE TABLE IF NOT EXISTS supporters (
  name TEXT PRIMARY KEY,
  cents INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supporters_cents ON supporters(cents DESC);

CREATE TABLE IF NOT EXISTS kofi_transactions (
  tx_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ─── 애널리틱스 ───
-- 모든 INCR/HINCRBY 카운터 통합. (scope, bucket, country) 조합으로 Redis 키 1:1 대응.
--   pv_total       (bucket='',          country=''|cc)  ← dst:pv:total[:cc]
--   pv_day         (bucket='YYYY-MM-DD', country=''|cc) ← dst:pv:<date>[:cc]
--   pv_month       (bucket='YYYY-MM',    country=''|cc) ← dst:pv:m:<month>[:cc]
--   return_total   (bucket='',          country=''|cc)  ← dst:return:total[:cc]
--   event          (bucket=type,        country='')      ← dst:events:<type>
--   device         (bucket=device,      country=''|cc)  ← dst:device[:cc] HASH
--   os             (bucket=os,          country=''|cc)  ← dst:os[:cc] HASH
--   referrer       (bucket=referrer,    country=''|cc)  ← dst:referrers[:cc] HASH
--   rating         (bucket='1'..'5',    country='')      ← dst:ratings HASH
--   geo            (bucket=cc,          country='')      ← dst:geo:countries HASH
--   supporters_cnt (bucket='',          country='')      ← dst:supporters:count
CREATE TABLE IF NOT EXISTS analytics_counters (
  scope TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scope, bucket, country)
);

-- HyperLogLog 대체. 정확한 distinct count.
--   scope='total'  bucket=''           country=''|cc  ← dst:uv:total[:cc]
--   scope='day'    bucket='YYYY-MM-DD' country=''|cc  ← dst:uv:<date>[:cc]
--   scope='month'  bucket='YYYY-MM'    country=''|cc  ← dst:uv:m:<month>[:cc]
CREATE TABLE IF NOT EXISTS analytics_uv (
  scope TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL,
  PRIMARY KEY (scope, bucket, country, ip)
);

-- 최근 방문자 로그 (rolling 200)
CREATE TABLE IF NOT EXISTS analytics_visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  country TEXT,
  ua TEXT,
  device TEXT,
  os TEXT,
  time TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS trim_visitors AFTER INSERT ON analytics_visitors
BEGIN
  DELETE FROM analytics_visitors WHERE id <= NEW.id - 200;
END;

-- duration 샘플 (rolling 1000)
CREATE TABLE IF NOT EXISTS analytics_duration_samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duration INTEGER NOT NULL
);
CREATE TRIGGER IF NOT EXISTS trim_duration AFTER INSERT ON analytics_duration_samples
BEGIN
  DELETE FROM analytics_duration_samples WHERE id <= NEW.id - 1000;
END;

-- 인기 클릭 (ZSET 대체)
CREATE TABLE IF NOT EXISTS analytics_clicks (
  item_id TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_clicks_count ON analytics_clicks(count DESC);

-- 요리 콤보 (ZSET 대체, recipe_id별)
CREATE TABLE IF NOT EXISTS analytics_combos (
  recipe_id TEXT NOT NULL,
  combo_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (recipe_id, combo_key)
);
CREATE INDEX IF NOT EXISTS idx_combos_count ON analytics_combos(recipe_id, count DESC);

-- 별점 IP 추적 (재투표 시 이전 별점 차감용)
CREATE TABLE IF NOT EXISTS rating_ips (
  ip TEXT PRIMARY KEY,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5)
);

-- 풀 URL referrer (high-cardinality, exact-match aggregation by URL).
-- 도메인 referrer는 analytics_counters(scope='referrer') 그대로 유지하고, 여기는 어떤 글에서 들어왔는지 추적용.
-- URL은 PII 가능성(쿼리스트링)이라 admin 응답에만 노출. 길이는 라우트에서 500자로 클램프.
-- 폭증 시 별도 cleanup: 카운트 낮은 행 trim (현 시점엔 미적용, 모니터링 후 필요 시 추가).
CREATE TABLE IF NOT EXISTS analytics_referrer_urls (
  url TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  last_seen_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_referrer_urls_count ON analytics_referrer_urls(count DESC);
CREATE INDEX IF NOT EXISTS idx_referrer_urls_last_seen ON analytics_referrer_urls(last_seen_at);
