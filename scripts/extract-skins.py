#!/usr/bin/env python3
"""
Build src/data/skins.ts from game scripts + ko.po + extracted icons.

Sources (all under ~/dst-game-snapshot/scripts/, set up by sync-game-data.sh):
  - prefabs/skinprefabs.lua : CreatePrefabSkin(id, { rarity, rarity_modifier, type, base_prefab, skin_tags, release_group, ... })
  - skin_strings.lua        : SKIN_NAMES / SKIN_QUOTES (English)
  - skin_set_info.lua       : sets like emote_carol → ["wendy_ice", ...]
  - ../ko.po                : msgctxt "STRINGS.SKIN_NAMES.<id>" / SKIN_QUOTES

Only emits skins that have a matching PNG in public/images/skins/ — so
phase 1 ships exactly the item skins users can actually see icons for.
Character body skins (no inventory icon) wait for phase 2.

Output: src/data/skins.ts (do not edit by hand).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKINS_DIR = REPO_ROOT / "public" / "images" / "skins"
OUTPUT_TS = REPO_ROOT / "src" / "data" / "skins.ts"

SNAPSHOT = Path.home() / "dst-game-snapshot"
SKINPREFABS_LUA = SNAPSHOT / "scripts" / "prefabs" / "skinprefabs.lua"
SKIN_STRINGS_LUA = SNAPSHOT / "scripts" / "skin_strings.lua"
SKIN_SET_INFO_LUA = SNAPSHOT / "scripts" / "skin_set_info.lua"
KO_PO = SNAPSHOT / "ko.po"

# Fallback to ad-hoc dump dir used during initial dev.
FALLBACK_DIR = Path("/tmp/dst-skin-check/scripts")
KOPO_FALLBACK = Path.home() / "Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/scripts/languages/ko.po"


def _resolve(primary: Path, fallback: Path) -> Path:
    if primary.exists():
        return primary
    if fallback.exists():
        return fallback
    sys.exit(f"required file missing: {primary} (or {fallback})")


# ─── parsers ────────────────────────────────────────────────────────────────

CREATE_SKIN_RE = re.compile(
    r'table\.insert\(prefs,\s*CreatePrefabSkin\(\s*"([a-z0-9_]+)"\s*,\s*\{(.*?)\n\}\)\)',
    re.DOTALL,
)
KV_STRING_RE = re.compile(r'(\w+)\s*=\s*"([^"]*)"')
KV_INT_RE = re.compile(r'(\w+)\s*=\s*(-?\d+)')
SKIN_TAGS_RE = re.compile(r'skin_tags\s*=\s*\{\s*([^}]*)\}')
TAG_RE = re.compile(r'"([A-Z0-9_]+)"')


def parse_skinprefabs(path: Path) -> dict[str, dict]:
    """Return { skin_id: { base_prefab, type, rarity, rarity_modifier?, skin_tags[], release_group } }."""
    text = path.read_text(encoding="utf-8")
    out: dict[str, dict] = {}
    for m in CREATE_SKIN_RE.finditer(text):
        skin_id = m.group(1)
        body = m.group(2)
        kv: dict = {}
        for km in KV_STRING_RE.finditer(body):
            kv[km.group(1)] = km.group(2)
        for km in KV_INT_RE.finditer(body):
            kv[km.group(1)] = int(km.group(2))
        tag_match = SKIN_TAGS_RE.search(body)
        tags = TAG_RE.findall(tag_match.group(1)) if tag_match else []
        out[skin_id] = {
            "base_prefab": kv.get("base_prefab"),
            "type": kv.get("type"),
            "rarity": kv.get("rarity", "Common"),
            "rarity_modifier": kv.get("rarity_modifier"),
            "skin_tags": tags,
            "release_group": kv.get("release_group", 0),
        }
    return out


def parse_string_table(path: Path, table_name: str) -> dict[str, str]:
    """Parse STRINGS.<table_name> = { id = "value", ... } from skin_strings.lua."""
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        rf'STRINGS\.{table_name}\s*=\s*\{{(.*?)^\}}',
        re.DOTALL | re.MULTILINE,
    )
    m = pattern.search(text)
    if not m:
        return {}
    body = m.group(1)
    # entries look like `\twalter_ancient = "The Archaic",`
    out: dict[str, str] = {}
    for em in re.finditer(r'(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"', body):
        # unescape: \" → ", \\ → \
        val = em.group(2).replace('\\"', '"').replace("\\\\", "\\")
        out[em.group(1)] = val
    return out


def parse_kopo(path: Path) -> dict[str, dict[str, str]]:
    """
    Parse Korean translations from ko.po.

    Returns { table_name: { id: korean_translation } } for SKIN_NAMES and SKIN_QUOTES.
    """
    text = path.read_text(encoding="utf-8")
    entries: dict[str, dict[str, str]] = {"SKIN_NAMES": {}, "SKIN_QUOTES": {}}
    # blocks look like:
    #   #. STRINGS.SKIN_NAMES.walter_ancient
    #   msgctxt "STRINGS.SKIN_NAMES.walter_ancient"
    #   msgid "The Archaic"
    #   msgstr "고대의 모험가"
    block_re = re.compile(
        r'msgctxt\s+"STRINGS\.(SKIN_NAMES|SKIN_QUOTES)\.([a-zA-Z0-9_]+)"\s*\nmsgid\s+"((?:[^"\\]|\\.)*)"\s*\nmsgstr\s+"((?:[^"\\]|\\.)*)"',
        re.MULTILINE,
    )
    for m in block_re.finditer(text):
        table, key, _en, ko = m.groups()
        if ko:
            entries[table][key] = ko.replace('\\"', '"').replace("\\\\", "\\")
    return entries


def parse_skin_sets(path: Path) -> dict[str, str]:
    """Return { skin_id: set_id }. A skin id can belong to one set."""
    text = path.read_text(encoding="utf-8")
    # set blocks: `\temote_carol =\n\t{\n\t\t{ ...skin ids... },\n\t\t...\n\t},`
    # We want every quoted "skin_id" inside the set body mapped to set_id.
    out: dict[str, str] = {}
    set_block_re = re.compile(r'\t([a-zA-Z0-9_]+)\s*=\s*\n\t\{(.*?)\n\t\},', re.DOTALL)
    for m in set_block_re.finditer(text):
        set_id = m.group(1)
        for tm in re.finditer(r'"([a-zA-Z0-9_]+)"', m.group(2)):
            out.setdefault(tm.group(1), set_id)
    return out


# ─── builder ────────────────────────────────────────────────────────────────


def main() -> None:
    skinprefabs_path = _resolve(SKINPREFABS_LUA, FALLBACK_DIR / "skinprefabs.lua")
    skin_strings_path = _resolve(SKIN_STRINGS_LUA, FALLBACK_DIR / "skin_strings.lua")
    skin_sets_path = _resolve(SKIN_SET_INFO_LUA, FALLBACK_DIR / "skin_set_info.lua")
    kopo_path = _resolve(KO_PO, KOPO_FALLBACK)

    if not SKINS_DIR.exists():
        sys.exit(f"skin icons not extracted yet. Run scripts/extract-skin-icons.py first ({SKINS_DIR}).")
    available_icons = {p.stem for p in SKINS_DIR.glob("*.png")}
    print(f"Available icons: {len(available_icons)}")

    skin_meta = parse_skinprefabs(skinprefabs_path)
    print(f"Parsed {len(skin_meta)} CreatePrefabSkin entries")

    names_en = parse_string_table(skin_strings_path, "SKIN_NAMES")
    quotes_en = parse_string_table(skin_strings_path, "SKIN_QUOTES")
    print(f"English: {len(names_en)} names, {len(quotes_en)} quotes")

    ko = parse_kopo(kopo_path)
    names_ko = ko["SKIN_NAMES"]
    quotes_ko = ko["SKIN_QUOTES"]
    print(f"Korean: {len(names_ko)} names, {len(quotes_ko)} quotes")

    skin_to_set = parse_skin_sets(skin_sets_path)
    print(f"Skin sets: {len(skin_to_set)} skin→set mappings")

    rows = []
    for skin_id in sorted(available_icons):
        meta = skin_meta.get(skin_id)
        if not meta:
            # No CreatePrefabSkin row — likely a tiered icon for an item skin we still want
            # to surface (e.g. abigail_flower_lunar). Look up by base prefab heuristics later
            # if needed; for now skip silently to keep schema tight.
            continue
        row = {
            "id": skin_id,
            "base_prefab": meta["base_prefab"],
            "type": meta["type"],
            "rarity": meta["rarity"],
            "skin_tags": meta["skin_tags"],
            "release_group": meta["release_group"],
            "name_en": names_en.get(skin_id, skin_id),
            "name_ko": names_ko.get(skin_id, names_en.get(skin_id, skin_id)),
            "icon": f"/images/skins/{skin_id}.png",
        }
        if meta["rarity_modifier"]:
            row["rarity_modifier"] = meta["rarity_modifier"]
        if skin_id in quotes_en:
            row["quote_en"] = quotes_en[skin_id]
        if skin_id in quotes_ko:
            row["quote_ko"] = quotes_ko[skin_id]
        if skin_id in skin_to_set:
            row["set_id"] = skin_to_set[skin_id]
        rows.append(row)

    print(f"Emitting {len(rows)} skin entries → {OUTPUT_TS.relative_to(REPO_ROOT)}")

    header = '''// AUTO-GENERATED by scripts/extract-skins.py. Do not edit by hand.
// Run `bash scripts/sync-game-data.sh` to regenerate from current game data.

export type SkinRarity =
  | "Common"
  | "Classy"
  | "Spiffy"
  | "Distinguished"
  | "Elegant"
  | "Loyal"
  | "Timeless"
  | "Event"
  | "Reward"
  | "Character"
  | "ProofOfPurchase"
  | "Resurrected"
  | "Complimentary"
  | "HeirloomClassy"
  | "HeirloomSpiffy"
  | "HeirloomDistinguished"
  | "HeirloomElegant";

export type SkinRarityModifier = "Woven" | "CharacterModifier" | "Inspired" | "Lustrous";

export type SkinType = "item" | "base";

export interface SkinEntry {
  id: string;
  base_prefab: string;
  type: SkinType;
  rarity: SkinRarity;
  rarity_modifier?: SkinRarityModifier;
  skin_tags: string[];
  release_group: number;
  name_en: string;
  name_ko: string;
  quote_en?: string;
  quote_ko?: string;
  set_id?: string;
  icon: string;
}

export const SKINS: SkinEntry[] = '''

    OUTPUT_TS.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(rows, ensure_ascii=False, indent=2)
    OUTPUT_TS.write_text(header + body + ";\n", encoding="utf-8")


if __name__ == "__main__":
    main()
