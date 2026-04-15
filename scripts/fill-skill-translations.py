#!/usr/bin/env python3
"""
Fill in missing skill tree translations from in-game sources.

Reads:
  - /tmp/dst-extract/scripts/strings.lua            (english source)
  - /tmp/dst-extract/scripts/prefabs/skilltree_<char>.lua  (per-skill string keys)
  - ~/Library/.../2391246365/scripts/languages/ko.po   (community Korean translations)

Writes:
  - src/data/skill-trees/translations.ts (in-place merge into skillTranslations record)

Skips entries that already exist in translations.ts. Also reports any missing
strings that couldn't be resolved (manual fix needed).

Usage:
  python3 scripts/fill-skill-translations.py --dry-run   # preview
  python3 scripts/fill-skill-translations.py             # apply
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TS_DIR = REPO / "src" / "data" / "skill-trees"
TRANSLATIONS_FILE = TS_DIR / "translations.ts"
LUA_DIR = Path("/tmp/dst-extract/scripts/prefabs")
STRINGS_LUA = Path("/tmp/dst-extract/scripts/strings.lua")
KO_PO = Path(os.path.expanduser(
    "~/Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/scripts/languages/ko.po"
))

# Map our characterId → lua filename stem
CHAR_TO_LUA = {
    "wilson": "wilson",
    "willow": "willow",
    "wendy": "wendy",
    "woodie": "woodie",
    "wigfrid": "wathgrithr",
    "wormwood": "wormwood",
    "winona": "winona",
    "wortox": "wortox",
    "wurt": "wurt",
    "walter": "walter",
    "wolfgang": "wolfgang",
}


def find_balanced(text: str, start: int, open_ch: str, close_ch: str) -> int:
    depth = 0
    i = start
    in_str: str | None = None
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == in_str:
                in_str = None
        else:
            if ch in ('"', "'"):
                in_str = ch
            elif ch == open_ch:
                depth += 1
            elif ch == close_ch:
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    raise ValueError("unbalanced")


# ----------------------------------------------------------------------------
# strings.lua parser → english source
# ----------------------------------------------------------------------------

def parse_strings_lua() -> dict[str, dict[str, str]]:
    """Return {CHAR_UPPER: {KEY: value}}.

    Parses STRINGS.SKILLTREE = { CHAR1 = {...}, CHAR2 = {...} }.
    """
    text = STRINGS_LUA.read_text(encoding="utf-8")
    result: dict[str, dict[str, str]] = {}

    m = re.search(r"STRINGS\.SKILLTREE\s*=\s*\{", text)
    if not m:
        return result
    open_brace = m.end() - 1
    close_brace = find_balanced(text, open_brace, "{", "}")
    body = text[open_brace + 1:close_brace]

    # Find each top-level `<CHAR> = { ... },`
    char_pat = re.compile(r"(\w+)\s*=\s*\{")
    pos = 0
    while pos < len(body):
        cm = char_pat.search(body, pos)
        if not cm:
            break
        char_name = cm.group(1)
        brace_at = cm.end() - 1
        try:
            char_close = find_balanced(body, brace_at, "{", "}")
        except ValueError:
            break
        char_body = body[brace_at + 1:char_close]
        # Parse key = "value" pairs (could be multi-line strings)
        char_dict: dict[str, str] = {}
        # Use a regex that handles escaped quotes
        for km in re.finditer(r'(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"', char_body):
            char_dict[km.group(1)] = km.group(2).replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
        result[char_name] = char_dict
        pos = char_close + 1
    return result


# ----------------------------------------------------------------------------
# ko.po parser → korean translations
# ----------------------------------------------------------------------------

def parse_ko_po() -> dict[str, dict[str, str]]:
    """Return {CHAR_UPPER: {KEY: ko_text}}.

    Parses entries like:
      msgctxt "STRINGS.SKILLTREE.WORMWOOD.BLOOMING_SPEED1_TITLE"
      msgid "Growth Spurt I"
      msgstr "성장 가속 I"
    """
    text = KO_PO.read_text(encoding="utf-8")
    result: dict[str, dict[str, str]] = {}

    # Split by blank lines
    blocks = re.split(r"\n\n+", text)
    pat_ctxt = re.compile(r'msgctxt\s+"STRINGS\.SKILLTREE\.([^.]+)\.([^"]+)"')
    pat_msgstr_first = re.compile(r'msgstr\s+"((?:[^"\\]|\\.)*)"')
    pat_msgstr_cont = re.compile(r'^"((?:[^"\\]|\\.)*)"', re.MULTILINE)

    for block in blocks:
        cm = pat_ctxt.search(block)
        if not cm:
            continue
        char = cm.group(1)
        key = cm.group(2)
        # Find msgstr — may span multiple lines
        sm = pat_msgstr_first.search(block)
        if not sm:
            continue
        # Get start of msgstr line, then collect continuation lines
        msgstr_start = sm.start()
        rest = block[msgstr_start:]
        parts = []
        # First line
        parts.append(sm.group(1))
        # Subsequent continuation lines (lines starting with ")
        for line in rest.split("\n")[1:]:
            cont = re.match(r'^"((?:[^"\\]|\\.)*)"', line)
            if cont:
                parts.append(cont.group(1))
            else:
                break
        ko = "".join(parts).replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
        if not ko.strip():
            continue
        result.setdefault(char, {})[key] = ko
    return result


# ----------------------------------------------------------------------------
# Per-character lua parser → skill_id → (title_key, desc_key)
# ----------------------------------------------------------------------------

def extract_skill_string_keys(char_id: str) -> dict[str, tuple[str | None, str | None]]:
    """For each skill in skilltree_<char>.lua, return its title/desc string keys.

    Order of resolution (matching lua's BuildSkillsData postprocessing):
      1. Explicit `title = SKILLTREESTRINGS.<KEY>_TITLE` in the skill block
      2. Explicit `title = STRINGS.SKILLTREE.<CHAR>.<KEY>_TITLE`
      3. Auto-derived: `<UPPERCASE_SKILL_NAME>_TITLE` (only for non-lock skills)
    """
    lua_stem = CHAR_TO_LUA[char_id]
    lua_path = LUA_DIR / f"skilltree_{lua_stem}.lua"
    text = lua_path.read_text(encoding="utf-8")

    result: dict[str, tuple[str | None, str | None]] = {}

    # Find all `wxxx_yyy = { ... }` blocks at depth 1+ inside the file
    # Heuristic: find skill name pattern at start of line (with leading whitespace)
    skill_name_pat = re.compile(rf"^(\s+)({lua_stem}_\w+)\s*=\s*\{{", re.MULTILINE)
    for m in skill_name_pat.finditer(text):
        skill_name = m.group(2)
        brace_at = m.end() - 1
        try:
            close = find_balanced(text, brace_at, "{", "}")
        except ValueError:
            continue
        block = text[brace_at + 1:close]

        # Skip lock entries (they have lock_open and no display title typically)
        if "lock_open" in block:
            # Locks may still have a desc. We'll record desc only if explicit.
            title_key = None
            desc_m = re.search(r'desc\s*=\s*(?:SKILLTREESTRINGS\.|STRINGS\.SKILLTREE\.\w+\.)(\w+_DESC)', block)
            desc_key = desc_m.group(1) if desc_m else None
            result[skill_name] = (title_key, desc_key)
            continue

        # Explicit title
        title_m = re.search(r'title\s*=\s*(?:SKILLTREESTRINGS\.|STRINGS\.SKILLTREE\.\w+\.)(\w+_TITLE)', block)
        desc_m = re.search(r'desc\s*=\s*(?:SKILLTREESTRINGS\.|STRINGS\.SKILLTREE\.\w+\.)(\w+_DESC)', block)
        title_key = title_m.group(1) if title_m else None
        desc_key = desc_m.group(1) if desc_m else None

        # Auto-derive if not set (lua does this in postprocessing)
        if title_key is None:
            title_key = skill_name.upper() + "_TITLE"
        if desc_key is None:
            desc_key = skill_name.upper() + "_DESC"

        result[skill_name] = (title_key, desc_key)
    return result


# ----------------------------------------------------------------------------
# Existing translations parser
# ----------------------------------------------------------------------------

def parse_existing_skill_keys() -> set[str]:
    """Return set of skill IDs already in skillTranslations."""
    text = TRANSLATIONS_FILE.read_text(encoding="utf-8")
    m = re.search(r"export const skillTranslations[^=]*=\s*\{", text)
    if not m:
        return set()
    start = m.end() - 1
    end = find_balanced(text, start, "{", "}")
    body = text[start + 1:end]
    return set(re.findall(r"^\s*(\w+):\s*\{", body, re.MULTILINE))


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------

def escape_ts_string(s: str) -> str:
    """Escape a string for use in a TypeScript double-quoted literal."""
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def main() -> None:
    dry_run = "--dry-run" in sys.argv

    print("Loading english source from strings.lua...")
    english = parse_strings_lua()
    print(f"  {len(english)} characters, total keys: {sum(len(v) for v in english.values())}")

    print("Loading korean source from ko.po...")
    korean = parse_ko_po()
    print(f"  {len(korean)} characters, total keys: {sum(len(v) for v in korean.values())}")

    print("Loading existing translations...")
    existing = parse_existing_skill_keys()
    print(f"  {len(existing)} skills already translated")

    # Build new entries
    new_entries: list[tuple[str, str, str, str, str]] = []  # (skill_id, en_title, ko_title, en_desc, ko_desc)
    unresolved: list[str] = []

    for char_id in CHAR_TO_LUA:
        char_upper = CHAR_TO_LUA[char_id].upper()
        try:
            skill_keys = extract_skill_string_keys(char_id)
        except FileNotFoundError:
            continue

        en_dict = english.get(char_upper, {})
        ko_dict = korean.get(char_upper, {})

        for skill_name, (title_key, desc_key) in sorted(skill_keys.items()):
            if skill_name in existing:
                continue
            # Lock entries (lock_open) have title_key=None — they belong in
            # lockTranslations, not skillTranslations. Skip silently.
            if title_key is None:
                continue
            en_title = en_dict.get(title_key) if title_key else None
            ko_title = ko_dict.get(title_key) if title_key else None
            en_desc = en_dict.get(desc_key) if desc_key else None
            ko_desc = ko_dict.get(desc_key) if desc_key else None

            if not (en_title or en_desc):
                unresolved.append(f"{char_id}/{skill_name} (keys: {title_key} / {desc_key})")
                continue

            new_entries.append((
                skill_name,
                en_title or "",
                ko_title or en_title or "",
                en_desc or "",
                ko_desc or en_desc or "",
            ))

    print(f"\nNew entries to add: {len(new_entries)}")
    print(f"Unresolved: {len(unresolved)}")
    for u in unresolved[:20]:
        print(f"  - {u}")
    if len(unresolved) > 20:
        print(f"  ... and {len(unresolved) - 20} more")

    if not new_entries:
        print("Nothing to do.")
        return

    if dry_run:
        print("\nSample of new entries (dry-run, not applied):")
        for skill_id, en_t, ko_t, en_d, ko_d in new_entries[:10]:
            print(f"  {skill_id}:")
            print(f"    en: {en_t}")
            print(f"    ko: {ko_t}")
        return

    # Apply: insert new entries before the closing `}` of skillTranslations
    text = TRANSLATIONS_FILE.read_text(encoding="utf-8")
    m = re.search(r"export const skillTranslations[^=]*=\s*\{", text)
    if not m:
        print("FATAL: skillTranslations not found")
        sys.exit(1)
    start = m.end() - 1
    end = find_balanced(text, start, "{", "}")

    # Build insertion: alphabetically by skill_id, indented 2 spaces
    insertion_lines = []
    for skill_id, en_t, ko_t, en_d, ko_d in sorted(new_entries):
        insertion_lines.append(f"  {skill_id}: {{")
        insertion_lines.append(
            f'    title: {{ en: "{escape_ts_string(en_t)}", ko: "{escape_ts_string(ko_t)}" }},'
        )
        insertion_lines.append(
            f'    desc: {{ en: "{escape_ts_string(en_d)}", ko: "{escape_ts_string(ko_d)}" }},'
        )
        insertion_lines.append("  },")
    insertion = "\n".join(insertion_lines) + "\n"

    new_text = text[:end] + insertion + text[end:]
    TRANSLATIONS_FILE.write_text(new_text, encoding="utf-8")
    print(f"\nWrote {len(new_entries)} new entries to {TRANSLATIONS_FILE}")


if __name__ == "__main__":
    main()
