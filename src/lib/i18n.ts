import type { CraftingItem, CraftingStation, Material, Category, Character } from "@/lib/types";
import { allLocales } from "@/data/locales";
import type { LocaleData } from "@/data/locales/types";
import { allItems } from "@/data/items";
import { skillNames } from "@/data/skill-names";

export type Locale =
  | "ko" | "en"
  | "zh_CN" | "zh_TW"
  | "fr" | "de" | "it" | "ja"
  | "pl" | "pt_BR" | "ru"
  | "es" | "es_MX";
export type LocaleSetting = Locale | "system";

const translations = {
  ko: {
    craftingGuide: "제작",
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
    station_ancient: "고대 유사과학",
    station_celestial: "천상",
    station_think_tank: "싱크 탱크",
    station_cartography: "지도 제작대",
    station_tackle_station: "낚시도구 거치대",
    station_potter_wheel: "조각",
    station_bookstation: "책장",
    station_portableblender: "향신료",
    station_lunar_forge: "대황간",
    station_shadow_forge: "그림자 공예",
    station_carpentry_station: "목공 작업대",
    station_turfcraftingstation: "땅다지개",
    station_critter_lab: "동물 친구",
    station_character: "생존자 아이템",
    tab_crafting: "제작",
    tab_cooking: "요리",
    tab_cookpot: "요리솥",
    tab_bosses: "보스",
    tab_settings: "설정",
    cooking_all: "전체",
    cooking_cookpot: "요리솥",
    cooking_portablecookpot: "휴대용 요리솥",
    cooking_health: "체력",
    cooking_hunger: "허기",
    cooking_sanity: "정신력",
    cooking_perish: "유통기한",
    cooking_cooktime: "조리시간",
    cooking_temp: "온도",
    cooking_or: "또는",
    cooking_days: "일",
    cooking_seconds: "초",
    cooking_ingredients: "추천 재료",
    cooking_warly_exclusive: "왈리 전용",
    cooking_no_perish: "썩지 않음",
    cooking_effect: "특수 효과",
    cooking_requirements: "조리법",
    cooking_req_needed: "재료",
    cooking_req_excluded: "금지",
    foodtype_meat: "고기",
    foodtype_veggie: "채소",
    foodtype_goodies: "간식",
    foodtype_roughage: "섬유질",
    foodtype_nonfood: "비식품",
    cooking_recommend_health: "체력회복 추천",
    cooking_recommend_sanity: "정신력 회복 추천",
    cooking_recommend_hunger: "허기 추천",
    cookpot_station_cookpot: "요리솥",
    cookpot_station_portable: "휴대용 요리솥",
    cookpot_slot_empty: "재료 추가",
    cookpot_result: "결과",
    cookpot_no_result: "재료를 4개 넣어주세요",
    cookpot_random_result: "랜덤 결과",
    cookpot_clear: "초기화",
    cookpot_select_ingredient: "재료 선택",
    cookpot_search_ingredients: "재료 검색...",
    cookpot_category_all: "전체",
    cookpot_category_fruits: "과일",
    cookpot_category_veggies: "채소",
    cookpot_category_meats: "고기",
    cookpot_category_fish: "생선",
    cookpot_category_eggs: "알",
    cookpot_category_sweeteners: "감미료",
    cookpot_category_misc: "기타",
    favorites: "즐겨찾기",
    recent: "최근 조회",
    favorites_login_prompt: "로그인하면 즐겨찾기가 기기 간 동기화됩니다",
    favorites_local_warning: "로그인하지 않으면 이 브라우저에서만 저장됩니다",
    sign_in_with_google: "Google로 로그인",
    sign_out: "로그아웃",
    account: "계정",
    release_notes: "릴리즈 노트",
    insight: "통계",
    pwa_install_title: "앱 설치",
    pwa_install_desc: "앱으로 설치하면 더 빠르고 편리합니다",
    pwa_install_button: "설치",
    pwa_install_ios_step1: "하단의 공유 버튼을 탭하세요",
    pwa_install_ios_step2: "'홈 화면에 추가'를 선택하세요",
    pwa_install_generic: "브라우저 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 선택하세요",
    review_title: "앱이 도움이 되셨나요?",
    review_message: "여러분의 평가는 개발자에게 큰 힘이 됩니다",
    review_github_star: "GitHub에서 Star 주기",
    review_share: "친구에게 공유하기",
    review_thanks: "감사합니다!",
    review_later: "나중에",
    rating_title: "앱 평점",
    rating_count: "명 참여",
    rating_my: "내 평점",
    top_countries: "접속 국가 TOP 5",
    rating_dist_count: "건",
    support_kofi: "개발자 후원하기",
    health_cost: "체력 소모",
    skill_tree_required: "스킬트리",
    station_required: "스테이션 필요",
    blueprint_required: "블루프린트 필요",
    prototypable: "프로토타입 가능",
    sort_default: "기본",
    sort_popular: "인기순",
    boss_all: "전체",
    boss_seasonal: "시즌 보스",
    boss_raid: "레이드 보스",
    boss_ocean: "해양 보스",
    boss_dungeon: "던전 보스",
    boss_event: "이벤트 보스",
    boss_mini: "미니 보스",
    boss_loot: "전리품",
    boss_blueprint: "블루프린트",
    boss_loot_search: "전리품 검색...",
    boss_loot_search_result: "전리품 검색결과",
    effect_health_regen: "체력 재생",
    effect_sleep_resistance: "수면 저항",
    effect_sanity_regen: "정신력 재생",
    effect_beefalo_food: "비팔로 사료",
    effect_sleep: "수면",
    effect_swap_health_sanity: "체력↔정신력",
    effect_electric_attack: "전기 공격",
    effect_glow: "발광",
    effect_moisture_immunity: "방수",
    effect_heat_resistance: "내열",
    effect_cold_resistance: "내한",
    feedback_title: "의견 보내기",
    feedback_placeholder: "버그 제보, 기능 요청, 건의사항 등을 자유롭게 남겨주세요 (익명)",
    feedback_submit: "보내기",
    feedback_thanks: "의견이 전달되었습니다!",
    feedback_too_many: "1시간에 한 번만 보낼 수 있습니다",
    feedback_empty: "내용을 입력해주세요",
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
    tab_crafting: "Crafting",
    tab_cooking: "Cooking",
    tab_cookpot: "Crock Pot",
    tab_bosses: "Bosses",
    tab_settings: "Settings",
    cooking_all: "All",
    cooking_cookpot: "Crock Pot",
    cooking_portablecookpot: "Portable Crock Pot",
    cooking_health: "Health",
    cooking_hunger: "Hunger",
    cooking_sanity: "Sanity",
    cooking_perish: "Perish",
    cooking_cooktime: "Cook Time",
    cooking_temp: "Temp",
    cooking_or: "or",
    cooking_days: "d",
    cooking_seconds: "s",
    cooking_ingredients: "Ingredients",
    cooking_warly_exclusive: "Warly Exclusive",
    cooking_no_perish: "Never",
    cooking_effect: "Special Effect",
    cooking_requirements: "Requirements",
    cooking_req_needed: "Ingredients",
    cooking_req_excluded: "Excluded",
    foodtype_meat: "Meat",
    foodtype_veggie: "Veggie",
    foodtype_goodies: "Goodies",
    foodtype_roughage: "Roughage",
    foodtype_nonfood: "Non-Food",
    cooking_recommend_health: "Health Recovery",
    cooking_recommend_sanity: "Sanity Recovery",
    cooking_recommend_hunger: "Best Hunger",
    cookpot_station_cookpot: "Crock Pot",
    cookpot_station_portable: "Portable Crock Pot",
    cookpot_slot_empty: "Add Ingredient",
    cookpot_result: "Result",
    cookpot_no_result: "Add 4 ingredients",
    cookpot_random_result: "Random Result",
    cookpot_clear: "Clear",
    cookpot_select_ingredient: "Select Ingredient",
    cookpot_search_ingredients: "Search ingredients...",
    cookpot_category_all: "All",
    cookpot_category_fruits: "Fruits",
    cookpot_category_veggies: "Veggies",
    cookpot_category_meats: "Meats",
    cookpot_category_fish: "Fish",
    cookpot_category_eggs: "Eggs",
    cookpot_category_sweeteners: "Sweeteners",
    cookpot_category_misc: "Misc",
    favorites: "Favorites",
    recent: "Recent",
    favorites_login_prompt: "Sign in to sync favorites across devices",
    favorites_local_warning: "Favorites will only be saved in this browser",
    sign_in_with_google: "Sign in with Google",
    sign_out: "Sign out",
    account: "Account",
    release_notes: "Release Notes",
    insight: "Insight",
    pwa_install_title: "Install App",
    pwa_install_desc: "Install for a faster and better experience",
    pwa_install_button: "Install",
    pwa_install_ios_step1: "Tap the Share button at the bottom",
    pwa_install_ios_step2: "Select 'Add to Home Screen'",
    pwa_install_generic: "Select 'Install App' or 'Add to Home Screen' from the browser menu",
    review_title: "Enjoying the app?",
    review_message: "Your feedback means a lot to the developer",
    review_github_star: "Star on GitHub",
    review_share: "Share with friends",
    review_thanks: "Thank you!",
    review_later: "Maybe later",
    rating_title: "App Rating",
    rating_count: " ratings",
    rating_my: "My rating",
    top_countries: "Top Countries",
    rating_dist_count: "",
    support_kofi: "Support the developer",
    health_cost: "Health Cost",
    skill_tree_required: "Skill Tree",
    station_required: "Station Required",
    blueprint_required: "Blueprint Required",
    prototypable: "Prototypable",
    sort_default: "Default",
    sort_popular: "Popular",
    boss_all: "All",
    boss_seasonal: "Seasonal",
    boss_raid: "Raid",
    boss_ocean: "Ocean",
    boss_dungeon: "Dungeon",
    boss_event: "Event",
    boss_mini: "Mini",
    boss_loot: "Loot",
    boss_blueprint: "Blueprint",
    boss_loot_search: "Search loot...",
    boss_loot_search_result: "Loot Search Results",
    effect_health_regen: "HP Regen",
    effect_sleep_resistance: "Sleep Resist",
    effect_sanity_regen: "Sanity Regen",
    effect_beefalo_food: "Beefalo",
    effect_sleep: "Sleep",
    effect_swap_health_sanity: "HP↔Sanity",
    effect_electric_attack: "Electric",
    effect_glow: "Glow",
    effect_moisture_immunity: "Waterproof",
    effect_heat_resistance: "Heat Resist",
    effect_cold_resistance: "Cold Resist",
    feedback_title: "Send Feedback",
    feedback_placeholder: "Bug reports, feature requests, suggestions... (anonymous)",
    feedback_submit: "Send",
    feedback_thanks: "Feedback sent!",
    feedback_too_many: "You can only send once per hour",
    feedback_empty: "Please enter a message",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["ko"];

// Locale registry — all generated + hand-curated locales
const locales: Record<string, LocaleData> = allLocales;

/** All supported locale codes (for UI dropdowns etc.) */
export const supportedLocales: Locale[] = [
  "ko", "en", "ja", "zh_CN", "zh_TW",
  "fr", "de", "it", "pl", "pt_BR", "ru", "es", "es_MX",
];

/** Human-readable locale labels (always displayed in native language) */
export const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh_CN: "简体中文",
  zh_TW: "繁體中文",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pl: "Polski",
  pt_BR: "Português (BR)",
  ru: "Русский",
  es: "Español",
  es_MX: "Español (MX)",
};

export function t(locale: Locale, key: TranslationKey): string {
  if (locale === "ko") return translations.ko[key];
  return translations.en[key];
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

export function foodName(food: { id: string; name: string }, locale: string): string {
  return locales[locale]?.foods?.[food.id]?.name ?? food.name;
}

export function ingredientName(ing: { id: string; name: string; nameKo?: string }, locale: string): string {
  // 1. ko.ts items section (shared game items)
  const localeItem = locales[locale]?.items[ing.id]?.name;
  if (localeItem) return localeItem;
  // 2. Ingredient-level Korean name
  if (locale === "ko" && ing.nameKo) return ing.nameKo;
  // 3. English fallback
  return ing.name;
}

/** Get the "other language" name for display (e.g. show English when locale is Korean) */
export function itemAltName(item: Pick<CraftingItem, "id" | "name">, locale: string): string {
  if (locale === "en") return "";
  return item.name;
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "ko";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("ja")) return "ja";
  if (lang === "zh-cn" || lang === "zh-hans" || lang === "zh-sg") return "zh_CN";
  if (lang.startsWith("zh")) return "zh_TW";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("it")) return "it";
  if (lang.startsWith("pl")) return "pl";
  if (lang === "pt-br") return "pt_BR";
  if (lang.startsWith("pt")) return "pt_BR";
  if (lang.startsWith("ru")) return "ru";
  if (lang === "es-mx") return "es_MX";
  if (lang.startsWith("es")) return "es";
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
export function stationName(station: CraftingStation, locale: string): string {
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

  // 3. English fallback from translations
  const key = `station_${station}` as TranslationKey;
  return translations.en[key] ?? station;
}

/**
 * Get localized skill name from builderSkill ID.
 */
export function skillName(skillId: string, locale: string): string {
  const entry = skillNames[skillId];
  if (!entry) return skillId;
  if (locale === "ko") return entry.ko;
  return entry.en;
}
