#!/usr/bin/env python3
"""농사 조합 계산 프로토타입 (조사용, #117).

게임 소스만으로 (1) 작물 표 (2) 일반 씨앗 확률표 (3) 무비료 자급 조합을 계산해
docs/farming-research.md 의 표를 재현한다. 웹 공략의 조합을 검증하는 데 썼다.
정식 파이프라인(자동 생성 데이터 파일)을 만들 때 이 로직을 옮기고 이 파일은 지운다.

규칙의 근거 (scripts.zip):
- prefabs/farm_plant_defs.lua  nutrient_consumption / good_seasons / moisture.drink_rate
  · 작물은 성장 단계가 넘어갈 때마다 자기 양분을 소비하고, 소비한 총량을 "소비하지 않는 양분"에 균등 분배해 되돌린다
    (components/farming_manager.lua CycleNutrientsAtPoint). 양분 교환은 타일 단위.
- prefabs/farm_plants.lua       가족(같은 작물 family_min_count=4, 반경 4=1타일)·과밀(타일당 10포기 초과) 판정, pickfarmplant()
- prefabs/veggies.lua           seed_weight (일반 씨앗 가중치)
- tuning.lua                    FARM_PLANT_CONSUME_NUTRIENT_*, FARM_PLANT_DRINK_*, SEED_CHANCE_*, SEED_WEIGHT_SEASON_MOD,
                                FARM_PLANT_RANDOMSEED_WEED_CHANCE, STARTING_NUTRIENTS_MIN

usage: python3 scripts/farm-combos-prototype.py            (스냅샷: ~/dst-game-snapshot/scripts, DST_SCRIPTS 로 변경)
"""
import itertools
import os
import re
from functools import reduce
from math import gcd

S = os.environ.get("DST_SCRIPTS", os.path.expanduser("~/dst-game-snapshot/scripts"))
tuning = open(f"{S}/tuning.lua").read()
defs = open(f"{S}/prefabs/farm_plant_defs.lua").read()
veggies = open(f"{S}/prefabs/veggies.lua").read()


def tun(name: str) -> float:
    return float(re.search(rf"\b{name}\s*=\s*(-?[\d.]+)", tuning).group(1))


AMT = {"S": tun("FARM_PLANT_CONSUME_NUTRIENT_LOW"), "M": tun("FARM_PLANT_CONSUME_NUTRIENT_MED"),
       "L": tun("FARM_PLANT_CONSUME_NUTRIENT_HIGH"), "0": 0}
DRINK = {"drink_low": -tun("FARM_PLANT_DRINK_LOW"), "drink_med": -tun("FARM_PLANT_DRINK_MED"),
         "drink_high": -tun("FARM_PLANT_DRINK_HIGH")}
MAX_PER_TILE = int(tun("FARM_PANT_OVERCROWDING_MAX_PLANTS"))  # (sic) 소스의 오타 그대로
FAMILY_MIN = int(tun("FARM_PLANT_SAME_FAMILY_MIN"))
START_MIN = int(tun("STARTING_NUTRIENTS_MIN"))
SEASONS = [("spring", "봄"), ("summer", "여름"), ("autumn", "가을"), ("winter", "겨울")]
NUTRIENTS = ["성장 촉진제", "퇴비", "거름"]  # ko.po UI.PLANTREGISTRY.NUTRIENTS.NUTRIENT_1..3
KO = {"carrot": "당근", "corn": "옥수수", "potato": "감자", "tomato": "토마토란", "asparagus": "아스파라거스",
      "eggplant": "가지", "pumpkin": "호박", "watermelon": "수박", "dragonfruit": "용과", "durian": "두리안",
      "garlic": "마늘", "onion": "양파", "pepper": "고추", "pomegranate": "석류"}  # ko.po STRINGS.NAMES.*

crops: dict[str, dict] = {}
for m in re.finditer(r"PLANT_DEFS\.(\w+)\.nutrient_consumption\s*=\s*\{(\w+),\s*(\w+),\s*(\w+)\}", defs):
    if m.group(1) == "randomseed":
        continue
    consume = [int(AMT[x]) for x in m.groups()[1:]]
    free = [i for i in range(3) if consume[i] == 0]
    assert sum(consume) % len(free) == 0, "나머지가 생기면 소스의 랜덤 잉여 분배 경로가 발동한다 — 계산 방식 재검토 필요"
    crops[m.group(1)] = {"consume": consume,
                         "net": tuple(sum(consume) // len(free) if consume[i] == 0 else -consume[i] for i in range(3))}
for m in re.finditer(r"PLANT_DEFS\.(\w+)\.good_seasons\s*=\s*\{([^}]*)\}", defs):
    if m.group(1) in crops:
        crops[m.group(1)]["seasons"] = set(re.findall(r"(\w+)\s*=\s*true", m.group(2)))
for m in re.finditer(r"PLANT_DEFS\.(\w+)\.moisture\s*=\s*\{drink_rate\s*=\s*(\w+)", defs):
    if m.group(1) in crops:
        crops[m.group(1)]["drink"] = DRINK[m.group(2)]

# ── 1. 작물 표 ────────────────────────────────────────────────────────────────
print("## 작물 표 (성장 단계 1회당 타일 양분 순변화 / 물 소비)\n")
print("| 작물 | 봄 | 여름 | 가을 | 겨울 | " + " | ".join(NUTRIENTS) + " | 물(/초) |")
print("|---|---|---|---|---|---|---|---|---|")
for k, v in sorted(crops.items(), key=lambda kv: kv[1]["net"]):
    seas = " | ".join("O" if s in v["seasons"] else "" for s, _ in SEASONS)
    print(f"| {KO[k]} | {seas} | " + " | ".join(f"{n:+d}" for n in v["net"]) + f" | {v['drink']:g} |")

# ── 2. 일반 씨앗 확률표 ────────────────────────────────────────────────────────
chance = {k: float(v) for k, v in re.findall(r"SEED_CHANCE_(\w+)\s*=\s*([\d.]+)", tuning)}
weights = {}
for m in re.finditer(r"^\s*(\w+)\s*=\s*MakeVegStats\(\s*([^,]+),", veggies, re.M):
    key = m.group(2).strip().replace("TUNING.", "").replace("SEED_CHANCE_", "")
    w = chance[key] if key in chance else float(key)
    if w > 0 and m.group(1) in crops:
        weights[m.group(1)] = w
season_mod = tun("SEED_WEIGHT_SEASON_MOD")
crop_share = 100 * (1 - tun("FARM_PLANT_RANDOMSEED_WEED_CHANCE"))
print("\n## 일반 씨앗에서 각 작물이 나올 확률 % (잡초 20% 제외분을 가중치로 분배, 제철이면 가중치 ×2)\n")
print("| 작물 | " + " | ".join(ko for _, ko in SEASONS) + " |")
print("|---|---|---|---|---|")
for k in sorted(weights, key=lambda k: -weights[k]):
    row = []
    for s, _ in SEASONS:
        total = sum(weights[j] * (season_mod if s in crops[j]["seasons"] else 1) for j in weights)
        row.append(crop_share * weights[k] * (season_mod if s in crops[k]["seasons"] else 1) / total)
    print(f"| {KO[k]} | " + " | ".join(f"{x:.1f}" for x in row) + " |")


# ── 3. 무비료 자급 조합 ────────────────────────────────────────────────────────
def balanced(season: str, max_slots: int, max_total: int):
    """양분 프로필(같은 순변화를 가진 작물 묶음) 단위로, 순변화 합이 (0,0,0)인 기약 비율을 전부 찾는다."""
    prof: dict[tuple, list[str]] = {}
    for k, v in crops.items():
        if season in v["seasons"]:
            prof.setdefault(v["net"], []).append(k)
    out = {}
    for n in range(2, max_slots + 1):
        for group in itertools.combinations(sorted(prof), n):
            for counts in itertools.product(range(1, max_total), repeat=n):
                if sum(counts) > max_total or reduce(gcd, counts) != 1:
                    continue
                if all(sum(g[i] * c for g, c in zip(group, counts)) == 0 for i in range(3)):
                    out[tuple(zip(group, counts))] = prof
    return out


def is_primitive(combo) -> bool:
    """더 작은 균형 조합 둘의 합으로 쪼개지면 합성 조합이다."""
    ranges = [range(c + 1) for _, c in combo]
    for part in itertools.product(*ranges):
        if 0 < sum(part) < sum(c for _, c in combo):
            if all(sum(g[i] * p for (g, _), p in zip(combo, part)) == 0 for i in range(3)):
                return False
    return True


print("\n## 계절별 기본 조합 (양분 프로필 3칸 이하, 합성 조합 제외) — 타일 1개 기준 배치와 최악 순서 양분 수요\n")
for s, ko in SEASONS:
    found = balanced(s, 3, 9)
    prims = [c for c in found if is_primitive(c)]
    print(f"### {ko} — 기본 조합 {len(prims)}가지 (3칸 이하 균형 조합 전체 {len(found)}가지)\n")
    print("| 조합 (비율) | 타일당 포기 | 가족 4포기 | 최악 순서 수요 [촉진제, 퇴비, 거름] | 새 밭(최소 20)에서 |")
    print("|---|---|---|---|---|")
    for combo in sorted(prims, key=lambda c: (len(c), sum(n for _, n in c))):
        prof = found[combo]
        ratio_sum = sum(n for _, n in combo)
        k = MAX_PER_TILE // ratio_sum  # 과밀(11포기~) 직전까지 채운 배수
        per_tile = [(g, n * k) for g, n in combo]
        names = " + ".join(f"{'/'.join(KO[c] for c in sorted(prof[g], key=lambda c: KO[c]))}×{n}" for g, n in combo)
        family_ok = all(n >= FAMILY_MIN for _, n in per_tile)
        demand = [sum(crops[prof[g][0]]["consume"][i] * n for g, n in per_tile) for i in range(3)]
        print(f"| {names} | {'+'.join(str(n) for _, n in per_tile)} = {sum(n for _, n in per_tile)} | "
              f"{'한 타일로 충족' if family_ok else '같은 구성 타일을 붙여야 함'} | {demand} | "
              f"{'안전' if max(demand) <= START_MIN else f'부족 가능 (최대 {max(demand)})'} |")
    print()

for s, ko in SEASONS:
    n4 = balanced(s, 4, 9)
    print(f"- {ko}: 프로필 4칸 이하·합 9 이하 균형 조합 {len(n4)}가지 (그중 더 쪼갤 수 없는 것 {sum(is_primitive(c) for c in n4)}가지)")
