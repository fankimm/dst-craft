#!/usr/bin/env bash
# 보스 이미지 UI용 축소본(WebP) 생성 — public/images/bosses/*.png → public/images/bosses/thumb/*.webp
#
# 왜: 앱에서 보스 이미지는 최대 80px(`size-20`)로 그려지는데 원본은 2108×2492 / 3.5MB짜리가
# 섞여 있었다. 프로덕션 홈 실측에서 **이미지 10,249KB 중 9장의 보스 PNG가 8,982KB(88%)** 였다.
# Ezoic이 `window load` 이후에야 광고 파이프라인을 시작하므로(인과 확정, docs/ezoic-decision.md)
# 페이지가 무거우면 그만큼 광고가 늦고, Fast3G 홈에서는 load가 30초 내에 발화하지 않아
# **광고가 아예 0회** 뜬다 (#88).
#
# 원본을 덮어쓰지 않는 이유: 같은 파일이 OG/schema.org 이미지로도 쓰인다
# (`src/components/seo/BossPageContent.tsx`). 소셜 카드·리치 결과는 큰 이미지를 원하므로
# **UI용과 크롤러용을 분리**한다. 원본은 그대로 두고 축소본만 새로 만든다.
#
# 사용법:
#   bash scripts/optimize-boss-images.sh            # 없거나 원본이 더 새로운 것만 변환
#   bash scripts/optimize-boss-images.sh --force    # 전부 다시 변환 (설정 바꿨을 때)
#
# 이미지를 추가·교체한 뒤 이 스크립트를 다시 돌릴 것. 안 돌리면 축소본이 없어
# `bossThumb()`가 원본으로 폴백하므로 화면은 깨지지 않지만 무게 이득이 사라진다.

set -euo pipefail

# 표시 최대 크기가 80px(`size-20`)이므로 4배 여유. 파일이 20~40KB대라 더 아낄 이유가 없다.
MAX_WIDTH=320
QUALITY=90

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/public/images/bosses"
OUT_DIR="$SRC_DIR/thumb"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp가 없다. 설치: brew install webp" >&2
  exit 1
fi

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

mkdir -p "$OUT_DIR"

converted=0
skipped=0
src_bytes=0
out_bytes=0

for src in "$SRC_DIR"/*.png; do
  [ -e "$src" ] || continue
  name="$(basename "$src" .png)"
  out="$OUT_DIR/$name.webp"

  src_bytes=$((src_bytes + $(stat -f%z "$src")))

  if [ "$FORCE" -eq 0 ] && [ -f "$out" ] && [ "$out" -nt "$src" ]; then
    skipped=$((skipped + 1))
    out_bytes=$((out_bytes + $(stat -f%z "$out")))
    continue
  fi

  # -alpha_q 100: 게임 에셋이라 알파 채널 손실은 테두리에 바로 보인다. 알파는 무손실로 둔다.
  # -resize <w> 0: 세로는 비율 유지. 원본이 MAX_WIDTH보다 작으면 cwebp가 확대하므로 건너뛴다.
  width="$(sips -g pixelWidth "$src" | awk '/pixelWidth/{print $2}')"
  if [ "$width" -le "$MAX_WIDTH" ]; then
    cwebp -quiet -q "$QUALITY" -alpha_q 100 "$src" -o "$out"
  else
    cwebp -quiet -q "$QUALITY" -resize "$MAX_WIDTH" 0 -alpha_q 100 "$src" -o "$out"
  fi

  converted=$((converted + 1))
  out_bytes=$((out_bytes + $(stat -f%z "$out")))
done

printf '보스 이미지 축소본: 변환 %d개 / 재사용 %d개 (%dpx, q%d)\n' \
  "$converted" "$skipped" "$MAX_WIDTH" "$QUALITY"
printf '  원본 합계 %d KB  →  축소본 합계 %d KB  (%.0f배 감소)\n' \
  "$((src_bytes / 1024))" "$((out_bytes / 1024))" \
  "$(echo "$src_bytes $out_bytes" | awk '{printf "%.1f", $1/$2}')"
