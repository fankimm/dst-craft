"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  WX78_CIRCUITS,
  WX78_CIRCUITS_BY_ID,
  WX78_TUNING,
  type StatKind,
  type Capability,
  type CircuitType,
  type CircuitModule,
} from "@/data/wx78-circuits";
import type { Locale } from "@/lib/i18n";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";
import { Footer } from "../crafting/Footer";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<CircuitType, string> = {
  alpha: "#ef4444",
  beta: "#3b82f6",
  gamma: "#eab308",
};

interface Props {
  locale: Locale;
  activatedSkills: Set<string>;
  counts: CircuitCounts;
}

// ── Contributors ──────────────────────────────────────────────
// Each row tracks the circuits/skills that produced its value.
type Contributor =
  | { type: "circuit"; moduleId: string; count: number; valueStr?: string }
  | { type: "buff"; moduleId: string; count: number; skill: string; valueStr?: string }
  | { type: "skill"; skill: string; valueStr?: string };

interface AggRow {
  kind: string;          // e.g. "maxHealth", "moveSpeed", or capability id
  category: "vital" | "movement" | "temp" | "utility" | "combat" | "special" | "skill";
  label: { ko: string; en: string };
  value: string;
  hint?: { ko: string; en: string };
  contributors: Contributor[];
}

// ── Aggregator ────────────────────────────────────────────────
function buildRows(
  activatedSkills: Set<string>,
  counts: CircuitCounts,
  locale: Locale,
): AggRow[] {
  const rows: AggRow[] = [];

  // Bucket per stat kind
  const stats: Partial<Record<StatKind, { total: number; contribs: Contributor[] }>> = {};
  // Move speed: count chips
  let moveSpeedChips = 0;
  const moveSpeedContribs: Contributor[] = [];
  // Hunger slow: track minimum mult
  let hungerSlowMin: number | undefined;
  const hungerSlowContribs: Contributor[] = [];
  // Capabilities
  const caps: { cap: Capability; contribs: Contributor[] }[] = [];
  const capsByIdIdx = new Map<string, number>();
  const addCap = (cap: Capability, contrib: Contributor) => {
    let idx = capsByIdIdx.get(cap.id);
    if (idx === undefined) {
      idx = caps.length;
      capsByIdIdx.set(cap.id, idx);
      caps.push({ cap, contribs: [] });
    }
    caps[idx].contribs.push(contrib);
  };
  const addStat = (kind: StatKind, value: number, contrib: Contributor) => {
    if (!stats[kind]) stats[kind] = { total: 0, contribs: [] };
    stats[kind].total += value;
    stats[kind].contribs.push(contrib);
  };

  // Walk equipped circuits
  for (const [id, count] of Object.entries(counts)) {
    if (!count) continue;
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m) continue;

    for (const eff of m.stats ?? []) {
      if (eff.kind === "moveSpeed") {
        moveSpeedChips += count;
        moveSpeedContribs.push({ type: "circuit", moduleId: id, count });
      } else if (eff.kind === "hungerSlowMult") {
        hungerSlowContribs.push({
          type: "circuit",
          moduleId: id,
          count,
          valueStr: `×${eff.value.toFixed(2)}`,
        });
        if (hungerSlowMin === undefined || eff.value < hungerSlowMin) hungerSlowMin = eff.value;
      } else {
        addStat(eff.kind, eff.value * count, {
          type: "circuit",
          moduleId: id,
          count,
          valueStr: formatStatValue(eff.kind, eff.value * count, locale),
        });
      }
    }
    for (const cap of m.caps ?? []) addCap(cap, { type: "circuit", moduleId: id, count });

    for (const buff of m.buffs ?? []) {
      if (!activatedSkills.has(buff.skill)) continue;
      for (const eff of buff.stats ?? []) {
        if (eff.kind === "hungerSlowMult") {
          hungerSlowContribs.push({
            type: "buff",
            moduleId: id,
            count,
            skill: buff.skill,
            valueStr: `×${eff.value.toFixed(2)}`,
          });
          if (hungerSlowMin === undefined || eff.value < hungerSlowMin) hungerSlowMin = eff.value;
        } else {
          addStat(eff.kind, eff.value * count, {
            type: "buff",
            moduleId: id,
            count,
            skill: buff.skill,
            valueStr: formatStatValue(eff.kind, eff.value * count, locale),
          });
        }
      }
      for (const cap of buff.caps ?? []) addCap(cap, { type: "buff", moduleId: id, count, skill: buff.skill });
    }
  }

  // Emit stat rows
  const stat = (kind: StatKind, label: { ko: string; en: string }, formatter: (v: number) => string, hint?: { ko: string; en: string }, category: AggRow["category"] = "vital") => {
    const b = stats[kind];
    if (!b || b.total === 0) return;
    rows.push({
      kind,
      category,
      label,
      value: formatter(b.total),
      hint,
      contributors: b.contribs,
    });
  };

  // Vital
  stat("maxHealth", { ko: "최대 체력 증가", en: "Max HP +" }, (v) => formatNum(v));
  stat("maxSanity", { ko: "최대 정신력 증가", en: "Max Sanity +" }, (v) => formatNum(v));
  stat("maxHunger", { ko: "최대 허기 증가", en: "Max Hunger +" }, (v) => formatNum(v));
  stat("dapperness", { ko: "정신력 회복", en: "Sanity Regen" }, (v) => `+${(v * 60).toFixed(1)}/min`);
  stat("regenPerTick", { ko: "체력 자가회복 (피해 시)", en: "HP Regen (when hurt)" }, (v) => `+${formatNum(v)} HP / 30s`);

  // Hunger slow
  if (hungerSlowMin !== undefined) {
    rows.push({
      kind: "hungerSlowMult",
      category: "vital",
      label: { ko: "허기 줄어드는 속도", en: "Hunger Drain" },
      value: `−${((1 - hungerSlowMin) * 100).toFixed(0)}%`,
      hint: { ko: "(낮을수록 좋음)", en: "(lower is better)" },
      contributors: hungerSlowContribs,
    });
  }

  // Movement
  if (moveSpeedChips > 0) {
    const idx = Math.min(moveSpeedChips, WX78_TUNING.MOVESPEED_CHIPBOOSTS.length - 1);
    rows.push({
      kind: "moveSpeed",
      category: "movement",
      label: { ko: "이동 속도", en: "Move Speed" },
      value: `+${(WX78_TUNING.MOVESPEED_CHIPBOOSTS[idx] * 100).toFixed(0)}%`,
      hint: idx < moveSpeedChips
        ? { ko: `(가속 회로 ${moveSpeedChips}개, 3개 이상은 효과 없음)`, en: `(${moveSpeedChips} circuits, 3+ caps)` }
        : { ko: `(가속 회로 ${moveSpeedChips}개)`, en: `(${moveSpeedChips} circuits)` },
      contributors: moveSpeedContribs,
    });
  }

  // Temp / Resistance
  stat("minTempUp", { ko: "추위 저항 (최저 체온 +)", en: "Cold Resist (min temp ↑)" }, (v) => `+${formatNum(v)}°C`, undefined, "temp");
  stat("maxTempDown", { ko: "더위 저항 (최고 체온 −)", en: "Heat Resist (max temp ↓)" }, (v) => `−${formatNum(v)}°C`, undefined, "temp");
  stat("dryRate", { ko: "건조 속도", en: "Dry Rate" }, (v) => `+${v.toFixed(2)}/s`, undefined, "temp");
  stat("freezeResistMult", { ko: "얼리기 저항", en: "Freeze Resistance" }, (v) => `×${formatNum(v)}`, { ko: "(베타 버프 1)", en: "(Beta Buff 1)" }, "temp");
  stat("fireDmgScaleMult", { ko: "화염 데미지", en: "Fire Damage" }, (v) => `${v < 0 ? "−" : "+"}${Math.abs(v * 100).toFixed(0)}%`, { ko: "(베타 버프 1)", en: "(Beta Buff 1)" }, "temp");

  // Utility
  stat("lightRadius", { ko: "빛 반경", en: "Light Radius" }, (v) => `+${v.toFixed(2)}m`, undefined, "utility");
  stat("viewDistance", { ko: "시야 거리", en: "View Distance" }, (v) => `+${formatNum(v)}`, undefined, "utility");
  stat("tendRange", { ko: "농작물 돌봄 범위", en: "Farm Tend Range" }, (v) => `${formatNum(v)}m`, undefined, "utility");
  stat("sanityAuraPerSec", { ko: "정신력 오라", en: "Sanity Aura" }, (v) => `+${(v * 60).toFixed(1)}/min`, undefined, "utility");
  stat("follower", { ko: "최대 추종자", en: "Max Followers" }, (v) => `+${formatNum(v)}`, undefined, "utility");
  stat("extraInventorySlot", { ko: "확장 인벤토리", en: "Extra Inventory" }, (v) => `+${formatNum(v)} slot`, undefined, "utility");

  // Combat
  stat("armorPct", { ko: "데미지 감소", en: "Damage Reduction" }, (v) => `${(v * 100).toFixed(1)}%`, { ko: "(알파 버프 2)", en: "(Alpha Buff 2)" }, "combat");
  stat("shieldPctOfHP", { ko: "보호막 (최대체력 %)", en: "Shield (% of Max HP)" }, (v) => `${(v * 100).toFixed(0)}%`, { ko: "(알파 버프 2)", en: "(Alpha Buff 2)" }, "combat");
  stat("shieldRegenPerSec", { ko: "보호막 재생", en: "Shield Regen" }, (v) => `${v.toFixed(2)}/s`, undefined, "combat");

  // Capabilities
  for (const { cap, contribs } of caps) {
    rows.push({
      kind: `cap:${cap.id}`,
      category: "special",
      label: { ko: cap.ko, en: cap.en },
      value: "✓",
      contributors: contribs,
    });
  }

  // Global circuit skills
  const globalSkills: { skill: string; ko: string; en: string }[] = [
    { skill: "wx78_circuitry_betterunplug", ko: "회로 분리 시 충전 −50% 소모", en: "Module unplug −50% charge" },
    { skill: "wx78_circuitry_bettercharge", ko: `회로 충전 속도 ×${WX78_TUNING.FASTER_CHARGE_MULTIPLIER}`, en: `Module recharge ×${WX78_TUNING.FASTER_CHARGE_MULTIPLIER}` },
    { skill: "wx78_circuitry_slot_1", ko: "각 회로 바 슬롯 +1 (총 7)", en: "+1 slot per circuit bar (total 7)" },
  ];
  for (const g of globalSkills) {
    if (!activatedSkills.has(g.skill)) continue;
    rows.push({
      kind: `skill:${g.skill}`,
      category: "skill",
      label: { ko: g.ko, en: g.en },
      value: "✓",
      contributors: [{ type: "skill", skill: g.skill }],
    });
  }

  return rows;
}

function formatNum(n: number): string {
  return Math.abs(n - Math.round(n)) < 0.01 ? n.toFixed(0) : n.toFixed(1);
}

function formatStatValue(kind: StatKind, value: number, locale: Locale): string {
  const ko = locale === "ko";
  switch (kind) {
    case "maxHealth": return ko ? `+${formatNum(value)} 체력` : `+${formatNum(value)} HP`;
    case "maxSanity": return ko ? `+${formatNum(value)} 정신력` : `+${formatNum(value)} sanity`;
    case "maxHunger": return ko ? `+${formatNum(value)} 허기` : `+${formatNum(value)} hunger`;
    case "minTempUp": return `+${formatNum(value)}°C`;
    case "maxTempDown": return `−${formatNum(value)}°C`;
    case "dryRate": return `+${value.toFixed(2)}/s`;
    case "lightRadius": return `+${value.toFixed(2)}m`;
    case "viewDistance": return `+${formatNum(value)}`;
    case "tendRange": return `${formatNum(value)}m`;
    case "sanityAuraPerSec": return `+${(value * 60).toFixed(1)}/min`;
    case "dapperness": return `+${(value * 60).toFixed(1)}/min`;
    case "regenPerTick": return ko ? `+${formatNum(value)} HP / 30초` : `+${formatNum(value)} HP / 30s`;
    case "armorPct": return `${(value * 100).toFixed(1)}%`;
    case "shieldPctOfHP": return `${(value * 100).toFixed(0)}%`;
    case "shieldRegenPerSec": return `${value.toFixed(2)}/s`;
    case "freezeResistMult": return `×${formatNum(value)}`;
    case "fireDmgScaleMult": return `${value < 0 ? "−" : "+"}${Math.abs(value * 100).toFixed(0)}%`;
    case "follower": return `+${formatNum(value)}`;
    case "extraInventorySlot": return ko ? `+${formatNum(value)} 슬롯` : `+${formatNum(value)} slot`;
    case "moveSpeed": return ko ? "1 chip" : "1 chip";
    default: return formatNum(value);
  }
}

// ── Skill labels (for buff source) ────────────────────────────
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

export function Wx78StatusPanel({ locale, activatedSkills, counts }: Props) {
  const [devShowAll, setDevShowAll] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDevShowAll(localStorage.getItem("dst:dev-show-all-circuit-effects") === "1");
  }, []);

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

  const rows = useMemo(
    () => buildRows(effectiveSkills, effectiveCounts, locale),
    [effectiveSkills, effectiveCounts, locale],
  );

  const equippedTotal = useMemo(
    () => Object.values(effectiveCounts).reduce((a, b) => a + b, 0),
    [effectiveCounts],
  );

  const [selectedRow, setSelectedRow] = useState<AggRow | null>(null);

  if (equippedTotal === 0 && rows.length === 0) {
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

  // Group rows into Vital StatBox + sectioned rows
  const totals = aggregateMaxStats(rows);
  const otherRows = rows.filter((r) => !["maxHealth", "maxSanity", "maxHunger"].includes(r.kind));
  const byCategory: Record<string, AggRow[]> = {};
  for (const r of otherRows) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  }

  const sectionTitles: Record<string, { ko: string; en: string }> = {
    vital: { ko: "기본 능력치", en: "Vital" },
    movement: { ko: "이동", en: "Movement" },
    temp: { ko: "온도 · 저항", en: "Temperature · Resistance" },
    utility: { ko: "유틸리티", en: "Utility" },
    combat: { ko: "전투", en: "Combat" },
    special: { ko: "특수 효과", en: "Special Effects" },
    skill: { ko: "회로 시스템 강화", en: "Circuitry Skills" },
  };

  // Find rows for max HP/Sanity/Hunger to enable click on StatBox
  const maxHealthRow = rows.find((r) => r.kind === "maxHealth");
  const maxSanityRow = rows.find((r) => r.kind === "maxSanity");
  const maxHungerRow = rows.find((r) => r.kind === "maxHunger");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
      <div className="max-w-2xl mx-auto w-full pb-2 px-3">
        {devShowAll && (
          <div className="mt-3 px-3 py-2 rounded-md bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-700 dark:text-amber-400">
            DEV: 모든 회로 +1 + 모든 회로 관련 스킬 학습 가정 — 데브 메뉴에서 OFF
          </div>
        )}
        {/* Vital stats */}
        {(totals.maxHealth || totals.maxSanity || totals.maxHunger) ? (
          <div className="mt-3 flex items-center justify-around rounded-lg border border-border bg-surface px-3 py-2.5">
            <VitalStat
              iconSrc={assetPath("/images/ui/health.png")}
              label={locale === "ko" ? "최대 체력" : "Max Health"}
              value={totals.maxHealth}
              onClick={maxHealthRow ? () => setSelectedRow(maxHealthRow) : undefined}
            />
            <VitalStat
              iconSrc={assetPath("/images/ui/hunger.png")}
              label={locale === "ko" ? "최대 허기" : "Max Hunger"}
              value={totals.maxHunger}
              divider
              onClick={maxHungerRow ? () => setSelectedRow(maxHungerRow) : undefined}
            />
            <VitalStat
              iconSrc={assetPath("/images/ui/sanity.png")}
              label={locale === "ko" ? "최대 정신력" : "Max Sanity"}
              value={totals.maxSanity}
              divider
              onClick={maxSanityRow ? () => setSelectedRow(maxSanityRow) : undefined}
            />
          </div>
        ) : null}

        {Object.entries(byCategory).map(([cat, catRows]) => (
          <RowSection
            key={cat}
            title={locale === "ko" ? sectionTitles[cat]?.ko ?? cat : sectionTitles[cat]?.en ?? cat}
            rows={catRows}
            locale={locale}
            onSelect={setSelectedRow}
          />
        ))}

        <div className="pt-6">
          <Footer />
        </div>
      </div>

      <DetailPanel open={!!selectedRow} onClose={() => setSelectedRow(null)}>
        {selectedRow && (
          <RowDetail row={selectedRow} locale={locale} />
        )}
      </DetailPanel>
    </div>
  );
}

function aggregateMaxStats(rows: AggRow[]): { maxHealth: number; maxSanity: number; maxHunger: number } {
  const find = (kind: string) => rows.find((r) => r.kind === kind);
  const sum = (r: AggRow | undefined) =>
    r ? r.contributors.reduce((acc, c) => acc + parseValueNum(c.valueStr ?? "0"), 0) : 0;
  return {
    maxHealth: sum(find("maxHealth")),
    maxSanity: sum(find("maxSanity")),
    maxHunger: sum(find("maxHunger")),
  };
}

function parseValueNum(s: string): number {
  const m = s.match(/[+-]?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

// ── Section ───────────────────────────────────────────────────
function RowSection({
  title,
  rows,
  locale,
  onSelect,
}: {
  title: string;
  rows: AggRow[];
  locale: Locale;
  onSelect: (r: AggRow) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4 first:mt-3">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
        {title}
      </div>
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {rows.map((r, i) => (
          <button
            key={i}
            onClick={() => onSelect(r)}
            className="w-full flex items-baseline justify-between px-3 py-2 border-b border-border last:border-b-0 hover:bg-surface/40 transition-colors text-left touch-manipulation"
          >
            <div className="text-sm text-foreground flex-1 min-w-0 pr-2">
              <span className="truncate">{locale === "ko" ? r.label.ko : r.label.en}</span>
              {r.hint && (
                <span className="ml-1.5 text-[11px] text-muted-foreground">
                  {locale === "ko" ? r.hint.ko : r.hint.en}
                </span>
              )}
            </div>
            <div className="text-sm font-semibold tabular-nums text-foreground shrink-0">
              {r.value}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Vital StatBox (clickable) ─────────────────────────────────
function VitalStat({
  iconSrc,
  label,
  value,
  divider,
  onClick,
}: {
  iconSrc: string;
  label: string;
  value: number;
  divider?: boolean;
  onClick?: () => void;
}) {
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
      <img src={iconSrc} alt="" className="size-5 object-contain" />
      <div className="text-left">
        <div className="text-sm font-semibold tabular-nums leading-tight text-foreground">
          {value > 0 ? value : "—"}
        </div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </button>
  );
}

// ── DetailPanel content for a row ─────────────────────────────
function RowDetail({ row, locale }: { row: AggRow; locale: Locale }) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-bold text-foreground flex-1 min-w-0">
          {locale === "ko" ? row.label.ko : row.label.en}
        </h3>
        <span className="text-base font-bold tabular-nums text-foreground shrink-0">{row.value}</span>
      </div>
      {row.hint && (
        <p className="mt-1 text-xs text-muted-foreground">
          {locale === "ko" ? row.hint.ko : row.hint.en}
        </p>
      )}

      <div className="mt-4">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {locale === "ko" ? "기여 회로 · 스킬" : "Contributors"}
        </div>
        <ul className="space-y-1.5">
          {row.contributors.map((c, i) => (
            <li key={i} className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface/60">
              {c.type === "circuit" || c.type === "buff" ? (
                <ContributorCircuitItem c={c} locale={locale} />
              ) : (
                <span className="text-sm text-foreground">{skillLabel(c.skill, locale)}</span>
              )}
              {c.valueStr && (
                <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-foreground">
                  {c.valueStr}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ContributorCircuitItem({
  c,
  locale,
}: {
  c: Extract<Contributor, { type: "circuit" | "buff" }>;
  locale: Locale;
}) {
  const m = WX78_CIRCUITS_BY_ID[c.moduleId] as CircuitModule | undefined;
  if (!m) return null;
  const color = TYPE_COLORS[m.type];
  return (
    <>
      <Image
        src={`/images/game-items/${c.moduleId}.png`}
        alt=""
        width={28}
        height={28}
        className="size-7 object-contain shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
          {locale === "ko" ? m.nameI18n.ko : m.nameI18n.en}
          {c.count > 1 && (
            <span
              className="text-[10px] font-bold px-1 rounded-sm tabular-nums"
              style={{ backgroundColor: `${color}30`, color }}
            >
              ×{c.count}
            </span>
          )}
        </div>
        {c.type === "buff" && (
          <div className="text-[11px] text-muted-foreground truncate">
            {locale === "ko" ? "+ 스킬 강화: " : "+ Skill buff: "}
            {skillLabel(c.skill, locale)}
          </div>
        )}
      </div>
    </>
  );
}
