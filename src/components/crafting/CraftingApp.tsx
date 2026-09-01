"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { categories } from "@/data/categories";
import { characters } from "@/data/characters";
import { getItemsByCategory, getCharacterItems, getCategoryById, getCharacterById, getItemById, getMaterialById, stationImages } from "@/lib/crafting-data";
import { useCraftingState } from "@/hooks/use-crafting-state";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { t, categoryName, itemName, materialName } from "@/lib/i18n";
import type { CategoryId } from "@/lib/types";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryHeader } from "./CategoryHeader";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";
import { CharacterSelector } from "./CharacterSelector";
import { Footer } from "./Footer";
import { trackEvent, trackItemClick } from "@/lib/analytics";
import { usePopularity } from "@/hooks/use-popularity";
import { useRecent } from "@/hooks/use-recent";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { SortDropdown } from "@/components/ui/SortDropdown";
import { AdSlot } from "@/components/ads/AdSlot";

const isHome = (v: boolean) => v;

export function CraftingApp({
  pendingItemId,
  onClearPendingItem,
  onBlueprintClick,
  onSkillClick,
  externalBackLabel,
  onExternalBack,
  onPanelClose,
}: {
  pendingItemId?: string | null;
  onClearPendingItem?: () => void;
  onBlueprintClick?: (itemId: string) => void;
  onSkillClick?: (skillId: string) => void;
  /** 외부 탭에서 진입했을 때 DetailPanel에 "← <label>" 빠른 뒤로 버튼 표시 */
  externalBackLabel?: string | null;
  /** 외부 뒤로 버튼 클릭 핸들러 (해당 원래 탭으로 복귀) */
  onExternalBack?: () => void;
  /** 사용자가 X로 패널을 닫았을 때 — 외부 back 라벨 정리용 */
  onPanelClose?: () => void;
}) {
  const {
    selectedCategory,
    selectedItem,
    selectedCharacter,
    showCategoryGrid,
    previousItem,
    setCategory,
    setItem,
    setCharacter,
    goHome,
    goToCategory,
    navigateToItem,
    goBackToItem,
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

  useEffect(() => {
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
    addSearchTag({ text: label, type: "category", image: `category-icons/${catId}.webp` });
    setItem(null);
  }, [addSearchTag, setItem, resolvedLocale]);

  const handleMaterialClick = useCallback((materialId: string) => {
    const mat = getMaterialById(materialId);
    if (!mat) return;
    addSearchTag({
      text: materialName(mat, resolvedLocale),
      type: "material",
      image: `game-items/${mat.image}`,
    });
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
    <DetailPanel
      open={panelOpen}
      onClose={() => { setItem(null); onPanelClose?.(); }}
      onBack={previousItem ? goBackToItem : (externalBackLabel && onExternalBack) ? () => { setItem(null); onExternalBack(); } : undefined}
      backLabel={previousItem ? itemName(previousItem, resolvedLocale) : externalBackLabel ?? undefined}
    >
      <ItemDetail item={panelItem} onMaterialClick={handleMaterialClick} onCategoryClick={handleCategoryClick} onCharacterClick={jumpToCharacter} onStationClick={handleStationClick} onBlueprintClick={onBlueprintClick} onSkillClick={onSkillClick} />
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

  // 헤더는 화면에 따라 통째로 다르다 (홈=Breadcrumb+정렬, 목록=CategoryHeader).
  const header = showCategoryGrid ? (
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
  ) : (
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
  );

  // 스크롤 영역 본문 — 광고 아래에서만 갈린다.
  const body = showCategoryGrid ? (
    isSearching ? (
      <ItemGrid items={searchResults} selectedItem={selectedItem} onSelectItem={handleSelectItem} />
    ) : (
      <CategoryGrid
        categories={categories}
        favCount={craftingFavCount}
        recentCount={recentIds.length}
        sortByPopular={sortByPopular}
        getClicks={getClicks}
        onSelectCategory={handleSelectCategory}
      />
    )
  ) : selectedCategory === "character" && !selectedCharacter && !isSearching ? (
    <CharacterSelector
      characters={characters}
      selectedCharacter={selectedCharacter}
      sortByPopular={sortByPopular}
      getClicks={getClicks}
      onSelectCharacter={handleSelectCharacter}
    />
  ) : (
    <ItemGrid
      items={displayItems}
      selectedItem={selectedItem}
      onSelectItem={handleSelectItem}
      getClicks={sortByPopular ? getClicks : undefined}
    />
  );

  // 화면(홈/목록)을 두 개의 `return`으로 나누지 않는다 (#93).
  //
  // 예전에는 `AdSlot variant="top"` 이 `CategoryGrid` 와 `ItemGrid` **안에** 각각 있었다.
  // 두 컴포넌트는 화면 전환 때 서로 교체되므로 placeholder `#111` 을 쥔 DOM 노드가 통째로
  // 바뀌었고, Ezoic은 새 div를 발견해 **처음부터 다시 요청**했다 — 프로덕션 실측에서
  // 카테고리를 누르는 순간 광고가 사라지고(iframe 0) 재요청이 나가 8초 뒤에야 다시 찼다.
  // 전환할 때마다 사용자는 빈 띠를 다시 4~8초 봐야 했고, 노출 시간도 매번 초기화됐다
  // (`early` = 소재 도착 전 이탈이 56%인 것과 직결).
  //
  // 그래서 헤더/본문만 갈리고 **자리 자체는 트리에 하나만** 존재하도록 합쳤다. 같은
  // 위치·같은 타입이라 React가 DOM 노드를 그대로 재사용하고, Ezoic 입장에서는 자리가
  // 사라진 적이 없으므로 재요청이 일어나지 않는다.
  //
  // ⚠️ 이 자리를 다시 `CategoryGrid`/`ItemGrid` 안으로 넣지 말 것. 그리드 안에 두면
  // `col-span-full` 로 격자에 맞출 수 있어 편해 보이지만, 그 편의가 곧 위 재요청이다.
  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
      {header}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="flex flex-col min-h-full">
          <AdSlot variant="top" className="max-w-4xl mx-auto w-full px-3 sm:px-4" />
          {body}
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}
