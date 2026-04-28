"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Copy, Check, Terminal, ChevronDown, ChevronUp, Code } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { spawnablePrefabs } from "@/data/spawnable-prefabs";
import { allItems } from "@/data/items";
import { materials } from "@/data/materials";
import {
  commandCategories,
  consoleCommands,
  type ConsoleCommand,
  type CommandCategoryId,
} from "@/data/console-commands";
import { SearchWithSuggestions, type SearchSuggestion } from "../ui/SearchWithSuggestions";
import { Footer } from "../crafting/Footer";
import { SupporterStrip } from "@/components/ui/SupporterStrip";

// ---------------------------------------------------------------------------
// Category color config
// ---------------------------------------------------------------------------

const categoryColors: Record<CommandCategoryId, {
  accent: string;
  bg: string;
  badge: string;
  copyBtn: string;
}> = {
  player: {
    accent: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 dark:bg-red-500/8",
    badge: "bg-red-500/15 text-red-600 dark:text-red-400",
    copyBtn: "bg-red-500/15 text-red-600 dark:text-red-300 hover:bg-red-500/25",
  },
  world: {
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/8",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    copyBtn: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25",
  },
  server: {
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/8",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    copyBtn: "bg-blue-500/15 text-blue-600 dark:text-blue-300 hover:bg-blue-500/25",
  },
  debug: {
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/8",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    copyBtn: "bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25",
  },
};

// ---------------------------------------------------------------------------
// Searchable item pool (items + materials merged, deduplicated)
// ---------------------------------------------------------------------------

interface SpawnableItem {
  id: string;
  name: string;
  nameKo: string;
  image: string;
}

/** Image filename overrides from allItems/materials (where image ≠ id.png) */
const imageOverrides = new Map<string, string>();
for (const item of allItems) {
  if (item.image) imageOverrides.set(item.id, item.image);
}
for (const mat of materials) {
  if (mat.image) imageOverrides.set(mat.id, mat.image);
}

const spawnableItems: SpawnableItem[] = spawnablePrefabs.map((p) => ({
  id: p.id,
  name: p.en,
  nameKo: p.ko,
  image: imageOverrides.get(p.id) ?? `${p.id}.png`,
}));

// ---------------------------------------------------------------------------
// ConsoleApp
// ---------------------------------------------------------------------------

export function ConsoleApp() {
  const { resolvedLocale } = useSettings();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-tap tab → scroll to top
  useEffect(() => {
    const handler = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.addEventListener("dst-tab-go-home", handler);
    return () => window.removeEventListener("dst-tab-go-home", handler);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <SupporterStrip />
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-y-contain">
      <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <Image
            src={assetPath("/images/game-items/papyrus.png")}
            alt=""
            width={28}
            height={28}
          />
          <h1 className="text-lg font-bold">
            {t(resolvedLocale, "tab_console")}
          </h1>
        </div>

        {/* Item Spawn Builder */}
        <ItemSpawnBuilder locale={resolvedLocale} />

        {/* Command Categories */}
        {commandCategories.map((cat) => (
          <CommandSection
            key={cat.id}
            categoryId={cat.id}
            locale={resolvedLocale}
          />
        ))}

        <Footer />
      </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item Spawn Builder
// ---------------------------------------------------------------------------

/** Game item image with fallback to Terminal icon */
function ItemImage({ image, size }: { image: string; size: number }) {
  const [error, setError] = useState(false);
  if (!image || error) {
    return (
      <span
        className="shrink-0 flex items-center justify-center rounded-md bg-muted/50"
        style={{ width: size, height: size }}
      >
        <Terminal className="size-5 text-muted-foreground" />
      </span>
    );
  }
  return (
    <img
      src={assetPath(`/images/game-items/${image}`)}
      alt=""
      width={size}
      height={size}
      className="shrink-0 object-contain"
      onError={() => setError(true)}
    />
  );
}

type SpawnMode = "give" | "spawn";

function ItemSpawnBuilder({ locale }: { locale: Locale }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<SpawnableItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<SpawnMode>("give");
  const [showCommand, setShowCommand] = useState(false);

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return spawnableItems
      .filter((item) =>
        item.id.includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.nameKo.includes(q)
      )
      .slice(0, 20)
      .map((item) => ({
        key: item.id,
        text: locale === "en" ? item.name : `${item.nameKo} (${item.name})`,
        image: `game-items/${item.image}`,
        data: item,
      }));
  }, [search, locale]);

  const handleSelect = useCallback((s: SearchSuggestion) => {
    setSelectedItem(s.data as SpawnableItem);
    setSearch("");
  }, []);

  // Direct prefab ID input — user types a raw ID and presses Enter
  const handleSubmit = useCallback((value: string) => {
    const id = value.trim();
    if (!id) return;
    const known = spawnableItems.find((item) => item.id === id);
    if (known) {
      setSelectedItem(known);
    } else {
      setSelectedItem({ id, name: id, nameKo: id, image: "" });
    }
    setSearch("");
  }, []);

  const command = useMemo(() => {
    if (!selectedItem) return null;
    if (mode === "give") {
      return `c_give("${selectedItem.id}", ${quantity})`;
    }
    if (quantity === 1) {
      return `c_spawn("${selectedItem.id}")`;
    }
    return `for i=1,${quantity} do c_spawn("${selectedItem.id}") end`;
  }, [selectedItem, quantity, mode]);

  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (!command) return;
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      window.dispatchEvent(new CustomEvent("dst-toast", { detail: t(locale, "console_copied") }));
      setTimeout(() => setCopied(false), 1500);
    });
  }, [command, locale]);

  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-violet-500/10 dark:bg-violet-500/8 border-b border-border/60">
        <Image
          src={assetPath("/images/game-items/icestaff.png")}
          alt=""
          width={24}
          height={24}
        />
        <h2 className="text-sm font-bold text-violet-600 dark:text-violet-300">
          {t(locale, "console_item_spawn")}
        </h2>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* Spawn mode toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/40 w-fit">
          <button
            onClick={() => setMode("give")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              mode === "give"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(locale, "console_spawn_mode_give")}
          </button>
          <button
            onClick={() => setMode("spawn")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              mode === "spawn"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(locale, "console_spawn_mode_spawn")}
          </button>
        </div>

        {/* Item search */}
        <SearchWithSuggestions
          value={search}
          onChange={setSearch}
          suggestions={suggestions}
          onSelect={handleSelect}
          onSubmit={handleSubmit}
          placeholder={t(locale, "console_search_items")}
        />

        {/* Selected item display */}
        {selectedItem && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 dark:bg-violet-500/8 border border-violet-400/20">
            <ItemImage image={selectedItem.image} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">
                {selectedItem.name === selectedItem.id
                  ? selectedItem.id
                  : locale === "en" ? selectedItem.name : selectedItem.nameKo}
              </div>
              {selectedItem.name !== selectedItem.id && (
                <div className="text-xs text-muted-foreground font-mono">{selectedItem.id}</div>
              )}
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm">✕</span>
            </button>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="text-xs font-medium text-muted-foreground">{t(locale, "console_quantity")}</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="size-8 rounded-lg border border-border bg-background text-sm font-bold flex items-center justify-center hover:bg-surface-hover active:scale-95 transition-all"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 999) setQuantity(v);
              }}
              className="w-14 h-8 rounded-lg border border-input bg-background text-center text-base sm:text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setQuantity((q) => Math.min(999, q + 1))}
              className="size-8 rounded-lg border border-border bg-background text-sm font-bold flex items-center justify-center hover:bg-surface-hover active:scale-95 transition-all"
            >
              +
            </button>
            <div className="flex gap-1 ml-1">
              {[5, 10, 20, 40].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuantity(n)}
                  className={cn(
                    "h-8 px-2.5 rounded-lg border text-xs font-bold transition-all active:scale-95",
                    quantity === n
                      ? "border-violet-400/50 bg-violet-500/15 text-violet-600 dark:text-violet-300"
                      : "border-border bg-background text-muted-foreground hover:bg-surface-hover"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Copy button + optional command reveal */}
        {command && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg font-medium text-sm transition-all active:scale-[0.98]",
                  copied
                    ? "bg-green-500/20 text-green-300"
                    : "bg-violet-500/15 text-violet-600 dark:text-violet-300 hover:bg-violet-500/25",
                )}
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    {t(locale, "console_copied")}
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    {t(locale, "console_copy_command")}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCommand((v) => !v)}
                className={cn(
                  "h-10 px-3 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground transition-colors",
                  showCommand && "bg-muted/30 text-foreground",
                )}
                title={t(locale, "console_show_command")}
              >
                <Code className="size-4" />
              </button>
            </div>
            {showCommand && (
              <div className="p-2.5 rounded-lg bg-muted/50 dark:bg-black/20 border border-border/40">
                <code className="text-xs font-mono break-all text-foreground/80">{command}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Command Section (per category)
// ---------------------------------------------------------------------------

function CommandSection({ categoryId, locale }: { categoryId: CommandCategoryId; locale: Locale }) {
  const category = commandCategories.find((c) => c.id === categoryId)!;
  const commands = consoleCommands[categoryId];
  const colors = categoryColors[categoryId];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="space-y-2.5">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors",
          colors.bg,
          "hover:opacity-80",
        )}
      >
        <Image
          src={assetPath(`/images/${category.icon}`)}
          alt=""
          width={24}
          height={24}
        />
        <h2 className={cn("text-sm font-bold flex-1 text-left", colors.accent)}>
          {t(locale, category.labelKey)}
        </h2>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", colors.badge)}>
          {commands.length}
        </span>
        {collapsed ? (
          <ChevronDown className={cn("size-4", colors.accent)} />
        ) : (
          <ChevronUp className={cn("size-4", colors.accent)} />
        )}
      </button>

      {/* Command cards */}
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commands.map((cmd) => (
            <CommandCard key={cmd.id} cmd={cmd} locale={locale} categoryId={categoryId} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Command Card
// ---------------------------------------------------------------------------

function CommandCard({
  cmd,
  locale,
  categoryId,
}: {
  cmd: ConsoleCommand;
  locale: Locale;
  categoryId: CommandCategoryId;
}) {
  const colors = categoryColors[categoryId];
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    if (!cmd.params) return {};
    const init: Record<string, string> = {};
    for (const p of cmd.params) init[p.key] = p.defaultValue;
    return init;
  });

  const resolvedCommand = useMemo(() => {
    let result = cmd.command;
    if (cmd.params) {
      for (const p of cmd.params) {
        result = result.replace(`{${p.key}}`, paramValues[p.key] ?? p.defaultValue);
      }
    }
    return result;
  }, [cmd, paramValues]);

  const name = locale === "ko" ? cmd.nameKo : cmd.nameEn;
  const desc = locale === "ko" ? cmd.descKo : cmd.descEn;

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resolvedCommand).then(() => {
      setCopied(true);
      window.dispatchEvent(new CustomEvent("dst-toast", { detail: t(locale, "console_copied") }));
      setTimeout(() => setCopied(false), 1500);
    });
  }, [resolvedCommand, locale]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // params 내부 input/select 클릭 시 복사 방지
        if ((e.target as HTMLElement).closest("input, select, button")) return;
        handleCopy();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopy(); }
      }}
      className={cn(
        "rounded-xl border border-border/70 bg-surface p-3 space-y-2 cursor-pointer hover:bg-surface-hover active:scale-[0.98] transition-all select-none",
        copied && "ring-1 ring-green-400/50",
      )}
    >
      {/* Icon + Name + description + copy indicator */}
      <div className="flex items-start gap-2.5">
        {cmd.icon && (
          <img
            src={assetPath(`/images/${cmd.icon}`)}
            alt=""
            width={28}
            height={28}
            className="shrink-0 object-contain mt-0.5"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{name}</div>
          {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
        </div>
        {copied ? (
          <Check className="size-4 shrink-0 text-green-500 mt-0.5" />
        ) : (
          <Copy className="size-3.5 shrink-0 text-muted-foreground/50 mt-0.5" />
        )}
      </div>

      {/* Inline params */}
      {cmd.params && (
        <div className="flex flex-wrap items-center gap-2">
          {cmd.params.map((p) =>
            p.options ? (
              <select
                key={p.key}
                value={paramValues[p.key]}
                onChange={(e) => setParamValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                className="h-7 rounded-lg border border-input bg-background px-2 text-base sm:text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {p.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {locale === "ko" ? o.labelKo : o.labelEn}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={p.key}
                type="text"
                value={paramValues[p.key]}
                onChange={(e) => setParamValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={p.label}
                className="h-7 w-16 rounded-lg border border-input bg-background px-2 text-base sm:text-xs font-mono font-medium text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
            )
          )}
        </div>
      )}

      {/* Show code toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowCode((v) => !v); }}
        className={cn(
          "flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors",
          showCode && "text-foreground",
        )}
      >
        <Code className="size-3" />
        {showCode ? resolvedCommand : t(locale, "console_show_command")}
      </button>
    </div>
  );
}
