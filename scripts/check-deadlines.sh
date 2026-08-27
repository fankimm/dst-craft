#!/usr/bin/env bash
# 놓치면 되돌릴 수 없는 마감일을 세션 시작 때마다 알린다.
#
# 왜: Ezoic Publisher Agreement가 1년 약정 + 자동 갱신이라, Ramp-up 안에 30일 전 통보를
# 안 하면 그대로 1년이 묶인다. 판단 재료는 `todo.md`·`docs/`·대화 맥락에 흩어져 있어
# **세션이 바뀌면 통째로 유실**된다. 사람도 Claude도 잊는다는 전제로 설계한다 (#87).
#
# 진입점:
#   - SessionStart hook (`.claude/settings.json`) — 모든 세션이 자동으로 본다
#   - 수동: `bash scripts/check-deadlines.sh` (`--all` 로 아직 멀었어도 전부 표시)
#
# 동작:
#   - 아래 DEADLINES 표를 읽어 남은 일수를 계산
#   - D-30 이내면 경고, 경과했으면 **놓침**으로 눈에 띄게 구분해 출력
#   - 해당 없으면 아무것도 출력하지 않는다 (세션 시작 소음 방지)
#
# 마감일이 끝나면 그 줄을 지우지 말고 `done:` 접두어를 붙여 남긴다 — 왜 그 날짜가
# 있었는지가 다음 사람에게 맥락이 된다.

set -eu

# 형식: YYYY-MM-DD|한 줄 설명|놓쳤을 때 무슨 일이 나는가
# `done:` 으로 시작하는 줄은 처리 완료 — 계산에서 제외한다.
DEADLINES=$(
  cat <<'EOF'
2026-09-08|Ad Manager 주소확인 PIN 재발송 요청 가능 최초일|우편 미도착 시 이 날 바로 재요청해야 10/2 마감 전 2차 시도가 들어간다
2026-10-02|Ad Manager 주소확인 PIN 입력 마감|미인증 시 광고 게재 중단 → EPMV 데이터가 끊겨 10/15 판단 자체가 불가능해진다
2026-10-15|Ezoic 계속 여부 통보 기한 (docs/ezoic-decision.md)|넘기면 1년 자동 확정. 해지하려면 이 날까지 서면 통보해야 한다
2026-11-11|Ezoic Ramp-up 만료|이 시점에 계약이 1년으로 굳는다
EOF
)

SHOW_ALL=0
[ "${1:-}" = "--all" ] && SHOW_ALL=1

# GNU date가 없는 macOS 기본 환경을 전제로 한다 (BSD date).
today_epoch=$(date -j -f "%Y-%m-%d" "$(date +%Y-%m-%d)" "+%s" 2>/dev/null || date -d "$(date +%Y-%m-%d)" "+%s")

to_epoch() {
  date -j -f "%Y-%m-%d" "$1" "+%s" 2>/dev/null || date -d "$1" "+%s"
}

lines=""
while IFS='|' read -r day label consequence; do
  [ -z "${day:-}" ] && continue
  case "$day" in done:*) continue ;; esac

  day_epoch=$(to_epoch "$day") || continue
  days=$(( (day_epoch - today_epoch) / 86400 ))

  if [ "$days" -lt 0 ]; then
    lines="${lines}  ❗️ 경과 $(( -days ))일 — ${day} ${label}
       → ${consequence}
"
  elif [ "$days" -eq 0 ]; then
    lines="${lines}  🔴 오늘! — ${day} ${label}
       → ${consequence}
"
  elif [ "$days" -le 30 ] || [ "$SHOW_ALL" -eq 1 ]; then
    lines="${lines}  ⏳ D-${days} — ${day} ${label}
       → ${consequence}
"
  fi
done <<EOF
$DEADLINES
EOF

# 알릴 게 없으면 조용히 끝낸다. 매 세션 출력되는 훅이라 소음이 곧 무시로 이어진다.
[ -z "$lines" ] && exit 0

printf '[마감 알림] 놓치면 되돌릴 수 없는 항목 — 자세한 판단 기준은 docs/ezoic-decision.md\n%s' "$lines"
