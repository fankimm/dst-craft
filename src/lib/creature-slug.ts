import { scrapbookStats } from "@/data/scrapbook-stats";
import { creatureNames } from "@/data/creature-names";
import { nameToSlug } from "@/lib/slug";

/**
 * 스크랩북 생물의 상세 페이지 슬러그 (/creature/<slug>) — #160, #145 2단계.
 *
 * 페이지를 만드는 조건: 스크랩북 `type: "creature"` · 이름 있음 · **체력·공격력·설명 중 하나는 있음** ·
 * **생물 도감 안에서 영문 이름이 유일**. 수치도 설명도 없는 생물은 페이지로 나눠도 내용이 없다.
 * 이름이 같은 생물이 여럿이면(변종이 같은 이름을 쓰는 경우) 전부 만들지 않는다 — 주소가 이름에서 나오고,
 * 이름이 같은 페이지는 검색에서 서로 구분되지 않는다. 빠진 생물은 생물 도감에 인라인으로만 남는다.
 *
 * 주소가 영문 이름에서 나오므로 **게임 패치로 이름이 바뀌면 주소가 바뀐다** — 옛 슬러그 301은 아직 없다.
 *
 * scrapbook-stats 가 커서 서버 컴포넌트·사이트맵에서만 import 할 것 (catalog-slug.ts 와 같은 이유).
 */

const idToSlug = new Map<string, string>();
const slugToId = new Map<string, string>();

{
  const ids = Object.keys(scrapbookStats)
    .filter((id) => {
      const s = scrapbookStats[id];
      const hasContent = s.health != null || s.damage != null || !!s.specialinfo_en;
      return s.type === "creature" && !!creatureNames[id] && hasContent;
    })
    .sort();
  const slugOf = (id: string) => nameToSlug(creatureNames[id][0]) || id.replaceAll("_", "-");
  const count = new Map<string, number>();
  for (const id of ids) count.set(slugOf(id), (count.get(slugOf(id)) ?? 0) + 1);
  for (const id of ids) {
    const slug = slugOf(id);
    if (count.get(slug) !== 1) continue;
    idToSlug.set(id, slug);
    slugToId.set(slug, id);
  }
}

export const creatureSlugs = { idToSlug, slugToId, allSlugs: [...slugToId.keys()] };

export function resolveCreatureSlug(slug: string): string | undefined {
  return slugToId.get(slug);
}

/** 생물 id → 사이트 안 주소. 상세 페이지 → 생물 도감 앵커 순. 스크랩북 생물이 아니면 undefined */
export function creatureHref(id: string, routePrefix: string): string | undefined {
  if (!creatureNames[id]) return undefined;
  const slug = idToSlug.get(id);
  return slug ? `${routePrefix}/creature/${slug}` : `${routePrefix}/creatures#${id}`;
}
