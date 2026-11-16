"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Skull, Trash2, TreePine, type LucideIcon } from "lucide-react";
import {
  HERMIT_DECOR,
  HERMIT_DECOR_CONSTANTS,
  HERMIT_DECOR_UNLOCKS,
  HERMIT_SHOP_LEVELS,
  HERMIT_TEA_USES,
  HERMIT_TEAS,
  HERMIT_TEASHOP_LEVELS,
  HERMIT_TRADES,
  type HermitDecorEntry,
  type HermitDecorKey,
  type HermitTrade,
} from "@/data/hermit-trades";
import { assetPath } from "@/lib/asset-path";
import { canonicalForItem } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { ValueBadge } from "@/components/farming/ValueBadge";
import { TagChip } from "@/components/ui/TagChip";
import { formatTeaBuff, HERMIT_DECOR_LABEL, ht, type HERMIT_TEXT } from "./hermit-text";

type Lang = "ko" | "en";
type View = "trades" | "teas" | "decor";

const VIEWS: { id: View; key: keyof typeof HERMIT_TEXT }[] = [
  { id: "trades", key: "viewTrades" },
  { id: "teas", key: "viewTeas" },
  { id: "decor", key: "viewDecor" },
];

const FALLBACK_ICON: Partial<Record<HermitDecorKey, LucideIcon>> = {
  watertree: TreePine,
  spawner: Skull,
  junk: Trash2,
};

function img(icon: string) {
  return assetPath(`/images/game-items/${icon}`);
}

function fmtPoints(n: number): string {
  const abs = Math.abs(n);
  const s = Number.isInteger(abs) ? String(abs) : abs === 1 / 3 ? "⅓" : String(Math.round(abs * 1000) / 1000);
  return (n < 0 ? "−" : "+") + s;
}

/** 아이콘 박스 — ItemSlot과 같은 40px 규격, 라벨은 오른쪽에 길게 쓰는 행 레이아웃용 */
function IconBox({ icon, fallback: Fallback, className }: { icon?: string; fallback?: LucideIcon; className?: string }) {
  return (
    <span className={cn("relative shrink-0 inline-flex items-center justify-center size-10 rounded border border-input bg-surface", className)}>
      {icon ? (
        <img src={img(icon)} alt="" className="size-8 object-contain" loading="lazy" />
      ) : Fallback ? (
        <Fallback className="size-5 text-muted-foreground" />
      ) : (
        <span className="text-[10px] text-muted-foreground">?</span>
      )}
    </span>
  );
}

/** 재료 수량 칩 — 빈 병 ×N 같은 "아이콘 + 수량". 메타 정보라 TagChip을 쓴다 */
function CostChip({ icon, label, title }: { icon: string; label: string; title?: string }) {
  return (
    <span title={title} className="inline-flex">
      <TagChip icon={`game-items/${icon}`} label={label} className="tabular-nums" />
    </span>
  );
}

// ---------------------------------------------------------------------------

export function HermitTrades({
  lang,
  onViewCraftingItem,
  routePrefix,
}: {
  lang: Lang;
  /** 앱 안: 제작 탭 상세로 점프 */
  onViewCraftingItem?: (itemId: string) => void;
  /** SEO 페이지: 아이템 정적 페이지 링크 접두사 ("" | "/ko") */
  routePrefix?: string;
}) {
  const groups: { title: string; trades: HermitTrade[] }[] = HERMIT_SHOP_LEVELS.map((lv) => ({
    title: `${ht("friendLevel", lang)} ${lv}`,
    trades: HERMIT_TRADES.filter((t) => t.unlock.kind === "level" && t.unlock.level === lv),
  }));
  groups.push({
    title: ht("unlockHouse3Winter", lang),
    trades: HERMIT_TRADES.filter((t) => t.unlock.kind === "house3_winter"),
  });

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-snug text-muted-foreground">{ht("tradesIntro", lang)}</p>
      {groups.map((g) => (
        <div key={g.title}>
          <h4 className="px-1 pb-1 text-[11px] font-semibold text-muted-foreground">{g.title}</h4>
          <ul className="divide-y divide-border/60 rounded-md border border-border/60">
            {g.trades.map((t) => {
              const name = lang === "ko" ? t.nameKo : t.nameEn;
              const slug = routePrefix !== undefined ? canonicalForItem(t.id) : undefined;
              return (
                <li key={t.id} className="flex items-center gap-3 px-2 py-1.5">
                  <IconBox icon={t.icon} />
                  <span className="flex-1 min-w-0 text-sm">
                    <span className="block truncate">{name}</span>
                    {t.gives && t.gives > 1 && (
                      <span className="block text-[10px] text-muted-foreground">
                        ×{t.gives} {ht("gives", lang)}
                      </span>
                    )}
                  </span>
                  <CostChip icon="messagebottleempty.png" label={`×${t.bottles}`} title={ht("bottles", lang)} />
                  {onViewCraftingItem && (
                    <button
                      onClick={() => onViewCraftingItem(t.id)}
                      aria-label={ht("seeInCrafting", lang)}
                      title={ht("seeInCrafting", lang)}
                      className="shrink-0 px-1 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </button>
                  )}
                  {slug && (
                    <a
                      href={`${routePrefix}/item/${slug}`}
                      aria-label={ht("seeInCrafting", lang)}
                      className="shrink-0 px-1 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="text-[11px] leading-snug text-muted-foreground">{ht("tradeNoteRelocation", lang)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function HermitTeas({ lang }: { lang: Lang }) {
  const levels = HERMIT_TEASHOP_LEVELS;
  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-snug text-muted-foreground">{ht("teasIntro", lang)}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-muted-foreground">
        <span>{ht("teaUses", lang, { n: HERMIT_TEA_USES })}</span>
        <span>·</span>
        <span>
          {ht("teaCommon", lang)} {levels.map((l) => l.common).join(" / ")} · {ht("teaRare", lang)} {levels.map((l) => l.rare).join(" / ")}
          {" "}({ht("teaLevelHeader", lang)} {levels.map((l) => (l.minScore ? `${l.minScore}+` : "0")).join(" / ")})
        </span>
        <ValueBadge label={ht("gameValue", lang)} />
      </div>
      <ul className="divide-y divide-border/60 rounded-md border border-border/60">
        {HERMIT_TEAS.map((tea) => {
          const counts = levels.map((l) => (tea.cost === "common" ? l.common : l.rare)).join(" / ");
          return (
            <li key={tea.id} className="flex items-start gap-3 px-2 py-2">
              <IconBox icon={tea.icon} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">{lang === "ko" ? tea.nameKo : tea.nameEn}</span>
                  <CostChip icon="messagebottleempty.png" label="×1" title={ht("bottles", lang)} />
                  <CostChip icon={`${tea.ingredient}.png`} label={counts} title={lang === "ko" ? tea.ingredientKo : tea.ingredientEn} />
                </div>
                <p className="mt-0.5 text-[11px] text-foreground/80 tabular-nums">
                  {ht("teaOnDrink", lang)}: {ht("sanity", lang)} {fmtPoints(tea.sanity)} · {ht("health", lang)} {fmtPoints(tea.health)}
                </p>
                {tea.buff && (
                  <p className="text-[11px] leading-snug text-muted-foreground">{formatTeaBuff(tea.buff, lang)}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------

function perLabel(per: NonNullable<HermitDecorEntry["parts"][number]["per"]>, lang: Lang): string {
  switch (per) {
    case "each": return ht("perEach", lang);
    case "tile": return ht("perTile", lang);
    case "slot": return ht("perSlot", lang);
    case "weight": return ht("perWeight", lang);
  }
}

export function HermitDecor({ lang }: { lang: Lang }) {
  const C = HERMIT_DECOR_CONSTANTS;
  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-snug text-muted-foreground">{ht("decorIntro", lang)}</p>

      <div>
        <h4 className="px-1 pb-1 text-[11px] font-semibold text-muted-foreground">{ht("decorUnlocksTitle", lang)}</h4>
        <ul className="divide-y divide-border/60 rounded-md border border-border/60">
          {HERMIT_DECOR_UNLOCKS.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-2 py-1.5">
              <IconBox icon={u.icon} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm truncate">{lang === "ko" ? u.nameKo : u.nameEn}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {"relockBelow" in u && u.relockBelow !== undefined && `${ht("decorRelock", lang, { n: u.relockBelow })} · `}
                  {u.requiresMaxLevel && ht("decorRequiresMax", lang)}
                </span>
              </span>
              <span className="shrink-0 text-xs font-mono tabular-nums text-foreground/90">{ht("decorUnlockAt", lang, { n: u.unlockAt })}</span>
            </li>
          ))}
        </ul>
        <p className="px-1 pt-1.5 text-[11px] leading-snug text-muted-foreground">{ht("decorHappyLine", lang)}</p>
        <p className="px-1 pt-1 text-[11px] leading-snug text-muted-foreground">{ht("decorHouse5Line", lang)}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 px-1 pb-1">
          <h4 className="text-[11px] font-semibold text-muted-foreground">{ht("decorTableTitle", lang)}</h4>
          <ValueBadge label={ht("gameValue", lang)} />
        </div>
        <ul className="divide-y divide-border/60 rounded-md border border-border/60">
          {HERMIT_DECOR.map((entry) => (
            <li key={entry.key} className="px-2 py-2">
              <div className="flex items-center gap-3">
                <IconBox icon={entry.icon} fallback={FALLBACK_ICON[entry.key]} />
                <span className="flex-1 min-w-0 text-sm font-medium truncate">{HERMIT_DECOR_LABEL[entry.key][lang]}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                  {ht("decorCap", lang)} {entry.cap !== undefined ? fmtPoints(entry.cap) : ht("decorNoCap", lang)}
                </span>
              </div>
              <ul className="mt-1 pl-[52px] space-y-0.5">
                {entry.parts.map((p, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-[11px]">
                    <span className="flex-1 min-w-0 text-foreground/80">{lang === "ko" ? p.labelKo : p.labelEn}</span>
                    <span className={cn("shrink-0 font-mono tabular-nums", p.points < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400")}>
                      {fmtPoints(p.points)}{p.per && ` / ${perLabel(p.per, lang)}`}
                    </span>
                  </li>
                ))}
                {entry.key === "tiles" && (
                  <li className="text-[10px] text-muted-foreground">{ht("decorTilesNote", lang)}</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
        <p className="px-1 pt-1.5 text-[11px] leading-snug text-muted-foreground">
          {ht("decorWinterBonus", lang)} ({C.maxScore} max · {ht("decorUnlockAt", lang, { n: C.happyScore })} 😊)
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** 퀘스트 탭용 접이식 섹션 — 은둔자 퀘스트 카드 바로 아래에 붙는다 */
export function HermitInfoSection({ lang, onViewCraftingItem }: { lang: Lang; onViewCraftingItem?: (itemId: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<View>("trades");

  return (
    <section className="rounded-lg border border-border bg-surface/40">
      <header className="flex items-center gap-3 px-3 py-2.5 bg-background/95 border-b border-border rounded-t-lg">
        <button onClick={() => setCollapsed((v) => !v)} className="flex items-center gap-3 flex-1 min-w-0 text-left" aria-expanded={!collapsed}>
          <img src={img("messagebottleempty.png")} alt="" className="size-9 object-contain shrink-0" loading="lazy" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{ht("sectionTitle", lang)}</h3>
            <p className="text-[10px] text-muted-foreground truncate">{ht("sectionSummary", lang)}</p>
          </div>
          {collapsed ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronUp className="size-4 text-muted-foreground" />}
        </button>
      </header>
      <div className={cn("grid transition-[grid-template-rows] duration-200 ease-out", collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]")}>
        <div className="overflow-hidden">
          <div className="flex gap-1.5 px-3 pt-3">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  view === v.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-surface",
                )}
                aria-pressed={view === v.id}
              >
                {ht(v.key, lang)}
              </button>
            ))}
          </div>
          <div className="px-3 py-3">
            {view === "trades" && <HermitTrades lang={lang} onViewCraftingItem={onViewCraftingItem} />}
            {view === "teas" && <HermitTeas lang={lang} />}
            {view === "decor" && <HermitDecor lang={lang} />}
          </div>
        </div>
      </div>
    </section>
  );
}
