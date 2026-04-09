#!/usr/bin/env python3
"""Convert item-stats-v2.ts → item-stats-v3.ts
Extracts inline tags and patterns from usage text into structured fields.

Strategy: split ko/en into paired segments first, then classify each pair.
"""

import re
import json
import os

# ── Tag extraction patterns (both ko and en) ──

TAG_MARKERS_KO = {
    "`[원거리]`": "ranged",
    "`[소모품]`": "consumable",
    "`[설치형]`": "deployable",
    "`[전기]`": "electric",
    "`[pvp]`": "pvp",
}

TAG_MARKERS_EN = {
    "`[ranged]`": "ranged",
    "`[consumable]`": "consumable",
    "`[deployable]`": "deployable",
    "`[electric]`": "electric",
    "`[pvp]`": "pvp",
}

# Character name → prefab
CHARACTER_MAP = {
    "위그프리드": "wathgrithr", "Wigfrid": "wathgrithr",
    "웜우드": "wormwood", "Wormwood": "wormwood",
    "월터": "walter", "Walter": "walter",
    "완다": "wanda", "Wanda": "wanda",
    "월리": "warly", "Warly": "warly",
    "웬디": "wendy", "Wendy": "wendy",
    "웨스": "wes", "Wes": "wes",
    "웨버": "webber", "Webber": "webber",
    "워톡스": "wortox", "Wortox": "wortox",
    "위노나": "winona", "Winona": "winona",
    "윌로": "willow", "Willow": "willow",
    "맥스웰": "waxwell", "Maxwell": "waxwell",
    "울프강": "wolfgang", "Wolfgang": "wolfgang",
    "우디": "woodie", "Woodie": "woodie",
    "위커바텀": "wickerbottom", "Wickerbottom": "wickerbottom",
    "윌슨": "wilson", "Wilson": "wilson",
    "WX-78": "wx78", "Wurt": "wurt",
}

SET_MAP = {
    "빛말풀": "brightshade", "Brightshade": "brightshade",
    "공허천": "voidcloth", "Voidcloth": "voidcloth",
    "공포석": "dreadstone", "Dreadstone": "dreadstone",
    "와그펑크": "wagpunk",
}

REPAIR_MAP = {
    "달식물 수리 키트": "lunarplant_kit",
    "공허천 수리 키트": "voidcloth_kit",
    "자동 수리-0": "wagpunkbits_kit",
    "와그펑크 수리 키트": "wagpunkbits_kit",
    "Lunar Plant repair kit": "lunarplant_kit",
    "Lunar Plant Repair Kit": "lunarplant_kit",
    "Voidcloth Repair Kit": "voidcloth_kit",
    "Voidcloth repair kit": "voidcloth_kit",
    "Auto-repair-0": "wagpunkbits_kit",
    "Wagpunk Repair Kit": "wagpunkbits_kit",
}


def parse_v2_ts(filepath):
    """Parse item-stats-v2.ts → dict of { item_id: { numeric_fields, usage_ko, usage_en } }"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    items = {}
    pattern = re.compile(r'^\s+(\w+):\s*\{([^}]+)\}', re.MULTILINE)

    for m in pattern.finditer(content):
        item_id = m.group(1)
        body = m.group(2)
        entry = {}

        for field in ["damage", "uses", "armor_hp", "absorption", "speed_mult",
                      "dapperness", "insulation", "summer_insulation", "waterproof",
                      "fuel_time", "perish_time", "planar_damage", "shadow_bonus",
                      "planar_def", "health_regen", "hunger_drain", "slots"]:
            fm = re.search(rf'{field}:\s*([-\d.]+)', body)
            if fm:
                val = float(fm.group(1))
                entry[field] = int(val) if val == int(val) else val

        usage_ko_m = re.search(r'usage:\s*\{\s*ko:\s*"((?:[^"\\]|\\.)*)"', body)
        usage_en_m = re.search(r'en:\s*"((?:[^"\\]|\\.)*)"', body)
        if usage_ko_m:
            entry["usage_ko"] = usage_ko_m.group(1)
        if usage_en_m:
            entry["usage_en"] = usage_en_m.group(1)

        items[item_id] = entry
    return items


def strip_all_markers(text):
    """Remove all inline tag markers from text"""
    for marker in list(TAG_MARKERS_KO.keys()) + list(TAG_MARKERS_EN.keys()):
        text = text.replace(marker, "")
    text = re.sub(r'`\[캐릭터\]`', '', text)
    text = re.sub(r'`\[character\]`', '', text)
    text = re.sub(r'`\[세트\]`', '', text)
    text = re.sub(r'`\[set\]`', '', text)
    text = re.sub(r'`\[수리\]`', '', text)
    text = re.sub(r'`\[repair\]`', '', text)
    text = re.sub(r'`\[스킬트리\]`', '', text)
    text = re.sub(r'`\[skill tree\]`', '', text)
    return text.strip()


def clean_segment(text):
    """Clean a single text segment: strip markers, trim separators"""
    text = strip_all_markers(text)
    text = re.sub(r'^\s*[/,]\s*', '', text)
    text = re.sub(r'\s*[/,]\s*$', '', text)
    text = text.strip()
    # Remove trailing/leading "전용" that remains after character extraction
    return text


def migrate_item(item_id, v2_data):
    """Convert a single v2 item to v3 format"""
    v3 = {}

    # Copy numeric fields
    for field in ["damage", "uses", "armor_hp", "absorption", "speed_mult",
                  "dapperness", "insulation", "summer_insulation", "waterproof",
                  "fuel_time", "perish_time", "planar_damage", "shadow_bonus",
                  "planar_def", "health_regen", "hunger_drain", "slots"]:
        if field in v2_data:
            v3[field] = v2_data[field]

    usage_ko = v2_data.get("usage_ko", "")
    usage_en = v2_data.get("usage_en", "")

    if not usage_ko:
        return v3

    # ── 1. Extract tags from ko text ──
    tags = []
    for marker, tag_name in TAG_MARKERS_KO.items():
        if marker in usage_ko:
            tags.append(tag_name)
    if tags:
        v3["tags"] = tags

    # ── 2. Extract character ──
    character = None
    # Pattern: `[캐릭터]` X 전용
    m = re.search(r'`\[캐릭터\]`\s*(.+?)전용', usage_ko)
    if m:
        char_name = m.group(1).strip()
        for name, prefab in CHARACTER_MAP.items():
            if name in char_name:
                character = prefab
                break
    # Non-tagged pattern: "X 전용" at start of usage
    if not character:
        for name, prefab in CHARACTER_MAP.items():
            if usage_ko.startswith(f"{name} 전용"):
                character = prefab
                break
    if character:
        v3["character"] = character

    # ── 3. Extract shadow level ──
    m = re.search(r'그림자 레벨\s*(\d+)', usage_ko)
    if m:
        v3["shadow_level"] = int(m.group(1))

    # ── 4. Extract resistance ──
    resistances = []
    for match in re.finditer(r'(그림자|달)\s*속성\s*저항\s*(\d+)%', usage_ko):
        rtype = "shadow" if match.group(1) == "그림자" else "lunar"
        resistances.append({"type": rtype, "percent": int(match.group(2))})
    if resistances:
        v3["resistance"] = resistances

    # ── 5. Extract immunities ──
    immunities = []
    immunity_patterns = [
        (r'화염\s*피해\s*완전\s*면역(?:\s*\([^)]*\))?', "fire"),
        (r'화염\s*면역', "fire"),
        (r'불\s*피해\s*완전\s*면역', "fire"),
        (r'전기\s*면역', "electric"),
        (r'번개\s*피해\s*면역', "lightning"),
        (r'정신력\s*부정적\s*오라\s*완전\s*면역', "shadow_aura"),
    ]
    for pat, imm_name in immunity_patterns:
        if re.search(pat, usage_ko):
            if imm_name not in immunities:
                immunities.append(imm_name)
    if immunities:
        v3["immunities"] = immunities

    # ── 6. Extract set bonus ──
    m_ko = re.search(r'`\[세트\]`\s*(.+?)(?=\s*/\s*`\[|$)', usage_ko)
    if m_ko:
        bonus_ko = m_ko.group(1).strip().rstrip('/')
        set_id = None
        for name, sid in SET_MAP.items():
            if name in bonus_ko:
                set_id = sid
                break
        if set_id:
            m_en = re.search(r'`\[set\]`\s*(.+?)(?=\s*/\s*`\[|$)', usage_en) if usage_en else None
            bonus_en = m_en.group(1).strip().rstrip('/') if m_en else bonus_ko
            v3["set_bonus"] = {
                "set_id": set_id,
                "effects": {"ko": clean_segment(bonus_ko), "en": clean_segment(bonus_en)}
            }

    # ── 7. Extract repair ──
    m_ko = re.search(r'`\[수리\]`\s*(.+?)(?=\s*/\s*`\[|$)', usage_ko)
    if m_ko:
        repair_text = m_ko.group(1).strip().rstrip('/')
        item_id_repair = None
        for name, rid in REPAIR_MAP.items():
            if name in repair_text:
                item_id_repair = rid
                break
        if item_id_repair:
            v3["repair"] = {"item_id": item_id_repair}

    # ── 8. Extract skill tree ──
    ko_st_parts = re.findall(r'`\[스킬트리\]`\s*(.+?)(?=\s*/\s*`\[|$)', usage_ko)
    en_st_parts = re.findall(r'`\[skill tree\]`\s*(.+?)(?=\s*/\s*`\[|$)', usage_en) if usage_en else []
    if ko_st_parts:
        skill_tree = []
        for i, part_ko in enumerate(ko_st_parts):
            part_en = en_st_parts[i].strip().rstrip('/') if i < len(en_st_parts) else part_ko.strip().rstrip('/')
            cleaned_ko = clean_segment(part_ko)
            cleaned_en = clean_segment(part_en)
            if cleaned_ko:
                skill_tree.append({"ko": cleaned_ko, "en": cleaned_en})
        if skill_tree:
            v3["skill_tree"] = skill_tree

    # ── 9. Build effects from remaining segments ──
    # Split both ko and en by " / " to get segment pairs
    ko_segments = [s.strip() for s in usage_ko.split(" / ")]
    en_segments = [s.strip() for s in usage_en.split(" / ")] if usage_en else []

    effects = []
    for i, seg_ko in enumerate(ko_segments):
        seg_en = en_segments[i] if i < len(en_segments) else ""

        # Skip segments that were already extracted
        if _is_extracted(seg_ko, v3, character):
            continue

        # Clean markers
        cleaned_ko = clean_segment(seg_ko)
        cleaned_en = clean_segment(seg_en)

        if not cleaned_ko:
            continue

        effects.append({"ko": cleaned_ko, "en": cleaned_en or cleaned_ko})

    if effects:
        v3["effects"] = effects

    return v3


def _is_extracted(seg_ko, v3, character):
    """Check if a ko segment was already extracted into a structured field"""
    seg = seg_ko.strip()

    # Character-only segment
    if character:
        # "X 전용" only
        for name in CHARACTER_MAP:
            if seg == f"`[캐릭터]` {name} 전용" or seg == f"{name} 전용":
                return True
        # Just character reference with no other content
        if re.match(r'^`\[캐릭터\]`\s*\S+\s*전용$', seg):
            return True

    # Shadow level only
    if re.match(r'^그림자 레벨\s*\d+$', seg):
        return "shadow_level" in v3

    # Resistance only
    if re.match(r'^(그림자|달)\s*속성\s*저항\s*\d+%$', seg):
        return "resistance" in v3

    # Pure immunity segments
    pure_immunity_patterns = [
        r'^화염\s*피해\s*완전\s*면역(?:\s*\([^)]*\))?$',
        r'^전기\s*면역$',
        r'^번개\s*피해\s*면역$',
        r'^정신력\s*부정적\s*오라\s*완전\s*면역$',
    ]
    for pat in pure_immunity_patterns:
        if re.match(pat, seg):
            return "immunities" in v3

    # Set bonus segment
    if seg.startswith("`[세트]`"):
        return "set_bonus" in v3

    # Repair segment
    if seg.startswith("`[수리]`"):
        return "repair" in v3

    # Skill tree segment
    if seg.startswith("`[스킬트리]`"):
        return "skill_tree" in v3

    return False


def format_value(val):
    """Format a value for TypeScript output"""
    if isinstance(val, bool):
        return "true" if val else "false"
    elif isinstance(val, int):
        return str(val)
    elif isinstance(val, float):
        return str(val)
    elif isinstance(val, str):
        return json.dumps(val, ensure_ascii=False)
    elif isinstance(val, list):
        if not val:
            return "[]"
        if all(isinstance(v, str) for v in val):
            items = ", ".join(json.dumps(v, ensure_ascii=False) for v in val)
            return f"[{items}]"
        lines = [format_value(item) for item in val]
        inner = ", ".join(lines)
        return f"[{inner}]"
    elif isinstance(val, dict):
        parts = [f"{k}: {format_value(v)}" for k, v in val.items()]
        inner = ", ".join(parts)
        return f"{{ {inner} }}"
    return str(val)


def generate_ts(items):
    """Generate TypeScript source for item-stats-v3.ts"""
    lines = []
    lines.append('/** Item Stats V3 — 구조화된 스펙 인터페이스')
    lines.append(' *  v2의 usage 텍스트 필드를 tags/character/resistance/set_bonus/repair/skill_tree/immunities/effects로 분리')
    lines.append(' *  wilson_attack = 34, wilson_health = 150, armor_dur_mod = 0.7, armor_abs_mod = 1.0')
    lines.append(' */')
    lines.append('')
    lines.append('// ── 구조화 필드 타입 ──')
    lines.append('')
    lines.append('/** 속성 저항 (달/그림자) */')
    lines.append('export interface Resistance {')
    lines.append('  type: "shadow" | "lunar";')
    lines.append('  percent: number;')
    lines.append('}')
    lines.append('')
    lines.append('/** 세트 보너스 */')
    lines.append('export interface SetBonus {')
    lines.append('  /** 세트 식별자: "brightshade" | "voidcloth" | "dreadstone" | "wagpunk" */')
    lines.append('  set_id: string;')
    lines.append('  /** 세트 효과 설명 */')
    lines.append('  effects: { ko: string; en: string };')
    lines.append('}')
    lines.append('')
    lines.append('/** 수리 방법 — 렌더 시 itemName(item_id)로 한글명 표시 */')
    lines.append('export interface RepairInfo {')
    lines.append('  item_id: string;')
    lines.append('}')
    lines.append('')
    lines.append('/** 스킬트리 연동 효과 */')
    lines.append('export interface SkillTreeEffect {')
    lines.append('  ko: string;')
    lines.append('  en: string;')
    lines.append('}')
    lines.append('')
    lines.append('/** 기타 효과 (구조화되지 않는 설명) */')
    lines.append('export interface Effect {')
    lines.append('  ko: string;')
    lines.append('  en: string;')
    lines.append('}')
    lines.append('')
    lines.append('// ── 분류 태그 ──')
    lines.append('')
    lines.append('/** 아이템 분류 태그 */')
    lines.append('export type ItemTag =')
    lines.append('  | "ranged"      // 원거리 무기/투척')
    lines.append('  | "consumable"  // 소모품 (1회용 등)')
    lines.append('  | "deployable"  // 설치형')
    lines.append('  | "electric"    // 전기 피해')
    lines.append('  | "pvp";        // PvP 관련 정보')
    lines.append('')
    lines.append('// ── 메인 인터페이스 ──')
    lines.append('')
    lines.append('export interface ItemStatsV3 {')
    lines.append('  // ── 수치 필드 (v2 동일) ──')
    lines.append('  damage?: number;')
    lines.append('  uses?: number;')
    lines.append('  armor_hp?: number;')
    lines.append('  absorption?: number;')
    lines.append('  speed_mult?: number;')
    lines.append('  dapperness?: number;')
    lines.append('  insulation?: number;')
    lines.append('  summer_insulation?: number;')
    lines.append('  waterproof?: number;')
    lines.append('  fuel_time?: number;')
    lines.append('  perish_time?: number;')
    lines.append('  planar_damage?: number;')
    lines.append('  shadow_bonus?: number;')
    lines.append('  planar_def?: number;')
    lines.append('  health_regen?: number;')
    lines.append('  hunger_drain?: number;')
    lines.append('  slots?: number;')
    lines.append('')
    lines.append('  // ── 구조화 필드 (usage 대체) ──')
    lines.append('  /** 분류 태그 */')
    lines.append('  tags?: ItemTag[];')
    lines.append('  /** 캐릭터 전용 (prefab name: "wathgrithr", "wormwood" 등) */')
    lines.append('  character?: string;')
    lines.append('  /** 속성 저항 */')
    lines.append('  resistance?: Resistance[];')
    lines.append('  /** 그림자/달 레벨 */')
    lines.append('  shadow_level?: number;')
    lines.append('  /** 세트 보너스 */')
    lines.append('  set_bonus?: SetBonus;')
    lines.append('  /** 수리 방법 */')
    lines.append('  repair?: RepairInfo;')
    lines.append('  /** 스킬트리 연동 효과 */')
    lines.append('  skill_tree?: SkillTreeEffect[];')
    lines.append('  /** 면역 (fire, electric, shadow_aura 등) */')
    lines.append('  immunities?: string[];')
    lines.append('  /** 기타 효과 */')
    lines.append('  effects?: Effect[];')
    lines.append('}')
    lines.append('')
    lines.append('export const itemStatsV3: Record<string, ItemStatsV3> = {')

    for item_id in sorted(items.keys()):
        v3 = items[item_id]
        if not v3:
            continue

        parts = []
        for field in ["damage", "uses", "armor_hp", "absorption", "speed_mult",
                      "dapperness", "insulation", "summer_insulation", "waterproof",
                      "fuel_time", "perish_time", "planar_damage", "shadow_bonus",
                      "planar_def", "health_regen", "hunger_drain", "slots"]:
            if field in v3:
                parts.append(f"{field}: {format_value(v3[field])}")

        for field in ["tags", "character", "resistance", "shadow_level",
                      "set_bonus", "repair", "skill_tree", "immunities", "effects"]:
            if field in v3:
                parts.append(f"{field}: {format_value(v3[field])}")

        if parts:
            entry = ", ".join(parts)
            lines.append(f"  {item_id}: {{ {entry} }},")

    lines.append('};')
    lines.append('')
    return '\n'.join(lines)


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    v2_path = os.path.join(project_root, "src/data/item-stats-v2.ts")
    v3_path = os.path.join(project_root, "src/data/item-stats-v3.ts")

    print(f"Reading v2 data from {v2_path}...")
    v2_items = parse_v2_ts(v2_path)
    print(f"Found {len(v2_items)} items in v2")

    v3_items = {}
    stats = {"tags": 0, "character": 0, "set_bonus": 0, "repair": 0,
             "skill_tree": 0, "shadow_level": 0, "resistance": 0,
             "immunities": 0, "effects": 0, "numeric_only": 0}

    for item_id, v2_data in v2_items.items():
        v3 = migrate_item(item_id, v2_data)
        v3_items[item_id] = v3

        has_structured = False
        for field in ["tags", "character", "set_bonus", "repair", "skill_tree",
                      "shadow_level", "resistance", "immunities", "effects"]:
            if field in v3:
                stats[field] += 1
                has_structured = True
        if not has_structured and v3:
            stats["numeric_only"] += 1

    print(f"\nMigration stats:")
    for k, v in stats.items():
        print(f"  {k}: {v}")

    output = generate_ts(v3_items)

    print(f"\nWriting v3 data to {v3_path}...")
    with open(v3_path, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"Done! {len(v3_items)} items written.")


if __name__ == "__main__":
    main()
