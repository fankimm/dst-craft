# 무기 (Weapons) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, armor_dur_mod=0.7, armor_abs_mod=1.0
> seg_time=30, day_time=480, total_day_time=480, night_time=240
>
> usage 태그: `[pvp]` = PvP 관련, `[set]` = 세트 보너스, `[character]` = 캐릭터 전용, `[skilltree]` = 스킬트리 연동, `[forge]` = 전용 수리 키트로 수리, `[electric]` = 전기 피해(젖은 적 1.5배), `[ranged]` = 원거리, `[deployable]` = 설치형, `[consumable]` = 소모품

---

## spear — Spear (창)
- damage: 34 (wilson_attack)
- uses: 150
- 소스: tuning.lua (SPEAR_DAMAGE, SPEAR_USES)

## spear_wathgrithr — Battle Spear (전투 창)
- damage: 42.5 (wilson_attack×1.25)
- uses: 200
- usage:
  - `[character]` 위그프리드 전용
- 소스: tuning.lua (WATHGRITHR_SPEAR_DAMAGE, WATHGRITHR_SPEAR_USES)

## spear_wathgrithr_lightning — Elding Spear (뇌전창)
- damage: 59.5 (wilson_attack×1.75)
- uses: 150
- usage:
  - `[character]` 위그프리드 전용
  - `[electric]` 젖은 적 1.5배
  - 돌진 공격 (쿨다운 3초, 돌진 피해 68 = wilson_attack×2)
  - 억제된 정전기(restrained_static)로 업그레이드 → 충전된 뇌전창(spear_wathgrithr_lightning_charged)으로 변환
- 소스: tuning.lua (SPEAR_WATHGRITHR_LIGHTNING) + prefabs/spear_wathgrithr.lua (upgradeable, UPGRADETYPES.SPEAR_LIGHTNING)

## spear_wathgrithr_lightning_charged — Elding Spear (충전된 뇌전창)
- damage: 59.5 (wilson_attack×1.75)
- planar_damage: 20
- uses: 200
- speed_mult: 1.2 (이동속도 +20%)
- usage:
  - `[character]` 업그레이드한 위그프리드만 장착 가능 (restrictedtag)
  - `[electric]` 젖은 적 1.5배
  - 돌진 공격 (쿨다운 1.5초, 돌진 피해 68 = wilson_attack×2)
  - 돌진 히트 시 내구도 4 수리 (돌진당 최대 2회 = 최대 8 수리)
- 소스: tuning.lua (SPEAR_WATHGRITHR_LIGHTNING_CHARGED) + prefabs/spear_wathgrithr.lua (LightningSpearChargedFn)

## hambat — Ham Bat (햄 몽둥이)
- damage: 59.5 (wilson_attack×1.75, 신선도에 따라 50%까지 감소)
- uses: 100
- usage:
  - 시간 경과 시 피해 감소 (최소 50% = 29.75)
- 소스: tuning.lua (HAMBAT_DAMAGE, HAMBAT_MIN_DAMAGE_MODIFIER)

## batbat — Bat Bat (박쥐 방망이)
- damage: 42.5 (wilson_attack×1.25)
- uses: 75
- usage:
  - 타격 시 체력 +6.8 회복, 정신력 -3.4 감소 (BATBAT_DRAIN = wilson_attack×0.2 = 6.8)
  - 그림자 레벨 2
- 소스: tuning.lua (BATBAT_DAMAGE, BATBAT_DRAIN, BATBAT_USES)

## nightsword — Dark Sword (어둠의 검)
- damage: 68 (wilson_attack×2)
- uses: 100
- dapperness: -0.2083/초 (CRAZINESS_MED, 분당 -12.5, 하루 -100)
- usage:
  - 장착 시 정신력 지속 감소 (분당 -12.5)
  - 그림자 레벨 2
- 소스: tuning.lua (NIGHTSWORD_DAMAGE, NIGHTSWORD_USES) + prefabs/nightsword.lua (dapperness=CRAZINESS_MED, shadowlevel)

## glasscutter — Glass Cutter (유리 절단기)
- damage: 68 (wilson_attack×2)
- uses: 75
- usage:
  - 그림자 적 피해 ×1.25 (68→85, damagetypebonus "shadowsubmissive" 태그 대상)
  - 그림자 적 타격 시 내구도 소모 절반 (attackwear=0.5, 대상 태그: shadow/shadowminion/shadowchesspiece/stalker/stalkerminion/shadowthrall)
- 소스: tuning.lua (GLASSCUTTER)

## ruins_bat — Thulecite Club (툴레사이트 몽둥이)
- damage: 59.5 (wilson_attack×1.75)
- uses: 200
- speed_mult: 1.1 (이동속도 +10%)
- usage:
  - 그림자 레벨 2
- 소스: tuning.lua (RUINS_BAT_DAMAGE, RUINS_BAT_USES, RUINS_BAT_SPEED_MULT)

## sword_lunarplant — Brightshade Sword (빛말풀 칼)
- damage: 38 (wilson_attack×2 - 30)
- planar_damage: 30
- uses: 200
- usage:
  - `[forge]` 빛말풀 수리 도구(lunarplant_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (SWORD_LUNARPLANT)

## shadow_battleaxe — Shadow Maul (그림자 분쇄도끼)
- damage: 38 (wilson_attack×2 - 30)
- uses: 200
- usage:
  - 킬 시 허기 +50 획득 (MAX_HUNGER=500의 10%)
  - 벌목 가능 (도끼 겸용)
  - 그림자 레벨 3
  - 킬 수에 따라 4단계 레벨업 (0/3/6/9킬):
    - Lv1: 차원 피해 10, 벌목 효율 1.5배
    - Lv2: 차원 피해 14, 벌목 1.75배, 흡혈 1.7/타격
    - Lv3: 차원 피해 18, 벌목 2.0배, 흡혈 2.55/타격
    - Lv4: 차원 피해 22, 벌목 2.25배, 흡혈 3.4/타격
  - 레벨 유지에 허기 소모 (Lv2: 0.05/초, Lv3: 0.1/초, Lv4: 0.2/초)
  - 흡혈 시 정신력 감소 (흡혈량×0.5)
- 소스: tuning.lua (SHADOW_BATTLEAXE)

## voidcloth_boomerang — Gloomerang (까매랑)
- damage: 5~27.2 (거리 비례, min 5 → max wilson_attack×0.8)
- planar_damage: 5~27.2 (동일 스케일링)
- uses: 85
- speed_mult: 1.1
- usage:
  - `[ranged]` 공격 사거리 10 (최대 히트 14), 날아가면서 크기·피해 증가
  - 달 진영 추가 피해 25% 증가 (34)
  - 그림자 레벨 3
- 소스: tuning.lua (VOIDCLOTH_BOOMERANG)

## staff_lunarplant — Brightshade Staff (빛말풀 지팡이)
- planar_damage: 10
- uses: 50
- usage:
  - `[ranged]` 투사체가 적 5회 바운스
  - 그림자 적 추가 피해 ×2
  - `[set]` 빛말풀 세트 보너스 시 바운스 7회
  - `[forge]` 빛말풀 수리 도구(lunarplant_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (STAFF_LUNARPLANT)

## trident — Strident Trident (시끄러운 삼지창)
- damage: 51 (wilson_attack×1.5)
- uses: 200
- usage:
  - 대상이 해상에 있으면 피해 50% 증가 (76.5)
  - 특수 기술: 범위 피해 85 (wilson_attack×2.5), 반경 2.75, 간헐천 10개 소환 (50회 사용)
- 소스: tuning.lua (TRIDENT)

## whip — Tail o' Three Cats (세 고양이 꼬리)
- damage: 27.2 (wilson_attack×0.8)
- uses: 175
- usage:
  - 사거리 +2 (근접보다 김)
  - 슈퍼크랙: 일반 몹 25%, 몬스터 20%, 보스 5% 확률로 경직
  - 슈퍼크랙 사거리 14
- 소스: tuning.lua (WHIP_DAMAGE, WHIP_USES, WHIP_RANGE, WHIP_SUPERCRACK)

## fence_rotator — Fencing Sword (울타리칼)
- damage: 34 (wilson_attack)
- uses: 200
- usage:
  - 울타리 회전/이동 가능
- 소스: tuning.lua (FENCE_ROTATOR_DAMAGE, FENCE_ROTATOR_USES)

## nightstick — Morning Star (모닝 스타)
- damage: 28.9 (wilson_attack×0.85)
- usage:
  - `[electric]` 전기 피해 (젖은 적 1.5배 → 실질 43.4)
  - 연료 기반 내구도 (NIGHTSTICK_FUEL = night_time×6 = 1440초)
  - 광원 기능
- 소스: tuning.lua (NIGHTSTICK_DAMAGE, NIGHTSTICK_FUEL)

## pocketwatch_weapon — Alarming Clock (타종 시계)
- damage: 81.6 (wilson_attack×2.4) / 소진 시 27.2 (wilson_attack×0.8)
- usage:
  - `[character]` 완다 전용
  - 시간 연료 기반 내구도
  - 연료 소진 시 피해 대폭 감소
- 소스: tuning.lua (POCKETWATCH_SHADOW_DAMAGE, POCKETWATCH_DEPLETED_DAMAGE)

## boomerang — Boomerang (부메랑)
- damage: 27.2 (wilson_attack×0.8)
- uses: 10
- usage:
  - `[ranged]` 사거리 12
  - 되돌아올 때 받기 실패 시 자해
- 소스: tuning.lua (BOOMERANG_DAMAGE, BOOMERANG_USES, BOOMERANG_DISTANCE)

## slingshot — Trusty Slingshot (믿음직한 새총)
- usage:
  - `[character]` 월터 전용
  - `[ranged]` 공격 사거리 10 (최대 히트 14)
  - 탄약에 따라 피해 변동:
    - 돌: 17, 금: 34, 대리석: 51, 달유리: 51(+범위 34)
    - 화약: 59.5, 장신구: 59.5, 툴레사이트: 51
    - 공포석: 58(+차원 10), 공포연료: 17(+차원 20), 빛말풀: 38(+차원 30), 순수광채: 34(+차원 20)
    - 벌침: 25.5(+범위 17), 고철깃: 39.1
  - `[skilltree]` 차지 시 피해 ×2, 속도 ×1.25, 사거리 증가, 탄약 30% 확률 미소모
- 소스: tuning.lua (SLINGSHOT_AMMO_DAMAGE_*)

---

## blowdart_pipe — Blow Dart (다트)
- 스택: 20
- damage: 100
- uses: 1
- usage:
  - `[ranged]` `[consumable]` 1회용
- 소스: tuning.lua (PIPE_DART_DAMAGE)

## blowdart_fire — Fire Dart (화염 다트)
- 스택: 20
- damage: 100
- uses: 1
- usage:
  - `[ranged]` `[consumable]` 1회용
  - 대상에 불 붙이기
- 소스: tuning.lua (PIPE_DART_DAMAGE)

## blowdart_sleep — Sleep Dart (수면 다트)
- 스택: 20
- uses: 1
- usage:
  - `[ranged]` `[consumable]` 1회용
  - 대상을 잠재움
- 소스: tuning.lua

## blowdart_yellow — Electric Dart (전기 다트)
- 스택: 20
- damage: 60
- uses: 1
- usage:
  - `[ranged]` `[consumable]` 1회용
  - `[electric]` 전기 피해 (젖은 적 1.5배)
- 소스: tuning.lua (YELLOW_DART_DAMAGE)

## houndstooth_blowpipe — Howlitzer (견사포)
- damage: 34 (wilson_attack)
- planar_damage: 34 (wilson_attack)
- usage:
  - `[ranged]` 공격 사거리 12 (최대 히트 16)
  - 그림자 적 추가 피해 ×1.1
- 소스: tuning.lua (HOUNDSTOOTH_BLOWPIPE)

---

## firestaff — Fire Staff (불꽃 지팡이)
- uses: 20
- usage:
  - `[ranged]` 대상에 불 붙이기
- 소스: tuning.lua (FIRESTAFF_USES)

## icestaff — Ice Staff (얼음 지팡이)
- uses: 20
- usage:
  - `[ranged]` 대상 빙결
- 소스: tuning.lua (ICESTAFF_USES)

## staff_tornado — Weather Pain (기상의 상처)
- uses: 15
- usage:
  - `[ranged]` 토네이도 소환 (이동하며 범위 피해)
- 소스: tuning.lua

## panflute — Pan Flute (팬플룻)
- uses: 10
- usage:
  - 주변 생물 수면 (반경 15, 20초간)
- 소스: tuning.lua (PANFLUTE_SLEEPRANGE, PANFLUTE_SLEEPTIME, PANFLUTE_USES)

---

## gunpowder — Gunpowder (화약)
- 스택: 40
- damage: 200
- usage:
  - `[deployable]` `[consumable]` 설치 후 점화 시 범위 폭발 (반경 3)
- 소스: tuning.lua (GUNPOWDER_DAMAGE, GUNPOWDER_RANGE)

## bomb_lunarplant — Brightshade Bomb (빛말풀 폭탄)
- 스택: 20
- planar_damage: 200
- usage:
  - `[ranged]` `[consumable]` 투척 시 범위 차원 폭발 (반경 3)
  - 6개 묶음 제작
- 소스: tuning.lua (BOMB_LUNARPLANT_PLANAR_DAMAGE, BOMB_LUNARPLANT_RANGE)

## beemine — Bee Mine (벌 지뢰)
- usage:
  - `[deployable]` `[consumable]` 설치 시 적 접근하면 벌 4마리 소환 (반경 3)
- 소스: tuning.lua (BEEMINE_BEES, BEEMINE_RADIUS)

## sleepbomb — Napsack (잠주머니)
- 스택: 20
- usage:
  - `[ranged]` `[consumable]` 투척 시 주변 생물 수면 (20초)
- 소스: tuning.lua (SLEEPBOMB_DURATION)

## waterballoon — Waterballoon (물풍선)
- 스택: 20
- usage:
  - `[ranged]` `[consumable]` 투척 시 불 끄기 + 젖음 +20
  - 온도 -5 감소
- 소스: tuning.lua (WATERBALLOON)

## trap_teeth — Tooth Trap (이빨 덫)
- damage: 60
- uses: 10
- usage:
  - `[deployable]` 설치형 함정 (반경 1.5)
- 소스: tuning.lua (TRAP_TEETH_DAMAGE, TRAP_TEETH_USES, TRAP_TEETH_RADIUS)

## trap_bramble — Bramble Trap (가시덤불 덫)
- damage: 40
- uses: 10
- usage:
  - `[deployable]` 설치형 함정 (반경 2.5)
  - `[character]` 웜우드 전용
- 소스: tuning.lua (TRAP_BRAMBLE_DAMAGE, TRAP_BRAMBLE_USES, TRAP_BRAMBLE_RADIUS)

---

## boat_cannon_kit — Cannon Kit (대포 키트)
- usage:
  - 배에 설치하는 대포 (cannonball_rock_item 사용)
- 소스: prefabs

## cannonball_rock_item — Cannonball (포탄)
- 스택: 20
- damage: 200
- usage:
  - `[ranged]` 대포 탄약
  - 스플래시 피해 120 (200×0.6), 스플래시 반경 3
- 소스: tuning.lua (CANNONBALL_DAMAGE, CANNONBALL_SPLASH_DAMAGE_PERCENT, CANNONBALL_SPLASH_RADIUS)

## winona_catapult — Winona's Catapult (위노나의 투석기)
- damage: 42.5 (wilson_attack×1.25)
- usage:
  - `[character]` 위노나 전용 구조물
  - `[deployable]` 자동 공격 (공격 주기 2.5초)
  - 범위 피해 (반경 1.25)
  - 전력 소모
- 소스: tuning.lua (WINONA_CATAPULT_DAMAGE, WINONA_CATAPULT_ATTACK_PERIOD, WINONA_CATAPULT_AOE_RADIUS)

## winona_catapult_item — Winona's Catapult Kit
- usage:
  - winona_catapult 설치 키트
- 소스: (winona_catapult의 설치용 아이템)

## wortox_nabbag — Knabsack (날치기 보따리)
- damage: 13.6~34 (wilson_attack×0.4 ~ wilson_attack)
- uses: 200 (벌레잡이 용도: 20회)
- usage:
  - `[character]` 워톡스 전용
  - 소형 생물 포획 + 무기 겸용
  - 벌레잡이망으로도 사용 가능 (20회 제한)
- 소스: tuning.lua (NABBAG_DAMAGE_MIN, NABBAG_DAMAGE_MAX, NABBAG_USES)

## wathgrithr_shield — Battle Rönd (원형 방패)
- armor_hp: 420 (150×4×0.7)
- absorption: 0.85
- damage: 51 (wilson_attack×1.5)
- usage:
  - `[character]` 위그프리드 전용
  - 패링 가능 (범위 178도, 지속 1초)
  - 패링 성공 시 쿨다운 70% 감소
  - 쿨다운 10초 (장착 시 2초)
  - 패링 시 갑옷 내구도 3 소모
  - `[skilltree]` 패링 보너스 데미지 강화 (15~30, 지속 5초, 스케일 0.5)
  - `[skilltree]` 패링 지속시간 ×2.5
- 소스: tuning.lua (WATHGRITHR_SHIELD) + prefabs/wathgrithr_shield.lua
