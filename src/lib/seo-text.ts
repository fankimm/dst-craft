// ---------------------------------------------------------------------------
// SEO Text Generator — auto-generates natural-language content for SEO pages
// Uses template + data approach. No manual writing needed.
// ---------------------------------------------------------------------------

import type { CookingRecipe } from "@/data/recipes";
import type { Boss } from "@/data/bosses";
import type { CharacterSkillTree } from "@/data/skill-trees/types";

// ===========================
// FOOD SEO
// ===========================

const foodTypeDescriptions: Record<string, string> = {
  meat: "a meat-based dish",
  veggie: "a vegetable dish",
  goodies: "a sweet treat",
  roughage: "a roughage dish",
  generic: "a versatile dish",
  nonfood: "a non-food item",
};

const specialEffectDescriptions: Record<string, string> = {
  health_regen: "provides health regeneration over time",
  sleep: "puts the player to sleep upon consumption",
  beefalo_food: "can be used to feed Beefalo for domestication",
  speed: "grants a temporary speed boost",
  sanity_aura: "provides a sanity aura effect",
  dust_moth_food: "is food for Dust Moths and is used in the Ancient Archive quest",
  hunger_regen: "slowly restores hunger over time while worn",
};

function describeStats(health: number, hunger: number, sanity: number): string {
  const parts: string[] = [];

  if (hunger >= 75) parts.push("a massive amount of hunger");
  else if (hunger >= 50) parts.push("a large amount of hunger");
  else if (hunger >= 30) parts.push("a moderate amount of hunger");
  else if (hunger > 0) parts.push("a small amount of hunger");

  if (health >= 40) parts.push("significant health");
  else if (health >= 20) parts.push("moderate health");
  else if (health > 0) parts.push("a small amount of health");
  else if (health < 0) parts.push(`costs ${Math.abs(health)} health`);

  if (sanity >= 30) parts.push("substantial sanity");
  else if (sanity >= 10) parts.push("some sanity");
  else if (sanity > 0) parts.push("a small sanity boost");
  else if (sanity < 0) parts.push(`reduces sanity by ${Math.abs(sanity)}`);

  if (parts.length === 0) return "minimal stat benefits";
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
}

function describeBestUse(health: number, hunger: number, sanity: number): string {
  if (hunger >= 60 && health < 10) return "a reliable hunger food";
  if (health >= 40) return "a great healing food";
  if (sanity >= 30) return "an excellent sanity restoration food";
  if (hunger >= 40 && health >= 10) return "a well-rounded food";
  if (hunger >= 30) return "a solid hunger food";
  return "a useful food option";
}

function describeGamePhase(hunger: number, health: number, requirements: string): string {
  const reqLower = requirements.toLowerCase();
  const hasRare = reqLower.includes("mandrake") || reqLower.includes("tallbird") || reqLower.includes("butterfly wing");
  if (hasRare) return "late game when rare ingredients are available";
  if (hunger >= 60 && reqLower.includes("meat")) return "early and mid game as a staple food";
  if (health >= 40) return "boss fights and dangerous exploration";
  return "various stages of the game";
}

export interface FoodSeoContent {
  howToCook: string;
  bestIngredients: string | null;
  statsExplanation: string;
  faq: { question: string; answer: string }[];
}

export function generateFoodSeoText(
  recipe: CookingRecipe,
  ingredientNames?: { id: string; name: string }[],
): FoodSeoContent {
  const stationName = recipe.station === "portablecookpot" ? "Portable Crock Pot" : "Crock Pot";
  const typeDesc = foodTypeDescriptions[recipe.foodType] ?? "a dish";
  const statsDesc = describeStats(recipe.health, recipe.hunger, recipe.sanity);
  const bestUse = describeBestUse(recipe.health, recipe.hunger, recipe.sanity);
  const gamePhase = describeGamePhase(recipe.hunger, recipe.health, recipe.requirements);

  // How to cook
  let howToCook = `${recipe.name} is ${typeDesc} that can be cooked in the ${stationName} in Don't Starve Together. `;
  howToCook += `To make ${recipe.name}, the recipe requires: ${recipe.requirements}. `;
  howToCook += `It takes ${recipe.cookTime} seconds to cook`;
  if (recipe.priority > 1) {
    howToCook += ` and has a priority of ${recipe.priority}, which means it takes precedence over lower-priority recipes with similar ingredients`;
  }
  howToCook += ". ";
  if (recipe.perishDays !== null) {
    howToCook += `${recipe.name} will spoil after ${recipe.perishDays} days, so plan your cooking accordingly.`;
  } else {
    howToCook += `${recipe.name} never spoils, making it ideal for long-term storage.`;
  }
  if (recipe.station === "portablecookpot") {
    howToCook += ` Note: This recipe is exclusive to Warly's Portable Crock Pot and cannot be made in a regular Crock Pot.`;
  }

  // Best ingredients
  let bestIngredients: string | null = null;
  if (recipe.cardIngredients && recipe.cardIngredients.length > 0 && ingredientNames) {
    const ingList = recipe.cardIngredients
      .map(([id, qty]) => {
        const ing = ingredientNames.find((x) => x.id === id);
        return `${ing?.name ?? id} ×${qty}`;
      })
      .join(", ");
    bestIngredients = `A recommended combination for ${recipe.name} is: ${ingList}. `;
    bestIngredients += `This is one of the most efficient recipes you can make, useful during ${gamePhase}.`;
  }

  // Stats
  let statsExplanation = `${recipe.name} restores ${statsDesc}. `;
  statsExplanation += `This makes it ${bestUse}`;
  if (recipe.temperature !== undefined) {
    const tempType = recipe.temperature > 0 ? "warming" : "cooling";
    statsExplanation += `. It also provides a ${tempType} effect of ${recipe.temperature > 0 ? "+" : ""}${recipe.temperature}°C for ${recipe.temperatureDuration} seconds, useful during ${recipe.temperature > 0 ? "winter" : "summer"}`;
  }
  if (recipe.specialEffect) {
    const effectDesc = specialEffectDescriptions[recipe.specialEffect] ?? recipe.specialEffect;
    statsExplanation += `. Additionally, it ${effectDesc}`;
  }
  statsExplanation += ".";

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `What are the requirements to cook ${recipe.name}?`,
      answer: `To cook ${recipe.name}, you need: ${recipe.requirements}. Cook it in a ${stationName}.`,
    },
    {
      question: `How much hunger does ${recipe.name} restore?`,
      answer: `${recipe.name} restores ${recipe.hunger} hunger, ${recipe.health > 0 ? "+" : ""}${recipe.health} health, and ${recipe.sanity > 0 ? "+" : ""}${recipe.sanity} sanity.`,
    },
  ];

  if (recipe.perishDays !== null) {
    faq.push({
      question: `How long does ${recipe.name} last before spoiling?`,
      answer: `${recipe.name} spoils after ${recipe.perishDays} days. Store it in an Ice Box to extend its freshness.`,
    });
  }

  if (recipe.station === "portablecookpot") {
    faq.push({
      question: `Can I cook ${recipe.name} in a regular Crock Pot?`,
      answer: `No. ${recipe.name} is exclusive to Warly's Portable Crock Pot and cannot be cooked in a regular Crock Pot.`,
    });
  }

  if (recipe.cardIngredients && ingredientNames) {
    const ingList = recipe.cardIngredients
      .map(([id, qty]) => {
        const ing = ingredientNames.find((x) => x.id === id);
        return `${ing?.name ?? id} ×${qty}`;
      })
      .join(", ");
    faq.push({
      question: `What is the best recipe for ${recipe.name}?`,
      answer: `A recommended combination is: ${ingList}. This is an efficient way to make ${recipe.name} with commonly available ingredients.`,
    });
  }

  return { howToCook, bestIngredients, statsExplanation, faq };
}

// ===========================
// BOSS SEO
// ===========================

const categorySeasons: Record<string, string> = {
  seasonal: "a seasonal boss",
  raid: "a raid boss",
  ocean: "an ocean boss",
  dungeon: "a dungeon boss",
  event: "an event boss",
  mini: "a mini boss",
};

const categoryTips: Record<string, string> = {
  seasonal: "Seasonal bosses appear at specific times of the year and must be dealt with to survive.",
  raid: "Raid bosses are powerful enemies that require preparation. Bring armor, weapons, and healing food before engaging.",
  ocean: "Ocean bosses are encountered while sailing. Make sure your boat is sturdy and bring ranged weapons.",
  dungeon: "Dungeon bosses are found deep in the Ruins. Prepare with light sources and strong equipment.",
  event: "Event bosses appear during special in-game events. They offer unique rewards not available elsewhere.",
  mini: "Mini bosses are less powerful but still dangerous. They can appear unexpectedly during exploration.",
};

export interface BossSeoContent {
  overview: string;
  lootDescription: string;
  strategy: string;
  faq: { question: string; answer: string }[];
}

export function generateBossSeoText(
  boss: Boss,
  lootNames: { item: string; nameEn: string }[],
): BossSeoContent {
  const catDesc = categorySeasons[boss.category] ?? "a boss";
  const catTip = categoryTips[boss.category] ?? "";

  // Deduplicate loot items for description
  const uniqueItems = [...new Set(lootNames.map((l) => l.nameEn))];
  const guaranteedLoot = boss.loot
    .filter((l, i, arr) => l.chance >= 1 && arr.findIndex((x) => x.item === l.item) === i)
    .map((l) => lootNames.find((n) => n.item === l.item)?.nameEn ?? l.item);
  const rareLoot = boss.loot
    .filter((l, i, arr) => l.chance < 1 && arr.findIndex((x) => x.item === l.item) === i)
    .map((l) => {
      const name = lootNames.find((n) => n.item === l.item)?.nameEn ?? l.item;
      return `${name} (${Math.round(l.chance * 100)}%)`;
    });

  // Overview
  let overview = `${boss.name} is ${catDesc} in Don't Starve Together. `;
  overview += `Defeating ${boss.name} rewards players with valuable loot including ${uniqueItems.slice(0, 5).join(", ")}`;
  if (uniqueItems.length > 5) overview += `, and more`;
  overview += ". ";
  overview += catTip;

  // Loot description
  let lootDescription = "";
  if (guaranteedLoot.length > 0) {
    lootDescription += `${boss.name} always drops: ${guaranteedLoot.join(", ")}. `;
  }
  if (rareLoot.length > 0) {
    lootDescription += `Rare drops include: ${rareLoot.join(", ")}. `;
  }
  lootDescription += `Some of these drops are used in crafting powerful items and structures.`;

  // Strategy
  let strategy = `When fighting ${boss.name}, preparation is key. `;
  strategy += `Bring strong armor and weapons, along with healing food. `;
  if (boss.category === "seasonal") {
    strategy += `As a seasonal boss, ${boss.name} will appear regardless of player readiness, so prepare in advance.`;
  } else if (boss.category === "raid") {
    strategy += `${boss.name} is a challenging raid boss. Consider fighting with a team for the best results.`;
  } else if (boss.category === "ocean") {
    strategy += `Since ${boss.name} is an ocean boss, ensure your boat is repaired and bring boat-repair supplies.`;
  } else {
    strategy += `Study ${boss.name}'s attack patterns and use kiting to avoid damage.`;
  }

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `What does ${boss.name} drop?`,
      answer: `${boss.name} drops ${uniqueItems.join(", ")}. ${guaranteedLoot.length > 0 ? `Guaranteed drops include ${guaranteedLoot.join(", ")}.` : ""}`,
    },
    {
      question: `What type of boss is ${boss.name}?`,
      answer: `${boss.name} is ${catDesc} in Don't Starve Together. ${catTip}`,
    },
    {
      question: `How do you beat ${boss.name} in DST?`,
      answer: `To defeat ${boss.name}, bring armor, healing food, and strong weapons. Use kiting techniques to dodge attacks and deal damage during openings.`,
    },
  ];

  return { overview, lootDescription, strategy, faq };
}

// ===========================
// ITEM SEO
// ===========================

export interface ItemSeoContent {
  howToCraft: string;
  usesAndTips: string;
  faq: { question: string; answer: string }[];
}

export function generateItemSeoText(
  item: {
    name: string;
    description: string;
    station: string;
    materials: { name: string; quantity: number; slug?: string }[];
    characterOnly?: string | null;
    category: string[];
    healthCost?: number;
  },
  stationLabel: string,
  characterName?: string | null,
  usedInNames?: string[],
): ItemSeoContent {
  const matList = item.materials.map((m) => `${m.name} ×${m.quantity}`).join(", ");
  const isHandCraft = item.station === "none";

  // How to craft
  let howToCraft = `${item.name} is a craftable item in Don't Starve Together. `;
  if (item.characterOnly && characterName) {
    howToCraft += `This item is exclusive to ${characterName} and cannot be crafted by other characters. `;
  }
  howToCraft += `To craft ${item.name}, you need: ${matList}. `;
  if (isHandCraft) {
    howToCraft += `It can be crafted by hand without any crafting station.`;
  } else {
    howToCraft += `You need a ${stationLabel} to craft this item.`;
  }
  if (item.healthCost) {
    howToCraft += ` Crafting costs ${item.healthCost} health.`;
  }

  // Uses and tips
  let usesAndTips = `${item.description} `;
  const cats = item.category.filter((c) => c !== "all" && c !== "character");
  if (cats.length > 0) {
    const catLabels = cats.map((c) => c.replace(/_/g, " "));
    usesAndTips += `${item.name} falls under the ${catLabels.join(" and ")} category. `;
  }
  if (usedInNames && usedInNames.length > 0) {
    usesAndTips += `${item.name} is also used as a crafting material for: ${usedInNames.join(", ")}.`;
  }

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `How do you craft ${item.name} in DST?`,
      answer: `To craft ${item.name}, you need ${matList}. ${isHandCraft ? "It can be crafted by hand." : `Use a ${stationLabel} to craft it.`}`,
    },
    {
      question: `What materials are needed for ${item.name}?`,
      answer: `${item.name} requires: ${matList}.`,
    },
  ];

  if (item.characterOnly && characterName) {
    faq.push({
      question: `Can any character craft ${item.name}?`,
      answer: `No. ${item.name} is exclusive to ${characterName} and cannot be crafted by other characters.`,
    });
  }

  if (usedInNames && usedInNames.length > 0) {
    faq.push({
      question: `What is ${item.name} used for?`,
      answer: `${item.name} is used as a crafting material for: ${usedInNames.join(", ")}.`,
    });
  }

  return { howToCraft, usesAndTips, faq };
}

// ===========================
// CHARACTER SEO
// ===========================

const difficultyDescriptions: Record<string, string> = {
  easy: "a beginner-friendly character",
  normal: "a character with moderate complexity",
  hard: "a challenging character suited for experienced players",
};

export interface CharacterSeoContent {
  overview: string;
  perksDescription: string;
  playstyle: string;
  faq: { question: string; answer: string }[];
}

export function generateCharacterSeoText(
  char: {
    name: string;
    health: number;
    hunger: number;
    sanity: number;
    perks: string[];
    difficulty: "easy" | "normal" | "hard";
    motto?: string;
  },
  exclusiveItemCount: number,
): CharacterSeoContent {
  const diffDesc = difficultyDescriptions[char.difficulty] ?? "a playable character";

  // Overview
  let overview = `${char.name} is ${diffDesc} in Don't Starve Together. `;
  if (char.motto) {
    overview += `Their motto is: "${char.motto}" `;
  }
  overview += `${char.name} has ${char.health} Health, ${char.hunger} Hunger, and ${char.sanity} Sanity. `;
  if (exclusiveItemCount > 0) {
    overview += `${char.name} has ${exclusiveItemCount} exclusive craftable items that other characters cannot make.`;
  }

  // Perks description
  let perksDescription = `${char.name} stands out with unique abilities. `;
  perksDescription += char.perks.join(". ") + ". ";
  if (char.difficulty === "easy") {
    perksDescription += `These traits make ${char.name} an excellent choice for players new to Don't Starve Together.`;
  } else if (char.difficulty === "hard") {
    perksDescription += `These mechanics add complexity, making ${char.name} a rewarding challenge for veteran players.`;
  } else {
    perksDescription += `This balanced kit makes ${char.name} a versatile choice for most playstyles.`;
  }

  // Playstyle
  let playstyle = "";
  const hasHighHealth = char.health >= 200;
  const hasLowHealth = char.health < 100;
  const hasHighSanity = char.sanity >= 200;
  const hasHighHunger = char.hunger >= 200;

  if (hasHighHealth) {
    playstyle += `With ${char.health} health, ${char.name} is well-suited for combat-heavy playstyles. `;
  } else if (hasLowHealth) {
    playstyle += `With only ${char.health} health, ${char.name} requires careful play to avoid taking damage. `;
  }
  if (hasHighSanity) {
    playstyle += `A sanity pool of ${char.sanity} gives ${char.name} more room to explore dangerous areas. `;
  }
  if (hasHighHunger) {
    playstyle += `The large hunger capacity of ${char.hunger} means ${char.name} needs a reliable food supply. `;
  }
  playstyle += `Overall, ${char.name} is best played by those who enjoy ${char.difficulty === "easy" ? "a straightforward survival experience" : char.difficulty === "hard" ? "mastering complex mechanics for powerful rewards" : "a balanced approach to survival and exploration"}.`;

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `What are ${char.name}'s perks in DST?`,
      answer: char.perks.join(". ") + ".",
    },
    {
      question: `What are ${char.name}'s stats?`,
      answer: `${char.name} has ${char.health} Health, ${char.hunger} Hunger, and ${char.sanity} Sanity.`,
    },
    {
      question: `Is ${char.name} good for beginners?`,
      answer: char.difficulty === "easy"
        ? `Yes! ${char.name} is one of the best characters for beginners in Don't Starve Together.`
        : char.difficulty === "hard"
          ? `${char.name} is considered a challenging character and is recommended for experienced players.`
          : `${char.name} has moderate complexity and can be a good choice once you understand the basics of the game.`,
    },
  ];

  if (exclusiveItemCount > 0) {
    faq.push({
      question: `How many exclusive items does ${char.name} have?`,
      answer: `${char.name} has ${exclusiveItemCount} exclusive craftable items that only they can craft.`,
    });
  }

  return { overview, perksDescription, playstyle, faq };
}

// ===========================
// SKILL TREE SEO
// ===========================

export interface SkillTreeSeoContent {
  overview: string;
  branchesDescription: string;
  howToUse: string;
  faq: { question: string; answer: string }[];
}

export function generateSkillTreeSeoText(
  char: {
    name: string;
    health: number;
    hunger: number;
    sanity: number;
    difficulty: "easy" | "normal" | "hard";
  },
  tree: CharacterSkillTree,
  groupNames: Record<string, string>,
  skillCount: number,
  unlockedItemCount: number,
): SkillTreeSeoContent {
  const branchNames = tree.groups.map((g) => groupNames[g.id] ?? g.id);
  const branchList = branchNames.join(", ");
  const hasAllegiance = tree.groups.some((g) => g.id === "allegiance");

  // Overview
  let overview = `${char.name}'s Skill Tree in Don't Starve Together contains ${skillCount} learnable skills across ${tree.groups.length} branches: ${branchList}. `;
  overview += `Skills are earned by gaining experience points and each skill provides unique passive or active bonuses. `;
  if (unlockedItemCount > 0) {
    overview += `${char.name}'s skill tree also unlocks ${unlockedItemCount} exclusive craftable items that become available as specific skills are learned. `;
  }
  if (hasAllegiance) {
    overview += `The tree includes an Affinity branch, allowing ${char.name} to align with either Lunar or Shadow forces for powerful late-game abilities.`;
  }

  // Branches description
  const branchDescParts: string[] = [];
  for (const group of tree.groups) {
    const groupName = groupNames[group.id] ?? group.id;
    const nodesInGroup = tree.nodes.filter(
      (n) => n.group === group.id && n.icon,
    );
    branchDescParts.push(
      `The ${groupName} branch has ${nodesInGroup.length} skills`,
    );
  }
  let branchesDescription = `${char.name}'s skill tree is divided into ${tree.groups.length} distinct branches. `;
  branchesDescription += branchDescParts.join(". ") + ". ";
  branchesDescription += `Players can mix and match skills from different branches to create builds that complement their playstyle.`;

  // How to use
  let howToUse = `To use ${char.name}'s skill tree in Don't Starve Together, earn experience points by surviving and completing activities. `;
  howToUse += `Spend skill points to unlock nodes in any branch. Some advanced skills require prerequisite skills to be learned first. `;
  if (hasAllegiance) {
    howToUse += `The Affinity branch requires defeating specific bosses (Ancient Fuelweaver or Celestial Champion) and choosing between Lunar and Shadow allegiance — you cannot have both. `;
  }
  howToUse += `Use the skill tree simulator on this site to plan your build before committing in-game.`;

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `How many skills does ${char.name} have in DST?`,
      answer: `${char.name} has ${skillCount} learnable skills spread across ${tree.groups.length} branches: ${branchList}.`,
    },
    {
      question: `What are ${char.name}'s skill tree branches?`,
      answer: `${char.name}'s skill tree branches are: ${branchList}. Each branch focuses on different aspects of the character's abilities.`,
    },
    {
      question: `How do you unlock skills for ${char.name}?`,
      answer: `Earn experience points by surviving and completing activities in Don't Starve Together, then spend skill points on nodes in ${char.name}'s skill tree. Some nodes require prerequisite skills.`,
    },
  ];

  if (unlockedItemCount > 0) {
    faq.push({
      question: `Does ${char.name}'s skill tree unlock new items?`,
      answer: `Yes. ${char.name}'s skill tree unlocks ${unlockedItemCount} exclusive craftable items as you learn specific skills.`,
    });
  }

  if (hasAllegiance) {
    faq.push({
      question: `Can ${char.name} have both Lunar and Shadow allegiance?`,
      answer: `No. ${char.name} must choose between Lunar and Shadow allegiance. Each path requires defeating a different boss and excludes the other faction.`,
    });
  }

  return { overview, branchesDescription, howToUse, faq };
}

// ===========================================================================
// KOREAN SEO TEXT GENERATORS
// ===========================================================================
// Korean particle helper — picks form based on final consonant (받침) of last syllable
function hasJongseong(s: string): boolean {
  if (!s) return false;
  const last = s.charCodeAt(s.length - 1);
  if (last >= 0xac00 && last <= 0xd7a3) {
    return ((last - 0xac00) % 28) !== 0;
  }
  // Non-Hangul fallback: rough heuristic on last letter
  const c = s[s.length - 1].toLowerCase();
  if (/[aeiouy]/.test(c)) return false;
  if (/[a-z]/.test(c)) return true;
  return false;
}
function pp(s: string, withFinal: string, withoutFinal: string): string {
  return s + (hasJongseong(s) ? withFinal : withoutFinal);
}

// ===========================
// FOOD SEO (KO)
// ===========================

const foodTypeDescriptionsKo: Record<string, string> = {
  meat: "고기 요리",
  veggie: "채소 요리",
  goodies: "달콤한 디저트",
  roughage: "거친 음식",
  generic: "일반 요리",
  nonfood: "비식품 아이템",
};

const specialEffectDescriptionsKo: Record<string, string> = {
  health_regen: "시간이 지나면서 체력을 서서히 회복시킨다",
  sleep: "섭취 시 플레이어를 잠들게 한다",
  beefalo_food: "비팔로 길들이기에 사용할 수 있다",
  speed: "일시적인 이동속도 증가 효과를 부여한다",
  sanity_aura: "주변에 정신력 회복 오라를 제공한다",
  dust_moth_food: "먼지 나방의 먹이로, 고대 기록 보관소 퀘스트에 사용된다",
  hunger_regen: "착용 중 시간이 지나면서 허기를 천천히 회복시킨다",
};

function describeStatsKo(health: number, hunger: number, sanity: number): string {
  const parts: string[] = [];
  if (hunger >= 75) parts.push("허기를 매우 크게");
  else if (hunger >= 50) parts.push("허기를 크게");
  else if (hunger >= 30) parts.push("허기를 적당히");
  else if (hunger > 0) parts.push("허기를 약간");

  if (health >= 40) parts.push("체력을 크게");
  else if (health >= 20) parts.push("체력을 적당히");
  else if (health > 0) parts.push("체력을 약간");
  else if (health < 0) parts.push(`체력을 ${Math.abs(health)} 깎고`);

  if (sanity >= 30) parts.push("정신력을 크게");
  else if (sanity >= 10) parts.push("정신력을 적당히");
  else if (sanity > 0) parts.push("정신력을 약간");
  else if (sanity < 0) parts.push(`정신력을 ${Math.abs(sanity)} 깎고`);

  if (parts.length === 0) return "스탯 회복량이 미미합니다";
  return parts.join(", ") + " 회복합니다";
}

function describeBestUseKo(health: number, hunger: number, sanity: number): string {
  if (hunger >= 60 && health < 10) return "안정적인 허기 보충용 음식";
  if (health >= 40) return "훌륭한 회복용 음식";
  if (sanity >= 30) return "정신력 회복에 탁월한 음식";
  if (hunger >= 40 && health >= 10) return "균형 잡힌 만능 음식";
  if (hunger >= 30) return "괜찮은 허기 보충용 음식";
  return "유용한 음식 옵션";
}

export function generateFoodSeoTextKo(
  recipe: CookingRecipe,
  nameKo: string,
  ingredientKoNames?: { id: string; nameKo: string }[],
): FoodSeoContent {
  const stationKo = recipe.station === "portablecookpot" ? "휴대용 요리솥" : "요리솥";
  const typeKo = foodTypeDescriptionsKo[recipe.foodType] ?? "요리";
  const statsKo = describeStatsKo(recipe.health, recipe.hunger, recipe.sanity);
  const bestUseKo = describeBestUseKo(recipe.health, recipe.hunger, recipe.sanity);

  // How to cook
  let howToCook = `${pp(nameKo, "은", "는")} Don't Starve Together에서 ${stationKo}으로 만들 수 있는 ${typeKo}입니다. `;
  howToCook += `${pp(nameKo, "을", "를")} 만들려면 다음 재료가 필요합니다: ${recipe.requirements}. `;
  howToCook += `조리 시간은 ${recipe.cookTime}초이며`;
  if (recipe.priority > 1) {
    howToCook += `, 우선순위는 ${recipe.priority}이라 비슷한 재료의 다른 레시피보다 우선해서 만들어집니다`;
  }
  howToCook += ". ";
  if (recipe.perishDays !== null) {
    howToCook += `${pp(nameKo, "은", "는")} ${recipe.perishDays}일이 지나면 상하므로 보관에 주의하세요.`;
  } else {
    howToCook += `${pp(nameKo, "은", "는")} 절대 상하지 않아 장기 보관에 적합합니다.`;
  }
  if (recipe.station === "portablecookpot") {
    howToCook += ` 참고: 이 레시피는 월리의 휴대용 요리솥 전용으로, 일반 요리솥에서는 만들 수 없습니다.`;
  }

  // Best ingredients
  let bestIngredients: string | null = null;
  if (recipe.cardIngredients && recipe.cardIngredients.length > 0 && ingredientKoNames) {
    const ingList = recipe.cardIngredients
      .map(([id, qty]) => {
        const ing = ingredientKoNames.find((x) => x.id === id);
        return `${ing?.nameKo ?? id} ×${qty}`;
      })
      .join(", ");
    bestIngredients = `${nameKo}을(를) 만드는 추천 조합은 다음과 같습니다: ${ingList}. `;
    bestIngredients += `흔히 구할 수 있는 재료로 만들 수 있어 효율적인 레시피 중 하나입니다.`;
  }

  // Stats
  let statsExplanation = `${nameKo}은(는) ${statsKo}. `;
  statsExplanation += `이 때문에 ${bestUseKo}으로 분류됩니다`;
  if (recipe.temperature !== undefined) {
    const tempType = recipe.temperature > 0 ? "온열" : "냉각";
    statsExplanation += `. 또한 ${recipe.temperature > 0 ? "+" : ""}${recipe.temperature}°C의 ${tempType} 효과를 ${recipe.temperatureDuration}초 동안 제공하여 ${recipe.temperature > 0 ? "겨울" : "여름"}에 유용합니다`;
  }
  if (recipe.specialEffect) {
    const effectKo = specialEffectDescriptionsKo[recipe.specialEffect] ?? recipe.specialEffect;
    statsExplanation += `. 추가로 ${effectKo}`;
  }
  statsExplanation += ".";

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `${nameKo}을(를) 만들려면 무엇이 필요한가요?`,
      answer: `${nameKo}을(를) 만들려면 다음이 필요합니다: ${recipe.requirements}. ${stationKo}에서 조리하세요.`,
    },
    {
      question: `${nameKo}은(는) 허기를 얼마나 회복시키나요?`,
      answer: `${nameKo}은(는) 허기 ${recipe.hunger}, 체력 ${recipe.health > 0 ? "+" : ""}${recipe.health}, 정신력 ${recipe.sanity > 0 ? "+" : ""}${recipe.sanity}을(를) 회복시킵니다.`,
    },
  ];

  if (recipe.perishDays !== null) {
    faq.push({
      question: `${nameKo}은(는) 며칠이면 상하나요?`,
      answer: `${nameKo}은(는) ${recipe.perishDays}일 후 상합니다. 아이스박스에 보관하면 신선도를 더 오래 유지할 수 있습니다.`,
    });
  }

  if (recipe.station === "portablecookpot") {
    faq.push({
      question: `${nameKo}을(를) 일반 요리솥에서도 만들 수 있나요?`,
      answer: `아니요. ${nameKo}은(는) 월리의 휴대용 요리솥 전용 레시피라 일반 요리솥에서는 만들 수 없습니다.`,
    });
  }

  if (recipe.cardIngredients && ingredientKoNames) {
    const ingList = recipe.cardIngredients
      .map(([id, qty]) => {
        const ing = ingredientKoNames.find((x) => x.id === id);
        return `${ing?.nameKo ?? id} ×${qty}`;
      })
      .join(", ");
    faq.push({
      question: `${nameKo}을(를) 만드는 가장 좋은 레시피는?`,
      answer: `추천 조합: ${ingList}. 흔히 구할 수 있는 재료로 ${nameKo}을(를) 효율적으로 만들 수 있는 방법입니다.`,
    });
  }

  return { howToCook, bestIngredients, statsExplanation, faq };
}

// ===========================
// BOSS SEO (KO)
// ===========================

const categorySeasonsKo: Record<string, string> = {
  seasonal: "계절 보스",
  raid: "레이드 보스",
  ocean: "바다 보스",
  dungeon: "던전 보스",
  event: "이벤트 보스",
  mini: "미니 보스",
};

const categoryTipsKo: Record<string, string> = {
  seasonal: "계절 보스는 특정 시기에 등장하므로 생존을 위해 반드시 처치해야 합니다.",
  raid: "레이드 보스는 강력한 적으로, 충분한 준비가 필요합니다. 교전 전에 갑옷, 무기, 회복 음식을 챙기세요.",
  ocean: "바다 보스는 항해 중 마주칩니다. 배의 내구도를 점검하고 원거리 무기를 준비하세요.",
  dungeon: "던전 보스는 폐허 깊숙한 곳에 있습니다. 광원과 강력한 장비를 준비하세요.",
  event: "이벤트 보스는 특별한 게임 이벤트 동안 등장하며, 다른 곳에서 얻을 수 없는 보상을 줍니다.",
  mini: "미니 보스는 위력이 덜하지만 여전히 위험합니다. 탐험 중 갑작스럽게 등장할 수 있습니다.",
};

export function generateBossSeoTextKo(
  boss: Boss,
  lootKoNames: { item: string; nameKo: string }[],
): BossSeoContent {
  const nameKo = boss.nameKo;
  const catKo = categorySeasonsKo[boss.category] ?? "보스";
  const catTipKo = categoryTipsKo[boss.category] ?? "";

  const uniqueItems = [...new Set(lootKoNames.map((l) => l.nameKo))];
  const guaranteedLoot = boss.loot
    .filter((l, i, arr) => l.chance >= 1 && arr.findIndex((x) => x.item === l.item) === i)
    .map((l) => lootKoNames.find((n) => n.item === l.item)?.nameKo ?? l.item);
  const rareLoot = boss.loot
    .filter((l, i, arr) => l.chance < 1 && arr.findIndex((x) => x.item === l.item) === i)
    .map((l) => {
      const name = lootKoNames.find((n) => n.item === l.item)?.nameKo ?? l.item;
      return `${name} (${Math.round(l.chance * 100)}%)`;
    });

  // Overview
  let overview = `${nameKo}은(는) Don't Starve Together의 ${catKo}입니다. `;
  overview += `${nameKo}을(를) 처치하면 ${uniqueItems.slice(0, 5).join(", ")}`;
  if (uniqueItems.length > 5) overview += ` 등`;
  overview += ` 같은 귀중한 전리품을 얻을 수 있습니다. `;
  overview += catTipKo;

  // Loot
  let lootDescription = "";
  if (guaranteedLoot.length > 0) {
    lootDescription += `${nameKo}은(는) 항상 다음을 떨어뜨립니다: ${guaranteedLoot.join(", ")}. `;
  }
  if (rareLoot.length > 0) {
    lootDescription += `희귀 드롭: ${rareLoot.join(", ")}. `;
  }
  lootDescription += `이 드롭들 중 일부는 강력한 아이템과 구조물 제작에 사용됩니다.`;

  // Strategy
  let strategy = `${nameKo}와(과) 전투할 때는 준비가 핵심입니다. `;
  strategy += `튼튼한 갑옷과 무기, 회복 음식을 챙기세요. `;
  if (boss.category === "seasonal") {
    strategy += `계절 보스이므로 ${nameKo}은(는) 플레이어의 준비 상태와 무관하게 등장하니 미리 대비해야 합니다.`;
  } else if (boss.category === "raid") {
    strategy += `${nameKo}은(는) 도전적인 레이드 보스입니다. 팀을 꾸려 함께 싸우는 것을 추천합니다.`;
  } else if (boss.category === "ocean") {
    strategy += `${nameKo}은(는) 바다 보스이므로 배를 수리하고 보트 수리 자재를 챙기세요.`;
  } else {
    strategy += `${nameKo}의 공격 패턴을 익히고 카이팅으로 피해를 회피하세요.`;
  }

  const faq: { question: string; answer: string }[] = [
    {
      question: `${nameKo}은(는) 무엇을 떨어뜨리나요?`,
      answer: `${nameKo}은(는) ${uniqueItems.join(", ")}을(를) 떨어뜨립니다. ${guaranteedLoot.length > 0 ? `확정 드롭: ${guaranteedLoot.join(", ")}.` : ""}`,
    },
    {
      question: `${nameKo}은(는) 어떤 종류의 보스인가요?`,
      answer: `${nameKo}은(는) Don't Starve Together의 ${catKo}입니다. ${catTipKo}`,
    },
    {
      question: `DST에서 ${nameKo}은(는) 어떻게 잡나요?`,
      answer: `${nameKo}을(를) 잡으려면 갑옷, 회복 음식, 강력한 무기를 챙기세요. 카이팅으로 공격을 피하고 빈틈에 피해를 누적시키세요.`,
    },
  ];

  return { overview, lootDescription, strategy, faq };
}

// ===========================
// ITEM SEO (KO)
// ===========================

export function generateItemSeoTextKo(
  item: {
    nameKo: string;
    descriptionKo: string;
    station: string;
    materials: { nameKo: string; quantity: number }[];
    characterOnly?: string | null;
    category: string[];
    healthCost?: number;
  },
  stationLabelKo: string,
  characterNameKo?: string | null,
  usedInKoNames?: string[],
): ItemSeoContent {
  const matList = item.materials.map((m) => `${m.nameKo} ×${m.quantity}`).join(", ");
  const isHandCraft = item.station === "none";

  // How to craft
  let howToCraft = `${pp(item.nameKo, "은", "는")} Don't Starve Together에서 제작 가능한 아이템입니다. `;
  if (item.characterOnly && characterNameKo) {
    howToCraft += `이 아이템은 ${characterNameKo} 전용이며, 다른 캐릭터는 제작할 수 없습니다. `;
  }
  howToCraft += `${pp(item.nameKo, "을", "를")} 제작하려면 다음 재료가 필요합니다: ${matList}. `;
  if (isHandCraft) {
    howToCraft += `제작대 없이 손으로 만들 수 있습니다.`;
  } else {
    howToCraft += `제작에는 ${stationLabelKo}이(가) 필요합니다.`;
  }
  if (item.healthCost) {
    howToCraft += ` 제작 시 체력 ${item.healthCost}을(를) 소모합니다.`;
  }

  // Uses and tips
  let usesAndTips = `${item.descriptionKo} `;
  const cats = item.category.filter((c) => c !== "all" && c !== "character");
  if (cats.length > 0) {
    const catLabels = cats.map((c) => c.replace(/_/g, " "));
    usesAndTips += `${item.nameKo}은(는) ${catLabels.join(", ")} 카테고리에 속합니다. `;
  }
  if (usedInKoNames && usedInKoNames.length > 0) {
    usesAndTips += `${item.nameKo}은(는) 다음 아이템의 제작 재료로도 사용됩니다: ${usedInKoNames.join(", ")}.`;
  }

  // FAQ
  const faq: { question: string; answer: string }[] = [
    {
      question: `DST에서 ${item.nameKo}은(는) 어떻게 만드나요?`,
      answer: `${item.nameKo}을(를) 만들려면 ${matList}이(가) 필요합니다. ${isHandCraft ? "손으로 제작할 수 있습니다." : `${stationLabelKo}을(를) 사용하여 제작하세요.`}`,
    },
    {
      question: `${item.nameKo} 제작에는 어떤 재료가 필요한가요?`,
      answer: `${item.nameKo}에는 다음 재료가 필요합니다: ${matList}.`,
    },
  ];

  if (item.characterOnly && characterNameKo) {
    faq.push({
      question: `모든 캐릭터가 ${item.nameKo}을(를) 만들 수 있나요?`,
      answer: `아니요. ${item.nameKo}은(는) ${characterNameKo} 전용이며, 다른 캐릭터는 제작할 수 없습니다.`,
    });
  }

  if (usedInKoNames && usedInKoNames.length > 0) {
    faq.push({
      question: `${item.nameKo}은(는) 어디에 사용되나요?`,
      answer: `${item.nameKo}은(는) 다음 아이템의 제작 재료로 사용됩니다: ${usedInKoNames.join(", ")}.`,
    });
  }

  return { howToCraft, usesAndTips, faq };
}

// ===========================
// CHARACTER SEO (KO)
// ===========================

const difficultyDescriptionsKo: Record<string, string> = {
  easy: "초보자에게 적합한 캐릭터",
  normal: "보통 난이도의 캐릭터",
  hard: "숙련된 플레이어에게 적합한 도전적인 캐릭터",
};

export function generateCharacterSeoTextKo(
  char: {
    nameKo: string;
    titleKo?: string;
    mottoKo?: string;
    health: number;
    hunger: number;
    sanity: number;
    perksKo: string[];
    difficulty: "easy" | "normal" | "hard";
  },
  exclusiveItemCount: number,
): CharacterSeoContent {
  const diffKo = difficultyDescriptionsKo[char.difficulty] ?? "플레이 가능한 캐릭터";

  let overview = `${pp(char.nameKo, "은", "는")} Don't Starve Together의 ${diffKo}입니다. `;
  if (char.mottoKo) {
    overview += `이 캐릭터의 좌우명: "${char.mottoKo}" `;
  }
  overview += `${char.nameKo}의 기본 스탯은 체력 ${char.health}, 허기 ${char.hunger}, 정신력 ${char.sanity}입니다. `;
  if (exclusiveItemCount > 0) {
    overview += `${char.nameKo}은(는) 다른 캐릭터가 만들 수 없는 ${exclusiveItemCount}개의 전용 제작 아이템을 보유하고 있습니다.`;
  }

  let perksDescription = `${char.nameKo}은(는) 고유한 능력을 가지고 있습니다. `;
  perksDescription += char.perksKo.join(". ") + ". ";
  if (char.difficulty === "easy") {
    perksDescription += `이런 특성 덕분에 ${char.nameKo}은(는) Don't Starve Together를 처음 시작하는 플레이어에게 좋은 선택입니다.`;
  } else if (char.difficulty === "hard") {
    perksDescription += `이런 메커니즘은 복잡도를 더해, ${char.nameKo}을(를) 베테랑 플레이어에게 보람 있는 도전 캐릭터로 만듭니다.`;
  } else {
    perksDescription += `균형 잡힌 능력 덕분에 ${char.nameKo}은(는) 다양한 플레이 스타일에 대응할 수 있는 다재다능한 캐릭터입니다.`;
  }

  let playstyle = "";
  const hasHighHealth = char.health >= 200;
  const hasLowHealth = char.health < 100;
  const hasHighSanity = char.sanity >= 200;
  const hasHighHunger = char.hunger >= 200;

  if (hasHighHealth) {
    playstyle += `체력 ${char.health}으로, ${char.nameKo}은(는) 전투 중심 플레이에 잘 맞습니다. `;
  } else if (hasLowHealth) {
    playstyle += `체력이 ${char.health}밖에 안 되므로 ${char.nameKo}은(는) 피해를 피하기 위해 신중한 플레이가 필요합니다. `;
  }
  if (hasHighSanity) {
    playstyle += `정신력 ${char.sanity}을(를) 확보하고 있어 ${char.nameKo}은(는) 위험한 지역을 탐험할 여유가 있습니다. `;
  }
  if (hasHighHunger) {
    playstyle += `허기 용량이 ${char.hunger}로 커서 ${char.nameKo}은(는) 안정적인 식량 공급이 필요합니다. `;
  }
  playstyle += `종합하자면 ${char.nameKo}은(는) ${char.difficulty === "easy" ? "직관적인 생존을 즐기는 플레이어" : char.difficulty === "hard" ? "복잡한 메커니즘을 익혀 강력한 보상을 얻고자 하는 플레이어" : "생존과 탐험의 균형을 즐기는 플레이어"}에게 가장 잘 맞습니다.`;

  const faq: { question: string; answer: string }[] = [
    {
      question: `${char.nameKo}의 특성은 무엇인가요?`,
      answer: char.perksKo.join(". ") + ".",
    },
    {
      question: `${char.nameKo}의 스탯은 어떻게 되나요?`,
      answer: `${char.nameKo}의 기본 스탯은 체력 ${char.health}, 허기 ${char.hunger}, 정신력 ${char.sanity}입니다.`,
    },
    {
      question: `${char.nameKo}은(는) 초보자에게 좋은가요?`,
      answer: char.difficulty === "easy"
        ? `네! ${char.nameKo}은(는) Don't Starve Together 초보자에게 추천하는 캐릭터 중 하나입니다.`
        : char.difficulty === "hard"
          ? `${char.nameKo}은(는) 도전적인 캐릭터로, 숙련된 플레이어에게 추천합니다.`
          : `${char.nameKo}은(는) 보통 난이도라 게임의 기본기를 익힌 후에 도전하면 좋습니다.`,
    },
  ];

  if (exclusiveItemCount > 0) {
    faq.push({
      question: `${char.nameKo}은(는) 전용 아이템을 몇 개 가지고 있나요?`,
      answer: `${char.nameKo}은(는) 본인만 제작할 수 있는 전용 아이템 ${exclusiveItemCount}개를 보유하고 있습니다.`,
    });
  }

  return { overview, perksDescription, playstyle, faq };
}

// ===========================
// SKILL TREE SEO (KO)
// ===========================

export function generateSkillTreeSeoTextKo(
  char: { nameKo: string; difficulty: "easy" | "normal" | "hard" },
  tree: CharacterSkillTree,
  groupNamesKo: Record<string, string>,
  skillCount: number,
  unlockedItemCount: number,
): SkillTreeSeoContent {
  const branchNames = tree.groups.map((g) => groupNamesKo[g.id] ?? g.id);
  const branchList = branchNames.join(", ");
  const hasAllegiance = tree.groups.some((g) => g.id === "allegiance");

  let overview = `${char.nameKo}의 Don't Starve Together 스킬트리에는 ${tree.groups.length}개 분기에 걸쳐 ${skillCount}개의 학습 가능한 스킬이 있습니다: ${branchList}. `;
  overview += `스킬은 경험치를 모아 획득하며, 각 스킬은 고유한 패시브 또는 액티브 보너스를 제공합니다. `;
  if (unlockedItemCount > 0) {
    overview += `${char.nameKo}의 스킬트리는 특정 스킬을 학습할 때 해금되는 ${unlockedItemCount}개의 전용 제작 아이템도 포함합니다. `;
  }
  if (hasAllegiance) {
    overview += `스킬트리에는 친밀도 분기가 있어 ${char.nameKo}이(가) 달의 군세 또는 그림자 군세 중 한쪽에 정렬해 강력한 후반 능력을 얻을 수 있습니다.`;
  }

  const branchDescParts: string[] = [];
  for (const group of tree.groups) {
    const groupName = groupNamesKo[group.id] ?? group.id;
    const nodesInGroup = tree.nodes.filter((n) => n.group === group.id && n.icon);
    branchDescParts.push(`${groupName} 분기에는 ${nodesInGroup.length}개의 스킬이 있습니다`);
  }
  let branchesDescription = `${char.nameKo}의 스킬트리는 ${tree.groups.length}개의 독립된 분기로 나뉩니다. `;
  branchesDescription += branchDescParts.join(". ") + ". ";
  branchesDescription += `여러 분기의 스킬을 자유롭게 조합하여 자신의 플레이 스타일에 맞는 빌드를 만들 수 있습니다.`;

  let howToUse = `${char.nameKo}의 스킬트리를 활용하려면 Don't Starve Together에서 생존 활동을 통해 경험치를 모으세요. `;
  howToUse += `스킬 포인트로 원하는 분기의 노드를 해금할 수 있으며, 일부 고급 스킬은 선행 스킬이 필요합니다. `;
  if (hasAllegiance) {
    howToUse += `친밀도 분기는 특정 보스(고대 연료 직조꾼 또는 천상의 챔피언)를 처치한 뒤 달과 그림자 중 하나를 선택하는 방식이며 — 두 진영을 동시에 가질 수는 없습니다. `;
  }
  howToUse += `이 사이트의 스킬트리 시뮬레이터로 인게임에 적용하기 전에 빌드를 미리 계획해 보세요.`;

  const faq: { question: string; answer: string }[] = [
    {
      question: `${char.nameKo}은(는) DST에서 스킬을 몇 개 가지고 있나요?`,
      answer: `${char.nameKo}은(는) ${tree.groups.length}개 분기에 걸쳐 총 ${skillCount}개의 학습 가능한 스킬을 가지고 있습니다: ${branchList}.`,
    },
    {
      question: `${char.nameKo}의 스킬트리 분기는 무엇인가요?`,
      answer: `${char.nameKo}의 스킬트리 분기는 다음과 같습니다: ${branchList}. 각 분기는 캐릭터 능력의 서로 다른 측면에 집중되어 있습니다.`,
    },
    {
      question: `${char.nameKo}의 스킬은 어떻게 해금하나요?`,
      answer: `Don't Starve Together에서 생존 활동을 통해 경험치를 모은 뒤 스킬 포인트를 ${char.nameKo}의 스킬트리 노드에 사용하세요. 일부 노드는 선행 스킬이 필요합니다.`,
    },
  ];

  if (unlockedItemCount > 0) {
    faq.push({
      question: `${char.nameKo}의 스킬트리는 새 아이템을 해금하나요?`,
      answer: `네. ${char.nameKo}의 스킬트리는 특정 스킬을 학습하면 ${unlockedItemCount}개의 전용 제작 아이템이 해금됩니다.`,
    });
  }

  if (hasAllegiance) {
    faq.push({
      question: `${char.nameKo}이(가) 달과 그림자 양쪽 친밀도를 동시에 가질 수 있나요?`,
      answer: `아니요. ${char.nameKo}은(는) 달과 그림자 중 하나를 선택해야 하며, 각 경로는 서로 다른 보스를 처치해야 하고 다른 진영을 배제합니다.`,
    });
  }

  return { overview, branchesDescription, howToUse, faq };
}
