import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CategoryHeaderProps {
  category: Category | undefined;
  searchBar: ReactNode;
  className?: string;
}

export function CategoryHeader({
  category,
  searchBar,
  className,
}: CategoryHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5",
        className
      )}
    >
      <div className="min-w-0">
        {category ? (
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-zinc-100 truncate">
              {category.nameKo}
            </h2>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {category.nameEn}
            </span>
          </div>
        ) : (
          <h2 className="text-base font-semibold text-zinc-100">
            검색 결과
          </h2>
        )}
      </div>
      <div className="hidden sm:block w-56 shrink-0">{searchBar}</div>
    </div>
  );
}
