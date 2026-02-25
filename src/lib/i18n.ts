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
    station_magic_1: "프레스티해티테이터",
    station_magic_2: "그림자 조종기",
    station_ancient: "고대",
    station_celestial: "천상",
    station_think_tank: "씽크 탱크",
    station_cartography: "지도 제작대",
    station_tackle_station: "낚시 도구 제작대",
    station_potter_wheel: "도자기 물레",
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
    station_character: "Character Specific",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["ko"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export function localName(
  obj: { nameKo: string; nameEn: string },
  locale: Locale
): string {
  return locale === "ko" ? obj.nameKo : obj.nameEn;
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "ko";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ko")) return "ko";
  return "en";
}
