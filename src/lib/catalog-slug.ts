import { scrapbookStats } from "@/data/scrapbook-stats";
import { itemNames } from "@/data/item-names";
import { itemSlugs, nameToSlug } from "@/lib/slug";

/**
 * 제작 탭에 없는 스크랩북 아이템의 상세 페이지 슬러그 (#159, #144 2단계).
 *
 * 페이지를 만드는 조건: 스크랩북 `type: "item"` · 제작 아이템 페이지가 없음 · **스크랩북 설명이 있음**.
 * 설명 없이 묶음 크기 정도만 있는 아이템(겨울 장식품 등)은 페이지로 나눠도 내용이 없어서 아이템 도감에 그대로 둔다.
 *
 * `/item/<slug>` 주소를 제작 아이템과 같이 쓰므로 제작 아이템의 정식·레거시 슬러그와 겹치면 안 된다.
 * - 제작 아이템과 이름이 같으면 페이지를 만들지 않는다 — 같은 아이템이 제작 데이터에 다른 id로 있는 경우다
 *   (겨울 축제 음식 `cabbagerolls` ↔ 제작 쪽 id 등). 제작법 페이지가 이미 그 이름을 다룬다
 * - 도감 안에서 이름이 같은 아이템이 여럿이면(겨울 장식품 수십 종, 연구 노트 등) 전부 만들지 않는다 —
 *   이름도 설명도 거의 같은 페이지가 늘어날 뿐이다
 * 빠진 아이템은 아이템 도감에 인라인으로 남는다.
 *
 * scrapbook-stats 가 커서(1500여 개) 클라이언트 번들에 들어가는 `slug.ts` 와 파일을 나눴다 —
 * 이 파일은 서버 컴포넌트·사이트맵에서만 import 할 것.
 */

const idToSlug = new Map<string, string>();
const slugToId = new Map<string, string>();

{
  const taken = new Set(itemSlugs.allSlugs);
  const ids = Object.keys(scrapbookStats)
    .filter((id) => {
      const s = scrapbookStats[id];
      return s.type === "item" && !itemSlugs.idToSlug.has(id) && !!itemNames[id] && !!s.specialinfo_en;
    })
    .sort();
  const slugOf = (id: string) => nameToSlug(itemNames[id][0]) || id.replaceAll("_", "-");
  const count = new Map<string, number>();
  for (const id of ids) count.set(slugOf(id), (count.get(slugOf(id)) ?? 0) + 1);
  for (const id of ids) {
    const slug = slugOf(id);
    if (taken.has(slug) || count.get(slug) !== 1) continue;
    idToSlug.set(id, slug);
    slugToId.set(slug, id);
  }
}

export const catalogItemSlugs = { idToSlug, slugToId, allSlugs: [...slugToId.keys()] };

export function resolveCatalogItemSlug(slug: string): string | undefined {
  return slugToId.get(slug);
}

/** 아이템 id → 사이트 안 주소. 제작 페이지 → 도감 상세 페이지 → 도감 앵커 순. 스크랩북 아이템이 아니면 undefined */
export function itemHref(id: string, routePrefix: string): string | undefined {
  const slug = itemSlugs.idToSlug.get(id) ?? idToSlug.get(id);
  if (slug) return `${routePrefix}/item/${slug}`;
  return itemNames[id] ? `${routePrefix}/items#${id}` : undefined;
}
