# 도구 (Tools) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, armor_dur_mod=0.7, armor_abs_mod=1.0
> seg_time=30, day_time=480, total_day_time=480
> GOLDENTOOLFACTOR=4 (황금 도구는 작업 소모 1/4)
>
> usage 태그: `[pvp]` = PvP 관련, `[set]` = 세트 보너스, `[character]` = 캐릭터 전용, `[skilltree]` = 스킬트리 연동, `[forge]` = 전용 수리 키트로 수리, `[electric]` = 전기 피해(젖은 적 1.5배)

---

## 기본 도구

## axe — Axe (도끼)
- damage: 27.2 (wilson_attack×0.8)
- uses: 100
- 소스: tuning.lua (AXE_DAMAGE, AXE_USES) + prefabs/axe.lua

## goldenaxe — Luxury Axe (고급스런 도끼)
- damage: 27.2 (wilson_attack×0.8)
- uses: 100 (작업 소모 1/4 = 실질 400회 벌목, 공격 소모도 1/4)
- 소스: tuning.lua (AXE_USES, GOLDENTOOLFACTOR=4) + prefabs/axe.lua (SetConsumption 1/GOLDENTOOLFACTOR)

## pickaxe — Pickaxe (곡괭이)
- uses: 33
- 소스: tuning.lua (PICKAXE_USES) + prefabs/pickaxe.lua

## goldenpickaxe — Opulent Pickaxe (부유한 곡괭이)
- uses: 33 (작업 소모 1/4 = 실질 132회 채광)
- 소스: tuning.lua (PICKAXE_USES, GOLDENTOOLFACTOR=4) + prefabs/pickaxe.lua

## shovel — Shovel (삽)
- uses: 25
- 소스: tuning.lua (SHOVEL_USES) + prefabs/shovel.lua

## goldenshovel — Regal Shovel (제왕의 삽)
- uses: 25 (작업 소모 1/4 = 실질 100회)
- 소스: tuning.lua (SHOVEL_USES, GOLDENTOOLFACTOR=4) + prefabs/shovel.lua

## hammer — Hammer (망치)
- damage: 17 (wilson_attack×0.5)
- uses: 75
- usage:
  - 구조물 해체 (50% 재료 회수)
- 소스: tuning.lua (HAMMER_USES, HAMMER_DAMAGE) + prefabs/hammer.lua

## pitchfork — Pitchfork (쇠스랑)
- damage: 17 (wilson_attack×0.5)
- uses: 25 (작업 소모 0.125/회 = 실질 200회 바닥 작업)
- 소스: tuning.lua (PITCHFORK_DAMAGE, PITCHFORK_USES) + prefabs/pitchfork.lua (SetConsumption TERRAFORM 0.125)

## goldenpitchfork — Snazzy Pitchfork (세련된 쇠스랑)
- damage: 17 (wilson_attack×0.5)
- uses: 25 (작업 소모 0.03125/회 = 실질 800회 바닥 작업)
- 소스: tuning.lua (PITCHFORK_USES, GOLDENTOOLFACTOR=4) + prefabs/pitchfork.lua (SetConsumption 0.125/GOLDENTOOLFACTOR)

## razor — Razor (면도날)
- uses: 무한 (finiteuses 없음)
- usage:
  - 비팔로/수염 면도용 (shaver 컴포넌트)
- 소스: prefabs/razor.lua (shaver만, 무기/내구도 컴포넌트 없음)

## farm_hoe — Garden Hoe (괭이)
- damage: 17 (wilson_attack×0.5)
- uses: 25
- 소스: tuning.lua (FARM_HOE_DAMAGE, FARM_HOE_USES) + prefabs/farm_hoe.lua

## golden_farm_hoe — Splendid Garden Hoe (인상적인 괭이)
- damage: 17 (wilson_attack×0.5)
- uses: 25 (작업 소모 1/4 = 실질 100회)
- 소스: tuning.lua (FARM_HOE_USES, GOLDENTOOLFACTOR=4) + prefabs/farm_hoe.lua

---

## 특수 도구

## moonglassaxe — Moon Glass Axe (달유리 도끼)
- damage: 34 (wilson_attack)
- uses: 100 (벌목 효율 2.5배, 벌목 소모 1.25/회 = 실질 80회 벌목, 공격 소모 2/회 = 실질 50회 공격)
- usage:
  - 그림자 적 25% 추가 피해 (42.5, damagetypebonus "shadowsubmissive")
  - 그림자 적 공격 시 내구도 소모 절반 (attackwear=0.5, 실질 200회)
- 소스: tuning.lua (MOONGLASSAXE) + prefabs/axe.lua (damagetypebonus, attackwear=2, SHADOW_WEAR=0.5)

## multitool_axe_pickaxe — Pick/Axe (도깽이)
- damage: 42.5 (wilson_attack×1.25)
- uses: 800 (작업 효율 4/3배)
- usage:
  - 도끼 + 곡괭이 겸용
  - 그림자 레벨 1
- 소스: tuning.lua (MULTITOOL) + prefabs/axe_pickaxe.lua (shadowlevel)

## pickaxe_lunarplant — Brightshade Smasher (빛말풀 부수개)
- damage: 32.5 (wilson_attack×1.25 - 10)
- planar_damage: 10
- uses: 600 (채광 효율 4/3배)
- usage:
  - 그림자 적 10% 추가 피해 (damagetypebonus "shadow_aligned")
  - `[set]` 빛말풀 세트 보너스 시 피해 10% 증가 + 차원 피해 +5
  - `[forge]` 빛말풀 수리 도구(lunarplant_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (PICKAXE_LUNARPLANT) + prefabs/pickaxe_lunarplant.lua (damagetypebonus, MakeForgeRepairable)

## shovel_lunarplant — Brightshade Shoevel (빛말풀 괭이삽)
- damage: 17.2 (wilson_attack×0.8 - 10)
- planar_damage: 10
- uses: 250
- usage:
  - 삽 + 괭이 겸용
  - 그림자 적 10% 추가 피해 (damagetypebonus "shadow_aligned")
  - `[set]` 빛말풀 세트 보너스 시 피해 10% 증가 + 차원 피해 +5
  - `[forge]` 빛말풀 수리 도구(lunarplant_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (SHOVEL_LUNARPLANT) + prefabs/shovel_lunarplant.lua (damagetypebonus, MakeForgeRepairable)

## voidcloth_scythe — Shadow Reaper (그림자 수확자)
- damage: 38 (wilson_attack×2 - 30)
- planar_damage: 18
- uses: 200
- dapperness: -0.0347/초 (DAPPERNESS_MED 음수, 분당 -2.08)
- usage:
  - 범위 수확 (반경 4, 각도 165도)
  - 장착 시 정신력 지속 감소 (분당 -2.08)
  - 달 진영 10% 추가 피해 (damagetypebonus)
  - 그림자 레벨 3
  - `[set]` 공허천 세트 보너스 시 피해 10% 증가 (41.8) + 차원 피해 +5
  - `[forge]` 공허의 수리 도구(voidcloth_kit)로 수리 (내구도 100% 복구)
  - 말을 함 (대사 있음)
- 소스: tuning.lua (VOIDCLOTH_SCYTHE) + prefabs/voidcloth_scythe.lua (shadowlevel, dapperness, MakeForgeRepairable)

---

## 이동 도구

## cane — Walking Cane (워킹 케인)
- damage: 17 (wilson_attack×0.5)
- speed_mult: 1.25 (이동속도 25% 증가)
- 소스: tuning.lua (CANE_DAMAGE, CANE_SPEED_MULT) + prefabs/cane.lua

## walking_stick — Wooden Walking Stick (나무 지팡이)
- speed_mult: 1.15 (이동속도 15% 증가)
- perish_time: 1920 (4일, WALKING_STICK_PERISHTIME = 4×total_day_time)
- usage:
  - 시간 경과로 부패
- 소스: tuning.lua (WALKING_STICK_SPEED_MULT, WALKING_STICK_PERISHTIME) + prefabs/walking_stick.lua

---

## 잡기 도구

## bugnet — Bug Net (잠자리채)
- damage: 4.25 (wilson_attack×0.125)
- uses: 10 (포획 1/회, 공격 3/회 attackwear=3)
- 소스: tuning.lua (BUGNET_DAMAGE, BUGNET_USES) + prefabs/bugnet.lua

## thulecitebugnet — Thulecite Bug Net (툴레사이트 잠자리채)
- damage: 4.25 (wilson_attack×0.125)
- uses: 100 (포획 1/회, 공격 3/회 attackwear=3)
- 소스: tuning.lua (THULECITEBUGNET_DAMAGE, THULECITEBUGNET_USES) + prefabs/bugnet.lua

## birdtrap — Bird Trap (새덫)
- uses: 8
- 소스: tuning.lua (TRAP_USES)

## trap — Trap (덫)
- uses: 8
- 소스: tuning.lua (TRAP_USES)

## fishingrod — Freshwater Fishing Rod (연못 낚싯대)
- damage: 4.25 (wilson_attack×0.125)
- uses: 9 (낚시 1/회, 공격 4/회 attackwear=4)
- 소스: tuning.lua (FISHINGROD_DAMAGE, FISHINGROD_USES) + prefabs/fishingrod.lua

## oceanfishingrod — Sea Fishing Rod (바다 낚싯대)
- usage:
  - 바다 낚시 전용 (루어/태클 장착 가능)
- 소스: prefabs/oceanfishingrod.lua

---

## 보조 도구

## brush — Brush (솔)
- damage: 27.2 (wilson_attack×0.8)
- uses: 75 (빗질 1/회, 공격 3/회 attackwear=3)
- usage:
  - 비팔로 빗질용 (길들이기 관련)
- 소스: tuning.lua (BRUSH_DAMAGE, BRUSH_USES) + prefabs/brush.lua

## compass — Compass (나침반)
- damage: 10
- fuel_time: 1920 (day_time×4)
- usage:
  - 방향 표시
  - 공격 시 내구도 30% 감소 (COMPASS_ATTACK_DECAY_PERCENT=-0.3)
- 소스: tuning.lua (COMPASS_FUEL, COMPASS_ATTACK_DECAY_PERCENT) + prefabs/compass.lua

## pocket_scale — Pocket Scale (휴대용 저울)
- usage:
  - 물고기 무게 측정
- 소스: prefabs/pocket_scale.lua

## featherpencil — Feather Pencil (깃펜)
- 스택: 20
- usage:
  - 지도 마킹용
- 소스: prefabs/featherpencil.lua

## sentryward — Ocuvigil (오큐비질)
- usage:
  - 설치 시 미니맵 영역 공개
- 소스: prefabs/sentryward.lua

---

## 수리/변환 도구

## sewing_kit — Sewing Kit (바느질 도구)
- uses: 5
- usage:
  - 의류/갑옷 내구도 수리 (SEWINGKIT_REPAIR_VALUE = total_day_time×5 = 2400)
- 소스: tuning.lua (SEWINGKIT_USES) + prefabs/sewingkit.lua

## sewing_tape — Trusty Tape (믿음직한 테이프)
- 스택: 40
- usage:
  - 의류/갑옷 내구도 수리 (SEWING_TAPE_REPAIR_VALUE = total_day_time×5 = 2400)
- 소스: tuning.lua (SEWING_TAPE_REPAIR_VALUE)

## reskin_tool — Clean Sweeper (청소 빗자루)
- usage:
  - 아이템 스킨 변경
- 소스: prefabs/reskin_tool.lua

## wagpunkbits_kit — Auto-Mat-O-Chanic (자동 수리-0)
- 스택: 10
- usage:
  - `[forge]` 와.비.스. 장비 전용 수리 키트 (내구도 100% 복구)
- 소스: prefabs/forge_repair_kits.lua (FORGEMATERIALS.WAGPUNKBITS)

---

## 물 도구

## wateringcan — Empty Watering Can (빈 물뿌리개)
- uses: 40 (물 채운 후)
- usage:
  - 농작물 물주기 (물량 25)
  - 불 끄기 + 온도 -5
- 소스: tuning.lua (WATERINGCAN_USES, WATERINGCAN_WATER_AMOUNT) + prefabs

## premiumwateringcan — Empty Waterfowl Can (빈 물부리개)
- uses: 160 (물 채운 후)
- usage:
  - 농작물 물주기 (물량 25)
  - 업그레이드 물뿌리개 (4배 내구도)
- 소스: tuning.lua (PREMIUMWATERINGCAN_USES, PREMIUMWATERINGCAN_WATER_AMOUNT)

---

## 조명탄

## miniflare — Flare (조명탄)
- usage:
  - 사용 시 15초간 광원 + 미니맵 표시 (반경 30)
- 소스: tuning.lua (MINIFLARE.TIME) + prefabs/miniflare.lua

## megaflare — Hostile Flare (도발 조명탄)
- usage:
  - 사용 시 광원 + 적대 몹 유인 (디어클롭스 60%, 해적 60%, 바다코끼리 60% 확률)
- 소스: tuning.lua (DEERCLOPS_MEGAFLARE_SPAWN_CHANCE 등) + prefabs/megaflare.lua

---

## 비팔로

## beef_bell — Beefalo Bell (비팔로 방울)
- usage:
  - 비팔로 길들이기/호출용
- 소스: prefabs/beef_bell.lua

## saddlehorn — Saddlehorn (안장뿔)
- damage: 17 (wilson_attack×0.5)
- uses: 10 (안장 해제 1/회, 공격 3/회 attackwear=3)
- usage:
  - 비팔로 안장 해제용
- 소스: tuning.lua (SADDLEHORN_DAMAGE, SADDLEHORN_USES) + prefabs/saddlehorn.lua

---

## 캐릭터 전용

## balloons_empty — Pile o' Balloons (풍선 더미)
- usage:
  - `[character]` 웨스 전용
  - 풍선 제작 재료
- 소스: prefabs

## gestalt_cage — Phasmo-Encapsulator (심령체 포획기)
- damage: 17 (wilson_attack×0.5)
- usage:
  - `[character]` 웬디 전용
  - 심령체(게스탈트) 포획
- 소스: tuning.lua (GESTALT_CAGE_DAMAGE) + prefabs/gestalt_cage.lua

## pocketwatch_dismantler — Clockmaker's Tools (시계공의 도구)
- usage:
  - `[character]` 완다 전용
  - 회중시계 분해
- 소스: prefabs/pocketwatch_dismantler.lua

## slingshotmodkit — Slingshot Field Kit (새총 개조 키트)
- usage:
  - `[character]` 월터 전용
  - 새총 모드 장착/교체
- 소스: prefabs/slingshotmodkit.lua

## spider_repellent — Shoo Box (가라 상자)
- uses: 10 (프리팹에서 SetUseAmount(10)으로 하드코딩, tuning의 SPIDER_REPELLENT_USES=20은 미사용)
- usage:
  - `[character]` 웨버 전용
  - 거미 퇴치 (반경 8, 거미 여왕은 무시)
- 소스: tuning.lua (SPIDER_REPELLENT_RADIUS=8) + prefabs/spider_repellent.lua (SetUseAmount 10)

## spider_whistle — Webby Whistle (거미 호각)
- uses: 40회 (2.5%/회 소모, SPIDER_WHISTLE_USE_AMOUNT=2.5)
- usage:
  - `[character]` 웨버 전용
  - 반경 16 내 거미굴에서 거미 소환 + 수면 중인 거미 기상
- 소스: tuning.lua (SPIDER_WHISTLE_RANGE=16, SPIDER_WHISTLE_DURATION=10, SPIDER_WHISTLE_USE_AMOUNT=2.5) + prefabs/spider_whistle.lua

## spiderden_bedazzler — Den Decorating Set (거미집 장식 세트)
- uses: 20 (BEDAZZLER_USE_AMOUNT=20)
- usage:
  - `[character]` 웨버 전용
  - 거미집 장식 처리 (장식된 거미집은 크리프 반경 감소: 9→4)
- 소스: tuning.lua (BEDAZZLER_USE_AMOUNT=20, SPIDERDEN_CREEP_RADIUS_BEDAZZLED=4) + prefabs/spiderden_bedazzler.lua

## wortox_nabbag — Knabsack (날치기 보따리)
- damage: 13.6~34 (wilson_attack×0.4 ~ wilson_attack)
- uses: 200 (벌레잡이: 20회)
- usage:
  - `[character]` 워톡스 전용
  - 소형 생물 포획 + 무기 겸용
  - 벌레잡이망으로도 사용 가능 (20회 제한)
- 소스: tuning.lua (NABBAG)

## winona_remote — Handy Remote (만능 리모컨)
- fuel_time: 480 (total_day_time)
- usage:
  - `[character]` 위노나 전용
  - 원격으로 위노나 기계 제어 (사거리 30)
- 소스: tuning.lua (WINONA_REMOTE) + prefabs

## wx78_scanner_item — Bio Scanalyzer (생체 스캔 분석기)
- uses: 무한 (소모 없음, 설치/회수 반복 가능)
- usage:
  - `[character]` WX-78 전용
  - 인벤토리 보유 시 반경 내 스캔 가능 크리처 자동 탐지 알림
  - 바닥에 설치 → 반경 7 내 크리처 스캔 (10초, 에픽 20초) → 해당 모듈 레시피 습득
  - WX-78이 반경 7 이내에 있어야 스캔 유지
- 소스: tuning.lua (WX78_SCANNER_RANGE=7, WX78_SCANNER_SCANDIST=4, WX78_SCANNER_MODULETARGETSCANTIME=10/20) + prefabs/wx78_scanner.lua

## wx78_moduleremover — Circuit Extractor (회로 추출기)
- uses: 무한 (소모 없음)
- usage:
  - `[character]` WX-78 전용
  - 장착된 모듈 1개 제거 (최상단부터)
  - 활성 모듈 제거 시 충전량 차감
- 소스: prefabs/wx78_modules.lua (upgrademoduleremover 컴포넌트)

---

## 기타 (다른 카테고리와 중복)

## antlionhat — Turf-Raiser Helm (땅엎기 투구)
- (armor.md 참조)

## fence_rotator — Fencing Sword (울타리칼)
- (weapons.md 참조)
