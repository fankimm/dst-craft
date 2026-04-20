"use client";

import type { ScrapbookStats } from "@/data/scrapbook-stats";
import { itemName } from "@/lib/i18n";
import { getItemById } from "@/lib/crafting-data";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

function resolveItemName(id: string, locale: string): string {
  const item = getItemById(id);
  if (item) return itemName(item, locale);
  return id.replace(/_/g, " ");
}

function formatDapperness(value: number, l: string): string {
  const perMin = Math.round(value * 60 * 100) / 100;
  const sign = perMin > 0 ? "+" : "";
  return `${sign}${perMin}${l === "ko" ? "/분" : "/min"}`;
}

function formatDuration(seconds: number, l: string): string {
  if (seconds < 60) return l === "ko" ? `${seconds}초` : `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins >= 60) {
    const days = (mins / (60 * 8)).toFixed(1);
    if (parseFloat(days) >= 1) return l === "ko" ? `${days}일` : `${days}d`;
    const hrs = (mins / 60).toFixed(1);
    return l === "ko" ? `${hrs}시간` : `${hrs}hr`;
  }
  return l === "ko" ? `${mins}분` : `${mins}min`;
}

function formatPerish(seconds: number, l: string): string {
  const days = (seconds / (60 * 8)).toFixed(1);
  return l === "ko" ? `${days}일` : `${days}d`;
}

interface ItemStatsPanelProps {
  itemId: string;
  stats: ScrapbookStats;
  locale: string;
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">
        {value}
        {sub && <span className="font-normal text-muted-foreground ml-1">{sub}</span>}
      </span>
    </div>
  );
}

export function ItemStatsPanel({ itemId, stats, locale }: ItemStatsPanelProps) {
  const l = locale === "ko" ? "ko" : "en";

  const rows: React.ReactNode[] = [];

  // --- Combat: damage + planar ---
  const dmg = stats.damage ?? stats.weapondamage;
  if (dmg != null) {
    const dmgStr = typeof dmg === "string" ? dmg : String(Math.floor(dmg));
    const planarSub = stats.planardamage ? `+${Math.floor(stats.planardamage)} ${l === "ko" ? "차원" : "planar"}` : undefined;
    rows.push(<StatRow key="dmg" label={l === "ko" ? "공격력" : "Damage"} value={dmgStr} sub={planarSub} />);
  }
  if (stats.weaponrange) {
    rows.push(<StatRow key="range" label={l === "ko" ? "사거리" : "Range"} value={`+${stats.weaponrange}`} />);
  }

  // --- Durability ---
  if (stats.finiteuses) {
    rows.push(<StatRow key="uses" label={l === "ko" ? "내구도" : "Durability"} value={`${Math.floor(stats.finiteuses)}${l === "ko" ? "회" : " uses"}`} />);
  }

  // --- Armor ---
  if (stats.armor) {
    const absorbSub = stats.absorb_percent ? `${l === "ko" ? "방어율" : "absorb"} ${Math.round(stats.absorb_percent * 100)}%` : undefined;
    rows.push(<StatRow key="armor" label={l === "ko" ? "방어력" : "Armor"} value={String(Math.floor(stats.armor))} sub={absorbSub} />);
  }
  if (stats.armor_planardefense) {
    rows.push(<StatRow key="planardef" label={l === "ko" ? "차원 방어" : "Planar DEF"} value={`+${stats.armor_planardefense}`} />);
  }

  // --- Repair ---
  if (stats.forgerepairable) {
    const repairItems = stats.forgerepairable.map((rid) => (
      <span key={rid} className="inline-flex items-center gap-1">
        <img src={assetPath(`/images/game-items/${rid}.png`)} alt="" className="size-3.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="font-medium text-foreground">{resolveItemName(rid, l)}</span>
      </span>
    ));
    rows.push(
      <div key="repair" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <span>{l === "ko" ? "수리:" : "Repair:"}</span>
        {repairItems}
      </div>
    );
  }
  if (stats.repairitems) {
    const repairItems = stats.repairitems.map((rid) => (
      <span key={rid} className="inline-flex items-center gap-1">
        <img src={assetPath(`/images/game-items/${rid}.png`)} alt="" className="size-3.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="font-medium text-foreground">{resolveItemName(rid, l)}</span>
      </span>
    ));
    rows.push(
      <div key="repairitems" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <span>{l === "ko" ? "보수:" : "Repairable:"}</span>
        {repairItems}
      </div>
    );
  }

  // --- Waterproof ---
  if (stats.waterproofer) {
    rows.push(<StatRow key="waterproof" label={l === "ko" ? "��수" : "Waterproof"} value={`${Math.round(stats.waterproofer * 100)}%`} />);
  }

  // --- Insulation ---
  if (stats.insulator) {
    const isSummer = stats.insulator_type === "summer";
    rows.push(<StatRow key="insul" label={l === "ko" ? (isSummer ? "내열" : "보온") : (isSummer ? "Cooling" : "Insulation")} value={String(stats.insulator)} />);
  }

  // --- Sanity (dapperness) ---
  if (stats.dapperness && stats.dapperness !== 0) {
    rows.push(<StatRow key="dapper" label={l === "ko" ? "정신력" : "Sanity"} value={formatDapperness(stats.dapperness, l)} />);
  }

  // --- Fuel duration ---
  if (stats.fueledmax != null && stats.fueledrate != null) {
    const rate = stats.fueledrate === 0 ? 1 : stats.fueledrate;
    const time = stats.fueledmax / rate;
    const timeStr = stats.fueleduses ? `${Math.floor(time)}${l === "ko" ? "회" : " uses"}` : formatDuration(time, l);
    rows.push(<StatRow key="fuel" label={l === "ko" ? "지속" : "Duration"} value={timeStr} />);
  }

  // --- Sewable ---
  if (stats.sewable) {
    rows.push(
      <div key="sewable" className="text-xs text-muted-foreground">{l === "ko" ? "바느질 수선 가능" : "Sewable"}</div>
    );
  }

  // --- Perishable ---
  if (stats.perishable) {
    rows.push(<StatRow key="perish" label={l === "ko" ? "부패" : "Perish"} value={formatPerish(stats.perishable, l)} />);
  }

  // --- Alignment ---
  if (stats.shadow_aligned || stats.lunar_aligned) {
    const badges: React.ReactNode[] = [];
    if (stats.shadow_aligned) {
      badges.push(
        <span key="shadow" className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400">
          {l === "ko" ? "그림자 진영" : "Shadow Aligned"}
        </span>
      );
    }
    if (stats.lunar_aligned) {
      badges.push(
        <span key="lunar" className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
          {l === "ko" ? "월광 진영" : "Lunar Aligned"}
        </span>
      );
    }
    rows.push(<div key="align" className="flex flex-wrap gap-1">{badges}</div>);
  }

  // --- Special info (the key feature: in-game descriptions) ---
  const specialText = l === "ko" ? stats.specialinfo_ko : stats.specialinfo_en;
  if (specialText) {
    rows.push(
      <div key="special" className="text-xs text-foreground leading-relaxed space-y-0.5 border-l-2 border-amber-300/50 dark:border-amber-700/50 pl-2">
        {specialText.split("\n").filter(Boolean).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {rows}
    </div>
  );
}
