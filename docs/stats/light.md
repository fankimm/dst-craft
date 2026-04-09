# 조명 (Light) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30, night_time=60, dusk_time=120

---

## lantern — Lantern (랜턴)
- 장착 슬롯: 손 (핸드)
- 연료 지속: 468초 (동굴 연료 기준)
- 빛 반경: 3~5 (연료량 비례)
- 연료 보충: 가능
- 소스: lantern.lua

## molehat — Moggles (두더지 투시경)
- 장착 슬롯: 머리
- 연료 유형: 벌레빛
- 연료 지속: 720초 (1.5일)
- 효과: 야간투시
- 소진 시: 아이템 제거
- 소스: molehat.lua

## mushroom_light — Mushroom Light (버섯등)
- 유형: 구조물
- 슬롯 수: 4 (빛 배터리 전용)
- 빛 반경: 2.5~5.5 (삽입된 배터리 수 비례)
- 부패 속도: 25% (일반 대비)
- 해머 횟수: 3회
- 소스: mushroom_light.lua

## mushroom_light2 — Glowcap (발광갓)
- 유형: 구조물
- 슬롯 수: 4 (빛 배터리 + 포자 전용)
- 빛 반경: 2.5~5.5
- 포자 슬롯: 색상 변경 가능
- 부패 속도: 25% (일반 대비)
- 해머 횟수: 3회
- 소스: mushroom_light2.lua

## pumpkin_lantern — Pumpkin Lantern (호박 랜턴)
- 발광 조건: 밤/황혼에만 발광
- 빛 반경: 1.5
- 부패 시간: 4800초 (핼러윈 이벤트 중 19200초)
- 부패: 바닥에 놓인 상태에서만 부패 진행
- 소스: pumpkin_lantern.lua

## torch — Torch (횃불)
- 장착 슬롯: 손 (핸드)
- 연료 지속: 75초
- 빛 반경: 2 (스킬 적용 시 최대 5)
- 피해량: 17 (기본 공격력의 50%)
- 착화율: 100% (적 착화)
- 비소모 배율: 1.5× (불꽃 관련 스킬)
- 방수: 20%
- 던지기: 가능
- 소스: torch.lua

---

## 참조 (타 파일)

- archive_resonator_item → tools.md 참조
- winona_spotlight_item → character.md 참조
- wx78module_light → character.md 참조
- wx78module_nightvision → character.md 참조
