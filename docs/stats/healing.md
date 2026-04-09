# 치유 (Healing) 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

---

## bandage — Honey Poultice (꿀 반창고)
- 체력: +30 HP (즉시 회복)
- 사용 횟수: 1 (1회 소비)
- 스택: 40
- 소스: bandage.lua

## bedroll_straw — Straw Roll (밀짚 침낭)
- 스택: 10
- 수면 효과 (초당):
  - 체력: +0.5/초
  - 정신력: +0.667/초
  - 허기: -1/초
- 온도 조절: 없음
- 소스: bedroll_straw.lua

## bedroll_furry — Fur Roll (토끼털 침낭)
- 사용 횟수: 3
- 수면 효과 (초당):
  - 체력: +1/초
  - 정신력: +1/초
  - 허기: -1/초
- 방한: 온도 유지 30~45°C
- 소스: bedroll_furry.lua

## healingsalve — Healing Salve (고약)
- 체력: +20 HP (즉시 회복)
- 사용 횟수: 1 (1회 소비)
- 스택: 40
- 소스: healingsalve.lua

## healingsalve_acid — Slimy Salve (점액질 고약)
- 체력: +20 HP (즉시 회복)
- 사용 횟수: 1 (1회 소비)
- 스택: 40
- 추가 효과: 사용 후 산성비 면역 240초
- 소스: healingsalve_acid.lua

## lifeinjector — Booster Shot (예방주사)
- 효과: 최대 HP 패널티 25% 제거
- 사용 횟수: 1 (1회 소비)
- 스택: 40
- 소스: lifeinjector.lua

## reviver — Telltale Heart (고자질쟁이 심장)
- 효과: 유령 상태의 플레이어 부활
- 부활 정신력: 부활한 플레이어 +80 SAN
- 패널티: 부활 대상 최대 HP 25% 패널티 적용
- 사용 횟수: 1 (1회 소비)
- 소스: reviver.lua

## tillweedsalve — Tillweed Salve (뒤엎시라 고약)
- 체력: +8 HP (즉시) + +1 HP/3초 × 60초 = +20 HP (지속), 합계 +28 HP
- 사용 횟수: 1 (1회 소비)
- 스택: 40
- 소스: tillweedsalve.lua

---

## 참조 아이템 (타 문서)

아래 아이템은 치유 기능을 포함하나 다른 카테고리 md에서 관리됩니다.

| 아이템 ID | 영문명 | 참조 문서 | 비고 |
|---|---|---|---|
| amulet | Life Giving Amulet | magic.md | 미작성 상태 |
| bandage_butterflywings | Butterfly Wings Bandage | character.md | |
| portabletent_item | Portable Tent | character.md | |
| wx78module_bee | Bee Queen Module (WX-78) | character.md | |
