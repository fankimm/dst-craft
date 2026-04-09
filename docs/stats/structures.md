# 구조물 (Structures) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: 윌슨 체력=150, 윌슨 공격력=34, 하루=480초, 한 구간=30초

---

## 핵심 구조물

## pighouse — Pig House (돼지집)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 돼지 1마리 스폰, 리스폰 시간 4일
  - 밤에 돼지가 집 안에 있으면 조명 방출 (반경 1, 강도 0.5)
- 가연성: 예
- 소스: pighouse.lua, tuning.lua

## rabbithouse — Rabbit Hutch (토끼집)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 토끼인간 1마리 스폰, 리스폰 시간 1일
  - 토끼인간은 밤에 나옴 (돼지와 반대)
- 가연성: 예
- 소스: rabbithouse.lua, tuning.lua

## scarecrow — Friendly Scarecrow (친근한 허수아비)
- 타입: 구조물
- 해머 횟수: 6회
- usage:
  - 근처 까마귀 퇴치
  - 캐릭터 스킨 변경 가능
- 가연성: 예
- 소스: scarecrow.lua

## punchingbag — Punching Bag (동네북씨)
- 타입: 구조물
- 해머 횟수: 6회
- HP: 10009 (즉각 회복)
- usage:
  - 데미지 테스트용 (최대 9999 표시)
  - 머리/몸통 장비 장착 가능
- 가연성: 예
- 소스: punchingbag.lua

## fence_electric_item — T.I.N.G.L.E. Node (신.경.통. 노드)
- 타입: 벽 (배치형)
- 설치 시 HP: 1 (모든 피해 흡수)
- 해머 횟수: 3회
- usage:
  - 최대 연결 수: 2개, 연결 범위: 10
  - 연결 시 전기 울타리 형성, 접촉한 적 감전
- 해머 전리품: 와그펑크 부품, 달유리
- 소스: fence_electric.lua, tuning.lua

## portabletent_item — Tent Roll (접이식 텐트)
- 타입: 인벤토리 아이템 (배치형)
- uses: 10
- usage:
  - 수면 시: 체력 +2/틱, 배고픔 -1/틱, 목표 체온 40도
  - 설치/회수 가능 (잔여 내구도 유지)
- 가연성: 예
- 소스: portabletent.lua, tuning.lua

## houndwhistle — Lucky Whistle (행운의 호루라기)
- 타입: 인벤토리 아이템
- uses: 10
- usage:
  - 반경 25 내 사냥개/바르그 길들이기 (달 정렬 제외)
  - 충성 지속 40초
  - 최대 추종 수: 5
- 소스: houndwhistle.lua, tuning.lua

## meatrack_hermit_multi — Large Drying Rack (대형 건조대)
- 타입: 구조물
- 해머 횟수: 4회
- 컨테이너: 9칸
- usage:
  - 고기/생선/다시마 건조 (일반 건조대 3칸의 3배)
  - 소금 수집 기능
- 가연성: 예
- 소스: meatrack.lua

## archive_resonator_item — Astral Detector (천체 탐지기)
- 타입: 인벤토리 아이템 (배치형)
- uses: 10
- usage:
  - 달 제단 표지/유물/대게왕 탐색
  - 반경 4 내 표지 발견 시 드릴로 유물 생산
  - 원거리 대상에 빔 포인터 생성
- 소스: archive_resonator.lua, tuning.lua

## rope_bridge_kit — Spelunker's Bridge Kit (동굴 탐험용 다리 키트)
- 타입: 인벤토리 아이템
- 스택: 10
- usage:
  - 물 위에 다리 설치 (최대 6타일)
  - 길이에 따라 복수 키트 필요
- 가연성: 예
- 소스: rope_bridge.lua, tuning.lua

## support_pillar_scaffold — Pillar Scaffold (기둥 비계)
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 지진 방지 (범위 40)
  - 재료 투입으로 보강 (레벨 0~3: 0/10/20/40개)
  - 보강 완료 시 추가 10레벨 버퍼
- 소스: support_pillar.lua, tuning.lua

## support_pillar_dreadstone_scaffold — Dreadstone Pillar Scaffold (공포석 기둥 비계)
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 지진 방지 (범위 40)
  - 자동 재생 (2일 주기)
  - 정신력 오라: 반경 8 내 중간 정신력 감소 (지수 감쇠)
- 소스: support_pillar.lua, tuning.lua

## moon_device_construction1 — Incomplete Experiment (미완의 실험)
- 타입: 구조물 (건설 단계)
- usage:
  - 천체 제단 건설 3단계 중 1단계
  - 3단계 완료 시 9.5초 후 천체 수호자 소환
  - 건설 중 그림자 운석 출현
- 소스: moon_device.lua

## table_winters_feast — Winter's Feast Table (겨울 축제 탁자)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 축제 음식 배치 가능 (1칸)
  - 탁자 범위 3.5, 축제 범위 8
  - 주변 캐릭터에게 축제 버프 (체력/배고픔/정신력 회복)
- 소스: table_winters_feast.lua, tuning.lua

## nightcaphat — Nightcap (수면 모자)
- 타입: 모자 (인벤토리 아이템)
- usage:
  - 수면 시 정신력 회복 30% 증가
  - 침낭/텐트/시에스타 수면 효과 향상
- 소스: hats.lua, tuning.lua

## perdfan — Lucky Fan (행운의 부채)
- 타입: 인벤토리 아이템
- uses: 9
- usage:
  - 부채질(일반): 1회 소모, 반경 7 내 불/훈소 소화, 대상 체온 최저 2.5도까지 냉각 (최대 -50도 감소)
  - 회오리 소환(채널링): 추가 2회 소모 (총 3회), 잔여 3회 이상 필요, 지속 2초
  - 총 사용: 부채질만 9회, 또는 회오리 3회 + 부채질 0회
- 소스: fans.lua, tuning.lua

## cattoy_mouse — Wind-up Mouse Toy (태엽 생쥐 장난감)
- 타입: 인벤토리 아이템
- usage:
  - 고양이 장난감
- 소스: cattoy.lua

## mapscroll — Map Scroll (지도)
- 타입: 인벤토리 아이템
- usage:
  - 제작자의 탐사 지도를 기록
  - 다른 플레이어에게 지도 정보 전달 가능
- 가연성: 예
- 소스: mapscroll.lua

## miniboatlantern — Floating Lantern (유등)
- 타입: 인벤토리 아이템 (수면 배치)
- fuel: 2880초 (6일, 마법 연료 타입, 재충전 불가)
- usage:
  - 수면 위에서 자율 이동하는 조명 (반경 1.2, 강도 0.8)
  - 이동 속도 0.4
  - 연료 소진 시 풍선 분리
- 소스: miniboatlantern.lua, tuning.lua

## floatinglantern — Sky Lantern (풍등)
- 타입: 인벤토리 아이템
- fuel: 960초 (2일, 마법 연료 타입, 재충전 불가)
- usage:
  - 배치 시 하늘로 상승하는 조명
  - 연료에 따라 4단계 높이 (12/9/6/2)
  - 비/달우박 시 연료 소모 가속
  - 비행 중 전역 미니맵 아이콘 표시
- 소스: floatinglantern.lua, tuning.lua

## redlantern — Red Lantern (붉은 등불)
- 타입: 인벤토리 아이템 (손 장비)
- fuel: 5760초 (12일, 마법 연료 타입, 재충전 불가)
- usage:
  - 손에 장착하는 조명 (반경 1.2, 강도 0.8, 붉은색)
  - 비 올 때 연료 소모 25% 가속
- 가연성: 예
- 소스: redlantern.lua, tuning.lua

## firecrackers — Red Firecrackers (빨간 폭죽)
- 타입: 소모품
- 스택: 40
- usage:
  - 점화 시 반경 10 내 놀래킬 수 있는 개체를 놀래킴
  - 폭발 횟수: 스택 크기에 비례
- 소스: firecrackers.lua, tuning.lua

## ticoon_builder — Ticoon (호쿤)
- 타입: 소모품 (사용 시 소멸)
- usage:
  - 사용 시 호쿤(길잡이 고양이) 소환
  - 호쿤은 아직 발견하지 않은 킷쿤 위치로 안내
- 소스: ticoon.lua

## boards_bunch — Bunch o' Boards (판자 묶음)
- 타입: 인벤토리 아이템
- usage:
  - 판자 5개 묶음 — 건설 시 재료 일괄 투입용
  - 사용 시 판자 5개로 분리
- 소스: boards.lua

## cutstone_bunch — Bunch o' Stone (석재 묶음)
- 타입: 인벤토리 아이템
- usage:
  - 석재 5개 묶음 — 건설 시 재료 일괄 투입용
  - 사용 시 석재 5개로 분리
- 소스: cutstone.lua

---

## 위노나 구조물 키트

## winona_battery_low_item — Winona's Generator Kit (위노나의 발전기)
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 설치 시 위노나의 발전기 배치
  - 화학 연료(초석) 사용, 최대 연료 180초 (소모율 0.375 → 실효 1일)
  - 회로 범위: 6.6
- 소스: winona_battery.lua, tuning.lua

## winona_battery_high_item — Winona's G.E.M.erator Kit (위노나의 발G.E.M.기)
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 설치 시 위노나의 고급 발전기 배치
  - 마법 연료(보석) 사용, 최대 연료 2880초 (6일분)
  - 회로 범위: 6.6
- 소스: winona_battery.lua, tuning.lua

## winona_spotlight_item — Winona's Spotlight Kit (위노나의 조명기)
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 설치 시 위노나의 조명기 배치
  - 빛 반경 ~4.3, 최소 범위 5.4, 최대 범위 24
  - 전력 소모: 작동 시 0.5, 대기 시 0.05
- 소스: winona_spotlight.lua, tuning.lua

---

## 베개류 — 손 베개 (토끼의 해 베개 싸움용)

> 베개 싸움 전용 장비. 피해 0, 넉백 효과만 있음.

## handpillow_petals — Flowery Pillow (꽃잎 베개)
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 1.0, 경직: 0.75
- 소스: handpillow.lua, tuning.lua

## handpillow_kelp — Kelp-Stuffed Pillow (다시마 베개)
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 1.4, 경직: 0.60
- 소스: handpillow.lua, tuning.lua

## handpillow_beefalowool — Beefalo Wool Pillow (비팔로 털 베개)
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 1.8, 경직: 0.40
- 소스: handpillow.lua, tuning.lua

## handpillow_steelwool — Steel Wool Pillow (강철 솜 베개)
- 타입: 손 장비 (피해 0)
- usage:
  - 넉백 강도: 2.2, 경직: 0.20
- 소스: handpillow.lua, tuning.lua

---

## 베개류 — 몸통 베개 (토끼의 해 베개 싸움용)

> 베개 싸움 전용 방어구. 피해 감소율만 있음.

## bodypillow_petals — Flowery Pillow Armor (꽃잎 베개 갑옷)
- 타입: 몸통 장비
- usage:
  - 피해 감소: 10%
- 소스: bodypillow.lua, tuning.lua

## bodypillow_kelp — Kelpy Pillow Armor (다시마 베개 갑옷)
- 타입: 몸통 장비
- usage:
  - 피해 감소: 30%
- 소스: bodypillow.lua, tuning.lua

## bodypillow_beefalowool — Beefalo Pillow Armor (비팔로 베개 갑옷)
- 타입: 몸통 장비
- usage:
  - 피해 감소: 50%
- 소스: bodypillow.lua, tuning.lua

## bodypillow_steelwool — Steel Wool Pillow Armor (강철 솜 베개 갑옷)
- 타입: 몸통 장비
- usage:
  - 피해 감소: 70%
- 소스: bodypillow.lua, tuning.lua

---

## 조각상류 — 조각상 (builders)

> 조각상 공통: 무거운 아이템 — 컨테이너 보관 불가, 몸통 슬롯 장착, 이동속도 85% 감소, 해머 1회, 재료 반환. 보름달/초승달에 그림자 체스말(룩/나이트/비숍)은 활성화되어 그림자 생물 소환 가능.

## chesspiece_anchor_builder — Anchor Figure (닻 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_antlion_builder — Antlion Figure (개미사자 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_bearger_builder — Bearger Figure (곰소리 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_bearger_mutated_builder — Armored Bearger Figure (무장 곰소리 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_beefalo_builder — Beefalo Figure (비팔로 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_beequeen_builder — Bee Queen Figure (여왕벌 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_bishop_builder — Bishop Figure (비숍 조각상)
- 체육 무게: 3
- usage: 보름달/초승달 활성화 (그림자 비숍 소환 가능)
- 소스: chesspieces.lua

## chesspiece_butterfly_builder — Moon Moth Figure (달 나방 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_carrat_builder — Carrat Figure (당근이쥐 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_catcoon_builder — Catcoon Figure (캣쿤 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_clayhound_builder — Hound Figure (사냥개 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_claywarg_builder — Varg Figure (바르그 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_crabking_builder — Crab King Figure (대게왕 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_daywalker_builder — Nightmare Werepig Figure (악몽화된 늑대돼지 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_daywalker2_builder — Scrappy Werepig Figure (고철덩이 늑대돼지 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_deerclops_builder — Deerclops Figure (외눈사슴 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_deerclops_mutated_builder — Crystal Deerclops Figure (수정 외눈사슴 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_dragonfly_builder — Dragonfly Figure (용파리 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_eyeofterror_builder — Eye Of Terror Figure (공포의 눈 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_formal_builder — Kingly Figure (킹 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_guardianphase3_builder — Celestial Champion Figure (천상의 대변자 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_kitcoon_builder — Kitcoon Figure (킷쿤 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_klaus_builder — Klaus Figure (클라우스 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_knight_builder — Knight Figure (나이트 조각상)
- 체육 무게: 3
- usage: 보름달/초승달 활성화 (그림자 나이트 소환 가능)
- 소스: chesspieces.lua

## chesspiece_malbatross_builder — Malbatross Figure (꽉새치 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_manrabbit_builder — Bunnyman Figure (토끼인간 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_minotaur_builder — Ancient Guardian Figure (고대 수호자 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_moon_builder — "Moon" Figure ("달" 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_moosegoose_builder — Moose/Goose Figure (큰사슴/거위 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_muse_builder — Queenly Figure (퀸 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_pawn_builder — Pawn Figure (폰 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_rook_builder — Rook Figure (룩 조각상)
- 체육 무게: 3
- usage: 보름달/초승달 활성화 (그림자 룩 소환 가능)
- 소스: chesspieces.lua

## chesspiece_sharkboi_builder — Frostjaw Figure (서리턱상어 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_stalker_builder — Ancient Fuelweaver Figure (고대의 연료직공 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_toadstool_builder — Toadstool Figure (독꺼비버섯 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_twinsofterror_builder — Twins of Terror Figure (공포의 쌍둥이 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_wagboss_lunar_builder — Celestial Scion Figure (천상의 귀공자 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_wagboss_robot_builder — W.A.R.B.O.T. Figure (W.A.R.B.O.T. 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_warg_mutated_builder — Possessed Varg Figure (귀신들린 바르그 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_wormboss_builder — Great Depths Worm Figure (거대 동굴 지렁이 조각상)
- 체육 무게: 4
- 소스: chesspieces.lua

## chesspiece_yotd_builder — Start Tower Figure (출발점 탑 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_yoth_builder — Gilded Knight (금박 나이트 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

## chesspiece_yots_builder — Gilded Depths Worm Figure (금박 동굴 지렁이 조각상)
- 체육 무게: 3
- 소스: chesspieces.lua

---

## 조각상류 — 도면 (sketches)

> 도면 공통: 도예가의 돌림판에서 해당 조각상 제작법 해금. 사용 시 소모.

## chesspiece_beefalo_sketch — Beefalo Figure Sketch (비팔로 조각상 도면)
- 소스: sketch.lua

## chesspiece_carrat_sketch — Carrat Figure Sketch (당근이쥐 조각상 도면)
- 소스: sketch.lua

## chesspiece_catcoon_sketch — Catcoon Figure Sketch (캣쿤 조각상 도면)
- 소스: sketch.lua

## chesspiece_clayhound_sketch — Hound Figure Sketch (사냥개 조각상 도면)
- 소스: sketch.lua

## chesspiece_claywarg_sketch — Clay Varg Figure Sketch (점토 바르그 조각상 도면)
- 소스: sketch.lua

## chesspiece_kitcoon_sketch — Kitcoon Figure Sketch (킷쿤 조각상 도면)
- 소스: sketch.lua

## chesspiece_manrabbit_sketch — Bunnyman Figure Sketch (토끼인간 조각상 도안)
- 소스: sketch.lua

## chesspiece_yotd_sketch — Start Tower Figure Sketch (출발점 탑 조각상 스케치)
- 소스: sketch.lua

## chesspiece_yoth_sketch — Gilded Knight Figure Sketch (금박 나이트 조각상 도면)
- 소스: sketch.lua

## chesspiece_yots_sketch — Gilded Depths Worm Figure Sketch (금박 동굴 지렁이 조각상 도면)
- 소스: sketch.lua

---

## 까악제 이벤트 (Carnival)

## carnival_gametoken — Cawnival Token (까악제 토큰)
- 타입: 인벤토리 아이템 (이벤트 화폐)
- 스택: 1
- 소스: carnival.lua

## carnival_gametoken_multiple — 3 Cawnival Tokens (까악제 토큰 3개)
- 타입: 인벤토리 아이템 (이벤트 화폐)
- 소스: carnival.lua

## carnival_plaza_kit — Cawnival Sapling (까악제 묘목)
- 타입: 구조물 (배치형)
- usage:
  - 까악제 이벤트 중심 나무
- 소스: carnival_plaza.lua

## carnival_popcorn — Popcorn (팝콘)
- 타입: 소모품
- 스택: 40
- 소스: carnival.lua

## carnival_prizebooth_kit — Prize Booth Kit (경품 교환소)
- 타입: 구조물 (배치형)
- 해머 횟수: 1회
- usage:
  - 까악제 경품 교환
- 소스: carnival_prizebooth.lua

## carnival_seedpacket — Seed Clusters (씨앗 강정)
- 타입: 소모품
- 스택: 40
- 소스: carnival.lua

## carnival_vest_a — Chirpy Scarf (재잘재잘 스카프)
- 타입: 몸통 장비
- dapperness: +0.042/s
- 여름 단열: 120
- fuel: 2400초 (5일, 사용 연료 타입)
- 소스: carnival.lua, tuning.lua

## carnival_vest_b — Chirpy Cloak (재잘재잘 망토)
- 타입: 몸통 장비
- dapperness: +0.042/s
- 여름 단열: 240
- fuel: 2400초 (5일, 사용 연료 타입)
- 소스: carnival.lua, tuning.lua

## carnival_vest_c — Chirpy Capelet (재잘재잘 케이플릿)
- 타입: 몸통 장비
- dapperness: +0.042/s
- 여름 단열: 240
- fuel: 2400초 (5일, 사용 연료 타입)
- 소스: carnival.lua, tuning.lua

## carnivalcannon_confetti_kit — Confetti Cannon Kit (꽃가루 대포 키트)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivalcannon.lua

## carnivalcannon_sparkle_kit — Glitter Cannon Kit (반짝이 대포 키트)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivalcannon.lua

## carnivalcannon_streamer_kit — Streamer Cannon Kit (색 테이프 대포 키트)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivalcannon.lua

## carnivaldecor_banner_kit — Light Catcher Kit (선캐처 키트)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivaldecor_eggride1_kit — Mini Ferris Wheel Kit (꼬마 관람차 키트)
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회
- usage:
  - 활성화 시간: 30초, 토큰 시간: 2400초
- 소스: carnivaldecor.lua, tuning.lua

## carnivaldecor_eggride2_kit — Mini Swing Carousel Kit (꼬마 회전 그네 키트)
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivaldecor_eggride3_kit — Mini Pendulum Ride Kit (꼬마 바이킹 키트)
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivaldecor_eggride4_kit — Mini Tower Drop Kit (꼬마 자이로드롭 키트)
- 타입: 구조물 (배치형, 이벤트 놀이기구)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivaldecor_figure_kit — Green Mystery Box (녹색 수수께끼의 상자)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivaldecor_figure_kit_season2 — Gold Mystery Box (황금 수수께끼의 상자)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivaldecor_lamp_kit — Midsummer Night Light Kit (한여름 밤의 등불 키트)
- 타입: 구조물 (배치형, 이벤트 조명)
- 해머 횟수: 1회
- usage:
  - 활성화 시간: 60초, 토큰 시간: 480초
- 소스: carnivaldecor.lua, tuning.lua

## carnivaldecor_plant_kit — Miniature Tree Kit (아주 작은 나무 키트)
- 타입: 구조물 (배치형, 이벤트 장식)
- 해머 횟수: 1회
- 소스: carnivaldecor.lua

## carnivalfood_corntea — Corny Slush (옥수수 슬러시)
- 타입: 소모품
- 스택: 40
- 포만도: 9.375
- 체력: 0
- 정신력: +5
- 온도: -40, 15초간 (냉각 음료)
- 유통기한: 1440초 (3일)
- 소스: carnival.lua, tuning.lua

## carnivalgame_feedchicks_kit — Hubbub for Grub Kit (오물오물 냠냠 키트)
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회
- 소스: carnivalgame.lua

## carnivalgame_herding_kit — Egg Scramble Kit (요리조리 달걀 키트)
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회
- 소스: carnivalgame.lua

## carnivalgame_memory_kit — Eggs in a Basket Kit (바구니 속 달걀 키트)
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회
- 소스: carnivalgame.lua

## carnivalgame_puckdrop_kit — Birdhouse Ball Drop Kit (새장에 공떨구기 키트)
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회
- 소스: carnivalgame.lua

## carnivalgame_shooting_kit — Nest Defender Kit (둥지를 지켜라 키트)
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회
- 소스: carnivalgame.lua

## carnivalgame_wheelspin_kit — Cuckoo Spinwheel Kit (뻐꾸기 돌림판 키트)
- 타입: 구조물 (배치형, 이벤트 게임)
- 해머 횟수: 1회
- 소스: carnivalgame.lua

---

## 겨울 축제 요리 (Winter's Feast Cooking)

> 겨울 축제 오븐에서 제작. 겨울 축제 탁자에 배치하여 축제 버프 제공용.

## wintercooking_berrysauce — Merry Berrysauce (즐거운 베리 소스)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_bibingka — Bibingka (비빙카)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_cabbagerolls — Cabbage Rolls (양배추쌈)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_festivefish — Festive Fish Dish (명절 생선 요리)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_gravy — Good Gravy (맛있는 그레이비)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_latkes — Latkes (감자 부침)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_lutefisk — Lutefisk (루테피스크)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_mulleddrink — Mulled Punch (멀드와인 펀치)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_panettone — Panettone (파네토네)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_pavlova — Pavlova (파블로바)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_pickledherring — Pickled Herring (절인 청어)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_polishcookie — Polish Cookies (폴란드식 쿠키)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_pumpkinpie — Pumpkin Pie (호박 파이)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_roastturkey — Roasted Turkey (칠면조 구이)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_stuffing — Stuffing (스터핑)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_sweetpotato — Sweet Potato Casserole (고구마 캐서롤)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_tamales — Tamales (타말)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

## wintercooking_tourtiere — Tourtiere (투르티에르)
- 타입: 겨울 축제 음식
- 소스: wintercooking.lua

---

## 할로윈 (Halloween)

## halloween_experiment_bravery — Phobic Experiment (공포증 실험)
- 타입: 소모품 (이벤트)
- 소스: halloween_experiment.lua

## halloween_experiment_health — Sanguine Experiment (핏빛 실험)
- 타입: 소모품 (이벤트)
- 소스: halloween_experiment.lua

## halloween_experiment_moon — Lunar Experiment (달빛 실험)
- 타입: 소모품 (이벤트)
- 소스: halloween_experiment.lua

## halloween_experiment_root — Arboretum Experiment (수목학 실험)
- 타입: 소모품 (이벤트)
- 소스: halloween_experiment.lua

## halloween_experiment_sanity — Psychosis Experiment (향정신성 실험)
- 타입: 소모품 (이벤트)
- 소스: halloween_experiment.lua

## halloween_experiment_volatile — Sulfuric Experiment (유황 실험)
- 타입: 소모품 (이벤트)
- 소스: halloween_experiment.lua

---

## 비팔로의 해 (Year of the Beefalo)

## yotb_pattern_fragment_1 — Fearsome Pattern Scrap (무서움의 양식 조각)
- 타입: 인벤토리 아이템 (제작 재료)
- 소스: yotb.lua

## yotb_pattern_fragment_2 — Formal Pattern Scrap (단정함의 양식 조각)
- 타입: 인벤토리 아이템 (제작 재료)
- 소스: yotb.lua

## yotb_pattern_fragment_3 — Festive Pattern Scrap (화려함의 양식 조각)
- 타입: 인벤토리 아이템 (제작 재료)
- 소스: yotb.lua

## yotb_post_item — Beefalo Stage (비팔로 무대)
- 타입: 구조물 (배치형, 이벤트)
- 해머 횟수: 4회
- 소스: yotb.lua

## yotb_sewingmachine_item — Sewing Machine Kit (재봉틀 키트)
- 타입: 구조물 (배치형, 이벤트)
- 해머 횟수: 4회
- usage:
  - 비팔로 의상 제작용 컨테이너
- 소스: yotb.lua

## yotb_stage_item — Judge's Booth (심사위원석)
- 타입: 구조물 (배치형, 이벤트)
- 해머 횟수: 4회
- usage:
  - 비팔로 미인대회 심사용
- 소스: yotb.lua

---

## 당근이쥐의 해 (Year of the Carrat)

## yotc_carrat_gym_direction_item — Navigation Gym Kit (탐색 훈련 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 방향감각 훈련
- 소스: yotc_carrat_gym.lua

## yotc_carrat_gym_reaction_item — Reflex Gym Kit (민첩성 훈련 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 반응속도 훈련
- 소스: yotc_carrat_gym.lua

## yotc_carrat_gym_speed_item — Speed Gym Kit (달리기 훈련 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 속도 훈련
- 소스: yotc_carrat_gym.lua

## yotc_carrat_gym_stamina_item — Endurance Gym Kit (지구력 훈련 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 체력 훈련
- 소스: yotc_carrat_gym.lua

## yotc_carrat_race_checkpoint_item — Checkpoint Kit (체크포인트 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 경주 체크포인트
- 소스: yotc_carrat_race.lua

## yotc_carrat_race_finish_item — Finish Line Kit (결승선 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 경주 결승선
- 소스: yotc_carrat_race.lua

## yotc_carrat_race_start_item — Starting Point Kit (시작점 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 경주 출발점
- 소스: yotc_carrat_race.lua

## yotc_carrat_scale_item — Carrat Scale Kit (당근이쥐 저울 키트)
- 타입: 구조물 (배치형, 이벤트)
- usage: 당근이쥐 능력치 측정
- 소스: yotc_carrat_scale.lua

## yotc_seedpacket — Packet of Seeds (씨앗 주머니)
- 타입: 소모품 (이벤트)
- 소스: yotc.lua

## yotc_seedpacket_rare — Premium Seed Packet (고급 씨앗 주머니)
- 타입: 소모품 (이벤트)
- 소스: yotc.lua

## yotc_shrinecarrat — Shrinecarrat (당근이쥐 사당)
- 타입: 구조물 (이벤트)
- 소스: yotc_carratshrine.lua

---

## 용의 해 (Year of the Dragon)

## dragonboat_kit — Dragonfly Boat Kit (용파리선 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 용파리선 배치: HP 200, 반경 3.0
- 소스: dragonboat.lua, tuning.lua

## dragonboat_pack — Decked-Out Dragonfly Boat Kit (치장된 용파리선 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage:
  - 장비 포함 용파리선 일괄 배치
- 소스: dragonboat.lua

## dragonheadhat — Lucky Beast Head (영물의 머리)
- 타입: 모자 (머리 장비)
- fuel: 480초 (1일, 사용 연료 타입, 춤 동작 중만 소모)
- usage:
  - 용춤 3인 세트의 머리 부분
  - 3인 세트 완성 시 dapperness 최대 +0.069/s
- 소스: dragonheadhat.lua, tuning.lua

## dragonbodyhat — Lucky Beast Body (영물의 몸통)
- 타입: 모자 (머리 장비)
- fuel: 480초 (1일, 사용 연료 타입, 춤 동작 중만 소모)
- usage:
  - 용춤 3인 세트의 몸통 부분
- 소스: dragonbodyhat.lua, tuning.lua

## dragontailhat — Lucky Beast Tail (영물의 꼬리)
- 타입: 모자 (머리 장비)
- fuel: 480초 (1일, 사용 연료 타입, 춤 동작 중만 소모)
- usage:
  - 용춤 3인 세트의 꼬리 부분
- 소스: dragontailhat.lua, tuning.lua

## mast_yotd_item — Dragonfly Wing Mast Kit (용파리 날개돛 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 돛 설치
- 소스: mast.lua

## mastupgrade_lamp_item_yotd — Dragonfly Light Kit (용파리등 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 돛 조명 업그레이드
- 소스: mastupgrade.lua

## boat_bumper_yotd_kit — Fanged Bumper Kit (송곳니 범퍼 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 범퍼
- 소스: boat_bumper.lua

## boatrace_checkpoint_throwable_deploykit — Race Checkpoint Kit (경주 체크포인트 키트)
- 타입: 인벤토리 아이템 (투척 배치형)
- usage: 용선 경주 체크포인트 설치
- 소스: boatrace.lua

## boatrace_seastack_throwable_deploykit — Golden Buoy Kit (황금 부표 키트)
- 타입: 인벤토리 아이템 (투척 배치형)
- usage: 용선 경주 부표 설치
- 소스: boatrace.lua

## boatrace_start_throwable_deploykit — Start Tower Kit (출발점 탑 키트)
- 타입: 인벤토리 아이템 (투척 배치형)
- usage: 용선 경주 출발 탑 설치
- 소스: boatrace.lua

## yotd_anchor_item — Claw Anchor Kit (발톱 닻 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 닻
- 소스: yotd.lua

## yotd_boatpatch_proxy — Boatpatch Proxy (수선용 판자)
- 타입: 인벤토리 아이템
- usage: 용파리선 수리용
- 소스: yotd.lua

## yotd_oar — Claw Oar (발톱 노)
- 타입: 인벤토리 아이템 (손 장비)
- usage: 용파리선 전용 노
- 소스: yotd.lua

## yotd_steeringwheel_item — Dragonfly Boat Wheel Kit (용파리선 타륜 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: 용파리선 전용 타륜
- 소스: yotd.lua

---

## 말의 해 (Year of the Horse)

## yoth_chair_rocking_item — Rocking Mare Kit (흔들목마 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: 흔들목마 구조물 설치 (앉기 가능)
- 소스: yoth.lua

## yoth_knightstick — Shtick Horse (목마)
- 타입: 손 장비
- damage: 17
- fuel: 2880초 (6일, 사용 연료 타입, 걷기 중 소모)
- speed_mult: 1.15~1.60 (질주 시 가속)
- usage:
  - 질주 시 배고픔 소모율 33% 증가
  - 최대 질주 횟수: 30
- 소스: yoth.lua, tuning.lua

---

## 돼지의 해 (Year of the Pig)

## yotp_food1 — Tribute Roast (제사상 구이)
- 타입: 소모품
- 스택: 40
- 체력: +12
- 포만도: 150
- 정신력: +5
- 유통기한: 7200초 (15일)
- 소스: yotp.lua, tuning.lua

## yotp_food2 — Eight Treasure Mud Pie (팔보토죽)
- 타입: 소모품
- 스택: 40
- 체력: 0
- 포만도: 150
- 정신력: 0
- 유통기한: 없음
- 소스: yotp.lua, tuning.lua

## yotp_food3 — Fish Heads on a Stick (생선 머리 꼬치)
- 타입: 소모품
- 스택: 40
- 체력: +6
- 포만도: 75
- 정신력: +1
- 유통기한: 7200초 (15일)
- 소스: yotp.lua, tuning.lua

---

## 토끼의 해 (Year of the Rabbit)

## yotr_decor_1_item — Short Rabbit Lamp (작은 토끼등)
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage: 이벤트 장식 조명
- 소스: yotr_decor.lua

## yotr_decor_2_item — Tall Rabbit Lamp (큰 토끼등)
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage: 이벤트 장식 조명
- 소스: yotr_decor.lua

## yotr_fightring_kit — Pillow Fight Pit Kit (베개 싸움 투기장 키트)
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 베개 싸움 미니게임 활성화
  - 최대 상품: 10개
- 소스: yotr_fightring.lua, tuning.lua

## yotr_food1 — Bunny Roll (토끼 롤케이크)
- 타입: 소모품
- 스택: 40
- 체력: +15
- 포만도: 75
- 정신력: +8.25
- 유통기한: 7200초 (15일)
- 소스: yotr.lua, tuning.lua

## yotr_food2 — Moon Cake (달떡)
- 타입: 소모품
- 스택: 40
- 체력: +60
- 포만도: 18.75
- 정신력: +8.25
- 유통기한: 7200초 (15일)
- 소스: yotr.lua, tuning.lua

## yotr_food3 — Moon Jelly (달 젤리)
- 타입: 소모품
- 스택: 40
- 체력: +15
- 포만도: 18.75
- 정신력: +33
- 유통기한: 7200초 (15일)
- 소스: yotr.lua, tuning.lua

## yotr_food4 — Skewered Puffs (떡꼬치)
- 타입: 소모품
- 스택: 40
- 체력: +30
- 포만도: 37.5
- 정신력: +16.5
- 유통기한: 7200초 (15일)
- 소스: yotr.lua, tuning.lua

## yotr_token — Glove of Challenge (도전의 장갑)
- 타입: 인벤토리 아이템 (이벤트 토큰)
- usage: 베개 싸움 도전용
- 소스: yotr.lua

---

## 뱀의 해 (Year of the Snake)

## yots_lantern_post_item — Jubilantern Post Kit (의기양양 가로등 키트)
- 타입: 구조물 (배치형)
- usage:
  - 이벤트 가로등 — 최대 연료 960초 (2일)
- 소스: yots.lua, tuning.lua

---

## 은둔자/진주 관련 (Hermit Crab)

## hermitcrab_lightpost — Pearl's Light Post (진주의 가로등)
- 타입: 구조물
- usage: 은둔자 섬 가로등
- 소스: hermitcrab.lua

## hermitcrab_relocation_kit — Hermit Rehomer (은둔자 이사기)
- 타입: 인벤토리 아이템
- usage: 은둔게의 집 이전용
- 소스: hermitcrab.lua

## hermitcrab_teashop — Pearl's Tea Shop (진주네 찻집)
- 타입: 구조물
- usage: 진주의 찻집 건설
- 소스: hermitcrab.lua

## hermithotspring_constr — Hot Spring (온천)
- 타입: 구조물 (건설)
- usage: 은둔자 섬 온천 건설
- 소스: hermithotspring.lua

## hermithouse_ornament — Wind Charm (풍경)
- 타입: 인벤토리 아이템
- usage: 은둔자 집 장식
- 소스: hermithouse.lua

---

## 은둔자 상점 (Hermit Shop)

> 진주에게서 구매하는 아이템. 실제 아이템은 각 카테고리 md 참조.

## hermitshop_chum — Fish Food (물고기 밥)
- 타입: 구매 아이템
- 소스: hermitshop.lua

## hermitshop_chum_blueprint — Fish Food Blueprint (물고기 밥 청사진)
- 타입: 구매 아이템 (청사진)
- 소스: hermitshop.lua

## hermitshop_hermit_bundle_shells — Shell Bell Bundle (소리고둥 묶음)
- 타입: 구매 아이템
- 소스: hermitshop.lua

## hermitshop_oceanfishingbobber_canary — Saffron Quill Float (노란 깃털 찌)
- 타입: 구매 아이템 (낚시 찌)
- 소스: hermitshop.lua

## hermitshop_oceanfishingbobber_crow — Jet Quill Float (검은 깃털 찌)
- 타입: 구매 아이템 (낚시 찌)
- 소스: hermitshop.lua

## hermitshop_oceanfishingbobber_goose — Down Quill Float (솜깃 찌)
- 타입: 구매 아이템 (낚시 찌)
- 소스: hermitshop.lua

## hermitshop_oceanfishingbobber_malbatross — Malbatross Quill Float (꽉새치 깃털 찌)
- 타입: 구매 아이템 (낚시 찌)
- 소스: hermitshop.lua

## hermitshop_oceanfishingbobber_robin — Crimson Quill Float (붉은 깃털 찌)
- 타입: 구매 아이템 (낚시 찌)
- 소스: hermitshop.lua

## hermitshop_oceanfishingbobber_robin_winter — Azure Quill Float (푸른 깃털 찌)
- 타입: 구매 아이템 (낚시 찌)
- 소스: hermitshop.lua

## hermitshop_oceanfishinglure_hermit_drowsy — Stupefying Lure (바보의 루어)
- 타입: 구매 아이템 (낚시 루어)
- 소스: hermitshop.lua

## hermitshop_oceanfishinglure_hermit_heavy — Heavy Weighted Lure (묵직한 루어)
- 타입: 구매 아이템 (낚시 루어)
- 소스: hermitshop.lua

## hermitshop_oceanfishinglure_hermit_rain — Rainy Day Lure (우천의 루어)
- 타입: 구매 아이템 (낚시 루어)
- 소스: hermitshop.lua

## hermitshop_oceanfishinglure_hermit_snow — Snow Day Lure (강설의 루어)
- 타입: 구매 아이템 (낚시 루어)
- 소스: hermitshop.lua

## hermitshop_supertacklecontainer — Spectackler Box (멋에 찌든 도구함)
- 타입: 구매 아이템 (낚시 도구함)
- 소스: hermitshop.lua

## hermitshop_tacklecontainer — Tackle Box (낚시 도구함)
- 타입: 구매 아이템 (낚시 도구함)
- 소스: hermitshop.lua

## hermitshop_turf_shellbeach_blueprint — Shell Turf Blueprint (조개 껍질 바닥 청사진)
- 타입: 구매 아이템 (청사진)
- 소스: hermitshop.lua

## hermitshop_winch_blueprint — Pinchin' Winch Blueprint (집게 도르래 청사진)
- 타입: 구매 아이템 (청사진)
- 소스: hermitshop.lua

## hermitshop_winter_ornament_boss_hermithouse — Sentimental Adornment (감성적인 장식품)
- 타입: 구매 아이템 (겨울 장식)
- 소스: hermitshop.lua

## hermitshop_winter_ornament_boss_pearl — Sentimental Adornment (감성적인 장식품)
- 타입: 구매 아이템 (겨울 장식)
- 소스: hermitshop.lua

---

## 엽합기 (Shell Weaver)

> 은둔자 섬의 엽합기에서 제작하는 아이템.

## shellweaver — Combriner (엽합기)
- 타입: 구조물 (프로토타이퍼)
- 해머 횟수: 3회
- usage:
  - 엽합기 테크 레벨 1/2 해금
  - 조리 기능 (6초)
- 소스: shellweaver.lua

## shellweaver_desiccant — Desiccant Pouch (흡습제 주머니)
- 타입: 인벤토리 아이템
- 소스: shellweaver.lua

## shellweaver_desiccantboosted — Desiccant Sack (흡습제 포대)
- 타입: 인벤토리 아이템
- 소스: shellweaver.lua

## shellweaver_hermitcrab_shell — Portage Conch (보내는 고둥)
- 타입: 인벤토리 아이템
- 소스: shellweaver.lua

## shellweaver_icestaff2 — Flash Freeze Staff (빙결 지팡이)
- 타입: 인벤토리 아이템 (무기)
- 소스: shellweaver.lua

## shellweaver_icestaff3 — Deep Freeze Staff (냉동 지팡이)
- 타입: 인벤토리 아이템 (무기)
- 소스: shellweaver.lua

## shellweaver_messagebottleempty — Empty Bottle (빈 병)
- 타입: 인벤토리 아이템
- 소스: shellweaver.lua

## shellweaver_nonslipgrit — Grit Duster (소금 뿌리개)
- 타입: 인벤토리 아이템
- 소스: shellweaver.lua

## shellweaver_nonslipgritboosted — Grit Grinder (소금 갈개)
- 타입: 인벤토리 아이템
- 소스: shellweaver.lua

## shellweaver_salty_doghat — Salty Dog (짭짤개 모자)
- 타입: 모자 (머리 장비)
- 소스: shellweaver.lua

---

## 방랑 상인 (Wandering Trader Shop)

> 방랑 상인(피그 킹 이벤트)에게서 구매하는 재료 아이템.

## wanderingtradershop_bluegem — Blue Gem (푸른 보석)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_cutgrass — Cut Grass (풀 줄기)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_cutreeds — Cut Reeds (갈대 줄기)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_flint — Flint (부싯돌)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_gears — Gears (톱니바퀴)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_livinglog — Living Log (생목)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_moonglass — Moon Shard (달 파편)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_pigskin — Pig Skin (돼지 가죽)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_redgem — Red Gem (붉은 보석)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

## wanderingtradershop_twigs — Twigs (잔가지)
- 타입: 구매 아이템
- 소스: wanderingtradershop.lua

---

## 토끼왕 상점 (Rabbit King Shop)

## rabbitkingshop_armor_carrotlure — Coat of Carrots (당근 휘장)
- 타입: 구매 아이템 (몸통 장비)
- 소스: rabbitkingshop.lua

## rabbitkingshop_hat_rabbit — Hat Rabbit (토끼장관)
- 타입: 구매 아이템 (모자)
- 소스: rabbitkingshop.lua

## rabbitkingshop_rabbitkinghorn — Burrowing Horn (토끼 굴피리)
- 타입: 구매 아이템
- 소스: rabbitkingshop.lua

---

## 와그펑크 (Wagpunk)

## wagboss_robot_constructionsite_kit — W.A.R.B.O.T. Base Kit (W.A.R.B.O.T. 기단부 키트)
- 타입: 인벤토리 아이템 (배치형)
- usage: W.A.R.B.O.T. 건설 기지 설치
- 소스: wagboss_robot.lua

## wagboss_robot_creation_parts — W.A.R.B.O.T. Parts (W.A.R.B.O.T. 부품)
- 타입: 인벤토리 아이템 (건설 재료)
- usage: W.A.R.B.O.T. 건설에 필요한 부품
- 소스: wagboss_robot.lua

## wagpunk_workstation_blueprint_moon_device_construction1 — Incomplete Experiment (미완성 실험)
- 타입: 구매 아이템 (청사진)
- usage: 와그펑크 워크스테이션에서 미완의 실험 제작법 해금
- 소스: wagpunk_workstation.lua

## wagpunk_workstation_blueprint_moonstorm_goggleshat — Astroggles (천문 고글)
- 타입: 구매 아이템 (청사진)
- usage: 와그펑크 워크스테이션에서 우주 고글 제작법 해금
- 소스: wagpunk_workstation.lua

## wagpunk_workstation_moonstorm_static_catcher — Static Restrainer (정전기 포집기)
- 타입: 인벤토리 아이템
- usage: 달폭풍 이벤트 관련 장비
- 소스: wagpunk_workstation.lua

## wagpunk_workstation_security_pulse_cage — Spark Ark (보안 펄스 케이지)
- 타입: 인벤토리 아이템
- usage: 달폭풍 이벤트 관련 장비
- 소스: wagpunk_workstation.lua

---

## 킷쿤 (Kitcoon)

## kitcoon_nametag — Kit Collar (고양이 목줄)
- 타입: 인벤토리 아이템 (1회용)
- usage:
  - 킷쿤에게 이름 부여 (사용 후 소멸)
- 소스: kitcoon_nametag.lua

## kitcoondecor1_kit — Gobbler Wobbler Kit (오뚝이 칠면조 키트)
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 킷쿤 장난감 — 킷쿤이 놀이
- 가연성: 예
- 소스: kitcoondecor.lua

## kitcoondecor2_kit — Kit Teaser Kit (고양이 낚싯대 키트)
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 킷쿤 장난감 — 킷쿤이 놀이
- 가연성: 예
- 소스: kitcoondecor.lua

## kitcoonden_kit — Kitcoon Nursery Kit (킷쿤 보육원 키트)
- 타입: 구조물 (배치형)
- 해머 횟수: 4회
- usage:
  - 킷쿤 보육원 — 숨바꼭질 미니게임 (킷쿤 3마리 이상, 60초 제한, 반경 30)
- 가연성: 예
- 소스: kitcoonden.lua

---

## 다른 md에서 이미 다룬 아이템 (중복 제외)

| id | 한글명 | 참조 파일 |
|---|---|---|
| arrowsign_post | 방향 표지판 | decorations.md |
| blueprint_craftingset_ruins_builder | 유적 제작대 청사진 | ancient.md |
| blueprint_craftingset_ruinsglow_builder | 빛나는 유적 제작대 청사진 | ancient.md |
| carpentry_station | 목공 작업대 | prototypers.md |
| cartographydesk | 지도 제작대 | prototypers.md |
| cookpot | 요리솥 | cooking.md |
| deerclopseyeball_sentryward_kit | 눈꽃결정 생성기 키트 | lunar_forge.md |
| dock_kit | 부두 키트 | seafaring.md |
| dragonflychest | 비늘 상자 | storage.md |
| dragonflyfurnace | 용비늘 화로 | winter.md |
| endtable | 작은 탁자 | decorations.md |
| eyeturret_item | 하운디우스 슈티우스 키트 | ancient.md |
| fence_gate_item | 나무 대문 | decorations.md |
| fence_item | 나무 울타리 | decorations.md |
| firesuppressor | 눈보라 오매틱 | summer.md |
| homesign | 표지판 | decorations.md |
| icebox | 냉장고 | storage.md |
| lightning_rod | 피뢰침 | rain.md |
| madscience_lab | 매드 사이언스 기계 | prototypers.md |
| magician_chest | 마술 상자 | magic.md |
| meatrack | 건조대 | cooking.md |
| mermhouse_crafted | 머맨 하우스 | character.md |
| mermthrone_construction | 왕실 직조기 | character.md |
| mermwatchtower | 머맨 감시탑 | character.md |
| mighty_gym | 울끈불끈 체육관 | character.md |
| minisign_item | 작은 표지판 | decorations.md |
| moondial | 달시계 | magic.md |
| multiplayer_portal_moonrock_constr_plans | 포탈 도구 | celestial.md |
| mushroom_light | 머쉬라이트 | light.md |
| mushroom_light2 | 글로우캡 | light.md |
| nightlight | 어둠의 등불 | magic.md |
| ocean_trawler_kit | 바다 어망 키트 | food_gardening.md |
| perdshrine | 칠면조 사당 | prototypers.md |
| pigshrine | 돼지 사당 | prototypers.md |
| punchingbag_lunar | 달빛 동네북씨 | magic.md |
| punchingbag_shadow | 그림자 동네북씨 | magic.md |
| rainometer | 비 측정기 | rain.md |
| researchlab | 과학 기계 | prototypers.md |
| researchlab2 | 연금술 엔진 | prototypers.md |
| researchlab3 | 그림자 조작기 | magic.md |
| researchlab4 | 요술 모자 장치 | magic.md |
| resurrectionstatue | 고기 우상 | magic.md |
| saltbox | 소금 상자 | storage.md |
| saltlick | 소금 덩이 | beefalo.md |
| saltlick_improved | 개량 소금 덩이 | beefalo.md |
| sculptingtable | 도예가의 돌림판 | prototypers.md |
| seafaring_prototyper | 씽크 탱크 | prototypers.md |
| sewing_mannequin | 마네킹 | decorations.md |
| siestahut | 시에스타 그늘막 | summer.md |
| sisturn | 자매의 헌화당 | character.md |
| spidereggsack | 거미 알 | character.md |
| tacklestation | 낚시 도구대 | prototypers.md |
| telebase | 순간이동 집중기 | magic.md |
| tent | 텐트 | winter.md |
| townportal | 게으른 도망자 | magic.md |
| treasurechest | 나무 상자 | storage.md |
| turfcraftingstation | 땅다지개 | prototypers.md |
| wagpunk_floor_kit | 기질 추론기 | seafaring.md |
| wall_dreadstone_item | 공포석 벽 | decorations.md |
| wall_hay_item | 풀 벽 | decorations.md |
| wall_moonrock_item | 월석 벽 | decorations.md |
| wall_ruins_item | 툴레사이트 벽 | ancient.md |
| wall_scrap_item | 고철 벽 | decorations.md |
| wall_stone_item | 돌 벽 | decorations.md |
| wall_wood_item | 나무 벽 | decorations.md |
| wargshrine | 바르그 사당 | prototypers.md |
| winona_battery_high | 위노나의 발G.E.M.기 | character.md |
| winona_battery_low | 위노나의 발전기 | character.md |
| winona_catapult | 위노나의 투석기 | weapons.md |
| winona_catapult_item | 위노나의 투석기 키트 | weapons.md |
| winona_spotlight | 위노나의 조명기 | character.md |
| winona_teleport_pad_item | 위노나의 텔레포트 패드 | character.md |
| winter_treestand | 축제 트리 화분 | decorations.md |
| winterometer | 온도계 | winter.md |
| wintersfeastoven | 겨울 축제 오븐 | cooking.md |
| yot_catcoonshrine | 캣쿤 사당 | prototypers.md |
| yotb_beefaloshrine | 비팔로 사당 | prototypers.md |
| yotc_carratshrine | 당근이쥐 사당 | prototypers.md |
| yotd_dragonshrine | 용 사당 | prototypers.md |
| yoth_knightshrine | 나이트 사당 | prototypers.md |
| yotr_rabbitshrine | 토끼 사당 | prototypers.md |
| yots_snakeshrine | 뱀 사당 | prototypers.md |
