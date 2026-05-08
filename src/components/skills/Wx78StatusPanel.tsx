"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  WX78_CIRCUITS,
  WX78_CIRCUITS_BY_ID,
  WX78_TUNING,
  TYPE_COLORS,
  typeLabel,
  type CircuitType,
  type CircuitModule,
} from "@/data/wx78-circuits";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { skillTranslations } from "@/data/skill-trees/translations";
import type { Locale } from "@/lib/i18n";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";
import { Footer } from "../crafting/Footer";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import { EffectCard } from "./Wx78CircuitBoard";

interface Props {
  locale: Locale;
  activatedSkills: Set<string>;
  counts: CircuitCounts;
}

// ── Paragraph parsing (mirrors Wx78CircuitBoard.ScrapbookEffects) ──
const KO_SKILL_RE = /^(알파|베타|감마) 회로 제조 (I{1,2})/;
const EN_SKILL_RE = /^(Alpha|Beta|Gamma) Circuit Tinkering (I{1,2})/;
// heat 모듈처럼 인게임 텍스트에 "소켓 N개 필요. 소켓 N개 필요." 중복 박혀있는 케이스 → +로 1번 이상 strip
const KO_SOCKET_RE = /^(?:소켓 \d+개 필요\.\s*)+/;
const EN_SOCKET_RE = /^(?:Requires \d+ sockets? and\s*)+/i;

// 모듈 본문 중 인게임 텍스트가 count로 분기되는 케이스를 현재 장착수 기준 단일 표현으로.
// (인게임 표기 그대로 유지 + 현재 상태에 맞는 한 문장만 노출 — 사용자 피드백 #940)
function simplifyConditionalBody(body: string, moduleId: string, count: number, locale: Locale): string {
  if (locale !== "ko") return body;
  // heat: "빙결 저항 효과를 얻으며, 2개를 장착하면 빙결에 면역이 된다."
  //  - count=1 → "빙결 저항 효과를 얻는다."
  //  - count>=2 → "빙결에 면역이 된다."
  if (moduleId === "wx78module_heat" && /^빙결 저항 효과를 얻으며,\s*2개를 장착하면 빙결에 면역이 된다/.test(body)) {
    return count >= 2 ? "빙결에 면역이 된다." : "빙결 저항 효과를 얻는다.";
  }
  return body;
}

// 동일 텍스트를 가진 행을 하나로 합치는 dedupe pass. light/light2의 "빛을 발산한다." 같이
// 여러 모듈이 같은 효과 문구를 갖는 경우 카드 1장으로 표시 (사용자 피드백 #941).
function dedupeRowsByText(rows: EffectRow[]): EffectRow[] {
  const seen = new Map<string, EffectRow>();
  for (const r of rows) {
    const key = `${r.skillId ?? ""}|${r.text}`;
    if (!seen.has(key)) seen.set(key, r);
  }
  return Array.from(seen.values());
}

function detectSkillId(para: string, locale: Locale): { skillId: string; label: string } | null {
  const re = locale === "ko" ? KO_SKILL_RE : EN_SKILL_RE;
  const m = para.match(re);
  if (!m) return null;
  const groupKo = m[1];
  const level = m[2] === "II" ? 2 : 1;
  const groupKey =
    groupKo === "알파" || groupKo === "Alpha" ? "alpha" :
    groupKo === "베타" || groupKo === "Beta" ? "beta" : "gamma";
  return {
    skillId: `wx78_circuitry_${groupKey}buffs_${level}`,
    label: m[0],
  };
}

interface EffectRow {
  // unique key (moduleId + paragraph index)
  key: string;
  text: string;          // paragraph text (cleaned)
  rawText: string;       // full original paragraph (for DetailPanel)
  module: CircuitModule;
  count: number;         // module count
  skillId?: string;      // skill that activates this paragraph (only for buff)
  skillLabel?: string;
}

function buildEffectRows(
  counts: CircuitCounts,
  activatedSkills: Set<string>,
  locale: Locale,
): EffectRow[] {
  const rows: EffectRow[] = [];
  for (const type of ["alpha", "beta", "gamma"] as CircuitType[]) {
    for (const [id, count] of Object.entries(counts)) {
      if (!count) continue;
      const m = WX78_CIRCUITS_BY_ID[id];
      if (!m || m.type !== type) continue;
      const sb = scrapbookStats[id];
      const text = sb && (locale === "ko" ? sb.specialinfo_ko : sb.specialinfo_en);
      if (!text) continue;
      const paras = text.split(/\n\n+/).slice(1); // skip first (compatibility)
      paras.forEach((para, i) => {
        const skill = detectSkillId(para, locale);
        if (skill) {
          if (!activatedSkills.has(skill.skillId)) return; // not learned → skip
          // Body without skill prefix
          let body = locale === "ko"
            ? para.replace(/^.+?의 효과로\s*/, "")
            : para.replace(EN_SKILL_RE, "").replace(/^\s+/, "");
          // 조건부 텍스트 정리: heat 모듈의 "빙결 저항 효과를 얻으며, 2개를 장착하면 빙결에 면역이 된다"
          // 같이 count로 분기되는 문구는 현재 장착수 기준으로 단일 표현만 표시.
          body = simplifyConditionalBody(body, id, count, locale);
          rows.push({
            key: `${id}:${i}`,
            text: body,
            rawText: para,
            module: m,
            count,
            skillId: skill.skillId,
            skillLabel: skill.label,
          });
        } else {
          // Default paragraph — strip socket prefix
          const cleaned = (locale === "ko" ? para.replace(KO_SOCKET_RE, "") : para.replace(EN_SOCKET_RE, "")).trim();
          if (!cleaned) return;
          rows.push({
            key: `${id}:${i}`,
            text: cleaned,
            rawText: para,
            module: m,
            count,
          });
        }
      });
    }
  }
  return rows;
}

// ── Vital aggregation ────────────────────────────────────────
// 같은 vital(체/허/정) stat을 여러 회로가 올리면 카드 하나로 합쳐 표시.
// 인게임 텍스트 원문 형식("최대 N이 V 증가한다.") 그대로 쓰되 V만 합산값으로 치환.
type VitalKind = "maxHealth" | "maxSanity" | "maxHunger";

const VITAL_FROM_KO_LABEL: Record<string, VitalKind> = {
  "체력": "maxHealth",
  "정신력": "maxSanity",
  "허기": "maxHunger",
};

// 행 텍스트에서 vital 부분만 추출(합산용) + 나머지 텍스트 분리.
// 표준화 케이스:
//   1) standalone:  "최대 X(이|가) N 증가한다."
//   2) 앞에 붙은 compound:  "최대 X(이|가) N 증가하고[, ] ..."
//   3) 끝에 붙은 compound:  "..., 최대 X(이|가) N 증가한다."
function extractVitalKo(text: string): { kind: VitalKind; perModule: number; rest: string } | null {
  let m = text.match(/^최대 (체력|정신력|허기)(?:이|가) (\d+) 증가한다\.?\s*$/);
  if (m) return { kind: VITAL_FROM_KO_LABEL[m[1]], perModule: parseInt(m[2], 10), rest: "" };
  m = text.match(/^최대 (체력|정신력|허기)(?:이|가) (\d+) 증가하고[,\s]+(.+)$/);
  if (m) return { kind: VITAL_FROM_KO_LABEL[m[1]], perModule: parseInt(m[2], 10), rest: m[3].trim() };
  m = text.match(/^(.+),\s*최대 (체력|정신력|허기)(?:이|가) (\d+) 증가한다\.?\s*$/);
  if (m) {
    const rest = m[1].trim();
    return { kind: VITAL_FROM_KO_LABEL[m[2]], perModule: parseInt(m[3], 10), rest: rest.endsWith(".") ? rest : `${rest}.` };
  }
  return null;
}

// baseRows에서 vital 부분 분리: standalone vital 행은 제거 (헤더에 별도 표시),
// compound 패러그래프는 vital 부분만 잘라내고 나머지 텍스트로 별도 row.
function aggregateVitalRows(
  rows: EffectRow[],
  locale: Locale,
): { remaining: EffectRow[] } {
  if (locale !== "ko") return { remaining: rows };
  const remaining: EffectRow[] = [];
  for (const row of rows) {
    if (row.skillId) { remaining.push(row); continue; }
    const ex = extractVitalKo(row.text);
    if (!ex) { remaining.push(row); continue; }
    if (ex.rest) remaining.push({ ...row, text: ex.rest });
    // standalone 행은 drop (vital만 있던 행 → 헤더에서 표시)
  }
  return { remaining };
}

// ── MoveSpeed aggregation ────────────────────────────────────
// 게임 메커닉: TUNING.MOVESPEED_CHIPBOOSTS = [0, 0.25, 0.4, 0.5] (chip count → 보너스율).
// movespeed + movespeed2 chip 수를 합쳐서 인덱스 lookup. 각 모듈 본문은 lookup table을
// 그대로 박아둔 텍스트("1개 장착 시 25%, 2개 40%, ...")라 사용자에겐 혼란 → 현재 장착 수에
// 해당하는 단일 값으로 압축 표시.
const MOVESPEED_CHIPBOOSTS = [0, 0.25, 0.4, 0.5];

function totalMoveSpeedChips(counts: CircuitCounts): number {
  let chips = 0;
  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m) continue;
    for (const s of m.stats ?? []) {
      if (s.kind === "moveSpeed") chips += s.value * count;
    }
  }
  return chips;
}

function moveSpeedPct(chips: number): number {
  const idx = Math.min(chips, MOVESPEED_CHIPBOOSTS.length - 1);
  return MOVESPEED_CHIPBOOSTS[idx];
}

function moveSpeedText(pct: number, locale: Locale): string {
  const p = Math.round(pct * 100);
  return locale === "ko" ? `이동 속도가 ${p}% 증가한다.` : `Movement speed +${p}%.`;
}

// movespeed/movespeed2의 baseRow는 합산 카드로 대체 → 원본 row drop.
function isMoveSpeedRow(row: EffectRow): boolean {
  if (row.skillId) return false;
  const id = row.module.id;
  if (id !== "wx78module_movespeed" && id !== "wx78module_movespeed2") return false;
  return /이동\s*속도/.test(row.text) || /movement\s*speed/i.test(row.text);
}

// ── ArmorPct aggregation (alpha-buff-2 학습 시 발생하는 buff) ──
// MAXHEALTH_ARMOR_ALPHABUFF_2 = 0.025 (per maxhealth), * 2 = 0.05 (per maxhealth2).
// 둘 다 끼고 Tinkering II 학습 시 additive 합산 (별개 sourcemodifierlist 항목).
// buffRows에서 "방어력이 N% 증가한다." 패턴 감지 → 합산 단일 카드.
function extractArmorBuffPct(text: string): number | null {
  const ko = text.match(/^방어력이 (\d+(?:\.\d+)?)% 증가한다\.?\s*$/);
  if (ko) return parseFloat(ko[1]);
  const en = text.match(/^Increases armor by (\d+(?:\.\d+)?)%\.?\s*$/);
  if (en) return parseFloat(en[1]);
  return null;
}

function armorBuffText(pct: number, locale: Locale): string {
  const formatted = Number.isInteger(pct) ? pct.toString() : pct.toFixed(1).replace(/\.0$/, "");
  return locale === "ko" ? `방어력이 ${formatted}% 증가한다.` : `Increases armor by ${formatted}%.`;
}

// buffRows에서 armor pct 합산. 같은 skill(alpha-buff-2)에 묶임.
function aggregateArmorBuffs(
  rows: EffectRow[],
): { remaining: EffectRow[]; armor: { skillId: string; total: number } | null } {
  let total = 0;
  let skillId: string | undefined;
  const remaining: EffectRow[] = [];
  for (const row of rows) {
    if (!row.skillId) { remaining.push(row); continue; }
    const pct = extractArmorBuffPct(row.text);
    if (pct == null) { remaining.push(row); continue; }
    total += pct * row.count;
    skillId = row.skillId;
  }
  return { remaining, armor: total > 0 && skillId ? { skillId, total } : null };
}

// ── Slow reduction (둔화 저항) ────────────────────────────────
// 게임 메커닉 (wx78_common.lua COMMON_ModifySpeedMultiplier):
//   if Tinkering II activated and slow_mult < 1:
//     reclaim = (1 - slow_mult) / 4 (denominator=4)
//     final_mult = min(slow_mult + reclaim * chip_count, 1)
// → chip 1개당 25% 둔화 회복, 4개 이상이면 100% (둔화 무효)
function slowReductionPct(chips: number, hasTinkeringII: boolean): number {
  if (!hasTinkeringII || chips === 0) return 0;
  return Math.min(chips * 0.25, 1);
}

// buffRows에서 둔화 행 제거 ("둔화 효과를 N% 적게 받는다." / English).
function isSlowBuffRow(row: EffectRow): boolean {
  if (!row.skillId) return false;
  if (/^둔화 효과를 \d+% 적게 받는다/.test(row.text)) return true;
  if (/^Reduces slowness effects by \d+%/i.test(row.text)) return true;
  return false;
}

// ── Alpha buffs aggregation ──────────────────────────────────
// 정신력 감소 오라 영향 (T1 학습 시 active). 게임 메커닉: SourceModifierList multiplicative product.
//   maxsanity1 (T1 활성): 0.8 (-20% aura), maxsanity: 0.5, bee: 0.5
const SANITY_NEG_AURA_MULT: Record<string, number> = {
  wx78module_maxsanity1: WX78_TUNING.MAXSANITY1_SANITY_MOD_ALPHABUFF,  // 0.8
  wx78module_maxsanity: WX78_TUNING.MAXSANITY_SANITY_MOD_ALPHABUFF,    // 0.5
  wx78module_bee: WX78_TUNING.MAXSANITY_SANITY_MOD_ALPHABUFF,          // 0.5 (bee uses maxsanity 값 재사용)
};

// 의복에 의한 정신력 회복 (T2 활성). 게임 메커닉: dapperness_mult += per-module value (additive).
const SANITY_DAPPER_MULT: Record<string, number> = {
  wx78module_maxsanity1: WX78_TUNING.MAXSANITY1_DAPPERNESS_MULT,  // 0.10
  wx78module_maxsanity: WX78_TUNING.MAXSANITY_DAPPERNESS_MULT,    // 0.30
  wx78module_bee: WX78_TUNING.MAXSANITY_DAPPERNESS_MULT,          // 0.30
};

function negSanityAuraReduction(counts: CircuitCounts, hasAlphaT1: boolean): number {
  if (!hasAlphaT1) return 0;
  let mult = 1;
  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    const m = SANITY_NEG_AURA_MULT[id];
    if (!m) continue;
    for (let i = 0; i < count; i++) mult *= m;
  }
  return 1 - mult; // 0..1 (감소 비율)
}

function dapperSanityBoost(counts: CircuitCounts, hasAlphaT2: boolean): number {
  if (!hasAlphaT2) return 0;
  let total = 0;
  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    const v = SANITY_DAPPER_MULT[id];
    if (v) total += v * count;
  }
  return total; // 누적 증가 비율
}

// 허기 소모 감소. 게임 메커닉: SourceModifierList multiplicative product.
// maxhunger:
//   base (no skill): 0.80, T1: 0.75, T2: 0.70
// maxhunger1:
//   base: 1 (no effect), T1: 0.95, T2: 0.90
function hungerModuleMult(id: string, hasT1: boolean, hasT2: boolean): number {
  if (id === "wx78module_maxhunger") {
    return hasT2 ? WX78_TUNING.MAXHUNGER_SLOWPERCENT_ALPHABUFF_2  // 0.70
         : hasT1 ? WX78_TUNING.MAXHUNGER_SLOWPERCENT_ALPHABUFF    // 0.75
         : WX78_TUNING.MAXHUNGER_SLOWPERCENT;                      // 0.80
  }
  if (id === "wx78module_maxhunger1") {
    if (hasT2) return WX78_TUNING.MAXHUNGER1_SLOWPERCENT_ALPHABUFF_2; // 0.90
    if (hasT1) return WX78_TUNING.MAXHUNGER1_SLOWPERCENT_ALPHABUFF;   // 0.95
    return 1;
  }
  return 1;
}

function hungerDrainReduction(counts: CircuitCounts, hasT1: boolean, hasT2: boolean): number {
  let mult = 1;
  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    if (id !== "wx78module_maxhunger" && id !== "wx78module_maxhunger1") continue;
    const m = hungerModuleMult(id, hasT1, hasT2);
    for (let i = 0; i < count; i++) mult *= m;
  }
  return 1 - mult;
}

// Row matchers
function isSanityAuraRow(row: EffectRow): boolean {
  return /^정신력 감소 오라의 영향이 \d+% 감소한다\.?\s*$/.test(row.text);
}

function isDapperRow(row: EffectRow): boolean {
  return /^의복에 의한 정신력 회복이 \d+% 증가한다\.?\s*$/.test(row.text);
}

// 의복 정신력 회복 compound prefix 추출 (bee의 "의복 회복 25% 증가하고, 실드 ..." 케이스)
function extractDapperPrefixKo(text: string): { rest: string } | null {
  if (/^의복에 의한 정신력 회복이 \d+% 증가한다\.?\s*$/.test(text)) return { rest: "" };
  const m = text.match(/^의복에 의한 정신력 회복이 \d+% 증가하고[,\s]+(.+)$/);
  if (m) return { rest: m[1].trim() };
  return null;
}

function isHungerDrainRow(row: EffectRow): boolean {
  if (/^허기 소모가? \d+% 감소한다\.?\s*$/.test(row.text)) return true;
  if (/^허기 소모 감소가 \d+%로 증가한다\.?\s*$/.test(row.text)) return true;
  return false;
}

// WX-78 baseline — what the user sees as default max stats (회로/스킬 0 기준)
const WX78_BASE_VITAL = { health: 100, hunger: 100, sanity: 100 };

// ── Aggregate vital stats (HP/Hunger/Sanity) for the StatBox header ──
function aggregateVitals(counts: CircuitCounts): { health: number; hunger: number; sanity: number } {
  let health = WX78_BASE_VITAL.health;
  let hunger = WX78_BASE_VITAL.hunger;
  let sanity = WX78_BASE_VITAL.sanity;
  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m) continue;
    for (const s of m.stats ?? []) {
      if (s.kind === "maxHealth") health += s.value * count;
      else if (s.kind === "maxHunger") hunger += s.value * count;
      else if (s.kind === "maxSanity") sanity += s.value * count;
    }
  }
  return { health, hunger, sanity };
}

// ── Global circuit skills (active effect lines) ───────────────
// Text comes from the skill tree's own desc (ko.po-based) so it stays consistent
// with the Skill Tree tab.
const GLOBAL_CIRCUIT_SKILL_IDS = [
  "wx78_circuitry_betterunplug",
  "wx78_circuitry_bettercharge",
  "wx78_circuitry_slot_1",
];

function getGlobalSkillRows(activatedSkills: Set<string>, locale: Locale): { skill: string; text: string }[] {
  const out: { skill: string; text: string }[] = [];
  for (const id of GLOBAL_CIRCUIT_SKILL_IDS) {
    if (!activatedSkills.has(id)) continue;
    const entry = skillTranslations[id];
    if (!entry) continue;
    const text = locale === "ko" ? entry.desc.ko : entry.desc.en;
    out.push({ skill: id, text });
  }
  return out;
}

function skillLabel(skillId: string, locale: Locale): string {
  const ko = locale === "ko";
  switch (skillId) {
    case "wx78_circuitry_alphabuffs_1": return ko ? "알파 회로 제조 I" : "Alpha Tinkering I";
    case "wx78_circuitry_alphabuffs_2": return ko ? "알파 회로 제조 II" : "Alpha Tinkering II";
    case "wx78_circuitry_betabuffs_1": return ko ? "베타 회로 제조 I" : "Beta Tinkering I";
    case "wx78_circuitry_betabuffs_2": return ko ? "베타 회로 제조 II" : "Beta Tinkering II";
    case "wx78_circuitry_gammabuffs_1": return ko ? "감마 회로 제조 I" : "Gamma Tinkering I";
    case "wx78_circuitry_gammabuffs_2": return ko ? "감마 회로 제조 II" : "Gamma Tinkering II";
    case "wx78_circuitry_betterunplug": return ko ? "회로 분리 효율" : "Better Unplug";
    case "wx78_circuitry_bettercharge": return ko ? "회로 충전 효율" : "Better Charge";
    case "wx78_circuitry_slot_1": return ko ? "추가 회로 슬롯" : "Extra Circuit Slot";
    default: return skillId;
  }
}

// ── Component ────────────────────────────────────────────────
const ALL_CIRCUIT_SKILLS = [
  "wx78_circuitry_alphabuffs_1",
  "wx78_circuitry_alphabuffs_2",
  "wx78_circuitry_betabuffs_1",
  "wx78_circuitry_betabuffs_2",
  "wx78_circuitry_gammabuffs_1",
  "wx78_circuitry_gammabuffs_2",
  "wx78_circuitry_betterunplug",
  "wx78_circuitry_bettercharge",
  "wx78_circuitry_slot_1",
];

type SelectedDetail =
  | { kind: "effect"; row: EffectRow }
  | { kind: "skill"; skill: string; text: string }
  | { kind: "vital"; statKind: "maxHealth" | "maxHunger" | "maxSanity"; total: number }
  | { kind: "movespeed"; chips: number; pct: number }
  | { kind: "armor"; skillId: string; total: number }
  | { kind: "slow"; chips: number; pct: number }
  | { kind: "neg_aura"; pct: number; skillId: string }
  | { kind: "dapper"; pct: number; skillId: string }
  | { kind: "hunger_drain"; pct: number; skillId: string | null };

function readDevShowAll(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("dst:dev-show-all-circuit-effects") === "1";
  } catch {
    return false;
  }
}

export function Wx78StatusPanel({ locale, activatedSkills, counts }: Props) {
  const [devShowAll] = useState(readDevShowAll);

  const effectiveSkills = useMemo(() => {
    if (!devShowAll) return activatedSkills;
    const next = new Set(activatedSkills);
    for (const s of ALL_CIRCUIT_SKILLS) next.add(s);
    return next;
  }, [activatedSkills, devShowAll]);

  const effectiveCounts = useMemo(() => {
    if (!devShowAll) return counts;
    const next: typeof counts = { ...counts };
    for (const c of WX78_CIRCUITS) if (!next[c.id]) next[c.id] = 1;
    return next;
  }, [counts, devShowAll]);

  const vitals = useMemo(() => aggregateVitals(effectiveCounts), [effectiveCounts]);
  const rawEffectRows = useMemo(
    () => buildEffectRows(effectiveCounts, effectiveSkills, locale),
    [effectiveCounts, effectiveSkills, locale],
  );
  // 1차 패스: 카드 리스트에서 vital 부분 분리 — 본문(체/허/정)은 헤더로만 표시하기로 함.
  // compound 패러그래프(maxhunger의 "최대 허기 +N 증가하고 허기 소모 -P% 감소", bee의 회복+max sanity)에서
  // vital 부분만 제거하고 나머지(허기 소모 감소, 회복 등)는 별도 row로 분리.
  const { remaining: afterVital } = useMemo(
    () => aggregateVitalRows(rawEffectRows, locale),
    [rawEffectRows, locale],
  );
  // 2차 패스: moveSpeed 합산 — base row에서 movespeed/movespeed2 텍스트 drop, chip 합으로 stat box
  const moveSpeedChips = useMemo(() => totalMoveSpeedChips(effectiveCounts), [effectiveCounts]);
  const moveSpeedAggregated = moveSpeedChips > 0 ? moveSpeedPct(moveSpeedChips) : 0;
  const afterMoveSpeed = useMemo(
    () => afterVital.filter((r) => !isMoveSpeedRow(r)),
    [afterVital],
  );
  // 3차 패스: armor buff (alpha-buff-2) 합산
  const { remaining: afterArmor, armor: armorBuff } = useMemo(
    () => aggregateArmorBuffs(afterMoveSpeed),
    [afterMoveSpeed],
  );
  // 4차 패스: 둔화 저항 합산 — chip 합 + Tinkering II → 25% × chips capped at 100%
  const hasBetaTinkering2 = effectiveSkills.has("wx78_circuitry_betabuffs_2");
  const slowResistPct = slowReductionPct(moveSpeedChips, hasBetaTinkering2);
  const afterSlow = useMemo(
    () => afterArmor.filter((r) => !isSlowBuffRow(r)),
    [afterArmor],
  );

  // 5차 패스: alpha-buff 합산 — 정신력 감소 오라(T1) + 의복 정신력 회복(T2) + 허기 소모 감소
  // 모듈마다 행이 여러 개씩 나오는 중복을 단일 카드로 압축. compound 본문(bee dapper compound 등)은
  // dapper 부분만 잘라내고 나머지는 별도 row 유지.
  const hasAlphaT1 = effectiveSkills.has("wx78_circuitry_alphabuffs_1");
  const hasAlphaT2 = effectiveSkills.has("wx78_circuitry_alphabuffs_2");
  const negAuraReduction = useMemo(
    () => negSanityAuraReduction(effectiveCounts, hasAlphaT1),
    [effectiveCounts, hasAlphaT1],
  );
  const dapperBoost = useMemo(
    () => dapperSanityBoost(effectiveCounts, hasAlphaT2),
    [effectiveCounts, hasAlphaT2],
  );
  const hungerReduction = useMemo(
    () => hungerDrainReduction(effectiveCounts, hasAlphaT1, hasAlphaT2),
    [effectiveCounts, hasAlphaT1, hasAlphaT2],
  );
  const effectRows = useMemo(() => {
    const out: EffectRow[] = [];
    for (const r of afterSlow) {
      if (negAuraReduction > 0 && isSanityAuraRow(r)) continue;
      if (hungerReduction > 0 && isHungerDrainRow(r)) continue;
      if (dapperBoost > 0 && r.skillId) {
        const ex = extractDapperPrefixKo(r.text);
        if (ex) {
          if (ex.rest) out.push({ ...r, text: ex.rest });
          // standalone dapper row → drop (merged card로 대체)
          continue;
        }
      }
      out.push(r);
    }
    // 동일 텍스트 dedupe (light/light2 "빛을 발산한다." 등 여러 모듈이 같은 효과 문구)
    return dedupeRowsByText(out);
  }, [afterSlow, negAuraReduction, dapperBoost, hungerReduction]);
  const skillRows = useMemo(
    () => getGlobalSkillRows(effectiveSkills, locale),
    [effectiveSkills, locale],
  );

  const equippedTotal = useMemo(
    () => Object.values(effectiveCounts).reduce((a, b) => a + b, 0),
    [effectiveCounts],
  );

  const [selected, setSelected] = useState<SelectedDetail | null>(null);

  if (equippedTotal === 0 && skillRows.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col" data-scroll-container="">
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "ko"
              ? "회로를 장착하거나 회로 관련 스킬을 학습하면 여기에 통합 현황이 표시됩니다."
              : "Equip circuits or learn circuit-related skills to see the combined status here."}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
      <div className="max-w-2xl mx-auto w-full pb-2 px-3 min-h-full flex flex-col">
        <div className="flex-1">
        {devShowAll && (
          <div className="mt-3 px-3 py-2 rounded-md bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-700 dark:text-amber-400">
            DEV: 모든 회로 +1 + 모든 회로 관련 스킬 학습 가정 — 데브 메뉴에서 OFF
          </div>
        )}
        {/* Vital stats — always show (base 100 + circuits) */}
        <div className="mt-3 flex items-center justify-around rounded-lg border border-border bg-surface px-3 py-2.5">
          <VitalStat
            iconSrc={assetPath("/images/ui/health.png")}
            label={locale === "ko" ? "최대 체력" : "Max Health"}
            value={vitals.health}
            onClick={() => setSelected({ kind: "vital", statKind: "maxHealth", total: vitals.health })}
          />
          <VitalStat
            iconSrc={assetPath("/images/ui/hunger.png")}
            label={locale === "ko" ? "최대 허기" : "Max Hunger"}
            value={vitals.hunger}
            divider
            onClick={() => setSelected({ kind: "vital", statKind: "maxHunger", total: vitals.hunger })}
          />
          <VitalStat
            iconSrc={assetPath("/images/ui/sanity.png")}
            label={locale === "ko" ? "최대 정신력" : "Max Sanity"}
            value={vitals.sanity}
            divider
            onClick={() => setSelected({ kind: "vital", statKind: "maxSanity", total: vitals.sanity })}
          />
        </div>

        {/* Combat/movement stats (방어력/이속/둔화) — show when any > 0 */}
        {(armorBuff || moveSpeedAggregated > 0 || slowResistPct > 0) && (
          <div className="mt-2 flex items-center justify-around rounded-lg border border-border bg-surface px-3 py-2.5">
            <VitalStat
              iconSrc={assetPath("/images/game-items/armormarble.png")}
              label={locale === "ko" ? "방어력" : "Armor"}
              value={armorBuff?.total ?? 0}
              display={armorBuff ? `+${Number.isInteger(armorBuff.total) ? armorBuff.total : armorBuff.total.toFixed(1).replace(/\.0$/, "")}%` : "—"}
              onClick={armorBuff ? () => setSelected({ kind: "armor", skillId: armorBuff.skillId, total: armorBuff.total }) : undefined}
            />
            <VitalStat
              iconSrc={assetPath("/images/game-items/cane.png")}
              label={locale === "ko" ? "이동 속도" : "Move Speed"}
              value={moveSpeedAggregated}
              display={moveSpeedAggregated > 0 ? `+${Math.round(moveSpeedAggregated * 100)}%` : "—"}
              divider
              onClick={moveSpeedAggregated > 0 ? () => setSelected({ kind: "movespeed", chips: moveSpeedChips, pct: moveSpeedAggregated }) : undefined}
            />
            <VitalStat
              iconSrc={assetPath("/images/game-items/piggyback.png")}
              label={locale === "ko" ? "둔화 저항" : "Slow Resist"}
              value={slowResistPct}
              display={slowResistPct > 0 ? `−${Math.round(slowResistPct * 100)}%` : "—"}
              divider
              onClick={slowResistPct > 0 ? () => setSelected({ kind: "slow", chips: moveSpeedChips, pct: slowResistPct }) : undefined}
            />
          </div>
        )}

        {(effectRows.length > 0 || skillRows.length > 0 || negAuraReduction > 0 || dapperBoost > 0 || hungerReduction > 0) && (
          <div className="mt-3 space-y-1.5">
            {effectRows.filter((r) => !r.skillId).map((r) => (
              <EffectCard
                key={r.key}
                text={r.text}
                locale={locale}
                onClick={() => setSelected({ kind: "effect", row: r })}
              />
            ))}
            {negAuraReduction > 0 && (
              <EffectCard
                key="neg-aura-agg"
                text={locale === "ko"
                  ? `정신력 감소 오라의 영향이 ${Math.round(negAuraReduction * 100)}% 감소한다.`
                  : `Negative sanity aura effect reduced by ${Math.round(negAuraReduction * 100)}%.`}
                skillLabel={skillLabel("wx78_circuitry_alphabuffs_1", locale)}
                learned
                locale={locale}
                onClick={() => setSelected({ kind: "neg_aura", pct: negAuraReduction, skillId: "wx78_circuitry_alphabuffs_1" })}
              />
            )}
            {dapperBoost > 0 && (
              <EffectCard
                key="dapper-agg"
                text={locale === "ko"
                  ? `의복에 의한 정신력 회복이 ${Math.round(dapperBoost * 100)}% 증가한다.`
                  : `Sanity gain from clothing increased by ${Math.round(dapperBoost * 100)}%.`}
                skillLabel={skillLabel("wx78_circuitry_alphabuffs_2", locale)}
                learned
                locale={locale}
                onClick={() => setSelected({ kind: "dapper", pct: dapperBoost, skillId: "wx78_circuitry_alphabuffs_2" })}
              />
            )}
            {hungerReduction > 0 && (
              <EffectCard
                key="hunger-drain-agg"
                text={locale === "ko"
                  ? `허기 소모가 ${Math.round(hungerReduction * 100)}% 감소한다.`
                  : `Hunger drain reduced by ${Math.round(hungerReduction * 100)}%.`}
                skillLabel={
                  hasAlphaT2 ? skillLabel("wx78_circuitry_alphabuffs_2", locale)
                  : hasAlphaT1 ? skillLabel("wx78_circuitry_alphabuffs_1", locale)
                  : undefined
                }
                learned={hasAlphaT2 || hasAlphaT1 ? true : undefined}
                locale={locale}
                onClick={() => setSelected({ kind: "hunger_drain", pct: hungerReduction, skillId: hasAlphaT2 ? "wx78_circuitry_alphabuffs_2" : hasAlphaT1 ? "wx78_circuitry_alphabuffs_1" : null })}
              />
            )}
            {effectRows.filter((r) => r.skillId).map((r) => (
              <EffectCard
                key={r.key}
                text={r.text}
                skillLabel={r.skillLabel}
                learned
                locale={locale}
                onClick={() => setSelected({ kind: "effect", row: r })}
              />
            ))}
            {skillRows.map((s) => (
              <EffectCard
                key={s.skill}
                text={s.text}
                skillLabel={skillLabel(s.skill, locale)}
                learned
                locale={locale}
                onClick={() => setSelected({ kind: "skill", skill: s.skill, text: s.text })}
              />
            ))}
          </div>
        )}
        </div>

        <div className="mt-auto pt-6">
          <Footer />
        </div>
      </div>

      <DetailPanel open={!!selected} onClose={() => setSelected(null)} hideClose>
        {selected && (
          <Detail
            selected={selected}
            locale={locale}
            effectiveCounts={effectiveCounts}
            hasAlphaT1Detail={hasAlphaT1}
            hasAlphaT2Detail={hasAlphaT2}
          />
        )}
      </DetailPanel>
    </div>
  );
}

// ── UI ──────────────────────────────────────────────────────
function VitalStat({
  iconSrc,
  iconNode,
  label,
  value,
  display,
  divider,
  onClick,
}: {
  iconSrc?: string;
  iconNode?: React.ReactNode;
  label: string;
  value: number;       // 0이면 "—" 표시 (display가 따로 주어지지 않은 경우)
  display?: string;    // "12.5%" 같이 포맷된 표시값. 있으면 value 대신 사용
  divider?: boolean;
  onClick?: () => void;
}) {
  const shown = display ?? (value > 0 ? value.toString() : "—");
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md transition-colors",
        divider && "border-l border-border pl-4",
        onClick && "hover:bg-foreground/5 px-1 -mx-1",
      )}
    >
      {iconSrc ? (
        <img src={iconSrc} alt="" className="size-5 object-contain" />
      ) : iconNode ? (
        <span className="size-5 inline-flex items-center justify-center text-muted-foreground">{iconNode}</span>
      ) : null}
      <div className="text-left">
        <div className="text-sm font-semibold tabular-nums leading-tight text-foreground">
          {shown}
        </div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </button>
  );
}

// ── DetailPanel content ──────────────────────────────────────

// 공용 contributor row (Detail 내부 거의 모든 분기에서 반복되던 li 블록).
function BreakdownRow({
  iconSrc,
  iconRounded,
  name,
  count,
  type,
  rightValue,
}: {
  iconSrc: string;
  iconRounded?: boolean;
  name: string;
  count?: number;
  type?: CircuitType;
  rightValue: React.ReactNode;
}) {
  const color = type ? TYPE_COLORS[type] : undefined;
  return (
    <li className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
      <Image
        src={iconSrc}
        alt=""
        width={28}
        height={28}
        className={cn("size-7 object-contain shrink-0", iconRounded && "rounded-full")}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
          {name}
          {count != null && count > 1 && color && (
            <span
              className="text-[10px] font-bold px-1 rounded-sm tabular-nums"
              style={{ backgroundColor: `${color}30`, color }}
            >
              ×{count}
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {rightValue}
      </span>
    </li>
  );
}

function Detail({
  selected,
  locale,
  effectiveCounts,
  hasAlphaT1Detail,
  hasAlphaT2Detail,
}: {
  selected: SelectedDetail;
  locale: Locale;
  effectiveCounts: CircuitCounts;
  hasAlphaT1Detail: boolean;
  hasAlphaT2Detail: boolean;
}) {
  if (selected.kind === "effect") {
    const r = selected.row;
    const color = TYPE_COLORS[r.module.type];
    return (
      <div className="px-4 pt-4 pb-2">
        <p className="text-base font-semibold text-foreground leading-relaxed">{r.text}</p>

        <div className="mt-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {locale === "ko" ? "출처" : "Source"}
          </div>
          <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
            <Image
              src={`/images/game-items/${r.module.id}.png`}
              alt=""
              width={36}
              height={36}
              className="size-9 object-contain shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                {locale === "ko" ? r.module.nameI18n.ko : r.module.nameI18n.en}
                {r.count > 1 && (
                  <span
                    className="text-[10px] font-bold px-1 rounded-sm tabular-nums"
                    style={{ backgroundColor: `${color}30`, color }}
                  >
                    ×{r.count}
                  </span>
                )}
                <span
                  className="text-[10px] font-bold px-1 rounded-sm"
                  style={{ backgroundColor: `${color}25`, color }}
                >
                  {typeLabel(r.module.type, locale)}
                </span>
              </div>
              {r.skillId && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {locale === "ko" ? "+ 스킬 강화: " : "+ Skill buff: "}
                  <span className="font-semibold">{skillLabel(r.skillId, locale)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selected.kind === "skill") {
    return (
      <div className="px-4 pt-4 pb-2">
        <p className="text-base font-semibold text-foreground leading-relaxed">{selected.text}</p>

        <div className="mt-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {locale === "ko" ? "출처" : "Source"}
          </div>
          <div className="px-3 py-2 rounded-md bg-surface/60 text-sm font-semibold text-foreground">
            {skillLabel(selected.skill, locale)}
          </div>
        </div>
      </div>
    );
  }

  if (selected.kind === "movespeed") {
    // movespeed/movespeed2 chip 합계 → CHIPBOOSTS lookup. 기여 모듈 나열.
    const contributors: { module: CircuitModule; count: number; chips: number }[] = [];
    for (const [id, count] of Object.entries(effectiveCounts)) {
      if (!count) continue;
      const m = WX78_CIRCUITS_BY_ID[id];
      if (!m) continue;
      for (const s of m.stats ?? []) {
        if (s.kind === "moveSpeed") contributors.push({ module: m, count, chips: s.value * count });
      }
    }
    const totalPct = Math.round(selected.pct * 100);
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-bold text-foreground">{locale === "ko" ? "이동 속도" : "Move Speed"}</h3>
          <span className="text-base font-bold tabular-nums text-foreground">+{totalPct}%</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {locale === "ko"
            ? `회로 chip 합계: ${selected.chips}개 → 보너스 ${totalPct}% (lookup table: 0개=0% / 1개=25% / 2개=40% / 3개+=50%)`
            : `Total chips: ${selected.chips} → +${totalPct}% (lookup: 0=0%, 1=25%, 2=40%, 3+=50%)`}
        </div>
        <div className="mt-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {locale === "ko" ? "기여 모듈" : "Contributing modules"}
          </div>
          <ul className="space-y-1.5">
            {contributors.map((c) => (
              <BreakdownRow
                key={c.module.id}
                iconSrc={`/images/game-items/${c.module.id}.png`}
                name={locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                count={c.count}
                type={c.module.type}
                rightValue={`+${c.chips} chip`}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (selected.kind === "armor") {
    // 모듈별 armor pct 기여를 buff stats에서 수집
    const contributors: { module: CircuitModule; count: number; pct: number }[] = [];
    for (const [id, count] of Object.entries(effectiveCounts)) {
      if (!count) continue;
      const m = WX78_CIRCUITS_BY_ID[id];
      if (!m) continue;
      for (const buff of m.buffs ?? []) {
        if (buff.skill !== selected.skillId) continue;
        for (const s of buff.stats ?? []) {
          if (s.kind === "armorPct") {
            contributors.push({ module: m, count, pct: s.value * 100 * count });
          }
        }
      }
    }
    const formatPct = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1).replace(/\.0$/, "");
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-bold text-foreground">{locale === "ko" ? "방어력" : "Armor"}</h3>
          <span className="text-base font-bold tabular-nums text-foreground">+{formatPct(selected.total)}%</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {locale === "ko" ? "스킬: " : "Skill: "}
          <span className="font-semibold">{skillLabel(selected.skillId, locale)}</span>
        </div>
        <div className="mt-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {locale === "ko" ? "기여 모듈" : "Contributing modules"}
          </div>
          <ul className="space-y-1.5">
            {contributors.map((c) => (
              <BreakdownRow
                key={c.module.id}
                iconSrc={`/images/game-items/${c.module.id}.png`}
                name={locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                count={c.count}
                type={c.module.type}
                rightValue={`+${formatPct(c.pct)}%`}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (selected.kind === "slow") {
    const totalPct = Math.round(selected.pct * 100);
    const contributors: { module: CircuitModule; count: number; chips: number }[] = [];
    for (const [id, count] of Object.entries(effectiveCounts)) {
      if (!count) continue;
      const m = WX78_CIRCUITS_BY_ID[id];
      if (!m) continue;
      for (const s of m.stats ?? []) {
        if (s.kind === "moveSpeed") contributors.push({ module: m, count, chips: s.value * count });
      }
    }
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-bold text-foreground">{locale === "ko" ? "둔화 저항" : "Slow Resist"}</h3>
          <span className="text-base font-bold tabular-nums text-foreground">−{totalPct}%</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {locale === "ko"
            ? `이속 회로 ${selected.chips}개 × 25% = ${totalPct}% 둔화 회복 (4개 이상이면 100% 무효). 베타 회로 제조 II 학습 필요.`
            : `${selected.chips} movespeed chip(s) × 25% = ${totalPct}% slow recovered (cap 100% at 4+). Requires Beta Tinkering II.`}
        </div>
        <div className="mt-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {locale === "ko" ? "기여 모듈" : "Contributing modules"}
          </div>
          <ul className="space-y-1.5">
            {contributors.map((c) => (
              <BreakdownRow
                key={c.module.id}
                iconSrc={`/images/game-items/${c.module.id}.png`}
                name={locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                count={c.count}
                type={c.module.type}
                rightValue={`+${c.chips} chip`}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (selected.kind === "neg_aura" || selected.kind === "dapper" || selected.kind === "hunger_drain") {
    const isNegAura = selected.kind === "neg_aura";
    const isDapper = selected.kind === "dapper";
    const isHunger = selected.kind === "hunger_drain";
    const totalPct = Math.round(selected.pct * 100);
    const title =
      isNegAura ? (locale === "ko" ? "정신력 감소 오라 영향" : "Negative Sanity Aura")
      : isDapper ? (locale === "ko" ? "의복에 의한 정신력 회복" : "Sanity from Clothing")
      : (locale === "ko" ? "허기 소모 감소" : "Hunger Drain Reduction");
    const sign = isDapper ? "+" : "−";
    const stackingNote =
      isNegAura ? (locale === "ko" ? "곱연산(modules multiplied)" : "Multiplicative product")
      : isDapper ? (locale === "ko" ? "합연산(additive)" : "Additive sum")
      : (locale === "ko" ? "곱연산(modules multiplied)" : "Multiplicative product");

    // Contributing modules
    const contributors: { module: CircuitModule; count: number; perModulePct: number }[] = [];
    for (const [id, count] of Object.entries(effectiveCounts)) {
      if (!count) continue;
      const m = WX78_CIRCUITS_BY_ID[id];
      if (!m) continue;
      if (isNegAura) {
        const v = SANITY_NEG_AURA_MULT[id];
        if (v != null) contributors.push({ module: m, count, perModulePct: Math.round((1 - v) * 100) });
      } else if (isDapper) {
        const v = SANITY_DAPPER_MULT[id];
        if (v != null) contributors.push({ module: m, count, perModulePct: Math.round(v * 100) });
      } else {
        if (id !== "wx78module_maxhunger" && id !== "wx78module_maxhunger1") continue;
        const mod = hungerModuleMult(id, hasAlphaT1Detail, hasAlphaT2Detail);
        if (mod < 1) contributors.push({ module: m, count, perModulePct: Math.round((1 - mod) * 100) });
      }
    }

    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <span className="text-base font-bold tabular-nums text-foreground">{sign}{totalPct}%</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground space-y-0.5">
          {selected.skillId && (
            <div>
              {locale === "ko" ? "스킬: " : "Skill: "}
              <span className="font-semibold">{skillLabel(selected.skillId, locale)}</span>
            </div>
          )}
          <div>
            {locale === "ko" ? "스택 방식: " : "Stacking: "}
            <span>{stackingNote}</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {locale === "ko" ? "기여 모듈" : "Contributing modules"}
          </div>
          <ul className="space-y-1.5">
            {contributors.map((c) => (
              <BreakdownRow
                key={c.module.id}
                iconSrc={`/images/game-items/${c.module.id}.png`}
                name={locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                count={c.count}
                type={c.module.type}
                rightValue={`${sign}${c.perModulePct}% ${locale === "ko" ? "/모듈" : "/each"}`}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Vital stat detail — show all circuits contributing to this max stat
  const statKind = selected.statKind;
  const baseValue =
    statKind === "maxHealth" ? WX78_BASE_VITAL.health :
    statKind === "maxHunger" ? WX78_BASE_VITAL.hunger : WX78_BASE_VITAL.sanity;
  const contributors: { module: CircuitModule; count: number; value: number }[] = [];
  for (const [id, count] of Object.entries(effectiveCounts)) {
    if (!count) continue;
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m) continue;
    for (const s of m.stats ?? []) {
      if (s.kind === statKind) {
        contributors.push({ module: m, count, value: s.value * count });
      }
    }
  }
  const label =
    statKind === "maxHealth" ? (locale === "ko" ? "최대 체력" : "Max Health") :
    statKind === "maxHunger" ? (locale === "ko" ? "최대 허기" : "Max Hunger") :
    (locale === "ko" ? "최대 정신력" : "Max Sanity");
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-bold text-foreground">{label}</h3>
        <span className="text-base font-bold tabular-nums text-foreground">{selected.total}</span>
      </div>
      <div className="mt-4">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {locale === "ko" ? "구성" : "Breakdown"}
        </div>
        <ul className="space-y-1.5">
          <BreakdownRow
            iconSrc="/images/category-icons/characters/wx78.png"
            iconRounded
            name={locale === "ko" ? "WX-78 기본" : "WX-78 base"}
            rightValue={baseValue}
          />
          {contributors.map((c) => (
            <BreakdownRow
              key={c.module.id}
              iconSrc={`/images/game-items/${c.module.id}.png`}
              name={locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
              count={c.count}
              type={c.module.type}
              rightValue={`+${c.value}`}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
