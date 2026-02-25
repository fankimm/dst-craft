"use client";

import type { Category, CategoryId } from "@/lib/types";
import { useSettings } from "@/hooks/use-settings";
import { categoryName } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (id: CategoryId) => void;
}

export function CategoryGrid({
  categories,
  onSelectCategory,
}: CategoryGridProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
          onClick={() => onSelectCategory(cat.id)}
        >
          <img
            src={assetPath(`/images/category-icons/${cat.id}.png`)}
            alt={categoryName(cat, resolvedLocale)}
            className="size-12 sm:size-14 object-contain"
            draggable={false}
          />
          <span className="text-xs sm:text-sm text-foreground/80 font-medium">
            {categoryName(cat, resolvedLocale)}
          </span>
        </button>
      ))}
    </div>
  );
}
