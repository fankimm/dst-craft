"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { getItemsByCategory, getCharacterItems, getCategoryById, getCharacterById, getItemById, stationImages } from "@/lib/crafting-data";
import { useCraftingState } from "@/hooks/use-crafting-state";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { t, categoryName } from "@/lib/i18n";
import type { CategoryId } from "@/lib/types";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryHeader } from "./CategoryHeader";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import { CharacterSelector } from "./CharacterSelector";
import { Footer } from "./Footer";
import { trackVisit, initDurationTracking, trackEvent, trackItemClick } from "@/lib/analytics";
import { usePopularity } from "@/hooks/use-popularity";
import { useRecent } from "@/hooks/use-recent";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { SortDropdown } from "@/components/ui/SortDropdown";

const isHome = (v: boolean) => v;

export function CraftingApp({
  pendingItemId,
  onClearPendingItem,
  onBlueprintClick,
  onSkillClick,
}: {
  pendingItemId?: string | null;
  onClearPendingItem?: () => void;
  onBlueprintClick?: (itemId: string) => void;
  onSkillClick?: (skillId: string) => void;
}) {
  const {
    selectedCategory,
    selectedItem,
    selectedCharacter,
    showCategoryGrid,
    setCategory,
    setItem,
    setCharacter,
    goHome,
    goToCategory,
    navigateToItem,
    jumpToCharacter,
  } = useCraftingState();

  const { resolvedLocale } = useSettings();
  const { isAdmin } = useAuth();
  const { favorites } = useFavorites();
  const { recentIds, addRecent } = useRecent("crafting");

  // External navigation (e.g. boss → crafting item)
  useEffect(() => {
    if (!pendingItemId) return;
    const item = getItemById(pendingItemId);
    if (item) navigateToItem(item);
    onClearPendingItem?.();
  }, [pendingItemId, navigateToItem, onClearPendingItem]);

  const { getClicks } = usePopularity();
  const [sortByPopular, setSortByPopular] = useState(false);

  const craftingFavCount = useMemo(
    () => [...favorites].filter((id) => getItemById(id)).length,
    [favorites],
  );

  const {
    tags: searchTags,
    inputValue: searchInput,
    setInputValue: setSearchInput,
    addTag: addSearchTag,
    removeTag: removeSearchTag,
    clearAll: clearSearch,
    results: searchResults,
    isSearching,
  } = useSearch();

  const handleSelectItem = useCallback((item: import("@/lib/types").CraftingItem) => {
    setItem(item);
    trackItemClick(item.id);
    addRecent(item.id);
  }, [setItem, addRecent]);

  const handleSelectCategory = useCallback((id: CategoryId | "favorites" | "recent") => {
    setSortByPopular(false);
    if (id === "recent") {
      setCategory("recent" as CategoryId);
    } else {
      setCategory(id as CategoryId);
      if (id !== "favorites") trackItemClick(`cat:${id}`);
    }
  }, [setCategory]);

  const handleSelectCharacter = useCallback((characterId: string | null) => {
    setSortByPopular(false);
    setCharacter(characterId);
    if (characterId && characterId !== "all") trackItemClick(`char:${characterId}`);
  }, [setCharacter]);

  // Track visit + duration + PWA install on first load
  useEffect(() => {
    trackVisit(isAdmin);
    initDurationTracking(isAdmin);

    const handlePWA = () => trackEvent("pwa_install", isAdmin);
    window.addEventListener("appinstalled", handlePWA);
    return () => window.removeEventListener("appinstalled", handlePWA);
  }, [isAdmin]);

  const slideClass = useSlideAnimation(showCategoryGrid, isHome);
  const { panelItem, panelOpen } = useDetailPanel(selectedItem);

  const handleGoHome = useCallback(() => {
    clearSearch();
    goHome();
  }, [clearSearch, goHome]);

  // Re-tap active tab → go home
  useEffect(() => {
    const handler = () => handleGoHome();
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, [handleGoHome]);

  useEffect(() => {
    document.querySelector("[data-scroll-container]")?.scrollTo(0, 0);
  }, [selectedCategory, selectedCharacter]);

  const handleStationClick = useCallback((stationLabel: string, station?: string) => {
    const image = station ? (stationImages[station as keyof typeof stationImages] ?? undefined) : undefined;
    addSearchTag({ text: stationLabel, type: "station", image });
    setItem(null);
  }, [addSearchTag, setItem]);

  const handleCategoryClick = useCallback((catId: CategoryId) => {
    const cat = getCategoryById(catId);
    if (!cat) return;
    const label = categoryName(cat, resolvedLocale);
    addSearchTag({ text: label, type: "category", image: `category-icons/${catId}.png` });
    setItem(null);
  }, [addSearchTag, setItem, resolvedLocale]);

  const currentCategory = getCategoryById(selectedCategory);
  const currentCharacter = selectedCharacter ? getCharacterById(selectedCharacter) : null;

  const recentItems = useMemo(
    () => recentIds.map((id) => getItemById(id)).filter((item): item is NonNullable<typeof item> => !!item),
    [recentIds],
  );

  const categoryItems = useMemo(() => {
    if ((selectedCategory as string) === "recent") {
      return recentItems;
    }
    if ((selectedCategory as string) === "favorites") {
      return [...favorites]
        .map((id) => getItemById(id))
        .filter((item): item is NonNullable<typeof item> => !!item);
    }
    if (selectedCategory === "character") {
      if (selectedCharacter === "all") {
        return getItemsByCategory("character");
      }
      if (selectedCharacter) {
        return getCharacterItems(selectedCharacter);
      }
      return []; // No character selected yet - show picker only
    }
    return getItemsByCategory(selectedCategory);
  }, [selectedCategory, selectedCharacter, favorites]);

  const sortedCategoryItems = useMemo(() => {
    if (!sortByPopular) return categoryItems;
    return [...categoryItems].sort((a, b) => getClicks(b.id) - getClicks(a.id));
  }, [categoryItems, sortByPopular, getClicks]);

  const displayItems = isSearching ? searchResults : sortedCategoryItems;

  const detailPanel = panelItem && (
    <DetailPanel open={panelOpen} onClose={() => setItem(null)}>
      <ItemDetail item={panelItem} onMaterialClick={navigateToItem} onCategoryClick={handleCategoryClick} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} onBlueprintClick={onBlueprintClick} onSkillClick={onSkillClick} />
    </DetailPanel>
  );

  const searchBar = (
    <SearchBar
      inputValue={searchInput}
      tags={searchTags}
      onInputChange={setSearchInput}
      onAddTag={addSearchTag}
      onRemoveTag={removeSearchTag}
      onClearAll={clearSearch}
    />
  );

  // Category grid view (initial state - no category selected)
  if (showCategoryGrid) {
    return (
      <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
        <div className="border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {isSearching ? (
                <Breadcrumb
                  isSearching
                  searchLabel={t(resolvedLocale, "searchResults")}
                  onHomeClick={handleGoHome}
                />
              ) : (
                <Breadcrumb onHomeClick={handleGoHome} />
              )}
            </div>
            {!isSearching && (
              <SortDropdown
                value={sortByPopular ? "popular" : "default"}
                onChange={(v) => setSortByPopular(v === "popular")}
                locale={resolvedLocale}
              />
            )}
          </div>
          {searchBar}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
          <div className="flex flex-col min-h-full">
            {isSearching ? (
              <ItemGrid
                items={searchResults}
                selectedItem={selectedItem}
                onSelectItem={handleSelectItem}
              />
            ) : (
              <CategoryGrid
                categories={categories}
                favCount={craftingFavCount}
                recentCount={recentIds.length}
                sortByPopular={sortByPopular}
                getClicks={getClicks}
                onSelectCategory={handleSelectCategory}
              />
            )}
            <Footer />
          </div>
        </div>

        {detailPanel}
      </div>
    );
  }

  // Item list view (after category selection or searching)
  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
      {/* Header */}
      <CategoryHeader
        category={isSearching ? undefined : currentCategory}
        character={currentCharacter}
        characterId={selectedCharacter}
        searchBar={searchBar}
        isSearching={isSearching}
        customLabel={(selectedCategory as string) === "favorites" ? t(resolvedLocale, "favorites") : (selectedCategory as string) === "recent" ? t(resolvedLocale, "recent") : undefined}
        onHomeClick={handleGoHome}
        onCategoryClick={selectedCharacter ? goToCategory : undefined}
        actions={!isSearching ? (
          <SortDropdown
            value={sortByPopular ? "popular" : "default"}
            onChange={(v) => setSortByPopular(v === "popular")}
            locale={resolvedLocale}
          />
        ) : undefined}
      />

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="flex flex-col min-h-full">
          {/* Character selector (only when no character selected yet) */}
          {selectedCategory === "character" && !selectedCharacter && !isSearching ? (
            <CharacterSelector
              characters={characters}
              selectedCharacter={selectedCharacter}
              sortByPopular={sortByPopular}
              getClicks={getClicks}
              onSelectCharacter={handleSelectCharacter}
            />
          ) : (
            /* Item grid */
            <ItemGrid
              items={displayItems}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              getClicks={sortByPopular ? getClicks : undefined}
            />
          )}
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}
