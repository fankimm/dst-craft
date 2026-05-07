# Analyze Skill — Learnings

`/analyze` 에이전트가 분석 작업 중 발견한 패턴/노하우 누적 파일.
**이 파일은 git으로 모든 머신에 공유됨**. 새 패턴 발견 시 즉시 추가하고 commit.

---

## 2026-05-08 — 트리거-실효 분리 패턴 (DST 스킬트리)
**맥락**: WX-78 알파 회로 제조 I (alphabuffs_1) 찍었을 때 연산 회로 효과 분석
**패턴**: DST 스킬트리에서 일부 스킬은 "기능 등록"만 하고, 같은 계열의 다음 스킬에서 "실제 발동"이 일어남. 함수가 호출되더라도 내부에서 다른 스킬 활성 여부를 다시 체크하는 경우가 있음.
**예시**:
- `maxsanity1_skill_activate` → `sanity_skill_activate` 호출 → `get_equippable_dappernessfn = GetEquippableDapperness` (함수 등록)
- 그런데 `GetEquippableDapperness` 내부에서 `IsSkillActivated("alphabuffs_2")` 체크
- 즉 알파1만 찍으면 함수만 등록되고 효과 0%, 알파2까지 찍어야 dapperness multiplier가 적용됨
**일반화**: 콜백/함수 등록만 보고 효과가 있다고 판단하지 말 것. 본문에서 어떤 조건으로 분기하는지 확인 필수.

---

## 2026-05-08 — SetModifier는 오버라이드, 합연산 아님 (DST)
**맥락**: WX-78 소화기 회로 분석 (알파1 + 알파2 동시 적용 여부)
**패턴**: `wx.components.<X>.<modifier>:SetModifier(inst, value)` 는 같은 `inst`로 호출되면 이전 값을 덮어씀. 누적 아님.
**예시**:
```lua
local function maxhunger_skill_refresh(inst, wx, isloading)
    local index =
        IsSkillActivated(wx, "wx78_circuitry_alphabuffs_2") and 2 or
        IsSkillActivated(wx, "wx78_circuitry_alphabuffs_1") and 1
    wx.components.hunger.burnratemodifiers:SetModifier(inst, inst._hunger_skill_burnrate_modifiers[index])
end
```
- 알파2 인덱스가 우선 → 알파2 찍으면 알파1 값 덮어쓰기
- 결과: 알파1만 -5%, 알파2 찍으면 -10% (누적 -14.5% 아님)
**일반화**: details/문서 작성 시 알파1과 알파2 효과를 별도 합산처럼 표기하면 오해 유발. "알파2가 알파1을 대체" 명시 필요.

---

## 2026-05-08 — 합연산 패턴 (dapperness multiplier)
**맥락**: 같은 분석에서 정신력 회복 장비 효율 누적 방식
**패턴**: 모듈마다 `_skill_sanity_dapperness_mult` 값을 더해서 multiplier 계산. 1 base + 각 모듈 mult 합산.
**예시**:
```lua
local dapperness_mult = 1
for k, v in ipairs(owner.components.upgrademoduleowner:GetAllModules()) do
    if v._skill_sanity_dapperness_mult and v.components.upgrademodule.activated then
        dapperness_mult = dapperness_mult + v._skill_sanity_dapperness_mult
    end
end
return dapperness * dapperness_mult
```
- 연산 1개(0.10) + 초연산 1개(0.30) = 1.40 = +40%
- 회로당 누적되며 합연산 (곱연산 X)
**일반화**: 같은 효과군이라도 누적 방식이 다름 — 코드를 직접 봐야 정확. SetModifier(오버라이드) vs for-loop 합산(합연산) vs `damage * (1+a) * (1+b)`(곱연산) 구분.

---

## 2026-05-08 — 회로↔스킬 연결 관용구 (DST)
**맥락**: 어떤 회로가 어떤 스킬에 반응하는지 추적
**패턴**: DST WX-78 회로는 `Circuit_SetUpSkillCb(inst, wx, SKILL_LIST, activatefn, deactivatefn, isloading)` 으로 스킬 ↔ 콜백 연결.
- `SKILL_LIST`는 `{ ["스킬ID"] = true }` 테이블 또는 단일 문자열
- 스킬 활성/비활성 시 콜백 자동 호출
**예시**:
```lua
local SANITY_BUFF_SKILLS = {
    ["wx78_circuitry_alphabuffs_1"] = true,
    ["wx78_circuitry_alphabuffs_2"] = true,
}
Circuit_SetUpSkillCb(inst, wx, SANITY_BUFF_SKILLS, maxsanity_skill_activate, maxsanity_skill_deactivate, isloading)
```
**활용법**: 어떤 회로가 어떤 스킬에 반응하는지 모를 땐 `grep "Circuit_SetUpSkillCb" wx78_moduledefs.lua` → 각 모듈의 콜백 등록 부분 확인.

---

## 2026-05-08 — 이름 vs 동작 불일치 (Thermal/Refrigerant)
**맥락**: WX-78 발열 회로 vs 냉각 회로 효과 검증
**패턴**: 회로 이름이 직관적이지 않을 수 있음. 코드 변수명 (예: `HEAT_FREEZE_RESISTANCE`)을 보면 실제 동작 확인 가능.
**예시**:
- 발열 회로(Thermal/Heat) → 빙결 저항 (이름과 직관 다름. 발열로 추위 방어)
- 냉각 회로(Refrigerant/Cold) → 화염/과열 저항 (시원하게 해서 더위 방어)
- 나무위키는 둘을 반대로 적기도 함
**일반화**: 회로/아이템의 효과를 이름만 보고 추측하지 말 것. 코드의 변수명/함수 본문에서 실제 효과 확인.
