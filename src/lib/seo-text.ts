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
