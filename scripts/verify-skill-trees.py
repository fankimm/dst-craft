#!/usr/bin/env python3
"""
Verify our TS skill tree data against the in-game lua source.

Compares (per character):
  - Skill ID set (missing / extra)
  - group
  - root flag
  - connects (set)
  - tags (set)
  - lock factory recognition (allegiance locks etc.)

Skips lock_open semantics (function bodies) — those need manual review.

Usage:
  python3 scripts/verify-skill-trees.py [character_id]

If no character given, verifies all 11 characters.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
LUA_DIR = Path("/tmp/dst-extract/scripts/prefabs")
TS_DIR = REPO / "src" / "data" / "skill-trees"

# Map our characterId → lua filename stem (most are identical, wigfrid is wathgrithr)
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
    "wx-78": "wx78",
}

# Map lua filename stem → TS filename stem (wigfrid uses wathgrithr.ts, wx-78 uses wx-78.ts)
LUA_TO_TS = {v: ("wathgrithr" if v == "wathgrithr" else ("wx-78" if v == "wx78" else v)) for v in CHAR_TO_LUA.values()}

# Documented intentional divergences from lua. Each entry suppresses the matching
# diff for that character/skill. Add a `reason` so future devs understand why.
EXPECTED_DIVERGENCES: dict[tuple[str, str], dict[str, str]] = {
    # Walter: lua's `group` of CreateSkillCountLock locks is the COUNTING TAG
    # (e.g. "slingshotammo_crafting"), not a visual group. Our app puts the lock
    # in the visual column with related skills (e.g. "slingshotammo"). The counting
    # tag is preserved in our `lockType: { type: "skill_count", tag: ..., count: 2 }`.
    ("walter", "walter_ammo_lock"): {
        "group_diff": "lua group is the count-tag (slingshotammo_crafting); we use visual group",
        "tag_diff": "lua group→tag auto-add expects count-tag; we use visual group",
    },
    ("walter", "walter_woby_lock"): {
        "group_diff": "lua group is the count-tag (woby_basics); we use visual group",
        "tag_diff": "lua group→tag auto-add expects count-tag; we use visual group",
    },
    # Wortox: `infographic` tag marks decorative info-display nodes that don't
    # consume a skill point in our simulator (use-skill-tree.ts:115). lua doesn't
    # have this concept (in-game UI handles inclination differently).
    ("wortox", "wortox_inclination_meter"):  {"tag_diff": "app-only `infographic` tag for decorative node"},
    ("wortox", "wortox_inclination_naughty"): {"tag_diff": "app-only `infographic` tag for decorative node"},
    ("wortox", "wortox_inclination_nice"):   {"tag_diff": "app-only `infographic` tag for decorative node"},
    # WX-78: lua uses `locks` on skill nodes only; our app adds bidirectional `connects` on lock nodes
    ("wx-78", "wx78_allegiance_lunar_lock_1"): {"connects_diff": "app adds connects to lock node for bidirectional graph navigation"},
    ("wx-78", "wx78_shadow_allegiance_lock_1"): {"connects_diff": "app adds connects to lock node for bidirectional graph navigation"},
}


# Factory functions in skilltree_defs.lua → known lock entry shape
FACTORY_LOCKS = {
    "MakeFuelWeaverLock":       {"group": "allegiance", "tags": ["allegiance", "lock"], "root": True},
    "MakeNoShadowLock":         {"group": "allegiance", "tags": ["allegiance", "lock"], "root": True},
    "MakeCelestialChampionLock": {"group": "allegiance", "tags": ["allegiance", "lock"], "root": True},
    "MakeNoLunarLock":          {"group": "allegiance", "tags": ["allegiance", "lock"], "root": True},
}

# ----------------------------------------------------------------------------
# Lua parsing helpers
# ----------------------------------------------------------------------------

def find_balanced(text: str, start: int, open_ch: str = "{", close_ch: str = "}") -> int:
    """Given text and index of open char, return index of matching close char."""
    depth = 0
    i = start
    in_str = None
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


def _resolve_lua_constants(lua_text: str) -> str:
    """Resolve `local GROUPS = { KEY = "value" }` style constant tables.

    Replaces `GROUPS.KEY` with `"value"` throughout the text so downstream
    parsing (which expects string literals) works unchanged.
    """
    const_pat = re.compile(r'local\s+(\w+)\s*=\s*\{([^}]+)\}')
    for m in const_pat.finditer(lua_text):
        var_name = m.group(1)
        body = m.group(2)
        pairs = re.findall(r'(\w+)\s*=\s*"([^"]+)"', body)
        for key, val in pairs:
            lua_text = lua_text.replace(f"{var_name}.{key}", f'"{val}"')
    return lua_text


def parse_lua_skills(lua_text: str) -> dict[str, dict[str, Any]]:
    """Extract the `local skills = { ... }` table into a dict.

    Each skill entry is either a `{...}` literal or a `SkillTreeFns.MakeXxx(...)` call.

    Some characters (wendy) use a different pattern: multiple `local <name>_skills = {...}`
    tables merged via `finalize_skill_group(<name>_skills, "<group>")`. Handle both.
    """
    lua_text = _resolve_lua_constants(lua_text)

    # Pattern A: simple `local skills = { ... }` (most characters)
    m = re.search(r"local\s+skills\s*=\s*\{[^\}]", lua_text)
    if m:
        # Make sure it's the real skills table and not `local skills = {}`
        # Check the brace depth — if it's empty, fall through to subset pattern
        open_brace_idx = lua_text.find("{", m.start())
        close_brace_idx = find_balanced(lua_text, open_brace_idx)
        body = lua_text[open_brace_idx + 1:close_brace_idx]
        if body.strip():
            return _parse_skills_block(body)

    # Pattern B: subset pattern with finalize_skill_group (wendy)
    return _parse_subset_skills(lua_text)


def _parse_subset_skills(lua_text: str) -> dict[str, dict[str, Any]]:
    """Parse `local <name>_skills = {...}` + `finalize_skill_group(<name>_skills, "<group>")` pairs."""
    skills: dict[str, dict[str, Any]] = {}

    # Find all finalize_skill_group calls to learn (var_name → group_name) mapping
    finalize_pat = re.compile(r'finalize_skill_group\s*\(\s*(\w+)\s*,\s*"([^"]+)"\s*\)')
    var_to_group = {m.group(1): m.group(2) for m in finalize_pat.finditer(lua_text)}

    # For each subset variable, find its table literal
    for var_name, group_name in var_to_group.items():
        decl_pat = re.compile(rf"local\s+{re.escape(var_name)}\s*=\s*\{{")
        m = decl_pat.search(lua_text)
        if not m:
            continue
        open_brace = m.end() - 1
        close_brace = find_balanced(lua_text, open_brace)
        body = lua_text[open_brace + 1:close_brace]
        subset = _parse_skills_block(body)
        # Apply group name (finalize_skill_group does `skill_data.group = group_name`)
        for sname, sdata in subset.items():
            sdata["group"] = group_name
            skills[sname] = sdata
    return skills


def _parse_skills_block(body: str) -> dict[str, dict[str, Any]]:
    """Parse the body of a skills table (everything inside the outer braces)."""

    skills: dict[str, dict[str, Any]] = {}
    i = 0
    while i < len(body):
        # find next `<name> = `
        nm = re.search(r"(\w+)\s*=\s*", body[i:])
        if not nm:
            break
        name = nm.group(1)
        after_eq = i + nm.end()
        # skip whitespace
        while after_eq < len(body) and body[after_eq] in " \t\n":
            after_eq += 1
        if after_eq >= len(body):
            break
        ch = body[after_eq]
        if ch == "{":
            close = find_balanced(body, after_eq)
            entry_body = body[after_eq + 1:close]
            skills[name] = parse_skill_entry(entry_body)
            i = close + 1
        elif ch == "C":  # CreateSkillCountLock("group", count) — walter-style local factory
            csl_m = re.match(r'CreateSkillCountLock\s*\(\s*"([^"]+)"\s*,\s*\d+\s*\)', body[after_eq:])
            if csl_m:
                group_arg = csl_m.group(1)
                skills[name] = {
                    "group": group_arg,
                    "tags": [],
                    "root": True,
                    "connects": [],
                    "has_lock_open": True,
                    "factory": "CreateSkillCountLock",
                }
                i = after_eq + csl_m.end()
            else:
                i = after_eq + 1
        elif ch == "S":  # SkillTreeFns.Make...
            fac_m = re.match(r"SkillTreeFns\.(\w+)\s*\(", body[after_eq:])
            if fac_m:
                fac_name = fac_m.group(1)
                # find balanced paren
                paren_start = after_eq + fac_m.end() - 1
                paren_end = find_balanced(body, paren_start, "(", ")")
                if fac_name in FACTORY_LOCKS:
                    # The factory accepts an extra_data table that may override group/connects.
                    # Parse `{ ..., group = "...", connects = {...} }` from the call args.
                    extra_body = body[paren_start + 1:paren_end]
                    override = {}
                    gm2 = re.search(r'\bgroup\s*=\s*"([^"]+)"', extra_body)
                    if gm2:
                        override["group"] = gm2.group(1)
                    cm2 = re.search(r"\bconnects\s*=\s*\{([^}]*)\}", extra_body)
                    if cm2:
                        override["connects"] = re.findall(r'"([^"]+)"', cm2.group(1))
                    skills[name] = {
                        "group": override.get("group", FACTORY_LOCKS[fac_name]["group"]),
                        "tags": list(FACTORY_LOCKS[fac_name]["tags"]),
                        "root": FACTORY_LOCKS[fac_name]["root"],
                        "connects": override.get("connects", []),
                        "has_lock_open": True,
                        "factory": fac_name,
                    }
                else:
                    skills[name] = {"factory": fac_name, "unknown_factory": True}
                i = paren_end + 1
            else:
                i = after_eq + 1
        else:
            # unknown form, skip to next comma at depth 0
            i = after_eq + 1
    return skills


def parse_skill_entry(body: str) -> dict[str, Any]:
    """Parse the inside of a skill `{...}` literal."""
    entry: dict[str, Any] = {
        "group": None,
        "tags": [],
        "connects": [],
        "root": False,
        "defaultfocus": False,
        "has_lock_open": False,
    }

    # group = "..."
    m = re.search(r'group\s*=\s*"([^"]+)"', body)
    if m:
        entry["group"] = m.group(1)

    # root = true
    if re.search(r"\broot\s*=\s*true\b", body):
        entry["root"] = True

    # defaultfocus = true
    if re.search(r"\bdefaultfocus\s*=\s*true\b", body):
        entry["defaultfocus"] = True

    # lock_open = ...
    if re.search(r"\block_open\s*=", body):
        entry["has_lock_open"] = True

    # tags = { "x", "y" }
    m = re.search(r"\btags\s*=\s*\{([^}]*)\}", body)
    if m:
        entry["tags"] = re.findall(r'"([^"]+)"', m.group(1))

    # connects = { "x", "y" }
    m = re.search(r"\bconnects\s*=\s*\{([^}]*)\}", body)
    if m:
        entry["connects"] = re.findall(r'"([^"]+)"', m.group(1))

    # locks = { "x", "y" }
    m = re.search(r"\blocks\s*=\s*\{([^}]*)\}", body)
    if m:
        entry["locks"] = re.findall(r'"([^"]+)"', m.group(1))

    return entry


def post_process_lua(skills: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Apply the post-processing the lua file does at line ~470:
       - add data.group to data.tags if not present
       - if has lock_open, add 'lock' to tags
    """
    out: dict[str, dict[str, Any]] = {}
    for name, data in skills.items():
        new = {**data}
        new.setdefault("tags", [])
        new.setdefault("connects", [])
        new.setdefault("locks", [])
        new.setdefault("root", False)
        if new.get("group") and new["group"] not in new["tags"]:
            new["tags"] = [*new["tags"], new["group"]]
        if new.get("has_lock_open") and "lock" not in new["tags"]:
            new["tags"] = [*new["tags"], "lock"]
        out[name] = new
    return out


# ----------------------------------------------------------------------------
# TS parsing helpers
# ----------------------------------------------------------------------------

def parse_ts_nodes(ts_text: str) -> dict[str, dict[str, Any]]:
    """Parse our TS file's nodes array. Each node is on a single line:

        { id: "x", group: "y", pos: [n, n], root: true, icon: "z", connects: [...], tags: [...], locks: [...] }
    """
    nodes: dict[str, dict[str, Any]] = {}
    # find `nodes:` array boundaries
    m = re.search(r"nodes\s*:\s*\[", ts_text)
    if not m:
        return nodes
    start = m.end() - 1
    end = find_balanced(ts_text, start, "[", "]")
    body = ts_text[start + 1:end]

    # iterate object literals by brace matching
    i = 0
    while i < len(body):
        if body[i] == "{":
            close = find_balanced(body, i, "{", "}")
            entry_body = body[i + 1:close]
            id_m = re.search(r'\bid\s*:\s*"([^"]+)"', entry_body)
            if id_m:
                node = {"id": id_m.group(1)}
                # group
                gm = re.search(r'\bgroup\s*:\s*"([^"]+)"', entry_body)
                node["group"] = gm.group(1) if gm else None
                # root
                node["root"] = bool(re.search(r"\broot\s*:\s*true\b", entry_body))
                # connects
                cm = re.search(r"\bconnects\s*:\s*\[([^\]]*)\]", entry_body)
                node["connects"] = re.findall(r'"([^"]+)"', cm.group(1)) if cm else []
                # tags
                tm = re.search(r"\btags\s*:\s*\[([^\]]*)\]", entry_body)
                node["tags"] = re.findall(r'"([^"]+)"', tm.group(1)) if tm else []
                # locks
                lm = re.search(r"\blocks\s*:\s*\[([^\]]*)\]", entry_body)
                node["locks"] = re.findall(r'"([^"]+)"', lm.group(1)) if lm else []
                # has lockType (= our representation of has_lock_open)
                node["has_lock_type"] = bool(re.search(r"\blockType\s*:", entry_body))
                nodes[node["id"]] = node
            i = close + 1
        else:
            i += 1
    return nodes


# ----------------------------------------------------------------------------
# Comparison
# ----------------------------------------------------------------------------

def compare(char_id: str) -> tuple[int, int]:
    """Return (errors, warnings) count."""
    lua_stem = CHAR_TO_LUA[char_id]
    lua_path = LUA_DIR / f"skilltree_{lua_stem}.lua"
    ts_path = TS_DIR / f"{LUA_TO_TS[lua_stem]}.ts"

    if not lua_path.exists():
        print(f"  ERROR: lua file not found: {lua_path}")
        return (1, 0)
    if not ts_path.exists():
        print(f"  ERROR: ts file not found: {ts_path}")
        return (1, 0)

    lua_text = lua_path.read_text(encoding="utf-8")
    ts_text = ts_path.read_text(encoding="utf-8")

    lua_skills_raw = parse_lua_skills(lua_text)
    lua_skills = post_process_lua(lua_skills_raw)
    ts_nodes = parse_ts_nodes(ts_text)

    errors = 0
    warnings = 0

    lua_ids = set(lua_skills.keys())
    ts_ids = set(ts_nodes.keys())

    missing_in_ts = lua_ids - ts_ids
    extra_in_ts = ts_ids - lua_ids

    if missing_in_ts:
        errors += len(missing_in_ts)
        print(f"  ❌ MISSING in TS ({len(missing_in_ts)}):")
        for s in sorted(missing_in_ts):
            print(f"      - {s}")
    if extra_in_ts:
        warnings += len(extra_in_ts)
        print(f"  ⚠️  EXTRA in TS ({len(extra_in_ts)}) — virtual nodes? verify:")
        for s in sorted(extra_in_ts):
            print(f"      - {s}")

    # per-skill comparisons (only for IDs present in both)
    common = lua_ids & ts_ids
    suppressed = 0
    for sid in sorted(common):
        lua_s = lua_skills[sid]
        ts_n = ts_nodes[sid]
        diffs: list[str] = []
        suppression = EXPECTED_DIVERGENCES.get((char_id, sid), {})

        # group
        if lua_s.get("group") != ts_n.get("group"):
            if "group_diff" in suppression:
                suppressed += 1
            else:
                diffs.append(f"group: lua={lua_s.get('group')!r} ts={ts_n.get('group')!r}")

        # root
        if bool(lua_s.get("root")) != bool(ts_n.get("root")):
            diffs.append(f"root: lua={lua_s.get('root')} ts={ts_n.get('root')}")

        # connects (set)
        lua_c = set(lua_s.get("connects", []))
        ts_c = set(ts_n.get("connects", []))
        if lua_c != ts_c:
            if "connects_diff" in suppression:
                suppressed += 1
            else:
                only_lua = lua_c - ts_c
                only_ts = ts_c - lua_c
                parts = []
                if only_lua:
                    parts.append(f"missing connects: {sorted(only_lua)}")
                if only_ts:
                    parts.append(f"extra connects: {sorted(only_ts)}")
                diffs.append("; ".join(parts))

        # locks (set) — AND-deps
        lua_locks = set(lua_s.get("locks", []))
        ts_locks = set(ts_n.get("locks", []))
        if lua_locks != ts_locks:
            only_lua = lua_locks - ts_locks
            only_ts = ts_locks - lua_locks
            parts = []
            if only_lua:
                parts.append(f"missing locks: {sorted(only_lua)}")
            if only_ts:
                parts.append(f"extra locks: {sorted(only_ts)}")
            diffs.append("; ".join(parts))

        # tags (set)
        lua_t = set(lua_s.get("tags", []))
        ts_t = set(ts_n.get("tags", []))
        if lua_t != ts_t:
            if "tag_diff" in suppression:
                suppressed += 1
            else:
                only_lua = lua_t - ts_t
                only_ts = ts_t - lua_t
                parts = []
                if only_lua:
                    parts.append(f"missing tags: {sorted(only_lua)}")
                if only_ts:
                    parts.append(f"extra tags: {sorted(only_ts)}")
                diffs.append("; ".join(parts))

        # lock_open vs lockType
        if lua_s.get("has_lock_open") != ts_n.get("has_lock_type"):
            diffs.append(
                f"lock: lua_has_lock_open={lua_s.get('has_lock_open')} "
                f"ts_has_lock_type={ts_n.get('has_lock_type')}"
            )

        if diffs:
            errors += len(diffs)
            print(f"  ❌ {sid}")
            for d in diffs:
                print(f"      {d}")

    if suppressed:
        print(f"  (suppressed {suppressed} expected divergence(s) — see EXPECTED_DIVERGENCES)")

    return (errors, warnings)


def main() -> None:
    if not LUA_DIR.exists():
        print(f"FATAL: lua dir not found at {LUA_DIR}")
        print("Run: unzip <scripts.zip> 'scripts/prefabs/skilltree_*.lua' -d /tmp/dst-extract/")
        sys.exit(2)

    targets = sys.argv[1:] if len(sys.argv) > 1 else list(CHAR_TO_LUA.keys())
    total_errors = 0
    total_warnings = 0
    for char in targets:
        if char not in CHAR_TO_LUA:
            print(f"unknown character: {char}")
            continue
        print(f"\n=== {char} ===")
        e, w = compare(char)
        total_errors += e
        total_warnings += w
        if e == 0 and w == 0:
            print("  ✅ clean")

    print(f"\n{'=' * 40}")
    print(f"Total: {total_errors} errors, {total_warnings} warnings")
    sys.exit(1 if total_errors > 0 else 0)


if __name__ == "__main__":
    main()
