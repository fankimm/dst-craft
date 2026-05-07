"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Plus, Minus, RotateCcw } from "lucide-react";
import {
  WX78_CIRCUITS,
  WX78_CIRCUITS_BY_ID,
  getMaxSlots,
  getUsedSlots,
  type CircuitModule,
  type CircuitType,
} from "@/data/wx78-circuits";
import type { Locale } from "@/lib/i18n";
import type { CircuitCounts } from "@/hooks/use-wx78-circuits";
import { cn } from "@/lib/utils";

interface Props {
  locale: Locale;
  activatedSkills: Set<string>;
  counts: CircuitCounts;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  onReset: () => void;
}

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
  const usedSlots = getUsedSlots(counts);
  const equippedTotal = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  const grouped = useMemo(() => {
    const out: Record<CircuitType, CircuitModule[]> = { alpha: [], beta: [], gamma: [] };
    for (const c of WX78_CIRCUITS) out[c.type].push(c);
    return out;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Slot bar header */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-background/80">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {locale === "ko" ? "회로 슬롯" : "Circuit Slots"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{usedSlots}</span>
              <span className="opacity-60"> / {maxSlots}</span>
            </span>
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
        </div>
        <SlotBar maxSlots={maxSlots} counts={counts} />
        {!activatedSkills.has("wx78_circuitry_slot_1") && (
          <p className="mt-2 text-[11px] text-muted-foreground/80">
            {locale === "ko"
              ? "「추가 회로 슬롯」 스킬 학습 시 +1 슬롯 (최대 7)"
              : "Learn 'Extra Circuit Slot' skill for +1 slot (max 7)"}
          </p>
        )}
      </div>

      {/* Catalog */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="max-w-2xl mx-auto w-full pb-4">
          {(["alpha", "beta", "gamma"] as CircuitType[]).map((type) => (
            <div key={type} className="mt-3 first:mt-2">
              <div
                className="mx-3 rounded-lg border-2 overflow-hidden"
                style={{ borderColor: `${TYPE_COLORS[type]}40` }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[type] }}
                  />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {locale === "ko" ? TYPE_LABEL[type].ko : TYPE_LABEL[type].en}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    ({grouped[type].length})
                  </span>
                </div>
                <div className="px-1.5 py-1.5 space-y-1.5">
                  {grouped[type].map((m) => {
                    const count = counts[m.id] ?? 0;
                    const remaining = maxSlots - usedSlots;
                    const canAdd = m.slots <= remaining;
                    return (
                      <CircuitCard
                        key={m.id}
                        module={m}
                        locale={locale}
                        count={count}
                        canAdd={canAdd}
                        onEquip={() => onEquip(m.id)}
                        onUnequip={() => onUnequip(m.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slot bar ───────────────────────────────────────────────────
function SlotBar({ maxSlots, counts }: { maxSlots: number; counts: CircuitCounts }) {
  // Build per-cell coloring: color = type color of the circuit occupying that cell
  const cells: Array<{ color: string; first: boolean; last: boolean } | null> = Array(maxSlots).fill(null);
  let cursor = 0;
  for (const [id, n] of Object.entries(counts)) {
    const m = WX78_CIRCUITS_BY_ID[id];
    if (!m) continue;
    for (let i = 0; i < n; i++) {
      const span = m.slots;
      for (let j = 0; j < span; j++) {
        if (cursor + j >= maxSlots) break;
        cells[cursor + j] = {
          color: TYPE_COLORS[m.type],
          first: j === 0,
          last: j === span - 1,
        };
      }
      cursor += span;
      if (cursor >= maxSlots) break;
    }
    if (cursor >= maxSlots) break;
  }

  return (
    <div className="flex items-center gap-1">
      {cells.map((cell, i) => (
        <div
          key={i}
          className={cn(
            "h-6 flex-1 rounded-sm border transition-colors",
            cell ? "border-transparent" : "border-border/60 bg-surface/40",
          )}
          style={cell ? { backgroundColor: cell.color, opacity: 0.85 } : undefined}
        />
      ))}
    </div>
  );
}

// ── Module card ────────────────────────────────────────────────
function CircuitCard({
  module: m,
  locale,
  count,
  canAdd,
  onEquip,
  onUnequip,
}: {
  module: CircuitModule;
  locale: Locale;
  count: number;
  canAdd: boolean;
  onEquip: () => void;
  onUnequip: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
        count > 0
          ? "bg-surface ring-1 ring-foreground/10"
          : "hover:bg-surface/50",
      )}
    >
      <div
        className="relative shrink-0 size-10 rounded-md overflow-hidden"
        style={{ backgroundColor: `${TYPE_COLORS[m.type]}20` }}
      >
        <Image
          src={`/images/game-items/${m.id}.png`}
          alt=""
          width={40}
          height={40}
          className="size-10 object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground truncate">
            {moduleName(m, locale)}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-px rounded-sm"
            style={{
              backgroundColor: `${TYPE_COLORS[m.type]}30`,
              color: TYPE_COLORS[m.type],
            }}
          >
            {locale === "ko" ? `슬롯 ${m.slots}` : `${m.slots} slot${m.slots > 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground line-clamp-1">
          {moduleDesc(m, locale)}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {count > 0 && (
          <>
            <button
              onClick={onUnequip}
              className="size-7 flex items-center justify-center rounded-md bg-surface hover:bg-surface/70 text-foreground transition-colors"
              aria-label="unequip"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-5 text-center text-sm font-bold text-foreground">
              {count}
            </span>
          </>
        )}
        <button
          onClick={onEquip}
          disabled={!canAdd}
          className={cn(
            "size-7 flex items-center justify-center rounded-md transition-colors",
            canAdd
              ? "bg-primary/15 hover:bg-primary/25 text-foreground"
              : "bg-surface/40 text-muted-foreground/50 cursor-not-allowed",
          )}
          aria-label="equip"
          title={
            !canAdd
              ? locale === "ko"
                ? "슬롯 부족"
                : "Not enough slots"
              : undefined
          }
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
