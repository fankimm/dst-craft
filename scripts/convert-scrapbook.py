#!/usr/bin/env python3
"""
Convert DST scrapbookdata.lua → src/data/scrapbook-stats.ts

Sources:
  - scrapbookdata.lua: auto-generated item stats (d_createscrapbookdata)
  - strings.lua: STRINGS.SCRAPBOOK.SPECIALINFO (English descriptions)
  - ko.po: STRINGS.SCRAPBOOK.SPECIALINFO.* (Korean translations)

Usage:
  python3 scripts/convert-scrapbook.py

Requires scripts.zip extracted to /tmp/dst-scrapbook/:
  unzip -o "$SCRIPTS_ZIP" "scripts/screens/redux/scrapbookdata.lua" \
    "scripts/strings.lua" -d /tmp/dst-scrapbook/
"""

import re
import sys
import json
from pathlib import Path
from collections import OrderedDict

# --- Paths ---
SCRAPBOOK_DATA = Path("/tmp/dst-scrapbook/scripts/screens/redux/scrapbookdata.lua")
STRINGS_LUA = Path("/tmp/dst-scrapbook/scripts/strings.lua")
KOPO = Path.home() / "Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/scripts/languages/ko.po"
OUTPUT = Path("src/data/scrapbook-stats.ts")


# --- Lua Parsing ---

def parse_lua_value(s: str):
    """Parse a Lua value (string, number, bool, table) from a string fragment."""
    s = s.strip()
    if s.startswith('"'):
        # String
        m = re.match(r'"((?:[^"\\]|\\.)*)"', s)
        return m.group(1) if m else s
    if s == "true":
        return True
    if s == "false":
        return False
    try:
        if "." in s:
            return float(s)
        return int(s)
    except ValueError:
        return s


def parse_lua_table(s: str):
    """Parse a flat Lua table string like {k=v, k2=v2} or {"a","b"}."""
    s = s.strip()
    if not s.startswith("{") or not s.endswith("}"):
        return {}
    inner = s[1:-1].strip()
    if not inner:
        return {}

    # Check if it's an array (all values, no keys)
    # Array tables: {"item1", "item2", ...}
    if re.match(r'^"', inner) and "=" not in inner.split(",")[0]:
        items = re.findall(r'"((?:[^"\\]|\\.)*)"', inner)
        return items

    # Key-value table: {key=value, key2=value2}
    result = {}
    for m in re.finditer(r'(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|true|false|[\d.\-]+)', inner):
        key = m.group(1)
        result[key] = parse_lua_value(m.group(2))
    return result


def parse_scrapbook_entries(path: Path) -> dict:
    """Parse all entries from scrapbookdata.lua."""
    content = path.read_text(encoding="utf-8")
    entries = {}

    # Match each top-level entry: key = {fields...}
    # Entries span a single line in the auto-generated file
    for line in content.splitlines():
        m = re.match(r'^\s{4}(\w+)\s*=\s*\{(.+)\}\s*,?\s*$', line)
        if not m:
            continue
        key = m.group(1)
        body = m.group(2)

        entry = {}

        # Parse nested tables first (notes, deps, forgerepairable, etc.)
        # Find {}-enclosed values
        for tm in re.finditer(r'(\w+)\s*=\s*(\{[^{}]*\})', body):
            fname = tm.group(1)
            entry[fname] = parse_lua_table(tm.group(2))

        # Remove nested tables from body to parse flat fields
        flat_body = re.sub(r'\w+\s*=\s*\{[^{}]*\}', '', body)

        # Parse flat key=value pairs
        for fm in re.finditer(r'(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|true|false|[\d.\-]+(?:e[\d+\-]+)?)', flat_body):
            fname = fm.group(1)
            if fname not in entry:  # Don't overwrite nested tables
                entry[fname] = parse_lua_value(fm.group(2))

        entries[key] = entry

    return entries


# --- SPECIALINFO Parsing ---

def parse_specialinfo_en(path: Path) -> dict:
    """Parse STRINGS.SCRAPBOOK.SPECIALINFO from strings.lua."""
    content = path.read_text(encoding="utf-8")

    # Find the SPECIALINFO block
    m = re.search(r'SPECIALINFO\s*=\s*\{', content)
    if not m:
        print("WARNING: SPECIALINFO not found in strings.lua", file=sys.stderr)
        return {}

    start = m.end()
    # Find matching closing brace (track nesting)
    depth = 1
    pos = start
    while pos < len(content) and depth > 0:
        if content[pos] == "{":
            depth += 1
        elif content[pos] == "}":
            depth -= 1
        pos += 1

    block = content[start:pos - 1]

    result = {}
    # Match KEY = "value" or KEY = "multi\nline"
    for m in re.finditer(r'(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"', block):
        key = m.group(1)
        val = m.group(2).replace("\\n", "\n").replace('\\"', '"')
        result[key] = val

    return result


def parse_specialinfo_ko(path: Path) -> dict:
    """Parse STRINGS.SCRAPBOOK.SPECIALINFO.* translations from ko.po."""
    content = path.read_text(encoding="utf-8")
    result = {}

    # Pattern: msgctxt "STRINGS.SCRAPBOOK.SPECIALINFO.KEY"\nmsgid ...\nmsgstr "translation"
    blocks = content.split("\n\n")
    for block in blocks:
        ctx_m = re.search(r'msgctxt\s+"STRINGS\.SCRAPBOOK\.SPECIALINFO\.(\w+)"', block)
        if not ctx_m:
            continue
        key = ctx_m.group(1)

        # Extract msgstr (may be multiline)
        msgstr_parts = []
        in_msgstr = False
        for line in block.splitlines():
            if line.startswith("msgstr "):
                in_msgstr = True
                m = re.match(r'msgstr\s+"(.*)"', line)
                if m:
                    msgstr_parts.append(m.group(1))
            elif in_msgstr and line.startswith('"'):
                m = re.match(r'"(.*)"', line)
                if m:
                    msgstr_parts.append(m.group(1))
            elif in_msgstr:
                break

        translation = "".join(msgstr_parts).replace("\\n", "\n").replace('\\"', '"')
        if translation:
            result[key] = translation

    return result


# --- Stats fields to extract ---

NUMERIC_FIELDS = [
    "damage", "planardamage", "finiteuses",
    "armor", "absorb_percent", "armor_planardefense",
    "dapperness", "waterproofer", "insulator",
    "stacksize", "perishable",
    "fueledmax", "fueledrate",
    "weapondamage", "weaponrange",
    "sanityaura",
    "hungervalue", "healthvalue", "sanityvalue",
    "health",
]

STRING_FIELDS = [
    "type", "subcat", "specialinfo", "craftingprefab",
    "insulator_type", "fueledtype1", "foodtype",
]

BOOL_FIELDS = [
    "sewable", "burnable", "fueleduses",
]

ARRAY_FIELDS = [
    "forgerepairable", "repairitems", "deps",
]


def extract_stats(entry: dict) -> dict:
    """Extract relevant stats from a scrapbook entry."""
    stats = {}

    for f in NUMERIC_FIELDS:
        if f in entry and isinstance(entry[f], (int, float)):
            stats[f] = entry[f]

    # damage/health can be a string range like "15-40"
    if "damage" in entry and isinstance(entry["damage"], str):
        stats["damage"] = entry["damage"]
    if "health" in entry and isinstance(entry["health"], str):
        stats["health"] = entry["health"]

    for f in STRING_FIELDS:
        if f in entry and isinstance(entry[f], str):
            stats[f] = entry[f]

    for f in BOOL_FIELDS:
        if f in entry and entry[f] is True:
            stats[f] = True

    for f in ARRAY_FIELDS:
        if f in entry and isinstance(entry[f], list) and len(entry[f]) > 0:
            stats[f] = entry[f]

    # notes (shadow_aligned / lunar_aligned)
    if "notes" in entry and isinstance(entry["notes"], dict):
        if entry["notes"].get("shadow_aligned"):
            stats["shadow_aligned"] = True
        if entry["notes"].get("lunar_aligned"):
            stats["lunar_aligned"] = True

    return stats


def has_display_stats(stats: dict, item_id: str, specialinfo_en: dict) -> bool:
    """Check if entry has any stats worth displaying (beyond just type/subcat)."""
    display_fields = set(stats.keys()) - {"type", "subcat", "foodtype", "craftingprefab", "deps", "burnable"}
    if len(display_fields) > 0:
        return True
    # Also include if there's a matching specialinfo text
    si_key = stats.get("specialinfo", item_id.upper())
    return si_key in specialinfo_en


# --- TS Generation ---

def to_ts_value(val, indent=4) -> str:
    """Convert a Python value to TypeScript literal."""
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, str):
        # Escape for TS string
        escaped = val.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
        return f'"{escaped}"'
    if isinstance(val, (int, float)):
        if isinstance(val, float) and val == int(val):
            return str(int(val))
        return str(val)
    if isinstance(val, list):
        items = ", ".join(to_ts_value(v) for v in val)
        return f"[{items}]"
    return str(val)


def generate_ts(entries: dict, specialinfo_en: dict, specialinfo_ko: dict) -> str:
    """Generate the TypeScript output."""
    lines = []
    lines.append("// Auto-generated by scripts/convert-scrapbook.py")
    lines.append("// Source: scrapbookdata.lua (d_createscrapbookdata)")
    lines.append("// DO NOT EDIT MANUALLY")
    lines.append("")
    lines.append("export interface ScrapbookStats {")
    lines.append("  type: string;")
    lines.append("  subcat?: string;")
    lines.append("  // Combat")
    lines.append("  damage?: number | string;")
    lines.append("  planardamage?: number;")
    lines.append("  health?: number | string;")
    lines.append("  weapondamage?: number | string;")
    lines.append("  weaponrange?: number;")
    lines.append("  finiteuses?: number;")
    lines.append("  // Defense")
    lines.append("  armor?: number;")
    lines.append("  absorb_percent?: number;")
    lines.append("  armor_planardefense?: number;")
    lines.append("  // Utility")
    lines.append("  dapperness?: number;")
    lines.append("  waterproofer?: number;")
    lines.append("  insulator?: number;")
    lines.append("  insulator_type?: string;")
    lines.append("  stacksize?: number;")
    lines.append("  perishable?: number;")
    lines.append("  sanityaura?: number;")
    lines.append("  // Food")
    lines.append("  hungervalue?: number;")
    lines.append("  healthvalue?: number;")
    lines.append("  sanityvalue?: number;")
    lines.append("  foodtype?: string;")
    lines.append("  // Fuel")
    lines.append("  fueledmax?: number;")
    lines.append("  fueledrate?: number;")
    lines.append("  fueledtype1?: string;")
    lines.append("  fueleduses?: boolean;")
    lines.append("  // Repair")
    lines.append("  forgerepairable?: string[];")
    lines.append("  repairitems?: string[];")
    lines.append("  sewable?: boolean;")
    lines.append("  burnable?: boolean;")
    lines.append("  // Meta")
    lines.append("  craftingprefab?: string;")
    lines.append("  shadow_aligned?: boolean;")
    lines.append("  lunar_aligned?: boolean;")
    lines.append("  deps?: string[];")
    lines.append("  // Special info")
    lines.append("  specialinfo?: string;")
    lines.append("  specialinfo_en?: string;")
    lines.append("  specialinfo_ko?: string;")
    lines.append("}")
    lines.append("")
    lines.append("export const scrapbookStats: Record<string, ScrapbookStats> = {")

    count = 0
    for item_id in sorted(entries.keys()):
        stats = entries[item_id]
        if not has_display_stats(stats, item_id, specialinfo_en):
            continue

        # Add specialinfo text
        si_key = stats.get("specialinfo")
        if not si_key:
            si_key = item_id.upper()
        en_text = specialinfo_en.get(si_key, "")
        ko_text = specialinfo_ko.get(si_key, "")
        # Also try with original specialinfo value
        if not en_text and "specialinfo" in stats:
            en_text = specialinfo_en.get(stats["specialinfo"], "")
            ko_text = specialinfo_ko.get(stats["specialinfo"], "")

        if en_text:
            stats["specialinfo_en"] = en_text
        if ko_text:
            stats["specialinfo_ko"] = ko_text

        # Build object literal
        props = []
        # type first
        for field in ["type", "subcat"]:
            if field in stats:
                props.append(f"{field}: {to_ts_value(stats[field])}")
        # Then numeric/string/bool fields in order
        field_order = [
            "damage", "planardamage", "health", "weapondamage", "weaponrange", "finiteuses",
            "armor", "absorb_percent", "armor_planardefense",
            "dapperness", "waterproofer", "insulator", "insulator_type",
            "stacksize", "perishable", "sanityaura",
            "hungervalue", "healthvalue", "sanityvalue", "foodtype",
            "fueledmax", "fueledrate", "fueledtype1", "fueleduses",
            "sewable", "burnable",
            "craftingprefab", "shadow_aligned", "lunar_aligned",
            "specialinfo", "specialinfo_en", "specialinfo_ko",
        ]
        for field in field_order:
            if field in stats and field not in ("type", "subcat"):
                props.append(f"{field}: {to_ts_value(stats[field])}")
        # Arrays last (forgerepairable, repairitems, deps)
        for field in ARRAY_FIELDS:
            if field in stats:
                props.append(f"{field}: {to_ts_value(stats[field])}")

        props_str = ", ".join(props)
        lines.append(f"  {item_id}: {{{props_str}}},")
        count += 1

    lines.append("};")
    lines.append("")

    print(f"Generated {count} entries", file=sys.stderr)
    return "\n".join(lines)


# --- Main ---

def main():
    if not SCRAPBOOK_DATA.exists():
        print(f"ERROR: {SCRAPBOOK_DATA} not found.", file=sys.stderr)
        print("Run: unzip -o \"$SCRIPTS_ZIP\" \"scripts/screens/redux/scrapbookdata.lua\" \"scripts/strings.lua\" -d /tmp/dst-scrapbook/", file=sys.stderr)
        sys.exit(1)

    print("Parsing scrapbookdata.lua...", file=sys.stderr)
    all_entries = parse_scrapbook_entries(SCRAPBOOK_DATA)
    print(f"  {len(all_entries)} entries parsed", file=sys.stderr)

    print("Parsing SPECIALINFO (English)...", file=sys.stderr)
    specialinfo_en = parse_specialinfo_en(STRINGS_LUA)
    print(f"  {len(specialinfo_en)} entries", file=sys.stderr)

    print("Parsing SPECIALINFO (Korean)...", file=sys.stderr)
    specialinfo_ko = {}
    if KOPO.exists():
        specialinfo_ko = parse_specialinfo_ko(KOPO)
        print(f"  {len(specialinfo_ko)} entries", file=sys.stderr)
    else:
        print(f"  WARNING: ko.po not found at {KOPO}", file=sys.stderr)

    # Extract stats for all entries (not just type=item)
    stats_map = {}
    for item_id, entry in all_entries.items():
        stats = extract_stats(entry)
        if stats:
            stats_map[item_id] = stats

    # Aliases: recipe item ID → scrapbook prefab ID (when IDs differ)
    ALIASES = {
        # WX-78
        "wx78_drone_delivery_item": "wx78_drone_delivery",
        "wx78_drone_zap_remote": "wx78_drone_zap",
        "wx78_backupbody": "wx78_backupbody_inventory",
        # Seafaring (_item → deployed)
        "anchor_item": "anchor",
        "boat_item": "boat",
        "boat_grass_item": "boat_grass",
        "mast_item": "mast",
        "mast_malbatross_item": "mast_malbatross",
        "mastupgrade_lamp_item": "mastupgrade_lamp",
        "mastupgrade_lightningrod_item": "mastupgrade_lightningrod",
        "steeringwheel_item": "steeringwheel",
        # Seafaring (_kit → deployed)
        "boat_cannon_kit": "boat_cannon",
        "boat_magnet_kit": "boat_magnet",
        "ocean_trawler_kit": "ocean_trawler",
        # Forge / special stations (_kit → deployed)
        "lunar_forge_kit": "lunar_forge",
        "shadow_forge_kit": "shadow_forge",
        "deerclopseyeball_sentryward_kit": "deerclopseyeball_sentryward",
        "gelblob_storage_kit": "gelblob_storage",
        # Portable items (_item → deployed)
        "portableblender_item": "portableblender",
        "portablecookpot_item": "portablecookpot",
        "portablespicer_item": "portablespicer",
        "eyeturret_item": "eyeturret",
        "winona_teleport_pad_item": "winona_teleport_pad",
        # Chesspieces (_builder → statue)
        "chesspiece_anchor_builder": "chesspiece_anchor",
        "chesspiece_antlion_builder": "chesspiece_antlion",
        "chesspiece_bearger_builder": "chesspiece_bearger",
        "chesspiece_bearger_mutated_builder": "chesspiece_bearger_mutated",
        "chesspiece_beequeen_builder": "chesspiece_beequeen",
        "chesspiece_bishop_builder": "chesspiece_bishop",
        "chesspiece_butterfly_builder": "chesspiece_butterfly",
        "chesspiece_crabking_builder": "chesspiece_crabking",
        "chesspiece_daywalker_builder": "chesspiece_daywalker",
        "chesspiece_daywalker2_builder": "chesspiece_daywalker2",
        "chesspiece_deerclops_builder": "chesspiece_deerclops",
        "chesspiece_deerclops_mutated_builder": "chesspiece_deerclops_mutated",
        "chesspiece_dragonfly_builder": "chesspiece_dragonfly",
        "chesspiece_eyeofterror_builder": "chesspiece_eyeofterror",
        "chesspiece_formal_builder": "chesspiece_formal",
        "chesspiece_guardianphase3_builder": "chesspiece_guardianphase3",
        "chesspiece_hornucopia_builder": "chesspiece_hornucopia",
        "chesspiece_klaus_builder": "chesspiece_klaus",
        "chesspiece_knight_builder": "chesspiece_knight",
        "chesspiece_malbatross_builder": "chesspiece_malbatross",
        "chesspiece_minotaur_builder": "chesspiece_minotaur",
        "chesspiece_moon_builder": "chesspiece_moon",
        "chesspiece_moosegoose_builder": "chesspiece_moosegoose",
        "chesspiece_muse_builder": "chesspiece_muse",
        "chesspiece_pawn_builder": "chesspiece_pawn",
        "chesspiece_pipe_builder": "chesspiece_pipe",
        "chesspiece_rook_builder": "chesspiece_rook",
        "chesspiece_sharkboi_builder": "chesspiece_sharkboi",
        "chesspiece_stalker_builder": "chesspiece_stalker",
        "chesspiece_toadstool_builder": "chesspiece_toadstool",
        "chesspiece_twinsofterror_builder": "chesspiece_twinsofterror",
        "chesspiece_wagboss_lunar_builder": "chesspiece_wagboss_lunar",
        "chesspiece_wagboss_robot_builder": "chesspiece_wagboss_robot",
        "chesspiece_warg_mutated_builder": "chesspiece_warg_mutated",
        "chesspiece_wormboss_builder": "chesspiece_wormboss",
    }
    for alias, original in ALIASES.items():
        if original not in stats_map:
            continue
        if alias not in stats_map:
            stats_map[alias] = stats_map[original]
        else:
            orig_fields = set(stats_map[original].keys()) - {"type", "subcat", "craftingprefab", "deps", "burnable"}
            alias_fields = set(stats_map[alias].keys()) - {"type", "subcat", "craftingprefab", "deps", "burnable"}
            if len(orig_fields) > len(alias_fields):
                stats_map[alias] = stats_map[original]

    print(f"Entries with stats: {len(stats_map)}", file=sys.stderr)

    ts_content = generate_ts(stats_map, specialinfo_en, specialinfo_ko)
    OUTPUT.write_text(ts_content, encoding="utf-8")
    print(f"Written to {OUTPUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
