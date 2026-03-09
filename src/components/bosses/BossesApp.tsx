"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight, X } from "lucide-react";
import { bosses, bossCategories, lootImage, lootDisplayName, lootNameKo, type Boss, type BossCategoryId } from "@/data/bosses";
import { SearchWithSuggestions, type SearchSuggestion } from "@/components/ui/SearchWithSuggestions";
import { useSettings } from "@/hooks/use-settings";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { Footer } from "../crafting/Footer";
import { TagChip } from "@/components/ui/TagChip";

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
    for (const loot of boss.loot) {
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

  const [selectedCategory, setSelectedCategory] = useState<BossCategoryId | null>(null);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);

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
    return bosses.filter((boss) =>
      boss.loot.some((loot) => tagItemIds.has(loot.item))
    );
  }, [lootTags]);

  // Slide animation
  const [slideDir, setSlideDir] = useState<"right" | "left" | null>(null);
  const prevCat = useRef<BossCategoryId | null>(null);

  useEffect(() => {
    if (prevCat.current !== selectedCategory) {
      setSlideDir(selectedCategory === null ? "left" : "right");
      prevCat.current = selectedCategory;
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!slideDir) return;
    const timer = setTimeout(() => setSlideDir(null), 260);
    return () => clearTimeout(timer);
  }, [slideDir]);

  const slideClass =
    slideDir === "right" ? "animate-slide-right" : slideDir === "left" ? "animate-slide-left" : "";

  // Detail panel animation
  const [panelBoss, setPanelBoss] = useState<Boss | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (selectedBoss) {
      setPanelBoss(selectedBoss);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpen(true));
      });
    } else {
      setPanelOpen(false);
      const timer = setTimeout(() => setPanelBoss(null), 180);
      return () => clearTimeout(timer);
    }
  }, [selectedBoss]);

  const handleGoHome = useCallback(() => {
    setSelectedCategory(null);
    setSelectedBoss(null);
    setLootInput("");
    setLootTags([]);
  }, []);

  const handleSelectCategory = useCallback((id: BossCategoryId) => {
    setSelectedCategory(id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedBoss(null);
  }, []);

  const filteredBosses = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return bosses;
    return bosses.filter((b) => b.category === selectedCategory);
  }, [selectedCategory]);

  // Detail panel
  const detailPanel = panelBoss && (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-180",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClosePanel}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card max-h-[80dvh] overflow-y-auto overscroll-contain transition-transform duration-180 ease-out",
          panelOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <button
          onClick={handleClosePanel}
          className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
        <BossDetail boss={panelBoss} locale={resolvedLocale} onViewCraftingItem={onViewCraftingItem} />
      </div>
    </>
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

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="flex flex-col min-h-full">
            {lootSearchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
                {lootSearchResults.map((boss) => (
                  <BossCard
                    key={boss.id}
                    boss={boss}
                    locale={resolvedLocale}
                    onClick={() => setSelectedBoss(boss)}
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

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="flex flex-col min-h-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
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
      <div className="border-b border-border bg-background/80 px-4 py-2.5">
        <BossBreadcrumb
          locale={resolvedLocale}
          categoryLabel={categoryLabel(selectedCategory, resolvedLocale)}
          onHomeClick={handleGoHome}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col min-h-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
            {filteredBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                locale={resolvedLocale}
                onClick={() => setSelectedBoss(boss)}
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
}: {
  boss: Boss;
  locale: Locale;
  onClick: () => void;
}) {
  const images = Array.isArray(boss.image) ? boss.image : [boss.image];

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover border-border hover:border-ring"
    >
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

function BossDetail({
  boss,
  locale,
  onViewCraftingItem,
}: {
  boss: Boss;
  locale: Locale;
  onViewCraftingItem?: (itemId: string) => void;
}) {
  const localName = bossName(boss, locale);
  const showAltName = locale !== "en" && localName !== boss.name;
  const images = Array.isArray(boss.image) ? boss.image : [boss.image];

  return (
    <div className="p-4 pt-3 pb-8 space-y-4">
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
          <h3 className="text-base font-semibold">{localName}</h3>
          {showAltName && (
            <p className="text-sm text-muted-foreground">{boss.name}</p>
          )}
          <div className="mt-1">
            <TagChip
              label={categoryLabel(boss.category, locale)}
              icon={`bosses/${Array.isArray(boss.image) ? boss.image[0] : boss.image}`}
            />
          </div>
        </div>
      </div>

      {/* Loot */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          {t(locale, "boss_loot")}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {boss.loot.map((loot, i) => {
            const displayName = lootDisplayName(loot.item, locale);
            const hasCount = (loot.count ?? 0) > 1;
            const chanceText = loot.chance < 1 ? ` ${Math.round(loot.chance * 100)}%` : "";
            const craftingId = loot.blueprint ? loot.item.replace(/_blueprint$/, "") : null;
            const isClickable = !!(craftingId && onViewCraftingItem);
            const pill = (
              <span
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-full border pl-1.5 pr-2.5 py-1 text-xs font-medium h-7",
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
                key={i}
                onClick={() => onViewCraftingItem!(craftingId!)}
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                {pill}
                <span className="w-3/4 border-b-2 border-dotted border-[#3975ce]/60 mt-0.5" />
              </button>
            ) : (
              <span key={i}>{pill}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
