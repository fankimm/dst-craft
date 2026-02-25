"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

export function SearchBar({ value, onChange, onClear, className }: SearchBarProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t(resolvedLocale, "searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-8 pr-8 bg-surface border-input text-base sm:text-sm placeholder:text-muted-foreground"
      />
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
