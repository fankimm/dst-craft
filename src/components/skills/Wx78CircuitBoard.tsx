"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Minus, RotateCcw } from "lucide-react";
import {
  WX78_CIRCUITS,
  WX78_CIRCUITS_BY_ID,
  getMaxSlots,
  getUsedSlotsByType,
  type CircuitModule,
  type CircuitType,
} from "@/data/wx78-circuits";
import type { Locale } from "@/lib/i18n";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { cn } from "@/lib/utils";

interface Props {
  locale: Locale;
  activatedSkills: Set<string>;
  counts: CircuitCounts;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  onReset: () => void;
}

const TYPES: CircuitType[] = ["alpha", "beta", "gamma"];

const TYPE_COLORS: Record<CircuitType, string> = {
  alpha: "#eab308",
  beta: "#3b82f6",
  gamma: "#a855f7",
};

const TYPE_LABEL: Record<CircuitType, { ko: string; en: string }> = {
  alpha: { ko: "알파", en: "Alpha" },
  beta: { ko: "베타", en: "Beta" },
  gamma: { ko: "감마", en: "Gamma" },
};

function moduleName(m: CircuitModule, locale: Locale) {
  return locale === "ko" ? m.nameI18n.ko : m.nameI18n.en;
}

function moduleDesc(m: CircuitModule, locale: Locale) {
  return locale === "ko" ? m.desc.ko : m.desc.en;
}

export function Wx78CircuitBoard({
  locale,
  activatedSkills,
  counts,
  onEquip,
  onUnequip,
  onReset,
}: Props) {
  const maxSlots = getMaxSlots(activatedSkills);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const equippedTotal = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  const grouped = useMemo(() => {
    const out: Record<CircuitType, CircuitModule[]> = { alpha: [], beta: [], gamma: [] };
    for (const c of WX78_CIRCUITS) out[c.type].push(c);
    return out;
  }, []);

  const selected = selectedId ? WX78_CIRCUITS_BY_ID[selectedId] ?? null : null;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Slot bars header — 3 bars side-by-side */}
      <div className="shrink-0 px-3 py-2.5 border-b border-border bg-background/80">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {locale === "ko" ? "회로 슬롯" : "Circuit Slots"}
            <span className="ml-1.5 opacity-70 font-normal">
              ({locale === "ko" ? `각 ${maxSlots}칸` : `${maxSlots} per bar`})
            </span>
          </div>
          {equippedTotal > 0 && (
            <button
              onClick={onReset}
              title={locale === "ko" ? "초기화" : "Reset"}
              className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-surface transition-colors"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <SlotBar
              key={t}
              type={t}
              maxSlots={maxSlots}
              counts={counts}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* Grid catalog — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="max-w-3xl mx-auto w-full px-3 pb-6">
          {TYPES.map((type) => (
            <Section
              key={type}
              type={type}
              modules={grouped[type]}
              counts={counts}
              maxSlots={maxSlots}
              locale={locale}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </div>

      {/* Detail panel (bottom sheet) */}
      <DetailPanel open={!!selected} onClose={() => setSelectedId(null)}>
        {selected && (
          <CircuitDetail
            module={selected}
            locale={locale}
            count={counts[selected.id] ?? 0}
            usedInBar={getUsedSlotsByType(counts, selected.type)}
            maxSlots={maxSlots}
            activatedSkills={activatedSkills}
            onEquip={() => onEquip(selected.id)}
            onUnequip={() => onUnequip(selected.id)}
          />
        )}
      </DetailPanel>
    </div>
  );
}

// ── Slot bar (per type) ────────────────────────────────────────
function SlotBar({
  type,
  maxSlots,
  counts,
  locale,
}: {
  type: CircuitType;
  maxSlots: number;
  counts: CircuitCounts;
  locale: Locale;
}) {
  const used = getUsedSlotsByType(counts, type);
  const color = TYPE_COLORS[type];

  // Build segments: each filled segment = one module instance (knows its slot span)
  // so 2-slot module renders as ONE wider block (with internal divider) — distinct
  // from two 1-slot modules side by side
  type Segment = { kind: "filled"; span: number; key: string } | { kind: "empty"; span: 1; key: string };
  const segments: Segment[] = [];
  let used_ = 0;
  let segIdx = 0;
  for (const [id, n] of Object.entries(counts)) {
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m || m.type !== type) continue;
    for (let i = 0; i < n; i++) {
      if (used_ + m.slots > maxSlots) break;
      segments.push({ kind: "filled", span: m.slots, key: `f${segIdx++}` });
      used_ += m.slots;
    }
  }
  for (let i = used_; i < maxSlots; i++) {
    segments.push({ kind: "empty", span: 1, key: `e${i}` });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-bold" style={{ color }}>
            {locale === "ko" ? TYPE_LABEL[type].ko : TYPE_LABEL[type].en}
          </span>
        </div>
        <span className="tabular-nums text-muted-foreground">
          <span className="text-foreground font-bold">{used}</span>
          <span className="opacity-60"> / {maxSlots}</span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        {segments.map((seg) =>
          seg.kind === "empty" ? (
            <div
              key={seg.key}
              className="h-5 rounded-sm border border-border/60 bg-surface/40"
              style={{ flex: 1 }}
            />
          ) : (
            <div
              key={seg.key}
              className="h-5 rounded-sm flex items-stretch overflow-hidden ring-1 ring-black/10"
              style={{
                flex: seg.span,
                backgroundColor: color,
                opacity: 0.9,
              }}
              title={`${seg.span} ${locale === "ko" ? "칸 회로" : "slot module"}`}
            >
              {Array.from({ length: seg.span }).map((_, i) => (
                <div key={i} className="flex-1 flex items-center">
                  {i > 0 && <div className="w-px h-3 bg-black/35 -ml-px" />}
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ── Section per type ──────────────────────────────────────────
function Section({
  type,
  modules,
  counts,
  maxSlots,
  locale,
  onSelect,
}: {
  type: CircuitType;
  modules: CircuitModule[];
  counts: CircuitCounts;
  maxSlots: number;
  locale: Locale;
  onSelect: (id: string) => void;
}) {
  const usedInBar = getUsedSlotsByType(counts, type);
  const color = TYPE_COLORS[type];

  return (
    <div className="mt-4 first:mt-3">
      <div className="flex items-center gap-2 px-1 pb-1.5">
        <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {locale === "ko" ? TYPE_LABEL[type].ko : TYPE_LABEL[type].en}
        </span>
        <span className="text-xs text-muted-foreground/60">({modules.length})</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {modules.map((m) => {
          const count = counts[m.id] ?? 0;
          const canAdd = m.slots <= maxSlots - usedInBar;
          return (
            <CircuitTile
              key={m.id}
              module={m}
              locale={locale}
              count={count}
              canAdd={canAdd}
              onSelect={() => onSelect(m.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Tile (grid card) ──────────────────────────────────────────
function CircuitTile({
  module: m,
  locale,
  count,
  canAdd,
  onSelect,
}: {
  module: CircuitModule;
  locale: Locale;
  count: number;
  canAdd: boolean;
  onSelect: () => void;
}) {
  const color = TYPE_COLORS[m.type];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all touch-manipulation",
        count > 0
          ? "bg-surface"
          : "bg-background hover:bg-surface/50",
        !canAdd && count === 0 && "opacity-50",
      )}
      style={{ borderColor: count > 0 ? color : `${color}30` }}
    >
      <div
        className="relative size-12 rounded-md overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Image
          src={`/images/game-items/${m.id}.png`}
          alt=""
          width={48}
          height={48}
          className="size-12 object-contain"
        />
        {count > 0 && (
          <div
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            {count}
          </div>
        )}
      </div>
      <div className="w-full">
        <div className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight text-center">
          {moduleName(m, locale)}
        </div>
        <div className="mt-0.5 flex items-center justify-center">
          <span
            className="text-[9px] font-bold px-1.5 py-px rounded-sm tabular-nums"
            style={{ backgroundColor: `${color}25`, color }}
          >
            {locale === "ko" ? `슬롯 ${m.slots}` : `${m.slots} slot${m.slots > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Detail (DetailPanel content) ──────────────────────────────
function CircuitDetail({
  module: m,
  locale,
  count,
  usedInBar,
  maxSlots,
  activatedSkills,
  onEquip,
  onUnequip,
}: {
  module: CircuitModule;
  locale: Locale;
  count: number;
  usedInBar: number;
  maxSlots: number;
  activatedSkills: Set<string>;
  onEquip: () => void;
  onUnequip: () => void;
}) {
  const color = TYPE_COLORS[m.type];
  const canAdd = m.slots <= maxSlots - usedInBar;

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 size-16 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: `${color}20` }}
        >
          <Image
            src={`/images/game-items/${m.id}.png`}
            alt=""
            width={64}
            height={64}
            className="size-16 object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground">{moduleName(m, locale)}</h3>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-px rounded-sm"
              style={{ backgroundColor: `${color}25`, color }}
            >
              {locale === "ko" ? TYPE_LABEL[m.type].ko : TYPE_LABEL[m.type].en}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-px rounded-sm"
              style={{ backgroundColor: `${color}25`, color }}
            >
              {locale === "ko" ? `슬롯 ${m.slots}` : `${m.slots} slot${m.slots > 1 ? "s" : ""}`}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{moduleDesc(m, locale)}</p>
        </div>
      </div>

      {/* Effects */}
      {(m.stats?.length || m.caps?.length) ? (
        <div className="mt-3">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {locale === "ko" ? "효과" : "Effects"}
          </div>
          <ul className="space-y-1">
            {m.stats?.map((s, i) => (
              <li key={`s${i}`} className="text-sm text-foreground/90 px-2 py-1.5 rounded-md bg-surface/60">
                • {formatStat(s.kind, s.value, locale)}
              </li>
            ))}
            {m.caps?.map((c) => (
              <li key={c.id} className="text-sm text-foreground/90 px-2 py-1.5 rounded-md bg-surface/60">
                • {locale === "ko" ? c.ko : c.en}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Buffs (skill conditional) */}
      {m.buffs?.length ? (
        <div className="mt-3">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {locale === "ko" ? "스킬 강화" : "Skill Buffs"}
          </div>
          <ul className="space-y-1.5">
            {m.buffs.map((b) => {
              const active = activatedSkills.has(b.skill);
              return (
                <li
                  key={b.skill}
                  className={cn(
                    "text-xs px-2 py-1.5 rounded-md border",
                    active
                      ? "bg-foreground/5 border-foreground/30 text-foreground"
                      : "bg-surface/30 border-border text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={cn(
                        "inline-block size-1.5 rounded-full",
                        active ? "bg-emerald-500" : "bg-muted-foreground/40",
                      )}
                    />
                    <span className="font-semibold">
                      {skillLabel(b.skill, locale)}
                    </span>
                    <span className="opacity-60">
                      {active
                        ? locale === "ko"
                          ? "(학습됨)"
                          : "(learned)"
                        : locale === "ko"
                          ? "(미학습)"
                          : "(not learned)"}
                    </span>
                  </div>
                  <ul className="ml-3 space-y-0.5">
                    {b.stats?.map((s, i) => (
                      <li key={`bs${i}`}>· {formatStat(s.kind, s.value, locale)}</li>
                    ))}
                    {b.caps?.map((c) => (
                      <li key={c.id}>· {locale === "ko" ? c.ko : c.en}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Scan source */}
      {m.scanFrom?.length ? (
        <div className="mt-3">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {locale === "ko" ? "스캔 출처" : "Scanned From"}
          </div>
          <div className="flex flex-wrap gap-1">
            {m.scanFrom.map((p) => (
              <span key={p} className="text-[11px] px-1.5 py-0.5 rounded bg-surface/70 text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Equip controls */}
      <div className="mt-4 sticky bottom-0 -mx-4 px-4 py-3 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {locale === "ko" ? "현재" : "Current"}
            <span className="ml-1 font-bold text-foreground tabular-nums">{count}</span>
            <span className="mx-1 opacity-50">·</span>
            <span style={{ color }}>
              {locale === "ko" ? TYPE_LABEL[m.type].ko : TYPE_LABEL[m.type].en}
            </span>
            <span className="opacity-60"> {usedInBar}/{maxSlots}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onUnequip}
              disabled={count === 0}
              className={cn(
                "size-9 flex items-center justify-center rounded-md transition-colors",
                count === 0
                  ? "bg-surface/40 text-muted-foreground/40 cursor-not-allowed"
                  : "bg-surface hover:bg-surface/70 text-foreground",
              )}
              aria-label="unequip"
            >
              <Minus className="size-4" />
            </button>
            <button
              onClick={onEquip}
              disabled={!canAdd}
              className={cn(
                "h-9 px-4 flex items-center gap-1.5 rounded-md text-sm font-semibold transition-colors",
                canAdd
                  ? "text-white"
                  : "bg-surface/40 text-muted-foreground/50 cursor-not-allowed",
              )}
              style={canAdd ? { backgroundColor: color } : undefined}
            >
              <Plus className="size-4" />
              {locale === "ko"
                ? canAdd
                  ? "장착"
                  : "슬롯 부족"
                : canAdd
                  ? "Equip"
                  : "Not enough slots"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat formatters ────────────────────────────────────────────
function formatStat(kind: string, value: number, locale: Locale): string {
  const ko = locale === "ko";
  const v = (n: number, d = 0) => n.toFixed(d);
  switch (kind) {
    case "maxHealth": return ko ? `최대 체력 +${v(value)}` : `Max HP +${v(value)}`;
    case "maxSanity": return ko ? `최대 정신력 +${v(value)}` : `Max Sanity +${v(value)}`;
    case "maxHunger": return ko ? `최대 허기 +${v(value)}` : `Max Hunger +${v(value)}`;
    case "moveSpeed": return ko ? `이동속도 (누적, 최대 +50%)` : `Move speed (stacking, max +50%)`;
    case "lightRadius": return ko ? `빛 반경 +${v(value, 2)}m` : `Light radius +${v(value, 2)}m`;
    case "minTempUp": return ko ? `추위 저항 +${v(value)}°C` : `Cold resist +${v(value)}°C`;
    case "maxTempDown": return ko ? `더위 저항 +${v(value)}°C` : `Heat resist +${v(value)}°C`;
    case "dryRate": return ko ? `건조 속도 +${v(value, 2)}/s` : `Dry rate +${v(value, 2)}/s`;
    case "viewDistance": return ko ? `시야 거리 +${v(value)}` : `View distance +${v(value)}`;
    case "regenPerTick": return ko ? `30초마다 +${v(value)} HP (피해 시)` : `+${v(value)} HP / 30s (when hurt)`;
    case "sanityAuraPerSec": return ko ? `정신력 오라 +${v(value * 60, 1)}/min` : `Sanity aura +${v(value * 60, 1)}/min`;
    case "dapperness": return ko ? `정신력 회복 +${v(value * 60, 1)}/min` : `Sanity regen +${v(value * 60, 1)}/min`;
    case "tendRange": return ko ? `농작물 돌봄 범위 ${v(value)}m` : `Farm tend range ${v(value)}m`;
    case "armorPct": return ko ? `데미지 감소 ${v(value * 100, 1)}%` : `Damage reduction ${v(value * 100, 1)}%`;
    case "shieldPctOfHP": return ko ? `보호막 = 최대체력의 ${v(value * 100, 0)}%` : `Shield = ${v(value * 100, 0)}% of Max HP`;
    case "shieldRegenPerSec": return ko ? `보호막 재생 ${v(value, 2)}/s` : `Shield regen ${v(value, 2)}/s`;
    case "hungerSlowMult": return ko ? `허기 소모율 ×${v(value, 2)} (${v((1 - value) * 100)}% 감소)` : `Hunger drain ×${v(value, 2)} (${v((1 - value) * 100)}% slower)`;
    case "freezeResistMult": return ko ? `얼리기 저항 ×${v(value)}` : `Freeze resist ×${v(value)}`;
    case "fireDmgScaleMult": return ko ? `화염 데미지 ${value < 0 ? "−" : "+"}${v(Math.abs(value * 100))}%` : `Fire damage ${value < 0 ? "−" : "+"}${v(Math.abs(value * 100))}%`;
    case "follower": return ko ? `최대 추종자 +${v(value)}` : `Max followers +${v(value)}`;
    case "extraInventorySlot": return ko ? `확장 인벤토리 +${v(value)} 슬롯` : `Extra inventory +${v(value)} slot`;
    default: return `${kind}: ${v(value, 2)}`;
  }
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
    default: return skillId;
  }
}
