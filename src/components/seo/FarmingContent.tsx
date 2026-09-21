import Link from "next/link";
import { FARM_CROPS, FARM_LABELS, FARM_NUTRIENT_NAMES, FARM_SEASONS, FARM_SEASON_NAMES } from "@/data/farming";
import { farmCombos, netNutrients } from "@/lib/farming-combos";
import { FARM_TEXT, cropImage, ft } from "@/components/farming/farming-text";
import { FarmingGuide } from "@/components/farming/FarmingGuide";
import { AdSlot } from "@/components/ads/AdSlot";
import { L, type SeoLang } from "./labels";
import { JsonLd } from "./JsonLd";

const SITE_URL = "https://www.dstcraft.com";

/**
 * `/farming`, `/ko/farming` — 농사 탭의 검색용 정적 페이지 (#120).
 * 계절별 조합을 표로 HTML에 담는다. 조합은 빌드 시 `farmCombos()`로 계산하므로 탭과 항상 같다.
 */
export function FarmingContent({ lang }: { lang: SeoLang }) {
  const routePrefix = lang === "ko" ? "/ko" : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: L.farmingPageHeading[lang].replace("\n", " — "),
    description: L.farmingIntro[lang],
    url: `${SITE_URL}${routePrefix}/farming`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    image: `${SITE_URL}/images/game-items/farm_plow_item.png`,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={jsonLd} />

      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">{L.farmingGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src="/images/game-items/farm_plow_item.png" alt="" className="size-16 object-contain" />
            <img src="/images/game-items/farm_hoe.png" alt="" className="size-14 object-contain" />
          </div>
          <h1 className="text-3xl font-bold whitespace-pre-line">{L.farmingPageHeading[lang]}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">{L.farmingIntro[lang]}</p>
          <Link
            href="/?tab=farming"
            className="inline-block rounded-lg bg-foreground text-background text-sm font-semibold px-6 py-3 hover:opacity-80 transition-opacity"
          >
            {L.openFarming[lang]}
          </Link>
        </section>

        <AdSlot variant="top" />

        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
          {ft(FARM_TEXT.giantWarning, lang)}
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">{ft(FARM_TEXT.viewCombos, lang)}</h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {ft(FARM_TEXT.comboIntro, lang)} {ft(FARM_TEXT.demandHint, lang)}
            </p>
          </div>
          {FARM_SEASONS.map((season) => (
            <div key={season} className="space-y-2">
              <h3 className="text-base font-semibold">{ft(FARM_SEASON_NAMES[season], lang)}</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {farmCombos(season).map((combo) => (
                      <tr key={combo.id} className="border-b border-border/50 last:border-0 align-top">
                        <td className="px-3 py-2">
                          {combo.slots.map((slot, i) => (
                            <span key={i}>
                              {i > 0 && " + "}
                              {slot.crops.map((c) => ft(c.name, lang)).join(" / ")} <strong className="tabular-nums">×{slot.perTile}</strong>
                            </span>
                          ))}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                          {ft(combo.familyInOneTile ? FARM_TEXT.badgeOneTile : FARM_TEXT.badgeAdjacent, lang)}
                          <br />
                          {combo.safeOnFreshSoil
                            ? ft(FARM_TEXT.badgeSafe, lang)
                            : `${ft(FARM_TEXT.badgeFertilize, lang)}: ${combo.shortNutrients.map((i) => ft(FARM_NUTRIENT_NAMES[i], lang)).join(" · ")}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">{ft(FARM_TEXT.comboComputedNote, lang)}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{L.farmingCropTable[lang]}</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium" />
                  <th className="px-3 py-2 text-left font-medium">{ft(FARM_LABELS.seasons, lang)}</th>
                  {FARM_NUTRIENT_NAMES.map((n, i) => (
                    <th key={i} className="px-2 py-2 font-medium">{ft(n, lang)}</th>
                  ))}
                  <th className="px-2 py-2 font-medium">{ft(FARM_LABELS.water, lang)}</th>
                </tr>
              </thead>
              <tbody>
                {FARM_CROPS.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <img src={`/images/game-items/${cropImage(c.id)}`} alt="" className="size-7 object-contain" loading="lazy" />
                        {ft(c.name, lang)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{c.seasons.map((s) => ft(FARM_SEASON_NAMES[s], lang)).join(" · ")}</td>
                    {netNutrients(c).map((n, i) => (
                      <td key={i} className={`px-2 py-2 text-center tabular-nums ${n < 0 ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                        {n > 0 ? `+${n}` : n}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center text-xs">{ft(FARM_TEXT.drinkLevel[c.drinkLevel], lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{ft(FARM_TEXT.viewGuide, lang)}</h2>
          <FarmingGuide locale={lang} />
        </section>
      </main>
    </div>
  );
}

export function buildFarmingMetadata(lang: SeoLang) {
  const title = lang === "ko"
    ? "농사 가이드 — 계절별 무비료 작물 조합 · 거대 작물 | Don't Starve Together"
    : "Farming Guide — No-Fertilizer Crop Combos & Giant Crops | Don't Starve Together";
  const description = lang === "ko"
    ? "굶지마 투게더 농사 조합을 게임 데이터로 계산했습니다. 봄·여름·가을·겨울별 무비료 작물 조합, 타일당 포기 수, 작물별 양분·물 소비, 비료 양분값, 스트레스 7항목과 거대 작물 조건."
    : "Don't Starve Together farming combos calculated from game data: self-sustaining crop combinations for every season, plants per tile, crop nutrients and water, fertilizer values, the 7 stressors and giant crop rules.";
  const enUrl = `${SITE_URL}/farming`;
  const koUrl = `${SITE_URL}/ko/farming`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description,
    keywords: lang === "ko"
      ? ["굶지마 농사 조합", "굶지마 투게더 농사", "DST 농사", "DST 거대 작물", "굶지마 비료", "굶지마 계절별 작물", "돈스타브 투게더 농사"]
      : ["dst farming guide", "dst giant crops combinations", "dst crop combos", "don't starve together farming", "dst fertilizer nutrients", "dst farming seasons", "dst plant stress"],
    alternates: {
      canonical,
      languages: { en: enUrl, "x-default": enUrl, ko: koUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      images: [{ url: `${SITE_URL}/images/game-items/farm_plow_item.png` }],
    },
  };
}
