# 무기 (Weapons) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, armor_dur_mod=0.7, armor_abs_mod=1.0
> seg_time=30, day_time=480, total_day_time=480, night_time=240
>
> usage 태그: `[pvp]` = PvP 관련, `[세트]` = 세트 보너스, `[캐릭터]` = 캐릭터 전용, `[스킬트리]` = 스킬트리 연동, `[수리]` = 전용 수리 키트로 수리, `[전기]` = 전기 피해(젖은 적 1.5배), `[원거리]` = 원거리, `[설치형]` = 설치형, `[소모품]` = 소모품

---

## spear — Spear (창)
- damage: 34
- uses: 150
- 소스: tuning.lua

## spear_wathgrithr — Battle Spear (전투 창)
- damage: 42.5
- uses: 200
- usage:
  - `[캐릭터]` 위그프리드 전용
- 소스: tuning.lua

## spear_wathgrithr_lightning — Elding Spear (뇌전창)
- damage: 59.5
- uses: 150
- usage:
  - `[캐릭터]` 위그프리드 전용
  - `[전기]` 젖은 적 1.5배
  - 돌진 공격 (쿨다운 3초, 돌진 피해 68)
  - 억제된 정전기로 업그레이드 → 충전된 뇌전창으로 변환
- 소스: tuning.lua, spear_wathgrithr.lua

## spear_wathgrithr_lightning_charged — Elding Spear (충전된 뇌전창)
- damage: 59.5
- planar_damage: 20
- uses: 200
- speed_mult: 1.2 (이동속도 +20%)
- usage:
  - `[캐릭터]` 업그레이드한 위그프리드만 장착 가능
  - `[전기]` 젖은 적 1.5배
  - 돌진 공격 (쿨다운 1.5초, 돌진 피해 68)
  - 돌진 히트 시 내구도 4 수리 (돌진당 최대 2회 = 최대 8 수리)
- 소스: tuning.lua, spear_wathgrithr.lua

## hambat — Ham Bat (햄 몽둥이)
- damage: 59.5 (신선도에 따라 50%까지 감소)
- uses: 100
- usage:
  - 시간 경과 시 피해 감소 (최소 50% = 29.75)
- 소스: tuning.lua

## batbat — Bat Bat (박쥐 방망이)
- damage: 42.5
- uses: 75
- usage:
  - 타격 시 체력 +6.8 회복, 정신력 -3.4 감소
  - 그림자 레벨 2
- 소스: tuning.lua

## nightsword — Dark Sword (어둠의 검)
- damage: 68
- uses: 100
- dapperness: -0.2083/초 (분당 -12.5, 하루 -100)
- usage:
  - 장착 시 정신력 지속 감소 (분당 -12.5)
  - 그림자 레벨 2
- 소스: tuning.lua, nightsword.lua

## glasscutter — Glass Cutter (유리 절단기)
- damage: 68
- uses: 75
- usage:
  - 그림자 적 피해 ×1.25 (68→85)
  - 그림자 적 타격 시 내구도 소모 절반
- 소스: tuning.lua

## ruins_bat — Thulecite Club (툴레사이트 몽둥이)
- damage: 59.5
- uses: 200
- speed_mult: 1.1 (이동속도 +10%)
- usage:
  - 그림자 레벨 2
- 소스: tuning.lua

## sword_lunarplant — Brightshade Sword (빛말풀 칼)
- damage: 38
- planar_damage: 30
- uses: 200
- usage:
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)
- 소스: tuning.lua

## shadow_battleaxe — Shadow Maul (그림자 분쇄도끼)
- damage: 38
- uses: 200
- usage:
  - 킬 시 허기 +50 획득
  - 벌목 가능 (도끼 겸용)
  - 그림자 레벨 3
  - 킬 수에 따라 4단계 레벨업 (0/3/6/9킬):
    - Lv1: 차원 피해 10, 벌목 효율 1.5배
    - Lv2: 차원 피해 14, 벌목 1.75배, 흡혈 1.7/타격
    - Lv3: 차원 피해 18, 벌목 2.0배, 흡혈 2.55/타격
    - Lv4: 차원 피해 22, 벌목 2.25배, 흡혈 3.4/타격
  - 레벨 유지에 허기 소모 (Lv2: 0.05/초, Lv3: 0.1/초, Lv4: 0.2/초)
  - 흡혈 시 정신력 감소 (흡혈량×0.5)
- 소스: tuning.lua

## voidcloth_boomerang — Gloomerang (까매랑)
- damage: 5~27.2 (거리 비례)
- planar_damage: 5~27.2 (동일 스케일링)
- uses: 85
- speed_mult: 1.1
- usage:
  - `[원거리]` 공격 사거리 10 (최대 히트 14), 날아가면서 크기·피해 증가
  - 달 진영 추가 피해 25% 증가 (34)
  - 그림자 레벨 3
- 소스: tuning.lua

## staff_lunarplant — Brightshade Staff (빛말풀 지팡이)
- planar_damage: 10
- uses: 50
- usage:
  - `[원거리]` 투사체가 적 5회 바운스
  - 그림자 적 추가 피해 ×2
  - `[세트]` 빛말풀 세트 보너스 시 바운스 7회
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)
- 소스: tuning.lua

## trident — Strident Trident (시끄러운 삼지창)
- damage: 51
- uses: 200
- usage:
  - 대상이 해상에 있으면 피해 50% 증가 (76.5)
  - 특수 기술: 범위 피해 85, 반경 2.75, 간헐천 10개 소환 (50회 사용)
- 소스: tuning.lua

## whip — Tail o' Three Cats (세 고양이 꼬리)
- damage: 27.2
- uses: 175
- usage:
  - 사거리 +2 (근접보다 김)
  - 슈퍼크랙: 일반 몹 25%, 몬스터 20%, 보스 5% 확률로 경직
  - 슈퍼크랙 사거리 14
- 소스: tuning.lua

## fence_rotator — Fencing Sword (울타리칼)
- damage: 34
- uses: 200
- usage:
  - 울타리 회전/이동 가능
- 소스: tuning.lua

## nightstick — Morning Star (모닝 스타)
- damage: 28.9
- usage:
  - `[전기]` 전기 피해 (젖은 적 1.5배 → 실질 43.4)
  - 연료 기반 내구도 (1440초)
  - 광원 기능
- 소스: tuning.lua

## pocketwatch_weapon — Alarming Clock (타종 시계)
- damage: 81.6 / 소진 시 27.2
- usage:
  - `[캐릭터]` 완다 전용
  - 시간 연료 기반 내구도
  - 연료 소진 시 피해 대폭 감소
- 소스: tuning.lua

## boomerang — Boomerang (부메랑)
- damage: 27.2
- uses: 10
- usage:
  - `[원거리]` 사거리 12
  - 되돌아올 때 받기 실패 시 자해
- 소스: tuning.lua

## slingshot — Trusty Slingshot (믿음직한 새총)
- usage:
  - `[캐릭터]` 월터 전용
  - `[원거리]` 공격 사거리 10 (최대 히트 14)
  - 탄약에 따라 피해 변동:
    - 돌: 17, 금: 34, 대리석: 51, 달유리: 51(+범위 34)
    - 화약: 59.5, 장신구: 59.5, 툴레사이트: 51
    - 공포석: 58(+차원 10), 순수한 공포: 17(+차원 20), 빛말풀: 38(+차원 30), 순수광채: 34(+차원 20)
    - 벌침: 25.5(+범위 17), 고철깃: 39.1
  - `[스킬트리]` 차지 시 피해 ×2, 속도 ×1.25, 사거리 증가, 탄약 30% 확률 미소모
- 소스: tuning.lua

---

## blowdart_pipe — Blow Dart (다트)
- 스택: 20
- damage: 100
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
- 소스: tuning.lua

## blowdart_fire — Fire Dart (화염 다트)
- 스택: 20
- damage: 100
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
  - 대상에 불 붙이기
- 소스: tuning.lua

## blowdart_sleep — Sleep Dart (수면 다트)
- 스택: 20
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
  - 대상을 잠재움
- 소스: tuning.lua

## blowdart_yellow — Electric Dart (전기 다트)
- 스택: 20
- damage: 60
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
  - `[전기]` 전기 피해 (젖은 적 1.5배)
- 소스: tuning.lua

## houndstooth_blowpipe — Howlitzer (견사포)
- damage: 34
- planar_damage: 34
- usage:
  - `[원거리]` 공격 사거리 12 (최대 히트 16)
  - 그림자 적 추가 피해 ×1.1
- 소스: tuning.lua

---

## firestaff — Fire Staff (불꽃 지팡이)
- uses: 20
- usage:
  - `[원거리]` 대상에 불 붙이기
- 소스: tuning.lua

## icestaff — Ice Staff (얼음 지팡이)
- uses: 20
- usage:
  - `[원거리]` 대상 빙결
- 소스: tuning.lua

## staff_tornado — Weather Pain (기상의 상처)
- uses: 15
- usage:
  - `[원거리]` 토네이도 소환 (이동하며 범위 피해)
- 소스: tuning.lua

## panflute — Pan Flute (팬플룻)
- uses: 10
- usage:
  - 주변 생물 수면 (반경 15, 20초간)
- 소스: tuning.lua

---

## gunpowder — Gunpowder (화약)
- 스택: 40
- damage: 200
- usage:
  - `[설치형]` `[소모품]` 설치 후 점화 시 범위 폭발 (반경 3)
- 소스: tuning.lua

## bomb_lunarplant — Brightshade Bomb (빛말풀 폭탄)
- 스택: 20
- planar_damage: 200
- usage:
  - `[원거리]` `[소모품]` 투척 시 범위 차원 폭발 (반경 3)
  - 6개 묶음 제작
- 소스: tuning.lua

## beemine — Bee Mine (벌 지뢰)
- usage:
  - `[설치형]` `[소모품]` 설치 시 적 접근하면 벌 4마리 소환 (반경 3)
- 소스: tuning.lua

## sleepbomb — Napsack (잠주머니)
- 스택: 20
- usage:
  - `[원거리]` `[소모품]` 투척 시 주변 생물 수면 (20초)
- 소스: tuning.lua

## waterballoon — Waterballoon (물풍선)
- 스택: 20
- usage:
  - `[원거리]` `[소모품]` 투척 시 불 끄기 + 젖음 +20
  - 온도 -5 감소
- 소스: tuning.lua

## trap_teeth — Tooth Trap (이빨 덫)
- damage: 60
- uses: 10
- usage:
  - `[설치형]` 설치형 함정 (반경 1.5)
- 소스: tuning.lua

## trap_bramble — Bramble Trap (가시덤불 덫)
- damage: 40
- uses: 10
- usage:
  - `[설치형]` 설치형 함정 (반경 2.5)
  - `[캐릭터]` 웜우드 전용
- 소스: tuning.lua

---

## boat_cannon_kit — Cannon Kit (대포 키트)
- usage:
  - 배에 설치하는 대포 (포탄 사용)
- 소스: prefabs

## cannonball_rock_item — Cannonball (포탄)
- 스택: 20
- damage: 200
- usage:
  - `[원거리]` 대포 탄약
  - 스플래시 피해 120, 스플래시 반경 3
- 소스: tuning.lua

## winona_catapult — Winona's Catapult (위노나의 투석기)
- damage: 42.5
- usage:
  - `[캐릭터]` 위노나 전용 구조물
  - `[설치형]` 자동 공격 (공격 주기 2.5초)
  - 범위 피해 (반경 1.25)
  - 전력 소모
- 소스: tuning.lua

## winona_catapult_item — Winona's Catapult Kit
- usage:
  - 위노나의 투석기 설치 키트
- 소스: prefabs

## wortox_nabbag — Knabsack (날치기 보따리)
- damage: 13.6~34
- uses: 200 (벌레잡이 용도: 20회)
- usage:
  - `[캐릭터]` 워톡스 전용
  - 소형 생물 포획 + 무기 겸용
  - 벌레잡이망으로도 사용 가능 (20회 제한)
- 소스: tuning.lua

## wathgrithr_shield — Battle Rönd (원형 방패)
- armor_hp: 420 (150×4×0.7)
- absorption: 0.85
- damage: 51 (34×1.5)
- usage:
  - `[캐릭터]` 위그프리드 전용
  - 패링 가능 (범위 178도, 지속 1초)
  - 패링 성공 시 쿨다운 70% 감소
  - 쿨다운 10초 (장착 시 2초)
  - 패링 시 갑옷 내구도 3 소모
  - `[스킬트리]` 패링 보너스 데미지 강화 (15~30, 지속 5초, 스케일 0.5)
  - `[스킬트리]` 패링 지속시간 ×2.5
- 소스: tuning.lua, wathgrithr_shield.lua
