"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight, ArrowUpDown } from "lucide-react";
import {
  SKINS,
  type SkinEntry,
  type SkinRarity,
} from "@/data/skins";
import { useSettings } from "@/hooks/use-settings";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { useSlideAnimation } from "@/hooks/use-slide-animation";
import { useRecent } from "@/hooks/use-recent";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { TagChip } from "@/components/ui/TagChip";
import { Footer } from "../crafting/Footer";

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
// Categories — characters (18) + item kinds (10)
// ---------------------------------------------------------------------------

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
const CHARACTER_ORDER = [
  "wilson", "willow", "wolfgang", "wendy", "wx78", "wickerbottom",
  "woodie", "wes", "maxwell", "wigfrid", "webber",
  "winona", "warly", "wortox", "wormwood", "wurt", "walter", "wanda",
];

const KIND_ORDER = [
  "body", "hat", "armor", "weapon", "staff", "tool", "amulet",
  "backpack", "beefalo", "item",
] as const;
type KindKey = (typeof KIND_ORDER)[number];

const KIND_LABEL_KO: Record<KindKey, string> = {
  body: "본체", hat: "모자", armor: "방어구", weapon: "무기", staff: "지팡이",
  tool: "도구", amulet: "부적·장신구", backpack: "가방", beefalo: "비팔로", item: "기타",
};
const KIND_LABEL_EN: Record<KindKey, string> = {
  body: "Body", hat: "Hat", armor: "Armor", weapon: "Weapon", staff: "Staff",
  tool: "Tool", amulet: "Amulet", backpack: "Backpack", beefalo: "Beefalo", item: "Other",
};

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
  if (base.includes("backpack") || base.includes("krampus_sack") || base.includes("piggyback")) return "backpack";
  if (base.startsWith("beefalo") || base.startsWith("saddle") || base.startsWith("bell")) return "beefalo";
  if (/^(axe|hammer|pickaxe|shovel|pitchfork|bugnet|fishingrod|multitool_axe_pickaxe|saltrock_hammer|reskin_tool)/.test(base)) return "tool";
  if (/^(spear|sword|bat|boomerang|blowdart|nightsword|tropical_fan|featherfan|whip|trident|slingshot)/.test(base)) return "weapon";
  return "item";
}

// Pre-compute kind and grouping once.
const KIND_BY_SKIN = new Map<SkinEntry, KindKey>();
const CHAR_COUNT: Record<string, number> = {};
const KIND_COUNT: Record<KindKey, number> = {} as Record<KindKey, number>;
for (const s of SKINS) {
  const k = itemKind(s);
  KIND_BY_SKIN.set(s, k);
  KIND_COUNT[k] = (KIND_COUNT[k] ?? 0) + 1;
  if (s.character) CHAR_COUNT[s.character] = (CHAR_COUNT[s.character] ?? 0) + 1;
}

// Representative image per category (used on the home grid tiles).
const CHAR_TILE_IMG: Record<string, string> = {};
for (const s of SKINS) {
  const c = s.character;
  if (!c || CHAR_TILE_IMG[c]) continue;
  // Prefer a body image for character tiles; fall back to first available icon.
  if (s.body_image) CHAR_TILE_IMG[c] = s.body_image;
}
for (const s of SKINS) {
  const c = s.character;
  if (!c || CHAR_TILE_IMG[c]) continue;
  if (s.icon) CHAR_TILE_IMG[c] = s.icon;
}
const KIND_TILE_IMG: Record<KindKey, string> = {} as Record<KindKey, string>;
for (const s of SKINS) {
  const k = KIND_BY_SKIN.get(s)!;
  if (KIND_TILE_IMG[k]) continue;
  if (s.body_image) KIND_TILE_IMG[k] = s.body_image;
}
for (const s of SKINS) {
  const k = KIND_BY_SKIN.get(s)!;
  if (KIND_TILE_IMG[k]) continue;
  if (s.icon) KIND_TILE_IMG[k] = s.icon;
}

function characterLabel(key: string, locale: Locale): string {
  const ch = CHARACTERS[key];
  return ch ? (locale === "ko" ? ch.ko : ch.en) : key;
}
function kindLabel(key: KindKey, locale: Locale): string {
  return (locale === "ko" ? KIND_LABEL_KO : KIND_LABEL_EN)[key];
}

// ---------------------------------------------------------------------------
// Category state — "categoryId" is one of:
//   null            → home view
//   "all"           → every skin
//   "favorites"     → (reserved; not yet wired to favorites store)
//   "recent"        → recently viewed skins (per-device)
//   "<char>"        → character key (wilson, walter, …)
//   "kind:<kind>"   → item kind (hat, body, weapon, …)
// ---------------------------------------------------------------------------

type CategoryId = string | null;
type SkinSort = "rarity" | "name" | "release_new" | "release_old";

function categoryMatches(cat: string, skin: SkinEntry): boolean {
  if (cat === "all") return true;
  if (cat.startsWith("kind:")) return KIND_BY_SKIN.get(skin) === cat.slice(5);
  // character key
  return skin.character === cat;
}

function categoryDisplayLabel(cat: string, locale: Locale): string {
  if (cat === "all") return t(locale, "skins_filter_all");
  if (cat === "recent") return t(locale, "recent");
  if (cat === "favorites") return t(locale, "favorites");
  if (cat.startsWith("kind:")) return kindLabel(cat.slice(5) as KindKey, locale);
  return characterLabel(cat, locale);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function SkinsApp() {
  const { resolvedLocale } = useSettings();
  const locale = resolvedLocale;
  const { recentIds, addRecent } = useRecent("skins");

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(null);
  const [selectedSkin, setSelectedSkin] = useState<SkinEntry | null>(null);
  const [sort, setSort] = useState<SkinSort>("rarity");

  const { panelItem, panelOpen } = useDetailPanel(selectedSkin);
  const slideClass = useSlideAnimation(selectedCategory, (v) => v === null);

  const handleGoHome = useCallback(() => setSelectedCategory(null), []);
  const handleSelectCategory = useCallback((id: string) => {
    setSelectedCategory(id);
    setSort("rarity");
  }, []);

  // Re-tap active tab → go home
  useEffect(() => {
    const handler = () => { setSelectedCategory(null); setSelectedSkin(null); };
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, []);

  // List view: filter + sort
  const listSkins = useMemo(() => {
    if (selectedCategory === null) return [];
    let pool: SkinEntry[];
    if (selectedCategory === "recent") {
      const idx = new Map(SKINS.map((s) => [s.id, s] as const));
      pool = recentIds.map((id) => idx.get(id)).filter((s): s is SkinEntry => !!s);
    } else {
      pool = SKINS.filter((s) => categoryMatches(selectedCategory, s));
    }
    const cmpName = (a: SkinEntry, b: SkinEntry) =>
      (locale === "ko" ? a.name_ko : a.name_en).localeCompare(
        locale === "ko" ? b.name_ko : b.name_en, locale);
    const sorted = pool.slice();
    switch (sort) {
      case "name":
        sorted.sort(cmpName);
        break;
      case "release_new":
        sorted.sort((a, b) => b.release_group - a.release_group || cmpName(a, b));
        break;
      case "release_old":
        sorted.sort((a, b) => a.release_group - b.release_group || cmpName(a, b));
        break;
      case "rarity":
      default:
        // Within rarity, group by kind so body/hat/weapon don't shuffle together.
        sorted.sort((a, b) => {
          const r = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
          if (r !== 0) return r;
          const ka = KIND_ORDER.indexOf(KIND_BY_SKIN.get(a)!);
          const kb = KIND_ORDER.indexOf(KIND_BY_SKIN.get(b)!);
          if (ka !== kb) return ka - kb;
          return cmpName(a, b);
        });
    }
    return sorted;
  }, [selectedCategory, recentIds, sort, locale]);

  const handleSelectSkin = useCallback((skin: SkinEntry) => {
    addRecent(skin.id);
    setSelectedSkin(skin);
  }, [addRecent]);

  const detailPanel = (
    <DetailPanel open={panelOpen} onClose={() => setSelectedSkin(null)}>
      {panelItem && (
        <SkinDetail skin={panelItem} locale={locale} />
      )}
    </DetailPanel>
  );

  // -----------------------------------------------------------------------
  // Home view — category grid (characters + kinds)
  // -----------------------------------------------------------------------
  if (selectedCategory === null) {
    return (
      <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
        <div className="border-b border-border bg-background/80 px-4 py-2.5">
          <SkinBreadcrumb locale={locale} onHomeClick={handleGoHome} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
          <div className="flex flex-col min-h-full">
            <div className="px-3 sm:px-4 max-w-4xl mx-auto w-full">
              {/* Quick access: All + Recent */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pt-3 sm:pt-4">
                <CategoryCard
                  imageSrc={assetPath("/images/skins/walterhat_ancient.png")}
                  label={t(locale, "skins_filter_all")}
                  badgeCount={SKINS.length}
                  onClick={() => handleSelectCategory("all")}
                />
                <CategoryCard
                  imageSrc={assetPath("/images/game-items/pocketwatch_warp.png")}
                  label={t(locale, "recent")}
                  badgeCount={recentIds.length}
                  onClick={() => handleSelectCategory("recent")}
                />
              </div>

              {/* Characters section */}
              <h3 className="mt-5 mb-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t(locale, "skins_section_characters")}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                {CHARACTER_ORDER.filter((c) => CHAR_COUNT[c]).map((c) => (
                  <CategoryCard
                    key={c}
                    imageSrc={assetPath(CHAR_TILE_IMG[c] ?? "/images/skins/walterhat_ancient.png")}
                    label={characterLabel(c, locale)}
                    badgeCount={CHAR_COUNT[c]}
                    onClick={() => handleSelectCategory(c)}
                  />
                ))}
              </div>

              {/* Kinds section */}
              <h3 className="mt-5 mb-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t(locale, "skins_section_kinds")}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pb-4">
                {KIND_ORDER.filter((k) => KIND_COUNT[k]).map((k) => (
                  <CategoryCard
                    key={k}
                    imageSrc={assetPath(KIND_TILE_IMG[k] ?? "/images/skins/walterhat_ancient.png")}
                    label={kindLabel(k, locale)}
                    badgeCount={KIND_COUNT[k]}
                    onClick={() => handleSelectCategory(`kind:${k}`)}
                  />
                ))}
              </div>
            </div>
            <Footer />
          </div>
        </div>

        {detailPanel}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // List view — skins in the selected category
  // -----------------------------------------------------------------------
  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
      <div className="border-b border-border bg-background/80 px-4 py-2.5 flex items-center justify-between gap-2">
        <SkinBreadcrumb
          locale={locale}
          categoryLabel={categoryDisplayLabel(selectedCategory, locale)}
          onHomeClick={handleGoHome}
        />
        <SortMenu value={sort} onChange={setSort} locale={locale} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" data-scroll-container="">
        <div className="flex flex-col min-h-full">
          {listSkins.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              {t(locale, "skins_no_results")}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
              {listSkins.map((skin) => (
                <SkinCard
                  key={skin.id}
                  skin={skin}
                  locale={locale}
                  onClick={() => handleSelectSkin(skin)}
                />
              ))}
            </div>
          )}
          <Footer />
        </div>
      </div>

      {detailPanel}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkinBreadcrumb (mirrors BossBreadcrumb)
// ---------------------------------------------------------------------------

function SkinBreadcrumb({
  locale,
  categoryLabel: catLabel,
  onHomeClick,
}: {
  locale: Locale;
  categoryLabel?: string;
  onHomeClick: () => void;
}) {
  const iconSrc = assetPath("/images/skins/walterhat_ancient.png");
  const isHome = !catLabel;

  return (
    <nav className="flex items-center gap-1 min-w-0 text-sm">
      {isHome ? (
        <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
      ) : (
        <button onClick={onHomeClick} className="shrink-0 rounded-sm hover:opacity-70 transition-opacity">
          <Image src={iconSrc} alt="Home" width={20} height={20} className="size-5 rounded-sm" />
        </button>
      )}

      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />

      {isHome ? (
        <span className="font-semibold text-foreground truncate">
          {t(locale, "tab_skins")}
        </span>
      ) : (
        <>
          <button
            onClick={onHomeClick}
            className="text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            {t(locale, "tab_skins")}
          </button>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate">{catLabel}</span>
        </>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// SkinCard (mirrors BossCard styling)
// ---------------------------------------------------------------------------

function SkinCard({
  skin,
  locale,
  onClick,
}: {
  skin: SkinEntry;
  locale: Locale;
  onClick: () => void;
}) {
  const color = RARITY_HEX[skin.rarity];
  const name = locale === "ko" ? skin.name_ko : skin.name_en;
  const src = skin.body_image ?? skin.icon ?? "";
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover border-border hover:border-ring"
    >
      <div
        className="flex items-center justify-center size-12 sm:size-14 rounded-sm border bg-black/60 overflow-hidden"
        style={{ borderColor: color }}
      >
        {src ? (
          <img
            src={assetPath(src)}
            alt={name}
            className="size-full object-contain p-0.5"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span className="text-[10px] text-muted-foreground">?</span>
        )}
      </div>
      <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight line-clamp-2">
        {name}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SkinDetail (bottom sheet content)
// ---------------------------------------------------------------------------

function SkinDetail({ skin, locale }: { skin: SkinEntry; locale: Locale }) {
  const color = RARITY_HEX[skin.rarity];
  const name = locale === "ko" ? skin.name_ko : skin.name_en;
  const quote = locale === "ko" ? skin.quote_ko : skin.quote_en;
  const rarityLabel = t(locale, `rarity_${skin.rarity}` as TranslationKey);
  const modifierLabel = skin.rarity_modifier
    ? t(locale, `skins_rarity_modifier_${skin.rarity_modifier}` as TranslationKey)
    : null;
  const heroSrc = skin.body_image ?? skin.icon;
  const isBody = !!skin.body_image;

  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      {heroSrc && (
        <div
          className={cn(
            "mx-auto rounded-md border-2 bg-black/70 overflow-hidden flex items-center justify-center",
            isBody ? "w-full max-w-[280px] aspect-square" : "size-24",
          )}
          style={{ borderColor: color }}
        >
          <Image
            src={assetPath(heroSrc)}
            alt={name}
            width={isBody ? 250 : 88}
            height={isBody ? 250 : 88}
            className={cn("object-contain", isBody ? "size-full p-2" : "size-20")}
            unoptimized
          />
        </div>
      )}

      <div className={cn("min-w-0", isBody && "text-center")}>
        <div
          className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
          style={{ color }}
        >
          {modifierLabel ? `${modifierLabel} · ${rarityLabel}` : rarityLabel}
        </div>
        <h2 className="text-lg font-bold text-foreground leading-tight break-words pr-6">
          {name}
        </h2>
        <div className="text-xs text-muted-foreground mt-1 font-mono">{skin.id}</div>
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
// SortMenu (inline dropdown — 4 sort options for skins)
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
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <ArrowUpDown className="size-3.5" />
        {current.label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-md border border-border bg-popover shadow-md py-1">
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
