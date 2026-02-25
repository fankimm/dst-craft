"use client";

import type { CraftingItem } from "@/lib/types";
import { ItemIcon } from "./ItemIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

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
  const { resolvedLocale } = useSettings();

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

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4">
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
