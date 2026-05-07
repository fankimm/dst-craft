# TODO — Vercel → Mac mini 셀프호스팅 이주

> 결정일: 2026-05-07
> 작성: 메인 세션에서 합의된 결정사항을 Mac mini SSH 세션에서 이어받기 위한 계획서
> 우선순위: **Phase 1 먼저** (prod 라인은 Vercel 그대로 두고 `beta.dstcraft.com`만 Mac mini로 띄움)

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

```bash
sudo mkdir -p /srv/dstcraft/{prod,beta,data,api,releases}
sudo chown -R $(whoami):staff /srv/dstcraft
ls -la /srv/dstcraft
```

- `prod/`, `beta/`: 정적 사이트 출력 (Phase 1에선 beta만 채움)
- `data/`: SQLite (Phase 4)
- `api/`: Bun API 소스 (Phase 3)
- `releases/`: 타임스탬프별 빌드 보관소(원자적 스왑용)

## 1.4 첫 빌드 + 배포 (수동)

```bash
cd ~/work  # 또는 적당한 작업 디렉터리
git clone https://github.com/<user>/dst-craft.git
cd dst-craft
npm ci
npm run build
# Next.js export 결과는 ./out

# 타임스탬프 폴더에 쌓고 심볼릭 링크 교체 (다운타임 0)
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p /srv/dstcraft/releases/$TS
cp -R out/. /srv/dstcraft/releases/$TS/
ln -sfn /srv/dstcraft/releases/$TS /srv/dstcraft/beta
ls -la /srv/dstcraft/beta
```

## 1.5 nginx 설정

```bash
# 위치는 brew --prefix 기반
NGINX_CONF_DIR=$(brew --prefix)/etc/nginx
sudo mkdir -p $NGINX_CONF_DIR/servers
```

`$NGINX_CONF_DIR/servers/dstcraft.conf` 작성 (sudo 필요):

```nginx
# beta
server {
  listen 80;
  server_name beta.dstcraft.com;
  root /srv/dstcraft/beta;
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
#   listen 80;
#   server_name dstcraft.com;
#   root /srv/dstcraft/prod;
#   ...
# }
```

```bash
brew services start nginx
nginx -t  # syntax check
sudo nginx -s reload
curl -H "Host: beta.dstcraft.com" http://localhost/  # HTML 응답 확인
```

## 1.6 Cloudflare Tunnel 생성

CF Zero Trust 대시보드 (one.dash.cloudflare.com → Networks → Tunnels):

1. **Create a tunnel** → 이름 `dstcraft-tunnel` → cloudflared 선택
2. macOS 설치 명령 복사 (긴 토큰 포함)
3. Mac mini에서 실행:
   ```bash
   sudo cloudflared service install <긴_토큰>
   sudo launchctl list | grep cloudflared  # 서비스 등록 확인
   ```
4. 대시보드 **Public Hostname** 탭:
   - Subdomain: `beta`
   - Domain: `dstcraft.com`
   - Service: `HTTP` `localhost:80`
5. CF DNS에 `beta` CNAME이 자동 생성됨 (proxied=ON 확인)

## 1.7 접속 검증

```bash
# 로컬에서 (Mac mini 외부)
curl -I https://beta.dstcraft.com
# HTTP/2 200, server: cloudflare 확인
```

브라우저에서 `https://beta.dstcraft.com` 직접 열어보고:
- [ ] 메인 페이지 렌더링
- [ ] 카테고리/아이템 페이지 라우팅
- [ ] 검색
- [ ] analytics 호출 (DevTools → Network → `/track`이 기존 CF Worker 도메인으로 정상 200)
- [ ] og-image, sitemap.xml, robots.txt 200

## 1.8 Phase 1 완료 기준

- [ ] `https://beta.dstcraft.com` Vercel prod와 시각적으로 동일
- [ ] 핵심 기능 (요리솥, 스킬트리, 검색, 즐겨찾기) 베타에서 동작
- [ ] CF Analytics에 베타 도메인 트래픽 잡힘
- [ ] 24시간 무다운 (간단 모니터링: `curl -I` cron 또는 수동 확인)

---

# Phase 2 — 정적 빌드 자동 배포 (단순 버전)

> 목표: 로컬에서 푸시하지 않고 Mac mini에서 한 줄로 베타 갱신.
> CI는 Phase 5에서 도입. Phase 2는 수동 + 스크립트 단순화.

- `~/bin/dstcraft-deploy-beta.sh` 작성: `git pull && npm ci && npm run build && releases/<ts> 에 복사 + symlink 교체`
- 오래된 releases 정리 (최근 5개만 유지)
- 빌드 실패 시 symlink 교체 안 함 (롤백 안전)

---

# Phase 3 — Worker → Bun API 이식

> 목표: 기존 `worker/index.ts` (1222줄, 25개 엔드포인트)를 Mac mini의 Bun 서버로 이식.

- Bun + Hono로 포팅 (CF Worker API와 거의 동형)
- 25개 엔드포인트: analytics(track/event/popular/combo/rate/top-countries/rating/stats) + auth(google) + skills + favorites + feedback + ko-fi-webhook + supporters + config
- 데이터 액세스는 임시로 Upstash 그대로 사용 (Phase 4에서 SQLite로 교체)
- launchd plist로 자동 시작 + 재시작
- nginx에 `/api/*` → `127.0.0.1:3001` 프록시 추가
- 프론트엔드 `NEXT_PUBLIC_ANALYTICS_WORKER_URL` → `/api`로 변경 (same-origin)

---

# Phase 4 — Upstash Redis → SQLite 마이그레이션

> 목표: 외부 DB 의존 제거, Bun API의 데이터 레이어를 `bun:sqlite`로 교체.

- 5개 테이블 스키마 설계: `favorites`, `feedback`, `supporters`, `skills_builds`, `analytics_counters`
  - rate_limit는 in-memory Map + TTL (DB 안 씀)
- 일회성 마이그레이션 스크립트: Upstash 키 스캔 → SQL 테이블 변환
- WAL 모드 (`PRAGMA journal_mode=WAL`)
- 일일 백업: `sqlite3 .backup`을 launchd로 cron 대체
- 베타에서 데이터 검증 후 Upstash 정리

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

위 **"실행 환경 — 어디서 무엇을 도는가"** 섹션의 작업 흐름 1→2→3 그대로. Mac mini Claude 세션 진입 후 §1.1부터.

## 미결정 / 진행 중 결정 필요

- [ ] Mac mini Tailscale hostname (본 머신 터미널에서 ssh 진입 시 사용)
- [ ] GitHub repo URL (Mac mini에서 clone 시 사용)
- [ ] Mac mini에 Claude Code 설치 여부 — 미설치면 먼저 설치
- [ ] §1.5 nginx 경로 — Intel Mac은 `/usr/local/...`, Apple Silicon은 `/opt/homebrew/...`. 이 Mac mini는 Intel i7이라 `/usr/local`로 추정되지만 §1.1의 `brew --prefix`로 확정.
