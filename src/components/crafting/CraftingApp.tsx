"use client";

import { useMemo, useCallback } from "react";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { getItemsByCategory, getCharacterItems, getCategoryById, getCharacterById, stationImages } from "@/lib/crafting-data";
import { useCraftingState } from "@/hooks/use-crafting-state";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { t, itemName } from "@/lib/i18n";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryHeader } from "./CategoryHeader";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import { CharacterSelector } from "./CharacterSelector";
import { SettingsButton } from "./SettingsButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

  const handleStationClick = useCallback((stationLabel: string, station?: string) => {
    const image = station ? (stationImages[station as keyof typeof stationImages] ?? undefined) : undefined;
    addSearchTag({ text: stationLabel, type: "station", image });
    setItem(null);
  }, [addSearchTag, setItem]);

  const currentCategory = getCategoryById(selectedCategory);
  const currentCharacter = selectedCharacter ? getCharacterById(selectedCharacter) : null;

  const categoryItems = useMemo(() => {
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
  }, [selectedCategory, selectedCharacter]);

  const displayItems = isSearching ? searchResults : categoryItems;

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
      <div className="flex flex-col h-dvh bg-background text-foreground overflow-hidden">
        <div className="border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {isSearching ? (
                <Breadcrumb
                  isSearching
                  searchLabel={t(resolvedLocale, "searchResults")}
                  onHomeClick={goHome}
                />
              ) : (
                <Breadcrumb onHomeClick={goHome} />
              )}
            </div>
            <SettingsButton />
          </div>
          {searchBar}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {isSearching ? (
            <ItemGrid
              items={searchResults}
              selectedItem={selectedItem}
              onSelectItem={setItem}
            />
          ) : (
            <CategoryGrid
              categories={categories}
              onSelectCategory={setCategory}
            />
          )}
        </div>

        {/* Desktop: fixed bottom detail panel (for search results) */}
        {isSearching && selectedItem && (
          <div className="hidden sm:block border-t border-border bg-card/80 shrink-0">
            <ItemDetail item={selectedItem} onMaterialClick={navigateToItem} onCategoryClick={jumpToCategory} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} />
          </div>
        )}

        {/* Mobile: bottom sheet for item detail (for search results) */}
        {isSearching && (
          <Sheet
            open={selectedItem !== null}
            onOpenChange={(open) => {
              if (!open) setItem(null);
            }}
          >
            <SheetContent side="bottom" className="sm:hidden max-h-[80dvh] rounded-t-xl">
              <SheetHeader className="p-0 shrink-0">
                <SheetTitle className="sr-only">
                  {selectedItem
                    ? itemName(selectedItem, resolvedLocale)
                    : t(resolvedLocale, "itemDetail")}
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <ItemDetail item={selectedItem} onMaterialClick={navigateToItem} onCategoryClick={jumpToCategory} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    );
  }

  // Item list view (after category selection or searching)
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground overflow-hidden">
      {/* Header */}
      <CategoryHeader
        category={isSearching ? undefined : currentCategory}
        character={currentCharacter}
        characterId={selectedCharacter}
        searchBar={searchBar}
        isSearching={isSearching}
        onHomeClick={goHome}
        onCategoryClick={selectedCharacter ? goToCategory : undefined}
      />

      {/* Mobile search bar */}
      <div className="sm:hidden px-3 py-2 border-b border-border bg-background shrink-0">
        {searchBar}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
      </div>

      {/* Desktop: fixed bottom detail panel */}
      {selectedItem && (
        <div className="hidden sm:block border-t border-border bg-card/80 shrink-0">
          <ItemDetail item={selectedItem} onMaterialClick={navigateToItem} onCategoryClick={jumpToCategory} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} />
        </div>
      )}

      {/* Mobile: bottom sheet for item detail */}
      <Sheet
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open) setItem(null);
        }}
      >
        <SheetContent side="bottom" className="sm:hidden max-h-[80dvh] rounded-t-xl">
          <SheetHeader className="p-0 shrink-0">
            <SheetTitle className="sr-only">
              {selectedItem
                ? itemName(selectedItem, resolvedLocale)
                : t(resolvedLocale, "itemDetail")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <ItemDetail item={selectedItem} onMaterialClick={navigateToItem} onCategoryClick={jumpToCategory} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
