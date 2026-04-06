# 의류 (Clothing) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30
> INSULATION: SMALL=60, MED=120, MED_LARGE=180, LARGE=240
> WATERPROOFNESS: SMALL=0.2, SMALLMED=0.35, MED=0.5, LARGE=0.7, HUGE=0.9, ABSOLUTE=1.0
> usage 태그: `[character]`=캐릭터 전용, `[set]`=세트 보너스, `[skilltree]`=스킬트리 연동, `[forge]`=전용 수리 키트로 수리

---

## 가방류

## backpack — Backpack (배낭)
- slots: 8
- 소스: prefabs/backpack.lua

## piggyback — Piggyback (돼지 배낭)
- slots: 12
- speed_mult: 0.9 (이동속도 10% 감소)
- 소스: prefabs/piggyback.lua

## icepack — Insulated Pack (냉장 배낭)
- slots: 8
- perishable_mod: 0.5 (부패 속도 50% 감소, fridge 효과)
- 소스: prefabs/icepack.lua

## seedpouch — Seed Pouch (씨앗 주머니)
- slots: 14
- perishable_mod: 0.5 (부패 속도 50% 감소, preserver 효과)
- 소스: prefabs/seedpouch.lua

---

## 모자류

## balloonhat — Balloon Hat (풍선 모자)
- dapperness: +0.022/s
- fuel_time: 480s (1일)
- waterproofness: 0.2 (SMALL)
- usage:
  - 번개 피해 면역 (insulated 태그)
  - 피격 시 터짐 (팝 → 파괴)
- 소스: prefabs/balloonhat.lua

## beefalohat — Beefalo Hat (비팔로 모자)
- insulation: 240 (LARGE)
- waterproofness: 0.2 (SMALL)
- fuel_time: 4800s (10일)
- usage:
  - beefalo 태그 부여 → 비팔로 비적대
- 소스: prefabs/beefalohat.lua

## catcoonhat — Catcoon Hat (캣쿤 모자)
- insulation: 60 (SMALL)
- dapperness: +0.056/s
- fuel_time: 4800s (10일)
- 소스: prefabs/catcoonhat.lua

## deserthat — Desert Hat (사막 모자)
- summer_insulation: 120 (MED)
- waterproofness: 0.2 (SMALL)
- dapperness: +0.056/s
- fuel_time: 4800s (10일)
- usage:
  - goggles 태그 부여
- 소스: prefabs/deserthat.lua

## earmuffshat — Rabbit Earmuffs (토끼 귀마개)
- insulation: 60 (SMALL)
- fuel_time: 2400s (5일)
- 소스: prefabs/earmuffshat.lua

## eyebrellahat — Eyebrella (눈알 우산 모자)
- waterproofness: 1.0 (ABSOLUTE)
- summer_insulation: 240 (LARGE)
- fuel_time: 4320s (9일)
- usage:
  - 번개 피해 면역 (insulated 태그)
  - umbrella 태그 부여
- 소스: prefabs/eyebrellahat.lua

## featherhat — Feather Hat (깃털 모자)
- dapperness: +0.033/s
- fuel_time: 3840s (8일)
- 소스: prefabs/featherhat.lua

## flowerhat — Flower Crown (꽃 화관)
- dapperness: +0.022/s
- fuel_time: 2880s (6일)
- usage:
  - 머맨에게 반전(적대 → 비적대)
- 소스: prefabs/flowerhat.lua

## goggleshat — Goggles (고글)
- dapperness: +0.056/s
- fuel_time: 4800s (10일)
- usage:
  - goggles 태그 부여 (보호 효과 없음)
- 소스: prefabs/goggleshat.lua

## icehat — Ice Cube Hat (얼음 모자)
- summer_insulation: 240 (LARGE)
- speed_mult: 0.9 (이동속도 10% 감소)
- perish: 3840s (8일)
- usage:
  - 착용 중 냉각 -40 (체온 하강)
  - 습도 +1/s (최대 49%)
  - 얼음으로 수리 가능
- 소스: prefabs/icehat.lua

## inspectacleshat — Inspectacles (검사 안경)
- usage:
  - 주변 게임 신호 감지, 5초마다 갱신
  - `[character]` Winona 전용 스킬 필요
- 소스: prefabs/inspectacleshat.lua

## kelphat — Kelp Fronds Hat (다시마 모자)
- dapperness: -0.022/s (머맨 착용 시 반전)
- perish: 2880s (6일)
- 소스: prefabs/kelphat.lua

## mermhat — Merm Hat (머맨 모자)
- dapperness: -0.022/s
- perish: 7200s (15일)
- usage:
  - merm 태그 부여 → 머맨 비적대
- 소스: prefabs/mermhat.lua

## blue_mushroomhat — Blue Mushroom Hat (파란 버섯 모자)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 착용 중 파란 포자 방출
- 소스: prefabs/blue_mushroomhat.lua

## green_mushroomhat — Green Mushroom Hat (초록 버섯 모자)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 착용 중 초록 포자 방출
- 소스: prefabs/green_mushroomhat.lua

## red_mushroomhat — Red Mushroom Hat (빨간 버섯 모자)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 착용 중 빨간 포자 방출
- 소스: prefabs/red_mushroomhat.lua

## moon_mushroomhat — Moon Mushroom Hat (달 버섯 모자)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 달 포자 방출 (1.5초 간격, 일반 버섯 모자보다 빠름)
  - 피격 시 달 포자 3개 추가 방출
  - moon_spore_protection 태그 부여
- 소스: prefabs/moon_mushroomhat.lua

## moonstorm_goggleshat — Moonstorm Goggles (달폭풍 고글)
- dapperness: +0.056/s
- waterproofness: 0.2 (SMALL)
- fuel_time: 480s (1일)
- usage:
  - goggles 태그 부여
  - 달폭풍 감지 기능
- 소스: prefabs/moonstorm_goggleshat.lua

## nutrientsgoggleshat — Nutrient Goggles (영양 고글)
- summer_insulation: 60 (SMALL)
- shadowlevel: 1
- usage:
  - plantinspector 태그 부여 (식물 검사)
  - nutrientsvision 태그 부여 (토양 영양 시각화)
- 소스: prefabs/nutrientsgoggleshat.lua

## polly_rogershat — Polly Roger's Hat (폴리 로저의 모자)
- waterproofness: 0.35 (SMALLMED)
- fuel_time: 2880s (6일)
- usage:
  - 착용 시 앵무새(Polly Rogers) 소환 — 주변 아이템 자동 줍기
  - 앵무새 사망 시 1일 후 부활 (POLLY_ROGERS_SPAWN_TIME=480s)
  - 서버 이동 시 앵무새 유지 (migrationpetowner)
- 소스: hats.lua (fns.polly_rogers, spawner 컴포넌트), tuning.lua (POLLY_ROGERS_HAT_PERISHTIME, POLLY_ROGERS_SPAWN_TIME)

## pumpkinhat — Pumpkin Lantern (호박 등불 모자)
- waterproofness: 0.2 (SMALL)
- perish: 3840s (8일, 핼러윈 이벤트 중 7200s)
- usage:
  - 어둠에 의한 정신력 감소 면역
  - 유령 피해 면역
- 소스: prefabs/pumpkinhat.lua

## rainhat — Rain Hat (비 모자)
- waterproofness: 0.7 (LARGE)
- fuel_time: 4800s (10일)
- usage:
  - 번개 피해 면역 (insulated 태그)
- 소스: prefabs/rainhat.lua

## roseglasseshat — Rose-Tinted Glasses (장밋빛 안경)
- dapperness: +0.022/s
- usage:
  - `[character]` Winona 전용
  - `[skilltree]` closeinspector / wormholetracker 스킬 연동
- 소스: prefabs/roseglasseshat.lua

## strawhat — Straw Hat (밀짚모자)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- fuel_time: 2400s (5일)
- usage:
  - 연료로 사용 가능
- 소스: prefabs/strawhat.lua

## tophat — Top Hat (실크 모자)
- waterproofness: 0.2 (SMALL)
- dapperness: +0.056/s
- fuel_time: 3840s (8일)
- 소스: prefabs/tophat.lua

## tophat_magician — Magician's Top Hat (마술사 실크 모자)
- waterproofness: 0.2 (SMALL)
- dapperness: +0.056/s
- fuel_time: 3840s (8일)
- shadowlevel: 2
- usage:
  - 그림자 수납공간 제공 (shadow storage)
- 소스: prefabs/tophat_magician.lua

## walterhat — Walter's Dapper Vest (월터의 멋쟁이 조끼 모자)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- dapperness: +0.033/s
- fuel_time: 4800s (10일)
- usage:
  - `[character]` Walter 전용 — 정신력 피해 50% 경감
- 소스: prefabs/walterhat.lua

## watermelonhat — Watermelon Hat (수박 모자)
- summer_insulation: 120 (MED)
- waterproofness: 0.2 (SMALL)
- dapperness: -0.033/s
- perish: 1440s (3일)
- usage:
  - 착용 중 냉각 -55 (체온 하강)
  - 습도 +0.5/s
- 소스: prefabs/watermelonhat.lua

## winterhat — Winter Hat (겨울 모자)
- insulation: 120 (MED)
- dapperness: +0.022/s
- fuel_time: 4800s (10일)
- 소스: prefabs/winterhat.lua

## bushhat — Bush Hat (덤불 모자)
- usage:
  - 숨기 기능 (hide) — 적에게 탐지되지 않음
- 소스: prefabs/bushhat.lua

---

## 조끼/코트류

## armorslurper — Belt of Hunger (배고픔의 허리띠)
- hunger_rate: 0.6 (40% 감소)
- dapperness: +0.033/s
- fuel_time: 3840s (8일)
- shadowlevel: 2
- usage:
  - armor 컴포넌트 없음 (방어 효과 없음)
- 소스: prefabs/armorslurper.lua

## beargervest — Hibearnation Vest (동면 조끼)
- insulation: 240 (LARGE, MED_LARGE 기준 +0.074/s dapperness)
- dapperness: +0.074/s
- hunger_rate: 0.75 (25% 감소)
- fuel_time: 3360s (7일)
- 소스: prefabs/beargervest.lua

## hawaiianshirt — Hawaiian Shirt (하와이안 셔츠)
- summer_insulation: 240 (LARGE)
- dapperness: +0.056/s
- perish: 7200s (15일)
- 소스: prefabs/hawaiianshirt.lua

## onemanband — One-man Band (원맨밴드)
- dapperness: -0.033/s (기본; 팔로워 1명당 추가 감소)
- fuel_time: 180s
- usage:
  - 팔로워 감지 범위: 12
  - 최대 팔로워 수: 10
  - shadowlevel: 1
- 소스: prefabs/onemanband.lua

## raincoat — Rain Coat (비옷)
- waterproofness: 1.0 (ABSOLUTE, 완전 방수)
- insulation: 60 (SMALL)
- fuel_time: 4800s (10일)
- usage:
  - 번개 피해 면역 (insulated 태그)
- 소스: prefabs/raincoat.lua

## reflectivevest — Reflective Vest (반사 조끼)
- summer_insulation: 120 (MED)
- waterproofness: 0.2 (SMALL)
- dapperness: +0.033/s
- fuel_time: 3840s (8일)
- 소스: prefabs/reflectivevest.lua

## sweatervest — Sweater Vest (스웨터 조끼)
- insulation: 60 (SMALL)
- dapperness: +0.056/s
- fuel_time: 4800s (10일)
- 소스: prefabs/sweatervest.lua

## trunkvest_summer — Summer Frest (여름 조끼)
- summer_insulation: 60 (SMALL)
- waterproofness: 0.2 (SMALL)
- dapperness: +0.033/s
- fuel_time: 7200s (15일)
- 소스: prefabs/trunkvest_summer.lua

## trunkvest_winter — Puffy Vest (겨울 조끼)
- insulation: 240 (LARGE)
- dapperness: +0.033/s
- fuel_time: 7200s (15일)
- 소스: prefabs/trunkvest_winter.lua

---

## 우산/부채류

## featherfan — Feather Fan (깃털 부채)
- uses: 15회
- usage:
  - 범위 7 내 냉각 -50도 (최소 체온 2.5도까지)
  - 범위 내 불 끄기 가능
- 소스: prefabs/featherfan.lua

## grass_umbrella — Grass Umbrella (풀 우산)
- waterproofness: 0.5 (MED)
- summer_insulation: 120 (MED)
- dapperness: +0.033/s
- perish: 960s (2일)
- usage:
  - 연료로 사용 가능
- 소스: prefabs/grass_umbrella.lua

## minifan — Mini Fan (미니 선풍기)
- damage: 17
- fuel_time: 90s
- usage:
  - 이동 중에만 활성화: 냉각 -55 + 방열 +60
  - 정지 시 냉각/방열 비활성
- 소스: prefabs/minifan.lua

## umbrella — Umbrella (우산)
- waterproofness: 0.9 (HUGE)
- summer_insulation: 120 (MED)
- fuel_time: 2880s (6일)
- 소스: prefabs/umbrella.lua

## voidcloth_umbrella — Void Cloth Umbrella (공허의 천 우산)
- waterproofness: 1.0 (ABSOLUTE)
- summer_insulation: 240 (LARGE)
- dapperness: -0.056/s
- fuel_time: 7200s (15일)
- shadowlevel: 3
- usage:
  - 산성비 / 달우박 피해 면역
  - 돔 기능: 반경 16 범위 보호 (사용 시 내구 소모 1.5배)
  - 파손 시 수리 가능
  - `[forge]` 공허의 수리 도구로 수리
- 소스: prefabs/voidcloth_umbrella.lua

## winona_telebrella — Telebrella (텔레브렐라)
- waterproofness: 0.35 (SMALLMED)
- fuel_time: 7200s (15일, 배터리 충전 방식)
- usage:
  - 텔레포트 기능 (1일분 연료 소모)
  - `[character]` Winona 전용
  - `[skilltree]` winona_wagstaff_2 스킬 연동
- 소스: prefabs/winona_telebrella.lua

## balloonvest — Balloon Vest (풍선 조끼)
- fuel_time: 480s (1일)
- usage:
  - flotationdevice 태그 부여 → 익사 방지
  - 피격 시 터짐 (팝 → 파괴)
- 소스: prefabs/balloonvest.lua

---

## 기타 (다른 카테고리와 중복)

- antlionhat — Turf-Raiser Helm (땅엎기 투구) → armor.md 참조
- beehat — Beekeeper Hat (양봉가 모자) → armor.md 참조
- cane — Cane (지팡이) → tools.md 참조
- walking_stick — Walking Stick (지팡이) → tools.md 참조
- sewing_kit — Sewing Kit (바느질 키트) → tools.md 참조
- sewing_tape — Sewing Tape (바느질 테이프) → tools.md 참조
