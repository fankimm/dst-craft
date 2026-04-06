# 갑옷 (Armor) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, armor_dur_mod=0.7, armor_abs_mod=1.0
> seg_time=30, day_time=480, total_day_time=480
>
> usage 태그: `[pvp]` = PvP 관련, `[set]` = 세트 보너스, `[character]` = 캐릭터 전용, `[skilltree]` = 스킬트리 연동, `[forge]` = 전용 수리 키트로 수리

---

## armorgrass — Grass Suit (풀 조끼)
- armor_hp: 157.5 (150×1.5×0.7)
- absorption: 0.6
- usage:
  - 연료로 사용 가능 (LARGE_FUEL)
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)
- 소스: tuning.lua (ARMORGRASS) + prefabs/armor_grass.lua

## armorwood — Log Suit (나무 갑옷)
- armor_hp: 315 (150×3×0.7)
- absorption: 0.8
- usage:
  - 연료로 사용 가능 (LARGE_FUEL)
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)
- 소스: tuning.lua (ARMORWOOD) + prefabs/armor_wood.lua

## armormarble — Marble Suit (대리석 갑옷)
- armor_hp: 735 (150×7×0.7)
- absorption: 0.95
- speed_mult: 0.7 (이동속도 30% 감소)
- 소스: tuning.lua (ARMORMARBLE) + prefabs/armor_marble.lua

## armor_bramble — Bramble Husk (가시덤불 거죽)
- armor_hp: 525 (150×5×0.7)
- absorption: 0.8
- usage:
  - 피격 시 가시 반격 ~22.7 피해 (wilson_attack/1.5)
  - `[character]` 웜우드 전용
  - 연료로 사용 가능 (LARGE_FUEL)
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)
- 소스: tuning.lua (ARMORBRAMBLE) + prefabs/armor_bramble.lua (ListenForEvent: blocked, attacked, onattackother)

## armordragonfly — Scalemail (비늘 갑옷)
- armor_hp: 945 (150×9×0.7)
- absorption: 0.7
- dapperness: 0.0278 (DAPPERNESS_MED = 100/(480×6) ≈ 0.0347)
- usage:
  - 화염 피해 완전 면역 (ARMORDRAGONFLY_FIRE_RESIST=1 → 100% 감소)
  - 피격 시 공격자 점화
- 소스: tuning.lua (ARMORDRAGONFLY) + prefabs/armor_dragonfly.lua (ListenForEvent: blocked, attacked)

## armor_sanity — Night Armor (밤의 갑옷)
- armor_hp: 525 (150×5×0.7)
- absorption: 0.95
- dapperness: -0.1042/초 (CRAZINESS_SMALL, 분당 -6.25, 하루 -50)
- usage:
  - 장착 시 정신력 지속 감소 (분당 -6.25)
  - 피격 시 피해의 10%가 정신력 감소 (ARMOR_SANITY_DMG_AS_SANITY=0.10)
  - 그림자 레벨 2
- 소스: tuning.lua (ARMOR_SANITY) + prefabs/armor_sanity.lua (shadowlevel)

## armordreadstone — Dreadstone Armor (공포석 갑옷)
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- planar_def: 5
- usage:
  - 정신력 낮을수록 내구도 자동 재생 (매초, 비율은 정신력 기반 보간)
  - 재생 중 정신력 감소 (CRAZINESS_MED, 분당 -12.5, 하루 -100)
  - 그림자 속성 저항 90%
  - 그림자 레벨 2
  - `[set]` 공포석 세트 보너스 (재생 1.5배)
- 소스: tuning.lua (ARMORDREADSTONE) + prefabs/armor_dreadstone.lua (shadowlevel, damagetyperesist, setbonus)

## armorruins — Thulecite Suit (툴레사이트 갑옷)
- armor_hp: 1260 (150×12×0.7)
- absorption: 0.9
- dapperness: 0.0347 (DAPPERNESS_MED)
- usage:
  - 그림자 레벨 2
- 소스: tuning.lua (ARMORRUINS) + prefabs/armor_ruins.lua (shadowlevel)

## armorwagpunk — W.A.S.P. Armor (와.비.스. 갑주)
- armor_hp: 730 (150×6×0.7 + 20×5 = 630+100)
- absorption: 0.85
- planar_def: 5
- usage:
  - 전기 면역 (insulated=true)
  - 타겟 추적 시 이동속도 단계적 증가 (10%→15%→20%→30%, 스테이지별 히트 수: 10/16/20)
  - wagpunkhat과 타겟 동기화
  - `[forge]` 자동 수리-0(wagpunkbits_kit)으로 수리 (내구도 100% 복구)
- 소스: tuning.lua (ARMORPUNK) + prefabs/armor_wagpunk.lua (targettracker, ListenForEvent: blocked, onattackother)

## armor_lunarplant — Brightshade Armor (빛말풀 갑옷)
- armor_hp: 830 (150×6×0.7 + 20×10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - 피격 시 차원 반사 10 (그림자 적 대상 20)
  - 달 속성 저항 90%
  - `[set]` 빛말풀 세트 보너스 (추가 달 저항)
  - `[forge]` 빛말풀 수리 도구(lunarplant_kit)로 수리 (내구도 100% 복구)
  - `[character]` 웜우드 장착 시 추가 가시 효과 (`[skilltree]` wormwood_allegiance_lunar_plant_gear_1)
- 소스: tuning.lua (ARMOR_LUNARPLANT) + prefabs/armor_lunarplant.lua (damagereflect, damagetyperesist, setbonus)

## armor_voidcloth — Voidcloth Armor (공허의 로브)
- armor_hp: 830 (150×6×0.7 + 20×10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - 그림자 속성 저항 90%
  - 그림자 레벨 3
  - `[set]` 공허천 세트 보너스 (추가 그림자 저항 + 차원 피해 축적: 타격마다 +4씩 최대 +24(6히트), 3초 미타격 시 전체 리셋)
  - `[forge]` 공허의 수리 도구(voidcloth_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (ARMOR_VOIDCLOTH) + prefabs/armor_voidcloth.lua (damagetyperesist, shadowlevel, setbonus, planardefense)

---

## footballhat — Football Helmet (풋볼 헬멧)
- armor_hp: 315 (150×3×0.7)
- absorption: 0.8
- waterproof: 0.2 (WATERPROOFNESS_SMALL)
- 소스: tuning.lua (ARMOR_FOOTBALLHAT) + prefabs/hats.lua

## woodcarvedhat — Carved Wooden Hat (안전나모)
- armor_hp: 262.5 (150×2.5×0.7)
- absorption: 0.7
- usage:
  - 연료로 사용 가능 (LARGE_FUEL)
  - 피격 저항 (resistance 컴포넌트)
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)
- 소스: tuning.lua (ARMOR_WOODCARVED_HAT) + prefabs/hats.lua

## beehat — Beekeeper Hat (양봉모자)
- armor_hp: 1050 (150×10×0.7)
- absorption: 0.8
- waterproof: 0.2 (WATERPROOFNESS_SMALL)
- insulation: 60 (INSULATION_SMALL = seg_time×2 = 60)
- dapperness: 0.0111 (DAPPERNESS_TINY = 100/(480×15) ≈ 0.0111)
- fuel_time: 2400 (EARMUFF_PERISHTIME = total_day_time×5)
- usage:
  - 벌 공격에만 방어 적용
- 소스: tuning.lua (ARMOR_BEEHAT) + prefabs/hats.lua

## cookiecutterhat — Cookie Cutter Cap (과자틀소라 모자)
- armor_hp: 525 (150×5×0.7)
- absorption: 0.7
- waterproof: 0.35 (WATERPROOFNESS_SMALLMED)
- 소스: tuning.lua (ARMOR_COOKIECUTTERHAT) + prefabs/hats.lua

## wathgrithrhat — Battle Helm (전투 투구)
- armor_hp: 525 (150×5×0.7)
- absorption: 0.8
- waterproof: 0.2 (WATERPROOFNESS_SMALL)
- usage:
  - `[character]` 위그프리드 전용
- 소스: tuning.lua (ARMOR_WATHGRITHRHAT) + prefabs/hats.lua

## wathgrithr_improvedhat — Improved Battle Helm (지휘관의 투구)
- armor_hp: 682.5 (150×6.5×0.7)
- absorption: 0.8
- waterproof: 0.35 (WATERPROOFNESS_SMALLMED)
- insulation: 60 (INSULATION_SMALL)
- usage:
  - `[character]` 위그프리드 전용
  - `[skilltree]` "튼튼한 투구 I/II" (wathgrithr_arsenal_helmet_1/2): 내구도 소모 10%/20% 감소
  - `[skilltree]` "지휘관의 투구 강화 I" (wathgrithr_arsenal_helmet_4): 차원 방어력 +8
  - `[skilltree]` "지휘관의 투구 강화 II" (wathgrithr_arsenal_helmet_5): 체력 최대 시 전투로 자동 수리
- 소스: tuning.lua (ARMOR_WATHGRITHR_IMPROVEDHAT) + prefabs/hats.lua

## ruinshat — Thulecite Crown (툴레사이트 왕관)
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- usage:
  - 33% 확률로 포스필드 발동 (지속 4초, 쿨다운 5초)
  - 포스필드 중 피격 시 피해의 5%가 정신력 감소
  - 그림자 레벨 2
- 소스: tuning.lua (ARMOR_RUINSHAT) + prefabs/hats.lua (shadowlevel)

## dreadstonehat — Dreadstone Helm (공포석 투구)
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- planar_def: 5
- waterproof: 0.2 (WATERPROOFNESS_SMALL)
- usage:
  - 정신력 낮을수록 내구도 자동 재생 (매초, armordreadstone과 동일 로직)
  - 재생 중 정신력 감소 (CRAZINESS_MED, 분당 -12.5, 하루 -100)
  - 그림자 속성 저항 90%
  - 그림자 레벨 2
  - `[set]` 공포석 세트 보너스
- 소스: tuning.lua (ARMOR_DREADSTONEHAT) + prefabs/hats.lua (shadowlevel, damagetyperesist, setbonus, planardefense)

## lunarplanthat — Brightshade Helm (빛말풀 투구)
- armor_hp: 830 (150×6×0.7 + 20×10 = 830)
- absorption: 0.8
- planar_def: 10
- waterproof: 0.35 (WATERPROOFNESS_SMALLMED)
- usage:
  - 달 속성 저항 90%
  - `[set]` 빛말풀 세트 보너스 (활성 시 차원 피해 축적: 타격마다 +4씩 최대 +24(6히트), 3초 미타격 시 전체 리셋)
  - `[forge]` 빛말풀 수리 도구(lunarplant_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (ARMOR_LUNARPLANT_HAT) + prefabs/hats.lua (damagetyperesist, setbonus)

## voidclothhat — Void Cowl (공허의 두건)
- armor_hp: 830 (150×6×0.7 + 20×10 = 830)
- absorption: 0.8
- planar_def: 10
- usage:
  - 그림자 속성 저항 90%
  - 그림자 레벨 3
  - `[set]` 공허천 세트 보너스
  - `[forge]` 공허의 수리 도구(voidcloth_kit)로 수리 (내구도 100% 복구)
- 소스: tuning.lua (ARMOR_VOIDCLOTH_HAT) + prefabs/hats.lua (damagetyperesist, shadowlevel, setbonus)

## wagpunkhat — W.A.S.P. Helm (와.비.스. 헤드기어)
- armor_hp: 730 (150×6×0.7 + 20×5 = 730)
- absorption: 0.85
- planar_def: 5
- usage:
  - 전기 면역 (insulated=true)
  - 타겟 추적 시 이동속도 단계적 증가 (5%→10%→15%→20%)
  - armorwagpunk과 타겟 동기화
  - `[forge]` 자동 수리-0(wagpunkbits_kit)으로 수리 (내구도 100% 복구)
- 소스: tuning.lua (ARMOR_WAGPUNK_HAT) + prefabs/hats.lua (targettracker)

## wathgrithr_shield — Wathgrithr Shield (원형 방패)
- armor_hp: 420 (150×4×0.7)
- absorption: 0.85
- damage: 51 (wilson_attack×1.5 = 34×1.5)
- usage:
  - `[character]` 위그프리드 전용
  - 패링 가능 (범위 178도, 지속 1초)
  - 패링 성공 시 쿨다운 70% 감소
  - 쿨다운 10초 (장착 시 2초)
  - 패링 시 갑옷 내구도 3 소모
  - `[skilltree]` 패링 보너스 데미지 강화 가능
- 소스: tuning.lua (WATHGRITHR_SHIELD) + prefabs/wathgrithr_shield.lua (weapon, armor, parryweapon, rechargeable, aoespell)
