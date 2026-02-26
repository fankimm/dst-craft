"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

interface SearchBarProps {
  inputValue: string;
  tags: string[];
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

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t(resolvedLocale, "searchPlaceholder")}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim()) {
              e.preventDefault();
              onAddTag(inputValue);
            }
            if (e.key === "Backspace" && !inputValue && tags.length > 0) {
              onRemoveTag(tags.length - 1);
            }
          }}
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
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(i)}
                className="rounded-full hover:bg-primary/20 transition-colors p-0.5 -mr-0.5"
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
