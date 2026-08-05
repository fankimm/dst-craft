# dstcraft-watchdog

prod `/api` 헬스 감시용 Cloudflare Worker. **1분마다** `https://www.dstcraft.com/api/_debug/health`를 3회 찔러 상태를 판정하고, 상태가 바뀔 때만 텔레그램으로 알린다.

## 왜 Worker인가 (#64)

감시는 원래 `.github/workflows/watchdog.yml`이 `cron: */5`로 하고 있었다. 그런데 GitHub이 예약 실행을 대부분 드랍해서 **실측 간격이 1~3시간**이었다 (2026-07-26~28 기준). 감시 로직은 멀쩡했고 실행 환경이 문제였으므로, Cron Trigger가 예약대로 도는 CF Worker로 감지를 옮겼다.

역할 분담:

| | 감지 주기 | 알림 | 복구 |
|---|---|---|---|
| **CF Worker** (여기) | 1분, 정확 | 2/3·3/3 실패, 복구 | ✗ (SSH 불가) |
| **GitHub Actions** (`watchdog.yml`) | */5 예약이나 실제론 드문드문 (백업) | 3/3 실패만 | ✓ DNS failover, SSH kickstart |

Worker가 3/3 실패를 확인하면 `workflow_dispatch`로 GitHub Actions를 눌러 복구를 맡긴다.

## 판정과 알림 규칙

3회 시도(각 5초 타임아웃, 2초 간격)의 실패 수로 판정한다.

- `0~1` → **ok** (1회 실패는 transient noise로 무시)
- `2` → **degraded**
- `3` → **down**

알림은 **상태가 바뀔 때만** 보낸다. 직전 상태를 KV에 저장해두기 때문에 장애가 이어져도 매분 텔레그램이 오지 않는다.

- ok → degraded : ⚠️ 경고 1회
- ok/degraded → down : 🔥 긴급 1회 + GitHub 복구 워크플로우 트리거 (구간당 1회)
- down → ok : ✅ 복구 알림 (중단 시간 포함)
- degraded → ok : 알림 없음 (경미한 지연까지 알리면 시끄러움)
- down 지속 : 30분마다 재알림
- degraded 지속 : 10분 넘어가면 1회만 추가 알림

## 배포

KV 네임스페이스(`54ff92b6...`)와 텔레그램 시크릿은 2026-08-05에 등록 완료. 평소 배포는 이것뿐이다:

```bash
cd watchdog && npx wrangler deploy
```

**시크릿을 새로 넣었다면 배포 후 `npx wrangler triggers deploy`도 실행할 것** — 아래 트러블슈팅 참고.

### 처음부터 다시 세팅해야 할 때

```bash
cd watchdog
npm install
npx wrangler login                                  # 브라우저 인증
npx wrangler kv namespace create WATCHDOG_STATE     # 출력된 id를 wrangler.toml에 반영
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler deploy
npx wrangler triggers deploy
```

텔레그램 봇은 `@fk_dst_dev_bot`. 토큰/chat_id는 Mac mini의 `~/works/dst-craft/bun-api/.env`에도 같은 값이 있다 (bun-api 피드백 알림이 같은 봇을 쓴다). GitHub secrets에도 등록돼 있지만 그쪽은 값을 다시 읽을 수 없다.

### GH_TOKEN (선택)

```bash
npx wrangler secret put GH_TOKEN
```

`actions: write` 권한의 fine-grained PAT. `fankimm/dst-craft` 하나만 대상으로 발급하면 된다. **없어도 감지·알림은 정상 동작하고 복구 트리거만 건너뛴다.**

## 확인

```bash
# 현재 판정 상태
curl https://dstcraft-watchdog.fankimm.workers.dev/status

# 판정 로직 강제 실행 (크론과 무관하게 즉시 1회). 알림 규칙도 그대로 적용됨
curl https://dstcraft-watchdog.fankimm.workers.dev/run

# 실시간 로그
npx wrangler tail

# 로컬에서 cron 핸들러 강제 실행
npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled"
```

### 크론이 안 도는 것 같을 때

`/run`은 되는데 `/status`가 몇 분째 그대로면 cron trigger가 빠진 것이다. 실제로 **시크릿을 추가해 워커 버전이 새로 생긴 뒤 크론이 멈춘 사례**가 있었다 (2026-08-05, 최초 구축 시). 이때는 트리거만 다시 붙이면 된다:

```bash
npx wrangler triggers deploy
```

확인법: `HEALTH_URL`을 없는 주소로 잠깐 배포하고 1~2분 뒤 `/status`가 `down`으로 바뀌는지 본다. 안 바뀌면 크론이 죽은 것.

```bash
npx wrangler deploy --var HEALTH_URL:https://www.dstcraft.com/api/_debug/nope   # 가짜 장애
npx wrangler deploy                                                              # 원복
```

## 비용

무료 플랜 안에서 돈다. 하루 1440회 실행, KV 읽기 1440회 (무료 한도 10만/일).

KV **쓰기**는 무료 한도가 하루 1000회라 매분 쓰면 넘긴다. 그래서 평시(ok 유지)에는 저장할 내용이 직전과 같으므로 아예 쓰지 않는다. 쓰기가 발생하는 건 상태가 바뀌거나 알림을 보낸 순간뿐이라 하루 수 회 수준이다.
