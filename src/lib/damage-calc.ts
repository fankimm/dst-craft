/**
 * 데미지 계산 엔진 — 동네북씨(Punching Bag) 기준.
 *
 * 인게임 공식 (scripts/components/combat.lua, inventory.lua, planarentity.lua):
 *  1. raw = weapon_damage * char_mult * external_mult * electric_mult + bonus
 *  2. 갑옷 흡수: leftover = raw * (1 - max(absorb_percent))
 *  3. planar entity (lunar/shadow 표적): leftover = (sqrt(leftover*4 + 64) - 8) * 4
 *  4. spdamage(planar) = max(0, weapon_planar - target_planar_def)  (방어 ≥ 공격이면 0)
 *  5. total = leftover + spdamage
 *
 * Punching Bag HP = 10009 (MAX_NUM 9999 + 10).
 */

import { scrapbookStats } from "@/data/scrapbook-stats";
import { allLocales } from "@/data/locales";

export const PUNCHINGBAG_HP = 10009;

export type DummyId = "punchingbag" | "punchingbag_lunar" | "punchingbag_shadow";

export interface CharacterOption {
  id: string;
  name: string;
  /** combat.damagemultiplier */
  mult: number;
  /** 추가 설명 (e.g. "강함 폼") */
  note?: string;
}

/** 캐릭터 공격 배율 (combat.damagemultiplier) */
export const CHARACTERS: CharacterOption[] = [
  { id: "default", name: "일반 (1.0×)", mult: 1.0 },
  { id: "wigfrid", name: "위그프리드 (1.25×)", mult: 1.25, note: "기본 공격력 증가" },
  { id: "wolfgang_wimpy", name: "볼프강 (약함)", mult: 0.5, note: "허기 < 임계값" },
  { id: "wolfgang_normal", name: "볼프강 (보통)", mult: 1.0, note: "허기 보통" },
  { id: "wolfgang_mighty", name: "볼프강 (강함)", mult: 2.0, note: "허기 최대" },
  { id: "wendy", name: "웬디 (0.75×)", mult: 0.75, note: "기본 공격력 감소" },
];

export interface BuffToggle {
  id: string;
  label: string;
  /** 짧은 부연 (UI 보조 텍스트) */
  note?: string;
  /** 곱연산 보너스 (externaldamagemultipliers) */
  damageMult?: number;
  /** 가산 planar damage */
  planarBonus?: number;
  /** stimuli="electric" 활성화 */
  electric?: boolean;
}

/** 토글 가능한 보너스 (음식/장비 효과 등) */
export const BUFFS: BuffToggle[] = [
  {
    id: "spice_chili",
    label: "고추 양념 (BUFF_ATTACK)",
    note: "+20% 공격력, 절반 하루 지속",
    damageMult: 1.2,
  },
  {
    id: "voltgoatjelly",
    label: "번개 염소 쇼프로아",
    note: "전기 공격 부여 (×1.5, 젖은 적 ×2.5)",
    electric: true,
  },
  {
    id: "wagpunkhat_buff",
    label: "와.비.스. 헤드기어 분석 완료",
    note: "+20% 공격력 (타겟 추적 4단계 도달)",
    damageMult: 1.2,
  },
  {
    id: "lunarplant_set",
    label: "빛말풀 세트 보너스 (최대 누적)",
    note: "차원 피해 +24 (6히트 누적)",
    planarBonus: 24,
  },
];

export interface WeaponSpec {
  id: string;
  name: string;
  damage: number;
  uses: number | null;
  planarDamage?: number;
  /** 기본 stimuli="electric" 무기 (뇌전창 등) */
  electric?: boolean;
  /** 캐릭터 잠금 (예: wigfrid 전용) */
  characterLock?: string;
  /** 신선도 따라 50%까지 감소 등 부연 */
  note?: string;
}

export interface ArmorSpec {
  id: string;
  name: string;
  /** armor_hp (내구도) */
  hp: number;
  absorb: number;
  planarDef?: number;
  /** head/body 슬롯 — 장착 가능 슬롯 */
  slot: "head" | "body";
  /** 캐릭터 잠금 */
  characterLock?: string;
}

const koLocale = allLocales.ko;
function koName(id: string, fallback: string): string {
  return koLocale?.items?.[id]?.name ?? fallback;
}

/**
 * 큐레이션된 무기 목록. scrapbookStats가 원천 데이터.
 * 표시 우선순위가 높은 인기 무기 위주.
 */
const WEAPON_IDS: Array<{ id: string; lock?: string; electric?: boolean; note?: string }> = [
  { id: "spear" },
  { id: "spear_wathgrithr", lock: "wigfrid" },
  { id: "spear_wathgrithr_lightning", lock: "wigfrid", electric: true, note: "젖은 적에게 추가 피해" },
  { id: "spear_wathgrithr_lightning_charged", lock: "wigfrid", electric: true, note: "충전된 뇌전창 (+이속)" },
  { id: "hambat", note: "신선도에 따라 50%까지 감소 (계산은 신선 100% 기준)" },
  { id: "batbat" },
  { id: "nightsword" },
  { id: "glasscutter", note: "그림자 적 ×1.25 (별도 계산)" },
  { id: "ruins_bat" },
  { id: "sword_lunarplant" },
  { id: "shadow_battleaxe", note: "킬 레벨업 시 차원 피해 증가 (Lv1: +10, Lv4: +22)" },
  { id: "trident" },
  { id: "whip" },
  { id: "fence_rotator" },
  { id: "nightstick", electric: true },
];

const ARMOR_IDS: Array<{ id: string; slot: "head" | "body"; lock?: string }> = [
  // 머리
  { id: "footballhat", slot: "head" },
  { id: "wathgrithrhat", slot: "head", lock: "wigfrid" },
  { id: "wathgrithr_improvedhat", slot: "head", lock: "wigfrid" },
  { id: "ruinshat", slot: "head" },
  { id: "dreadstonehat", slot: "head" },
  { id: "lunarplanthat", slot: "head" },
  { id: "voidclothhat", slot: "head" },
  { id: "wagpunkhat", slot: "head" },
  // 몸통
  { id: "armorgrass", slot: "body" },
  { id: "armorwood", slot: "body" },
  { id: "armormarble", slot: "body" },
  { id: "armor_sanity", slot: "body" },
  { id: "armorruins", slot: "body" },
  { id: "armordragonfly", slot: "body" },
  { id: "armordreadstone", slot: "body" },
  { id: "armorwagpunk", slot: "body" },
  { id: "armor_lunarplant", slot: "body" },
  { id: "armor_voidcloth", slot: "body" },
];

function buildWeapon(spec: { id: string; lock?: string; electric?: boolean; note?: string }): WeaponSpec | null {
  const s = scrapbookStats[spec.id];
  if (!s) return null;
  const damage = typeof s.weapondamage === "number" ? s.weapondamage : 0;
  return {
    id: spec.id,
    name: koName(spec.id, spec.id),
    damage,
    uses: s.finiteuses ?? null,
    planarDamage: s.planardamage,
    electric: spec.electric,
    characterLock: spec.lock,
    note: spec.note,
  };
}

function buildArmor(spec: { id: string; slot: "head" | "body"; lock?: string }): ArmorSpec | null {
  const s = scrapbookStats[spec.id];
  if (!s) return null;
  return {
    id: spec.id,
    name: koName(spec.id, spec.id),
    hp: s.armor ?? 0,
    absorb: s.absorb_percent ?? 0,
    planarDef: s.armor_planardefense,
    slot: spec.slot,
    characterLock: spec.lock,
  };
}

export const WEAPONS: WeaponSpec[] = WEAPON_IDS
  .map(buildWeapon)
  .filter((w): w is WeaponSpec => w !== null);

export const ARMORS: ArmorSpec[] = ARMOR_IDS
  .map(buildArmor)
  .filter((a): a is ArmorSpec => a !== null);

export interface DummySpec {
  id: DummyId;
  name: string;
  /** planarentity 보유 여부 (lunar/shadow는 일반 데미지를 약화시킴) */
  hasPlanarEntity: boolean;
}

export const DUMMIES: DummySpec[] = [
  { id: "punchingbag", name: "동네북씨", hasPlanarEntity: false },
  { id: "punchingbag_lunar", name: "빛 동네북씨", hasPlanarEntity: true },
  { id: "punchingbag_shadow", name: "그림자 동네북씨", hasPlanarEntity: true },
];

// =====================================================================
// 계산 엔진
// =====================================================================

export interface DamageInput {
  weaponId: string;
  characterId: string;
  dummyId: DummyId;
  /** 더미에 장착할 갑옷 ID (head/body 각 1개) */
  dummyHeadArmorId: string | null;
  dummyBodyArmorId: string | null;
  /** 활성 buff id 목록 (BUFFS의 id) */
  activeBuffs: Set<string>;
  /** 표적이 젖었는지 (전기 1.5x → 2.5x) */
  wetTarget: boolean;
}

export interface DamageOutput {
  /** 1히트당 표적 체력에 들어가는 총 피해 */
  totalPerHit: number;
  /** 정규 데미지 (방어/플레이너 엔티티 통과 후) */
  regularPart: number;
  /** 차원 피해 (방어 차감 후) */
  planarPart: number;
  /** 처치까지 필요한 타격 수 */
  hitsToKill: number;
  /** 무기 1개 처치까지 들어가는 횟수 (uses 단위) */
  weaponsUsed: number | null;
  /** 무기 1자루로 처치 가능한 더미 수 */
  killsPerWeapon: number | null;
  /** 단계별 표시용 디버그 정보 */
  trace: {
    baseDamage: number;
    charMult: number;
    externalMult: number;
    electricMult: number;
    rawDamage: number;
    armorAbsorb: number;
    afterArmor: number;
    afterPlanarEntity: number;
    weaponPlanar: number;
    bonusPlanar: number;
    planarDef: number;
    planarApplied: number;
  };
}

export function calcDamage(input: DamageInput): DamageOutput | null {
  const weapon = WEAPONS.find((w) => w.id === input.weaponId);
  const dummy = DUMMIES.find((d) => d.id === input.dummyId);
  if (!weapon || !dummy) return null;
  const character = CHARACTERS.find((c) => c.id === input.characterId);
  const charMult = character?.mult ?? 1;

  const head = input.dummyHeadArmorId ? ARMORS.find((a) => a.id === input.dummyHeadArmorId) : null;
  const body = input.dummyBodyArmorId ? ARMORS.find((a) => a.id === input.dummyBodyArmorId) : null;
  const equippedArmors = [head, body].filter((a): a is ArmorSpec => a != null);

  // 외부 곱 (음식 버프, 장비 버프 등)
  let externalMult = 1;
  let bonusPlanar = 0;
  let buffElectric = false;
  for (const buffId of input.activeBuffs) {
    const buff = BUFFS.find((b) => b.id === buffId);
    if (!buff) continue;
    if (buff.damageMult) externalMult *= buff.damageMult;
    if (buff.planarBonus) bonusPlanar += buff.planarBonus;
    if (buff.electric) buffElectric = true;
  }

  // 전기 멀티 — TUNING.ELECTRIC_DAMAGE_MULT=1.5, ELECTRIC_WET_DAMAGE_MULT=1.0
  const isElectric = !!weapon.electric || buffElectric;
  const electricMult = isElectric ? (1.5 + (input.wetTarget ? 1.0 : 0)) : 1;

  const baseDamage = weapon.damage;
  const rawDamage = baseDamage * charMult * externalMult * electricMult;

  // 갑옷 흡수 — combat.lua: max(absorb_percent of equipped)
  const maxAbsorb = equippedArmors.reduce((m, a) => Math.max(m, a.absorb), 0);
  const armorAbsorb = rawDamage * maxAbsorb;
  const afterArmor = rawDamage - armorAbsorb;

  // planarentity dampening — sqrt(damage*4+64)*-8)*4. 타겟이 lunar/shadow일 때만.
  let afterPlanarEntity = afterArmor;
  if (dummy.hasPlanarEntity && afterArmor > 0) {
    afterPlanarEntity = (Math.sqrt(afterArmor * 4 + 64) - 8) * 4;
    if (afterPlanarEntity < 0) afterPlanarEntity = 0;
  }

  // planar damage 처리
  const weaponPlanar = weapon.planarDamage ?? 0;
  const totalPlanar = weaponPlanar + bonusPlanar;
  // planar def — 갑옷의 armor_planardefense 합산 (인게임에서는 ApplySpDefense로 차감)
  const planarDef = equippedArmors.reduce((sum, a) => sum + (a.planarDef ?? 0), 0);
  // SpDamageUtil.ApplySpDefense: v > def → v - def, 아니면 0
  const planarApplied = totalPlanar > planarDef ? totalPlanar - planarDef : 0;

  const totalPerHit = afterPlanarEntity + planarApplied;
  const hitsToKill = totalPerHit > 0 ? Math.ceil(PUNCHINGBAG_HP / totalPerHit) : Infinity;
  const weaponsUsed = weapon.uses ? hitsToKill : null;
  const killsPerWeapon = weapon.uses ? Math.floor(weapon.uses / Math.max(1, hitsToKill)) : null;

  return {
    totalPerHit,
    regularPart: afterPlanarEntity,
    planarPart: planarApplied,
    hitsToKill,
    weaponsUsed,
    killsPerWeapon,
    trace: {
      baseDamage,
      charMult,
      externalMult,
      electricMult,
      rawDamage,
      armorAbsorb,
      afterArmor,
      afterPlanarEntity,
      weaponPlanar,
      bonusPlanar,
      planarDef,
      planarApplied,
    },
  };
}
