"use client";

import type { CraftingItem } from "@/lib/types";
import { ItemIcon } from "./ItemIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ItemGridProps {
  items: CraftingItem[];
  selectedItem: CraftingItem | null;
  onSelectItem: (item: CraftingItem) => void;
  className?: string;
}

export function ItemGrid({
  items,
  selectedItem,
  onSelectItem,
  className,
}: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-zinc-500 text-sm",
          className
        )}
      >
        아이템이 없습니다
      </div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-1.5 p-3">
        {items.map((item) => (
          <ItemIcon
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onClick={() => onSelectItem(item)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
