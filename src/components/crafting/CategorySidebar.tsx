"use client";

import type { Category, CategoryId } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { localName } from "@/lib/i18n";

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div className="hidden sm:flex flex-col items-center w-[68px] shrink-0 border-r border-border bg-background sticky top-0 h-dvh overflow-y-auto py-2 gap-1">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <Tooltip key={cat.id}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "size-[52px] p-1.5 rounded-md transition-colors",
                  isActive
                    ? "bg-surface-active ring-1 ring-ring"
                    : "hover:bg-surface-hover opacity-60 hover:opacity-100"
                )}
                onClick={() => onSelectCategory(cat.id)}
              >
                <img
                  src={`/images/category-icons/${cat.id}.png`}
                  alt={localName(cat, resolvedLocale)}
                  className="size-full object-contain"
                  draggable={false}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{localName(cat, resolvedLocale)}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
