export type SeoLang = "en" | "ko";

export const L = {
  // Common
  backHome: { en: "← Back to dstcraft.com", ko: "← dstcraft.com 홈으로" },

  // Page kind labels (top-right header)
  craftingGuide: { en: "Crafting Guide", ko: "제작 가이드" },
  cookingGuide: { en: "Cooking Guide", ko: "요리 가이드" },
  bossGuide: { en: "Boss Guide", ko: "보스 가이드" },
  characterGuide: { en: "Character Guide", ko: "캐릭터 가이드" },
  skillTreeGuide: { en: "Skill Tree Guide", ko: "스킬트리 가이드" },
  browseAll: { en: "Browse All", ko: "전체 둘러보기" },
  cookpotSimulator: { en: "Crock Pot Simulator", ko: "요리솥 시뮬레이터" },

  // Sections
  howToCook: { en: "How to Cook", ko: "조리 방법" },
  howToCraft: { en: "How to Craft", ko: "제작 방법" },
  howToDefeat: { en: "How to Defeat", ko: "공략" },
  howToPlay: { en: "How to Play", ko: "플레이 방법" },
  howToUseSkillTree: { en: "How to Use", ko: "스킬트리 활용 방법" },

  about: { en: "About", ko: "소개" },
  stats: { en: "Stats", ko: "스탯" },
  baseStats: { en: "Base Stats", ko: "기본 스탯" },
  perksAndAbilities: { en: "Perks & Abilities", ko: "특성 및 능력" },
  abilitiesExplained: { en: "Abilities Explained", ko: "능력 설명" },
  exclusiveItems: { en: "Exclusive Items", ko: "전용 아이템" },
  faq: { en: "Frequently Asked Questions", ko: "자주 묻는 질문" },
  requirements: { en: "Requirements", ko: "필요 재료" },
  recommendedIngredients: { en: "Recommended Ingredients", ko: "추천 재료" },
  bestIngredientsFor: { en: "Best Ingredients for", ko: "추천 조합:" },
  cookingStation: { en: "Cooking Station", ko: "조리 도구" },
  craftingStation: { en: "Crafting Station", ko: "제작대" },
  materialsRequired: { en: "Materials Required", ko: "필요한 재료" },
  usesAndTips: { en: "Uses and Tips", ko: "용도 및 팁" },
  categories: { en: "Categories", ko: "카테고리" },
  usedIn: { en: "Used In", ko: "사용처" },
  drops: { en: "Drops / Loot", ko: "전리품" },
  lootAndDrops: { en: "Loot and Drops", ko: "전리품 및 드롭" },
  skillBranches: { en: "Skill Branches", ko: "스킬 분기" },
  skillBranchBreakdown: { en: "Skill Branch Breakdown", ko: "스킬 분기 상세" },
  notableSkills: { en: "Notable Skills", ko: "주요 스킬" },
  skillTreeItems: { en: "Skill Tree Items", ko: "스킬트리 해금 아이템" },
  otherSkillTrees: { en: "Other Skill Trees", ko: "다른 스킬트리" },
  otherCharacters: { en: "Other Characters", ko: "다른 캐릭터" },
  viewAllCharacters: { en: "View all characters →", ko: "모든 캐릭터 보기 →" },

  // Recipe meta
  perish: { en: "Perish", ko: "부패" },
  cookTime: { en: "Cook Time", ko: "조리 시간" },
  temperature: { en: "Temperature", ko: "온도" },
  specialEffect: { en: "Special Effect", ko: "특수 효과" },
  never: { en: "Never", ko: "없음" },
  days: { en: "days", ko: "일" },

  // Difficulty labels
  diffEasy: { en: "Easy", ko: "쉬움" },
  diffNormal: { en: "Normal", ko: "보통" },
  diffHard: { en: "Hard", ko: "어려움" },
  difficultyLabel: { en: "Difficulty", ko: "난이도" },

  // Food types
  ftMeat: { en: "Meat", ko: "고기" },
  ftVeggie: { en: "Veggie", ko: "채소" },
  ftGoodies: { en: "Goodies", ko: "디저트" },
  ftRoughage: { en: "Roughage", ko: "거친음식" },
  ftNonfood: { en: "Non-Food", ko: "비식품" },
  ftGeneric: { en: "Generic", ko: "일반" },

  warlyExclusive: { en: "Warly Exclusive", ko: "월리 전용" },
  characterExclusive: { en: "Character Exclusive", ko: "캐릭터 전용" },
  onlyXCanCraft: { en: "Only {x} can craft this item.", ko: "{x} 전용 제작 아이템입니다." },

  // Boss categories (also used in seo-text Korean)
  bcSeasonal: { en: "Seasonal Boss", ko: "계절 보스" },
  bcRaid: { en: "Raid Boss", ko: "레이드 보스" },
  bcOcean: { en: "Ocean Boss", ko: "바다 보스" },
  bcDungeon: { en: "Dungeon Boss", ko: "던전 보스" },
  bcEvent: { en: "Event Boss", ko: "이벤트 보스" },
  bcMini: { en: "Mini Boss", ko: "미니 보스" },

  blueprint: { en: "Blueprint", ko: "설계도" },
  pickOne: { en: "Pick 1", ko: "1개 선택" },

  // CTAs
  findMoreCookpot: { en: "Find more DST crock pot recipes", ko: "더 많은 DST 요리솥 레시피" },
  findMoreCrafting: { en: "Find more DST crafting recipes", ko: "더 많은 DST 제작 레시피" },
  ctaCookHelper: {
    en: "Simulate crock pot combinations and find crafting recipes",
    ko: "요리솥 조합을 시뮬레이션하고 제작 레시피를 찾아보세요",
  },
  ctaSearchAll: {
    en: "Search all items, crock pot recipes, and character-specific crafts",
    ko: "모든 아이템, 요리솥 레시피, 캐릭터 전용 제작 아이템을 검색해보세요",
  },
  openCookingGuide: { en: "Open Cooking Guide →", ko: "요리 가이드 열기 →" },
  openCraftingGuide: { en: "Open Crafting Guide →", ko: "제작 가이드 열기 →" },
  openBossGuide: { en: "Open Boss Guide →", ko: "보스 가이드 열기 →" },
  openSimulator: { en: "Open Simulator →", ko: "시뮬레이터 열기 →" },
  openSkillTreeSimulator: { en: "Open Skill Tree Simulator →", ko: "스킬트리 시뮬레이터 열기 →" },

  seeAllBossGuides: { en: "See all DST boss guides", ko: "DST 보스 가이드 전체 보기" },
  bossGuideHelper: {
    en: "Boss drops, crafting recipes, and crock pot guides",
    ko: "보스 드롭, 제작 레시피, 요리솥 가이드",
  },

  findCharCrafting: { en: "Find {x}'s crafting recipes", ko: "{x}의 제작 레시피 찾기" },
  charCraftingHelper: {
    en: "Browse all character-specific items, crock pot recipes, and boss strategies",
    ko: "캐릭터 전용 아이템, 요리솥 레시피, 보스 공략을 둘러보세요",
  },
  trySkillSimulator: { en: "Try {x}'s Skill Tree Simulator", ko: "{x}의 스킬트리 시뮬레이터 사용해보기" },
  skillSimulatorHelper: {
    en: "Plan your skill build interactively before committing in-game",
    ko: "인게임 적용 전에 빌드를 인터랙티브하게 계획해보세요",
  },

  skillsCount: { en: "Skills", ko: "스킬" },
  branchesCount: { en: "Branches", ko: "분기" },
  skillTreeOfX: { en: "Skill Tree", ko: "스킬트리" },
  notableSkillsList: { en: "Notable Skills", ko: "주요 스킬" },

  charactersTitle: {
    en: "Don't Starve Together Characters",
    ko: "Don't Starve Together 캐릭터",
  },
  charactersIntro: {
    en: "Don't Starve Together features {n} playable characters, each with unique abilities, stats, and exclusive crafting recipes. Choose the right character for your playstyle.",
    ko: "Don't Starve Together에는 {n}명의 플레이 가능한 캐릭터가 있으며, 각자 고유한 능력, 스탯, 전용 제작 레시피를 가지고 있습니다. 플레이 스타일에 맞는 캐릭터를 선택하세요.",
  },
  choosingCharacter: {
    en: "Choosing Your Character in DST",
    ko: "DST에서 캐릭터 고르기",
  },
  choosingCharacterText: {
    en: "Each character in Don't Starve Together has unique strengths and weaknesses. Beginners should start with easy characters like Wilson, Wendy, or Wigfrid. More experienced players can try challenging characters like Wolfgang, Maxwell, or Wanda. Warly is perfect for cooking-focused play, while Webber and Wurt offer unique ally-management playstyles.",
    ko: "Don't Starve Together의 각 캐릭터는 고유한 장단점을 가지고 있습니다. 초보자는 윌슨, 웬디, 위그프리드 같은 쉬운 캐릭터로 시작하는 것을 추천합니다. 숙련자는 울프강, 맥스웰, 완다 같은 도전적인 캐릭터를 시도해보세요. 월리는 요리 중심 플레이에, 웨버와 우르트는 동료 관리 플레이에 적합합니다.",
  },

  exploreCraftingCooking: {
    en: "Explore crafting recipes and cooking guides",
    ko: "제작 레시피와 요리 가이드 둘러보기",
  },
  exploreHelper: {
    en: "Find character-specific crafting recipes, crock pot recipes, and boss strategies",
    ko: "캐릭터 전용 제작 레시피, 요리솥 레시피, 보스 공략을 찾아보세요",
  },

  // Browse page
  browseTitle: {
    en: "Don't Starve Together — All Items, Recipes & Bosses",
    ko: "Don't Starve Together — 모든 아이템, 레시피, 보스",
  },
  craftingItems: { en: "Crafting Items", ko: "제작 아이템" },
  crockPotRecipes: { en: "Crock Pot Recipes", ko: "요리솥 레시피" },
  bossesLabel: { en: "Bosses", ko: "보스" },
  charactersLabel: { en: "Characters", ko: "캐릭터" },
  interactiveGuide: { en: "Interactive crafting & cooking guide", ko: "인터랙티브 제작 & 요리 가이드" },
  openGuide: { en: "Open Guide →", ko: "가이드 열기 →" },

  // Cookpot SEO page
  cookpotPageHeading: {
    en: "Don't Starve Together\nCrock Pot Simulator",
    ko: "Don't Starve Together\n요리솥 시뮬레이터",
  },
  cookpotIntro: {
    en: "Add any 4 ingredients to simulate crock pot cooking. Predict recipes, check stats, and find the best food for your situation.",
    ko: "원하는 재료 4개를 추가해 요리솥 조리를 시뮬레이션해보세요. 어떤 요리가 만들어지는지 예측하고, 스탯을 확인하고, 상황에 맞는 최고의 음식을 찾을 수 있습니다.",
  },
  cookpotIntroSub: {
    en: "DST crock pot simulator — add 4 ingredients and see what you can cook.",
    ko: "DST 요리솥 시뮬레이터 — 재료 4개를 추가하면 어떤 요리가 나오는지 확인할 수 있습니다.",
  },
  howItWorks: { en: "How It Works", ko: "사용 방법" },
  hiwStep1Title: { en: "Pick Ingredients", ko: "재료 선택" },
  hiwStep1Desc: {
    en: "Choose 4 ingredients from the ingredient picker. Tap to add, long-press for details.",
    ko: "재료 선택 화면에서 4개를 고르세요. 탭하여 추가하고, 길게 눌러 상세 정보를 확인할 수 있습니다.",
  },
  hiwStep2Title: { en: "See Results", ko: "결과 확인" },
  hiwStep2Desc: {
    en: "The simulator calculates which recipe will be cooked based on DST's actual game logic.",
    ko: "시뮬레이터가 실제 DST 인게임 로직을 기반으로 어떤 레시피가 만들어질지 계산합니다.",
  },
  hiwStep3Title: { en: "Compare Stats", ko: "스탯 비교" },
  hiwStep3Desc: {
    en: "View health, hunger, sanity values and find the optimal recipe for your needs.",
    ko: "체력, 허기, 정신력 수치를 보고 상황에 맞는 최적의 레시피를 찾으세요.",
  },
  popularRecipes: { en: "Popular Crock Pot Recipes", ko: "인기 요리솥 레시피" },
  allCockpotRecipes: { en: "All Crock Pot Recipes", ko: "전체 요리솥 레시피" },
  cookpotIngredientsLabel: { en: "Crock Pot Ingredients", ko: "요리솥 재료" },
  readyToCook: { en: "Ready to cook?", ko: "조리 준비 완료?" },
  readyToCookDesc: {
    en: "Try the interactive crock pot simulator — add ingredients and see what you'll get!",
    ko: "인터랙티브 요리솥 시뮬레이터를 사용해보세요 — 재료를 추가하면 어떤 요리가 나오는지 알 수 있습니다!",
  },
  browseAllRecipes: { en: "Browse All Recipes →", ko: "전체 레시피 보기 →" },

  // Food types in cookpot/browse listings
  meatDishes: { en: "Meat Dishes", ko: "고기 요리" },
  veggieDishes: { en: "Veggie Dishes", ko: "채소 요리" },
  goodiesGroup: { en: "Goodies", ko: "디저트" },
  roughageGroup: { en: "Roughage", ko: "거친 음식" },
  genericGroup: { en: "Generic", ko: "일반" },

  // Ingredient categories (cookpot)
  ingMeats: { en: "Meats", ko: "고기류" },
  ingVeggies: { en: "Veggies", ko: "채소류" },
  ingFruits: { en: "Fruits", ko: "과일류" },
  ingSweeteners: { en: "Sweeteners", ko: "감미료" },
  ingEggs: { en: "Eggs", ko: "알류" },
  ingDairy: { en: "Dairy", ko: "유제품" },
  ingFishes: { en: "Fishes", ko: "생선류" },
  ingMisc: { en: "Misc", ko: "기타" },

  // Used by skill tree, food page, etc.
  relatedRecipes: { en: "Related", ko: "관련" },
  recipesSuffix: { en: "Recipes", ko: "레시피" },
} as const;

export function t(key: keyof typeof L, lang: SeoLang): string {
  return L[key][lang];
}
