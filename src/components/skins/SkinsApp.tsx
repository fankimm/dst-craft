"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import {
  SKINS,
  type SkinEntry,
  type SkinRarity,
  type SkinRarityModifier,
} from "@/data/skins";
import { useSettings } from "@/hooks/use-settings";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { TagChip } from "@/components/ui/TagChip";

// ---------------------------------------------------------------------------
// Rarity ordering + colors (mirrors skinsutils.lua SKIN_RARITY_COLORS)
// ---------------------------------------------------------------------------

const RARITY_ORDER: Record<SkinRarity, number> = {
  ProofOfPurchase: 1,
  Resurrected: 2,
  Timeless: 3,
  Loyal: 4,
  Reward: 5,
  Event: 6,
  Character: 7,
  HeirloomElegant: 8,
  HeirloomDistinguished: 9,
  HeirloomSpiffy: 10,
  HeirloomClassy: 11,
  Elegant: 12,
  Distinguished: 13,
  Spiffy: 14,
  Classy: 15,
  Common: 16,
  Complimentary: 17,
};

const RARITY_HEX: Record<SkinRarity, string> = {
  Common: "#bdbdbd",
  Classy: "#4eb5ed",
  Spiffy: "#8e58e8",
  Distinguished: "#d44d8a",
  Elegant: "#f0a420",
  HeirloomClassy: "#f0a420",
  HeirloomSpiffy: "#f0a420",
  HeirloomDistinguished: "#f0a420",
  HeirloomElegant: "#f0a420",
  Character: "#d6a04d",
  Loyal: "#d6a04d",
  Timeless: "#5fb43e",
  Reward: "#5fb43e",
  Event: "#5fb43e",
  ProofOfPurchase: "#e85a5a",
  Resurrected: "#e85a5a",
  Complimentary: "#bdbdbd",
};

// ---------------------------------------------------------------------------
// Character / category detection from base_prefab
// ---------------------------------------------------------------------------

// Canonical character key → display names (ko/en).
// "wigfrid" and "maxwell" are the canonical app-side ids; "wathgrithr" and
// "waxwell" are in-game prefab aliases that route to the canonical key.
const CHARACTERS: Record<string, { ko: string; en: string }> = {
  wilson: { ko: "윌슨", en: "Wilson" },
  willow: { ko: "윌로우", en: "Willow" },
  wolfgang: { ko: "볼프강", en: "Wolfgang" },
  wendy: { ko: "웬디", en: "Wendy" },
  wickerbottom: { ko: "위커바텀", en: "Wickerbottom" },
  wx78: { ko: "WX-78", en: "WX-78" },
  wes: { ko: "웨스", en: "Wes" },
  maxwell: { ko: "맥스웰", en: "Maxwell" },
  woodie: { ko: "우디", en: "Woodie" },
  wigfrid: { ko: "위그프리드", en: "Wigfrid" },
  webber: { ko: "웨버", en: "Webber" },
  winona: { ko: "위노나", en: "Winona" },
  warly: { ko: "왈리", en: "Warly" },
  wortox: { ko: "워톡스", en: "Wortox" },
  wormwood: { ko: "웜우드", en: "Wormwood" },
  wurt: { ko: "워트", en: "Wurt" },
  walter: { ko: "월터", en: "Walter" },
  wanda: { ko: "완다", en: "Wanda" },
};

// Order characters appear in the chip row. Mirrors the in-game roster order.
const CHARACTER_ORDER = [
  "wilson", "willow", "wolfgang", "wendy", "wx78", "wickerbottom",
  "woodie", "wes", "maxwell", "wigfrid", "webber",
  "winona", "warly", "wortox", "wormwood", "wurt", "walter", "wanda",
];

// Per-skin character is supplied by the build-time pipeline (extract-skins.py),
// sourced from recipes.lua builder_tag/builder_skill — the same data the game
// uses to gate crafting. UI just reads `skin.character` directly here.

const CATEGORY_LABELS_KO: Record<string, string> = {
  hat: "모자",
  armor: "방어구",
  weapon: "무기",
  tool: "도구",
  amulet: "부적/장신구",
  cane: "지팡이",
  backpack: "가방",
  item: "기타 아이템",
  beefalo: "비팔로",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  hat: "Hat",
  armor: "Armor",
  weapon: "Weapon",
  tool: "Tool",
  amulet: "Amulet",
  cane: "Cane",
  backpack: "Backpack",
  item: "Other items",
  beefalo: "Beefalo",
};

/** Map a skin row to a coarse category key for grouping/filtering. */
function classify(skin: SkinEntry): { key: string; isCharacter: boolean } {
  if (skin.character) {
    return { key: skin.character, isCharacter: true };
  }
  const base = skin.base_prefab ?? "";
  if (base.includes("hat")) return { key: "hat", isCharacter: false };
  if (base.startsWith("armor")) return { key: "armor", isCharacter: false };
  if (base.startsWith("amulet")) return { key: "amulet", isCharacter: false };
  if (base.startsWith("cane")) return { key: "cane", isCharacter: false };
  if (base.includes("backpack") || base.includes("krampus_sack") || base.includes("piggyback")) {
    return { key: "backpack", isCharacter: false };
  }
  if (base.startsWith("beefalo") || base.startsWith("saddle") || base.startsWith("bell")) {
    return { key: "beefalo", isCharacter: false };
  }
  // weapons heuristic
  if (
    /^(spear|sword|axe|hammer|pickaxe|shovel|pitchfork|bat|boomerang|blowdart|nightsword|firestaff|icestaff|telestaff|orangestaff|greenstaff|yellowstaff|opalstaff|reskin_tool|tropical_fan|featherfan|bugnet|fishingrod|whip|trident|saltrock_hammer|multitool_axe_pickaxe)/.test(base)
  ) {
    return { key: "weapon", isCharacter: false };
  }
  return { key: "item", isCharacter: false };
}

function categoryLabel(key: string, locale: Locale): string {
  const ch = CHARACTERS[key];
  if (ch) return locale === "ko" ? ch.ko : ch.en;
  return (locale === "ko" ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN)[key] ?? key;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface SkinIndex {
  all: SkinEntry[];
  byCategory: Map<string, SkinEntry[]>;
  rarities: SkinRarity[];
  categories: string[];
}

const SKIN_INDEX: SkinIndex = (() => {
  const byCat = new Map<string, SkinEntry[]>();
  for (const skin of SKINS) {
    const { key } = classify(skin);
    const arr = byCat.get(key) ?? [];
    arr.push(skin);
    byCat.set(key, arr);
  }
  const raritySet = new Set<SkinRarity>();
  for (const s of SKINS) raritySet.add(s.rarity);
  const rarities = Array.from(raritySet).sort(
    (a, b) => RARITY_ORDER[a] - RARITY_ORDER[b],
  );
  // Order categories: characters first (roster order), then item categories
  const charKeys = CHARACTER_ORDER.filter((c) => byCat.has(c));
  const otherKeys = Array.from(byCat.keys())
    .filter((k) => !(k in CHARACTERS))
    .sort((a, b) => {
      const order = ["hat", "armor", "weapon", "tool", "amulet", "cane", "backpack", "beefalo", "item"];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  return {
    all: SKINS,
    byCategory: byCat,
    rarities,
    categories: [...charKeys, ...otherKeys],
  };
})();

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface SkinCardProps {
  skin: SkinEntry;
  locale: Locale;
  onClick: () => void;
}

function SkinCard({ skin, locale, onClick }: SkinCardProps) {
  const color = RARITY_HEX[skin.rarity];
  const name = locale === "ko" ? skin.name_ko : skin.name_en;
  // Body skins (character outfits) get a wider card so the in-game silhouette
  // is readable; inventory icons stay compact.
  const isBody = !!skin.body_image;
  const imgSrc = skin.body_image ?? skin.icon ?? "";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card hover:bg-accent/40 hover:border-foreground/30 transition-colors text-left"
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-md border-2 bg-black/70 overflow-hidden",
          isBody ? "w-full aspect-square" : "size-16",
        )}
        style={{ borderColor: color }}
      >
        {imgSrc ? (
          <Image
            src={assetPath(imgSrc)}
            alt={name}
            width={isBody ? 120 : 56}
            height={isBody ? 120 : 56}
            className={cn("object-contain", isBody ? "size-full p-1" : "size-14")}
            loading="lazy"
            unoptimized
          />
        ) : (
          <span className="text-[10px] text-muted-foreground">?</span>
        )}
      </div>
      <span className="text-[11px] leading-tight text-center line-clamp-2 w-full text-foreground">
        {name}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Body-skin carousel — wiki in_game.png often stacks N poses horizontally,
// so we show one pose at a time with swipe + indicator dots.
// ---------------------------------------------------------------------------

interface BodyCarouselProps {
  src: string;
  panels: number;
  alt: string;
  borderColor: string;
}

function BodyCarousel({ src, panels, alt, borderColor }: BodyCarouselProps) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef<number | null>(null);
  // Reset index when the skin (src) changes — otherwise an out-of-range idx
  // from a previously-viewed skin could persist.
  useEffect(() => { setIdx(0); }, [src]);

  const goTo = useCallback((i: number) => {
    setIdx(Math.max(0, Math.min(panels - 1, i)));
  }, [panels]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 30) {
      goTo(idx + (dx < 0 ? 1 : -1));
    }
    touchStart.current = null;
  };

  // CSS background-* lets us slice an N-pose horizontal strip into N slides
  // without preloading or measuring each pose's exact width.
  const bgPos = panels > 1 ? `${(idx / (panels - 1)) * 100}% center` : "center";

  return (
    <div
      className="w-full max-w-[280px] mx-auto select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        role="img"
        aria-label={alt}
        className="w-full aspect-square rounded-md border-2 bg-black/70 transition-[background-position] duration-200 ease-out"
        style={{
          borderColor,
          backgroundImage: `url(${assetPath(src)})`,
          backgroundSize: `${panels * 100}% 100%`,
          backgroundPosition: bgPos,
          backgroundRepeat: "no-repeat",
        }}
      />
      {panels > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: panels }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`pose ${i + 1}`}
              className={cn(
                "size-2 rounded-full transition-colors",
                i === idx ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SkinDetailProps {
  skin: SkinEntry;
  locale: Locale;
  onClose: () => void;
}

function SkinDetail({ skin, locale, onClose }: SkinDetailProps) {
  const color = RARITY_HEX[skin.rarity];
  const name = locale === "ko" ? skin.name_ko : skin.name_en;
  const quote = locale === "ko" ? skin.quote_ko : skin.quote_en;
  const rarityLabel = t(locale, `rarity_${skin.rarity}` as TranslationKey);
  const modifierLabel = skin.rarity_modifier
    ? t(locale, `skins_rarity_modifier_${skin.rarity_modifier}` as TranslationKey)
    : null;

  const isBody = !!skin.body_image;
  const panels = skin.body_panels ?? 1;
  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className={cn("flex gap-4", isBody ? "flex-col items-center" : "items-start")}>
        {isBody && skin.body_image ? (
          <BodyCarousel
            src={skin.body_image}
            panels={panels}
            alt={name}
            borderColor={color}
          />
        ) : (
          <div
            className="shrink-0 flex items-center justify-center size-24 rounded-md border-2 bg-black/70 overflow-hidden"
            style={{ borderColor: color }}
          >
            {skin.icon ? (
              <Image
                src={assetPath(skin.icon)}
                alt={name}
                width={88}
                height={88}
                className="size-20 object-contain"
                unoptimized
              />
            ) : null}
          </div>
        )}
        <div className={cn("flex-1 min-w-0", isBody && "w-full text-center")}>{/* center on body skin */}
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
            style={{ color }}
          >
            {modifierLabel ? `${modifierLabel} · ${rarityLabel}` : rarityLabel}
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight break-words pr-6">
            {name}
          </h2>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            {skin.id}
          </div>
        </div>
      </div>

      {quote && (
        <blockquote className="border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
          {quote}
        </blockquote>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">{t(locale, "skins_base_prefab")}</dt>
        <dd className="text-foreground font-mono">{skin.base_prefab}</dd>
        {skin.set_id && (
          <>
            <dt className="text-muted-foreground">{t(locale, "skins_set_label")}</dt>
            <dd className="text-foreground font-mono">{skin.set_id}</dd>
          </>
        )}
        <dt className="text-muted-foreground">{t(locale, "skins_release_group")}</dt>
        <dd className="text-foreground">#{skin.release_group}</dd>
      </dl>

      {skin.skin_tags.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">{t(locale, "skins_tags")}</div>
          <div className="flex flex-wrap gap-1">
            {skin.skin_tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function SkinsApp() {
  const { resolvedLocale } = useSettings();
  const locale = resolvedLocale;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("__all__");
  const [rarityFilter, setRarityFilter] = useState<SkinRarity | "__all__">("__all__");

  const [selected, setSelected] = useState<SkinEntry | null>(null);
  const { panelItem, panelOpen } = useDetailPanel(selected);

  const filtered = useMemo(() => {
    let pool: SkinEntry[];
    if (category === "__all__") {
      pool = SKIN_INDEX.all;
    } else {
      pool = SKIN_INDEX.byCategory.get(category) ?? [];
    }
    if (rarityFilter !== "__all__") {
      pool = pool.filter((s) => s.rarity === rarityFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      pool = pool.filter((s) =>
        s.name_ko.toLowerCase().includes(q) ||
        s.name_en.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.base_prefab.toLowerCase().includes(q),
      );
    }
    return pool
      .slice()
      .sort((a, b) => {
        const r = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
        if (r !== 0) return r;
        return a.name_ko.localeCompare(b.name_ko);
      });
  }, [category, rarityFilter, query]);

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("__all__");
    setRarityFilter("__all__");
  }, []);

  // Tab home — react to tab re-tap (AppShell broadcasts this)
  useEffect(() => {
    const handler = () => resetFilters();
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, [resetFilters]);

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar — search + chips */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="px-3 pt-2 pb-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(locale, "skins_search_placeholder")}
              className="w-full pl-8 pr-8 py-2 rounded-md border border-input bg-card text-base focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground hover:text-foreground"
                aria-label="clear"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ChipButton
            active={category === "__all__"}
            onClick={() => setCategory("__all__")}
            label={`${t(locale, "skins_filter_all")} (${SKIN_INDEX.all.length})`}
          />
          {SKIN_INDEX.categories.map((key) => {
            const list = SKIN_INDEX.byCategory.get(key) ?? [];
            return (
              <ChipButton
                key={key}
                active={category === key}
                onClick={() => setCategory(key)}
                label={`${categoryLabel(key, locale)} (${list.length})`}
              />
            );
          })}
        </div>

        {/* Rarity chips */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-border/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ChipButton
            active={rarityFilter === "__all__"}
            onClick={() => setRarityFilter("__all__")}
            label={t(locale, "skins_filter_all")}
          />
          {SKIN_INDEX.rarities.map((r) => (
            <ChipButton
              key={r}
              active={rarityFilter === r}
              onClick={() => setRarityFilter(r)}
              label={t(locale, `rarity_${r}` as TranslationKey)}
              color={RARITY_HEX[r]}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto" data-scroll-container>
        <div className="px-3 pt-3 pb-2 text-xs text-muted-foreground">
          {filtered.length}{locale === "ko" ? ` ${t(locale, "skins_count")}` : ` ${t(locale, "skins_count")}`}
          {(query || category !== "__all__" || rarityFilter !== "__all__") && (
            <button
              onClick={resetFilters}
              className="ml-2 underline hover:text-foreground"
            >
              {t(locale, "skins_filter_clear")}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            {t(locale, "skins_no_results")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 px-3 pb-4">
              {filtered.map((skin) => (
                <SkinCard
                  key={skin.id}
                  skin={skin}
                  locale={locale}
                  onClick={() => setSelected(skin)}
                />
              ))}
            </div>
            <p className="px-3 pb-6 text-[10px] leading-relaxed text-muted-foreground">
              {t(locale, "skins_body_attribution")}{" "}
              <a
                href="https://dontstarve.wiki.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                dontstarve.wiki.gg
              </a>{" "}
              (CC BY-SA)
            </p>
          </>
        )}
      </div>

      <DetailPanel open={panelOpen} onClose={() => setSelected(null)}>
        {panelItem && (
          <SkinDetail skin={panelItem} locale={locale} onClose={() => setSelected(null)} />
        )}
      </DetailPanel>
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-card text-foreground border-border hover:border-foreground/40",
      )}
      style={active && color ? { backgroundColor: color, borderColor: color, color: "#fff" } : undefined}
    >
      {label}
    </button>
  );
}
