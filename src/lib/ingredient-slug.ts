import { cookpotIngredients, type CookpotIngredient } from "@/data/cookpot-ingredients";
import { nameToSlug } from "@/lib/slug";

/**
 * 요리솥 재료 상세 페이지(`/ingredient/<slug>`) 슬러그 (#163, #144 4단계).
 *
 * 페이지를 만드는 조건:
 * - 요리솥에 실제로 들어가는 재료(태그 값이 하나라도 있음) — 빈 병처럼 아이콘용으로만 등록된 항목은 뺀다
 * - 구운·말린 형태는 원재료가 목록에 있으면 그 페이지의 한 행으로 들어간다 (따로 페이지를 만들지 않는다).
 *   말린 꽃잎처럼 원재료가 요리솥 재료가 아닌 것은 자기 페이지를 갖는다
 * - 영문 이름이 겹치면(옥수수 대구 소·중) 둘 다 만들지 않는다 — 도감 상세(catalog-slug.ts)와 같은 규칙
 *
 * `/item/<slug>`와 경로가 달라 제작·도감 아이템 슬러그와 겹쳐도 된다 (벌집·악몽 연료는 양쪽에 다 있다).
 * **재료 이름이 바뀌면 주소가 바뀐다** — 옛 슬러그 301은 아직 없다.
 */

const byId = new Map(cookpotIngredients.map((i) => [i.id, i]));

/** 구운·말린 형태의 원재료 id. 원재료가 요리솥 재료 목록에 없으면 undefined */
function baseIdOf(id: string): string | undefined {
  const m = id.match(/^(.*)_(cooked|dried)$/);
  return m && byId.has(m[1]) ? m[1] : undefined;
}

const idToSlug = new Map<string, string>();
const slugToId = new Map<string, string>();
{
  const pages = cookpotIngredients.filter((i) => Object.keys(i.tags).length > 0 && !baseIdOf(i.id));
  const count = new Map<string, number>();
  for (const i of pages) count.set(nameToSlug(i.name), (count.get(nameToSlug(i.name)) ?? 0) + 1);
  for (const i of pages) {
    const slug = nameToSlug(i.name);
    if (!slug || count.get(slug) !== 1) continue;
    idToSlug.set(i.id, slug);
    slugToId.set(slug, i.id);
  }
}

export const ingredientSlugs = { idToSlug, slugToId, allSlugs: [...slugToId.keys()] };

export function resolveIngredientSlug(slug: string): CookpotIngredient | undefined {
  const id = slugToId.get(slug);
  return id ? byId.get(id) : undefined;
}

/** 재료 id(구운·말린 형태 포함) → 재료 페이지 주소. 페이지가 없으면 undefined */
export function ingredientHref(id: string, routePrefix: string): string | undefined {
  const slug = idToSlug.get(id) ?? idToSlug.get(baseIdOf(id) ?? "");
  return slug ? `${routePrefix}/ingredient/${slug}` : undefined;
}
