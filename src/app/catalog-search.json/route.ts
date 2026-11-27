import { itemNames } from "@/data/item-names";
import { cookpotIngredients, ingredientImage } from "@/data/cookpot-ingredients";
import { catalogItemSlugs } from "@/lib/catalog-slug";
import { creatureDisplayNames, creatureSlugs } from "@/lib/creature-slug";
import { ingredientSlugs } from "@/lib/ingredient-slug";
import { hasGameItemImage } from "@/components/seo/ItemsCatalogContent";
import type { CatalogSearchEntry } from "@/lib/catalog-search";

// /catalog-search.json — 제작 탭 검색이 함께 찾는 상세 페이지 색인 (#165)
//
// 도감 아이템·생물·요리솥 재료 상세 페이지는 scrapbook-stats(수 MB)에서 대상을 고르므로 클라이언트 번들에
// 그 판단을 넣을 수 없다. 빌드 때 이름·경로·아이콘만 뽑아 정적 파일로 두고, 앱은 첫 검색 때 한 번 불러온다.
// 경로는 로캘 접두 없이(`/item/x`) 적고 앱이 `/ko`를 붙인다.
export const dynamic = "force-static";

export function GET() {
  const entries: CatalogSearchEntry[] = [];
  for (const [id, slug] of catalogItemSlugs.idToSlug) {
    const [en, ko] = itemNames[id];
    entries.push({ k: "item", en, ko, p: `/item/${slug}`, ...(hasGameItemImage(id) ? { i: `${id}.png` } : {}) });
  }
  for (const [id, slug] of creatureSlugs.idToSlug) {
    const [en, ko] = creatureDisplayNames(id);
    entries.push({ k: "creature", en, ko, p: `/creature/${slug}`, ...(hasGameItemImage(id) ? { i: `${id}.png` } : {}) });
  }
  for (const ing of cookpotIngredients) {
    const slug = ingredientSlugs.idToSlug.get(ing.id);
    if (!slug) continue;
    entries.push({ k: "ingredient", en: ing.name, ko: ing.nameKo ?? ing.name, p: `/ingredient/${slug}`, i: ingredientImage(ing) });
  }
  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
