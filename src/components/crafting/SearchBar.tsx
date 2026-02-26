"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";
import { getSuggestions } from "@/lib/crafting-data";
import type { SearchTag } from "@/hooks/use-search";
import type { Suggestion, TagType } from "@/lib/crafting-data";

const typeLabels: Record<string, Record<TagType, string>> = {
  ko: { character: "캐릭터", category: "카테고리", station: "제작소", material: "재료", item: "아이템", text: "텍스트" },
  en: { character: "Character", category: "Category", station: "Station", material: "Material", item: "Item", text: "Text" },
  ja: { character: "キャラ", category: "カテゴリ", station: "製造所", material: "素材", item: "アイテム", text: "テキスト" },
  zh_CN: { character: "角色", category: "分类", station: "制作站", material: "材料", item: "物品", text: "文本" },
  zh_TW: { character: "角色", category: "分類", station: "製作站", material: "材料", item: "物品", text: "文字" },
};

function suggestionTypeLabel(type: TagType, locale: Locale): string {
  return typeLabels[locale]?.[type] ?? typeLabels.en[type];
}

// DST-inspired muted earth-tone tag colors
const tagStyles = {
  character:
    "border-[#c9a865] bg-[#faf3de] text-[#6b4a14] dark:border-[#8b6914]/60 dark:bg-[#3a2e14]/50 dark:text-[#dab44a]",
  category:
    "border-[#a08060] bg-[#f5ece2] text-[#5a3820] dark:border-[#8b6040]/60 dark:bg-[#3c2418]/50 dark:text-[#c9965a]",
  station:
    "border-[#a8584f] bg-[#f5e6e2] text-[#6a2e22] dark:border-[#8b4a40]/60 dark:bg-[#421915]/50 dark:text-[#c07060]",
  material:
    "border-[#8a8050] bg-[#f0edde] text-[#4a4520] dark:border-[#6b6234]/60 dark:bg-[#2a2810]/50 dark:text-[#b0a860]",
  item:
    "border-[#6a8a6a] bg-[#e8f0e8] text-[#2a4a2a] dark:border-[#4a7a4a]/60 dark:bg-[#1a2e1a]/50 dark:text-[#80b080]",
  text: "border-[#b8b0a0] bg-[#f0ece4] text-[#5a5040] dark:border-[#6a6458]/60 dark:bg-[#2e2c24]/50 dark:text-[#a09880]",
} as const;

const tagHoverStyles = {
  character: "hover:bg-[#f0e4c0] dark:hover:bg-[#4a3e1a]/60",
  category: "hover:bg-[#ecdcc8] dark:hover:bg-[#4c3020]/60",
  station: "hover:bg-[#ecd4cc] dark:hover:bg-[#5a2820]/60",
  material: "hover:bg-[#e4e0c8] dark:hover:bg-[#3a3818]/60",
  item: "hover:bg-[#d8e8d8] dark:hover:bg-[#2a3e2a]/60",
  text: "hover:bg-[#e4ddd0] dark:hover:bg-[#3e3c30]/60",
} as const;

const suggestionDotStyles = {
  character: "bg-[#c9a865]",
  category: "bg-[#a08060]",
  station: "bg-[#a8584f]",
  material: "bg-[#8a8050]",
  item: "bg-[#6a8a6a]",
  text: "bg-muted-foreground",
} as const;

interface SearchBarProps {
  inputValue: string;
  tags: SearchTag[];
  onInputChange: (value: string) => void;
  onAddTag: (value: string | SearchTag) => void;
  onRemoveTag: (index: number) => void;
  onClearAll: () => void;
  className?: string;
}

export function SearchBar({
  inputValue,
  tags,
  onInputChange,
  onAddTag,
  onRemoveTag,
  onClearAll,
  className,
}: SearchBarProps) {
  const { resolvedLocale } = useSettings();
  const hasContent = tags.length > 0 || inputValue.length > 0;
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions =
    inputValue.trim().length > 0 ? getSuggestions(inputValue, resolvedLocale) : [];

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [inputValue]);

  function selectSuggestion(s: Suggestion) {
    // Pass a full SearchTag to preserve image/type from the suggestion
    onAddTag({ text: s.text, type: s.type, portrait: s.portrait, image: s.image });
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        return;
      }
    }

    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      onAddTag(inputValue);
      setShowSuggestions(false);
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onRemoveTag(tags.length - 1);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t(resolvedLocale, "searchPlaceholder")}
          value={inputValue}
          onChange={(e) => {
            onInputChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="h-8 pl-8 pr-8 bg-surface border-input text-base sm:text-sm placeholder:text-muted-foreground"
        />
        {hasContent && (
          <button
            onClick={onClearAll}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={`${s.type}-${s.text}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-2 h-8 text-sm sm:text-xs text-left transition-colors",
                  i === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                {s.image ? (
                  <img
                    src={assetPath(`/images/${s.image}`)}
                    alt=""
                    className="size-5 object-contain shrink-0"
                  />
                ) : (
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0 mx-1.5",
                      suggestionDotStyles[s.type]
                    )}
                  />
                )}
                <span className="truncate">{s.text}</span>
                <span className="ml-auto text-xs sm:text-[10px] text-muted-foreground shrink-0">
                  {suggestionTypeLabel(s.type, resolvedLocale)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-md text-xs font-medium border h-7",
                tagStyles[tag.type]
              )}
            >
              {tag.image && (
                <img
                  src={assetPath(`/images/${tag.image}`)}
                  alt=""
                  className="size-4.5 object-contain shrink-0"
                />
              )}
              {tag.text}
              <button
                onClick={() => onRemoveTag(i)}
                className={cn(
                  "rounded-full transition-colors p-0.5 -mr-0.5",
                  tagHoverStyles[tag.type]
                )}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
