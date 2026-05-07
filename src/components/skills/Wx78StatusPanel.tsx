"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
  | { kind: "vital"; statKind: "maxHealth" | "maxHunger" | "maxSanity"; total: number };

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
  const effectRows = useMemo(
    () => buildEffectRows(effectiveCounts, effectiveSkills, locale),
    [effectiveCounts, effectiveSkills, locale],
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

  // Split effect rows into base / skill-buffed for visual grouping
  const baseRows = effectRows.filter((r) => !r.skillId);
  const buffRows = effectRows.filter((r) => r.skillId);

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

        {baseRows.length > 0 && (
          <RowSection title={locale === "ko" ? "활성 효과" : "Active Effects"}>
            {baseRows.map((r) => (
              <EffectRowItem
                key={r.key}
                row={r}
                locale={locale}
                onClick={() => setSelected({ kind: "effect", row: r })}
              />
            ))}
          </RowSection>
        )}

        {buffRows.length > 0 && (
          <RowSection title={locale === "ko" ? "스킬 강화 효과" : "Skill-Buffed Effects"}>
            {buffRows.map((r) => (
              <EffectRowItem
                key={r.key}
                row={r}
                locale={locale}
                onClick={() => setSelected({ kind: "effect", row: r })}
              />
            ))}
          </RowSection>
        )}

        {skillRows.length > 0 && (
          <RowSection title={locale === "ko" ? "회로 시스템 강화" : "Circuitry Skills"}>
            {skillRows.map((s) => (
              <button
                key={s.skill}
                onClick={() => setSelected({ kind: "skill", skill: s.skill, text: s.text })}
                className="w-full flex items-baseline justify-between px-3 py-2 border-b border-border last:border-b-0 hover:bg-surface/40 transition-colors text-left touch-manipulation"
              >
                <span className="text-sm text-foreground/95 leading-relaxed">{s.text}</span>
              </button>
            ))}
          </RowSection>
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
function RowSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-3">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
        {title}
      </div>
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function EffectRowItem({
  row,
  locale,
  onClick,
}: {
  row: EffectRow;
  locale: Locale;
  onClick: () => void;
}) {
  const color = TYPE_COLORS[row.module.type];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 border-b border-border last:border-b-0 hover:bg-surface/40 transition-colors text-left touch-manipulation"
    >
      <Image
        src={`/images/game-items/${row.module.id}.png`}
        alt=""
        width={28}
        height={28}
        className="size-7 object-contain shrink-0"
      />
      <span className="flex-1 min-w-0 text-sm text-foreground/95 leading-relaxed">
        {row.text}
      </span>
      {row.count > 1 && (
        <span
          className="shrink-0 text-[10px] font-bold px-1.5 py-px rounded-sm tabular-nums"
          style={{ backgroundColor: `${color}30`, color }}
        >
          ×{row.count}
        </span>
      )}
    </button>
  );
}

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
