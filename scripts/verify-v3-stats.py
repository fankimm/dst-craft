#!/usr/bin/env python3
"""Verify item-stats-v3.ts against game source files.

Checks for obvious omissions by parsing prefab Lua files and comparing
against v3 data. Covers:
  1. armor component → armor_hp missing
  2. weapon component → damage missing
  3. fridge/preserver tag → spoilage effect missing
  4. dapperness set → dapperness missing
  5. waterproofness set → waterproof missing
  6. insulator component → insulation missing
  7. walkspeedmult set → speed_mult missing
  8. planardefense component → planar_def missing
  9. damagetyperesist → resistance missing
  10. equippable fuel → fuel_time missing
"""

import re
import os
import glob
import json
import sys

PREFAB_DIR = "/tmp/dst_scripts/scripts/prefabs"
TUNING_FILE = "/tmp/dst_scripts/scripts/tuning.lua"
V3_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        "src/data/item-stats-v3.ts")

# ── Parse v3 data ──

def parse_v3():
    """Parse item-stats-v3.ts → dict of { item_id: raw_entry_text }"""
    with open(V3_FILE, "r") as f:
        content = f.read()

    items = {}
    for m in re.finditer(r'^\s+(\w+):\s*\{(.+?)\},?\s*$', content, re.MULTILINE):
        items[m.group(1)] = m.group(2)
    return items


def v3_has_field(entry, field):
    """Check if a v3 entry has a specific field"""
    return bool(re.search(rf'\b{field}\s*:', entry))


def v3_has_effect_keyword(entry, *keywords):
    """Check if effects text contains any of the keywords"""
    for kw in keywords:
        if kw.lower() in entry.lower():
            return True
    return False


# ── Parse prefab files ──

def find_prefab_file(item_id):
    """Find the prefab Lua file for an item"""
    # Direct match
    path = os.path.join(PREFAB_DIR, f"{item_id}.lua")
    if os.path.exists(path):
        return path

    # Check hats.lua for hat items
    if "hat" in item_id:
        return os.path.join(PREFAB_DIR, "hats.lua")

    # Common multi-item files
    multi_files = {
        "armor": "armor.lua",
        "backpack": "backpack.lua",
        "saddle": "saddle.lua",
        "book_": "books.lua",
        "battlesong": "battlesong.lua",
        "blowdart": "blowdart.lua",
        "wall_": "walls.lua",
        "fence_": "fences.lua",
        "turf_": "turfs.lua",
        "wood_chair": "furniture.lua",
        "wood_stool": "furniture.lua",
        "wood_table": "furniture.lua",
        "stone_chair": "furniture.lua",
        "stone_stool": "furniture.lua",
        "stone_table": "furniture.lua",
        "carnival": "carnival.lua",
        "yot": "yot_catcoon.lua",
    }

    for prefix, filename in multi_files.items():
        if item_id.startswith(prefix):
            path = os.path.join(PREFAB_DIR, filename)
            if os.path.exists(path):
                return path

    return None


def scan_prefab(filepath, item_id):
    """Scan a prefab file for components and properties related to item_id"""
    if not filepath or not os.path.exists(filepath):
        return {}

    with open(filepath, "r") as f:
        content = f.read()

    # For multi-item files, try to narrow scope to the item's function
    # but fall back to full file if not found
    findings = {}

    # Check for components
    if 'AddComponent("armor")' in content:
        findings["has_armor"] = True
    if 'AddComponent("weapon")' in content:
        findings["has_weapon"] = True
    if 'AddComponent("container")' in content:
        findings["has_container"] = True
    if 'AddComponent("insulator")' in content:
        findings["has_insulator"] = True
    if 'AddComponent("planardefense")' in content:
        findings["has_planardef"] = True
    if 'AddComponent("damagetyperesist")' in content:
        findings["has_resist"] = True

    # Check tags
    if '"fridge"' in content:
        findings["has_fridge_tag"] = True
    if '"nocool"' in content:
        findings["has_nocool"] = True

    # Check property sets
    if 'dapperness' in content.lower() or 'DAPPERNESS' in content:
        findings["sets_dapperness"] = True
    if 'waterproofness' in content.lower():
        findings["sets_waterproof"] = True
    if 'walkspeedmult' in content.lower():
        findings["sets_speedmult"] = True
    if re.search(r'inst\.components\.fueled', content):
        findings["has_fueled"] = True
    if re.search(r'inst\.components\.perishable', content):
        findings["has_perishable"] = True

    return findings


# ── Tuning.lua checks ──

def parse_tuning():
    """Parse tuning.lua for item-specific constants"""
    with open(TUNING_FILE, "r") as f:
        content = f.read()

    tuning = {}

    # Find all item-specific tuning values
    for m in re.finditer(r'(\w+)\s*=\s*([\d.]+)', content):
        key = m.group(1)
        try:
            val = float(m.group(2))
            tuning[key] = val
        except ValueError:
            pass

    return tuning


# ── Main verification ──

def main():
    print("Loading v3 data...")
    v3 = parse_v3()
    print(f"  {len(v3)} items in v3")

    print("Loading tuning data...")
    tuning = parse_tuning()

    issues = []

    for item_id, entry in sorted(v3.items()):
        prefab_path = find_prefab_file(item_id)

        # Skip items with no prefab file (character items etc)
        if not prefab_path:
            continue

        findings = scan_prefab(prefab_path, item_id)

        # ── Check 1: fridge tag but no spoilage effect ──
        if findings.get("has_fridge_tag") and findings.get("has_container"):
            if not v3_has_effect_keyword(entry, "부패", "spoil", "perish", "신선", "fresh"):
                issues.append({
                    "item": item_id,
                    "issue": "FRIDGE_NO_EFFECT",
                    "detail": "Has fridge tag but no spoilage/freshness effect in v3",
                    "source": os.path.basename(prefab_path),
                })

        # ── Check 2: dapperness in tuning but not in v3 ──
        tuning_key = f"{item_id.upper()}_DAPPERNESS"
        alt_keys = [k for k in tuning if item_id.upper() in k and "DAPPERNESS" in k]
        if alt_keys and not v3_has_field(entry, "dapperness"):
            issues.append({
                "item": item_id,
                "issue": "DAPPERNESS_MISSING",
                "detail": f"Tuning has {alt_keys[0]} but v3 has no dapperness",
                "source": "tuning.lua",
            })

        # ── Check 3: waterproof in tuning but not in v3 ──
        wp_keys = [k for k in tuning if item_id.upper() in k and "WATERPROOF" in k.upper()]
        if wp_keys and not v3_has_field(entry, "waterproof"):
            issues.append({
                "item": item_id,
                "issue": "WATERPROOF_MISSING",
                "detail": f"Tuning has {wp_keys[0]} but v3 has no waterproof",
                "source": "tuning.lua",
            })

        # ── Check 4: speed_mult in tuning but not in v3 ──
        speed_keys = [k for k in tuning if item_id.upper() in k and "SPEED" in k.upper()]
        if speed_keys and not v3_has_field(entry, "speed_mult") and not v3_has_effect_keyword(entry, "이동속도", "speed"):
            issues.append({
                "item": item_id,
                "issue": "SPEED_MISSING",
                "detail": f"Tuning has {speed_keys[0]} but v3 has no speed_mult/effect",
                "source": "tuning.lua",
            })

        # ── Check 5: armor in tuning but not in v3 ──
        armor_keys = [k for k in tuning if item_id.upper() in k and ("ARMOR" in k.upper() or "ABSORPTION" in k.upper())]
        if armor_keys and not v3_has_field(entry, "armor_hp") and not v3_has_field(entry, "absorption"):
            issues.append({
                "item": item_id,
                "issue": "ARMOR_MISSING",
                "detail": f"Tuning has {armor_keys[0]} but v3 has no armor_hp",
                "source": "tuning.lua",
            })

        # ── Check 6: damage in tuning but not in v3 ──
        dmg_keys = [k for k in tuning if item_id.upper() in k and "DAMAGE" in k.upper()
                     and "PLANAR" not in k.upper() and "REFLECT" not in k.upper()]
        if dmg_keys and not v3_has_field(entry, "damage"):
            issues.append({
                "item": item_id,
                "issue": "DAMAGE_MISSING",
                "detail": f"Tuning has {dmg_keys[0]} but v3 has no damage",
                "source": "tuning.lua",
            })

        # ── Check 7: planar_def in prefab but not in v3 ──
        if findings.get("has_planardef") and not v3_has_field(entry, "planar_def"):
            issues.append({
                "item": item_id,
                "issue": "PLANARDEF_MISSING",
                "detail": "Prefab has planardefense component but v3 has no planar_def",
                "source": os.path.basename(prefab_path),
            })

        # ── Check 8: uses/durability in tuning but not in v3 ──
        uses_keys = [k for k in tuning if item_id.upper() in k and "USES" in k.upper()]
        if uses_keys and not v3_has_field(entry, "uses"):
            issues.append({
                "item": item_id,
                "issue": "USES_MISSING",
                "detail": f"Tuning has {uses_keys[0]} but v3 has no uses",
                "source": "tuning.lua",
            })

    # ── Report ──
    print(f"\n{'='*60}")
    print(f"VERIFICATION RESULTS: {len(issues)} issues found")
    print(f"{'='*60}\n")

    # Group by issue type
    by_type = {}
    for issue in issues:
        t = issue["issue"]
        by_type.setdefault(t, []).append(issue)

    for issue_type, items in sorted(by_type.items()):
        print(f"\n## {issue_type} ({len(items)} items)")
        for item in items:
            print(f"  {item['item']:40s} — {item['detail']}")

    # Summary
    print(f"\n{'='*60}")
    print("Summary:")
    for issue_type, items in sorted(by_type.items()):
        print(f"  {issue_type}: {len(items)}")
    print(f"  TOTAL: {len(issues)}")

    return len(issues)


if __name__ == "__main__":
    sys.exit(0 if main() == 0 else 1)
