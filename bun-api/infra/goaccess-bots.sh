#!/bin/bash
# 봇/크롤러 트래픽만 분리해 별도 GoAccess HTML 대시보드로 생성.
# launchd `com.dstcraft.goaccess-bots.plist`에서 주기적 호출.
#
# 출력: /Users/fankimm/dstcraft/bots.html (live.html과 같은 디렉터리 → 같은 SimpleHTTPServer가 서빙)
# GoAccess 내장 crawler UA 리스트 기준. 무료 검색엔진/AI 검색/SEO 분석 봇 모두 포함.

set -euo pipefail

LOG=/usr/local/var/log/nginx/access.log
OUT=/Users/fankimm/dstcraft/bots.html
TMP=$(mktemp -t bots.html.XXXXXX)

# --no-progress: 인터랙티브 진행률 출력 억제 (launchd 환경)
# --real-os: OS 정확도 향상
# 회전된 access.log.* 도 함께 분석하려면 인자 더 추가.
goaccess "$LOG" \
  --log-format=COMBINED \
  --crawlers-only \
  --real-os \
  --no-progress \
  -o "$TMP"

mv -f "$TMP" "$OUT"
