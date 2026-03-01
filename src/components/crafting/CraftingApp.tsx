"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { getItemsByCategory, getCharacterItems, getCategoryById, getCharacterById, getItemById, stationImages } from "@/lib/crafting-data";
import { useCraftingState } from "@/hooks/use-crafting-state";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { t, itemName, categoryName } from "@/lib/i18n";
import type { CategoryId } from "@/lib/types";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryHeader } from "./CategoryHeader";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import { CharacterSelector } from "./CharacterSelector";
import { Footer } from "./Footer";
import { X } from "lucide-react";
import { trackVisit, initDurationTracking, trackEvent } from "@/lib/analytics";

export function CraftingApp() {
  const {
    selectedCategory,
    selectedItem,
    selectedCharacter,
    showCategoryGrid,
    setCategory,
    setItem,
    setCharacter,
    goBack,
    goHome,
    goToCategory,
    navigateToItem,
    jumpToCategory,
    jumpToCharacter,
  } = useCraftingState();

  const { resolvedLocale } = useSettings();
  const { isAdmin } = useAuth();
  const { favorites } = useFavorites();

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

  const handleSelectCategory = useCallback((id: CategoryId | "favorites") => {
    setCategory(id as CategoryId);
  }, [setCategory]);

  // Track visit + duration + PWA install on first load
  useEffect(() => {
    trackVisit(isAdmin);
    initDurationTracking(isAdmin);

    const handlePWA = () => trackEvent("pwa_install", isAdmin);
    window.addEventListener("appinstalled", handlePWA);
    return () => window.removeEventListener("appinstalled", handlePWA);
  }, [isAdmin]);

  // --- Slide transition ---
  const [slideDir, setSlideDir] = useState<"right" | "left" | null>(null);
  const prevGrid = useRef(showCategoryGrid);

  // Detect view change and apply animation
  useEffect(() => {
    if (prevGrid.current !== showCategoryGrid) {
      setSlideDir(showCategoryGrid ? "left" : "right");
      prevGrid.current = showCategoryGrid;
    }
  }, [showCategoryGrid]);

  // Clear animation class after it finishes
  useEffect(() => {
    if (!slideDir) return;
    const timer = setTimeout(() => setSlideDir(null), 260);
    return () => clearTimeout(timer);
  }, [slideDir]);

  const slideClass = slideDir === "right" ? "animate-slide-right" : slideDir === "left" ? "animate-slide-left" : "";

  // --- Detail panel animation ---
  const [panelItem, setPanelItem] = useState<typeof selectedItem>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setPanelItem(selectedItem);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpen(true));
      });
    } else {
      setPanelOpen(false);
      const timer = setTimeout(() => setPanelItem(null), 180);
      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  // Sync theme-color with overlay (iPhone Dynamic Island)
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const isDark = document.documentElement.classList.contains("dark");
    if (panelOpen) {
      meta.setAttribute("content", isDark ? "#050506" : "#7d7d7d");
    } else {
      meta.setAttribute("content", isDark ? "#09090b" : "#fafafa");
    }
  }, [panelOpen]);

  const handleGoHome = useCallback(() => {
    clearSearch();
    goHome();
  }, [clearSearch, goHome]);

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

  const categoryItems = useMemo(() => {
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

  const displayItems = isSearching ? searchResults : categoryItems;

  const detailPanel = panelItem && (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-180 ${panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setItem(null)}
      />
      <div className={`fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card max-h-[80dvh] overflow-y-auto overscroll-contain transition-transform duration-180 ease-out ${panelOpen ? "translate-y-0" : "translate-y-full"}`}>
        <button onClick={() => setItem(null)} className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-4" />
        </button>
        <ItemDetail item={panelItem} onMaterialClick={navigateToItem} onCategoryClick={handleCategoryClick} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} />
      </div>
    </>
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
          </div>
          {searchBar}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="flex flex-col min-h-full">
            {isSearching ? (
              <ItemGrid
                items={searchResults}
                selectedItem={selectedItem}
                onSelectItem={setItem}
              />
            ) : (
              <CategoryGrid
                categories={categories}
                favCount={craftingFavCount}
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
        customLabel={(selectedCategory as string) === "favorites" ? t(resolvedLocale, "favorites") : undefined}
        onHomeClick={handleGoHome}
        onCategoryClick={selectedCharacter ? goToCategory : undefined}
      />

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col min-h-full">
          {/* Character selector (only when no character selected yet) */}
          {selectedCategory === "character" && !selectedCharacter && !isSearching ? (
            <CharacterSelector
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setCharacter}
            />
          ) : (
            /* Item grid */
            <ItemGrid
              items={displayItems}
              selectedItem={selectedItem}
              onSelectItem={setItem}
            />
          )}
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}
