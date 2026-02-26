import type { CraftingItem, CraftingStation, Material, Category, Character } from "@/lib/types";
import { ko } from "@/data/locales/ko";
import type { LocaleData } from "@/data/locales/types";
import { allItems } from "@/data/items";

export type Locale = "ko" | "en";
export type LocaleSetting = Locale | "system";

const translations = {
  ko: {
    craftingGuide: "제작 가이드",
    searchPlaceholder: "아이템 검색...",
    searchResults: "검색 결과",
    selectItem: "아이템을 선택하세요",
    noItems: "아이템이 없습니다",
    all: "전체",
    itemDetail: "아이템 상세",
    settings: "설정",
    theme: "테마",
    language: "언어",
    light: "라이트",
    dark: "다크",
    system: "시스템",
    korean: "한국어",
    english: "English",
    station_none: "손 제작",
    station_science_1: "과학 기계",
    station_science_2: "연금술 엔진",
    station_magic_1: "요술 모자",
    station_magic_2: "그림자 조종기",
    station_ancient: "고대",
    station_celestial: "천상",
    station_think_tank: "싱크 탱크",
    station_cartography: "지도 제작대",
    station_tackle_station: "낚시 도구 제작대",
    station_potter_wheel: "도자기 물레",
    station_bookstation: "책장",
    station_portableblender: "휴대용 분쇄기",
    station_lunar_forge: "달빛 대장간",
    station_shadow_forge: "어둠의 대장간",
    station_carpentry_station: "목공 작업대",
    station_turfcraftingstation: "토탄 제작대",
    station_critter_lab: "돌보미 센터",
    station_character: "캐릭터 고유",
  },
  en: {
    craftingGuide: "Crafting Guide",
    searchPlaceholder: "Search items...",
    searchResults: "Search Results",
    selectItem: "Select an item",
    noItems: "No items found",
    all: "All",
    itemDetail: "Item Detail",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    system: "System",
    korean: "한국어",
    english: "English",
    station_none: "Hand Craft",
    station_science_1: "Science Machine",
    station_science_2: "Alchemy Engine",
    station_magic_1: "Prestihatitator",
    station_magic_2: "Shadow Manipulator",
    station_ancient: "Ancient",
    station_celestial: "Celestial",
    station_think_tank: "Think Tank",
    station_cartography: "Cartography Desk",
    station_tackle_station: "Tackle Receptacle",
    station_potter_wheel: "Potter's Wheel",
    station_bookstation: "Bookcase",
    station_portableblender: "Portable Grinding Mill",
    station_lunar_forge: "Lunar Forge",
    station_shadow_forge: "Shadow Forge",
    station_carpentry_station: "Carpentry Station",
    station_turfcraftingstation: "Turf Crafting Station",
    station_critter_lab: "Rock Den",
    station_character: "Character Specific",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["ko"];

// Locale registry — add new locales here
const locales: Record<string, LocaleData> = { ko };

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

// Domain-specific localized name helpers (fallback to English name)

export function itemName(item: Pick<CraftingItem, "id" | "name">, locale: string): string {
  return locales[locale]?.items[item.id]?.name ?? item.name;
}

export function itemDesc(item: Pick<CraftingItem, "id" | "description">, locale: string): string {
  return locales[locale]?.items[item.id]?.desc ?? item.description;
}

export function materialName(mat: Pick<Material, "id" | "name">, locale: string): string {
  return locales[locale]?.materials[mat.id]?.name ?? mat.name;
}

export function categoryName(cat: Pick<Category, "id" | "name">, locale: string): string {
  return locales[locale]?.categories[cat.id]?.name ?? cat.name;
}

export function characterName(char: Pick<Character, "id" | "name">, locale: string): string {
  return locales[locale]?.characters[char.id]?.name ?? char.name;
}

/** Get the "other language" name for display (e.g. show English when locale is Korean) */
export function itemAltName(item: Pick<CraftingItem, "id" | "name">, locale: string): string {
  if (locale === "en") {
    return locales.ko?.items[item.id]?.name ?? item.name;
  }
  return item.name;
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "ko";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ko")) return "ko";
  return "en";
}

// --- Station name: derived from item name (single source of truth) ---

/** Maps CraftingStation → item ID for stations that have a corresponding item */
const stationItemId: Partial<Record<CraftingStation, string>> = {
  science_1: "researchlab",
  science_2: "researchlab2",
  magic_1: "researchlab4",
  magic_2: "researchlab3",
  think_tank: "seafaring_prototyper",
  cartography: "cartographydesk",
  tackle_station: "tacklestation",
  bookstation: "bookstation",
  carpentry_station: "carpentry_station",
  turfcraftingstation: "turfcraftingstation",
};

// Lazy-built English name lookup (from items.ts)
let _itemEnNames: Map<string, string> | null = null;
function getItemEnName(itemId: string): string | undefined {
  if (!_itemEnNames) {
    _itemEnNames = new Map(allItems.map((i) => [i.id, i.name]));
  }
  return _itemEnNames.get(itemId);
}

/**
 * Get localized station name.
 * Priority: locale stations section → item name (for stations with items) → English fallback.
 */
export function stationName(station: CraftingStation, locale: Locale): string {
  // 1. Check locale stations section (ko.ts stations)
  const stationLabel = locales[locale]?.stations?.[station]?.name;
  if (stationLabel) return stationLabel;

  // 2. Derive from item name (for stations that have a corresponding item)
  const itemId = stationItemId[station];
  if (itemId) {
    const localeName = locales[locale]?.items[itemId]?.name;
    if (localeName) return localeName;
    return getItemEnName(itemId) ?? station;
  }

  // 3. English fallback
  const key = `station_${station}` as TranslationKey;
  return translations[locale][key] ?? station;
}
