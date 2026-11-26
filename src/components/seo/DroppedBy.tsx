import { creatureLoot } from "@/data/creature-loot";
import { creatureNames } from "@/data/creature-names";
import { bosses } from "@/data/bosses";
import { creatureHref } from "@/lib/creature-slug";
import { canonicalForBoss } from "@/lib/slug";
import { bossThumbPath } from "@/lib/asset-path";
import { L, type SeoLang } from "./labels";
import { LootCard, chancePercent } from "./LootCard";
import { hasGameItemImage } from "./ItemsCatalogContent";

/**
 * 아이템 상세 페이지의 "떨어뜨리는 생물" 구역 (#177, #145 5단계) — 도감 아이템 상세와 제작 아이템 상세가 같이 쓴다.
 * 생물 전리품(`creature-loot.ts`, 게임 코드에서 자동 생성)과 보스 전리품(`bosses.ts`)을 아이템 기준으로 뒤집은 것.
 * 새로 만든 수치는 없다. creature-slug 가 scrapbook-stats 를 끌어오므로 서버 컴포넌트에서만 쓸 것.
 */

type Row = { chance: number; count: number; pick?: number };
export type DropSource = {
  key: string;
  name: string;
  sub: string | null;
  image?: string;
  href?: string;
  rows: Row[];
};

/** 보스 전리품 가운데 그대로 뒤집을 수 있는 줄만 — 설계도·묶음 뽑기(pool)는 확률의 뜻이 달라 빼고,
 *  소제목(label)이 붙은 줄은 조건부이거나 여러 개체의 몫이라 뺀다 (자세한 표는 보스 페이지에 있다) */
const bossRows = (bossId: string, itemIds: string[]): Row[] =>
  (bosses.find((b) => b.id === bossId)?.loot ?? [])
    .filter((l) => itemIds.includes(l.item) && !l.blueprint && !l.pool && !l.label)
    .map((l) => ({ chance: l.chance, count: l.count ?? 1 }));

/**
 * 이 아이템을 처치 전리품으로 주는 보스·생물. 확률 높은 순 → 이름순, 보스가 먼저.
 * 제작 페이지는 같은 이름의 재료 id까지 같이 넘긴다 (`materialIdsOf`, #162)
 */
export function dropSourcesOf(item: string | string[], lang: SeoLang, routePrefix: string): DropSource[] {
  const itemIds = typeof item === "string" ? [item] : item;
  const idx = lang === "ko" ? 1 : 0;
  const collator = new Intl.Collator(lang === "ko" ? "ko" : "en");
  const best = (s: DropSource) => Math.max(...s.rows.map((r) => r.chance));
  const sort = (list: DropSource[]) => list.sort((a, b) => best(b) - best(a) || collator.compare(a.name, b.name));

  const fromBosses: DropSource[] = [];
  for (const boss of bosses) {
    const rows = bossRows(boss.id, itemIds);
    if (rows.length === 0) continue;
    const img = Array.isArray(boss.image) ? boss.image[0] : boss.image;
    fromBosses.push({
      key: `boss-${boss.id}`,
      name: lang === "ko" ? boss.nameKo : boss.name,
      sub: lang === "ko" ? boss.name : null,
      image: bossThumbPath(`/images/bosses/${img}`),
      href: `${routePrefix}/boss/${canonicalForBoss(boss.id)}`,
      rows,
    });
  }

  const fromCreatures: DropSource[] = [];
  for (const [creatureId, loot] of Object.entries(creatureLoot)) {
    const names = creatureNames[creatureId];
    if (!names) continue;
    const rows = loot.filter((r) => itemIds.includes(r.item)).map(({ chance, count, pick }) => ({ chance, count, pick }));
    if (rows.length === 0) continue;
    fromCreatures.push({
      key: creatureId,
      name: names[idx],
      sub: lang === "ko" ? names[0] : null,
      image: hasGameItemImage(creatureId) ? `/images/game-items/${creatureId}.png` : undefined,
      href: creatureHref(creatureId, routePrefix),
      rows,
    });
  }
  return [...sort(fromBosses), ...sort(fromCreatures)];
}

/** "100% ×4 + 33%" — 줄마다 따로 굴리므로 줄을 그대로 이어 적는다.
 *  무작위 뽑기 줄은 1개만 뽑으면 표시된 확률이 곧 이 아이템이 나올 확률이라 그대로 쓰고, 여러 개 뽑을 때만 "이 중 n개"를 붙인다 */
function rowsLabel(rows: Row[], lang: SeoLang): string {
  return rows
    .map((r) => {
      const base = `${chancePercent(r.chance)}${r.count > 1 ? ` ×${r.count}` : ""}`;
      return r.pick != null && r.pick > 1 ? `${base} · ${L.creatureLootPick[lang].replace("{n}", String(r.pick))}` : base;
    })
    .join(" + ");
}

export function DroppedBySection({ sources, lang }: { sources: DropSource[]; lang: SeoLang }) {
  if (sources.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {L.droppedBy[lang]} ({sources.length})
      </h2>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{L.droppedByNote[lang]}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sources.map((s) => (
          <LootCard
            key={s.key}
            name={s.name}
            sub={s.sub}
            image={s.image}
            href={s.href}
            chanceLabel={rowsLabel(s.rows, lang)}
          />
        ))}
      </div>
    </section>
  );
}
