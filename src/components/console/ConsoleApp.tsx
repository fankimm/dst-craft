"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Copy, Check, ChevronRight } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { gameItems } from "@/data/game-items-db";
import {
  commandCategories,
  consoleCommands,
  type ConsoleCommand,
  type CommandCategoryId,
} from "@/data/console-commands";
import { SearchWithSuggestions, type SearchSuggestion } from "../ui/SearchWithSuggestions";
import { Footer } from "../crafting/Footer";

// ---------------------------------------------------------------------------
// Searchable item pool (items + materials merged, deduplicated)
// ---------------------------------------------------------------------------

interface SpawnableItem {
  id: string;
  name: string;
  nameKo: string;
  image: string;
}

/** Prefixes that are recipe-only virtual IDs, not real spawnable prefabs */
const VIRTUAL_PREFIXES = ["transmute_", "wanderingtradershop_"];

const spawnableItems: SpawnableItem[] = gameItems
  .filter((item) => !VIRTUAL_PREFIXES.some((p) => item.id.startsWith(p)))
  .map((item) => ({
    id: item.id,
    name: item.en,
    nameKo: item.ko,
    image: `${item.id}.png`,
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
    <div ref={scrollRef} className="h-full overflow-y-auto overscroll-y-contain">
      <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Image
            src={assetPath("/images/game-items/papyrus.png")}
            alt=""
            width={24}
            height={24}
          />
          <h1 className="text-base font-semibold">
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
  );
}

// ---------------------------------------------------------------------------
// Item Spawn Builder
// ---------------------------------------------------------------------------

type SpawnMode = "give" | "spawn";

function ItemSpawnBuilder({ locale }: { locale: Locale }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<SpawnableItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<SpawnMode>("give");

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

  return (
    <section className="rounded-lg border border-border bg-surface p-3 sm:p-4 space-y-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Image
          src={assetPath("/images/game-items/icestaff.png")}
          alt=""
          width={20}
          height={20}
        />
        {t(locale, "console_item_spawn")}
      </h2>

      {/* Spawn mode toggle */}
      <div className="flex gap-1 p-0.5 rounded-md bg-muted/50 w-fit">
        <button
          onClick={() => setMode("give")}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md transition-colors",
            mode === "give"
              ? "bg-background shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t(locale, "console_spawn_mode_give")}
        </button>
        <button
          onClick={() => setMode("spawn")}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md transition-colors",
            mode === "spawn"
              ? "bg-background shadow-sm font-medium"
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
        placeholder={t(locale, "console_search_items")}
      />

      {/* Selected item display */}
      {selectedItem && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border/50">
          <Image
            src={assetPath(`/images/game-items/${selectedItem.image}`)}
            alt=""
            width={32}
            height={32}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">
              {locale === "en" ? selectedItem.name : selectedItem.nameKo}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">{selectedItem.id}</div>
          </div>
          <button
            onClick={() => setSelectedItem(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <span className="text-xs">✕</span>
          </button>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">{t(locale, "console_quantity")}</label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="size-7 rounded-md border border-border bg-background text-sm font-medium flex items-center justify-center hover:bg-surface-hover transition-colors"
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
            className="w-14 h-7 rounded-md border border-input bg-background text-center text-base sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(999, q + 1))}
            className="size-7 rounded-md border border-border bg-background text-sm font-medium flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            +
          </button>
          {/* Quick quantity buttons */}
          {[5, 10, 20, 40].map((n) => (
            <button
              key={n}
              onClick={() => setQuantity(n)}
              className={cn(
                "h-7 px-2 rounded-md border text-xs font-medium transition-colors",
                quantity === n
                  ? "border-ring bg-accent text-accent-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-surface-hover"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Generated command */}
      {command && <CopyableCommand command={command} locale={locale} />}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Copyable Command Display
// ---------------------------------------------------------------------------

function CopyableCommand({ command, locale, className }: { command: string; locale: Locale; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      window.dispatchEvent(new CustomEvent("dst-toast", { detail: t(locale, "console_copied") }));
      setTimeout(() => setCopied(false), 1500);
    });
  }, [command, locale]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "w-full flex items-center gap-2 p-2.5 rounded-md border border-border bg-background hover:bg-surface-hover transition-colors text-left group",
        className,
      )}
    >
      <code className="flex-1 text-xs sm:text-sm font-mono break-all text-foreground">
        {command}
      </code>
      {copied ? (
        <Check className="size-4 shrink-0 text-green-500" />
      ) : (
        <Copy className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Command Section (per category)
// ---------------------------------------------------------------------------

function CommandSection({ categoryId, locale }: { categoryId: CommandCategoryId; locale: Locale }) {
  const category = commandCategories.find((c) => c.id === categoryId)!;
  const commands = consoleCommands[categoryId];

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Image
          src={assetPath(`/images/${category.icon}`)}
          alt=""
          width={20}
          height={20}
        />
        {t(locale, category.labelKey)}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {commands.map((cmd) => (
          <CommandCard key={cmd.id} cmd={cmd} locale={locale} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Command Card
// ---------------------------------------------------------------------------

function CommandCard({ cmd, locale }: { cmd: ConsoleCommand; locale: Locale }) {
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

  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 space-y-1.5">
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="text-xs font-medium">{name}</div>
          {desc && <div className="text-[10px] text-muted-foreground">{desc}</div>}
        </div>
      </div>

      {/* Inline params */}
      {cmd.params && (
        <div className="flex flex-wrap items-center gap-1.5">
          {cmd.params.map((p) =>
            p.options ? (
              <select
                key={p.key}
                value={paramValues[p.key]}
                onChange={(e) => setParamValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                className="h-6 rounded border border-input bg-background px-1.5 text-base sm:text-xs focus:outline-none focus:ring-1 focus:ring-ring"
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
                className="h-6 w-16 rounded border border-input bg-background px-1.5 text-base sm:text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
            )
          )}
        </div>
      )}

      {/* Command + copy */}
      <CopyableCommand command={resolvedCommand} locale={locale} className="!p-1.5" />
    </div>
  );
}
