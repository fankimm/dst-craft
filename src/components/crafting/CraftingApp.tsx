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
import { trackVisit, initDurationTracking, trackEvent, trackItemClick } from "@/lib/analytics";
import { usePopularity } from "@/hooks/use-popularity";
import { ArrowUpDown } from "lucide-react";
import { SupportPill } from "@/components/ui/SupportPill";
import { useRecent } from "@/hooks/use-recent";

export function CraftingApp({
  pendingItemId,
  onClearPendingItem,
  onBlueprintClick,
}: {
  pendingItemId?: string | null;
  onClearPendingItem?: () => void;
  onBlueprintClick?: (itemId: string) => void;
}) {
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

  // theme-color is always #000000 — no overlay sync needed

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
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-180 ${panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setItem(null)}
      />
      <div className={`fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card max-h-[80dvh] overflow-y-auto overscroll-contain transition-transform duration-180 ease-out ${panelOpen ? "translate-y-0" : "translate-y-full"}`}>
        <button onClick={() => setItem(null)} className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-4" />
        </button>
        <ItemDetail item={panelItem} onMaterialClick={navigateToItem} onCategoryClick={handleCategoryClick} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} onBlueprintClick={onBlueprintClick} />
        <SupportPill />
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
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
            />
          )}
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort dropdown
// ---------------------------------------------------------------------------

function SortDropdown({ value, onChange, locale }: {
  value: "default" | "popular";
  onChange: (v: "default" | "popular") => void;
  locale: import("@/lib/i18n").Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const options = [
    { key: "default" as const, label: t(locale, "sort_default") },
    { key: "popular" as const, label: t(locale, "sort_popular") },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
          value === "popular"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <ArrowUpDown className="size-3.5" />
        {options.find((o) => o.key === value)!.label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[100px] rounded-md border border-border bg-popover shadow-md py-1">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                value === opt.key
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-popover-foreground hover:bg-accent/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
