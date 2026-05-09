# Watchdog Secrets/Vars 설정

`watchdog.yml`이 사용하는 secrets/vars 일람. GitHub UI 또는 `gh` CLI로 설정.

## Telegram 알림 (즉시 활성화 권장 — 5/7 사고 때 미설정으로 알림 안 갔음)

```bash
# Bot 생성: @BotFather에서 /newbot → token 받기
# Chat ID 확인: bot에 메시지 보낸 뒤 https://api.telegram.org/bot<TOKEN>/getUpdates 에서 chat.id

gh secret set TELEGRAM_BOT_TOKEN --body "<bot-token>"
gh secret set TELEGRAM_CHAT_ID --body "<chat-id>"
```

설정 후 watchdog 워크플로우의 "Telegram alert" 스텝이 2/3 실패부터 알림 발송. 미설정이면 `no telegram secrets, skipping alert`로 silent skip.

## 자동 복구 (선택 — Tailscale + SSH 인프라 필요)

bun-api hang 시 watchdog이 SSH로 `launchctl kickstart`. 활성화 조건이 모두 갖춰져야 함:

### 1) Tailscale ephemeral auth key
- Tailscale 어드민 콘솔 → Settings → Keys → "Generate auth key" (Ephemeral, Reusable, Tags 적용)
- workflow가 임시로 GH Actions runner를 Tailscale 네트워크에 join하는 데 사용
```bash
gh secret set TS_AUTHKEY --body "tskey-auth-..."
```

### 2) SSH 키 페어 (워치독 전용)
```bash
# 로컬에서 키 생성 (passphrase 없이)
ssh-keygen -t ed25519 -N "" -f /tmp/watchdog_key -C "watchdog@github-actions"

# Mac mini ~/.ssh/authorized_keys에 공개키 등록
ssh-copy-id -i /tmp/watchdog_key.pub fankimm@100.85.118.4

# private key를 GH secret으로
gh secret set SSH_PRIVATE_KEY < /tmp/watchdog_key

# 로컬 키 파일 삭제
rm /tmp/watchdog_key /tmp/watchdog_key.pub
```

### 3) Vars (비밀 아님)
```bash
gh variable set WATCHDOG_AUTORECOVER --body "1"
gh variable set WATCHDOG_MACMINI_HOST --body "100.85.118.4"  # Tailscale IP
gh variable set WATCHDOG_MACMINI_USER --body "fankimm"
```

## Phase 6 DNS failover (이미 설정됨, 참조)
```bash
# secrets
gh secret set CF_API_TOKEN --body "..."
gh secret set CF_ZONE_ID --body "..."

# vars
gh variable set WATCHDOG_FAILOVER --body "1"
gh variable set WATCHDOG_VERCEL_CNAME --body "cname.vercel-dns.com"
```

## 동작 우선순위 (3/3 실패 시)
1. Telegram alert (degraded: 2/3, down: 3/3)
2. Auto-recover (Tailscale + SSH + launchctl) — `WATCHDOG_AUTORECOVER=1`이면 시도
3. DNS failover (Vercel로 rollback) — `WATCHDOG_FAILOVER=1`이면 시도

자동 복구가 성공하면 DNS failover는 수동 처리(워치독 후속 실행에서 정상이면 트리거 안 됨).
