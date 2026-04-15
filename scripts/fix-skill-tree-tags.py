#!/usr/bin/env python3
"""
Auto-fix Pattern A from verify-skill-trees.py:
  Add the node's `group` to its `tags` array if missing.

This mirrors the lua post-processing at line ~470 of skilltree_<char>.lua:
    if not table.contains(data.tags, data.group) then
        table.insert(data.tags, data.group)
    end

Wigfrid (wathgrithr.ts) already has every group in tags → file is left untouched
(idempotent), serving as a regression test that the fixer doesn't damage good data.

Handles both single-line (one node per line) and multi-line node literals.

Usage:
  python3 scripts/fix-skill-tree-tags.py --dry-run     # preview
  python3 scripts/fix-skill-tree-tags.py               # apply
  python3 scripts/fix-skill-tree-tags.py wendy walter  # only specific files
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TS_DIR = REPO / "src" / "data" / "skill-trees"

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


def fix_text(text: str) -> tuple[str, list[tuple[str, str, str]]]:
    """Return (new_text, [(node_id, before_tags_repr, after_tags_repr), ...])."""
    m = re.search(r"nodes\s*:\s*\[", text)
    if not m:
        return text, []
    arr_start = m.end() - 1
    arr_end = find_balanced(text, arr_start, "[", "]")
    body = text[arr_start + 1:arr_end]

    # collect node blocks (start, end, body) at depth 1
    blocks: list[tuple[int, int, str]] = []
    i = 0
    while i < len(body):
        ch = body[i]
        if ch == "{":
            close = find_balanced(body, i, "{", "}")
            blocks.append((arr_start + 1 + i, arr_start + 1 + close, body[i + 1:close]))
            i = close + 1
        elif ch in '"\'':
            # skip strings (in case of bare strings in array, unlikely)
            j = i + 1
            while j < len(body) and body[j] != ch:
                if body[j] == "\\":
                    j += 2
                    continue
                j += 1
            i = j + 1
        else:
            i += 1

    changes: list[tuple[str, str, str]] = []
    # apply in reverse so earlier offsets stay valid
    new_text = text
    for start, end, node_body in reversed(blocks):
        id_m = re.search(r'\bid\s*:\s*"([^"]+)"', node_body)
        if not id_m:
            continue
        node_id = id_m.group(1)

        gm = re.search(r'\bgroup\s*:\s*"([^"]+)"', node_body)
        if not gm:
            continue
        group = gm.group(1)

        tm = re.search(r"\btags\s*:\s*\[([^\]]*)\]", node_body)
        if tm:
            tags_body = tm.group(1)
            existing = re.findall(r'"([^"]+)"', tags_body)
            if group in existing:
                continue
            new_tags = [group] + existing
            new_tags_inner = ", ".join(f'"{t}"' for t in new_tags)
            old_full = tm.group(0)
            new_full = f"tags: [{new_tags_inner}]"
            new_node_body = node_body.replace(old_full, new_full, 1)
            changes.append((node_id, f"[{tags_body}]", f"[{new_tags_inner}]"))
        else:
            # No tags field → inject one. Multi-line case: insert before final `}`.
            # Single-line case: same trick.
            # Use closing-brace insertion that respects existing comma at end.
            # Place the new field immediately before the trailing whitespace + `}`.
            new_field = f', tags: ["{group}"]'
            new_node_body = node_body.rstrip() + new_field + node_body[len(node_body.rstrip()):]
            changes.append((node_id, "(none)", f'["{group}"]'))

        # Rebuild the node block (between { and })
        new_text = new_text[:start + 1] + new_node_body + new_text[end:]

    changes.reverse()
    return new_text, changes


def fix_file(path: Path, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    new_text, changes = fix_text(text)
    if dry_run:
        for node_id, before, after in changes:
            print(f"  {node_id}:")
            print(f"    - tags: {before}")
            print(f"    + tags: {after}")
    elif changes:
        path.write_text(new_text, encoding="utf-8")
    return len(changes)


def main() -> None:
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    if dry_run:
        args.remove("--dry-run")
    targets = args if args else ALL_FILES

    total = 0
    for stem in targets:
        path = TS_DIR / f"{stem}.ts"
        if not path.exists():
            print(f"  ⚠️  {stem}.ts not found, skipping")
            continue
        n = fix_file(path, dry_run)
        marker = "(dry-run)" if dry_run else ""
        if n == 0:
            print(f"  ✅ {stem}: 0 changes {marker}")
        else:
            print(f"  ✏️  {stem}: {n} changes {marker}")
        total += n

    print(f"\nTotal: {total} nodes {'would be ' if dry_run else ''}changed")


if __name__ == "__main__":
    main()
