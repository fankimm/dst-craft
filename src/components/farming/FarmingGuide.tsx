"use client";

import type { ReactNode } from "react";
import {
  FARM_FERTILIZERS,
  FARM_LABELS,
  FARM_NUTRIENT_NAMES,
  FARM_STRESSORS,
  FARM_STRESS_GRADES,
  FARM_TEND_TOOLS,
  FARM_WATER_SOURCES,
  FARM_WEEDS,
} from "@/data/farming";
import type { Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";
import { FARM_HARVEST, FARM_STRESSOR_TEXT, FARM_TEXT, ft } from "./farming-text";
import { ValueBadge } from "./ValueBadge";

function GuideSection({ title, note, locale, children }: { title: string; note?: string; locale: Locale; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface/40 overflow-hidden">
      <header className="px-3 py-2 border-b border-border bg-background/60">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          {title}
          <ValueBadge label={ft(FARM_TEXT.gameValue, locale)} />
        </h3>
        {note && <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{note}</p>}
      </header>
      {children}
    </section>
  );
}

/** 표의 첫 칸: 게임 아이콘 + 이름 */
function ItemCell({ image, name }: { image: string | null; name: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {image && <img src={assetPath(`/images/game-items/${image}.png`)} alt="" className="size-7 object-contain shrink-0" loading="lazy" />}
      <span className="min-w-0 break-words">{name}</span>
    </div>
  );
}

const TH = "px-2 py-1.5 text-[10px] font-medium text-muted-foreground leading-tight";
const TD = "px-2 py-1.5 text-xs tabular-nums";
const NUM = `${TD} text-center`;

/** 0 은 흐리게 — 어느 양분을 주는 비료인지가 한눈에 보이게 */
const nutrientCell = (n: number) => <span className={n === 0 ? "text-muted-foreground/40" : "font-semibold"}>{n}</span>;

export function FarmingGuide({ locale }: { locale: Locale }) {
  const gradeRange = (i: number) => {
    const min = i === 0 ? 0 : (FARM_STRESS_GRADES[i - 1].max ?? 0) + 1;
    const max = FARM_STRESS_GRADES[i].max;
    return max === null ? `${min}+` : `${min}~${max}`;
  };
  const cropWord = ft(FARM_TEXT.crop, locale);
  const seedWord = ft(FARM_LABELS.seed, locale);

  return (
    <>
      <GuideSection title={ft(FARM_LABELS.fertilizers, locale)} locale={locale}>
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border">
              <th className={`${TH} text-left w-[40%]`} />
              {FARM_NUTRIENT_NAMES.map((n, i) => (
                <th key={i} className={TH}>{ft(n, locale)}</th>
              ))}
              <th className={TH}>{ft(FARM_TEXT.uses, locale)}</th>
            </tr>
          </thead>
          <tbody>
            {FARM_FERTILIZERS.map((f) => (
              <tr key={f.id} className="border-b border-border/50 last:border-0">
                <td className={TD}><ItemCell image={f.image} name={ft(f.name, locale)} /></td>
                {f.nutrients.map((n, i) => <td key={i} className={NUM}>{nutrientCell(n)}</td>)}
                <td className={NUM}>{f.uses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GuideSection>

      <GuideSection title={ft(FARM_TEXT.tendTools, locale)} locale={locale}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={`${TH} text-left`} />
              <th className={TH}>{ft(FARM_TEXT.tendRadius, locale)}</th>
            </tr>
          </thead>
          <tbody>
            {FARM_TEND_TOOLS.map((tool) => (
              <tr key={tool.id} className="border-b border-border/50 last:border-0">
                <td className={TD}><ItemCell image={tool.id === "wormwood" ? null : tool.id} name={ft(tool.name, locale)} /></td>
                <td className={NUM}>{tool.tiles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GuideSection>

      <GuideSection title={ft(FARM_TEXT.watering, locale)} note={ft(FARM_TEXT.waterNote, locale)} locale={locale}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={`${TH} text-left`} />
              <th className={TH}>{ft(FARM_TEXT.waterAmount, locale)}</th>
              <th className={TH}>{ft(FARM_TEXT.uses, locale)}</th>
            </tr>
          </thead>
          <tbody>
            {FARM_WATER_SOURCES.map((w) => (
              <tr key={w.id} className="border-b border-border/50 last:border-0">
                <td className={TD}><ItemCell image={w.id} name={ft(w.name, locale)} /></td>
                <td className={NUM}>+{w.amount}</td>
                <td className={NUM}>{w.uses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GuideSection>

      <GuideSection title={ft(FARM_TEXT.stressTitle, locale)} note={ft(FARM_TEXT.stressNote, locale)} locale={locale}>
        <ul>
          {FARM_STRESSORS.map((s) => (
            <li key={s.id} className="px-3 py-2 border-b border-border/50 last:border-0">
              <div className="text-xs font-semibold">{ft(FARM_STRESSOR_TEXT[s.id].name, locale)}</div>
              <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{ft(FARM_STRESSOR_TEXT[s.id].rule, locale)}</div>
              <div className="mt-0.5 text-[11px] italic text-muted-foreground/80">“{ft(s.quote, locale)}”</div>
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection title={ft(FARM_TEXT.harvestTitle, locale)} locale={locale}>
        <table className="w-full">
          <tbody>
            {FARM_STRESS_GRADES.map((grade, i) => {
              const loot = FARM_HARVEST[grade.grade];
              return (
                <tr key={grade.grade} className="border-b border-border/50 last:border-0">
                  <td className={`${TD} w-24 font-semibold`}>{gradeRange(i)}{ft(FARM_TEXT.stressPoints, locale)}</td>
                  <td className={TD}>
                    {loot.giant
                      ? `${ft(FARM_TEXT.giantCrop, locale)} ×1`
                      : [`${cropWord} ×${loot.crop}`, loot.seeds > 0 ? `${seedWord} ×${loot.seeds}` : null].filter(Boolean).join(" + ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GuideSection>

      <GuideSection title={ft(FARM_TEXT.weeds, locale)} note={ft(FARM_TEXT.weedNote, locale)} locale={locale}>
        <ul>
          {FARM_WEEDS.map((w) => (
            <li key={w.id} className="px-3 py-2 border-b border-border/50 last:border-0">
              <ItemCell image={w.productId} name={ft(w.name, locale)} />
              <div className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                {ft(w.effect, locale)} · {ft(FARM_LABELS.water, locale)} {ft(FARM_TEXT.drinkLevel[w.drinkLevel], locale)}
              </div>
            </li>
          ))}
        </ul>
      </GuideSection>
    </>
  );
}
