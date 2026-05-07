# TODO — Vercel → Mac mini 셀프호스팅 이주

> 결정일: 2026-05-07
> 작성: 메인 세션에서 합의된 결정사항을 Mac mini SSH 세션에서 이어받기 위한 계획서
> 우선순위: **Phase 1 먼저** (prod 라인은 Vercel 그대로 두고 `beta.dstcraft.com`만 Mac mini로 띄움)
>
> **진행 상황 (2026-05-07)**
> - ✅ Phase 1 완료 — `https://beta.dstcraft.com` 라이브 (CF Tunnel → Mac mini nginx :8080 → 정적 빌드)
> - ✅ Phase 2 완료 — `scripts/deploy-beta.sh` 자동 배포 스크립트
> - ✅ 운영 정비 일부 — macOS 자동 업데이트/재부팅 차단
> - ✅ Phase 3 완료 — Worker → Bun API (Hono) 이식, 25 엔드포인트, nginx /api/ 프록시, launchd 자동 시작/재시작
> - ✅ Phase 4 코드 완료 (워크스테이션) — bun-api 데이터 레이어 SQLite로 교체 + 마이그레이션 스크립트 + 백업 plist. **Mac mini에서 1회성 실행 필요** (아래 §4.실행 절차 참조)
> - ⏭ 다음: Mac mini에서 Phase 4 실행 → Phase 5 (self-hosted runner)

---

## 배경 / 결정 사항

- 현재 Vercel Hobby edge request 한도(1M/월) 임박. 일 30k 수준 → 방문자 100명만 늘어도 초과.
- CF Pages 무료는 빌드 출력 파일 수 20k 제한에 걸려서 배포 실패 전적 있음 → 후보 제외
- R2+Worker는 트래픽 늘면 결국 Workers Paid로 가야 해서 두 번 작업 → 후보 제외
- Pro $20/월 부담스럽고, Mac mini가 4개월째 무중단 가동 중 (작업머신: Claude+Telegram+Tailscale, DST 데디서버는 현재 미사용) → **셀프호스팅 확정**

## 원칙

**외부 의존은 회피 불가능한 것만.** 그 외 전부 Mac mini.

| 시스템 | 유지 이유 |
|---|---|
| GitHub | 소스 저장소 |
| Cloudflare DNS + Tunnel | KT 가정용 약관 회피 + 인바운드 포트 비개방 |
| Google Identity Services | OAuth는 클라이언트 측이라 외부 발급자 필요 |
| Ko-fi 웹훅 | 후원 결제 게이트웨이 |
| GitHub Actions (self-hosted runner) | Phase 5에서 도입. 빌드 트리거만 외부, 실행은 Mac mini 안 |

**제거 대상:** Vercel, Upstash Redis, Cloudflare Worker, Cloudflare Pages.

## 최종 아키텍처

```
[CF DNS]                          [Mac mini]
  dstcraft.com         ─CF Tunnel─▶ nginx :80
  beta.dstcraft.com    (cloudflared)  │
                                      ├─ Host: dstcraft.com       → /srv/dstcraft/prod (static)
                                      ├─ Host: beta.dstcraft.com  → /srv/dstcraft/beta (static)
                                      └─ /api/*                   → bun api :3001
                                                                        │
                                                                        └─ SQLite (/srv/dstcraft/data/app.db, bun:sqlite 내장)
```

Mac mini에 떠 있는 프로세스는 **nginx + cloudflared + bun-api + github-runner 4개**가 끝. 별도 DB 데몬 없음.

## 데이터 결정

- **SQLite + WAL** 단일화. Postgres/MySQL/Redis 전부 미사용.
- 이유: 외부 데몬 0, 백업 = 파일 복사, Bun 내장(`bun:sqlite`)이라 의존성 0, 일 30k req 트래픽엔 차고 넘침.
- rate limit는 Bun 프로세스 내 메모리 Map + TTL (재시작 시 리셋되어도 무방).

---

# Phase 1 — `beta.dstcraft.com`에 prod 그대로 셀프호스팅 ⭐ 우선

> **목표**: Vercel의 prod 빌드와 동일한 정적 사이트를 Mac mini에서 서빙하고, `beta.dstcraft.com` 으로 접속되게 한다.
> 이 시점엔 API/DB 이식 X. 정적 사이트만. analytics는 기존 CF Worker 그대로 호출.
> 완료 기준: `https://beta.dstcraft.com` 접속 시 prod와 동일 렌더링 + analytics 정상 트래킹.

## 실행 환경 — 어디서 무엇을 도는가

**모든 작업은 Mac mini 안에서 실행되는 Claude 세션이 수행한다.** 본 머신(이 계획서를 작성한 머신)의 Claude는 계획서 작성/수정만 담당.

### 작업 흐름
1. **본 머신 터미널**에서 Tailscale로 Mac mini에 SSH 진입
   ```bash
   ssh <macmini-tailscale-name>
   ```
2. **Mac mini 셸**에서 Claude Code 실행 (없으면 먼저 설치: `npm i -g @anthropic-ai/claude-code` 또는 공식 설치 가이드 참조)
   ```bash
   cd ~/work && [ -d dst-craft ] || git clone <repo>
   cd dst-craft && git pull
   claude
   ```
3. **Mac mini Claude 세션**에서 이 파일을 열고 §1.1부터 진행
   ```
   /todo  또는  cat TODO-self-hosting.md
   ```

이유 (왜 SSH 후 Mac mini에서 Claude를 실행하는가):
- Claude Code의 Read/Edit/Write는 같은 머신 파일시스템을 직접 다룸. SSH 너머 파일은 비효율
- nginx 재시작·cloudflared 설치 등에 sudo 프롬프트가 끼어 비대화형 SSH로는 까다로움
- 빌드 산출물(`out/`)이 결국 Mac mini에 있어야 하니 빌드도 그곳에서 돌리는 게 자연스러움

---

## 1.1 사전 확인 (Mac mini Claude 세션 내)

```bash
# 도구 존재 확인
brew --version
node --version || echo "node 없음 → brew install node"
git --version

# Homebrew 경로 확인 (이후 nginx 경로에 사용)
brew --prefix

# 디스크 여유 확인 (1GB 이상이면 충분)
df -h ~
```

## 1.2 도구 설치

```bash
brew install nginx cloudflared
# (옵션) bun도 미리 설치 — Phase 3에서 필요
brew install oven-sh/bun/bun
```

## 1.3 디렉터리 구조

> **결정**: `/srv/dstcraft` 대신 `~/dstcraft` 사용 (sudo 불필요, macOS 표준 외 위치 회피).

```bash
mkdir -p ~/dstcraft/{prod,beta,data,api,releases}
ls -la ~/dstcraft
```

- `prod/`, `beta/`: 정적 사이트 출력 (Phase 1에선 beta만 채움) — 이후 symlink로 교체
- `data/`: SQLite (Phase 4)
- `api/`: Bun API 소스 (Phase 3)
- `releases/`: 타임스탬프별 빌드 보관소(원자적 스왑용)
- `source/`: fresh git clone (빌드 전용 워크트리 — 작업머신의 dst-craft과 분리)

## 1.4 첫 빌드 + 배포 (수동)

> **주의**: `.env.local`이 작업머신/소스에 없음. Vercel 대시보드에서만 주입되는 변수 두 개를 직접 작성해야 함.
> - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — `worker/wrangler.toml`의 `[vars] GOOGLE_CLIENT_ID` 그대로
> - `NEXT_PUBLIC_ANALYTICS_WORKER_URL` — `https://dst-analytics.fankimm.workers.dev` (prod HTML에서 추출하거나 wrangler dashboard에서 확인)

```bash
# fresh clone (작업머신의 ~/works/dst-craft 와 분리)
cd ~/dstcraft
git clone git@github.com:fankimm/dst-craft.git source
cd source

# .env.local 작성 (Vercel 대시보드 환경변수와 동일)
cat > .env.local <<'EOF'
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<wrangler.toml에서 복사>
NEXT_PUBLIC_ANALYTICS_WORKER_URL=https://dst-analytics.fankimm.workers.dev
EOF

npm ci
npm run build
# Next.js export 결과는 ./out (~685MB)

# out 디렉터리를 통째로 releases로 이동 (cp 대신 mv = 즉시 + 다운타임 0)
TS=$(date +%Y%m%d-%H%M%S)
rmdir ~/dstcraft/beta 2>/dev/null  # 빈 디렉터리이면 제거 (symlink 만들기 위함)
mv out ~/dstcraft/releases/$TS
ln -sfn ~/dstcraft/releases/$TS ~/dstcraft/beta
ls -la ~/dstcraft/beta
```

> Phase 2에서 deploy 스크립트로 묶을 때는 mv 대신 rsync로 source/out을 보존하는 편이 재빌드에 유리할 수 있음.

## 1.5 nginx 설정

> **결정**: 포트 80 대신 **8080** 사용 (brew nginx 기본값, sudo 불필요).
> CF Tunnel이 어차피 localhost로 붙어 외부에서 차이 없음.
>
> **경로 (Intel Mac, brew --prefix=/usr/local)**:
> - 설정 디렉터리: `/usr/local/etc/nginx/`
> - vhost include: `/usr/local/etc/nginx/servers/*` (nginx.conf line 114)
> - servers/ 디렉터리는 brew install 시 자동 생성 안 됨 → 직접 생성 (sudo 불필요)

```bash
mkdir -p /usr/local/etc/nginx/servers
```

`/usr/local/etc/nginx/servers/dstcraft.conf` 작성:

```nginx
# beta
server {
  listen 8080;
  server_name beta.dstcraft.com;
  root /Users/fankimm/dstcraft/beta;
  index index.html;

  # Next.js export는 trailingSlash 기본. 디렉터리 fallback.
  location / {
    try_files $uri $uri.html $uri/index.html =404;
  }

  # 정적 자산 장기 캐시
  location ~* \.(js|css|woff2?|png|jpg|jpeg|gif|svg|webp|ico)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # HTML은 짧게 (CF가 SWR 캐시)
  location ~* \.html$ {
    expires 5m;
    add_header Cache-Control "public, max-age=300, stale-while-revalidate=86400";
  }
}

# prod (Phase 6 컷오버 전까진 비활성. 같은 conf 안에 미리 적어두고 주석 처리해도 OK)
# server {
#   listen 8080;
#   server_name dstcraft.com www.dstcraft.com;
#   root /Users/fankimm/dstcraft/prod;
#   ...
# }
```

```bash
/usr/local/opt/nginx/bin/nginx -t   # syntax check (sudo 불필요)
brew services start nginx
curl -H "Host: beta.dstcraft.com" http://localhost:8080/  # HTML 응답 확인
```

## 1.6 Cloudflare Tunnel 생성

CF Zero Trust 대시보드. **2026년 기준 정확한 경로**:
`Zero Trust → Networks → Connectors → Cloudflare Tunnels`
(이전엔 `Networks → Tunnels`였음. CF가 Connectors 카테고리로 묶음)

1. **Create a tunnel** → Connector type: **Cloudflared** → 이름 `dstcraft-tunnel` → Save tunnel
2. **Install and run a connector** 단계 — OS 선택 (Mac/Windows/Debian/...) → Mac 선택 후 `sudo cloudflared service install eyJ...` 명령어 표시됨. 토큰(eyJ로 시작하는 base64)만 추출.
3. Mac mini에서 실행 (sudo 비밀번호 필요 → 새 SSH 셸에서 직접 입력 권장):
   ```bash
   sudo cloudflared service install <긴_토큰>
   sudo launchctl list | grep cloudflared  # 서비스 등록 확인
   ```
4. 마법사 다음 단계 **Route Tunnel** (= Public Hostname):
   - Subdomain: `beta`
   - Domain: `dstcraft.com`
   - Path: **(비움)**
   - Type: `HTTP`
   - URL: `localhost:8080`
   - Save hostname
5. CF DNS에 `beta` CNAME이 자동 생성됨 (proxied=ON 확인)

> **함정 1**: 터널을 한 번 지웠다가 다시 만들면 첫 번째 터널이 자동 생성한 `beta` CNAME 레코드가 남아있어서
> Public Hostname Save 시 `An A, AAAA, or CNAME record with that host already exists` 에러.
> 해결: dash.cloudflare.com → dstcraft.com → DNS → Records → `beta` 수동 삭제 → 다시 Save.
>
> **함정 2**: 첫 번째 마법사에서 install command 단계 건너뛰면 토큰을 다시 보기 까다로움.
> 다시 보려면 만든 터널 클릭 → Edit/Configure 또는 Connectors 탭에서 재표시 가능. 못 찾으면 그냥 터널 삭제 후 재생성이 빠름.

## 1.7 접속 검증

```bash
# 로컬에서 (Mac mini 외부)
curl -I https://beta.dstcraft.com
# HTTP/2 200, server: cloudflare 확인
```

브라우저에서 `https://beta.dstcraft.com` 직접 열어보고:
- [x] 메인 페이지 렌더링
- [x] 카테고리/아이템 페이지 라우팅
- [x] 검색
- [ ] analytics 호출 — **Worker CORS 추가 작업 필요** (아래 함정 참조)
- [ ] Google 로그인 — **OAuth Authorized JavaScript origins 추가 작업 필요** (아래 함정 참조)
- [ ] og-image, sitemap.xml, robots.txt 200

> **함정 3 (Worker CORS)**: `worker/index.ts`의 `corsHeaders()`가 `origin.startsWith(allowed)` 체크.
> `wrangler.toml [vars] ALLOWED_ORIGIN = "https://www.dstcraft.com"` 라서 `beta.dstcraft.com` 거부.
> 해결: `corsHeaders()`에 `origin === "https://beta.dstcraft.com"` 명시적 허용 추가 후 `cd worker && npx wrangler deploy`.
> (Phase 3에서 worker 자체가 폐기되므로 임시 패치)
>
> **함정 4 (Google OAuth)**: GIS가 hostname 검증함. Google Cloud Console에서 등록 필요.
> 1. https://console.cloud.google.com → APIs & Services → Credentials
> 2. OAuth 2.0 Client ID (`117734247342-...`) 클릭
> 3. **Authorized JavaScript origins** 에 `https://beta.dstcraft.com` 추가 → Save
> 4. 변경 반영에 5분~수 시간 (시크릿 모드로 즉시 테스트 가능한 경우 많음)

## 1.8 Phase 1 완료 기준

- [ ] `https://beta.dstcraft.com` Vercel prod와 시각적으로 동일
- [ ] 핵심 기능 (요리솥, 스킬트리, 검색, 즐겨찾기) 베타에서 동작
- [ ] CF Analytics에 베타 도메인 트래픽 잡힘
- [ ] 24시간 무다운 (간단 모니터링: `curl -I` cron 또는 수동 확인)

---

# Phase 2 — 정적 빌드 자동 배포 (단순 버전) ✅

> 목표: 로컬에서 푸시하지 않고 Mac mini에서 한 줄로 베타 갱신.
> CI는 Phase 5에서 도입. Phase 2는 수동 + 스크립트 단순화.

**완료 (2026-05-07)**

- 위치: `scripts/deploy-beta.sh` (repo 안, 버전 관리됨) + `~/dstcraft/bin/deploy-beta.sh` symlink (편의 실행)
- 사용: `~/dstcraft/bin/deploy-beta.sh` 또는 `~/dstcraft/bin/deploy-beta.sh --force`
- 동작:
  - `git restore .` + `git clean -fd`로 source 워크트리 청소 (빌드 산출물 폐기)
  - `git fetch` 후 변경 없으면 no-op (`--force`로 강제 재빌드)
  - `git pull --ff-only` → `npm ci` → `npm run build`
  - `out/`을 `~/dstcraft/releases/<TS>`로 mv (atomic) → `~/dstcraft/beta` symlink 교체
  - 최근 5개 release만 유지, 그 외 prune (현재 active는 보호)
  - 빌드 실패 시 symlink 안 바꿈 (자동 롤백)
- 검증: 첫 빌드 `7714c9f → 5f03e45`, 3908 페이지 정적 생성, 재실행 no-op, 라이브 200

---

# Phase 3 — Worker → Bun API 이식 ✅

> 목표: 기존 `worker/index.ts` (1226줄, 25개 엔드포인트)를 Mac mini의 Bun 서버로 이식.

**완료 (2026-05-07)**

- 코드: `bun-api/` (Bun 1.3 + Hono 4.12, 모듈 분할: lib/{env,redis,jwt,util} + routes/{analytics,auth,skills,favorites,feedback,kofi-supporters,config,debug})
- 25 엔드포인트 1:1 포팅, JWT/CORS/rate-limit 동작 동일
- 프로세스: launchd `~/Library/LaunchAgents/com.dstcraft.api.plist` (RunAtLoad + KeepAlive on Crashed)
  - 백업: `bun-api/infra/com.dstcraft.api.plist`
  - 로그: `~/dstcraft/logs/bun-api.{out,err}.log`
- nginx: `/usr/local/etc/nginx/servers/dstcraft.conf` 에 `location /api/` 프록시 (CF-IPCountry 등 헤더 명시 forward)
  - 백업: `bun-api/infra/nginx-dstcraft.conf`
- JWT_SECRET 새로 발급 + worker/bun 양쪽 동기화 (전체 사용자 1회 재로그인 — 데이터 영구 키는 Google sub라 무손실)
- 프론트엔드: `~/dstcraft/source/.env.local`의 `NEXT_PUBLIC_ANALYTICS_WORKER_URL=/api` 로 변경 (same-origin, CORS 우회)
  - prod/Vercel은 그대로 (Phase 6 컷오버까지 worker 사용)
- 검증: 외부 `curl https://beta.dstcraft.com/api/_debug/headers` → CF-IPCountry: KR 자동 주입 확인, `/api/top-countries`/`/api/rating` 실데이터 응답

---

# Phase 4 — Upstash Redis → SQLite 마이그레이션

> 목표: 외부 DB 의존 제거, Bun API의 데이터 레이어를 `bun:sqlite`로 교체.

## 결정사항 (2026-05-07 합의)
- **테이블 14개** (TODO 초안의 5개에선 부족 — 실제 25개 엔드포인트의 Redis 키 전부 포팅하면 14개): `users`, `admin_ips`, `favorites`, `skills_builds`, `feedback`, `supporters`, `kofi_transactions`, `config`, `analytics_counters`, `analytics_uv`, `analytics_visitors`, `analytics_duration_samples`, `analytics_clicks`, `analytics_combos`, `rating_ips`
- **DB 위치**: `~/dstcraft/data/app.db` (코드/데이터 분리, deploy 영향 없음)
- **전환 전략**: 베타만 즉시 SQLite. prod(Vercel+worker+Upstash)는 그대로 유지. Phase 6 컷오버 시 final-migrate 1회 더.
- **rate_limit**: in-memory Map + TTL (재시작 시 리셋되어도 무방)
- **HyperLogLog UV**: IP 추출 불가 → 마이그레이션 안 함. UV 카운트는 SQLite 전환 시점부터 새로 누적.

## 코드 산출물 (워크스테이션 작업, 2026-05-07)
- `bun-api/src/lib/schema.sql` — 14 테이블 + 인덱스 + rolling-window 트리거 (visitors 200, duration 1000)
- `bun-api/src/lib/db.ts` — `bun:sqlite` 싱글톤, WAL/PRAGMA, helper (`bumpCounter`/`getCounter`/`addUv`/`countUv`/`countUvExcludingCountry`). 음수 bump clamp 처리.
- `bun-api/src/lib/rate-limit.ts` — in-memory rate limiter
- `bun-api/src/routes/*.ts` (7개) — 모든 `redisPipeline` 호출 SQL prepared statement로 교체
- `bun-api/src/lib/redis.ts` — 삭제 (런타임 미사용)
- `bun-api/scripts/migrate-upstash.ts` — Upstash → SQLite 일회성 이전. 멱등(re-run safe), `--dry-run` 지원
- `bun-api/scripts/backup-db.sh` — `sqlite3 .backup` + gzip + 14일 보관 prune
- `bun-api/infra/com.dstcraft.backup.plist` — 매일 04:00 백업 launchd 정의

## 실행 절차 (Mac mini Claude 세션)

### 1. 사전 점검
```bash
cd ~/works/dst-craft
git pull
cd bun-api
bun install
bun run typecheck   # 통과 확인
sqlite3 --version   # 3.x 있어야 함 (macOS 기본 포함)
ls -la ~/dstcraft/data/  # 비어있어야 함 (마이그레이션 첫 실행)
```

### 2. 드라이런 (실제 INSERT 없음)
```bash
# 기존 bun-api launchd가 사용하는 .env 또는 plist EnvironmentVariables에서 변수 가져옴
launchctl print gui/$(id -u)/com.dstcraft.api | grep -E '(UPSTASH|JWT|GOOGLE)' >&2 || true

# 환경변수 export 후
export UPSTASH_REDIS_REST_URL=...
export UPSTASH_REDIS_REST_TOKEN=...
export JWT_SECRET=...        # 어떤 값이든 OK (db 부팅에만 필요)
export GOOGLE_CLIENT_ID=...
export DB_PATH=~/dstcraft/data/app.db

bun scripts/migrate-upstash.ts --dry-run
# → 각 테이블 카운트 출력. 큰 이상 없으면 다음 단계.
```

### 3. 실제 마이그레이션
```bash
bun scripts/migrate-upstash.ts
# → ~/dstcraft/data/app.db 생성 + 데이터 삽입
ls -lh ~/dstcraft/data/app.db
sqlite3 ~/dstcraft/data/app.db "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM favorites; SELECT COUNT(*) FROM feedback;"
```

### 4. bun-api 재시작 (이제 SQLite로 동작)
```bash
# repo 안 plist에 DB_PATH가 박혀있음 → ~/Library/LaunchAgents/ 와 동기화 후 재시작
cp ~/works/dst-craft/bun-api/infra/com.dstcraft.api.plist ~/Library/LaunchAgents/com.dstcraft.api.plist
# (.env 파일에 UPSTASH/JWT/GOOGLE 등 비밀값이 있다면 그대로 유지됨 — bun이 자동 로드)

launchctl kickstart -k gui/$(id -u)/com.dstcraft.api
sleep 2
tail ~/dstcraft/logs/bun-api.out.log
# "[bun-api] listening on :3001" 확인

# DB_PATH 적용 확인
launchctl print gui/$(id -u)/com.dstcraft.api | grep DB_PATH
```

### 5. 베타 검증
```bash
# 외부 도메인으로 (CF Tunnel 통과)
curl -s https://beta.dstcraft.com/api/rating
curl -s https://beta.dstcraft.com/api/top-countries
curl -s 'https://beta.dstcraft.com/api/stats?days=7' | head
curl -sX POST https://beta.dstcraft.com/api/track \
  -H 'Content-Type: application/json' \
  -d '{"ua":"Mozilla/5.0","isReturn":false}'
```

브라우저에서 `https://beta.dstcraft.com` → 즐겨찾기/스킬트리/피드백 동작 확인 (마이그레이션된 데이터로).

### 6. 백업 launchd 등록
```bash
mkdir -p ~/dstcraft/logs ~/Backups/dstcraft
cp ~/works/dst-craft/bun-api/infra/com.dstcraft.backup.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.dstcraft.backup.plist
launchctl print gui/$(id -u)/com.dstcraft.backup | head -20

# 즉시 1회 실행 테스트
launchctl start com.dstcraft.backup
sleep 2
ls -lh ~/Backups/dstcraft/
cat ~/dstcraft/logs/backup.out.log
```

### 7. Upstash 정리 시점
- 베타 수일 안정 동작 확인 후 (→ prod 컷오버 Phase 6 직전)
- prod도 컷오버 완료된 다음에야 Upstash 삭제
- 그 전까진 worker가 prod 트래픽으로 계속 사용 중

## 완료 기준
- [ ] `~/dstcraft/data/app.db` 존재 + 마이그레이션 stats 출력 정상
- [ ] bun-api SQLite 모드로 재시작 + 25 엔드포인트 응답 확인
- [ ] 베타 즐겨찾기/스킬트리 신규 추가 → SQLite에 row 추가 확인
- [ ] launchd backup 1회 정상 실행 + `~/Backups/dstcraft/app-*.db.gz` 생성
- [ ] 24h 후 안정성 (curl + sqlite3 .schema 확인)

---

# Phase 5 — GitHub self-hosted runner

> 목표: `git push main` → 자동 빌드 → 베타 갱신 (폴링 X, 푸시 즉시).

- GitHub repo Settings → Actions → Runners → New self-hosted runner (macOS)
- `./svc.sh install && ./svc.sh start` (백그라운드)
- `.github/workflows/deploy-beta.yml`: `runs-on: self-hosted` + build + symlink swap + bun-api 재시작
- 텔레그램 webhook으로 빌드 결과 알림 (이미 telegram 셋업되어 있음)

---

# Phase 6 — 메인 도메인 컷오버

> 목표: `dstcraft.com` 트래픽을 Mac mini로 전환. Vercel은 폴백.

- nginx에 `dstcraft.com` server block 활성화 + `/srv/dstcraft/prod` 채우기
- CF Tunnel에 `dstcraft.com` Public Hostname 추가
- Vercel 도메인 연결은 1개월 유지 (롤백 안전망)
- 트래픽 모니터, 24h 안정 확인
- **롤백**: CF Tunnel ingress에서 dstcraft.com 제거 → CF DNS가 Vercel로 자동 폴백 (5분 이내)

---

# Phase 7 — 운영 정비

- macOS 자동 업데이트/재시작 끄기 (`sudo softwareupdate --schedule off`)
- 자체 헬스체커: launchd 5분 주기로 `curl localhost:80` → 실패 시 텔레그램 알림
- Mac mini 자체 다운 감지 백업: 무료 UptimeRobot 1회선 (외부 5분 ping)
- nginx access log 로테이션 (`newsyslog.conf`)
- SQLite 일일 백업 (`~/Backups/dstcraft/`)
- 6개월 비교 측정 메트릭: LCP/TTFB, CF Cache Hit Ratio, 일일 origin 요청 수, 다운타임 비율, 운영 비용

---

## 다음 세션에서 시작할 위치

**Mac mini Claude 세션에서 Phase 4 §실행 절차 1~6** 단계 진행 (코드는 이미 push됨).
검증 완료되면 Phase 5 (self-hosted runner)로.

## 미결정 / 진행 중 결정 필요

- [x] GitHub repo URL → `git@github.com:fankimm/dst-craft.git` (SSH, 이미 키 등록됨)
- [x] Mac mini에 Claude Code 설치 여부 → 이미 설치되어 동작 중
- [x] nginx 경로 → `/usr/local` 확정 (Intel Mac, brew --prefix 결과)
- [x] 디렉터리 위치 → `~/dstcraft` (sudo 회피)
- [x] nginx 포트 → `8080` (sudo 회피, brew 기본)
- [x] CF Tunnel 설치 → `cloudflared service install` 로 launchd 등록 완료

## Phase 1 마무리 작업 (Phase 2 시작 전 끝낼 것)

- [ ] Worker CORS 패치 git commit + push (`worker/index.ts` 한 줄 추가)
- [ ] Google OAuth Authorized origins에 beta 추가 (Cloud Console 작업)
- [ ] beta.dstcraft.com 시크릿 모드 재검증: 로그인 + analytics 호출 200
- [ ] 24시간 후 안정성 확인 (curl -I 또는 수동)
