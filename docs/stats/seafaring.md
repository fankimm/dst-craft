# 항해 (Seafaring) 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

## seafaring_prototyper — Seafaring Station (싱크 탱크)
- 유형: 제작대
- 제공 기술: SEAFARING 티어 2
- 해머 횟수: 4회
- 소스: seafaring_prototyper.lua, tuning.lua

## boat_grass_item — Grass Raft Kit (풀 뗏목 키트)
- 유형: 배 키트 (수상 배치)
- 배치 반경: 3
- 선체 체력: 200
- 수리 재료: 건초
- 특이사항: 물이 새지 않음, 시간이 지남에 따라 자동 열화 (5)
- 소스: boat.lua

## boat_item — Boat Kit (배 키트)
- 유형: 배 키트 (수상 배치)
- 배치 반경: 4
- 선체 체력: 200
- 최대 선체 피해: 70
- 수리 재료: 나무
- 소스: boat.lua

## boatpatch_kelp — Boat Patch (땜빵용 다시마)
- 스택: 20
- 수리량: 30
- 수리 재료: 다시마
- 부패 시간: 4800초
- 먹을 수 있음: 허기 28.125, 체력 -3, 정신력 -55
- 소스: boatpatch.lua

## boatpatch — Boat Patch (수선용 판자)
- 스택: 20
- 수리량: 100
- 수리 재료: 나무
- 연료값: 중간 연료 ×2
- 소스: boatpatch.lua

## oar — Oar (노)
- 피해량: 17 (기본 공격력의 50%)
- 내구도: 500회
- 조력: 0.3
- 최대 속도 기여: 2
- 공격 마모: 25
- 실패 마모: 25
- 연료 유형: 나무 (중간 연료)
- 소스: oar.lua, tuning.lua

## oar_driftwood — Driftwood Oar (유목 노)
- 피해량: 17 (기본 공격력의 50%)
- 내구도: 400회
- 조력: 0.5
- 최대 속도 기여: 3.5
- 공격 마모: 25
- 실패 마모: 25
- 방수: 있음
- 연료 유형: 나무 (중간 연료)
- 소스: oar.lua, tuning.lua

## balloonvest — Inflatable Vest (팽창식 조끼)
- 장착 슬롯: 몸통
- 부양 장치: 물에 빠질 때 자동 팽창 방지
- 연료 유형: 마법
- 연료량: 480초 (1일)
- 사용:
  - 장착 중 소모됨
  - 피격 시 팽창하며 파괴
  - 익사 피해 방지
- 소스: balloonvest.lua, tuning.lua

## anchor_item — Anchor Kit (닻 키트)
- 유형: 배 부속품 키트
- 드래그: 2
- 최대 속도 계수: 0.15
- 돛 힘 감쇠: 0.8
- 해머 횟수: 3회
- 연료값: 대형 연료
- 소스: anchor.lua, tuning.lua

## steeringwheel_item — Steering Wheel Kit (조타륜 키트)
- 유형: 배 부속품 키트
- 배치 간격: 중간
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 배 방향 조종 가능
- 소스: steeringwheel.lua

## boat_rotator_kit — Rudder Kit (방향타 키트)
- 유형: 배 부속품 키트
- 배치 간격: 좁은
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 배를 자동으로 회전/방향 보정
- 소스: boat_rotator.lua

## mast_item — Mast Kit (돛대 키트)
- 유형: 배 부속품 키트
- 최대 속도 기여: 2.5
- 돛 힘: 0.6
- 방향타 회전 드래그: 0.23
- 업그레이드: 갑판 조명, 번개 전도체 장착 가능
- 해머 횟수: 3회
- 연료값: 대형 연료
- 소스: mast.lua, tuning.lua

## mast_malbatross_item — Malbatross Wing Sail Kit (날개 달린 돛 키트)
- 유형: 배 부속품 키트
- 최대 속도 기여: 4
- 돛 힘: 1.3
- 방향타 회전 드래그: 0.23
- 업그레이드: 갑판 조명, 번개 전도체 장착 가능
- 해머 횟수: 3회
- 연료값: 대형 연료
- 소스: mast.lua, tuning.lua

## boat_bumper_kelp_kit — Kelp Bumper Kit (다시마 범퍼 키트)
- 유형: 배 부속품 키트 (가장자리 배치)
- 체력: 20
- 수리 재료: 다시마
- 전리품: 다시마 × 최대 2개 (체력 비례)
- 소스: boat_bumpers.lua, tuning.lua

## boat_bumper_shell_kit — Shell Bumper Kit (조가비 범퍼 키트)
- 유형: 배 부속품 키트 (가장자리 배치)
- 체력: 40
- 수리 재료: 조개껍데기
- 전리품: 달팽이거북 껍데기 조각 × 최대 2개 (체력 비례)
- 소스: boat_bumpers.lua, tuning.lua

## boat_cannon_kit — Cannon Kit (대포 키트)
- 유형: 배 부속품 키트
- 사거리: ~20
- 조준 각도: ±45°
- 해머 횟수: 4회
- 연료값: 대형 연료
- 사용:
  - 포탄 장전 후 발사
- 소스: boat_cannon.lua, tuning.lua

## cannonball_rock_item — Cannonball (포탄)
- 스택: 20
- 직격 피해: 200
- 광역 피해: 120 (직격의 60%)
- 광역 반경: 3
- 충돌 반경: 0.5
- 발사 속도: 20
- 중력: -40
- 소스: cannonballs.lua, tuning.lua

## ocean_trawler_kit — Ocean Trawler Net Kit (바다 어망 키트)
- 유형: 수상 구조물 키트
- 배치 간격: 중간
- 부패율 감소: 1/3 (물고기 부패 속도 감소)
- 해머 횟수: 3회
- 연료값: 대형 연료
- 사용:
  - 바다에 내려 시간이 지나면 물고기/해산물 수집
  - 보관함 포함
- 소스: ocean_trawler.lua, tuning.lua

## mastupgrade_lamp_item — Mast Light (갑판 조명)
- 유형: 돛대 업그레이드 아이템
- 연료 유형: 불
- 연료량: 360초
- 사용:
  - 돛대에 장착하여 야간 조명 제공
  - 연료 소진 시 꺼짐
- 소스: mast.lua, tuning.lua

## mastupgrade_lightningrod_item — Lightning Conductor (번개 전도체)
- 유형: 돛대 업그레이드 아이템
- 사용:
  - 돛대에 장착하여 번개 방어
  - 충전 후 1 사이클 동안 유지, 방전 후 재충전
- 소스: mastupgrade_lightningrod.lua, mast.lua

## fish_box — Fish Box (낚시용 통조림)
- 유형: 구조물 (배 또는 부두 위 배치)
- 부패율 감소: 1/3 (물고기 부패 속도 감소)
- 해머 횟수: 2회
- 사용:
  - 물고기 보관 가능
  - 해머 파괴 시 살아있는 물고기 방류
- 소스: fish_box.lua, tuning.lua

## winch — Winch (집게 도르래)
- 유형: 구조물
- 내리기 속도: 2
- 올리기 속도 (빈 상태): 1.8
- 올리기 속도 (물건 있을 때): 1.1
- 보트 드래그 지속시간: 1초
- 해머 횟수: 3회
- 사용:
  - 바다 밑의 침몰 아이템 인양
  - 무거운 물체를 배 위에서 인양
- 소스: winch.lua, tuning.lua

## waterpump — Water Pump (소방 펌프)
- 유형: 구조물
- 사거리: 7.5
- 해머 횟수: 3회
- 사용:
  - 장시간 사용 동작
  - 주변 불에 물 발사하여 진화
- 소스: waterpump.lua, tuning.lua

## boat_magnet_kit — Autopilot Kit (자동항법기 키트)
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
- 소스: boat_magnet.lua, tuning.lua

## boat_magnet_beacon — Autopilot Beacon (자동항법 신호기)
- 유형: 구조물 (지상/해안 설치)
- 해머 횟수: 3회
- 사용:
  - 자동항법기와 페어링하여 배가 신호기를 향해 자동 이동
- 소스: boat_magnet_beacon.lua

## flotationcushion — Personal Flotation Device (개인용 부양장치)
- 장착 슬롯: 없음 (인벤토리 보유)
- 사용:
  - 물에 빠질 때 자동 부양
- 소스: flotationcushion.lua

## dock_kit — Dock Kit (부두 키트)
- 스택: 20
- 배치 조건: 해안 타일 + 인접 육지
- 사용:
  - 해안에 부두 타일 생성
  - 부두 연결 시스템에 등록
- 소스: dock_kit.lua

## dock_woodposts_item — Dock Posts (부두 말뚝)
- 스택: 20
- 배치 간격: 좁은
- 해머 횟수: 3회
- 전리품: 통나무 × 1
- 사용:
  - 부두 가장자리에 장식/방어용 말뚝 설치
- 소스: dock_woodposts.lua

## wagpunk_floor_kit — Deductive Station (기질 추론기)
- 스택: 20
- 배치 조건: 왜그스태프 아레나 내 해양 타일
- 사용:
  - 아레나 내 해양 타일에 특수 바닥 생성
  - 특수 이벤트(왜그스태프 보스) 관련 구조물
- 소스: wagpunk_floor_kit.lua

## chesspiece_anchor_sketch — Anchor Figurine Blueprint (닻 조각상 도면)
- 유형: 도면
- 사용:
  - 대리석/석재/달빛 유리로 닻 조각상 제작 가능
  - 체스 조각 도면 시스템 공유
- 소스: sketch.lua, chesspieces.lua
