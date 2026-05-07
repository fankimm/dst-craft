"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Minus, RotateCcw, ExternalLink } from "lucide-react";
import {
  WX78_CIRCUITS,
  WX78_CIRCUITS_BY_ID,
  getMaxSlots,
  getUsedSlotsByType,
  SCAN_PREFAB_KO,
  SCAN_PREFAB_EN,
  TYPE_COLORS,
  TYPE_LABEL,
  typeLabel,
  type CircuitModule,
  type CircuitType,
} from "@/data/wx78-circuits";
import { scrapbookStats } from "@/data/scrapbook-stats";
import type { Locale } from "@/lib/i18n";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { Footer } from "../crafting/Footer";
import { cn } from "@/lib/utils";

interface Props {
  locale: Locale;
  activatedSkills: Set<string>;
  counts: CircuitCounts;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  onReset: () => void;
  onViewItem?: (itemId: string) => void;
}

const TYPES: CircuitType[] = ["alpha", "beta", "gamma"];

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
  onViewItem,
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
        <div className="max-w-2xl mx-auto w-full pb-2 px-3 min-h-full flex flex-col">
          <div className="flex-1">
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
          <div className="mt-auto pt-6">
            <Footer />
          </div>
        </div>
      </div>

      {/* Detail panel (bottom sheet) */}
      <DetailPanel open={!!selected} onClose={() => setSelectedId(null)} hideClose>
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
            onViewItem={onViewItem ? () => { onViewItem(selected.id); setSelectedId(null); } : undefined}
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
      <div className="relative size-12 rounded-md flex items-center justify-center">
        <Image
          src={`/images/game-items/${m.id}.png`}
          alt=""
          width={48}
          height={48}
          className="size-12 object-contain"
        />
        {count > 0 && (
          <span
            className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold bg-surface-hover border border-ring text-foreground/80 z-10"
          >
            {count}
          </span>
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
  onViewItem,
}: {
  module: CircuitModule;
  locale: Locale;
  count: number;
  usedInBar: number;
  maxSlots: number;
  activatedSkills: Set<string>;
  onEquip: () => void;
  onUnequip: () => void;
  onViewItem?: () => void;
}) {
  const color = TYPE_COLORS[m.type];
  const canAdd = m.slots <= maxSlots - usedInBar;

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 size-16 rounded-lg flex items-center justify-center overflow-hidden">
          <Image
            src={`/images/game-items/${m.id}.png`}
            alt=""
            width={64}
            height={64}
            className="size-16 object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            <h3 className="text-base font-bold text-foreground flex-1 min-w-0">{moduleName(m, locale)}</h3>
            {onViewItem && (
              <button
                onClick={onViewItem}
                title={locale === "ko" ? "제작탭에서 자세히 보기" : "View in Crafting Tab"}
                className="shrink-0 size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <ExternalLink className="size-4" />
              </button>
            )}
          </div>
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

      {/* Effects (parsed from in-game scrapbook) */}
      <ScrapbookEffects moduleId={m.id} locale={locale} activatedSkills={activatedSkills} />

      {/* Scan source */}
      {m.scanFrom?.length ? (
        <div className="mt-3">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {locale === "ko" ? "스캔으로 획득" : "Scanned From"}
          </div>
          <div className="flex flex-wrap gap-1">
            {m.scanFrom.map((p) => {
              const label = locale === "ko"
                ? SCAN_PREFAB_KO[p] ?? p
                : SCAN_PREFAB_EN[p] ?? p;
              return (
                <span key={p} className="text-[11px] px-1.5 py-0.5 rounded bg-surface/70 text-muted-foreground">
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Equip controls — fixed-width −/[count]/+ stepper to prevent layout shift on rapid taps */}
      <div className="mt-4 sticky bottom-0 -mx-4 px-4 py-3 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground min-w-0 truncate">
            <span style={{ color }}>
              {locale === "ko" ? TYPE_LABEL[m.type].ko : TYPE_LABEL[m.type].en}
            </span>
            <span className="opacity-60"> {usedInBar}/{maxSlots}</span>
            {!canAdd && count === 0 && (
              <span className="ml-2 text-[11px] text-muted-foreground/80">
                {locale === "ko" ? "슬롯 부족" : "Not enough slots"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 rounded-md bg-surface/60 p-0.5">
            <button
              onClick={onUnequip}
              disabled={count === 0}
              className={cn(
                "size-9 flex items-center justify-center rounded-sm transition-colors",
                count === 0
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "hover:bg-surface text-foreground",
              )}
              aria-label="unequip"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-7 text-center text-sm font-bold tabular-nums">
              {count}
            </span>
            <button
              onClick={onEquip}
              disabled={!canAdd}
              className={cn(
                "size-9 flex items-center justify-center rounded-sm transition-colors",
                canAdd
                  ? "text-white"
                  : "text-muted-foreground/40 cursor-not-allowed",
              )}
              style={canAdd ? { backgroundColor: color } : undefined}
              aria-label="equip"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scrapbook effects ──────────────────────────────────────────
// Parses in-game scrapbook text and renders as structured rows:
// - Skips first paragraph (board compatibility + scan info — already shown)
// - Strips "소켓 N개 필요. " / "Requires N socket(s) and " prefix
// - Detects skill-conditional paragraphs and dims them when skill is unlearned
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

export function ScrapbookEffects({
  moduleId,
  locale,
  activatedSkills,
}: {
  moduleId: string;
  locale: Locale;
  activatedSkills: Set<string>;
}) {
  const sb = scrapbookStats[moduleId];
  const text = sb && (locale === "ko" ? sb.specialinfo_ko : sb.specialinfo_en);
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/).slice(1); // skip first (compatibility + scan)
  if (paragraphs.length === 0) return null;

  const stripSocket = (s: string) =>
    s.replace(locale === "ko" ? KO_SOCKET_RE : EN_SOCKET_RE, "");

  return (
    <div className="mt-3 space-y-1.5">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        {locale === "ko" ? "효과" : "Effects"}
      </div>
      {paragraphs.map((para, i) => {
        const skill = detectSkillId(para, locale);
        if (skill) {
          const learned = activatedSkills.has(skill.skillId);
          // Body = paragraph minus the leading "<skill name>의 효과로" / "<skill name> "
          const bodyKo = para.replace(/^.+?의 효과로\s*/, "");
          const bodyEn = para.replace(EN_SKILL_RE, "").replace(/^\s+/, "");
          const body = locale === "ko" ? bodyKo : bodyEn;
          return (
            <div
              key={i}
              className={cn(
                "text-sm px-3 py-2 rounded-md transition-opacity",
                learned ? "bg-surface/70 text-foreground/95" : "bg-surface/30 text-muted-foreground opacity-60",
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={cn(
                    "inline-block size-1.5 rounded-full",
                    learned ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
                <span className="text-[11px] font-semibold">{skill.label}</span>
                <span className="text-[10px] opacity-70">
                  {learned
                    ? locale === "ko" ? "학습됨" : "learned"
                    : locale === "ko" ? "미학습" : "not learned"}
                </span>
              </div>
              <p className="leading-relaxed">{body}</p>
            </div>
          );
        }

        // Default paragraph — strip socket prefix
        const cleaned = stripSocket(para).trim();
        if (!cleaned) return null;
        return (
          <p
            key={i}
            className="text-sm leading-relaxed px-3 py-2 rounded-md bg-surface/60 text-foreground/95"
          >
            {cleaned}
          </p>
        );
      })}
    </div>
  );
}
