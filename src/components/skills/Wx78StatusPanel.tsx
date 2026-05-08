"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Shield, Zap, Snowflake } from "lucide-react";
import {
  WX78_CIRCUITS,
  WX78_CIRCUITS_BY_ID,
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
const KO_SOCKET_RE = /^소켓 \d+개 필요\.\s*/;
const EN_SOCKET_RE = /^Requires \d+ sockets? and\s*/i;

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
          const body = locale === "ko"
            ? para.replace(/^.+?의 효과로\s*/, "")
            : para.replace(EN_SKILL_RE, "").replace(/^\s+/, "");
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

const VITAL_LABEL_KO: Record<VitalKind, string> = {
  maxHealth: "체력",
  maxSanity: "정신력",
  maxHunger: "허기",
};

const VITAL_LABEL_EN: Record<VitalKind, string> = {
  maxHealth: "Health",
  maxSanity: "Sanity",
  maxHunger: "Hunger",
};

function vitalText(kind: VitalKind, total: number, locale: Locale): string {
  if (locale === "ko") {
    const label = VITAL_LABEL_KO[kind];
    const particle = label === "허기" ? "가" : "이";
    return `최대 ${label}${particle} ${total} 증가한다.`;
  }
  return `Maximum ${VITAL_LABEL_EN[kind]} +${total}.`;
}

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

// baseRows에서 vital 부분 추출 → 합산 카드용 데이터 + vital이 분리된 나머지 row.
function aggregateVitalRows(
  rows: EffectRow[],
  locale: Locale,
): { vitals: { kind: VitalKind; total: number }[]; remaining: EffectRow[] } {
  if (locale !== "ko") return { vitals: [], remaining: rows };
  const sums: Record<VitalKind, number> = { maxHealth: 0, maxSanity: 0, maxHunger: 0 };
  const remaining: EffectRow[] = [];
  for (const row of rows) {
    if (row.skillId) { remaining.push(row); continue; }
    const ex = extractVitalKo(row.text);
    if (!ex) { remaining.push(row); continue; }
    sums[ex.kind] += ex.perModule * row.count;
    if (ex.rest) remaining.push({ ...row, text: ex.rest });
    // standalone 행은 drop (vital만 있던 행 → 합산 카드로 대체)
  }
  const vitals: { kind: VitalKind; total: number }[] = [];
  for (const k of ["maxHealth", "maxSanity", "maxHunger"] as VitalKind[]) {
    if (sums[k] > 0) vitals.push({ kind: k, total: sums[k] });
  }
  return { vitals, remaining };
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
  | { kind: "slow"; chips: number; pct: number };

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
  // 1차 패스: vital 합산 (체/허/정)
  const { vitals: vitalCards, remaining: afterVital } = useMemo(
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
  const effectRows = useMemo(
    () => afterArmor.filter((r) => !isSlowBuffRow(r)),
    [afterArmor],
  );
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
              iconNode={<Shield className="size-full" />}
              label={locale === "ko" ? "방어력" : "Armor"}
              value={armorBuff?.total ?? 0}
              display={armorBuff ? `+${Number.isInteger(armorBuff.total) ? armorBuff.total : armorBuff.total.toFixed(1).replace(/\.0$/, "")}%` : "—"}
              onClick={armorBuff ? () => setSelected({ kind: "armor", skillId: armorBuff.skillId, total: armorBuff.total }) : undefined}
            />
            <VitalStat
              iconNode={<Zap className="size-full" />}
              label={locale === "ko" ? "이동 속도" : "Move Speed"}
              value={moveSpeedAggregated}
              display={moveSpeedAggregated > 0 ? `+${Math.round(moveSpeedAggregated * 100)}%` : "—"}
              divider
              onClick={moveSpeedAggregated > 0 ? () => setSelected({ kind: "movespeed", chips: moveSpeedChips, pct: moveSpeedAggregated }) : undefined}
            />
            <VitalStat
              iconNode={<Snowflake className="size-full" />}
              label={locale === "ko" ? "둔화 저항" : "Slow Resist"}
              value={slowResistPct}
              display={slowResistPct > 0 ? `−${Math.round(slowResistPct * 100)}%` : "—"}
              divider
              onClick={slowResistPct > 0 ? () => setSelected({ kind: "slow", chips: moveSpeedChips, pct: slowResistPct }) : undefined}
            />
          </div>
        )}

        {(vitalCards.length > 0 || effectRows.length > 0 || skillRows.length > 0) && (
          <div className="mt-3 space-y-1.5">
            {vitalCards.map((v) => {
              const statKind = v.kind;
              const total =
                statKind === "maxHealth" ? vitals.health :
                statKind === "maxHunger" ? vitals.hunger : vitals.sanity;
              return (
                <EffectCard
                  key={`vital-${statKind}`}
                  text={vitalText(statKind, v.total, locale)}
                  locale={locale}
                  onClick={() => setSelected({ kind: "vital", statKind, total })}
                />
              );
            })}
            {effectRows.filter((r) => !r.skillId).map((r) => (
              <EffectCard
                key={r.key}
                text={r.text}
                locale={locale}
                onClick={() => setSelected({ kind: "effect", row: r })}
              />
            ))}
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
          <Detail selected={selected} locale={locale} effectiveCounts={effectiveCounts} />
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
function Detail({
  selected,
  locale,
  effectiveCounts,
}: {
  selected: SelectedDetail;
  locale: Locale;
  effectiveCounts: CircuitCounts;
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
            {contributors.map((c) => {
              const color = TYPE_COLORS[c.module.type];
              return (
                <li key={c.module.id} className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
                  <Image src={`/images/game-items/${c.module.id}.png`} alt="" width={28} height={28} className="size-7 object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                      {locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                      {c.count > 1 && (
                        <span className="text-[10px] font-bold px-1 rounded-sm tabular-nums" style={{ backgroundColor: `${color}30`, color }}>
                          ×{c.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {locale === "ko" ? `+${c.chips} chip` : `+${c.chips} chip`}
                  </span>
                </li>
              );
            })}
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
            {contributors.map((c) => {
              const color = TYPE_COLORS[c.module.type];
              return (
                <li key={c.module.id} className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
                  <Image src={`/images/game-items/${c.module.id}.png`} alt="" width={28} height={28} className="size-7 object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                      {locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                      {c.count > 1 && (
                        <span className="text-[10px] font-bold px-1 rounded-sm tabular-nums" style={{ backgroundColor: `${color}30`, color }}>
                          ×{c.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    +{formatPct(c.pct)}%
                  </span>
                </li>
              );
            })}
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
            {contributors.map((c) => {
              const color = TYPE_COLORS[c.module.type];
              return (
                <li key={c.module.id} className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
                  <Image src={`/images/game-items/${c.module.id}.png`} alt="" width={28} height={28} className="size-7 object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                      {locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                      {c.count > 1 && (
                        <span className="text-[10px] font-bold px-1 rounded-sm tabular-nums" style={{ backgroundColor: `${color}30`, color }}>
                          ×{c.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {locale === "ko" ? `+${c.chips} chip` : `+${c.chips} chip`}
                  </span>
                </li>
              );
            })}
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
          <li className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
            <Image
              src="/images/category-icons/characters/wx78.png"
              alt=""
              width={28}
              height={28}
              className="size-7 object-contain shrink-0 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {locale === "ko" ? "WX-78 기본" : "WX-78 base"}
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {baseValue}
            </span>
          </li>
          {contributors.map((c) => {
            const color = TYPE_COLORS[c.module.type];
            return (
              <li key={c.module.id} className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
                <Image
                  src={`/images/game-items/${c.module.id}.png`}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                    {locale === "ko" ? c.module.nameI18n.ko : c.module.nameI18n.en}
                    {c.count > 1 && (
                      <span
                        className="text-[10px] font-bold px-1 rounded-sm tabular-nums"
                        style={{ backgroundColor: `${color}30`, color }}
                      >
                        ×{c.count}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  +{c.value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
