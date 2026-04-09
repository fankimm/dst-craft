#!/usr/bin/env python3
"""Convert docs/stats/i18n/_source_ko.md + en.md → src/data/item-stats-v2.ts"""

import re
import sys
import os

# Numeric fields that map directly to ItemStats interface
NUMERIC_FIELDS = {
    "armor_hp", "absorption", "damage", "uses", "dapperness",
    "speed_mult", "fuel_time", "fuel", "perish_time", "perish",
    "insulation", "summer_insulation", "waterproofness", "waterproof",
    "planar_damage", "planar_def", "shadow_bonus",
    "health_regen", "hunger_drain", "slots",
}

# Field name normalization
FIELD_RENAME = {
    "waterproofness": "waterproof",
    "perish": "perish_time",
    "fuel": "fuel_time",
}

def parse_md(filepath):
    """Parse md file → dict of { item_id: { fields: {}, usage_lines: [] } }"""
    items = {}
    current_id = None
    in_usage = False

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")

            # Item header: ## item_id or ## item_id — ...
            if line.startswith("## "):
                current_id = line[3:].split(" —")[0].split(" ")[0].strip()
                items[current_id] = {"fields": {}, "usage_lines": []}
                in_usage = False
                continue

            if current_id is None:
                continue

            # Usage sub-item (indented)
            if in_usage and line.startswith("  - "):
                items[current_id]["usage_lines"].append(line[4:].strip())
                continue
            elif in_usage and (line.startswith("- ") or line.startswith("## ") or line == ""):
                in_usage = False
                # fall through to check if it's a new field

            # Field line: - field_name: value
            m = re.match(r"^- ([a-z_]+):\s*(.*)", line)
            if m:
                field_name = m.group(1)
                value = m.group(2).strip()

                if field_name == "usage":
                    in_usage = True
                    if value:  # inline usage value
                        items[current_id]["usage_lines"].append(value)
                elif field_name in NUMERIC_FIELDS:
                    # Extract the first number (possibly negative, possibly decimal)
                    num_match = re.match(r"(-?[\d.]+)", value)
                    if num_match:
                        normalized = FIELD_RENAME.get(field_name, field_name)
                        try:
                            num = float(num_match.group(1))
                            if num == int(num):
                                num = int(num)
                            items[current_id]["fields"][normalized] = num
                        except ValueError:
                            pass

    return items


def escape_ts_string(s):
    """Escape string for TypeScript single-line literal"""
    return s.replace("\\", "\\\\").replace('"', '\\"')


def format_value(v):
    if isinstance(v, float):
        # Keep meaningful precision
        s = f"{v:.6f}".rstrip("0").rstrip(".")
        return s
    return str(v)


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ko_path = os.path.join(base, "docs/stats/i18n/_source_ko.md")
    en_path = os.path.join(base, "docs/stats/i18n/en.md")
    out_path = os.path.join(base, "src/data/item-stats-v2.ts")

    print(f"Parsing Korean source: {ko_path}")
    ko_items = parse_md(ko_path)
    print(f"  → {len(ko_items)} items")

    print(f"Parsing English source: {en_path}")
    en_items = parse_md(en_path)
    print(f"  → {len(en_items)} items")

    # Build output
    lines = []
    lines.append('/** Auto-generated from docs/stats/i18n/_source_ko.md + en.md')
    lines.append(' *  wilson_attack = 34, wilson_health = 150, armor_dur_mod = 0.7, armor_abs_mod = 1.0')
    lines.append(' */')
    lines.append('')
    lines.append('import type { ItemStats } from "./item-stats";')
    lines.append('')
    lines.append('export const itemStatsV2: Record<string, ItemStats> = {')

    item_count = 0
    for item_id, data in ko_items.items():
        fields = data["fields"]
        ko_usage_lines = data["usage_lines"]
        en_usage_lines = en_items.get(item_id, {}).get("usage_lines", [])

        # Skip items with no data at all
        if not fields and not ko_usage_lines:
            continue

        parts = []
        # Numeric fields in consistent order
        field_order = [
            "damage", "uses", "armor_hp", "absorption", "speed_mult",
            "dapperness", "insulation", "summer_insulation", "waterproof",
            "fuel_time", "perish_time", "planar_damage", "shadow_bonus",
            "planar_def", "health_regen", "hunger_drain", "slots",
        ]
        for f in field_order:
            if f in fields:
                parts.append(f"{f}: {format_value(fields[f])}")

        # Usage
        if ko_usage_lines:
            ko_text = escape_ts_string(" / ".join(ko_usage_lines))
            en_text = escape_ts_string(" / ".join(en_usage_lines)) if en_usage_lines else ""
            parts.append(f'usage: {{ ko: "{ko_text}", en: "{en_text}" }}')

        if parts:
            item_count += 1
            lines.append(f'  {item_id}: {{ {", ".join(parts)} }},')

    lines.append('};')
    lines.append('')

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Written {item_count} items to {out_path}")


if __name__ == "__main__":
    main()
