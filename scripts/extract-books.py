#!/usr/bin/env python3
"""
Extract book reading sanity from DST scripts → src/data/book-sanity.ts  (#143)

코드 경로 (components/reader.lua, components/book.lua):
  - Reader:Read — aspiring_bookworm(워트)이면 OnPeruse, 아니면 OnRead
  - OnPeruse   — sanity:DoDelta(peruse_sanity)
  - OnRead     — sanity:DoDelta(read_sanity * reader:GetSanityPenaltyMultiplier())
  - 배율은 맥스웰만 MAXWELL_READING_SANITY_MULT, 위커바텀은 기본 1

assert가 패치 감지기다. 실패하면 데이터를 고치지 말고 위 경로가 바뀌었는지 소스부터 볼 것.

Usage: python3 scripts/extract-books.py  (평소엔 bash scripts/sync-game-data.sh 가 호출)
Output: src/data/book-sanity.ts
"""

import os
import re
from pathlib import Path

_default = Path("/tmp/dst-extract") if Path("/tmp/dst-extract/scripts").exists() else Path.home() / "dst-game-snapshot"
SCRIPTS = Path(os.environ.get("DST_SNAPSHOT", _default)) / "scripts"
OUT = Path(__file__).resolve().parent.parent / "src/data/book-sanity.ts"


def read(rel: str) -> str:
    return (SCRIPTS / rel).read_text(encoding="utf-8")


def tuning_number(tuning: str, name: str) -> float:
    m = re.search(rf"^\s*{name}\s*=\s*([\d.]+)\s*,", tuning, re.M)
    assert m, f"TUNING.{name} not found"
    return float(m.group(1))


def fmt(n: float) -> str:
    return str(int(n)) if float(n).is_integer() else str(n)


def main() -> None:
    tuning = read("tuning.lua")
    books_src = read("prefabs/books.lua")
    book_comp = read("components/book.lua")
    reader_comp = read("components/reader.lua")

    # 코드 경로 고정
    assert "DoDelta( (self.read_sanity or 0) * reader.components.reader:GetSanityPenaltyMultiplier() )" in book_comp
    assert "DoDelta(self.peruse_sanity or 0)" in book_comp
    assert re.search(r"if self\.aspiring_bookworm then\s+return book\.components\.book:OnPeruse", reader_comp)

    # 책을 읽는 캐릭터 고정: 새 캐릭터가 생기면 여기서 멈춰 화면을 같이 고친다
    readers = sorted(
        p.stem for p in (SCRIPTS / "prefabs").glob("*.lua") if 'AddComponent("reader")' in p.read_text(encoding="utf-8", errors="ignore")
    )
    assert readers == ["waxwell", "wickerbottom", "wurt"], readers
    assert "SetSanityPenaltyMultiplier(TUNING.MAXWELL_READING_SANITY_MULT)" in read("prefabs/waxwell.lua")
    assert "SetAspiringBookworm(true)" in read("prefabs/wurt.lua")
    assert "SetSanityPenaltyMultiplier" not in read("prefabs/wickerbottom.lua")
    assert "SetAspiringBookworm" not in read("prefabs/wickerbottom.lua")

    constants = {name: tuning_number(tuning, name) for name in ("SANITY_LARGE", "SANITY_HUGE")}
    maxwell_mult = tuning_number(tuning, "MAXWELL_READING_SANITY_MULT")

    entries = re.split(r'\n\s+name = "(book_[a-z_]+)",', books_src)[1:]
    assert len(entries) % 2 == 0 and entries, "book_defs parse failed"

    def value(block: str, field: str, book: str) -> float:
        m = re.search(rf"{field} = (-?)TUNING\.(\w+),", block)
        assert m and m.group(2) in constants, f"{book}.{field} is not a known constant"
        return -constants[m.group(2)] if m.group(1) else constants[m.group(2)]

    lines = []
    for book, block in zip(entries[0::2], entries[1::2]):
        read_v = value(block, "read_sanity", book)
        peruse_v = value(block, "peruse_sanity", book)
        lines.append(f"  {book}: {{ read: {fmt(read_v)}, peruse: {fmt(peruse_v)} }},")
    assert len(lines) >= 18, f"only {len(lines)} books parsed"

    OUT.write_text(
        "// 자동 생성 — scripts/extract-books.py. 수동 편집 금지 (#143)\n"
        "\n"
        "/** read: 위커바텀·맥스웰 읽기 기본값(맥스웰은 배율 적용) / peruse: 워트 */\n"
        "export const bookSanity: Record<string, { read: number; peruse: number }> = {\n"
        + "\n".join(lines)
        + "\n};\n\n"
        + f"export const MAXWELL_READING_SANITY_MULT = {fmt(maxwell_mult)};\n",
        encoding="utf-8",
    )
    print(f"  {len(lines)} books → {OUT}")


if __name__ == "__main__":
    main()
