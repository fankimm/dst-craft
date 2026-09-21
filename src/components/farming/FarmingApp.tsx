"use client";

import { useMemo } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useFarmingState, type FarmingView } from "@/hooks/use-farming-state";
import {
  FARM_CROPS,
  FARM_NUTRIENT_NAMES,
  FARM_SEASONS,
  FARM_SEASON_NAMES,
  type FarmCrop,
  type FarmSeason,
} from "@/data/farming";
import { comboHasCrop, farmCombos, type FarmCombo } from "@/lib/farming-combos";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TabScrollArea } from "@/components/ui/TabScrollArea";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { TagChip } from "@/components/ui/TagChip";
import { AdSlot } from "@/components/ads/AdSlot";
import { FARM_TEXT, cropImage, ft } from "./farming-text";
import { ValueBadge } from "./ValueBadge";
import { CropDetail } from "./CropDetail";
import { FarmingGuide } from "./FarmingGuide";

const VIEWS: { id: FarmingView; label: keyof typeof FARM_TEXT }[] = [
  { id: "combos", label: "viewCombos" },
  { id: "crops", label: "viewCrops" },
  { id: "guide", label: "viewGuide" },
];

const CROP_BY_ID = new Map(FARM_CROPS.map((c) => [c.id, c]));

/** 선택 상태를 가진 칩 — TagChip 에 강조만 얹는다 */
function ChoiceChip({ label, icon, active, onClick }: { label: string; icon?: string; active: boolean; onClick: () => void }) {
  return (
    <TagChip
      label={label}
      icon={icon}
      onClick={onClick}
      className={active ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}
    />
  );
}

export function FarmingApp() {
  const { resolvedLocale: locale } = useSettings();
  const state = useFarmingState();
  const { view, season, withCrop, crop: selectedCropId } = state;

  const selectedCrop = selectedCropId ? (CROP_BY_ID.get(selectedCropId) ?? null) : null;
  const { panelItem: panelCrop, panelOpen } = useDetailPanel(selectedCrop);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <div className="shrink-0 border-b border-border bg-background/80 px-4 py-2.5 space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{ft(FARM_TEXT.header, locale)}</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{ft(FARM_TEXT.subheader, locale)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => (
            <ChoiceChip
              key={v.id}
              label={ft(FARM_TEXT[v.label] as { ko: string; en: string }, locale)}
              active={view === v.id}
              onClick={() => state.setView(v.id)}
            />
          ))}
        </div>
      </div>

      <TabScrollArea scrollContainer>
        <AdSlot variant="top" />
        <div className="max-w-3xl mx-auto px-3 py-3 space-y-3 w-full">
          {view === "combos" && (
            <CombosView
              locale={locale}
              season={season}
              withCrop={withCrop}
              onSeason={state.setSeason}
              onWithCrop={state.setWithCrop}
              onSelectCrop={state.selectCrop}
            />
          )}
          {view === "crops" && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
              {FARM_CROPS.map((c) => (
                <CategoryCard
                  key={c.id}
                  imageSrc={`/images/game-items/${cropImage(c.id)}`}
                  label={ft(c.name, locale)}
                  onClick={() => state.selectCrop(c.id)}
                />
              ))}
            </div>
          )}
          {view === "guide" && <FarmingGuide locale={locale} />}
        </div>
      </TabScrollArea>

      <DetailPanel open={panelOpen} onClose={() => state.selectCrop(null)}>
        {panelCrop && <CropDetail crop={panelCrop} locale={locale} onShowCombos={state.showCombosWith} />}
      </DetailPanel>
    </div>
  );
}

function CombosView({
  locale,
  season,
  withCrop,
  onSeason,
  onWithCrop,
  onSelectCrop,
}: {
  locale: Locale;
  season: FarmSeason;
  withCrop: string | null;
  onSeason: (s: FarmSeason) => void;
  onWithCrop: (id: string | null) => void;
  onSelectCrop: (id: string) => void;
}) {
  const combos = useMemo(() => farmCombos(season), [season]);
  const inSeason = useMemo(() => FARM_CROPS.filter((c) => c.seasons.includes(season)), [season]);
  const shown = withCrop ? combos.filter((c) => comboHasCrop(c, withCrop)) : combos;

  return (
    <>
      <p className="text-xs text-muted-foreground leading-relaxed">{ft(FARM_TEXT.comboIntro, locale)}</p>

      <div className="flex flex-wrap gap-1.5">
        {FARM_SEASONS.map((s) => (
          <ChoiceChip key={s} label={ft(FARM_SEASON_NAMES[s], locale)} active={season === s} onClick={() => onSeason(s)} />
        ))}
      </div>

      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
        {ft(FARM_TEXT.giantWarning, locale)}
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-medium text-muted-foreground">{ft(FARM_TEXT.filterLabel, locale)}</div>
        <div className="flex flex-wrap gap-1.5">
          <ChoiceChip label={ft(FARM_TEXT.filterAll, locale)} active={withCrop === null} onClick={() => onWithCrop(null)} />
          {inSeason.map((c) => (
            <ChoiceChip
              key={c.id}
              label={ft(c.name, locale)}
              icon={`game-items/${cropImage(c.id)}`}
              active={withCrop === c.id}
              onClick={() => onWithCrop(withCrop === c.id ? null : c.id)}
            />
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">{ft(FARM_TEXT.noCombos, locale)}</p>
      ) : (
        <div className="space-y-2">
          {shown.map((combo) => (
            <ComboCard key={combo.id} combo={combo} locale={locale} onSelectCrop={onSelectCrop} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        <ValueBadge label={ft(FARM_TEXT.computedValue, locale)} /> {ft(FARM_TEXT.comboComputedNote, locale)}{" "}
        {ft(FARM_TEXT.demandHint, locale)}
      </p>
    </>
  );
}

function ComboCard({ combo, locale, onSelectCrop }: { combo: FarmCombo; locale: Locale; onSelectCrop: (id: string) => void }) {
  const shortNames = combo.shortNutrients.map((i) => ft(FARM_NUTRIENT_NAMES[i], locale)).join(" · ");
  return (
    <section className="rounded-lg border border-border bg-surface/40 p-3 space-y-2.5">
      <div className="flex flex-wrap items-stretch gap-1.5">
        {combo.slots.map((slot, i) => (
          <div key={slot.crops[0].id} className="flex items-stretch gap-1.5">
            {i > 0 && <span className="self-center text-sm text-muted-foreground">+</span>}
            <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1.5">
              <div className="text-center leading-none">
                <div className="text-lg font-semibold tabular-nums">{slot.perTile}</div>
                <div className="mt-0.5 text-[9px] text-muted-foreground">{ft(FARM_TEXT.perTile, locale)}</div>
              </div>
              <div className="flex items-start gap-1.5">
                {slot.crops.map((c: FarmCrop) => (
                  <ItemSlot key={c.id} icon={cropImage(c.id)} label={ft(c.name, locale)} onClick={() => onSelectCrop(c.id)} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <StatusChip
          good={combo.familyInOneTile}
          label={ft(combo.familyInOneTile ? FARM_TEXT.badgeOneTile : FARM_TEXT.badgeAdjacent, locale)}
          title={combo.familyInOneTile ? undefined : ft(FARM_TEXT.badgeAdjacentHint, locale)}
        />
        <StatusChip
          good={combo.safeOnFreshSoil}
          label={combo.safeOnFreshSoil ? ft(FARM_TEXT.badgeSafe, locale) : `${ft(FARM_TEXT.badgeFertilize, locale)}: ${shortNames}`}
        />
      </div>

      <div className="text-[11px] text-muted-foreground tabular-nums">
        {ft(FARM_TEXT.demand, locale)} —{" "}
        {combo.demand.map((n, i) => (
          <span key={i} className={cn("mr-2", combo.shortNutrients.includes(i) && "font-semibold text-amber-700 dark:text-amber-300")}>
            {ft(FARM_NUTRIENT_NAMES[i], locale)} {n}
          </span>
        ))}
      </div>
    </section>
  );
}

function StatusChip({ good, label, title }: { good: boolean; label: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        good
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
      )}
    >
      {label}
    </span>
  );
}
