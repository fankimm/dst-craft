# 장식 (Decorations) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: STACK_SIZE_MEDITEM=20, STACK_SIZE_LARGEITEM=10, HEAVY_SPEED_MULT=0.15
> 벽 공통: 설치 시 최대 HP의 50%로 배치, 치유 불가, 전기/오라 피해 면역

---

## 벽류

## wall_hay_item — Hay Wall (풀 벽)
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 100
- 설치 시 HP: 50
- 해머 횟수: 3회
- 수리 재료: 풀 (1개당 약 16.7 회복)
- 해머 전리품: 풀 (HP 비례, 최대 2개)
- 가연성: 예
- 소스: walls.lua, tuning.lua

## wall_wood_item — Wood Wall (나무 벽)
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 200
- 설치 시 HP: 100
- 해머 횟수: 3회
- 수리 재료: 통나무 (1개당 약 33.3 회복)
- 해머 전리품: 통나무 (HP 비례, 최대 2개)
- 가연성: 예
- 소스: walls.lua, tuning.lua

## wall_stone_item — Stone Wall (돌 벽)
- 타입: 벽 (배치형)
- 스택: 20
- 최대 HP: 400
- 설치 시 HP: 200
- 해머 횟수: 3회
- 수리 재료: 돌 (1개당 약 66.7 회복)
- 해머 전리품: 돌 (HP 비례, 최대 2개)
- 가연성: 화재 면역
- 소스: walls.lua, tuning.lua

## wall_moonrock_item — Moon Rock Wall (월석 벽)
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
- 소스: walls.lua, tuning.lua

## wall_dreadstone_item — Dreadstone Wall (공포석 벽)
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
- 소스: walls.lua, tuning.lua

## wall_scrap_item — Scrap Wall (고철 벽)
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
- 소스: walls.lua, tuning.lua

---

## 울타리류

## fence_item — Wood Fence (나무 울타리)
- 타입: 벽 (배치형)
- 스택: 20
- 설치 시 HP: 1 (모든 피해 흡수)
- 해머 횟수: 3회
- usage:
  - 이동 차단 및 경로 탐색 벽 역할
- 소스: fence.lua

## fence_gate_item — Wood Gate (나무 대문)
- 타입: 벽 (배치형)
- 스택: 20
- 설치 시 HP: 1 (모든 피해 흡수)
- 해머 횟수: 3회
- usage:
  - 플레이어가 열고 닫을 수 있는 문 역할
  - 닫혀 있을 때 이동 차단 및 경로 탐색 벽 역할
- 소스: fence.lua

---

## 바닥류 — 도로 (이동속도 30% 증가)

## turf_road — Cobblestones (자갈 길)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 도로
- usage:
  - 이동속도 30% 증가
- 소스: tiledefs.lua

## turf_cotl_brick — Brick Flooring (벽돌 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 도로
- usage:
  - 이동속도 30% 증가
- 소스: tiledefs.lua

---

## 바닥류 — 특수 효과

## turf_dragonfly — Scaled Flooring (비늘 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- usage:
  - 화재 확산 완전 방지
- 소스: tiledefs.lua

---

## 바닥류 — 바닥재 (단단한 지면)

> 아래 바닥재는 모두 바닥재 + 단단한 지면 속성. 이동속도 보너스 없음. 스택 20.

## turf_carpetfloor — Carpeted Flooring (카펫 깔린 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_carpetfloor2 — Lush Carpet (풍성한 카펫)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_checkerfloor — Checkered Flooring (체크무늬 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_cotl_gold — Gold Flooring (황금 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_woodfloor — Wooden Flooring (목제 마루)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_beard_rug — Beard Hair Rug (수염 깔개)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_mosaic_blue — Blue Mosaic Flooring (파랑 모자이크 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_mosaic_grey — Grey Mosaic Flooring (회색 모자이크 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

## turf_mosaic_red — Red Mosaic Flooring (빨강 모자이크 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면, 바닥재
- 소스: tiledefs.lua

---

## 바닥류 — 단단한 지면 (hard only)

> 아래 바닥은 단단한 지면 속성만 있음. 이동속도 보너스 없음. 스택 20.

## turf_archive — Ancient Stonework (고대 석조)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_vault — Ancient Sanctum Stonework (고대 성소 석조)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_rocky — Rocky Turf (바위 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_underrock — Cave Rock Turf (동굴 바위 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_vent — Cave Fumarole Turf (동굴 분기공 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_ruinsbrick — Ancient Flooring (고대의 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_ruinsbrick_glow — Imitation Ancient Flooring (모조품 고대의 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_ruinstiles — Ancient Tilework (고대의 타일 장식)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_ruinstiles_glow — Imitation Ancient Tilework (모조품 고대의 타일 장식)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_ruinstrim — Ancient Brickwork (고대의 벽돌 장식)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

## turf_ruinstrim_glow — Imitation Ancient Brickwork (모조품 고대의 벽돌 장식)
- 타입: 바닥 타일
- 스택: 20
- 지면: 단단한 지면
- 소스: tiledefs.lua

---

## 바닥류 — 자연 바이옴 (부드러운 지면)

> 아래 바닥은 특수 속성 없음. 스택 20.

## turf_grass — Grass Turf (잔디 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_forest — Forest Turf (숲 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_savanna — Savanna Turf (사바나 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_deciduous — Deciduous Turf (낙엽 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_desertdirt — Sandy Turf (모래 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_marsh — Marsh Turf (늪지 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_cave — Guano Turf (구아노 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_fungus — Fungal Turf (버섯 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_fungus_green — Fungal Turf (버섯 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_fungus_red — Fungal Turf (버섯 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_fungus_moon — Mutated Fungal Turf (돌연변이 버섯 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_mud — Mud Turf (진흙 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_sinkhole — Slimy Turf (미끈한 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_pebblebeach — Rocky Beach Turf (바위 해안 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_shellbeach — Shell Beach Turf (조개 껍질 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_meteor — Moon Crater Turf (월면 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

## turf_monkey_ground — Moon Quay Beach Turf (월숭이 섬 해변 바닥)
- 타입: 바닥 타일
- 스택: 20
- 지면: 부드러운 지면
- 소스: tiledefs.lua

---

## 가구류 — 의자

## wood_chair — Wooden Chair (나무 의자)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 예
- 소스: furniture_chairs.lua

## wood_stool — Wooden Stool (나무 걸상)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 예
- 소스: furniture_chairs.lua

## stone_chair — Stone Chair (돌 의자)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 화재 면역
- 소스: furniture_chairs.lua

## stone_stool — Stone Stool (돌 스툴)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음
- 가연성: 화재 면역
- 소스: furniture_chairs.lua

## hermit_chair_rocking — Driftwood Rocker (유목 흔들의자)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음 (흔들의자)
- 가연성: 예
- 소스: furniture_chairs.lua

---

## 가구류 — 탁자

## wood_table_round — Round Wooden Table (둥근 나무 탁자)
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 예
- 소스: furniture_tables.lua

## wood_table_square — Square Wooden Table (사각 나무 탁자)
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 예
- 소스: furniture_tables.lua

## stone_table_round — Stone Round Table (둥근 돌 탁자)
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 화재 면역
- 소스: furniture_tables.lua

## stone_table_square — Stone Square Table (사각 돌 탁자)
- 타입: 구조물
- 해머 횟수: 5회
- usage:
  - 탁상 장식품 1개 올려놓기 가능
- 가연성: 화재 면역
- 소스: furniture_tables.lua

---

## 가구류 — 기타

## endtable — End Table (작은 탁자)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 꽃꽂이 가능: 신선한 꽃 삽입 시 빛 방출 (반경 1.5, 강도 0.5), 정신력 +5
  - 꽃은 4800초(10일) 후 시듦
- 가연성: 예
- 소스: endtable.lua, tuning.lua

## wardrobe — Wardrobe (옷장)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 캐릭터 스킨 변경
- 가연성: 예
- 소스: wardrobe.lua

## sewing_mannequin — Mannequin (마네킹)
- 타입: 구조물
- 해머 횟수: 6회
- usage:
  - 장비 전시대: 머리/몸통/손 슬롯에 장비 장착 가능
  - 아이템을 주면 자동 장착, 슬롯이 차있으면 교체
  - 해머 시 장착된 모든 장비 드롭
- 가연성: 예
- 소스: sewing_mannequin.lua

---

## 표지판류

## homesign — Sign (표지판)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 글쓰기 가능
- 가연성: 예
- 소스: homesign.lua

## arrowsign_post — Directional Sign (방향 표지판)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 글쓰기 가능
  - 8방향 회전 가능
- 가연성: 예
- 소스: arrowsign.lua

## minisign_item — Mini Sign (작은 표지판)
- 타입: 인벤토리 아이템 (배치형)
- 스택: 10
- usage:
  - 설치 후 깃펜으로 아이템 이미지 그리기 가능
  - 삽으로 회수 (해머가 아닌 DIG 액션)
- 가연성: 예
- 소스: minisign.lua

---

## 화분류

## pottedfern — Potted Fern (양치식물 화분)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 순수 장식용 (랜덤 외형 1~10 변형)
- 가연성: 예
- 소스: pottedfern.lua

## succulent_potted — Potted Succulent (다육식물 화분)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 순수 장식용 (랜덤 외형 1~5 변형)
- 가연성: 예
- 소스: succulent_potted.lua

---

## 유물 장식류 — 모조 유물

## ruinsrelic_bowl — Replica Relic Bowl (모조 유물 그릇)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
- 소스: ruinsrelic.lua

## ruinsrelic_chair — Replica Relic Chair (모조 유물 의자)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 캐릭터가 앉을 수 있음 (불편한 의자)
  - 유적에서 셰이들링 유인 가능
- 소스: ruinsrelic.lua

## ruinsrelic_chipbowl — Replica Relic Dish (모조 유물 사발)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
- 소스: ruinsrelic.lua

## ruinsrelic_plate — Replica Relic Plate (모조 유물 접시)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
- 소스: ruinsrelic.lua

## ruinsrelic_table — Replica Relic Table (모조 유물 탁자)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 장식 탁자 (장애물 물리 반경 0.5)
- 소스: ruinsrelic.lua

## ruinsrelic_vase — Replica Relic Vase (모조 유물 꽃병)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
- 소스: ruinsrelic.lua

---

## 유물 장식류 — 모조 성소

## vaultrelic_bowl — Replica Sanctum Bowl (모조 성소 그릇)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
- 소스: vaultrelic.lua

## vaultrelic_planter — Replica Sanctum Planter (모조 성소 화분)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
- 소스: vaultrelic.lua

## vaultrelic_vase — Replica Sanctum Vase (모조 성소 꽃병)
- 타입: 인벤토리 아이템 (탁상 장식)
- 해머 횟수: 1회
- usage:
  - 탁자 위에 올려놓기 가능
  - 꽃꽂이 가능: 신선한 꽃 삽입 시 빛 방출 (반경 1.5, 강도 0.5)
- 소스: vaultrelic.lua

---

## 탁상 장식류

## decor_centerpiece — Art? (예?술)
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 순수 장식용
- 가연성: 예
- 소스: furniture_decor_items.lua

## decor_flowervase — Table Vase (탁상용 화병)
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 꽃꽂이 가능: 신선한 꽃 삽입 시 빛 방출 (반경 1.5, 강도 0.5)
  - 꽃은 4800초(10일) 후 시듦
- 가연성: 예
- 소스: decor_flowervase.lua

## decor_lamp — Table Lamp (탁상 램프)
- 타입: 인벤토리 아이템 (탁상 장식)
- fuel: 468s (CAVE 타입 연료, 전구 사용)
- usage:
  - 탁자 위에 올려놓기 가능
  - 연료식 조명: 연료량에 따라 빛 반경 2~4 (강도 0.4~0.6)
  - 켜기/끄기 전환 가능
  - 바닥에 놓으면 자동 점등, 인벤토리에 넣으면 자동 소등
- 가연성: 예
- 소스: decor_lamp.lua, tuning.lua

## decor_pictureframe — Empty Frame (빈 액자)
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 깃펜으로 아이템 이미지 그리기 가능
- 가연성: 예
- 소스: decor_pictureframe.lua

## decor_portraitframe — Pleasant Portrait (보기 좋은 초상화)
- 타입: 인벤토리 아이템 (탁상 장식)
- usage:
  - 탁자 위에 올려놓기 가능
  - 순수 장식용
- 가연성: 예
- 소스: furniture_decor_items.lua

---

## 조각상류

## chesspiece_anchor_sketch — Anchor Figure Sketch (닻 조각상 도면)
- 타입: 인벤토리 아이템 (도면)
- usage:
  - 도예가의 돌림판에서 닻 조각상 제작법 해금
  - 사용 시 소모
- 소스: sketch.lua

## chesspiece_butterfly_sketch — Moon Moth Figure Sketch (달 나방 조각상 도면)
- 타입: 인벤토리 아이템 (도면)
- usage:
  - 도예가의 돌림판에서 달 나방 조각상 제작법 해금
  - 사용 시 소모
- 소스: sketch.lua

## chesspiece_moon_sketch — "Moon" Figure Sketch ("달" 조각상 도면)
- 타입: 인벤토리 아이템 (도면)
- usage:
  - 도예가의 돌림판에서 "달" 조각상 제작법 해금
  - 사용 시 소모
- 소스: sketch.lua

## chesspiece_hornucopia_builder — Carved Hornucopia (풍요의 뿔 조각상)
- 타입: 인벤토리 아이템 (무거운 물체)
- speed_mult: 0.15 (이동속도 85% 감소)
- 해머 횟수: 1회
- usage:
  - 무거운 아이템 — 컨테이너 보관 불가, BODY 슬롯 장착
  - 체육 무게: 3 (Wolfgang 전용 gym)
  - 해머 시 재료 반환
- 소스: chesspieces.lua, tuning.lua

## chesspiece_pipe_builder — Bubble Pipe Carving (방울 파이프 조각상)
- 타입: 인벤토리 아이템 (무거운 물체)
- speed_mult: 0.15 (이동속도 85% 감소)
- 해머 횟수: 1회
- usage:
  - 무거운 아이템 — 컨테이너 보관 불가, BODY 슬롯 장착
  - 체육 무게: 3 (Wolfgang 전용 gym)
  - 해머 시 재료 반환
- 소스: chesspieces.lua, tuning.lua

---

## 기타

## phonograph — Gramophone (축음기)
- 타입: 인벤토리 아이템 (구조물 겸용)
- 해머 횟수: 1회
- usage:
  - 레코드 삽입 후 음악 재생 (64초간)
  - 재생 중 반경 8 내 농작물 관리 효과
  - 탁자 위에 올려놓기 가능
  - 인벤토리 휴대 시 재생 중지
- 소스: phonograph.lua, tuning.lua

## record — Record (레코드)
- 타입: 인벤토리 아이템
- usage:
  - 축음기에 삽입하여 음악 재생
  - 변형: default, balatro 등
- 소스: records.lua

## pirate_flag_pole — Moon Quay Pirate Banner (월숭이 해적단 깃발)
- 타입: 구조물
- 해머 횟수: 3회
- usage:
  - 순수 장식용 (랜덤 깃발 외형 1~4 변형)
- 가연성: 예
- 소스: pirate_flag_pole.lua

## winter_treestand — Festive Tree Planter (축제 트리 화분)
- 타입: 구조물
- 해머 횟수: 1회
- usage:
  - 겨울 축제 나무 묘목 심기용 화분
  - 묘목 심으면 구조물 자체는 사라지고 겨울 축제 트리로 성장
  - 트리 성장 단계: 묘목(0.5일) → 어린(1일) → 중간(1일) → 큰(1일)
  - 큰 트리는 장식품 컨테이너 슬롯 제공
- 가연성: 예
- 소스: winter_treestand.lua, tuning.lua

---

## 다른 md에서 이미 다룬 아이템 (중복 제외)

| id | 한글명 | 참조 파일 |
|---|---|---|
| beefalo_groomer | 비팔로 몸단장 작업대 | beefalo.md |
| dock_kit | 부두 키트 | seafaring.md |
| dock_woodposts_item | 부두 말뚝 | seafaring.md |
| featherpencil | 깃펜 | tools.md |
| reskin_tool | 청소 빗자루 | tools.md |
| sculptingtable | 도예가의 돌림판 | prototypers.md |
| trophyscale_fish | 어류 체중 측정기 | fishing.md |
| trophyscale_oversizedveggies | 농작물 등급 측정기 | food_gardening.md |
| turfcraftingstation | 땅다지개 | prototypers.md |
| wagpunk_floor_kit | 기질 추론기 | seafaring.md |
