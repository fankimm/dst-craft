import { scrapbookStats } from "@/data/scrapbook-stats";
import { creatureNames } from "@/data/creature-names";
import { nameToSlug } from "@/lib/slug";
import { pp } from "@/lib/seo-text";

/**
 * 스크랩북 생물의 상세 페이지 슬러그 (/creature/<slug>) — #160, #145 2단계.
 *
 * 페이지를 만드는 조건: 스크랩북 `type: "creature"` · 이름 있음 · **체력·공격력·설명 중 하나는 있음** ·
 * **생물 도감 안에서 영문 이름이 유일**. 수치도 설명도 없는 생물은 페이지로 나눠도 내용이 없다.
 * 이름이 같은 생물이 여럿이면(변종이 같은 이름을 쓰는 경우) 전부 만들지 않는다 — 주소가 이름에서 나오고,
 * 이름이 같은 페이지는 검색에서 서로 구분되지 않는다. 빠진 생물은 생물 도감에 인라인으로만 남는다.
 * 단 `CREATURE_VARIANTS`에 구분 슬러그·라벨을 적어 둔 변종은 페이지를 만든다 (#180).
 *
 * 주소가 영문 이름에서 나오므로 **게임 패치로 이름이 바뀌면 주소가 바뀐다** — 옛 슬러그 301은 아직 없다.
 *
 * scrapbook-stats 가 커서 서버 컴포넌트·사이트맵에서만 import 할 것 (catalog-slug.ts 와 같은 이유).
 */

type Variant = {
  slug: string;
  /** 이름 뒤 괄호에 붙는 구분 라벨 [en, ko]. 이름 자체가 다르면(버니/버니!) 없다 */
  label?: [string, string];
  /** 라벨이 어디서 왔는지 한 줄 [en, ko] — 페이지 이름 아래에 그대로 보인다 */
  note?: [string, string];
};

/**
 * 영문 이름(슬러그)이 겹치는 변종의 구분 슬러그·라벨 (#180, #145 8단계).
 * - 먹빛 그림자: 라벨은 인게임 문자열 `STRINGS.NAMES.SHADOWTHRALL_*_ALLEGIANCE`(ko.po) —
 *   각 prefab의 displaynamefn이 그림자 진영 플레이어에게 이 이름을 보여 준다
 * - 코알라판트: 라벨은 prefab id(`koalefant_summer`/`_winter`)에서 온 **구분용 표기**고 게임 이름이 아니다.
 *   `components/hunter.lua`가 사냥 끝에 `iswinter`면 winter, 아니면 summer를 고른다
 * - 버니: 이름은 다르고("Bernie"/"BERNIE!") 슬러그만 겹친다
 * 새 변종이 겹치면 여기 넣기 전에는 페이지가 생기지 않는다. 슬러그가 기존 주소와 부딪히면 모듈 로드 시 throw.
 */
const ALLEGIANCE_NOTE = (en: string, ko: string): [string, string] => [
  `“${en}” is the name the game shows to shadow-aligned players; everyone else sees Ink Blight for all four.`,
  `'${ko}'${pp(ko, "은", "는").slice(ko.length)} 그림자 진영 플레이어에게 보이는 이름입니다. 그 밖의 플레이어에게는 네 종류 모두 '먹빛 그림자'로 보입니다.`,
];
const CREATURE_VARIANTS: Record<string, Variant> = {
  bernie_active: { slug: "bernie" },
  bernie_big: { slug: "bernie-big" },
  koalefant_summer: {
    slug: "koalefant-summer",
    label: ["Summer", "여름"],
    note: [
      "“Summer” is a label for telling the two apart, not an in-game name. A hunt ends in this variant in every season except winter.",
      "'여름'은 두 변종을 구분하려고 붙인 표기이고 게임 속 이름이 아닙니다. 겨울이 아닌 계절의 사냥 끝에 나오는 변종입니다.",
    ],
  },
  koalefant_winter: {
    slug: "koalefant-winter",
    label: ["Winter", "겨울"],
    note: [
      "“Winter” is a label for telling the two apart, not an in-game name. A hunt ends in this variant during winter.",
      "'겨울'은 두 변종을 구분하려고 붙인 표기이고 게임 속 이름이 아닙니다. 겨울의 사냥 끝에 나오는 변종입니다.",
    ],
  },
  shadowthrall_hands: { slug: "ink-blight-jitters", label: ["Jitters", "초조"], note: ALLEGIANCE_NOTE("Jitters", "초조") },
  shadowthrall_horns: { slug: "ink-blight-rasp", label: ["Rasp", "쉰소리"], note: ALLEGIANCE_NOTE("Rasp", "쉰소리") },
  shadowthrall_wings: { slug: "ink-blight-shriek", label: ["Shriek", "비명"], note: ALLEGIANCE_NOTE("Shriek", "비명") },
  shadowthrall_mouth: { slug: "ink-blight-rictus", label: ["Rictus", "쓴웃음"], note: ALLEGIANCE_NOTE("Rictus", "쓴웃음") },
};

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
  for (const [id, v] of Object.entries(CREATURE_VARIANTS)) {
    if (!ids.includes(id)) throw new Error(`[creature-slug] variant ${id} is not a creature with content`);
    if (idToSlug.has(id)) throw new Error(`[creature-slug] variant ${id} no longer collides — remove it from CREATURE_VARIANTS`);
    if (slugToId.has(v.slug)) throw new Error(`[creature-slug] variant slug ${v.slug} collides with ${slugToId.get(v.slug)}`);
    idToSlug.set(id, v.slug);
    slugToId.set(v.slug, id);
  }
}

/** 생물 이름 [en, ko] — 이름이 겹치는 변종은 "코알라판트 (겨울)"처럼 구분 라벨을 붙인다 */
export function creatureDisplayNames(id: string): [string, string] {
  const [en, ko] = creatureNames[id];
  const label = CREATURE_VARIANTS[id]?.label;
  return label ? [`${en} (${label[0]})`, `${ko} (${label[1]})`] : [en, ko];
}

/** 변종 구분 라벨의 출처 한 줄. 변종이 아니거나 라벨이 없으면 undefined */
export function creatureVariantNote(id: string, lang: "en" | "ko"): string | undefined {
  return CREATURE_VARIANTS[id]?.note?.[lang === "ko" ? 1 : 0];
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
