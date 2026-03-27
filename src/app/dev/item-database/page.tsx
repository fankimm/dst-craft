"use client";

import { useState, useMemo, useCallback } from "react";
import { gameItems, type GameItem } from "@/data/game-items-db";
import type { CraftingItem, CategoryId } from "@/lib/types";
import { BackToHome } from "@/components/ui/BackToHome";
import { ItemGrid } from "@/components/crafting/ItemGrid";
import { ItemDetail } from "@/components/crafting/ItemDetail";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import Image from "next/image";

// Convert GameItem to CraftingItem for reusing existing components
function toCraftingItem(gi: GameItem): CraftingItem {
  return {
    id: gi.id,
    name: gi.en,
    description: gi.desc_en || gi.source || "",
    image: gi.id + ".png",
    category: ["all" as CategoryId],
    station: "none",
    materials: [],
    sortOrder: gi.num,
  };
}

type Filter = "all" | "in-app" | "missing" | "craftable-missing" | "deconstruct";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "in-app", label: "앱 등록" },
  { value: "missing", label: "미등록" },
  { value: "craftable-missing", label: "제작 가능 미등록" },
  { value: "deconstruct", label: "분해 전용" },
];

function getFilteredItems(filter: Filter, search: string): GameItem[] {
  let items = gameItems;
  switch (filter) {
    case "in-app":
      items = items.filter((i) => i.app);
      break;
    case "missing":
      items = items.filter((i) => !i.app);
      break;
    case "craftable-missing":
      items = items.filter((i) => !i.app && !i.type);
      break;
    case "deconstruct":
      items = items.filter((i) => i.type === "deconstruct");
      break;
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.en.toLowerCase().includes(q) ||
        i.ko.includes(q) ||
        (i.source && i.source.toLowerCase().includes(q))
    );
  }
  return items;
}

function getCount(filter: Filter): number {
  switch (filter) {
    case "all": return gameItems.length;
    case "in-app": return gameItems.filter((i) => i.app).length;
    case "missing": return gameItems.filter((i) => !i.app).length;
    case "craftable-missing": return gameItems.filter((i) => !i.app && !i.type).length;
    case "deconstruct": return gameItems.filter((i) => i.type === "deconstruct").length;
  }
}

// Custom ItemIcon for game-items-db (no dependency on allItems)
function DbItemIcon({ item, selected, onClick }: { item: GameItem; selected: boolean; onClick: () => void }) {
  const imgSrc = assetPath(`/images/game-items/${item.id}.png`);
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
        selected
          ? "border-foreground/30 bg-surface-hover"
          : "border-border hover:bg-surface-hover/50"
      )}
    >
      <div className="relative size-12 sm:size-14">
        <Image
          src={imgSrc}
          alt={item.ko}
          fill
          className="object-contain"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <span className="text-xs sm:text-sm text-center leading-tight line-clamp-2 w-full">
        {item.ko}
      </span>
      <div className="flex gap-1">
        {!item.app && (
          <span className={cn(
            "text-[9px] font-bold px-1 rounded",
            item.type === "deconstruct"
              ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
              : "bg-red-500/15 text-red-600 dark:text-red-400"
          )}>
            {item.type === "deconstruct" ? "분해" : "미등록"}
          </span>
        )}
      </div>
    </button>
  );
}

// Detail view for GameItem
function DbItemDetail({ item, onClose }: { item: GameItem; onClose: () => void }) {
  const imgSrc = assetPath(`/images/game-items/${item.id}.png`);
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0 rounded-lg border border-border bg-surface p-1">
          <Image
            src={imgSrc}
            alt={item.ko}
            fill
            className="object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold">{item.ko}</h2>
          <p className="text-xs text-muted-foreground">{item.en}</p>
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{item.id}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          item.app
            ? "bg-green-500/15 text-green-600 dark:text-green-400"
            : "bg-red-500/15 text-red-600 dark:text-red-400"
        )}>
          {item.app ? "앱 등록" : "미등록"}
        </span>
        {item.type === "deconstruct" && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
            분해 전용
          </span>
        )}
      </div>

      {/* Source */}
      <div className="rounded-lg border border-border bg-surface p-3 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground">Source (game code)</p>
        <p className="text-sm text-foreground leading-relaxed">{item.source}</p>
      </div>

      {/* Description */}
      {item.desc_ko && (
        <div className="rounded-lg border border-border bg-surface p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">설명</p>
          <p className="text-sm text-foreground">{item.desc_ko}</p>
          {item.desc_en && <p className="text-xs text-muted-foreground mt-1">{item.desc_en}</p>}
        </div>
      )}
    </div>
  );
}

export default function ItemDatabasePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const { panelItem, panelOpen } = useDetailPanel<GameItem>(selectedItem);

  const filtered = useMemo(() => getFilteredItems(filter, search), [filter, search]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <BackToHome />

      {/* Header */}
      <div className="shrink-0 p-3 pb-0 max-w-4xl mx-auto w-full space-y-3">
        <div>
          <h1 className="text-sm font-bold">Game Item Database</h1>
          <p className="text-xs text-muted-foreground">{gameItems.length} items from recipes.lua</p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="아이템 검색..."
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap pb-2">
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
              {f.label} ({getCount(f.value)})
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
          {filtered.slice(0, 300).map((item) => (
            <DbItemIcon
              key={item.id + item.num}
              item={item}
              selected={selectedItem?.id === item.id}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
        {filtered.length > 300 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            + {filtered.length - 300}개 더 (검색으로 필터링하세요)
          </p>
        )}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">검색 결과가 없습니다</p>
        )}
      </div>

      {/* Detail Panel */}
      <DetailPanel open={panelOpen} onClose={() => setSelectedItem(null)}>
        {panelItem && <DbItemDetail item={panelItem} onClose={() => setSelectedItem(null)} />}
      </DetailPanel>
    </div>
  );
}
