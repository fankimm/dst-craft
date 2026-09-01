"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CraftingItem } from "@/lib/types";
import { ItemIcon } from "./ItemIcon";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

const PAGE_SIZE = 36;

interface ItemGridProps {
  items: CraftingItem[];
  selectedItem: CraftingItem | null;
  onSelectItem: (item: CraftingItem) => void;
  className?: string;
  getClicks?: (id: string) => number;
}

export function ItemGrid({
  items,
  selectedItem,
  onSelectItem,
  className,
  getClicks,
}: ItemGridProps) {
  const { resolvedLocale } = useSettings();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when items change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [items]);

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, items.length));
  }, [items.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= items.length) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, items.length, loadMore]);

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-muted-foreground text-sm",
          className
        )}
      >
        {t(resolvedLocale, "noItems")}
      </div>
    );
  }

  const visibleItems = items.length > PAGE_SIZE ? items.slice(0, visibleCount) : items;

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full", className)}>
      {visibleItems.map((item) => (
        <ItemIcon
          key={item.id}
          item={item}
          isSelected={selectedItem?.id === item.id}
          onClick={() => onSelectItem(item)}
          clicks={getClicks?.(item.id)}
        />
      ))}
      {visibleCount < items.length && (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-4">
          <div className="size-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
