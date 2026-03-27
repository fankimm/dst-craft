"use client";

import { useState, useMemo } from "react";
import { gameItems, type GameItem } from "@/data/game-items-db";
import { BackToHome } from "@/components/ui/BackToHome";
import { cn } from "@/lib/utils";

type Filter = "all" | "in-app" | "missing" | "craftable-missing" | "deconstruct";

const FILTERS: { value: Filter; label: string; count: (items: GameItem[]) => number }[] = [
  { value: "all", label: "전체", count: (items) => items.length },
  { value: "in-app", label: "앱 등록", count: (items) => items.filter((i) => i.app).length },
  { value: "missing", label: "미등록", count: (items) => items.filter((i) => !i.app).length },
  { value: "craftable-missing", label: "제작 가능 미등록", count: (items) => items.filter((i) => !i.app && !i.type).length },
  { value: "deconstruct", label: "분해 전용", count: (items) => items.filter((i) => i.type === "deconstruct").length },
];

function filterItems(items: GameItem[], filter: Filter, search: string): GameItem[] {
  let filtered = items;
  switch (filter) {
    case "in-app":
      filtered = items.filter((i) => i.app);
      break;
    case "missing":
      filtered = items.filter((i) => !i.app);
      break;
    case "craftable-missing":
      filtered = items.filter((i) => !i.app && !i.type);
      break;
    case "deconstruct":
      filtered = items.filter((i) => i.type === "deconstruct");
      break;
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.en.toLowerCase().includes(q) ||
        i.ko.includes(q) ||
        i.source.toLowerCase().includes(q)
    );
  }
  return filtered;
}

function ItemRow({ item, expanded, onToggle }: { item: GameItem; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-surface-hover/50 transition-colors"
      >
        <span className="text-xs text-muted-foreground w-8 text-right shrink-0 tabular-nums">{item.num}</span>
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
            item.app
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : item.type === "deconstruct"
                ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
          )}
        >
          {item.app ? "O" : item.type === "deconstruct" ? "D" : "X"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.ko}</p>
          <p className="text-xs text-muted-foreground truncate">{item.en}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{expanded ? "v" : ">"}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pl-14 space-y-2">
          <div className="text-xs space-y-1">
            <p className="text-muted-foreground">
              <span className="font-mono text-foreground/60">{item.id}</span>
            </p>
            <div className="rounded-md bg-surface p-2">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Source (game code)</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{item.source}</p>
            </div>
            {item.desc_en && (
              <div className="rounded-md bg-surface p-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Description</p>
                <p className="text-xs text-foreground/80">{item.desc_en}</p>
                {item.desc_ko && <p className="text-xs text-foreground/60 mt-1">{item.desc_ko}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemDatabasePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => filterItems(gameItems, filter, search), [filter, search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackToHome />
      <div className="mx-auto max-w-3xl p-4 space-y-4">
        <div>
          <h1 className="text-lg font-bold">Game Item Database</h1>
          <p className="text-xs text-muted-foreground">
            {gameItems.length} items from recipes.lua + source code analysis
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, or source..."
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                filter === f.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-surface-hover border border-border"
              )}
            >
              {f.label} ({f.count(gameItems)})
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">{filtered.length}개 아이템</p>

        {/* Item list */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {filtered.slice(0, 200).map((item) => (
            <ItemRow
              key={item.id + item.num}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))}
          {filtered.length > 200 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              + {filtered.length - 200}개 더 (검색으로 필터링하세요)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
