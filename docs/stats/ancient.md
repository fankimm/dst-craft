# ancient 카테고리 스펙 — 인게임 소스 기반
> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30

## blueprint_craftingset_ruins_builder — Ruins Flooring Blueprint (유적 바닥 청사진)
- 타입: 제작물
- usage:
  - 제작 시 바닥 청사진 3개 지급

## blueprint_craftingset_ruinsglow_builder — Glowing Ruins Flooring Blueprint (모조 유적 바닥 청사진)
- 타입: 제작물
- usage:
  - 동일 패턴
  - 발광 바닥

## eyeturret_item — Houndius Shootius (하운디우스 슈티우스)
- 타입: 구조물
- usage:
  - HP 1000
  - 재생 12/초
  - 공격 65
  - 사거리 15
  - 공격 주기 3초
  - 해머 불가

## shadow_forge_kit — Shadow Forge Kit (암영술 재단사 키트)
- 타입: 설치키트
- usage:
  - 설치 → shadow_forge 구조물 (SHADOWFORGING Lv2)
  - 해머 4회

## thulecite — Thulecite (툴레사이트)
- 타입: 소재
- usage:
  - THULECITE 수리 재료 (HP 100 회복, 작업량 1.5 회복)
  - edible 컴포넌트 있음 (FOODTYPE.ELEMENTAL, 허기 +3) — 단 플레이어는 먹을 수 없음 (ELEMENTAL 식단은 NPC 전용: 먼지나방/두더지/달팽이거북)
  - 두더지 미끼 (molebait 태그)
- 소스: prefabs/thulecite.lua (repairer MATERIALS.THULECITE, edible FOODTYPE.ELEMENTAL)

## wall_ruins_item — Thulecite Wall (툴레사이트 벽)
- 타입: 벽
- usage:
  - HP 800 (배치 시 50%)
  - 해머 3회
  - THULECITE 수리 가능
