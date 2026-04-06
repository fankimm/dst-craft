# 치유 (Healing) 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

---

## bandage — Honey Poultice (꿀 반창고)
- health: +30 HP (즉시 회복)
- uses: 1 (1회 소비)
- stacksize: 40
- 소스: prefabs/bandage.lua

## bedroll_straw — Straw Roll (밀짚 침낭)
- stacksize: 10
- 수면 효과 (초당):
  - health: +0.5/초
  - sanity: +0.667/초
  - hunger: -1/초
- 온도 조절: 없음
- 소스: prefabs/bedroll_straw.lua

## bedroll_furry — Fur Roll (토끼털 침낭)
- uses: 3
- 수면 효과 (초당):
  - health: +1/초
  - sanity: +1/초
  - hunger: -1/초
- insulation: 온도 유지 30~45°C (방한 기능)
- 소스: prefabs/bedroll_furry.lua

## healingsalve — Healing Salve (고약)
- health: +20 HP (즉시 회복)
- uses: 1 (1회 소비)
- stacksize: 40
- 소스: prefabs/healingsalve.lua

## healingsalve_acid — Slimey Healing Salve (점액질 고약)
- health: +20 HP (즉시 회복)
- uses: 1 (1회 소비)
- stacksize: 40
- bonus: 사용 후 산성비 면역 240초
- 소스: prefabs/healingsalve_acid.lua

## lifeinjector — Life Giving Amulet Shot (예방주사)
- effect: 최대 HP 패널티 25% 제거
- uses: 1 (1회 소비)
- stacksize: 40
- 소스: prefabs/lifeinjector.lua

## reviver — Touch Stone Feather (고자질쟁이 심장)
- effect: 유령 상태의 플레이어 부활
- sanity_bonus: 부활한 플레이어 +80 SAN
- penalty: 부활 대상 최대 HP 25% 패널티 적용
- uses: 1 (1회 소비)
- 소스: prefabs/reviver.lua

## tillweedsalve — Tillweed Salve (뒤엎시라 고약)
- health: +8 HP (즉시) + +1 HP/3초 × 60초 = +20 HP (지속), 합계 +28 HP
- uses: 1 (1회 소비)
- stacksize: 40
- 소스: prefabs/tillweedsalve.lua

---

## 참조 아이템 (타 문서)

아래 아이템은 치유 기능을 포함하나 다른 카테고리 md에서 관리됩니다.

| 아이템 ID | 영문명 | 참조 문서 | 비고 |
|---|---|---|---|
| amulet | Life Giving Amulet | magic.md | 미작성 상태 |
| bandage_butterflywings | Butterfly Wings Bandage | character.md | |
| portabletent_item | Portable Tent | character.md | |
| wx78module_bee | Bee Queen Module (WX-78) | character.md | |
