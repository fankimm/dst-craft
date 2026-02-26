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
  ko: { character: "캐릭터", category: "카테고리", station: "제작소", material: "재료", text: "텍스트" },
  en: { character: "Character", category: "Category", station: "Station", material: "Material", text: "Text" },
  ja: { character: "キャラ", category: "カテゴリ", station: "製造所", material: "素材", text: "テキスト" },
  zh_CN: { character: "角色", category: "分类", station: "制作站", material: "材料", text: "文本" },
  zh_TW: { character: "角色", category: "分類", station: "製作站", material: "材料", text: "文字" },
};

function suggestionTypeLabel(type: TagType, locale: Locale): string {
  return typeLabels[locale]?.[type] ?? typeLabels.en[type];
}

const tagStyles = {
  character:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300",
  category:
    "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-300",
  station:
    "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700/60 dark:bg-violet-950/40 dark:text-violet-300",
  material:
    "border-green-300 bg-green-50 text-green-800 dark:border-green-700/60 dark:bg-green-950/40 dark:text-green-300",
  text: "bg-primary/10 text-primary border-primary/20",
} as const;

const tagHoverStyles = {
  character: "hover:bg-amber-200 dark:hover:bg-amber-800/50",
  category: "hover:bg-blue-200 dark:hover:bg-blue-800/50",
  station: "hover:bg-violet-200 dark:hover:bg-violet-800/50",
  material: "hover:bg-green-200 dark:hover:bg-green-800/50",
  text: "hover:bg-primary/20",
} as const;

const suggestionDotStyles = {
  character: "bg-amber-500",
  category: "bg-blue-500",
  station: "bg-violet-500",
  material: "bg-green-500",
  text: "bg-muted-foreground",
} as const;

interface SearchBarProps {
  inputValue: string;
  tags: SearchTag[];
  onInputChange: (value: string) => void;
  onAddTag: (value: string) => void;
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
    onAddTag(s.text);
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
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
                tagStyles[tag.type]
              )}
            >
              {tag.type === "character" && tag.portrait && (
                <img
                  src={assetPath(
                    `/images/category-icons/characters/${tag.portrait}.png`
                  )}
                  alt=""
                  className="size-4 object-contain"
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
