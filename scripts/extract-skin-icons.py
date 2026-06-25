#!/usr/bin/env python3
"""
Extract Klei KTEX inventory atlas → individual skin icon PNGs.

Reads inventoryimages{1..4}.tex/.xml from the game's images.zip, decodes the
KTEX (DXT5) atlas to RGBA, then crops each element per UV coords from the XML.

Only emits PNGs whose element name matches a skin id registered in
prefabskins.lua. For tiered icons (`<id>_level0/2/3`) it keeps the highest
tier (level3) and saves it under the plain `<id>` name.

Output: public/images/skins/<skin_id>.png

Dependencies: Pillow only (no ktools / external binaries).
"""
from __future__ import annotations

import re
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:
    sys.exit("Pillow is required: pip3 install Pillow")


def _same_pixels(path: "Path", img: "Image.Image") -> bool:
    """기존 파일이 새 이미지와 픽셀 단위로 동일한지 검사.

    PIL의 PNG 인코딩(optimize)이 비결정적이라 같은 픽셀도 매번 다른
    바이트로 저장된다. 그대로 덮어쓰면 git diff에 수백 개의 가짜 변경이
    쌓이므로, 픽셀이 같으면 저장을 건너뛴다.
    """
    if not path.exists():
        return False
    try:
        existing = Image.open(path)
        existing.load()
    except Exception:
        return False
    a = existing.convert("RGBA")
    b = img.convert("RGBA")
    if a.size != b.size:
        return False
    return ImageChops.difference(a, b).getbbox() is None

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = REPO_ROOT / "public" / "images" / "skins"

GAME_BASE = Path.home() / "Library/Application Support/Steam/steamapps/common/Don't Starve Together"
IMAGES_ZIP = GAME_BASE / "dontstarve_steam.app/Contents/data/databundles/images.zip"

# Snapshot symlink set up by sync-game-data.sh; falls back to extracting fresh.
SNAPSHOT = Path.home() / "dst-game-snapshot"
PREFABSKINS_LUA = SNAPSHOT / "scripts" / "prefabskins.lua"
PREFABSKINS_LUA_FALLBACK = Path("/tmp/dst-skin-check/scripts/prefabskins.lua")

ATLAS_NAMES = ["inventoryimages1", "inventoryimages2", "inventoryimages3", "inventoryimages4"]


def load_skin_ids() -> set[str]:
    """Parse prefabskins.lua → flat set of every skin id we want to ship."""
    src = PREFABSKINS_LUA if PREFABSKINS_LUA.exists() else PREFABSKINS_LUA_FALLBACK
    if not src.exists():
        sys.exit(f"prefabskins.lua not found at {PREFABSKINS_LUA} or fallback {PREFABSKINS_LUA_FALLBACK}")
    text = src.read_text(encoding="utf-8")
    return set(re.findall(r'"([a-z0-9_]+)"', text))


def decode_ktex(blob: bytes) -> Image.Image:
    """Decode a Klei KTEX blob into a Pillow RGBA image (largest mip)."""
    if blob[:4] != b"KTEX":
        raise ValueError("not a KTEX file")
    spec = struct.unpack("<I", blob[4:8])[0]
    pixel_format = (spec >> 4) & 0x1F
    mipmap_count = (spec >> 13) & 0x1F

    off = 8
    mips = []
    for _ in range(mipmap_count):
        w, h, _pitch, data_size = struct.unpack("<HHHI", blob[off:off + 10])
        mips.append((w, h, data_size))
        off += 10

    w, h, ds = mips[0]
    raw = blob[off:off + ds]

    bcn_modes = {0: 1, 1: 2, 2: 3}  # DXT1/3/5 → bcn 1/2/3
    if pixel_format in bcn_modes:
        img = Image.frombytes("RGBA", (w, h), raw, "bcn", bcn_modes[pixel_format])
    elif pixel_format == 4:  # ARGB
        img = Image.frombytes("RGBA", (w, h), raw, "raw", "BGRA")
    else:
        raise ValueError(f"unsupported KTEX pixel format: {pixel_format}")

    # Klei textures are stored bottom-up (OpenGL convention).
    return img.transpose(Image.FLIP_TOP_BOTTOM)


def resolve_skin_target(stem: str, skin_ids: set[str]) -> tuple[str, int] | None:
    """
    Given an atlas element stem (e.g. 'walterhat_ancient' or 'abigail_flower_lunar_level3'),
    decide if it's a skin icon we want, and what filename to save it under.

    Returns (output_stem, priority) where lower priority wins on conflict, or None to skip.
    Priority lets level3 override an unsuffixed match if both exist.
    """
    if stem in skin_ids:
        return stem, 0
    # tiered icons: keep level3 (highest rarity), drop level0/2 (no skin tab use)
    if stem.endswith("_level3"):
        base = stem[: -len("_level3")]
        if base in skin_ids:
            return base, 1
    return None


def extract_atlas(
    zf: zipfile.ZipFile,
    name: str,
    skin_ids: set[str],
    chosen: "dict[str, tuple[int, Image.Image]]",
) -> int:
    """Decode one atlas and collect the best crop per matching skin element.

    Crops are kept in memory (not written here): the same stem can appear in
    multiple atlases, and a later atlas may carry a higher-priority source.
    Writing immediately would make the in-run rewrite compare against the
    file just written rather than the original, leaking re-encode noise.
    Returns the number of (re)selected crops.
    """
    tex_blob = zf.read(f"images/{name}.tex")
    xml_blob = zf.read(f"images/{name}.xml")

    atlas = decode_ktex(tex_blob)
    aw, ah = atlas.size

    root = ET.fromstring(xml_blob)
    count = 0
    for elem in root.iter("Element"):
        raw_name = elem.get("name", "")
        stem = re.sub(r"\.tex$", "", raw_name, flags=re.IGNORECASE)
        if not re.fullmatch(r"[A-Za-z0-9_]+", stem):
            continue
        resolved = resolve_skin_target(stem, skin_ids)
        if resolved is None:
            continue
        out_stem, priority = resolved
        if out_stem in chosen and chosen[out_stem][0] <= priority:
            continue  # already have a same-or-better source for this skin id

        u1 = float(elem.get("u1"))
        u2 = float(elem.get("u2"))
        v1 = float(elem.get("v1"))
        v2 = float(elem.get("v2"))

        # UV → pixel rect. atlas is flipped top-down already; v measured from bottom.
        left = round(u1 * aw)
        right = round(u2 * aw)
        top = round((1.0 - v2) * ah)
        bottom = round((1.0 - v1) * ah)
        if right <= left or bottom <= top:
            continue

        cropped = atlas.crop((left, top, right, bottom))
        cropped.load()  # detach from the atlas before it goes out of scope
        chosen[out_stem] = (priority, cropped)
        count += 1
    return count


def main() -> None:
    if not IMAGES_ZIP.exists():
        sys.exit(f"images.zip not found: {IMAGES_ZIP}")

    skin_ids = load_skin_ids()
    print(f"Loaded {len(skin_ids)} skin ids from prefabskins.lua")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    chosen: dict[str, tuple[int, Image.Image]] = {}
    total = 0
    with zipfile.ZipFile(IMAGES_ZIP) as zf:
        for name in ATLAS_NAMES:
            n = extract_atlas(zf, name, skin_ids, chosen)
            print(f"  {name}: {n} skin icons matched")
            total += n

    # Write each stem's final crop exactly once. Skip when pixels are unchanged
    # so re-encode churn doesn't flood git with hundreds of identical-image diffs.
    written = 0
    for stem, (_priority, img) in chosen.items():
        out_path = OUTPUT_DIR / f"{stem}.png"
        if not _same_pixels(out_path, img):
            img.save(out_path, "PNG", optimize=True)
            written += 1
    print(
        f"Total: {len(chosen)} unique skin icons → {OUTPUT_DIR.relative_to(REPO_ROOT)} "
        f"({written} written, {len(chosen) - written} unchanged)"
    )
    missing = skin_ids - chosen.keys()
    print(f"({len(missing)} skin ids have no inventory icon — expected for character body skins, will be handled in phase 2)")


if __name__ == "__main__":
    main()
