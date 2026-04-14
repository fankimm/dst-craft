"use client";

import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getCookingSuggestions } from "@/hooks/use-cooking-search";
import type { CookingSearchTag, CookingTagType } from "@/hooks/use-cooking-search";
import { SearchWithSuggestions, type SearchSuggestion } from "@/components/ui/SearchWithSuggestions";
import { TagChip } from "@/components/ui/TagChip";

const typeLabels: Record<string, Record<CookingTagType, string>> = {
  ko: { ingredient: "재료", station: "요리솥", foodType: "음식유형", effect: "효과", text: "텍스트" },
  en: { ingredient: "Ingredient", station: "Station", foodType: "Food Type", effect: "Effect", text: "Text" },
  ja: { ingredient: "素材", station: "調理鍋", foodType: "食品タイプ", effect: "効果", text: "テキスト" },
  zh_CN: { ingredient: "材料", station: "烹饪锅", foodType: "食物类型", effect: "效果", text: "文本" },
  zh_TW: { ingredient: "材料", station: "烹飪鍋", foodType: "食物類型", effect: "效果", text: "文字" },
};

const tagStyles: Record<CookingTagType, string> = {
  ingredient:
    "border-[#8a8050] bg-[#f0edde] text-[#4a4520] dark:border-[#6b6234]/60 dark:bg-[#2a2810]/50 dark:text-[#b0a860]",
  station:
    "border-[#a8584f] bg-[#f5e6e2] text-[#6a2e22] dark:border-[#8b4a40]/60 dark:bg-[#421915]/50 dark:text-[#c07060]",
  foodType:
    "border-[#a08060] bg-[#f5ece2] text-[#5a3820] dark:border-[#8b6040]/60 dark:bg-[#3c2418]/50 dark:text-[#c9965a]",
  effect:
    "border-[#6a8a6a] bg-[#e8f0e8] text-[#2a4a2a] dark:border-[#4a7a4a]/60 dark:bg-[#1a2e1a]/50 dark:text-[#80b080]",
  text:
    "border-[#b8b0a0] bg-[#f0ece4] text-[#5a5040] dark:border-[#6a6458]/60 dark:bg-[#2e2c24]/50 dark:text-[#a09880]",
};

const suggestionDotStyles: Record<CookingTagType, string> = {
  ingredient: "bg-[#8a8050]",
  station: "bg-[#a8584f]",
  foodType: "bg-[#a08060]",
  effect: "bg-[#6a8a6a]",
  text: "bg-muted-foreground",
};

interface CookingSearchBarProps {
  inputValue: string;
  tags: CookingSearchTag[];
  onInputChange: (value: string) => void;
  onAddTag: (value: string | CookingSearchTag) => void;
  onRemoveTag: (index: number) => void;
  onClearAll: () => void;
  locale: Locale;
  className?: string;
}

export function CookingSearchBar({
  inputValue,
  tags,
  onInputChange,
  onAddTag,
  onRemoveTag,
  onClearAll,
  locale,
  className,
}: CookingSearchBarProps) {
  const hasContent = tags.length > 0 || inputValue.length > 0;

  const suggestions: SearchSuggestion[] =
    inputValue.trim().length > 0
      ? getCookingSuggestions(inputValue, locale).map((s) => ({
          key: `${s.type}-${s.engName}`,
          text: s.text,
          image: s.image,
          typeLabel: (typeLabels[locale] ?? typeLabels.en)[s.type],
          dotClass: !s.image ? suggestionDotStyles[s.type] : undefined,
          data: s,
        }))
      : [];

  const handleSelect = (s: SearchSuggestion) => {
    const original = s.data as CookingSearchTag & { engName: string };
    onAddTag({
      text: original.text,
      type: original.type,
      image: original.image,
      engName: original.engName,
    });
  };

  const handleSubmit = (value: string) => {
    onAddTag(value);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <SearchWithSuggestions
        value={inputValue}
        onChange={onInputChange}
        suggestions={suggestions}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
        onBackspace={tags.length > 0 ? () => onRemoveTag(tags.length - 1) : undefined}
        onClear={onClearAll}
        showClear={hasContent}
        placeholder={t(locale, "searchPlaceholder")}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <TagChip
              key={i}
              label={tag.text}
              icon={tag.image}
              onRemove={() => onRemoveTag(i)}
              className={tagStyles[tag.type]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
