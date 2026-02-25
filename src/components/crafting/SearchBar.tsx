"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

export function SearchBar({ value, onChange, onClear, className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
      <Input
        type="text"
        placeholder="아이템 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-8 pr-8 bg-zinc-900 border-zinc-700 text-sm placeholder:text-zinc-500"
      />
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
