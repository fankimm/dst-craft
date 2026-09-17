#!/usr/bin/env python3
"""
Extract farming data from DST scripts → src/data/farming.ts  (#120)

Sources (스냅샷: ~/dst-game-snapshot, sync-game-data.sh 가 /tmp/dst-extract 로 링크):
  - scripts/prefabs/farm_plant_defs.lua        — 작물 14종: 양분 소비, 제철, 물 소비, 성장 시간
  - scripts/prefabs/weed_defs.lua              — 잡초 4종: 양분 소비, 물 소비, 일반 씨앗 가중치
  - scripts/prefabs/veggies.lua                — 일반 씨앗 가중치(seed_weight), 거대 작물 유통기한 배율
  - scripts/prefabs/fertilizer_nutrient_defs.lua — 비료 id → 양분 상수, 사용 횟수, 도감 정렬 순서
  - scripts/components/farmplantstress.lua     — 스트레스 합계 → 등급 경계 (함수 본문, assert 로 고정)
  - scripts/tuning.lua                         — 위 파일들이 참조하는 상수 전부
  - ko.po                                      — 이름·식물 도감 라벨·스트레스 대사 (msgid=영문, msgstr=한국어)

조합은 여기서 계산하지 않는다 — src/lib/farming-combos.ts 가 이 데이터에서 계산한다.

Usage:
  python3 scripts/extract-farming.py        (평소엔 bash scripts/sync-game-data.sh 가 호출)

Output: src/data/farming.ts
"""

import json
import os
import re
from pathlib import Path

_default = Path("/tmp/dst-extract") if Path("/tmp/dst-extract/scripts").exists() else Path.home() / "dst-game-snapshot"
SNAPSHOT = Path(os.environ.get("DST_SNAPSHOT", _default))
SCRIPTS = SNAPSHOT / "scripts"
KOPO = SNAPSHOT / "ko.po"
OUTPUT = Path("src/data/farming.ts")

SEASONS = ["spring", "summer", "autumn", "winter"]

tuning_text = (SCRIPTS / "tuning.lua").read_text()
plant_defs = (SCRIPTS / "prefabs/farm_plant_defs.lua").read_text()
weed_defs = (SCRIPTS / "prefabs/weed_defs.lua").read_text()
veggies = (SCRIPTS / "prefabs/veggies.lua").read_text()
fert_defs = (SCRIPTS / "prefabs/fertilizer_nutrient_defs.lua").read_text()
stress_lua = (SCRIPTS / "components/farmplantstress.lua").read_text()

# ─────────────────────────────────────────────────────────────────────────────
# 1. TUNING 상수
# ─────────────────────────────────────────────────────────────────────────────

# tuning.lua 상단의 local 들. 산술식 평가에만 쓴다.
LOCALS = {"seg_time": 30, "total_day_time": 480, "day_time": 300, "perish_warp": 1}
LOCALS.update({"TUNING.SEG_TIME": 30, "TUNING.TOTAL_DAY_TIME": 480})


def _eval(expr: str) -> float:
    for k in sorted(LOCALS, key=len, reverse=True):
        expr = expr.replace(k, str(LOCALS[k]))
    assert re.fullmatch(r"[\d.\s*+\-/()]+", expr), f"평가할 수 없는 식: {expr!r}"
    return eval(expr)  # noqa: S307 — 위 assert 로 숫자·연산자만 통과


def tun(name: str) -> float:
    m = re.search(rf"^\s*{name}\s*=\s*([^,\n{{]+?)\s*,", tuning_text, re.M)
    assert m, f"tuning.lua 에 {name} 이(가) 없다"
    return _eval(m.group(1))


def tun_vec(name: str) -> list[int]:
    m = re.search(rf"^\s*{name}\s*=\s*\{{\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\}}", tuning_text, re.M)
    assert m, f"tuning.lua 에 {name} = {{a, b, c}} 가 없다"
    return [int(x) for x in m.groups()]


def num(x: float):
    return int(x) if float(x).is_integer() else x


# 양분 배열 순서 = [성장 촉진제, 퇴비, 거름]. 바뀌면 화면 라벨이 전부 어긋난다.
assert tun("FORMULA_NUTRIENTS_INDEX") == 1 and tun("COMPOST_NUTRIENTS_INDEX") == 2 and tun("MANURE_NUTRIENTS_INDEX") == 3, \
    "양분 인덱스 순서가 바뀌었다 — NUTRIENT_1..3 라벨 매핑 재검토"

CONSUME = {"S": tun("FARM_PLANT_CONSUME_NUTRIENT_LOW"), "M": tun("FARM_PLANT_CONSUME_NUTRIENT_MED"),
           "L": tun("FARM_PLANT_CONSUME_NUTRIENT_HIGH"), "0": 0}
DRINK = {"drink_low": ("low", -tun("FARM_PLANT_DRINK_LOW")), "drink_med": ("med", -tun("FARM_PLANT_DRINK_MED")),
         "drink_high": ("high", -tun("FARM_PLANT_DRINK_HIGH"))}
SEED_CHANCE = {k: float(v) for k, v in re.findall(r"^\s*SEED_CHANCE_(\w+)\s*=\s*([\d.]+)", tuning_text, re.M)}


# veggies.lua 는 `local COMMON = TUNING.SEED_CHANCE_COMMON` 같은 별칭을 쓴다
SEED_ALIAS = dict(re.findall(r"^local (\w+)\s*=\s*TUNING\.(SEED_CHANCE_\w+)", veggies, re.M))


def seed_weight(token: str) -> float:
    token = token.strip().replace("TUNING.", "")
    token = SEED_ALIAS.get(token, token)
    if token.startswith("SEED_CHANCE_"):
        return SEED_CHANCE[token.removeprefix("SEED_CHANCE_")]
    return float(token)


# ─────────────────────────────────────────────────────────────────────────────
# 2. ko.po (msgid = 영문 원문, msgstr = 한글모드 번역). CRLF 라 \r 을 먼저 지운다.
# ─────────────────────────────────────────────────────────────────────────────

def load_po() -> dict[str, dict]:
    text = KOPO.read_text(encoding="utf-8").replace("\r", "")
    join = lambda s: "".join(re.findall(r'"(.*)"', s)).replace('\\"', '"').replace("\\n", "\n")  # noqa: E731
    out = {}
    for m in re.finditer(r'msgctxt "([^"]+)"\nmsgid ((?:".*"\n)+)msgstr ((?:".*"\n?)+)', text):
        out[m.group(1)] = {"en": join(m.group(2)), "ko": join(m.group(3))}
    return out


PO = load_po()


def s(key: str) -> dict:
    ent = PO.get(f"STRINGS.{key}")
    assert ent and ent["en"], f"ko.po 에 STRINGS.{key} 가 없다"
    return {"en": ent["en"].strip(), "ko": (ent["ko"] or ent["en"]).strip()}


# ─────────────────────────────────────────────────────────────────────────────
# 3. 작물
# ─────────────────────────────────────────────────────────────────────────────

veg_stats = {}
for m in re.finditer(r"^\s*(\w+)\s*=\s*MakeVegStats\(([^)]*)\)", veggies, re.M):
    args = [a.strip() for a in m.group(2).split(",")]
    veg_stats[m.group(1)] = args  # 첫 인자 = seed_weight 만 쓴다. 호박은 인자 안에 IsSpecialEventActive(...) 괄호가 있어 이 정규식으로는 뒤 인자가 잘린다
oversized_mult = float(re.search(r"local OVERSIZED_PERISHTIME_MULT\s*=\s*([\d.]+)", veggies).group(1))

crops = {}
for m in re.finditer(r"PLANT_DEFS\.(\w+)\.nutrient_consumption\s*=\s*\{(\w+),\s*(\w+),\s*(\w+)\}", plant_defs):
    cid = m.group(1)
    if cid == "randomseed":
        continue
    consume = [int(CONSUME[x]) for x in m.groups()[1:]]
    free = [i for i in range(3) if consume[i] == 0]
    # 나머지가 생기면 farming_manager 의 "잉여 랜덤 분배" 경로가 발동해 순변화가 결정적이지 않게 된다.
    assert free and sum(consume) % len(free) == 0, f"{cid}: 소비 총량이 되돌릴 양분 수로 나누어떨어지지 않는다 — 조합 계산식 재검토"
    restore = [sum(consume) // len(free) if consume[i] == 0 else 0 for i in range(3)]
    crops[cid] = {"id": cid, "consume": consume, "restore": restore}

for m in re.finditer(r"PLANT_DEFS\.(\w+)\.good_seasons\s*=\s*\{([^}]*)\}", plant_defs):
    if m.group(1) in crops:
        good = set(re.findall(r"(\w+)\s*=\s*true", m.group(2)))
        crops[m.group(1)]["seasons"] = [x for x in SEASONS if x in good]
for m in re.finditer(r"PLANT_DEFS\.(\w+)\.moisture\s*=\s*\{drink_rate\s*=\s*(\w+)", plant_defs):
    if m.group(1) in crops:
        level, rate = DRINK[m.group(2)]
        crops[m.group(1)].update({"drinkLevel": level, "drinkRate": rate})
for m in re.finditer(r"PLANT_DEFS\.(\w+)\.grow_time\s*=\s*MakeGrowTimes\(([^)]*)\)", plant_defs):
    if m.group(1) in crops:
        g = [_eval(a) for a in m.group(2).split(",")]
        crops[m.group(1)]["growTime"] = {"germination": [num(g[0]), num(g[1])], "full": [num(g[2]), num(g[3])]}

for cid, c in crops.items():
    for field in ("seasons", "drinkRate", "growTime"):
        assert c.get(field), f"{cid}: {field} 누락"
    assert cid in veg_stats, f"{cid}: veggies.lua 에 없다"
    c["seedWeight"] = seed_weight(veg_stats[cid][0])
    assert c["seedWeight"] > 0, f"{cid}: seed_weight 0"
    up = cid.upper()
    c["name"] = s(f"NAMES.{up}")
    c["seedId"] = f"{cid}_seeds"
    c["seedName"] = s(f"NAMES.KNOWN_{up}_SEEDS")
    c["unknownSeedName"] = s(f"NAMES.{up}_SEEDS")
    c["oversizedId"] = f"{cid}_oversized"
    c["oversizedName"] = s(f"NAMES.{up}_OVERSIZED")
    c["plantName"] = s(f"NAMES.FARM_PLANT_{up}")
    c["description"] = s(f"UI.PLANTREGISTRY.DESCRIPTIONS.{up}")
assert len(crops) == 14, f"작물이 14종이 아니다 ({len(crops)}) — 새 작물이면 화면·조합 검토"

# ─────────────────────────────────────────────────────────────────────────────
# 4. 잡초
# ─────────────────────────────────────────────────────────────────────────────

weed_nutrient = re.search(r"local nutrient\s*=\s*TUNING\.(\w+)", weed_defs)
assert weed_nutrient, "weed_defs.lua: 잡초 양분 소비 상수(local nutrient)를 못 찾았다"
weed_consume = int(tun(weed_nutrient.group(1)))
weeds = {}
for m in re.finditer(r"WEED_DEFS\.(\w+)\.seed_weight\s*=\s*(\S+)", weed_defs):
    weeds[m.group(1)] = {"id": m.group(1), "seedWeight": seed_weight(m.group(2)),
                         "consume": [weed_consume] * 3}
for m in re.finditer(r"WEED_DEFS\.(\w+)\.moisture\s*=\s*\{drink_rate\s*=\s*(\w+)", weed_defs):
    level, rate = DRINK[m.group(2)]
    weeds[m.group(1)].update({"drinkLevel": level, "drinkRate": rate})
for m in re.finditer(r"WEED_DEFS\.(\w+)\.product\s*=\s*(\"\w+\"|nil)", weed_defs):
    weeds[m.group(1)]["productId"] = None if m.group(2) == "nil" else m.group(2).strip('"')
for wid, w in weeds.items():
    assert "drinkRate" in w and "productId" in w, f"{wid}: 잡초 필드 누락"
    w["name"] = s(f"NAMES.{wid.upper()}")
    w["effect"] = s(f"UI.PLANTREGISTRY.EFFECTS.{wid.upper()}")

# ─────────────────────────────────────────────────────────────────────────────
# 5. 비료 (도감 정렬 순서 그대로)
# ─────────────────────────────────────────────────────────────────────────────

fert = {}
for m in re.finditer(r"^FERTILIZER_DEFS\.(\w+)\s*=\s*\{nutrients\s*=\s*TUNING\.(\w+)(?:,\s*uses\s*=\s*TUNING\.(\w+))?\}", fert_defs, re.M):
    fert[m.group(1)] = {"id": m.group(1), "nutrients": tun_vec(m.group(2)),
                        "uses": int(tun(m.group(3))) if m.group(3) else 1}
assert len(fert) == len(re.findall(r"^FERTILIZER_DEFS\.\w+\s*=\s*\{", fert_defs, re.M)), "비료 항목 중 상수로 못 푼 것이 있다"
for m in re.finditer(r'FERTILIZER_DEFS\.(\w+)\.inventoryimage\s*=\s*"(\w+)\.tex"', fert_defs):
    fert[m.group(1)]["image"] = m.group(2)
for m in re.finditer(r'FERTILIZER_DEFS\.(\w+)\.name\s*=\s*"(\w+)"', fert_defs):
    fert[m.group(1)]["nameKey"] = m.group(2)
order = re.findall(r'"(\w+)"', re.search(r"local sort_order\s*=\s*\{(.*?)\}", fert_defs, re.S).group(1))
assert set(order) == set(fert), f"비료 정렬 목록과 정의가 다르다: {set(order) ^ set(fert)}"
fertilizers = []
for fid in order:
    f = fert[fid]
    f.setdefault("image", fid)
    f["name"] = s(f"NAMES.{f.pop('nameKey', fid.upper())}")
    fertilizers.append(f)

# ─────────────────────────────────────────────────────────────────────────────
# 6. 돌보기 도구 · 급수 수단 — 어떤 아이템이 어떤 상수를 쓰는지는 prefab 코드에서 확인해 고정한 매핑
#    (docs/farming-research.md 2.5·2.6절, 검증 수준 A)
# ─────────────────────────────────────────────────────────────────────────────

TEND_TOOLS = [  # (id, 이름 키, 범위 상수)
    ("horn", "HORN", "HORN_RANGE"),
    ("gnarwail_horn", "GNARWAIL_HORN", "GNARWAIL_HORN_FARM_PLANT_INTERACT_RANGE"),
    ("trident", "TRIDENT", "TRIDENT_FARM_PLANT_INTERACT_RANGE"),
    ("panflute", "PANFLUTE", "PANFLUTE_SLEEPRANGE"),
    ("onemanband", "ONEMANBAND", "ONEMANBAND_RANGE"),
    ("phonograph", "PHONOGRAPH", "PHONOGRAPH_TEND_RANGE"),
    ("wormwood", "WORMWOOD", "WORMWOOD_BLOOM_FARM_PLANT_INTERACT_RANGE"),
    ("singingshell_octave3", "SINGINGSHELL_OCTAVE3", "SINGINGSHELL_FARM_PLANT_INTERACT_RANGE"),
]
tend_tools = [{"id": i, "name": s(f"NAMES.{k}"), "range": num(tun(c)), "tiles": num(tun(c) / 4)} for i, k, c in TEND_TOOLS]

WATER_SOURCES = [  # (id, 이름 키, 수분 상수, 사용 횟수 상수)
    ("wateringcan", "WATERINGCAN", "WATERINGCAN_WATER_AMOUNT", "WATERINGCAN_USES"),
    ("premiumwateringcan", "PREMIUMWATERINGCAN", "PREMIUMWATERINGCAN_WATER_AMOUNT", "PREMIUMWATERINGCAN_USES"),
    ("waterballoon", "WATERBALLOON", "WATERBALLOON_ADD_WETNESS", None),
    ("ice", "ICE", "ICE_MELT_GROUND_MOISTURE_AMOUNT", None),
]
water_sources = [{"id": i, "name": s(f"NAMES.{k}"), "amount": num(tun(a)), "uses": int(tun(u)) if u else 1}
                 for i, k, a, u in WATER_SOURCES]

# ─────────────────────────────────────────────────────────────────────────────
# 7. 스트레스: 등급 경계(함수 본문) + 항목별 인게임 대사
# ─────────────────────────────────────────────────────────────────────────────

grades = re.findall(r"stress <= (\d+) and FARM_PLANT_STRESS\.(\w+)", stress_lua)
assert [(int(n), g) for n, g in grades] == [(1, "NONE"), (6, "LOW"), (11, "MODERATE")], \
    f"스트레스 등급 경계가 바뀌었다: {grades} — 수확물 표·문서 재검토"
stress_grades = [{"grade": g.lower(), "max": int(n)} for n, g in grades] + [{"grade": "high", "max": None}]

STRESSORS = ["nutrients", "moisture", "killjoys", "season", "family", "overcrowding", "happiness"]
stressors = [{"id": k, "quote": s(f"CHARACTERS.GENERIC.DESCRIBE_PLANTSTRESSOR{k.upper()}")} for k in STRESSORS]

# ─────────────────────────────────────────────────────────────────────────────
# 8. 상수 · 라벨
# ─────────────────────────────────────────────────────────────────────────────

constants = {
    "consumeLow": tun("FARM_PLANT_CONSUME_NUTRIENT_LOW"), "consumeMed": tun("FARM_PLANT_CONSUME_NUTRIENT_MED"),
    "consumeHigh": tun("FARM_PLANT_CONSUME_NUTRIENT_HIGH"),
    "drinkLow": -tun("FARM_PLANT_DRINK_LOW"), "drinkMed": -tun("FARM_PLANT_DRINK_MED"), "drinkHigh": -tun("FARM_PLANT_DRINK_HIGH"),
    "droughtTolerance": tun("FARM_PLANT_DROUGHT_TOLERANCE"),
    "killjoyRadius": tun("FARM_PLANT_KILLJOY_RADIUS"), "killjoyTolerance": tun("FARM_PLANT_KILLJOY_TOLERANCE"),
    "familyMin": tun("FARM_PLANT_SAME_FAMILY_MIN"), "familyRadius": tun("FARM_PLANT_SAME_FAMILY_RADIUS"),
    "overcrowdingMaxPlants": tun("FARM_PANT_OVERCROWDING_MAX_PLANTS"),  # (sic) 소스의 오타 그대로
    "startingNutrientsMin": tun("STARTING_NUTRIENTS_MIN"), "startingNutrientsMax": tun("STARTING_NUTRIENTS_MAX"),
    "randomSeedWeedChance": tun("FARM_PLANT_RANDOMSEED_WEED_CHANCE"), "seedWeightSeasonMod": tun("SEED_WEIGHT_SEASON_MOD"),
    "longLifeMult": tun("FARM_PLANT_LONG_LIFE_MULT"),
    "oversizedPerishMult": oversized_mult, "perishGroundMult": tun("PERISH_GROUND_MULT"),
    "soilRainMod": tun("SOIL_RAIN_MOD"), "soilMaxTempDryRate": -tun("SOIL_MAX_TEMP_DRY_RATE"),
    "unitsPerTile": 4,
}
constants = {k: num(v) for k, v in constants.items()}

R = "UI.PLANTREGISTRY."
labels = {
    "plants": s(R + "TAB_TITLE_PLANTS"), "fertilizers": s(R + "TAB_TITLE_FERTILIZERS"),
    "seasons": s(R + "FARMPLANTS.SEASONS"), "water": s(R + "FARMPLANTS.WATER"),
    "product": s(R + "FARMPLANTS.PRODUCT"), "seed": s(R + "FARMPLANTS.SEED"),
    "nutrientCycling": s(R + "FARMPLANTS.NUTRIENTS"), "fieldNotes": s(R + "FARMPLANTS.DESCRIPTION"),
    "consume": s(R + "NUTRIENTS.CONSUME"), "restore": s(R + "NUTRIENTS.RESTORE"),
    "effects": s(R + "WEEDPLANTS.EFFECTS"),
    "randomSeeds": s("NAMES.SEEDS"), "debris": s("NAMES.FARM_SOIL_DEBRIS"),
}
nutrients = [s(R + f"NUTRIENTS.NUTRIENT_{i}") for i in (1, 2, 3)]
season_names = {x: s(f"UI.SERVERLISTINGSCREEN.SEASONS.{x.upper()}") for x in SEASONS}
for v in list(labels.values()) + nutrients:  # "소비: " 같은 꼬리 구두점은 화면에서 붙인다
    for lang in v:
        v[lang] = v[lang].rstrip(": ").strip()

# ─────────────────────────────────────────────────────────────────────────────
# 9. 출력
# ─────────────────────────────────────────────────────────────────────────────

def ts(value) -> str:
    """레코드 목록은 한 줄에 하나씩 (diff 가 레코드 단위로 보이게), 나머지는 들여쓰기."""
    if isinstance(value, list) and value and isinstance(value[0], dict):
        return "[\n" + "".join(f"  {json.dumps(v, ensure_ascii=False)},\n" for v in value) + "]"
    if isinstance(value, list):
        return json.dumps(value, ensure_ascii=False)
    return json.dumps(value, ensure_ascii=False, indent=2)


out = f"""// AUTO-GENERATED by scripts/extract-farming.py — DO NOT EDIT.
// Source: DST scripts/prefabs/{{farm_plant_defs,weed_defs,veggies,fertilizer_nutrient_defs}}.lua + tuning.lua + ko.po
// 갱신: bash scripts/sync-game-data.sh

export type FarmSeason = "spring" | "summer" | "autumn" | "winter";
export type FarmDrinkLevel = "low" | "med" | "high";
export type FarmStressGradeId = "none" | "low" | "moderate" | "high";
export type FarmStressorId = "nutrients" | "moisture" | "killjoys" | "season" | "family" | "overcrowding" | "happiness";
/** [성장 촉진제, 퇴비, 거름] — TUNING.FORMULA/COMPOST/MANURE_NUTRIENTS_INDEX = 1/2/3 */
export type FarmNutrients = [number, number, number];
export interface FarmText {{ en: string; ko: string }}

export interface FarmCrop {{
  id: string;
  /** 성장 단계가 넘어갈 때마다 타일에서 가져가는 양분 */
  consume: FarmNutrients;
  /** 같은 시점에 타일로 되돌리는 양분 (소비 총량을 소비하지 않는 양분에 균등 분배) */
  restore: FarmNutrients;
  seasons: FarmSeason[];
  drinkLevel: FarmDrinkLevel;
  /** 포기당 초당 수분 소비 (성장 중일 때만) */
  drinkRate: number;
  /** 초 단위 [min, max]. full 은 싹 50% · 작음 30% · 중간 20% 로 나뉜다 */
  growTime: {{ germination: [number, number]; full: [number, number] }};
  /** 일반 씨앗에서 뽑힐 가중치 (제철이면 × seedWeightSeasonMod) */
  seedWeight: number;
  name: FarmText;
  seedId: string;
  seedName: FarmText;
  /** 도감에 등록하기 전 씨앗 모양 이름 */
  unknownSeedName: FarmText;
  oversizedId: string;
  oversizedName: FarmText;
  plantName: FarmText;
  description: FarmText;
}}

export interface FarmWeed {{
  id: string;
  seedWeight: number;
  consume: FarmNutrients;
  drinkLevel: FarmDrinkLevel;
  drinkRate: number;
  productId: string | null;
  name: FarmText;
  effect: FarmText;
}}

export interface FarmFertilizer {{ id: string; nutrients: FarmNutrients; uses: number; image: string; name: FarmText }}
export interface FarmTendTool {{ id: string; name: FarmText; range: number; tiles: number }}
export interface FarmWaterSource {{ id: string; name: FarmText; amount: number; uses: number }}

export const FARM_SEASONS: FarmSeason[] = {ts(SEASONS)};

export const FARM_CONSTANTS = {ts(constants)} as const;

export const FARM_NUTRIENT_NAMES: [FarmText, FarmText, FarmText] = {ts(nutrients)};

export const FARM_SEASON_NAMES: Record<FarmSeason, FarmText> = {ts(season_names)};

export const FARM_LABELS = {ts(labels)} as const;

export const FARM_CROPS: FarmCrop[] = {ts(list(crops.values()))};

export const FARM_WEEDS: FarmWeed[] = {ts(list(weeds.values()))};

/** 인게임 식물 도감의 비료 탭 정렬 순서 */
export const FARM_FERTILIZERS: FarmFertilizer[] = {ts(fertilizers)};

/** range 는 소스 단위, tiles = range / 4 */
export const FARM_TEND_TOOLS: FarmTendTool[] = {ts(tend_tools)};

export const FARM_WATER_SOURCES: FarmWaterSource[] = {ts(water_sources)};

/** 스트레스 합계가 max 이하이면 그 등급 (components/farmplantstress.lua). 마지막은 상한 없음 */
export const FARM_STRESS_GRADES: {{ grade: FarmStressGradeId; max: number | null }}[] = {ts(stress_grades)};

/** quote = 그 항목에 걸린 작물을 살펴볼 때 나오는 윌슨의 대사 */
export const FARM_STRESSORS: {{ id: FarmStressorId; quote: FarmText }}[] = {ts(stressors)};
"""
OUTPUT.write_text(out)
print(f"farming.ts: crops {len(crops)}, weeds {len(weeds)}, fertilizers {len(fertilizers)}, "
      f"tend tools {len(tend_tools)}, water sources {len(water_sources)} → {OUTPUT}")
