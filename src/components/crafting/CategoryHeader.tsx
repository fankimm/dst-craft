"use client";

import type { Category, Character } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import { Breadcrumb } from "./Breadcrumb";
import type { ReactNode } from "react";

interface CategoryHeaderProps {
  category: Category | undefined;
  character?: Character | null;
  characterId?: string | null;
  searchBar: ReactNode;
  isSearching?: boolean;
  onHomeClick: () => void;
  onCategoryClick?: () => void;
  className?: string;
}

export function CategoryHeader({
  category,
  character,
  characterId,
  searchBar,
  isSearching,
  onHomeClick,
  onCategoryClick,
  className,
}: CategoryHeaderProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div
      className={cn(
        "border-b border-border bg-background/80 px-4 py-2.5 space-y-2",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Breadcrumb
          category={category}
          character={character}
          characterId={characterId}
          isSearching={isSearching}
          searchLabel={t(resolvedLocale, "searchResults")}
          onHomeClick={onHomeClick}
          onCategoryClick={onCategoryClick}
        />
      </div>
      {searchBar}
    </div>
  );
}
