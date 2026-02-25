"use client";

import { ArrowLeft } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t, categoryName } from "@/lib/i18n";
import { SettingsButton } from "./SettingsButton";
import type { ReactNode } from "react";

interface CategoryHeaderProps {
  category: Category | undefined;
  searchBar: ReactNode;
  onBack?: () => void;
  className?: string;
}

export function CategoryHeader({
  category,
  searchBar,
  onBack,
  className,
}: CategoryHeaderProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-2.5",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            className="shrink-0 p-1 -ml-1 rounded-md text-muted-foreground hover:bg-surface-hover active:bg-surface-hover transition-colors"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        {category ? (
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-foreground truncate">
              {categoryName(category, resolvedLocale)}
            </h2>
          </div>
        ) : (
          <h2 className="text-base font-semibold text-foreground">
            {t(resolvedLocale, "searchResults")}
          </h2>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:block w-56">{searchBar}</div>
        <SettingsButton />
      </div>
    </div>
  );
}
