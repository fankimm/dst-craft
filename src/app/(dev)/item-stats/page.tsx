"use client";

import { useState, useMemo } from "react";
import { allItems } from "@/data/items";
import { allLocales } from "@/data/locales";
import type { ItemStats } from "@/data/item-stats";
import { useItemStatsVersion } from "@/hooks/use-item-stats-version";
import { categories } from "@/data/categories";
import { BackToHome } from "@/components/ui/BackToHome";
import Image from "next/image";

const ko = allLocales.ko;

function statLabel(key: keyof ItemStats): string {
  const map: Record<string, string> = {
    damage: "공격력",
    uses: "내구도(횟수)",
    armor_hp: "방어력(HP)",
    absorption: "흡수율",
    speed_mult: "이동속도",
    dapperness: "정신력/분",
    insulation: "보온(겨울)",
    summer_insulation: "방열(여름)",
    waterproof: "방수율",
    fuel_time: "연료시간(초)",
    perish_time: "부패시간(초)",
    usage: "사용처",
  };
  return map[key] ?? key;
}

function formatStat(key: string, value: number | string | { ko: string; en: string }): string {
  if (typeof value === "object" && value !== null && "ko" in value) return value.ko;
  if (typeof value === "string") return value;
  if (key === "absorption" || key === "waterproof")
    return `${Math.round(value * 100)}%`;
  if (key === "speed_mult") {
    if (value > 1) return `+${Math.round((value - 1) * 100)}%`;
    if (value < 1) return `${Math.round((value - 1) * 100)}%`;
    return "0%";
  }
  if (key === "dapperness") {
    const perMin = Math.round(value * 60 * 10) / 10;
    return `${perMin > 0 ? "+" : ""}${perMin}/분`;
  }
  if (key === "fuel_time" || key === "perish_time") {
    const mins = Math.round(value / 60);
    return mins >= 60 ? `${(mins / 60).toFixed(1)}시간` : `${mins}분`;
  }
  if (key === "damage") return `${value}`;
  return String(value);
}

function statColor(key: string): string {
  const map: Record<string, string> = {
    damage: "text-red-400",
    armor_hp: "text-yellow-400",
    absorption: "text-yellow-400",
    uses: "text-blue-400",
    speed_mult: "text-green-400",
    dapperness: "text-purple-400",
    insulation: "text-cyan-400",
    summer_insulation: "text-orange-400",
    waterproof: "text-sky-400",
    fuel_time: "text-amber-400",
    perish_time: "text-rose-400",
    usage: "text-emerald-400",
  };
  return map[key] ?? "text-muted-foreground";
}

type FilterMode = "all" | "has-stats" | "no-stats";
type GroupMode = "category" | "station" | "flat";

const STAT_DISPLAY_ORDER: (keyof ItemStats)[] = [
  "damage",
  "uses",
  "armor_hp",
  "absorption",
  "speed_mult",
  "dapperness",
  "insulation",
  "summer_insulation",
  "waterproof",
  "fuel_time",
  "perish_time",
  "usage",
];

export default function ItemStatsPage() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [group, setGroup] = useState<GroupMode>("category");
  const [search, setSearch] = useState("");
  const { version, activeStats: itemStats } = useItemStatsVersion();

  const totalWithStats = useMemo(
    () => allItems.filter((i) => itemStats[i.id]).length,
    [itemStats],
  );

  const filtered = useMemo(() => {
    let items = [...allItems];
    if (filter === "has-stats") items = items.filter((i) => itemStats[i.id]);
    if (filter === "no-stats") items = items.filter((i) => !itemStats[i.id]);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => {
        const koName = ko?.items[i.id]?.name ?? "";
        return (
          i.id.includes(q) ||
          i.name.toLowerCase().includes(q) ||
          koName.includes(q)
        );
      });
    }
    return items;
  }, [filter, search, itemStats]);

  const grouped = useMemo(() => {
    if (group === "flat") return { "전체": filtered };
    const map: Record<string, typeof filtered> = {};
    for (const item of filtered) {
      const keys =
        group === "category"
          ? item.category.length > 0
            ? item.category
            : ["(없음)"]
          : [item.station];
      for (const k of keys) {
        if (!map[k]) map[k] = [];
        map[k].push(item);
      }
    }
    return map;
  }, [filtered, group]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />
      <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-lg font-bold">
            제작 아이템 스탯 리뷰
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            전체 {allItems.length}개 중 {totalWithStats}개 스탯 매칭 |{" "}
            게임 소스(tuning.lua + prefabs) 자동 파싱
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색 (ID, 이름, 한글명)"
            className="px-3 py-1.5 text-xs rounded-md border border-border bg-surface w-48"
          />
          <div className="flex gap-1">
            {(
              [
                ["all", "전체"],
                ["has-stats", "스탯 있음"],
                ["no-stats", "스탯 없음"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filter === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-hover"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(
              [
                ["category", "카테고리별"],
                ["station", "스테이션별"],
                ["flat", "전체 나열"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setGroup(v)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  group === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-hover"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length}개 표시
          </span>
        </div>

        {/* Item list */}
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([groupName, items]) => (
            <div key={groupName} className="space-y-1">
              <h2 className="text-sm font-semibold text-muted-foreground border-b border-border pb-1 sticky top-0 bg-background z-10">
                {group === "category"
                  ? categories.find((c) => c.id === groupName)?.name ??
                    groupName
                  : groupName}{" "}
                ({items.length})
              </h2>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const stats = itemStats[item.id];
                  const koName = ko?.items[item.id]?.name;
                  return (
                    <div
                      key={`${groupName}-${item.id}`}
                      className={`flex items-start gap-3 px-2 py-1.5 rounded text-xs ${
                        stats
                          ? "bg-surface/50"
                          : "bg-surface/20 opacity-50"
                      }`}
                    >
                      {/* Icon */}
                      <div className="size-8 rounded border border-border bg-surface shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={`/images/game-items/${item.image}`}
                          alt={item.name}
                          width={28}
                          height={28}
                          className="object-contain"
                          unoptimized
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium truncate">
                            {koName ?? item.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">
                            {item.id}
                          </span>
                        </div>

                        {stats ? (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                            {STAT_DISPLAY_ORDER.filter(
                              (k) => stats[k] != null,
                            ).map((k) => (
                              <span key={k} className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  {statLabel(k)}
                                </span>
                                <span className={`font-medium ${statColor(k)}`}>
                                  {formatStat(k, stats[k]!)}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            스탯 없음
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
