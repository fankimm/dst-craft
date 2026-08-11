#!/usr/bin/env python3
"""WX-78 캐릭터 초상화에서 얼굴만 잘라 작은 아이콘을 만든다.

용도: 피드백 보드의 "Claude 답변" 라벨 아이콘 (16px로 렌더).
원본 초상화는 액자가 포함돼 있어 16px로 줄이면 어두운 덩어리로 뭉개진다.
얼굴 영역만 잘라내면 그 크기에서도 눈 2개 + 입이 식별된다.

사용:
    python3 scripts/make-wx78-face.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/characters/wx78.png"
OUT = ROOT / "public/images/ui/wx78-face.png"

# 원본(511x624) 기준 얼굴 영역. 머리 윤곽 위쪽부터 입 아래까지.
FACE_BOX = (180, 200, 335, 355)
# 저장 크기. 16px로 렌더하지만 고밀도 화면(3x)을 고려해 96px로 둔다.
OUT_SIZE = (96, 96)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"원본 이미지 없음: {SRC}")

    face = Image.open(SRC).convert("RGBA").crop(FACE_BOX).resize(OUT_SIZE, Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    face.save(OUT)
    print(f"생성: {OUT.relative_to(ROOT)} ({OUT_SIZE[0]}x{OUT_SIZE[1]})")


if __name__ == "__main__":
    main()
