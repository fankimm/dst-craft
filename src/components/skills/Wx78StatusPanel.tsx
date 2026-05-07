"use client";

import { useMemo } from "react";
import {
  WX78_CIRCUITS_BY_ID,
  WX78_TUNING,
  type StatKind,
  type Capability,
} from "@/data/wx78-circuits";
import type { Locale } from "@/lib/i18n";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";

interface Props {
  locale: Locale;
  activatedSkills: Set<string>;
  counts: CircuitCounts;
}

type StatTotals = Partial<Record<StatKind, number>>;

interface StatusData {
  totals: StatTotals;
  caps: Capability[];
  // moveSpeed accumulated chip count → index into CHIPBOOSTS
  moveSpeedChips: number;
  // hungerSlowMult: take the LOWEST (most aggressive) value applied
  hungerSlowMin?: number;
}

function aggregate(activatedSkills: ReadonlySet<string>, counts: CircuitCounts): StatusData {
  const totals: StatTotals = {};
  const caps: Capability[] = [];
  const seenCaps = new Set<string>();
  let moveSpeedChips = 0;
  let hungerSlowMin: number | undefined;

  const addStat = (kind: StatKind, value: number) => {
    totals[kind] = (totals[kind] ?? 0) + value;
  };
  const addCap = (c: Capability) => {
    if (seenCaps.has(c.id)) return;
    seenCaps.add(c.id);
    caps.push(c);
  };

  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m) continue;

    for (const eff of m.stats ?? []) {
      if (eff.kind === "moveSpeed") {
        moveSpeedChips += count;
      } else if (eff.kind === "hungerSlowMult") {
        // multiplicative slowdown — keep the smallest (strongest)
        const v = eff.value;
        hungerSlowMin = hungerSlowMin === undefined ? v : Math.min(hungerSlowMin, v);
      } else {
        addStat(eff.kind, eff.value * count);
      }
    }
    for (const cap of m.caps ?? []) addCap(cap);

    // Apply buffs if their skill is learned
    for (const buff of m.buffs ?? []) {
      if (!activatedSkills.has(buff.skill)) continue;
      for (const eff of buff.stats ?? []) {
        if (eff.kind === "hungerSlowMult") {
          hungerSlowMin = hungerSlowMin === undefined ? eff.value : Math.min(hungerSlowMin, eff.value);
        } else {
          addStat(eff.kind, eff.value * count);
        }
      }
      for (const cap of buff.caps ?? []) addCap(cap);
    }
  }

  return { totals, caps, moveSpeedChips, hungerSlowMin };
}

// ── Skill-only global effects (don't depend on circuits being equipped) ──
function getGlobalSkillCaps(activatedSkills: Set<string>): Capability[] {
  const out: Capability[] = [];
  if (activatedSkills.has("wx78_circuitry_betterunplug")) {
    out.push({
      id: "betterunplug",
      ko: "회로 분리 시 충전 소모 −50% (덜 닳음)",
      en: "Module unplug consumes −50% charge (lasts longer)",
    });
  }
  if (activatedSkills.has("wx78_circuitry_bettercharge")) {
    out.push({
      id: "bettercharge",
      ko: `회로 충전 속도 ${WX78_TUNING.FASTER_CHARGE_MULTIPLIER}배`,
      en: `Module recharge ${WX78_TUNING.FASTER_CHARGE_MULTIPLIER}× faster`,
    });
  }
  if (activatedSkills.has("wx78_circuitry_slot_1")) {
    out.push({
      id: "extra_slot",
      ko: "회로 슬롯 +1 (총 7)",
      en: "+1 circuit slot (total 7)",
    });
  }
  return out;
}

// ── Helpers ──────────────────────────────────────────────────
function formatNumber(n: number, decimals = 0): string {
  if (decimals === 0) return n.toFixed(0);
  return n.toFixed(decimals);
}

// ── Component ────────────────────────────────────────────────
export function Wx78StatusPanel({ locale, activatedSkills, counts }: Props) {
  const data = useMemo(
    () => aggregate(activatedSkills, counts),
    [activatedSkills, counts],
  );
  const skillCaps = useMemo(
    () => getGlobalSkillCaps(activatedSkills),
    [activatedSkills],
  );

  const equippedTotal = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  if (equippedTotal === 0 && skillCaps.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {locale === "ko"
            ? "회로를 장착하거나 회로 관련 스킬을 학습하면 여기에 통합 현황이 표시됩니다."
            : "Equip circuits or learn circuit-related skills to see the combined status here."}
        </p>
      </div>
    );
  }

  // Group rows
  const survivalRows = buildSurvivalRows(data, locale);
  const movementRows = buildMovementRows(data, locale);
  const tempRows = buildTempRows(data, locale);
  const utilityRows = buildUtilityRows(data, locale);
  const combatRows = buildCombatRows(data, locale);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
      <div className="max-w-2xl mx-auto w-full pb-4 px-3">
        <Section title={locale === "ko" ? "기본 능력치" : "Stats"} rows={survivalRows} />
        <Section title={locale === "ko" ? "이동" : "Movement"} rows={movementRows} />
        <Section title={locale === "ko" ? "온도 · 저항" : "Temperature · Resistance"} rows={tempRows} />
        <Section title={locale === "ko" ? "유틸리티" : "Utility"} rows={utilityRows} />
        <Section title={locale === "ko" ? "전투" : "Combat"} rows={combatRows} />

        {(data.caps.length > 0 || skillCaps.length > 0) && (
          <div className="mt-4">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {locale === "ko" ? "특수 효과" : "Special Effects"}
            </div>
            <ul className="space-y-1.5">
              {[...skillCaps, ...data.caps].map((cap) => (
                <li
                  key={cap.id}
                  className="text-sm text-foreground/90 px-3 py-2 rounded-md bg-surface/60"
                >
                  • {locale === "ko" ? cap.ko : cap.en}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface Row {
  label: string;
  value: string;
  hint?: string;
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4 first:mt-3">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
        {title}
      </div>
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between px-3 py-2 border-b border-border last:border-b-0"
          >
            <div className="text-sm text-foreground">
              {r.label}
              {r.hint && (
                <span className="ml-1.5 text-[11px] text-muted-foreground">{r.hint}</span>
              )}
            </div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Row builders ───────────────────────────────────────────────
function buildSurvivalRows(data: StatusData, locale: Locale): Row[] {
  const rows: Row[] = [];
  const t = data.totals;
  if (t.maxHealth) {
    rows.push({
      label: locale === "ko" ? "최대 체력" : "Max Health",
      value: `+${formatNumber(t.maxHealth)}`,
    });
  }
  if (t.maxSanity) {
    rows.push({
      label: locale === "ko" ? "최대 정신력" : "Max Sanity",
      value: `+${formatNumber(t.maxSanity)}`,
    });
  }
  if (t.maxHunger) {
    rows.push({
      label: locale === "ko" ? "최대 허기" : "Max Hunger",
      value: `+${formatNumber(t.maxHunger)}`,
    });
  }
  if (data.hungerSlowMin !== undefined) {
    const reduction = (1 - data.hungerSlowMin) * 100;
    rows.push({
      label: locale === "ko" ? "허기 소모율" : "Hunger Drain",
      value: `−${formatNumber(reduction, 0)}%`,
      hint: locale === "ko" ? "(낮을수록 좋음)" : "(lower is better)",
    });
  }
  if (t.dapperness) {
    const perSec = t.dapperness;
    rows.push({
      label: locale === "ko" ? "정신력 회복" : "Sanity Regen",
      value: `+${formatNumber(perSec * 60, 1)}/min`,
    });
  }
  if (t.regenPerTick) {
    const perMin = (t.regenPerTick * 60) / WX78_TUNING.BEE_TICKPERIOD_SEC;
    rows.push({
      label: locale === "ko" ? "체력 자가회복 (피해 시)" : "HP Regen (when hurt)",
      value: `+${formatNumber(perMin, 1)}/min`,
      hint: locale === "ko" ? `(${formatNumber(t.regenPerTick)} HP / 30초)` : `(${formatNumber(t.regenPerTick)} HP / 30s)`,
    });
  }
  return rows;
}

function buildMovementRows(data: StatusData, locale: Locale): Row[] {
  const rows: Row[] = [];
  if (data.moveSpeedChips > 0) {
    const idx = Math.min(data.moveSpeedChips, WX78_TUNING.MOVESPEED_CHIPBOOSTS.length - 1);
    const pct = WX78_TUNING.MOVESPEED_CHIPBOOSTS[idx] * 100;
    rows.push({
      label: locale === "ko" ? "이동 속도" : "Move Speed",
      value: `+${formatNumber(pct)}%`,
      hint: locale === "ko"
        ? `(가속 회로 ${data.moveSpeedChips}개${idx < data.moveSpeedChips ? ", 3개 이상은 효과 없음" : ""})`
        : `(${data.moveSpeedChips} circuits${idx < data.moveSpeedChips ? ", 3+ no extra" : ""})`,
    });
  }
  return rows;
}

function buildTempRows(data: StatusData, locale: Locale): Row[] {
  const rows: Row[] = [];
  const t = data.totals;
  if (t.minTempUp) {
    rows.push({
      label: locale === "ko" ? "추위 저항 (min temp ↑)" : "Cold Resist (min temp ↑)",
      value: `+${formatNumber(t.minTempUp)}°C`,
    });
  }
  if (t.maxTempDown) {
    rows.push({
      label: locale === "ko" ? "더위 저항 (max temp ↓)" : "Heat Resist (max temp ↓)",
      value: `−${formatNumber(t.maxTempDown)}°C`,
    });
  }
  if (t.dryRate) {
    rows.push({
      label: locale === "ko" ? "건조 속도" : "Dry Rate",
      value: `+${formatNumber(t.dryRate, 2)}/s`,
    });
  }
  if (t.freezeResistMult) {
    rows.push({
      label: locale === "ko" ? "얼리기 저항" : "Freeze Resistance",
      value: `×${formatNumber(t.freezeResistMult, 0)}`,
      hint: locale === "ko" ? "(베타 버프 1)" : "(Beta Buff 1)",
    });
  }
  if (t.fireDmgScaleMult) {
    const sign = t.fireDmgScaleMult < 0 ? "−" : "+";
    rows.push({
      label: locale === "ko" ? "화염 데미지" : "Fire Damage",
      value: `${sign}${formatNumber(Math.abs(t.fireDmgScaleMult * 100))}%`,
      hint: locale === "ko" ? "(베타 버프 1)" : "(Beta Buff 1)",
    });
  }
  return rows;
}

function buildUtilityRows(data: StatusData, locale: Locale): Row[] {
  const rows: Row[] = [];
  const t = data.totals;
  if (t.lightRadius) {
    rows.push({
      label: locale === "ko" ? "빛 반경" : "Light Radius",
      value: `+${formatNumber(t.lightRadius, 2)}m`,
    });
  }
  if (t.viewDistance) {
    rows.push({
      label: locale === "ko" ? "시야 거리" : "View Distance",
      value: `+${formatNumber(t.viewDistance)}`,
    });
  }
  if (t.tendRange) {
    rows.push({
      label: locale === "ko" ? "농작물 돌봄 범위" : "Farm Tend Range",
      value: `${formatNumber(t.tendRange)}m`,
    });
  }
  if (t.sanityAuraPerSec) {
    rows.push({
      label: locale === "ko" ? "정신력 오라" : "Sanity Aura",
      value: `+${formatNumber(t.sanityAuraPerSec * 60, 1)}/min`,
    });
  }
  if (t.follower) {
    rows.push({
      label: locale === "ko" ? "최대 추종자" : "Max Followers",
      value: `+${formatNumber(t.follower)}`,
    });
  }
  if (t.extraInventorySlot) {
    rows.push({
      label: locale === "ko" ? "확장 인벤토리" : "Extra Inventory",
      value: `+${formatNumber(t.extraInventorySlot)} slot`,
    });
  }
  return rows;
}

function buildCombatRows(data: StatusData, locale: Locale): Row[] {
  const rows: Row[] = [];
  const t = data.totals;
  if (t.armorPct) {
    rows.push({
      label: locale === "ko" ? "데미지 감소" : "Damage Reduction",
      value: `${formatNumber(t.armorPct * 100, 1)}%`,
      hint: locale === "ko" ? "(알파 버프 2)" : "(Alpha Buff 2)",
    });
  }
  if (t.shieldPctOfHP) {
    rows.push({
      label: locale === "ko" ? "보호막 (최대체력 %)" : "Shield (% of Max HP)",
      value: `${formatNumber(t.shieldPctOfHP * 100, 0)}%`,
      hint: locale === "ko" ? "(알파 버프 2)" : "(Alpha Buff 2)",
    });
  }
  if (t.shieldRegenPerSec) {
    rows.push({
      label: locale === "ko" ? "보호막 재생" : "Shield Regen",
      value: `${formatNumber(t.shieldRegenPerSec, 2)}/s`,
    });
  }
  return rows;
}
