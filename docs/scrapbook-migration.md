# 스크랩북 데이터 마이그레이션 설계

## 목표
현재 수작업 item-stats-v3을 인게임 scrapbookdata.lua 기반으로 교체하여 데이터 정확성·커버리지·유지보수성을 근본적으로 개선한다.

## 소스 분석

### scrapbookdata.lua (1840개 엔트리)
- 인게임 `d_createscrapbookdata()` 자동 생성 데이터
- 우리 제작템 + 크리쳐/보스/구조물 전부 포함
- **type**: creature, food, item, giant, thing, POI
- **subcat** (49종): armor, weapon, hat, clothing, tool, book, backpack, container, seafaring, wall, turf, ...

### 사용할 필드 (제작템 상세패널 기준)

| scrapbook 필드 | 설명 | 현재 v3 대응 | 비고 |
|---|---|---|---|
| damage / planardamage | 피해량 + 차원 피해 | damage / planar_damage | 범위("15-40") 가능 |
| finiteuses | 내구도(횟수) | uses | |
| armor | 방어력 | armor_hp | |
| absorb_percent | 흡수율 | absorption | 0~1 소수 |
| armor_planardefense | 차원 방어 | planar_def | |
| dapperness | 정신력/분 | dapperness | ×60 변환 |
| waterproofer | 방수율 | waterproof | 0~1 소수 |
| insulator / insulator_type | 보온/내열 | insulation / summer_insulation | summer 구분 |
| fueledmax / fueledrate / fueledtype1 | 지속시간 | fuel_time | 계산: max/rate |
| perishable | 유통기한(초) | perish_time | |
| stacksize | 겹침 수 | — | 신규 |
| forgerepairable | 수리 재료 | repair | 배열(아이템ID) |
| repairitems | 보수 재료 | — | 신규 |
| sewable | 바느질 수선 | — | 신규 |
| craftingprefab | 캐릭터 전용 | character | |
| notes.shadow_aligned/lunar_aligned | 진영 | resistance.type | |
| deps | 연관 아이템 | — | 신규 (관계도용) |
| specialinfo | 특수 효과 키 | effects | 핵심 — 아래 참조 |

### specialinfo (핵심 특수 효과)
- strings.lua의 `STRINGS.SCRAPBOOK.SPECIALINFO` 테이블에 ~595개 영문 설명
- ko.po의 `STRINGS.SCRAPBOOK.SPECIALINFO.*`에 ~1094개 한국어 번역 (커뮤니티 한글모드)
- 예: `ARMORLUNARPLANT` → "적에게 피해를 반사한다. 그림자 진영의 적에게는 더 많이."
- **인게임과 동일한 텍스트를 그대로 사용** → 번역 퀄리티 문제 해결

### 라벨 번역 (ko.po DATA_* 키)
| 키 | 영문 | 한국어 |
|---|---|---|
| DATA_ARMOR_ABSORB | ABSORBS | 방어율 |
| DATA_PLANAR_DAMAGE | Planar Damage | 차원 피해 |
| DATA_PLANAR_DEFENSE | Planar Defense | 차원 방어 |
| DATA_USES | Uses | 회 |
| DATA_WETNESS | WATERPROOF | 방수 |
| DATA_INSULATION | INSULATION | 보온력 |
| DATA_PERMIN | /min | /분 |
| DATA_SEWABLE | Sewable | 바느질 수선 |
| DATA_NOBREAK | Won't break | 파괴 불가 |
| DATA_REPAIRABLE | Repairable | 수리 가능 |
| DATA_STACK | Stack | 겹침 |
| NOTE_SHADOW_ALIGNED | Shadow Aligned | 그림자 진영 |
| NOTE_LUNAR_ALIGNED | Lunar Aligned | 월광 진영 |

---

## 마이그레이션 아키텍처

### Phase 1: 파이프라인 — `scripts/convert-scrapbook.py`
```
scrapbookdata.lua (parse) → filter(type=item) → merge translations → scrapbook-stats.ts
```

1. **Lua 파싱**: scrapbookdata.lua → Python dict (lua table parser)
2. **필터링**: type이 "item"인 엔트리만 (제작템 기준). 추후 creature/giant 확장 가능
3. **specialinfo 텍스트 매핑**:
   - strings.lua에서 `STRINGS.SCRAPBOOK.SPECIALINFO` 파싱 → 영문
   - ko.po에서 `STRINGS.SCRAPBOOK.SPECIALINFO.*` 파싱 → 한국어
4. **라벨 번역 매핑**: ko.po의 `STRINGS.SCRAPBOOK.DATA_*` → 라벨용
5. **출력**: `src/data/scrapbook-stats.ts`

### Phase 2: 타입 정의 — `ScrapbookStats`
```typescript
export interface ScrapbookStats {
  // 전투
  damage?: number | string;     // 숫자 또는 범위("15-40")
  planardamage?: number;
  finiteuses?: number;

  // 방어
  armor?: number;
  absorb_percent?: number;
  armor_planardefense?: number;

  // 유틸리티
  dapperness?: number;
  waterproofer?: number;
  insulator?: number;
  insulator_type?: "summer" | "winter";
  stacksize?: number;
  perishable?: number;

  // 연료/지속
  fueledmax?: number;
  fueledrate?: number;
  fueledtype?: string;
  fueleduses?: boolean;

  // 수리
  forgerepairable?: string[];   // 수리 재료 아이템 ID
  repairitems?: string[];       // 보수 재료
  sewable?: boolean;

  // 메타
  craftingprefab?: string;      // 캐릭터 전용
  shadow_aligned?: boolean;
  lunar_aligned?: boolean;
  deps?: string[];              // 연관 아이템

  // 특수 효과
  specialinfo?: string;         // 키 (예: "ARMORLUNARPLANT")
  specialinfo_en?: string;      // 영문 텍스트
  specialinfo_ko?: string;      // 한국어 텍스트
}
```

### Phase 3: ItemStatsPanel 재설계

인게임 scrapbookscreen.lua의 렌더링 순서를 따름:

```
1. 피해량 (damage + planardamage)
2. 내구도 (finiteuses)
3. 방어력 (armor)
   └ 흡수율 (absorb_percent)
   └ 차원 방어 (armor_planardefense)
4. 수리 (forgerepairable / repairitems)
5. 방수 (waterproofer)
6. 보온/내열 (insulator + insulator_type)
7. 정신력 (dapperness → ×60 /분)
8. 지속시간 (fueledmax / fueledrate)
9. 바느질 (sewable)
10. 유통기한 (perishable)
11. 진영 (shadow_aligned / lunar_aligned)
12. 특수 효과 (specialinfo → ko/en 텍스트)
```

### Phase 4: 기존 시스템 정리
- `src/data/item-stats-v3.ts` → 삭제
- `src/components/crafting/ItemStatsPanel.tsx` → ScrapbookStats 기반으로 재작성
- Beta 뱃지 제거 (인게임 데이터이므로 신뢰도 보장)

---

## 얻는 것 / 잃는 것

### 얻는 것
- **데이터 정확성**: 인게임 자동 생성이라 수치 100% 일치
- **번역 퀄리티**: ko.po 공식 번역 그대로 사용 (수작업 번역 불필요)
- **커버리지**: 1840개 → 제작템 전체 + 보스/크리쳐 확장 가능
- **유지보수**: 게임 업데이트 시 스크립트 재실행으로 동기화
- **신규 필드**: stacksize, sewable, repairitems, deps

### 잃는 것 (보완 필요)
- **v3의 set_bonus 상세**: scrapbook에는 세트 보너스 정보 없음 → specialinfo에 일부 포함되거나 별도 매핑 테이블 유지
- **v3의 skill_tree 효과**: scrapbook에는 스킬트리 연동 없음 → **기존 skill-trees/*.ts 데이터에서 역참조로 해결** (아래 "스킬트리 연동" 섹션 참조)
- **v3의 immunities 명시 목록**: scrapbook에서는 specialinfo 텍스트로 언급 → 구조화 필요 시 수동 매핑
- **speed_mult**: scrapbook에 이속 필드 없음 → specialinfo 텍스트에 포함 (마블갑옷 "slows", 지팡이 "25% speed")
- **health_regen, hunger_drain**: scrapbook에 없음 → specialinfo에 텍스트로 포함

→ **대부분 specialinfo 텍스트가 커버**. 구조화 수치가 필요한 경우만 소규모 보조 매핑 테이블 유지.

### 스킬트리 연동 (v3 skill_tree 대체)
v3에서 수작업으로 입력하던 `skill_tree` 효과는 scrapbook에 없지만, **기존 스킬트리 데이터에서 자동 역참조**로 오히려 더 정확하게 구현 가능:

1. `src/data/skill-trees/*.ts`에 각 스킬 노드의 `unlocks_items` 필드가 이미 존재
2. 아이템 ID → "이 아이템을 해금/강화하는 스킬 노드" 역방향 맵을 빌드
3. ItemStatsPanel에서 "관련 스킬" 섹션으로 표시 (스킬명 + 효과 설명 + 스킬트리 탭 이동 링크)

장점:
- 스킬 데이터가 변경되면 자동 반영 (수작업 동기화 불필요)
- 스킬트리 시뮬레이터와 상호 링크 강화
- v3에서 누락됐던 스킬 효과도 자동 포함

---

## 작업 순서

1. `scripts/convert-scrapbook.py` 파이프라인 작성
2. `src/data/scrapbook-stats.ts` 생성 + 타입 정의
3. `ItemStatsPanel.tsx` 재작성 (인게임 렌더 순서)
4. item-stats-v3.ts 삭제 + 관련 import 정리
5. 보조 매핑 테이블 (set_bonus 등) 필요 여부 판단 후 추가
6. 전체 테스트 + 릴리즈
