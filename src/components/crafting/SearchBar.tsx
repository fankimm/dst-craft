"use client";

import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getSuggestions } from "@/lib/crafting-data";
import type { SearchTag } from "@/hooks/use-search";
import type { TagType } from "@/lib/crafting-data";
import { SearchWithSuggestions, type SearchSuggestion } from "@/components/ui/SearchWithSuggestions";
import { TagChip } from "@/components/ui/TagChip";

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

const suggestionDotStyles: Record<TagType, string> = {
  character: "bg-[#c9a865]",
  category: "bg-[#a08060]",
  station: "bg-[#a8584f]",
  material: "bg-[#8a8050]",
  item: "bg-[#6a8a6a]",
  text: "bg-muted-foreground",
};

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

  // Map crafting suggestions → SearchSuggestion
  const suggestions: SearchSuggestion[] =
    inputValue.trim().length > 0
      ? getSuggestions(inputValue, resolvedLocale).map((s) => ({
          key: `${s.type}-${s.text}`,
          text: s.text,
          image: s.image,
          typeLabel: suggestionTypeLabel(s.type, resolvedLocale),
          dotClass: !s.image ? suggestionDotStyles[s.type] : undefined,
          data: s, // preserve original suggestion for tag creation
        }))
      : [];

  const handleSelect = (s: SearchSuggestion) => {
    const original = s.data as { text: string; type: TagType; portrait?: string; image?: string };
    onAddTag({ text: original.text, type: original.type, portrait: original.portrait, image: original.image });
  };

  const handleSubmit = (value: string) => {
    if (value.trim() === "d_stats") {
      window.location.href = `${window.location.pathname.replace(/\/$/, "")}/stats`;
      return;
    }
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
        placeholder={t(resolvedLocale, "searchPlaceholder")}
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
