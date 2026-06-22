#!/usr/bin/env python3
"""
Build src/data/skins.ts from game scripts + ko.po + extracted icons.

Sources (all under ~/dst-game-snapshot/scripts/, set up by sync-game-data.sh):
  - prefabs/skinprefabs.lua : CreatePrefabSkin(id, { rarity, rarity_modifier, type, base_prefab, skin_tags, release_group, ... })
  - skin_strings.lua        : SKIN_NAMES / SKIN_QUOTES (English)
  - skin_set_info.lua       : sets like emote_carol → ["wendy_ice", ...]
  - recipes.lua             : builder_tag / builder_skill → character-exclusive crafting (authoritative
                              source for "which character can craft this prefab")
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
BODY_SKINS_DIR = REPO_ROOT / "public" / "images" / "skins-body"
OUTPUT_TS = REPO_ROOT / "src" / "data" / "skins.ts"

# Character key → display name used by wiki.gg file names. WX-78 hyphen
# becomes an underscore on the wiki side.
WIKI_CHAR_NAME: dict[str, str] = {
    "wilson": "Wilson", "willow": "Willow", "wolfgang": "Wolfgang",
    "wendy": "Wendy", "wickerbottom": "Wickerbottom", "wx78": "WX_78",
    "wes": "Wes", "maxwell": "Maxwell", "woodie": "Woodie",
    "wigfrid": "Wigfrid", "webber": "Webber", "winona": "Winona",
    "warly": "Warly", "wortox": "Wortox", "wormwood": "Wormwood",
    "wurt": "Wurt", "walter": "Walter", "wanda": "Wanda",
}

# In-game prefab → canonical character key. Some prefabs use the legacy
# spelling (waxwell, wathgrithr) while the wiki uses the modern display name.
BASE_PREFAB_TO_CHARACTER: dict[str, str] = {
    "wilson": "wilson", "willow": "willow", "wolfgang": "wolfgang",
    "wendy": "wendy", "wickerbottom": "wickerbottom", "wx78": "wx78",
    "wes": "wes", "waxwell": "maxwell", "maxwell": "maxwell",
    "woodie": "woodie", "wathgrithr": "wigfrid", "wigfrid": "wigfrid",
    "webber": "webber", "winona": "winona", "warly": "warly",
    "wortox": "wortox", "wormwood": "wormwood", "wurt": "wurt",
    "walter": "walter", "wanda": "wanda",
}

SNAPSHOT = Path.home() / "dst-game-snapshot"
SKINPREFABS_LUA = SNAPSHOT / "scripts" / "prefabs" / "skinprefabs.lua"
SKIN_STRINGS_LUA = SNAPSHOT / "scripts" / "skin_strings.lua"
SKIN_SET_INFO_LUA = SNAPSHOT / "scripts" / "skin_set_info.lua"
RECIPES_LUA = SNAPSHOT / "scripts" / "recipes.lua"
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


# Builder tag (in recipes.lua) → canonical character key. Source: game source
# scripts/components/builder.lua (each character adds these tags via their character
# component). One curated tag → character lookup, no app-side guessing.
BUILDER_TAG_CHAR: dict[str, str] = {
    "pyromaniac": "willow",
    "ghostlyfriend": "wendy",
    "elixirbrewer": "wendy",
    "bookbuilder": "wickerbottom",
    "strongman": "wolfgang",
    "balloonomancer": "wes",
    "shadowmagic": "maxwell",
    "werehuman": "woodie",
    "cancarveboards": "woodie",
    "valkyrie": "wigfrid",
    "battlesinger": "wigfrid",
    "spiderwhisperer": "webber",
    "handyperson": "winona",
    "portableengineer": "winona",
    "masterchef": "warly",
    "professionalchef": "warly",
    "plantkin": "wormwood",
    "merm_builder": "wurt",
    "pinetreepioneer": "walter",
    "pebblemaker": "walter",
    "clockmaker": "wanda",
    "upgrademoduleowner": "wx78",
}

# builder_skill prefix → character (for skill-tree-locked recipes like walter_ammo_*).
BUILDER_SKILL_CHAR_PREFIXES: dict[str, str] = {
    "walter_": "walter",
    "wanda_": "wanda",
    "wickerbottom_": "wickerbottom",
    "wx78_": "wx78",
    "winona_": "winona",
    "wendy_": "wendy",
    "willow_": "willow",
    "wormwood_": "wormwood",
    "wurt_": "wurt",
    "warly_": "warly",
    "wolfgang_": "wolfgang",
    "wigfrid_": "wigfrid",
    "wathgrithr_": "wigfrid",
    "maxwell_": "maxwell",
    "waxwell_": "maxwell",
    "webber_": "webber",
    "wortox_": "wortox",
    "wilson_": "wilson",
    "woodie_": "woodie",
    "wes_": "wes",
}


def parse_recipes_character_map(path: Path) -> dict[str, str]:
    """
    Map base_prefab → character key for recipes restricted to one character.

    Two formats coexist in recipes.lua and we handle both:
      - Recipe2("name", …, {builder_tag="X", builder_skill="Y_…"})  — new style
      - Recipe("name",  …, nil, nil, true, nil, "X")                 — old positional style
        (builder_tag is one of the trailing positional args; we detect it
         as any bare quoted string on the line that matches a known tag)

    Authoritative: same source the game uses to enforce crafting permission.
    """
    out: dict[str, str] = {}
    recipe_name_re = re.compile(r'^\s*Recipe2?\(\s*"([a-z0-9_]+)"')
    tag_kv_re = re.compile(r'builder_tag\s*=\s*"([^"]+)"')
    skill_kv_re = re.compile(r'builder_skill\s*=\s*"([^"]+)"')
    # Match any "tag" that is a known builder_tag — used to catch old-style
    # positional Recipe() args where the tag is just a quoted string.
    known_tag_re = re.compile(
        r'"(' + "|".join(re.escape(t) for t in BUILDER_TAG_CHAR.keys()) + r')"'
    )
    for line in path.read_text(encoding="utf-8").splitlines():
        name_m = recipe_name_re.match(line)
        if not name_m:
            continue
        prefab = name_m.group(1)
        char: str | None = None
        tag_m = tag_kv_re.search(line)
        if tag_m:
            char = BUILDER_TAG_CHAR.get(tag_m.group(1))
        if not char:
            skill_m = skill_kv_re.search(line)
            if skill_m:
                for prefix, c in BUILDER_SKILL_CHAR_PREFIXES.items():
                    if skill_m.group(1).startswith(prefix):
                        char = c
                        break
        if not char:
            # Fall back to old-style positional: any known builder_tag literal.
            # Safe because tag names like "shadowmagic" don't collide with prefab/ingredient names.
            bare_m = known_tag_re.search(line)
            if bare_m:
                char = BUILDER_TAG_CHAR.get(bare_m.group(1))
        if char:
            out[prefab] = char
    return out


# Prefab-name → character (for items without recipes — character base outfits,
# innate hats, etc.). Word boundary match: "walter" anywhere in base_prefab as a
# token. Aliases map in-game prefab names to canonical display ids.
PREFAB_NAME_CHAR_ALIAS: dict[str, str] = {
    "wilson": "wilson", "willow": "willow", "wolfgang": "wolfgang",
    "wendy": "wendy", "abigail": "wendy",  # Wendy's sister, grouped with Wendy
    "wickerbottom": "wickerbottom", "wx78": "wx78", "wes": "wes",
    "waxwell": "maxwell", "maxwell": "maxwell",
    "woodie": "woodie", "wathgrithr": "wigfrid", "wigfrid": "wigfrid",
    "webber": "webber", "winona": "winona", "warly": "warly",
    "wortox": "wortox", "wormwood": "wormwood", "wurt": "wurt",
    "walter": "walter", "wanda": "wanda",
}
PREFAB_NAME_CHAR_RE = re.compile(
    r'(?:^|_)(' + "|".join(PREFAB_NAME_CHAR_ALIAS.keys()) + r')(?:_|$|hat)'
)


def character_for(base_prefab: str, recipes_map: dict[str, str]) -> str | None:
    """Authoritative lookup first (recipes.lua), then prefab-name word boundary."""
    if base_prefab in recipes_map:
        return recipes_map[base_prefab]
    m = PREFAB_NAME_CHAR_RE.search(base_prefab)
    if m:
        return PREFAB_NAME_CHAR_ALIAS[m.group(1)]
    return None


# ─── builder ────────────────────────────────────────────────────────────────


def main() -> None:
    skinprefabs_path = _resolve(SKINPREFABS_LUA, FALLBACK_DIR / "skinprefabs.lua")
    skin_strings_path = _resolve(SKIN_STRINGS_LUA, FALLBACK_DIR / "skin_strings.lua")
    skin_sets_path = _resolve(SKIN_SET_INFO_LUA, FALLBACK_DIR / "skin_set_info.lua")
    recipes_path = _resolve(RECIPES_LUA, FALLBACK_DIR / "recipes.lua")
    kopo_path = _resolve(KO_PO, KOPO_FALLBACK)

    if not SKINS_DIR.exists():
        sys.exit(f"skin icons not extracted yet. Run scripts/extract-skin-icons.py first ({SKINS_DIR}).")
    available_icons = {p.stem for p in SKINS_DIR.glob("*.png")}
    print(f"Available inventory icons: {len(available_icons)}")

    body_files: set[str] = set()
    if BODY_SKINS_DIR.exists():
        body_files = {p.name for p in BODY_SKINS_DIR.glob("*.png")}
    print(f"Available body images: {len(body_files)}")

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

    recipes_map = parse_recipes_character_map(recipes_path)
    print(f"Recipe character map: {len(recipes_map)} prefabs assigned to a character via builder_tag/skill")

    # ── Body image matching ──────────────────────────────────────────────
    # Wiki uses character_display + skin_label, e.g. "Wilson_Guest_of_Honor_in_game.png".
    # Build a lookup once and try a few label variants per skin.
    def wiki_label(name_en: str) -> str:
        """Strip 'The ' prefix, replace spaces with underscores. Handle 'Beard' detection."""
        s = name_en
        if s.lower().startswith("the "):
            s = s[4:]
        return s.replace(" ", "_").replace("'", "")

    def find_body_image(char_key: str, skin_id: str, name_en: str) -> str | None:
        wiki_char = WIKI_CHAR_NAME.get(char_key)
        if not wiki_char:
            return None
        # Mob-costume skin pieces (_d head, _p variant) reuse the main costume's
        # body image — strip the trailing _d/_p and look up the parent.
        parent_id = skin_id
        if skin_id.endswith("_d") or skin_id.endswith("_p"):
            parent_id = skin_id[:-2]
        # _none = the character's default look; wiki labels it "Original".
        if skin_id.endswith("_none"):
            return f"/images/skins-body/{wiki_char}_Original_in_game.png" \
                if f"{wiki_char}_Original_in_game.png" in body_files else None
        candidates = [
            f"{wiki_char}_{wiki_label(name_en)}_in_game.png",
            # Raw name without "The" stripping
            f"{wiki_char}_{name_en.replace(' ', '_').replace(chr(39), '')}_in_game.png",
            # skin_id-suffix fallback (wilson_formal → Formal)
            f"{wiki_char}_{skin_id.split('_', 1)[1].title()}_in_game.png" if "_" in skin_id else None,
            # parent (without _d/_p) — for mob-costume mask/legs variants
            f"{wiki_char}_{parent_id.split('_', 1)[1].title()}_in_game.png" if parent_id != skin_id and "_" in parent_id else None,
        ]
        for c in candidates:
            if c and c in body_files:
                return f"/images/skins-body/{c}"
        return None

    rows = []
    char_counts: dict[str, int] = {}
    body_count = 0
    # Iterate over every skin in skinprefabs.lua. Emit if we have an inventory
    # icon OR a wiki body image — either gives the user something to look at.
    for skin_id in sorted(skin_meta.keys()):
        meta = skin_meta[skin_id]
        has_icon = skin_id in available_icons
        # Determine character first so we can probe for a body image.
        char = character_for(meta["base_prefab"], recipes_map)
        # If base_prefab is just the character name (legacy `wilson`/`waxwell` etc),
        # the recipe map won't have it. Use the explicit base→character mapping.
        if not char:
            char = BASE_PREFAB_TO_CHARACTER.get(meta["base_prefab"])
        body_image = None
        if char and meta["type"] == "base":
            body_image = find_body_image(char, skin_id, names_en.get(skin_id, ""))

        if not has_icon and not body_image:
            continue  # nothing to show

        row = {
            "id": skin_id,
            "base_prefab": meta["base_prefab"],
            "type": meta["type"],
            "rarity": meta["rarity"],
            "skin_tags": meta["skin_tags"],
            "release_group": meta["release_group"],
            "name_en": names_en.get(skin_id, skin_id),
            "name_ko": names_ko.get(skin_id, names_en.get(skin_id, skin_id)),
        }
        if has_icon:
            row["icon"] = f"/images/skins/{skin_id}.png"
        if body_image:
            row["body_image"] = body_image
            body_count += 1
        if meta["rarity_modifier"]:
            row["rarity_modifier"] = meta["rarity_modifier"]
        if skin_id in quotes_en:
            row["quote_en"] = quotes_en[skin_id]
        if skin_id in quotes_ko:
            row["quote_ko"] = quotes_ko[skin_id]
        if skin_id in skin_to_set:
            row["set_id"] = skin_to_set[skin_id]
        if char:
            row["character"] = char
            char_counts[char] = char_counts.get(char, 0) + 1
        rows.append(row)

    print(f"Character coverage: {sum(char_counts.values())} skins across {len(char_counts)} characters")
    for c, n in sorted(char_counts.items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")
    print(f"Body images matched: {body_count}")

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
  /** Canonical character key (e.g. "walter", "wigfrid") if the underlying
   *  prefab is character-locked. Sourced from recipes.lua builder_tag /
   *  builder_skill, with a fallback to word-boundary match on the prefab name. */
  character?: string;
  /** Inventory icon (extracted from the game's KTEX atlas). Present for item
   *  skins; usually absent for character body skins. */
  icon?: string;
  /** Full-body in-game screenshot scraped from dontstarve.wiki.gg. Present for
   *  character body (base) skins. Wiki content is CC BY-SA — attribution shown
   *  in the Skins tab footer. */
  body_image?: string;
}

export const SKINS: SkinEntry[] = '''

    OUTPUT_TS.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(rows, ensure_ascii=False, indent=2)
    OUTPUT_TS.write_text(header + body + ";\n", encoding="utf-8")


if __name__ == "__main__":
    main()
