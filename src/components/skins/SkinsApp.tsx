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
import { TabScrollArea } from "@/components/ui/TabScrollArea";
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
// Characters + kinds
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
  "hat", "armor", "weapon", "staff", "tool", "amulet",
  "backpack", "beefalo", "item",
] as const;
type KindKey = (typeof KIND_ORDER)[number];

const KIND_LABEL_KO: Record<KindKey, string> = {
  hat: "모자", armor: "방어구", weapon: "무기", staff: "지팡이", tool: "도구",
  amulet: "부적·장신구", backpack: "가방", beefalo: "비팔로", item: "기타",
};
const KIND_LABEL_EN: Record<KindKey, string> = {
  hat: "Hat", armor: "Armor", weapon: "Weapon", staff: "Staff", tool: "Tool",
  amulet: "Amulet", backpack: "Backpack", beefalo: "Beefalo", item: "Other",
};

function itemKind(skin: SkinEntry): KindKey | "body" {
  if (skin.type === "base") return "body";
  const base = skin.base_prefab ?? "";
  if (/staff$/.test(base) || /^(firestaff|icestaff|telestaff|orangestaff|greenstaff|yellowstaff|opalstaff)/.test(base)) return "staff";
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

// Pre-computed indexes
const KIND_BY_SKIN = new Map<SkinEntry, KindKey | "body">();
const CHAR_COUNT: Record<string, number> = {};
const KIND_COUNT: Record<string, number> = {};
let CHARACTERS_TOTAL = 0;
for (const s of SKINS) {
  const k = itemKind(s);
  KIND_BY_SKIN.set(s, k);
  KIND_COUNT[k] = (KIND_COUNT[k] ?? 0) + 1;
  if (s.character) {
    CHAR_COUNT[s.character] = (CHAR_COUNT[s.character] ?? 0) + 1;
    CHARACTERS_TOTAL += 1;
  }
}

// ---------------------------------------------------------------------------
// Tile images — use skill-tab portraits for characters; first available
// inventory icon for kinds.
// ---------------------------------------------------------------------------

function charPortrait(charKey: string): string {
  return `/images/category-icons/characters/${charKey}.png`;
}

const KIND_TILE_IMG: Record<string, string> = {};
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
// View / navigation state
// ---------------------------------------------------------------------------

/**
 * Three depths:
 *   "home"        → top-level categories (characters tile + kind tiles)
 *   "characters"  → 18 character grid (after tapping the "Characters" tile)
 *   "list:<id>"   → skins grid for a single category. id forms:
 *                     "all" | "recent" | "char:<key>" | "kind:<key>"
 */
type View = "home" | "characters" | { kind: "list"; id: string };
type SkinSort = "rarity" | "name" | "release_new" | "release_old";

function listCategoryMatches(id: string, skin: SkinEntry): boolean {
  if (id === "all") return true;
  if (id.startsWith("char:")) return skin.character === id.slice(5);
  if (id.startsWith("kind:")) return KIND_BY_SKIN.get(skin) === id.slice(5);
  return false;
}

function listCategoryLabel(id: string, locale: Locale): string {
  if (id === "all") return t(locale, "skins_filter_all");
  if (id === "recent") return t(locale, "recent");
  if (id.startsWith("char:")) return characterLabel(id.slice(5), locale);
  if (id.startsWith("kind:")) return kindLabel(id.slice(5) as KindKey, locale);
  return id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// URL helpers — keep view + cat synced with `?tab=skins&...` so the system
// Back button steps through the navigation depth (home ← characters ← list).
// ---------------------------------------------------------------------------

function getParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}
function isSkinsTab(): boolean {
  return getParams().get("tab") === "skins";
}
function viewFromUrl(): View {
  const p = getParams();
  if (p.get("tab") !== "skins") return "home";
  const v = p.get("view");
  if (v === "characters") return "characters";
  const cat = p.get("cat");
  if (cat) return { kind: "list", id: cat };
  return "home";
}
function buildUrlForView(v: View): string {
  const params = getParams();
  params.set("tab", "skins");
  params.delete("view");
  params.delete("cat");
  if (v === "home") {
    // leave only ?tab=skins
  } else if (v === "characters") {
    params.set("view", "characters");
  } else {
    params.set("cat", v.id);
  }
  return `${window.location.pathname}?${params.toString()}`;
}

export function SkinsApp() {
  const { resolvedLocale } = useSettings();
  const locale = resolvedLocale;
  const { recentIds, addRecent } = useRecent("skins");

  const [view, setView] = useState<View>(() =>
    typeof window === "undefined" ? "home" : viewFromUrl(),
  );
  const [selectedSkin, setSelectedSkin] = useState<SkinEntry | null>(null);
  const [sort, setSort] = useState<SkinSort>("rarity");

  const { panelItem, panelOpen } = useDetailPanel(selectedSkin);
  // Animate "home <-> not-home" transitions (mirrors BossesApp behavior).
  const slideKey = view === "home" ? null : view === "characters" ? "characters" : (view as any).id;
  const slideClass = useSlideAnimation(slideKey, (v) => v === null);

  // Replace state on the current entry without spawning a new history step.
  // Used when navigating "up" (the user pressed Back-equivalent in the UI).
  const replaceView = useCallback((v: View) => {
    if (typeof window !== "undefined" && isSkinsTab()) {
      window.history.replaceState({ _appNav: true }, "", buildUrlForView(v));
    }
    setView(v);
  }, []);
  // Push a new history entry so system Back returns to the previous depth.
  const pushView = useCallback((v: View) => {
    if (typeof window !== "undefined" && isSkinsTab()) {
      window.history.pushState({ _appNav: true }, "", buildUrlForView(v));
    }
    setView(v);
    setSort("rarity");
  }, []);

  // Sync from URL on popstate (system Back/Forward).
  useEffect(() => {
    const onPop = () => {
      if (!isSkinsTab()) return;
      setView(viewFromUrl());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleGoHome = useCallback(() => replaceView("home"), [replaceView]);
  const handleOpenCharacters = useCallback(() => pushView("characters"), [pushView]);
  const handleOpenList = useCallback((id: string) => pushView({ kind: "list", id }), [pushView]);

  // Re-tap active tab → go home, close panel
  useEffect(() => {
    const handler = () => { replaceView("home"); setSelectedSkin(null); };
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, [replaceView]);

  // List view: filtered + sorted
  const listSkins = useMemo(() => {
    if (typeof view === "string") return [];
    const id = view.id;
    let pool: SkinEntry[];
    if (id === "recent") {
      const idx = new Map(SKINS.map((s) => [s.id, s] as const));
      pool = recentIds.map((id) => idx.get(id)).filter((s): s is SkinEntry => !!s);
    } else {
      pool = SKINS.filter((s) => listCategoryMatches(id, s));
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
        sorted.sort((a, b) => {
          const r = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
          if (r !== 0) return r;
          // group by kind within same rarity so body/hat don't mix
          const ka = (KIND_ORDER as readonly string[]).indexOf(KIND_BY_SKIN.get(a) ?? "item");
          const kb = (KIND_ORDER as readonly string[]).indexOf(KIND_BY_SKIN.get(b) ?? "item");
          if (ka !== kb) return ka - kb;
          return cmpName(a, b);
        });
    }
    return sorted;
  }, [view, recentIds, sort, locale]);

  const handleSelectSkin = useCallback((skin: SkinEntry) => {
    addRecent(skin.id);
    setSelectedSkin(skin);
  }, [addRecent]);

  const detailPanel = (
    <DetailPanel open={panelOpen} onClose={() => setSelectedSkin(null)}>
      {panelItem && <SkinDetail skin={panelItem} locale={locale} />}
    </DetailPanel>
  );

  // -----------------------------------------------------------------------
  // Header + main content split by view. Outer wrapper + Footer/scroll area
  // are shared (TabScrollArea), so Footer doesn't unmount/remount on view
  // changes — that was the source of the "footer breaks on each page" bug.
  // -----------------------------------------------------------------------

  let header: React.ReactNode;
  let content: React.ReactNode;

  if (view === "home") {
    header = (
      <div className="border-b border-border bg-background/80 px-4 py-2.5">
        <SkinBreadcrumb locale={locale} onHomeClick={handleGoHome} />
      </div>
    );
    content = (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
        <CategoryCard
          imageSrc={assetPath("/images/category-icons/all.png")}
          label={t(locale, "skins_filter_all")}
          badgeCount={SKINS.length}
          onClick={() => handleOpenList("all")}
        />
        <CategoryCard
          imageSrc={assetPath("/images/game-items/pocketwatch_warp.png")}
          label={t(locale, "recent")}
          badgeCount={recentIds.length}
          onClick={() => handleOpenList("recent")}
        />
        <CategoryCard
          imageSrc={assetPath("/images/category-icons/character.png")}
          label={t(locale, "skins_section_characters")}
          badgeCount={CHARACTERS_TOTAL}
          onClick={handleOpenCharacters}
        />
        {KIND_ORDER.map((k) =>
          KIND_COUNT[k] ? (
            <CategoryCard
              key={k}
              imageSrc={assetPath(KIND_TILE_IMG[k] ?? "/images/category-icons/all.png")}
              label={kindLabel(k, locale)}
              badgeCount={KIND_COUNT[k]}
              onClick={() => handleOpenList(`kind:${k}`)}
            />
          ) : null,
        )}
        {KIND_COUNT["body"] && (
          <CategoryCard
            imageSrc={assetPath("/images/category-icons/clothing.png")}
            label={t(locale, "skins_kind_body")}
            badgeCount={KIND_COUNT["body"]}
            onClick={() => handleOpenList("kind:body")}
          />
        )}
      </div>
    );
  } else if (view === "characters") {
    header = (
      <div className="border-b border-border bg-background/80 px-4 py-2.5">
        <SkinBreadcrumb
          locale={locale}
          categoryLabel={t(locale, "skins_section_characters")}
          onHomeClick={handleGoHome}
        />
      </div>
    );
    content = (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
        {CHARACTER_ORDER.filter((c) => CHAR_COUNT[c]).map((c) => (
          <CategoryCard
            key={c}
            imageSrc={assetPath(charPortrait(c))}
            label={characterLabel(c, locale)}
            badgeCount={CHAR_COUNT[c]}
            onClick={() => handleOpenList(`char:${c}`)}
          />
        ))}
      </div>
    );
  } else {
    const id = view.id;
    const isFromCharacters = id.startsWith("char:");
    const parentLabel = isFromCharacters ? t(locale, "skins_section_characters") : undefined;
    header = (
      <div className="border-b border-border bg-background/80 px-4 py-2.5 flex items-center justify-between gap-2">
        <SkinBreadcrumb
          locale={locale}
          parentLabel={parentLabel}
          onParentClick={isFromCharacters ? handleOpenCharacters : undefined}
          categoryLabel={listCategoryLabel(id, locale)}
          onHomeClick={handleGoHome}
        />
        <SortMenu value={sort} onChange={setSort} locale={locale} />
      </div>
    );
    content =
      listSkins.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8">
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
      );
  }

  return (
    <div className={`flex flex-col h-full bg-background text-foreground overflow-hidden ${slideClass}`}>
      {header}
      <TabScrollArea scrollContainer>{content}</TabScrollArea>
      {detailPanel}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb (3 depths: home > parent? > current)
// ---------------------------------------------------------------------------

function SkinBreadcrumb({
  locale,
  parentLabel,
  onParentClick,
  categoryLabel: catLabel,
  onHomeClick,
}: {
  locale: Locale;
  parentLabel?: string;
  onParentClick?: () => void;
  categoryLabel?: string;
  onHomeClick: () => void;
}) {
  const iconSrc = assetPath("/images/skins/axe_heart.png");
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
          {parentLabel && onParentClick ? (
            <>
              <button
                onClick={onParentClick}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {parentLabel}
              </button>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            </>
          ) : null}
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
// SortMenu (inline dropdown — 4 sort options)
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
