#!/usr/bin/env python3
"""Translate DST item stats from Korean source to target languages using dictionary-based replacement."""

import re
import sys
import os

# ─── Translation dictionaries ───

FIELD_LABELS = {
    "en": {
        "타입": "type", "스택": "stack", "해머 횟수": "hammer hits", "해머": "hammer",
        "사용 횟수": "uses", "피해량": "damage", "체력": "health", "포만도": "hunger",
        "정신력": "sanity", "가연성": "flammable", "수리 재료": "repair material",
        "해머 전리품": "hammer loot", "장착 슬롯": "equip slot", "빛 반경": "light radius",
        "연료 지속": "fuel duration", "유통기한": "perish time", "부패 속도": "spoil rate",
        "지면": "ground", "최대 HP": "max HP", "설치 시 HP": "placed HP",
        "추가 효과": "bonus", "효과": "effect", "부활 정신력": "revive sanity",
        "패널티": "penalty", "방한": "cold protection", "온도 조절": "temperature control",
        "연료 유형": "fuel type", "유형": "type", "슬롯 수": "slots",
        "발광 조건": "glow condition", "부패 시간": "perish time", "부패": "perish",
        "던지기": "throwable", "방수": "waterproof", "착화율": "ignite rate",
        "비소모 배율": "non-consume multiplier", "여름 단열": "summer insulation",
        "겨울 단열": "winter insulation", "기술 레벨": "tech level",
        "공물": "offering", "기능": "function", "체육 무게": "gym weight",
        "넉백 강도": "knockback strength", "경직": "stagger",
        "컨테이너": "container", "활성 반경": "active radius",
    },
    "ja": {
        "타입": "タイプ", "스택": "スタック", "해머 횟수": "ハンマー回数", "해머": "ハンマー",
        "사용 횟수": "使用回数", "피해량": "ダメージ", "체력": "体力", "포만도": "満腹度",
        "정신력": "正気度", "가연성": "可燃性", "수리 재료": "修理素材",
        "해머 전리품": "ハンマー戦利品", "장착 슬롯": "装備スロット", "빛 반경": "光の半径",
        "연료 지속": "燃料持続", "유통기한": "消費期限", "부패 속도": "腐敗速度",
        "지면": "地面", "최대 HP": "最大HP", "설치 시 HP": "設置時HP",
        "추가 효과": "追加効果", "효과": "効果", "부활 정신력": "復活時正気度",
        "패널티": "ペナルティ", "방한": "防寒", "온도 조절": "温度調節",
        "연료 유형": "燃料タイプ", "유형": "タイプ", "슬롯 수": "スロット数",
        "발광 조건": "発光条件", "부패 시간": "腐敗時間", "부패": "腐敗",
        "던지기": "投げ", "방수": "防水", "착화율": "着火率",
        "비소모 배율": "非消耗倍率", "여름 단열": "夏の断熱", "겨울 단열": "冬の断熱",
        "기술 레벨": "技術レベル", "공물": "供物", "기능": "機能",
        "체육 무게": "ジムウェイト", "넉백 강도": "ノックバック強度", "경직": "硬直",
        "컨테이너": "コンテナ", "활성 반경": "有効半径",
    },
    "zh_TW": {
        "타입": "類型", "스택": "堆疊", "해머 횟수": "鎚擊次數", "해머": "鎚擊",
        "사용 횟수": "使用次數", "피해량": "傷害", "체력": "生命值", "포만도": "飽食度",
        "정신력": "理智值", "가연성": "可燃性", "수리 재료": "修復材料",
        "해머 전리품": "鎚擊掉落", "장착 슬롯": "裝備欄位", "빛 반경": "光照半徑",
        "연료 지속": "燃料持續", "유통기한": "保存期限", "부패 속도": "腐爛速度",
        "지면": "地面", "최대 HP": "最大HP", "설치 시 HP": "放置時HP",
        "추가 효과": "額外效果", "효과": "效果", "부활 정신력": "復活理智",
        "패널티": "懲罰", "방한": "禦寒", "온도 조절": "溫度調節",
        "연료 유형": "燃料類型", "유형": "類型", "슬롯 수": "欄位數",
        "발광 조건": "發光條件", "부패 시간": "腐爛時間", "부패": "腐爛",
        "던지기": "投擲", "방수": "防水", "착화율": "點火率",
        "여름 단열": "夏季隔熱", "겨울 단열": "冬季隔熱",
        "기술 레벨": "科技等級", "공물": "貢品", "기능": "功能",
        "체육 무게": "健身重量", "넉백 강도": "擊退強度", "경직": "硬直",
        "컨테이너": "容器", "활성 반경": "有效半徑",
    },
    "de": {
        "타입": "Typ", "스택": "Stapel", "해머 횟수": "Hammerschläge", "해머": "Hammer",
        "사용 횟수": "Verwendungen", "피해량": "Schaden", "체력": "Gesundheit",
        "포만도": "Hunger", "정신력": "Verstand", "가연성": "Brennbar",
        "수리 재료": "Reparaturmaterial", "해머 전리품": "Hammerbeute",
        "장착 슬롯": "Ausrüstungsslot", "빛 반경": "Lichtradius",
        "연료 지속": "Brenndauer", "유통기한": "Haltbarkeit", "부패 속도": "Verfallrate",
        "지면": "Boden", "최대 HP": "Max HP", "설치 시 HP": "Platziert HP",
        "효과": "Effekt", "기술 레벨": "Techlevel", "기능": "Funktion",
        "체육 무게": "Gym-Gewicht",
    },
    "fr": {
        "타입": "type", "스택": "pile", "해머 횟수": "coups de marteau", "해머": "marteau",
        "사용 횟수": "utilisations", "피해량": "dégâts", "체력": "santé",
        "포만도": "faim", "정신력": "santé mentale", "가연성": "inflammable",
        "수리 재료": "matériau de réparation", "해머 전리품": "butin au marteau",
        "장착 슬롯": "emplacement", "빛 반경": "rayon lumineux",
        "연료 지속": "durée de combustible", "유통기한": "péremption",
        "지면": "sol", "최대 HP": "PV max", "설치 시 HP": "PV placé",
        "효과": "effet", "기술 레벨": "niveau tech", "기능": "fonction",
        "체육 무게": "poids gym",
    },
    "it": {
        "타입": "tipo", "스택": "pila", "해머 횟수": "colpi di martello", "해머": "martello",
        "사용 횟수": "utilizzi", "피해량": "danni", "체력": "salute",
        "포만도": "fame", "정신력": "sanità mentale", "가연성": "infiammabile",
        "수리 재료": "materiale di riparazione", "해머 전리품": "bottino martello",
        "장착 슬롯": "slot equipaggiamento", "빛 반경": "raggio luce",
        "연료 지속": "durata combustibile", "유통기한": "deperibilità",
        "지면": "terreno", "최대 HP": "HP max", "설치 시 HP": "HP piazzato",
        "효과": "effetto", "기술 레벨": "livello tech", "기능": "funzione",
        "체육 무게": "peso palestra",
    },
    "es": {
        "타입": "tipo", "스택": "pila", "해머 횟수": "golpes de martillo", "해머": "martillo",
        "사용 횟수": "usos", "피해량": "daño", "체력": "salud",
        "포만도": "hambre", "정신력": "cordura", "가연성": "inflamable",
        "수리 재료": "material de reparación", "해머 전리품": "botín de martillo",
        "장착 슬롯": "ranura de equipamiento", "빛 반경": "radio de luz",
        "연료 지속": "duración de combustible", "유통기한": "caducidad",
        "지면": "suelo", "최대 HP": "HP máx", "설치 시 HP": "HP al colocar",
        "효과": "efecto", "기술 레벨": "nivel tech", "기능": "función",
        "체육 무게": "peso gimnasio",
    },
    "pt_BR": {
        "타입": "tipo", "스택": "pilha", "해머 횟수": "marteladas", "해머": "martelo",
        "사용 횟수": "usos", "피해량": "dano", "체력": "saúde",
        "포만도": "fome", "정신력": "sanidade", "가연성": "inflamável",
        "수리 재료": "material de reparo", "해머 전리품": "espólio do martelo",
        "장착 슬롯": "slot de equipamento", "빛 반경": "raio de luz",
        "연료 지속": "duração do combustível", "유통기한": "validade",
        "지면": "solo", "최대 HP": "HP máx", "설치 시 HP": "HP ao colocar",
        "효과": "efeito", "기술 레벨": "nível tech", "기능": "função",
        "체육 무게": "peso academia",
    },
    "pl": {
        "타입": "typ", "스택": "stos", "해머 횟수": "uderzenia młotkiem", "해머": "młotek",
        "사용 횟수": "użycia", "피해량": "obrażenia", "체력": "zdrowie",
        "포만도": "głód", "정신력": "poczytalność", "가연성": "palny",
        "수리 재료": "materiał naprawczy", "해머 전리품": "łup z młotka",
        "장착 슬롯": "slot wyposażenia", "빛 반경": "promień światła",
        "연료 지속": "czas paliwa", "유통기한": "trwałość",
        "지면": "podłoże", "최대 HP": "maks. HP", "설치 시 HP": "HP po postawieniu",
        "효과": "efekt", "기술 레벨": "poziom tech", "기능": "funkcja",
        "체육 무게": "waga na siłowni",
    },
    "ru": {
        "타입": "тип", "스택": "стак", "해머 횟수": "ударов молотком", "해머": "молоток",
        "사용 횟수": "использований", "피해량": "урон", "체력": "здоровье",
        "포만도": "голод", "정신력": "рассудок", "가연성": "горючесть",
        "수리 재료": "материал ремонта", "해머 전리품": "добыча с молотка",
        "장착 슬롯": "слот экипировки", "빛 반경": "радиус света",
        "연료 지속": "время горения", "유통기한": "срок годности",
        "지면": "грунт", "최대 HP": "макс. HP", "설치 시 HP": "HP при установке",
        "효과": "эффект", "기술 레벨": "уровень технологий", "기능": "функция",
        "체육 무게": "вес для тренажёра",
    },
}

# Game terms - Korean → target language
GAME_TERMS = {
    "en": {
        "구조물": "structure", "인벤토리 아이템": "inventory item", "소모품": "consumable",
        "배치형": "deployable", "모자": "hat", "손 장비": "hand equipment",
        "몸통 장비": "body equipment", "벽": "wall", "바닥 타일": "floor tile",
        "바닥재": "flooring", "도로": "road",
        "단단한 지면": "hard ground", "부드러운 지면": "soft ground",
        "화재 면역": "fire immune", "예": "yes",
        "이동속도": "movement speed", "정신력 오라": "sanity aura",
        "캐릭터 전용": "character exclusive", "스킬트리 연동": "skill tree linked",
        "세트 보너스": "set bonus", "전용 수리 키트로 수리": "repairable with dedicated kit",
        "풀": "grass", "통나무": "log", "돌": "rocks", "월석 조각": "moon rock nugget",
        "공포석": "dreadstone", "톱니바퀴": "gears", "와그펑크 부품": "wagpunk bits",
        "판자": "boards", "악몽 연료": "nightmare fuel", "순수한 공포": "pure horror",
        "툴레사이트": "thulecite", "툴레사이트 조각": "thulecite fragments",
        "보라 보석": "purple gem", "생목": "living log",
        "달식물 수리 키트": "lunar plant repair kit", "공허천 수리 키트": "voidcloth repair kit",
        "와그펑크 수리 키트": "wagpunk repair kit",
        "초석": "nitre", "금": "gold", "대리석": "marble",
        "거미줄": "silk", "밧줄": "rope", "돼지 가죽": "pig skin",
        "수면 시 정신력 회복": "sanity recovery while sleeping",
        "HP 비례": "proportional to HP", "즉시 회복": "instant recovery",
        "1회 소비": "single use",
        "화재 확산 완전 방지": "completely prevents fire spread",
        "캐릭터가 앉을 수 있음": "characters can sit",
        "글쓰기 가능": "writable", "꽃꽂이 가능": "can hold flowers",
        "캐릭터 스킨 변경": "change character skin",
        "순수 장식용": "purely decorative",
        "탁상 장식품": "table decoration", "탁자 위에 올려놓기 가능": "can be placed on tables",
        "겨울 축제 음식": "Winter's Feast food",
        "이벤트 장식": "event decoration", "이벤트 게임": "event game",
        "이벤트 놀이기구": "event ride", "이벤트 조명": "event lighting",
        "이벤트 화폐": "event currency", "이벤트 토큰": "event token",
        "구매 아이템": "shop item", "제작 재료": "crafting material",
        "건설 재료": "construction material", "청사진": "blueprint",
        "고양이 장난감": "cat toy",
        "도면": "sketch", "도예가의 돌림판에서": "at Potter's Wheel,",
        "해당 조각상 제작법 해금": "unlocks the corresponding sculpture recipe",
        "사용 시 소모": "consumed on use",
        "겨울 축제 오븐에서 제작": "crafted at Winter's Feast Oven",
        "겨울 축제 탁자에 배치하여 축제 버프 제공용": "placed on feast table to provide feast buff",
        # Common phrases & patterns
        "피격 시": "when hit,", "장착 시": "when equipped,", "제작 시": "when crafted,",
        "사용 시": "on use,", "착용 시": "when worn,", "설치 시": "when placed,",
        "소진 시": "when depleted,", "배치 시": "when deployed,",
        "장착 해제 시": "when unequipped,", "장착 중": "while equipped",
        "연료 소진 시": "when fuel runs out,",
        "해체 시": "when dismantled,", "소환 시": "when summoned,",
        "반경": "radius", "내구도": "durability", "재생": "regen",
        "감소": "reduction", "증가": "increase", "소모": "drain",
        "사거리": "range", "쿨다운": "cooldown", "주기": "interval",
        "연료": "fuel", "상시 소모": "constant drain", "수리 가능": "repairable",
        "활성화": "activated", "해체": "dismantle", "소환": "summon",
        "면역": "immune", "저항": "resistance", "흡수": "absorption",
        "자동": "auto", "원거리": "ranged", "근거리": "melee",
        "돌진 공격": "charge attack", "돌진": "charge",
        "발열": "heat output", "냉기": "cold", "냉각": "cooling",
        "보름달": "full moon", "초승달": "new moon",
        "전용": "exclusive", "전기": "electric",
        "없음": "none", "가능": "available", "불가": "unavailable",
        "오라": "aura", "속성": "attribute", "레벨": "level", "단계": "stage",
        "슬롯": "slot", "칸": "slots",
        "비팔로": "beefalo", "셰이들링": "shadeling",
        "제작물": "crafted item", "설치키트": "deploy kit", "소재": "material",
        "제작대": "crafting station", "전력 소모": "power drain",
        "회로 범위": "circuit range", "회오리": "tornado",
        "그림자 레벨": "shadow level", "그림자 속성 저항": "shadow resistance",
        "정신력 지속 감소": "constant sanity drain",
        "정신력 낮을수록 내구도 자동 재생": "auto-regen durability when sanity is low",
        "화염 피해 완전 면역": "complete fire damage immunity",
        "피격 시 공격자 점화": "ignites attacker when hit",
        "피격 시 가시 반격": "thorns retaliate when hit",
        "연료로 사용 가능": "can be used as fuel",
        "캐스팅 거리": "casting distance", "유인 반경": "lure radius",
        "매력도": "charm", "감기 속도": "reel speed",
        "건조 가능 아이템 전용": "dryable items only",
        "비 올 때 정지": "pauses in rain", "야간투시": "night vision",
        "질주": "gallop", "경주": "race", "훈련": "training",
        "미니게임": "minigame", "숨바꼭질": "hide-and-seek",
        "공물 바치면": "when offering is given,",
        "빈 상태 시": "when empty,", "제작법 해금": "unlocks recipe",
        "축제 버프": "feast buff", "축제 범위": "feast range",
        "탁자 범위": "table range", "놀래킬 수 있는 개체": "startleable entities",
        "비 올 때 연료 소모": "rain increases fuel drain",
        "초": "s", "분당": "/min", "하루": "/day",
        "공격자에게": "to attacker", "광기 상태": "insanity state",
        "그림자 생물 출현": "shadow creatures appear",
        "그림자": "shadow", "캐릭터": "character", "플레이어": "player",
        "아이템": "item", "조명": "lighting", "장식": "decoration",
        "이벤트": "event", "키트": "kit", "보너스": "bonus",
        "변환": "transform", "업그레이드": "upgrade", "스킬": "skill",
        "전환 가능": "toggleable",
    },
    "ja": {
        "구조물": "建造物", "인벤토리 아이템": "インベントリアイテム", "소모품": "消耗品",
        "배치형": "設置型", "모자": "帽子", "손 장비": "手装備",
        "몸통 장비": "胴装備", "벽": "壁", "바닥 타일": "床タイル",
        "바닥재": "フローリング", "도로": "道路",
        "단단한 지면": "硬い地面", "부드러운 지면": "柔らかい地面",
        "화재 면역": "火災免疫", "예": "はい",
        "이동속도": "移動速度", "정신력 오라": "正気度オーラ",
        "캐릭터 전용": "キャラクター専用", "스킬트리 연동": "スキルツリー連動",
        "세트 보너스": "セットボーナス", "전용 수리 키트로 수리": "専用修理キットで修理可能",
        "풀": "草", "통나무": "丸太", "돌": "石", "월석 조각": "ムーンロック",
        "공포석": "ドレッドストーン", "톱니바퀴": "ギア", "와그펑크 부품": "ワグパンクパーツ",
        "판자": "板", "악몽 연료": "ナイトメア燃料", "순수한 공포": "ピュアホラー",
        "툴레사이트": "トゥレサイト", "보라 보석": "パープルジェム", "생목": "リビングログ",
        "초석": "硝石", "금": "金", "대리석": "大理石",
        "겨울 축제 음식": "ウィンターフィースト料理",
        "이벤트 장식": "イベント装飾", "이벤트 게임": "イベントゲーム",
        "구매 아이템": "購入アイテム", "제작 재료": "製作素材",
        "청사진": "設計図", "고양이 장난감": "猫のおもちゃ",
        "도면": "設計図", "화재 확산 완전 방지": "火災の延焼を完全に防止",
        "캐릭터가 앉을 수 있음": "キャラクターが座れる",
        "글쓰기 가능": "書き込み可能", "꽃꽂이 가능": "花を挿せる",
        "캐릭터 스킨 변경": "キャラクタースキン変更",
        "순수 장식용": "純粋な装飾用",
        "겨울 축제 오븐에서 제작": "ウィンターフィーストオーブンで製作",
    },
}

# Copy es → es_MX with minor adjustments
FIELD_LABELS["es_MX"] = dict(FIELD_LABELS["es"])
GAME_TERMS.setdefault("es_MX", {}).update(GAME_TERMS.get("es", {}))

# For languages without full game terms, use English fallback
for lang in FIELD_LABELS:
    if lang not in GAME_TERMS:
        GAME_TERMS[lang] = dict(GAME_TERMS["en"])


def translate_line(line: str, lang: str) -> str:
    """Translate a single line from Korean to target language."""
    if not line.strip() or line.startswith("## ") or line.startswith("# "):
        return line

    result = line

    # Translate field labels (- label: value)
    m = re.match(r'^(\s*- )(.+?)(:.*)', result)
    if m:
        prefix, label, rest = m.group(1), m.group(2), m.group(3)
        labels = FIELD_LABELS.get(lang, {})
        if label in labels:
            result = f"{prefix}{labels[label]}{rest}"
            # Also translate the value part
            for ko, trans in GAME_TERMS.get(lang, {}).items():
                result = result.replace(ko, trans)
            return result

    # Translate game terms in usage/description lines
    terms = GAME_TERMS.get(lang, {})
    # Sort by length (longest first) to avoid partial replacements
    for ko in sorted(terms.keys(), key=len, reverse=True):
        result = result.replace(ko, terms[ko])

    return result


def translate_file(source_path: str, lang: str, output_path: str, header: str):
    """Translate entire source file to target language."""
    with open(source_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    translated = [header + "\n\n"]
    for line in lines[2:]:  # Skip Korean header
        translated.append(translate_line(line.rstrip(), lang) + "\n")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(translated)

    # Count remaining Korean
    ko_count = sum(1 for l in translated if re.search('[가-힣]', l))
    total = len(translated)
    print(f"  {os.path.basename(output_path)}: {total} lines, {ko_count} Korean lines remaining")


HEADERS = {
    "en": "# Item Stats — English",
    "ja": "# Item Stats — 日本語",
    "zh_TW": "# Item Stats — 繁體中文",
    "de": "# Item Stats — Deutsch",
    "fr": "# Item Stats — Français",
    "it": "# Item Stats — Italiano",
    "es": "# Item Stats — Español",
    "es_MX": "# Item Stats — Español (México)",
    "pt_BR": "# Item Stats — Português (Brasil)",
    "pl": "# Item Stats — Polski",
    "ru": "# Item Stats — Русский",
}

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    source = os.path.join(base_dir, "_source_ko.md")

    langs = sys.argv[1:] if len(sys.argv) > 1 else list(HEADERS.keys())

    for lang in langs:
        if lang not in HEADERS:
            print(f"Unknown language: {lang}")
            continue
        output = os.path.join(base_dir, f"{lang}.md")
        print(f"Translating to {lang}...")
        translate_file(source, lang, output, HEADERS[lang])

    print("\nDone!")
