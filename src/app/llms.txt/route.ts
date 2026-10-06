import { allItems } from "@/data/items";
import { bosses } from "@/data/bosses";
import { characters } from "@/data/characters";
import { cookingRecipes } from "@/data/recipes";
import { quests } from "@/data/quests";
import { FARM_CROPS } from "@/data/farming";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import { dataSourceText } from "@/components/seo/list-schema";
import { canonicalForBoss, canonicalForFood, canonicalForQuest } from "@/lib/slug";

// /llms.txt — AI 검색·에이전트용 사이트 안내 (llmstxt.org 형식, #126)
//
// 빌드 때 데이터에서 생성하므로 페이지가 늘면 자동 반영된다. 아이템은 수백 개라 허브(/browse)와
// sitemap으로 넘기고, 개수가 적은 목록(보스·캐릭터·스킬트리·퀘스트·요리)만 직접 나열한다.
export const dynamic = "force-static";

const SITE_URL = "https://www.dstcraft.com";

export function GET() {
  const charName = (id: string) => characters.find((c) => c.id === id)?.name ?? id;
  const lines: string[] = [
    "# Don't Craft Without Recipes (dstcraft.com)",
    "",
    "> Free, unofficial guide for Don't Starve Together: every crafting recipe, crock pot recipe, boss, character, skill tree, quest checklist and farming crop combination. Korean versions live under /ko.",
    "",
    `${dataSourceText("en")}. Numbers (recipes, stats, nutrients, skill trees) are taken from the game's own scripts, not from wikis. Korean names follow the community Korean translation mod.`,
    "",
    "## Guides",
    `- [Browse everything](${SITE_URL}/browse): all ${allItems.length} crafting items, ${cookingRecipes.length} crock pot recipes and ${bosses.length} bosses`,
    `- [Crock Pot simulator & recipes](${SITE_URL}/cookpot): ingredient rules and stats for every crock pot dish`,
    `- [Farming guide](${SITE_URL}/farming): no-fertilizer crop combinations for each season, nutrients and water for ${FARM_CROPS.length} crops`,
    `- [Characters](${SITE_URL}/characters): stats, perks and exclusive items for every survivor`,
    `- [Skill trees](${SITE_URL}/skill-trees): skills and branches for ${CHARACTERS_WITH_SKILLS.length} characters`,
    `- [Quest checklists](${SITE_URL}/quests): step-by-step checklists for multi-stage content`,
    "",
    "## Skill trees",
    ...CHARACTERS_WITH_SKILLS.map((id) => `- [${charName(id)} skill tree](${SITE_URL}/skill-tree/${id})`),
    "",
    "## Bosses",
    ...bosses.map((b) => `- [${b.name}](${SITE_URL}/boss/${canonicalForBoss(b.id)})`),
    "",
    "## Quests",
    ...quests.map((q) => `- [${q.titleEn}](${SITE_URL}/quest/${canonicalForQuest(q.id)})`),
    "",
    "## Characters",
    ...characters.map((c) => `- [${c.name}](${SITE_URL}/character/${c.id})`),
    "",
    "## Optional",
    ...cookingRecipes.map((r) => `- [${r.name}](${SITE_URL}/food/${canonicalForFood(r.id)})`),
    `- [Sitemap with every item page](${SITE_URL}/sitemap.xml)`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
