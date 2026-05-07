#!/usr/bin/env bash
# GitHub self-hosted runner 설치 (Mac mini, Intel/x64)
#
# 사전 단계 (사용자가 직접):
#   1. https://github.com/fankimm/dst-craft/settings/actions/runners → "New self-hosted runner"
#   2. macOS → x64 선택
#   3. "Configure" 섹션의 ./config.sh 명령에서 --token 뒤 값(A...로 시작) 복사
#
# 실행:
#   ~/works/dst-craft/scripts/setup-runner.sh <REGISTRATION_TOKEN>
#
# 동작:
#   - ~/actions-runner 에 runner 다운로드
#   - config.sh --unattended 로 등록 (라벨: self-hosted,macOS)
#   - svc.sh install + start 로 launchd agent 등록
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <REGISTRATION_TOKEN>" >&2
  exit 2
fi

TOKEN="$1"
REPO_URL="https://github.com/fankimm/dst-craft"
RUNNER_DIR="$HOME/actions-runner"
RUNNER_VERSION="2.334.0"          # 갱신 필요 시 https://github.com/actions/runner/releases 확인
RUNNER_OS="osx"
RUNNER_ARCH="x64"
RUNNER_TARBALL="actions-runner-${RUNNER_OS}-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz"
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_TARBALL}"

log()  { printf "\033[1;34m[setup-runner]\033[0m %s\n" "$*"; }
err()  { printf "\033[1;31m[setup-runner ERROR]\033[0m %s\n" "$*" >&2; }

if [ -d "$RUNNER_DIR" ] && [ -f "$RUNNER_DIR/.runner" ]; then
  err "$RUNNER_DIR 이미 등록되어 있음. 재등록하려면 먼저 cd $RUNNER_DIR && ./svc.sh uninstall && ./config.sh remove"
  exit 1
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [ ! -f "$RUNNER_TARBALL" ]; then
  log "다운로드 중: $RUNNER_URL"
  curl -fsSL -o "$RUNNER_TARBALL" "$RUNNER_URL"
fi

log "압축 해제..."
tar xzf "$RUNNER_TARBALL"

log "config.sh 실행 (unattended)..."
./config.sh \
  --url "$REPO_URL" \
  --token "$TOKEN" \
  --name "mac-mini" \
  --labels "self-hosted,macOS" \
  --work "_work" \
  --unattended \
  --replace

log "svc.sh install (launchd 등록)..."
./svc.sh install

log "svc.sh start..."
./svc.sh start

sleep 2
./svc.sh status || true

cat <<EOF

✅ 러너 설치 완료.
   - 디렉터리: $RUNNER_DIR
   - 라벨: self-hosted, macOS
   - 자동 시작: launchd ($(launchctl list 2>/dev/null | grep actions || echo '확인 필요'))

다음 작업:
1. https://github.com/fankimm/dst-craft/settings/actions/runners 에서 'mac-mini' 가 'Idle' 표시되는지 확인
2. (선택) Telegram 알림: Settings → Secrets → Actions 에 TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID 등록
3. 테스트: Actions 탭 → 'deploy-beta (Mac mini)' → 'Run workflow' (workflow_dispatch)
   또는 main에 작은 푸시
EOF
