#!/usr/bin/env python3
"""
Extract raw food stats from DST prefabs → src/data/raw-foods.ts

Sources (extract scripts.zip first):
  - scripts/tuning.lua             — TUNING constants (CALORIES, HEALING, SANITY, PERISH)
  - scripts/prefabs/veggies.lua    — VEGGIES table (carrot, berries, ...)
  - scripts/prefabs/mushrooms.lua  — MUSHROOMS_PARAMS table (red/green/blue cap)
  - scripts/prefabs/meats.lua      — meat / monstermeat / drumstick / ... per-prefab
  - scripts/prefabs/egg.lua, butter.lua, honey.lua  — single-prefab specials
  - ko.po                          — Korean names (DST community translation mod)

Usage:
  unzip -o "$SCRIPTS_ZIP" 'scripts/prefabs/*.lua' 'scripts/tuning.lua' \
    'scripts/strings.lua' -d /tmp/dst-extract/
  python3 scripts/extract-raw-foods.py

Output: src/data/raw-foods.ts
"""

import re
import json
import sys
from pathlib import Path

EXTRACT = Path("/tmp/dst-extract/scripts")
TUNING_LUA = EXTRACT / "tuning.lua"
PREFABS = EXTRACT / "prefabs"
STRINGS_LUA = EXTRACT / "strings.lua"
KOPO = Path.home() / "Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/scripts/languages/ko.po"
OUTPUT = Path("src/data/raw-foods.ts")


# ─────────────────────────────────────────────────────────────────────────────
# 1. Resolve TUNING constants we need
# ─────────────────────────────────────────────────────────────────────────────

def resolve_tuning() -> dict:
    """Return a dict mapping `TUNING.<name>` → numeric value, restricted to keys
    we actually use for edible component (calories / healing / sanity / perish)."""
    text = TUNING_LUA.read_text()
    # The constants we care about
    wanted = re.compile(
        r"\b(CALORIES_(TINY|SMALL|MEDSMALL|MED|LARGE|HUGE|MOREHUGE|SUPERHUGE)"
        r"|HEALING_(TINY|SMALL|MEDSMALL|MOREMEDSMALL|MED|MEDLARGE|LARGE|HUGE|MOREHUGE|SUPERHUGE)"
        r"|SANITY_(SUPERTINY|TINY|SMALL|MED|MEDLARGE|LARGE|HUGE)"
        r"|PERISH_(ONE_DAY|TWO_DAY|SUPERFAST|FAST|FASTISH|MED|SLOW|PRESERVED|SUPERSLOW))\b"
    )
    # Local helpers in tuning.lua
    calories_per_day = 75
    seg_time = 30
    total_day_time = seg_time * 16  # 480
    perish_warp = 1

    out = {}
    for m in wanted.finditer(text):
        name = m.group(1)
        # Find the assignment line for this constant
        line_re = re.compile(rf"^\s*{re.escape(name)}\s*=\s*(.+?),", re.MULTILINE)
        lm = line_re.search(text)
        if not lm:
            continue
        expr = lm.group(1).split("--")[0].strip()
        # Substitute helpers
        expr = expr.replace("calories_per_day", str(calories_per_day))
        expr = expr.replace("total_day_time", str(total_day_time))
        expr = expr.replace("perish_warp", str(perish_warp))
        expr = expr.replace("seg_time", str(seg_time))
        # Only allow safe arithmetic
        if re.fullmatch(r"[\d\.\s\+\-\*\/\(\)]+", expr):
            try:
                out[name] = eval(expr)
            except Exception:
                pass
    return out


def lookup(tuning: dict, token: str):
    """Resolve a TUNING.* expression like `TUNING.CALORIES_SMALL`, `-TUNING.HEALING_MED`,
    or a literal `0` / `-5`. Returns None on failure."""
    token = token.strip()
    if not token:
        return None
    sign = 1
    if token.startswith("-"):
        sign = -1
        token = token[1:].strip()
    if token.startswith("TUNING."):
        key = token[len("TUNING."):]
        if key in tuning:
            return sign * tuning[key]
        return None
    try:
        return sign * float(token)
    except ValueError:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 2. Parse VEGGIES table from veggies.lua
# ─────────────────────────────────────────────────────────────────────────────
# Signature:
#   MakeVegStats(seedweight, hunger, health, perish_time, sanity,
#                cooked_hunger, cooked_health, cooked_perish_time, cooked_sanity, ...)
# We want positional args [1..4] for raw stats (hunger, health, perish, sanity).

def parse_veggies(tuning: dict) -> list[dict]:
    text = (PREFABS / "veggies.lua").read_text()
    # Locate VEGGIES table block
    m = re.search(r"VEGGIES\s*=\s*\{([\s\S]*?)\n\}\s*\n", text)
    if not m:
        return []
    block = m.group(1)
    out = []
    for row in re.finditer(
        r"^\s*([a-z_][a-z0-9_]*)\s*=\s*MakeVegStats\(([\s\S]*?)\)",
        block,
        re.MULTILINE,
    ):
        name = row.group(1)
        args_raw = row.group(2)
        # Strip Lua comments + trim
        args = re.sub(r"--\[\[[\s\S]*?\]\]", "", args_raw)
        args = re.sub(r"--[^\n]*", "", args)
        # Split by commas at depth 0 (handle parens / braces / strings)
        args_list = _split_top_level(args)
        if len(args_list) < 5:
            continue
        # raw_hunger, raw_health, raw_perish_days, raw_sanity = positions 2..5 (index 1..4)
        hunger = lookup(tuning, args_list[1])
        health = lookup(tuning, args_list[2])
        perish_arg = args_list[3]
        # Some rows wrap perish in `IsSpecialEventActive(...) and X or Y` — pick the `or Y` fallback (default).
        m_or = re.search(r"or\s+(TUNING\.[A-Z_]+)\b", perish_arg)
        if m_or:
            perish_arg = m_or.group(1)
        perish = lookup(tuning, perish_arg)
        sanity = lookup(tuning, args_list[4])
        if hunger is None or health is None or sanity is None:
            continue
        # Convert seconds → DST days (480s/day)
        perish_days = round(perish / 480, 1) if perish else None
        # Detect monster secondary foodtype (durian)
        secondary = None
        if "FOODTYPE.MONSTER" in args_raw:
            secondary = "monster"
        out.append({
            "id": name,
            "foodtype": "veggie",
            "hunger": hunger,
            "health": health,
            "sanity": sanity,
            "perish_days": perish_days,
            "secondary_foodtype": secondary,
            "source": "veggies.lua",
        })
    return out


def _split_top_level(s: str) -> list[str]:
    """Split by commas at top level (ignore commas inside (), {}, "")."""
    out = []
    depth = 0
    in_str = False
    cur = []
    i = 0
    while i < len(s):
        c = s[i]
        if c == '"' and (i == 0 or s[i - 1] != "\\"):
            in_str = not in_str
        elif not in_str:
            if c in "([{":
                depth += 1
            elif c in ")]}":
                depth -= 1
            elif c == "," and depth == 0:
                out.append("".join(cur))
                cur = []
                i += 1
                continue
        cur.append(c)
        i += 1
    if cur:
        out.append("".join(cur))
    return [x.strip() for x in out]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Parse mushrooms from mushrooms.lua (red/green/blue cap)
# ─────────────────────────────────────────────────────────────────────────────

def parse_mushrooms(tuning: dict) -> list[dict]:
    text = (PREFABS / "mushrooms.lua").read_text()
    # Find the table mapping color → stats. The structure is approximate:
    #   pickloot="red_cap", sanity = 0, health = -TUNING.HEALING_MED, ...
    # We anchor on each `pickloot="<id>_cap"` and pull adjacent fields.
    out = []
    # Use lookahead so each pickloot match doesn't consume the next entry's body.
    for m in re.finditer(
        r'pickloot\s*=\s*"([a-z_]+_cap)"\s*,(?=([\s\S]{0,400}))',
        text,
    ):
        name = m.group(1)
        body = m.group(2)
        fields = {}
        for fm in re.finditer(
            r"\b(sanity|health|hunger|perishtime|cookedsanity|cookedhealth|cookedhunger)\s*=\s*([^,\n]+)",
            body,
        ):
            fields[fm.group(1)] = fm.group(2).strip().rstrip(",")
        # Stop at `cookedhunger` if it comes before something else — body may bleed; safer to stop at next pickloot
        if "cookedhunger" in fields:
            pass  # full block captured
        hunger = lookup(tuning, fields.get("hunger", "0"))
        health = lookup(tuning, fields.get("health", "0"))
        sanity = lookup(tuning, fields.get("sanity", "0"))
        # Mushrooms default to PERISH_FAST (6 days) at the MakePrefab level
        if hunger is None or health is None or sanity is None:
            continue
        out.append({
            "id": name,
            "foodtype": "veggie",
            "hunger": hunger,
            "health": health,
            "sanity": sanity,
            "perish_days": 6.0,
            "secondary_foodtype": None,
            "source": "mushrooms.lua",
        })
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 4. Parse meats.lua per-prefab edible setups
# ─────────────────────────────────────────────────────────────────────────────
# Pattern per prefab block (e.g., for `meat`):
#   local function fn() ... inst.components.edible.foodtype = FOODTYPE.MEAT
#                            inst.components.edible.healthvalue = -TUNING.HEALING_MED
#                            inst.components.edible.hungervalue = TUNING.CALORIES_SMALL
#                            inst.components.edible.sanityvalue = -TUNING.SANITY_LARGE
# Then `Prefab("meat", fn, ...)` at the bottom.
#
# Strategy: find all `Prefab("<id>", <fnname>, ...)` mappings, then for each fn locate
# its body in the same file and extract edible field assignments.

def parse_meats(tuning: dict) -> list[dict]:
    return _parse_per_prefab_edible(tuning, PREFABS / "meats.lua", default_foodtype="meat")


def _parse_per_prefab_edible(tuning: dict, path: Path, default_foodtype: str) -> list[dict]:
    text = path.read_text()
    # Map id → fn name
    id_to_fn = dict(re.findall(r'Prefab\(\s*"([a-z_][a-z0-9_]*)"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)', text))
    out = []
    for prefab_id, fn_name in id_to_fn.items():
        # Locate function body
        fn_re = re.compile(
            rf"local function {re.escape(fn_name)}\([^)]*\)([\s\S]*?)\nend\b",
            re.MULTILINE,
        )
        fnm = fn_re.search(text)
        if not fnm:
            continue
        body = fnm.group(1)
        # Skip cooked / dried / spoiled variants by id pattern (we want raw only)
        if re.search(r"_(cooked|dried|spoiled|rotten)$", prefab_id):
            continue
        if prefab_id.startswith("cooked") or prefab_id.startswith("dried"):
            continue
        fields = {}
        for fm in re.finditer(
            r"inst\.components\.edible\.(foodtype|hungervalue|healthvalue|sanityvalue|secondaryfoodtype)\s*=\s*([^\n]+)",
            body,
        ):
            fields[fm.group(1)] = fm.group(2).strip().rstrip(",")
        if "hungervalue" not in fields:
            continue
        hunger = lookup(tuning, fields["hungervalue"])
        health = lookup(tuning, fields.get("healthvalue", "0"))
        sanity = lookup(tuning, fields.get("sanityvalue", "0"))
        if hunger is None:
            continue
        # foodtype
        ft_raw = fields.get("foodtype", f"FOODTYPE.{default_foodtype.upper()}")
        ft = ft_raw.replace("FOODTYPE.", "").strip().lower()
        # secondary
        secondary = None
        sec_raw = fields.get("secondaryfoodtype")
        if sec_raw:
            secondary = sec_raw.replace("FOODTYPE.", "").strip().lower()
        # perish — meats default to PERISH_MED (10 days) unless overridden
        perish_re = re.search(r"perishable.*?SetPerishTime\(\s*([^)]+)\)", body)
        perish_days = tuning.get("PERISH_MED", 10) / tuning.get("PERISH_ONE_DAY", 1)
        if perish_re:
            v = lookup(tuning, perish_re.group(1).strip())
            if v is not None:
                # Convert seconds to days using TUNING.PERISH_ONE_DAY as unit
                perish_days = v / tuning.get("PERISH_ONE_DAY", 480)
        out.append({
            "id": prefab_id,
            "foodtype": ft if ft else default_foodtype,
            "hunger": hunger,
            "health": health,
            "sanity": sanity,
            "perish_days": round(perish_days, 2) if perish_days else None,
            "secondary_foodtype": secondary,
            "source": path.name,
        })
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 5. Specials — single-prefab files we want (egg, butter, honey, fish, ice, kelp variants)
# ─────────────────────────────────────────────────────────────────────────────

SPECIAL_FILES = [
    ("egg.lua",        "egg"),
    ("butter.lua",     "meat"),     # butter foodtype is dairy in DST but we'll let parser pick up actual
    ("honey.lua",      "goodies"),
    ("ice.lua",        "veggie"),
    ("acorn.lua",      "veggie"),
    ("oceanfishingset.lua", "meat"),  # fishmeat / fishmeat_small via separate; may not match
]


def parse_specials(tuning: dict) -> list[dict]:
    out = []
    for fname, default_ft in SPECIAL_FILES:
        path = PREFABS / fname
        if path.exists():
            out.extend(_parse_per_prefab_edible(tuning, path, default_foodtype=default_ft))
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 6. Korean names from ko.po
# ─────────────────────────────────────────────────────────────────────────────

def load_kopo_names() -> dict[str, str]:
    """Load STRINGS.NAMES.<ID> → Korean string mapping from the workshop ko.po."""
    if not KOPO.exists():
        return {}
    text = KOPO.read_text()
    out = {}
    # Block format:
    #   #. STRINGS.NAMES.MEAT
    #   msgctxt "STRINGS.NAMES.MEAT"
    #   msgid "Meat"
    #   msgstr "고기"
    for m in re.finditer(
        r'msgctxt\s+"STRINGS\.NAMES\.([A-Z0-9_]+)"\s*\nmsgid\s+"[^"]*"\s*\nmsgstr\s+"([^"]*)"',
        text,
    ):
        out[m.group(1).lower()] = m.group(2)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 7. English names from strings.lua STRINGS.NAMES.<ID>
# ─────────────────────────────────────────────────────────────────────────────

def load_english_names() -> dict[str, str]:
    text = STRINGS_LUA.read_text()
    out = {}
    # Find NAMES table block
    m = re.search(r"NAMES\s*=\s*\{([\s\S]*?)\n\s*\}", text)
    if not m:
        return out
    block = m.group(1)
    for ln in re.finditer(r'^\s*([A-Z0-9_]+)\s*=\s*"([^"]+)"', block, re.MULTILINE):
        out[ln.group(1).lower()] = ln.group(2)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 8. Generate raw-foods.ts
# ─────────────────────────────────────────────────────────────────────────────

# Manual exclude list (cooked/dried/non-edible/internal variants that slip through filters)
EXCLUDE_IDS = {
    "humanmeat", "humanmeat_cooked",
    "kabobs",
    "trunk_cooked",
    "boneshard",
    "twigs",
    "lightninggoathorn",
    "nightmarefuel",
    "moonbutterflywings",  # rare; keep if you want
    "acorn",  # FOODTYPE.SEEDS, not a typical "raw eat" food (used for cooking)
}

# Field overrides for items the parser gets wrong (foodtype defaults to MEAT in
# component, so dairy items end up tagged "meat"). Keep this small and grounded
# in actual DST source — verify before adding.
OVERRIDES: dict[str, dict] = {
    "butter": {"foodtype": "dairy"},  # FOODTYPE.DAIRY in DST source
}


def main():
    if not TUNING_LUA.exists():
        print("[!] /tmp/dst-extract not populated. Run unzip first.", file=sys.stderr)
        sys.exit(1)
    tuning = resolve_tuning()
    print(f"[i] resolved {len(tuning)} TUNING constants", file=sys.stderr)

    items: list[dict] = []
    items += parse_veggies(tuning)
    items += parse_mushrooms(tuning)
    items += parse_meats(tuning)
    items += parse_specials(tuning)

    # Dedupe by id (later wins) + apply overrides
    by_id = {}
    for it in items:
        if it["id"] in EXCLUDE_IDS:
            continue
        if it["id"] in OVERRIDES:
            it.update(OVERRIDES[it["id"]])
        by_id[it["id"]] = it
    items = sorted(by_id.values(), key=lambda x: x["id"])

    eng_names = load_english_names()
    ko_names = load_kopo_names()

    print(f"[i] extracted {len(items)} raw foods", file=sys.stderr)

    # Render TS
    lines = [
        "// ---------------------------------------------------------------------------",
        "// AUTO-GENERATED by scripts/extract-raw-foods.py — DO NOT EDIT.",
        "// Source: DST scripts/prefabs/{veggies,mushrooms,meats,...}.lua + ko.po",
        "// Re-run: python3 scripts/extract-raw-foods.py",
        "// ---------------------------------------------------------------------------",
        "",
        "export interface RawFood {",
        "  id: string;",
        "  name: string;            // English name",
        "  nameKo?: string;         // Korean (DST community ko.po)",
        "  foodType: string;        // primary FOODTYPE (lowercase)",
        "  secondaryFoodType?: string;",
        "  hunger: number;          // raw eat — base value (before character/spice modifiers)",
        "  health: number;",
        "  sanity: number;",
        "  perishDays: number;      // perish time in DST days (480s/day)",
        "  image?: string;          // override default `${id}.png`",
        "}",
        "",
        "export const rawFoods: RawFood[] = [",
    ]
    for it in items:
        eng = eng_names.get(it["id"], it["id"].replace("_", " ").title())
        ko = ko_names.get(it["id"], "")
        ko_field = f', nameKo: {json.dumps(ko, ensure_ascii=False)}' if ko else ""
        secondary = it.get("secondary_foodtype")
        secondary_field = f', secondaryFoodType: "{secondary}"' if secondary else ""
        lines.append(
            f'  {{ id: "{it["id"]}", name: {json.dumps(eng)}{ko_field}, '
            f'foodType: "{it["foodtype"]}"{secondary_field}, '
            f'hunger: {it["hunger"]}, health: {it["health"]}, sanity: {it["sanity"]}, '
            f'perishDays: {it["perish_days"]} }},'
        )
    lines += ["];", ""]

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(lines))
    print(f"[✓] wrote {OUTPUT} ({len(items)} entries)", file=sys.stderr)


if __name__ == "__main__":
    main()
