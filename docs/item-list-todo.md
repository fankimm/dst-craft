# item-list.md 작업 현황 및 TODO

## 파일 경로
- 작업 파일: `docs/item-list.md`
- 인게임 소스: `/tmp/scripts/` (게임 `databundles/scripts.zip`에서 추출 필요)
- 추출 명령: `cd /tmp && unzip -o "$SCRIPTS_ZIP" "scripts/prefabs/*.lua" "scripts/tuning.lua" "scripts/recipes.lua" "scripts/tiledefs.lua" "scripts/strings.lua"`
- SCRIPTS_ZIP 경로: `~/Library/Application Support/Steam/steamapps/common/Don't Starve Together/dontstarve_steam.app/Contents/data/databundles/scripts.zip`

## 현재 구조 (아이템당)
```
1.abigail_flower
  en: Abigail's Flower          ← 영문명 (strings.lua 기반)
  ko: 아비게일의 꽃              ← 한글명 (ko.po 기반)
  app: O                        ← 우리 앱에 있는지 (O/X)
  type: deconstruct             ← 분해 레시피인 경우만 존재
  source: ...                   ← 인게임 소스 기반 영문 요약
  desc_en: ...                  ← 프로덕션 영문 설명
  desc_ko: ...                  ← 한국어
  desc_ja: ...                  ← 일본어
  desc_zh_CN: ...               ← 중국어 간체
  desc_zh_TW: ...               ← 중국어 번체
  desc_fr: ...                  ← 프랑스어
  desc_de: ...                  ← 독일어
  desc_it: ...                  ← 이탈리아어
  desc_pl: ...                  ← 폴란드어
  desc_pt_BR: ...               ← 브라질 포르투갈어
  desc_ru: ...                  ← 러시아어
  desc_es: ...                  ← 스페인어
  desc_es_MX: ...               ← 멕시코 스페인어
```

## 완료 상태

### source (영문 소스 요약) — 1028개 전체 완료
- 1~1028 전부 한줄 영문 요약 작성됨
- 단, 퀄리티 문제 있음 (아래 참조)

### desc (다국어 프로덕션 설명) — ✅ 전체 완료
- 1028개 × 13개 언어 = 13,364개 desc 작성 완료
- desc_en 1030개 확인 (일부 중복 포함)

## 핵심 퀄리티 문제

### 문제: source 요약이 prefab 로직을 깊이 읽지 않음

에이전트가 `tuning.lua` 수치만 보고 `prefab/*.lua`의 실제 로직(함수 내부, 이벤트 리스너, 컴포넌트 상호작용)을 제대로 분석하지 않았음.

### 예시: alterguardianhat (계몽의 왕관)

**현재 source:**
> Hat. Gestalt attacks deal 42.5 damage. Consumes Enlightened seeds for planar conversion: 3 seeds for full 25% conversion, extra damage up to 8.5.

**실제 소스코드에서 확인된 메커닉 (누락된 것들):**
1. 정신력 85% 이상에서만 활성화 (`SANITY_BECOME_ENLIGHTENED_THRESH = 170/200`)
2. 6슬롯 컨테이너 (달씨앗/포자 장착)
3. 공격 시 게슈탈트 투사체 소환 + **정신력 -1 소모**
4. 달씨앗 6개 꽉 차면 **강제 계몽 상태** + **게슈탈트 가드 자동 소환** (최대 3마리)
5. 게슈탈트 가드 소환 시 **충전된 달유리 3개 소모**
6. 포자 장착 시 **빛 색상 변경** (빨강/초록/파랑)
7. **광원 제공**
8. **gestaltprotection 태그** (게슈탈트가 공격하지 않음)

→ 핵심 메커닉의 절반 이상이 누락됨

### 영향 범위
- 1028개 전체에 걸쳐 같은 문제가 있을 가능성 높음
- 특히 복잡한 아이템 (왕관, 방어구 세트, 캐릭터 전용, 구조물 등)이 심함
- 단순 아이템 (도끼, 곡괭이, 바닥 타일 등)은 비교적 정확할 것

## TODO (우선순위순)

### 1. ✅ desc 미완료 범위 추가 (101~600) — 완료
- 1028개 전체 13개 언어 desc 완료

### 2. ✅ source 퀄리티 검수 및 보강 — 완료
- 방어구 14종, 모자 45종, 무기 30+종, 도구 15+종, 구조물 25+종, 캐릭터 전용 10+종 검수
- alterguardianhat 완전 재작성 (가장 심한 케이스)
- sword_lunarplant damage 51→38 수정 (item-stats.ts)
- waxwelljournal 그림자 소환 수치 보강
- 빈 source 36개 채움
- 결론: 대부분 양호, 심각한 오류는 alterguardianhat 1건

### 3. desc를 source 보강 후 재작성 — 부분 완료
- alterguardianhat, shadow_battleaxe, abigail_flower desc 재작성 완료
- 나머지는 source가 양호하므로 desc도 대체로 OK
- 필요 시 개별 아이템 보강

### 4. ✅ 최종 검증 — 통과
- 랜덤 샘플 10개 prefab 소스와 대조
- 오류 0건 (WX-78 모듈 수치 미비 1건은 경미)

### 5. 앱 적용 (다음 단계)
- docs/item-list.md 데이터를 실제 앱(item-stats.ts, i18n 등)에 반영
- 현재 앱에 없는 148개 아이템 추가 검토
- desc 다국어를 앱의 로캘 시스템에 통합

## 작업 방법 참고

### 인게임 소스 추출 (세션 시작 시)
```bash
SCRIPTS_ZIP=~/Library/Application\ Support/Steam/steamapps/common/Don\'t\ Starve\ Together/dontstarve_steam.app/Contents/data/databundles/scripts.zip
cd /tmp && unzip -o "$SCRIPTS_ZIP" "scripts/prefabs/*.lua" "scripts/tuning.lua" "scripts/recipes.lua" "scripts/tiledefs.lua" "scripts/strings.lua"
```

### 기본 상수 (tuning.lua)
```
wilson_attack = 34
wilson_health = 150
total_day_time = 480
seg_time = 30
day_time = 300 (= 10 * seg_time)
night_time = 150 (= 5 * seg_time)
dusk_time = 150 (= 5 * seg_time)
multiplayer_armor_durability_modifier = 0.7
multiplayer_armor_absorption_modifier = 1
```

### prefab 소스에서 확인해야 할 핵심 패턴
```lua
-- 무기/데미지
weapon:SetDamage(...)
weapon:SetOnAttack(...)  ← on-hit 효과 함수 반드시 읽기
weapon:SetElectric(...)  ← 전기 피해
damagetypebonus:AddBonus(...)  ← 특정 적 추가 피해
planardamage:SetBaseDamage(...)  ← 차원 피해
weapon.attackwear  ← 특수 내구도 소모

-- 방어구
armor:InitCondition(...)
damagereflect  ← 반사 피해
damagetyperesist  ← 피해 저항
setbonus  ← 세트 효과

-- 장착 효과
equippable.walkspeedmult  ← 이동속도
equippable.dapperness  ← 정신력 변화
equippable.dapperfn  ← 조건부 정신력 (함수)
neg_aura_modifiers  ← 오라 면역
externalfiredamagemultipliers  ← 화염 저항
burnratemodifiers  ← 허기 감소율

-- 특수 컴포넌트
container  ← 보관 슬롯
heater  ← 온도 제공
cooker  ← 조리 가능
incinerator  ← 소각 가능
shadowdominance  ← 그림자 생물 비공격
raindome  ← 비 보호 돔
autoterraformer  ← 자동 바닥 제거
rechargeable  ← 쿨다운 시스템
aoeweapon_lunge  ← 돌진 공격
petleash  ← 펫 소환/관리

-- 함수 내부 (반드시 읽어야 함)
onattack(inst, owner, target)  ← 타격 시 로직
onequip(inst, owner)  ← 장착 시 로직
scanfordevice(inst)  ← 탐지 로직
DoRegen(inst, owner)  ← 자동 재생
```

### 에이전트 프롬프트 개선 사항
- "tuning.lua만 보지 말고 prefab 함수 내부 로직을 반드시 읽을 것" 명시
- "onattack, onequip 함수 전문을 읽고 특수 효과 추출" 명시
- "컴포넌트 목록만이 아니라 컴포넌트 설정 값과 콜백 함수도 확인" 명시
