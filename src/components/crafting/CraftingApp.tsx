"use client";

import { useMemo } from "react";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { getItemsByCategory, getCharacterItems } from "@/lib/crafting-data";
import { getCategoryById } from "@/lib/crafting-data";
import { useCraftingState } from "@/hooks/use-crafting-state";
import { useSearch } from "@/hooks/use-search";
import { CategorySidebar } from "./CategorySidebar";
import { CategoryHeader } from "./CategoryHeader";
import { SearchBar } from "./SearchBar";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import { CharacterSelector } from "./CharacterSelector";
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
    searchQuery,
    isSearching,
    setCategory,
    setItem,
    setCharacter,
    setSearchQuery,
    clearSearch,
  } = useCraftingState();

  const { results: searchResults } = useSearch(searchQuery);

  const currentCategory = getCategoryById(selectedCategory);

  const categoryItems = useMemo(() => {
    if (selectedCategory === "character") {
      if (selectedCharacter) {
        return getCharacterItems(selectedCharacter);
      }
      // When "character" category is selected and no specific character,
      // show all character-only items
      return getItemsByCategory("character");
    }
    return getItemsByCategory(selectedCategory);
  }, [selectedCategory, selectedCharacter]);

  const displayItems = isSearching ? searchResults : categoryItems;

  const searchBar = (
    <SearchBar
      value={searchQuery}
      onChange={setSearchQuery}
      onClear={clearSearch}
    />
  );

  return (
    <div className="flex flex-col sm:flex-row h-dvh bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Category sidebar */}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setCategory}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Header */}
        <CategoryHeader
          category={isSearching ? undefined : currentCategory}
          searchBar={searchBar}
        />

        {/* Mobile search bar */}
        <div className="sm:hidden px-3 py-2 border-b border-zinc-800 bg-zinc-950">
          {searchBar}
        </div>

        {/* Character selector (when character category selected and not searching) */}
        {selectedCategory === "character" && !isSearching && (
          <CharacterSelector
            characters={characters}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setCharacter}
          />
        )}

        {/* Item grid */}
        <ItemGrid
          items={displayItems}
          selectedItem={selectedItem}
          onSelectItem={setItem}
          className="flex-1 min-h-0"
        />

        {/* Desktop: fixed bottom detail panel */}
        {selectedItem && (
          <div className="hidden sm:block border-t border-zinc-800 bg-zinc-900/80 shrink-0">
            <ItemDetail item={selectedItem} />
          </div>
        )}

        {/* Mobile: bottom sheet for item detail */}
        <Sheet
          open={selectedItem !== null}
          onOpenChange={(open) => {
            if (!open) setItem(null);
          }}
        >
          <SheetContent side="bottom" className="sm:hidden max-h-[60dvh] rounded-t-xl">
            <SheetHeader className="pb-0">
              <SheetTitle className="sr-only">
                {selectedItem?.nameKo ?? "아이템 상세"}
              </SheetTitle>
            </SheetHeader>
            <ItemDetail item={selectedItem} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
