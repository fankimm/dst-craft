"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, X, ArrowUpDown } from "lucide-react";
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

// Item kinds — independent from character. Character chip and kind chip
// compose (e.g. "Wigfrid + weapon" = wathgrithr spears only).
const KIND_ORDER = [
  "body", "hat", "armor", "weapon", "staff", "tool", "amulet",
  "backpack", "beefalo", "item",
] as const;
type KindKey = (typeof KIND_ORDER)[number];

const KIND_LABEL_KO: Record<KindKey, string> = {
  body: "본체",
  hat: "모자",
  armor: "방어구",
  weapon: "무기",
  staff: "지팡이",
  tool: "도구",
  amulet: "부적/장신구",
  backpack: "가방",
  beefalo: "비팔로",
  item: "기타",
};
const KIND_LABEL_EN: Record<KindKey, string> = {
  body: "Body",
  hat: "Hat",
  armor: "Armor",
  weapon: "Weapon",
  staff: "Staff",
  tool: "Tool",
  amulet: "Amulet",
  backpack: "Backpack",
  beefalo: "Beefalo",
  item: "Other",
};

/** Coarse kind for a skin, decoupled from character. */
function itemKind(skin: SkinEntry): KindKey {
  if (skin.type === "base") return "body";
  const base = skin.base_prefab ?? "";
  if (/staff$/.test(base) || /^(firestaff|icestaff|telestaff|orangestaff|greenstaff|yellowstaff|opalstaff)/.test(base)) {
    return "staff";
  }
  if (base.includes("hat")) return "hat";
  if (base.startsWith("armor")) return "armor";
  if (base.startsWith("amulet")) return "amulet";
  if (base.startsWith("cane")) return "staff";
  if (base.includes("backpack") || base.includes("krampus_sack") || base.includes("piggyback")) {
    return "backpack";
  }
  if (base.startsWith("beefalo") || base.startsWith("saddle") || base.startsWith("bell")) {
    return "beefalo";
  }
  if (
    /^(spear|sword|axe|hammer|pickaxe|shovel|pitchfork|bat|boomerang|blowdart|nightsword|reskin_tool|tropical_fan|featherfan|bugnet|fishingrod|whip|trident|saltrock_hammer|multitool_axe_pickaxe|slingshot)/.test(base)
  ) {
    // axe/hammer/pickaxe/shovel are also tools — keep them under "tool"; the
    // pure weapons (spear/sword/etc.) stay under "weapon".
    if (/^(axe|hammer|pickaxe|shovel|pitchfork|bugnet|fishingrod|multitool_axe_pickaxe|saltrock_hammer|reskin_tool)/.test(base)) {
      return "tool";
    }
    return "weapon";
  }
  return "item";
}

function kindLabel(key: KindKey, locale: Locale): string {
  return (locale === "ko" ? KIND_LABEL_KO : KIND_LABEL_EN)[key];
}

function characterLabel(key: string, locale: Locale): string {
  const ch = CHARACTERS[key];
  if (ch) return locale === "ko" ? ch.ko : ch.en;
  return key;
}

// ---------------------------------------------------------------------------
// Pre-indexed dimensions for chip counts.
// ---------------------------------------------------------------------------

type SkinSort = "rarity" | "name" | "release_new" | "release_old";

interface SkinIndex {
  all: SkinEntry[];
  characters: string[];           // in roster order, only those present
  charCount: Record<string, number>;
  kinds: KindKey[];               // present kinds, in KIND_ORDER
  kindCount: Record<KindKey, number>;
  rarities: SkinRarity[];         // present rarities, by rarity order
  rarityCount: Record<string, number>;
  kindByEntry: Map<SkinEntry, KindKey>; // memoized
}

const SKIN_INDEX: SkinIndex = (() => {
  const kindByEntry = new Map<SkinEntry, KindKey>();
  const charCount: Record<string, number> = {};
  const kindCount: Record<string, number> = {};
  const rarityCount: Record<string, number> = {};

  for (const s of SKINS) {
    const k = itemKind(s);
    kindByEntry.set(s, k);
    kindCount[k] = (kindCount[k] ?? 0) + 1;
    if (s.character) charCount[s.character] = (charCount[s.character] ?? 0) + 1;
    rarityCount[s.rarity] = (rarityCount[s.rarity] ?? 0) + 1;
  }

  const characters = CHARACTER_ORDER.filter((c) => charCount[c]);
  const kinds = KIND_ORDER.filter((k) => kindCount[k]) as KindKey[];
  const rarities = (Object.keys(rarityCount) as SkinRarity[]).sort(
    (a, b) => RARITY_ORDER[a] - RARITY_ORDER[b],
  );

  return {
    all: SKINS,
    characters,
    charCount,
    kinds,
    kindCount: kindCount as Record<KindKey, number>,
    rarities,
    rarityCount,
    kindByEntry,
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
  const heroSrc = skin.body_image ?? skin.icon ?? "";
  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className={cn("flex gap-4", isBody ? "flex-col items-center" : "items-start")}>
        <div
          className={cn(
            "shrink-0 flex items-center justify-center rounded-md border-2 bg-black/70 overflow-hidden",
            isBody ? "w-full max-w-[280px] aspect-square" : "size-24",
          )}
          style={{ borderColor: color }}
        >
          {heroSrc ? (
            <Image
              src={assetPath(heroSrc)}
              alt={name}
              width={isBody ? 250 : 88}
              height={isBody ? 250 : 88}
              className={cn("object-contain", isBody ? "size-full p-2" : "size-20")}
              unoptimized
            />
          ) : null}
        </div>
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
  // Character chip: single select (a skin belongs to at most one character).
  const [character, setCharacter] = useState<string | null>(null);
  // Kind + rarity chips: multi-select (empty set = no filter).
  const [kinds, setKinds] = useState<Set<KindKey>>(new Set());
  const [rarities, setRarities] = useState<Set<SkinRarity>>(new Set());
  const [sort, setSort] = useState<SkinSort>("rarity");

  const [selected, setSelected] = useState<SkinEntry | null>(null);
  const { panelItem, panelOpen } = useDetailPanel(selected);

  const toggleKind = useCallback((k: KindKey) => {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }, []);
  const toggleRarity = useCallback((r: SkinRarity) => {
    setRarities((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let pool: SkinEntry[] = SKIN_INDEX.all;
    if (character) {
      pool = pool.filter((s) => s.character === character);
    }
    if (kinds.size > 0) {
      pool = pool.filter((s) => kinds.has(SKIN_INDEX.kindByEntry.get(s) ?? "item"));
    }
    if (rarities.size > 0) {
      pool = pool.filter((s) => rarities.has(s.rarity));
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
    const sorted = pool.slice();
    switch (sort) {
      case "name":
        sorted.sort((a, b) => {
          const an = locale === "ko" ? a.name_ko : a.name_en;
          const bn = locale === "ko" ? b.name_ko : b.name_en;
          return an.localeCompare(bn, locale);
        });
        break;
      case "release_new":
        sorted.sort((a, b) => b.release_group - a.release_group ||
          (locale === "ko" ? a.name_ko : a.name_en).localeCompare(
            locale === "ko" ? b.name_ko : b.name_en, locale));
        break;
      case "release_old":
        sorted.sort((a, b) => a.release_group - b.release_group ||
          (locale === "ko" ? a.name_ko : a.name_en).localeCompare(
            locale === "ko" ? b.name_ko : b.name_en, locale));
        break;
      case "rarity":
      default:
        sorted.sort((a, b) => {
          const r = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
          if (r !== 0) return r;
          return (locale === "ko" ? a.name_ko : a.name_en).localeCompare(
            locale === "ko" ? b.name_ko : b.name_en, locale);
        });
    }
    return sorted;
  }, [character, kinds, rarities, query, sort, locale]);

  const activeFilterCount =
    (character ? 1 : 0) + kinds.size + rarities.size + (query.trim() ? 1 : 0);

  const resetFilters = useCallback(() => {
    setQuery("");
    setCharacter(null);
    setKinds(new Set());
    setRarities(new Set());
  }, []);

  // Tab home — react to tab re-tap (AppShell broadcasts this)
  useEffect(() => {
    const handler = () => { resetFilters(); setSort("rarity"); };
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, [resetFilters]);

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar — search + sort + chips */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="px-3 pt-2 pb-1 flex items-center gap-2">
          <div className="relative flex-1">
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
          <SortMenu value={sort} onChange={setSort} locale={locale} />
        </div>

        {/* Character chips (single) */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ChipButton
            active={character === null}
            onClick={() => setCharacter(null)}
            label={`${t(locale, "skins_filter_all")} (${SKIN_INDEX.all.length})`}
          />
          {SKIN_INDEX.characters.map((c) => (
            <ChipButton
              key={c}
              active={character === c}
              onClick={() => setCharacter(character === c ? null : c)}
              label={`${characterLabel(c, locale)} (${SKIN_INDEX.charCount[c]})`}
            />
          ))}
        </div>

        {/* Kind chips (multi) */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-border/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKIN_INDEX.kinds.map((k) => (
            <ChipButton
              key={k}
              active={kinds.has(k)}
              onClick={() => toggleKind(k)}
              label={`${kindLabel(k, locale)} (${SKIN_INDEX.kindCount[k]})`}
            />
          ))}
        </div>

        {/* Rarity chips (multi) */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-border/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKIN_INDEX.rarities.map((r) => (
            <ChipButton
              key={r}
              active={rarities.has(r)}
              onClick={() => toggleRarity(r)}
              label={t(locale, `rarity_${r}` as TranslationKey)}
              color={RARITY_HEX[r]}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto" data-scroll-container>
        <div className="px-3 pt-3 pb-2 text-xs text-muted-foreground">
          {filtered.length} {t(locale, "skins_count")}
          {activeFilterCount > 0 && (
            <>
              <span className="ml-2">·</span>
              <span className="ml-2">{t(locale, "skins_filter_active").replace("{n}", String(activeFilterCount))}</span>
              <button
                onClick={resetFilters}
                className="ml-2 underline hover:text-foreground"
              >
                {t(locale, "skins_filter_clear")}
              </button>
            </>
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

// ---------------------------------------------------------------------------
// SortMenu — small dropdown next to the search input
// ---------------------------------------------------------------------------

function SortMenu({
  value,
  onChange,
  locale,
}: {
  value: SkinSort;
  onChange: (v: SkinSort) => void;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const options: { key: SkinSort; label: string }[] = [
    { key: "rarity", label: t(locale, "skins_sort_rarity") },
    { key: "name", label: t(locale, "skins_sort_name") },
    { key: "release_new", label: t(locale, "skins_sort_release_new") },
    { key: "release_old", label: t(locale, "skins_sort_release_old") },
  ];
  const current = options.find((o) => o.key === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2 py-2 rounded-md border border-input bg-card text-xs font-medium text-foreground hover:bg-accent/50 transition-colors"
        aria-label={t(locale, "skins_sort_aria")}
      >
        <ArrowUpDown className="size-3.5" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-md border border-border bg-popover shadow-md py-1">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs transition-colors",
                value === opt.key
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-popover-foreground hover:bg-accent/50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
