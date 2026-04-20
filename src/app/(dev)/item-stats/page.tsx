"use client";

import { useState, useMemo } from "react";
import { allItems } from "@/data/items";
import { allLocales } from "@/data/locales";
import type { ScrapbookStats } from "@/data/scrapbook-stats";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { categories } from "@/data/categories";
import { BackToHome } from "@/components/ui/BackToHome";
import Image from "next/image";

const ko = allLocales.ko;

function statLabel(key: keyof ScrapbookStats): string {
  const map: Record<string, string> = {
    damage: "공격력",
    weapondamage: "무기 공격력",
    planardamage: "차원피해",
    finiteuses: "내구도(횟수)",
    armor: "방어력",
    absorb_percent: "흡수율",
    armor_planardefense: "차원방어",
    dapperness: "정신력/분",
    waterproofer: "방수율",
    insulator: "보온/내열",
    perishable: "부패시간(초)",
    stacksize: "겹침 수",
  };
  return map[key] ?? key;
}

function formatStat(key: string, value: number | string | boolean): string {
  if (typeof value === "boolean") return value ? "O" : "X";
  if (typeof value === "string") return value;
  if (key === "absorb_percent" || key === "waterproofer")
    return `${Math.round(value * 100)}%`;
  if (key === "dapperness") {
    const perMin = Math.round(value * 60 * 100) / 100;
    return `${perMin > 0 ? "+" : ""}${perMin}/분`;
  }
  if (key === "perishable") {
    const days = (value / (60 * 8)).toFixed(1);
    return `${days}일`;
  }
  return String(Math.floor(value));
}

function statColor(key: string): string {
  const map: Record<string, string> = {
    damage: "text-red-400", weapondamage: "text-red-400",
    armor: "text-yellow-400", absorb_percent: "text-yellow-400",
    finiteuses: "text-blue-400",
    dapperness: "text-purple-400",
    insulator: "text-cyan-400",
    waterproofer: "text-sky-400",
    perishable: "text-rose-400",
    planardamage: "text-violet-400", armor_planardefense: "text-violet-400",
    stacksize: "text-teal-400",
  };
  return map[key] ?? "text-muted-foreground";
}

type FilterMode = "all" | "has-stats" | "no-stats";
type GroupMode = "category" | "station" | "flat";

const STAT_DISPLAY_ORDER: (keyof ScrapbookStats)[] = [
  "damage", "weapondamage", "planardamage",
  "finiteuses",
  "armor", "absorb_percent", "armor_planardefense",
  "dapperness", "waterproofer", "insulator",
  "perishable", "stacksize",
];

export default function ItemStatsPage() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [group, setGroup] = useState<GroupMode>("category");
  const [search, setSearch] = useState("");

  const totalWithStats = useMemo(
    () => allItems.filter((i) => scrapbookStats[i.id]).length,
    [],
  );

  const filtered = useMemo(() => {
    let items = [...allItems];
    if (filter === "has-stats") items = items.filter((i) => scrapbookStats[i.id]);
    if (filter === "no-stats") items = items.filter((i) => !scrapbookStats[i.id]);
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
  }, [filter, search]);

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
            제작 아이템 스탯 리뷰 (Scrapbook)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            전체 {allItems.length}개 중 {totalWithStats}개 스탯 매칭 |{" "}
            scrapbookdata.lua 자동 파싱
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
                  const stats = scrapbookStats[item.id];
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
                                  {formatStat(k, stats[k] as number)}
                                </span>
                              </span>
                            ))}
                            {stats.specialinfo_ko && (
                              <span className="text-amber-500 truncate max-w-xs">
                                {stats.specialinfo_ko.split("\n")[0]}
                              </span>
                            )}
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
