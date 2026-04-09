"use client";

import type { ItemStatsV3 } from "@/data/item-stats-v3";
import type { ItemStats } from "@/data/item-stats";
import { TagChip } from "@/components/ui/TagChip";
import { itemName } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

/** itemName with ID fallback (for items not in CraftingItem data) */
function safeItemName(id: string, locale: string): string {
  const name = itemName({ id, name: id.replace(/_/g, " ") } as any, locale);
  return name || id.replace(/_/g, " ");
}

// ── Stat formatting (shared with legacy) ──

function formatStat(key: string, value: number, locale: string): string {
  if (key === "absorption" || key === "waterproof")
    return `${Math.round(value * 100)}%`;
  if (key === "speed_mult") {
    if (value > 1) return `+${Math.round((value - 1) * 100)}%`;
    if (value < 1) return `${Math.round((value - 1) * 100)}%`;
    return "0%";
  }
  if (key === "shadow_bonus") return `x${value}`;
  if (key === "health_regen" || key === "hunger_drain")
    return `${value > 0 ? "+" : ""}${value}/s`;
  if (key === "slots")
    return locale === "ko" ? `${value}칸` : `${value}`;
  if (key === "dapperness") {
    const perMin = Math.round(value * 60 * 10) / 10;
    return `${perMin > 0 ? "+" : ""}${perMin}${locale === "ko" ? "/분" : "/min"}`;
  }
  if (key === "fuel_time" || key === "perish_time") {
    const mins = Math.round(value / 60);
    if (mins >= 60) {
      const hrs = (mins / 60).toFixed(1);
      return locale === "ko" ? `${hrs}시간` : `${hrs}hr`;
    }
    return locale === "ko" ? `${mins}분` : `${mins}min`;
  }
  return String(value);
}

const STAT_LABELS: Record<string, Record<string, string>> = {
  ko: {
    damage: "공격력", planar_damage: "차원 피해", shadow_bonus: "그림자 보너스",
    uses: "내구도", armor_hp: "방어력", absorption: "흡수율", planar_def: "차원 방어",
    speed_mult: "이동속도", dapperness: "정신력",
    health_regen: "체력 회복", hunger_drain: "허기 소모",
    insulation: "보온", summer_insulation: "방열",
    waterproof: "방수", slots: "슬롯",
    fuel_time: "연료", perish_time: "부패",
  },
  en: {
    damage: "Damage", planar_damage: "Planar DMG", shadow_bonus: "vs Shadow",
    uses: "Durability", armor_hp: "Armor", absorption: "Absorb", planar_def: "Planar DEF",
    speed_mult: "Speed", dapperness: "Sanity",
    health_regen: "HP Regen", hunger_drain: "Hunger Drain",
    insulation: "Insulation", summer_insulation: "Cooling",
    waterproof: "Waterproof", slots: "Slots",
    fuel_time: "Fuel", perish_time: "Perish",
  },
};

// ── Stat groups ──

const COMBAT_STATS = ["damage", "planar_damage", "shadow_bonus", "uses"] as const;
const DEFENSE_STATS = ["armor_hp", "absorption", "planar_def"] as const;
const UTILITY_STATS = [
  "speed_mult", "dapperness", "health_regen", "hunger_drain",
  "insulation", "summer_insulation", "waterproof", "slots",
  "fuel_time", "perish_time",
] as const;

const TAG_LABELS: Record<string, Record<string, string>> = {
  ranged: { ko: "원거리", en: "Ranged" },
  consumable: { ko: "소모품", en: "Consumable" },
  deployable: { ko: "설치형", en: "Deployable" },
  electric: { ko: "전기", en: "Electric" },
  pvp: { ko: "PvP", en: "PvP" },
};

const IMMUNITY_LABELS: Record<string, Record<string, string>> = {
  fire: { ko: "화염 면역", en: "Fire Immune" },
  electric: { ko: "전기 면역", en: "Electric Immune" },
  lightning: { ko: "번개 면역", en: "Lightning Immune" },
  shadow_aura: { ko: "부정적 오라 면역", en: "Neg. Aura Immune" },
};

const RESISTANCE_LABELS: Record<string, Record<string, string>> = {
  shadow: { ko: "그림자 저항", en: "Shadow Resist" },
  lunar: { ko: "달 저항", en: "Lunar Resist" },
};

// ── Set member definitions ──

/** 세트 활성 조건: 갑옷 + 투구 동시 착용 */
const SET_ACTIVATION: Record<string, string[]> = {
  brightshade: ["armor_lunarplant", "armor_lunarplant_husk", "lunarplanthat"],
  voidcloth: ["armor_voidcloth", "voidclothhat"],
  dreadstone: ["armordreadstone", "dreadstonehat"],
  wagpunk: ["armorwagpunk", "wagpunkhat"],
};

// ── Component ──

interface ItemStatsPanelProps {
  itemId: string;
  stats: ItemStats;
  statsV3: ItemStatsV3 | undefined;
  locale: string;
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold tabular-nums", highlight ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function StatGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</span>
      {children}
    </div>
  );
}

export function ItemStatsPanel({ itemId, stats, statsV3, locale }: ItemStatsPanelProps) {
  const l = locale === "ko" ? "ko" : "en";

  // Collect stat rows per group
  const combatRows = COMBAT_STATS.filter((k) => stats[k] != null);
  const defenseRows = DEFENSE_STATS.filter((k) => stats[k] != null);
  const utilityRows = UTILITY_STATS.filter((k) => stats[k] != null);

  // V3-only structured fields
  const hasV3 = !!statsV3;
  const tags = statsV3?.tags;
  const shadowLevel = statsV3?.shadow_level;
  const resistance = statsV3?.resistance;
  const immunities = statsV3?.immunities;
  const setBonus = statsV3?.set_bonus;
  const repair = statsV3?.repair;
  const skillTree = statsV3?.skill_tree;
  const effects = statsV3?.effects;

  // Fallback: if no v3 data, show v2 usage
  const usageText = !hasV3 && stats.usage
    ? (l === "ko" ? stats.usage.ko : stats.usage.en)
    : null;

  const hasSpecial = !!(tags?.length || shadowLevel || resistance?.length || immunities?.length || setBonus || repair || skillTree?.length || effects?.length || usageText);
  const hasAnyStat = combatRows.length > 0 || defenseRows.length > 0 || utilityRows.length > 0 || hasSpecial;

  if (!hasAnyStat) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded px-1.5 py-0.5 leading-none w-fit">Beta</span>

      {/* Combat */}
      {combatRows.length > 0 && (
        <StatGroup title={l === "ko" ? "전투" : "Combat"}>
          {combatRows.map((k) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{STAT_LABELS[l][k]}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatStat(k, stats[k] as number, l)}
                {k === "shadow_bonus" && stats.damage != null && (
                  <span className="font-normal text-muted-foreground">
                    {` (${Math.round(stats.damage * (stats[k] as number) * 10) / 10})`}
                  </span>
                )}
              </span>
            </div>
          ))}
        </StatGroup>
      )}

      {/* Defense */}
      {defenseRows.length > 0 && (
        <StatGroup title={l === "ko" ? "방어" : "Defense"}>
          {defenseRows.map((k) => (
            <StatRow key={k} label={STAT_LABELS[l][k]} value={formatStat(k, stats[k] as number, l)} />
          ))}
          {/* Resistance inline */}
          {resistance?.map((r) => (
            <StatRow
              key={r.type}
              label={RESISTANCE_LABELS[r.type]?.[l] ?? r.type}
              value={`${r.percent}%`}
              highlight
            />
          ))}
          {/* Shadow level */}
          {shadowLevel != null && (
            <StatRow
              label={l === "ko" ? "그림자 레벨" : "Shadow Level"}
              value={String(shadowLevel)}
              highlight
            />
          )}
        </StatGroup>
      )}

      {/* If no defense group but has resistance/shadow_level, show standalone */}
      {defenseRows.length === 0 && (resistance?.length || shadowLevel != null) && (
        <StatGroup title={l === "ko" ? "방어" : "Defense"}>
          {resistance?.map((r) => (
            <StatRow
              key={r.type}
              label={RESISTANCE_LABELS[r.type]?.[l] ?? r.type}
              value={`${r.percent}%`}
              highlight
            />
          ))}
          {shadowLevel != null && (
            <StatRow
              label={l === "ko" ? "그림자 레벨" : "Shadow Level"}
              value={String(shadowLevel)}
              highlight
            />
          )}
        </StatGroup>
      )}

      {/* Utility */}
      {utilityRows.length > 0 && (
        <StatGroup title={l === "ko" ? "유틸리티" : "Utility"}>
          {utilityRows.map((k) => (
            <StatRow key={k} label={STAT_LABELS[l][k]} value={formatStat(k, stats[k] as number, l)} />
          ))}
        </StatGroup>
      )}

      {/* Special: tags, immunities, set_bonus, repair, skill_tree, effects */}
      {hasSpecial && (
        <div className="space-y-1">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <TagChip
                  key={tag}
                  label={TAG_LABELS[tag]?.[l] ?? tag}
                  className="text-[10px] px-1.5 py-0"
                />
              ))}
            </div>
          )}

          {/* Immunities */}
          {immunities && immunities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {immunities.map((imm) => (
                <span key={imm} className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {IMMUNITY_LABELS[imm]?.[l] ?? imm}
                </span>
              ))}
            </div>
          )}

          {/* Set bonus */}
          {setBonus && (() => {
            const members = SET_ACTIVATION[setBonus.set_id] ?? [];
            return (
              <div className="text-xs border border-amber-300/50 bg-amber-50/50 dark:border-amber-700/30 dark:bg-amber-950/30 rounded px-2 py-1.5 space-y-1">
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                {l === "ko" ? "세트 효과" : "Set Bonus"}
              </span>
              <div className="text-foreground leading-relaxed space-y-0.5">
                {(l === "ko" ? setBonus.effects.ko : setBonus.effects.en).split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {members.map((mid) => (
                      <div key={mid} className={cn("flex items-center gap-1 text-[10px]", mid === itemId ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-muted-foreground")}>
                        <img
                          src={assetPath(`/images/game-items/${mid}.png`)}
                          alt=""
                          className="size-4 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span>{safeItemName(mid, l)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Repair */}
          {repair && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <img
                src={assetPath(`/images/game-items/${repair.item_id}.png`)}
                alt=""
                className="size-4 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span>
                {l === "ko" ? "수리: " : "Repair: "}
                <span className="text-foreground font-medium">
                  {safeItemName(repair.item_id, l)}
                </span>
                <span className="text-muted-foreground">
                  {l === "ko" ? " (내구도 100% 복구)" : " (restores 100%)"}
                </span>
              </span>
            </div>
          )}

          {/* Skill tree */}
          {skillTree && skillTree.length > 0 && (
            <div className="text-xs space-y-0.5">
              <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                {l === "ko" ? "스킬트리" : "Skill Tree"}
              </span>
              {skillTree.map((st, i) => (
                <p key={i} className="text-foreground leading-relaxed pl-2 border-l-2 border-violet-300/50 dark:border-violet-700/50">
                  {l === "ko" ? st.ko : st.en}
                </p>
              ))}
            </div>
          )}

          {/* Effects (bullet list) */}
          {effects && effects.length > 0 && (
            <div className="text-xs text-foreground space-y-0.5">
              {effects.map((eff, i) => (
                <p key={i} className="leading-relaxed">{l === "ko" ? eff.ko : eff.en}</p>
              ))}
            </div>
          )}

          {/* Fallback: v2 usage text */}
          {usageText && (
            <div className="text-xs text-foreground space-y-0.5">
              {usageText.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="leading-relaxed">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
