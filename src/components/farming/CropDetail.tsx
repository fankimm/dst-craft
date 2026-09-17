"use client";

import {
  FARM_FERTILIZERS,
  FARM_LABELS,
  FARM_NUTRIENT_NAMES,
  FARM_SEASONS,
  FARM_SEASON_NAMES,
  type FarmCrop,
  type FarmSeason,
} from "@/data/farming";
import { consumedNutrients, randomSeedChances } from "@/lib/farming-combos";
import type { Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { TagChip } from "@/components/ui/TagChip";
import { PrefabIdButton } from "@/components/ui/PrefabIdButton";
import { FARM_TEXT, cropImage, ft } from "./farming-text";
import { ValueBadge } from "./ValueBadge";

const DAY = 480;
const days = (seconds: number) => String(Math.round((seconds / DAY) * 100) / 100);

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
        {title}
        {badge && <ValueBadge label={badge} />}
      </h4>
      {children}
    </section>
  );
}

/** 인게임 식물 도감(Plant Registry)의 작물 페이지 구성을 따른다: 계절 → 물 소비량 → 양분 순환 → 씨앗·생산물 → 현장 기록 */
export function CropDetail({
  crop,
  locale,
  onShowCombos,
}: {
  crop: FarmCrop;
  locale: Locale;
  onShowCombos: (cropId: string, season: FarmSeason) => void;
}) {
  const consumed = consumedNutrients(crop);
  // 이 작물이 소비하는 양분만 채워 주는 비료 (다른 양분까지 주는 복합 비료는 뒤로)
  const fertilizers = FARM_FERTILIZERS.filter((f) => consumed.some((i) => f.nutrients[i] > 0)).sort(
    (a, b) =>
      Number(a.nutrients.some((n, i) => n > 0 && !consumed.includes(i))) -
      Number(b.nutrients.some((n, i) => n > 0 && !consumed.includes(i))),
  );
  const game = ft(FARM_TEXT.gameValue, locale);
  const computed = ft(FARM_TEXT.computedValue, locale);
  const g = crop.growTime;
  const growText = ft(FARM_TEXT.growTimeValue, locale)
    .replace("{g0}", days(g.germination[0]))
    .replace("{g1}", days(g.germination[1]))
    .replace("{f0}", days(g.full[0]))
    .replace("{f1}", days(g.full[1]));

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <img src={assetPath(`/images/game-items/${cropImage(crop.id)}`)} alt="" className="size-14 object-contain" loading="lazy" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{ft(crop.name, locale)}</h3>
          <p className="text-xs text-muted-foreground">{ft(crop.plantName, locale)}</p>
          <PrefabIdButton id={crop.id} locale={locale} />
        </div>
      </div>

      <Section title={ft(FARM_LABELS.seasons, locale)} badge={game}>
        <div className="flex flex-wrap gap-1.5">
          {FARM_SEASONS.map((s) => (
            <TagChip
              key={s}
              label={ft(FARM_SEASON_NAMES[s], locale)}
              className={crop.seasons.includes(s) ? "border-emerald-500/40 bg-emerald-500/10" : "opacity-40 line-through"}
            />
          ))}
        </div>
      </Section>

      <Section title={ft(FARM_LABELS.water, locale)} badge={game}>
        <p className="text-xs text-muted-foreground tabular-nums">
          <span className="font-medium text-foreground">{ft(FARM_TEXT.drinkLevel[crop.drinkLevel], locale)}</span> · {crop.drinkRate}
          {ft(FARM_TEXT.perSecond, locale)}
        </p>
      </Section>

      <Section title={`${ft(FARM_LABELS.nutrientCycling, locale)} — ${ft(FARM_TEXT.perStage, locale)}`} badge={game}>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {FARM_NUTRIENT_NAMES.map((name, i) => {
            const delta = crop.restore[i] - crop.consume[i];
            return (
              <div key={i} className="rounded-md border border-border bg-surface/40 px-1 py-1.5">
                <div className="text-[10px] text-muted-foreground leading-tight">{ft(name, locale)}</div>
                <div className={cn("text-sm font-semibold tabular-nums", delta < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                  {delta > 0 ? `+${delta}` : delta}
                </div>
                <div className="text-[10px] text-muted-foreground">{ft(delta < 0 ? FARM_LABELS.consume : FARM_LABELS.restore, locale)}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={`${ft(FARM_LABELS.seed, locale)} · ${ft(FARM_LABELS.product, locale)}`}>
        <div className="flex flex-wrap gap-3">
          <ItemSlot icon={`${crop.seedId}.png`} label={ft(crop.seedName, locale)} />
          <ItemSlot icon={cropImage(crop.id)} label={ft(crop.name, locale)} />
          <ItemSlot icon={`${crop.oversizedId}.png`} label={ft(crop.oversizedName, locale)} />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {ft(crop.unknownSeedName, locale)} → {ft(crop.seedName, locale)}
        </p>
      </Section>

      <Section title={ft(FARM_TEXT.growTime, locale)} badge={game}>
        <p className="text-xs text-muted-foreground tabular-nums">{growText}</p>
      </Section>

      <Section title={ft(FARM_TEXT.randomSeedChance, locale)} badge={computed}>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {FARM_SEASONS.map((s) => (
            <div key={s} className="rounded-md border border-border bg-surface/40 px-1 py-1.5">
              <div className="text-[10px] text-muted-foreground">{ft(FARM_SEASON_NAMES[s], locale)}</div>
              <div className="text-sm font-semibold tabular-nums">{((randomSeedChances(s).get(crop.id) ?? 0) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={ft(FARM_TEXT.matchingFertilizers, locale)}>
        <div className="flex flex-wrap gap-3">
          {fertilizers.map((f) => (
            <ItemSlot
              key={f.id}
              icon={`${f.image}.png`}
              label={ft(f.name, locale)}
              badge={String(Math.max(...consumed.map((i) => f.nutrients[i])))}
            />
          ))}
        </div>
      </Section>

      <Section title={ft(FARM_TEXT.showCombos, locale)}>
        <div className="flex flex-wrap gap-1.5">
          {crop.seasons.map((s) => (
            <TagChip key={s} label={ft(FARM_SEASON_NAMES[s], locale)} onClick={() => onShowCombos(crop.id, s)} />
          ))}
        </div>
      </Section>

      <Section title={ft(FARM_LABELS.fieldNotes, locale)}>
        <p className="text-xs italic text-muted-foreground leading-relaxed">{ft(crop.description, locale)}</p>
      </Section>
    </div>
  );
}
