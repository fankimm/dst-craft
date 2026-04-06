# winter 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

## campfire — Campfire (모닥불)
- 타입: 구조물
- usage:
  - 연료 270초 (시작 135)
  - 비 올 때 연료 소모 가속 (RAIN_RATE=2.5, 최대 강수 시 3.5배 소모)
  - 4단계
  - cooker
  - 소진 시 재 + 사라짐

## firepit — Fire Pit (화덕)
- 타입: 구조물
- usage:
  - 해머 4회
  - 연료 360초
  - 비 올 때 연료 소모 가속 (RAIN_RATE=2, 최대 강수 시 3배 소모)
  - bonusmult 2
  - cooker

## dragonflyfurnace — Scaled Furnace (용비늘 화로)
- 타입: 구조물
- usage:
  - 해머 6회
  - 영구 화염
  - heat 115
  - 4칸 컨테이너
  - cooker + 소각

## tent — Tent (텐트)
- 타입: 구조물
- usage:
  - 해머 4회
  - uses 15
  - 수면 HP +2/초, 허기 -1/초
  - 체온 목표 40

## heatrock — Thermal Stone (보온석)
- 타입: 아이템
- usage:
  - uses 8 (온도 범위 crossing)
  - 5단계 온도
  - 보온 MED 120
  - 최고 온도 시 빛 방출

## winterometer — Icicle-O-Meter (온도계)
- 타입: 구조물
- usage:
  - 해머 4회
  - 온도 미터 표시

## cotl_tabernacle_level1 — Humble Lamb Idol (초라한 양 우상)
- 타입: 구조물
- usage:
  - 해머 4회
  - 3단계 업그레이드
  - Lv1 연료 120 / Lv2 연료 240 / Lv3 연료 480
  - cooker
  - 정신력 오라 (Lv1 +50 / Lv2 +80 / Lv3 +200일)
