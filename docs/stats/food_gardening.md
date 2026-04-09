# food_gardening 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

## beebox — Bee Box (벌통)
- 타입: 구조물
- 꿀 최대: 6
- 벌: 4마리
- 벌 재생: 120초
- 해머: 4회

## birdcage — Birdcage (새장)
- 타입: 구조물
- 새 보관
- 변환: 고기 → 알, 씨앗 → 씨앗
- 해머: 4회

## compostingbin — Composting Bin (퇴비통)
- 타입: 구조물
- 수용: 재료 6개
- 생산: 퇴비 1개 / 240~480초
- 해머: 4회

## farm_plow_item — Hoe (텃밭 쟁기계)
- 타입: 도구
- 사용 횟수: 4
- 효과: 타일 → 농장 흙 변환
- 굴착 시간: 15초

## fertilizer — Fertilizer (거름통)
- 타입: 도구
- 사용 횟수: 10
- 효과: 비료 300초
- 영양소: 퇴비 0 / 성장촉진제 0 / 거름 16

## mushroom_farm — Mushroom Farm (버섯 재배기)
- 타입: 구조물
- 수확: 4회
- 성장 시간: 1800초
- 수리 재료: 생목
- 해머: 3회

## ocean_trawler_kit — Ocean Trawler Kit (바다 어망 키트)
- 타입: 수상 구조물
- 슬롯: 4
- 자동 어획: 12.5% / 0.75초
- 미끼 사용 시: 어획률 2배
- 보존: 10배

## soil_amender — Soil Amender (성장 촉진제 원액)
- 타입: 발효 아이템 (3단계)
- 신선: 영양소 퇴비 8 / 성장촉진제 0 / 거름 0
- 숙성: 영양소 퇴비 16 / 성장촉진제 0 / 거름 0
- 발효: 영양소 퇴비 32 / 성장촉진제 0 / 거름 0
- 사용 횟수: 5 (발효 후)

## treegrowthsolution — Tree Growth Solution (나무 잼)
- 타입: 도구
- 스택: 10
- 효과: 비료 + 나무 성장 + 보트 수리 20 HP
- 영양소: 퇴비 8 / 성장촉진제 32 / 거름 8

## trophyscale_oversizedveggies — Trophy Scale (농작물 등급 측정기)
- 타입: 구조물
- 효과: 대형 작물 무게 측정
- 최고 기록 유지
- 해머: 4회
