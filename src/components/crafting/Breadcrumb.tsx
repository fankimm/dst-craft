"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Category, Character } from "@/lib/types";
import { useSettings } from "@/hooks/use-settings";
import { categoryName, characterName, t } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";

interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  category?: Category;
  character?: Character | null;
  /** Pass "all" to show the "All" label for character */
  characterId?: string | null;
  isSearching?: boolean;
  searchLabel?: string;
  /** Custom label for non-standard categories (e.g. favorites) */
  customLabel?: string;
  onHomeClick: () => void;
  onCategoryClick?: () => void;
  onTitleClick?: () => void;
}

export function Breadcrumb({
  category,
  character,
  characterId,
  isSearching,
  searchLabel,
  customLabel,
  onHomeClick,
  onCategoryClick,
  onTitleClick,
}: BreadcrumbProps) {
  const { resolvedLocale } = useSettings();

  const segments: BreadcrumbSegment[] = [];

  // Home (always present)
  segments.push({ label: "__home__", onClick: onHomeClick });

  if (isSearching) {
    segments.push({ label: searchLabel || "Search" });
  } else if (customLabel) {
    segments.push({ label: customLabel });
  } else if (category) {
    const catName = categoryName(category, resolvedLocale);
    if (characterId) {
      // Home > Category > Character
      segments.push({ label: catName, onClick: onCategoryClick });
      const charLabel =
        characterId === "all"
          ? t(resolvedLocale, "all")
          : character
            ? characterName(character, resolvedLocale)
            : characterId;
      segments.push({ label: charLabel });
    } else {
      // Home > Category
      segments.push({ label: catName });
    }
  }

  // If only home segment, it's current page — not clickable, show app name
  if (segments.length === 1) {
    segments[0].onClick = undefined;
    segments.push({ label: t(resolvedLocale, "craftingGuide") });
  }

  const iconSrc = assetPath("/icons/icon-192.png");

  return (
    <nav className="flex items-center gap-1 min-w-0 text-sm">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const isHome = seg.label === "__home__";

        return (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            )}
            {isHome ? (
              seg.onClick ? (
                <button
                  onClick={seg.onClick}
                  className="shrink-0 rounded-sm hover:opacity-70 transition-opacity"
                >
                  <Image
                    src={iconSrc}
                    alt="Home"
                    width={20}
                    height={20}
                    className="size-5 rounded-sm"
                  />
                </button>
              ) : (
                <Image
                  src={iconSrc}
                  alt="Home"
                  width={20}
                  height={20}
                  className="size-5 rounded-sm"
                />
              )
            ) : isLast ? (
              <span
                className="font-semibold text-foreground truncate"
                onClick={onTitleClick}
              >
                {seg.label}
              </span>
            ) : (
              <button
                onClick={seg.onClick}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {seg.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
