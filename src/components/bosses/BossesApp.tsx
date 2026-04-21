"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { bosses, bossCategories, lootImage, lootDisplayName, lootNameKo, type Boss, type BossCategoryId } from "@/data/bosses";
import { scrapbookStats } from "@/data/scrapbook-stats";
import { SearchWithSuggestions, type SearchSuggestion } from "@/components/ui/SearchWithSuggestions";
import { useSettings } from "@/hooks/use-settings";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { Footer } from "../crafting/Footer";
import { TagChip } from "@/components/ui/TagChip";
import { trackItemClick } from "@/lib/analytics";
import { usePopularity } from "@/hooks/use-popularity";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { ViewCount } from "@/components/ui/ViewCount";
import { PrefabIdButton } from "@/components/ui/PrefabIdButton";
import { useRecent } from "@/hooks/use-recent";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { SortDropdown } from "@/components/ui/SortDropdown";
import { FavClickBadge } from "@/components/ui/FavClickBadge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bossName(boss: Boss, locale: Locale): string {
  return locale === "ko" ? boss.nameKo : boss.name;
}

function categoryLabel(id: BossCategoryId, locale: Locale): string {
  return t(locale, `boss_${id}` as TranslationKey);
}

/** First image of a boss (for grid cards) */
function bossFirstImage(boss: Boss): string {
  const img = Array.isArray(boss.image) ? boss.image[0] : boss.image;
  return `/images/bosses/${img}`;
}

/** Representative boss image for a category tile */
function categoryImage(catId: BossCategoryId): string {
  const cat = bossCategories.find((c) => c.id === catId);
  if (!cat) return "/images/bosses/deerclops.png";
  const boss = bosses.find((b) => b.id === cat.representativeBoss);
  return boss ? bossFirstImage(boss) : "/images/bosses/deerclops.png";
}

const ALL_CATEGORY_IMAGE = "/images/category-icons/bosses_all.png";

/** Build unique loot list for suggestions */
const allLootItems = (() => {
  const seen = new Set<string>();
  const items: { id: string; baseId: string; nameKo: string; nameEn: string; image: string; blueprint: boolean }[] = [];
  for (const boss of bosses) {
    const allLoot = [...boss.loot, ...(boss.stashLoot?.items ?? [])];
    for (const loot of allLoot) {
      if (seen.has(loot.item)) continue;
      seen.add(loot.item);
      const baseId = loot.item.replace(/_blueprint$/, "");
      items.push({
        id: loot.item,
        baseId,
        nameKo: lootNameKo[baseId] ?? lootNameKo[loot.item] ?? baseId.replace(/_/g, " "),
        nameEn: baseId.replace(/_/g, " "),
        image: lootImage(loot.item),
        blueprint: !!loot.blueprint,
      });
    }
  }
  return items;
})();

function getLootSuggestions(query: string, locale: Locale): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allLootItems
    .filter((item) => item.nameKo.toLowerCase().includes(q) || item.nameEn.toLowerCase().includes(q))
    .slice(0, 8)
    .map((item) => ({
      key: item.id,
      text: locale === "ko" ? item.nameKo : item.nameEn,
      image: item.image.replace(/^\/images\//, ""),
      typeLabel: locale === "ko" ? "전리품" : "Loot",
      data: item.id,
    }));
}

interface LootTag {
  itemId: string;
  label: string;
  image: string;
}

// ---------------------------------------------------------------------------
// BossesApp
// ---------------------------------------------------------------------------

export function BossesApp({
  onViewCraftingItem,
  pendingLootItemId,
  onClearPendingLoot,
}: {
  onViewCraftingItem?: (itemId: string) => void;
  pendingLootItemId?: string | null;
  onClearPendingLoot?: () => void;
}) {
  const { resolvedLocale } = useSettings();
  const { isAdmin } = useAuth();
  const { getClicks } = usePopularity();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { recentIds, addRecent } = useRecent("bosses");

  const bossFavCount = useMemo(
    () => bosses.filter((b) => favorites.has(b.id)).length,
    [favorites],
  );

  const [selectedCategory, setSelectedCategory] = useState<BossCategoryId | null>(null);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [sortByPopular, setSortByPopular] = useState(false);

  // Loot search with tags
  const [lootInput, setLootInput] = useState("");
  const [lootTags, setLootTags] = useState<LootTag[]>([]);

  // External loot search (e.g. crafting blueprint → boss loot)
  useEffect(() => {
    if (!pendingLootItemId) return;
    const bpId = `${pendingLootItemId}_blueprint`;
    const lootItem = allLootItems.find((l) => l.id === bpId || l.baseId === pendingLootItemId);
    if (lootItem) {
      const label = resolvedLocale === "ko" ? lootItem.nameKo : lootItem.nameEn;
      setLootTags([{ itemId: lootItem.id, label, image: lootItem.image.replace(/^\/images\//, "") }]);
      setSelectedCategory(null);
    } else {
      // Blueprint not found in boss loot — search by item name as fallback
      setLootInput(pendingLootItemId.replaceAll("_", " "));
      setSelectedCategory(null);
    }
    onClearPendingLoot?.();
  }, [pendingLootItemId, onClearPendingLoot, resolvedLocale]);

  const lootSuggestions = useMemo(
    () => getLootSuggestions(lootInput, resolvedLocale),
    [lootInput, resolvedLocale],
  );

  const handleLootSelect = useCallback((s: SearchSuggestion) => {
    const itemId = s.data as string;
    setLootTags((prev) => {
      if (prev.some((t) => t.itemId === itemId)) return prev;
      return [...prev, { itemId, label: s.text, image: s.image ?? "" }];
    });
    setLootInput("");
  }, []);

  const handleLootRemoveTag = useCallback((index: number) => {
    setLootTags((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const lootSearchResults = useMemo(() => {
    if (lootTags.length === 0) return null;
    const tagItemIds = new Set(lootTags.map((t) => t.itemId));
    return bosses.filter((boss) => {
      const allLoot = [...boss.loot, ...(boss.stashLoot?.items ?? [])];
      return allLoot.some((loot) => tagItemIds.has(loot.item));
    });
  }, [lootTags]);

  const slideClass = useSlideAnimation(selectedCategory, (v) => v === null);

  const { panelItem: panelBoss, panelOpen } = useDetailPanel(selectedBoss);

  const handleGoHome = useCallback(() => {
    setSelectedCategory(null);
    setSelectedBoss(null);
    setLootInput("");
    setLootTags([]);
  }, []);

  // URL param deep link: ?tab=bosses&boss={id}
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bossId = params.get("boss");
    if (bossId) {
      const boss = bosses.find((b) => b.id === bossId);
      if (boss) {
        setSelectedBoss(boss);
        addRecent(boss.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-tap active tab → go home
  useEffect(() => {
    const handler = () => handleGoHome();
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, [handleGoHome]);

  useEffect(() => {
    document.querySelector("[data-scroll-container]")?.scrollTo(0, 0);
  }, [selectedCategory]);

  const handleSelectCategory = useCallback((id: BossCategoryId) => {
    setSelectedCategory(id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedBoss(null);
  }, []);

  const filteredBosses = useMemo(() => {
    let result: Boss[];
    if (!selectedCategory || selectedCategory === "all") {
      result = bosses;
    } else if (selectedCategory === ("favorites" as BossCategoryId)) {
      result = bosses.filter((b) => favorites.has(b.id));
    } else if (selectedCategory === ("recent" as BossCategoryId)) {
      return recentIds
        .map((id) => bosses.find((b) => b.id === id))
        .filter((b): b is Boss => !!b);
    } else {
      result = bosses.filter((b) => b.category === selectedCategory);
    }
    if (sortByPopular) {
      return [...result].sort((a, b) => getClicks(`boss:${b.id}`) - getClicks(`boss:${a.id}`));
    }
    return result;
  }, [selectedCategory, favorites, recentIds, sortByPopular, getClicks]);

  const detailPanel = panelBoss && (
    <DetailPanel open={panelOpen} onClose={handleClosePanel}>
      <BossDetail boss={panelBoss} locale={resolvedLocale} onViewCraftingItem={onViewCraftingItem} clicks={getClicks(`boss:${panelBoss.id}`)} isFav={isFavorite(panelBoss.id)} onToggleFav={() => toggleFavorite(panelBoss.id)} />
    </DetailPanel>
  );

  const lootSearchBar = (
    <div className="px-3 sm:px-4 pt-3 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-1.5">
        <SearchWithSuggestions
          value={lootInput}
          onChange={setLootInput}
          suggestions={lootSuggestions}
          onSelect={handleLootSelect}
          onSubmit={() => {}}
          onBackspace={lootTags.length > 0 ? () => handleLootRemoveTag(lootTags.length - 1) : undefined}
          onClear={lootTags.length > 0 || lootInput ? () => { setLootTags([]); setLootInput(""); } : undefined}
          showClear={lootTags.length > 0 || lootInput.length > 0}
          placeholder={t(resolvedLocale, "boss_loot_search")}
        />
        {lootTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lootTags.map((tag, i) => (
              <TagChip
                key={tag.itemId}
                label={tag.label}
                icon={tag.image}
                onRemove={() => handleLootRemoveTag(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // -----------------------------------------------------------------------
  // Loot search results view
  // -----------------------------------------------------------------------
  if (lootSearchResults !== null) {
    return (
      <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
        <div className="border-b border-border bg-background/80 px-4 py-2.5">
          <BossBreadcrumb
            locale={resolvedLocale}
            categoryLabel={t(resolvedLocale, "boss_loot_search_result")}
            onHomeClick={handleGoHome}
          />
        </div>

        {lootSearchBar}

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
          <div className="flex flex-col min-h-full">
            {lootSearchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
                {lootSearchResults.map((boss) => (
                  <BossCard
                    key={boss.id}
                    boss={boss}
                    locale={resolvedLocale}
                    onClick={() => { setSelectedBoss(boss); addRecent(boss.id); }}
                    isFav={isFavorite(boss.id)}
                    onToggleFav={() => toggleFavorite(boss.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-12">
                {resolvedLocale === "ko" ? "검색 결과가 없습니다" : "No results found"}
              </div>
            )}
            <Footer />
          </div>
        </div>

        {detailPanel}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Category grid view (home)
  // -----------------------------------------------------------------------
  if (selectedCategory === null) {
    return (
      <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
        <div className="border-b border-border bg-background/80 px-4 py-2.5">
          <BossBreadcrumb locale={resolvedLocale} onHomeClick={handleGoHome} />
        </div>

        {lootSearchBar}

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
          <div className="flex flex-col min-h-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
              {/* Favorites tile */}
              <button
                className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
                onClick={() => setSelectedCategory("favorites" as BossCategoryId)}
              >
                <div className="relative flex items-center justify-center size-12 sm:size-14">
                  <img
                    src={assetPath("/images/ui/health.png")}
                    alt=""
                    className="size-10 sm:size-12 object-contain"
                  />
                  {bossFavCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold bg-surface-hover border border-ring text-foreground/80">
                      {bossFavCount}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
                  {t(resolvedLocale, "favorites")}
                </span>
              </button>
              {/* Recent tile */}
              <button
                className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
                onClick={() => setSelectedCategory("recent" as BossCategoryId)}
              >
                <div className="relative flex items-center justify-center size-12 sm:size-14">
                  <img src={assetPath("/images/game-items/pocketwatch_warp.png")} alt="" className="size-10 sm:size-12 object-contain" draggable={false} />
                  {recentIds.length > 0 && (
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-5 h-5 px-0.5 rounded-full text-[11px] font-bold bg-surface-hover border border-ring text-foreground/80">
                      {recentIds.length}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
                  {t(resolvedLocale, "recent")}
                </span>
              </button>
              {bossCategories.map((cat) => (
                <button
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-surface border border-border p-3 sm:p-4 active:bg-surface-hover hover:bg-surface-hover transition-colors"
                  onClick={() => handleSelectCategory(cat.id)}
                >
                  <img
                    src={assetPath(cat.id === "all" ? ALL_CATEGORY_IMAGE : categoryImage(cat.id))}
                    alt=""
                    className="size-12 sm:size-14 object-contain"
                    draggable={false}
                  />
                  <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
                    {categoryLabel(cat.id, resolvedLocale)}
                  </span>
                </button>
              ))}
            </div>
            <Footer />
          </div>
        </div>

        {detailPanel}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Boss list view
  // -----------------------------------------------------------------------
  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
      <div className="border-b border-border bg-background/80 px-4 py-2.5 flex items-center justify-between gap-2">
        <BossBreadcrumb
          locale={resolvedLocale}
          categoryLabel={selectedCategory === ("favorites" as BossCategoryId) ? t(resolvedLocale, "favorites") : selectedCategory === ("recent" as BossCategoryId) ? t(resolvedLocale, "recent") : categoryLabel(selectedCategory, resolvedLocale)}
          onHomeClick={handleGoHome}
        />
        <SortDropdown
          value={sortByPopular ? "popular" : "default"}
          onChange={(v) => setSortByPopular(v === "popular")}
          locale={resolvedLocale}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="flex flex-col min-h-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
            {filteredBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                locale={resolvedLocale}
                onClick={() => { setSelectedBoss(boss); trackItemClick(`boss:${boss.id}`); addRecent(boss.id); }}
                clicks={sortByPopular ? getClicks(`boss:${boss.id}`) : 0}
                isFav={isFavorite(boss.id)}
                onToggleFav={() => toggleFavorite(boss.id)}
              />
            ))}
          </div>
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function BossBreadcrumb({
  locale,
  categoryLabel: catLabel,
  onHomeClick,
}: {
  locale: Locale;
  categoryLabel?: string;
  onHomeClick: () => void;
}) {
  const iconSrc = assetPath("/images/game-items/deerclops_eyeball.png");
  const isHome = !catLabel;

  return (
    <nav className="flex items-center gap-1 min-w-0 text-sm">
      {isHome ? (
        <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
      ) : (
        <button onClick={onHomeClick} className="shrink-0 rounded-sm hover:opacity-70 transition-opacity">
          <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
        </button>
      )}

      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />

      {isHome ? (
        <span className="font-semibold text-foreground truncate">
          {t(locale, "tab_bosses")}
        </span>
      ) : (
        <>
          <button
            onClick={onHomeClick}
            className="text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            {t(locale, "tab_bosses")}
          </button>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate">{catLabel}</span>
        </>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Boss card (grid item — matches RecipeCard style)
// ---------------------------------------------------------------------------

function BossCard({
  boss,
  locale,
  onClick,
  clicks,
  isFav,
  onToggleFav,
}: {
  boss: Boss;
  locale: Locale;
  onClick: () => void;
  clicks?: number;
  isFav?: boolean;
  onToggleFav?: () => void;
}) {
  const images = Array.isArray(boss.image) ? boss.image : [boss.image];

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover border-border hover:border-ring"
    >
      {onToggleFav && (
        <FavClickBadge isFav={!!isFav} onToggleFav={onToggleFav} clicks={clicks} />
      )}
      <div className="flex items-center justify-center">
        {images.map((img, i) => (
          <img
            key={i}
            src={assetPath(`/images/bosses/${img}`)}
            alt={boss.name}
            className={cn(
              "size-12 sm:size-14 object-contain",
              images.length > 1 && i > 0 && "-ml-3",
              images.length > 1 && "size-10 sm:size-11",
            )}
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>
      <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight line-clamp-2">
        {bossName(boss, locale)}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Boss detail (bottom sheet content)
// ---------------------------------------------------------------------------

function formatSanityAura(perSec: number, locale: Locale): string {
  const perMin = Math.round(perSec * 60);
  return `${perMin}/${locale === "ko" ? "분" : "min"}`;
}

const BOSS_SCRAPBOOK_MAP: Record<string, string> = {
  shadow_chess: "shadow_rook",
  alterguardian_phase3: "alterguardian_phase1",
};

function BossCombatStats({ bossId, locale }: { bossId: string; locale: Locale }) {
  const lookupId = BOSS_SCRAPBOOK_MAP[bossId] ?? bossId;
  const stats = scrapbookStats[lookupId];
  if (!stats) return null;

  const health = stats.health;
  const damage = stats.damage;
  const planar = stats.planardamage;
  const sanity = stats.sanityaura;

  if (!health && !damage) return null;

  const items: { icon: string; label: string; value: string; sub?: string; color: string }[] = [];

  if (health != null) {
    const val = typeof health === "string" ? health : health.toLocaleString();
    items.push({
      icon: "/images/ui/health.png",
      label: locale === "ko" ? "체력" : "Health",
      value: val,
      color: "text-red-500",
    });
  }

  if (damage != null) {
    const val = typeof damage === "string" ? damage : String(Math.floor(damage));
    const sub = planar ? `+${Math.floor(planar)} ${locale === "ko" ? "차원" : "planar"}` : undefined;
    items.push({
      icon: "/images/game-items/spear.png",
      label: locale === "ko" ? "공격력" : "Damage",
      value: val,
      sub,
      color: "text-orange-500",
    });
  }

  if (sanity != null && sanity !== 0) {
    items.push({
      icon: "/images/ui/sanity.png",
      label: locale === "ko" ? "정신력" : "Sanity",
      value: formatSanityAura(sanity, locale),
      color: "text-purple-400",
    });
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          <img src={assetPath(item.icon)} alt="" className="size-4 object-contain" />
          <span className="text-muted-foreground">{item.label}</span>
          <span className={cn("font-semibold tabular-nums", item.color)}>
            {item.value}
            {item.sub && <span className="font-normal text-muted-foreground ml-1">{item.sub}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Shared loot pill renderer */
function renderLootPill(
  loot: import("@/data/bosses").BossLoot,
  key: string,
  locale: Locale,
  onViewCraftingItem?: (itemId: string) => void,
) {
  const displayName = lootDisplayName(loot.item, locale);
  const hasCount = (loot.count ?? 0) > 1;
  const chanceText = !loot.pool && loot.chance < 1 ? ` ${Math.round(loot.chance * 100)}%` : "";
  const craftingId = loot.blueprint ? loot.item.replace(/_blueprint$/, "") : null;
  const isClickable = !!(craftingId && onViewCraftingItem);
  const pill = (
    <span
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full border pl-1.5 pr-2.5 py-1 text-xs font-medium h-7 whitespace-nowrap",
        loot.blueprint
          ? "border-[#3975ce] bg-[#3975ce] text-white dark:border-[#3975ce] dark:bg-[#3975ce] dark:text-white"
          : "border-border bg-surface text-foreground/80",
      )}
    >
      <img
        src={assetPath(loot.blueprint ? "/images/game-items/blueprint.png" : lootImage(loot.item))}
        alt=""
        className="size-4 object-contain shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {displayName}
      {chanceText && <span className="text-amber-500">{chanceText}</span>}
      {hasCount && (
        <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full text-[10px] font-bold bg-surface-hover border border-ring text-foreground/80">
          {loot.count}
        </span>
      )}
    </span>
  );
  return isClickable ? (
    <button
      key={key}
      onClick={() => onViewCraftingItem!(craftingId!)}
      className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
    >
      {pill}
      <span className="w-3/4 border-b-2 border-dotted border-[#3975ce]/60 mt-0.5" />
    </button>
  ) : (
    <span key={key}>{pill}</span>
  );
}

/** Groups items into pool/non-pool groups and renders them */
function PoolGroupedItems({ items, keyPrefix, locale, onViewCraftingItem }: {
  items: import("@/data/bosses").BossLoot[];
  keyPrefix: string;
  locale: Locale;
  onViewCraftingItem?: (itemId: string) => void;
}) {
  const groups: { pool: string | null; items: import("@/data/bosses").BossLoot[] }[] = [];
  const poolMap = new Map<string, import("@/data/bosses").BossLoot[]>();

  for (const loot of items) {
    if (loot.pool) {
      if (!poolMap.has(loot.pool)) {
        poolMap.set(loot.pool, []);
        groups.push({ pool: loot.pool, items: poolMap.get(loot.pool)! });
      }
      poolMap.get(loot.pool)!.push(loot);
    } else {
      groups.push({ pool: null, items: [loot] });
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-start">
      {groups.map((group, gi) => {
        if (!group.pool) {
          return renderLootPill(group.items[0], `${keyPrefix}-${gi}`, locale, onViewCraftingItem);
        }
        // Pool metadata from first item that has it
        const poolCount = group.items.find(i => i.poolCount)?.poolCount ?? 1;
        const poolChance = group.items.find(i => i.poolChance)?.poolChance ?? 1;
        const chancePart = poolChance < 1 ? `${Math.round(poolChance * 100)}% ` : "";
        const countWord = locale === "ko" ? `${poolCount}개` : `×${poolCount}`;
        const poolLabel = locale === "ko"
          ? `${chancePart}랜덤 ${countWord}`
          : `${chancePart}random ${countWord}`;
        return (
          <div
            key={`pool-${group.pool}`}
            className="flex flex-wrap items-center gap-1 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 px-1.5 py-1"
          >
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mr-0.5 whitespace-nowrap">
              {poolLabel}
            </span>
            {group.items.map((loot, li) => renderLootPill(loot, `${keyPrefix}-${gi}-${li}`, locale, onViewCraftingItem))}
          </div>
        );
      })}
    </div>
  );
}

/** Renders flat stash loot items with pool grouping */
function StashLootItems({ items, locale, onViewCraftingItem }: {
  items: import("@/data/bosses").BossLoot[];
  locale: Locale;
  onViewCraftingItem?: (itemId: string) => void;
}) {
  return <PoolGroupedItems items={items} keyPrefix="stash" locale={locale} onViewCraftingItem={onViewCraftingItem} />;
}

/** Renders bundled stash loot (e.g., Klaus Loot Stash) */
function StashBundleLoot({ bundles, locale, onViewCraftingItem }: {
  bundles: import("@/data/bosses").StashBundle[];
  locale: Locale;
  onViewCraftingItem?: (itemId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {bundles.map((bundle, bi) => (
        <div key={bi} className="rounded-lg border border-border/60 bg-surface/50 px-3 py-2 space-y-1.5">
          <span className="text-xs font-semibold text-foreground/70">
            {locale === "ko" ? bundle.label : bundle.labelEn}
          </span>
          <PoolGroupedItems items={bundle.items} keyPrefix={`bundle-${bi}`} locale={locale} onViewCraftingItem={onViewCraftingItem} />
        </div>
      ))}
    </div>
  );
}

function BossDetail({
  boss,
  locale,
  onViewCraftingItem,
  clicks,
  isFav,
  onToggleFav,
}: {
  boss: Boss;
  locale: Locale;
  onViewCraftingItem?: (itemId: string) => void;
  clicks: number;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const localName = bossName(boss, locale);
  const showAltName = locale !== "en" && localName !== boss.name;
  const images = Array.isArray(boss.image) ? boss.image : [boss.image];

  return (
    <div className="p-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center shrink-0">
          {images.map((img, i) => (
            <img
              key={i}
              src={assetPath(`/images/bosses/${img}`)}
              alt={boss.name}
              className={cn(
                "size-16 object-contain",
                images.length > 1 && i > 0 && "-ml-4",
                images.length > 1 && "size-14",
              )}
            />
          ))}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold">{localName}</h3>
            <button onClick={onToggleFav} className="shrink-0 p-0.5" aria-label="favorite">
              <img src={assetPath("/images/ui/health.png")} alt="" className={cn("size-4", !isFav && "opacity-30 grayscale")} />
            </button>
          </div>
          {showAltName && (
            <p className="text-sm text-muted-foreground">{boss.name}</p>
          )}
          <div className="flex items-center gap-1.5">
            <PrefabIdButton id={boss.id} locale={locale} />
            <ViewCount clicks={clicks} />
          </div>
          <div className="mt-1">
            <TagChip
              label={categoryLabel(boss.category, locale)}
              icon={`bosses/${Array.isArray(boss.image) ? boss.image[0] : boss.image}`}
            />
          </div>
        </div>
      </div>

      {/* Combat Stats */}
      <BossCombatStats bossId={boss.id} locale={locale} />

      {/* Loot */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          {t(locale, "boss_loot")}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {boss.loot.map((loot, i) => {
            const prevLabel = i > 0 ? boss.loot[i - 1].label : undefined;
            const showLabel = !!loot.label && loot.label !== prevLabel;
            const displayName = lootDisplayName(loot.item, locale);
            const hasCount = (loot.count ?? 0) > 1;
            const chanceText = loot.chance < 1 ? ` ${Math.round(loot.chance * 100)}%` : "";
            const craftingId = loot.blueprint ? loot.item.replace(/_blueprint$/, "") : null;
            const isClickable = !!(craftingId && onViewCraftingItem);
            const pill = (
              <span
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-full border pl-1.5 pr-2.5 py-1 text-xs font-medium h-7 whitespace-nowrap",
                  loot.blueprint
                    ? "border-[#3975ce] bg-[#3975ce] text-white dark:border-[#3975ce] dark:bg-[#3975ce] dark:text-white"
                    : "border-border bg-surface text-foreground/80",
                )}
              >
                <img
                  src={assetPath(loot.blueprint ? "/images/game-items/blueprint.png" : lootImage(loot.item))}
                  alt=""
                  className="size-4 object-contain shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {displayName}
                {chanceText && <span className="text-amber-500">{chanceText}</span>}
                {hasCount && (
                  <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full text-[10px] font-bold bg-surface-hover border border-ring text-foreground/80">
                    {loot.count}
                  </span>
                )}
              </span>
            );
            return (
              <React.Fragment key={i}>
                {showLabel && (
                  <span className="basis-full text-[11px] text-muted-foreground font-medium mt-1 first:mt-0">
                    {loot.label}
                  </span>
                )}
                {isClickable ? (
                  <button
                    onClick={() => onViewCraftingItem!(craftingId!)}
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {pill}
                    <span className="w-3/4 border-b-2 border-dotted border-[#3975ce]/60 mt-0.5" />
                  </button>
                ) : (
                  <span>{pill}</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stash Loot (e.g., Klaus Loot Stash) */}
      {boss.stashLoot && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              {locale === "ko" ? boss.stashLoot.label : boss.stashLoot.labelEn}
            </h4>
            <img
              src={assetPath(`/images/game-items/${boss.stashLoot.icon}`)}
              alt=""
              className="size-4 object-contain"
            />
          </div>
          <p className="text-xs text-muted-foreground/80">
            {locale === "ko" ? boss.stashLoot.note : boss.stashLoot.noteEn}
          </p>
          {boss.stashLoot.bundles
            ? <StashBundleLoot bundles={boss.stashLoot.bundles} locale={locale} onViewCraftingItem={onViewCraftingItem} />
            : boss.stashLoot.items && <StashLootItems items={boss.stashLoot.items} locale={locale} onViewCraftingItem={onViewCraftingItem} />
          }
        </div>
      )}
    </div>
  );
}
