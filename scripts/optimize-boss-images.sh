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

# 축소는 ImageMagick Lanczos로 **먼저** 하고 cwebp에는 인코딩만 시킨다.
#
# 왜: cwebp 내장 `-resize`는 Hamming 창 필터라 **음의 로브가 없다.** 고주파를 깎기만 하고
# 엣지 예리도를 되살리지 못해 선화 윤곽선이 회색으로 뜬다. 실측(대표 6장)에서 320px 표시
# 엣지 손실 4.14pt 중 **리샘플러가 3.72pt(89%), 압축이 0.47pt(11%)** 였다 — 품질 파라미터를
# 아무리 올려도 안 잡히는 이유다. Lanczos의 음의 로브가 그 역할을 한다.
#
# 이 결함은 1x에서는 안 보이고 고DPI에서만 터진다 (엣지 보존율 80px 0.9955 vs 0.9957로 동일,
# **240px(3x) 0.9708 vs 0.9946**). 사용자가 "덜 선명하다"고 느낀 실체가 이것이다.
# 알파 채널은 더 극적이다 — RMSE 0.00725 → 0.00040 (14배). 컷아웃 스프라이트라 테두리에 직결.
#
# **`긴 변` 기준으로 캡한다.** 앱은 `size-20 object-contain`(80×80 정사각 박스)이라 긴 변이
# 80px에 매핑된다. 폭 기준으로 캡하면 세로로 긴 이미지가 불필요하게 커진다(320×582 등).
#
# 768px인 이유: 80 CSS px × DPR 3 = 240 device px면 충분하고 384px로도 device 픽셀 단위 렌더에서
# 원본과 구분되지 않았다. 그런데도 768px로 잡는 이유는 화질 논쟁을 끝내기 위해서다 —
# 표시 크기의 10배라 어떤 화면/확대에서도 부족할 수 없고, 34장 합계가 944KB에서
# 2,210KB로 늘 뿐이다. 원래 목적(홈 이미지 8,982KB 절감)에 견주면 무시할 수 있는 비용이다.
MAX_EDGE=768
QUALITY=88

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/public/images/bosses"
OUT_DIR="$SRC_DIR/thumb"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp가 없다. 설치: brew install webp" >&2
  exit 1
fi
if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick(magick)이 없다. 설치: brew install imagemagick" >&2
  echo "  (cwebp 내장 리샘플러는 선화 엣지를 뭉개므로 Lanczos 축소가 필수다 — 위 주석 참조)" >&2
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

  # 1) Lanczos로 긴 변 MAX_EDGE까지 축소 (`>`= 확대 금지). PNG32로 알파를 온전히 넘긴다.
  # 2) cwebp는 인코딩만. -sharp_yuv는 4:2:0 크로마 서브샘플링의 경계 열화를 줄이고,
  #    -m 6은 같은 품질에서 파일을 줄인다. -alpha_q 100 = 알파 무손실.
  tmp="$OUT_DIR/.tmp-$name.png"
  magick "$src" -filter Lanczos -resize "${MAX_EDGE}x${MAX_EDGE}>" -strip "PNG32:$tmp"
  cwebp -quiet -q "$QUALITY" -alpha_q 100 -sharp_yuv -m 6 "$tmp" -o "$out"
  rm -f "$tmp"

  converted=$((converted + 1))
  out_bytes=$((out_bytes + $(stat -f%z "$out")))
done

printf '보스 이미지 축소본: 변환 %d개 / 재사용 %d개 (긴 변 %dpx Lanczos, q%d +sharp_yuv)\n' \
  "$converted" "$skipped" "$MAX_EDGE" "$QUALITY"
printf '  원본 합계 %d KB  →  축소본 합계 %d KB  (%.0f배 감소)\n' \
  "$((src_bytes / 1024))" "$((out_bytes / 1024))" \
  "$(echo "$src_bytes $out_bytes" | awk '{printf "%.1f", $1/$2}')"
