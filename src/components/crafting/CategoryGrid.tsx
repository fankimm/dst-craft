"use client";

import { useMemo } from "react";
import type { Category, CategoryId } from "@/lib/types";
import { useSettings } from "@/hooks/use-settings";
import { categoryName, t } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { AdSlot } from "@/components/ads/AdSlot";

interface CategoryGridProps {
  categories: Category[];
  favCount: number;
  recentCount?: number;
  sortByPopular?: boolean;
  getClicks?: (id: string) => number;
  onSelectCategory: (id: CategoryId | "favorites" | "recent") => void;
}

export function CategoryGrid({
  categories,
  favCount,
  recentCount,
  sortByPopular,
  getClicks,
  onSelectCategory,
}: CategoryGridProps) {
  const { resolvedLocale } = useSettings();

  const sortedCategories = useMemo(() => {
    if (!sortByPopular || !getClicks) return categories;
    return [...categories].sort((a, b) => getClicks(`cat:${b.id}`) - getClicks(`cat:${a.id}`));
  }, [categories, sortByPopular, getClicks]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
      {/* 카테고리 첫 화면 첫 줄 광고 (#75) — 목록 화면과 같은 자리·같은 번호를 쓴다.
          두 화면은 서로 배타적이라 같은 번호를 동시에 요청하는 일이 없다. */}
      <AdSlot variant="top" className="col-span-full" />
      <CategoryCard
        imageSrc={assetPath("/images/ui/health.png")}
        label={t(resolvedLocale, "favorites")}
        badgeCount={favCount}
        onClick={() => onSelectCategory("favorites")}
      />
      <CategoryCard
        imageSrc={assetPath("/images/game-items/pocketwatch_warp.png")}
        label={t(resolvedLocale, "recent")}
        badgeCount={recentCount ?? 0}
        onClick={() => onSelectCategory("recent")}
      />
      {sortedCategories.map((cat) => (
        <CategoryCard
          key={cat.id}
          imageSrc={assetPath(`/images/category-icons/${cat.id}.png`)}
          imageAlt={categoryName(cat, resolvedLocale)}
          label={categoryName(cat, resolvedLocale)}
          onClick={() => onSelectCategory(cat.id)}
        />
      ))}
    </div>
  );
}
