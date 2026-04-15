#!/usr/bin/env python3
"""Extract specific UI icons from skilltree.tex atlas.

Targets:
  - tab_skills_unselected.tex → public/images/ui/skill_eye.png  (eye icon used as Skills tab)
  - locked.tex                → public/images/ui/skill_lock.png

Usage:
  python3 scripts/extract_skill_ui_icons.py
"""
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

# Re-use the decoder from extract_skill_icons.py
sys.path.insert(0, str(Path(__file__).parent))
from extract_skill_icons import read_ktex  # noqa: E402

TEX_FILE = "/tmp/dst-icons/images/skilltree.tex"
XML_FILE = "/tmp/dst-icons/images/skilltree.xml"
OUT_DIR = Path("public/images/ui")

# Targets — atlas element name → output filename
TARGETS = {
    "skill_icon.tex":     "skill_eye.png",         # eye icon (active, used for skill points display)
    "skill_icon_bw.tex":  "skill_eye_locked.png",  # locked/grayscale variant
    "locked.tex":         "skill_lock.png",        # 44x44 lock icon
    "locked_skill.tex":   "skill_lock_large.png",  # 67x67 lock icon
    "frame.tex":          "skill_frame.png",       # decorative frame
}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    tree = ET.parse(XML_FILE)
    elements = {el.get("name"): el for el in tree.findall(".//Element")}

    print(f"Atlas has {len(elements)} elements")
    print("Decoding skilltree.tex...")
    full_img = read_ktex(TEX_FILE)
    W, H = full_img.size
    print(f"  size: {W}x{H}")

    for name, out_name in TARGETS.items():
        el = elements.get(name)
        if el is None:
            print(f"  NOT FOUND: {name}")
            continue
        u1 = float(el.get("u1"))
        u2 = float(el.get("u2"))
        v1 = float(el.get("v1"))
        v2 = float(el.get("v2"))

        # UV coords: u is horizontal (0=left, 1=right), v is vertical
        # Klei TEX is stored top-down but UVs are GL-style (v=0 at bottom).
        # Verify by checking which orientation produces the right crop.
        # Try GL convention first (flip y).
        x1 = int(u1 * W)
        x2 = int(u2 * W)
        y1 = int(v1 * H)
        y2 = int(v2 * H)
        crop = full_img.crop((x1, y1, x2, y2))
        # skilltree.tex elements appear vertically flipped vs. the source art —
        # rotate 180° so the eye and lock icons display upright.
        crop = crop.rotate(180)
        out = OUT_DIR / out_name
        crop.save(out)
        print(f"  ✅ {out}  ({crop.size[0]}x{crop.size[1]})")


if __name__ == "__main__":
    main()
