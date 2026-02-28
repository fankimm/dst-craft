"use client";

import type { Category, CategoryId } from "@/lib/types";
import { useSettings } from "@/hooks/use-settings";
import { categoryName, t } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";

interface CategoryGridProps {
  categories: Category[];
  favCount: number;
  onSelectCategory: (id: CategoryId | "favorites") => void;
}

export function CategoryGrid({
  categories,
  favCount,
  onSelectCategory,
}: CategoryGridProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
      {/* Favorites tile (only when there are favorites) */}
      {favCount > 0 && (
        <button
          className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
          onClick={() => onSelectCategory("favorites")}
        >
          <div className="relative flex items-center justify-center size-12 sm:size-14">
            <img
              src={assetPath("/images/ui/health.png")}
              alt=""
              className="size-10 sm:size-12 object-contain"
            />
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold bg-surface-hover border border-ring text-foreground/80">
              {favCount}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-foreground/80 font-medium">
            {t(resolvedLocale, "favorites")}
          </span>
        </button>
      )}
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
