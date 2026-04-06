# 마법 (Magic) 카테고리 스펙 — 인게임 소스 기반

> 기준 상수: wilson_health=150, wilson_attack=34, total_day_time=480, seg_time=30
> usage 태그: `[character]`=캐릭터 전용, `[set]`=세트 보너스, `[skilltree]`=스킬트리 연동, `[forge]`=전용 수리 키트로 수리

---

## 부적류

## blueamulet — Blue Amulet (냉기의 부적)
- fuel: 360s (MAGIC)
- dapperness: +0.033/s
- usage:
  - 착용 시 착용자 냉각 (heater equippedheat = -20, 여름 체온 감소)
  - 피격 시 공격자에게 냉기 부여 (coldness +0.67) + 연료 3% 소모
- 소스: amulet.lua (freezefn, BLUEGEM_COOLER=-20), tuning.lua (BLUEAMULET_FUEL)

## greenamulet — Green Amulet (건설의 부적)
- uses: 5
- dapperness: +0.033/s
- usage:
  - 제작 시 재료 50%만 소모
- 소스: tuning.lua

## orangeamulet — Orange Amulet (게으른 약탈자)
- uses: 225
- dapperness: +0.033/s
- usage:
  - 0.33초마다 반경 4 내 아이템 자동 수거
  - 악몽 연료(nightmarefuel)로 수리 가능 (1개당 내구도 50 회복)
- 소스: tuning.lua

## purpleamulet — Purple Amulet (악몽의 부적)
- fuel: 192s (MAGIC), 장착 중 상시 소모
- dapperness: -0.056/s (분당 -3.3, 하루 -26.7)
- usage:
  - 장착 시 정신력을 0으로 강제 표시 (SetInducedInsanity) — 실제 정신력(self.current)은 유지, 판정/UI만 0 처리
  - 이로 인해 광기 상태 돌입 — 그림자 생물 출현/공격
  - 장착 해제 시 원래 정신력 수치로 복원 (단, 장착 중 dapperness로 실제 정신력도 감소하므로 오래 착용하면 해제 후 정신력이 낮아져 있음)
- 소스: amulet.lua (onequip_purple → sanity:SetInducedInsanity), sanity.lua (GetPercent → inducedinsanity and 0), tuning.lua (PURPLEAMULET_FUEL, DAPPERNESS_MED)

## yellowamulet — Yellow Amulet (마광)
- fuel: 480s (NIGHTMARE), 장착 중 상시 소모
- speed_mult: 1.2 (이동속도 +20%)
- dapperness: +0.033/s
- usage:
  - 빛 방출 (반경 2, 황금빛)
  - 장착 중 악몽 연료(nightmarefuel)를 투입하여 지속시간 연장 가능 (fueled.accepting=true, 다른 부적은 불가)
- 소스: amulet.lua (yellow, fueled.accepting=true, FUELTYPE.NIGHTMARE), tuning.lua (YELLOWAMULET_FUEL)

---

## 지팡이류

## greenstaff — Green Staff (해체의 지팡이)
- uses: 5
- usage:
  - 레시피가 있는 구조물/아이템 해체 → 내구도 잔여% 비례로 재료 반환 (최소 1개 보장, 보석 계열 재료는 미반환)
  - 사용 시 정신력 -20 (SANITY_MEDLARGE)
- 소스: staff.lua (destroystructure, spellcaster), tuning.lua (GREENSTAFF_USES=5, SANITY_MEDLARGE=20)

## orangestaff — Orange Staff (게으른 탐험가)
- uses: 20
- damage: 17
- speed_mult: 1.25 (이동속도 +25%)
- usage:
  - 블링크(순간이동)
  - 블링크 시 정신력 -15
  - 공격 시 내구도 소모 없음
- 소스: tuning.lua

## telestaff — Telelocator Staff (순간이동 지팡이)
- uses: 5
- usage:
  - 대상을 무작위 위치 또는 순간이동 집중기(telebase)로 순간이동
  - 동굴에서는 순간이동 불가 (약진동만 발생)
  - 사용 시 정신력 -50 (SANITY_HUGE)
  - 사용 시 월드 강수량 게이지 +500 (TELESTAFF_MOISTURE) — 비 유발 가능 (플레이어 습도가 아닌 월드 moisture)
- 소스: tuning.lua

## yellowstaff — Yellow Staff (별부름 지팡이)
- uses: 20
- usage:
  - 지정 위치에 왜성(Dwarf Star, stafflight) 소환 (1680초 = 3.5일 지속):
    - 열원: heat 100 (겨울 체온 유지)
    - 정신력 오라: +0.417/s (하루 +200, SANITYAURA_SMALL)
    - 주변 화재 전파 가능 (propagator heatoutput=15)
  - 사용 시 정신력 -20 (SANITY_MEDLARGE)
- 소스: staff.lua (createlight → stafflight), stafflight.lua (heater heat=100, sanityaura SANITYAURA_SMALL, timer YELLOWSTAFF_STAR_DURATION), tuning.lua

---

## 구조물류

## nightlight — Night Light (어둠의 등불)
- 타입: 구조물
- 해머 횟수: 4회
- 연료: NIGHTMARE
- 최대 연료: 540s
- usage:
  - 점화 시 정신력 오라 -0.05/s
- 소스: tuning.lua

## nightmare_timepiece — Thulecite Medallion (툴레사이트 메달)
- 타입: 인벤토리 아이템
- usage:
  - 악몽 페이즈 상태 UI 표시
- 소스: tuning.lua

## nightmarefuel — Nightmare Fuel (악몽 연료)
- 타입: 소모품
- 스택: 40
- usage:
  - NIGHTMARE 타입 연료로 사용 가능 (fuelvalue=180s, 어둠의 등불/마광 등에 투입)
  - 게으른 약탈자(orangeamulet) 수리 재료 (1개당 내구도 50 회복). 순수한 공포(horrorfuel)도 동일 대상 수리 가능 (1개당 내구도 100). 현재 소스상 수리 대상은 orangeamulet만 해당.
- 소스: nightmarefuel.lua (fuel FUELTYPE.NIGHTMARE, repairer MATERIALS.NIGHTMARE, finiteusesrepairvalue=50), tuning.lua (NIGHTMAREFUEL_FINITEUSESREPAIRVALUE=50, LARGE_FUEL=180)

## purplegem — Purple Gem (보라 보석)
- 타입: 인벤토리 아이템
- 스택: 40
- usage:
  - 제작 재료용
- 소스: tuning.lua

## researchlab3 — Shadow Manipulator (그림자 조작기)
- 타입: 구조물 (제작 스테이션)
- 제작 스테이션: MAGIC_TWO
- 재료: livinglog×3, purplegem×1, nightmarefuel×7
- 소스: tuning.lua

## researchlab4 — Prestihatitator (요술 모자 장치)
- 타입: 구조물 (제작 스테이션)
- 제작 스테이션: MAGIC_ONE
- 재료: rabbit×4, boards×4, tophat×1
- 소스: tuning.lua

## resurrectionstatue — Meat Effigy (고기 우상)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 부활 포인트 지정
  - 연동 시 최대 HP -40
- 소스: tuning.lua

## telebase — Telelocator Focus (순간이동 집중기)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - purplegem 3개 삽입 시 텔레포트 목적지로 설정
- 소스: tuning.lua

## townportal — Lazy Deserter (게으른 도망자)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 양방향 순간이동
  - 채널링 시작 시 즉시 정신력 -15 (SANITY_MED)
  - 채널링 중 정신력 -0.667/s (DAPPERNESS_SUPERHUGE)
  - 텔레포트 사용자 정신력 -50 (SANITY_HUGE)
- 소스: townportal.lua, tuning.lua

## moondial — Moondial (달시계)
- 타입: 구조물
- 해머 횟수: 4회
- usage:
  - 달 페이즈별 조명 변화
- 소스: tuning.lua

## moonrockidol — Moon Rock Idol (월석 우상)
- 타입: 인벤토리 아이템
- usage:
  - moonportal 반경 8 접근 시 발광
  - 달문(moonportal) 활성화 열쇠
- 소스: tuning.lua

## leif_idol — Treeguard Idol (트리가드 우상)
- 타입: 소모품
- 스택: 10
- 연료: 180s
- usage:
  - 반경 20 내 트리가드 깨우기
  - 반경 10 내 나무 2그루를 트리가드로 변환
- 소스: tuning.lua

## magician_chest — Magician's Chest (마술 상자)
- 타입: 구조물
- 해머 횟수: 2회
- usage:
  - 맥스웰 그림자 공간과 공유되는 저장소
- 소스: tuning.lua

## punchingbag_lunar — Lunar Training Dummy (달빛 동네북씨)
- 타입: 구조물
- 해머 횟수: 6회
- HP: 10009 (즉각 회복)
- alignment: lunar_aligned
- usage:
  - 장비 장착 가능 (데미지 테스트용)
- 소스: tuning.lua

## punchingbag_shadow — Shadow Training Dummy (그림자 동네북씨)
- 타입: 구조물
- 해머 횟수: 6회
- HP: 10009 (즉각 회복)
- alignment: shadow_aligned
- usage:
  - 장비 장착 가능 (데미지 테스트용)
- 소스: tuning.lua

---

## 캐릭터 전용

## waxwelljournal — Codex Umbra (본영의 서)
- 연료: NIGHTMARE 720s
- usage:
  - `[character]` Maxwell 전용
  - 스펠 1회당 연료 -36 소모 (최대 20회)
  - 4종 스펠: 일꾼 / 수호자 / 덫 / 기둥
- 소스: tuning.lua

## wereitem_beaver — Beaver Idol (미숙한 비버 우상)
- 타입: 음식
- 스택: 10
- 포만도: 25
- 체력: -20 (cursemaster 스킬 시 0)
- 정신력: -15 (cursemaster 스킬 시 0)
- usage:
  - `[character]` Woodie 전용
  - `[skilltree]` cursemaster 스킬 연동
- 소스: tuning.lua

## wereitem_goose — Goose Idol (미숙한 거위 우상)
- 타입: 음식
- 스택: 10
- 포만도: 25
- 체력: -20 (cursemaster 스킬 시 0)
- 정신력: -15 (cursemaster 스킬 시 0)
- usage:
  - `[character]` Woodie 전용
  - `[skilltree]` cursemaster 스킨 연동
- 소스: tuning.lua

## wereitem_moose — Moose Idol (미숙한 사슴 우상)
- 타입: 음식
- 포만도: 25
- 체력: -20 (cursemaster 스킬 시 0)
- 정신력: -15 (cursemaster 스킬 시 0)
- usage:
  - `[character]` Woodie 전용
  - `[skilltree]` cursemaster 스킬 연동
- 소스: tuning.lua

---

## 재료/기타

> 이 카테고리의 주요 재료 아이템은 위 구조물류 섹션의 nightmarefuel, purplegem 항목 참조.

---

## 다른 md에서 이미 다룬 아이템 (중복 제외)

| id | 한글명 | 참조 파일 |
|---|---|---|
| abigail_flower | 에비게일의 꽃 | (별도 md 미작성, 이전 대화에서 다룸) |
| amulet | 생명의 부적 | (미작성 — 추후 작성 필요) |
| antlionhat | 땅엎기 투구 | tools.md |
| armor_sanity | 악몽의 갑옷 | armor.md |
| armordreadstone | 드레드스톤 갑옷 | armor.md |
| armorslurper | 슬러퍼 조끼 | clothing.md |
| batbat | 박쥐 방망이 | weapons.md |
| dreadstonehat | 드레드스톤 투구 | armor.md |
| firestaff | 화염 지팡이 | weapons.md |
| icestaff | 냉기 지팡이 | weapons.md |
| nightsword | 어둠의 검 | weapons.md |
| onemanband | 원맨밴드 | clothing.md |
| panflute | 팬 플루트 | weapons.md |
| pocketwatch_weapon | 회중시계 무기 | weapons.md |
| sentryward | 감시 석상 | tools.md |
| tophat_magician | 마술사 모자 | clothing.md |
