#!/bin/bash
# 봇/크롤러 트래픽만 분리해 별도 GoAccess HTML 대시보드로 생성.
# launchd `com.dstcraft.goaccess-bots.plist`에서 주기적 호출.
#
# 출력: /Users/fankimm/dstcraft/bots.html (live.html과 같은 디렉터리 → 같은 SimpleHTTPServer가 서빙)
# GoAccess 내장 crawler UA 리스트 기준. 무료 검색엔진/AI 검색/SEO 분석 봇 모두 포함.

set -euo pipefail

# strptime의 %b(약어 월명)가 ko_KR 로캘에서 영문 월명(May 등)을 거부 → C 로캘 강제.
# 셸/launchd 환경에 LANG이 무엇이 들어있어도 안전.
export LC_ALL=C

LOG=/usr/local/var/log/nginx/access.log
OUT=/Users/fankimm/dstcraft/bots.html
# GoAccess는 -o 인자 파일명의 마지막 점 뒤를 확장자로 인식해 .csv/.json/.html만 허용.
# mktemp의 .XXXXXX suffix를 그대로 두면 거부되므로 같은 디렉터리에 .new.html로 쓰고 atomic mv.
TMP="${OUT}.new.html"

# --no-progress: 인터랙티브 진행률 출력 억제 (launchd 환경)
# --real-os: OS 정확도 향상
# 회전된 access.log.* 도 함께 분석하려면 인자 더 추가.
# nginx access.log는 COMBINED 변형이라 date/time 포맷을 명시해야 함.
# 기존 live.html GoAccess 프로세스와 동일한 플래그 (생략하면 "Token doesn't match specifier '%d'" 에러).
goaccess "$LOG" \
  --log-format=COMBINED \
  --date-format=%d/%b/%Y \
  --time-format=%H:%M:%S \
  --crawlers-only \
  --real-os \
  --no-progress \
  -o "$TMP"

mv -f "$TMP" "$OUT"
