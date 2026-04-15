#!/usr/bin/env python3
"""
Check which skill tree elements lack proper Korean translations.

Reports:
  - Skill nodes (with icon, i.e. real skills) missing from skillTranslations
  - Skill entries where ko === en (likely untranslated stub)
  - Skill entries with empty ko
  - Group IDs used by data but missing from groupTranslations
  - Lock nodes with manual/skill_count/etc. that lack a lockTranslations entry
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TS_DIR = REPO / "src" / "data" / "skill-trees"
TRANSLATIONS_FILE = TS_DIR / "translations.ts"

ALL_FILES = [
    "walter", "wathgrithr", "wendy", "willow", "wilson",
    "winona", "wolfgang", "woodie", "wormwood", "wortox", "wurt",
]


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


def parse_ts_nodes(ts_text: str) -> list[dict]:
    """Same node parser as verify-skill-trees.py — single + multi line literals."""
    nodes: list[dict] = []
    m = re.search(r"nodes\s*:\s*\[", ts_text)
    if not m:
        return nodes
    arr_start = m.end() - 1
    arr_end = find_balanced(ts_text, arr_start, "[", "]")
    body = ts_text[arr_start + 1:arr_end]

    i = 0
    while i < len(body):
        if body[i] == "{":
            close = find_balanced(body, i, "{", "}")
            entry_body = body[i + 1:close]
            id_m = re.search(r'\bid\s*:\s*"([^"]+)"', entry_body)
            if id_m:
                node = {"id": id_m.group(1)}
                gm = re.search(r'\bgroup\s*:\s*"([^"]+)"', entry_body)
                node["group"] = gm.group(1) if gm else None
                node["has_icon"] = bool(re.search(r'\bicon\s*:\s*"', entry_body))
                node["has_lock_type"] = bool(re.search(r"\blockType\s*:", entry_body))
                lm = re.search(r"\blockType\s*:\s*\{[^{}]*\btype\s*:\s*\"([^\"]+)\"", entry_body)
                node["lock_type_kind"] = lm.group(1) if lm else None
                nodes.append(node)
            i = close + 1
        else:
            i += 1
    return nodes


def parse_translations() -> tuple[dict[str, dict], dict[str, dict], dict[str, dict]]:
    """Return (skill_translations, group_translations, lock_translations)."""
    text = TRANSLATIONS_FILE.read_text(encoding="utf-8")

    def extract_record(record_name: str) -> dict[str, dict]:
        out: dict[str, dict] = {}
        m = re.search(rf"export const {record_name}[^=]*=\s*\{{", text)
        if not m:
            return out
        start = m.end() - 1
        end = find_balanced(text, start, "{", "}")
        body = text[start + 1:end]

        # Walk character by character. When we see `<key>: {`, capture key and parse the brace block.
        # Then jump past the closing brace of that block.
        key_pat = re.compile(r'\s*(?:"([^"]+)"|(\w+))\s*:\s*\{')
        pos = 0
        while pos < len(body):
            km = key_pat.match(body, pos)
            if km:
                key = km.group(1) or km.group(2)
                brace_at = km.end() - 1  # the `{` is the last char matched
                try:
                    close = find_balanced(body, brace_at, "{", "}")
                except ValueError:
                    break
                inner = body[brace_at + 1:close]

                entry: dict = {}
                for field in ("title", "desc"):
                    fm = re.search(rf'\b{field}\s*:\s*\{{', inner)
                    if fm:
                        fb = fm.end() - 1
                        try:
                            fc = find_balanced(inner, fb, "{", "}")
                        except ValueError:
                            continue
                        field_body = inner[fb + 1:fc]
                        en = re.search(r'\ben\s*:\s*"((?:[^"\\]|\\.)*)"', field_body)
                        ko = re.search(r'\bko\s*:\s*"((?:[^"\\]|\\.)*)"', field_body)
                        entry[field] = {
                            "en": en.group(1) if en else None,
                            "ko": ko.group(1) if ko else None,
                        }
                if not entry:
                    en = re.search(r'\ben\s*:\s*"((?:[^"\\]|\\.)*)"', inner)
                    ko = re.search(r'\bko\s*:\s*"((?:[^"\\]|\\.)*)"', inner)
                    entry = {
                        "en": en.group(1) if en else None,
                        "ko": ko.group(1) if ko else None,
                    }
                out[key] = entry
                pos = close + 1
            else:
                pos += 1
        return out

    return (
        extract_record("skillTranslations"),
        extract_record("groupTranslations"),
        extract_record("lockTranslations"),
    )


def is_untranslated(en: str | None, ko: str | None) -> str | None:
    if ko is None:
        return "missing ko"
    if ko.strip() == "":
        return "empty ko"
    if en is not None and ko == en:
        return "ko == en"
    # Heuristic: if ko has zero hangul chars but en has letters, likely untranslated
    has_hangul = any("\uac00" <= c <= "\ud7a3" for c in ko)
    if not has_hangul and en and any(c.isalpha() for c in en):
        return "no hangul in ko"
    return None


def main() -> None:
    skill_t, group_t, lock_t = parse_translations()
    print(f"Loaded {len(skill_t)} skill, {len(group_t)} group, {len(lock_t)} lock translations\n")

    # Collect all node info from data files
    all_nodes: list[tuple[str, dict]] = []  # (char, node)
    for stem in ALL_FILES:
        path = TS_DIR / f"{stem}.ts"
        if not path.exists():
            continue
        nodes = parse_ts_nodes(path.read_text(encoding="utf-8"))
        for n in nodes:
            all_nodes.append((stem, n))

    print(f"=== SKILLS ({sum(1 for _, n in all_nodes if n['has_icon'])} with icon) ===\n")
    missing_skills = 0
    untranslated_skills = 0
    for char, node in all_nodes:
        if not node["has_icon"]:
            continue
        nid = node["id"]
        entry = skill_t.get(nid)
        if not entry:
            print(f"  ❌ MISSING: [{char}] {nid}")
            missing_skills += 1
            continue
        # title check
        title = entry.get("title", {})
        prob = is_untranslated(title.get("en"), title.get("ko"))
        if prob:
            print(f"  ⚠️  TITLE [{prob}]: [{char}] {nid}  en={title.get('en')!r}  ko={title.get('ko')!r}")
            untranslated_skills += 1
            continue
        desc = entry.get("desc", {})
        prob = is_untranslated(desc.get("en"), desc.get("ko"))
        if prob:
            print(f"  ⚠️  DESC  [{prob}]: [{char}] {nid}  en={desc.get('en')[:60]!r}...  ko={desc.get('ko')[:60]!r}...")
            untranslated_skills += 1

    print(f"\n=== GROUPS ===\n")
    used_groups = {n["group"] for _, n in all_nodes if n["group"]}
    missing_groups = 0
    untranslated_groups = 0
    for g in sorted(used_groups):
        entry = group_t.get(g)
        if not entry:
            print(f"  ❌ MISSING group: {g}")
            missing_groups += 1
            continue
        prob = is_untranslated(entry.get("en"), entry.get("ko"))
        if prob:
            print(f"  ⚠️  GROUP [{prob}]: {g}  en={entry.get('en')!r}  ko={entry.get('ko')!r}")
            untranslated_groups += 1

    print(f"\n=== LOCKS (manual type only — others use i18n keys) ===\n")
    # Standard lock types (boss_kill, skill_count, etc.) are translated via
    # src/lib/i18n.ts (skills_gate_*) — no per-node translation needed.
    # Only `manual` locks store their description inline in lockType.desc_ko/desc_en
    # in the data file itself, so we check those.
    missing_locks = 0
    untranslated_locks = 0
    for char, node in all_nodes:
        if node["has_icon"]:
            continue
        if node["lock_type_kind"] != "manual":
            continue
        # Re-parse the original ts file to extract this node's desc_ko/desc_en
        path = TS_DIR / f"{char}.ts"
        try:
            ts_text = path.read_text(encoding="utf-8")
        except FileNotFoundError:
            continue
        # Find `id: "<nid>"` line(s)
        nid = node["id"]
        m = re.search(rf'id:\s*"{re.escape(nid)}".*?lockType:\s*\{{[^}}]*type:\s*"manual"[^}}]*\}}', ts_text, re.DOTALL)
        if not m:
            print(f"  ❌ MISSING lock: [{char}] {nid}  (couldn't parse)")
            missing_locks += 1
            continue
        block = m.group(0)
        ko_m = re.search(r'desc_ko:\s*"((?:[^"\\]|\\.)*)"', block)
        en_m = re.search(r'desc_en:\s*"((?:[^"\\]|\\.)*)"', block)
        ko = ko_m.group(1) if ko_m else ""
        en = en_m.group(1) if en_m else ""
        prob = is_untranslated(en, ko)
        if prob:
            print(f"  ⚠️  LOCK [{prob}]: [{char}] {nid}  en={en!r}  ko={ko!r}")
            untranslated_locks += 1

    print(f"\n{'=' * 50}")
    print(f"Skills:  {missing_skills} missing, {untranslated_skills} untranslated")
    print(f"Groups:  {missing_groups} missing, {untranslated_groups} untranslated")
    print(f"Locks:   {missing_locks} missing, {untranslated_locks} untranslated")
    total = missing_skills + untranslated_skills + missing_groups + untranslated_groups + missing_locks + untranslated_locks
    sys.exit(1 if total > 0 else 0)


if __name__ == "__main__":
    main()
