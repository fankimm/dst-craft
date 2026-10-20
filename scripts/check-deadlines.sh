#!/usr/bin/env bash
# 놓치면 되돌릴 수 없는 마감일을 세션 시작 때마다 알린다.
#
# 왜: Ezoic Publisher Agreement가 1년 약정 + 자동 갱신이라, Ramp-up(기산일 2026-08-13 + 90일)
# 안에 해지 통보를 안 하면 그대로 1년이 묶인다. 통보는 Ramp-up 마지막 날까지 가능하고 통보일
# +30일에 효력이다 (계약서 §4, 2026-10-20 원문 확인). 2026-10-15는 §2 오독이었다 (#129).
# 2026-10-20 통보 제출 완료 → 계약 종료 2026-11-19. 이제 지키는 날짜는 "그 전에 전환 작업을
# 시작하지 않는다"는 쪽이다 (#131).
# 날짜는 요약이 아니라 계약서 조항 번호를 인용해 적는다 — docs/mistakes.md 참조. 판단 재료는 `todo.md`·`docs/`·대화 맥락에 흩어져 있어
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
done:2026-09-08|Ad Manager 주소확인 PIN 재발송 요청 가능 최초일|미발동 — 8/31에 우편이 먼저 도착해 재발송이 필요 없었다
done:2026-10-02|Ad Manager 주소확인 PIN 입력 마감|2026-08-31 인증 완료 (본인 인증·주소 확인 모두 '완료됨'). 32일 남기고 해소
done:2026-11-11|Ezoic 해지 통보 제출 마감 (Ramp-up 종료, 계약서 §4)|2026-10-20 대시보드 모달로 통보 제출 완료 — 22일 남기고 해소
done:2027-05-15|Ezoic 다음 해지 통보 기한 (Initial Term 갱신 90일 전)|해지 통보로 Initial Term에 들어가지 않아 해당 없음
2026-11-19|Ezoic 계약 종료 — 이날부터 AdSense 전환 작업(docs/ezoic-decision.md B절) 시작|그 전에는 §2 독점이 살아 있어 AdSense 광고 코드·ads.txt 교체·MCM 위임 해제를 하면 계약 위반. AdSense 사이트 검토 요청은 10/20 제출 완료, 승인 결과 확인만 남음 (승인 전이면 전환을 승인 뒤로 미룬다)
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
