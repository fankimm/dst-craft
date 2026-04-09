# 캐릭터 전용 (Character) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

---

## Maxwell

## waxwelljournal — 본영의 서
- 악몽 연료 타입 연료 720, 스펠 1회당 -36 연료 (최대 20회)
- 4종 스펠: 일꾼 / 수호자 / 덫 / 기둥
- 스펠 시 정신력 -15 (일꾼·수호자 제외)
- 재료: 파피루스×2 + 악몽 연료×2 + 체력 50
- usage: Maxwell 전용 그림자 복사본 소환 통합 아이템
- 소스: waxwelljournal.lua, tuning.lua

> shadow*_builder 4종 DEPRECATED 항목 (shadowdigger / shadowduelist / shadowlumber / shadowminer):
> waxwelljournal로 통합됨. 기존 재료(악몽 연료×2 + 도구×1)·정신력 소모(20~35%) 수치는 구버전.

---

## Walter

## 탄약 테이블 (스택 120, 기본 20발 생산)

| ID | 한글명 | 피해 | 특수 효과 |
|---|---|---|---|
| ammo_rock | 짱돌 | 17 | — |
| ammo_gold | 황금탄 | 34 | — |
| ammo_marble | 대리석 구슬 | 51 | — |
| ammo_poop | 오물덩이 | 0 | 타겟 해제 |
| ammo_freeze | 냉동탄 | 0 | 냉기 +2 |
| ammo_slow | 둔화탄 | 17 | 이동속도 2/3 (30초, 3스택) |
| ammo_honey | 끈끈이 | 0 | 감속 8초 |
| ammo_thulecite | 저주탄 | 51 | 50% 촉수 소환 |
| ammo_moonglass | 달나라탄 | 51 | AOE 34 (반경 2.75) |
| ammo_dreadstone | 공포석 짱돌 | 58 + 차원 10 | 50% 회수 |
| ammo_gunpowder | 콩알탄 | 59.5 | 5% 폭발 크리 (AOE 피해×2) |
| ammo_lunarplanthusk | 빛말풀 거죽탄 | 38 + 차원 30 | — |
| ammo_purebrilliance | 순수한 광휘탄 | 34 + 차원 20 | 30초 표식 (차원 +5) |
| ammo_horrorfuel | 순수한 공포탄 | 17 + 차원 20 | 공포 디버프 7틱 (차원 10/틱) |
| ammo_gelblob | 찐득이 | 0 | 60초 감속 블롭 (10발 생산) |
| ammo_scrapfeather | 감전탄 | 39.1 | 전기 피해 |
| ammo_stinger | 벌침 일침 | 25.5 | AOE 17 (반경 2) |

- 소스: walter_slingshot_ammo.lua, tuning.lua

## 새총 부품 테이블

| ID | 한글명 | 효과 |
|---|---|---|
| band_pigskin | 돼지가죽 새총줄 | 사거리 +1, 속도 1.1 |
| band_tentacle | 휘날리는 새총줄 | 사거리 +2, 속도 1.2 |
| frame_bone | 뼈다귀 새총몸 | 예비 탄환 슬롯 |
| frame_wagpunk_0 | 고철 새총몸 | 충전 공격 (최대 200% 피해) |
| frame_wagpunk_1 | 고철떼기 새총몸 | 탄환 무한 스택 + 충전 공격 |
| frame_gems | 툴레사이트 새총몸 | 보조 탄환 + 마법 AOE 확장 |
| handle_silk | 새총 그립테이프 | 발사 속도 증가 |
| handle_sticky | 끈끈이 새총 손잡이 | 발사 속도 + 미끄러짐 방지 |
| handle_jelly | 젤리 새총 손잡이 | 발사 속도 크게 증가 + 미끄러짐 방지 |
| handle_voidcloth | 공허의 새총 손잡이띠 | 발사 속도 크게 증가 + 연속 발사 증가 |

- 소스: walter_slingshot.lua

## slingshotammo_container — 탄환 파우치
- 6슬롯 탄약 전용 가방
- usage: Walter 전용 탄약 휴대 용량 확장
- 소스: walter_slingshot_ammo.lua

## walter_rope — 밧줄
- 풀 2개로 밧줄 제작 (일반은 3개)
- 스택: 20
- usage: Walter 전용 효율 레시피
- 소스: walter.lua

## woby_treat — 워비 간식
- 건조 괴물고기 1개 → 2개 생산
- 워비 허기 3배 회복
- 스택: 40
- usage: Walter 전용 워비 먹이
- 소스: woby.lua

---

## Wanda

## pocketwatch_heal — 불로의 시계
- 나이 8년 역전 + HP 20 회복
- 쿨다운: 120초
- usage: Wanda 나이 관리 + 회복
- 소스: wanda_pocketwatches.lua

## pocketwatch_parts — 시계 부품
- 재료: 툴레사이트 조각×8 + 악몽 연료×2
- usage: 다른 시계 제작 재료 (기능 없음)
- 소스: wanda_pocketwatches.lua

## pocketwatch_portal — 균열의 시계
- 위치 마킹 → 포탈 개방 (10초)
- 통과 비용: 정신력 -20
- usage: Wanda 포탈 생성
- 소스: wanda_pocketwatches.lua

## pocketwatch_recall — 회귀의 시계
- 위치 마킹 → 순간이동
- 쿨다운: 480초 (1일)
- 지하 ↔ 지상 이동 가능
- usage: Wanda 장거리 이동
- 소스: wanda_pocketwatches.lua

## pocketwatch_revive — 회생의 시계
- 자가 부활 (유령 → 원래 상태) + 타인 부활
- 쿨다운: 240초
- usage: Wanda 부활 수단
- 소스: wanda_pocketwatches.lua

## pocketwatch_warp — 역행의 시계
- 과거 위치로 순간이동 (나이별 거리: 젊음 8 / 보통 4 / 노년 2)
- 쿨다운: 2초
- usage: Wanda 단거리 회피기
- 소스: wanda_pocketwatches.lua

---

## Warly

## portablecookpot_item — 휴대용 요리솥
- 배치형, 조리 속도 20% 빠름 (조리시간 배율 0.8)
- 해머 2회로 해체
- usage: Warly 이동식 요리솥
- 소스: warly.lua

## portableblender_item — 휴대용 제분기
- 배치형, 식재료 가공 프로토타이퍼
- 해머 2회로 해체
- usage: Warly 전용 식재료 가공기
- 소스: warly.lua

## portablespicer_item — 휴대용 양념기
- 배치형, 양념 + 요리
- 해머 2회로 해체
- usage: Warly 양념 적용 요리
- 소스: warly.lua

## spicepack — 요리사 파우치
- BODY 슬롯 가방 6칸
- 부패 방지
- usage: Warly 재료/양념 보관
- 소스: warly.lua

---

## Wathgrithr

## armor_lunarplant_husk — 빛가시 갑옷
- 내구도: 830, 흡수: 80%, 차원 방어: 10, 달 피해 저항: 90%
- 피격 시 차원 반사 10 (그림자 +20), 가시 효과
- usage: Wormwood 전용 (Wathgrithr 데이터에 포함)
- 소스: wathgrithr.lua, tuning.lua

## battlesong 테이블

| ID | 한글명 | 효과 |
|---|---|---|
| battlesong_container | 전투 영창 통 | 8칸 노래 보관 |
| battlesong_durability | 예리한 고음 | 무기 내구 소모 25% 감소 |
| battlesong_fireresistance | 불을 삼키는 가성 | 화염 피해 완전 무효 |
| battlesong_healthgain | 가슴 아픈 발라드 | 공격 시 HP +1 (위그 +0.5) |
| battlesong_sanitygain | 평정의 카덴차 | 공격 시 정신력 +1 |
| battlesong_sanityaura | 용기의 벨칸토 | 공포 오라 50% 감소 |
| battlesong_instant_taunt | 무례한 막간극 | 도발, 영감 16.7, 쿨 10초 |
| battlesong_instant_panic | 경악스런 독백 | 공포 6초, 영감 16.7, 쿨 10초 |
| battlesong_instant_revive | 전사의 레프리제 | 유령 2명 부활, 영감 83.3, 쿨 150초, 스킬트리 연동 |
| battlesong_lunaraligned | 계몽의 자장가 | 달 피해 -10% + 그림자에 +5%, 스킬트리 연동 |
| battlesong_shadowaligned | 어둠의 애가 | 그림자 피해 -10% + 달에 +5%, 스킬트리 연동 |

- 소스: wathgrithr.lua, tuning.lua

## saddle_wathgrithr — 전사의 안장
- uses: 6, 이동속도: 1.3, 피해 +5, 흡수 40%
- usage: Wathgrithr 전용, 스킬트리 연동
- 소스: wathgrithr.lua

---

## Webber

## mutator 7종 — 변신 과자

| ID | 변이 유형 |
|---|---|
| mutator_warrior | 전사 거미 변이 |
| mutator_dropper | 드로퍼 거미 변이 |
| mutator_hider | 하이더 거미 변이 |
| mutator_spitter | 스피터 거미 변이 |
| mutator_moon | 달 거미 변이 |
| mutator_healer | 치유 거미 변이 |
| mutator_water | 물 거미 변이 |

- 스택: 20
- usage: Webber 전용 거미 변이 아이템
- 소스: webber.lua

## spider_healer_item — 치료액 방울
- Webber HP +8
- 주변 거미 HP +80 (반경 5)
- 스택: 20
- usage: Webber 전용 자신 + 거미 회복
- 소스: webber.lua

## spidereggsack — 거미 알
- 설치 시 거미굴 생성
- 스택 10, 연료 180
- usage: Webber 전용 거미굴 설치
- 소스: webber.lua

---

## Wendy

## abigail_flower — 아비게일의 꽃
- 소환/귀환 토글, 스펠 휠 명령, 엘릭서 적용 대상
- usage: Wendy 전용 아비게일 소환 도구
- 소스: wendy.lua

## ghostflowerhat — 망령 화관
- dapperness: +0.056, perish: 4800 (10일)
- 엘릭서 효과 적용
- usage: Wendy 전용, 스킬트리 연동
- 소스: wendy.lua

## elixir_container — 소풍용 관짝
- 3×3 컨테이너
- usage: Wendy 전용 엘릭서 보관
- 소스: wendy.lua

## ghostlyelixir 9종 — 유령 엘릭서

| ID | 한글명 | 아비게일 효과 | 플레이어 효과 |
|---|---|---|---|
| ghostlyelixir_attack | 독말풀 보약 | 피해 고정 (낮 15→밤 40), 480초 | — |
| ghostlyelixir_fastregen | 영혼의 만병통치약 | +20HP/초 (30초, 총 600) | +5HP/초 (20초, 총 100) |
| ghostlyelixir_slowregen | 망령의 강장제 | +2HP/초 (480초, 총 960) | +1HP/초 (20초, 총 20) |
| ghostlyelixir_shield | 불굴의 물약 | 포스필드 480초 | 50% 피해 감소 실드 120초 |
| ghostlyelixir_retaliation | 복수의 증류물 | 실드 + 반격 20 (반경 5, 480초) | 50% 감소 + 반격 20 (120초) |
| ghostlyelixir_speed | 사자의 활력 | 이동 ×1.75 (480초) | 이동 버프 480초 |
| ghostlyelixir_revive | 영적 체험 | 결속 레벨 3 설정 | 정신력/허기/체력 소량 회복 |
| ghostlyelixir_lunar | 광명의 분노 | 차원 피해 +10 (게스탈트 +100), 120초 | — (스킬트리 슈퍼엘릭서) |
| ghostlyelixir_shadow | 저주의 원념 | 그림자 효과, 480초 | — (스킬트리 슈퍼엘릭서) |

- 스택: 20
- 소스: wendy.lua, tuning.lua

## graveurn — 영혼 그릇
- 묘비 이동 도구
- usage: Wendy 전용, 스킬트리 연동
- 소스: wendy.lua

## sisturn — 자매의 헌화당
- 구조물, 꽃 4슬롯
- 정신력 오라 +200/일 (스킬 보유 시 +320)
- usage: Wendy 전용, 스킬트리 연동
- 소스: wendy.lua

## wendy_resurrectiongrave — 여러해살이 제단
- 부활 구조물, HP -40 연동 비용
- usage: Wendy 전용 부활 제단
- 소스: wendy.lua

---

## Wes

## balloon — 풍선
- 핸드 슬롯 장착, 9가지 모양 랜덤
- usage: Wes 전용 퍼포먼스 아이템
- 소스: wes.lua

## balloonparty — 파티 풍선
- 터뜨리면 정신력 회복 (파티 규모 비례, 2초 틱)
- usage: Wes 전용 정신력 회복
- 소스: wes.lua

## balloonspeed — 날쌘돌이 풍선
- 이동속도 1.0 → 1.3 (연료 비례), 연료: 120초
- usage: Wes 전용 이동 버프 풍선
- 소스: wes.lua

---

## Wickerbottom

## bookstation — 책장
- 구조물, 20슬롯 책 전용
- 30초마다 내구도 1% 복원 (Wickerbottom 근처 ×2 속도)
- 책 제작 프로토타이퍼
- usage: Wickerbottom 전용 책 보관 및 내구 회복
- 소스: wickerbottom.lua

## 책 테이블 (공통: 읽기 정신력 -33, Wickerbottom 전용)

| ID | 한글명 | uses | 특수 비용 | 효과 |
|---|---|---|---|---|
| book_bees | 양봉비책 | 3 | — | 비가드 2마리 소환 (최대 16) |
| book_birds | 세계의 새들 | 3 | 읽기 -50 / 정독 +50 | 새 10~30 소환 |
| book_brimstone | 종말이 다가온다! | 5 | — | 번개 17회 |
| book_fire | 염화술 해설 | 3 | — | 반경 16 불 소화 + 화력펜 충전 |
| book_fish | 낚시꾼의 생존 비결 | 3 | 정독 +50 | 물고기 3떼 소환 |
| book_horticulture | 원예학 축약판 | 5 | — | 반경 30 식물 10개 성장 |
| book_horticulture_upgraded | 원예학 확장판 | 3 | 정독 -50 | 반경 30 식물 15개 최대 성장 |
| book_light | 영원의 빛 | 3 | 정독 +33 | 빛 구체 240초 소환 |
| book_light_upgraded | 영원의 빛 개정판 | 5 | 정독 +50 | 빛 구체 960초 소환 |
| book_moon | 월광의 서 | 3 | 읽기 -50 | 보름달 강제 |
| book_rain | 실전 기우제 | 5 | 정독 +33 | 비 토글 + 농경 수분 100 |
| book_research_station | 만물의 백과사전 | 3 | 정독 +33 | 반경 16 기술 보너스 (과학+2, 마법+2, 항해+2) |
| book_silviculture | 응용 조림학 | 5 | — | 반경 30 나무 전체 성장 (레시피 없음, 책장 획득) |
| book_sleep | 꿈나라 이야기 | 5 | 정독 +33 | 반경 30 수면 (20초) |
| book_temperature | 온도 길들이기 | 5 | 정독 +33 | 반경 16 체온 35 설정 + 건조 + 해동 |
| book_tentacles | 촉수에 관하여 | 5 | 읽기 -50 / 정독 +50 | 촉수 3개 소환 |
| book_web | 거미공포증의 극복 | 5 | 정독 +33 | 거미줄 생성 (반경 6, 120초, 75% 감속) |

- 소스: wickerbottom.lua, tuning.lua

---

## Willow

## bernie_inactive — 버니
- 핸드 장착, dapperness: +0.033, 보온: 60
- 연료: 2400 (실효 15일)
- 광기 시 활성화 변신 (HP 1000, 공격 50)
- usage: Willow 전용 광기 수호 아이템
- 소스: willow.lua, tuning.lua

## lighter — 윌로우의 라이터
- 무기 피해: 17, 점화 확률: 50%
- 연료: 600 (1.25일), 조리 가능
- usage: Willow 전용 점화 + 근접 무기
- 소스: willow.lua

---

## Wilson

## transmute 28종 — 연금 변환 레시피 (스킬트리 단계별 해금)

| 단계 | ID | 한글명 | 변환 |
|---|---|---|---|
| 연금술 1 | transmute_log | 잔가지 3 → 나무 | log |
| 연금술 1 | transmute_twigs | 나무 1 → 잔가지 2 | twigs |
| 연금술 2 | transmute_bluegem | 붉은 2 → 푸른 | bluegem |
| 연금술 2 | transmute_redgem | 푸른 2 → 붉은 | redgem |
| 연금술 2 | transmute_purplegem | 푸른 + 붉은 → 보라 | purplegem |
| 연금술 3 | transmute_flint | 돌 3 → 부싯돌 | flint |
| 연금술 3 | transmute_rocks | 부싯돌 2 → 돌 | rocks |
| 연금술 4 | transmute_meat | 작은고기 3 → 고기 | meat |
| 연금술 4 | transmute_smallmeat | 고기 1 → 작은고기 2 | smallmeat |
| 연금술 5 | transmute_orangegem | 보라 3 → 주황 | orangegem |
| 연금술 5 | transmute_yellowgem | 주황 3 → 노랑 | yellowgem |
| 연금술 6 | transmute_greengem | 노랑 3 → 초록 | greengem |
| 연금술 6 | transmute_opalpreciousgem | 6보석 각 1 → 무지개 | opalpreciousgem |
| 연금술 7 | transmute_goldnugget | 초석 3 → 금 | goldnugget |
| 연금술 7 | transmute_nitre | 금 2 → 초석 | nitre |
| 연금술 8 | transmute_marble | 석재 2 → 대리석 | marble |
| 연금술 8 | transmute_cutstone | 대리석 1 → 석재 | cutstone |
| 연금술 8 | transmute_moonrocknugget | 대리석 2 → 월석 | moonrocknugget |
| 연금술 9 | transmute_beardhair | 비팔로털 2 → 수염 | beardhair |
| 연금술 9 | transmute_beefalowool | 수염 2 → 비팔로털 | beefalowool |
| 연금술 10 | transmute_boneshard | 사냥개이빨 2 → 뼛조각 | boneshard |
| 연금술 10 | transmute_houndstooth | 뼛조각 2 → 사냥개이빨 | houndstooth |
| 연금술 10 | transmute_poop | 부패물 6 → 거름 | poop |
| 그림자 충성 | transmute_horrorfuel | 공포석 1 → 순수한 공포 2 | horrorfuel |
| 그림자 충성 | transmute_dreadstone | 순수한 공포 3 → 공포석 | dreadstone |
| 그림자 충성 | transmute_nightmarefuel | 순수한 공포 1 → 악몽 연료 2 | nightmarefuel |
| 달빛 충성 | transmute_purebrilliance | 충전된 달 파편 3 → 순수한 광휘 | purebrilliance |
| 달빛 충성 | transmute_moonglass_charged | 순수한 광휘 1 → 충전된 달 파편 2 | moonglass_charged |

- usage: Wilson 전용, 스킬트리 연금술 변환
- 소스: wilson.lua, tuning.lua

---

## Winona

## winona_battery_low — 위노나의 발전기
- 연료: 180초, 소모율: 0.375 (실효 480초 = 1일)
- 공급 범위: 6.6
- usage: Winona 전용 전력 공급 (소형)
- 소스: winona.lua, tuning.lua

## winona_battery_high — 위노나의 발G.E.M.기
- 연료: 2880초 (6일), 보석 재충전, 과부하 보호
- usage: Winona 전용 전력 공급 (대형)
- 소스: winona.lua

## winona_spotlight — 위노나의 조명기
- 전력 소모: 0.5 (켜짐) / 0.05 (꺼짐)
- 반경: 4.27 ~ 24
- usage: Winona 전용 원거리 조명
- 소스: winona.lua

## winona_storage_robot — W.I.N봇
- 작업 반경: 15, 이동 속도: 5, 연료: 480초 (1일)
- usage: Winona 전용 자동 운반 로봇
- 소스: winona.lua

## winona_teleport_pad_item — 순간이동 스테이션
- 대기 전력: 0.05, 텔레포트 비용 가변
- usage: Winona 전용 팀 이동 스테이션
- 소스: winona.lua

---

## Wolfgang

## 아령 테이블

| ID | 한글명 | 피해 | 소모(/s) | 특수 |
|---|---|---|---|---|
| dumbbell | 아령 | 17 | 0.8 | — |
| dumbbell_golden | 황금 아령 | 27.2 | 0.5 | — |
| dumbbell_marble | 대리령 | 34 | 0.3 | 투척 시 감속 0.9 |
| dumbbell_gem | 옥령 | 42.5 | 0.2 | — |
| dumbbell_bluegem | 빙령 | 42.5 | 0.3 | 투척 시 냉각 |
| dumbbell_redgem | 화령 | 42.5 | 0.3 | 투척 시 점화 |
| dumbbell_heat | 보온 아령 | 17 | 0.8 | uses 150, 체온 조절 |

- usage: Wolfgang 전용 운동 + 전투 무기
- 소스: wolfgang.lua, tuning.lua

## mighty_gym — 울끈불끈 체육관
- 구조물, 중량 품질별 운동 효율: LOW 4 / MED 6.67 / HIGH 10 mightiness/타
- 허기 소모: 4 / 11 / 22
- usage: Wolfgang 전용 강화 훈련
- 소스: wolfgang.lua

## wolfgang_whistle — 지도용 호루라기
- 코칭 버프 ×2, 영감 소요 7초, 버프 지속 10초
- usage: Wolfgang 전용 팀 코칭
- 소스: wolfgang.lua

---

## Woodie

## livinglog — 생목
- 자원, 연료: 45, 배 수리: 37.5
- 스택: 20
- usage: Woodie 전용 자원 (변신 시 획득 가능)
- 소스: woodie.lua

---

## Wormwood

## compostwrap — 퇴비쌈
- 비료: 1800, 토양 주기: 20, 영양분: {24, 32, 24}
- Wormwood 치유: 2HP/2초
- 스택: 40
- usage: Wormwood 전용 농업 비료 + 자가 회복
- 소스: wormwood.lua, tuning.lua

## mosquitobomb — 목이탄
- 피해: 59.5, 범위: 3, 모기 4마리 소환 (스킬 보유 시 6)
- 스택: 20
- usage: Wormwood 전용 투척 폭탄
- 소스: wormwood.lua

## mosquitofertilizer — 왱비료
- 비료: 300, 토양 주기: 10, 영양분: {12, 12, 12}
- 스택: 20
- usage: Wormwood 전용 소형 비료
- 소스: wormwood.lua

## mosquitomermsalve — 피주사
- Wurt HP +16, 어인 HP +100
- 스택: 40
- usage: Wormwood 전용 (Wurt 연계 치료)
- 소스: wormwood.lua

## mosquitomusk — 꼬마 따끔이
- 모기 비공격 (평화 효과), 부패: 3840 (8일)
- usage: Wormwood 전용 모기 중립화
- 소스: wormwood.lua

## wormwood_berrybush — 베리 덤불
- 설치 식물, 3일 주기, 3~4회 수확
- usage: Wormwood 전용 식물 설치
- 소스: wormwood.lua

## wormwood_berrybush2 — 베리 덤불 변종
- 동일 (베리 덤불과 같은 사이클)
- usage: Wormwood 전용
- 소스: wormwood.lua

## wormwood_juicyberrybush — 즙많은 베리 덤불
- 9일 주기, 3~4회 수확
- usage: Wormwood 전용
- 소스: wormwood.lua

## wormwood_sapling — 묘목
- 달빛 묘목 설치, 4일 주기
- usage: Wormwood 전용
- 소스: wormwood.lua

## wormwood_reeds — 원숭이꼬리풀
- 3일 주기, 4~6회 수확
- usage: Wormwood 전용
- 소스: wormwood.lua

## wormwood_lureplant — 육질 구근
- HP: 300, 아이플랜트 소환
- usage: Wormwood 전용 방어 식물
- 소스: wormwood.lua

## wormwood_carrat — 캐럿
- HP: 25, 수명: 3일, 최대 4마리
- usage: Wormwood 전용 식물 크리처
- 소스: wormwood.lua

## wormwood_lightflier — 전구근
- HP: 25, 수명: 2.5일, 최대 6마리, 발광
- usage: Wormwood 전용 조명 식물 크리처
- 소스: wormwood.lua

## wormwood_fruitdragon — 용과
- HP: 600 (스킬 보유 시 900), 피해: 40, 수명: 2일, 최대 2마리
- usage: Wormwood 전용 전투 식물 크리처
- 소스: wormwood.lua

---

## Wortox

## wortox_reviver — 쌍꼬리 심장
- 부활 아이템, 부패: 10일
- usage: Wortox 전용, 스킬트리 연동
- 소스: wortox.lua

## wortox_souljar — 영혼 단지
- 영혼 보관, 30초마다 누출 (스킬 보유 시 중지)
- 영혼 최대 +5
- usage: Wortox 전용 영혼 저장
- 소스: wortox.lua

---

## Wurt

## merm_armory — 무기곩
- 어인 갑옷·모자 지급, 해머 4회
- usage: Wurt 전용 어인 군사 장비
- 소스: wurt.lua

## merm_armory_upgraded — 상급 무기곩
- 상급 모자 지급
- usage: Wurt 전용
- 소스: wurt.lua

## merm_toolshed — 조잡한 도구함
- 어인 도구 지급
- usage: Wurt 전용
- 소스: wurt.lua

## merm_toolshed_upgraded — 덜 조잡한 도구함
- 상급 도구 지급
- usage: Wurt 전용
- 소스: wurt.lua

## mermhouse_crafted — 어인 양옭집
- 어인 1마리 소환, 재생: 2일
- usage: Wurt 전용 어인 소환
- 소스: wurt.lua

## mermthrone_construction — 왕위 제작 키트
- 건설 재료 투입 → 어인 왕 소환
- usage: Wurt 전용 어인 왕 소환
- 소스: wurt.lua

## mermwatchtower — 어인 욣새
- 경비병 소환, 재생: 0.5일 (겨울 ×12)
- usage: Wurt 전용 어인 경비 초소
- 소스: wurt.lua

## offering_pot — 공용 다시마 그릇
- 머미 소집 + 급식, 범위: 7
- usage: Wurt 전용 어인 집결 + 식사
- 소스: wurt.lua

## offering_pot_upgraded — 상급 공용 다시마 그릇
- 상급 버전
- usage: Wurt 전용
- 소스: wurt.lua

## wurt_swampitem_shadow — 공포의 진흙봉
- 그림자 늪지 변환 (3타일), 쿨다운: 480초, 정신력 -20
- usage: Wurt 전용 지형 변환
- 소스: wurt.lua

## wurt_swampitem_lunar — 광휘의 진흙봉
- 달빛 늪지 변환, 동일 구조
- usage: Wurt 전용 지형 변환
- 소스: wurt.lua

## wurt_turf_marsh — 늪지 바닥
- 늪지 바닥재 4장 제작
- usage: Wurt 전용 늪지 바닥재
- 소스: wurt.lua

---

## WX-78

## 모듈 테이블 (공통: uses 4)

| ID | 한글명 | 슬롯 | 효과 |
|---|---|---|---|
| wx78module_maxhealth | 체력 증진 회로 | 1 | HP +50 |
| wx78module_maxhealth2 | 체력 초증진 회로 | 2 | HP +150 |
| wx78module_maxsanity1 | 연산 회로 | 1 | 정신력 +40 |
| wx78module_maxsanity | 초연산 회로 | 2 | 정신력 +100 + dapperness +0.033 |
| wx78module_bee | 빈부스터 모듈 | 3 | 초연산 효과 + 30초마다 HP +5 |
| wx78module_maxhunger1 | 소화기 확장 회로 | 1 | 허기 +40 |
| wx78module_maxhunger | 소화기 초확장 회로 | 2 | 허기 +100 + 소화 20% 감소 |
| wx78module_movespeed | 가속 회로 | 6 | 이동속도 (1개 0% / 2개 +25% / 3개 +40% / 4개 +50%) |
| wx78module_movespeed2 | 초가속 회로 | 2 | 가속 회로와 동일 |
| wx78module_heat | 발열 회로 | 3 | 온도 상하한 +20 |
| wx78module_cold | 냉각 회로 | 3 | 온도 상하한 -20 |
| wx78module_nightvision | 광전자 회로 | 4 | 야간 투시 |
| wx78module_light | 조명 회로 | 3 | 발광 (기본 3.5 + 모듈당 +1.5) |
| wx78module_music | 음악상자 회로 | 3 | 반경 12 농작물 경작 + 정신력 오라 |
| wx78module_taser | 전격 회로 | 2 | 피격 시 전기 반격 20 |

- usage: WX-78 전용 슬롯 장착 강화 모듈
- 소스: wx78.lua, tuning.lua

---

## 다른 md에서 다룬 아이템 참조 테이블

| ID | 한글명 | 참조 파일 |
|---|---|---|
| tophat_magician | 마술 모자 | clothing.md |
| magician_chest | 마술 상자 | magic.md |
| armor_sanity | 밤의 갑옷 | armor.md |
| armorslurper | 허기의 허리띠 | clothing.md |
| batbat | 박쥐 방망이 | weapons.md |
| nightsword | 어둠의 검 | weapons.md |
| onemanband | 원 맨 밴드 | clothing.md |
| panflute | 팬플룻 | weapons.md |
| pocketwatch_weapon | 타종 시계 | weapons.md |
| sentryward | 오큐비질 | tools.md |
| sewing_kit | 바느질 도구 | tools.md |
| sewing_tape | 믿음직한 테이프 | tools.md |
| wortox_nabbag | 날치기 보따리 | tools.md |
| cane | 워킹 케인 | tools.md |
| antlionhat | 땅엎기 투구 | tools.md |
| dreadstonehat | 공포석 투구 | armor.md |
