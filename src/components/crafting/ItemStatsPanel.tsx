"use client";

import type { ScrapbookStats } from "@/data/scrapbook-stats";
import { itemName, materialName, lookupName } from "@/lib/i18n";
import { getItemById, getMaterialById } from "@/lib/crafting-data";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { characters } from "@/data/characters";
import { bookSanity, MAXWELL_READING_SANITY_MULT } from "@/data/book-sanity";
import { SANITYAURA_HUGE, SANITYAURA_MED, sanityAuraDesc } from "@/data/creature-names";

/** 정신력 오라 → 인게임 스크랩북 문구 (scrapbookscreen.lua 의 6단계 분기 그대로). 0이면 표시 없음 */
function sanityAuraLabel(aura: number, l: "ko" | "en"): string | null {
  const key =
    aura >= SANITYAURA_HUGE ? "POSHIGH"
    : aura >= SANITYAURA_MED ? "POSMED"
    : aura > 0 ? "POSSMALL"
    : aura === 0 ? null
    : aura > -SANITYAURA_MED ? "NEGSMALL"
    : aura > -SANITYAURA_HUGE ? "NEGMED"
    : "NEGHIGH";
  if (!key) return null;
  const [en, ko] = sanityAuraDesc[key];
  // 영문 원문은 전부 대문자 — 문장형으로 낮춘다
  return l === "ko" ? ko : en.charAt(0) + en.slice(1).toLowerCase();
}

function resolveItemName(id: string, locale: string): string {
  const item = getItemById(id);
  if (item) return itemName(item, locale);
  const mat = getMaterialById(id);
  if (mat) return materialName(mat, locale);
  return lookupName(id, locale);
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

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function BookSanityRow({ itemId, l }: { itemId: string; l: "ko" | "en" }) {
  const book = bookSanity[itemId];
  if (!book) return null;
  const readers = [
    { id: "wickerbottom", delta: book.read },
    { id: "maxwell", delta: book.read * MAXWELL_READING_SANITY_MULT },
    { id: "wurt", delta: book.peruse },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
      <span className="text-muted-foreground">{l === "ko" ? "읽을 때 정신력" : "Sanity on read"}</span>
      {readers.map(({ id, delta }) => {
        const character = characters.find((c) => c.id === id);
        if (!character) return null;
        return (
          <span key={id} className="inline-flex items-center gap-1">
            <img
              src={assetPath(`/images/category-icons/characters/${character.portrait}.webp`)}
              alt=""
              className="size-4 object-contain"
              loading="lazy"
            />
            <span className="text-muted-foreground">{l === "ko" ? character.nameKo : character.name}</span>
            <span className="font-semibold tabular-nums text-foreground">{formatSigned(delta)}</span>
          </span>
        );
      })}
    </div>
  );
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

// 무기 weapondamage_max(조건부 최대 피해)의 조건 설명.
// scrapbookdata.lua의 "X-Y" 표기 출처는 각 prefab의 scrapbook_weapondamage = {min, max} 테이블이며,
// 무기마다 조건이 다르다 (젖음/대상 종류/탄약/비행거리). game-data가 조건 자체를 안 들고 있어 코드 측에서 매핑.
const WEAPON_CONDITION_LABELS: Record<string, { ko: string; en: string }> = {
  spear_wathgrithr_lightning: { ko: "젖은 적에게", en: "vs wet target" },
  spear_wathgrithr_lightning_charged: { ko: "젖은 적에게", en: "vs wet target" },
  trident: { ko: "바다 생물에게", en: "vs ocean creature" },
  rabbitkingspear: { ko: "토끼인간에게", en: "vs Bunnyman" },
  slingshot: { ko: "최강 탄약", en: "strongest ammo" },
  voidcloth_boomerang: { ko: "최대 거리", en: "at max throw" },
};

export function ItemStatsPanel({ itemId, stats, locale }: ItemStatsPanelProps) {
  const l = locale === "ko" ? "ko" : "en";

  const rows: React.ReactNode[] = [];

  // --- Health (생물·구조물) — 인게임 순서상 맨 앞 ---
  if (stats.health != null) {
    const hp = typeof stats.health === "string" ? stats.health : String(Math.floor(stats.health));
    rows.push(<StatRow key="health" label={l === "ko" ? "체력" : "Health"} value={hp} />);
  }

  // --- Combat: damage + planar ---
  const dmg = stats.damage ?? stats.weapondamage;
  if (dmg != null) {
    const dmgStr = typeof dmg === "string" ? dmg : String(Math.floor(dmg));
    const planarSub = stats.planardamage ? `+${Math.floor(stats.planardamage)} ${l === "ko" ? "차원" : "planar"}` : undefined;
    rows.push(<StatRow key="dmg" label={l === "ko" ? "공격력" : "Damage"} value={dmgStr} sub={planarSub} />);
    // 조건부 최대 피해 (젖은 적/바다 생물/탄약 종류/비행 거리 등) — 별도 행으로 분리
    if (stats.weapondamage_max != null) {
      const cond = WEAPON_CONDITION_LABELS[itemId];
      const condText = cond ? cond[l] : (l === "ko" ? "최대" : "max");
      rows.push(<StatRow key="dmg-max" label={condText} value={String(Math.floor(stats.weapondamage_max))} />);
    }
  }
  // --- Sanity aura (근처에 있을 때) ---
  if (stats.sanityaura != null) {
    const auraText = sanityAuraLabel(stats.sanityaura, l);
    if (auraText) {
      rows.push(
        <StatRow
          key="aura"
          label={l === "ko" ? "정신력 오라" : "Sanity aura"}
          value={auraText}
        />,
      );
    }
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
        <img src={assetPath(`/images/game-items/${rid}.png`)} alt="" className="size-3.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} loading="lazy" />
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
        <img src={assetPath(`/images/game-items/${rid}.png`)} alt="" className="size-3.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} loading="lazy" />
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
    rows.push(<StatRow key="waterproof" label={l === "ko" ? "방수" : "Waterproof"} value={`${Math.round(stats.waterproofer * 100)}%`} />);
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
  if (bookSanity[itemId]) {
    rows.push(<BookSanityRow key="book-sanity" itemId={itemId} l={l} />);
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
        <span key="shadow" className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-500/20 text-zinc-600 dark:text-zinc-300">
          {l === "ko" ? "그림자 진영" : "Shadow Aligned"}
        </span>
      );
    }
    if (stats.lunar_aligned) {
      badges.push(
        <span key="lunar" className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          {l === "ko" ? "달 진영" : "Lunar Aligned"}
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
