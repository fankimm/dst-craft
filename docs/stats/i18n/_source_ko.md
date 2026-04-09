# 번역 소스 (한국어) — 아이템 설명문

## blueprint_craftingset_ruins_builder
- 타입: 제작물
- usage:
  - 제작 시 바닥 청사진 3개 지급

## blueprint_craftingset_ruinsglow_builder
- 타입: 제작물
- usage:
  - 동일 패턴
  - 발광 바닥

## eyeturret_item
- 타입: 구조물
- usage:
  - HP 1000
  - 재생 12/초
  - 공격 65
  - 사거리 15
  - 공격 주기 3초
  - 해머 불가

## shadow_forge_kit
- 타입: 설치키트
- usage:
  - 설치 → 암영술 재단사 (암영 제작 Lv2)
  - 해머 4회

## thulecite
- 타입: 소재
- 스택: 20
- usage:
  - 툴레사이트 수리 재료 (HP 100 회복, 작업량 1.5 회복)
  - 원소 식단 (허기 +3) — 단 플레이어는 먹을 수 없음 (NPC 전용: 먼지나방/두더지/달팽이거북)
  - 두더지 미끼

## wall_ruins_item
- 타입: 벽
- usage:
  - HP 800 (배치 시 50%)
  - 해머 3회
  - 툴레사이트 수리 가능

## armorgrass
- armor_hp: 157.5 (150×1.5×0.7)
- absorption: 0.6
- usage:
  - 연료로 사용 가능
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)

## armorwood
- armor_hp: 315 (150×3×0.7)
- absorption: 0.8
- usage:
  - 연료로 사용 가능
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)

## armormarble
- armor_hp: 735 (150×7×0.7)
- absorption: 0.95
- speed_mult: 0.7 (이동속도 30% 감소)

## armor_bramble
- armor_hp: 525 (150×5×0.7)
- absorption: 0.8
- usage:
  - 피격 시 가시 반격 ~22.7 피해
  - `[캐릭터]` 웜우드 전용
  - 연료로 사용 가능
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)

## armordragonfly
- armor_hp: 945 (150×9×0.7)
- absorption: 0.7
- dapperness: 0.0278
- usage:
  - 화염 피해 완전 면역 (100% 감소)
  - 피격 시 공격자 점화

## armor_sanity
- armor_hp: 525 (150×5×0.7)
- absorption: 0.95
- dapperness: -0.1042/초 (분당 -6.25, 하루 -50)
- usage:
  - 장착 시 정신력 지속 감소 (분당 -6.25)
  - 피격 시 피해의 10%가 정신력 감소
  - 그림자 레벨 2

## armordreadstone
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- planar_def: 5
- usage:
  - 정신력 낮을수록 내구도 자동 재생 (매초, 비율은 정신력 기반 보간)
  - 재생 중 정신력 감소 (분당 -12.5, 하루 -100)
  - 그림자 속성 저항 90%
  - 그림자 레벨 2
  - `[세트]` 공포석 세트 보너스 (재생 1.5배)

## armorruins
- armor_hp: 1260 (150×12×0.7)
- absorption: 0.9
- dapperness: 0.0347
- usage:
  - 그림자 레벨 2

## armorwagpunk
- armor_hp: 730 (150×6×0.7 + 20×5 = 630+100)
- absorption: 0.85
- planar_def: 5
- usage:
  - 전기 면역
  - 타겟 추적 시 이동속도 단계적 증가 (10%→15%→20%→30%, 스테이지별 히트 수: 10/16/20)
  - 와.비.스. 헤드기어와 타겟 동기화
  - `[수리]` 자동 수리-0(와그펑크 수리 키트)으로 수리 (내구도 100% 복구)

## armor_lunarplant
- armor_hp: 830 (150×6×0.7 + 20×10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - 피격 시 차원 반사 10 (그림자 적 대상 20)
  - 달 속성 저항 90%
  - `[세트]` 빛말풀 세트 보너스 (추가 달 저항)
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)
  - `[캐릭터]` 웜우드 장착 시 추가 가시 효과 (`[스킬트리]` 연동)

## armor_voidcloth
- armor_hp: 830 (150×6×0.7 + 20×10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - 그림자 속성 저항 90%
  - 그림자 레벨 3
  - `[세트]` 공허천 세트 보너스 (추가 그림자 저항 + 차원 피해 축적: 타격마다 +4씩 최대 +24(6히트), 3초 미타격 시 전체 리셋)
  - `[수리]` 공허천 수리 키트로 수리 (내구도 100% 복구)

## footballhat
- armor_hp: 315 (150×3×0.7)
- absorption: 0.8
- waterproof: 0.2

## woodcarvedhat
- armor_hp: 262.5 (150×2.5×0.7)
- absorption: 0.7
- usage:
  - 연료로 사용 가능
  - 피격 저항
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)

## beehat
- armor_hp: 1050 (150×10×0.7)
- absorption: 0.8
- waterproof: 0.2
- insulation: 60
- dapperness: 0.0111
- fuel_time: 2400 (5일)
- usage:
  - 벌 공격에만 방어 적용

## cookiecutterhat
- armor_hp: 525 (150×5×0.7)
- absorption: 0.7
- waterproof: 0.35

## wathgrithrhat
- armor_hp: 525 (150×5×0.7)
- absorption: 0.8
- waterproof: 0.2
- usage:
  - `[캐릭터]` 위그프리드 전용

## wathgrithr_improvedhat
- armor_hp: 682.5 (150×6.5×0.7)
- absorption: 0.8
- waterproof: 0.35
- insulation: 60
- usage:
  - `[캐릭터]` 위그프리드 전용
  - `[스킬트리]` "튼튼한 투구 I/II": 내구도 소모 10%/20% 감소
  - `[스킬트리]` "지휘관의 투구 강화 I": 차원 방어력 +8
  - `[스킬트리]` "지휘관의 투구 강화 II": 체력 최대 시 전투로 자동 수리

## ruinshat
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- usage:
  - 33% 확률로 포스필드 발동 (지속 4초, 쿨다운 5초)
  - 포스필드 중 피격 시 피해의 5%가 정신력 감소
  - 그림자 레벨 2

## dreadstonehat
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- planar_def: 5
- waterproof: 0.2
- usage:
  - 정신력 낮을수록 내구도 자동 재생 (매초, 공포석 갑옷과 동일 로직)
  - 재생 중 정신력 감소 (분당 -12.5, 하루 -100)
  - 그림자 속성 저항 90%
  - 그림자 레벨 2
  - `[세트]` 공포석 세트 보너스

## lunarplanthat
- armor_hp: 830 (150×6×0.7 + 20×10 = 830)
- absorption: 0.8
- planar_def: 10
- waterproof: 0.35
- usage:
  - 달 속성 저항 90%
  - `[세트]` 빛말풀 세트 보너스 (활성 시 차원 피해 축적: 타격마다 +4씩 최대 +24(6히트), 3초 미타격 시 전체 리셋)
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)

## voidclothhat
- armor_hp: 830 (150×6×0.7 + 20×10 = 830)
- absorption: 0.8
- planar_def: 10
- usage:
  - 그림자 속성 저항 90%
  - 그림자 레벨 3
  - `[세트]` 공허천 세트 보너스
  - `[수리]` 공허천 수리 키트로 수리 (내구도 100% 복구)

## wagpunkhat
- armor_hp: 730 (150×6×0.7 + 20×5 = 730)
- absorption: 0.85
- planar_def: 5
- usage:
  - 전기 면역
  - 타겟 추적 시 이동속도 단계적 증가 (5%→10%→15%→20%)
  - 와.비.스. 갑주와 타겟 동기화
  - `[수리]` 자동 수리-0(와그펑크 수리 키트)으로 수리 (내구도 100% 복구)

## wathgrithr_shield
- armor_hp: 420 (150×4×0.7)
- absorption: 0.85
- damage: 51 (34×1.5)
- usage:
  - `[캐릭터]` 위그프리드 전용
  - 패링 가능 (범위 178도, 지속 1초)
  - 패링 성공 시 쿨다운 70% 감소
  - 쿨다운 10초 (장착 시 2초)
  - 패링 시 갑옷 내구도 3 소모
  - `[스킬트리]` 패링 보너스 데미지 강화 가능

## beefalo_groomer
- 타입: 구조물
- usage:
  - 해머 6회
  - 비팔로 묶기 + 스킨 변경

## saddle_basic
- 타입: 장비
- usage:
  - 내구도 5
  - 이동속도 ×1.4
  - 추가 피해 +0

## saddle_race
- 타입: 장비
- usage:
  - 내구도 8
  - 이동속도 ×1.55
  - 추가 피해 +0

## saddle_war
- 타입: 장비
- usage:
  - 내구도 8
  - 이동속도 ×1.25
  - 추가 피해 +16

## saltlick
- 타입: 구조물
- usage:
  - 해머 3회
  - 240회 핥기 (15일)
  - 비팔로 온순화 가속

## saltlick_improved
- 타입: 구조물
- usage:
  - 해머 3회
  - 480회 핥기 (30일)
  - 소금 재료 수리 가능

## bathbomb
- 타입: 소모품
- 스택: 20
- usage:
  - 온천 활성화
  - 보름달 시 달유리 변환

## carpentry_blade_moonglass
- 타입: 목공소부품
- usage:
  - 목공 Lv3 해금

## chesspiece_butterfly_sketch
- 타입: 도면
- usage:
  - 조각상 레시피 해금

## chesspiece_moon_sketch
- 타입: 도면
- usage:
  - 조각상 레시피 해금

## lunar_forge_kit
- 타입: 설치키트
- usage:
  - 설치 → 대황간 (달 제련 Lv2)
  - 해머 4회

## multiplayer_portal_moonrock_constr_plans
- 타입: 건설계획서
- usage:
  - 관문 달암석 업그레이드 건설계획서

## turf_fungus_moon
- 타입: 바닥재
- 스택: 20

## turf_meteor
- 타입: 바닥재
- 스택: 20

## waxwelljournal
- 악몽 연료 타입 연료 720, 스펠 1회당 -36 연료 (최대 20회)
- 4종 스펠: 일꾼 / 수호자 / 덫 / 기둥
- 스펠 시 정신력 -15 (일꾼·수호자 제외)
- 재료: 파피루스×2 + 악몽 연료×2 + 체력 50
- usage: Maxwell 전용 그림자 복사본 소환 통합 아이템

## slingshotammo_container
- 6슬롯 탄약 전용 가방
- usage: Walter 전용 탄약 휴대 용량 확장

## walter_rope
- 풀 2개로 밧줄 제작 (일반은 3개)
- 스택: 20
- usage: Walter 전용 효율 레시피

## woby_treat
- 건조 괴물고기 1개 → 2개 생산
- 워비 허기 3배 회복
- 스택: 40
- usage: Walter 전용 워비 먹이

## pocketwatch_heal
- 나이 8년 역전 + HP 20 회복
- 쿨다운: 120초
- usage: Wanda 나이 관리 + 회복

## pocketwatch_parts
- 재료: 툴레사이트 조각×8 + 악몽 연료×2
- usage: 다른 시계 제작 재료 (기능 없음)

## pocketwatch_portal
- 위치 마킹 → 포탈 개방 (10초)
- 통과 비용: 정신력 -20
- usage: Wanda 포탈 생성

## pocketwatch_recall
- 위치 마킹 → 순간이동
- 쿨다운: 480초 (1일)
- 지하 ↔ 지상 이동 가능
- usage: Wanda 장거리 이동

## pocketwatch_revive
- 자가 부활 (유령 → 원래 상태) + 타인 부활
- 쿨다운: 240초
- usage: Wanda 부활 수단

## pocketwatch_warp
- 과거 위치로 순간이동 (나이별 거리: 젊음 8 / 보통 4 / 노년 2)
- 쿨다운: 2초
- usage: Wanda 단거리 회피기

## portablecookpot_item
- 배치형, 조리 속도 20% 빠름 (조리시간 배율 0.8)
- 해머 2회로 해체
- usage: Warly 이동식 요리솥

## portableblender_item
- 배치형, 식재료 가공 프로토타이퍼
- 해머 2회로 해체
- usage: Warly 전용 식재료 가공기

## portablespicer_item
- 배치형, 양념 + 요리
- 해머 2회로 해체
- usage: Warly 양념 적용 요리

## spicepack
- BODY 슬롯 가방 6칸
- 부패 방지
- usage: Warly 재료/양념 보관

## armor_lunarplant_husk
- 내구도: 830, 흡수: 80%, 차원 방어: 10, 달 피해 저항: 90%
- 피격 시 차원 반사 10 (그림자 +20), 가시 효과
- usage: Wormwood 전용 (Wathgrithr 데이터에 포함)

## saddle_wathgrithr
- uses: 6, 이동속도: 1.3, 피해 +5, 흡수 40%
- usage: Wathgrithr 전용, 스킬트리 연동

## spider_healer_item
- Webber HP +8
- 주변 거미 HP +80 (반경 5)
- 스택: 20
- usage: Webber 전용 자신 + 거미 회복

## spidereggsack
- 설치 시 거미굴 생성
- 스택 10, 연료 180
- usage: Webber 전용 거미굴 설치

## abigail_flower
- 소환/귀환 토글, 스펠 휠 명령, 엘릭서 적용 대상
- usage: Wendy 전용 아비게일 소환 도구

## ghostflowerhat
- dapperness: +0.056, perish: 4800 (10일)
- 엘릭서 효과 적용
- usage: Wendy 전용, 스킬트리 연동

## elixir_container
- 3×3 컨테이너
- usage: Wendy 전용 엘릭서 보관

## graveurn
- 묘비 이동 도구
- usage: Wendy 전용, 스킬트리 연동

## sisturn
- 구조물, 꽃 4슬롯
- 정신력 오라 +200/일 (스킬 보유 시 +320)
- usage: Wendy 전용, 스킬트리 연동

## wendy_resurrectiongrave
- 부활 구조물, HP -40 연동 비용
- usage: Wendy 전용 부활 제단

## balloon
- 핸드 슬롯 장착, 9가지 모양 랜덤
- usage: Wes 전용 퍼포먼스 아이템

## balloonparty
- 터뜨리면 정신력 회복 (파티 규모 비례, 2초 틱)
- usage: Wes 전용 정신력 회복

## balloonspeed
- 이동속도 1.0 → 1.3 (연료 비례), 연료: 120초
- usage: Wes 전용 이동 버프 풍선

## bookstation
- 구조물, 20슬롯 책 전용
- 30초마다 내구도 1% 복원 (Wickerbottom 근처 ×2 속도)
- 책 제작 프로토타이퍼
- usage: Wickerbottom 전용 책 보관 및 내구 회복

## bernie_inactive
- 핸드 장착, dapperness: +0.033, 보온: 60
- 연료: 2400 (실효 15일)
- 광기 시 활성화 변신 (HP 1000, 공격 50)
- usage: Willow 전용 광기 수호 아이템

## lighter
- 무기 피해: 17, 점화 확률: 50%
- 연료: 600 (1.25일), 조리 가능
- usage: Willow 전용 점화 + 근접 무기

## winona_battery_low
- 연료: 180초, 소모율: 0.375 (실효 480초 = 1일)
- 공급 범위: 6.6
- usage: Winona 전용 전력 공급 (소형)

## winona_battery_high
- 연료: 2880초 (6일), 보석 재충전, 과부하 보호
- usage: Winona 전용 전력 공급 (대형)

## winona_spotlight
- 전력 소모: 0.5 (켜짐) / 0.05 (꺼짐)
- 반경: 4.27 ~ 24
- usage: Winona 전용 원거리 조명

## winona_storage_robot
- 작업 반경: 15, 이동 속도: 5, 연료: 480초 (1일)
- usage: Winona 전용 자동 운반 로봇

## winona_teleport_pad_item
- 대기 전력: 0.05, 텔레포트 비용 가변
- usage: Winona 전용 팀 이동 스테이션

## mighty_gym
- 구조물, 중량 품질별 운동 효율: LOW 4 / MED 6.67 / HIGH 10 mightiness/타
- 허기 소모: 4 / 11 / 22
- usage: Wolfgang 전용 강화 훈련

## wolfgang_whistle
- 코칭 버프 ×2, 영감 소요 7초, 버프 지속 10초
- usage: Wolfgang 전용 팀 코칭

## livinglog
- 자원, 연료: 45, 배 수리: 37.5
- 스택: 20
- usage: Woodie 전용 자원 (변신 시 획득 가능)

## compostwrap
- 비료: 1800, 토양 주기: 20, 영양분: {24, 32, 24}
- Wormwood 치유: 2HP/2초
- 스택: 40
- usage: Wormwood 전용 농업 비료 + 자가 회복

## mosquitobomb
- 피해: 59.5, 범위: 3, 모기 4마리 소환 (스킬 보유 시 6)
- 스택: 20
- usage: Wormwood 전용 투척 폭탄

## mosquitofertilizer
- 비료: 300, 토양 주기: 10, 영양분: {12, 12, 12}
- 스택: 20
- usage: Wormwood 전용 소형 비료

## mosquitomermsalve
- Wurt HP +16, 어인 HP +100
- 스택: 40
- usage: Wormwood 전용 (Wurt 연계 치료)

## mosquitomusk
- 모기 비공격 (평화 효과), 부패: 3840 (8일)
- usage: Wormwood 전용 모기 중립화

## wormwood_berrybush
- 설치 식물, 3일 주기, 3~4회 수확
- usage: Wormwood 전용 식물 설치

## wormwood_berrybush2
- 동일 (베리 덤불과 같은 사이클)
- usage: Wormwood 전용

## wormwood_juicyberrybush
- 9일 주기, 3~4회 수확
- usage: Wormwood 전용

## wormwood_sapling
- 달빛 묘목 설치, 4일 주기
- usage: Wormwood 전용

## wormwood_reeds
- 3일 주기, 4~6회 수확
- usage: Wormwood 전용

## wormwood_lureplant
- HP: 300, 아이플랜트 소환
- usage: Wormwood 전용 방어 식물

## wormwood_carrat
- HP: 25, 수명: 3일, 최대 4마리
- usage: Wormwood 전용 식물 크리처

## wormwood_lightflier
- HP: 25, 수명: 2.5일, 최대 6마리, 발광
- usage: Wormwood 전용 조명 식물 크리처

## wormwood_fruitdragon
- HP: 600 (스킬 보유 시 900), 피해: 40, 수명: 2일, 최대 2마리
- usage: Wormwood 전용 전투 식물 크리처

## wortox_reviver
- 부활 아이템, 부패: 10일
- usage: Wortox 전용, 스킬트리 연동

## wortox_souljar
- 영혼 보관, 30초마다 누출 (스킬 보유 시 중지)
- 영혼 최대 +5
- usage: Wortox 전용 영혼 저장

## merm_armory
- 어인 갑옷·모자 지급, 해머 4회
- usage: Wurt 전용 어인 군사 장비

## merm_armory_upgraded
- 상급 모자 지급
- usage: Wurt 전용

## merm_toolshed
- 어인 도구 지급
- usage: Wurt 전용

## merm_toolshed_upgraded
- 상급 도구 지급
- usage: Wurt 전용

## mermhouse_crafted
- 어인 1마리 소환, 재생: 2일
- usage: Wurt 전용 어인 소환

## mermthrone_construction
- 건설 재료 투입 → 어인 왕 소환
- usage: Wurt 전용 어인 왕 소환

## mermwatchtower
- 경비병 소환, 재생: 0.5일 (겨울 ×12)
- usage: Wurt 전용 어인 경비 초소

## offering_pot
- 머미 소집 + 급식, 범위: 7
- usage: Wurt 전용 어인 집결 + 식사

## offering_pot_upgraded
- 상급 버전
- usage: Wurt 전용

## wurt_swampitem_shadow
- 그림자 늪지 변환 (3타일), 쿨다운: 480초, 정신력 -20
- usage: Wurt 전용 지형 변환

## wurt_swampitem_lunar
- 달빛 늪지 변환, 동일 구조
- usage: Wurt 전용 지형 변환

## wurt_turf_marsh
- 늪지 바닥재 4장 제작
- usage: Wurt 전용 늪지 바닥재

## backpack
- slots: 8

## piggyback
- slots: 12
- speed_mult: 0.9 (이동속도 10% 감소)

## icepack
- slots: 8
- perishable_mod: 0.5 (부패 속도 50% 감소, 냉장 효과)

## seedpouch
- slots: 14
- perishable_mod: 0.5 (부패 속도 50% 감소, 보존 효과)

## balloonhat
- dapperness: +0.022/s
- fuel_time: 480s (1일)
- waterproofness: 0.2
- usage:
  - 번개 피해 면역
  - 피격 시 터짐 (팝 → 파괴)

## beefalohat
- insulation: 240
- waterproofness: 0.2
- fuel_time: 4800s (10일)
- usage:
  - 비팔로 비적대

## catcoonhat
- insulation: 60
- dapperness: +0.056/s
- fuel_time: 4800s (10일)

## deserthat
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 4800s (10일)
- usage:
  - 고글 효과 부여

## earmuffshat
- insulation: 60
- fuel_time: 2400s (5일)

## eyebrellahat
- waterproofness: 1.0 (완전 방수)
- summer_insulation: 240
- fuel_time: 4320s (9일)
- usage:
  - 번개 피해 면역
  - 우산 효과 부여

## featherhat
- dapperness: +0.033/s
- fuel_time: 3840s (8일)

## flowerhat
- dapperness: +0.022/s
- fuel_time: 2880s (6일)
- usage:
  - 머맨에게 반전 (적대 → 비적대)

## goggleshat
- dapperness: +0.056/s
- fuel_time: 4800s (10일)
- usage:
  - 고글 효과 부여 (보호 효과 없음)

## icehat
- summer_insulation: 240
- speed_mult: 0.9 (이동속도 10% 감소)
- perish: 3840s (8일)
- usage:
  - 착용 중 냉각 -40 (체온 하강)
  - 습도 +1/s (최대 49%)
  - 얼음으로 수리 가능

## inspectacleshat
- usage:
  - 주변 게임 신호 감지, 5초마다 갱신
  - Winona 전용 스킬 필요

## kelphat
- dapperness: -0.022/s (머맨 착용 시 반전)
- perish: 2880s (6일)

## mermhat
- dapperness: -0.022/s
- perish: 7200s (15일)
- usage:
  - 머맨 비적대

## blue_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 착용 중 파란 포자 방출

## green_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 착용 중 초록 포자 방출

## red_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 착용 중 빨간 포자 방출

## moon_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% 감소)
- perish: 2880s (6일)
- usage:
  - 달 포자 방출 (1.5초 간격, 일반 버섯 모자보다 빠름)
  - 피격 시 달 포자 3개 추가 방출
  - 달 포자 보호 효과 부여

## moonstorm_goggleshat
- dapperness: +0.056/s
- waterproofness: 0.2
- fuel_time: 480s (1일)
- usage:
  - 고글 효과 부여
  - 달폭풍 감지 기능

## nutrientsgoggleshat
- summer_insulation: 60
- shadowlevel: 1
- usage:
  - 식물 검사 기능
  - 토양 영양 시각화

## polly_rogershat
- waterproofness: 0.35
- fuel_time: 2880s (6일)
- usage:
  - 착용 시 앵무새(Polly Rogers) 소환 — 주변 아이템 자동 줍기
  - 앵무새 사망 시 1일 후 부활
  - 서버 이동 시 앵무새 유지

## pumpkinhat
- waterproofness: 0.2
- perish: 3840s (8일, 핼러윈 이벤트 중 7200s)
- usage:
  - 어둠에 의한 정신력 감소 면역
  - 유령 피해 면역

## rainhat
- waterproofness: 0.7
- fuel_time: 4800s (10일)
- usage:
  - 번개 피해 면역

## roseglasseshat
- dapperness: +0.022/s
- usage:
  - Winona 전용
  - 스킬트리 연동 (근접 검사 / 벌레구멍 추적)

## strawhat
- summer_insulation: 60
- waterproofness: 0.2
- fuel_time: 2400s (5일)
- usage:
  - 연료로 사용 가능

## tophat
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 3840s (8일)

## tophat_magician
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 3840s (8일)
- shadowlevel: 2
- usage:
  - 그림자 수납공간 제공

## walterhat
- summer_insulation: 60
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 4800s (10일)
- usage:
  - Walter 전용 — 정신력 피해 50% 경감

## watermelonhat
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: -0.033/s
- perish: 1440s (3일)
- usage:
  - 착용 중 냉각 -55 (체온 하강)
  - 습도 +0.5/s

## winterhat
- insulation: 120
- dapperness: +0.022/s
- fuel_time: 4800s (10일)

## bushhat
- usage:
  - 숨기 기능 — 적에게 탐지되지 않음

## armorslurper
- hunger_rate: 0.6 (40% 감소)
- dapperness: +0.033/s
- fuel_time: 3840s (8일)
- shadowlevel: 2
- usage:
  - 방어 효과 없음

## beargervest
- insulation: 240
- dapperness: +0.074/s
- hunger_rate: 0.75 (25% 감소)
- fuel_time: 3360s (7일)

## hawaiianshirt
- summer_insulation: 240
- dapperness: +0.056/s
- perish: 7200s (15일)

## onemanband
- dapperness: -0.033/s (기본; 팔로워 1명당 추가 감소)
- fuel_time: 180s
- shadowlevel: 1
- usage:
  - 팔로워 감지 범위: 12
  - 최대 팔로워 수: 10

## raincoat
- waterproofness: 1.0 (완전 방수)
- insulation: 60
- fuel_time: 4800s (10일)
- usage:
  - 번개 피해 면역

## reflectivevest
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 3840s (8일)

## sweatervest
- insulation: 60
- dapperness: +0.056/s
- fuel_time: 4800s (10일)

## trunkvest_summer
- summer_insulation: 60
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 7200s (15일)

## trunkvest_winter
- insulation: 240
- dapperness: +0.033/s
- fuel_time: 7200s (15일)

## featherfan
- uses: 15회
- usage:
  - 범위 7 내 냉각 -50도 (최소 체온 2.5도까지)
  - 범위 내 불 끄기 가능

## grass_umbrella
- waterproofness: 0.5
- summer_insulation: 120
- dapperness: +0.033/s
- perish: 960s (2일)
- usage:
  - 연료로 사용 가능

## minifan
- damage: 17
- fuel_time: 90s
- usage:
  - 이동 중에만 활성화: 냉각 -55 + 방열 +60
  - 정지 시 냉각/방열 비활성

## umbrella
- waterproofness: 0.9
- summer_insulation: 120
- fuel_time: 2880s (6일)

## voidcloth_umbrella
- waterproofness: 1.0 (완전 방수)
- summer_insulation: 240
- dapperness: -0.056/s
- fuel_time: 7200s (15일)
- shadowlevel: 3
- usage:
  - 산성비 / 달우박 피해 면역
  - 돔 기능: 반경 16 범위 보호 (사용 시 내구 소모 1.5배)
  - 파손 시 수리 가능
  - 전용 수리 키트로 수리

## winona_telebrella
- waterproofness: 0.35
- fuel_time: 7200s (15일, 배터리 충전 방식)
- usage:
  - 텔레포트 기능 (1일분 연료 소모)
  - Winona 전용
  - 스킬트리 연동

## balloonvest
- fuel_time: 480s (1일)
- usage:
  - 익사 방지
  - 피격 시 터짐 (팝 → 파괴)

## cookbook
- 기능: 요리책 팝업 열기
- 연료 지속: 45초

## cookpot
- 종류: 구조물
- 슬롯 수: 4
- 기본 조리 시간: ~20초 (레시피별 배수 적용)
- 해머 횟수: 4회

## meatrack
- 종류: 구조물
- 슬롯 수: 3 (건조 가능 아이템 전용)
- 건조 시간: 0.5~2일 (아이템별 상이)
- 특이사항: 비 올 때 정지
- 해머 횟수: 4회

## spice_chili
- 스택: 40
- 버프: 공격력 ×1.2, 지속 240초
- 체온: +40

## spice_garlic
- 스택: 40
- 버프: 피해 흡수 33.3%, 지속 240초

## spice_salt
- 스택: 40
- 효과: 체력 회복 +25% (즉시 적용, 버프 없음)

## spice_sugar
- 스택: 40
- 버프: 작업 효율 ×2, 지속 240초

## wintersfeastoven
- 종류: 구조물
- 특이사항: 겨울 축제 전용
- 기본 조리 시간: ~20초
- 제작 스테이션: 프로토타이퍼 (WINTERSFEASTCOOKING)
- 해머 횟수: 4회

## portablefirepit_item
- 참조: character.md

## critter_dragonling_builder
- 소환펫: dragonling
- 이동: 비행
- 좋아하는음식: 매운칠리

## critter_eyeofterror_builder
- 소환펫: eyeofterror
- 이동: 비행
- 좋아하는음식: 베이컨에그

## critter_glomling_builder
- 소환펫: glomling
- 이동: 비행
- 좋아하는음식: 타피

## critter_kitten_builder
- 소환펫: kitten
- 이동: 지상
- 좋아하는음식: 피시스틱

## critter_lamb_builder
- 소환펫: lamb
- 이동: 지상
- 좋아하는음식: 과카몰리

## critter_lunarmothling_builder
- 소환펫: lunarmothling
- 이동: 비행
- 좋아하는음식: 꽃샐러드

## critter_perdling_builder
- 소환펫: perdling
- 이동: 지상
- 좋아하는음식: 트레일믹스

## critter_puppy_builder
- 소환펫: puppy
- 이동: 지상
- 좋아하는음식: 몬스터라자냐

## wall_hay_item
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 100
- 설치 시 HP: 50
- 해머 횟수: 3회
- 수리 재료: 풀 (1개당 약 16.7 회복)
- 해머 전리품: 풀 (HP 비례, 최대 2개)
- 가연성: 예

## wall_wood_item
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 200
- 설치 시 HP: 100
- 해머 횟수: 3회
- 수리 재료: 통나무 (1개당 약 33.3 회복)
- 해머 전리품: 통나무 (HP 비례, 최대 2개)
- 가연성: 예

## wall_stone_item
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 400
- 설치 시 HP: 200
- 해머 횟수: 3회
- 수리 재료: 돌 (1개당 약 66.7 회복)
- 해머 전리품: 돌 (HP 비례, 최대 2개)
- 가연성: 화재 면역

## wall_moonrock_item
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 600
- 설치 시 HP: 300
- 해머 횟수: 25회
- 수리 재료: 월석 조각 (1개당 100 회복)
- 해머 전리품: 월석 조각 (HP 비례, 최대 2개)
- 가연성: 화재 면역
- usage:
  - 플레이어 피해 75% 감소

## wall_dreadstone_item
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 800
- 설치 시 HP: 400
- 해머 횟수: 25회
- 수리 재료: 공포석 (1개당 320 회복)
- 해머 전리품: 공포석 (HP 비례, 최대 2개)
- 가연성: 화재 면역
- usage:
  - 플레이어 피해 75% 감소

## wall_scrap_item
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 600
- 설치 시 HP: 300
- 해머 횟수: 10회
- 수리 재료: 톱니바퀴 (1개당 320 회복)
- 해머 전리품: 와그펑크 부품 (HP 비례, 최대 1개)
- 가연성: 화재 면역
- usage:
  - 플레이어 피해 75% 감소

## fence_item
- 타입: 벽 (배치형)
- 스택: 20
- 설치 시 HP: 1 (모든 피해 흡수)
- 해머 횟수: 3회
- usage:
  - 이동 차단 및 경로 탐색 벽 역할

## fence_gate_item
- 타입: 벽 (배치형)
- 스택: 20
- 설치 시 HP: 1 (모든 피해 흡수)
- 해머 횟수: 3회
- usage:
  - 플레이어가 열고 닫을 수 있는 문 역할
  - 닫혀 있을 때 이동 차단 및 경로 탐색 벽 역할

## turf_road
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 도로
- usage:
  - 이동속도 30% 증가

## turf_cotl_brick
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 도로
- usage:
  - 이동속도 30% 증가

## turf_dragonfly
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- usage:
  - 화재 확산 완전 방지

## turf_carpetfloor
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_carpetfloor2
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_checkerfloor
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_cotl_gold
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_woodfloor
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_beard_rug
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_mosaic_blue
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_mosaic_grey
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_mosaic_red
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재

## turf_archive
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_vault
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_rocky
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_underrock
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_vent
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_ruinsbrick
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_ruinsbrick_glow
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_ruinstiles
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_ruinstiles_glow
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_ruinstrim
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_ruinstrim_glow
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면

## turf_grass
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_forest
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_savanna
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_deciduous
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_desertdirt
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_marsh
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_cave
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_fungus
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_fungus_green
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_fungus_red
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_fungus_moon
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_mud
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_sinkhole
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_pebblebeach
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_shellbeach
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_meteor
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## turf_monkey_ground
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면

## wood_chair
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 예

## wood_stool
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 예

## stone_chair
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 화재 면역

## stone_stool
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 화재 면역

## hermit_chair_rocking
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음 (흔들의자)
- 가연성: 예

## wood_table_round
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 예

## wood_table_square
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 예

## stone_table_round
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 화재 면역

## stone_table_square
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 화재 면역

## endtable
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 꽃꽂이 가능: 신선한 꽃 삽입 시 빛 방출 (반경 1.5, 강도 0.5), 정신력 +5
  - 꽃은 4800초(10일) 후 시듦
- 가연성: 예

## wardrobe
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 캐릭터 스킨 변경
- 가연성: 예

## sewing_mannequin
- 타입: 구조물
- 해머 횟수: 6회
- usage:
  - 장비 전시대: 머리/몸통/손 슬롯에 장비 장착 가능
  - 아이템을 주면 자동 장착, 슬롯이 차있으면 교체
  - 해머 시 장착된 모든 장비 드롭
- 가연성: 예

## homesign
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 글쓰기 가능
- 가연성: 예

## arrowsign_post
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 글쓰기 가능
  - 8방향 회전 가능
- 가연성: 예

## minisign_item
- 타입: 인벤토리 아이템 (배치형)
- 스택: 10
- usage:
  - 설치 후 깃펜으로 아이템 이미지 그리기 가능
  - 삽으로 회수 (해머가 아닌 DIG 액션)
- 가연성: 예

## pottedfern
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 순수 장식용 (랜덤 외형 1~10 변형)
- 가연성: 예

## succulent_potted
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 순수 장식용 (랜덤 외형 1~5 변형)
- 가연성: 예

## ruinsrelic_bowl
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능

## ruinsrelic_chair
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음 (불편한 의자)
  - 유적에서 셰이들링 유인 가능

## ruinsrelic_chipbowl
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능

## ruinsrelic_plate
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능

## ruinsrelic_table
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 장식 탁자 (장애물 물리 반경 0.5)

## ruinsrelic_vase
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능

## vaultrelic_bowl
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능

## vaultrelic_planter
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능

## vaultrelic_vase
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
  - 꽃꽂이 가능: 신선한 꽃 삽입 시 빛 방출 (반경 1.5, 강도 0.5)

## decor_centerpiece
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 순수 장식용
- 가연성: 예

## decor_flowervase
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 꽃꽂이 가능: 신선한 꽃 삽입 시 빛 방출 (반경 1.5, 강도 0.5)
  - 꽃은 4800초(10일) 후 시듦
- 가연성: 예

## decor_lamp
- 타입: 인벤토리 아이템 (탁상 장식)
- fuel: 468s (CAVE 타입 연료, 전구 사용)
- usage:
  - 탁자 위에 올려놓기 가능
  - 연료식 조명: 연료량에 따라 빛 반경 2~4 (강도 0.4~0.6)
  - 켜기/끄기 전환 가능
  - 바닥에 놓으면 자동 점등, 인벤토리에 넣으면 자동 소등
- 가연성: 예

## decor_pictureframe
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 깃펜으로 아이템 이미지 그리기 가능
- 가연성: 예

## decor_portraitframe
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 순수 장식용
- 가연성: 예

## chesspiece_anchor_sketch
- 타입: 인벤토리 아이템 (도면)
- usage:
  - 도예가의 돌림판에서 닻 조각상 제작법 해금
  - 사용 시 소모

## chesspiece_butterfly_sketch
- 타입: 인벤토리 아이템 (도면)
- usage:
  - 도예가의 돌림판에서 달 나방 조각상 제작법 해금
  - 사용 시 소모

## chesspiece_moon_sketch
- 타입: 인벤토리 아이템 (도면)
- usage:
  - 도예가의 돌림판에서 "달" 조각상 제작법 해금
  - 사용 시 소모

## chesspiece_hornucopia_builder
- 타입: 인벤토리 아이템 (무거운 물체)
- speed_mult: 0.15 (이동속도 85% 감소)
- 해머 횟수: 1회
- usage:
  - 무거운 아이템 — 컨테이너 보관 불가, BODY 슬롯 장착
  - 체육 무게: 3 (Wolfgang 전용 gym)
  - 해머 시 재료 반환

## chesspiece_pipe_builder
- 타입: 인벤토리 아이템 (무거운 물체)
- speed_mult: 0.15 (이동속도 85% 감소)
- 해머 횟수: 1회
- usage:
  - 무거운 아이템 — 컨테이너 보관 불가, BODY 슬롯 장착
  - 체육 무게: 3 (Wolfgang 전용 gym)
  - 해머 시 재료 반환

## phonograph
- 타입: 인벤토리 아이템 (구조물 겸용)
- 해머 횟수: 1회
- usage:
  - 레코드 삽입 후 음악 재생 (64초간)
  - 재생 중 반경 8 내 농작물 관리 효과
  - 탁자 위에 올려놓기 가능
  - 인벤토리 휴대 시 재생 중지

## record
- 타입: 인벤토리 아이템
- usage:
  - 축음기에 삽입하여 음악 재생
  - 변형: default, balatro 등

## pirate_flag_pole
- 타입: 구조물
- 해머 횟수: 3회
- usage:
  - 순수 장식용 (랜덤 깃발 외형 1~4 변형)
- 가연성: 예

## winter_treestand
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 겨울 축제 나무 묘목 심기용 화분
  - 묘목 심으면 구조물 자체는 사라지고 겨울 축제 트리로 성장
  - 트리 성장 단계: 묘목(0.5일) → 어린(1일) → 중간(1일) → 큰(1일)
  - 큰 트리는 장식품 컨테이너 슬롯 제공
- 가연성: 예

## chum
- 스택: 20
- 효과: 바다 투척 시 물고기 소환 20초
- 유인 반경: 16

## bobber_ball
- 스택: 40
- 캐스팅 거리: 9
- 정확도: 0.80~1.20
- 각도 오차: ±20°

## bobber_oval
- 스택: 40
- 캐스팅 거리: 11
- 정확도: 0.80~1.20
- 각도 오차: ±20°

## bobber_crow
- 스택: 40
- 캐스팅 거리: 9
- 정확도: 0.85~1.15
- 각도 오차: ±15°

## bobber_robin
- 스택: 40
- 캐스팅 거리: 9
- 정확도: 0.85~1.15
- 각도 오차: ±15°

## bobber_robin_winter
- 스택: 40
- 캐스팅 거리: 9
- 정확도: 0.85~1.15
- 각도 오차: ±15°

## bobber_canary
- 스택: 40
- 캐스팅 거리: 9
- 정확도: 0.85~1.15
- 각도 오차: ±15°

## bobber_goose
- 스택: 40
- 캐스팅 거리: 13
- 정확도: 0.95~1.05
- 각도 오차: ±5°

## bobber_malbatross
- 스택: 40
- 캐스팅 거리: 13
- 정확도: 0.95~1.05
- 각도 오차: ±5°

## lure_hermit_drowsy
- 스택: 40
- 유인 반경: 3
- 매력도: 0.1
- 감기 속도: +0.3
- 캐스팅 거리: +1
- 조건: 전천후
- 특이사항: 체력 소모

## lure_hermit_heavy
- 스택: 40
- 유인 반경: 5
- 매력도: 0.5
- 감기 속도: 0
- 캐스팅 거리: +1
- 조건: 전천후
- 특이사항: 무거운 물고기(80%+)에 추가 매력

## lure_hermit_rain
- 스택: 40
- 유인 반경: 5
- 매력도: 0.3
- 감기 속도: +0.5
- 캐스팅 거리: +1
- 조건: 비 전용

## lure_hermit_snow
- 스택: 40
- 유인 반경: 5
- 매력도: 0.3
- 감기 속도: +0.5
- 캐스팅 거리: +1
- 조건: 눈 전용

## lure_spinner_blue
- 스택: 40
- 유인 반경: 5
- 매력도: 0.4
- 감기 속도: +0.4
- 캐스팅 거리: +2
- 조건: 야간 특화

## lure_spinner_green
- 스택: 40
- 유인 반경: 5
- 매력도: 0.4
- 감기 속도: +0.4
- 캐스팅 거리: +2
- 조건: 황혼 특화

## lure_spinner_red
- 스택: 40
- 유인 반경: 5
- 매력도: 0.4
- 감기 속도: +0.4
- 캐스팅 거리: +2
- 조건: 주간 특화

## lure_spoon_blue
- 스택: 40
- 유인 반경: 4
- 매력도: 0.2
- 감기 속도: +0.3
- 캐스팅 거리: +1
- 조건: 야간 특화

## lure_spoon_green
- 스택: 40
- 유인 반경: 4
- 매력도: 0.2
- 감기 속도: +0.3
- 캐스팅 거리: +1
- 조건: 황혼 특화

## lure_spoon_red
- 스택: 40
- 유인 반경: 4
- 매력도: 0.2
- 감기 속도: +0.3
- 캐스팅 거리: +1
- 조건: 주간 특화

## trophyscale_fish
- 유형: 구조물
- 해머 횟수: 4회
- 기능: 물고기 무게 측정 및 기록

## beebox
- 타입: 구조물
- 꿀 최대: 6
- 벌: 4마리
- 벌 재생: 120초
- 해머: 4회

## birdcage
- 타입: 구조물
- 새 보관
- 변환: 고기 → 알, 씨앗 → 씨앗
- 해머: 4회

## compostingbin
- 타입: 구조물
- 수용: 재료 6개
- 생산: 퇴비 1개 / 240~480초
- 해머: 4회

## farm_plow_item
- 타입: 도구
- 사용 횟수: 4
- 효과: 타일 → 농장 흙 변환
- 굴착 시간: 15초

## fertilizer
- 타입: 도구
- 사용 횟수: 10
- 효과: 비료 300초
- 영양소: 퇴비 0 / 성장촉진제 0 / 거름 16

## mushroom_farm
- 타입: 구조물
- 수확: 4회
- 성장 시간: 1800초
- 수리 재료: 생목
- 해머: 3회

## ocean_trawler_kit
- 타입: 수상 구조물
- 슬롯: 4
- 자동 어획: 12.5% / 0.75초
- 미끼 사용 시: 어획률 2배
- 보존: 10배

## soil_amender
- 타입: 발효 아이템 (3단계)
- 신선: 영양소 퇴비 8 / 성장촉진제 0 / 거름 0
- 숙성: 영양소 퇴비 16 / 성장촉진제 0 / 거름 0
- 발효: 영양소 퇴비 32 / 성장촉진제 0 / 거름 0
- 사용 횟수: 5 (발효 후)

## treegrowthsolution
- 타입: 도구
- 스택: 10
- 효과: 비료 + 나무 성장 + 보트 수리 20 HP
- 영양소: 퇴비 8 / 성장촉진제 32 / 거름 8

## trophyscale_oversizedveggies
- 타입: 구조물
- 효과: 대형 작물 무게 측정
- 최고 기록 유지
- 해머: 4회

## bandage
- 체력: +30 HP (즉시 회복)
- 사용 횟수: 1 (1회 소비)
- 스택: 40

## bedroll_straw
- 스택: 10
- 수면 효과 (초당):
  - 체력: +0.5/초
  - 정신력: +0.667/초
  - 허기: -1/초
- 온도 조절: 없음

## bedroll_furry
- 사용 횟수: 3
- 수면 효과 (초당):
  - 체력: +1/초
  - 정신력: +1/초
  - 허기: -1/초
- 방한: 온도 유지 30~45°C

## healingsalve
- 체력: +20 HP (즉시 회복)
- 사용 횟수: 1 (1회 소비)
- 스택: 40

## healingsalve_acid
- 체력: +20 HP (즉시 회복)
- 사용 횟수: 1 (1회 소비)
- 스택: 40
- 추가 효과: 사용 후 산성비 면역 240초

## lifeinjector
- 효과: 최대 HP 패널티 25% 제거
- 사용 횟수: 1 (1회 소비)
- 스택: 40

## reviver
- 효과: 유령 상태의 플레이어 부활
- 부활 정신력: 부활한 플레이어 +80 SAN
- 패널티: 부활 대상 최대 HP 25% 패널티 적용
- 사용 횟수: 1 (1회 소비)

## tillweedsalve
- 체력: +8 HP (즉시) + +1 HP/3초 × 60초 = +20 HP (지속), 합계 +28 HP
- 사용 횟수: 1 (1회 소비)
- 스택: 40

## lantern
- 장착 슬롯: 손 (핸드)
- 연료 지속: 468초 (동굴 연료 기준)
- 빛 반경: 3~5 (연료량 비례)
- 연료 보충: 가능

## molehat
- 장착 슬롯: 머리
- 연료 유형: 벌레빛
- 연료 지속: 720초 (1.5일)
- 효과: 야간투시
- 소진 시: 아이템 제거

## mushroom_light
- 유형: 구조물
- 슬롯 수: 4 (빛 배터리 전용)
- 빛 반경: 2.5~5.5 (삽입된 배터리 수 비례)
- 부패 속도: 25% (일반 대비)
- 해머 횟수: 3회

## mushroom_light2
- 유형: 구조물
- 슬롯 수: 4 (빛 배터리 + 포자 전용)
- 빛 반경: 2.5~5.5
- 포자 슬롯: 색상 변경 가능
- 부패 속도: 25% (일반 대비)
- 해머 횟수: 3회

## pumpkin_lantern
- 발광 조건: 밤/황혼에만 발광
- 빛 반경: 1.5
- 부패 시간: 4800초 (핼러윈 이벤트 중 19200초)
- 부패: 바닥에 놓인 상태에서만 부패 진행

## torch
- 장착 슬롯: 손 (핸드)
- 연료 지속: 75초
- 빛 반경: 2 (스킬 적용 시 최대 5)
- 피해량: 17 (기본 공격력의 50%)
- 착화율: 100% (적 착화)
- 비소모 배율: 1.5× (불꽃 관련 스킬)
- 방수: 20%
- 던지기: 가능

## beargerfur_sack
- 타입: 컨테이너
- usage:
  - 내부 음식 유통기한 20배 연장 (부패 속도 ×0.05)

## deerclopseyeball_sentryward_kit
- 타입: 구조물
- usage:
  - 해머 4회
  - 맵 공개
  - 반경 35 내 환경 온도를 -10도로 고정 (계절 무관)
  - 7~12일마다 얼음 6개

## lunarplant_kit
- 타입: 수리키트
- usage:
  - 달식물 재질 수리키트

## blueamulet
- fuel: 360s (MAGIC)
- dapperness: +0.033/s
- usage:
  - 착용 시 착용자 냉각 (열원 -20, 여름 체온 감소)
  - 피격 시 공격자에게 냉기 부여 (냉기 +0.67) + 연료 3% 소모

## greenamulet
- uses: 5
- dapperness: +0.033/s
- usage:
  - 제작 시 재료 50%만 소모

## orangeamulet
- uses: 225
- dapperness: +0.033/s
- usage:
  - 0.33초마다 반경 4 내 아이템 자동 수거
  - 악몽 연료로 수리 가능 (1개당 내구도 50 회복)

## purpleamulet
- fuel: 192s (MAGIC), 장착 중 상시 소모
- dapperness: -0.056/s (분당 -3.3, 하루 -26.7)
- usage:
  - 장착 시 정신력을 0으로 강제 표시 — 실제 정신력은 유지, 판정/UI만 0 처리
  - 이로 인해 광기 상태 돌입 — 그림자 생물 출현/공격
  - 장착 해제 시 원래 정신력 수치로 복원 (단, 장착 중 정신력 감소 효과로 실제 정신력도 감소하므로 오래 착용하면 해제 후 정신력이 낮아져 있음)

## yellowamulet
- fuel: 480s (악몽 연료 타입), 장착 중 상시 소모
- speed_mult: 1.2 (이동속도 +20%)
- dapperness: +0.033/s
- usage:
  - 빛 방출 (반경 2, 황금빛)
  - 장착 중 악몽 연료를 투입하여 지속시간 연장 가능 (다른 부적은 불가)

## greenstaff
- uses: 5
- usage:
  - 레시피가 있는 구조물/아이템 해체 → 내구도 잔여% 비례로 재료 반환 (최소 1개 보장, 보석 계열 재료는 미반환)
  - 사용 시 정신력 -20

## orangestaff
- uses: 20
- damage: 17
- speed_mult: 1.25 (이동속도 +25%)
- usage:
  - 블링크 (순간이동)
  - 블링크 시 정신력 -15
  - 공격 시 내구도 소모 없음

## telestaff
- uses: 5
- usage:
  - 대상을 무작위 위치 또는 순간이동 집중기로 순간이동
  - 동굴에서는 순간이동 불가 (약진동만 발생)
  - 사용 시 정신력 -50
  - 사용 시 월드 강수량 게이지 +500 — 비 유발 가능 (플레이어 습도가 아닌 월드 강수량)

## yellowstaff
- uses: 20
- usage:
  - 지정 위치에 왜성 소환 (1680초 = 3.5일 지속):
  - 사용 시 정신력 -20

## nightlight
- 타입: 구조물
- 해머 횟수: 4회
- 연료: 악몽 연료 타입
- 최대 연료: 540s
- usage:
  - 점화 시 정신력 오라 -0.05/s

## nightmare_timepiece
- 타입: 인벤토리 아이템
- usage:
  - 악몽 페이즈 상태 UI 표시

## nightmarefuel
- 타입: 소모품
- 스택: 40
- usage:
  - 악몽 연료 타입 연료로 사용 가능 (연료값 180s, 어둠의 등불/마광 등에 투입)
  - 게으른 약탈자 수리 재료 (1개당 내구도 50 회복). 순수한 공포도 동일 대상 수리 가능 (1개당 내구도 100). 현재 소스상 수리 대상은 게으른 약탈자만 해당.

## purplegem
- 타입: 인벤토리 아이템
- 스택: 40
- usage:
  - 제작 재료용

## researchlab3
- 타입: 구조물 (제작 스테이션)
- 제작 스테이션: MAGIC_TWO
- 재료: 생목×3, 보라 보석×1, 악몽 연료×7

## researchlab4
- 타입: 구조물 (제작 스테이션)
- 제작 스테이션: MAGIC_ONE
- 재료: 토끼×4, 판자×4, 실크 모자×1

## resurrectionstatue
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 부활 포인트 지정
  - 연동 시 최대 HP -40

## telebase
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 보라 보석 3개 삽입 시 텔레포트 목적지로 설정

## townportal
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 양방향 순간이동
  - 채널링 시작 시 즉시 정신력 -15
  - 채널링 중 정신력 -0.667/s
  - 텔레포트 사용자 정신력 -50

## moondial
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 달 페이즈별 조명 변화

## moonrockidol
- 타입: 인벤토리 아이템
- usage:
  - 달 포탈 반경 8 접근 시 발광
  - 달문 활성화 열쇠

## leif_idol
- 타입: 소모품
- 스택: 10
- 연료: 180s
- usage:
  - 반경 20 내 트리가드 깨우기
  - 반경 10 내 나무 2그루를 트리가드로 변환

## magician_chest
- 타입: 구조물
- 해머 횟수: 2회
- usage:
  - 맥스웰 그림자 공간과 공유되는 저장소

## punchingbag_lunar
- 타입: 구조물
- 해머 횟수: 6회
- HP: 10009 (즉각 회복)
- alignment: 달 정렬
- usage:
  - 장비 장착 가능 (데미지 테스트용)

## punchingbag_shadow
- 타입: 구조물
- 해머 횟수: 6회
- HP: 10009 (즉각 회복)
- alignment: 그림자 정렬
- usage:
  - 장비 장착 가능 (데미지 테스트용)

## waxwelljournal
- 연료: 악몽 연료 타입 720s
- usage:
  - Maxwell 전용
  - 스펠 1회당 연료 -36 소모 (최대 20회)
  - 4종 스펠: 일꾼 / 수호자 / 덫 / 기둥

## wereitem_beaver
- 타입: 음식
- 스택: 10
- 포만도: 25
- 체력: -20 (저주 마스터 스킬 시 0)
- 정신력: -15 (저주 마스터 스킬 시 0)
- usage:
  - Woodie 전용
  - 스킬트리 연동 (저주 마스터)

## wereitem_goose
- 타입: 음식
- 스택: 10
- 포만도: 25
- 체력: -20 (저주 마스터 스킬 시 0)
- 정신력: -15 (저주 마스터 스킬 시 0)
- usage:
  - Woodie 전용
  - 스킬트리 연동 (저주 마스터)

## wereitem_moose
- 타입: 음식
- 스택: 10
- 포만도: 25
- 체력: -20 (저주 마스터 스킬 시 0)
- 정신력: -15 (저주 마스터 스킬 시 0)
- usage:
  - Woodie 전용
  - 스킬트리 연동 (저주 마스터)

## carpentry_station
- 타입: 구조물
- 기술 레벨: CARPENTRY=2 (블레이드 삽입 시 3)
- 해체: 해머 2회

## cartographydesk
- 타입: 구조물
- 기술 레벨: CARTOGRAPHY=2
- 해체: 해머 4회
- 기능: 지도 지우기

## madscience_lab
- 타입: 구조물
- 기술 레벨: MADSCIENCE=1
- 해체: 해머 4회
- 기능: 할로윈 이벤트 포션 제작

## researchlab
- 타입: 구조물
- 기술 레벨: SCIENCE=1, MAGIC=1
- 해체: 해머 4회
- 활성 반경: 4
- 기능: 옷장

## researchlab2
- 타입: 구조물
- 기술 레벨: SCIENCE=2, MAGIC=1
- 해체: 해머 4회
- 활성 반경: 4
- 기능: 옷장

## sculptingtable
- 타입: 구조물
- 기술 레벨: SCULPTING=1 (소재에 따라 동적)
- 해체: 해머 4회
- 기능: 스케치 학습

## seafaring_prototyper
- 타입: 구조물
- 기술 레벨: SEAFARING=2
- 해체: 해머 4회

## tacklestation
- 타입: 구조물
- 기술 레벨: FISHING=1
- 해체: 해머 4회
- 기능: 낚시 스케치 학습

## turfcraftingstation
- 타입: 구조물
- 기술 레벨: TURFCRAFTING=2, MASHTURFCRAFTING=2
- 해체: 해머 4회

## perdshrine
- 타입: 구조물
- 기술 레벨: PERDOFFERING=3
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 베리 덤불

## pigshrine
- 타입: 구조물
- 기술 레벨: PIGOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 고기

## wargshrine
- 타입: 구조물
- 기술 레벨: WARGOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 횃불 (연료 소모 20% 감소)

## yot_catcoonshrine
- 타입: 구조물
- 기술 레벨: CATCOONOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 새 깃털

## yotb_beefaloshrine
- 타입: 구조물
- 기술 레벨: BEEFOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 비팔로 털

## yotc_carratshrine
- 타입: 구조물
- 기술 레벨: CARRATOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 당근 / 씨앗

## yotd_dragonshrine
- 타입: 구조물
- 기술 레벨: DRAGONOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 목탄

## yoth_knightshrine
- 타입: 구조물
- 기술 레벨: KNIGHTOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 톱니 / 끊어진 전선 / 전기 부품

## yotr_rabbitshrine
- 타입: 구조물
- 기술 레벨: RABBITOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화; 토끼 축제 이벤트 시 토끼인간 9마리 소환
- 공물: 당근

## yots_snakeshrine
- 타입: 구조물
- 기술 레벨: WORMOFFERING=3, PERDOFFERING=1
- 해체: 해머 4회
- 기능: 빈 상태 시 거래만 활성화, 공물 바치면 제작대 활성화
- 공물: 괴물고기

## lightning_rod
- 타입: 구조물
- usage:
  - 해머 4회
  - 번개 흡수 3충전
  - WX78 배터리
  - 충전 시 빛 방출

## minerhat
- 타입: 모자
- usage:
  - 연료 468초 (동굴 연료)
  - 방수 0.2
  - 머리 빛 방출

## rainometer
- 타입: 구조물
- usage:
  - 해머 4회
  - 강수 확률 미터 표시

## bearger_fur
- 타입: 소재
- 스택: 10
- 특수: 없음

## beeswax
- 타입: 소재
- 스택: 40
- 특수: 불 근처에서 녹음

## boards
- 타입: 소재
- 스택: 10
- 연료: 180초
- 수리: HP 50 회복 (나무 재질)
- 나무 식단 — 과자틀소라만 먹을 수 있음

## cutstone
- 타입: 소재
- 스택: 10
- 수리: HP 50 회복 (돌 재질)
- 두더지 미끼
- 암석 공물: 3

## malbatross_feathered_weave
- 타입: 소재
- 스택: 20
- 연료: 15초

## marblebean
- 타입: 소재
- 스택: 40
- 두더지 미끼
- 심으면 대리석 묘목으로 성장

## moonrockcrater
- 타입: 소재
- 스택: 단일 (비스택)
- 수리: HP 80 회복 + 작업량 4 회복 (월석 재질)
- 보석 소켓 지원

## papyrus
- 타입: 소재
- 스택: 40
- 연료: 15초
- 고양이 장난감

## refined_dust
- 타입: 소재
- 스택: 40
- 원소 식단, 허기 +1 (NPC 전용)
- 미끼
- 암석 공물: 1

## rope
- 타입: 소재
- 스택: 20
- 연료: 45초
- 고양이 장난감

## transistor
- 타입: 소재
- 스택: 10
- 특수: 없음

## waxpaper
- 타입: 소재
- 스택: 40
- 연료: 15초
- 낮은 발화점

## woodie_boards
- 타입: 소재 (= boards)
- 비고: Woodie가 루시 도끼로 나무 2개를 사용하여 판자 제작 가능한 레시피 변형

## seafaring_prototyper
- 유형: 제작대
- 제공 기술: SEAFARING 티어 2
- 해머 횟수: 4회

## boat_grass_item
- 유형: 배 키트 (수상 배치)
- 배치 반경: 3
- 선체 체력: 200
- 수리 재료: 건초
- 특이사항: 물이 새지 않음, 시간이 지남에 따라 자동 열화 (5)

## boat_item
- 유형: 배 키트 (수상 배치)
- 배치 반경: 4
- 선체 체력: 200
- 최대 선체 피해: 70
- 수리 재료: 나무

## boatpatch_kelp
- 스택: 20
- 수리량: 30
- 수리 재료: 다시마
- 부패 시간: 4800초
- 먹을 수 있음: 허기 28.125, 체력 -3, 정신력 -55

## boatpatch
- 스택: 20
- 수리량: 100
- 수리 재료: 나무
- 연료값: 중간 연료 ×2

## oar
- 피해량: 17 (기본 공격력의 50%)
- 내구도: 500회
- 조력: 0.3
- 최대 속도 기여: 2
- 공격 마모: 25
- 실패 마모: 25
- 연료 유형: 나무 (중간 연료)

## oar_driftwood
- 피해량: 17 (기본 공격력의 50%)
- 내구도: 400회
- 조력: 0.5
- 최대 속도 기여: 3.5
- 공격 마모: 25
- 실패 마모: 25
- 방수: 있음
- 연료 유형: 나무 (중간 연료)

## balloonvest
- 장착 슬롯: 몸통
- 부양 장치: 물에 빠질 때 자동 팽창 방지
- 연료 유형: 마법
- 연료량: 480초 (1일)
- 사용:
  - 장착 중 소모됨
  - 피격 시 팽창하며 파괴
  - 익사 피해 방지

## anchor_item
- 유형: 배 부속품 키트
- 드래그: 2
- 최대 속도 계수: 0.15
- 돛 힘 감쇠: 0.8
- 해머 횟수: 3회
- 연료값: 대형 연료

## steeringwheel_item
- 유형: 배 부속품 키트
- 배치 간격: 중간
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 배 방향 조종 가능

## boat_rotator_kit
- 유형: 배 부속품 키트
- 배치 간격: 좁은
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 배를 자동으로 회전/방향 보정

## mast_item
- 유형: 배 부속품 키트
- 최대 속도 기여: 2.5
- 돛 힘: 0.6
- 방향타 회전 드래그: 0.23
- 업그레이드: 갑판 조명, 번개 전도체 장착 가능
- 해머 횟수: 3회
- 연료값: 대형 연료

## mast_malbatross_item
- 유형: 배 부속품 키트
- 최대 속도 기여: 4
- 돛 힘: 1.3
- 방향타 회전 드래그: 0.23
- 업그레이드: 갑판 조명, 번개 전도체 장착 가능
- 해머 횟수: 3회
- 연료값: 대형 연료

## boat_bumper_kelp_kit
- 유형: 배 부속품 키트 (가장자리 배치)
- 체력: 20
- 수리 재료: 다시마
- 전리품: 다시마 × 최대 2개 (체력 비례)

## boat_bumper_shell_kit
- 유형: 배 부속품 키트 (가장자리 배치)
- 체력: 40
- 수리 재료: 조개껍데기
- 전리품: 달팽이거북 껍데기 조각 × 최대 2개 (체력 비례)

## boat_cannon_kit
- 유형: 배 부속품 키트
- 사거리: ~20
- 조준 각도: ±45°
- 해머 횟수: 4회
- 연료값: 대형 연료
- 사용:
  - 포탄 장전 후 발사

## cannonball_rock_item
- 스택: 20
- 직격 피해: 200
- 광역 피해: 120 (직격의 60%)
- 광역 반경: 3
- 충돌 반경: 0.5
- 발사 속도: 20
- 중력: -40

## ocean_trawler_kit
- 유형: 수상 구조물 키트
- 배치 간격: 중간
- 부패율 감소: 1/3 (물고기 부패 속도 감소)
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 바다에 내려 시간이 지나면 물고기/해산물 수집
  - 보관함 포함

## mastupgrade_lamp_item
- 유형: 돛대 업그레이드 아이템
- 연료 유형: 불
- 연료량: 360초
- 사용:
  - 돛대에 장착하여 야간 조명 제공
  - 연료 소진 시 꺼짐

## mastupgrade_lightningrod_item
- 유형: 돛대 업그레이드 아이템
- 사용:
  - 돛대에 장착하여 번개 방어
  - 충전 후 1 사이클 동안 유지, 방전 후 재충전

## fish_box
- 유형: 구조물 (배 또는 부두 위 배치)
- 부패율 감소: 1/3 (물고기 부패 속도 감소)
- 해머 횟수: 2회
- 사용:
  - 물고기 보관 가능
  - 해머 파괴 시 살아있는 물고기 방류

## winch
- 유형: 구조물
- 내리기 속도: 2
- 올리기 속도 (빈 상태): 1.8
- 올리기 속도 (물건 있을 때): 1.1
- 보트 드래그 지속시간: 1초
- 해머 횟수: 3회
- 사용:
  - 바다 밑의 침몰 아이템 인양
  - 무거운 물체를 배 위에서 인양

## waterpump
- 유형: 구조물
- 사거리: 7.5
- 해머 횟수: 3회
- 사용:
  - 장시간 사용 동작
  - 주변 불에 물 발사하여 진화

## boat_magnet_kit
- 유형: 배 부속품 키트
- 페어링 반경: 24
- 최대 거리: 48
- 추진력: 0.6
- 최대 속도 기여: 2.5
- 배치 간격: 중간
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 자동항법 신호기와 페어링하여 자동 추진

## boat_magnet_beacon
- 유형: 구조물 (지상/해안 설치)
- 해머 횟수: 3회
- 사용:
  - 자동항법기와 페어링하여 배가 신호기를 향해 자동 이동

## flotationcushion
- 장착 슬롯: 없음 (인벤토리 보유)
- 사용:
  - 물에 빠질 때 자동 부양

## dock_kit
- 스택: 20
- 배치 조건: 해안 타일 + 인접 육지
- 사용:
  - 해안에 부두 타일 생성
  - 부두 연결 시스템에 등록

## dock_woodposts_item
- 스택: 20
- 배치 간격: 좁은
- 해머 횟수: 3회
- 전리품: 통나무 × 1
- 사용:
  - 부두 가장자리에 장식/방어용 말뚝 설치

## wagpunk_floor_kit
- 스택: 20
- 배치 조건: 왜그스태프 아레나 내 해양 타일
- 사용:
  - 아레나 내 해양 타일에 특수 바닥 생성
  - 특수 이벤트(왜그스태프 보스) 관련 구조물

## chesspiece_anchor_sketch
- 유형: 도면
- 사용:
  - 대리석/석재/달빛 유리로 닻 조각상 제작 가능
  - 체스 조각 도면 시스템 공유

## beeswax_spray
- 타입: 장착도구
- usage:
  - 사용 횟수 75
  - 식물 밀랍 코팅 (시듦 방지)

## gelblob_storage_kit
- 타입: 구조물
- usage:
  - 해머 4회
  - 음식 1슬롯 부패 정지

## saddle_shadow
- 타입: 장비
- usage:
  - 내구도 12
  - 이동속도 ×1.45
  - 흡수 60%
  - 차원 방어 15
  - 차원 공격 18
  - 그림자 저항 90%

## shadow_beef_bell
- 타입: 아이템
- usage:
  - 비팔로 연결
  - 죽은 비팔로 부활 (HP -50% + 정신력 -100, 쿨 15일)

## voidcloth_kit
- 타입: 수리키트
- usage:
  - 공허천 재질 수리키트

## bundlewrap
- 타입: 소모품
- 스택: 20
- 사용: 4슬롯 번들 생성
- 연료: 45초

## candybag
- 타입: 가방 (몸통 슬롯)
- 슬롯: 14
- 특수: 핼러윈 아이템 전용 수납

## chestupgrade_stacksize
- 타입: 상자 업그레이드
- 효과: 설치된 상자 무한 스택 허용

## dragonflychest
- 타입: 구조물
- 슬롯: 12
- 특수: 소각 불가
- 업그레이드: 가능
- 해머: 2회

## fish_box
- 타입: 구조물
- 슬롯: 20
- 수납: 해양 생물 전용
- 부패: 역방향 (-1/3배 속도)
- 해머: 2회

## giftwrap
- 타입: 소모품
- 스택: 20
- 사용: 4슬롯 선물 번들 생성
- 연료: 극소량

## icebox
- 타입: 구조물
- 슬롯: 9
- 부패: 50% 속도 (유통기한 2배)
- 해머: 2회

## saltbox
- 타입: 구조물
- 슬롯: 9
- 부패: 25% 속도 (유통기한 4배)
- 해머: 2회

## treasurechest
- 타입: 구조물
- 슬롯: 9
- 업그레이드: 가능
- 해머: 2회

## pighouse
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 돼지 1마리 스폰, 리스폰 시간 4일
  - 밤에 돼지가 집 안에 있으면 조명 방출 (반경 1, 강도 0.5)
- 가연성: 예

## rabbithouse
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 토끼인간 1마리 스폰, 리스폰 시간 1일
  - 토끼인간은 밤에 나옴 (돼지와 반대)
- 가연성: 예

## scarecrow
- 타입: 구조물
- 해머 횟수: 6회
- usage:
  - 근처 까마귀 퇴치
  - 캐릭터 스킨 변경 가능
- 가연성: 예

## punchingbag
- 타입: 구조물
- 해머 횟수: 6회
- HP: 10009 (즉각 회복)
- usage:
  - 데미지 테스트용 (최대 9999 표시)
  - 머리/몸통 장비 장착 가능
- 가연성: 예

## fence_electric_item
- 타입: 벽 (배치형)
- 설치 시 HP: 1 (모든 피해 흡수)
- 해머 횟수: 3회
- usage:
  - 최대 연결 수: 2개, 연결 범위: 10
  - 연결 시 전기 울타리 형성, 접촉한 적 감전
- 해머 전리품: 와그펑크 부품, 달유리

## portabletent_item
- 타입: 인벤토리 아이템 (배치형)
- uses: 10
- usage:
  - 수면 시: 체력 +2/틱, 배고픔 -1/틱, 목표 체온 40도
  - 설치/회수 가능 (잔여 내구도 유지)
- 가연성: 예

## houndwhistle
- 타입: 인벤토리 아이템
- uses: 10
- usage:
  - 반경 25 내 사냥개/바르그 길들이기 (달 정렬 제외)
  - 충성 지속 40초
  - 최대 추종 수: 5

## meatrack_hermit_multi
- 타입: 구조물
- 해머 횟수: 4회
- 컨테이너: 9칸
- usage:
  - 고기/생선/다시마 건조 (일반 건조대 3칸의 3배)
  - 소금 수집 기능
- 가연성: 예

## archive_resonator_item
- 타입: 인벤토리 아이템 (배치형)
- uses: 10
- usage:
  - 달 제단 표지/유물/대게왕 탐색
  - 반경 4 내 표지 발견 시 드릴로 유물 생산
  - 원거리 대상에 빔 포인터 생성

## rope_bridge_kit
- 타입: 인벤토리 아이템
- 스택: 10
- usage:
  - 물 위에 다리 설치 (최대 6타일)
  - 길이에 따라 복수 키트 필요
- 가연성: 예

## support_pillar_scaffold
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 지진 방지 (범위 40)
  - 재료 투입으로 보강 (레벨 0~3: 0/10/20/40개)
  - 보강 완료 시 추가 10레벨 버퍼

## support_pillar_dreadstone_scaffold
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 지진 방지 (범위 40)
  - 자동 재생 (2일 주기)
  - 정신력 오라: 반경 8 내 중간 정신력 감소 (지수 감쇠)

## moon_device_construction1
- 타입: 구조물 (건설 단계)
- usage:
  - 천체 제단 건설 3단계 중 1단계
  - 3단계 완료 시 9.5초 후 천체 수호자 소환
  - 건설 중 그림자 운석 출현

## table_winters_feast
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 축제 음식 배치 가능 (1칸)
  - 탁자 범위 3.5, 축제 범위 8
  - 주변 캐릭터에게 축제 버프 (체력/배고픔/정신력 회복)

## nightcaphat
- 타입: 모자 (인벤토리 아이템)
- usage:
  - 수면 시 정신력 회복 30% 증가
  - 침낭/텐트/시에스타 수면 효과 향상

## perdfan
- 타입: 인벤토리 아이템
- uses: 9
- usage:
  - 부채질(일반): 1회 소모, 반경 7 내 불/훈소 소화, 대상 체온 최저 2.5도까지 냉각 (최대 -50도 감소)
  - 회오리 소환(채널링): 추가 2회 소모 (총 3회), 잔여 3회 이상 필요, 지속 2초
  - 총 사용: 부채질만 9회, 또는 회오리 3회 + 부채질 0회

## cattoy_mouse
- 타입: 인벤토리 아이템
- usage:
  - 고양이 장난감

## mapscroll
- 타입: 인벤토리 아이템
- usage:
  - 제작자의 탐사 지도를 기록
  - 다른 플레이어에게 지도 정보 전달 가능
- 가연성: 예

## miniboatlantern
- 타입: 인벤토리 아이템 (수면 배치)
- fuel: 2880초 (6일, 마법 연료 타입, 재충전 불가)
- usage:
  - 수면 위에서 자율 이동하는 조명 (반경 1.2, 강도 0.8)
  - 이동 속도 0.4
  - 연료 소진 시 풍선 분리

## floatinglantern
- 타입: 인벤토리 아이템
- fuel: 960초 (2일, 마법 연료 타입, 재충전 불가)
- usage:
  - 배치 시 하늘로 상승하는 조명
  - 연료에 따라 4단계 높이 (12/9/6/2)
  - 비/달우박 시 연료 소모 가속
  - 비행 중 전역 미니맵 아이콘 표시

## redlantern
- 타입: 인벤토리 아이템 (손 장비)
- fuel: 5760초 (12일, 마법 연료 타입, 재충전 불가)
- usage:
  - 손에 장착하는 조명 (반경 1.2, 강도 0.8, 붉은색)
  - 비 올 때 연료 소모 25% 가속
- 가연성: 예

## firecrackers
- 타입: 소모품
- 스택: 40
- usage:
  - 점화 시 반경 10 내 놀래킬 수 있는 개체를 놀래킴
  - 폭발 횟수: 스택 크기에 비례

## ticoon_builder
- 타입: 소모품 (사용 시 소멸)
- usage:
  - 사용 시 호쿤(길잡이 고양이) 소환
  - 호쿤은 아직 발견하지 않은 킷쿤 위치로 안내

## boards_bunch
- 타입: 인벤토리 아이템
- usage:
  - 판자 5개 묶음 — 건설 시 재료 일괄 투입용
  - 사용 시 판자 5개로 분리

## cutstone_bunch
- 타입: 인벤토리 아이템
- usage:
  - 석재 5개 묶음 — 건설 시 재료 일괄 투입용
  - 사용 시 석재 5개로 분리

## winona_battery_low_item
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 설치 시 위노나의 발전기 배치
  - 화학 연료(초석) 사용, 최대 연료 180초 (소모율 0.375 → 실효 1일)
  - 회로 범위: 6.6

## winona_battery_high_item
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 설치 시 위노나의 고급 발전기 배치
  - 마법 연료(보석) 사용, 최대 연료 2880초 (6일분)
  - 회로 범위: 6.6

## winona_spotlight_item
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 설치 시 위노나의 조명기 배치
  - 빛 반경 ~4.3, 최소 범위 5.4, 최대 범위 24
  - 전력 소모: 작동 시 0.5, 대기 시 0.05

## handpillow_petals
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 1.0, 경직: 0.75

## handpillow_kelp
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 1.4, 경직: 0.60

## handpillow_beefalowool
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 1.8, 경직: 0.40

## handpillow_steelwool
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 2.2, 경직: 0.20

## bodypillow_petals
- 타입: 몸통 장비
- usage:
  - 피해 감소: 10%

## bodypillow_kelp
- 타입: 몸통 장비
- usage:
  - 피해 감소: 30%

## bodypillow_beefalowool
- 타입: 몸통 장비
- usage:
  - 피해 감소: 50%

## bodypillow_steelwool
- 타입: 몸통 장비
- usage:
  - 피해 감소: 70%

## chesspiece_anchor_builder
- 체육 무게: 3

## chesspiece_antlion_builder
- 체육 무게: 4

## chesspiece_bearger_builder
- 체육 무게: 4

## chesspiece_bearger_mutated_builder
- 체육 무게: 4

## chesspiece_beefalo_builder
- 체육 무게: 3

## chesspiece_beequeen_builder
- 체육 무게: 4

## chesspiece_bishop_builder
- 체육 무게: 3
- usage: 보름달/초승달 활성화 (그림자 비숍 소환 가능)

## chesspiece_butterfly_builder
- 체육 무게: 3

## chesspiece_carrat_builder
- 체육 무게: 3

## chesspiece_catcoon_builder
- 체육 무게: 3

## chesspiece_clayhound_builder
- 체육 무게: 3

## chesspiece_claywarg_builder
- 체육 무게: 3

## chesspiece_crabking_builder
- 체육 무게: 4

## chesspiece_daywalker_builder
- 체육 무게: 4

## chesspiece_daywalker2_builder
- 체육 무게: 4

## chesspiece_deerclops_builder
- 체육 무게: 4

## chesspiece_deerclops_mutated_builder
- 체육 무게: 4

## chesspiece_dragonfly_builder
- 체육 무게: 4

## chesspiece_eyeofterror_builder
- 체육 무게: 4

## chesspiece_formal_builder
- 체육 무게: 3

## chesspiece_guardianphase3_builder
- 체육 무게: 4

## chesspiece_kitcoon_builder
- 체육 무게: 3

## chesspiece_klaus_builder
- 체육 무게: 4

## chesspiece_knight_builder
- 체육 무게: 3
- usage: 보름달/초승달 활성화 (그림자 나이트 소환 가능)

## chesspiece_malbatross_builder
- 체육 무게: 4

## chesspiece_manrabbit_builder
- 체육 무게: 3

## chesspiece_minotaur_builder
- 체육 무게: 4

## chesspiece_moon_builder
- 체육 무게: 3

## chesspiece_moosegoose_builder
- 체육 무게: 4

## chesspiece_muse_builder
- 체육 무게: 3

## chesspiece_pawn_builder
- 체육 무게: 3

## chesspiece_rook_builder
- 체육 무게: 3
- usage: 보름달/초승달 활성화 (그림자 룩 소환 가능)

## chesspiece_sharkboi_builder
- 체육 무게: 4

## chesspiece_stalker_builder
- 체육 무게: 4

## chesspiece_toadstool_builder
- 체육 무게: 4

## chesspiece_twinsofterror_builder
- 체육 무게: 4

## chesspiece_wagboss_lunar_builder
- 체육 무게: 4

## chesspiece_wagboss_robot_builder
- 체육 무게: 4

## chesspiece_warg_mutated_builder
- 체육 무게: 4

## chesspiece_wormboss_builder
- 체육 무게: 4

## chesspiece_yotd_builder
- 체육 무게: 3

## chesspiece_yoth_builder
- 체육 무게: 3

## chesspiece_yots_builder
- 체육 무게: 3

## carnival_gametoken
- 타입: 인벤토리 아이템 (이벤트 화폐)
- 스택: 1

## carnival_gametoken_multiple
- 타입: 인벤토리 아이템 (이벤트 화폐)

## carnival_plaza_kit
- 타입: 구조물 (배치형)
- usage:
  - 까악제 이벤트 중심 나무

## carnival_popcorn
- 타입: 소모품
- 스택: 40

## carnival_prizebooth_kit
- 타입: 구조물 (배치형)
- 해머 횟수: 1회
- usage:
  - 까악제 경품 교환

## carnival_seedpacket
- 타입: 소모품
- 스택: 40

## carnival_vest_a
- 타입: 몸통 장비
- dapperness: +0.042/s
- 여름 단열: 120
- fuel: 2400초 (5일, 사용 연료 타입)

## carnival_vest_b
- 타입: 몸통 장비
- dapperness: +0.042/s
- 여름 단열: 240
- fuel: 2400초 (5일, 사용 연료 타입)

## carnival_vest_c
- 타입: 몸통 장비
- dapperness: +0.042/s
- 여름 단열: 240
- fuel: 2400초 (5일, 사용 연료 타입)

## carnivalcannon_confetti_kit
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivalcannon_sparkle_kit
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivalcannon_streamer_kit
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivaldecor_banner_kit
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivaldecor_eggride1_kit
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회
- usage:
  - 활성화 시간: 30초, 토큰 시간: 2400초

## carnivaldecor_eggride2_kit
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회

## carnivaldecor_eggride3_kit
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회

## carnivaldecor_eggride4_kit
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회

## carnivaldecor_figure_kit
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivaldecor_figure_kit_season2
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivaldecor_lamp_kit
- 타입: 구조물 (배치형, 이벤트 조명)
- 해머 횟수: 1회
- usage:
  - 활성화 시간: 60초, 토큰 시간: 480초

## carnivaldecor_plant_kit
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회

## carnivalfood_corntea
- 타입: 소모품
- 스택: 40
- 포만도: 9.375
- 체력: 0
- 정신력: +5
- 온도: -40, 15초간 (냉각 음료)
- 유통기한: 1440초 (3일)

## carnivalgame_feedchicks_kit
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회

## carnivalgame_herding_kit
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회

## carnivalgame_memory_kit
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회

## carnivalgame_puckdrop_kit
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회

## carnivalgame_shooting_kit
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회

## carnivalgame_wheelspin_kit
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회

## wintercooking_berrysauce
- 타입: 겨울 축제 음식

## wintercooking_bibingka
- 타입: 겨울 축제 음식

## wintercooking_cabbagerolls
- 타입: 겨울 축제 음식

## wintercooking_festivefish
- 타입: 겨울 축제 음식

## wintercooking_gravy
- 타입: 겨울 축제 음식

## wintercooking_latkes
- 타입: 겨울 축제 음식

## wintercooking_lutefisk
- 타입: 겨울 축제 음식

## wintercooking_mulleddrink
- 타입: 겨울 축제 음식

## wintercooking_panettone
- 타입: 겨울 축제 음식

## wintercooking_pavlova
- 타입: 겨울 축제 음식

## wintercooking_pickledherring
- 타입: 겨울 축제 음식

## wintercooking_polishcookie
- 타입: 겨울 축제 음식

## wintercooking_pumpkinpie
- 타입: 겨울 축제 음식

## wintercooking_roastturkey
- 타입: 겨울 축제 음식

## wintercooking_stuffing
- 타입: 겨울 축제 음식

## wintercooking_sweetpotato
- 타입: 겨울 축제 음식

## wintercooking_tamales
- 타입: 겨울 축제 음식

## wintercooking_tourtiere
- 타입: 겨울 축제 음식

## halloween_experiment_bravery
- 타입: 소모품 (이벤트)

## halloween_experiment_health
- 타입: 소모품 (이벤트)

## halloween_experiment_moon
- 타입: 소모품 (이벤트)

## halloween_experiment_root
- 타입: 소모품 (이벤트)

## halloween_experiment_sanity
- 타입: 소모품 (이벤트)

## halloween_experiment_volatile
- 타입: 소모품 (이벤트)

## yotb_pattern_fragment_1
- 타입: 인벤토리 아이템 (제작 재료)

## yotb_pattern_fragment_2
- 타입: 인벤토리 아이템 (제작 재료)

## yotb_pattern_fragment_3
- 타입: 인벤토리 아이템 (제작 재료)

## yotb_post_item
- 타입: 구조물 (배치형, 이벤트)
- 해머 횟수: 4회

## yotb_sewingmachine_item
- 타입: 구조물 (배치형, 이벤트)
- 해머 횟수: 4회
- usage:
  - 비팔로 의상 제작용 컨테이너

## yotb_stage_item
- 타입: 구조물 (배치형, 이벤트)
- 해머 횟수: 4회
- usage:
  - 비팔로 미인대회 심사용

## yotc_carrat_gym_direction_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 방향감각 훈련

## yotc_carrat_gym_reaction_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 반응속도 훈련

## yotc_carrat_gym_speed_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 속도 훈련

## yotc_carrat_gym_stamina_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 체력 훈련

## yotc_carrat_race_checkpoint_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 경주 체크포인트

## yotc_carrat_race_finish_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 경주 결승선

## yotc_carrat_race_start_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 경주 출발점

## yotc_carrat_scale_item
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 능력치 측정

## yotc_seedpacket
- 타입: 소모품 (이벤트)

## yotc_seedpacket_rare
- 타입: 소모품 (이벤트)

## yotc_shrinecarrat
- 타입: 구조물 (이벤트)

## dragonboat_kit
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 용파리선 배치: HP 200, 반경 3.0

## dragonboat_pack
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 장비 포함 용파리선 일괄 배치

## dragonheadhat
- 타입: 모자 (머리 장비)
- fuel: 480초 (1일, 사용 연료 타입, 춤 동작 중만 소모)
- usage:
  - 용춤 3인 세트의 머리 부분
  - 3인 세트 완성 시 dapperness 최대 +0.069/s

## dragonbodyhat
- 타입: 모자 (머리 장비)
- fuel: 480초 (1일, 사용 연료 타입, 춤 동작 중만 소모)
- usage:
  - 용춤 3인 세트의 몸통 부분

## dragontailhat
- 타입: 모자 (머리 장비)
- fuel: 480초 (1일, 사용 연료 타입, 춤 동작 중만 소모)
- usage:
  - 용춤 3인 세트의 꼬리 부분

## mast_yotd_item
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 돛 설치

## mastupgrade_lamp_item_yotd
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 돛 조명 업그레이드

## boat_bumper_yotd_kit
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 범퍼

## boatrace_checkpoint_throwable_deploykit
- 타입: 인벤토리 아이템 (투척 배치형)
- usage: 용선 경주 체크포인트 설치

## boatrace_seastack_throwable_deploykit
- 타입: 인벤토리 아이템 (투척 배치형)
- usage: 용선 경주 부표 설치

## boatrace_start_throwable_deploykit
- 타입: 인벤토리 아이템 (투척 배치형)
- usage: 용선 경주 출발 탑 설치

## yotd_anchor_item
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 닻

## yotd_boatpatch_proxy
- 타입: 인벤토리 아이템
- usage: 용파리선 수리용

## yotd_oar
- 타입: 인벤토리 아이템 (손 장비)
- usage: 용파리선 전용 노

## yotd_steeringwheel_item
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 타륜

## yoth_chair_rocking_item
- 타입: 인벤토리 아이템 (배치형)
- usage: 흔들목마 구조물 설치 (앉기 가능)

## yoth_knightstick
- 타입: 손 장비
- damage: 17
- fuel: 2880초 (6일, 사용 연료 타입, 걷기 중 소모)
- speed_mult: 1.15~1.60 (질주 시 가속)
- usage:
  - 질주 시 배고픔 소모율 33% 증가
  - 최대 질주 횟수: 30

## yotp_food1
- 타입: 소모품
- 스택: 40
- 체력: +12
- 포만도: 150
- 정신력: +5
- 유통기한: 7200초 (15일)

## yotp_food2
- 타입: 소모품
- 스택: 40
- 체력: 0
- 포만도: 150
- 정신력: 0
- 유통기한: 없음

## yotp_food3
- 타입: 소모품
- 스택: 40
- 체력: +6
- 포만도: 75
- 정신력: +1
- 유통기한: 7200초 (15일)

## yotr_decor_1_item
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage: 이벤트 장식 조명

## yotr_decor_2_item
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage: 이벤트 장식 조명

## yotr_fightring_kit
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 베개 싸움 미니게임 활성화
  - 최대 상품: 10개

## yotr_food1
- 타입: 소모품
- 스택: 40
- 체력: +15
- 포만도: 75
- 정신력: +8.25
- 유통기한: 7200초 (15일)

## yotr_food2
- 타입: 소모품
- 스택: 40
- 체력: +60
- 포만도: 18.75
- 정신력: +8.25
- 유통기한: 7200초 (15일)

## yotr_food3
- 타입: 소모품
- 스택: 40
- 체력: +15
- 포만도: 18.75
- 정신력: +33
- 유통기한: 7200초 (15일)

## yotr_food4
- 타입: 소모품
- 스택: 40
- 체력: +30
- 포만도: 37.5
- 정신력: +16.5
- 유통기한: 7200초 (15일)

## yotr_token
- 타입: 인벤토리 아이템 (이벤트 토큰)
- usage: 베개 싸움 도전용

## yots_lantern_post_item
- 타입: 구조물 (배치형)
- usage:
  - 이벤트 가로등 — 최대 연료 960초 (2일)

## hermitcrab_lightpost
- 타입: 구조물
- usage: 은둔자 섬 가로등

## hermitcrab_relocation_kit
- 타입: 인벤토리 아이템
- usage: 은둔게의 집 이전용

## hermitcrab_teashop
- 타입: 구조물
- usage: 진주의 찻집 건설

## hermithotspring_constr
- 타입: 구조물 (건설)
- usage: 은둔자 섬 온천 건설

## hermithouse_ornament
- 타입: 인벤토리 아이템
- usage: 은둔자 집 장식

## hermitshop_chum
- 타입: 구매 아이템

## hermitshop_chum_blueprint
- 타입: 구매 아이템 (청사진)

## hermitshop_hermit_bundle_shells
- 타입: 구매 아이템

## hermitshop_oceanfishingbobber_canary
- 타입: 구매 아이템 (낚시 찌)

## hermitshop_oceanfishingbobber_crow
- 타입: 구매 아이템 (낚시 찌)

## hermitshop_oceanfishingbobber_goose
- 타입: 구매 아이템 (낚시 찌)

## hermitshop_oceanfishingbobber_malbatross
- 타입: 구매 아이템 (낚시 찌)

## hermitshop_oceanfishingbobber_robin
- 타입: 구매 아이템 (낚시 찌)

## hermitshop_oceanfishingbobber_robin_winter
- 타입: 구매 아이템 (낚시 찌)

## hermitshop_oceanfishinglure_hermit_drowsy
- 타입: 구매 아이템 (낚시 루어)

## hermitshop_oceanfishinglure_hermit_heavy
- 타입: 구매 아이템 (낚시 루어)

## hermitshop_oceanfishinglure_hermit_rain
- 타입: 구매 아이템 (낚시 루어)

## hermitshop_oceanfishinglure_hermit_snow
- 타입: 구매 아이템 (낚시 루어)

## hermitshop_supertacklecontainer
- 타입: 구매 아이템 (낚시 도구함)

## hermitshop_tacklecontainer
- 타입: 구매 아이템 (낚시 도구함)

## hermitshop_turf_shellbeach_blueprint
- 타입: 구매 아이템 (청사진)

## hermitshop_winch_blueprint
- 타입: 구매 아이템 (청사진)

## hermitshop_winter_ornament_boss_hermithouse
- 타입: 구매 아이템 (겨울 장식)

## hermitshop_winter_ornament_boss_pearl
- 타입: 구매 아이템 (겨울 장식)

## shellweaver
- 타입: 구조물 (프로토타이퍼)
- 해머 횟수: 3회
- usage:
  - 엽합기 테크 레벨 1/2 해금
  - 조리 기능 (6초)

## shellweaver_desiccant
- 타입: 인벤토리 아이템

## shellweaver_desiccantboosted
- 타입: 인벤토리 아이템

## shellweaver_hermitcrab_shell
- 타입: 인벤토리 아이템

## shellweaver_icestaff2
- 타입: 인벤토리 아이템 (무기)

## shellweaver_icestaff3
- 타입: 인벤토리 아이템 (무기)

## shellweaver_messagebottleempty
- 타입: 인벤토리 아이템

## shellweaver_nonslipgrit
- 타입: 인벤토리 아이템

## shellweaver_nonslipgritboosted
- 타입: 인벤토리 아이템

## shellweaver_salty_doghat
- 타입: 모자 (머리 장비)

## wanderingtradershop_bluegem
- 타입: 구매 아이템

## wanderingtradershop_cutgrass
- 타입: 구매 아이템

## wanderingtradershop_cutreeds
- 타입: 구매 아이템

## wanderingtradershop_flint
- 타입: 구매 아이템

## wanderingtradershop_gears
- 타입: 구매 아이템

## wanderingtradershop_livinglog
- 타입: 구매 아이템

## wanderingtradershop_moonglass
- 타입: 구매 아이템

## wanderingtradershop_pigskin
- 타입: 구매 아이템

## wanderingtradershop_redgem
- 타입: 구매 아이템

## wanderingtradershop_twigs
- 타입: 구매 아이템

## rabbitkingshop_armor_carrotlure
- 타입: 구매 아이템 (몸통 장비)

## rabbitkingshop_hat_rabbit
- 타입: 구매 아이템 (모자)

## rabbitkingshop_rabbitkinghorn
- 타입: 구매 아이템

## wagboss_robot_constructionsite_kit
- 타입: 인벤토리 아이템 (배치형)
- usage: W.A.R.B.O.T. 건설 기지 설치

## wagboss_robot_creation_parts
- 타입: 인벤토리 아이템 (건설 재료)
- usage: W.A.R.B.O.T. 건설에 필요한 부품

## wagpunk_workstation_blueprint_moon_device_construction1
- 타입: 구매 아이템 (청사진)
- usage: 와그펑크 워크스테이션에서 미완의 실험 제작법 해금

## wagpunk_workstation_blueprint_moonstorm_goggleshat
- 타입: 구매 아이템 (청사진)
- usage: 와그펑크 워크스테이션에서 우주 고글 제작법 해금

## wagpunk_workstation_moonstorm_static_catcher
- 타입: 인벤토리 아이템
- usage: 달폭풍 이벤트 관련 장비

## wagpunk_workstation_security_pulse_cage
- 타입: 인벤토리 아이템
- usage: 달폭풍 이벤트 관련 장비

## kitcoon_nametag
- 타입: 인벤토리 아이템 (1회용)
- usage:
  - 킷쿤에게 이름 부여 (사용 후 소멸)

## kitcoondecor1_kit
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 킷쿤 장난감 — 킷쿤이 놀이
- 가연성: 예

## kitcoondecor2_kit
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 킷쿤 장난감 — 킷쿤이 놀이
- 가연성: 예

## kitcoonden_kit
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 킷쿤 보육원 — 숨바꼭질 미니게임 (킷쿤 3마리 이상, 60초 제한, 반경 30)
- 가연성: 예

## coldfire
- 타입: 구조물
- usage:
  - 연료 270초
  - 화학 연료
  - 비 올 때 연료 소모 가속 (최대 강수 시 3.5배 소모)
  - 냉각 화염

## coldfirepit
- 타입: 구조물
- usage:
  - 해머 4회
  - 연료 360초
  - 화학 연료
  - 연료 보너스 배율 2배

## firesuppressor
- 타입: 구조물
- usage:
  - 해머 4회
  - 연료 2400초 (5일)
  - 감지 범위 15
  - 자동 진화
  - 냉각

## siestahut
- 타입: 구조물
- usage:
  - 해머 4회
  - 사용 횟수 15
  - 낮 수면 전용
  - 냉각 모드
  - HP +2/초, 허기 -0.33/초

## plantregistryhat
- 타입: 모자
- usage:
  - 식물 정보 확인
  - 여름 단열 60
  - 영구 사용
  - 방수 없음

## turf_dragonfly
- 타입: 바닥재
- 스택: 20
- usage:
  - 화재 확산 불가

## axe
- damage: 27.2
- uses: 100

## goldenaxe
- damage: 27.2
- uses: 100 (작업 소모 1/4 = 실질 400회 벌목, 공격 소모도 1/4)

## pickaxe
- uses: 33

## goldenpickaxe
- uses: 33 (작업 소모 1/4 = 실질 132회 채광)

## shovel
- uses: 25

## goldenshovel
- uses: 25 (작업 소모 1/4 = 실질 100회)

## hammer
- damage: 17
- uses: 75
- usage:
  - 구조물 해체 (50% 재료 회수)

## pitchfork
- damage: 17
- uses: 25 (작업 소모 0.125/회 = 실질 200회 바닥 작업)

## goldenpitchfork
- damage: 17
- uses: 25 (작업 소모 0.03125/회 = 실질 800회 바닥 작업)

## razor
- uses: 무한
- usage:
  - 비팔로/수염 면도용

## farm_hoe
- damage: 17
- uses: 25

## golden_farm_hoe
- damage: 17
- uses: 25 (작업 소모 1/4 = 실질 100회)

## moonglassaxe
- damage: 34
- uses: 100 (벌목 효율 2.5배, 벌목 소모 1.25/회 = 실질 80회 벌목, 공격 소모 2/회 = 실질 50회 공격)
- usage:
  - 그림자 적 25% 추가 피해 (42.5)
  - 그림자 적 공격 시 내구도 소모 절반

## multitool_axe_pickaxe
- damage: 42.5
- uses: 800 (작업 효율 4/3배)
- usage:
  - 도끼 + 곡괭이 겸용
  - 그림자 레벨 1

## pickaxe_lunarplant
- damage: 32.5
- planar_damage: 10
- uses: 600 (채광 효율 4/3배)
- usage:
  - 그림자 적 10% 추가 피해
  - `[세트]` 빛말풀 세트 보너스 시 피해 10% 증가 + 차원 피해 +5
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)

## shovel_lunarplant
- damage: 17.2
- planar_damage: 10
- uses: 250
- usage:
  - 삽 + 괭이 겸용
  - 그림자 적 10% 추가 피해
  - `[세트]` 빛말풀 세트 보너스 시 피해 10% 증가 + 차원 피해 +5
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)

## voidcloth_scythe
- damage: 38
- planar_damage: 18
- uses: 200
- dapperness: -0.0347/초 (분당 -2.08)
- usage:
  - 범위 수확 (반경 4, 각도 165도)
  - 장착 시 정신력 지속 감소 (분당 -2.08)
  - 달 진영 10% 추가 피해
  - 그림자 레벨 3
  - `[세트]` 공허천 세트 보너스 시 피해 10% 증가 (41.8) + 차원 피해 +5
  - `[수리]` 공허천 수리 키트로 수리 (내구도 100% 복구)
  - 말을 함 (대사 있음)

## cane
- damage: 17
- speed_mult: 1.25 (이동속도 25% 증가)

## walking_stick
- speed_mult: 1.15 (이동속도 15% 증가)
- perish_time: 1920 (4일)
- usage:
  - 시간 경과로 부패

## bugnet
- damage: 4.25
- uses: 10 (포획 1/회, 공격 3/회)

## thulecitebugnet
- damage: 4.25
- uses: 100 (포획 1/회, 공격 3/회)

## birdtrap
- uses: 8

## trap
- uses: 8

## fishingrod
- damage: 4.25
- uses: 9 (낚시 1/회, 공격 4/회)

## oceanfishingrod
- usage:
  - 바다 낚시 전용 (루어/태클 장착 가능)

## brush
- damage: 27.2
- uses: 75 (빗질 1/회, 공격 3/회)
- usage:
  - 비팔로 빗질용 (길들이기 관련)

## compass
- damage: 10
- fuel_time: 1920 (4일)
- usage:
  - 방향 표시
  - 공격 시 내구도 30% 감소

## pocket_scale
- usage:
  - 물고기 무게 측정

## featherpencil
- 스택: 20
- usage:
  - 지도 마킹용

## sentryward
- usage:
  - 설치 시 미니맵 영역 공개

## sewing_kit
- uses: 5
- usage:
  - 의류/갑옷 내구도 수리 (수리량 2400)

## sewing_tape
- 스택: 40
- usage:
  - 의류/갑옷 내구도 수리 (수리량 2400)

## reskin_tool
- usage:
  - 아이템 스킨 변경

## wagpunkbits_kit
- 스택: 10
- usage:
  - `[수리]` 와.비.스. 장비 전용 수리 키트 (내구도 100% 복구)

## wateringcan
- uses: 40 (물 채운 후)
- usage:
  - 농작물 물주기 (물량 25)
  - 불 끄기 + 온도 -5

## premiumwateringcan
- uses: 160 (물 채운 후)
- usage:
  - 농작물 물주기 (물량 25)
  - 업그레이드 물뿌리개 (4배 내구도)

## miniflare
- usage:
  - 사용 시 15초간 광원 + 미니맵 표시 (반경 30)

## megaflare
- usage:
  - 사용 시 광원 + 적대 몹 유인 (디어클롭스 60%, 해적 60%, 바다코끼리 60% 확률)

## beef_bell
- usage:
  - 비팔로 길들이기/호출용

## saddlehorn
- damage: 17
- uses: 10 (안장 해제 1/회, 공격 3/회)
- usage:
  - 비팔로 안장 해제용

## balloons_empty
- usage:
  - `[캐릭터]` 웨스 전용
  - 풍선 제작 재료

## gestalt_cage
- damage: 17
- usage:
  - `[캐릭터]` 웬디 전용
  - 심령체(게스탈트) 포획

## pocketwatch_dismantler
- usage:
  - `[캐릭터]` 완다 전용
  - 회중시계 분해

## slingshotmodkit
- usage:
  - `[캐릭터]` 월터 전용
  - 새총 모드 장착/교체

## spider_repellent
- uses: 10
- usage:
  - `[캐릭터]` 웨버 전용
  - 거미 퇴치 (반경 8, 거미 여왕은 무시)

## spider_whistle
- uses: 40회 (2.5%/회 소모)
- usage:
  - `[캐릭터]` 웨버 전용
  - 반경 16 내 거미굴에서 거미 소환 + 수면 중인 거미 기상

## spiderden_bedazzler
- uses: 20
- usage:
  - `[캐릭터]` 웨버 전용
  - 거미집 장식 처리 (장식된 거미집은 크리프 반경 감소: 9→4)

## wortox_nabbag
- damage: 13.6~34
- uses: 200 (벌레잡이: 20회)
- usage:
  - `[캐릭터]` 워톡스 전용
  - 소형 생물 포획 + 무기 겸용
  - 벌레잡이망으로도 사용 가능 (20회 제한)

## winona_remote
- fuel_time: 480 (1일)
- usage:
  - `[캐릭터]` 위노나 전용
  - 원격으로 위노나 기계 제어 (사거리 30)

## wx78_scanner_item
- uses: 무한
- usage:
  - `[캐릭터]` WX-78 전용
  - 인벤토리 보유 시 반경 내 스캔 가능 크리처 자동 탐지 알림
  - 바닥에 설치 → 반경 7 내 크리처 스캔 (10초, 에픽 20초) → 해당 모듈 레시피 습득
  - WX-78이 반경 7 이내에 있어야 스캔 유지

## wx78_moduleremover
- uses: 무한
- usage:
  - `[캐릭터]` WX-78 전용
  - 장착된 모듈 1개 제거 (최상단부터)
  - 활성 모듈 제거 시 충전량 차감

## antlionhat
- (armor.md 참조)

## fence_rotator
- (weapons.md 참조)

## spear
- damage: 34
- uses: 150

## spear_wathgrithr
- damage: 42.5
- uses: 200
- usage:
  - `[캐릭터]` 위그프리드 전용

## spear_wathgrithr_lightning
- damage: 59.5
- uses: 150
- usage:
  - `[캐릭터]` 위그프리드 전용
  - `[전기]` 젖은 적 1.5배
  - 돌진 공격 (쿨다운 3초, 돌진 피해 68)
  - 억제된 정전기로 업그레이드 → 충전된 뇌전창으로 변환

## spear_wathgrithr_lightning_charged
- damage: 59.5
- planar_damage: 20
- uses: 200
- speed_mult: 1.2 (이동속도 +20%)
- usage:
  - `[캐릭터]` 업그레이드한 위그프리드만 장착 가능
  - `[전기]` 젖은 적 1.5배
  - 돌진 공격 (쿨다운 1.5초, 돌진 피해 68)
  - 돌진 히트 시 내구도 4 수리 (돌진당 최대 2회 = 최대 8 수리)

## hambat
- damage: 59.5 (신선도에 따라 50%까지 감소)
- uses: 100
- usage:
  - 시간 경과 시 피해 감소 (최소 50% = 29.75)

## batbat
- damage: 42.5
- uses: 75
- usage:
  - 타격 시 체력 +6.8 회복, 정신력 -3.4 감소
  - 그림자 레벨 2

## nightsword
- damage: 68
- uses: 100
- dapperness: -0.2083/초 (분당 -12.5, 하루 -100)
- usage:
  - 장착 시 정신력 지속 감소 (분당 -12.5)
  - 그림자 레벨 2

## glasscutter
- damage: 68
- uses: 75
- usage:
  - 그림자 적 피해 ×1.25 (68→85)
  - 그림자 적 타격 시 내구도 소모 절반

## ruins_bat
- damage: 59.5
- uses: 200
- speed_mult: 1.1 (이동속도 +10%)
- usage:
  - 그림자 레벨 2

## sword_lunarplant
- damage: 38
- planar_damage: 30
- uses: 200
- usage:
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)

## shadow_battleaxe
- damage: 38
- uses: 200
- usage:
  - 킬 시 허기 +50 획득
  - 벌목 가능 (도끼 겸용)
  - 그림자 레벨 3
  - 킬 수에 따라 4단계 레벨업 (0/3/6/9킬):
  - 레벨 유지에 허기 소모 (Lv2: 0.05/초, Lv3: 0.1/초, Lv4: 0.2/초)
  - 흡혈 시 정신력 감소 (흡혈량×0.5)

## voidcloth_boomerang
- damage: 5~27.2 (거리 비례)
- planar_damage: 5~27.2 (동일 스케일링)
- uses: 85
- speed_mult: 1.1
- usage:
  - `[원거리]` 공격 사거리 10 (최대 히트 14), 날아가면서 크기·피해 증가
  - 달 진영 추가 피해 25% 증가 (34)
  - 그림자 레벨 3

## staff_lunarplant
- planar_damage: 10
- uses: 50
- usage:
  - `[원거리]` 투사체가 적 5회 바운스
  - 그림자 적 추가 피해 ×2
  - `[세트]` 빛말풀 세트 보너스 시 바운스 7회
  - `[수리]` 달식물 수리 키트로 수리 (내구도 100% 복구)

## trident
- damage: 51
- uses: 200
- usage:
  - 대상이 해상에 있으면 피해 50% 증가 (76.5)
  - 특수 기술: 범위 피해 85, 반경 2.75, 간헐천 10개 소환 (50회 사용)

## whip
- damage: 27.2
- uses: 175
- usage:
  - 사거리 +2 (근접보다 김)
  - 슈퍼크랙: 일반 몹 25%, 몬스터 20%, 보스 5% 확률로 경직
  - 슈퍼크랙 사거리 14

## fence_rotator
- damage: 34
- uses: 200
- usage:
  - 울타리 회전/이동 가능

## nightstick
- damage: 28.9
- usage:
  - `[전기]` 전기 피해 (젖은 적 1.5배 → 실질 43.4)
  - 연료 기반 내구도 (1440초)
  - 광원 기능

## pocketwatch_weapon
- damage: 81.6 / 소진 시 27.2
- usage:
  - `[캐릭터]` 완다 전용
  - 시간 연료 기반 내구도
  - 연료 소진 시 피해 대폭 감소

## boomerang
- damage: 27.2
- uses: 10
- usage:
  - `[원거리]` 사거리 12
  - 되돌아올 때 받기 실패 시 자해

## slingshot
- usage:
  - `[캐릭터]` 월터 전용
  - `[원거리]` 공격 사거리 10 (최대 히트 14)
  - 탄약에 따라 피해 변동:
  - `[스킬트리]` 차지 시 피해 ×2, 속도 ×1.25, 사거리 증가, 탄약 30% 확률 미소모

## blowdart_pipe
- 스택: 20
- damage: 100
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용

## blowdart_fire
- 스택: 20
- damage: 100
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
  - 대상에 불 붙이기

## blowdart_sleep
- 스택: 20
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
  - 대상을 잠재움

## blowdart_yellow
- 스택: 20
- damage: 60
- uses: 1
- usage:
  - `[원거리]` `[소모품]` 1회용
  - `[전기]` 전기 피해 (젖은 적 1.5배)

## houndstooth_blowpipe
- damage: 34
- planar_damage: 34
- usage:
  - `[원거리]` 공격 사거리 12 (최대 히트 16)
  - 그림자 적 추가 피해 ×1.1

## firestaff
- uses: 20
- usage:
  - `[원거리]` 대상에 불 붙이기

## icestaff
- uses: 20
- usage:
  - `[원거리]` 대상 빙결

## staff_tornado
- uses: 15
- usage:
  - `[원거리]` 토네이도 소환 (이동하며 범위 피해)

## panflute
- uses: 10
- usage:
  - 주변 생물 수면 (반경 15, 20초간)

## gunpowder
- 스택: 40
- damage: 200
- usage:
  - `[설치형]` `[소모품]` 설치 후 점화 시 범위 폭발 (반경 3)

## bomb_lunarplant
- 스택: 20
- planar_damage: 200
- usage:
  - `[원거리]` `[소모품]` 투척 시 범위 차원 폭발 (반경 3)
  - 6개 묶음 제작

## beemine
- usage:
  - `[설치형]` `[소모품]` 설치 시 적 접근하면 벌 4마리 소환 (반경 3)

## sleepbomb
- 스택: 20
- usage:
  - `[원거리]` `[소모품]` 투척 시 주변 생물 수면 (20초)

## waterballoon
- 스택: 20
- usage:
  - `[원거리]` `[소모품]` 투척 시 불 끄기 + 젖음 +20
  - 온도 -5 감소

## trap_teeth
- damage: 60
- uses: 10
- usage:
  - `[설치형]` 설치형 함정 (반경 1.5)

## trap_bramble
- damage: 40
- uses: 10
- usage:
  - `[설치형]` 설치형 함정 (반경 2.5)
  - `[캐릭터]` 웜우드 전용

## boat_cannon_kit
- usage:
  - 배에 설치하는 대포 (포탄 사용)

## cannonball_rock_item
- 스택: 20
- damage: 200
- usage:
  - `[원거리]` 대포 탄약
  - 스플래시 피해 120, 스플래시 반경 3

## winona_catapult
- damage: 42.5
- usage:
  - `[캐릭터]` 위노나 전용 구조물
  - `[설치형]` 자동 공격 (공격 주기 2.5초)
  - 범위 피해 (반경 1.25)
  - 전력 소모

## winona_catapult_item
- usage:
  - 위노나의 투석기 설치 키트

## wortox_nabbag
- damage: 13.6~34
- uses: 200 (벌레잡이 용도: 20회)
- usage:
  - `[캐릭터]` 워톡스 전용
  - 소형 생물 포획 + 무기 겸용
  - 벌레잡이망으로도 사용 가능 (20회 제한)

## wathgrithr_shield
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

## campfire
- 타입: 구조물
- usage:
  - 연료 270초 (시작 135)
  - 비 올 때 연료 소모 가속 (최대 강수 시 3.5배 소모)
  - 4단계
  - 요리 가능
  - 소진 시 재 + 사라짐

## firepit
- 타입: 구조물
- usage:
  - 해머 4회
  - 연료 360초
  - 비 올 때 연료 소모 가속 (최대 강수 시 3배 소모)
  - 연료 보너스 배율 2배
  - 요리 가능

## dragonflyfurnace
- 타입: 구조물
- usage:
  - 해머 6회
  - 영구 화염
  - 발열 115
  - 4칸 컨테이너
  - 요리 + 소각 가능

## tent
- 타입: 구조물
- usage:
  - 해머 4회
  - 사용 횟수 15
  - 수면 HP +2/초, 허기 -1/초
  - 체온 목표 40

## heatrock
- 타입: 아이템
- usage:
  - 내구도 8회 (온도 범위 전환 시 소모)
  - 5단계 온도
  - 보온 120초
  - 최고 온도 시 빛 방출

## winterometer
- 타입: 구조물
- usage:
  - 해머 4회
  - 온도 미터 표시

## cotl_tabernacle_level1
- 타입: 구조물
- usage:
  - 해머 4회
  - 3단계 업그레이드
  - Lv1 연료 120 / Lv2 연료 240 / Lv3 연료 480
  - 요리 가능
  - 정신력 오라 (Lv1 +50 / Lv2 +80 / Lv3 +200일)
