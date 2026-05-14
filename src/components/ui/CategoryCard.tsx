"use client";

import { assetPath } from "@/lib/asset-path";

interface CategoryCardProps {
  imageSrc: string;
  imageAlt?: string;
  label: string;
  badgeCount?: number;
  onClick: () => void;
}

export function CategoryCard({
  imageSrc,
  imageAlt = "",
  label,
  badgeCount,
  onClick,
}: CategoryCardProps) {
  const hasBadge = badgeCount !== undefined;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
    >
      <div className="relative flex items-center justify-center size-12 sm:size-14 shrink-0">
        <img
          src={imageSrc.startsWith("/") ? assetPath(imageSrc) : imageSrc}
          alt={imageAlt}
          className={
            hasBadge
              ? "size-10 sm:size-12 object-contain"
              : "size-12 sm:size-14 object-contain"
          }
          draggable={false}
        />
        {hasBadge && badgeCount > 0 && (
          <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold bg-surface-hover border border-ring text-foreground/80">
            {badgeCount}
          </span>
        )}
      </div>
      <span className="flex items-start justify-center min-h-[2lh] text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  );
}
