# 요리 (Cooking) 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30, night_time=60

## cookbook — Cookbook (요리책)
- 기능: 요리책 팝업 열기
- 연료 지속: 45초

## cookpot — Cook Pot (요리솥)
- 종류: 구조물
- 슬롯 수: 4
- 기본 조리 시간: ~20초 (레시피별 배수 적용)
- 해머 횟수: 4회

## meatrack — Drying Rack (건조대)
- 종류: 구조물
- 슬롯 수: 3 (건조 가능 아이템 전용)
- 건조 시간: 0.5~2일 (아이템별 상이)
- 특이사항: 비 올 때 정지
- 해머 횟수: 4회

## spice_chili — Chili Flakes (고춧가루)
- 스택: 40
- 버프: 공격력 ×1.2, 지속 240초
- 체온: +40

## spice_garlic — Garlic Powder (마늘가루)
- 스택: 40
- 버프: 피해 흡수 33.3%, 지속 240초

## spice_salt — Ground Salt (가루 소금)
- 스택: 40
- 효과: 체력 회복 +25% (즉시 적용, 버프 없음)

## spice_sugar — Honey Crystals (꿀 결정)
- 스택: 40
- 버프: 작업 효율 ×2, 지속 240초

## wintersfeastoven — Masonry Oven (석조 오븐)
- 종류: 구조물
- 특이사항: 겨울 축제 전용
- 기본 조리 시간: ~20초
- 제작 스테이션: 프로토타이퍼 (WINTERSFEASTCOOKING)
- 해머 횟수: 4회

## portablefirepit_item — Portable Fire Pit (휴대용 화로)
- 참조: character.md
