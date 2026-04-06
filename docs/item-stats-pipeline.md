# Item Stats 자동 추출 파이프라인 설계

## 목적
인게임 소스(scripts.zip)에서 아이템 스펙을 자동 추출하여 `src/data/item-stats.ts`를 생성한다.
위키 의존 없이 소스 기반으로 정확한 데이터를 유지하며, 게임 업데이트 시 스크립트 재실행만으로 대응한다.

## 소스 파일 구조

```
scripts.zip (게임 데이터번들)
├── scripts/tuning.lua              — 수치 스펙 (내구도, 흡수율, 피해량 등)
├── scripts/recipes.lua             — 제작법 (재료, 제작대, 기술 티어)
├── scripts/prefabs/*.lua           — 아이템별 동작 로직 (컴포넌트, 이벤트)
├── scripts/preparedfoods.lua       — 요리솥 레시피
├── scripts/preparedfoods_warly.lua — 월리 전용 요리
├── scripts/recipes_filter.lua      — 카테고리 분류
├── scripts/techtree.lua            — 기술 트리 정의
├── scripts/strings.lua             — 영문 텍스트
├── scripts/skilltreedata.lua       — 캐릭터 스킬트리
├── scripts/containers.lua          — 컨테이너 슬롯/크기
└── scripts/constants.lua           — 게임 상수
```

## 추출 전략

### Phase 1: 수치 스펙 자동 추출 (tuning.lua)
아이템 ID와 TUNING 변수명의 네이밍 패턴을 매칭하여 수치를 자동 추출한다.

**매칭 패턴 예시:**
| 아이템 ID | TUNING 변수 패턴 | 추출 필드 |
|-----------|-----------------|-----------|
| `armorwood` | `ARMORWOOD`, `ARMORWOOD_ABSORPTION` | armor_hp, absorption |
| `axe` | `AXE_DAMAGE`, `AXE_USES` | damage, uses |
| `armor_lunarplant` | `ARMOR_LUNARPLANT`, `ARMOR_LUNARPLANT_ABSORPTION`, `ARMOR_LUNARPLANT_PLANAR_DEF` | armor_hp, absorption, planar_def |

**기본 계산 상수 (tuning.lua에서 추출):**
```
wilson_health = 150
wilson_attack = 34
multiplayer_armor_durability_modifier = 0.7
multiplayer_armor_absorption_modifier = 1.0
```

### Phase 2: 컴포넌트/이벤트 패턴 → usage 텍스트 자동 생성 (prefabs/*.lua)
프리팹 파일에서 컴포넌트와 이벤트를 읽어 특수 효과 설명을 자동 생성한다.

**패턴 → usage 매핑 규칙:**
| 코드 패턴 | usage 텍스트 (ko) | usage 텍스트 (en) |
|-----------|-------------------|-------------------|
| `damagereflect` 컴포넌트 | 피격 시 피해 반사 | Reflects damage when hit |
| `setbonus` 컴포넌트 | 세트 보너스 | Set bonus |
| `"resurrector"` 태그 | 사망 시 부활 | Revives on death |
| `autoterraformer` 컴포넌트 | 걸으며 바닥 타일 제거 | Removes turf while walking |
| `shadowlevel` 컴포넌트 | 그림자 레벨 N | Shadow level N |
| `dapperness < 0` | 장착 시 정신력 감소 | Drains sanity while equipped |
| `waterproofer` 컴포넌트 | 방수 N% | Waterproof N% |
| `ListenForEvent("onreflectdamage")` | 피격 시 피해 반사 | Reflects damage on hit |
| `ListenForEvent("attacked") + 가시/반격 로직` | 피격 시 가시 반격 | Thorns damage when hit |
| `ListenForEvent("onattackother")` | 공격 시 추가 효과 | Additional effect on attack |
| `hauntable` + `HAUNT_INSTANT_REZ` | 유령 빙의로 부활 | Revive by haunting |
| `spellbook` 컴포넌트 | 주문서 기능 | Spellbook functionality |
| `restrictedtag` | 캐릭터 전용 | Character exclusive |

**이 매핑 규칙은 카테고리별 검증 과정에서 점진적으로 확장한다.**

### Phase 3: Show Me (Refresh) 모드 필드 대조
Show Me 모드(Workshop #3436020204)가 읽는 컴포넌트 필드 목록을 기준으로 누락을 체크한다.

**Show Me가 읽는 필드 → item-stats.ts 필드 매핑:**
| Show Me 컴포넌트 접근 | item-stats.ts 필드 |
|-----------------------|-------------------|
| `armor.absorb_percent` | absorption |
| `armor.condition / maxcondition` | armor_hp |
| `weapon.damage` | damage |
| `planardamage.basedamage` | planar_damage |
| `planardefense.basedefense` | planar_def |
| `insulator:GetInsulation()` (WINTER) | insulation |
| `insulator:GetInsulation()` (SUMMER) | summer_insulation |
| `equippable.dapperness` | dapperness |
| `equippable.walkspeedmult` | speed_mult |
| `waterproofer.effectiveness` | waterproof |
| `finiteuses` | uses |
| `perishable.perishremainingtime` | perish_time |
| `fueled` | fuel_time |
| `combat.defaultdamage` (몹/캐릭터) | - (별도) |
| `sanityaura` | - (추가 검토) |
| `combat.areahitdamagepercent` | - (추가 검토: aoe) |

### Phase 4: md 파일로 검증 → ts 변환

**작업 흐름: md가 원본, ts는 변환 결과물**

```
카테고리별 md 생성 → 유저 검증 → 확정 → item-stats-v2.ts로 자동 변환 → import 교체로 전환
```

1. Phase 1~3 결과를 **카테고리별 md 파일**로 출력 (예: `docs/stats/armor.md`)
2. 유저가 md를 보면서 이상한 값/누락 확인
3. 수정 → 재검증 → 확정
4. 모든 카테고리 확정 후 md → **`item-stats-v2.ts`** 일괄 변환
5. 기존 `item-stats.ts`는 보존 — import만 교체하면 v1/v2 전환 가능

**md 파일 양식 규칙 (필수 준수):**

1. **아이템 헤더**: 반드시 `## {id} — {영문명} ({한글명})` 형식 (h2). h3(###) 사용 금지.
2. **필드**: `- {필드명}: {값}` 형식. 해당 없는 필드는 생략.
3. **usage**: `- usage:` 아래 `  - {효과}` 형식으로 나열.
4. **소스**: `- 소스: {인게임 파일명}` (items.ts/item-stats.ts 등 앱 소스 참조 금지)
5. **한글명**: 반드시 ko.po에서 확인. 추측 금지.
6. **테이블 형식 금지**: 아이템 스펙은 테이블로 적지 않고 반드시 `## id` + `- 필드` 형식 통일.
   (카테고리 내 참조 테이블은 예외)
7. **다른 md에서 다룬 중복 아이템**: 본문에 적지 말고 하단 참조 테이블로만 처리.

```markdown
## armorwood — Log Suit (나무 갑옷)
- armor_hp: 315
- absorption: 0.8
- usage:
  - 연료로 사용 가능 (LARGE_FUEL)
  - `[pvp]` 비버 변신 추가 피해 취약 (+17)
- 소스: tuning.lua (ARMORWOOD) + prefabs/armor_wood.lua
```

## 작업 순서 (카테고리별 소량 검증)
복잡도와 아이템 수를 고려한 우선순위:

1. **갑옷 (armor)** — 22개, 스펙 구조가 일관적 (armor_hp, absorption, planar_def)
2. **무기 (weapons)** — 41개, damage + uses 중심
3. **도구 (tools)** — 54개, uses + damage
4. **모자/옷 (clothing)** — 56개, insulation + waterproof + dapperness
5. **마법 (magic)** — 44개, 특수 효과 다양
6. **캐릭터 전용 (character)** — 236개, 가장 다양하고 복잡
7. **나머지 카테고리**

각 카테고리 완료 시:
- md 파일을 유저에게 보여주고 검증
- 발견된 예외 패턴을 매핑 규칙에 추가
- 다음 카테고리 진행

## 주의사항
- **한글명은 반드시 ko.po에서 확인** — ID나 영문명에서 추측 금지. `grep -A 2 'STRINGS.NAMES.<UPPER_ID>' ko.po | grep msgstr`로 확인.
- tuning.lua의 레거시 코드 주의 (예: ABIGAIL_FLOWER_DECAY_TIME — 웬디 리워크 후 미사용)
- 일부 아이템은 독립 프리팹이 아닌 통합 파일에 포함 (예: 모자류 → hats.lua)
- 프리팹 파일이 없는 아이템은 다른 프리팹의 하위 정의일 수 있음
- 부활 등 복잡한 시스템은 player_common_extensions.lua 등 외부 파일 참조 필요
- 하지만 usage 텍스트 수준에서는 프리팹의 태그/컴포넌트만으로 충분한 경우가 대부분

## 게임 업데이트 대응
1. Steam에서 게임 업데이트
2. `scripts.zip` 재추출
3. 추출 스크립트 재실행
4. diff로 변경점 확인
5. 새 컴포넌트/패턴이 있으면 매핑 규칙 추가
