# 데미지 계산 공식 (인게임 소스 기준) — #1 데미지 계산기 설계

이 문서는 **인게임 `scripts/` 원본에서 직접 읽은 것만** 적는다. 출처 없는 값은 쓰지 않는다
(#1 AC: "인게임 공식(tuning.lua/prefabs) 기반 계산 — 자체 추측 금지").

스냅샷 경로: `~/dst-game-snapshot/scripts/` (`bash scripts/sync-game-data.sh` 로 갱신)

---

## 1. 가하는 쪽 — `Combat:CalcDamage`

`components/combat.lua:846`

```lua
damage = (basedamage or 0)
    * (basemultiplier or 1)                -- 공격자 combat.damagemultiplier (캐릭터)
    * externaldamagemultipliers:Get()       -- SourceModifierList (버프 — 곱연산 누적)
    * damagetypemult                        -- damagetypebonus (lunar/shadow 특효 등)
    * (multiplier or 1)                     -- 호출부 배율
    * playermultiplier                      -- 대상이 플레이어일 때만
    * pvpmultiplier
    * (customdamagemultfn or 1)
    + (bonus or 0)                          -- ⚠ 배율을 받지 않는다. 마지막에 더한다
```

**`bonus` 가 곱셈 밖이라는 점이 중요하다.** 흔한 오해가 "보너스도 캐릭터 배율을 받는다"인데
소스상 아니다.

무기가 있으면 `basedamage` 는 `Weapon:GetDamage` 에서 오고 **playermultiplier 는 1로 고정**된다
(`combat.lua:865`).

### `Weapon:GetDamage` — `components/weapon.lua:94`
```lua
dmg = FunctionOrValue(self.damage, inst, attacker, target)
if inst.components.damagetypebonus then
    dmg = dmg * damagetypebonus:GetBonus(target)   -- 무기 자체의 특효가 여기서 한 번 더
end
```
→ **무기의 damagetypebonus 와 공격자의 damagetypebonus 는 곱으로 누적**된다
(`combat.lua:868` 주석: "entity's own damagetypebonus stacks with weapon's").

---

## 2. 받는 쪽 — `Combat:GetAttacked`

`components/combat.lua:568`

순서가 곧 규칙이다:
1. `ShouldRecoil` (반사)
2. `inventory:ApplyDamage(damage, attacker, weapon, spdamage)` — **방어구 흡수**
3. 안장(`saddler:ApplyDamage`)
4. `damagetyperesist:GetResist` → `damagetypemult` 에 곱
5. `damage = damage * damagetypemult * externaldamagetakenmultipliers:Get()`
6. **보너스 데미지는 방어구를 통과한 뒤에 더해진다** (`combat.lua:636` 주석:
   "Bonus damage only applies after unabsorbed damage gets through your armor")

---

## 3. 확인된 상수 (`tuning.lua`)

| 키 | 값 | 줄 |
|---|---|---|
| `WATHGRITHR_DAMAGE_MULT` (위그프리드) | `1.25` | 2688 |
| `WATHGRITHR_ABSORPTION` | `0.25` | 2689 |
| `WOLFGANG_ATTACKMULT_MIGHTY_MAX` | `2` | 2679 |
| `WOLFGANG_ATTACKMULT_MIGHTY_MIN` | `1.25` | 2680 |
| `WOLFGANG_START_MIGHTY_THRESH` | `225` | 2663 |
| `WOLFGANG_END_MIGHTY_THRESH` | `220` | 2664 |
| `ELECTRIC_DAMAGE_MULT` | `1.5` | 658 |
| `ELECTRIC_WET_DAMAGE_MULT` | `1` | 657 |
| `WEAPONS_LUNARPLANT_SETBONUS_DAMAGE_MULT` | `1.1` | 394 |
| `WATHGRITHR_SPEAR_DAMAGE` | `wilson_attack * 1.25` | 356 |
| `HAMBAT_MIN_DAMAGE_MODIFIER` | `.5` | 353 |

캐릭터 배율을 실제로 설정하는 곳 (`combat.damagemultiplier =`):
- `prefabs/wathgrithr.lua:199` → `WATHGRITHR_DAMAGE_MULT`
- `prefabs/wendy.lua:416` → `WENDY_DAMAGE_MULT`
- `prefabs/wes.lua:78` → `WES_DAMAGE_MULT`

**볼프강은 이 목록에 없다** — 폼(mightiness)에 따라 연속적으로 바뀌므로 별도 컴포넌트에서
갱신한다. 계산기에서 볼프강을 다루려면 mightiness → 배율 곡선을 따로 읽어야 한다
(`MIGHTY_MIN 1.25` ~ `MIGHTY_MAX 2` 사이).

### 전기 데미지 — 습기와 얽힌다
`prefabs/lightninggoat.lua:148`, `moonstorm_spark.lua:33`:
```lua
damage_mult = TUNING.ELECTRIC_DAMAGE_MULT + TUNING.ELECTRIC_WET_DAMAGE_MULT * attacker:GetWetMultiplier()
```
→ **번개 데미지는 대상의 젖음 정도에 따라 1.5배에서 2.5배까지 변한다.** 계산기에 넣으려면
젖음 입력이 필요하다. `combat.lua:1181` 은 무기의 `electric_damage_mult` 가 있으면 그걸 우선한다.

---

## 4. 동네북씨 (`prefabs/punchingbag.lua`)

| 항목 | 값 | 근거 |
|---|---|---|
| 최대 체력 | **10009** | `MAX_NUM(9999) + 10`, `health:SetMaxHealth(MAX_NUM + 10)` (215) |
| 최소 체력 | 1 | `SetMinHealth(1)` (216) |
| 재생 | `10009` 를 `0.1` 초마다 | `StartRegen(MAX_NUM + 10, 0.1)` (217) |
| 표시 자릿수 | 4자리, 최대 9999 | `NUM_DIGITS, MAX_NUM = 4, 9999` (32) |
| 태그 | `structure`, `equipmentmodel`, `wooden` | 175~177 |

- 방어구 없음(구조물) → **흡수 0**. 그래서 계산기의 기준 대상으로 적합하다
- 화면 숫자는 `on_health_delta` 가 `math.floor(math.abs(data.amount))` — **내림**
- 변종 `punchingbag_lunar` / `punchingbag_shadow` 는 별도 태그를 달아 `damagetypebonus`
  (특효 무기)의 대상이 된다 → 계산기의 "더미 종류" 입력이 여기에 매핑된다

---

## 5. 아직 못 찾은 것 (추측하지 말 것)

- **고추(`spice_chili`) 데미지 버프** — `prefabs/spices.lua:48` 에 `MakeSpice("spice_chili")`
  로 등록만 확인. `tuning.lua` 에 데미지 상수가 없고 `SPICE_MULTIPLIERS` 에는 `SPICE_SALT`
  의 `HEALTH` 만 있다. 버프 실체를 `components/` 나 `prefabs/preparedfoods*` 에서 더 찾아야 한다.
  `tuning.lua:6629` 의 `voltgoatjelly_spice_chili = 1` 은 요리 조합표로 보이며 데미지와 무관할
  가능성이 높다
- **planar damage(`spdamage`) 전체 경로** — `SpDamageUtil.CollectSpDamage` / `ApplyMult` 와
  `EquipHasSpDefenseForType("planar")` 분기. 달/그림자 장비 계산에 필수
- **볼프강 mightiness → 배율 곡선** — 임계값 두 개만 확인됨
- **`damagetypebonus:GetBonus`** 의 태그 매칭 규칙

---

## 6. 계산기 설계 방향

`docs/ui.md` 의 기존 패턴을 따른다 — 아이템 나열은 `ItemSlot`, 메타 정보는 `TagChip`.

입력: 캐릭터 / 무기 / 음식 버프 / 더미 종류(일반·lunar·shadow) / 변수 토글
출력: 1히트 데미지 · 처치까지 타격 수(`ceil(10009 / dmg)`) · 무기 내구도 소모

**표시 데미지는 `Math.floor`** 로 맞춘다 — 게임 화면이 `math.floor` 를 쓰므로 반올림하면
인게임 숫자와 1씩 어긋난다.

무기 데미지는 `src/data/scrapbook-stats.ts` 에 이미 있다(`damage` 항목 314건). 캐릭터 배율·
버프 상수는 `tuning.lua` 에서 뽑는 converter 를 새로 만들어야 한다 —
`scripts/convert-scrapbook.py` 와 같은 방식으로 `scripts/sync-game-data.sh` 에 물린다.
그래야 게임 업데이트 때 같이 갱신된다(수치를 손으로 박으면 다음 패치에서 조용히 낡는다).
