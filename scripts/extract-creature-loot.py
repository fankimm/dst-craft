#!/usr/bin/env python3
"""
스크랩북 생물의 처치 전리품 → src/data/creature-loot.ts  (#175, #145 3단계)

생물 전리품은 prefab 의 `lootdropper` 가 정하는데 경로가 여럿이다 (SetChanceLootTable·SetLoot·
AddRandomLoot·AddChanceLoot·SetLootSetupFn). 이 스크립트는 그중 **공유 전리품 표**만 싣는다:

  1. 어느 prefab 파일에서든 `SetSharedLootTable('<표>', { {'item', 확률}, ... })` 정의를 모은다
  2. 스크랩북 생물 id 마다 표 이름 = id (또는 TABLE_ALIASES) 인 표가 있고,
     그 생물의 `Prefab("<id>", ...)` 를 정의한 파일이 `SetChanceLootTable('<표>')` 를 부르면 싣는다
  3. 그 파일에 다른 전리품 경로(RISKY)가 있으면 **빼고 목록만 알린다** — 게임 코드를 직접 읽어
     그 경로가 이 생물의 처치 전리품을 바꾸지 않는다고 확인한 것만 VERIFIED 에 넣는다

확률은 숫자 리터럴만 읽는다. 식(TUNING 등)이 나오면 exit 1 — 조용히 틀린 확률을 싣지 않는다.
아이템 이름은 ko.po STRINGS.NAMES (없으면 strings.lua 영문). 이름 없는 아이템이 나오면 exit 1.

Usage: python3 scripts/extract-creature-loot.py  (평소엔 bash scripts/sync-game-data.sh 가 호출)
"""

import importlib.util
import re
import sys
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("item_names", ROOT / "scripts/extract-item-names.py")
item_names = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(item_names)  # type: ignore[union-attr]

SNAPSHOT = item_names.SNAPSHOT
PREFABS = SNAPSHOT / "scripts/prefabs"
STATS = ROOT / "src/data/scrapbook-stats.ts"
OUT = ROOT / "src/data/creature-loot.ts"

# 표 이름이 생물 id 와 다른 경우 — hound.lua 의 fnfire/fncold 가 각 표를 부르는 것을 확인 (buildid 26797476)
TABLE_ALIASES: dict[str, str] = {
    "firehound": "hound_fire",
    "icehound": "hound_cold",
}

# 같은 파일에 있으면 처치 전리품이 표와 달라질 수 있는 호출
RISKY = ["SetLootSetupFn", "AddChanceLoot", "AddRandomLoot", "SetLoot(", "SetChanceLootTable(nil"]

# RISKY 호출이 이 생물의 처치 전리품과 무관함을 코드로 확인한 것 (확인한 위치를 같이 적는다)
VERIFIED: dict[str, str] = {
    "hound": "hound.lua: SetChanceLootTable(nil) 은 fnhedge(덤불 사냥개) 안",
    "firehound": "hound.lua: SetChanceLootTable(nil) 은 fnhedge 안",
    "icehound": "hound.lua: SetChanceLootTable(nil) 은 fnhedge 안",
    "mutatedhound": "hound.lua: SetChanceLootTable(nil) 은 fnhedge 안",
    "gelblob": "gelblob.lua: SetChanceLootTable(nil) 은 DoDespawn(사라질 때) 안",
}

ENTRY = re.compile(r"\{\s*['\"](\w+)['\"]\s*,\s*([^}]*?)\s*\}")
NUM = re.compile(r"^(?:\d+(?:\.\d*)?|\.\d+)$")


def parse_tables(sources: dict[str, str]) -> dict[str, list[tuple[str, float]]]:
    tables: dict[str, list[tuple[str, float]]] = {}
    for fname, text in sources.items():
        # 주석 줄 제거 (-- 뒤)
        text = re.sub(r"--[^\n]*", "", text)
        for m in re.finditer(r"SetSharedLootTable\(\s*['\"](\w+)['\"]\s*,\s*\{", text):
            name = m.group(1)
            # 바깥 { 의 짝을 찾는다
            i, depth = m.end(), 1
            while depth and i < len(text):
                depth += {"{": 1, "}": -1}.get(text[i], 0)
                i += 1
            body = text[m.end() : i - 1]
            entries: list[tuple[str, float]] = []
            for item, chance in ENTRY.findall(body):
                chance = chance.rstrip(",").strip()
                if not NUM.match(chance):
                    raise SystemExit(f"ERROR: {fname} 표 '{name}' 의 {item} 확률이 숫자가 아님: {chance!r}")
                entries.append((item, float(chance)))
            if not entries:
                continue  # 변수로 만든 표 등 — 아래 생물 매칭에 걸리면 '표 비어 있음'으로 알린다
            if name in tables and tables[name] != entries:
                raise SystemExit(f"ERROR: 표 '{name}' 가 서로 다른 내용으로 두 번 정의됨 ({fname})")
            tables[name] = entries
    return tables


def main() -> None:
    sources = {p.name: p.read_text(encoding="utf-8", errors="replace") for p in sorted(PREFABS.glob("*.lua"))}
    assert len(sources) > 1000, f"prefab 파일이 너무 적음 ({len(sources)}) — 스냅샷 경로 확인"
    tables = parse_tables(sources)
    assert len(tables) > 100, f"SetSharedLootTable 파싱 실패 ({len(tables)})"

    creatures = re.findall(r'^  ([a-z0-9_]+): \{type: "creature"', STATS.read_text(encoding="utf-8"), re.M)
    assert len(creatures) > 150, f"scrapbook-stats.ts creature 파싱 실패 ({len(creatures)})"

    prefab_files: dict[str, list[str]] = {}
    for fname, text in sources.items():
        for p in re.findall(r"Prefab\(\s*['\"](?:[\w]+/)*(\w+)['\"]", text):
            prefab_files.setdefault(p, []).append(fname)
        # 생성 함수로 만드는 prefab — 그 파일에 정의된 `local function MakeX(name, ...)` 를 문자열 인자로 부르는 것
        # (bishop.lua 의 MakeBishop("bishop", ...) 처럼 Prefab(name, ...) 이 변수를 받는 경우)
        for maker in re.findall(r"^local function (Make\w+)\(", text, re.M):
            for p in re.findall(r"\b%s\(\s*['\"](\w+)['\"]" % maker, text):
                if fname not in prefab_files.setdefault(p, []):
                    prefab_files[p].append(fname)

    loot: "OrderedDict[str, list[tuple[str, float, int]]]" = OrderedDict()
    skipped: list[str] = []
    for cid in creatures:
        table = TABLE_ALIASES.get(cid, cid)
        if table not in tables:
            continue
        callers = [
            f
            for f in prefab_files.get(cid, [])
            if re.search(r"SetChanceLootTable\(\s*['\"]%s['\"]\s*\)" % re.escape(table), sources[f])
        ]
        if not callers:
            continue
        risky = sorted({k for f in callers for k in RISKY if k in sources[f]})
        if risky and cid not in VERIFIED:
            skipped.append(f"{cid} ({', '.join(callers)}: {', '.join(risky)})")
            continue
        # 같은 (아이템, 확률) 은 개수로 묶는다. 순서는 표 순서
        grouped: "OrderedDict[tuple[str, float], int]" = OrderedDict()
        for item, chance in tables[table]:
            grouped[(item, chance)] = grouped.get((item, chance), 0) + 1
        loot[cid] = [(item, chance, n) for (item, chance), n in grouped.items()]

    shared_ids = set(loot)
    # 2) 공유 표가 없는 생물 (#176) — prefab 파일 하나에 lootdropper 가 하나뿐이고 그 전리품 경로가 아래 둘 중 하나뿐일 때
    #    a. AddRandomLoot(아이템, 가중치) 여러 줄 + numrandomloot = N  → 가중치 비율로 N번 뽑기 (lootdropper.lua PickRandomLoot)
    #    b. SetLoot({ "아이템", ... }) 리터럴 (또는 그 파일에서 딱 한 번 쓰이는 local 표) → 항상 떨어짐
    #    AddRandomHauntedLoot 는 유령이 홀렸을 때만이라 무시한다
    picks: dict[str, int] = {}
    for cid in creatures:
        if cid in loot:
            continue
        # 생성 함수까지 적힌 정의(Prefab("id", fn, ...))가 있는 파일 하나만 — 다른 파일의 Prefab("id") 는 의존성 목록이다
        defs = [(f, m.group(1)) for f in prefab_files.get(cid, []) for m in [re.search(r"Prefab\(\s*['\"]%s['\"]\s*,\s*(\w+)\s*[,)]" % re.escape(cid), sources[f])] if m]
        if len(defs) != 1:
            continue
        files = [defs[0][0]]
        text = re.sub(r"--[^\n]*", "", sources[files[0]])
        if text.count('AddComponent("lootdropper")') != 1:
            continue
        # 그 lootdropper 가 이 생물의 생성 함수 안, 또는 생성 함수가 직접 부르는 함수 안에 있어야 한다
        # (한 파일에 다른 prefab 이 같이 있을 때 남의 전리품을 붙이지 않게)
        funcs: dict[str, tuple[int, int]] = {}
        starts = [(m.start(), m.group(1)) for m in re.finditer(r"^(?:local )?function ([\w.:]+)\(", text, re.M)]
        ends = [m.start() for m in re.finditer(r"^(?:local function|function|return)\b", text, re.M)] + [len(text)]
        for st, name in starts:
            funcs[name] = (st, min(e for e in ends if e > st))
        ctor = defs[0][1]
        if ctor not in funcs:
            continue
        ld = text.index('AddComponent("lootdropper")')
        cst, cen = funcs[ctor]
        owner = next((n for n, (a, b) in funcs.items() if a <= ld < b), None)
        if owner is None or not (owner == ctor or re.search(r"\b%s\(" % re.escape(owner), text[cst:cen])):
            continue
        others = [k for k in [r for r in RISKY if r != "AddRandomLoot"] + ["SetChanceLootTable(", "chancerandomloot", "AddIfNotChanceLoot", "droprecipeloot"] if k in text]
        rand = re.findall(r"lootdropper:AddRandomLoot\(([^)]*)\)", text)
        nrand = re.findall(r"lootdropper\.numrandomloot\s*=\s*([^\s]+)", text)
        if rand and not others:
            if len(nrand) != 1 or not nrand[0].isdigit():
                raise SystemExit(f"ERROR: {files[0]} numrandomloot 이 숫자 하나가 아님: {nrand}")
            rows = []
            for arg in rand:
                m = re.fullmatch(r"\s*['\"](\w+)['\"]\s*,\s*([\d.]+)\s*", arg)
                if not m or not NUM.match(m.group(2)):
                    raise SystemExit(f"ERROR: {files[0]} AddRandomLoot 인자가 리터럴이 아님: {arg!r}")
                rows.append((m.group(1), float(m.group(2))))
            total = sum(w for _, w in rows)
            loot[cid] = [(item, w / total, 1) for item, w in rows]
            picks[cid] = int(nrand[0])
            continue
        if others == ["SetLoot("] and not rand and not nrand and text.count("SetLoot(") == 1:
            arg = re.search(r"lootdropper:SetLoot\(\s*(\{[^}]*\}|\w+)\s*\)", text)
            if not arg:
                continue
            body = arg.group(1)
            if not body.startswith("{"):
                # local 표 — 정의 1번 + SetLoot 1번 외에 쓰이면(table.insert 등) 믿지 않는다
                if len(re.findall(r"\b%s\b" % re.escape(body), text)) != 2:
                    continue
                d = re.search(r"local\s+%s\s*=\s*(\{[^}]*\})" % re.escape(body), text)
                if not d:
                    continue
                body = d.group(1)
            items = re.findall(r"['\"](\w+)['\"]", body)
            if not items:
                continue  # SetLoot({}) — 전리품 없음
            if re.sub(r"['\"]\w+['\"]|[\s,{}]", "", body):
                raise SystemExit(f"ERROR: {files[0]} SetLoot 표가 문자열 리터럴만이 아님: {body!r}")
            grouped: "OrderedDict[str, int]" = OrderedDict()
            for i in items:
                grouped[i] = grouped.get(i, 0) + 1
            loot[cid] = [(i, 1.0, n) for i, n in grouped.items()]

    stale = sorted(set(VERIFIED) - set(loot))
    if stale:
        raise SystemExit(f"ERROR: VERIFIED 에 있는데 실리지 않은 생물 {stale} — 게임 코드가 바뀌었다. 다시 확인할 것")
    assert len(loot) >= 40, f"전리품이 실린 생물이 너무 적음 ({len(loot)}) — 파싱 규칙 확인"

    names = item_names.parse_po(item_names.KO_PO.read_text(encoding="utf-8"))
    po_keys = set(names)
    names = item_names.with_en_fallback(names)
    items = sorted({item for rows in loot.values() for item, _, _ in rows})
    missing = [i for i in items if i.upper() not in names or not names[i.upper()][0]]
    if missing:
        raise SystemExit(f"ERROR: 이름 없는 전리품 아이템 {missing}")
    for i in items:
        if i.upper() not in po_keys:
            print(f"[warn] {i}: ko.po 에 없음 — 영문 이름으로 대신", file=sys.stderr)

    def q(s: str) -> str:
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'

    def num(x: float) -> str:
        return ("%g" % x)

    lines = [
        "// 자동 생성 — scripts/extract-creature-loot.py. 수동 편집 금지 (#175)",
        "// Source: prefabs/*.lua 의 SetSharedLootTable + SetChanceLootTable, AddRandomLoot + numrandomloot, SetLoot 리터럴 (#176), 이름은 ko.po STRINGS.NAMES",
        "",
        "/** 처치 전리품 한 줄: 아이템·확률(0~1)·그 확률로 떨어지는 개수(각각 따로 굴린다).",
        " *  pick 이 있으면 따로 굴리지 않고, pick 이 붙은 줄들 가운데 pick 개를 뽑는다 (chance = 가중치/합, AddRandomLoot) */",
        "export type CreatureLootRow = { item: string; chance: number; count: number; pick?: number };",
        "",
        "export const creatureLoot: Record<string, CreatureLootRow[]> = {",
    ]
    for cid, rows in loot.items():
        pk = f", pick: {picks[cid]}" if cid in picks else ""
        body = ", ".join(f"{{ item: {q(i)}, chance: {num(round(c, 4))}, count: {n}{pk} }}" for i, c, n in rows)
        lines.append(f"  {cid}: [{body}],")
    lines += ["};", "", "/** 전리품 아이템 이름 [en, ko] */", "export const creatureLootNames: Record<string, [string, string]> = {"]
    for i in items:
        en, ko = names[i.upper()]
        lines.append(f"  {i}: [{q(en)}, {q(ko or en)}],")
    lines += ["};", ""]
    OUT.write_text("\n".join(lines), encoding="utf-8")

    print(f"  공유 표 밖(#176): 무작위 뽑기 {sorted(picks)} · 고정 {sorted(c for c in loot if c not in picks and all(ch == 1.0 for _, ch, _ in loot[c]) and c not in shared_ids)}")
    print(f"creature-loot: 생물 {len(loot)}종 · 아이템 {len(items)}개 → {OUT.relative_to(ROOT)}")
    if skipped:
        print(f"  다른 전리품 경로가 섞여 뺀 생물 {len(skipped)}종 (확인 후 VERIFIED 에 추가):")
        for s in skipped:
            print("   - " + s)


if __name__ == "__main__":
    main()
